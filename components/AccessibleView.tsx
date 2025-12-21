import { useAccessibility } from '@/hooks/useAccessibility';
import React from 'react';
import { View, ViewProps } from 'react-native';

interface AccessibleViewProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Accessibility label for screen readers
   */
  accessibilityLabel?: string;
  /**
   * Accessibility role
   */
  accessibilityRole?: 'button' | 'header' | 'link' | 'text' | 'none';
  /**
   * Whether this view is important for accessibility
   */
  importantForAccessibility?: 'auto' | 'yes' | 'no' | 'no-hide-descendants';
}

/**
 * View component with full accessibility support including screen reader
 */
export const AccessibleView: React.FC<AccessibleViewProps> = ({ 
  children, 
  style, 
  className,
  accessibilityLabel,
  accessibilityRole,
  importantForAccessibility,
  ...props 
}) => {
  const { themeColors, isHighContrast, settings } = useAccessibility();

  return (
    <View
      {...props}
      className={className}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      importantForAccessibility={importantForAccessibility || (settings.screenReader ? 'yes' : 'auto')}
      style={[
        {
          backgroundColor: themeColors.background,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

