import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../../theme';

export interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
  size?: 'small' | 'large';
  style?: StyleProp<ViewStyle>;
}

export const Loading: React.FC<LoadingProps> = ({
  message = 'Loading...',
  fullScreen = false,
  size = 'large',
  style,
}) => {
  const { colors, typography, spacing } = useTheme();

  if (fullScreen) {
    return (
      <View style={[styles.fullScreenContainer, { backgroundColor: colors.background }, style]}>
        <ActivityIndicator size={size} color={colors.primary} />
        {message ? (
          <Text
            style={[
              styles.text,
              {
                color: colors.textSecondary,
                fontSize: typography.fontSizes.sm,
                marginTop: spacing.md,
              },
            ]}
          >
            {message}
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <View style={[styles.inlineContainer, { padding: spacing.lg }, style]}>
      <ActivityIndicator size={size} color={colors.primary} />
      {message ? (
        <Text
          style={[
            styles.text,
            {
              color: colors.textSecondary,
              fontSize: typography.fontSizes.sm,
              marginTop: spacing.md,
            },
          ]}
        >
          {message}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '500',
    textAlign: 'center',
  },
});
