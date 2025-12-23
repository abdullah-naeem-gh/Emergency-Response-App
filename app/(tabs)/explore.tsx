import { useTranslation } from '@/hooks/useTranslation';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { ArrowLeft, BookOpen, Heart, Newspaper, TrendingUp, Video } from 'lucide-react-native';
import React from 'react';
import { Dimensions, Pressable, ScrollView, Text, View } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 48;

interface ContentCard {
  id: string;
  title: string;
  description: string;
  category: 'article' | 'video' | 'story' | 'guide';
  image?: string;
  readTime?: string;
  date?: string;
}

const FEATURED_CONTENT: ContentCard[] = [
  {
    id: '1',
    title: 'Flood Safety: What to Do Before, During, and After',
    description: 'Essential guide to staying safe during flood emergencies in Pakistan',
    category: 'article',
    readTime: '5 min read',
    date: '2024-01-15',
  },
  {
    id: '2',
    title: 'Community Heroes: Stories from the Field',
    description: 'Inspiring stories of volunteers making a difference',
    category: 'story',
    readTime: '3 min read',
    date: '2024-01-14',
  },
  {
    id: '3',
    title: 'Emergency Preparedness Video Series',
    description: 'Step-by-step video tutorials for disaster preparedness',
    category: 'video',
    readTime: '10 min',
    date: '2024-01-13',
  },
];

// Categories will be translated in component
const CONTENT_CATEGORIES_IDS = ['all', 'articles', 'videos', 'stories', 'guides'] as const;

const RECENT_ARTICLES: ContentCard[] = [
  {
    id: '4',
    title: 'Earthquake Preparedness Checklist',
    description: 'Complete checklist for earthquake safety and preparedness',
    category: 'guide',
    readTime: '7 min read',
    date: '2024-01-12',
  },
  {
    id: '5',
    title: 'How to Build an Emergency Kit',
    description: 'Everything you need to prepare for emergencies',
    category: 'article',
    readTime: '4 min read',
    date: '2024-01-11',
  },
  {
    id: '6',
    title: 'Volunteer Spotlight: Helping Hands',
    description: 'Meet the volunteers making a difference in their communities',
    category: 'story',
    readTime: '6 min read',
    date: '2024-01-10',
  },
];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'article':
      return Newspaper;
    case 'video':
      return Video;
    case 'story':
      return Heart;
    case 'guide':
      return BookOpen;
    default:
      return BookOpen;
  }
};

const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'article':
      return '#3B82F6';
    case 'video':
      return '#EF4444';
    case 'story':
      return '#EC4899';
    case 'guide':
      return '#10B981';
    default:
      return '#6B7280';
  }
};

export default function ExploreScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const CONTENT_CATEGORIES = [
    { id: 'all', label: t('explore.all'), icon: BookOpen },
    { id: 'articles', label: t('explore.articles'), icon: Newspaper },
    { id: 'videos', label: t('explore.videos'), icon: Video },
    { id: 'stories', label: t('explore.stories'), icon: Heart },
    { id: 'guides', label: t('explore.guides'), icon: BookOpen },
  ];

  const handleCardPress = async (card: ContentCard) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to content detail or open in browser
    console.log('Opening content:', card.id);
  };

  const renderContentCard = (card: ContentCard, featured = false) => {
    const IconComponent = getCategoryIcon(card.category);
    const categoryColor = getCategoryColor(card.category);

    return (
      <Pressable
        key={card.id}
        onPress={() => handleCardPress(card)}
        className="bg-white rounded-2xl mb-4 overflow-hidden"
        style={{
          width: featured ? CARD_WIDTH : CARD_WIDTH,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        {featured && (
          <View
            className="h-48 items-center justify-center"
            style={{ backgroundColor: categoryColor + '20' }}
          >
            <IconComponent size={64} color={categoryColor} />
          </View>
        )}
        <View className="p-4">
          <View className="flex-row items-center mb-2">
            <View
              className="px-3 py-1 rounded-full mr-2"
              style={{ backgroundColor: categoryColor + '20' }}
            >
              <Text
                className="text-xs font-bold capitalize"
                style={{ color: categoryColor }}
              >
                {t(`explore.${card.category}`)}
              </Text>
            </View>
            {card.readTime && (
              <Text className="text-gray-500 text-xs">
                {card.readTime.includes('min read') 
                  ? card.readTime.replace('min read', t('explore.minRead'))
                  : card.readTime}
              </Text>
            )}
          </View>
          <Text className="text-gray-900 text-xl font-bold mb-2">
            {card.title}
          </Text>
          <Text className="text-gray-600 text-sm leading-5">
            {card.description}
          </Text>
          {card.date && (
            <Text className="text-gray-400 text-xs mt-2">
              {new Date(card.date).toLocaleDateString()}
            </Text>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-6 pb-6">
          <View className="flex-row items-center mb-4">
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
              <Text className="text-5xl font-bold text-gray-900 leading-tight mb-2">
                {t('explore.title')}
              </Text>
              <Text className="text-gray-600 text-base">
                {t('explore.learnPrepareStayInformed')}
              </Text>
            </View>
          </View>
        </View>

        {/* Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-6 mb-6"
          contentContainerStyle={{ gap: 12 }}
        >
          {CONTENT_CATEGORIES.map((category) => {
            const IconComponent = category.icon;
            return (
              <Pressable
                key={category.id}
                onPress={async () => {
                  await Haptics.selectionAsync();
                }}
                className="bg-white px-4 py-3 rounded-full flex-row items-center"
          style={{
                  minHeight: 44,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              >
                <IconComponent size={18} color="#6B7280" />
                <Text className="text-gray-700 font-semibold ml-2">
                  {category.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Featured Section */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-2xl font-bold text-gray-900">{t('explore.featured')}</Text>
            <TrendingUp size={20} color="#6B7280" />
          </View>
          {FEATURED_CONTENT.map((card) => renderContentCard(card, true))}
        </View>

        {/* Recent Articles */}
        <View className="px-6 mb-6">
          <Text className="text-2xl font-bold text-gray-900 mb-4">
            {t('explore.recentArticles')}
          </Text>
          {RECENT_ARTICLES.map((card) => renderContentCard(card, false))}
        </View>

        {/* Success Stories Section */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center mb-4">
            <Heart size={20} color="#EC4899" />
            <Text className="text-2xl font-bold text-gray-900 ml-2">
              {t('explore.successStories')}
            </Text>
          </View>
          <View className="bg-white rounded-2xl p-6">
            <Text className="text-gray-900 text-lg font-semibold mb-2">
              {t('explore.communityImpact')}
            </Text>
            <Text className="text-gray-600 text-sm leading-5 mb-4">
              {t('explore.communityImpactDesc')}
            </Text>
            <Pressable
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              className="bg-pink-50 rounded-xl py-3 px-4 items-center"
              style={{ minHeight: 50 }}
            >
              <Text className="text-pink-600 font-bold">{t('explore.viewAllStories')}</Text>
            </Pressable>
          </View>
        </View>

        {/* Educational Content */}
        <View className="px-6 mb-6">
          <Text className="text-2xl font-bold text-gray-900 mb-4">
            {t('explore.educationalContent')}
          </Text>
          <View className="bg-white rounded-2xl p-6">
            <Text className="text-gray-900 text-lg font-semibold mb-2">
              {t('explore.learnEmergencyResponse')}
            </Text>
            <Text className="text-gray-600 text-sm leading-5 mb-4">
              {t('explore.learnEmergencyResponseDesc')}
            </Text>
            <Pressable
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/(tabs)/guides');
              }}
              className="bg-blue-50 rounded-xl py-3 px-4 items-center"
              style={{ minHeight: 50 }}
            >
              <Text className="text-blue-600 font-bold">{t('explore.browseGuides')}</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
