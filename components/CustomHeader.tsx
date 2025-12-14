import { useAppStore } from '@/store/useAppStore';
import * as Haptics from 'expo-haptics';
import { Settings, User } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CustomHeaderProps {
  onSettingsPress: () => void;
}

export default function CustomHeader({ onSettingsPress }: CustomHeaderProps) {
  const { mode } = useAppStore();
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

  const getModeColor = () => {
    switch (mode) {
      case 'PEACE':
        return 'bg-green-500';
      case 'PREDICTIVE':
        return 'bg-yellow-500';
      default:
        return 'bg-green-500';
    }
  };

  const handleSettingsPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSettingsPress();
  };

  const handleAvatarPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Could navigate to profile or show user info
    console.log('Avatar pressed');
  };

  const modeColor = mode === 'PEACE' ? '#22c55e' : '#eab308'; // green-500 or yellow-500

  return (
    <View 
      style={{ 
        backgroundColor: '#171717', // neutral-900
        borderBottomWidth: 1,
        borderBottomColor: '#262626', // neutral-800
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Math.max(insets.top, 8),
        paddingBottom: 12,
        minHeight: 60,
      }}
    >
      {/* Left: App Mode Badge */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{
          backgroundColor: modeColor,
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 9999,
        }}>
          <Text style={{
            color: '#ffffff',
            fontSize: 12,
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
            backgroundColor: '#262626', // neutral-800
            borderRadius: 9999,
            padding: 8,
            minHeight: 44,
            minWidth: 44,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <User size={20} color="#ffffff" />
        </Pressable>
        <Pressable
          onPress={handleSettingsPress}
          style={{
            backgroundColor: '#262626', // neutral-800
            borderRadius: 9999,
            padding: 8,
            minHeight: 44,
            minWidth: 44,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Settings size={20} color="#ffffff" />
        </Pressable>
      </View>
    </View>
  );
}
