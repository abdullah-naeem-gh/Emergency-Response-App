import { Report, reportService } from '@/services/ReportService';
import { useAppStore } from '@/store/useAppStore';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { AlertTriangle, Cloud, Heart, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Dimensions, Modal, Pressable, ScrollView, Text, View } from 'react-native';

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

export default function HomeScreen() {
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
    
    // Create report
    const report: Report = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      type: category.id,
      details: `${category.label} incident reported`,
    };
    
    // Send report (will queue if offline, send if online)
    const result = await reportService.sendReport(report);
    
    // Update store for UI tracking
    useAppStore.getState().addToQueue(report);
    
    setShowIncidentModal(false);
    
    // Show feedback based on result
    if (result.queued) {
      console.log('Report queued for offline sending');
    } else if (result.success) {
      console.log('Report sent successfully');
    }
  };

  const handleVolunteer = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/volunteer');
  };

  const handleWeatherAlerts = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/news');
  };

  return (
    <View className="flex-1 bg-neutral-50">
      {/* Body - Grid Layout */}
      <ScrollView className="flex-1" contentContainerClassName="p-4 pt-4">
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
