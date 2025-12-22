import { AnimatedPressable } from '@/components/AnimatedPressable';
import { EnhancedReportForm } from '@/components/EnhancedReportForm';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAccessibility } from '@/hooks/useAccessibility';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import {
  AlertTriangle,
  BookOpen,
  Bot,
  Heart,
  Map,
  Mic,
  Newspaper,
  PhoneCall,
  Search,
  User,
  Users
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Dimensions,
  ScrollView,
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
  const { themeColors } = useAccessibility();
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


  const handleViewReports = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/reports');
  };

  const handleViewExplore = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/explore');
  };

  const handleViewNews = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/news');
  };

  const handleViewDirectory = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/directory');
  };

  const handleViewEmergencyDirectory = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/directory');
  };

  const handleViewProfile = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/profile');
  };


  const handleViewCommunity = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/community');
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
    <ThemedView className="flex-1">
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting Section */}
        <View className="px-6 pt-0 pb-4">
          <ThemedText className="text-5xl font-bold leading-tight" baseSize={48} style={{ lineHeight: 56 }}>
            Hi,{'\n'}How can we help you today?
          </ThemedText>
        </View>

        {/* Quick Links Section - Horizontal Row */}
        <View className="pb-4">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
          >
            {/* Explore Card */}
            <AnimatedPressable
              onPress={handleViewExplore}
              className="rounded-xl p-3"
              hapticFeedback={true}
              hapticStyle={Haptics.ImpactFeedbackStyle.Light}
              style={{
                width: 120,
                backgroundColor: themeColors.card,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
                borderWidth: 1,
                borderColor: themeColors.border,
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
                <ThemedText className="text-sm font-semibold text-center">
                  Explore
                </ThemedText>
                <ThemedText className="text-xs text-center mt-1" style={{ opacity: 0.7 }} numberOfLines={1}>
                  Articles
                </ThemedText>
              </View>
            </AnimatedPressable>

            {/* News & Alerts Card */}
            <AnimatedPressable
              onPress={handleViewNews}
              className="rounded-xl p-3"
              hapticFeedback={true}
              hapticStyle={Haptics.ImpactFeedbackStyle.Light}
              style={{
                width: 120,
                backgroundColor: themeColors.card,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
                borderWidth: 1,
                borderColor: themeColors.border,
              }}
            >
              <View className="items-center">
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: '#fee2e2',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                  }}
                >
                  <Newspaper size={20} color="#ef4444" />
                </View>
                <ThemedText className="text-sm font-semibold text-center">
                  News
                </ThemedText>
                <ThemedText className="text-xs text-center mt-1" style={{ opacity: 0.7 }} numberOfLines={1}>
                  Alerts
                </ThemedText>
              </View>
            </AnimatedPressable>

            {/* Emergency Directory Card */}
            <AnimatedPressable
              onPress={handleViewEmergencyDirectory}
              className="rounded-xl p-3"
              hapticFeedback={true}
              hapticStyle={Haptics.ImpactFeedbackStyle.Medium}
              style={{
                width: 120,
                backgroundColor: themeColors.card,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
                borderWidth: 1,
                borderColor: '#fee2e2', // light red border for emergency
              }}
            >
              <View className="items-center">
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: '#fee2e2', // light red
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                  }}
                >
                  <PhoneCall size={20} color="#ef4444" />
                </View>
                <ThemedText className="text-sm font-semibold text-center">
                  Emergency
                </ThemedText>
                <ThemedText className="text-xs text-center mt-1" style={{ opacity: 0.7 }} numberOfLines={1}>
                  Contacts
                </ThemedText>
              </View>
            </AnimatedPressable>

            {/* Community Card */}
            <AnimatedPressable
              onPress={handleViewCommunity}
              className="rounded-xl p-3"
              hapticFeedback={true}
              hapticStyle={Haptics.ImpactFeedbackStyle.Light}
              style={{
                width: 120,
                backgroundColor: themeColors.card,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
                borderWidth: 1,
                borderColor: themeColors.border,
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
                  <Users size={20} color="#ec4899" />
                </View>
                <ThemedText className="text-sm font-semibold text-center">
                  Community
                </ThemedText>
                <ThemedText className="text-xs text-center mt-1" style={{ opacity: 0.7 }} numberOfLines={1}>
                  Connect
                </ThemedText>
              </View>
            </AnimatedPressable>

            {/* Profile Card */}
            <AnimatedPressable
              onPress={handleViewProfile}
              className="rounded-xl p-3"
              hapticFeedback={true}
              hapticStyle={Haptics.ImpactFeedbackStyle.Light}
              style={{
                width: 120,
                backgroundColor: themeColors.card,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
                borderWidth: 1,
                borderColor: themeColors.border,
              }}
            >
              <View className="items-center">
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: '#f3f4f6',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                  }}
                >
                  <User size={20} color="#6b7280" />
                </View>
                <ThemedText className="text-sm font-semibold text-center">
                  Profile
                </ThemedText>
                <ThemedText className="text-xs text-center mt-1" style={{ opacity: 0.7 }} numberOfLines={1}>
                  Stats
                </ThemedText>
              </View>
            </AnimatedPressable>
          </ScrollView>
        </View>

        {/* Action Buttons Grid - 2x2 */}
        <View className="px-6 pb-3">
          <View className="flex-row flex-wrap justify-between gap-4">
            {actionButtons.map((button) => {
              const IconComponent = button.icon;
              return (
                <AnimatedPressable
                  key={button.id}
                  onPress={button.onPress}
                  className="rounded-2xl"
                  hapticFeedback={true}
                  hapticStyle={Haptics.ImpactFeedbackStyle.Medium}
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
                        backgroundColor: themeColors.card,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 16,
                      }}
                    >
                      <IconComponent size={40} color={themeColors.text} />
                    </View>
                    <ThemedText 
                      className="text-xl font-semibold"
                      style={{ textAlign: 'center' }}
                    >
                      {button.label}
                    </ThemedText>
                  </View>
                </AnimatedPressable>
              );
            })}
          </View>
        </View>

        {/* Search Bar */}
        <View className="px-6 pb-3">
          <View 
            className="flex-row items-center px-4 py-4"
            style={{ 
              backgroundColor: themeColors.card,
              minHeight: 60,
              borderRadius: 30,
              borderWidth: 1,
              borderColor: themeColors.border,
            }}
          >
            <Search size={20} color={themeColors.text} />
                    <TextInput
                      className="flex-1 ml-3 text-base"
                      style={{ color: themeColors.text }}
                      placeholder="Search for guides, alerts, or ask anything"
                      placeholderTextColor={themeColors.text + '80'}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      onSubmitEditing={handleSearch}
                      returnKeyType="search"
                    />
            <AnimatedPressable
              onPress={handleVoiceInput}
              className="ml-2"
              hapticFeedback={true}
              hapticStyle={Haptics.ImpactFeedbackStyle.Light}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: themeColors.border,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Mic size={20} color={themeColors.text} />
            </AnimatedPressable>
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
    </ThemedView>
  );
}
