import * as Haptics from 'expo-haptics';

// Text-to-speech - will use expo-speech if available
let Speech: any = null;
try {
  Speech = require('expo-speech');
} catch {
  // expo-speech not installed, will use fallback
  console.warn('expo-speech not available. Install with: npx expo install expo-speech');
}

export type AccessibilityTheme =
  | 'default'
  | 'high_contrast_yellow_black'
  | 'high_contrast_white_black'
  | 'low_cognitive_load'
  | 'color_blind_friendly'
  | 'dark_mode';

export interface AccessibilitySettings {
  theme: AccessibilityTheme;
  textToSpeech: boolean;
  hapticFeedback: boolean;
  hapticIntensity: 'light' | 'medium' | 'heavy';
  fontSize: 'small' | 'medium' | 'large' | 'extra_large';
  screenReader: boolean;
  reduceMotion: boolean;
  highContrast: boolean;
  speakAloud: boolean;
  hearingAidMode: boolean;
  visualIndicators: boolean;
  simplifiedUI: boolean;
}

class AccessibilityService {
  private settings: AccessibilitySettings = {
    theme: 'default',
    textToSpeech: false,
    hapticFeedback: true,
    hapticIntensity: 'medium',
    fontSize: 'medium',
    screenReader: false,
    reduceMotion: false,
    highContrast: false,
    speakAloud: false,
    hearingAidMode: false,
    visualIndicators: true,
    simplifiedUI: false,
  };

  /**
   * Get current accessibility settings
   */
  getSettings(): AccessibilitySettings {
    return { ...this.settings };
  }

  /**
   * Update accessibility settings
   */
  updateSettings(updates: Partial<AccessibilitySettings>): void {
    this.settings = { ...this.settings, ...updates };
    this.applySettings();
  }

  /**
   * Apply accessibility settings
   */
  private applySettings(): void {
    // Settings are applied through the app store and components
    // This method can be extended to apply system-level settings
  }

  /**
   * Get theme colors based on selected theme
   */
  getThemeColors(theme?: AccessibilityTheme): {
    background: string;
    text: string;
    primary: string;
    secondary: string;
    accent: string;
    border: string;
    card: string;
  } {
    const selectedTheme = theme || this.settings.theme;
    switch (selectedTheme) {
      case 'high_contrast_yellow_black':
        return {
          background: '#000000',
          text: '#FFFF00',
          primary: '#FFFF00',
          secondary: '#FFD700',
          accent: '#FFA500',
          border: '#FFFF00',
          card: '#1a1a1a',
        };
      case 'high_contrast_white_black':
        return {
          background: '#000000',
          text: '#FFFFFF',
          primary: '#FFFFFF',
          secondary: '#CCCCCC',
          accent: '#FFFFFF',
          border: '#FFFFFF',
          card: '#1a1a1a',
        };
      case 'low_cognitive_load':
        return {
          background: '#F5F5F5',
          text: '#2C2C2C',
          primary: '#4A90E2',
          secondary: '#7ED321',
          accent: '#F5A623',
          border: '#E0E0E0',
          card: '#FFFFFF',
        };
      case 'color_blind_friendly':
        return {
          background: '#FFFFFF',
          text: '#1A1A1A',
          primary: '#0066CC',
          secondary: '#FF6600',
          accent: '#00CC66',
          border: '#333333',
          card: '#F8F8F8',
        };
      case 'dark_mode':
        return {
          background: '#121212',
          text: '#FFFFFF',
          primary: '#BB86FC',
          secondary: '#03DAC6',
          accent: '#CF6679',
          border: '#333333',
          card: '#1E1E1E',
        };
      default:
        return {
          background: '#FFFFFF',
          text: '#111827',
          primary: '#3B82F6',
          secondary: '#10B981',
          accent: '#F59E0B',
          border: '#E5E7EB',
          card: '#FFFFFF',
        };
    }
  }

  /**
   * Speak text aloud
   */
  async speak(text: string, options?: { language?: string; pitch?: number; rate?: number }): Promise<void> {
    if (!this.settings.textToSpeech && !this.settings.speakAloud) {
      return;
    }

    if (!Speech) {
      console.warn('Text-to-speech not available. Install expo-speech.');
      return;
    }

    try {
      await Speech.speak(text, {
        language: options?.language || 'en-US',
        pitch: options?.pitch || 1.0,
        rate: options?.rate || 0.75,
        quality: Speech.VoiceQuality?.Enhanced || Speech.VoiceQuality?.Default,
      });
    } catch (error) {
      console.error('Error speaking text:', error);
    }
  }

  /**
   * Stop speaking
   */
  stopSpeaking(): void {
    if (Speech) {
      Speech.stop();
    }
  }

  /**
   * Trigger haptic feedback
   */
  async triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'): Promise<void> {
    if (!this.settings.hapticFeedback) {
      return;
    }

    try {
      switch (type) {
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'success':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'warning':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'error':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
      }
    } catch (error) {
      console.error('Error triggering haptic:', error);
    }
  }

  /**
   * Get font size multiplier
   */
  getFontSizeMultiplier(): number {
    switch (this.settings.fontSize) {
      case 'small':
        return 0.875;
      case 'medium':
        return 1.0;
      case 'large':
        return 1.25;
      case 'extra_large':
        return 1.5;
      default:
        return 1.0;
    }
  }

  /**
   * Check if simplified UI is enabled
   */
  isSimplifiedUI(): boolean {
    return this.settings.simplifiedUI;
  }

  /**
   * Check if high contrast is enabled
   */
  isHighContrast(): boolean {
    return this.settings.highContrast || this.settings.theme.includes('high_contrast');
  }

  /**
   * Get haptic intensity
   */
  getHapticIntensity(): Haptics.ImpactFeedbackStyle {
    switch (this.settings.hapticIntensity) {
      case 'light':
        return Haptics.ImpactFeedbackStyle.Light;
      case 'medium':
        return Haptics.ImpactFeedbackStyle.Medium;
      case 'heavy':
        return Haptics.ImpactFeedbackStyle.Heavy;
      default:
        return Haptics.ImpactFeedbackStyle.Medium;
    }
  }
}

export const accessibilityService = new AccessibilityService();

