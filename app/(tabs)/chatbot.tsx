import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAccessibility } from '@/hooks/useAccessibility';
import { useTranslation } from '@/hooks/useTranslation';
import { useTextInputStyles } from '@/utils/i18n';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams } from 'expo-router';
import { Bot, Phone, Send } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OpenRouterError, OpenRouterMessage, openRouterService } from '../../services/OpenRouterService';
import { NewsItem } from '../../src/data/alertsData';
import { contactsData, EmergencyContact } from '../../src/data/contactsData';
import { Guide } from '../../src/data/guidesData';
import { getAlerts, searchGuides } from '../../src/services/dataService';

// Helper function to check if a color is yellow or light
const isYellowOrLightColor = (color: string): boolean => {
  const hex = color.replace('#', '').toUpperCase();
  
  // Check for common yellow colors
  if (hex === 'FFFF00' || hex === 'FFD700' || hex === 'FFA500' || hex === 'FFC107' || hex === 'FEF3C7' || hex === 'FEE2E2' || hex === 'FED7AA' || hex === 'FCE7F3' || hex === 'DBEAFE' || hex === 'DCFCE7') {
    return true;
  }
  
  // Calculate luminance for other light colors
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.6;
};

// Helper function to get text color for a background
const getTextColorForBackground = (backgroundColor: string): string => {
  if (isYellowOrLightColor(backgroundColor)) {
    return '#000000';
  }
  return '#FFFFFF';
};

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
const analyzeQuery = (text: string, t: (key: string, params?: Record<string, string | number>) => string): ChatResponse => {
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
        text: t('chatbot.foundGuide', { title: bestMatch.title }),
        data: {
          type: 'guide',
          item: bestMatch,
        },
      };
    } else {
      return {
        text: t('chatbot.noGuideFound'),
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
        text: t('chatbot.latestAlert'),
        data: {
          type: 'alert',
          item: latestAlert,
        },
      };
    } else {
      return {
        text: t('chatbot.noAlerts'),
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
        text: t('chatbot.foundContact'),
        data: {
          type: 'contact',
          item: contact,
        },
      };
    } else {
      return {
        text: t('chatbot.noContactFound'),
      };
    }
  }

  // Default fallback
  return {
    text: t('chatbot.defaultResponse'),
  };
};

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { themeColors } = useAccessibility();
  
  if (message.isUser) {
    const textColor = getTextColorForBackground(themeColors.primary);
    return (
      <View className="flex-row justify-end mb-4">
        <View style={{ backgroundColor: themeColors.primary, borderRadius: 16, borderTopRightRadius: 4, paddingHorizontal: 16, paddingVertical: 12, maxWidth: '80%' }}>
          <Text style={{ color: textColor, fontSize: 16 }}>{message.text}</Text>
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
  const { t } = useTranslation();
  return (
    <View style={{ backgroundColor: themeColors.card, borderRadius: 12, padding: 12, marginTop: 8, borderWidth: 1, borderColor: themeColors.border }}>
      <ThemedText className="font-bold text-base mb-1">{guide.title}</ThemedText>
      <ThemedText className="text-sm mb-2" style={{ opacity: 0.7 }}>
        {guide.steps.length} {guide.steps.length === 1 ? t('chatbot.step') : t('chatbot.steps')}
      </ThemedText>
      <View className="flex-row items-center">
        <View style={{ backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
          <Text style={{ color: '#B91C1C', fontSize: 12, fontWeight: '600' }}>
            {guide.category === 'FIRST_AID' ? t('chatbot.firstAid') : guide.category}
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
  const { t } = useTranslation();
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
        <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16, marginLeft: 8 }}>{t('common.callNow')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const TypingIndicator: React.FC = () => {
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
  const { themeColors, speak } = useAccessibility();
  const { t } = useTranslation();
  const textInputStyles = useTextInputStyles();
  const { initialQuery } = useLocalSearchParams<{ initialQuery?: string }>();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: t('chatbot.welcomeMessage'),
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const [conversationHistory, setConversationHistory] = useState<OpenRouterMessage[]>([]);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const hasUsedInitialQueryRef = useRef(false);
  
  // Navbar height + safe area bottom (used for spacing)
  const tabbarHeight = 56 + insets.bottom;

  useEffect(() => {
    const keyboardShowEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const keyboardHideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(keyboardShowEvent, () => setKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener(keyboardHideEvent, () => setKeyboardVisible(false));

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Auto-send initial query when coming from Home search
  useEffect(() => {
    const trimmed = typeof initialQuery === 'string' ? initialQuery.trim() : '';
    if (!trimmed || hasUsedInitialQueryRef.current || isTyping) {
      return;
    }

    hasUsedInitialQueryRef.current = true;

    // Reuse the send flow with the provided text
    void (async () => {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: trimmed,
        isUser: true,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage]);
      setIsTyping(true);

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      try {
        const structuredResponse = analyzeQuery(trimmed, t);

        const newUserMessage: OpenRouterMessage = {
          role: 'user',
          content: trimmed,
        };
        const updatedHistory = [...conversationHistory, newUserMessage];
        setConversationHistory(updatedHistory);

        const aiResponse = await openRouterService.generateEmergencyResponse(
          trimmed,
          conversationHistory
        );

        const responseText = aiResponse || structuredResponse.text;

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: responseText,
          isUser: false,
          timestamp: new Date(),
          data: structuredResponse.data,
        };

        if (aiResponse) {
          const botMessageObj: OpenRouterMessage = {
            role: 'assistant',
            content: aiResponse,
          };
          setConversationHistory([...updatedHistory, botMessageObj]);
        }

        setMessages(prev => [...prev, botMessage]);

        // Speak AI response for initial query
        speak(responseText).catch(() => {});
      } catch (error) {
        console.error('Error getting AI response (initialQuery):', error);
      } finally {
        setIsTyping(false);
      }
    })();
  }, [initialQuery, conversationHistory, isTyping, t]);

  useEffect(() => {
    // Scroll to bottom when messages change
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputText.trim() || isTyping) return;

    const userMessageText = inputText.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      text: userMessageText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      // Try to get structured data first (guides, alerts, contacts)
      const structuredResponse = analyzeQuery(userMessageText, t);
      
      // Update conversation history for OpenRouter
      const newUserMessage: OpenRouterMessage = {
        role: 'user',
        content: userMessageText,
      };
      const updatedHistory = [...conversationHistory, newUserMessage];
      setConversationHistory(updatedHistory);

      // Get AI response from OpenRouter
      const aiResponse = await openRouterService.generateEmergencyResponse(
        userMessageText,
        conversationHistory
      );

      // Use AI response if available, otherwise fall back to structured response
      const responseText = aiResponse || structuredResponse.text;
      
      // If we have structured data, include it
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        isUser: false,
        timestamp: new Date(),
        data: structuredResponse.data, // Keep structured data for cards
      };

      // Update conversation history with bot response
      if (aiResponse) {
        const botMessageObj: OpenRouterMessage = {
          role: 'assistant',
          content: aiResponse,
        };
        setConversationHistory([...updatedHistory, botMessageObj]);
      }

      setMessages(prev => [...prev, botMessage]);

      // Speak bot response if TTS/Speak Aloud enabled
      speak(responseText).catch(() => {});
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Handle OpenRouter quota/rate limit errors
      if (error && typeof error === 'object' && 'type' in error) {
        const openRouterError = error as OpenRouterError;
        let errorMessage = openRouterError.message;
        
        // Add retry time info if available
        if (openRouterError.retryAfter) {
          const minutes = Math.floor(openRouterError.retryAfter / 60);
          const seconds = openRouterError.retryAfter % 60;
          if (minutes > 0) {
            const timeUnit = minutes === 1 ? t('chatbot.minute') : t('chatbot.minutes');
            errorMessage += ' ' + t('chatbot.pleaseTryAgain', { time: `${minutes} ${timeUnit}` });
          } else if (seconds > 0) {
            const timeUnit = seconds === 1 ? t('chatbot.second') : t('chatbot.seconds');
            errorMessage += ' ' + t('chatbot.pleaseTryAgain', { time: `${seconds} ${timeUnit}` });
          }
        }
        
        const errorBotMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: errorMessage,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorBotMessage]);
        speak(errorMessage).catch(() => {});
      } else {
        // Fallback to rule-based response for other errors
        const fallbackResponse = analyzeQuery(userMessageText, t);
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: fallbackResponse.text,
          isUser: false,
          timestamp: new Date(),
          data: fallbackResponse.data,
        };
        setMessages(prev => [...prev, botMessage]);
        speak(fallbackResponse.text).catch(() => {});
      }
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <ThemedView className="flex-1">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        {/* Header */}
        <View style={{ backgroundColor: themeColors.card, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: themeColors.border, flexDirection: 'row', alignItems: 'center' }}>
          <Bot size={24} color={themeColors.primary} />
          <ThemedText className="text-xl font-bold ml-2">{t('chatbot.title')}</ThemedText>
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
          style={{ flex: 1 }}
        />

        {/* Input Bar */}
        <View 
          style={{ 
            backgroundColor: themeColors.card,
            borderTopWidth: 1,
            borderTopColor: themeColors.border,
            paddingHorizontal: 16,
            paddingVertical: 12,
            // Add padding for tab bar when keyboard is closed
            // Only add extra padding when keyboard is NOT visible
            // When keyboard is visible, KeyboardAvoidingView pushes it up, so we don't need extra padding
            paddingBottom: (keyboardVisible ? 0 : tabbarHeight) + 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 5,
          }}
        >
          <View className="flex-row items-center">
            <TextInput
              style={[
                {
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
                },
                textInputStyles,
              ]}
              placeholder={t('chatbot.placeholder')}
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
              <Send size={24} color={getTextColorForBackground(inputText.trim() && !isTyping ? themeColors.primary : themeColors.border)} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}