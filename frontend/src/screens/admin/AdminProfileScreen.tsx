import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList, UserRole } from '../../types';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { ScreenContainer, Header, Card, Button } from '../../components/common';

type AdminProfileNavProp = NativeStackNavigationProp<AdminStackParamList, 'AdminProfile'>;

interface Props {
  navigation: AdminProfileNavProp;
}

export const AdminProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { user, logout, selectRole, isLoading } = useAuth();

  const handleSwitchRole = async (targetRole: UserRole) => {
    Alert.alert(
      `Switch to ${targetRole} View`,
      `Would you like to switch your active portal view to ${targetRole} for cross-role inspection?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Switch Portal',
          onPress: async () => {
            await selectRole(targetRole);
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="System Admin Profile"
          subtitle="Security Clearance & Root Oversight"
          showBack
          onBackPress={() => navigation.goBack()}
        />
      }
    >
      <View style={[styles.content, { padding: spacing.md }]}>
        {/* Profile Card */}
        <Card
          variant="elevated"
          padding="large"
          style={[styles.profileCard, { borderColor: colors.border }]}
        >
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
            <Text style={{ fontSize: 32 }}>🛡️</Text>
          </View>

          <Text
            style={{
              color: colors.textPrimary,
              fontSize: typography.fontSizes.xl,
              fontWeight: typography.fontWeights.bold,
              marginTop: spacing.sm,
              textAlign: 'center',
            }}
          >
            {user?.name || 'Elena Rostova'}
          </Text>

          <View
            style={[
              styles.roleBadge,
              { backgroundColor: colors.danger, borderRadius: borderRadius.xs, marginTop: 4 },
            ]}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '800' }}>
              PLATFORM SYSTEM ADMINISTRATOR
            </Text>
          </View>

          <Text
            style={{
              color: colors.textSecondary,
              fontSize: typography.fontSizes.sm,
              marginTop: 6,
            }}
          >
            {user?.email || 'admin@carrental.com'}
          </Text>
        </Card>

        {/* Security & Access Scope */}
        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.textPrimary,
              fontSize: typography.fontSizes.md,
              fontWeight: typography.fontWeights.bold,
              marginTop: spacing.lg,
              marginBottom: 8,
            },
          ]}
        >
          Root Authorization Credentials
        </Text>

        <Card variant="elevated" padding="medium" style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Department</Text>
            <Text style={{ color: colors.textPrimary, fontSize: 12, fontWeight: '700' }}>
              {user?.department || 'Platform Security & Operations'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Admin Clearance UID</Text>
            <Text style={{ color: colors.danger, fontSize: 12, fontWeight: '800' }}>
              {user?.id || 'admin-301'} (SuperAdmin)
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Emergency Contact</Text>
            <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>
              {user?.phone || '+1 (555) 000-1122'}
            </Text>
          </View>

          <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Audit Logging</Text>
            <Text style={{ color: colors.success || '#10B981', fontSize: 12, fontWeight: '700' }}>
              Active (Immutable)
            </Text>
          </View>
        </Card>

        {/* Cross-Role Portal Switcher */}
        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.textPrimary,
              fontSize: typography.fontSizes.md,
              fontWeight: typography.fontWeights.bold,
              marginTop: spacing.lg,
              marginBottom: 8,
            },
          ]}
        >
          Cross-Role Inspection Switcher
        </Text>
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: typography.fontSizes.xs,
            marginBottom: 12,
            lineHeight: 18,
          }}
        >
          Seamlessly transition your active view into Customer, Provider, or Fleet Manager portals to verify user experience and workflows:
        </Text>

        <View style={styles.switchersGrid}>
          <Button
            title="Switch to Provider Portal"
            variant="secondary"
            size="medium"
            fullWidth
            onPress={() => handleSwitchRole('Provider')}
            style={{ marginBottom: 8 }}
          />

          <Button
            title="Switch to Fleet Operations Desk"
            variant="secondary"
            size="medium"
            fullWidth
            onPress={() => handleSwitchRole('FleetManager')}
            style={{ marginBottom: 8 }}
          />

          <Button
            title="Switch to Customer Discovery"
            variant="outline"
            size="medium"
            fullWidth
            onPress={() => handleSwitchRole('Customer')}
            style={{ marginBottom: 8 }}
          />
        </View>

        {/* Sign Out */}
        <Button
          title="Sign Out (Terminate Admin Session)"
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
    paddingBottom: 40,
  },
  profileCard: {
    alignItems: 'center',
    borderWidth: 1,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  sectionTitle: {
    letterSpacing: -0.2,
  },
  detailsCard: {
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(148, 163, 184, 0.15)',
  },
  switchersGrid: {
    gap: 8,
  },
});
