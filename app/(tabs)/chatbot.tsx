import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAccessibility } from '@/hooks/useAccessibility';
import * as Haptics from 'expo-haptics';
import { Bot, Phone, Send } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Linking,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NewsItem } from '../../src/data/alertsData';
import { contactsData, EmergencyContact } from '../../src/data/contactsData';
import { Guide } from '../../src/data/guidesData';
import { getAlerts, searchGuides } from '../../src/services/dataService';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  data?: {
    type: 'guide' | 'alert' | 'contact';
    item: Guide | NewsItem | EmergencyContact;
  };
}

interface ChatResponse {
  text: string;
  data?: {
    type: 'guide' | 'alert' | 'contact';
    item: Guide | NewsItem | EmergencyContact;
  };
}

/**
 * Rule-based inference engine to analyze user queries
 */
const analyzeQuery = (text: string): ChatResponse => {
  const lowerText = text.toLowerCase();

  // Medical keywords: bleed, cut, pain, burn, injury, wound, etc.
  const medicalKeywords = ['bleed', 'cut', 'pain', 'burn', 'injury', 'wound', 'hurt', 'medical', 'first aid', 'treatment'];
  const hasMedicalKeyword = medicalKeywords.some(keyword => lowerText.includes(keyword));

  if (hasMedicalKeyword) {
    // Search guides by tags
    const matchingGuides = searchGuides(text);
    if (matchingGuides.length > 0) {
      const bestMatch = matchingGuides[0];
      return {
        text: `I found a guide that might help: "${bestMatch.title}". Here's what you need to know:`,
        data: {
          type: 'guide',
          item: bestMatch,
        },
      };
    } else {
      return {
        text: "I couldn't find a specific guide for that, but I can help with First Aid, Alerts, or Contacts. Try asking 'How to treat a burn?'",
      };
    }
  }

  // Weather/Disaster keywords: flood, rain, storm, earthquake, etc.
  const disasterKeywords = ['flood', 'rain', 'storm', 'earthquake', 'disaster', 'alert', 'warning', 'emergency'];
  const hasDisasterKeyword = disasterKeywords.some(keyword => lowerText.includes(keyword));

  if (hasDisasterKeyword) {
    // Get recent alerts (sorted by timestamp, newest first)
    const recentAlerts = getAlerts().slice(0, 3);
    if (recentAlerts.length > 0) {
      const latestAlert = recentAlerts[0];
      return {
        text: `Here's the latest alert I found:`,
        data: {
          type: 'alert',
          item: latestAlert,
        },
      };
    } else {
      return {
        text: "I don't have any recent alerts right now. Stay safe and check back later for updates.",
      };
    }
  }

  // Emergency contact keywords: police, ambulance, rescue, help, call
  const contactKeywords = ['police', 'ambulance', 'rescue', 'call', 'help', 'emergency contact', '1122', '15'];
  const hasContactKeyword = contactKeywords.some(keyword => lowerText.includes(keyword));

  if (hasContactKeyword) {
    // Find relevant contacts
    let matchingContacts: EmergencyContact[] = [];
    
    if (lowerText.includes('police')) {
      matchingContacts = contactsData.filter(c => c.category === 'POLICE');
    } else if (lowerText.includes('ambulance')) {
      matchingContacts = contactsData.filter(c => c.category === 'AMBULANCE');
    } else {
      // Default: show 24/7 services
      matchingContacts = contactsData.filter(c => c.is24_7).slice(0, 3);
    }

    if (matchingContacts.length > 0) {
      const contact = matchingContacts[0];
      return {
        text: `I found an emergency contact for you:`,
        data: {
          type: 'contact',
          item: contact,
        },
      };
    } else {
      return {
        text: "I couldn't find a specific contact. Try asking for 'police' or 'ambulance'.",
      };
    }
  }

  // Default fallback
  return {
    text: "I can help with First Aid, Alerts, or Contacts. Try asking 'How to treat a burn?' or 'Show me flood alerts' or 'I need police'",
  };
};

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { themeColors } = useAccessibility();
  
  if (message.isUser) {
    return (
      <View className="flex-row justify-end mb-4">
        <View style={{ backgroundColor: themeColors.primary, borderRadius: 16, borderTopRightRadius: 4, paddingHorizontal: 16, paddingVertical: 12, maxWidth: '80%' }}>
          <Text style={{ color: '#FFFFFF', fontSize: 16 }}>{message.text}</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-row justify-start mb-4">
      <View style={{ backgroundColor: themeColors.background, borderRadius: 16, borderTopLeftRadius: 4, paddingHorizontal: 16, paddingVertical: 12, maxWidth: '80%', borderWidth: 1, borderColor: themeColors.border }}>
        <ThemedText className="text-base">{message.text}</ThemedText>
        {message.data && (
          <View className="mt-3">
            {message.data.type === 'guide' && <GuideCard guide={message.data.item as Guide} />}
            {message.data.type === 'alert' && <AlertCard alert={message.data.item as NewsItem} />}
            {message.data.type === 'contact' && <ContactCard contact={message.data.item as EmergencyContact} />}
          </View>
        )}
      </View>
    </View>
  );
};

interface GuideCardProps {
  guide: Guide;
}

const GuideCard: React.FC<GuideCardProps> = ({ guide }) => {
  const { themeColors } = useAccessibility();
  return (
    <View style={{ backgroundColor: themeColors.card, borderRadius: 12, padding: 12, marginTop: 8, borderWidth: 1, borderColor: themeColors.border }}>
      <ThemedText className="font-bold text-base mb-1">{guide.title}</ThemedText>
      <ThemedText className="text-sm mb-2" style={{ opacity: 0.7 }}>
        {guide.steps.length} {guide.steps.length === 1 ? 'step' : 'steps'}
      </ThemedText>
      <View className="flex-row items-center">
        <View style={{ backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
          <Text style={{ color: '#B91C1C', fontSize: 12, fontWeight: '600' }}>
            {guide.category === 'FIRST_AID' ? 'First Aid' : guide.category}
          </Text>
        </View>
      </View>
    </View>
  );
};

interface AlertCardProps {
  alert: NewsItem;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert }) => {
  const { themeColors } = useAccessibility();
  const getSeverityColor = (severity: NewsItem['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return { bg: '#FEE2E2', text: '#B91C1C' };
      case 'WARNING':
        return { bg: '#FED7AA', text: '#C2410C' };
      case 'INFO':
        return { bg: '#DBEAFE', text: '#1E40AF' };
      default:
        return { bg: themeColors.background, text: themeColors.text };
    }
  };

  const colors = getSeverityColor(alert.severity);
  return (
    <View style={{ backgroundColor: themeColors.card, borderRadius: 12, padding: 12, marginTop: 8, borderWidth: 1, borderColor: themeColors.border }}>
      <View className="flex-row items-center justify-between mb-2">
        <ThemedText className="font-bold text-base flex-1">{alert.title}</ThemedText>
        <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, backgroundColor: colors.bg }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text }}>{alert.severity}</Text>
        </View>
      </View>
      <ThemedText className="text-sm mb-2" style={{ opacity: 0.7 }} numberOfLines={2}>
        {alert.content}
      </ThemedText>
      <ThemedText className="text-xs" style={{ opacity: 0.6 }}>{alert.location}</ThemedText>
    </View>
  );
};

interface ContactCardProps {
  contact: EmergencyContact;
}

const ContactCard: React.FC<ContactCardProps> = ({ contact }) => {
  const { themeColors } = useAccessibility();
  const handleCall = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      const url = `tel:${contact.phone}`;
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Error opening phone dialer:', error);
    }
  };

  return (
    <View style={{ backgroundColor: themeColors.card, borderRadius: 12, padding: 12, marginTop: 8, borderWidth: 1, borderColor: themeColors.border }}>
      <ThemedText className="font-bold text-base mb-1">{contact.name}</ThemedText>
      <ThemedText className="text-sm mb-3" style={{ opacity: 0.7 }}>{contact.phone}</ThemedText>
      <TouchableOpacity
        onPress={handleCall}
        style={{ backgroundColor: '#22C55E', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', minHeight: 60 }}
      >
        <Phone size={20} color="white" />
        <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16, marginLeft: 8 }}>Call Now</Text>
      </TouchableOpacity>
    </View>
  );
};

interface TypingIndicatorProps {}

const TypingIndicator: React.FC<TypingIndicatorProps> = () => {
  const { themeColors } = useAccessibility();
  return (
    <View className="flex-row justify-start mb-4">
      <View style={{ backgroundColor: themeColors.background, borderRadius: 16, borderTopLeftRadius: 4, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: themeColors.border }}>
        <View className="flex-row">
          <View style={{ width: 8, height: 8, backgroundColor: themeColors.text, borderRadius: 9999, marginRight: 4, opacity: 0.6 }} />
          <View style={{ width: 8, height: 8, backgroundColor: themeColors.text, borderRadius: 9999, marginRight: 4, opacity: 0.6 }} />
          <View style={{ width: 8, height: 8, backgroundColor: themeColors.text, borderRadius: 9999, opacity: 0.6 }} />
        </View>
      </View>
    </View>
  );
};

export default function ChatbotScreen() {
  const insets = useSafeAreaInsets();
  const { themeColors } = useAccessibility();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI Assistant. I can help with First Aid guides, Emergency Alerts, or Emergency Contacts. What do you need?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  
  // Navbar height + safe area bottom
  const navbarHeight = 56 + insets.bottom;

  useEffect(() => {
    // Scroll to bottom when messages change
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputText.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Simulate typing delay (500ms)
    setTimeout(() => {
      const response = analyzeQuery(userMessage.text);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        isUser: false,
        timestamp: new Date(),
        data: response.data,
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 500);
  };

  return (
    <ThemedView className="flex-1">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? navbarHeight + 20 : navbarHeight}
      >
        {/* Header */}
        <View style={{ backgroundColor: themeColors.card, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: themeColors.border, flexDirection: 'row', alignItems: 'center' }}>
          <Bot size={24} color={themeColors.primary} />
          <ThemedText className="text-xl font-bold ml-2">AI Assistant</ThemedText>
        </View>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          contentContainerStyle={{ padding: 16, paddingBottom: navbarHeight + 100 }}
          ListFooterComponent={isTyping ? <TypingIndicator /> : null}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Input Bar - Positioned absolutely above navbar */}
        <View 
          style={{ 
            backgroundColor: themeColors.card,
            borderTopWidth: 1,
            borderTopColor: themeColors.border,
            paddingHorizontal: 16,
            paddingVertical: 12,
            position: 'absolute',
            bottom: navbarHeight,
            left: 0,
            right: 0,
            paddingBottom: insets.bottom + 8,
            zIndex: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 5,
          }}
        >
          <View className="flex-row items-center">
            <TextInput
              style={{
                flex: 1,
                backgroundColor: themeColors.background,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                color: themeColors.text,
                marginRight: 12,
                minHeight: 50,
                maxHeight: 100,
                borderWidth: 1,
                borderColor: themeColors.border,
              }}
              placeholder="Ask me anything..."
              placeholderTextColor={themeColors.text + '80'}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
              returnKeyType="send"
              multiline
            />
            <TouchableOpacity
              onPress={handleSend}
              disabled={!inputText.trim() || isTyping}
              style={{
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: inputText.trim() && !isTyping ? themeColors.primary : themeColors.border,
                minHeight: 60,
                minWidth: 60,
              }}
            >
              <Send size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
