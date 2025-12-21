import { accessibilityService } from '@/services/AccessibilityService';
import { useAppStore } from '@/store/useAppStore';
import { useMemo } from 'react';

/**
 * Hook to access accessibility settings and apply them to components
 */
export const useAccessibility = () => {
  const { accessibilitySettings } = useAppStore();

  const themeColors = useMemo(() => {
    return accessibilityService.getThemeColors();
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

  return {
    themeColors,
    fontSizeMultiplier,
    getFontSize,
    shouldReduceMotion,
    isSimplifiedUI,
    isHighContrast,
    showVisualIndicators,
    settings: accessibilitySettings,
  };
};

