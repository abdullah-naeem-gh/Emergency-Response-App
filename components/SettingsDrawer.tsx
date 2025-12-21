import { AnimatedPressable } from '@/components/AnimatedPressable';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import {
  accessibilityService,
  AccessibilitySettings,
  AccessibilityTheme,
} from '@/services/AccessibilityService';
import { notificationService } from '@/services/NotificationService';
import { useAccessibility } from '@/hooks/useAccessibility';
import { useAppStore } from '@/store/useAppStore';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import {
  Bell,
  BookOpen,
  Cloud,
  Download,
  Eye,
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
  Volume2,
  X,
  Zap
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
  const { language, toggleLanguage, accessibilitySettings, updateAccessibilitySettings } = useAppStore();
  const { themeColors, getFontSize } = useAccessibility();
  const router = useRouter();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAccessibilityModal, setShowAccessibilityModal] = useState(false);
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
      <AnimatedPressable
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
        hapticFeedback={true}
        hapticStyle={Haptics.ImpactFeedbackStyle.Light}
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
      </AnimatedPressable>
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
        <ThemedView className="rounded-t-3xl border-t max-h-[90%]" style={{ borderTopColor: themeColors.border }}>
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 py-4 border-b" style={{ backgroundColor: themeColors.card, borderBottomColor: themeColors.border }}>
            <ThemedText className="text-2xl font-bold" baseSize={24}>Menu</ThemedText>
            <Pressable
              onPress={handleClose}
              className="bg-gray-100 rounded-full p-2"
              style={{ minHeight: 44, minWidth: 44 }}
            >
              <X size={20} color="#374151" />
            </Pressable>
          </View>

          <ScrollView className="bg-white px-6 py-4" showsVerticalScrollIndicator={false}>
            {/* Accessibility Section - Moved to top for visibility */}
            <View className="mb-6">
              <Text className="text-gray-900 text-lg font-semibold mb-3">Accessibility</Text>
              
              <AnimatedPressable
                onPress={async () => {
                  setShowAccessibilityModal(true);
                }}
                className="bg-white rounded-xl p-4 flex-row items-center justify-between mb-3 border-2 border-purple-200"
                style={{ 
                  minHeight: 60,
                  shadowColor: '#8b5cf6',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 4,
                  elevation: 3,
                  backgroundColor: '#faf5ff', // light purple background
                }}
                hapticFeedback={true}
                hapticStyle={Haptics.ImpactFeedbackStyle.Medium}
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: '#8b5cf6',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Eye size={24} color="#ffffff" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 text-base font-semibold">Accessibility Settings</Text>
                    <Text className="text-gray-600 text-sm">
                      Themes, text-to-speech, haptics & more
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#8b5cf6',
                  }}
                />
              </AnimatedPressable>
            </View>

            {/* Navigation Section */}
            <View className="mb-6">
              <Text className="text-gray-900 text-lg font-semibold mb-3">Navigation</Text>
              {navigationItems.map(renderMenuItem)}
            </View>

            {/* Settings Section */}
            <View className="mb-6">
              <Text className="text-gray-900 text-lg font-semibold mb-3">Settings</Text>
              
              {/* Language Toggle */}
              <AnimatedPressable
                onPress={handleLanguageToggle}
                className="bg-white rounded-xl p-4 flex-row items-center justify-between mb-3 border border-gray-200"
                hapticFeedback={true}
                hapticStyle={Haptics.ImpactFeedbackStyle.Medium}
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
              </AnimatedPressable>

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
              <AnimatedPressable
                onPress={async () => {
                  setShowSettingsModal(true);
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
                hapticFeedback={true}
                hapticStyle={Haptics.ImpactFeedbackStyle.Light}
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <Settings size={24} color="#6b7280" />
                  <Text className="text-gray-900 text-base font-medium">App Settings</Text>
                </View>
              </AnimatedPressable>
            </View>

            {/* Offline Data Section */}
            <View className="mb-6">
              <Text className="text-gray-900 text-lg font-semibold mb-3">Offline Data</Text>
              <AnimatedPressable
                onPress={handleDownloadOfflineData}
                disabled={isDownloading}
                className={`rounded-xl p-4 border border-gray-200 ${isDownloading ? 'bg-gray-50' : 'bg-white'}`}
                hapticFeedback={true}
                hapticStyle={Haptics.ImpactFeedbackStyle.Medium}
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
              </AnimatedPressable>
            </View>

            {/* Help & Support Section */}
            <View className="mb-6">
              <Text className="text-gray-900 text-lg font-semibold mb-3">Help & Support</Text>
              
              <AnimatedPressable
                onPress={async () => {
                  setShowHelpModal(true);
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
                hapticFeedback={true}
                hapticStyle={Haptics.ImpactFeedbackStyle.Light}
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <HelpCircle size={24} color="#3b82f6" />
                  <Text className="text-gray-900 text-base font-medium">Help Center</Text>
                </View>
              </AnimatedPressable>

              <AnimatedPressable
                onPress={async () => {
                  setShowPrivacyModal(true);
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
                hapticFeedback={true}
                hapticStyle={Haptics.ImpactFeedbackStyle.Light}
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <Shield size={24} color="#10b981" />
                  <Text className="text-gray-900 text-base font-medium">Privacy Policy</Text>
                </View>
              </AnimatedPressable>

              <AnimatedPressable
                onPress={async () => {
                  setShowTermsModal(true);
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
                hapticFeedback={true}
                hapticStyle={Haptics.ImpactFeedbackStyle.Light}
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <FileText size={24} color="#6b7280" />
                  <Text className="text-gray-900 text-base font-medium">Terms of Service</Text>
                </View>
              </AnimatedPressable>

              <AnimatedPressable
                onPress={async () => {
                  setShowAboutModal(true);
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
                hapticFeedback={true}
                hapticStyle={Haptics.ImpactFeedbackStyle.Light}
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <Info size={24} color="#6b7280" />
                  <Text className="text-gray-900 text-base font-medium">About Muhafiz</Text>
                </View>
              </AnimatedPressable>
            </View>
          </ScrollView>
        </ThemedView>
      </View>

      {/* Help Center Modal */}
      <Modal
        visible={showHelpModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowHelpModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl max-h-[90%]">
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
              <Text className="text-gray-900 text-2xl font-bold">Help Center</Text>
              <Pressable
                onPress={() => setShowHelpModal(false)}
                className="bg-gray-100 rounded-full p-2"
                style={{ minHeight: 44, minWidth: 44 }}
              >
                <X size={20} color="#374151" />
              </Pressable>
            </View>
            <ScrollView className="px-6 py-4" showsVerticalScrollIndicator={false}>
              <View className="mb-4">
                <Text className="text-gray-900 text-lg font-semibold mb-2">Getting Started</Text>
                <Text className="text-gray-700 text-base mb-4">
                  Muhafiz helps you stay safe during emergencies. Use the SOS button to send emergency alerts, report incidents, and connect with volunteers.
                </Text>
              </View>
              <View className="mb-4">
                <Text className="text-gray-900 text-lg font-semibold mb-2">Emergency Features</Text>
                <Text className="text-gray-700 text-base mb-2">
                  • <Text className="font-semibold">Panic Mode:</Text> Shake your device or use the SOS button to activate emergency mode
                </Text>
                <Text className="text-gray-700 text-base mb-2">
                  • <Text className="font-semibold">Report Incidents:</Text> Submit reports with photos, location, and details
                </Text>
                <Text className="text-gray-700 text-base mb-2">
                  • <Text className="font-semibold">Crowd Map:</Text> View real-time incident reports from your community
                </Text>
                <Text className="text-gray-700 text-base mb-4">
                  • <Text className="font-semibold">Volunteer:</Text> Help others by accepting rescue tasks
                </Text>
              </View>
              <View className="mb-4">
                <Text className="text-gray-900 text-lg font-semibold mb-2">Need More Help?</Text>
                <Text className="text-gray-700 text-base">
                  Contact our support team at support@muhafiz.app or visit our website for detailed guides and tutorials.
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal
        visible={showPrivacyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPrivacyModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl max-h-[90%]">
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
              <Text className="text-gray-900 text-2xl font-bold">Privacy Policy</Text>
              <Pressable
                onPress={() => setShowPrivacyModal(false)}
                className="bg-gray-100 rounded-full p-2"
                style={{ minHeight: 44, minWidth: 44 }}
              >
                <X size={20} color="#374151" />
              </Pressable>
            </View>
            <ScrollView className="px-6 py-4" showsVerticalScrollIndicator={false}>
              <Text className="text-gray-500 text-sm mb-4">Last updated: January 2024</Text>
              <View className="mb-4">
                <Text className="text-gray-900 text-lg font-semibold mb-2">Data Collection</Text>
                <Text className="text-gray-700 text-base mb-4">
                  Muhafiz collects location data, incident reports, and usage information to provide emergency services. All data is encrypted and stored securely.
                </Text>
              </View>
              <View className="mb-4">
                <Text className="text-gray-900 text-lg font-semibold mb-2">Data Usage</Text>
                <Text className="text-gray-700 text-base mb-4">
                  Your data is used solely for emergency response purposes, improving services, and connecting you with volunteers and emergency services.
                </Text>
              </View>
              <View className="mb-4">
                <Text className="text-gray-900 text-lg font-semibold mb-2">Your Rights</Text>
                <Text className="text-gray-700 text-base mb-4">
                  You have the right to access, modify, or delete your personal data at any time through the app settings or by contacting us.
                </Text>
              </View>
              <View className="mb-4">
                <Text className="text-gray-900 text-lg font-semibold mb-2">Contact</Text>
                <Text className="text-gray-700 text-base">
                  For privacy concerns, contact us at privacy@muhafiz.app
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Terms of Service Modal */}
      <Modal
        visible={showTermsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTermsModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl max-h-[90%]">
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
              <Text className="text-gray-900 text-2xl font-bold">Terms of Service</Text>
              <Pressable
                onPress={() => setShowTermsModal(false)}
                className="bg-gray-100 rounded-full p-2"
                style={{ minHeight: 44, minWidth: 44 }}
              >
                <X size={20} color="#374151" />
              </Pressable>
            </View>
            <ScrollView className="px-6 py-4" showsVerticalScrollIndicator={false}>
              <Text className="text-gray-500 text-sm mb-4">Last updated: January 2024</Text>
              <View className="mb-4">
                <Text className="text-gray-900 text-lg font-semibold mb-2">Acceptance of Terms</Text>
                <Text className="text-gray-700 text-base mb-4">
                  By using Muhafiz, you agree to these terms and conditions. Please read them carefully.
                </Text>
              </View>
              <View className="mb-4">
                <Text className="text-gray-900 text-lg font-semibold mb-2">Use of Service</Text>
                <Text className="text-gray-700 text-base mb-4">
                  Muhafiz is provided for emergency response purposes. You agree to use the service responsibly and only report genuine emergencies.
                </Text>
              </View>
              <View className="mb-4">
                <Text className="text-gray-900 text-lg font-semibold mb-2">User Responsibilities</Text>
                <Text className="text-gray-700 text-base mb-4">
                  Users must provide accurate information, respect other users, and not misuse the emergency reporting system.
                </Text>
              </View>
              <View className="mb-4">
                <Text className="text-gray-900 text-lg font-semibold mb-2">Limitation of Liability</Text>
                <Text className="text-gray-700 text-base">
                  Muhafiz is provided &quot;as is&quot;. We are not liable for any damages resulting from use of the service.
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* About Modal */}
      <Modal
        visible={showAboutModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAboutModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl max-h-[90%]">
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
              <Text className="text-gray-900 text-2xl font-bold">About Muhafiz</Text>
              <Pressable
                onPress={() => setShowAboutModal(false)}
                className="bg-gray-100 rounded-full p-2"
                style={{ minHeight: 44, minWidth: 44 }}
              >
                <X size={20} color="#374151" />
              </Pressable>
            </View>
            <ScrollView className="px-6 py-4" showsVerticalScrollIndicator={false}>
              <View className="items-center mb-6">
                <View className="bg-blue-500 rounded-full w-24 h-24 items-center justify-center mb-4">
                  <Shield size={48} color="white" />
                </View>
                <Text className="text-gray-900 text-2xl font-bold mb-2">Muhafiz</Text>
                <Text className="text-gray-500 text-base">Version 1.0.0</Text>
              </View>
              <View className="mb-4">
                <Text className="text-gray-900 text-lg font-semibold mb-2">Our Mission</Text>
                <Text className="text-gray-700 text-base mb-4">
                  Muhafiz is an intelligent emergency response app designed to keep communities safe during disasters. We connect people in need with volunteers and emergency services.
                </Text>
              </View>
              <View className="mb-4">
                <Text className="text-gray-900 text-lg font-semibold mb-2">Features</Text>
                <Text className="text-gray-700 text-base mb-2">
                  • Real-time emergency reporting
                </Text>
                <Text className="text-gray-700 text-base mb-2">
                  • Crowd-sourced incident mapping
                </Text>
                <Text className="text-gray-700 text-base mb-2">
                  • Volunteer coordination
                </Text>
                <Text className="text-gray-700 text-base mb-2">
                  • Weather alerts and forecasts
                </Text>
                <Text className="text-gray-700 text-base mb-4">
                  • Disaster preparedness guides
                </Text>
              </View>
              <View className="mb-4">
                <Text className="text-gray-900 text-lg font-semibold mb-2">Contact</Text>
                <Text className="text-gray-700 text-base mb-2">
                  Email: info@muhafiz.app
                </Text>
                <Text className="text-gray-700 text-base mb-2">
                  Website: www.muhafiz.app
                </Text>
                <Text className="text-gray-700 text-base">
                  © 2024 Muhafiz. All rights reserved.
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* App Settings Modal */}
      <Modal
        visible={showSettingsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl max-h-[90%]">
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
              <Text className="text-gray-900 text-2xl font-bold">App Settings</Text>
              <Pressable
                onPress={() => setShowSettingsModal(false)}
                className="bg-gray-100 rounded-full p-2"
                style={{ minHeight: 44, minWidth: 44 }}
              >
                <X size={20} color="#374151" />
              </Pressable>
            </View>
            <ScrollView className="px-6 py-4" showsVerticalScrollIndicator={false}>
              <View className="mb-4">
                <Text className="text-gray-900 text-lg font-semibold mb-3">General</Text>
                
                <View className="bg-white rounded-xl p-4 flex-row items-center justify-between mb-3 border border-gray-200">
                  <View className="flex-row items-center gap-3 flex-1">
                    <Globe size={24} color="#3b82f6" />
                    <View className="flex-1">
                      <Text className="text-gray-900 text-base font-medium">Language</Text>
                      <Text className="text-gray-500 text-sm">
                        {language === 'en' ? 'English' : 'اردو (Urdu)'}
                      </Text>
                    </View>
                  </View>
                  <Pressable
                    onPress={handleLanguageToggle}
                    className="bg-blue-500 px-4 py-2 rounded-lg"
                  >
                    <Text className="text-white text-sm font-semibold">
                      {language === 'en' ? 'اردو' : 'EN'}
                    </Text>
                  </Pressable>
                </View>

                <View className="bg-white rounded-xl p-4 flex-row items-center justify-between mb-3 border border-gray-200">
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
                    onValueChange={async (value) => {
                      Haptics.selectionAsync();
                      setNotificationsEnabled(value);
                      if (value) {
                        // Request notification permissions
                        try {
                          await notificationService.requestPermissions();
                        } catch (error) {
                          console.error('Error requesting notification permissions:', error);
                        }
                      }
                    }}
                    trackColor={{ false: '#d1d5db', true: '#f59e0b' }}
                    thumbColor="#ffffff"
                  />
                </View>

                {/* Location Services */}
                <AnimatedPressable
                  onPress={async () => {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    // In a real app, this would open location settings
                    alert('Location services are required for emergency features. Please enable them in your device settings.');
                  }}
                  className="bg-white rounded-xl p-4 mb-3 border border-gray-200"
                  hapticFeedback={true}
                  hapticStyle={Haptics.ImpactFeedbackStyle.Light}
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
                    <MapPin size={24} color="#8b5cf6" />
                    <View className="flex-1">
                      <Text className="text-gray-900 text-base font-medium">Location Services</Text>
                      <Text className="text-gray-500 text-sm">
                        Required for emergency features
                      </Text>
                    </View>
                  </View>
                </AnimatedPressable>

                {/* Audio Quality */}
                <View className="bg-white rounded-xl p-4 mb-3 border border-gray-200"
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
                    <Volume2 size={24} color="#ef4444" />
                    <View className="flex-1">
                      <Text className="text-gray-900 text-base font-medium">Audio Quality</Text>
                      <Text className="text-gray-500 text-sm">
                        High (recommended for emergencies)
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-gray-900 text-lg font-semibold mb-3">Data & Storage</Text>
                
                <Pressable
                  onPress={handleDownloadOfflineData}
                  disabled={isDownloading}
                  className={`rounded-xl p-4 border border-gray-200 mb-3 ${isDownloading ? 'bg-gray-50' : 'bg-white'}`}
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
                  
                  {isDownloading && (
                    <View className="bg-gray-200 rounded-full h-2 overflow-hidden mb-2">
                      <Animated.View 
                        className="bg-green-500 h-full rounded-full"
                        style={progressStyle}
                      />
                    </View>
                  )}
                  
                  {isDownloading && (
                    <Text className="text-gray-500 text-sm">
                      {Math.round(downloadProgress)}% downloaded
                    </Text>
                  )}
                  
                  {!isDownloading && downloadProgress === 0 && (
                    <Text className="text-gray-500 text-sm">
                      Download guides, contacts, and emergency data for offline use
                    </Text>
                  )}
                </Pressable>
              </View>

              <View className="mb-4">
                <Text className="text-gray-900 text-lg font-semibold mb-3">Permissions</Text>
                <Text className="text-gray-700 text-base mb-2">
                  Muhafiz requires the following permissions:
                </Text>
                <Text className="text-gray-700 text-base mb-2">
                  • Location: For emergency reporting and navigation
                </Text>
                <Text className="text-gray-700 text-base mb-2">
                  • Camera: For incident photos
                </Text>
                <Text className="text-gray-700 text-base mb-2">
                  • Microphone: For voice recordings in panic mode
                </Text>
                <Text className="text-gray-700 text-base">
                  • Notifications: For emergency alerts
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Accessibility Settings Modal */}
      <Modal
        visible={showAccessibilityModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAccessibilityModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl max-h-[90%]">
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
              <Text className="text-gray-900 text-2xl font-bold">Accessibility</Text>
              <Pressable
                onPress={() => setShowAccessibilityModal(false)}
                className="bg-gray-100 rounded-full p-2"
                style={{ minHeight: 44, minWidth: 44 }}
              >
                <X size={20} color="#374151" />
              </Pressable>
            </View>
            <ScrollView className="px-6 py-4" showsVerticalScrollIndicator={false}>
              {/* Themes Section */}
              <View className="mb-6">
                <Text className="text-gray-900 text-lg font-semibold mb-3">Visual Themes</Text>
                <Text className="text-gray-600 text-sm mb-4">
                  Choose a theme that works best for your needs
                </Text>
                
                {[
                  { id: 'default' as AccessibilityTheme, label: 'Default', desc: 'Standard theme' },
                  { id: 'high_contrast_yellow_black' as AccessibilityTheme, label: 'High Contrast (Yellow/Black)', desc: 'For weak eyesight' },
                  { id: 'high_contrast_white_black' as AccessibilityTheme, label: 'High Contrast (White/Black)', desc: 'Maximum contrast' },
                  { id: 'low_cognitive_load' as AccessibilityTheme, label: 'Low Cognitive Load', desc: 'For elderly users' },
                  { id: 'color_blind_friendly' as AccessibilityTheme, label: 'Color Blind Friendly', desc: 'Accessible colors' },
                  { id: 'dark_mode' as AccessibilityTheme, label: 'Dark Mode', desc: 'Reduced eye strain' },
                ].map((theme) => (
                  <Pressable
                    key={theme.id}
                    onPress={async () => {
                      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      updateAccessibilitySettings({ theme: theme.id });
                      accessibilityService.updateSettings({ theme: theme.id });
                    }}
                    className={`rounded-xl p-4 mb-3 border-2 ${
                      accessibilitySettings.theme === theme.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <Text className={`text-base font-semibold mb-1 ${
                      accessibilitySettings.theme === theme.id ? 'text-purple-700' : 'text-gray-900'
                    }`}>
                      {theme.label}
                    </Text>
                    <Text className="text-gray-600 text-sm">{theme.desc}</Text>
                  </Pressable>
                ))}
              </View>

              {/* Text & Speech Section */}
              <View className="mb-6">
                <Text className="text-gray-900 text-lg font-semibold mb-3">Text & Speech</Text>
                
                <View className="bg-white rounded-xl p-4 flex-row items-center justify-between mb-3 border border-gray-200">
                  <View className="flex-row items-center gap-3 flex-1">
                    <Volume2 size={24} color="#3b82f6" />
                    <View className="flex-1">
                      <Text className="text-gray-900 text-base font-medium">Text-to-Speech</Text>
                      <Text className="text-gray-500 text-sm">
                        Read text aloud
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={accessibilitySettings.textToSpeech}
                    onValueChange={(value) => {
                      Haptics.selectionAsync();
                      updateAccessibilitySettings({ textToSpeech: value });
                      accessibilityService.updateSettings({ textToSpeech: value });
                    }}
                    trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
                    thumbColor="#ffffff"
                  />
                </View>

                <View className="bg-white rounded-xl p-4 flex-row items-center justify-between mb-3 border border-gray-200">
                  <View className="flex-row items-center gap-3 flex-1">
                    <Volume2 size={24} color="#10b981" />
                    <View className="flex-1">
                      <Text className="text-gray-900 text-base font-medium">Speak Aloud</Text>
                      <Text className="text-gray-500 text-sm">
                        Auto-read screen content
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={accessibilitySettings.speakAloud}
                    onValueChange={(value) => {
                      Haptics.selectionAsync();
                      updateAccessibilitySettings({ speakAloud: value });
                      accessibilityService.updateSettings({ speakAloud: value });
                    }}
                    trackColor={{ false: '#d1d5db', true: '#10b981' }}
                    thumbColor="#ffffff"
                  />
                </View>

                <View className="bg-white rounded-xl p-4 mb-3 border border-gray-200">
                  <Text className="text-gray-900 text-base font-medium mb-3">Font Size</Text>
                  <View className="flex-row gap-2">
                    {(['small', 'medium', 'large', 'extra_large'] as const).map((size) => (
                      <Pressable
                        key={size}
                        onPress={async () => {
                          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          updateAccessibilitySettings({ fontSize: size });
                          accessibilityService.updateSettings({ fontSize: size });
                        }}
                        className={`flex-1 py-3 rounded-lg border-2 ${
                          accessibilitySettings.fontSize === size
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <Text className={`text-center font-semibold ${
                          accessibilitySettings.fontSize === size ? 'text-purple-700' : 'text-gray-700'
                        }`}>
                          {size === 'small' ? 'S' : size === 'medium' ? 'M' : size === 'large' ? 'L' : 'XL'}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </View>

              {/* Haptic Feedback Section */}
              <View className="mb-6">
                <Text className="text-gray-900 text-lg font-semibold mb-3">Haptic Feedback</Text>
                
                <View className="bg-white rounded-xl p-4 flex-row items-center justify-between mb-3 border border-gray-200">
                  <View className="flex-row items-center gap-3 flex-1">
                    <Zap size={24} color="#f59e0b" />
                    <View className="flex-1">
                      <Text className="text-gray-900 text-base font-medium">Haptic Feedback</Text>
                      <Text className="text-gray-500 text-sm">
                        Vibration on interactions
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={accessibilitySettings.hapticFeedback}
                    onValueChange={(value) => {
                      Haptics.selectionAsync();
                      updateAccessibilitySettings({ hapticFeedback: value });
                      accessibilityService.updateSettings({ hapticFeedback: value });
                    }}
                    trackColor={{ false: '#d1d5db', true: '#f59e0b' }}
                    thumbColor="#ffffff"
                  />
                </View>

                {accessibilitySettings.hapticFeedback && (
                  <View className="bg-white rounded-xl p-4 mb-3 border border-gray-200">
                    <Text className="text-gray-900 text-base font-medium mb-3">Haptic Intensity</Text>
                    <View className="flex-row gap-2">
                      {(['light', 'medium', 'heavy'] as const).map((intensity) => (
                        <Pressable
                          key={intensity}
                          onPress={async () => {
                            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            updateAccessibilitySettings({ hapticIntensity: intensity });
                            accessibilityService.updateSettings({ hapticIntensity: intensity });
                            await accessibilityService.triggerHaptic(intensity);
                          }}
                          className={`flex-1 py-3 rounded-lg border-2 ${
                            accessibilitySettings.hapticIntensity === intensity
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 bg-white'
                          }`}
                        >
                          <Text className={`text-center font-semibold capitalize ${
                            accessibilitySettings.hapticIntensity === intensity ? 'text-purple-700' : 'text-gray-700'
                          }`}>
                            {intensity}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                )}
              </View>

              {/* Visual & Cognitive Section */}
              <View className="mb-6">
                <Text className="text-gray-900 text-lg font-semibold mb-3">Visual & Cognitive</Text>
                
                <View className="bg-white rounded-xl p-4 flex-row items-center justify-between mb-3 border border-gray-200">
                  <View className="flex-row items-center gap-3 flex-1">
                    <Eye size={24} color="#ef4444" />
                    <View className="flex-1">
                      <Text className="text-gray-900 text-base font-medium">High Contrast</Text>
                      <Text className="text-gray-500 text-sm">
                        Enhanced visibility
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={accessibilitySettings.highContrast}
                    onValueChange={(value) => {
                      Haptics.selectionAsync();
                      updateAccessibilitySettings({ highContrast: value });
                      accessibilityService.updateSettings({ highContrast: value });
                    }}
                    trackColor={{ false: '#d1d5db', true: '#ef4444' }}
                    thumbColor="#ffffff"
                  />
                </View>

                <View className="bg-white rounded-xl p-4 flex-row items-center justify-between mb-3 border border-gray-200">
                  <View className="flex-row items-center gap-3 flex-1">
                    <Eye size={24} color="#8b5cf6" />
                    <View className="flex-1">
                      <Text className="text-gray-900 text-base font-medium">Simplified UI</Text>
                      <Text className="text-gray-500 text-sm">
                        Reduce cognitive load
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={accessibilitySettings.simplifiedUI}
                    onValueChange={(value) => {
                      Haptics.selectionAsync();
                      updateAccessibilitySettings({ simplifiedUI: value });
                      accessibilityService.updateSettings({ simplifiedUI: value });
                    }}
                    trackColor={{ false: '#d1d5db', true: '#8b5cf6' }}
                    thumbColor="#ffffff"
                  />
                </View>

                <View className="bg-white rounded-xl p-4 flex-row items-center justify-between mb-3 border border-gray-200">
                  <View className="flex-row items-center gap-3 flex-1">
                    <Eye size={24} color="#10b981" />
                    <View className="flex-1">
                      <Text className="text-gray-900 text-base font-medium">Visual Indicators</Text>
                      <Text className="text-gray-500 text-sm">
                        Show visual cues
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={accessibilitySettings.visualIndicators}
                    onValueChange={(value) => {
                      Haptics.selectionAsync();
                      updateAccessibilitySettings({ visualIndicators: value });
                      accessibilityService.updateSettings({ visualIndicators: value });
                    }}
                    trackColor={{ false: '#d1d5db', true: '#10b981' }}
                    thumbColor="#ffffff"
                  />
                </View>

                <View className="bg-white rounded-xl p-4 flex-row items-center justify-between mb-3 border border-gray-200">
                  <View className="flex-row items-center gap-3 flex-1">
                    <Zap size={24} color="#6b7280" />
                    <View className="flex-1">
                      <Text className="text-gray-900 text-base font-medium">Reduce Motion</Text>
                      <Text className="text-gray-500 text-sm">
                        Minimize animations
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={accessibilitySettings.reduceMotion}
                    onValueChange={(value) => {
                      Haptics.selectionAsync();
                      updateAccessibilitySettings({ reduceMotion: value });
                      accessibilityService.updateSettings({ reduceMotion: value });
                    }}
                    trackColor={{ false: '#d1d5db', true: '#6b7280' }}
                    thumbColor="#ffffff"
                  />
                </View>
              </View>

              {/* Hearing Section */}
              <View className="mb-6">
                <Text className="text-gray-900 text-lg font-semibold mb-3">Hearing</Text>
                
                <View className="bg-white rounded-xl p-4 flex-row items-center justify-between mb-3 border border-gray-200">
                  <View className="flex-row items-center gap-3 flex-1">
                    <Volume2 size={24} color="#3b82f6" />
                    <View className="flex-1">
                      <Text className="text-gray-900 text-base font-medium">Hearing Aid Mode</Text>
                      <Text className="text-gray-500 text-sm">
                        Enhanced audio for hearing aids
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={accessibilitySettings.hearingAidMode}
                    onValueChange={(value) => {
                      Haptics.selectionAsync();
                      updateAccessibilitySettings({ hearingAidMode: value });
                      accessibilityService.updateSettings({ hearingAidMode: value });
                    }}
                    trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
                    thumbColor="#ffffff"
                  />
                </View>
              </View>

              {/* Screen Reader Section */}
              <View className="mb-6">
                <Text className="text-gray-900 text-lg font-semibold mb-3">Screen Reader</Text>
                
                <View className="bg-white rounded-xl p-4 flex-row items-center justify-between mb-3 border border-gray-200">
                  <View className="flex-row items-center gap-3 flex-1">
                    <Eye size={24} color="#8b5cf6" />
                    <View className="flex-1">
                      <Text className="text-gray-900 text-base font-medium">Screen Reader Support</Text>
                      <Text className="text-gray-500 text-sm">
                        Enable screen reader compatibility
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={accessibilitySettings.screenReader}
                    onValueChange={(value) => {
                      Haptics.selectionAsync();
                      updateAccessibilitySettings({ screenReader: value });
                      accessibilityService.updateSettings({ screenReader: value });
                    }}
                    trackColor={{ false: '#d1d5db', true: '#8b5cf6' }}
                    thumbColor="#ffffff"
                  />
                </View>
              </View>

              {/* Test Section */}
              <View className="mb-6">
                <Text className="text-gray-900 text-lg font-semibold mb-3">Test Features</Text>
                
                <AnimatedPressable
                  onPress={async () => {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    // Temporarily enable TTS for testing
                    const originalTTS = accessibilitySettings.textToSpeech;
                    const originalSpeakAloud = accessibilitySettings.speakAloud;
                    updateAccessibilitySettings({ textToSpeech: true, speakAloud: true });
                    accessibilityService.updateSettings({ textToSpeech: true, speakAloud: true });
                    
                    try {
                      await accessibilityService.speak('This is a test of text to speech functionality. If you can hear this, text to speech is working correctly.');
                    } catch (error) {
                      alert('Text-to-speech requires expo-speech. Install with: npx expo install expo-speech');
                    }
                    
                    // Restore original settings after a delay
                    setTimeout(() => {
                      updateAccessibilitySettings({ textToSpeech: originalTTS, speakAloud: originalSpeakAloud });
                      accessibilityService.updateSettings({ textToSpeech: originalTTS, speakAloud: originalSpeakAloud });
                    }, 2000);
                  }}
                  className="bg-blue-500 rounded-xl p-4 mb-3"
                  hapticFeedback={true}
                  hapticStyle={Haptics.ImpactFeedbackStyle.Medium}
                  style={{ minHeight: 60 }}
                >
                  <View className="flex-row items-center justify-center">
                    <Volume2 size={24} color="white" />
                    <Text className="text-white font-semibold ml-2">Test Text-to-Speech</Text>
                  </View>
                </AnimatedPressable>

                <Pressable
                  onPress={async () => {
                    await accessibilityService.triggerHaptic(accessibilitySettings.hapticIntensity);
                  }}
                  className="bg-purple-500 rounded-xl p-4"
                  style={{ minHeight: 60 }}
                >
                  <View className="flex-row items-center justify-center">
                    <Zap size={24} color="white" />
                    <Text className="text-white font-semibold ml-2">Test Haptic Feedback</Text>
                  </View>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}
