import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { I18nManager } from 'react-native';
import 'react-native-reanimated';
import '../global.css';

import { AccessibilityProvider } from '@/components/AccessibilityProvider';
import { GlobalSensorListener } from '@/components/GlobalSensorListener';
import { OfflineBanner } from '@/components/OfflineBanner';
import { PredictiveModal } from '@/components/PredictiveModal';
import VoiceNavigationProvider from '@/components/VoiceNavigationProvider';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { notificationService } from '@/services/NotificationService';
import { PredictiveCheckResponse, PredictiveService } from '@/services/PredictiveService';
import { reportService } from '@/services/ReportService';
import { useAppStore } from '@/store/useAppStore';
import NetInfo from '@react-native-community/netinfo';
import * as Location from 'expo-location';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { mode, isRedZone, language } = useAppStore();
  const [showPredictiveModal, setShowPredictiveModal] = useState(false);
  const [threatData, setThreatData] = useState<PredictiveCheckResponse | null>(null);

  // Predictive Mode Polling Logic (Every 100 seconds)
  useEffect(() => {
    let intervalId: any;

    const startPolling = async () => {
      // Only poll if we have permissions
      const { status } = await Location.getForegroundPermissionsAsync();
      console.log('[App] Polling started. Permission status:', status);
      if (status !== 'granted') return;

      intervalId = setInterval(async () => {
        try {
          console.log('[App] Polling backend...');
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });

          if (location) {
            const { latitude, longitude } = location.coords;
            console.log(`[App] Current location: ${latitude}, ${longitude}`);

            // 1. Update user location in backend
            await PredictiveService.updateLocation(latitude, longitude);

            // 2. Check for nearby threats
            const result = await PredictiveService.checkNearbyThreats(latitude, longitude);

            if (result.hasThreat) {
              // Check if we already responded to this threat type
              const shouldIgnore = await PredictiveService.shouldIgnoreThreat(result.type || 'unknown');
              
              if (shouldIgnore) {
                console.log(`[App] Ignoring threat ${result.type} - already responded recently.`);
              } else {
                console.log('[App] THREAT DETECTED!', result);
                setThreatData(result);
                setShowPredictiveModal(true);
              }
            } else {
              console.log('[App] No threats detected.');
            }
          }
        } catch (error) {
          console.log('[App] Polling error:', error);
        }
      }, 100000); // 100 seconds
    };

    startPolling();

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  // Update RTL layout when language changes
  useEffect(() => {
    const isRTL = language === 'ur';
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.forceRTL(isRTL);
      // Note: On Android, you may need to restart the app for RTL to take effect
      // On iOS, it should work immediately
    }
  }, [language]);

  // Show predictive modal logic
  useEffect(() => {
    // 1. Mock/Local Logic
    if (mode === 'PREDICTIVE' && isRedZone) {
      setShowPredictiveModal(true);
      return;
    } 
    
    // 2. Real Backend Logic is handled by the polling effect setting threatData
    // We only want to auto-hide if we are NOT in a threat state
    if (!isRedZone && !threatData && showPredictiveModal) {
       setShowPredictiveModal(false);
    }
  }, [mode, isRedZone, threatData, showPredictiveModal]);

  // Initialize notification service
  useEffect(() => {
    notificationService.initialize().then((token) => {
      if (token) {
        console.log('Notification service initialized');
      }
    });

    // Set up notification listeners
    notificationService.setupListeners(
      (notification) => {
        console.log('Notification received:', notification);
      },
      (response) => {
        console.log('Notification tapped:', response);
        // Handle navigation based on notification data
        const data = response.notification.request.content.data;
        if (data?.type === 'alert' && data?.alertId) {
          // Navigate to alert detail
        }
      }
    );

    return () => {
      notificationService.removeListeners();
    };
  }, []);

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
    <AccessibilityProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <VoiceNavigationProvider>
          <GlobalSensorListener />
          <OfflineBanner />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(panic)" options={{ gestureEnabled: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: true }} />
          </Stack>
          <PredictiveModal 
            visible={showPredictiveModal} 
            onClose={handleClosePredictiveModal}
            threatType={threatData?.type}
            threatCount={threatData?.count}
            threatLocation={threatData?.location}
          />
          <StatusBar style={mode === 'PANIC' ? 'light' : 'dark'} />
        </VoiceNavigationProvider>
      </ThemeProvider>
    </AccessibilityProvider>
  );
}
