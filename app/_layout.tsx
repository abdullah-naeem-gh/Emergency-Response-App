import '../global.css';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useState, useEffect } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { GlobalSensorListener } from '@/components/GlobalSensorListener';
import { PredictiveModal } from '@/components/PredictiveModal';
import { OfflineBanner } from '@/components/OfflineBanner';
import { useAppStore } from '@/store/useAppStore';
import { reportService } from '@/services/ReportService';
import NetInfo from '@react-native-community/netinfo';

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

  // Process pending reports when coming back online
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async state => {
      if (state.isConnected) {
        // Just came back online, process pending reports
        const result = await reportService.processPendingReports();
        if (result.sent > 0 || result.failed > 0) {
          console.log(`Processed ${result.sent} sent, ${result.failed} failed reports`);
        }
      }
    });

    // Check initial state and process if online
    NetInfo.fetch().then(async state => {
      if (state.isConnected) {
        const result = await reportService.processPendingReports();
        if (result.sent > 0 || result.failed > 0) {
          console.log(`Processed ${result.sent} sent, ${result.failed} failed reports`);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleClosePredictiveModal = () => {
    setShowPredictiveModal(false);
  };

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <GlobalSensorListener />
      <OfflineBanner />
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
