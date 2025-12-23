import { MockLocationService } from '@/services/MockLocationService';
import { PredictiveService } from '@/services/PredictiveService';
import { reportService, Report } from '@/services/ReportService';
import { useAccessibility } from '@/hooks/useAccessibility';
import { useAppStore } from '@/store/useAppStore';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { AlertTriangle, CheckCircle } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, Text, View } from 'react-native';

interface PredictiveModalProps {
  visible: boolean;
  onClose: () => void;
  threatType?: string;
  threatCount?: number;
  threatLocation?: { latitude: number; longitude: number };
}

export const PredictiveModal: React.FC<PredictiveModalProps> = ({ 
  visible, 
  onClose,
  threatType = 'Flood',
  threatCount = 5,
  threatLocation
}) => {
  const { addToQueue, setMode, setRedZone } = useAppStore();
  const { speak } = useAccessibility();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasSpokenRef = useRef(false);

  // Cleanup timeout on unmount or when modal closes
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  // Clear timeout when modal visibility changes
  useEffect(() => {
    if (!visible) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      // Reset state when modal closes
      setShowSuccess(false);
      setIsLoading(false);
      hasSpokenRef.current = false;
    }
  }, [visible]);

  // Speak the predictive alert when it appears (if user enabled TTS)
  useEffect(() => {
    if (!visible || hasSpokenRef.current) return;

    hasSpokenRef.current = true;
    const message = `${threatCount} people nearby reported ${threatType}. Are you experiencing this?`;
    speak(message).catch(() => {
      // Fail silently – never crash UI due to TTS
    });
  }, [visible, threatType, threatCount, speak]);

  const handleYes = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setIsLoading(true);

      // Request location permissions if we don't have location passed or need fresh one
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Location permission is needed to report your location.',
          [{ text: 'OK' }]
        );
        setIsLoading(false);
        return;
      }

      // Get current GPS location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;

      // Create report with GPS coordinates
      const report: Report = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        type: threatType.toLowerCase(),
        details: `Confirmed predictive alert: ${threatType} at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        location: {
          latitude,
          longitude,
        },
      };

      // Send to Predictive Service (Backend)
      await PredictiveService.submitReport(
        report.type,
        report.details,
        latitude,
        longitude,
        true // confirmed
      );

      // Mark as responded so we don't see it again soon
      await PredictiveService.markThreatResponded(threatType);

      // Send report (will queue if offline)
      await reportService.sendReport(report);
      
      // Update store for UI tracking
      addToQueue(report);

      // Show success
      setIsLoading(false);
      setShowSuccess(true);

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Auto-close after 2 seconds and reset
      timeoutRef.current = setTimeout(() => {
        setShowSuccess(false);
        onClose();
        // Don't switch to PEACE immediately if in real danger, but for flow:
        // Maybe stay in Predictive but hide modal? 
        // For now, let's keep existing behavior
        setMode('PEACE'); 
        setRedZone(false);
        MockLocationService.simulateExitRedZone();
        timeoutRef.current = null;
      }, 2000);

    } catch (error) {
      console.error('Error confirming alert:', error);
      Alert.alert('Error', 'Failed to send confirmation. Please try again.');
      setIsLoading(false);
    }
  };

  const handleNo = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Mark as responded even if NO, to prevent spam
    await PredictiveService.markThreatResponded(threatType);

    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    onClose();
    // Logic: If user says NO, maybe they are safe?
    setMode('PEACE');
    setRedZone(false);
    MockLocationService.simulateExitRedZone();
  };

  if (showSuccess) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-6">
          <View className="bg-white rounded-3xl p-8 items-center max-w-sm w-full">
            <View className="bg-green-100 rounded-full w-20 h-20 justify-center items-center mb-4">
              <CheckCircle size={48} color="#22c55e" strokeWidth={2.5} />
            </View>
            <Text className="text-2xl font-bold text-neutral-900 mb-2 text-center">
              Report Sent!
            </Text>
            <Text className="text-neutral-600 text-center">
              Your confirmation has been shared.
            </Text>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleNo}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 pb-8">
          {/* Alert Icon */}
          <View className="items-center mb-4">
            <View className="bg-orange-100 rounded-full w-16 h-16 justify-center items-center">
              <AlertTriangle size={32} color="#f59e0b" strokeWidth={2.5} />
            </View>
          </View>

          {/* Content */}
          <Text className="text-2xl font-bold text-neutral-900 mb-2 text-center">
            Predictive Alert
          </Text>
          <Text className="text-neutral-600 text-center mb-6 text-base leading-6">
            {threatCount} people nearby reported <Text className="font-bold">{threatType}</Text>. Are you experiencing this?
          </Text>

          {/* Action Buttons */}
          <View className="flex-row gap-3">
            {/* YES Button - 70% width */}
            <Pressable
              onPress={handleYes}
              disabled={isLoading}
              className="bg-green-500 rounded-xl flex-1 items-center justify-center active:opacity-80"
              style={{ 
                minHeight: 60,
                flex: 0.7,
              }}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-lg">YES</Text>
              )}
            </Pressable>

            {/* NO Button - 30% width */}
            <Pressable
              onPress={handleNo}
              disabled={isLoading}
              className="bg-neutral-300 rounded-xl items-center justify-center active:opacity-80"
              style={{ 
                minHeight: 60,
                flex: 0.3,
              }}
            >
              <Text className="text-neutral-900 font-bold text-lg">NO</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};
