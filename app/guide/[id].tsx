import { ThemedText } from '@/components/ThemedText';
import { useAccessibility } from '@/hooks/useAccessibility';
import { useTranslation } from '@/hooks/useTranslation';
import { getGuideById } from '@/src/services/dataService';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle } from 'lucide-react-native';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface StepItemProps {
  stepNumber: number;
  text: string;
  imageUrl: string;
  isLast: boolean;
}

const StepItem: React.FC<StepItemProps> = ({ stepNumber, text, imageUrl, isLast }) => {
  const { themeColors } = useAccessibility();
  return (
    <View className="flex-row mb-6">
      {/* Step Number Circle and Line */}
      <View className="items-center mr-4">
        <View style={{ width: 40, height: 40, borderRadius: 9999, backgroundColor: themeColors.text, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: themeColors.background, fontWeight: '700', fontSize: 18 }}>{stepNumber}</Text>
        </View>
        {!isLast && <View style={{ width: 2, flex: 1, backgroundColor: themeColors.border, marginTop: 8, minHeight: 40 }} />}
      </View>

      {/* Step Content */}
      <View className="flex-1 pb-4">
        {/* Step Image */}
        <View style={{ width: '100%', height: 192, backgroundColor: themeColors.background, borderRadius: 12, marginBottom: 12, overflow: 'hidden' }}>
          <Image
            source={{ uri: imageUrl || 'https://via.placeholder.com/400x300?text=Step+' + stepNumber }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            placeholder={{ blurhash: 'LGF5]+Yk^6#M@-5c,1J5@[or[Q6.' }}
            transition={200}
          />
        </View>

        {/* Step Text */}
        <ThemedText className="text-lg leading-7" style={{ fontSize: 18, lineHeight: 28 }}>
          {text}
        </ThemedText>
      </View>
    </View>
  );
};

export default function GuideDetailScreen() {
  const router = useRouter();
  const { themeColors, speak, settings } = useAccessibility();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const guide = getGuideById(id || '');

  const handleBack = () => {
    Haptics.selectionAsync();
    router.back();
  };

  const handleListen = async () => {
    if (!guide) return;
    const stepsText = guide.steps
      .sort((a, b) => a.stepNumber - b.stepNumber)
      .map((step) => `Step ${step.stepNumber}: ${step.text}`)
      .join('. ');
    const message = `${guide.title}. ${stepsText}`;
    try {
      await speak(message);
    } catch {
      // Ignore TTS errors
    }
  };

  if (!guide) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }} edges={['top']}>
        <View className="flex-1 items-center justify-center px-4">
          <ThemedText className="text-xl font-bold mb-2">{t('guides.guideNotFound')}</ThemedText>
          <ThemedText className="text-center mb-6" style={{ opacity: 0.7 }}>
            {t('guides.guideNotFoundMessage')}
          </ThemedText>
          <TouchableOpacity
            onPress={handleBack}
            style={{ backgroundColor: themeColors.text, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 16, minHeight: 60 }}
          >
            <Text style={{ color: themeColors.background, fontWeight: '700', fontSize: 18 }}>{t('guides.goBack')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const getCategoryLabel = (category: string) => {
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

  const getCategoryColor = (category: string) => {
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

  // Auto-read guide when Speak Aloud is enabled
  React.useEffect(() => {
    if (!guide) return;
    if (!settings.speakAloud) return;
    handleListen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guide?.id, settings.speakAloud]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }} edges={['top']}>
      {/* Header */}
      <View style={{ backgroundColor: themeColors.card, borderBottomWidth: 1, borderBottomColor: themeColors.border, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity
          onPress={handleBack}
          style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginRight: 12, minHeight: 44, minWidth: 44 }}
        >
          <ArrowLeft size={24} color={themeColors.text} />
        </TouchableOpacity>
        <View className="flex-1">
          <ThemedText className="text-lg font-bold" numberOfLines={1}>
            {guide.title}
          </ThemedText>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 py-6">
          {/* Category and Offline Badge */}
          <View className="flex-row items-center mb-6 flex-wrap gap-2">
            <View style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 9999, backgroundColor: colors.bg }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>
                {getCategoryLabel(guide.category)}
              </Text>
            </View>
            {guide.isOfflineReady && (
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#D1FAE5', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 9999 }}>
                <CheckCircle size={16} color="#059669" />
                <Text style={{ color: '#059669', fontSize: 14, fontWeight: '700', marginLeft: 8 }}>{t('guides.offlineReady')}</Text>
              </View>
            )}
          </View>

          {/* Listen Button */}
          <TouchableOpacity
            onPress={handleListen}
            style={{
              backgroundColor: themeColors.text,
              borderRadius: 12,
              paddingHorizontal: 20,
              paddingVertical: 14,
              marginBottom: 16,
              alignItems: 'center',
              minHeight: 60,
            }}
            activeOpacity={0.8}
          >
            <Text
              style={{
                color: themeColors.background,
                fontWeight: '700',
                fontSize: 16,
              }}
            >
              Listen to this guide
            </Text>
          </TouchableOpacity>

          {/* Title */}
          <ThemedText className="text-3xl font-bold mb-8" style={{ fontSize: 28, lineHeight: 36 }}>
            {guide.title}
          </ThemedText>

          {/* Steps */}
          <View className="mb-6">
            <ThemedText className="text-xl font-bold mb-6" style={{ fontSize: 22 }}>
              {t('guides.steps')}
            </ThemedText>
            {guide.steps.map((step, index) => (
              <StepItem
                key={step.stepNumber}
                stepNumber={step.stepNumber}
                text={step.text}
                imageUrl={step.imageUrl}
                isLast={index === guide.steps.length - 1}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
