import { useAppStore } from '@/store/useAppStore';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import {
  Bell,
  BookOpen,
  Cloud,
  Download,
  FileText,
  Globe,
  HelpCircle,
  History,
  Info,
  MapPin,
  Newspaper,
  Phone,
  Settings,
  Shield,
  User,
  Users,
  X
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Switch,
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

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  route?: string;
  onPress?: () => void;
  color?: string;
  badge?: string;
}

export default function SettingsDrawer({ visible, onClose }: SettingsDrawerProps) {
  const { language, toggleLanguage } = useAppStore();
  const router = useRouter();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const progressWidth = useSharedValue(0);

  const handleClose = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const handleNavigation = async (route: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
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

  const navigationItems: MenuItem[] = [
    { id: 'profile', label: 'Profile', icon: User, route: '/(tabs)/profile', color: '#6b7280' },
    { id: 'weather', label: 'Weather', icon: Cloud, route: '/(tabs)/weather', color: '#3b82f6' },
    { id: 'reports', label: 'Report History', icon: History, route: '/(tabs)/reports', color: '#f59e0b' },
    { id: 'explore', label: 'Explore', icon: BookOpen, route: '/(tabs)/explore', color: '#ec4899' },
    { id: 'preparedness', label: 'Preparedness', icon: BookOpen, route: '/(tabs)/preparedness', color: '#10b981' },
    { id: 'evacuation', label: 'Evacuation Routes', icon: MapPin, route: '/(tabs)/evacuation', color: '#8b5cf6' },
    { id: 'community', label: 'Community', icon: Users, route: '/(tabs)/community', color: '#ec4899' },
    { id: 'crowd-map', label: 'Crowd Map', icon: MapPin, route: '/(tabs)/crowd-map', color: '#10b981' },
    { id: 'news', label: 'News & Alerts', icon: Newspaper, route: '/(tabs)/news', color: '#ef4444' },
    { id: 'directory', label: 'Directory', icon: Phone, route: '/(tabs)/directory', color: '#8b5cf6' },
  ];

  const renderMenuItem = (item: MenuItem) => {
    const Icon = item.icon;
    const iconColor = item.color || '#6b7280';

    return (
      <Pressable
        key={item.id}
        onPress={() => {
          if (item.route) {
            handleNavigation(item.route);
          } else if (item.onPress) {
            item.onPress();
          }
        }}
        className="bg-white rounded-xl p-4 flex-row items-center justify-between mb-3 border border-gray-200"
        style={{ 
          minHeight: 60,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        <View className="flex-row items-center gap-3 flex-1">
          <Icon size={24} color={iconColor} />
          <Text className="text-gray-900 text-base flex-1 font-medium">{item.label}</Text>
          {item.badge && (
            <View className="bg-red-500 rounded-full px-2 py-1">
              <Text className="text-white text-xs font-bold">{item.badge}</Text>
            </View>
          )}
        </View>
      </Pressable>
    );
  };

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
        <View className="bg-white rounded-t-3xl border-t border-gray-200 max-h-[90%]">
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
            <Text className="text-gray-900 text-2xl font-bold">Menu</Text>
            <Pressable
              onPress={handleClose}
              className="bg-gray-100 rounded-full p-2"
              style={{ minHeight: 44, minWidth: 44 }}
            >
              <X size={20} color="#374151" />
            </Pressable>
          </View>

          <ScrollView className="px-6 py-4" showsVerticalScrollIndicator={false}>
            {/* Navigation Section */}
            <View className="mb-6">
              <Text className="text-gray-900 text-lg font-semibold mb-3">Navigation</Text>
              {navigationItems.map(renderMenuItem)}
            </View>

            {/* Settings Section */}
            <View className="mb-6">
              <Text className="text-gray-900 text-lg font-semibold mb-3">Settings</Text>
              
              {/* Language Toggle */}
              <Pressable
                onPress={handleLanguageToggle}
                className="bg-white rounded-xl p-4 flex-row items-center justify-between mb-3 border border-gray-200"
                style={{ 
                  minHeight: 60,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <Globe size={24} color="#3b82f6" />
                  <View className="flex-1">
                    <Text className="text-gray-900 text-base font-medium">Language</Text>
                    <Text className="text-gray-500 text-sm">
                      {language === 'en' ? 'English' : 'اردو (Urdu)'}
                    </Text>
                  </View>
                </View>
                <View className="bg-blue-500 px-4 py-2 rounded-lg">
                  <Text className="text-white text-sm font-semibold">
                    {language === 'en' ? 'اردو' : 'EN'}
                  </Text>
                </View>
              </Pressable>

              {/* Notifications Toggle */}
              <View className="bg-white rounded-xl p-4 flex-row items-center justify-between mb-3 border border-gray-200"
                style={{ 
                  minHeight: 60,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <Bell size={24} color="#f59e0b" />
                  <View className="flex-1">
                    <Text className="text-gray-900 text-base font-medium">Notifications</Text>
                    <Text className="text-gray-500 text-sm">
                      Emergency alerts & updates
                    </Text>
                  </View>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={(value) => {
                    Haptics.selectionAsync();
                    setNotificationsEnabled(value);
                  }}
                  trackColor={{ false: '#d1d5db', true: '#f59e0b' }}
                  thumbColor="#ffffff"
                />
              </View>

              {/* App Settings */}
              <Pressable
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  // Navigate to settings screen when implemented
                }}
                className="bg-white rounded-xl p-4 flex-row items-center justify-between mb-3 border border-gray-200"
                style={{ 
                  minHeight: 60,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <Settings size={24} color="#6b7280" />
                  <Text className="text-gray-900 text-base font-medium">App Settings</Text>
                </View>
              </Pressable>
            </View>

            {/* Offline Data Section */}
            <View className="mb-6">
              <Text className="text-gray-900 text-lg font-semibold mb-3">Offline Data</Text>
              <Pressable
                onPress={handleDownloadOfflineData}
                disabled={isDownloading}
                className={`rounded-xl p-4 border border-gray-200 ${isDownloading ? 'bg-gray-50' : 'bg-white'}`}
                style={{ 
                  minHeight: 60,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center gap-3">
                    <Download size={24} color="#10b981" />
                    <Text className="text-gray-900 text-base font-medium">
                      Download Offline Data
                    </Text>
                  </View>
                  {isDownloading && (
                    <ActivityIndicator size="small" color="#10b981" />
                  )}
                </View>
                
                {/* Progress Bar */}
                {isDownloading && (
                  <View className="bg-gray-200 rounded-full h-2 overflow-hidden">
                    <Animated.View 
                      className="bg-green-500 h-full rounded-full"
                      style={progressStyle}
                    />
                  </View>
                )}
                
                {isDownloading && (
                  <Text className="text-gray-500 text-sm mt-2">
                    {Math.round(downloadProgress)}% downloaded
                  </Text>
                )}
                
                {!isDownloading && downloadProgress === 0 && (
                  <Text className="text-gray-500 text-sm mt-2">
                    Download guides, contacts, and emergency data for offline use
                  </Text>
                )}
              </Pressable>
            </View>

            {/* Help & Support Section */}
            <View className="mb-6">
              <Text className="text-gray-900 text-lg font-semibold mb-3">Help & Support</Text>
              
              <Pressable
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  // Navigate to help screen
                }}
                className="bg-white rounded-xl p-4 flex-row items-center justify-between mb-3 border border-gray-200"
                style={{ 
                  minHeight: 60,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <HelpCircle size={24} color="#3b82f6" />
                  <Text className="text-gray-900 text-base font-medium">Help Center</Text>
                </View>
              </Pressable>

              <Pressable
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  // Navigate to privacy policy
                }}
                className="bg-white rounded-xl p-4 flex-row items-center justify-between mb-3 border border-gray-200"
                style={{ 
                  minHeight: 60,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <Shield size={24} color="#10b981" />
                  <Text className="text-gray-900 text-base font-medium">Privacy Policy</Text>
                </View>
              </Pressable>

              <Pressable
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  // Navigate to terms of service
                }}
                className="bg-white rounded-xl p-4 flex-row items-center justify-between mb-3 border border-gray-200"
                style={{ 
                  minHeight: 60,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <FileText size={24} color="#6b7280" />
                  <Text className="text-gray-900 text-base font-medium">Terms of Service</Text>
                </View>
              </Pressable>

              <Pressable
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  // Navigate to about screen
                }}
                className="bg-white rounded-xl p-4 flex-row items-center justify-between mb-3 border border-gray-200"
                style={{ 
                  minHeight: 60,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <Info size={24} color="#6b7280" />
                  <Text className="text-gray-900 text-base font-medium">About Muhafiz</Text>
                </View>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
