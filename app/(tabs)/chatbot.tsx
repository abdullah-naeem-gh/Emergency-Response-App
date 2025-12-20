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
  if (message.isUser) {
    return (
      <View className="flex-row justify-end mb-4">
        <View className="bg-blue-500 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
          <Text className="text-white text-base">{message.text}</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-row justify-start mb-4">
      <View className="bg-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
        <Text className="text-gray-900 text-base">{message.text}</Text>
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
  return (
    <View className="bg-white rounded-xl p-3 mt-2 border border-gray-300">
      <Text className="text-gray-900 font-bold text-base mb-1">{guide.title}</Text>
      <Text className="text-gray-600 text-sm mb-2">
        {guide.steps.length} {guide.steps.length === 1 ? 'step' : 'steps'}
      </Text>
      <View className="flex-row items-center">
        <View className="bg-red-100 px-2 py-1 rounded">
          <Text className="text-red-700 text-xs font-semibold">
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
  const getSeverityColor = (severity: NewsItem['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-700';
      case 'WARNING':
        return 'bg-orange-100 text-orange-700';
      case 'INFO':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <View className="bg-white rounded-xl p-3 mt-2 border border-gray-300">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-gray-900 font-bold text-base flex-1">{alert.title}</Text>
        <View className={`px-2 py-1 rounded ${getSeverityColor(alert.severity)}`}>
          <Text className="text-xs font-semibold">{alert.severity}</Text>
        </View>
      </View>
      <Text className="text-gray-600 text-sm mb-2" numberOfLines={2}>
        {alert.content}
      </Text>
      <Text className="text-gray-500 text-xs">{alert.location}</Text>
    </View>
  );
};

interface ContactCardProps {
  contact: EmergencyContact;
}

const ContactCard: React.FC<ContactCardProps> = ({ contact }) => {
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
    <View className="bg-white rounded-xl p-3 mt-2 border border-gray-300">
      <Text className="text-gray-900 font-bold text-base mb-1">{contact.name}</Text>
      <Text className="text-gray-600 text-sm mb-3">{contact.phone}</Text>
      <TouchableOpacity
        onPress={handleCall}
        className="bg-green-500 rounded-xl px-4 py-3 flex-row items-center justify-center"
        style={{ minHeight: 60 }}
      >
        <Phone size={20} color="white" />
        <Text className="text-white font-bold text-base ml-2">Call Now</Text>
      </TouchableOpacity>
    </View>
  );
};

interface TypingIndicatorProps {}

const TypingIndicator: React.FC<TypingIndicatorProps> = () => {
  return (
    <View className="flex-row justify-start mb-4">
      <View className="bg-gray-200 rounded-2xl rounded-tl-sm px-4 py-3">
        <View className="flex-row">
          <View className="w-2 h-2 bg-gray-500 rounded-full mr-1" />
          <View className="w-2 h-2 bg-gray-500 rounded-full mr-1" />
          <View className="w-2 h-2 bg-gray-500 rounded-full" />
        </View>
      </View>
    </View>
  );
};

export default function ChatbotScreen() {
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
    <View className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View className="bg-white px-4 py-3 border-b border-gray-200 flex-row items-center">
          <Bot size={24} color="#3B82F6" />
          <Text className="text-xl font-bold text-gray-900 ml-2">AI Assistant</Text>
        </View>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
          ListFooterComponent={isTyping ? <TypingIndicator /> : null}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Input Bar */}
        <View className="bg-white border-t border-gray-200 px-4 py-3">
          <View className="flex-row items-center">
            <TextInput
              className="flex-1 bg-gray-100 rounded-xl px-4 py-3 text-base text-gray-900 mr-3"
              placeholder="Ask me anything..."
              placeholderTextColor="#9CA3AF"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
              returnKeyType="send"
              multiline
              style={{ minHeight: 50, maxHeight: 100 }}
            />
            <TouchableOpacity
              onPress={handleSend}
              disabled={!inputText.trim() || isTyping}
              className={`rounded-xl px-4 py-3 items-center justify-center ${
                inputText.trim() && !isTyping ? 'bg-blue-500' : 'bg-gray-300'
              }`}
              style={{ minHeight: 60, minWidth: 60 }}
            >
              <Send size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
