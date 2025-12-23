import { useAccessibility } from '@/hooks/useAccessibility';
import { useAppStore } from '@/store/useAppStore';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Menu, Mic, User } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useVoiceNavigation } from './VoiceNavigationProvider';
import { voiceNavigationService } from '@/services/VoiceNavigationService';

// Helper function to add opacity to hex color
const hexToRgba = (hex: string, opacity: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

interface CustomHeaderProps {
  onMenuPress: () => void;
}

export default function CustomHeader({ onMenuPress }: CustomHeaderProps) {
  const { mode } = useAppStore();
  const { themeColors, getFontSize } = useAccessibility();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isActive, toggleVoiceNavigation } = useVoiceNavigation();
  const isVoiceModuleAvailable = voiceNavigationService.getModuleAvailable();

  // Hide header in panic mode
  if (mode === 'PANIC') {
    return null;
  }

  const getModeLabel = () => {
    switch (mode) {
      case 'PEACE':
        return 'Peace Mode';
      case 'PREDICTIVE':
        return 'Predictive Mode';
      default:
        return 'Peace Mode';
    }
  };

  const handleMenuPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onMenuPress();
  };

  const handleAvatarPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/profile');
  };

  const handleVoicePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await toggleVoiceNavigation();
  };
  
  return (
    <View 
      style={{ 
        backgroundColor: themeColors.card, 
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Math.max(insets.top, 8),
        paddingBottom: 16,
        minHeight: 72,
        zIndex: 10,
        borderBottomWidth: 1,
        borderBottomColor: themeColors.border,
      }}
    >
      {/* Left: App Mode Badge */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{
          backgroundColor: hexToRgba(themeColors.primary, 0.2), // Use primary color with 20% opacity
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 9999,
          borderWidth: 1,
          borderColor: themeColors.primary,
        }}>
          <Text style={{
            color: themeColors.primary,
            fontSize: getFontSize(12),
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}>
            {getModeLabel()}
          </Text>
        </View>
      </View>

      {/* Right: Voice, Avatar and Settings */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Pressable
          onPress={handleVoicePress}
          disabled={!isVoiceModuleAvailable}
          style={{
            backgroundColor: isActive 
              ? themeColors.primary + '20' 
              : themeColors.card === themeColors.background ? '#f3f4f6' : themeColors.card,
            borderRadius: 9999,
            padding: 8,
            minHeight: 44,
            minWidth: 44,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: isActive ? themeColors.primary : themeColors.border,
            opacity: isVoiceModuleAvailable ? 1 : 0.5,
          }}
        >
          <Mic size={24} color={isActive ? themeColors.primary : themeColors.text} />
        </Pressable>
        <Pressable
          onPress={handleAvatarPress}
          style={{
            backgroundColor: themeColors.card === themeColors.background ? '#f3f4f6' : themeColors.card,
            borderRadius: 9999,
            padding: 8,
            minHeight: 44,
            minWidth: 44,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: themeColors.border,
          }}
        >
          <User size={24} color={themeColors.text} />
        </Pressable>
        <Pressable
          onPress={handleMenuPress}
          style={{
            backgroundColor: themeColors.card === themeColors.background ? '#f3f4f6' : themeColors.card,
            borderRadius: 9999,
            padding: 8,
            minHeight: 44,
            minWidth: 44,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: themeColors.border,
          }}
        >
          <Menu size={24} color={themeColors.text} />
        </Pressable>
      </View>
    </View>
  );
}
