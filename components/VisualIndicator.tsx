import { useAccessibility } from '@/hooks/useAccessibility';
import React from 'react';
import { View, ViewProps } from 'react-native';

interface VisualIndicatorProps extends ViewProps {
  /**
   * Type of indicator
   */
  type?: 'focus' | 'active' | 'important' | 'warning' | 'success';
  /**
   * Size of the indicator
   */
  size?: number;
  /**
   * Position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
   */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
}

/**
 * Visual indicator component that shows/hides based on accessibility settings
 */
export const VisualIndicator: React.FC<VisualIndicatorProps> = ({ 
  type = 'focus',
  size = 8,
  position = 'top-right',
  style,
  ...props 
}) => {
  const { showVisualIndicators, themeColors } = useAccessibility();

  if (!showVisualIndicators) {
    return null;
  }

  const getColor = () => {
    switch (type) {
      case 'active':
        return themeColors.primary;
      case 'important':
        return '#EF4444'; // red
      case 'warning':
        return '#F59E0B'; // orange
      case 'success':
        return '#10B981'; // green
      default:
        return themeColors.accent;
    }
  };

  const getPositionStyle = () => {
    switch (position) {
      case 'top-left':
        return { top: 0, left: 0 };
      case 'top-right':
        return { top: 0, right: 0 };
      case 'bottom-left':
        return { bottom: 0, left: 0 };
      case 'bottom-right':
        return { bottom: 0, right: 0 };
      case 'center':
        return { top: '50%', left: '50%', marginTop: -size / 2, marginLeft: -size / 2 };
      default:
        return { top: 0, right: 0 };
    }
  };

  return (
    <View
      {...props}
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: getColor(),
          borderWidth: 2,
          borderColor: themeColors.background,
          zIndex: 1000,
        },
        getPositionStyle(),
        style,
      ]}
    />
  );
};

