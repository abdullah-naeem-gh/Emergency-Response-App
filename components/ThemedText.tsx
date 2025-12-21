import { useAccessibility } from '@/hooks/useAccessibility';
import React from 'react';
import { Text, TextProps } from 'react-native';

interface ThemedTextProps extends TextProps {
  children: React.ReactNode;
  className?: string;
  baseSize?: number;
}

/**
 * Text component that applies accessibility theme colors and font sizes
 */
export const ThemedText: React.FC<ThemedTextProps> = ({ 
  children, 
  style, 
  className,
  baseSize = 16,
  ...props 
}) => {
  const { themeColors, getFontSize, isHighContrast } = useAccessibility();

  return (
    <Text
      {...props}
      className={className}
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

