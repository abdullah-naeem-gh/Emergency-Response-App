import { useAppStore } from '@/store/useAppStore';
import { TextStyle } from 'react-native';

/**
 * Get the current language direction (LTR or RTL)
 */
export function useLanguageDirection() {
  const language = useAppStore((state) => state.language);
  return language === 'ur' ? 'rtl' : 'ltr';
}

/**
 * Get text alignment based on language
 */
export function useTextAlignment() {
  const language = useAppStore((state) => state.language);
  return language === 'ur' ? 'right' : 'left';
}

/**
 * Get RTL-aware text input styles
 * Returns styles with proper text alignment and writing direction for Urdu
 */
export function useTextInputStyles(baseStyle?: TextStyle): TextStyle {
  const language = useAppStore((state) => state.language);
  const isUrdu = language === 'ur';
  
  return {
    ...baseStyle,
    textAlign: isUrdu ? 'right' : 'left',
    writingDirection: isUrdu ? 'rtl' : 'ltr',
  };
}

