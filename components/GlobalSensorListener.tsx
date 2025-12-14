import React, { useEffect, useState } from 'react';
import { Accelerometer } from 'expo-sensors';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '../store/useAppStore';

// Threshold for shake detection (g-force)
// 1.5 - 2.0 is usually a good range for a firm shake
const SHAKE_THRESHOLD = 2.5;
// Time between shakes to avoid duplicate triggers
const SHAKE_TIMEOUT = 1000;

export const GlobalSensorListener: React.FC = () => {
  const router = useRouter();
  const { mode, setMode } = useAppStore();
  const [lastShakeTime, setLastShakeTime] = useState(0);

  useEffect(() => {
    // Set update interval (approx 100ms)
    Accelerometer.setUpdateInterval(100);

    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      // Calculate total acceleration (g-force)
      // Subtract gravity (approx 1.0) if needed, but for shake simple magnitude often works if threshold is high enough.
      // Standard shake: sqrt(x^2 + y^2 + z^2) > Threshold
      const totalForce = Math.sqrt(x * x + y * y + z * z);

      if (totalForce > SHAKE_THRESHOLD) {
        const now = Date.now();
        if (now - lastShakeTime > SHAKE_TIMEOUT) {
          setLastShakeTime(now);
          handleShake();
        }
      }
    });

    return () => {
      subscription && subscription.remove();
    };
  }, [lastShakeTime, mode]);

  const handleShake = () => {
    if (mode === 'PEACE') {
      console.log('Shake detected! Switching to PANIC mode.');
      
      // Haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      // Update store
      setMode('PANIC');
      
      // Navigate to panic screen
      // We use replace to prevent going back easily without resolving
      router.replace('/(panic)');
    }
  };

  return null; // This component doesn't render anything visible
};

