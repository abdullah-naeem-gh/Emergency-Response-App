import { useAccessibility } from '@/hooks/useAccessibility';
import { useTranslation } from '@/hooks/useTranslation';
import React from 'react';
import { Text, TextProps } from 'react-native';

interface ThemedTextProps extends TextProps {
  children: React.ReactNode;
  className?: string;
  baseSize?: number;
}

/**
 * Text component that applies accessibility theme colors and font sizes
 * Automatically handles RTL text alignment and increased line height for Urdu
 */
export const ThemedText: React.FC<ThemedTextProps> = ({ 
  children, 
  style, 
  className,
  baseSize = 16,
  ...props 
}) => {
  const { themeColors, getFontSize, isHighContrast } = useAccessibility();
  const { language } = useTranslation();
  const isUrdu = language === 'ur';
  
  // Calculate line height: increase by 40% for Urdu to prevent text cutoff
  const fontSize = getFontSize(baseSize);
  const baseLineHeight = fontSize * 1.5; // Default 1.5x line height
  const lineHeight = isUrdu ? baseLineHeight * 1.4 : baseLineHeight; // 40% more for Urdu
  
  // Get text alignment - respect explicit textAlign prop, otherwise default based on language
  // Check if textAlign is explicitly set in style prop
  const styleTextAlign = (style && typeof style === 'object' && !Array.isArray(style) && 'textAlign' in style) 
    ? (style as any).textAlign 
    : undefined;
  const explicitTextAlign = props.textAlign || styleTextAlign;
  const textAlign = explicitTextAlign || (isUrdu ? 'right' : 'left');

  return (
    <Text
      {...props}
      className={className}
      style={[
        {
          color: themeColors.text,
          fontSize: fontSize,
          lineHeight: lineHeight,
          writingDirection: isUrdu ? 'rtl' : 'ltr',
        },
        // Only set textAlign if not explicitly overridden
        !explicitTextAlign && { textAlign },
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

