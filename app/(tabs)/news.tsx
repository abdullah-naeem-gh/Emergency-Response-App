import * as Haptics from 'expo-haptics';
import { AlertTriangle, Clock, Info, MapPin, Search, Share2, Siren, X } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Modal, ScrollView, Share, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { alertsData, NewsItem } from '../../src/data/alertsData';

// Helper for relative time
const getRelativeTime = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

// Filter Types
type FilterType = 'All' | 'Critical' | 'Warning' | 'Info';

export default function NewsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [selectedAlert, setSelectedAlert] = useState<NewsItem | null>(null);

  // Pulse Animation for Critical Alert
  const pulseOpacity = useSharedValue(1);
  
  useEffect(() => {
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedPulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  // Filter Logic
  const filteredAlerts = useMemo(() => {
    return alertsData.filter((alert) => {
      const matchesSearch = alert.location.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            alert.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = activeFilter === 'All' || alert.severity.toUpperCase() === activeFilter.toUpperCase();
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, activeFilter]);

  // Find the most recent CRITICAL alert for the Featured section (from filtered results)
  const featuredAlert = useMemo(() => {
    return filteredAlerts.find((alert) => alert.severity === 'CRITICAL');
  }, [filteredAlerts]);

  // Filtered List without the Featured Alert (optional: normally featured is still in list, but prompts implies special section)
  // Let's keep it in the list for completeness or remove it? usually featured is duplicate or sticky.
  // I will just show the featured section if a critical alert exists, and then show the full list below. 
  // Or better, exclude the featured one from the list to avoid duplication if it's right there.
  // User prompt: "Feed: A FlatList rendering the alertsData." "Featured Section: If there is a CRITICAL alert, show it..."
  // I will NOT remove it from the list to keep logic simple, or I can remove it. Let's keep it simple first.

  const handleShare = async (alert: NewsItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await Share.share({
        message: `🚨 ${alert.severity} ALERT: ${alert.title}\n📍 ${alert.location}\n\n${alert.content}\n\nSource: ${alert.source}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const openModal = (alert: NewsItem) => {
    Haptics.selectionAsync(); // Or impact
    setSelectedAlert(alert);
  };

  const closeModal = () => {
    setSelectedAlert(null);
  };

  const renderFilterPill = (filter: FilterType) => (
    <TouchableOpacity
      key={filter}
      onPress={() => {
        Haptics.selectionAsync();
        setActiveFilter(filter);
      }}
      className={`px-4 py-2 rounded-full mr-2 border ${
        activeFilter === filter
          ? 'bg-black border-black'
          : 'bg-white border-gray-300'
      }`}
    >
      <Text className={`font-semibold ${activeFilter === filter ? 'text-white' : 'text-gray-700'}`}>
        {filter}
      </Text>
    </TouchableOpacity>
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-500 border-red-500 text-red-700 bg-red-50';
      case 'WARNING': return 'bg-amber-500 border-amber-500 text-amber-700 bg-amber-50';
      case 'INFO': return 'bg-blue-500 border-blue-500 text-blue-700 bg-blue-50';
      default: return 'bg-gray-500 border-gray-500 text-gray-700 bg-gray-50';
    }
  };
  
  const getBorderColor = (severity: string) => {
      switch (severity) {
        case 'CRITICAL': return 'border-l-red-500';
        case 'WARNING': return 'border-l-amber-500';
        case 'INFO': return 'border-l-blue-500';
        default: return 'border-l-gray-300';
      }
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="flex-1 px-4 pt-2">
        {/* Header */}
        <View className="mb-4">
          <Text className="text-3xl font-bold text-gray-900 mb-4">Alerts</Text>
          
          {/* Search Bar */}
          <View className="flex-row items-center bg-white rounded-xl px-4 py-3 border border-gray-200 mb-4 shadow-sm">
            <Search size={20} color="#6B7280" />
            <TextInput
              className="flex-1 ml-3 text-base text-gray-900"
              placeholder="Search alerts by city..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
            {['All', 'Critical', 'Warning', 'Info'].map((f) => renderFilterPill(f as FilterType))}
          </ScrollView>
        </View>

        {/* Main Content */}
        <FlatList
          data={filteredAlerts}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => (
            <>
              {/* Featured Critical Alert */}
              {featuredAlert && (
                <View className="mb-6">
                  <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Featured Alert</Text>
                  <TouchableOpacity 
                    onPress={() => openModal(featuredAlert)}
                    className="bg-red-500 rounded-2xl p-5 shadow-lg overflow-hidden relative"
                    style={{ minHeight: 140 }}
                  >
                    <View className="flex-row justify-between items-start mb-2">
                      <View className="flex-row items-center bg-red-700/50 px-2 py-1 rounded-md">
                        <Animated.View style={animatedPulseStyle}>
                            <Siren size={16} color="white" />
                        </Animated.View>
                        <Text className="text-white text-xs font-bold ml-2 uppercase">Critical Emergency</Text>
                      </View>
                      <Text className="text-red-100 text-xs">{getRelativeTime(featuredAlert.timestamp)}</Text>
                    </View>
                    
                    <Text className="text-white text-xl font-bold mb-2 leading-tight" numberOfLines={2}>
                        {featuredAlert.title}
                    </Text>
                    
                    <View className="flex-row items-center mt-auto">
                        <MapPin size={16} color="#FECACA" />
                        <Text className="text-red-100 ml-1 font-medium">{featuredAlert.location}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}
              
              <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Recent Updates</Text>
            </>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => openModal(item)}
              className={`bg-white rounded-xl p-4 mb-3 shadow-sm border-l-4 ${getBorderColor(item.severity)} border-t border-r border-b border-gray-100`}
            >
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-row items-center">
                  <View className={`px-2 py-1 rounded text-xs ${
                      item.source === 'NDMA' ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <Text className={`text-[10px] font-bold ${
                        item.source === 'NDMA' ? 'text-green-800' : 'text-gray-600'
                    }`}>
                        {item.source}
                    </Text>
                  </View>
                  <View className="mx-2 w-1 h-1 bg-gray-300 rounded-full" />
                  <Clock size={12} color="#9CA3AF" />
                  <Text className="text-gray-400 text-xs ml-1">{getRelativeTime(item.timestamp)}</Text>
                </View>
                
                {item.severity === 'CRITICAL' && <AlertTriangle size={16} color="#EF4444" />}
                {item.severity === 'WARNING' && <AlertTriangle size={16} color="#F59E0B" />}
                {item.severity === 'INFO' && <Info size={16} color="#3B82F6" />}
              </View>
              
              <Text className="text-gray-900 font-bold text-lg mb-1">{item.title}</Text>
              <Text className="text-gray-600 text-sm mb-3" numberOfLines={2}>{item.content}</Text>
              
              <View className="flex-row items-center">
                <MapPin size={14} color="#6B7280" />
                <Text className="text-gray-500 text-xs ml-1">{item.location}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="items-center justify-center py-10">
                <Text className="text-gray-400">No alerts found.</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />

        {/* Detailed Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={!!selectedAlert}
          onRequestClose={closeModal}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-3xl h-[85%] w-full overflow-hidden">
                {selectedAlert && (
                    <SafeAreaView className="flex-1">
                        {/* Modal Header */}
                        <View className="px-5 py-4 flex-row justify-between items-center border-b border-gray-100">
                            <TouchableOpacity 
                                onPress={closeModal}
                                className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
                            >
                                <X size={20} color="#374151" />
                            </TouchableOpacity>
                            <Text className="font-semibold text-gray-900">Alert Details</Text>
                            <TouchableOpacity 
                                onPress={() => handleShare(selectedAlert)}
                                className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center"
                            >
                                <Share2 size={20} color="#2563EB" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="flex-1 px-5 pt-4">
                            {/* Tags */}
                            <View className="flex-row items-center mb-4 flex-wrap gap-2">
                                <View className={`px-3 py-1 rounded-full ${
                                    selectedAlert.severity === 'CRITICAL' ? 'bg-red-100' : 
                                    selectedAlert.severity === 'WARNING' ? 'bg-amber-100' : 'bg-blue-100'
                                }`}>
                                    <Text className={`text-xs font-bold ${
                                        selectedAlert.severity === 'CRITICAL' ? 'text-red-700' : 
                                        selectedAlert.severity === 'WARNING' ? 'text-amber-700' : 'text-blue-700'
                                    }`}>
                                        {selectedAlert.severity}
                                    </Text>
                                </View>
                                <View className="bg-gray-100 px-3 py-1 rounded-full">
                                    <Text className="text-xs font-bold text-gray-600">{selectedAlert.source}</Text>
                                </View>
                            </View>

                            <Text className="text-2xl font-bold text-gray-900 mb-4">{selectedAlert.title}</Text>
                            
                            <View className="flex-row items-center mb-6">
                                <Clock size={16} color="#6B7280" />
                                <Text className="text-gray-500 ml-2">{new Date(selectedAlert.timestamp).toLocaleString()}</Text>
                            </View>
                            
                            <View className="flex-row items-start mb-6">
                                <MapPin size={16} color="#6B7280" className="mt-1" />
                                <Text className="text-gray-500 ml-2 flex-1">{selectedAlert.location}</Text>
                            </View>

                            <View className="bg-gray-50 p-4 rounded-xl mb-6">
                                <Text className="text-base text-gray-800 leading-relaxed">{selectedAlert.content}</Text>
                            </View>

                            {selectedAlert.severity === 'CRITICAL' && (
                                <View className="bg-red-50 p-4 rounded-xl border border-red-100 flex-row items-start">
                                    <AlertTriangle size={20} color="#EF4444" className="mt-0.5" />
                                    <View className="ml-3 flex-1">
                                        <Text className="font-bold text-red-800 mb-1">Take Immediate Action</Text>
                                        <Text className="text-red-700 text-sm">
                                            Follow local evacuation orders and stay tuned to official channels.
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </ScrollView>

                        <View className="p-5 border-t border-gray-100">
                             <TouchableOpacity 
                                onPress={closeModal}
                                className="w-full bg-gray-900 h-[60px] rounded-2xl items-center justify-center shadow-md active:bg-gray-800"
                            >
                                <Text className="text-white font-bold text-lg">Close</Text>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                )}
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}
