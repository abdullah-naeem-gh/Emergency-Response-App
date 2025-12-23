import { useAccessibility } from '@/hooks/useAccessibility';
import { speechRecognitionService } from '@/services/SpeechRecognitionService';
import { Audio } from 'expo-av';
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
  // Fallback one-shot command in Expo Go
  runOneShotVoiceCommand: () => Promise<void>;
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
  const { themeColors, speak } = useAccessibility();
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
      // Don't process if we're no longer active
      if (!isActive) return;

      try {
        // Stop listening temporarily while processing to avoid interference
        await voiceNavigationService.stopListening();
        setIsListening(false);

        const command = await voiceNavigationService.interpretCommand(text, { useAI: true });

        if (command.confidence < 0.5) {
          // Low confidence, ignore and restart listening
          if (isActive) {
             await voiceNavigationService.startListening();
             setIsListening(true);
          }
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
        
        // Restart listening after command execution if still active
        if (isActive) {
           // Small delay to ensure UI updates are finished
           setTimeout(async () => {
             if (isActive) {
                try {
                  await voiceNavigationService.startListening();
                  setIsListening(true);
                } catch (e) {
                  console.log('Failed to restart listening:', e);
                }
             }
           }, 1000);
        }

      } catch (error) {
        console.error('Error handling voice command:', error);
        // Try to restart listening even on error
         if (isActive) {
             await voiceNavigationService.startListening();
             setIsListening(true);
          }
      }
    },
    [router, isActive, executeCommand]
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
              // Provide auditory confirmation for accessibility/peace of mind
              const message = getSpokenLabel(command.target);
              if (message) {
                // Slight delay to avoid being interrupted by navigation transition audio changes
                setTimeout(() => {
                  speak(message, true).catch(console.error);
                }, 200);
              }
            } catch (error) {
              console.error('Navigation error:', error);
            }
          }
          break;

        case 'back':
          try {
            router.back();
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
    [router, speak]
  );

  /**
   * Map route targets to spoken confirmations for accessibility
   */
  const getSpokenLabel = (target: string): string | null => {
    const normalized = normalizeTarget(target);
    const map: Record<string, string> = {
      '/(tabs)': 'Home opened',
      '/(tabs)/index': 'Home opened',
      '/(tabs)/crowd-map': 'Crowd map opened',
      '/(tabs)/guides': 'Guides opened',
      '/(tabs)/chatbot': 'Chat assistant opened',
      '/(tabs)/news': 'News opened',
      '/(tabs)/explore': 'Explore opened',
      '/(tabs)/directory': 'Directory opened',
      '/(tabs)/volunteer': 'Volunteer opened',
      '/(tabs)/reports': 'Reports opened',
      '/(tabs)/profile': 'Profile opened',
      '/(tabs)/community': 'Community opened',
      '/(panic)': 'SOS screen opened',
    };

    if (map[normalized]) return map[normalized];

    // Fallback: build a readable label from the path
    const slug = normalized.split('/').filter(Boolean).pop();
    if (slug) {
      const readable = slug.replace(/[-_]/g, ' ');
      return `${readable} opened`;
    }
    return null;
  };

  const normalizeTarget = (target: string): string => {
    // Remove query/fragment and trailing slash
    const cleaned = target.split(/[?#]/)[0];
    return cleaned.endsWith('/') && cleaned.length > 1
      ? cleaned.slice(0, -1)
      : cleaned;
  };

  /**
   * Fallback: one-shot voice command using expo-av + SpeechRecognitionService.
   * Works in Expo Go by recording a short clip, sending to Google STT, then
   * interpreting the text as a navigation command.
   */
  const runOneShotVoiceCommand = useCallback(async () => {
    try {
      // Ensure cloud STT is configured before doing anything heavy
      const available = await speechRecognitionService.isAvailable();
      if (!available) {
        const errorMessage =
          'Speech recognition is not configured. Please set EXPO_PUBLIC_DEEPGRAM_API_KEY to enable voice commands.';
        console.warn(errorMessage);
        setTranscript(errorMessage);
        return;
      }

      // Microphone permission
      const perm = await Audio.requestPermissionsAsync();
      if (perm.status !== 'granted') {
        const errorMessage = 'Microphone permission is required for voice commands.';
        console.warn(errorMessage);
        setTranscript(errorMessage);
        return;
      }

      // Configure audio session
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Show overlay while we are in the one-shot flow
      setIsActive(true);
      setIsListening(true);
      setTranscript('Listening…');

      // Record a short clip (e.g. 5 seconds max)
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Record for ~4 seconds
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 4000);
      });

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      if (!uri) {
        setTranscript('Could not capture audio, please try again.');
        setIsListening(false);
        setIsActive(false);
        return;
      }

      setTranscript('Transcribing your command...');
      const result = await speechRecognitionService.transcribeWithAutoDetect(uri, {
        enableOffline: false,
      });

      if (!result || !result.text.trim()) {
        setTranscript('Sorry, I could not understand. Please try again.');
        setIsListening(false);
        setIsActive(false);
        return;
      }

      const text = result.text.trim();
      setTranscript(text);

      // Interpret and execute command using existing logic
      const command = await voiceNavigationService.interpretCommand(text, { useAI: true });
      setCurrentCommand(command);
      await executeCommand(command);

      // Clear transcript after a short delay
      if (commandTimeoutRef.current) {
        clearTimeout(commandTimeoutRef.current);
      }
      commandTimeoutRef.current = setTimeout(() => {
        setTranscript('');
        setCurrentCommand(null);
        setIsActive(false);
        setIsListening(false);
      }, 2500);
    } catch (error) {
      console.error('One-shot voice command error:', error);
      setTranscript('Voice command failed. Please check your connection and try again.');
      setIsListening(false);
      setIsActive(false);
    }
  }, [executeCommand]);

  // Start voice navigation
  const startVoiceNavigation = useCallback(async (options?: VoiceNavigationOptions) => {
    try {
      // If native streaming module is not available (Expo Go),
      // use one-shot fallback instead of always-on listening.
      if (!voiceNavigationService.getModuleAvailable()) {
        await runOneShotVoiceCommand();
        return;
      }

      // Request microphone permissions explicitly
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        const errorMessage = 'Microphone permission is required for voice navigation.';
        console.warn(errorMessage);
        setTranscript(errorMessage);
        return;
      }

      // Configure audio session for recording (critical for iOS)
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Try to start listening - errors will be caught and handled below
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
      // Set active to false immediately to prevent any pending timeouts from restarting
      setIsActive(false);
      setIsListening(false);
      setTranscript('');
      setCurrentCommand(null);
      
      if (commandTimeoutRef.current) {
        clearTimeout(commandTimeoutRef.current);
      }
      
      await voiceNavigationService.stopListening();
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
    runOneShotVoiceCommand,
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

