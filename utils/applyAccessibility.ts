import { accessibilityService } from '@/services/AccessibilityService';
import { AccessibilitySettings } from '@/services/AccessibilityService';

/**
 * Utility functions to apply accessibility settings to components
 */

/**
 * Get theme-aware style for a component
 */
export const getThemedStyle = (baseStyle: any = {}) => {
  const themeColors = accessibilityService.getThemeColors();
  const settings = accessibilityService.getSettings();

  return {
    ...baseStyle,
    backgroundColor: themeColors.background,
    color: themeColors.text,
    borderColor: themeColors.border,
  };
};

/**
 * Get theme-aware text style
 */
export const getThemedTextStyle = (baseSize: number = 16, baseStyle: any = {}) => {
  const themeColors = accessibilityService.getThemeColors();
  const fontSizeMultiplier = accessibilityService.getFontSizeMultiplier();
  const settings = accessibilityService.getSettings();

  return {
    ...baseStyle,
    color: themeColors.text,
    fontSize: baseSize * fontSizeMultiplier,
    fontWeight: settings.highContrast ? '700' : baseStyle.fontWeight || '400',
  };
};

/**
 * Get theme-aware card style
 */
export const getThemedCardStyle = (baseStyle: any = {}) => {
  const themeColors = accessibilityService.getThemeColors();

  return {
    ...baseStyle,
    backgroundColor: themeColors.card,
    borderColor: themeColors.border,
  };
};

/**
 * Check if motion should be reduced
 */
export const shouldReduceMotion = (): boolean => {
  return accessibilityService.getSettings().reduceMotion;
};

/**
 * Check if simplified UI is enabled
 */
export const isSimplifiedUI = (): boolean => {
  return accessibilityService.getSettings().simplifiedUI;
};

