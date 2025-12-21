import { useAccessibility } from '@/hooks/useAccessibility';
import React from 'react';
import { View, ViewProps } from 'react-native';

interface SimplifiedUIWrapperProps extends ViewProps {
  children: React.ReactNode;
  /**
   * Elements to hide when simplified UI is enabled
   */
  hideWhenSimplified?: React.ReactNode;
  /**
   * Elements to show only when simplified UI is enabled
   */
  showWhenSimplified?: React.ReactNode;
}

/**
 * Wrapper component that applies simplified UI mode
 * Hides decorative elements and shows simplified versions when enabled
 */
export const SimplifiedUIWrapper: React.FC<SimplifiedUIWrapperProps> = ({ 
  children,
  hideWhenSimplified,
  showWhenSimplified,
  ...props 
}) => {
  const { isSimplifiedUI } = useAccessibility();

  if (isSimplifiedUI) {
    return (
      <View {...props}>
        {showWhenSimplified || children}
      </View>
    );
  }

  return (
    <View {...props}>
      {children}
      {hideWhenSimplified}
    </View>
  );
};

