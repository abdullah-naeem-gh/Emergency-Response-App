import { useAccessibility } from '@/hooks/useAccessibility';
import React from 'react';
import { View, ViewProps } from 'react-native';

interface ThemedViewProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * View component that applies accessibility theme colors
 */
export const ThemedView: React.FC<ThemedViewProps> = ({ 
  children, 
  style, 
  className,
  ...props 
}) => {
  const { themeColors, isHighContrast } = useAccessibility();

  return (
    <View
      {...props}
      className={className}
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

