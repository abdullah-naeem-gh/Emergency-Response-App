import { useAccessibility } from '@/hooks/useAccessibility';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface AnimatedPressableProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  hapticFeedback?: boolean;
  hapticStyle?: Haptics.ImpactFeedbackStyle;
  scaleOnPress?: boolean;
  opacityOnPress?: boolean;
  springConfig?: {
    damping?: number;
    stiffness?: number;
  };
}

const AnimatedPressableComponent = Animated.createAnimatedComponent(Pressable);

export const AnimatedPressable: React.FC<AnimatedPressableProps> = ({
  children,
  style,
  hapticFeedback = true,
  hapticStyle = Haptics.ImpactFeedbackStyle.Light,
  scaleOnPress = true,
  opacityOnPress = true,
  springConfig = { damping: 15, stiffness: 300 },
  onPress,
  onPressIn,
  onPressOut,
  disabled,
  ...props
}) => {
  const { shouldReduceMotion, settings } = useAccessibility();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  
  // Respect reduce motion setting
  const shouldAnimate = !shouldReduceMotion;

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const handlePressIn = async (event: any) => {
    if (disabled) return;

    // Animate press (only if motion is not reduced)
    if (shouldAnimate) {
      if (scaleOnPress) {
        scale.value = withSpring(0.95, springConfig);
      }
      if (opacityOnPress) {
        opacity.value = withTiming(0.7, { duration: 100 });
      }
    }

    // Haptic feedback (respects hapticFeedback setting)
    if (hapticFeedback && settings.hapticFeedback) {
      try {
        await Haptics.impactAsync(settings.hapticIntensity === 'light' 
          ? Haptics.ImpactFeedbackStyle.Light 
          : settings.hapticIntensity === 'heavy'
          ? Haptics.ImpactFeedbackStyle.Heavy
          : Haptics.ImpactFeedbackStyle.Medium);
      } catch {
        // Haptics might not be available
      }
    }

    onPressIn?.(event);
  };

  const handlePressOut = (event: any) => {
    if (disabled) return;

    // Animate release (only if motion is not reduced)
    if (shouldAnimate) {
      if (scaleOnPress) {
        scale.value = withSpring(1, springConfig);
      }
      if (opacityOnPress) {
        opacity.value = withTiming(1, { duration: 100 });
      }
    }

    onPressOut?.(event);
  };

  const handlePress = async (event: any) => {
    if (disabled) return;
    onPress?.(event);
  };

  return (
    <AnimatedPressableComponent
      {...props}
      disabled={disabled}
      style={[style, animatedStyle]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || false }}
      importantForAccessibility={settings.screenReader ? 'yes' : 'auto'}
    >
      {children}
    </AnimatedPressableComponent>
  );
};

