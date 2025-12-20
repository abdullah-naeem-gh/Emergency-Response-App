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

  const isDark = mode === 'PANIC'; // We can extend this if we add a Dark Mode setting later, but for now align with Peace/Panic
  
  return (
    <View 
      style={{ 
        backgroundColor: '#ffffff', 
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Math.max(insets.top, 8),
        paddingBottom: 16,
        minHeight: 72,
        zIndex: 10,
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
            backgroundColor: '#f3f4f6', // gray-100
            borderRadius: 9999,
            padding: 8,
            minHeight: 44,
            minWidth: 44,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <User size={24} color="#374151" />
        </Pressable>
        <Pressable
          onPress={handleSettingsPress}
          style={{
            backgroundColor: '#f3f4f6', // gray-100
            borderRadius: 9999,
            padding: 8,
            minHeight: 44,
            minWidth: 44,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Settings size={24} color="#374151" />
        </Pressable>
      </View>
    </View>
  );
}
