import { ThemedView } from '@/components/ThemedView';
import { useAccessibility } from '@/hooks/useAccessibility';
import { MockLocationService } from '@/services/MockLocationService';
import {
  speechRecognitionService,
  TranscriptionResult,
} from '@/services/SpeechRecognitionService';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle, Mic } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const SLIDER_WIDTH = width - 40;
const KNOB_WIDTH = 80;
const MAX_SLIDE = SLIDER_WIDTH - KNOB_WIDTH;
const RECORDING_DURATION = 12000; // 12 seconds instead of 5

export default function PanicScreen() {
  const router = useRouter();
  const { themeColors } = useAccessibility();
  const [isRecording, setIsRecording] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(RECORDING_DURATION / 1000);
  const [transcription, setTranscription] = useState<TranscriptionResult | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const recordingStartTime = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Slide to SOS animations
  const translateX = useSharedValue(0);
  const context = useSharedValue(0);
  
  // Dynamic waveform animations - 7 bars for fuller spectrum
  const wave1 = useSharedValue(1);
  const wave2 = useSharedValue(1);
  const wave3 = useSharedValue(1);
  const wave4 = useSharedValue(1);
  const wave5 = useSharedValue(1);
  const wave6 = useSharedValue(1);
  const wave7 = useSharedValue(1);
  
  // Speech state simulation
  const speechState = useSharedValue(0); // 0 = silence, 1 = speaking, 2 = pause
  const speechEnvelope = useSharedValue(0); // Attack/sustain/decay envelope
  const lastSpeechEvent = useRef<number>(0);

  // Audio permission
  const [permissionResponse, requestPermission] = Audio.usePermissions();

  useEffect(() => {
    return () => {
      // Cleanup recording on unmount
      if (recording) {
        // Clear all timers first
        if (recordingTimeoutRef.current) {
          clearTimeout(recordingTimeoutRef.current);
          recordingTimeoutRef.current = null;
        }
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
        }
        // Then stop recording
        stopRecording();
      } else {
        // Clean up timers even if no recording
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
        }
        if (recordingTimeoutRef.current) {
          clearTimeout(recordingTimeoutRef.current);
          recordingTimeoutRef.current = null;
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recording]);

  // Real-time countdown timer
  useEffect(() => {
    if (isRecording) {
      countdownRef.current = setInterval(() => {
        const elapsed = Date.now() - recordingStartTime.current;
        const remaining = Math.max(0, Math.ceil((RECORDING_DURATION - elapsed) / 1000));
        setTimeRemaining(remaining);
        
        if (remaining === 0) {
          if (countdownRef.current) {
            clearInterval(countdownRef.current);
          }
        }
      }, 100); // Update every 100ms for smooth countdown
    } else {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
      setTimeRemaining(RECORDING_DURATION / 1000);
    }

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, [isRecording]);

  // Simulate dynamic audio levels with realistic voice patterns
  const simulateAudioLevels = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    const startTime = Date.now();
    lastSpeechEvent.current = startTime;
    speechState.value = 0;
    speechEnvelope.value = 0;
    
    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const timeSinceLastEvent = (Date.now() - lastSpeechEvent.current) / 1000;
      
      // Simulate speech patterns: speaking (1-3s), pause (0.3-1s), breathing (0.5-1s)
      // This creates natural speech rhythm
      if (speechState.value === 0) {
        // Silence/breathing - transition to speech
        if (timeSinceLastEvent > 0.5 + Math.random() * 0.5) {
          speechState.value = 1; // Start speaking
          lastSpeechEvent.current = Date.now();
          speechEnvelope.value = 0; // Reset envelope
        }
      } else if (speechState.value === 1) {
        // Speaking - build envelope (attack)
        speechEnvelope.value = Math.min(1, speechEnvelope.value + 0.15);
        
        // Transition to pause after speaking
        if (timeSinceLastEvent > 1.5 + Math.random() * 1.5) {
          speechState.value = 2; // Pause
          lastSpeechEvent.current = Date.now();
        }
      } else {
        // Pause - decay envelope
        speechEnvelope.value = Math.max(0, speechEnvelope.value - 0.2);
        
        // Transition back to silence
        if (timeSinceLastEvent > 0.3 + Math.random() * 0.7) {
          speechState.value = 0; // Back to silence/breathing
          lastSpeechEvent.current = Date.now();
        }
      }
      
      // Human voice formants (frequency peaks in speech)
      // F1: 300-800Hz (vowels), F2: 800-2500Hz (vowels), F3: 2500-3500Hz (consonants)
      // Converted to animation frequencies
      const fundamentalFreq = 2.5; // Base pitch variation
      const formant1Freq = 4; // First formant (vowel resonance)
      const formant2Freq = 6.5; // Second formant
      const formant3Freq = 9; // Third formant (consonants)
      const breathFreq = 0.8; // Breathing pattern
      
      // Base level varies with speech state
      const baseLevel = speechEnvelope.value * (0.6 + Math.sin(elapsed * breathFreq) * 0.2);
      
      // Add natural variation with multiple frequency components
      const variation1 = Math.sin(elapsed * fundamentalFreq) * 0.3;
      const variation2 = Math.sin(elapsed * formant1Freq * 1.3) * 0.25;
      const variation3 = Math.sin(elapsed * formant2Freq * 0.9) * 0.2;
      
      // Random speech bursts (consonants, plosives)
      const speechBurst = speechState.value === 1 && Math.random() > 0.85 
        ? Math.random() * 0.4 + 0.3 
        : 0;
      
      // Calculate levels for each frequency band (like a real spectrum analyzer)
      // Each bar represents a different frequency range
      const clamp = (val: number) => Math.max(0.15, Math.min(2.2, val));
      
      // Wave 1: Sub-bass / Breathing (20-60Hz range)
      const level1 = clamp(0.3 + baseLevel * 0.2 + Math.sin(elapsed * breathFreq) * 0.15);
      
      // Wave 2: Bass / Fundamental (60-250Hz)
      const level2 = clamp(0.4 + baseLevel * 0.4 + variation1 * 0.3 + speechBurst * 0.2);
      
      // Wave 3: Low-mid / First formant (250-500Hz) - Vowel resonance
      const level3 = clamp(0.5 + baseLevel * 0.6 + variation1 * 0.4 + variation2 * 0.3 + speechBurst * 0.3);
      
      // Wave 4: Mid / Second formant (500-2000Hz) - Most active for voice
      const level4 = clamp(0.6 + baseLevel * 0.8 + variation1 * 0.5 + variation2 * 0.4 + variation3 * 0.3 + speechBurst * 0.4);
      
      // Wave 5: High-mid / Third formant (2000-4000Hz) - Consonants
      const level5 = clamp(0.5 + baseLevel * 0.7 + variation2 * 0.5 + variation3 * 0.4 + speechBurst * 0.5);
      
      // Wave 6: High frequency (4000-8000Hz) - Sibilants (s, sh sounds)
      const level6 = clamp(0.4 + baseLevel * 0.5 + variation3 * 0.4 + (speechBurst > 0.5 ? speechBurst * 0.3 : 0));
      
      // Wave 7: Very high frequency (8000Hz+) - Air, breath
      const level7 = clamp(0.3 + baseLevel * 0.3 + Math.sin(elapsed * formant3Freq) * 0.2);
      
      // Apply with smooth, responsive transitions
      const transitionConfig = { duration: 60, easing: Easing.out(Easing.cubic) };
      
      wave1.value = withTiming(level1, transitionConfig);
      wave2.value = withTiming(level2, transitionConfig);
      wave3.value = withTiming(level3, transitionConfig);
      wave4.value = withTiming(level4, transitionConfig);
      wave5.value = withTiming(level5, transitionConfig);
      wave6.value = withTiming(level6, transitionConfig);
      wave7.value = withTiming(level7, transitionConfig);
    }, 40); // Update every 40ms for very smooth, responsive animation
  };

  const startRecording = async () => {
    try {
      if (permissionResponse?.status !== 'granted') {
        const perm = await requestPermission();
        if (perm.status !== 'granted') {
          Alert.alert("Permission required", "Microphone permission is needed for emergency recording.");
          return;
        }
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      recordingStartTime.current = Date.now();
      
      // Start dynamic visualizer animation
      simulateAudioLevels();

      // Clear any existing timeout
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
      }

      // Stop recording and send after duration
      recordingTimeoutRef.current = setTimeout(() => {
        stopRecording();
        handleSentSuccess();
        recordingTimeoutRef.current = null;
      }, RECORDING_DURATION);

    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    // Clear recording timeout
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    if (!recording) return;
    setIsRecording(false);
    let recordingUri: string | null = null;
    try {
      await recording.stopAndUnloadAsync();
      // Get the recording URI for potential upload
      recordingUri = recording.getURI();
      console.log('Recording saved to:', recordingUri);
    } catch {
       // Ignore error if already unloaded
    }
    setRecording(null);
    // Reset waveforms smoothly
    const resetConfig = { duration: 300, easing: Easing.out(Easing.quad) };
    wave1.value = withTiming(1, resetConfig);
    wave2.value = withTiming(1, resetConfig);
    wave3.value = withTiming(1, resetConfig);
    wave4.value = withTiming(1, resetConfig);
    wave5.value = withTiming(1, resetConfig);
    wave6.value = withTiming(1, resetConfig);
    wave7.value = withTiming(1, resetConfig);
    speechState.value = 0;
    speechEnvelope.value = 0;

    // Transcribe audio if available
    if (recordingUri) {
      await transcribeRecording(recordingUri);
    }
  };

  const transcribeRecording = async (audioUri: string) => {
    try {
      setIsTranscribing(true);
      // Try auto-detect language first (supports both Urdu and English)
      const result = await speechRecognitionService.transcribeWithAutoDetect(audioUri, {
        enableOffline: false,
      });

      if (result) {
        setTranscription(result);
        console.log('Transcription:', result.text);
        console.log('Language:', result.language);
        console.log('Confidence:', result.confidence);
      } else {
        console.warn('Transcription failed or returned no result');
      }
    } catch (error) {
      console.error('Error transcribing audio:', error);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSentSuccess = async () => {
    setIsSent(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const onSlideComplete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    startRecording();
  };

  const handleGoBack = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    MockLocationService.simulateExitRedZone();
    router.replace('/(tabs)');
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      context.value = translateX.value;
    })
    .onUpdate((event) => {
      if (!isRecording && !isSent) {
         let newValue = event.translationX + context.value;
         if (newValue < 0) newValue = 0;
         if (newValue > MAX_SLIDE) newValue = MAX_SLIDE;
         translateX.value = newValue;
      }
    })
    .onEnd(() => {
      if (!isRecording && !isSent) {
        if (translateX.value > MAX_SLIDE * 0.8) {
          translateX.value = withSpring(MAX_SLIDE);
          runOnJS(onSlideComplete)();
        } else {
          translateX.value = withSpring(0);
        }
      }
    });

  const sliderStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const wave1Style = useAnimatedStyle(() => ({ 
    transform: [{ scaleY: wave1.value }],
    opacity: 0.7 + (wave1.value - 1) * 0.3
  }));
  const wave2Style = useAnimatedStyle(() => ({ 
    transform: [{ scaleY: wave2.value }],
    opacity: 0.7 + (wave2.value - 1) * 0.3
  }));
  const wave3Style = useAnimatedStyle(() => ({ 
    transform: [{ scaleY: wave3.value }],
    opacity: 0.7 + (wave3.value - 1) * 0.3
  }));
  const wave4Style = useAnimatedStyle(() => ({ 
    transform: [{ scaleY: wave4.value }],
    opacity: 0.7 + (wave4.value - 1) * 0.3
  }));
  const wave5Style = useAnimatedStyle(() => ({ 
    transform: [{ scaleY: wave5.value }],
    opacity: 0.7 + (wave5.value - 1) * 0.3
  }));
  const wave6Style = useAnimatedStyle(() => ({ 
    transform: [{ scaleY: wave6.value }],
    opacity: 0.7 + (wave6.value - 1) * 0.3
  }));
  const wave7Style = useAnimatedStyle(() => ({ 
    transform: [{ scaleY: wave7.value }],
    opacity: 0.7 + (wave7.value - 1) * 0.3
  }));

  if (isSent) {
    return (
      <View className="flex-1 bg-green-500 justify-center items-center p-5">
        {/* Back Button */}
        <Pressable 
          onPress={handleGoBack}
          style={{ position: 'absolute', top: 48, left: 20, zIndex: 10, backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: 12, borderRadius: 9999, minHeight: 44, minWidth: 44 }}
        >
          <ArrowLeft size={24} color="white" />
        </Pressable>

        <View className="items-center justify-center flex-1">
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 9999, width: 128, height: 128, justifyContent: 'center', alignItems: 'center', marginBottom: 24 }}>
            <CheckCircle size={64} color="#22c55e" strokeWidth={3} />
          </View>
          <Text style={{ color: '#FFFFFF', fontSize: 36, fontWeight: '700', marginBottom: 8, textAlign: 'center' }}>HELP SENT</Text>
          <Text style={{ color: '#FFFFFF', fontSize: 18, textAlign: 'center', marginBottom: 24, paddingHorizontal: 24 }}>
            Volunteers have received your location and audio. Stay calm.
          </Text>

          {/* Transcription Display */}
          {isTranscribing && (
            <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 12, padding: 16, marginBottom: 24, width: '100%', maxWidth: 384 }}>
              <View className="flex-row items-center justify-center mb-2">
                <ActivityIndicator size="small" color="#ffffff" />
                <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 14, marginLeft: 8 }}>Transcribing audio...</Text>
              </View>
            </View>
          )}

          {transcription && !isTranscribing && (
            <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 12, padding: 16, marginBottom: 24, width: '100%', maxWidth: 384 }}>
              <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 12, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Transcribed Message ({speechRecognitionService.getLanguageName(transcription.language)})
              </Text>
              <Text style={{ color: '#FFFFFF', fontSize: 16, lineHeight: 20 }}>{transcription.text}</Text>
              {transcription.confidence < 0.7 && (
                <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 12, marginTop: 8 }}>
                  Low confidence transcription ({Math.round(transcription.confidence * 100)}%)
                </Text>
              )}
            </View>
          )}
          
          <Pressable
            onPress={handleGoBack}
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.4)', minHeight: 60 }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 18 }}>I AM SAFE NOW</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemedView className="flex-1" style={{ backgroundColor: '#171717' }}>
        {/* Back Button - Always visible */}
        <Pressable 
          onPress={handleGoBack}
          style={{ position: 'absolute', top: 48, left: 20, zIndex: 10, backgroundColor: themeColors.card + 'CC', padding: 12, borderRadius: 9999, minHeight: 44, minWidth: 44 }}
        >
          <ArrowLeft size={24} color="white" />
        </Pressable>

        {/* Main Content Area - Top 60% */}
        <View className="flex-[0.6] justify-center items-center px-5">
          {isRecording ? (
            <View className="items-center justify-center w-full">
              <View className="items-center mb-8">
                <View className="mb-4">
                  <Mic size={32} color="#ef4444" />
                </View>
                <Text style={{ color: '#EF4444', fontSize: 20, fontWeight: '700', marginBottom: 8 }}>RECORDING AUDIO...</Text>
                <Text style={{ color: themeColors.text, fontSize: 14, fontFamily: 'monospace', opacity: 0.7 }}>
                  {timeRemaining}s remaining
                </Text>
              </View>
              
              {/* Dynamic Waveform Visualizer - 7 bars for full spectrum */}
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 128, gap: 6, marginBottom: 32, paddingHorizontal: 8 }}>
                <Animated.View 
                  className="w-3 bg-red-500 h-12 rounded-full" 
                  style={[wave1Style, { minHeight: 16 }]} 
                />
                <Animated.View 
                  className="w-3 bg-red-500 h-16 rounded-full" 
                  style={[wave2Style, { minHeight: 16 }]} 
                />
                <Animated.View 
                  className="w-3 bg-red-500 h-20 rounded-full" 
                  style={[wave3Style, { minHeight: 16 }]} 
                />
                <Animated.View 
                  className="w-3 bg-red-500 h-24 rounded-full" 
                  style={[wave4Style, { minHeight: 16 }]} 
                />
                <Animated.View 
                  className="w-3 bg-red-500 h-20 rounded-full" 
                  style={[wave5Style, { minHeight: 16 }]} 
                />
                <Animated.View 
                  className="w-3 bg-red-500 h-16 rounded-full" 
                  style={[wave6Style, { minHeight: 16 }]} 
                />
                <Animated.View 
                  className="w-3 bg-red-500 h-12 rounded-full" 
                  style={[wave7Style, { minHeight: 16 }]} 
                />
              </View>
              
              <Text style={{ color: themeColors.text, textAlign: 'center', opacity: 0.7 }}>Keep speaking clearly</Text>
            </View>
          ) : (
            <View className="items-center justify-center w-full">
              <Text style={{ color: '#FFFFFF', fontSize: 48, fontWeight: '900', marginBottom: 16, letterSpacing: -1 }}>PANIC</Text>
              <Text style={{ color: themeColors.text, textAlign: 'center', fontSize: 18, paddingHorizontal: 24, opacity: 0.7 }}>
                Slide below to send SOS and start recording instantly.
              </Text>
            </View>
          )}
        </View>

        {/* Slide to SOS Area - Bottom 40% (Fitts' Law) */}
        <View style={{ flex: 0.4, width: '100%', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 40 }}>
          {!isRecording && (
            <View className="w-full h-20 bg-neutral-800 rounded-full justify-center p-1 relative overflow-hidden border border-neutral-700">
              <Text className="absolute w-full text-center text-neutral-500 text-xl font-bold tracking-widest uppercase z-0">
                Slide to SOS  {'>'}{'>'}{'>'}
              </Text>
              <GestureDetector gesture={panGesture}>
                <Animated.View style={[styles.knob, sliderStyle]}>
                  <View className="w-full h-full bg-red-600 rounded-full justify-center items-center shadow-lg shadow-red-900">
                    <Text className="text-white font-bold text-lg">SOS</Text>
                  </View>
                </Animated.View>
              </GestureDetector>
            </View>
          )}
          {isRecording && (
            <Text style={{ color: themeColors.text, fontSize: 14, opacity: 0.7 }}>Sending Emergency Alert...</Text>
          )}
        </View>
      </ThemedView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  knob: {
    width: KNOB_WIDTH,
    height: '100%',
    position: 'absolute',
    left: 0,
    zIndex: 10,
  }
});
