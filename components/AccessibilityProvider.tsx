import { useAccessibility } from '@/hooks/useAccessibility';
import React, { createContext, useContext, useEffect } from 'react';
import { View, ViewProps } from 'react-native';

interface AccessibilityContextType {
  themeColors: ReturnType<typeof useAccessibility>['themeColors'];
  fontSizeMultiplier: number;
  getFontSize: (baseSize: number) => number;
  shouldReduceMotion: boolean;
  isSimplifiedUI: boolean;
  isHighContrast: boolean;
  showVisualIndicators: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export const useAccessibilityContext = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibilityContext must be used within AccessibilityProvider');
  }
  return context;
};

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const accessibility = useAccessibility();

  // Apply theme colors globally via style injection
  useEffect(() => {
    // This effect can be used to apply global styles if needed
  }, [accessibility.themeColors]);

  return (
    <AccessibilityContext.Provider value={accessibility}>
      <View
        style={{
          flex: 1,
          backgroundColor: accessibility.themeColors.background,
        }}
      >
        {children}
      </View>
    </AccessibilityContext.Provider>
  );
};

