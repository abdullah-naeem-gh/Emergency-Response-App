import { API_URL } from '@/constants/Api';
import { UserService } from './UserService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PredictiveCheckResponse {
  hasThreat: boolean;
  type?: string;
  count?: number;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export const PredictiveService = {
  // Check if we should ignore a threat type because we recently responded
  async shouldIgnoreThreat(threatType: string): Promise<boolean> {
    try {
      const key = `predictive_response_${threatType}`;
      const lastResponseStr = await AsyncStorage.getItem(key);
      
      if (!lastResponseStr) return false;
      
      const lastResponse = parseInt(lastResponseStr, 10);
      const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours
      
      // If cooldown hasn't passed, ignore threat
      if (Date.now() - lastResponse < COOLDOWN_MS) {
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking ignore threat:', error);
      return false;
    }
  },

  // Mark a threat type as responded
  async markThreatResponded(threatType: string): Promise<void> {
    try {
      const key = `predictive_response_${threatType}`;
      await AsyncStorage.setItem(key, Date.now().toString());
    } catch (error) {
      console.error('Error marking threat responded:', error);
    }
  },

  // Update user location on backend
  async updateLocation(latitude: number, longitude: number): Promise<void> {
    try {
      const userId = await UserService.getUserId();
      
      await fetch(`${API_URL}/user/location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          latitude,
          longitude,
        }),
      });
    } catch (error) {
      console.error('Error updating location backend:', error);
    }
  },

  // Check for nearby threats
  async checkNearbyThreats(latitude: number, longitude: number): Promise<PredictiveCheckResponse> {
    try {
      const userId = await UserService.getUserId();
      console.log(`[PredictiveService] Checking threats at ${latitude}, ${longitude} for user ${userId}`);

      const response = await fetch(`${API_URL}/predictive/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          latitude,
          longitude,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('[PredictiveService] Response:', data);
      return data;
    } catch (error) {
      // Fail silently for polling
      console.log('Error checking threats:', error);
      return { hasThreat: false };
    }
  },

  // Submit a report (regular or confirmation)
  async submitReport(type: string, description: string, latitude: number, longitude: number, confirmed: boolean = false): Promise<void> {
    try {
      const userId = await UserService.getUserId();

      await fetch(`${API_URL}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          type,
          description,
          latitude,
          longitude,
          confirmed
        }),
      });
    } catch (error) {
      console.error('Error submitting report to backend:', error);
      // We might want to throw here so the UI knows to fallback or queue
    }
  }
};

