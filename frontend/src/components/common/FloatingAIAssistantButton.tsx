import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { AppIcon } from './AppIcon';

export interface FloatingAIAssistantButtonProps {
  onPress: () => void;
  bottom?: number;
  right?: number;
  style?: ViewStyle;
}

export const FloatingAIAssistantButton: React.FC<FloatingAIAssistantButtonProps> = ({
  onPress,
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
           top: '50%',
          marginTop: -28,
          right,
          shadowColor: colors.primary,
          borderColor: colors.surface,
        },
        style,
      ]}
      accessibilityLabel="AI Assistant"
      accessibilityRole="button"
    >
      <AppIcon name="chatbubble-ellipses" color="#FFFFFF" size={26} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 999,
  },
});
