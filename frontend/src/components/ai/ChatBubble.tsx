import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme';
import { ChatMessage } from '../../types';

interface ChatBubbleProps {
  message: ChatMessage;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const { colors, typography, borderRadius } = useTheme();
  const isUser = message.sender === 'user';

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.aiContainer,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isUser
            ? [styles.userBubble, { backgroundColor: colors.primary, borderRadius: borderRadius.lg }]
            : [styles.aiBubble, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.lg }],
        ]}
      >
        {isUser && message.isVoiceInput && (
          <View style={styles.voiceBadge}>
            <Text style={styles.voiceBadgeText}>🎙️ Voice Input</Text>
          </View>
        )}

        <Text
          style={[
            styles.messageText,
            {
              fontSize: typography.fontSizes.md,
              color: isUser ? '#FFFFFF' : colors.textPrimary,
              lineHeight: 22,
            },
          ]}
        >
          {message.text}
        </Text>

        <Text
          style={[
            styles.timestamp,
            {
              fontSize: typography.fontSizes.xs,
              color: isUser ? 'rgba(255, 255, 255, 0.75)' : colors.textSecondary,
              textAlign: isUser ? 'right' : 'left',
            },
          ]}
        >
          {message.timestamp}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    width: '100%',
    flexDirection: 'row',
  },
  userContainer: {
    justifyContent: 'flex-end',
    paddingLeft: 36,
  },
  aiContainer: {
    justifyContent: 'flex-start',
    paddingRight: 36,
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: '88%',
    flexShrink: 1,
  },
  userBubble: {
    borderBottomRightRadius: 4,
    alignSelf: 'flex-end',
  },
  aiBubble: {
    borderTopLeftRadius: 4,
    borderWidth: 1,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  messageText: {
    fontWeight: '400',
    flexShrink: 1,
  },
  timestamp: {
    marginTop: 4,
  },
  voiceBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  voiceBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
