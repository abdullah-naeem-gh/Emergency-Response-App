import '../global.css';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { GlobalSensorListener } from '@/components/GlobalSensorListener';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(peace)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <GlobalSensorListener />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(peace)" />
        <Stack.Screen name="(panic)" options={{ gestureEnabled: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: true }} />
        <Stack.Screen name="(tabs)" options={{ href: null }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
