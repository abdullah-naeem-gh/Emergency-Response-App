import { useAccessibility } from '@/hooks/useAccessibility';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import VoiceNavigationOverlay from './VoiceNavigationOverlay';
import {
  VoiceCommand,
  VoiceNavigationOptions,
  voiceNavigationService,
} from '../services/VoiceNavigationService';

interface VoiceNavigationContextValue {
  isActive: boolean;
  isListening: boolean;
  transcript: string;
  startVoiceNavigation: (options?: VoiceNavigationOptions) => Promise<void>;
  stopVoiceNavigation: () => Promise<void>;
  toggleVoiceNavigation: () => Promise<void>;
}

const VoiceNavigationContext = createContext<VoiceNavigationContextValue | undefined>(undefined);

export const useVoiceNavigation = () => {
  const context = useContext(VoiceNavigationContext);
  if (!context) {
    throw new Error('useVoiceNavigation must be used within VoiceNavigationProvider');
  }
  return context;
};

interface VoiceNavigationProviderProps {
  children: React.ReactNode;
}

export default function VoiceNavigationProvider({ children }: VoiceNavigationProviderProps) {
  const router = useRouter();
  const { themeColors } = useAccessibility();
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [currentCommand, setCurrentCommand] = useState<VoiceCommand | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const commandTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        isActive
      ) {
        // App came to foreground, restart listening if active
        voiceNavigationService.startListening().catch(console.error);
      } else if (nextAppState.match(/inactive|background/) && isActive) {
        // App went to background, stop listening
        voiceNavigationService.stopListening().catch(console.error);
      }
      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isActive]);

  // Setup voice service callbacks
  useEffect(() => {
    voiceNavigationService.setCallbacks({
      onStart: () => {
        setIsListening(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
      onEnd: () => {
        setIsListening(false);
      },
      onResult: async (text: string) => {
        setTranscript(text);
        await handleVoiceCommand(text);
      },
      onError: (error: Error) => {
        console.error('Voice navigation error:', error);
        setIsListening(false);
        // Don't stop voice navigation on error, just log it
      },
    });

    return () => {
      voiceNavigationService.setCallbacks({});
    };
  }, []);

  // Handle voice command execution
  const handleVoiceCommand = useCallback(
    async (text: string) => {
      try {
        const command = await voiceNavigationService.interpretCommand(text, { useAI: true });

        if (command.confidence < 0.5) {
          // Low confidence, ignore
          return;
        }

        setCurrentCommand(command);
        await executeCommand(command);

        // Clear transcript after a delay
        if (commandTimeoutRef.current) {
          clearTimeout(commandTimeoutRef.current);
        }
        commandTimeoutRef.current = setTimeout(() => {
          setTranscript('');
          setCurrentCommand(null);
        }, 2000);
      } catch (error) {
        console.error('Error handling voice command:', error);
      }
    },
    [router]
  );

  // Execute navigation or action command
  const executeCommand = useCallback(
    async (command: VoiceCommand) => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      switch (command.type) {
        case 'navigate':
          if (command.target) {
            try {
              router.push(command.target as any);
              // Continue listening after navigation
              setTimeout(() => {
                if (isActive) {
                  voiceNavigationService.startListening().catch(console.error);
                }
              }, 500);
            } catch (error) {
              console.error('Navigation error:', error);
            }
          }
          break;

        case 'back':
          try {
            router.back();
            setTimeout(() => {
              if (isActive) {
                voiceNavigationService.startListening().catch(console.error);
              }
            }, 500);
          } catch (error) {
            console.error('Back navigation error:', error);
          }
          break;

        case 'press':
          // For button presses, we'll use a callback system
          // Screens can register handlers via useVoiceNavigation hook
          // For now, we'll log it - screens can implement their own handlers
          console.log('Voice button press:', command.action);
          // You can extend this to call registered handlers
          break;

        case 'scroll':
          // For scrolling, screens can implement their own handlers
          console.log('Voice scroll:', command.action);
          break;

        default:
          console.log('Unknown command type:', command.type);
      }
    },
    [router, isActive]
  );

  // Start voice navigation
  const startVoiceNavigation = useCallback(async (options?: VoiceNavigationOptions) => {
    try {
      // Check if module is available first
      if (!voiceNavigationService.getModuleAvailable()) {
        const errorMessage = 
          'Voice navigation requires a development build.\n\n' +
          'To use this feature:\n' +
          '1. Run: npx expo prebuild\n' +
          '2. Run: npx expo run:ios (or npx expo run:android)\n\n' +
          'This feature is not available in Expo Go.';
        console.warn(errorMessage);
        // Set error state that can be displayed to user
        setTranscript(errorMessage);
        return;
      }

      const available = await voiceNavigationService.isAvailable();
      if (!available) {
        console.warn('Voice recognition not available');
        return;
      }

      setIsActive(true);
      setTranscript('');
      await voiceNavigationService.startListening(options);
    } catch (error) {
      console.error('Error starting voice navigation:', error);
      setIsActive(false);
      // Show error message to user
      if (error instanceof Error) {
        setTranscript(error.message);
      }
    }
  }, []);

  // Stop voice navigation
  const stopVoiceNavigation = useCallback(async () => {
    try {
      await voiceNavigationService.stopListening();
      setIsActive(false);
      setIsListening(false);
      setTranscript('');
      setCurrentCommand(null);
      if (commandTimeoutRef.current) {
        clearTimeout(commandTimeoutRef.current);
      }
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error('Error stopping voice navigation:', error);
    }
  }, []);

  // Toggle voice navigation
  const toggleVoiceNavigation = useCallback(async () => {
    if (isActive) {
      await stopVoiceNavigation();
    } else {
      await startVoiceNavigation();
    }
  }, [isActive, startVoiceNavigation, stopVoiceNavigation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (commandTimeoutRef.current) {
        clearTimeout(commandTimeoutRef.current);
      }
      voiceNavigationService.stopListening().catch(console.error);
    };
  }, []);

  const value: VoiceNavigationContextValue = {
    isActive,
    isListening,
    transcript,
    startVoiceNavigation,
    stopVoiceNavigation,
    toggleVoiceNavigation,
  };

  return (
    <VoiceNavigationContext.Provider value={value}>
      {children}
      <VoiceNavigationOverlay
        visible={isActive}
        isListening={isListening}
        transcript={transcript}
        onClose={stopVoiceNavigation}
      />
    </VoiceNavigationContext.Provider>
  );
}

