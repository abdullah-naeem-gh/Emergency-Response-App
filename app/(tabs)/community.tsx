import {
  communityService,
  ResourceOffer,
  ResourceRequest,
  SafetyCheckIn,
  CommunityMessage,
} from '@/services/CommunityService';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  CheckCircle,
  Heart,
  MessageCircle,
  Plus,
  Send,
  Shield,
  Users,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

type TabType = 'checkin' | 'resources' | 'chat';

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'safe':
      return '#10B981';
    case 'needs_help':
      return '#EF4444';
    case 'evacuating':
      return '#F59E0B';
    default:
      return '#6B7280';
  }
};

const getUrgencyColor = (urgency: string): string => {
  switch (urgency) {
    case 'critical':
      return '#DC2626';
    case 'high':
      return '#EF4444';
    case 'medium':
      return '#F59E0B';
    case 'low':
      return '#10B981';
    default:
      return '#6B7280';
  }
};

export default function CommunityScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('checkin');
  const [checkIns, setCheckIns] = useState<SafetyCheckIn[]>([]);
  const [resourceRequests, setResourceRequests] = useState<ResourceRequest[]>([]);
  const [resourceOffers, setResourceOffers] = useState<ResourceOffer[]>([]);
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [resourceModalType, setResourceModalType] = useState<'request' | 'offer'>('request');
  const [newMessage, setNewMessage] = useState('');
  const [checkInStatus, setCheckInStatus] = useState<'safe' | 'needs_help' | 'evacuating'>('safe');
  const [checkInMessage, setCheckInMessage] = useState('');
  
  // Resource form state
  const [resourceType, setResourceType] = useState<'food' | 'water' | 'medical' | 'shelter' | 'transport' | 'other'>('food');
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceDescription, setResourceDescription] = useState('');
  const [resourceQuantity, setResourceQuantity] = useState('');
  const [resourceUrgency, setResourceUrgency] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'chat') {
      loadMessages();
    }
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const location = await getCurrentLocation();
      if (location) {
        setUserLocation(location);
        const requests = await communityService.getNearbyResourceRequests(
          location.latitude,
          location.longitude,
          10
        );
        const offers = await communityService.getNearbyResourceOffers(
          location.latitude,
          location.longitude,
          10
        );
        setResourceRequests(requests);
        setResourceOffers(offers);
      }
      const recentCheckIns = await communityService.getRecentCheckIns(20);
      setCheckIns(recentCheckIns);
    } catch (error) {
      console.error('Error loading community data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    const recentMessages = await communityService.getRecentMessages(50);
    setMessages(recentMessages);
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        return {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
    return null;
  };

  const handleCheckIn = async () => {
    if (!userLocation) {
      const location = await getCurrentLocation();
      if (!location) {
        return;
      }
      setUserLocation(location);
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      const checkIn = await communityService.submitCheckIn({
        userId: 'user-' + Date.now(),
        location: userLocation!,
        status: checkInStatus,
        message: checkInMessage || undefined,
      });
      setCheckIns([checkIn, ...checkIns]);
      setShowCheckInModal(false);
      setCheckInMessage('');
      setCheckInStatus('safe');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error submitting check-in:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const message = await communityService.sendMessage({
        userId: 'user-' + Date.now(),
        userName: 'Anonymous',
        message: newMessage,
        type: 'message',
        location: userLocation || undefined,
      });
      setMessages([message, ...messages]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-4 pb-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between mb-3">
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
              <Text className="text-4xl font-bold text-gray-900 mb-1">Community</Text>
              <Text className="text-gray-600 text-sm">Stay connected, help each other</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View className="flex-row gap-2 mt-2">
          {[
            { id: 'checkin' as TabType, label: 'Check-ins', icon: Shield },
            { id: 'resources' as TabType, label: 'Resources', icon: Heart },
            { id: 'chat' as TabType, label: 'Chat', icon: MessageCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => {
                  Haptics.selectionAsync();
                  setActiveTab(tab.id);
                }}
                className={`px-4 py-2 rounded-full flex-row items-center ${
                  isActive ? 'bg-blue-500' : 'bg-gray-100'
                }`}
                style={{ minHeight: 36 }}
              >
                <Icon size={16} color={isActive ? '#ffffff' : '#6B7280'} />
                <Text
                  className={`text-sm font-semibold ml-2 ${
                    isActive ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'checkin' && (
          <View className="px-6">
            {/* Check-in Button */}
            <TouchableOpacity
              onPress={() => setShowCheckInModal(true)}
              className="bg-blue-500 rounded-2xl p-6 mb-6 items-center"
              style={{ minHeight: 80 }}
            >
              <Shield size={32} color="white" />
              <Text className="text-white text-lg font-bold mt-2">Check In</Text>
              <Text className="text-blue-100 text-sm mt-1">
                Let your family know you&apos;re safe
              </Text>
            </TouchableOpacity>

            {/* Recent Check-ins */}
            <Text className="text-xl font-bold text-gray-900 mb-4">Recent Check-ins</Text>
            {checkIns.length === 0 ? (
              <View className="bg-white rounded-2xl p-6 items-center border border-gray-200">
                <Shield size={48} color="#9CA3AF" />
                <Text className="text-gray-600 text-center mt-4">
                  No check-ins yet. Be the first to check in!
                </Text>
              </View>
            ) : (
              checkIns.map((checkIn) => (
                <View
                  key={checkIn.id}
                  className="bg-white rounded-xl p-4 mb-3 border border-gray-200"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    elevation: 2,
                  }}
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center">
                      <View
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: getStatusColor(checkIn.status) }}
                      />
                      <Text
                        className="text-sm font-semibold capitalize"
                        style={{ color: getStatusColor(checkIn.status) }}
                      >
                        {checkIn.status.replace('_', ' ')}
                      </Text>
                    </View>
                    <Text className="text-gray-400 text-xs">{formatTimeAgo(checkIn.timestamp)}</Text>
                  </View>
                  {checkIn.message && (
                    <Text className="text-gray-900 text-base mb-2">{checkIn.message}</Text>
                  )}
                  <Text className="text-gray-500 text-xs">
                    {checkIn.location.latitude.toFixed(4)}, {checkIn.location.longitude.toFixed(4)}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'resources' && (
          <View className="px-6">
            {/* Action Buttons */}
            <View className="flex-row gap-3 mb-6">
              <TouchableOpacity
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setResourceModalType('request');
                  setShowResourceModal(true);
                }}
                className="flex-1 bg-red-500 rounded-xl py-4 items-center"
                style={{ minHeight: 60 }}
              >
                <Plus size={24} color="white" />
                <Text className="text-white font-bold mt-2">Request Help</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setResourceModalType('offer');
                  setShowResourceModal(true);
                }}
                className="flex-1 bg-green-500 rounded-xl py-4 items-center"
                style={{ minHeight: 60 }}
              >
                <Heart size={24} color="white" />
                <Text className="text-white font-bold mt-2">Offer Help</Text>
              </TouchableOpacity>
            </View>

            {/* Resource Requests */}
            <Text className="text-xl font-bold text-gray-900 mb-4">Requests for Help</Text>
            {resourceRequests.length === 0 ? (
              <View className="bg-white rounded-2xl p-6 items-center border border-gray-200 mb-6">
                <Heart size={48} color="#9CA3AF" />
                <Text className="text-gray-600 text-center mt-4">
                  No active requests nearby
                </Text>
              </View>
            ) : (
              resourceRequests.map((request) => (
                <TouchableOpacity
                  key={request.id}
                  className="bg-white rounded-xl p-4 mb-3 border-l-4 border-red-500 border border-gray-200"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    elevation: 2,
                  }}
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-lg font-bold text-gray-900">{request.title}</Text>
                    <View
                      className="px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: getUrgencyColor(request.urgency) + '20',
                      }}
                    >
                      <Text
                        className="text-xs font-semibold capitalize"
                        style={{ color: getUrgencyColor(request.urgency) }}
                      >
                        {request.urgency}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-gray-700 text-sm mb-2">{request.description}</Text>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-gray-500 text-xs capitalize">{request.type}</Text>
                    <Text className="text-gray-400 text-xs">{formatTimeAgo(request.timestamp)}</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}

            {/* Resource Offers */}
            <Text className="text-xl font-bold text-gray-900 mb-4 mt-6">Available Resources</Text>
            {resourceOffers.length === 0 ? (
              <View className="bg-white rounded-2xl p-6 items-center border border-gray-200">
                <Heart size={48} color="#9CA3AF" />
                <Text className="text-gray-600 text-center mt-4">
                  No resources available nearby
                </Text>
              </View>
            ) : (
              resourceOffers.map((offer) => (
                <TouchableOpacity
                  key={offer.id}
                  className="bg-white rounded-xl p-4 mb-3 border-l-4 border-green-500 border border-gray-200"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    elevation: 2,
                  }}
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-lg font-bold text-gray-900">{offer.title}</Text>
                    <CheckCircle size={20} color="#10B981" />
                  </View>
                  <Text className="text-gray-700 text-sm mb-2">{offer.description}</Text>
                  {offer.quantity && (
                    <Text className="text-gray-600 text-sm mb-2">Quantity: {offer.quantity}</Text>
                  )}
                  <View className="flex-row items-center justify-between">
                    <Text className="text-gray-500 text-xs capitalize">{offer.type}</Text>
                    <Text className="text-gray-400 text-xs">{formatTimeAgo(offer.timestamp)}</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {activeTab === 'chat' && (
          <View className="px-6">
            <Text className="text-xl font-bold text-gray-900 mb-4">Community Chat</Text>
            {messages.length === 0 ? (
              <View className="bg-white rounded-2xl p-6 items-center border border-gray-200">
                <MessageCircle size={48} color="#9CA3AF" />
                <Text className="text-gray-600 text-center mt-4">
                  No messages yet. Start the conversation!
                </Text>
              </View>
            ) : (
              messages
                .slice()
                .reverse()
                .map((message) => (
                  <View
                    key={message.id}
                    className="bg-white rounded-xl p-4 mb-3 border border-gray-200"
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.1,
                      shadowRadius: 2,
                      elevation: 2,
                    }}
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-sm font-semibold text-gray-900">
                        {message.userName}
                      </Text>
                      <Text className="text-gray-400 text-xs">{formatTimeAgo(message.timestamp)}</Text>
                    </View>
                    <Text className="text-gray-900 text-base">{message.message}</Text>
                  </View>
                ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Chat Input */}
      {activeTab === 'chat' && (
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
          <View className="flex-row items-center gap-3">
            <TextInput
              className="flex-1 bg-gray-100 rounded-full px-4 py-3 text-gray-900"
              placeholder="Type a message..."
              placeholderTextColor="#9CA3AF"
              value={newMessage}
              onChangeText={setNewMessage}
              onSubmitEditing={handleSendMessage}
              style={{ minHeight: 50 }}
            />
            <TouchableOpacity
              onPress={handleSendMessage}
              disabled={!newMessage.trim()}
              className={`rounded-full p-3 ${
                newMessage.trim() ? 'bg-blue-500' : 'bg-gray-300'
              }`}
              style={{ minHeight: 50, minWidth: 50 }}
            >
              <Send size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Check-in Modal */}
      <Modal
        visible={showCheckInModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCheckInModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 pb-12">
            <Text className="text-2xl font-bold text-gray-900 mb-4">Safety Check-in</Text>
            
            <Text className="text-base font-semibold text-gray-900 mb-3">Status</Text>
            {(['safe', 'needs_help', 'evacuating'] as const).map((status) => (
              <TouchableOpacity
                key={status}
                onPress={() => {
                  Haptics.selectionAsync();
                  setCheckInStatus(status);
                }}
                className={`rounded-xl p-4 mb-3 border-2 ${
                  checkInStatus === status ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                }`}
                style={{ minHeight: 60 }}
              >
                <Text
                  className={`text-base font-semibold capitalize ${
                    checkInStatus === status ? 'text-blue-700' : 'text-gray-900'
                  }`}
                >
                  {status.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}

            <Text className="text-base font-semibold text-gray-900 mb-3 mt-4">Message (Optional)</Text>
            <TextInput
              className="bg-gray-100 rounded-xl px-4 py-3 text-gray-900 border border-gray-200"
              placeholder="Add a message..."
              placeholderTextColor="#9CA3AF"
              value={checkInMessage}
              onChangeText={setCheckInMessage}
              multiline
              numberOfLines={3}
              style={{ minHeight: 80, textAlignVertical: 'top' }}
            />

            <TouchableOpacity
              onPress={handleCheckIn}
              className="bg-blue-500 rounded-xl py-4 items-center mt-6"
              style={{ minHeight: 60 }}
            >
              <Text className="text-white font-bold text-lg">Check In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowCheckInModal(false)}
              className="bg-gray-100 rounded-xl py-4 items-center mt-3"
              style={{ minHeight: 60 }}
            >
              <Text className="text-gray-700 font-semibold text-lg">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Resource Modal */}
      <Modal
        visible={showResourceModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowResourceModal(false);
          // Reset form
          setResourceTitle('');
          setResourceDescription('');
          setResourceQuantity('');
          setResourceType('food');
          setResourceUrgency('medium');
        }}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 pb-12 max-h-[90%]">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-2xl font-bold text-gray-900">
                {resourceModalType === 'request' ? 'Request Resource' : 'Offer Resource'}
              </Text>
              <Pressable
                onPress={() => {
                  setShowResourceModal(false);
                  setResourceTitle('');
                  setResourceDescription('');
                  setResourceQuantity('');
                  setResourceType('food');
                  setResourceUrgency('medium');
                }}
                className="bg-gray-100 rounded-full p-2"
              >
                <Text className="text-gray-700 font-semibold">✕</Text>
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Type Toggle */}
              <View className="flex-row gap-2 mb-4">
                <TouchableOpacity
                  onPress={() => {
                    Haptics.selectionAsync();
                    setResourceModalType('request');
                  }}
                  className={`flex-1 py-3 rounded-xl border-2 ${
                    resourceModalType === 'request'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white'
                  }`}
                  style={{ minHeight: 50 }}
                >
                  <Text
                    className={`text-center font-semibold ${
                      resourceModalType === 'request' ? 'text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    Request
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    Haptics.selectionAsync();
                    setResourceModalType('offer');
                  }}
                  className={`flex-1 py-3 rounded-xl border-2 ${
                    resourceModalType === 'offer'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white'
                  }`}
                  style={{ minHeight: 50 }}
                >
                  <Text
                    className={`text-center font-semibold ${
                      resourceModalType === 'offer' ? 'text-green-700' : 'text-gray-700'
                    }`}
                  >
                    Offer
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Resource Type */}
              <Text className="text-base font-semibold text-gray-900 mb-2">Resource Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                {(['food', 'water', 'medical', 'shelter', 'transport', 'other'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setResourceType(type);
                    }}
                    className={`px-4 py-2 rounded-full mr-2 border-2 ${
                      resourceType === type
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <Text
                      className={`font-semibold capitalize ${
                        resourceType === type ? 'text-blue-700' : 'text-gray-700'
                      }`}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Title */}
              <Text className="text-base font-semibold text-gray-900 mb-2">Title</Text>
              <TextInput
                className="bg-gray-100 rounded-xl px-4 py-3 text-gray-900 border border-gray-200 mb-4"
                placeholder="e.g., Need clean water"
                placeholderTextColor="#9CA3AF"
                value={resourceTitle}
                onChangeText={setResourceTitle}
                style={{ minHeight: 50 }}
              />

              {/* Description */}
              <Text className="text-base font-semibold text-gray-900 mb-2">Description</Text>
              <TextInput
                className="bg-gray-100 rounded-xl px-4 py-3 text-gray-900 border border-gray-200 mb-4"
                placeholder="Provide more details..."
                placeholderTextColor="#9CA3AF"
                value={resourceDescription}
                onChangeText={setResourceDescription}
                multiline
                numberOfLines={4}
                style={{ minHeight: 100, textAlignVertical: 'top' }}
              />

              {/* Quantity */}
              <Text className="text-base font-semibold text-gray-900 mb-2">Quantity (Optional)</Text>
              <TextInput
                className="bg-gray-100 rounded-xl px-4 py-3 text-gray-900 border border-gray-200 mb-4"
                placeholder="e.g., 10 liters, 5 boxes"
                placeholderTextColor="#9CA3AF"
                value={resourceQuantity}
                onChangeText={setResourceQuantity}
                style={{ minHeight: 50 }}
              />

              {/* Urgency (only for requests) */}
              {resourceModalType === 'request' && (
                <>
                  <Text className="text-base font-semibold text-gray-900 mb-2">Urgency</Text>
                  <View className="flex-row gap-2 mb-4">
                    {(['low', 'medium', 'high', 'critical'] as const).map((urgency) => (
                      <TouchableOpacity
                        key={urgency}
                        onPress={() => {
                          Haptics.selectionAsync();
                          setResourceUrgency(urgency);
                        }}
                        className={`flex-1 py-3 rounded-xl border-2 ${
                          resourceUrgency === urgency
                            ? `border-${getUrgencyColor(urgency)} bg-${getUrgencyColor(urgency)}/10`
                            : 'border-gray-200 bg-white'
                        }`}
                        style={{
                          minHeight: 50,
                          borderColor: resourceUrgency === urgency ? getUrgencyColor(urgency) : '#E5E7EB',
                          backgroundColor: resourceUrgency === urgency ? `${getUrgencyColor(urgency)}20` : '#FFFFFF',
                        }}
                      >
                        <Text
                          className="text-center font-semibold capitalize"
                          style={{
                            color: resourceUrgency === urgency ? getUrgencyColor(urgency) : '#374151',
                          }}
                        >
                          {urgency}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                onPress={async () => {
                  if (!resourceTitle.trim() || !resourceDescription.trim()) {
                    return;
                  }

                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

                  try {
                    if (!userLocation) {
                      const location = await getCurrentLocation();
                      if (!location) {
                        alert('Unable to get location. Please enable location services.');
                        return;
                      }
                      setUserLocation(location);
                    }

                    if (resourceModalType === 'request') {
                      const request = await communityService.createResourceRequest({
                        userId: 'current-user',
                        type: resourceType,
                        title: resourceTitle,
                        description: resourceDescription,
                        location: userLocation!,
                        urgency: resourceUrgency,
                        quantity: resourceQuantity || undefined,
                      });
                      setResourceRequests((prev) => [request, ...prev]);
                    } else {
                      const offer = await communityService.createResourceOffer({
                        userId: 'current-user',
                        type: resourceType,
                        title: resourceTitle,
                        description: resourceDescription,
                        location: userLocation!,
                        quantity: resourceQuantity || undefined,
                      });
                      setResourceOffers((prev) => [offer, ...prev]);
                    }

                    // Reset form and close modal
                    setResourceTitle('');
                    setResourceDescription('');
                    setResourceQuantity('');
                    setResourceType('food');
                    setResourceUrgency('medium');
                    setShowResourceModal(false);
                    setActiveTab('resources');
                  } catch (error) {
                    console.error('Error creating resource:', error);
                    alert('Failed to create resource. Please try again.');
                  }
                }}
                disabled={!resourceTitle.trim() || !resourceDescription.trim()}
                className={`rounded-xl py-4 items-center ${
                  resourceTitle.trim() && resourceDescription.trim()
                    ? resourceModalType === 'request'
                      ? 'bg-blue-500'
                      : 'bg-green-500'
                    : 'bg-gray-300'
                }`}
                style={{ minHeight: 60 }}
              >
                <Text className="text-white font-bold text-lg">
                  {resourceModalType === 'request' ? 'Submit Request' : 'Submit Offer'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setShowResourceModal(false);
                  setResourceTitle('');
                  setResourceDescription('');
                  setResourceQuantity('');
                  setResourceType('food');
                  setResourceUrgency('medium');
                }}
                className="bg-gray-100 rounded-xl py-4 items-center mt-3"
                style={{ minHeight: 60 }}
              >
                <Text className="text-gray-700 font-semibold text-lg">Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

