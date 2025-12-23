import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAccessibility } from '@/hooks/useAccessibility';
import { useTranslation } from '@/hooks/useTranslation';
import { useTextInputStyles } from '@/utils/i18n';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Event interface
interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  organizer: string;
  venue: string;
  venueAddress: string;
  date: string; // ISO date string
  time: string; // Time string like "9:00 AM"
  duration: string; // Duration like "3 hours"
  category: 'cleanup' | 'volunteering' | 'donation' | 'awareness' | 'other';
  participants: number;
  maxParticipants?: number;
  imageUrl?: string;
  requirements?: string[];
  contactEmail?: string;
  contactPhone?: string;
  timestamp: number;
}

// Mock events data
const mockEvents: CommunityEvent[] = [
  {
    id: '1',
    title: 'Karachi Clifton Beach Clean Up Drive',
    description: 'Join us for a community beach cleanup drive at Clifton Beach. Help us keep our beaches clean and protect marine life. All volunteers welcome!',
    organizer: 'Karachi Environmental Society',
    venue: 'Clifton Beach',
    venueAddress: 'Clifton Beach, Block 9, Clifton, Karachi',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    time: '8:00 AM',
    duration: '3 hours',
    category: 'cleanup',
    participants: 45,
    maxParticipants: 100,
    requirements: ['Gloves', 'Water bottle', 'Comfortable shoes'],
    contactEmail: 'info@karachienv.org',
    contactPhone: '+92-300-1234567',
    timestamp: Date.now() - 86400000, // 1 day ago
  },
  {
    id: '2',
    title: 'Islamabad Margalla Hills Clean Up Drive',
    description: 'Help preserve the natural beauty of Margalla Hills. We need volunteers to help clean hiking trails and remove litter. Refreshments provided.',
    organizer: 'Islamabad Nature Conservation',
    venue: 'Trail 3, Margalla Hills',
    venueAddress: 'Trail 3 Starting Point, Margalla Hills, Islamabad',
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
    time: '7:00 AM',
    duration: '4 hours',
    category: 'cleanup',
    participants: 32,
    maxParticipants: 80,
    requirements: ['Hiking boots', 'Backpack', 'Water bottle'],
    contactEmail: 'contact@islamabadnature.org',
    contactPhone: '+92-300-2345678',
    timestamp: Date.now() - 172800000, // 2 days ago
  },
  {
    id: '3',
    title: 'Flood Relief Donation Volunteering',
    description: 'Volunteer to help distribute relief goods to flood-affected families. We need help with organizing donations, packing supplies, and distribution.',
    organizer: 'Pakistan Relief Foundation',
    venue: 'Community Center',
    venueAddress: 'Main Community Center, Gulshan-e-Iqbal, Karachi',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    time: '10:00 AM',
    duration: '5 hours',
    category: 'volunteering',
    participants: 78,
    maxParticipants: 150,
    requirements: ['Comfortable clothing', 'ID card'],
    contactEmail: 'volunteer@pakistanrelief.org',
    contactPhone: '+92-300-3456789',
    timestamp: Date.now() - 3600000, // 1 hour ago
  },
  {
    id: '4',
    title: 'Tree Plantation Drive - Lahore',
    description: 'Join us in planting 1000 trees across Lahore parks. Help combat climate change and make Lahore greener. All tools and saplings provided.',
    organizer: 'Lahore Green Initiative',
    venue: 'Jinnah Park',
    venueAddress: 'Jinnah Park, Main Boulevard, Lahore',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
    time: '6:00 AM',
    duration: '4 hours',
    category: 'cleanup',
    participants: 120,
    maxParticipants: 200,
    requirements: ['Comfortable clothes', 'Hat', 'Water bottle'],
    contactEmail: 'info@lahoregreen.org',
    contactPhone: '+92-300-4567890',
    timestamp: Date.now() - 259200000, // 3 days ago
  },
];

// Helper function to get contrasting text color
const isLightColor = (color: string): boolean => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
};

const getContrastTextColor = (backgroundColor: string, themeColors: any): string => {
  if (isLightColor(backgroundColor)) {
    const hex = backgroundColor.replace('#', '').toUpperCase();
    if (hex === 'FFFF00' || hex === 'FFD700' || hex === 'FFA500') {
      return '#000000';
    }
    const isThemeTextDark = !isLightColor(themeColors.text || '#111827');
    return isThemeTextDark ? themeColors.text : '#000000';
  } else {
    return '#FFFFFF';
  }
};

const getCategoryColor = (category: CommunityEvent['category']): string => {
  switch (category) {
    case 'cleanup':
      return '#10B981'; // Green
    case 'volunteering':
      return '#3B82F6'; // Blue
    case 'donation':
      return '#EF4444'; // Red
    case 'awareness':
      return '#F59E0B'; // Orange
    default:
      return '#6B7280'; // Gray
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
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

export default function CommunityScreen() {
  const router = useRouter();
  const { themeColors } = useAccessibility();
  const { t } = useTranslation();
  const textInputStyles = useTextInputStyles();
  const [events, setEvents] = useState<CommunityEvent[]>(mockEvents);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CommunityEvent | null>(null);
  const [showParticipateModal, setShowParticipateModal] = useState(false);
  const [eventForParticipation, setEventForParticipation] = useState<CommunityEvent | null>(null);
  
  // Participation form state
  const [participantName, setParticipantName] = useState('');
  const [participantEmail, setParticipantEmail] = useState('');
  const [participantPhone, setParticipantPhone] = useState('');

  useEffect(() => {
    // Simulate loading
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  const handleEventPress = (event: CommunityEvent) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedEvent(event);
  };

  const handleParticipate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Store the event for participation before closing details modal
    if (selectedEvent) {
      setEventForParticipation(selectedEvent);
      setSelectedEvent(null); // Close event details modal
      setShowParticipateModal(true); // Open participation form
    }
  };

  const handleSubmitParticipation = async () => {
    if (!participantName.trim() || !participantEmail.trim() || !participantPhone.trim()) {
      return;
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      // Update event participants count
      if (eventForParticipation) {
        setEvents(events.map(e => 
          e.id === eventForParticipation.id 
            ? { ...e, participants: e.participants + 1 }
            : e
        ));
      }
      setShowParticipateModal(false);
      setEventForParticipation(null);
      setParticipantName('');
      setParticipantEmail('');
      setParticipantPhone('');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error submitting participation:', error);
    }
  };

  if (loading) {
    return (
      <ThemedView className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={themeColors.primary} />
      </ThemedView>
    );
  }

  return (
    <ThemedView className="flex-1">
      {/* Header */}
      <View style={{ 
        backgroundColor: themeColors.card, 
        paddingHorizontal: 24, 
        paddingTop: 16, 
        paddingBottom: 16, 
        borderBottomWidth: 1, 
        borderBottomColor: themeColors.border 
      }}>
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
              <ArrowLeft size={24} color={themeColors.text} />
            </Pressable>
            <View className="flex-1">
              <ThemedText className="text-4xl font-bold mb-1">{t('community.title')}</ThemedText>
              <ThemedText className="text-sm" style={{ opacity: 0.7 }}>
                {t('community.joinCommunityServiceEvents')}
              </ThemedText>
            </View>
          </View>
        </View>
      </View>

      {/* Events Feed */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6">
          {events.length === 0 ? (
            <View style={{ 
              backgroundColor: themeColors.card, 
              borderRadius: 16, 
              padding: 24, 
              alignItems: 'center', 
              borderWidth: 1, 
              borderColor: themeColors.border,
            }}>
              <Users size={48} color={themeColors.text} style={{ opacity: 0.5 }} />
              <ThemedText className="text-center mt-4" style={{ opacity: 0.7 }}>
                {t('community.noEventsAvailable')}
              </ThemedText>
            </View>
          ) : (
            events.map((event) => {
              const categoryColor = getCategoryColor(event.category);
              const isFull = event.maxParticipants && event.participants >= event.maxParticipants;
              
              return (
                <TouchableOpacity
                  key={event.id}
                  onPress={() => handleEventPress(event)}
                  style={{
                    backgroundColor: themeColors.card,
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 16,
                    borderWidth: 1,
                    borderColor: themeColors.border,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                >
                  {/* Category Badge */}
                  <View className="flex-row items-center justify-between mb-3">
                    <View style={{
                      paddingHorizontal: 12,
                      paddingVertical: 4,
                      borderRadius: 9999,
                      backgroundColor: categoryColor + '20',
                    }}>
                      <Text style={{
                        color: categoryColor,
                        fontSize: 12,
                        fontWeight: '700',
                        textTransform: 'uppercase',
                      }}>
                        {t(`community.${event.category}`)}
                      </Text>
                    </View>
                    <ThemedText className="text-xs" style={{ opacity: 0.6 }}>
                      {formatTimeAgo(event.timestamp)}
                    </ThemedText>
                  </View>

                  {/* Title */}
                  <ThemedText className="text-xl font-bold mb-2">
                    {event.title}
                  </ThemedText>

                  {/* Description */}
                  <ThemedText className="text-sm mb-4" style={{ opacity: 0.8 }} numberOfLines={2}>
                    {event.description}
                  </ThemedText>

                  {/* Event Details */}
                  <View className="mb-3">
                    <View className="flex-row items-center mb-2">
                      <Calendar size={16} color={themeColors.text} style={{ opacity: 0.7, marginRight: 8 }} />
                      <ThemedText className="text-sm" style={{ opacity: 0.8 }}>
                        {formatDate(event.date)} • {event.time}
                      </ThemedText>
                    </View>
                    <View className="flex-row items-center mb-2">
                      <Clock size={16} color={themeColors.text} style={{ opacity: 0.7, marginRight: 8 }} />
                      <ThemedText className="text-sm" style={{ opacity: 0.8 }}>
                        {t('community.duration')}: {event.duration}
                      </ThemedText>
                    </View>
                    <View className="flex-row items-center">
                      <MapPin size={16} color={themeColors.text} style={{ opacity: 0.7, marginRight: 8 }} />
                      <ThemedText className="text-sm flex-1" style={{ opacity: 0.8 }} numberOfLines={1}>
                        {event.venue}
                      </ThemedText>
                    </View>
                  </View>

                  {/* Participants */}
                  <View className="flex-row items-center justify-between pt-3 border-t" style={{ borderTopColor: themeColors.border }}>
                    <View className="flex-row items-center">
                      <Users size={16} color={themeColors.text} style={{ opacity: 0.7, marginRight: 6 }} />
                      <ThemedText className="text-sm" style={{ opacity: 0.8 }}>
                        {event.participants}
                        {event.maxParticipants ? ` / ${event.maxParticipants}` : ''} {t('community.participants')}
                      </ThemedText>
                    </View>
                    {isFull && (
                      <View style={{
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 6,
                        backgroundColor: '#EF444420',
                      }}>
                        <Text style={{ color: '#EF4444', fontSize: 11, fontWeight: '600' }}>
                          {t('community.eventFull')}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Event Details Modal */}
      <Modal
        visible={!!selectedEvent}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedEvent(null)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ 
            backgroundColor: themeColors.card, 
            borderTopLeftRadius: 24, 
            borderTopRightRadius: 24, 
            padding: 24, 
            paddingBottom: 48, 
            maxHeight: '90%',
          }}>
            <View className="items-center mb-4">
              <View style={{ width: 48, height: 4, backgroundColor: themeColors.border, borderRadius: 9999, marginBottom: 16 }} />
              <ThemedText className="text-2xl font-bold mb-2">
                {t('community.eventDetails')}
              </ThemedText>
            </View>

            {selectedEvent && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Category */}
                <View className="mb-4">
                  <View style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 9999,
                    backgroundColor: getCategoryColor(selectedEvent.category) + '20',
                    alignSelf: 'flex-start',
                  }}>
                    <Text style={{
                      color: getCategoryColor(selectedEvent.category),
                      fontSize: 14,
                      fontWeight: '700',
                      textTransform: 'uppercase',
                    }}>
                      {selectedEvent.category}
                    </Text>
                  </View>
                </View>

                {/* Title */}
                <ThemedText className="text-2xl font-bold mb-3">
                  {selectedEvent.title}
                </ThemedText>

                {/* Organizer */}
                <ThemedText className="text-base mb-4" style={{ opacity: 0.7 }}>
                  {t('community.organizedBy')} {selectedEvent.organizer}
                </ThemedText>

                {/* Description */}
                <ThemedText className="text-base mb-6">
                  {selectedEvent.description}
                </ThemedText>

                {/* Date & Time */}
                <View style={{
                  backgroundColor: themeColors.background,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: themeColors.border,
                }}>
                  <View className="flex-row items-center mb-3">
                    <Calendar size={20} color={themeColors.primary} style={{ marginRight: 12 }} />
                    <View className="flex-1">
                      <ThemedText className="text-sm mb-1" style={{ opacity: 0.7 }}>
                        {t('community.dateTime')}
                      </ThemedText>
                      <ThemedText className="text-base font-semibold">
                        {formatDate(selectedEvent.date)} {t('common.at') || 'at'} {selectedEvent.time}
                      </ThemedText>
                      <ThemedText className="text-sm mt-1" style={{ opacity: 0.7 }}>
                        {t('community.duration')}: {selectedEvent.duration}
                      </ThemedText>
                    </View>
                  </View>
                </View>

                {/* Venue */}
                <View style={{
                  backgroundColor: themeColors.background,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: themeColors.border,
                }}>
                  <View className="flex-row items-start">
                    <MapPin size={20} color={themeColors.primary} style={{ marginRight: 12, marginTop: 2 }} />
                    <View className="flex-1">
                      <ThemedText className="text-sm mb-1" style={{ opacity: 0.7 }}>
                        {t('community.venue')}
                      </ThemedText>
                      <ThemedText className="text-base font-semibold mb-1">
                        {selectedEvent.venue}
                      </ThemedText>
                      <ThemedText className="text-sm" style={{ opacity: 0.7 }}>
                        {selectedEvent.venueAddress}
                      </ThemedText>
                    </View>
                  </View>
                </View>

                {/* Participants */}
                <View style={{
                  backgroundColor: themeColors.background,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: themeColors.border,
                }}>
                  <View className="flex-row items-center">
                    <Users size={20} color={themeColors.primary} style={{ marginRight: 12 }} />
                    <View className="flex-1">
                      <ThemedText className="text-sm mb-1" style={{ opacity: 0.7 }}>
                        {t('community.participants')}
                      </ThemedText>
                      <ThemedText className="text-base font-semibold">
                        {selectedEvent.participants}
                        {selectedEvent.maxParticipants ? ` / ${selectedEvent.maxParticipants}` : ''} {t('community.registered')}
                      </ThemedText>
                    </View>
                  </View>
                </View>

                {/* Requirements */}
                {selectedEvent.requirements && selectedEvent.requirements.length > 0 && (
                  <View style={{
                    backgroundColor: themeColors.background,
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 16,
                    borderWidth: 1,
                    borderColor: themeColors.border,
                  }}>
                    <ThemedText className="text-sm mb-2" style={{ opacity: 0.7 }}>
                      {t('community.whatToBring')}
                    </ThemedText>
                    {selectedEvent.requirements.map((req, index) => (
                      <View key={index} className="flex-row items-center mb-1">
                        <View style={{
                          width: 6,
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: themeColors.primary,
                          marginRight: 8,
                        }} />
                        <ThemedText className="text-base">{req}</ThemedText>
                      </View>
                    ))}
                  </View>
                )}

                {/* Contact Info */}
                {(selectedEvent.contactEmail || selectedEvent.contactPhone) && (
                  <View style={{
                    backgroundColor: themeColors.background,
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 24,
                    borderWidth: 1,
                    borderColor: themeColors.border,
                  }}>
                    <ThemedText className="text-sm mb-2" style={{ opacity: 0.7 }}>
                      {t('community.contactInformation')}
                    </ThemedText>
                    {selectedEvent.contactEmail && (
                      <ThemedText className="text-base mb-1">
                        {t('community.email')}: {selectedEvent.contactEmail}
                      </ThemedText>
                    )}
                    {selectedEvent.contactPhone && (
                      <ThemedText className="text-base">
                        {t('community.phone')}: {selectedEvent.contactPhone}
                      </ThemedText>
                    )}
                  </View>
                )}

                {/* Participate Button */}
                <TouchableOpacity
                  onPress={handleParticipate}
                  disabled={selectedEvent.maxParticipants ? selectedEvent.participants >= selectedEvent.maxParticipants : false}
                  style={{
                    backgroundColor: selectedEvent.maxParticipants && selectedEvent.participants >= selectedEvent.maxParticipants
                      ? themeColors.border
                      : themeColors.primary,
                    borderRadius: 12,
                    paddingVertical: 16,
                    alignItems: 'center',
                    marginBottom: 12,
                    minHeight: 60,
                    borderWidth: 1,
                    borderColor: themeColors.border,
                  }}
                >
                  <Text style={{
                    color: selectedEvent.maxParticipants && selectedEvent.participants >= selectedEvent.maxParticipants
                      ? themeColors.text
                      : getContrastTextColor(themeColors.primary, themeColors),
                    fontWeight: '700',
                    fontSize: 18,
                  }}>
                    {selectedEvent.maxParticipants && selectedEvent.participants >= selectedEvent.maxParticipants
                      ? t('community.eventFull')
                      : t('community.participate')}
                  </Text>
                </TouchableOpacity>

                {/* Close Button */}
                <TouchableOpacity
                  onPress={() => setSelectedEvent(null)}
                  style={{
                    backgroundColor: themeColors.background,
                    borderRadius: 12,
                    paddingVertical: 16,
                    alignItems: 'center',
                    minHeight: 60,
                    borderWidth: 1,
                    borderColor: themeColors.border,
                  }}
                >
                  <ThemedText className="font-semibold text-lg">{t('common.close')}</ThemedText>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Participation Form Modal */}
      <Modal
        visible={showParticipateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowParticipateModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ 
            backgroundColor: themeColors.card, 
            borderTopLeftRadius: 24, 
            borderTopRightRadius: 24, 
            padding: 24, 
            paddingBottom: 48,
          }}>
            <View className="items-center mb-4">
              <View style={{ width: 48, height: 4, backgroundColor: themeColors.border, borderRadius: 9999, marginBottom: 16 }} />
              <ThemedText className="text-2xl font-bold mb-2">
                {t('community.participateInEvent')}
              </ThemedText>
              {eventForParticipation && (
                <ThemedText className="text-base text-center" style={{ opacity: 0.7 }}>
                  {eventForParticipation.title}
                </ThemedText>
              )}
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Name Input */}
              <ThemedText className="text-base font-semibold mb-2 mt-4">{t('community.fullName')}</ThemedText>
              <TextInput
                style={[
                  {
                    backgroundColor: themeColors.background,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    color: themeColors.text,
                    borderWidth: 1,
                    borderColor: themeColors.border,
                    marginBottom: 16,
                    minHeight: 50,
                  },
                  textInputStyles,
                ]}
                placeholder={t('community.fullNamePlaceholder')}
                placeholderTextColor={themeColors.text + '80'}
                value={participantName}
                onChangeText={setParticipantName}
              />

              {/* Email Input */}
              <ThemedText className="text-base font-semibold mb-2">{t('community.emailAddress')}</ThemedText>
              <TextInput
                style={[
                  {
                    backgroundColor: themeColors.background,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    color: themeColors.text,
                    borderWidth: 1,
                    borderColor: themeColors.border,
                    marginBottom: 16,
                    minHeight: 50,
                    keyboardType: 'email-address',
                    autoCapitalize: 'none',
                  },
                  textInputStyles,
                ]}
                placeholder={t('community.emailPlaceholder')}
                placeholderTextColor={themeColors.text + '80'}
                value={participantEmail}
                onChangeText={setParticipantEmail}
              />

              {/* Phone Input */}
              <ThemedText className="text-base font-semibold mb-2">{t('community.phoneNumber')}</ThemedText>
              <TextInput
                style={[
                  {
                    backgroundColor: themeColors.background,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    color: themeColors.text,
                    borderWidth: 1,
                    borderColor: themeColors.border,
                    marginBottom: 24,
                    minHeight: 50,
                    keyboardType: 'phone-pad',
                  },
                  textInputStyles,
                ]}
                placeholder={t('community.phonePlaceholder')}
                placeholderTextColor={themeColors.text + '80'}
                value={participantPhone}
                onChangeText={setParticipantPhone}
              />

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmitParticipation}
                disabled={!participantName.trim() || !participantEmail.trim() || !participantPhone.trim()}
                style={{
                  backgroundColor: participantName.trim() && participantEmail.trim() && participantPhone.trim()
                    ? themeColors.primary
                    : themeColors.border,
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: 'center',
                  marginBottom: 12,
                  minHeight: 60,
                }}
              >
                <Text style={{
                  color: participantName.trim() && participantEmail.trim() && participantPhone.trim()
                    ? (isLightColor(themeColors.primary) ? '#000000' : '#FFFFFF')
                    : themeColors.text,
                  fontWeight: '700',
                  fontSize: 18,
                }}>
                  {t('community.submitParticipation')}
                </Text>
              </TouchableOpacity>

              {/* Cancel Button */}
              <TouchableOpacity
                onPress={() => {
                  setShowParticipateModal(false);
                  setEventForParticipation(null);
                  setParticipantName('');
                  setParticipantEmail('');
                  setParticipantPhone('');
                }}
                style={{
                  backgroundColor: themeColors.background,
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: 'center',
                  minHeight: 60,
                  borderWidth: 1,
                  borderColor: themeColors.border,
                }}
              >
                <ThemedText className="font-semibold text-lg">{t('community.cancel')}</ThemedText>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}
