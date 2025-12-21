import { useAccessibility } from '@/hooks/useAccessibility';
import React from 'react';
import { Text, TextProps } from 'react-native';

interface AccessibleTextProps extends TextProps {
  children: React.ReactNode;
  className?: string;
  baseSize?: number;
  /**
   * Text content for screen readers (if different from children)
   */
  accessibilityLabel?: string;
}

/**
 * Text component with full accessibility support including screen reader
 */
export const AccessibleText: React.FC<AccessibleTextProps> = ({ 
  children, 
  style, 
  className,
  baseSize = 16,
  accessibilityLabel,
  ...props 
}) => {
  const { themeColors, getFontSize, isHighContrast, settings } = useAccessibility();

  return (
    <Text
      {...props}
      className={className}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel || (typeof children === 'string' ? children : undefined)}
      accessibilityLiveRegion={settings.screenReader ? 'polite' : undefined}
      style={[
        {
          color: themeColors.text,
          fontSize: getFontSize(baseSize),
        },
        isHighContrast && {
          fontWeight: '700',
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
};

