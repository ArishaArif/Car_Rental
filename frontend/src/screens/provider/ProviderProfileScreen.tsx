import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProviderStackParamList, UserRole } from '../../types';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useFleet } from '../../context/FleetContext';
import { ScreenContainer, Header, Card, Button } from '../../components/common';

type ProviderProfileNavProp = NativeStackNavigationProp<
  ProviderStackParamList,
  'ProviderProfile'
>;

interface Props {
  navigation: ProviderProfileNavProp;
}

export const ProviderProfileScreen: React.FC<Props> = ({ navigation }) => {
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
          title="Provider Profile"
          subtitle="Fleet Owner Account & Credentials"
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
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                borderColor: colors.secondary,
                borderRadius: borderRadius.full,
              },
            ]}
          >
            <Text style={{ fontSize: 32 }}>🏢</Text>
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
            {user?.businessName || user?.name || 'Apex Luxury Mobility LLC'}
          </Text>

          <View
            style={[
              styles.roleBadge,
              { backgroundColor: colors.secondary, borderRadius: borderRadius.xs, marginTop: 4 },
            ]}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '800' }}>
              RENTAL SERVICE PROVIDER
            </Text>
          </View>

          <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.sm, marginTop: 6 }}>
            {user?.email}
          </Text>
        </Card>

        {/* Business Credentials Details */}
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
          Company Registry Details
        </Text>

        <Card variant="elevated" padding="medium" style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Operator Name</Text>
            <Text style={{ color: colors.textPrimary, fontSize: 12, fontWeight: '700' }}>
              {user?.name || 'Apex Fleet Holdings'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Registered Phone</Text>
            <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>
              {user?.phone || '+1 (555) 876-5432'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Base City / Territory</Text>
            <Text style={{ color: colors.textPrimary, fontSize: 12, fontWeight: '700' }}>
              {user?.city || 'Los Angeles, CA'}
            </Text>
          </View>
          <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Active Fleet Size</Text>
            <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '800' }}>
              {vehicles.length} Registered Vehicles
            </Text>
          </View>
        </Card>

        {/* Quick Cross-Role Testing Switcher */}
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
          Portal Navigation Switcher
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs, marginBottom: 12 }}>
          Switch active portal to test data synchronization across Customer, Provider, and Fleet Manager roles:
        </Text>

        <View style={styles.switchersGrid}>
          <Button
            title="Switch to Customer App"
            variant="outline"
            size="medium"
            fullWidth
            onPress={() => handleSwitchRole('Customer')}
            style={{ marginBottom: 8 }}
          />

          <Button
            title="Switch to Fleet Manager Portal"
            variant="secondary"
            size="medium"
            fullWidth
            onPress={() => handleSwitchRole('FleetManager')}
            style={{ marginBottom: 8 }}
          />
        </View>

        {/* Sign Out Action */}
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
