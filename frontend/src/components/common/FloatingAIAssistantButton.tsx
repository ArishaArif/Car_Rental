import React from 'react';
import { StyleSheet, TouchableOpacity, Text, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

export interface FloatingAIAssistantButtonProps {
  onPress: () => void;
  bottom?: number;
  right?: number;
  style?: ViewStyle;
}

export const FloatingAIAssistantButton: React.FC<FloatingAIAssistantButtonProps> = ({
  onPress,
  bottom = 24,
  right = 20,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor: colors.primary,
          bottom,
          right,
          shadowColor: colors.primary,
        },
        style,
      ]}
      accessibilityLabel="AI Assistant"
      accessibilityRole="button"
    >
      <Text style={styles.icon}>🤖</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    zIndex: 999,
  },
  icon: {
    fontSize: 28,
  },
});
