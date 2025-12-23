import { accessibilityService } from '@/services/AccessibilityService';
import { useAppStore } from '@/store/useAppStore';
import { useMemo } from 'react';

/**
 * Hook to access accessibility settings and apply them to components
 */
export const useAccessibility = () => {
  // Use selector to ensure re-renders when accessibilitySettings changes
  const accessibilitySettings = useAppStore((state) => state.accessibilitySettings);

  const themeColors = useMemo(() => {
    return accessibilityService.getThemeColors(accessibilitySettings.theme);
  }, [accessibilitySettings.theme]);

  const fontSizeMultiplier = useMemo(() => {
    return accessibilityService.getFontSizeMultiplier();
  }, [accessibilitySettings.fontSize]);

  const getFontSize = (baseSize: number): number => {
    return baseSize * fontSizeMultiplier;
  };

  const shouldReduceMotion = accessibilitySettings.reduceMotion;
  const isSimplifiedUI = accessibilitySettings.simplifiedUI;
  const isHighContrast = accessibilitySettings.highContrast;
  const showVisualIndicators = accessibilitySettings.visualIndicators;

  /**
   * Speak text if Text-to-Speech or Speak Aloud is enabled
   */
  const speak = async (text: string, force: boolean = false) => {
    const shouldSpeak = force || accessibilitySettings.textToSpeech || accessibilitySettings.speakAloud;
    if (shouldSpeak) {
      await accessibilityService.speak(text, { force: true });
    }
  };

  /**
   * Stop any current speech
   */
  const stopSpeaking = () => {
    accessibilityService.stopSpeaking();
  };

  /**
   * Trigger haptic feedback based on settings
   */
  const triggerHaptic = (type: Parameters<typeof accessibilityService.triggerHaptic>[0]) => {
    if (accessibilitySettings.hapticFeedback) {
      accessibilityService.triggerHaptic(type);
    }
  };

  return {
    themeColors,
    fontSizeMultiplier,
    getFontSize,
    shouldReduceMotion,
    isSimplifiedUI,
    isHighContrast,
    showVisualIndicators,
    settings: accessibilitySettings,
    speak,
    stopSpeaking,
    triggerHaptic,
  };
};

