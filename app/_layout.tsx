import '../global.css';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useState, useEffect } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { GlobalSensorListener } from '@/components/GlobalSensorListener';
import { PredictiveModal } from '@/components/PredictiveModal';
import { useAppStore } from '@/store/useAppStore';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(peace)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { mode, isRedZone } = useAppStore();
  const [showPredictiveModal, setShowPredictiveModal] = useState(false);

  // Show predictive modal when in PREDICTIVE mode and Red Zone is detected
  useEffect(() => {
    if (mode === 'PREDICTIVE' && isRedZone) {
      setShowPredictiveModal(true);
    } else {
      setShowPredictiveModal(false);
    }
  }, [mode, isRedZone]);

  const handleClosePredictiveModal = () => {
    setShowPredictiveModal(false);
  };

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <GlobalSensorListener />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(peace)" />
        <Stack.Screen name="(panic)" options={{ gestureEnabled: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: true }} />
        <Stack.Screen name="(tabs)" options={{ href: null }} />
      </Stack>
      <PredictiveModal 
        visible={showPredictiveModal} 
        onClose={handleClosePredictiveModal}
      />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
