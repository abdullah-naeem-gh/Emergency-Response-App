import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_ID_KEY = 'emergency_app_user_id';

export const UserService = {
  async getUserId(): Promise<string> {
    try {
      let userId = await AsyncStorage.getItem(USER_ID_KEY);
      
      if (!userId) {
        // Generate new ID if none exists
        // Using timestamp + random string for sufficient uniqueness without external libs
        userId = 'user_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
        await AsyncStorage.setItem(USER_ID_KEY, userId);
      }
      
      return userId;
    } catch (error) {
      console.error('Error getting user ID:', error);
      return 'anonymous-user';
    }
  },

  async resetUser(): Promise<void> {
    await AsyncStorage.removeItem(USER_ID_KEY);
  }
};
