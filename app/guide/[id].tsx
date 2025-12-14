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
  return (
    <View className="flex-row mb-6">
      {/* Step Number Circle and Line */}
      <View className="items-center mr-4">
        <View className="w-10 h-10 rounded-full bg-gray-900 items-center justify-center">
          <Text className="text-white font-bold text-lg">{stepNumber}</Text>
        </View>
        {!isLast && <View className="w-0.5 flex-1 bg-gray-300 mt-2" style={{ minHeight: 40 }} />}
      </View>

      {/* Step Content */}
      <View className="flex-1 pb-4">
        {/* Step Image */}
        <View className="w-full h-48 bg-gray-200 rounded-xl mb-3 overflow-hidden">
          <Image
            source={{ uri: imageUrl || 'https://via.placeholder.com/400x300?text=Step+' + stepNumber }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            placeholder={{ blurhash: 'LGF5]+Yk^6#M@-5c,1J5@[or[Q6.' }}
            transition={200}
          />
        </View>

        {/* Step Text */}
        <Text className="text-lg text-gray-900 leading-7" style={{ fontSize: 18, lineHeight: 28 }}>
          {text}
        </Text>
      </View>
    </View>
  );
};

export default function GuideDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const guide = getGuideById(id || '');

  const handleBack = () => {
    Haptics.selectionAsync();
    router.back();
  };

  if (!guide) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-xl font-bold text-gray-900 mb-2">Guide not found</Text>
          <Text className="text-gray-600 text-center mb-6">
            The guide you're looking for doesn't exist.
          </Text>
          <TouchableOpacity
            onPress={handleBack}
            className="bg-gray-900 rounded-xl px-6 py-4"
            style={{ minHeight: 60 }}
          >
            <Text className="text-white font-bold text-lg">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const getCategoryLabel = (category: string) => {
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

  const getCategoryColor = (category: string) => {
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
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-3 flex-row items-center">
        <TouchableOpacity
          onPress={handleBack}
          className="w-10 h-10 items-center justify-center mr-3"
          style={{ minHeight: 44, minWidth: 44 }}
        >
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>
            {guide.title}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 py-6">
          {/* Category and Offline Badge */}
          <View className="flex-row items-center mb-6 flex-wrap gap-2">
            {(() => {
              const colors = getCategoryColor(guide.category);
              return (
                <View className={`px-4 py-2 rounded-full ${colors.bg}`}>
                  <Text className={`text-sm font-bold ${colors.text}`}>
                    {getCategoryLabel(guide.category)}
                  </Text>
                </View>
              );
            })()}
            {guide.isOfflineReady && (
              <View className="flex-row items-center bg-green-100 px-4 py-2 rounded-full">
                <CheckCircle size={16} color="#059669" />
                <Text className="text-green-700 text-sm font-bold ml-2">Available Offline</Text>
              </View>
            )}
          </View>

          {/* Title */}
          <Text className="text-3xl font-bold text-gray-900 mb-8" style={{ fontSize: 28, lineHeight: 36 }}>
            {guide.title}
          </Text>

          {/* Steps */}
          <View className="mb-6">
            <Text className="text-xl font-bold text-gray-900 mb-6" style={{ fontSize: 22 }}>
              Steps
            </Text>
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
