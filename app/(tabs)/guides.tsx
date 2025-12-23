import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAccessibility } from '@/hooks/useAccessibility';
import { useTranslation } from '@/hooks/useTranslation';
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
  const { themeColors } = useAccessibility();
  const { t } = useTranslation();
  const getCategoryLabel = (category: Guide['category']) => {
    switch (category) {
      case 'FIRST_AID':
        return t('guides.firstAid');
      case 'EVACUATION':
        return t('guides.evacuation');
      case 'SURVIVAL':
        return t('guides.survival');
      default:
        return category;
    }
  };

  const getCategoryColor = (category: Guide['category']) => {
    switch (category) {
      case 'FIRST_AID':
        return { bg: '#FEE2E2', text: '#B91C1C' };
      case 'EVACUATION':
        return { bg: '#FED7AA', text: '#C2410C' };
      case 'SURVIVAL':
        return { bg: '#DBEAFE', text: '#1E40AF' };
      default:
        return { bg: themeColors.background, text: themeColors.text };
    }
  };

  const colors = getCategoryColor(guide.category);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: themeColors.card,
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: themeColors.border,
        minHeight: 200,
      }}
      activeOpacity={0.7}
    >
      {/* Placeholder Image */}
      <View style={{ width: '100%', height: 128, backgroundColor: themeColors.background, position: 'relative' }}>
        <Image
          source={{ uri: guide.steps[0]?.imageUrl || 'https://via.placeholder.com/300x200?text=Guide' }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          placeholder={{ blurhash: 'LGF5]+Yk^6#M@-5c,1J5@[or[Q6.' }}
          transition={200}
        />
        {/* Offline Badge */}
        {guide.isOfflineReady && (
          <View style={{ position: 'absolute', top: 8, right: 8, backgroundColor: '#22C55E', borderRadius: 9999, paddingHorizontal: 8, paddingVertical: 4, flexDirection: 'row', alignItems: 'center' }}>
            <CheckCircle size={12} color="white" />
            <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '700', marginLeft: 4 }}>{t('guides.offline')}</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={{ padding: 16, flex: 1 }}>
        {/* Category Tag */}
        <View style={{ alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 9999, marginBottom: 8, backgroundColor: colors.bg }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text }}>
            {getCategoryLabel(guide.category)}
          </Text>
        </View>

        {/* Title */}
        <ThemedText className="text-base font-bold mb-1" numberOfLines={2}>
          {guide.title}
        </ThemedText>

        {/* Step Count */}
        <ThemedText className="text-xs mt-1" style={{ opacity: 0.7 }}>
          {guide.steps.length} {guide.steps.length === 1 ? t('guides.step') : t('guides.steps')}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
};

export default function GuidesScreen() {
  const router = useRouter();
  const { themeColors } = useAccessibility();
  const { t } = useTranslation();
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

  const getFilterLabel = (filter: FilterType): string => {
    switch (filter) {
      case 'All':
        return t('guides.all');
      case 'Medical':
        return t('guides.medical');
      case 'Fire':
        return t('guides.fire');
      case 'Flood':
        return t('guides.flood');
      case 'Earthquake':
        return t('guides.earthquake');
      default:
        return filter;
    }
  };

  const renderFilterButton = (filter: FilterType) => (
    <TouchableOpacity
      key={filter}
      onPress={() => handleFilterPress(filter)}
      style={{
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 9999,
        marginRight: 12,
        borderWidth: 1,
        backgroundColor: activeFilter === filter ? themeColors.text : themeColors.card,
        borderColor: activeFilter === filter ? themeColors.text : themeColors.border,
        minHeight: 44,
      }}
    >
      <Text
        style={{
          fontWeight: '600',
          fontSize: 14,
          color: activeFilter === filter ? themeColors.background : themeColors.text,
        }}
      >
        {getFilterLabel(filter)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ThemedView className="flex-1">
      <View className="flex-1 px-4 pt-2">
        {/* Header */}
        <View className="mb-4">
          <ThemedText className="text-3xl font-bold mb-4">{t('guides.title')}</ThemedText>

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
              <ThemedText className="text-base" style={{ opacity: 0.6 }}>{t('guides.noGuidesFound')}</ThemedText>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </ThemedView>
  );
}
