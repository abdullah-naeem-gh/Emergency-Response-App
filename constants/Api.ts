import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getLocalHost = () => {
  // If running on a physical device via Expo Go, try to get the computer's IP automatically
  const debuggerHost = Constants.expoConfig?.hostUri;
  const localhost = debuggerHost?.split(':')[0];

  if (localhost) {
    return localhost;
  }

  // Fallback for emulators
  if (Platform.OS === 'android') {
    return '10.0.2.2';
  }
  return 'localhost';
};

export const API_URL = `http://${getLocalHost()}:3000/api`;

