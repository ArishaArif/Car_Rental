import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryTitle?: string;
  style?: ViewStyle;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something Went Wrong',
  message = 'Failed to load data. Please check your connection and try again.',
  onRetry,
  retryTitle = 'Try Again',
  style,
}) => {
  const { colors, typography, spacing, borderRadius } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderRadius: borderRadius.full },
        ]}
      >
        <Text style={[styles.errorIcon, { color: colors.danger }]}>⚠️</Text>
      </View>

      <Text
        style={[
          styles.title,
          {
            color: colors.textPrimary,
            fontSize: typography.fontSizes.xl,
            fontWeight: typography.fontWeights.bold,
            marginTop: spacing.md,
          },
        ]}
      >
        {title}
      </Text>

      <Text
        style={[
          styles.message,
          {
            color: colors.textSecondary,
            fontSize: typography.fontSizes.sm,
            marginTop: spacing.xs + 2,
          },
        ]}
      >
        {message}
      </Text>

      {onRetry ? (
        <Button
          title={retryTitle}
          onPress={onRetry}
          variant="danger"
          size="medium"
          style={{ marginTop: spacing.lg }}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorIcon: {
    fontSize: 28,
  },
  title: {
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    lineHeight: 20,
  },
});
