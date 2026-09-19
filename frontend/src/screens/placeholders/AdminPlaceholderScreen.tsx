import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { ScreenContainer, Header, Card, Button } from '../../components/common';

export const AdminPlaceholderScreen: React.FC = () => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { user, logout, isLoading } = useAuth();

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="Admin Console"
          subtitle="System & Platform Oversight"
          rightElement={
            <Button
              title="Sign Out"
              variant="outline"
              size="small"
              onPress={logout}
              loading={isLoading}
            />
          }
        />
      }
    >
      <View style={[styles.content, { padding: spacing.lg }]}>
        {/* Welcome Card */}
        <Card variant="elevated" padding="large" style={styles.card}>
          <View
            style={[
              styles.avatarContainer,
              {
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                borderColor: colors.danger,
                borderRadius: borderRadius.full,
              },
            ]}
          >
            <Text style={styles.avatarEmoji}>{user?.avatarUrl || '🛡️'}</Text>
          </View>

          <Text
            style={[
              styles.welcomeTitle,
              {
                color: colors.textPrimary,
                fontSize: typography.fontSizes.xxl,
                fontWeight: typography.fontWeights.bold,
                marginTop: spacing.sm,
              },
            ]}
          >
            {user?.name || 'System Admin'}
          </Text>

          <View
            style={[
              styles.roleBadge,
              {
                backgroundColor: colors.danger,
                borderRadius: borderRadius.xs,
                marginTop: spacing.xs,
              },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: '#FFFFFF', fontSize: typography.fontSizes.xs, fontWeight: '700' },
              ]}
            >
              SYSTEM ADMINISTRATOR
            </Text>
          </View>

          <Text
            style={[
              styles.userEmail,
              {
                color: colors.textSecondary,
                fontSize: typography.fontSizes.sm,
                marginTop: spacing.xs + 2,
              },
            ]}
          >
            {user?.email}
          </Text>

          {user?.department ? (
            <Text style={[styles.detailText, { color: colors.textMuted, fontSize: typography.fontSizes.xs }]}>
              🛡️ Department: {user.department}
            </Text>
          ) : null}

          {user?.id ? (
            <Text style={[styles.detailText, { color: colors.textMuted, fontSize: typography.fontSizes.xs }]}>
              🔑 Admin UID: {user.id}
            </Text>
          ) : null}
        </Card>

        {/* Temporary Destination Notice */}
        <Card
          variant="flat"
          padding="medium"
          style={[styles.noticeCard, { borderColor: colors.border, marginTop: spacing.md }]}
        >
          <Text style={{ color: colors.danger, fontWeight: '700', fontSize: typography.fontSizes.sm }}>
            ⚡ Admin Route Verified Successfully
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: typography.fontSizes.xs,
              marginTop: 4,
              lineHeight: 18,
            }}
          >
            Admin navigation route reached. System-wide user moderation, host verification approvals, and audit logs
            will be built in the upcoming Admin phase.
          </Text>
        </Card>

        {/* Logout action */}
        <Button
          title="Sign Out (Logout State)"
          variant="danger"
          size="medium"
          fullWidth
          loading={isLoading}
          onPress={logout}
          style={{ marginTop: spacing.xl }}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
  },
  card: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  avatarContainer: {
    width: 68,
    height: 68,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 34,
  },
  welcomeTitle: {
    textAlign: 'center',
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: {
    letterSpacing: 0.5,
  },
  userEmail: {
    textAlign: 'center',
  },
  detailText: {
    marginTop: 4,
  },
  noticeCard: {
    width: '100%',
    borderWidth: 1,
  },
});
