import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
  View,
} from 'react-native';
import { useTheme } from '../../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  ...rest
}) => {
  const { colors, typography, spacing, borderRadius, shadows } = useTheme();

  const getContainerStyle = (): ViewStyle => {
    let paddingVertical = spacing.sm + 4;
    let paddingHorizontal = spacing.lg;

    if (size === 'small') {
      paddingVertical = spacing.xs + 2;
      paddingHorizontal = spacing.md;
    } else if (size === 'large') {
      paddingVertical = spacing.md;
      paddingHorizontal = spacing.xl;
    }

    let backgroundColor: string = colors.primary;
    let borderWidth = 0;
    let borderColor = 'transparent';
    let extraShadow: ViewStyle = {};

    if (variant === 'secondary') {
      backgroundColor = colors.surfaceVariant;
      borderWidth = 1;
      borderColor = colors.border;
    } else if (variant === 'outline') {
      backgroundColor = 'transparent';
      borderWidth = 1.5;
      borderColor = colors.primary;
    } else if (variant === 'ghost') {
      backgroundColor = 'transparent';
    } else if (variant === 'danger') {
      backgroundColor = colors.danger;
    } else if (variant === 'primary') {
      backgroundColor = colors.primary;
      if (colors.primary === '#00E5FF') {
        extraShadow = shadows.glowCyan;
      }
    }

    return {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: borderRadius.md,
      width: fullWidth ? '100%' : undefined,
      paddingVertical,
      paddingHorizontal,
      backgroundColor,
      borderWidth,
      borderColor,
      opacity: disabled || loading ? 0.55 : 1,
      ...extraShadow,
    };
  };

  const getTextStyle = (): TextStyle => {
    let fontSize = typography.fontSizes.md;
    if (size === 'small') {
      fontSize = typography.fontSizes.sm;
    } else if (size === 'large') {
      fontSize = typography.fontSizes.lg;
    }

    let color = colors.textInverse;
    if (variant === 'secondary') {
      color = colors.textPrimary;
    } else if (variant === 'outline' || variant === 'ghost') {
      color = colors.primary;
    } else if (variant === 'danger') {
      color = '#FFFFFF';
    }

    return {
      fontSize,
      color,
      fontWeight: typography.fontWeights.semiBold,
      textAlign: 'center',
    };
  };

  const currentTextStyle = getTextStyle();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[getContainerStyle(), style]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={currentTextStyle.color} />
      ) : (
        <>
          {leftIcon ? <View style={styles.iconRight}>{leftIcon}</View> : null}
          <Text style={[currentTextStyle, textStyle]}>{title}</Text>
          {rightIcon ? <View style={styles.iconLeft}>{rightIcon}</View> : null}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  iconRight: {
    marginRight: 8,
  },
  iconLeft: {
    marginLeft: 8,
  },
});
