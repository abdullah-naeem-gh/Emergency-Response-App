import React, { useState } from 'react';
import { View, Text, Modal, Pressable, Alert, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { AlertTriangle, CheckCircle } from 'lucide-react-native';
import { useAppStore } from '@/store/useAppStore';
import { MockLocationService } from '@/services/MockLocationService';

interface PredictiveModalProps {
  visible: boolean;
  onClose: () => void;
}

export const PredictiveModal: React.FC<PredictiveModalProps> = ({ visible, onClose }) => {
  const { addToQueue, setMode, setRedZone } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleYes = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setIsLoading(true);

      // Request location permissions
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
      const report = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        type: 'flood',
        details: `High confidence flood report at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      };

      // Add to queue
      addToQueue(report);

      // Show success
      setIsLoading(false);
      setShowSuccess(true);

      // Auto-close after 2 seconds and reset
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
        setMode('PEACE');
        setRedZone(false);
        MockLocationService.simulateExitRedZone();
      }, 2000);

    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your location. Please try again.');
      setIsLoading(false);
    }
  };

  const handleNo = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
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
              Your location has been shared with emergency services.
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
            High Confidence Alert
          </Text>
          <Text className="text-neutral-600 text-center mb-6 text-base leading-6">
            25 people reported Flood here. Confirm?
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

