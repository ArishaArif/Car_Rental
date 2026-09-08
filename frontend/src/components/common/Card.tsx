import React from 'react';
import {
  View,
  TouchableOpacity,
  ViewStyle,
  TouchableOpacityProps,
} from 'react-native';
import { useTheme } from '../../theme';

export type CardVariant = 'elevated' | 'outlined' | 'flat';
export type CardPadding = 'none' | 'small' | 'medium' | 'large';

export interface CardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  onPress?: () => void;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  padding = 'medium',
  onPress,
  style,
  ...rest
}) => {
  const { colors, spacing, borderRadius, shadows } = useTheme();

  const getPadding = (): number => {
    switch (padding) {
      case 'none':
        return 0;
      case 'small':
        return spacing.sm;
      case 'large':
        return spacing.lg;
      case 'medium':
      default:
        return spacing.md;
    }
  };

  const getCardStyle = (): ViewStyle => {
    let backgroundColor = colors.surface;
    let borderWidth = 0;
    let borderColor = 'transparent';
    let shadowStyle: ViewStyle = {};

    if (variant === 'outlined') {
      borderWidth = 1;
      borderColor = colors.border;
    } else if (variant === 'flat') {
      backgroundColor = colors.surfaceVariant;
    } else if (variant === 'elevated') {
      borderWidth = 1;
      borderColor = colors.border;
      shadowStyle = shadows.sm;
    }

    return {
      backgroundColor,
      borderRadius: borderRadius.lg,
      padding: getPadding(),
      overflow: 'hidden',
      borderWidth,
      borderColor,
      ...shadowStyle,
    };
  };

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={[getCardStyle(), style]}
        {...rest}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[getCardStyle(), style]}>{children}</View>;
};
