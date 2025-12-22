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
    { id: 'reports', label: 'Report History', icon: History, route: '/(tabs)/reports', color: '#f59e0b' },
    { id: 'explore', label: 'Explore', icon: BookOpen, route: '/(tabs)/explore', color: '#ec4899' },
    { id: 'community', label: 'Community', icon: Users, route: '/(tabs)/community', color: '#ec4899' },
    { id: 'crowd-map', label: 'Crowd Map', icon: MapPin, route: '/(tabs)/crowd-map', color: '#10b981' },
    { id: 'news', label: 'News & Alerts', icon: Newspaper, route: '/(tabs)/news', color: '#ef4444' },
    { id: 'directory', label: 'Directory', icon: Phone, route: '/(tabs)/directory', color: '#8b5cf6' },
  ];

  const renderMenuItem = (item: MenuItem) => {
    const Icon = item.icon;
    const iconColor = item.color || themeColors.text;

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
        style={{
          backgroundColor: themeColors.card,
          borderRadius: 12,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
          borderWidth: 1,
          borderColor: themeColors.border,
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
          <ThemedText className="text-base flex-1 font-medium">{item.label}</ThemedText>
          {item.badge && (
            <View style={{ backgroundColor: '#EF4444', borderRadius: 9999, paddingHorizontal: 8, paddingVertical: 4 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>{item.badge}</Text>
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
              style={{ backgroundColor: themeColors.background, borderRadius: 9999, padding: 8, minHeight: 44, minWidth: 44 }}
            >
              <X size={20} color={themeColors.text} />
            </Pressable>
          </View>

          <ScrollView style={{ backgroundColor: themeColors.card, paddingHorizontal: 24, paddingVertical: 16 }} showsVerticalScrollIndicator={false}>
            {/* Accessibility Section - Moved to top for visibility */}
            <View className="mb-6">
              <ThemedText className="text-lg font-semibold mb-3">Accessibility</ThemedText>
              
              <AnimatedPressable
                onPress={async () => {
                  setShowAccessibilityModal(true);
                }}
                style={{
                  backgroundColor: themeColors.primary + '20',
                  borderRadius: 12,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                  borderWidth: 2,
                  borderColor: themeColors.primary + '40',
                  minHeight: 60,
                  shadowColor: themeColors.primary,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 4,
                  elevation: 3,
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
                      backgroundColor: themeColors.primary,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Eye size={24} color="#ffffff" />
                  </View>
                  <View className="flex-1">
                    <ThemedText className="text-base font-semibold">Accessibility Settings</ThemedText>
                    <ThemedText className="text-sm" style={{ opacity: 0.7 }}>
                      Themes, text-to-speech, haptics & more
                    </ThemedText>
                  </View>
                </View>
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: themeColors.primary,
                  }}
                />
              </AnimatedPressable>
            </View>

            {/* Navigation Section */}
            <View className="mb-6">
              <ThemedText className="text-lg font-semibold mb-3">Navigation</ThemedText>
              {navigationItems.map(renderMenuItem)}
            </View>

            {/* Settings Section */}
            <View className="mb-6">
              <ThemedText className="text-lg font-semibold mb-3">Settings</ThemedText>
              
              {/* Language Toggle */}
              <AnimatedPressable
                onPress={handleLanguageToggle}
                style={{
                  backgroundColor: themeColors.card,
                  borderRadius: 12,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: themeColors.border,
                  minHeight: 60,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2,
                }}
                hapticFeedback={true}
                hapticStyle={Haptics.ImpactFeedbackStyle.Medium}
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <Globe size={24} color={themeColors.primary} />
                  <View className="flex-1">
                    <ThemedText className="text-base font-medium">Language</ThemedText>
                    <ThemedText className="text-sm" style={{ opacity: 0.7 }}>
                    {language === 'en' ? 'English' : 'اردو (Urdu)'}
                  </ThemedText>
                  </View>
                </View>
                <View style={{ backgroundColor: themeColors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>
                    {language === 'en' ? 'اردو' : 'EN'}
                  </Text>
                </View>
              </AnimatedPressable>

              {/* Notifications Toggle */}
              <View style={{
                  backgroundColor: themeColors.card,
                  borderRadius: 12,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: themeColors.border,
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
                    <ThemedText className="text-base font-medium">Notifications</ThemedText>
                    <ThemedText className="text-sm" style={{ opacity: 0.7 }}>
                      Emergency alerts & updates
                    </ThemedText>
                  </View>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={(value) => {
                    Haptics.selectionAsync();
                    setNotificationsEnabled(value);
                  }}
                  trackColor={{ false: themeColors.border, true: '#f59e0b' }}
                  thumbColor="#ffffff"
                />
              </View>

              {/* App Settings */}
              <AnimatedPressable
                onPress={async () => {
                  setShowSettingsModal(true);
                }}
                style={{
                  backgroundColor: themeColors.card,
                  borderRadius: 12,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: themeColors.border,
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
                  <Settings size={24} color={themeColors.text} style={{ opacity: 0.7 }} />
                  <ThemedText className="text-base font-medium">App Settings</ThemedText>
                </View>
              </AnimatedPressable>
            </View>

            {/* Offline Data Section */}
            <View className="mb-6">
              <ThemedText className="text-lg font-semibold mb-3">Offline Data</ThemedText>
              <AnimatedPressable
                onPress={handleDownloadOfflineData}
                disabled={isDownloading}
                style={{
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: themeColors.border,
                  backgroundColor: isDownloading ? themeColors.background : themeColors.card,
                  minHeight: 60,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2,
                }}
                hapticFeedback={true}
                hapticStyle={Haptics.ImpactFeedbackStyle.Medium}
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center gap-3">
                    <Download size={24} color="#10b981" />
                    <ThemedText className="text-base font-medium">
                      Download Offline Data
                    </ThemedText>
                  </View>
                  {isDownloading && (
                    <ActivityIndicator size="small" color="#10b981" />
                  )}
                </View>
                
                {/* Progress Bar */}
                {isDownloading && (
                  <View style={{ backgroundColor: themeColors.border, borderRadius: 9999, height: 8, overflow: 'hidden' }}>
                    <Animated.View 
                      style={[
                        { backgroundColor: '#22C55E', height: '100%', borderRadius: 9999 },
                        progressStyle
                      ]}
                    />
                  </View>
                )}
                
                {isDownloading && (
                  <ThemedText className="text-sm mt-2" style={{ opacity: 0.7 }}>
                    {Math.round(downloadProgress)}% downloaded
                  </ThemedText>
                )}
                
                {!isDownloading && downloadProgress === 0 && (
                  <ThemedText className="text-sm mt-2" style={{ opacity: 0.7 }}>
                    Download guides, contacts, and emergency data for offline use
                  </ThemedText>
                )}
              </AnimatedPressable>
            </View>

            {/* Help & Support Section */}
            <View className="mb-6">
              <ThemedText className="text-lg font-semibold mb-3">Help & Support</ThemedText>
              
              <AnimatedPressable
                onPress={async () => {
                  setShowHelpModal(true);
                }}
                style={{
                  backgroundColor: themeColors.card,
                  borderRadius: 12,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: themeColors.border,
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
                  <HelpCircle size={24} color={themeColors.primary} />
                  <ThemedText className="text-base font-medium">Help Center</ThemedText>
                </View>
              </AnimatedPressable>

              <AnimatedPressable
                onPress={async () => {
                  setShowPrivacyModal(true);
                }}
                style={{
                  backgroundColor: themeColors.card,
                  borderRadius: 12,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: themeColors.border,
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
                  <ThemedText className="text-base font-medium">Privacy Policy</ThemedText>
                </View>
              </AnimatedPressable>

              <AnimatedPressable
                onPress={async () => {
                  setShowTermsModal(true);
                }}
                style={{
                  backgroundColor: themeColors.card,
                  borderRadius: 12,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: themeColors.border,
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
                  <FileText size={24} color={themeColors.text} style={{ opacity: 0.7 }} />
                  <ThemedText className="text-base font-medium">Terms of Service</ThemedText>
                </View>
              </AnimatedPressable>

              <AnimatedPressable
                onPress={async () => {
                  setShowAboutModal(true);
                }}
                style={{
                  backgroundColor: themeColors.card,
                  borderRadius: 12,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: themeColors.border,
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
                  <Info size={24} color={themeColors.text} style={{ opacity: 0.7 }} />
                  <ThemedText className="text-base font-medium">About Muhafiz</ThemedText>
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
          <View style={{ backgroundColor: themeColors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: themeColors.border }}>
              <ThemedText className="text-2xl font-bold">Help Center</ThemedText>
              <Pressable
                onPress={() => setShowHelpModal(false)}
                style={{ backgroundColor: themeColors.background, borderRadius: 9999, padding: 8, minHeight: 44, minWidth: 44 }}
              >
                <X size={20} color={themeColors.text} />
              </Pressable>
            </View>
            <ScrollView style={{ paddingHorizontal: 24, paddingVertical: 16 }} showsVerticalScrollIndicator={false}>
              <View className="mb-4">
                <ThemedText className="text-lg font-semibold mb-2">Getting Started</ThemedText>
                <ThemedText className="text-base mb-4" style={{ opacity: 0.8 }}>
                  Muhafiz helps you stay safe during emergencies. Use the SOS button to send emergency alerts, report incidents, and connect with volunteers.
                </ThemedText>
              </View>
              <View className="mb-4">
                <ThemedText className="text-lg font-semibold mb-2">Emergency Features</ThemedText>
                <ThemedText className="text-base mb-2" style={{ opacity: 0.8 }}>
                  • <ThemedText className="font-semibold">Panic Mode:</ThemedText> Shake your device or use the SOS button to activate emergency mode
                </ThemedText>
                <ThemedText className="text-base mb-2" style={{ opacity: 0.8 }}>
                  • <ThemedText className="font-semibold">Report Incidents:</ThemedText> Submit reports with photos, location, and details
                </ThemedText>
                <ThemedText className="text-base mb-2" style={{ opacity: 0.8 }}>
                  • <ThemedText className="font-semibold">Crowd Map:</ThemedText> View real-time incident reports from your community
                </ThemedText>
                <ThemedText className="text-base mb-4" style={{ opacity: 0.8 }}>
                  • <ThemedText className="font-semibold">Volunteer:</ThemedText> Help others by accepting rescue tasks
                </ThemedText>
              </View>
              <View className="mb-4">
                <ThemedText className="text-lg font-semibold mb-2">Need More Help?</ThemedText>
                <ThemedText className="text-base" style={{ opacity: 0.8 }}>
                  Contact our support team at support@muhafiz.app or visit our website for detailed guides and tutorials.
                </ThemedText>
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
          <View style={{ backgroundColor: themeColors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: themeColors.border }}>
              <ThemedText className="text-2xl font-bold">Privacy Policy</ThemedText>
              <Pressable
                onPress={() => setShowPrivacyModal(false)}
                style={{ backgroundColor: themeColors.background, borderRadius: 9999, padding: 8, minHeight: 44, minWidth: 44 }}
              >
                <X size={20} color={themeColors.text} />
              </Pressable>
            </View>
            <ScrollView style={{ paddingHorizontal: 24, paddingVertical: 16 }} showsVerticalScrollIndicator={false}>
              <ThemedText className="text-sm mb-4" style={{ opacity: 0.6 }}>Last updated: January 2024</ThemedText>
              <View className="mb-4">
                <ThemedText className="text-lg font-semibold mb-2">Data Collection</ThemedText>
                <ThemedText className="text-base mb-4" style={{ opacity: 0.8 }}>
                  Muhafiz collects location data, incident reports, and usage information to provide emergency services. All data is encrypted and stored securely.
                </ThemedText>
              </View>
              <View className="mb-4">
                <ThemedText className="text-lg font-semibold mb-2">Data Usage</ThemedText>
                <ThemedText className="text-base mb-4" style={{ opacity: 0.8 }}>
                  Your data is used solely for emergency response purposes, improving services, and connecting you with volunteers and emergency services.
                </ThemedText>
              </View>
              <View className="mb-4">
                <ThemedText className="text-lg font-semibold mb-2">Your Rights</ThemedText>
                <ThemedText className="text-base mb-4" style={{ opacity: 0.8 }}>
                  You have the right to access, modify, or delete your personal data at any time through the app settings or by contacting us.
                </ThemedText>
              </View>
              <View className="mb-4">
                <ThemedText className="text-lg font-semibold mb-2">Contact</ThemedText>
                <ThemedText className="text-base" style={{ opacity: 0.8 }}>
                  For privacy concerns, contact us at privacy@muhafiz.app
                </ThemedText>
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
          <View style={{ backgroundColor: themeColors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: themeColors.border }}>
              <ThemedText className="text-2xl font-bold">Terms of Service</ThemedText>
              <Pressable
                onPress={() => setShowTermsModal(false)}
                style={{ backgroundColor: themeColors.background, borderRadius: 9999, padding: 8, minHeight: 44, minWidth: 44 }}
              >
                <X size={20} color={themeColors.text} />
              </Pressable>
            </View>
            <ScrollView style={{ paddingHorizontal: 24, paddingVertical: 16 }} showsVerticalScrollIndicator={false}>
              <ThemedText className="text-sm mb-4" style={{ opacity: 0.6 }}>Last updated: January 2024</ThemedText>
              <View className="mb-4">
                <ThemedText className="text-lg font-semibold mb-2">Acceptance of Terms</ThemedText>
                <ThemedText className="text-base mb-4" style={{ opacity: 0.8 }}>
                  By using Muhafiz, you agree to these terms and conditions. Please read them carefully.
                </ThemedText>
              </View>
              <View className="mb-4">
                <ThemedText className="text-lg font-semibold mb-2">Use of Service</ThemedText>
                <ThemedText className="text-base mb-4" style={{ opacity: 0.8 }}>
                  Muhafiz is provided for emergency response purposes. You agree to use the service responsibly and only report genuine emergencies.
                </ThemedText>
              </View>
              <View className="mb-4">
                <ThemedText className="text-lg font-semibold mb-2">User Responsibilities</ThemedText>
                <ThemedText className="text-base mb-4" style={{ opacity: 0.8 }}>
                  Users must provide accurate information, respect other users, and not misuse the emergency reporting system.
                </ThemedText>
              </View>
              <View className="mb-4">
                <ThemedText className="text-lg font-semibold mb-2">Limitation of Liability</ThemedText>
                <ThemedText className="text-base" style={{ opacity: 0.8 }}>
                  Muhafiz is provided &quot;as is&quot;. We are not liable for any damages resulting from use of the service.
                </ThemedText>
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
          <View style={{ backgroundColor: themeColors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: themeColors.border }}>
              <ThemedText className="text-2xl font-bold">About Muhafiz</ThemedText>
              <Pressable
                onPress={() => setShowAboutModal(false)}
                style={{ backgroundColor: themeColors.background, borderRadius: 9999, padding: 8, minHeight: 44, minWidth: 44 }}
              >
                <X size={20} color={themeColors.text} />
              </Pressable>
            </View>
            <ScrollView style={{ paddingHorizontal: 24, paddingVertical: 16 }} showsVerticalScrollIndicator={false}>
              <View className="items-center mb-6">
                <View style={{ backgroundColor: themeColors.primary, borderRadius: 9999, width: 96, height: 96, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Shield size={48} color="white" />
                </View>
                <ThemedText className="text-2xl font-bold mb-2">Muhafiz</ThemedText>
                <ThemedText className="text-base" style={{ opacity: 0.6 }}>Version 1.0.0</ThemedText>
              </View>
              <View className="mb-4">
                <ThemedText className="text-lg font-semibold mb-2">Our Mission</ThemedText>
                <ThemedText className="text-base mb-4" style={{ opacity: 0.8 }}>
                  Muhafiz is an intelligent emergency response app designed to keep communities safe during disasters. We connect people in need with volunteers and emergency services.
                </ThemedText>
              </View>
              <View className="mb-4">
                <ThemedText className="text-lg font-semibold mb-2">Features</ThemedText>
                <ThemedText className="text-base mb-2" style={{ opacity: 0.8 }}>
                  • Real-time emergency reporting
                </ThemedText>
                <ThemedText className="text-base mb-2" style={{ opacity: 0.8 }}>
                  • Crowd-sourced incident mapping
                </ThemedText>
                <ThemedText className="text-base mb-2" style={{ opacity: 0.8 }}>
                  • Volunteer coordination
                </ThemedText>
              </View>
              <View className="mb-4">
                <ThemedText className="text-lg font-semibold mb-2">Contact</ThemedText>
                <ThemedText className="text-base mb-2" style={{ opacity: 0.8 }}>
                  Email: info@muhafiz.app
                </ThemedText>
                <ThemedText className="text-base mb-2" style={{ opacity: 0.8 }}>
                  Website: www.muhafiz.app
                </ThemedText>
                <ThemedText className="text-base" style={{ opacity: 0.8 }}>
                  © 2024 Muhafiz. All rights reserved.
                </ThemedText>
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
          <View style={{ backgroundColor: themeColors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: themeColors.border }}>
              <ThemedText className="text-2xl font-bold">App Settings</ThemedText>
              <Pressable
                onPress={() => setShowSettingsModal(false)}
                style={{ backgroundColor: themeColors.background, borderRadius: 9999, padding: 8, minHeight: 44, minWidth: 44 }}
              >
                <X size={20} color={themeColors.text} />
              </Pressable>
            </View>
            <ScrollView style={{ paddingHorizontal: 24, paddingVertical: 16 }} showsVerticalScrollIndicator={false}>
              <View className="mb-4">
                <ThemedText className="text-lg font-semibold mb-3">General</ThemedText>
                
                <View style={{ backgroundColor: themeColors.card, borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, borderWidth: 1, borderColor: themeColors.border }}>
                  <View className="flex-row items-center gap-3 flex-1">
                    <Globe size={24} color={themeColors.primary} />
                    <View className="flex-1">
                      <ThemedText className="text-base font-medium">Language</ThemedText>
                      <ThemedText className="text-sm" style={{ opacity: 0.7 }}>
                        {language === 'en' ? 'English' : 'اردو (Urdu)'}
                      </ThemedText>
                    </View>
                  </View>
                  <Pressable
                    onPress={handleLanguageToggle}
                    style={{ backgroundColor: themeColors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}
                  >
                    <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>
                      {language === 'en' ? 'اردو' : 'EN'}
                    </Text>
                  </Pressable>
                </View>

                <View style={{ backgroundColor: themeColors.card, borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, borderWidth: 1, borderColor: themeColors.border }}>
                  <View className="flex-row items-center gap-3 flex-1">
                    <Bell size={24} color="#f59e0b" />
                    <View className="flex-1">
                      <ThemedText className="text-base font-medium">Notifications</ThemedText>
                      <ThemedText className="text-sm" style={{ opacity: 0.7 }}>
                        Emergency alerts & updates
                      </ThemedText>
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
                    trackColor={{ false: themeColors.border, true: '#f59e0b' }}
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
                  style={{
                    backgroundColor: themeColors.card,
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: themeColors.border,
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
                    <MapPin size={24} color="#8b5cf6" />
                    <View className="flex-1">
                      <ThemedText className="text-base font-medium">Location Services</ThemedText>
                      <ThemedText className="text-sm" style={{ opacity: 0.7 }}>
                        Required for emergency features
                      </ThemedText>
                    </View>
                  </View>
                </AnimatedPressable>

                {/* Audio Quality */}
                <View style={{
                    backgroundColor: themeColors.card,
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: themeColors.border,
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
                      <ThemedText className="text-base font-medium">Audio Quality</ThemedText>
                      <ThemedText className="text-sm" style={{ opacity: 0.7 }}>
                        High (recommended for emergencies)
                      </ThemedText>
                    </View>
                  </View>
                </View>
              </View>

              <View className="mb-4">
                <ThemedText className="text-lg font-semibold mb-3">Data & Storage</ThemedText>
                
                <Pressable
                  onPress={handleDownloadOfflineData}
                  disabled={isDownloading}
                  style={{
                    borderRadius: 12,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: themeColors.border,
                    marginBottom: 12,
                    backgroundColor: isDownloading ? themeColors.background : themeColors.card,
                  }}
                >
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center gap-3">
                      <Download size={24} color="#10b981" />
                      <ThemedText className="text-base font-medium">
                        Download Offline Data
                      </ThemedText>
                    </View>
                    {isDownloading && (
                      <ActivityIndicator size="small" color="#10b981" />
                    )}
                  </View>
                  
                  {isDownloading && (
                    <View style={{ backgroundColor: themeColors.border, borderRadius: 9999, height: 8, overflow: 'hidden', marginBottom: 8 }}>
                      <Animated.View 
                        style={[
                          { backgroundColor: '#22C55E', height: '100%', borderRadius: 9999 },
                          progressStyle
                        ]}
                      />
                    </View>
                  )}
                  
                  {isDownloading && (
                    <ThemedText className="text-sm" style={{ opacity: 0.7 }}>
                      {Math.round(downloadProgress)}% downloaded
                    </ThemedText>
                  )}
                  
                  {!isDownloading && downloadProgress === 0 && (
                    <ThemedText className="text-sm" style={{ opacity: 0.7 }}>
                      Download guides, contacts, and emergency data for offline use
                    </ThemedText>
                  )}
                </Pressable>
              </View>

              <View className="mb-4">
                <ThemedText className="text-lg font-semibold mb-3">Permissions</ThemedText>
                <ThemedText className="text-base mb-2" style={{ opacity: 0.8 }}>
                  Muhafiz requires the following permissions:
                </ThemedText>
                <ThemedText className="text-base mb-2" style={{ opacity: 0.8 }}>
                  • Location: For emergency reporting and navigation
                </ThemedText>
                <ThemedText className="text-base mb-2" style={{ opacity: 0.8 }}>
                  • Camera: For incident photos
                </ThemedText>
                <ThemedText className="text-base mb-2" style={{ opacity: 0.8 }}>
                  • Microphone: For voice recordings in panic mode
                </ThemedText>
                <ThemedText className="text-base" style={{ opacity: 0.8 }}>
                  • Notifications: For emergency alerts
                </ThemedText>
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
          <View style={{ backgroundColor: themeColors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: themeColors.border }}>
              <ThemedText className="text-2xl font-bold">Accessibility</ThemedText>
              <Pressable
                onPress={() => setShowAccessibilityModal(false)}
                style={{ backgroundColor: themeColors.background, borderRadius: 9999, padding: 8, minHeight: 44, minWidth: 44 }}
              >
                <X size={20} color={themeColors.text} />
              </Pressable>
            </View>
            <ScrollView style={{ paddingHorizontal: 24, paddingVertical: 16 }} showsVerticalScrollIndicator={false}>
              {/* Themes Section */}
              <View className="mb-6">
                <ThemedText className="text-lg font-semibold mb-3">Visual Themes</ThemedText>
                <ThemedText className="text-sm mb-4" style={{ opacity: 0.7 }}>
                  Choose a theme that works best for your needs
                </ThemedText>
                
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
                    style={{
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 12,
                      borderWidth: 2,
                      backgroundColor: accessibilitySettings.theme === theme.id ? themeColors.primary + '20' : themeColors.card,
                      borderColor: accessibilitySettings.theme === theme.id ? themeColors.primary : themeColors.border,
                    }}
                  >
                    <ThemedText className="text-base font-semibold mb-1" style={{ color: accessibilitySettings.theme === theme.id ? themeColors.primary : themeColors.text }}>
                      {theme.label}
                    </ThemedText>
                    <ThemedText className="text-sm" style={{ opacity: 0.7 }}>{theme.desc}</ThemedText>
                  </Pressable>
                ))}
              </View>

              {/* Text & Speech Section */}
              <View className="mb-6">
                <ThemedText className="text-lg font-semibold mb-3">Text & Speech</ThemedText>
                
                <View style={{ backgroundColor: themeColors.card, borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, borderWidth: 1, borderColor: themeColors.border }}>
                  <View className="flex-row items-center gap-3 flex-1">
                    <Volume2 size={24} color={themeColors.primary} />
                    <View className="flex-1">
                      <ThemedText className="text-base font-medium">Text-to-Speech</ThemedText>
                      <ThemedText className="text-sm" style={{ opacity: 0.7 }}>
                        Read text aloud
                      </ThemedText>
                    </View>
                  </View>
                  <Switch
                    value={accessibilitySettings.textToSpeech}
                    onValueChange={(value) => {
                      Haptics.selectionAsync();
                      updateAccessibilitySettings({ textToSpeech: value });
                      accessibilityService.updateSettings({ textToSpeech: value });
                    }}
                    trackColor={{ false: themeColors.border, true: themeColors.primary }}
                    thumbColor="#ffffff"
                  />
                </View>

                <View style={{ backgroundColor: themeColors.card, borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, borderWidth: 1, borderColor: themeColors.border }}>
                  <View className="flex-row items-center gap-3 flex-1">
                    <Volume2 size={24} color="#10b981" />
                    <View className="flex-1">
                      <ThemedText className="text-base font-medium">Speak Aloud</ThemedText>
                      <ThemedText className="text-sm" style={{ opacity: 0.7 }}>
                        Auto-read screen content
                      </ThemedText>
                    </View>
                  </View>
                  <Switch
                    value={accessibilitySettings.speakAloud}
                    onValueChange={(value) => {
                      Haptics.selectionAsync();
                      updateAccessibilitySettings({ speakAloud: value });
                      accessibilityService.updateSettings({ speakAloud: value });
                    }}
                    trackColor={{ false: themeColors.border, true: '#10b981' }}
                    thumbColor="#ffffff"
                  />
                </View>

                <View style={{ backgroundColor: themeColors.card, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: themeColors.border }}>
                  <ThemedText className="text-base font-medium mb-3">Font Size</ThemedText>
                  <View className="flex-row gap-2">
                    {(['small', 'medium', 'large', 'extra_large'] as const).map((size) => (
                      <Pressable
                        key={size}
                        onPress={async () => {
                          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          updateAccessibilitySettings({ fontSize: size });
                          accessibilityService.updateSettings({ fontSize: size });
                        }}
                        style={{
                          flex: 1,
                          paddingVertical: 12,
                          borderRadius: 8,
                          borderWidth: 2,
                          backgroundColor: accessibilitySettings.fontSize === size ? themeColors.primary + '20' : themeColors.card,
                          borderColor: accessibilitySettings.fontSize === size ? themeColors.primary : themeColors.border,
                        }}
                      >
                        <ThemedText className="text-center font-semibold" style={{ color: accessibilitySettings.fontSize === size ? themeColors.primary : themeColors.text }}>
                          {size === 'small' ? 'S' : size === 'medium' ? 'M' : size === 'large' ? 'L' : 'XL'}
                        </ThemedText>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </View>

              {/* Haptic Feedback Section */}
              <View className="mb-6">
                <ThemedText className="text-lg font-semibold mb-3">Haptic Feedback</ThemedText>
                
                <View style={{ backgroundColor: themeColors.card, borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, borderWidth: 1, borderColor: themeColors.border }}>
                  <View className="flex-row items-center gap-3 flex-1">
                    <Zap size={24} color="#f59e0b" />
                    <View className="flex-1">
                      <ThemedText className="text-base font-medium">Haptic Feedback</ThemedText>
                      <ThemedText className="text-sm" style={{ opacity: 0.7 }}>
                        Vibration on interactions
                      </ThemedText>
                    </View>
                  </View>
                  <Switch
                    value={accessibilitySettings.hapticFeedback}
                    onValueChange={(value) => {
                      Haptics.selectionAsync();
                      updateAccessibilitySettings({ hapticFeedback: value });
                      accessibilityService.updateSettings({ hapticFeedback: value });
                    }}
                    trackColor={{ false: themeColors.border, true: '#f59e0b' }}
                    thumbColor="#ffffff"
                  />
                </View>

                {accessibilitySettings.hapticFeedback && (
                  <View style={{ backgroundColor: themeColors.card, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: themeColors.border }}>
                    <ThemedText className="text-base font-medium mb-3">Haptic Intensity</ThemedText>
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
                          style={{
                            flex: 1,
                            paddingVertical: 12,
                            borderRadius: 8,
                            borderWidth: 2,
                            backgroundColor: accessibilitySettings.hapticIntensity === intensity ? themeColors.primary + '20' : themeColors.card,
                            borderColor: accessibilitySettings.hapticIntensity === intensity ? themeColors.primary : themeColors.border,
                          }}
                        >
                          <ThemedText className="text-center font-semibold capitalize" style={{ color: accessibilitySettings.hapticIntensity === intensity ? themeColors.primary : themeColors.text }}>
                            {intensity}
                          </ThemedText>
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
