import { EnhancedReportForm } from '@/components/EnhancedReportForm';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import {
  AlertTriangle,
  BookOpen,
  Bot,
  Cloud,
  Heart,
  History,
  Map,
  Mic,
  Search
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View
} from 'react-native';

const { width } = Dimensions.get('window');
const BUTTON_SIZE = (width - 48) / 2 - 8; // 2 columns with padding and gap

interface ActionButton {
  id: string;
  label: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  color: string;
  bgColor: string;
  onPress: () => void;
}

export default function HomeScreen() {
  const router = useRouter();
  const [showEnhancedForm, setShowEnhancedForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleReportIncident = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowEnhancedForm(true);
  };

  const handleVolunteer = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/volunteer');
  };

  const handleViewMap = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/crowd-map');
  };

  const handleAskAI = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/chatbot');
  };

  const handleSearch = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (searchQuery.trim()) {
      // Navigate to chatbot screen
      router.push('/(tabs)/chatbot');
    }
  };

  const handleVoiceInput = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to chatbot for voice input
    router.push('/(tabs)/chatbot');
  };

  const handleViewWeather = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/weather');
  };

  const handleViewReports = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/reports');
  };

  const handleViewExplore = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/explore');
  };

  const actionButtons: ActionButton[] = [
    {
      id: 'report',
      label: 'Report',
      icon: AlertTriangle,
      color: '#ef4444',
      bgColor: '#dbeafe', // light blue
      onPress: handleReportIncident,
    },
    {
      id: 'volunteer',
      label: 'Volunteer',
      icon: Heart,
      color: '#ea580c',
      bgColor: '#ffffff', // white
      onPress: handleVolunteer,
    },
    {
      id: 'map',
      label: 'View Map',
      icon: Map,
      color: '#3b82f6',
      bgColor: '#dcfce7', // light green
      onPress: handleViewMap,
    },
    {
      id: 'ask-ai',
      label: 'Ask AI',
      icon: Bot,
      color: '#eab308',
      bgColor: '#fef3c7', // light yellow
      onPress: handleAskAI,
    },
  ];

  return (
    <View className="flex-1 bg-white">
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting Section */}
        <View className="px-6 pt-0 pb-4">
          <Text className="text-5xl font-bold text-gray-900 leading-tight" style={{ lineHeight: 56 }}>
            Hi,{'\n'}How can we help you today?
          </Text>
        </View>

        {/* Quick Links Section - Horizontal Row */}
        <View className="pb-4">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
          >
            {/* Weather Card */}
            <Pressable
              onPress={handleViewWeather}
              className="bg-white rounded-xl p-3"
              style={{
                width: 120,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
                borderWidth: 1,
                borderColor: '#e5e7eb',
              }}
            >
              <View className="items-center">
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: '#dbeafe',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                  }}
                >
                  <Cloud size={20} color="#3b82f6" />
                </View>
                <Text className="text-sm font-semibold text-gray-900 text-center">
                  Weather
                </Text>
                <Text className="text-xs text-gray-500 text-center mt-1" numberOfLines={1}>
                  Forecast
                </Text>
              </View>
            </Pressable>

            {/* Reports History Card */}
            <Pressable
              onPress={handleViewReports}
              className="bg-white rounded-xl p-3"
              style={{
                width: 120,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
                borderWidth: 1,
                borderColor: '#e5e7eb',
              }}
            >
              <View className="items-center">
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: '#fef3c7',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                  }}
                >
                  <History size={20} color="#f59e0b" />
                </View>
                <Text className="text-sm font-semibold text-gray-900 text-center">
                  Reports
                </Text>
                <Text className="text-xs text-gray-500 text-center mt-1" numberOfLines={1}>
                  History
                </Text>
              </View>
            </Pressable>

            {/* Explore Card */}
            <Pressable
              onPress={handleViewExplore}
              className="bg-white rounded-xl p-3"
              style={{
                width: 120,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
                borderWidth: 1,
                borderColor: '#e5e7eb',
              }}
            >
              <View className="items-center">
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: '#fce7f3',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                  }}
                >
                  <BookOpen size={20} color="#ec4899" />
                </View>
                <Text className="text-sm font-semibold text-gray-900 text-center">
                  Explore
                </Text>
                <Text className="text-xs text-gray-500 text-center mt-1" numberOfLines={1}>
                  Articles
                </Text>
              </View>
            </Pressable>
          </ScrollView>
        </View>

        {/* Action Buttons Grid - 2x2 */}
        <View className="px-6 pb-3">
          <View className="flex-row flex-wrap justify-between gap-4">
            {actionButtons.map((button) => {
              const IconComponent = button.icon;
              return (
                <Pressable
                  key={button.id}
                  onPress={button.onPress}
                  className="rounded-2xl active:opacity-80"
                  style={{
                    width: BUTTON_SIZE,
                    minHeight: BUTTON_SIZE,
                    backgroundColor: button.bgColor,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 20,
                  }}
                >
                  <View className="items-center justify-center">
                    <View
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 32,
                        backgroundColor: '#ffffff',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 16,
                      }}
                    >
                      <IconComponent size={40} color="#000000" />
                    </View>
                    <Text 
                      className="text-xl font-semibold"
                      style={{ color: '#000000', textAlign: 'center' }}
                    >
                      {button.label}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Search Bar */}
        <View className="px-6 pb-3">
          <View 
            className="flex-row items-center bg-white px-4 py-4"
            style={{ 
              minHeight: 60,
              borderRadius: 30,
              borderWidth: 1,
              borderColor: '#e5e7eb',
            }}
          >
            <Search size={20} color="#1f2937" />
            <TextInput
              className="flex-1 ml-3 text-base"
              style={{ color: '#111827' }}
              placeholder="Search for guides, alerts, or ask anything"
              placeholderTextColor="#6b7280"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <Pressable
              onPress={handleVoiceInput}
              className="ml-2"
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: '#e5e7eb',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Mic size={20} color="#1f2937" />
            </Pressable>
          </View>
        </View>

      </ScrollView>

      {/* Enhanced Report Form */}
      <EnhancedReportForm
        visible={showEnhancedForm}
        onClose={() => {
          setShowEnhancedForm(false);
        }}
        onSuccess={() => {
          setShowEnhancedForm(false);
        }}
      />
    </View>
  );
}
