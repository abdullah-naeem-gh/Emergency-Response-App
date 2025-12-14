import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export interface Report {
  id: string;
  timestamp: number;
  type: string;
  details: string;
  status?: 'pending' | 'sent' | 'failed';
  location?: {
    latitude: number;
    longitude: number;
  };
}

const REPORTS_STORAGE_KEY = '@muhafiz_pending_reports';
const MAX_RETRY_ATTEMPTS = 3;

class ReportService {
  /**
   * Check if device is online
   */
  async isOnline(): Promise<boolean> {
    const state = await NetInfo.fetch();
    return state.isConnected ?? false;
  }

  /**
   * Mock API call to send report
   */
  private async mockApiCall(report: Report): Promise<boolean> {
    // Simulate API call with random success/failure for testing
    return new Promise((resolve) => {
      setTimeout(() => {
        // 90% success rate for demo
        const success = Math.random() > 0.1;
        console.log(`API call ${success ? 'succeeded' : 'failed'} for report:`, report.id);
        resolve(success);
      }, 1000);
    });
  }

  /**
   * Save report to AsyncStorage for offline queue
   */
  private async saveToQueue(report: Report): Promise<void> {
    try {
      const existingReports = await this.getPendingReports();
      const updatedReports = [...existingReports, { ...report, status: 'pending' as const }];
      await AsyncStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(updatedReports));
      console.log('Report saved to offline queue:', report.id);
    } catch (error) {
      console.error('Error saving report to queue:', error);
      throw error;
    }
  }

  /**
   * Get all pending reports from AsyncStorage
   */
  async getPendingReports(): Promise<Report[]> {
    try {
      const data = await AsyncStorage.getItem(REPORTS_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
      return [];
    } catch (error) {
      console.error('Error reading pending reports:', error);
      return [];
    }
  }

  /**
   * Process pending reports when coming back online
   */
  async processPendingReports(): Promise<{ sent: number; failed: number }> {
    const pendingReports = await this.getPendingReports();
    if (pendingReports.length === 0) {
      return { sent: 0, failed: 0 };
    }

    const isOnline = await this.isOnline();
    if (!isOnline) {
      console.log('Still offline, cannot process pending reports');
      return { sent: 0, failed: 0 };
    }

    let sent = 0;
    let failed = 0;
    const remainingReports: Report[] = [];

    for (const report of pendingReports) {
      try {
        const success = await this.mockApiCall(report);
        if (success) {
          sent++;
          console.log('Pending report sent successfully:', report.id);
        } else {
          failed++;
          remainingReports.push({ ...report, status: 'failed' as const });
        }
      } catch (error) {
        console.error('Error processing pending report:', error);
        failed++;
        remainingReports.push({ ...report, status: 'failed' as const });
      }
    }

    // Update storage with remaining failed reports
    if (remainingReports.length > 0) {
      await AsyncStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(remainingReports));
    } else {
      await AsyncStorage.removeItem(REPORTS_STORAGE_KEY);
    }

    return { sent, failed };
  }

  /**
   * Send report (online) or queue it (offline)
   */
  async sendReport(report: Report): Promise<{ success: boolean; queued: boolean }> {
    const isOnline = await this.isOnline();

    if (isOnline) {
      try {
        const success = await this.mockApiCall(report);
        if (success) {
          return { success: true, queued: false };
        } else {
          // API call failed, queue it
          await this.saveToQueue(report);
          return { success: false, queued: true };
        }
      } catch (error) {
        console.error('Error sending report:', error);
        // On error, queue it
        await this.saveToQueue(report);
        return { success: false, queued: true };
      }
    } else {
      // Offline, queue it
      await this.saveToQueue(report);
      return { success: false, queued: true };
    }
  }

  /**
   * Clear all pending reports (for testing/debugging)
   */
  async clearQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem(REPORTS_STORAGE_KEY);
      console.log('Offline queue cleared');
    } catch (error) {
      console.error('Error clearing queue:', error);
    }
  }

  /**
   * Get queue count
   */
  async getQueueCount(): Promise<number> {
    const reports = await this.getPendingReports();
    return reports.length;
  }
}

export const reportService = new ReportService();

