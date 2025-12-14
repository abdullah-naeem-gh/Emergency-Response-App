import React, { useState } from 'react';
import { View, Text, Pressable, Modal, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Wifi, WifiOff, Shield, AlertTriangle, Heart, Cloud, X, AlertCircle } from 'lucide-react-native';
import { useAppStore } from '@/store/useAppStore';
import { MockLocationService } from '@/services/MockLocationService';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with padding

interface IncidentCategory {
  id: string;
  label: string;
  color: string;
}

const INCIDENT_CATEGORIES: IncidentCategory[] = [
  { id: 'flood', label: 'Flood', color: '#3b82f6' },
  { id: 'medical', label: 'Medical', color: '#ef4444' },
  { id: 'fire', label: 'Fire', color: '#f59e0b' },
];

export default function PeaceDashboard() {
  const router = useRouter();
  const { isRedZone, connectivity, setMode, setConnectivity } = useAppStore();
  const [showIncidentModal, setShowIncidentModal] = useState(false);

  const handleReportIncident = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowIncidentModal(true);
  };

  const handleIncidentCategory = async (category: IncidentCategory) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    console.log('Reported incident:', category.label);
    
    // Add to report queue
    const report = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      type: category.id,
      details: `${category.label} incident reported`,
    };
    useAppStore.getState().addToQueue(report);
    
    setShowIncidentModal(false);
    // Could show a success message here
  };

  const handleVolunteer = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    console.log('Volunteer mode activated');
    // Navigate to volunteer screen or show volunteer options
  };

  const handleWeatherAlerts = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    console.log('Weather/Alerts opened');
    // Show weather and alert information
  };


  const toggleConnectivity = () => {
    setConnectivity(!connectivity);
  };

  const handleSOS = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setMode('PANIC');
    router.replace('/(panic)');
  };

  return (
    <View className="flex-1 bg-neutral-50">
      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-5 border-b border-neutral-200">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-2xl font-bold text-neutral-900">Muhafiz</Text>
          <Pressable
            onPress={toggleConnectivity}
            className="flex-row items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-full"
          >
            {connectivity ? (
              <Wifi size={18} color="#22c55e" />
            ) : (
              <WifiOff size={18} color="#ef4444" />
            )}
            <Text className="text-sm font-medium text-neutral-700">
              {connectivity ? 'Online' : 'Offline'}
            </Text>
          </Pressable>
        </View>
        
        {/* Safe Zone Indicator */}
        <View className="flex-row items-center gap-2 bg-green-50 px-3 py-2 rounded-lg self-start">
          <Shield size={20} color="#22c55e" fill="#22c55e" />
          <Text className="text-base font-semibold text-green-600">Safe Zone</Text>
        </View>
      </View>

      {/* Body - Grid Layout */}
      <ScrollView className="flex-1" contentContainerClassName="p-4">
        <View className="flex-row flex-wrap justify-between gap-4">
          {/* Report Incident Card */}
          <Pressable
            onPress={handleReportIncident}
            className="bg-red-500 rounded-2xl p-6 shadow-lg active:opacity-80"
            style={{ width: CARD_WIDTH, minHeight: 180 }}
          >
            <View className="flex-1 justify-between">
              <View>
                <AlertTriangle size={36} color="white" className="mb-4" />
                <Text className="text-white text-2xl font-bold mb-2">Report</Text>
                <Text className="text-white text-base opacity-90">Incident</Text>
              </View>
            </View>
          </Pressable>

          {/* Volunteer Card */}
          <Pressable
            onPress={handleVolunteer}
            className="bg-yellow-500 rounded-2xl p-6 shadow-lg active:opacity-80"
            style={{ width: CARD_WIDTH, minHeight: 180 }}
          >
            <View className="flex-1 justify-between">
              <View>
                <Heart size={36} color="white" className="mb-4" fill="white" />
                <Text className="text-white text-2xl font-bold mb-2">Volunteer</Text>
                <Text className="text-white text-base opacity-90">Help Others</Text>
              </View>
            </View>
          </Pressable>

          {/* Weather/Alerts Card - Full Width */}
          <Pressable
            onPress={handleWeatherAlerts}
            className="bg-blue-500 rounded-2xl p-6 shadow-lg w-full active:opacity-80"
            style={{ minHeight: 140 }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Cloud size={36} color="white" className="mb-4" />
                <Text className="text-white text-2xl font-bold mb-2">Weather & Alerts</Text>
                <Text className="text-white text-base opacity-90">Stay Informed</Text>
              </View>
            </View>
          </Pressable>
        </View>
      </ScrollView>

      {/* SOS Floating Button - Bottom Right */}
      <Pressable
        onPress={handleSOS}
        className="absolute bottom-6 right-6 bg-red-600 rounded-full shadow-lg active:opacity-80"
        style={{ 
          width: 64, 
          height: 64, 
          minHeight: 64,
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        }}
      >
        <Text className="text-white font-bold text-lg">SOS</Text>
      </Pressable>

      {/* Report Incident Modal */}
      <Modal
        visible={showIncidentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowIncidentModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 pb-12">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-2xl font-bold text-neutral-900">Report Incident</Text>
              <Pressable
                onPress={() => setShowIncidentModal(false)}
                className="p-2"
              >
                <X size={24} color="#6b7280" />
              </Pressable>
            </View>

            <Text className="text-neutral-600 mb-6">
              Select the type of incident you want to report:
            </Text>

            <View className="gap-3">
              {INCIDENT_CATEGORIES.map((category) => (
                <Pressable
                  key={category.id}
                  onPress={() => handleIncidentCategory(category)}
                  className="bg-neutral-100 rounded-xl p-5 flex-row items-center justify-between active:opacity-70"
                  style={{ minHeight: 60 }}
                >
                  <Text className="text-lg font-semibold text-neutral-900">
                    {category.label}
                  </Text>
                  <View
                    className="w-5 h-5 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}
