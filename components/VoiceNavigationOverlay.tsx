import { useAccessibility } from '@/hooks/useAccessibility';
import * as Haptics from 'expo-haptics';
import { Mic, X } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Animated, Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface VoiceNavigationOverlayProps {
  visible: boolean;
  isListening: boolean;
  transcript?: string;
  onClose: () => void;
}

export default function VoiceNavigationOverlay({
  visible,
  isListening,
  transcript,
  onClose,
}: VoiceNavigationOverlayProps) {
  const { themeColors } = useAccessibility();
  const insets = useSafeAreaInsets();

  // Edge lighting animation
  const edgeAnimation = React.useRef(new Animated.Value(0)).current;
  const pulseAnimation = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible && isListening) {
      // Continuous edge lighting animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(edgeAnimation, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(edgeAnimation, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Pulse animation for mic icon
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      edgeAnimation.setValue(0);
      pulseAnimation.setValue(1);
    }
  }, [visible, isListening]);

  if (!visible) return null;

  const edgeOpacity = edgeAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const pulseScale = pulseAnimation;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Edge Lighting Effect */}
      <Animated.View
        style={[
          styles.edgeLighting,
          {
            opacity: edgeOpacity,
            borderColor: themeColors.primary,
          },
        ]}
        pointerEvents="none"
      />

      {/* Center Content */}
      <View style={styles.centerContent} pointerEvents="box-none">
        {/* Mic Icon with Pulse */}
        <Animated.View
          style={[
            styles.micContainer,
            {
              transform: [{ scale: pulseScale }],
            },
          ]}
        >
          <View
            style={[
              styles.micCircle,
              {
                backgroundColor: themeColors.primary + '20',
                borderColor: themeColors.primary,
              },
            ]}
          >
            <Mic size={48} color={themeColors.primary} />
          </View>
        </Animated.View>

        {/* Transcript Text */}
        {transcript && (
          <View style={styles.transcriptContainer}>
            <View
              style={[
                styles.transcriptBubble,
                {
                  backgroundColor: themeColors.card,
                  borderColor: themeColors.border,
                },
              ]}
            >
              <Animated.Text
                style={[
                  styles.transcriptText,
                  {
                    color: themeColors.text,
                  },
                ]}
              >
                {transcript}
              </Animated.Text>
            </View>
          </View>
        )}

        {/* Status Text */}
        <View style={styles.statusContainer}>
          <Animated.Text
            style={[
              styles.statusText,
              {
                color: themeColors.primary,
              },
            ]}
          >
            {isListening ? 'Listening...' : 'Voice Navigation Active'}
          </Animated.Text>
        </View>
      </View>

      {/* Close Button */}
      <TouchableOpacity
        style={[
          styles.closeButton,
          {
            top: insets.top + 16,
            right: 16,
            backgroundColor: themeColors.card,
            borderColor: themeColors.border,
          },
        ]}
        onPress={async () => {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onClose();
        }}
        accessibilityLabel="Close voice navigation"
        accessibilityRole="button"
      >
        <X size={24} color={themeColors.text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  edgeLighting: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 8,
    borderRadius: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  micContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  micCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  transcriptContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  transcriptBubble: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  transcriptText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  statusContainer: {
    marginTop: 8,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});

