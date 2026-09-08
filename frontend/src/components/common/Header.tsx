import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../theme';

export interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightElement?: React.ReactNode;
  transparent?: boolean;
  style?: ViewStyle;
  titleStyle?: TextStyle;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBackPress,
  rightElement,
  transparent = false,
  style,
  titleStyle,
}) => {
  const { colors, typography, spacing } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: transparent ? 'transparent' : colors.surface,
          borderBottomColor: transparent ? 'transparent' : colors.border,
          borderBottomWidth: transparent ? 0 : 1,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm + 4,
        },
        style,
      ]}
    >
      <View style={styles.leftContainer}>
        {showBack ? (
          <TouchableOpacity
            onPress={onBackPress}
            style={[styles.backButton, { backgroundColor: colors.surfaceVariant }]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '700' }}>
              ←
            </Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.titleContainer}>
          <Text
            numberOfLines={1}
            style={[
              {
                color: colors.textPrimary,
                fontSize: typography.fontSizes.lg,
                fontWeight: typography.fontWeights.bold,
              },
              titleStyle,
            ]}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              numberOfLines={1}
              style={{
                color: colors.textSecondary,
                fontSize: typography.fontSizes.xs,
                marginTop: 2,
              }}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      {rightElement ? <View style={styles.rightContainer}>{rightElement}</View> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  rightContainer: {
    marginLeft: 12,
  },
});
