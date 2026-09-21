import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FleetManagerStackParamList, UserRole } from '../../types';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useFleet } from '../../context/FleetContext';
import { ScreenContainer, Header, Card, Button } from '../../components/common';

type FleetManagerProfileNavProp = NativeStackNavigationProp<
  FleetManagerStackParamList,
  'FleetManagerProfile'
>;

interface Props {
  navigation: FleetManagerProfileNavProp;
}

export const FleetManagerProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { user, logout, selectRole, isLoading } = useAuth();
  const { vehicles } = useFleet();

  const handleSwitchRole = async (targetRole: UserRole) => {
    Alert.alert(
      `Switch to ${targetRole} Portal`,
      `Would you like to switch your active portal view to ${targetRole}?`,
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
          title="Fleet Manager Profile"
          subtitle="Operational Management Account"
          showBack
          onBackPress={() => navigation.goBack()}
        />
      }
    >
      <View style={[styles.content, { padding: spacing.md }]}>
        {/* Profile Card */}
        <Card variant="elevated" padding="large" style={[styles.profileCard, { borderColor: colors.border }]}>
          <View
            style={[
              styles.avatarContainer,
              {
                backgroundColor: 'rgba(0, 229, 255, 0.15)',
                borderColor: colors.primary,
                borderRadius: borderRadius.full,
              },
            ]}
          >
            <Text style={{ fontSize: 32 }}>🛠️</Text>
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
            {user?.name || 'Marcus Chen'}
          </Text>

          <View
            style={[
              styles.roleBadge,
              { backgroundColor: colors.accent, borderRadius: borderRadius.xs, marginTop: 4 },
            ]}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '800' }}>
              FLEET MANAGER & OPERATIONS LEAD
            </Text>
          </View>

          <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.sm, marginTop: 6 }}>
            {user?.email || 'fleet@carrental.com'}
          </Text>
        </Card>

        {/* Operational Scope */}
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
          Operational Hub Telematics
        </Text>

        <Card variant="elevated" padding="medium" style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Department</Text>
            <Text style={{ color: colors.textPrimary, fontSize: 12, fontWeight: '700' }}>
              {user?.department || 'Fleet Operations & Logistics'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Base City Depot</Text>
            <Text style={{ color: colors.textPrimary, fontSize: 12, fontWeight: '700' }}>
              {user?.city || 'Austin Hub Central, TX'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Supervised Vehicles</Text>
            <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '800' }}>
              {vehicles.length} Units Active
            </Text>
          </View>
          <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Support Line</Text>
            <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '700' }}>
              {user?.phone || '+1 (555) 345-6789'}
            </Text>
          </View>
        </Card>

        {/* Portal Switcher */}
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
          Cross-Role Verification Switcher
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs, marginBottom: 12 }}>
          Switch role view to verify shared vehicle and booking state consistency:
        </Text>

        <View style={styles.switchersGrid}>
          <Button
            title="Switch to Provider Dashboard"
            variant="primary"
            size="medium"
            fullWidth
            onPress={() => handleSwitchRole('Provider')}
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
          title="Sign Out"
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
    paddingBottom: 32,
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
