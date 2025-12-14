import { useAppStore } from '@/store/useAppStore';
import * as Haptics from 'expo-haptics';
import { Download, Globe, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Pressable,
    ScrollView,
    Text,
    View
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';

interface SettingsDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export default function SettingsDrawer({ visible, onClose }: SettingsDrawerProps) {
  const { language, toggleLanguage } = useAppStore();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const progressWidth = useSharedValue(0);

  const handleClose = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const handleLanguageToggle = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleLanguage();
  };

  const handleDownloadOfflineData = async () => {
    if (isDownloading) return;
    
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsDownloading(true);
    setDownloadProgress(0);
    progressWidth.value = 0;

    // Simulate download progress
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        const newProgress = Math.min(prev + Math.random() * 15, 100);
        progressWidth.value = withTiming(newProgress, { duration: 200 });
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsDownloading(false);
            setDownloadProgress(0);
            progressWidth.value = 0;
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }, 500);
        }
        
        return newProgress;
      });
    }, 300);
  };

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/50">
        <Pressable 
          className="flex-1" 
          onPress={handleClose}
        />
        <View className="bg-neutral-900 rounded-t-3xl border-t border-neutral-800">
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-neutral-800">
            <Text className="text-white text-xl font-bold">Settings</Text>
            <Pressable
              onPress={handleClose}
              className="bg-neutral-800 rounded-full p-2"
              style={{ minHeight: 44, minWidth: 44 }}
            >
              <X size={20} color="#ffffff" />
            </Pressable>
          </View>

          <ScrollView className="px-6 py-4">
            {/* Language Toggle */}
            <View className="mb-6">
              <Text className="text-white text-lg font-semibold mb-3">Language</Text>
              <Pressable
                onPress={handleLanguageToggle}
                className="bg-neutral-800 rounded-xl p-4 flex-row items-center justify-between"
                style={{ minHeight: 60 }}
              >
                <View className="flex-row items-center gap-3">
                  <Globe size={24} color="#ffffff" />
                  <Text className="text-white text-base">
                    {language === 'en' ? 'English' : 'اردو (Urdu)'}
                  </Text>
                </View>
                <View className="bg-red-500 px-4 py-2 rounded-lg">
                  <Text className="text-white text-sm font-semibold">
                    {language === 'en' ? 'Switch to Urdu' : 'Switch to English'}
                  </Text>
                </View>
              </Pressable>
            </View>

            {/* Download Offline Data */}
            <View className="mb-6">
              <Text className="text-white text-lg font-semibold mb-3">Offline Data</Text>
              <Pressable
                onPress={handleDownloadOfflineData}
                disabled={isDownloading}
                className={`rounded-xl p-4 ${isDownloading ? 'bg-neutral-700' : 'bg-neutral-800'}`}
                style={{ minHeight: 60 }}
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center gap-3">
                    <Download size={24} color="#ffffff" />
                    <Text className="text-white text-base font-medium">
                      Download Offline Data
                    </Text>
                  </View>
                  {isDownloading && (
                    <ActivityIndicator size="small" color="#ef4444" />
                  )}
                </View>
                
                {/* Progress Bar */}
                {isDownloading && (
                  <View className="bg-neutral-700 rounded-full h-2 overflow-hidden">
                    <Animated.View 
                      className="bg-red-500 h-full rounded-full"
                      style={progressStyle}
                    />
                  </View>
                )}
                
                {isDownloading && (
                  <Text className="text-neutral-400 text-sm mt-2">
                    {Math.round(downloadProgress)}% downloaded
                  </Text>
                )}
                
                {!isDownloading && downloadProgress === 0 && (
                  <Text className="text-neutral-400 text-sm mt-2">
                    Download guides, contacts, and emergency data for offline use
                  </Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
