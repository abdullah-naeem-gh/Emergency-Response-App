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
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-4 pb-4 border-b border-gray-200">
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
              <ArrowLeft size={24} color="#374151" />
            </Pressable>
            <View className="flex-1">
              <Text className="text-4xl font-bold text-gray-900 mb-1">Profile</Text>
              <Text className="text-gray-600 text-sm">Your contribution stats</Text>
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
            <Settings size={24} color="#374151" />
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
          <View className="bg-white rounded-2xl p-6 border border-gray-200">
            <View className="flex-row items-center mb-4">
              <View className="w-20 h-20 rounded-full bg-blue-100 items-center justify-center mr-4">
                <User size={40} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="text-2xl font-bold text-gray-900">Anonymous User</Text>
                <Text className="text-gray-600 text-sm mt-1">Device ID: {Date.now().toString().slice(-8)}</Text>
                <View className="flex-row items-center mt-2">
                  <Award size={16} color="#F59E0B" />
                  <Text className="text-gray-700 font-semibold ml-2">{volunteerLevel}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Statistics Grid */}
        <View className="px-6 mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">Statistics</Text>
          <View className="flex-row flex-wrap justify-between gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <View
                  key={stat.id}
                  className="bg-white rounded-xl p-4 border border-gray-200"
                  style={{
                    width: (width - 72) / 2,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    elevation: 2,
                  }}
                >
                  <View
                    className="w-12 h-12 rounded-xl items-center justify-center mb-3"
                    style={{ backgroundColor: stat.bgColor }}
                  >
                    <Icon size={24} color={stat.color} />
                  </View>
                  <Text className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</Text>
                  <Text className="text-gray-600 text-sm">{stat.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Achievements Section */}
        <View className="px-6 mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">Achievements</Text>
          {achievements.map((achievement) => {
            const Icon = achievement.icon;
            return (
              <TouchableOpacity
                key={achievement.id}
                className="bg-white rounded-xl p-4 mb-3 flex-row items-center border border-gray-200"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2,
                  opacity: achievement.unlocked ? 1 : 0.5,
                }}
              >
                <View
                  className={`w-14 h-14 rounded-xl items-center justify-center mr-4 ${
                    achievement.unlocked ? '' : 'bg-gray-100'
                  }`}
                  style={{
                    backgroundColor: achievement.unlocked ? '#FEF3C7' : '#F3F4F6',
                  }}
                >
                  <Icon
                    size={28}
                    color={achievement.unlocked ? '#F59E0B' : '#9CA3AF'}
                  />
                </View>
                <View className="flex-1">
                  <Text
                    className={`text-base font-semibold ${
                      achievement.unlocked ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {achievement.title}
                  </Text>
                  <Text
                    className={`text-sm mt-1 ${
                      achievement.unlocked ? 'text-gray-600' : 'text-gray-400'
                    }`}
                  >
                    {achievement.description}
                  </Text>
                  {achievement.unlocked && achievement.unlockedDate && (
                    <Text className="text-xs text-gray-400 mt-1">
                      Unlocked {new Date(achievement.unlockedDate).toLocaleDateString()}
                    </Text>
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
          <Text className="text-xl font-bold text-gray-900 mb-4">Recent Activity</Text>
          <View className="bg-white rounded-2xl p-6 border border-gray-200">
            <View className="flex-row items-center mb-4 pb-4 border-b border-gray-200">
              <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center mr-3">
                <CheckCircle size={20} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900">Report Verified</Text>
                <Text className="text-gray-600 text-sm">Flood report in Karachi</Text>
                <Text className="text-gray-400 text-xs mt-1">2 days ago</Text>
              </View>
            </View>
            <View className="flex-row items-center mb-4 pb-4 border-b border-gray-200">
              <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
                <Heart size={20} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900">Task Completed</Text>
                <Text className="text-gray-600 text-sm">Volunteer task #12</Text>
                <Text className="text-gray-400 text-xs mt-1">5 days ago</Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-orange-100 items-center justify-center mr-3">
                <FileText size={20} color="#F59E0B" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900">Report Submitted</Text>
                <Text className="text-gray-600 text-sm">Medical emergency report</Text>
                <Text className="text-gray-400 text-xs mt-1">1 week ago</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

