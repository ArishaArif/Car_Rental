import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../types';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import { notificationService } from '../../services/notificationService';
import { ScreenContainer, Header, Card } from '../../components/common';

type AdminDashboardNavProp = NativeStackNavigationProp<AdminStackParamList, 'AdminDashboard'>;

interface Props {
  navigation: AdminDashboardNavProp;
}

export const AdminDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { user } = useAuth();
  const [kpis, setKpis] = useState(adminService.getKPIs());
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const unsubscribe = adminService.subscribe(() => {
      setKpis(adminService.getKPIs());
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const loadUnread = async () => {
      const count = await notificationService.getUnreadCount('Admin');
      setUnreadCount(count);
    };
    loadUnread();

    const unsubscribe = notificationService.subscribe(async () => {
      const count = await notificationService.getUnreadCount('Admin');
      setUnreadCount(count);
    });
    return unsubscribe;
  }, []);

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="System Admin Console"
          subtitle={user?.department || 'Platform Oversight & Security'}
          rightElement={
            <View style={styles.headerRight}>
              <TouchableOpacity
                onPress={() => navigation.navigate('NotificationCenter')}
                style={[
                  styles.profileAvatar,
                  {
                    backgroundColor: colors.surfaceVariant,
                    borderColor: colors.border,
                    borderRadius: borderRadius.full,
                  },
                ]}
              >
                <Text style={{ fontSize: 16 }}>🔔</Text>
                {unreadCount > 0 && (
                  <View
                    style={[
                      styles.unreadBadge,
                      { backgroundColor: colors.danger, borderRadius: borderRadius.full },
                    ]}
                  >
                    <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('AdminProfile')}
                style={[
                  styles.profileAvatar,
                  {
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    borderColor: colors.danger,
                    borderRadius: borderRadius.full,
                  },
                ]}
              >
                <Text style={styles.avatarEmoji}>🛡️</Text>
              </TouchableOpacity>
            </View>
          }
        />
      }
    >
      <View style={[styles.content, { padding: spacing.md }]}>
        {/* Platform Overview Banner */}
        <View style={styles.bannerBlock}>
          <Text
            style={[
              styles.bannerTitle,
              {
                color: colors.textPrimary,
                fontSize: typography.fontSizes.xl,
                fontWeight: typography.fontWeights.heavy,
              },
            ]}
          >
            Ecosystem Overview
          </Text>
          <Text
            style={[
              styles.bannerSubtitle,
              {
                color: colors.textSecondary,
                fontSize: typography.fontSizes.xs,
                marginTop: spacing.xs,
              },
            ]}
          >
            Live metrics across registered users, providers, fleet assets, and financial flows.
          </Text>
        </View>

        {/* 8 Realistic Mock Metrics using reusable Card components */}
        <View style={styles.kpiGrid}>
          {/* Total Customers */}
          <Card
            variant="elevated"
            padding="medium"
            style={styles.kpiCard}
            onPress={() => navigation.navigate('AdminUsers')}
          >
            <View style={styles.kpiHeaderRow}>
              <Text style={styles.kpiIcon}>👥</Text>
              <Text style={[styles.kpiValue, { color: colors.textPrimary }]}>
                {kpis.totalCustomers.toLocaleString()}
              </Text>
            </View>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Total Customers</Text>
            <Text style={[styles.kpiActionText, { color: colors.primary }]}>View Directory →</Text>
          </Card>

          {/* Total Providers */}
          <Card
            variant="elevated"
            padding="medium"
            style={styles.kpiCard}
            onPress={() => navigation.navigate('AdminProviders')}
          >
            <View style={styles.kpiHeaderRow}>
              <Text style={styles.kpiIcon}>🏢</Text>
              <Text style={[styles.kpiValue, { color: colors.secondary }]}>
                {kpis.totalProviders}
              </Text>
            </View>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Total Providers</Text>
            <Text style={[styles.kpiActionText, { color: colors.secondary }]}>Manage Hosts →</Text>
          </Card>

          {/* Total Vehicles */}
          <Card
            variant="elevated"
            padding="medium"
            style={styles.kpiCard}
            onPress={() => navigation.navigate('AdminVehicles')}
          >
            <View style={styles.kpiHeaderRow}>
              <Text style={styles.kpiIcon}>🚗</Text>
              <Text style={[styles.kpiValue, { color: colors.accent }]}>
                {kpis.totalVehicles}
              </Text>
            </View>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Total Vehicles</Text>
            <Text style={[styles.kpiActionText, { color: colors.accent }]}>Fleet Inventory →</Text>
          </Card>

          {/* Active Rentals */}
          <Card
            variant="elevated"
            padding="medium"
            style={styles.kpiCard}
            onPress={() => navigation.navigate('AdminBookings', { initialFilter: 'Active' })}
          >
            <View style={styles.kpiHeaderRow}>
              <Text style={styles.kpiIcon}>⚡</Text>
              <Text style={[styles.kpiValue, { color: colors.warning }]}>
                {kpis.activeRentals}
              </Text>
            </View>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Active Rentals</Text>
            <Text style={[styles.kpiActionText, { color: colors.warning }]}>Live Dispatches →</Text>
          </Card>

          {/* Total Bookings */}
          <Card
            variant="elevated"
            padding="medium"
            style={styles.kpiCard}
            onPress={() => navigation.navigate('AdminBookings')}
          >
            <View style={styles.kpiHeaderRow}>
              <Text style={styles.kpiIcon}>📑</Text>
              <Text style={[styles.kpiValue, { color: colors.textPrimary }]}>
                {kpis.totalBookings.toLocaleString()}
              </Text>
            </View>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Total Bookings</Text>
            <Text style={[styles.kpiActionText, { color: colors.primary }]}>Booking Logs →</Text>
          </Card>

          {/* Platform Revenue */}
          <Card
            variant="elevated"
            padding="medium"
            style={styles.kpiCard}
            onPress={() => navigation.navigate('AdminPayments')}
          >
            <View style={styles.kpiHeaderRow}>
              <Text style={styles.kpiIcon}>💵</Text>
              <Text style={[styles.kpiValue, { color: colors.success || '#10B981' }]}>
                ${(kpis.platformRevenue / 1000).toFixed(1)}k
              </Text>
            </View>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Platform Revenue</Text>
            <Text style={[styles.kpiActionText, { color: colors.success || '#10B981' }]}>
              Financials →
            </Text>
          </Card>

          {/* Pending Verifications */}
          <Card
            variant="elevated"
            padding="medium"
            style={styles.kpiCard}
            onPress={() => navigation.navigate('AdminProviderVerification')}
          >
            <View style={styles.kpiHeaderRow}>
              <Text style={styles.kpiIcon}>⏳</Text>
              <Text style={[styles.kpiValue, { color: '#F59E0B' }]}>
                {kpis.pendingVerifications}
              </Text>
            </View>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>
              Pending Verifications
            </Text>
            <Text style={[styles.kpiActionText, { color: '#F59E0B' }]}>Review Queue →</Text>
          </Card>

          {/* Open Disputes */}
          <Card
            variant="elevated"
            padding="medium"
            style={styles.kpiCard}
            onPress={() => navigation.navigate('AdminDisputes')}
          >
            <View style={styles.kpiHeaderRow}>
              <Text style={styles.kpiIcon}>⚖️</Text>
              <Text style={[styles.kpiValue, { color: colors.danger }]}>
                {kpis.openDisputes}
              </Text>
            </View>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Open Disputes</Text>
            <Text style={[styles.kpiActionText, { color: colors.danger }]}>Mediation Desk →</Text>
          </Card>
        </View>

        {/* Priority Action Callouts */}
        {kpis.pendingVerifications > 0 && (
          <Card
            variant="flat"
            padding="medium"
            style={[styles.urgentCard, { borderColor: '#F59E0B', marginTop: spacing.sm }]}
            onPress={() => navigation.navigate('AdminProviderVerification')}
          >
            <View style={styles.urgentRow}>
              <Text style={styles.urgentIcon}>🛡️</Text>
              <View style={styles.urgentBody}>
                <Text style={[styles.urgentTitle, { color: '#D97706' }]}>
                  {kpis.pendingVerifications} Verification Submissions Awaiting Audit
                </Text>
                <Text style={[styles.urgentSubtitle, { color: colors.textSecondary }]}>
                  Commercial insurance and customer driving licenses pending review.
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Admin Navigation Hub Modules */}
        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.textPrimary,
              fontSize: typography.fontSizes.md,
              fontWeight: typography.fontWeights.bold,
              marginTop: spacing.lg,
              marginBottom: spacing.sm,
            },
          ]}
        >
          Administrative Control Modules
        </Text>

        <View style={styles.modulesGrid}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('AdminUsers')}
            style={[styles.moduleCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={styles.moduleEmoji}>👤</Text>
            <Text style={[styles.moduleLabel, { color: colors.textPrimary }]}>Users Directory</Text>
            <Text style={[styles.moduleDesc, { color: colors.textMuted }]}>
              Customer & host accounts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('AdminProviders')}
            style={[styles.moduleCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={styles.moduleEmoji}>🏢</Text>
            <Text style={[styles.moduleLabel, { color: colors.textPrimary }]}>Providers</Text>
            <Text style={[styles.moduleDesc, { color: colors.textMuted }]}>
              Commercial fleet hosts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('AdminProviderVerification')}
            style={[styles.moduleCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={styles.moduleEmoji}>📑</Text>
            <Text style={[styles.moduleLabel, { color: colors.textPrimary }]}>Provider KYC</Text>
            <Text style={[styles.moduleDesc, { color: colors.textMuted }]}>
              Licenses & permits
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('AdminCustomerVerification')}
            style={[styles.moduleCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={styles.moduleEmoji}>🪪</Text>
            <Text style={[styles.moduleLabel, { color: colors.textPrimary }]}>Customer KYC</Text>
            <Text style={[styles.moduleDesc, { color: colors.textMuted }]}>
              Driver license checks
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('AdminVehicles')}
            style={[styles.moduleCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={styles.moduleEmoji}>🚘</Text>
            <Text style={[styles.moduleLabel, { color: colors.textPrimary }]}>Vehicles</Text>
            <Text style={[styles.moduleDesc, { color: colors.textMuted }]}>
              Global fleet inventory
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('AdminBookings')}
            style={[styles.moduleCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={styles.moduleEmoji}>📅</Text>
            <Text style={[styles.moduleLabel, { color: colors.textPrimary }]}>Bookings</Text>
            <Text style={[styles.moduleDesc, { color: colors.textMuted }]}>
              Lifecycle reservations
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('AdminPayments')}
            style={[styles.moduleCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={styles.moduleEmoji}>💳</Text>
            <Text style={[styles.moduleLabel, { color: colors.textPrimary }]}>Payments & Payouts</Text>
            <Text style={[styles.moduleDesc, { color: colors.textMuted }]}>
              Commissions & escrow
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('AdminDisputes')}
            style={[styles.moduleCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={styles.moduleEmoji}>⚖️</Text>
            <Text style={[styles.moduleLabel, { color: colors.textPrimary }]}>Disputes Desk</Text>
            <Text style={[styles.moduleDesc, { color: colors.textMuted }]}>
              Damage & fee resolutions
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('AdminReports')}
            style={[styles.moduleCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={styles.moduleEmoji}>📊</Text>
            <Text style={[styles.moduleLabel, { color: colors.textPrimary }]}>Global Reports</Text>
            <Text style={[styles.moduleDesc, { color: colors.textMuted }]}>
              Utilization & yield
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('AdminConfig')}
            style={[styles.moduleCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={styles.moduleEmoji}>⚙️</Text>
            <Text style={[styles.moduleLabel, { color: colors.textPrimary }]}>System Settings</Text>
            <Text style={[styles.moduleDesc, { color: colors.textMuted }]}>
              Fees, regions, categories
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 40,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 18,
  },
  bannerBlock: {
    marginBottom: 16,
  },
  bannerTitle: {
    letterSpacing: -0.3,
  },
  bannerSubtitle: {
    lineHeight: 18,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  kpiCard: {
    flexBasis: '47%',
    flexGrow: 1,
    borderWidth: 1,
    minHeight: 104,
    justifyContent: 'space-between',
  },
  kpiHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kpiIcon: {
    fontSize: 20,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  kpiActionText: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  urgentCard: {
    borderWidth: 1,
    borderRadius: 8,
  },
  urgentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  urgentIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  urgentBody: {
    flex: 1,
  },
  urgentTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  urgentSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  sectionTitle: {
    letterSpacing: -0.2,
  },
  modulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  moduleCard: {
    flexBasis: '47%',
    flexGrow: 1,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  moduleEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  moduleLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  moduleDesc: {
    fontSize: 10,
    marginTop: 2,
  },
});
