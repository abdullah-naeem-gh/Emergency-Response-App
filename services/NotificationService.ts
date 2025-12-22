import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export type NotificationType = 'alert' | 'crowd_report' | 'volunteer_task' | 'system';

export interface NotificationData {
  type: NotificationType;
  title: string;
  body: string;
  data?: any;
  priority?: 'min' | 'low' | 'default' | 'high' | 'max';
  sound?: boolean;
  badge?: number;
}

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationService {
  private expoPushToken: string | null = null;
  private notificationListener: Notifications.EventSubscription | null = null;
  private responseListener: Notifications.EventSubscription | null = null;

  /**
   * Initialize notification service
   */
  async initialize(): Promise<string | null> {
    try {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Notification permissions not granted');
        return null;
      }

      // Get push token (only if projectId is available)
      try {
        const tokenOptions: { projectId?: string } = {};
        if (process.env.EXPO_PUBLIC_PROJECT_ID) {
          tokenOptions.projectId = process.env.EXPO_PUBLIC_PROJECT_ID;
        }

        const tokenData = await Notifications.getExpoPushTokenAsync(tokenOptions);
        this.expoPushToken = tokenData.data;
        console.log('Expo Push Token:', this.expoPushToken);
      } catch (tokenError) {
        console.warn('Could not get push token (projectId may be missing):', tokenError);
        // Continue without push token - local notifications will still work
      }

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('emergency-alerts', {
          name: 'Emergency Alerts',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
        });

        await Notifications.setNotificationChannelAsync('updates', {
          name: 'Updates',
          importance: Notifications.AndroidImportance.HIGH,
          sound: 'default',
        });
      }

      return this.expoPushToken;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return null;
    }
  }

  /**
   * Schedule a local notification
   */
  async scheduleLocalNotification(notification: NotificationData): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: notification.sound !== false,
          priority: notification.priority || 'high',
          badge: notification.badge,
        },
        trigger: null, // Show immediately
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }

  /**
   * Send emergency alert notification
   */
  async sendEmergencyAlert(title: string, body: string, data?: any): Promise<string> {
    return this.scheduleLocalNotification({
      type: 'alert',
      title,
      body,
      data,
      priority: 'max',
      sound: true,
    });
  }

  /**
   * Send crowd report notification
   */
  async sendCrowdReportNotification(
    title: string,
    body: string,
    data?: any
  ): Promise<string> {
    return this.scheduleLocalNotification({
      type: 'crowd_report',
      title,
      body,
      data,
      priority: 'high',
      sound: true,
    });
  }

  /**
   * Send volunteer task notification
   */
  async sendVolunteerTaskNotification(
    title: string,
    body: string,
    data?: any
  ): Promise<string> {
    return this.scheduleLocalNotification({
      type: 'volunteer_task',
      title,
      body,
      data,
      priority: 'high',
      sound: true,
    });
  }


  /**
   * Cancel a notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  /**
   * Cancel all notifications
   */
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Set up notification listeners
   */
  setupListeners(
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationTapped?: (response: Notifications.NotificationResponse) => void
  ): void {
    // Remove existing listeners
    this.removeListeners();

    // Notification received while app is in foreground
    if (onNotificationReceived) {
      this.notificationListener = Notifications.addNotificationReceivedListener(
        onNotificationReceived
      );
    }

    // Notification tapped/opened
    if (onNotificationTapped) {
      this.responseListener = Notifications.addNotificationResponseReceivedListener(
        onNotificationTapped
      );
    }
  }

  /**
   * Remove notification listeners
   */
  removeListeners(): void {
    if (this.notificationListener) {
      this.notificationListener.remove();
      this.notificationListener = null;
    }

    if (this.responseListener) {
      this.responseListener.remove();
      this.responseListener = null;
    }
  }

  /**
   * Get badge count
   */
  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }

  /**
   * Set badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  /**
   * Get push token
   */
  getPushToken(): string | null {
    return this.expoPushToken;
  }

  /**
   * Check if notifications are enabled
   */
  async areNotificationsEnabled(): Promise<boolean> {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  }
}

export const notificationService = new NotificationService();

