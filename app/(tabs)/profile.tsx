import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAccessibility } from '@/hooks/useAccessibility';
import { useAppStore } from '@/store/useAppStore';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Award,
  BarChart3,
  Calendar,
  CheckCircle,
  FileText,
  Heart,
  MapPin,
  Settings,
  TrendingUp,
  User
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Dimensions, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

interface StatCard {
  id: string;
  label: string;
  value: string | number;
  icon: React.ComponentType<{ size: number; color: string }>;
  color: string;
  bgColor: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  unlocked: boolean;
  unlockedDate?: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { themeColors } = useAccessibility();
  const { volunteerTasksDone, volunteerLevel } = useAppStore();
  const [stats, setStats] = useState<StatCard[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    loadStats();
    loadAchievements();
  }, [volunteerTasksDone, volunteerLevel]);

  const loadStats = () => {
    // In real implementation, fetch from service
    setStats([
      {
        id: 'reports',
        label: 'Reports Submitted',
        value: 12,
        icon: FileText,
        color: '#3B82F6',
        bgColor: '#DBEAFE',
      },
      {
        id: 'volunteer',
        label: 'Tasks Completed',
        value: volunteerTasksDone,
        icon: Heart,
        color: '#EF4444',
        bgColor: '#FEE2E2',
      },
      {
        id: 'verified',
        label: 'Verified Reports',
        value: 8,
        icon: CheckCircle,
        color: '#10B981',
        bgColor: '#D1FAE5',
      },
      {
        id: 'level',
        label: 'Volunteer Level',
        value: volunteerLevel,
        icon: Award,
        color: '#F59E0B',
        bgColor: '#FEF3C7',
      },
    ]);
  };

  const loadAchievements = () => {
    // In real implementation, fetch from service
    setAchievements([
      {
        id: '1',
        title: 'First Responder',
        description: 'Submit your first report',
        icon: FileText,
        unlocked: true,
        unlockedDate: '2024-01-15',
      },
      {
        id: '2',
        title: 'Community Helper',
        description: 'Complete 5 volunteer tasks',
        icon: Heart,
        unlocked: volunteerTasksDone >= 5,
        unlockedDate: volunteerTasksDone >= 5 ? '2024-01-20' : undefined,
      },
      {
        id: '3',
        title: 'Verified Contributor',
        description: 'Get 3 reports verified',
        icon: CheckCircle,
        unlocked: true,
        unlockedDate: '2024-01-18',
      },
      {
        id: '4',
        title: 'Hero Status',
        description: 'Complete 20 volunteer tasks',
        icon: Award,
        unlocked: volunteerTasksDone >= 20,
        unlockedDate: volunteerTasksDone >= 20 ? '2024-01-25' : undefined,
      },
      {
        id: '5',
        title: 'Legend',
        description: 'Complete 50 volunteer tasks',
        icon: TrendingUp,
        unlocked: volunteerTasksDone >= 50,
        unlockedDate: volunteerTasksDone >= 50 ? '2024-02-01' : undefined,
      },
    ]);
  };

  return (
    <ThemedView className="flex-1">
      {/* Header */}
      <View style={{ backgroundColor: themeColors.card, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: themeColors.border }}>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <Pressable
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.back();
              }}
              className="mr-3"
              style={{
                minHeight: 44,
                minWidth: 44,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ArrowLeft size={24} color={themeColors.text} />
            </Pressable>
            <View className="flex-1">
              <ThemedText className="text-4xl font-bold mb-1">Profile</ThemedText>
              <ThemedText className="text-sm" style={{ opacity: 0.7 }}>Your contribution stats</ThemedText>
            </View>
          </View>
          <Pressable
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              // Open settings
            }}
            style={{
              minHeight: 44,
              minWidth: 44,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Settings size={24} color={themeColors.text} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info Card */}
        <View className="px-6 mb-6">
          <View style={{ backgroundColor: themeColors.card, borderRadius: 16, padding: 24, borderWidth: 1, borderColor: themeColors.border }}>
            <View className="flex-row items-center mb-4">
              <View style={{ width: 80, height: 80, borderRadius: 9999, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                <User size={40} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <ThemedText className="text-2xl font-bold">Anonymous User</ThemedText>
                <ThemedText className="text-sm mt-1" style={{ opacity: 0.7 }}>Device ID: {Date.now().toString().slice(-8)}</ThemedText>
                <View className="flex-row items-center mt-2">
                  <Award size={16} color="#F59E0B" />
                  <ThemedText className="font-semibold ml-2">{volunteerLevel}</ThemedText>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Statistics Grid */}
        <View className="px-6 mb-6">
          <ThemedText className="text-xl font-bold mb-4">Statistics</ThemedText>
          <View className="flex-row flex-wrap justify-between gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <View
                  key={stat.id}
                  style={{
                    backgroundColor: themeColors.card,
                    borderRadius: 12,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: themeColors.border,
                    width: (width - 72) / 2,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    elevation: 2,
                  }}
                >
                  <View
                    style={{ width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12, backgroundColor: stat.bgColor }}
                  >
                    <Icon size={24} color={stat.color} />
                  </View>
                  <ThemedText className="text-2xl font-bold mb-1">{stat.value}</ThemedText>
                  <ThemedText className="text-sm" style={{ opacity: 0.7 }}>{stat.label}</ThemedText>
                </View>
              );
            })}
          </View>
        </View>

        {/* Achievements Section */}
        <View className="px-6 mb-6">
          <ThemedText className="text-xl font-bold mb-4">Achievements</ThemedText>
          {achievements.map((achievement) => {
            const Icon = achievement.icon;
            return (
              <TouchableOpacity
                key={achievement.id}
                style={{
                  backgroundColor: themeColors.card,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: themeColors.border,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2,
                  opacity: achievement.unlocked ? 1 : 0.5,
                }}
              >
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 16,
                    backgroundColor: achievement.unlocked ? '#FEF3C7' : themeColors.background,
                  }}
                >
                  <Icon
                    size={28}
                    color={achievement.unlocked ? '#F59E0B' : themeColors.text}
                    style={{ opacity: achievement.unlocked ? 1 : 0.5 }}
                  />
                </View>
                <View className="flex-1">
                  <ThemedText
                    className="text-base font-semibold"
                    style={{ opacity: achievement.unlocked ? 1 : 0.6 }}
                  >
                    {achievement.title}
                  </ThemedText>
                  <ThemedText
                    className="text-sm mt-1"
                    style={{ opacity: achievement.unlocked ? 0.7 : 0.5 }}
                  >
                    {achievement.description}
                  </ThemedText>
                  {achievement.unlocked && achievement.unlockedDate && (
                    <ThemedText className="text-xs mt-1" style={{ opacity: 0.6 }}>
                      Unlocked {new Date(achievement.unlockedDate).toLocaleDateString()}
                    </ThemedText>
                  )}
                </View>
                {achievement.unlocked && (
                  <CheckCircle size={24} color="#10B981" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Contribution Timeline */}
        <View className="px-6 mb-6">
          <ThemedText className="text-xl font-bold mb-4">Recent Activity</ThemedText>
          <View style={{ backgroundColor: themeColors.card, borderRadius: 16, padding: 24, borderWidth: 1, borderColor: themeColors.border }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: themeColors.border }}>
              <View style={{ width: 40, height: 40, borderRadius: 9999, backgroundColor: '#D1FAE5', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <CheckCircle size={20} color="#10B981" />
              </View>
              <View className="flex-1">
                <ThemedText className="text-base font-semibold">Report Verified</ThemedText>
                <ThemedText className="text-sm" style={{ opacity: 0.7 }}>Flood report in Karachi</ThemedText>
                <ThemedText className="text-xs mt-1" style={{ opacity: 0.6 }}>2 days ago</ThemedText>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: themeColors.border }}>
              <View style={{ width: 40, height: 40, borderRadius: 9999, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Heart size={20} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <ThemedText className="text-base font-semibold">Task Completed</ThemedText>
                <ThemedText className="text-sm" style={{ opacity: 0.7 }}>Volunteer task #12</ThemedText>
                <ThemedText className="text-xs mt-1" style={{ opacity: 0.6 }}>5 days ago</ThemedText>
              </View>
            </View>
            <View className="flex-row items-center">
              <View style={{ width: 40, height: 40, borderRadius: 9999, backgroundColor: '#FED7AA', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <FileText size={20} color="#F59E0B" />
              </View>
              <View className="flex-1">
                <ThemedText className="text-base font-semibold">Report Submitted</ThemedText>
                <ThemedText className="text-sm" style={{ opacity: 0.7 }}>Medical emergency report</ThemedText>
                <ThemedText className="text-xs mt-1" style={{ opacity: 0.6 }}>1 week ago</ThemedText>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

