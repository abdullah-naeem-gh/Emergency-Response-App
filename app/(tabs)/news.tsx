import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAccessibility } from '@/hooks/useAccessibility';
import * as Haptics from 'expo-haptics';
import { AlertTriangle, Clock, Info, MapPin, Search, Share2, Siren, X } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Modal, SafeAreaView, ScrollView, Share, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
  const { themeColors } = useAccessibility();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [selectedAlert, setSelectedAlert] = useState<NewsItem | null>(null);
  const [alerts, setAlerts] = useState<NewsItem[]>(alertsData);

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
    return alerts.filter((alert) => {
      const matchesSearch = alert.location.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            alert.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = activeFilter === 'All' || alert.severity.toUpperCase() === activeFilter.toUpperCase();
      return matchesSearch && matchesFilter;
    });
  }, [alerts, searchQuery, activeFilter]);

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
      style={{
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 9999,
        marginRight: 8,
        borderWidth: 1,
        backgroundColor: activeFilter === filter ? themeColors.text : themeColors.card,
        borderColor: activeFilter === filter ? themeColors.text : themeColors.border,
      }}
    >
      <Text style={{ fontWeight: '600', color: activeFilter === filter ? themeColors.background : themeColors.text }}>
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
    <ThemedView className="flex-1">
      <View className="flex-1 px-4 pt-2">
        {/* Header */}
        <View className="mb-4">
          <ThemedText className="text-3xl font-bold mb-4">Alerts</ThemedText>
          
          {/* Search Bar */}
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: themeColors.card, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: themeColors.border, marginBottom: 16 }}>
            <Search size={20} color={themeColors.text} style={{ opacity: 0.7 }} />
            <TextInput
              style={{ flex: 1, marginLeft: 12, fontSize: 16, color: themeColors.text }}
              placeholder="Search alerts by city..."
              placeholderTextColor={themeColors.text + '80'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={18} color={themeColors.text} style={{ opacity: 0.7 }} />
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
                  <ThemedText className="text-xs font-bold uppercase tracking-wider mb-2" style={{ opacity: 0.7 }}>Featured Alert</ThemedText>
                  <TouchableOpacity 
                    onPress={() => openModal(featuredAlert)}
                    style={{ backgroundColor: '#EF4444', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5, overflow: 'hidden', position: 'relative', minHeight: 140 }}
                  >
                    <View className="flex-row justify-between items-start mb-2">
                      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(185, 28, 28, 0.5)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                        <Animated.View style={animatedPulseStyle}>
                            <Siren size={16} color="white" />
                        </Animated.View>
                        <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700', marginLeft: 8, textTransform: 'uppercase' }}>Critical Emergency</Text>
                      </View>
                      <Text style={{ color: '#FECACA', fontSize: 12 }}>{getRelativeTime(featuredAlert.timestamp)}</Text>
                    </View>
                    
                    <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '700', marginBottom: 8, lineHeight: 24 }} numberOfLines={2}>
                        {featuredAlert.title}
                    </Text>
                    
                    <View className="flex-row items-center mt-auto">
                        <MapPin size={16} color="#FECACA" />
                        <Text style={{ color: '#FECACA', marginLeft: 4, fontWeight: '500' }}>{featuredAlert.location}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}
              
              <ThemedText className="text-xs font-bold uppercase tracking-wider mb-2" style={{ opacity: 0.7 }}>Recent Updates</ThemedText>
            </>
          )}
          renderItem={({ item }) => {
            const borderColor = item.severity === 'CRITICAL' ? '#EF4444' : item.severity === 'WARNING' ? '#F59E0B' : '#3B82F6';
            return (
              <TouchableOpacity
                onPress={() => openModal(item)}
                style={{
                  backgroundColor: themeColors.card,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  borderLeftWidth: 4,
                  borderLeftColor: borderColor,
                  borderTopWidth: 1,
                  borderRightWidth: 1,
                  borderBottomWidth: 1,
                  borderTopColor: themeColors.border,
                  borderRightColor: themeColors.border,
                  borderBottomColor: themeColors.border,
                }}
              >
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-row items-center">
                    <View style={{
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 4,
                      backgroundColor: item.source === 'NDMA' ? '#D1FAE5' : themeColors.background,
                    }}>
                      <Text style={{
                        fontSize: 10,
                        fontWeight: '700',
                        color: item.source === 'NDMA' ? '#065F46' : themeColors.text,
                      }}>
                        {item.source}
                      </Text>
                    </View>
                    <View style={{ marginHorizontal: 8, width: 4, height: 4, backgroundColor: themeColors.border, borderRadius: 9999 }} />
                    <Clock size={12} color={themeColors.text} style={{ opacity: 0.6 }} />
                    <ThemedText className="text-xs ml-1" style={{ opacity: 0.6 }}>{getRelativeTime(item.timestamp)}</ThemedText>
                  </View>
                  
                  {item.severity === 'CRITICAL' && <AlertTriangle size={16} color="#EF4444" />}
                  {item.severity === 'WARNING' && <AlertTriangle size={16} color="#F59E0B" />}
                  {item.severity === 'INFO' && <Info size={16} color="#3B82F6" />}
                </View>
                
                <ThemedText className="font-bold text-lg mb-1">{item.title}</ThemedText>
                <ThemedText className="text-sm mb-3" style={{ opacity: 0.7 }} numberOfLines={2}>{item.content}</ThemedText>
                
                <View className="flex-row items-center">
                  <MapPin size={14} color={themeColors.text} style={{ opacity: 0.7 }} />
                  <ThemedText className="text-xs ml-1" style={{ opacity: 0.7 }}>{item.location}</ThemedText>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View className="items-center justify-center py-10">
                <ThemedText style={{ opacity: 0.6 }}>No alerts found.</ThemedText>
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
          <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <View style={{ backgroundColor: themeColors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '85%', width: '100%', overflow: 'hidden' }}>
                {selectedAlert && (
                    <SafeAreaView className="flex-1">
                        {/* Modal Header */}
                        <View style={{ paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: themeColors.border }}>
                            <TouchableOpacity 
                                onPress={closeModal}
                                style={{ width: 40, height: 40, backgroundColor: themeColors.background, borderRadius: 9999, alignItems: 'center', justifyContent: 'center' }}
                            >
                                <X size={20} color={themeColors.text} />
                            </TouchableOpacity>
                            <ThemedText className="font-semibold">Alert Details</ThemedText>
                            <TouchableOpacity 
                                onPress={() => handleShare(selectedAlert)}
                                style={{ width: 40, height: 40, backgroundColor: themeColors.primary + '20', borderRadius: 9999, alignItems: 'center', justifyContent: 'center' }}
                            >
                                <Share2 size={20} color={themeColors.primary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="flex-1 px-5 pt-4">
                            {/* Tags */}
                            <View className="flex-row items-center mb-4 flex-wrap gap-2">
                                <View style={{
                                  paddingHorizontal: 12,
                                  paddingVertical: 4,
                                  borderRadius: 9999,
                                  backgroundColor: selectedAlert.severity === 'CRITICAL' ? '#FEE2E2' : 
                                    selectedAlert.severity === 'WARNING' ? '#FED7AA' : '#DBEAFE',
                                }}>
                                    <Text style={{
                                      fontSize: 12,
                                      fontWeight: '700',
                                      color: selectedAlert.severity === 'CRITICAL' ? '#B91C1C' : 
                                        selectedAlert.severity === 'WARNING' ? '#C2410C' : '#1E40AF',
                                    }}>
                                        {selectedAlert.severity}
                                    </Text>
                                </View>
                                <View style={{ backgroundColor: themeColors.background, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 9999 }}>
                                    <ThemedText className="text-xs font-bold">{selectedAlert.source}</ThemedText>
                                </View>
                            </View>

                            <ThemedText className="text-2xl font-bold mb-4">{selectedAlert.title}</ThemedText>
                            
                            <View className="flex-row items-center mb-6">
                                <Clock size={16} color={themeColors.text} style={{ opacity: 0.7 }} />
                                <ThemedText className="ml-2" style={{ opacity: 0.7 }}>{new Date(selectedAlert.timestamp).toLocaleString()}</ThemedText>
                            </View>
                            
                            <View className="flex-row items-start mb-6">
                                <MapPin size={16} color={themeColors.text} style={{ marginTop: 2, opacity: 0.7 }} />
                                <ThemedText className="ml-2 flex-1" style={{ opacity: 0.7 }}>{selectedAlert.location}</ThemedText>
                            </View>

                            <View style={{ backgroundColor: themeColors.background, padding: 16, borderRadius: 12, marginBottom: 24 }}>
                                <ThemedText className="text-base leading-relaxed">{selectedAlert.content}</ThemedText>
                            </View>

                            {selectedAlert.severity === 'CRITICAL' && (
                                <View style={{ backgroundColor: '#FEE2E2', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#FECACA', flexDirection: 'row', alignItems: 'flex-start' }}>
                                    <AlertTriangle size={20} color="#EF4444" style={{ marginTop: 2 }} />
                                    <View style={{ marginLeft: 12, flex: 1 }}>
                                        <Text style={{ fontWeight: '700', color: '#991B1B', marginBottom: 4 }}>Take Immediate Action</Text>
                                        <Text style={{ color: '#B91C1C', fontSize: 14 }}>
                                            Follow local evacuation orders and stay tuned to official channels.
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </ScrollView>

                        <View style={{ padding: 20, borderTopWidth: 1, borderTopColor: themeColors.border }}>
                             <TouchableOpacity 
                                onPress={closeModal}
                                style={{ width: '100%', backgroundColor: themeColors.text, height: 60, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}
                            >
                                <Text style={{ color: themeColors.background, fontWeight: '700', fontSize: 18 }}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                )}
            </View>
          </View>
        </Modal>
      </View>
    </ThemedView>
  );
}
