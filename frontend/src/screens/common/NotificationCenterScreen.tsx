import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { AppNotification, NotificationCategory } from '../../types';
import { notificationService } from '../../services/notificationService';
import { ScreenContainer, Header, Card, Button } from '../../components/common';

interface Props {
  navigation: any;
}

export const NotificationCenterScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { user, role } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory | 'All'>('All');
  const [selectedNotification, setSelectedNotification] = useState<AppNotification | null>(null);

  useEffect(() => {
    const activeRole = user?.role || role;
    const loadData = async () => {
      const list = await notificationService.getNotifications(activeRole);
      setNotifications(list);
    };
    loadData();

    const unsubscribe = notificationService.subscribe(async () => {
      const list = await notificationService.getNotifications(activeRole);
      setNotifications(list);
    });
    return unsubscribe;
  }, [user?.role, role]);

  const filteredNotifications = notifications.filter(
    n => selectedCategory === 'All' || n.category === selectedCategory
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleOpenNotification = async (item: AppNotification) => {
    setSelectedNotification(item);
    if (!item.isRead) {
      await notificationService.markAsRead(item.id);
    }
  };

  const handleMarkAllRead = async () => {
    const activeRole = user?.role || role;
    await notificationService.markAllAsRead(activeRole);
  };

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'Booking':
        return '📅';
      case 'Payment':
        return '💳';
      case 'Rental':
        return '🔑';
      case 'Vehicle':
        return '🚘';
      case 'Maintenance':
        return '🛠️';
      case 'System':
      default:
        return '⚡';
    }
  };

  const getCategoryColor = (category: NotificationCategory) => {
    switch (category) {
      case 'Booking':
        return colors.primary;
      case 'Payment':
        return colors.success || '#10B981';
      case 'Rental':
        return colors.accent;
      case 'Vehicle':
        return '#3B82F6';
      case 'Maintenance':
        return colors.warning;
      case 'System':
      default:
        return colors.secondary;
    }
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="Notification Center"
          subtitle={
            unreadCount > 0
              ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}`
              : 'All caught up'
          }
          showBack
          onBackPress={() => navigation.goBack()}
          rightElement={
            unreadCount > 0 ? (
              <Button
                title="Mark all read"
                variant="ghost"
                size="small"
                onPress={handleMarkAllRead}
              />
            ) : null
          }
        />
      }
    >
      <View style={[styles.content, { padding: spacing.md }]}>
        {/* Category Filter Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {(
            [
              'All',
              'Booking',
              'Payment',
              'Rental',
              'Vehicle',
              'Maintenance',
              'System',
            ] as const
          ).map(cat => {
            const isSelected = selectedCategory === cat;
            const count =
              cat === 'All'
                ? notifications.length
                : notifications.filter(n => n.category === cat).length;

            return (
              <TouchableOpacity
                key={cat}
                activeOpacity={0.8}
                onPress={() => setSelectedCategory(cat)}
                style={[
                  styles.catTab,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderRadius: borderRadius.md,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.catTabText,
                    {
                      color: isSelected ? colors.textInverse : colors.textPrimary,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {cat} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <Card variant="flat" padding="large" style={styles.emptyCard}>
            <Text style={{ fontSize: 32, textAlign: 'center' }}>🔔</Text>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: typography.fontSizes.md,
                fontWeight: '700',
                textAlign: 'center',
                marginTop: 8,
              }}
            >
              No Notifications
            </Text>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: typography.fontSizes.xs,
                textAlign: 'center',
                marginTop: 4,
              }}
            >
              You have no alerts in the {selectedCategory} category.
            </Text>
          </Card>
        ) : (
          filteredNotifications.map(item => {
            const categoryColor = getCategoryColor(item.category);
            const icon = getCategoryIcon(item.category);

            return (
              <Card
                key={item.id}
                variant="elevated"
                padding="medium"
                style={[
                  styles.notifCard,
                  {
                    borderColor: !item.isRead ? categoryColor : colors.border,
                    borderWidth: !item.isRead ? 1.5 : 1,
                    backgroundColor: !item.isRead
                      ? 'rgba(0, 229, 255, 0.03)'
                      : colors.surface,
                  },
                ]}
                onPress={() => handleOpenNotification(item)}
              >
                <View style={styles.cardHeader}>
                  {/* Category icon & title */}
                  <View style={styles.titleArea}>
                    <View
                      style={[
                        styles.iconCircle,
                        {
                          backgroundColor: `${categoryColor}20`,
                          borderRadius: borderRadius.full,
                        },
                      ]}
                    >
                      <Text style={{ fontSize: 16 }}>{icon}</Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.notifTitle,
                          {
                            color: colors.textPrimary,
                            fontSize: typography.fontSizes.sm,
                            fontWeight: item.isRead ? '600' : '800',
                          },
                        ]}
                      >
                        {item.title}
                      </Text>
                      <Text style={[styles.timestamp, { color: colors.textMuted }]}>
                        {item.category} • {item.timestamp}
                      </Text>
                    </View>
                  </View>

                  {/* Unread indicator dot */}
                  {!item.isRead && (
                    <View
                      style={[
                        styles.unreadDot,
                        { backgroundColor: categoryColor, borderRadius: borderRadius.full },
                      ]}
                    />
                  )}
                </View>

                {/* Message preview */}
                <Text
                  numberOfLines={2}
                  style={[
                    styles.notifMessage,
                    {
                      color: colors.textSecondary,
                      fontSize: typography.fontSizes.xs,
                      marginTop: 8,
                      lineHeight: 18,
                    },
                  ]}
                >
                  {item.message}
                </Text>
              </Card>
            );
          })
        )}

        {/* Detailed Notification Modal */}
        <Modal
          visible={Boolean(selectedNotification)}
          animationType="fade"
          transparent
          onRequestClose={() => setSelectedNotification(null)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalBox,
                { backgroundColor: colors.surface, borderRadius: borderRadius.xl },
              ]}
            >
              {selectedNotification && (
                <>
                  <View style={styles.modalHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <Text style={{ fontSize: 22, marginRight: 8 }}>
                        {getCategoryIcon(selectedNotification.category)}
                      </Text>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.modalCategory,
                            {
                              color: getCategoryColor(selectedNotification.category),
                              fontSize: 10,
                              fontWeight: '800',
                              letterSpacing: 0.5,
                            },
                          ]}
                        >
                          {selectedNotification.category.toUpperCase()} ALERT
                        </Text>
                        <Text
                          style={[
                            styles.modalTimestamp,
                            { color: colors.textMuted, fontSize: 10 },
                          ]}
                        >
                          Received {selectedNotification.timestamp}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => setSelectedNotification(null)}
                      style={[styles.closeBtn, { backgroundColor: colors.surfaceVariant }]}
                    >
                      <Text style={{ fontSize: 16, color: colors.textPrimary }}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <Text
                    style={[
                      styles.modalTitle,
                      {
                        color: colors.textPrimary,
                        fontSize: typography.fontSizes.md,
                        fontWeight: typography.fontWeights.bold,
                        marginTop: 6,
                        marginBottom: 10,
                      },
                    ]}
                  >
                    {selectedNotification.title}
                  </Text>

                  <View
                    style={[
                      styles.modalMessageBox,
                      { backgroundColor: colors.surfaceVariant, borderRadius: borderRadius.sm },
                    ]}
                  >
                    <Text
                      style={[
                        styles.modalMessage,
                        {
                          color: colors.textPrimary,
                          fontSize: typography.fontSizes.sm,
                          lineHeight: 20,
                        },
                      ]}
                    >
                      {selectedNotification.message}
                    </Text>
                  </View>

                  {/* Actions */}
                  <View style={styles.modalFooter}>
                    <Button
                      title="Close"
                      variant="primary"
                      size="medium"
                      fullWidth
                      onPress={() => setSelectedNotification(null)}
                    />
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 40,
  },
  categoryScroll: {
    gap: 8,
    paddingBottom: 14,
  },
  catTab: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
  },
  catTabText: {
    fontSize: 11,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  notifCard: {
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleArea: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  notifTitle: {
    letterSpacing: -0.2,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 2,
  },
  unreadDot: {
    width: 8,
    height: 8,
    marginLeft: 8,
  },
  notifMessage: {
    paddingLeft: 44,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalCategory: {
    lineHeight: 12,
  },
  modalTimestamp: {
    marginTop: 2,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    letterSpacing: -0.2,
  },
  modalMessageBox: {
    padding: 12,
    marginBottom: 16,
  },
  modalMessage: {
    letterSpacing: 0,
  },
  modalFooter: {
    marginTop: 4,
  },
});
