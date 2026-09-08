import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { Button } from './Button';

export interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  actionTitle?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Data Found',
  message = 'There are no items to display at this time.',
  icon,
  actionTitle,
  onAction,
  style,
}) => {
  const { colors, typography, spacing, borderRadius } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconContainer, { backgroundColor: colors.surfaceVariant, borderRadius: borderRadius.full }]}>
        {icon ? (
          icon
        ) : (
          <Text style={[styles.defaultIconText, { color: colors.primary }]}>🚘</Text>
        )}
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

      {actionTitle && onAction ? (
        <Button
          title={actionTitle}
          onPress={onAction}
          variant="primary"
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
  defaultIconText: {
    fontSize: 32,
  },
  title: {
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    lineHeight: 20,
  },
});
