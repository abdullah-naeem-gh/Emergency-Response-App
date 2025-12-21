import { useAccessibility } from '@/hooks/useAccessibility';
import { useAppStore } from '@/store/useAppStore';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Menu, User } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CustomHeaderProps {
  onMenuPress: () => void;
}

export default function CustomHeader({ onMenuPress }: CustomHeaderProps) {
  const { mode } = useAppStore();
  const { themeColors, getFontSize } = useAccessibility();
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
          backgroundColor: mode === 'PEACE' ? '#dcfce7' : '#fef9c3', // green-100 : yellow-100
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 9999,
          borderWidth: 1,
          borderColor: mode === 'PEACE' ? '#bbf7d0' : '#fef08a',
        }}>
          <Text style={{
            color: mode === 'PEACE' ? '#15803d' : '#854d0e', // green-700 : yellow-800
            fontSize: getFontSize(12),
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}>
            {getModeLabel()}
          </Text>
        </View>
      </View>

      {/* Right: Avatar and Settings */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
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
