import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../../theme';
import { ChatMessage, Vehicle } from '../../types';
import { ChatBubble } from './ChatBubble';
import { VehicleChatCard } from './VehicleChatCard';

interface AIMessageProps {
  message: ChatMessage;
  onSelectVehicle: (vehicleId: string) => void;
  onSelectQuickReply?: (reply: string) => void;
  isTyping?: boolean;
}

export const AIMessage: React.FC<AIMessageProps> = ({
  message,
  onSelectVehicle,
  onSelectQuickReply,
}) => {
  const { colors, typography, borderRadius } = useTheme();

  return (
    <View style={styles.container}>
      {/* AI Sender Header */}
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>🤖</Text>
        </View>
        <Text style={[styles.senderTitle, { color: colors.textPrimary, fontSize: typography.fontSizes.sm }]}>
          Fleet AI Assistant
        </Text>
        {message.language && (
          <View style={[styles.langBadge, { backgroundColor: colors.border }]}>
            <Text style={[styles.langBadgeText, { color: colors.textSecondary }]}>
              {message.language}
            </Text>
          </View>
        )}
      </View>

      {/* Main Message Bubble */}
      <ChatBubble message={message} />

      {/* Vehicle Recommendations Carousel */}
      {message.recommendations && message.recommendations.length > 0 && (
        <View style={styles.carouselSection}>
          <Text style={[styles.carouselHeader, { color: colors.textSecondary, fontSize: typography.fontSizes.xs }]}>
            RECOMMENDED MATCHES ({message.recommendations.length})
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContainer}
          >
            {message.recommendations.map((veh: Vehicle) => (
              <VehicleChatCard
                key={veh.id}
                vehicle={veh}
                onSelect={onSelectVehicle}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Quick Replies */}
      {message.quickReplies && message.quickReplies.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.repliesContainer}
        >
          {message.quickReplies.map((reply, idx) => (
            <TouchableOpacity
              key={`quick-${idx}`}
              activeOpacity={0.7}
              onPress={() => onSelectQuickReply?.(reply)}
              style={[
                styles.replyChip,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.primary,
                  borderRadius: borderRadius.full,
                },
              ]}
            >
              <Text style={[styles.replyText, { color: colors.primary }]}>
                {reply}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    fontSize: 14,
  },
  senderTitle: {
    fontWeight: '700',
  },
  langBadge: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  langBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  carouselSection: {
    marginTop: 8,
  },
  carouselHeader: {
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  carouselContainer: {
    paddingVertical: 4,
    paddingRight: 16,
  },
  repliesContainer: {
    flexDirection: 'row',
    paddingVertical: 6,
    gap: 8,
  },
  replyChip: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
  },
  replyText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
