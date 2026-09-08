import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../theme';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputContainerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  isPassword?: boolean;
  disabled?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  containerStyle,
  inputContainerStyle,
  labelStyle,
  errorStyle,
  isPassword = false,
  disabled = false,
  secureTextEntry,
  onFocus,
  onBlur,
  editable,
  ...rest
}) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!isPassword);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const getInputContainerStyle = (): ViewStyle => {
    let borderColor = colors.border;
    if (isFocused) {
      borderColor = colors.primary;
    }
    if (error) {
      borderColor = colors.danger;
    }

    return {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceVariant,
      borderRadius: borderRadius.md,
      borderWidth: 1.5,
      borderColor,
      paddingHorizontal: spacing.md,
      minHeight: 48,
      opacity: disabled ? 0.6 : 1,
    };
  };

  const isEditable = editable !== undefined ? editable : !disabled;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? (
        <Text
          style={[
            {
              color: colors.textSecondary,
              fontSize: typography.fontSizes.sm,
              fontWeight: typography.fontWeights.medium,
              marginBottom: spacing.xs + 2,
            },
            labelStyle,
          ]}
        >
          {label}
        </Text>
      ) : null}

      <View style={[getInputContainerStyle(), inputContainerStyle]}>
        {leftIcon ? <View style={styles.leftIconContainer}>{leftIcon}</View> : null}

        <TextInput
          style={[
            styles.textInput,
            {
              color: colors.textPrimary,
              fontSize: typography.fontSizes.md,
            },
          ]}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={isPassword ? !showPassword : secureTextEntry}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={isEditable}
          {...rest}
        />

        {isPassword ? (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.rightIconContainer}
          >
            <Text style={{ color: colors.primary, fontSize: typography.fontSizes.xs, fontWeight: '600' }}>
              {showPassword ? 'HIDE' : 'SHOW'}
            </Text>
          </TouchableOpacity>
        ) : rightIcon ? (
          <View style={styles.rightIconContainer}>{rightIcon}</View>
        ) : null}
      </View>

      {error ? (
        <Text
          style={[
            {
              color: colors.danger,
              fontSize: typography.fontSizes.xs,
              marginTop: spacing.xs,
            },
            errorStyle,
          ]}
        >
          {error}
        </Text>
      ) : helperText ? (
        <Text
          style={{
            color: colors.textMuted,
            fontSize: typography.fontSizes.xs,
            marginTop: spacing.xs,
          }}
        >
          {helperText}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
    width: '100%',
  },
  textInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  leftIconContainer: {
    marginRight: 8,
  },
  rightIconContainer: {
    marginLeft: 8,
  },
});
