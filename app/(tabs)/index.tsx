import { AnimatedPressable } from '@/components/AnimatedPressable';
import { EnhancedReportForm } from '@/components/EnhancedReportForm';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAccessibility } from '@/hooks/useAccessibility';
import { useTranslation } from '@/hooks/useTranslation';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import {
  AlertTriangle,
  BookOpen,
  Bot,
  Mic,
  Newspaper,
  PhoneCall,
  Search,
  User,
  Users
} from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  View,
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
  const { t } = useTranslation();
  const [showEnhancedForm, setShowEnhancedForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Helper function to get theme-aware card colors
  const getCardColors = useMemo(() => {
    const isDark = themeColors.background === '#000000' || 
                   themeColors.background === '#121212' || 
                   themeColors.background === '#1a1a1a';
    
    // For dark themes, use card color as base (icons provide visual distinction)
    // For light themes, use colored tints
    if (isDark) {
      const baseCard = themeColors.card;
      return {
        explore: baseCard,
        news: baseCard,
        emergency: baseCard,
        community: baseCard,
        profile: baseCard,
        report: baseCard,
        volunteer: baseCard,
        map: baseCard,
        askAI: baseCard,
        guides: baseCard,
      };
    } else {
      // Light theme - use subtle tints that match theme
      return {
        explore: '#fce7f3', // pink tint
        news: '#fee2e2', // red tint
        emergency: '#fee2e2', // red tint
        community: '#fce7f3', // pink tint
        profile: '#f3f4f6', // gray tint
        report: '#dbeafe', // blue tint
        volunteer: '#ffffff', // white
        map: '#dcfce7', // green tint
        askAI: '#fef3c7', // yellow tint
        guides: '#e0e7ff', // indigo tint
      };
    }
  }, [themeColors]);

  // Helper function to get theme-aware icon colors
  const getIconColors = useMemo(() => {
    const isDark = themeColors.background === '#000000' || 
                   themeColors.background === '#121212' || 
                   themeColors.background === '#1a1a1a';
    
    if (isDark) {
      // For dark themes, use theme accent colors or primary with variations
      return {
        explore: themeColors.accent || themeColors.primary,
        news: themeColors.accent || themeColors.primary,
        emergency: '#ef4444', // Keep red for emergency visibility
        community: themeColors.accent || themeColors.primary,
        profile: themeColors.text,
        report: themeColors.accent || themeColors.primary,
        volunteer: themeColors.accent || themeColors.primary,
        map: themeColors.secondary || themeColors.primary,
        askAI: themeColors.accent || themeColors.primary,
        guides: themeColors.accent || themeColors.primary,
      };
    } else {
      // Light theme - use original colors
      return {
        explore: '#ec4899',
        news: '#ef4444',
        emergency: '#ef4444',
        community: '#ec4899',
        profile: '#6b7280',
        report: '#ef4444',
        volunteer: '#ea580c',
        map: '#3b82f6',
        askAI: '#eab308',
        guides: '#6366f1',
      };
    }
  }, [themeColors]);

  const handleReportIncident = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowEnhancedForm(true);
  }, [setShowEnhancedForm]);

  const handleEmergency = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/directory');
  }, [router]);

  const handleAskAI = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/chatbot');
  }, [router]);

  const handleSearch = async () => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Navigate to chatbot and pass the initial query so it can auto-respond
    router.push({
      pathname: '/(tabs)/chatbot',
      params: { initialQuery: trimmed },
    } as never);
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

  const handleViewProfile = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/profile');
  };


  const handleViewCommunity = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/community');
  }, [router]);

  const handleViewGuides = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/guides');
  }, [router]);


  const actionButtons: ActionButton[] = useMemo(() => [
    {
      id: 'report',
      label: t('home.reportIncident'),
      icon: AlertTriangle,
      color: getIconColors.report,
      bgColor: getCardColors.report,
      onPress: handleReportIncident,
    },
    {
      id: 'emergency',
      label: t('home.emergency'),
      icon: PhoneCall,
      color: getIconColors.emergency,
      bgColor: getCardColors.emergency,
      onPress: handleEmergency,
    },
    {
      id: 'community',
      label: t('home.community'),
      icon: Users,
      color: getIconColors.community,
      bgColor: getCardColors.community,
      onPress: handleViewCommunity,
    },
    {
      id: 'ask-ai',
      label: t('home.askAI'),
      icon: Bot,
      color: getIconColors.askAI,
      bgColor: getCardColors.askAI,
      onPress: handleAskAI,
    },
  ], [getCardColors, getIconColors, handleReportIncident, handleEmergency, handleViewCommunity, handleAskAI, t]);

  return (
    <ThemedView className="flex-1">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ paddingBottom: 120, paddingTop: 16 }}
          showsVerticalScrollIndicator={false}
        >
        {/* Greeting Section */}
        <View className="px-6 pt-0 pb-3">
          <ThemedText className="text-4xl font-bold leading-tight" baseSize={36} style={{ lineHeight: 44 }}>
            {t('home.title')}
          </ThemedText>
        </View>

        {/* Quick Links Section - Horizontal Row */}
        <View className="pb-3">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 10 }}
          >
            {/* Explore Card */}
            <AnimatedPressable
              onPress={handleViewExplore}
              className="rounded-xl p-3"
              hapticFeedback={true}
              hapticStyle={Haptics.ImpactFeedbackStyle.Light}
              style={{
                width: 110,
                backgroundColor: getCardColors.explore,
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
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: getCardColors.explore,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 6,
                    opacity: 0.8,
                  }}
                >
                  <BookOpen size={18} color={getIconColors.explore} />
                </View>
                <ThemedText className="text-sm font-semibold text-center">
                  {t('home.explore')}
                </ThemedText>
                <ThemedText className="text-xs text-center mt-1" style={{ opacity: 0.7 }} numberOfLines={1}>
                  {t('home.articles')}
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
                width: 110,
                backgroundColor: getCardColors.news,
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
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: getCardColors.news,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 6,
                    opacity: 0.8,
                  }}
                >
                  <Newspaper size={18} color={getIconColors.news} />
                </View>
                <ThemedText className="text-sm font-semibold text-center">
                  {t('home.news')}
                </ThemedText>
                <ThemedText className="text-xs text-center mt-1" style={{ opacity: 0.7 }} numberOfLines={1}>
                  {t('home.alerts')}
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
                width: 110,
                backgroundColor: getCardColors.profile,
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
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: getCardColors.profile,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 6,
                    opacity: 0.8,
                  }}
                >
                  <User size={18} color={getIconColors.profile} />
                </View>
                <ThemedText className="text-sm font-semibold text-center">
                  {t('home.profile')}
                </ThemedText>
                <ThemedText className="text-xs text-center mt-1" style={{ opacity: 0.7 }} numberOfLines={1}>
                  {t('home.stats')}
                </ThemedText>
              </View>
            </AnimatedPressable>

            {/* Guides Card */}
            <AnimatedPressable
              onPress={handleViewGuides}
              className="rounded-xl p-3"
              hapticFeedback={true}
              hapticStyle={Haptics.ImpactFeedbackStyle.Light}
              style={{
                width: 110,
                backgroundColor: getCardColors.guides,
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
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: getCardColors.guides,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 6,
                    opacity: 0.8,
                  }}
                >
                  <BookOpen size={18} color={getIconColors.guides} />
                </View>
                <ThemedText className="text-sm font-semibold text-center">
                  {t('home.guides')}
                </ThemedText>
                <ThemedText className="text-xs text-center mt-1" style={{ opacity: 0.7 }} numberOfLines={1}>
                  {t('home.tutorials')}
                </ThemedText>
              </View>
            </AnimatedPressable>
          </ScrollView>
        </View>

        {/* Action Buttons Grid - 2x2 */}
        <View className="px-6 pb-2">
          <View className="flex-row flex-wrap justify-between gap-3">
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
                    paddingVertical: 16,
                  }}
                >
                  <View className="items-center justify-center">
                    <View
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 28,
                        backgroundColor: themeColors.card,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 12,
                        opacity: 0.9,
                      }}
                    >
                      <IconComponent size={36} color={button.color} />
                    </View>
                    <ThemedText 
                      className="text-lg font-semibold"
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
        <View className="px-6 pb-2">
          <View 
            className="flex-row items-center px-4 py-3"
            style={{ 
              backgroundColor: themeColors.card,
              minHeight: 56,
              borderRadius: 28,
              borderWidth: 1,
              borderColor: themeColors.border,
            }}
          >
            <Search size={18} color={themeColors.text} />
            <TextInput
              className="flex-1 ml-3 text-sm"
              style={{ color: themeColors.text }}
              placeholder={t('home.searchPlaceholder')}
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
                width: 32,
                height: 32,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: themeColors.border,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Mic size={18} color={themeColors.text} />
            </AnimatedPressable>
          </View>
        </View>

        </ScrollView>
      </KeyboardAvoidingView>

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
