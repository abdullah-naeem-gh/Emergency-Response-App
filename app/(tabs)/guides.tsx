import { Guide } from '@/src/data/guidesData';
import { getGuides, searchGuides } from '@/src/services/dataService';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { CheckCircle } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { FlatList, ScrollView, Text, TouchableOpacity, View } from 'react-native';

type FilterType = 'All' | 'Medical' | 'Fire' | 'Flood' | 'Earthquake';

interface GuideCardProps {
  guide: Guide;
  onPress: () => void;
}

const GuideCard: React.FC<GuideCardProps> = ({ guide, onPress }) => {
  const getCategoryLabel = (category: Guide['category']) => {
    switch (category) {
      case 'FIRST_AID':
        return 'First Aid';
      case 'EVACUATION':
        return 'Evacuation';
      case 'SURVIVAL':
        return 'Survival';
      default:
        return category;
    }
  };

  const getCategoryColor = (category: Guide['category']) => {
    switch (category) {
      case 'FIRST_AID':
        return { bg: 'bg-red-100', text: 'text-red-700' };
      case 'EVACUATION':
        return { bg: 'bg-orange-100', text: 'text-orange-700' };
      case 'SURVIVAL':
        return { bg: 'bg-blue-100', text: 'text-blue-700' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700' };
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-2xl mb-4 overflow-hidden shadow-sm border border-gray-100"
      style={{ minHeight: 200 }}
      activeOpacity={0.7}
    >
      {/* Placeholder Image */}
      <View className="w-full h-32 bg-gray-200 relative">
        <Image
          source={{ uri: guide.steps[0]?.imageUrl || 'https://via.placeholder.com/300x200?text=Guide' }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          placeholder={{ blurhash: 'LGF5]+Yk^6#M@-5c,1J5@[or[Q6.' }}
          transition={200}
        />
        {/* Offline Badge */}
        {guide.isOfflineReady && (
          <View className="absolute top-2 right-2 bg-green-500 rounded-full px-2 py-1 flex-row items-center">
            <CheckCircle size={12} color="white" />
            <Text className="text-white text-[10px] font-bold ml-1">Offline</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View className="p-4 flex-1">
        {/* Category Tag */}
        {(() => {
          const colors = getCategoryColor(guide.category);
          return (
            <View className={`self-start px-3 py-1 rounded-full mb-2 ${colors.bg}`}>
              <Text className={`text-xs font-bold ${colors.text}`}>
                {getCategoryLabel(guide.category)}
              </Text>
            </View>
          );
        })()}

        {/* Title */}
        <Text className="text-base font-bold text-gray-900 mb-1" numberOfLines={2}>
          {guide.title}
        </Text>

        {/* Step Count */}
        <Text className="text-xs text-gray-500 mt-1">
          {guide.steps.length} {guide.steps.length === 1 ? 'step' : 'steps'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default function GuidesScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');

  // Filter guides based on active filter
  const filteredGuides = useMemo(() => {
    let guides: Guide[] = [];

    switch (activeFilter) {
      case 'All':
        guides = getGuides();
        break;
      case 'Medical':
        guides = getGuides({ category: 'FIRST_AID' });
        break;
      case 'Fire':
        guides = searchGuides('fire');
        break;
      case 'Flood':
        guides = searchGuides('flood');
        break;
      case 'Earthquake':
        guides = searchGuides('earthquake');
        break;
      default:
        guides = getGuides();
    }

    return guides;
  }, [activeFilter]);

  const handleFilterPress = (filter: FilterType) => {
    Haptics.selectionAsync();
    setActiveFilter(filter);
  };

  const handleGuidePress = (guideId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/guide/${guideId}`);
  };

  const renderFilterButton = (filter: FilterType) => (
    <TouchableOpacity
      key={filter}
      onPress={() => handleFilterPress(filter)}
      className={`px-5 py-3 rounded-full mr-3 border ${
        activeFilter === filter
          ? 'bg-gray-900 border-gray-900'
          : 'bg-white border-gray-300'
      }`}
      style={{ minHeight: 44 }}
    >
      <Text
        className={`font-semibold text-sm ${
          activeFilter === filter ? 'text-white' : 'text-gray-700'
        }`}
      >
        {filter}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <View className="flex-1 px-4 pt-2">
        {/* Header */}
        <View className="mb-4">
          <Text className="text-3xl font-bold text-gray-900 mb-4">Guides</Text>

          {/* Quick Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-4"
            contentContainerStyle={{ paddingRight: 16 }}
          >
            {(['All', 'Medical', 'Fire', 'Flood', 'Earthquake'] as FilterType[]).map(
              renderFilterButton
            )}
          </ScrollView>
        </View>

        {/* Guide Grid */}
        <FlatList
          data={filteredGuides}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View className="w-[48%]">
              <GuideCard guide={item} onPress={() => handleGuidePress(item.id)} />
            </View>
          )}
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Text className="text-gray-400 text-base">No guides found.</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </View>
  );
}
