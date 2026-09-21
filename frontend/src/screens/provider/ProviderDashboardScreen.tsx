import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProviderStackParamList } from '../../types';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useFleet } from '../../context/FleetContext';
import { useBooking } from '../../context/BookingContext';
import { ScreenContainer, Header, Card, Button } from '../../components/common';

type ProviderDashboardNavProp = NativeStackNavigationProp<
  ProviderStackParamList,
  'ProviderDashboard'
>;

interface Props {
  navigation: ProviderDashboardNavProp;
}

export const ProviderDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { user, logout, isLoading } = useAuth();
  const { vehicles, getDashboardKPIs } = useFleet();
  const { bookings, getRevenueMetrics } = useBooking();

  const kpis = getDashboardKPIs();
  const rev = getRevenueMetrics();

  const pendingBookings = bookings.filter(b => b.status === 'Pending').length;
  const activeRentals = bookings.filter(b => b.status === 'Active').length;

  const recentBookings = bookings.slice(0, 3);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return colors.primary;
      case 'Confirmed':
        return colors.accent;
      case 'Pending':
        return colors.warning;
      case 'Completed':
        return '#3B82F6';
      case 'Cancelled':
      default:
        return colors.danger;
    }
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title={user?.businessName || 'Apex Fleet Holdings'}
          subtitle="Provider Operations Portal"
          rightElement={
            <TouchableOpacity
              onPress={() => navigation.navigate('ProviderProfile')}
              style={[
                styles.profileAvatar,
                {
                  backgroundColor: colors.surfaceVariant,
                  borderColor: colors.primary,
                  borderRadius: borderRadius.full,
                },
              ]}
            >
              <Text style={styles.avatarEmoji}>{user?.avatarUrl || '🏢'}</Text>
            </TouchableOpacity>
          }
        />
      }
    >
      <View style={[styles.container, { padding: spacing.md }]}>
        {/* Welcome & Role Banner */}
        <View style={styles.topGreeting}>
          <View>
            <Text
              style={[
                styles.greetingText,
                {
                  color: colors.textPrimary,
                  fontSize: typography.fontSizes.xl,
                  fontWeight: typography.fontWeights.heavy,
                },
              ]}
            >
              Fleet Performance Overview
            </Text>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: typography.fontSizes.xs,
                marginTop: 2,
              }}
            >
              Base Depot: {user?.city || 'Los Angeles Hub West'} • Real-time Sync
            </Text>
          </View>
        </View>

        {/* Primary KPI Grid */}
        <View style={styles.statsGrid}>
          {/* Total Vehicles */}
          <Card
            variant="elevated"
            padding="medium"
            style={styles.statCard}
            onPress={() => navigation.navigate('FleetList')}
          >
            <View style={styles.statTopRow}>
              <Text style={{ fontSize: 20 }}>🚗</Text>
              <Text
                style={[
                  styles.statValue,
                  {
                    color: colors.textPrimary,
                    fontSize: typography.fontSizes.xxl,
                    fontWeight: typography.fontWeights.heavy,
                  },
                ]}
              >
                {kpis.vehicles}
              </Text>
            </View>
            <Text
              style={[
                styles.statLabel,
                { color: colors.textSecondary, fontSize: typography.fontSizes.xs },
              ]}
            >
              Total Vehicles
            </Text>
            <Text style={{ color: colors.primary, fontSize: 10, marginTop: 4, fontWeight: '700' }}>
              View fleet →
            </Text>
          </Card>

          {/* Available Vehicles */}
          <Card
            variant="elevated"
            padding="medium"
            style={styles.statCard}
            onPress={() => navigation.navigate('FleetList', { filterStatus: 'Available' })}
          >
            <View style={styles.statTopRow}>
              <Text style={{ fontSize: 20 }}>✅</Text>
              <Text
                style={[
                  styles.statValue,
                  {
                    color: colors.accent,
                    fontSize: typography.fontSizes.xxl,
                    fontWeight: typography.fontWeights.heavy,
                  },
                ]}
              >
                {kpis.available}
              </Text>
            </View>
            <Text
              style={[
                styles.statLabel,
                { color: colors.textSecondary, fontSize: typography.fontSizes.xs },
              ]}
            >
              Available
            </Text>
            <Text style={{ color: colors.accent, fontSize: 10, marginTop: 4, fontWeight: '700' }}>
              Ready for rent
            </Text>
          </Card>

          {/* Currently Rented */}
          <Card
            variant="elevated"
            padding="medium"
            style={styles.statCard}
            onPress={() => navigation.navigate('FleetList', { filterStatus: 'Active Rental' })}
          >
            <View style={styles.statTopRow}>
              <Text style={{ fontSize: 20 }}>🔑</Text>
              <Text
                style={[
                  styles.statValue,
                  {
                    color: colors.primary,
                    fontSize: typography.fontSizes.xxl,
                    fontWeight: typography.fontWeights.heavy,
                  },
                ]}
              >
                {kpis.inRental}
              </Text>
            </View>
            <Text
              style={[
                styles.statLabel,
                { color: colors.textSecondary, fontSize: typography.fontSizes.xs },
              ]}
            >
              Vehicles Rented
            </Text>
            <Text style={{ color: colors.primary, fontSize: 10, marginTop: 4, fontWeight: '700' }}>
              On the road
            </Text>
          </Card>

          {/* Monthly Revenue */}
          <Card
            variant="elevated"
            padding="medium"
            style={styles.statCard}
            onPress={() => navigation.navigate('RevenueDashboard')}
          >
            <View style={styles.statTopRow}>
              <Text style={{ fontSize: 20 }}>💰</Text>
              <Text
                style={[
                  styles.statValue,
                  {
                    color: colors.warning,
                    fontSize: typography.fontSizes.xl,
                    fontWeight: typography.fontWeights.heavy,
                  },
                ]}
              >
                ${rev.monthlyRevenue.toLocaleString()}
              </Text>
            </View>
            <Text
              style={[
                styles.statLabel,
                { color: colors.textSecondary, fontSize: typography.fontSizes.xs },
              ]}
            >
              Monthly Revenue
            </Text>
            <Text style={{ color: colors.warning, fontSize: 10, marginTop: 4, fontWeight: '700' }}>
              Yield reports →
            </Text>
          </Card>
        </View>

        {/* Operations Strip: Pending Bookings & Active Rentals */}
        <View style={styles.dualStrip}>
          <Card
            variant="flat"
            padding="medium"
            style={[styles.stripCard, { borderColor: pendingBookings > 0 ? colors.warning : colors.border }]}
            onPress={() => navigation.navigate('ProviderBookings', { initialFilter: 'Pending' })}
          >
            <View style={styles.stripContent}>
              <View>
                <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs }}>
                  Pending Bookings
                </Text>
                <Text
                  style={{
                    color: pendingBookings > 0 ? colors.warning : colors.textPrimary,
                    fontSize: typography.fontSizes.xl,
                    fontWeight: '800',
                  }}
                >
                  {pendingBookings}
                </Text>
              </View>
              <View
                style={[
                  styles.tagPill,
                  {
                    backgroundColor: pendingBookings > 0 ? 'rgba(245, 158, 11, 0.15)' : colors.surface,
                    borderRadius: borderRadius.xs,
                  },
                ]}
              >
                <Text
                  style={{
                    color: pendingBookings > 0 ? colors.warning : colors.textMuted,
                    fontSize: 10,
                    fontWeight: '700',
                  }}
                >
                  {pendingBookings > 0 ? 'ACTION NEEDED' : 'CLEARED'}
                </Text>
              </View>
            </View>
          </Card>

          <Card
            variant="flat"
            padding="medium"
            style={[styles.stripCard, { borderColor: colors.border }]}
            onPress={() => navigation.navigate('ProviderBookings', { initialFilter: 'Active' })}
          >
            <View style={styles.stripContent}>
              <View>
                <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs }}>
                  Active Rentals
                </Text>
                <Text
                  style={{
                    color: colors.primary,
                    fontSize: typography.fontSizes.xl,
                    fontWeight: '800',
                  }}
                >
                  {activeRentals}
                </Text>
              </View>
              <View
                style={[
                  styles.tagPill,
                  {
                    backgroundColor: 'rgba(0, 229, 255, 0.15)',
                    borderRadius: borderRadius.xs,
                  },
                ]}
              >
                <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '700' }}>
                  DISPATCHED
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Quick Actions Header */}
        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.textPrimary,
              fontSize: typography.fontSizes.md,
              fontWeight: typography.fontWeights.bold,
              marginTop: spacing.md,
              marginBottom: spacing.sm,
            },
          ]}
        >
          Quick Actions
        </Text>

        {/* Quick Actions Grid */}
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('AddVehicle')}
            style={[
              styles.actionButton,
              { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md },
            ]}
          >
            <Text style={styles.actionIcon}>➕</Text>
            <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>Add Vehicle</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('FleetList')}
            style={[
              styles.actionButton,
              { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md },
            ]}
          >
            <Text style={styles.actionIcon}>🚘</Text>
            <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>Fleet</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ProviderBookings')}
            style={[
              styles.actionButton,
              { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md },
            ]}
          >
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>Bookings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('RevenueDashboard')}
            style={[
              styles.actionButton,
              { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md },
            ]}
          >
            <Text style={styles.actionIcon}>📈</Text>
            <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>Revenue</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('SmartPricing')}
            style={[
              styles.actionButton,
              { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md },
            ]}
          >
            <Text style={styles.actionIcon}>⚡</Text>
            <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>Smart Pricing</Text>
          </TouchableOpacity>
        </View>

        {/* Fleet Utilization Bar */}
        <Card
          variant="elevated"
          padding="medium"
          style={[styles.utilizationCard, { marginTop: spacing.md }]}
        >
          <View style={styles.utilRow}>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: typography.fontSizes.sm,
                fontWeight: typography.fontWeights.bold,
              }}
            >
              Fleet Utilization Rate
            </Text>
            <Text
              style={{
                color: colors.primary,
                fontSize: typography.fontSizes.sm,
                fontWeight: typography.fontWeights.heavy,
              }}
            >
              {kpis.utilizationRate}%
            </Text>
          </View>
          <View
            style={[
              styles.progressBarTrack,
              { backgroundColor: colors.surfaceVariant, borderRadius: borderRadius.full },
            ]}
          >
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min(100, Math.max(0, kpis.utilizationRate))}%`,
                  backgroundColor: colors.primary,
                  borderRadius: borderRadius.full,
                },
              ]}
            />
          </View>
          <View style={styles.utilSubtextRow}>
            <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs }}>
              {kpis.inRental} on road • {kpis.available} available • {kpis.maintenance} service
            </Text>
          </View>
        </Card>

        {/* Recent Bookings Section */}
        <View style={styles.sectionHeaderRow}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.textPrimary,
                fontSize: typography.fontSizes.md,
                fontWeight: typography.fontWeights.bold,
              },
            ]}
          >
            Recent Bookings
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('ProviderBookings')}>
            <Text style={{ color: colors.primary, fontSize: typography.fontSizes.xs, fontWeight: '700' }}>
              View All ({bookings.length}) →
            </Text>
          </TouchableOpacity>
        </View>

        {recentBookings.map(b => (
          <Card
            key={b.id}
            variant="elevated"
            padding="medium"
            style={[styles.bookingItemCard, { borderColor: colors.border }]}
            onPress={() => navigation.navigate('ProviderBookingDetails', { bookingId: b.id })}
          >
            <View style={styles.bookingItemHeader}>
              <View>
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: typography.fontSizes.sm,
                    fontWeight: typography.fontWeights.bold,
                  }}
                >
                  {b.vehicle.brand} {b.vehicle.model}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs, marginTop: 2 }}>
                  Renter: {b.customer.fullName} • {b.id}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: `${getStatusColor(b.status)}20`,
                    borderColor: getStatusColor(b.status),
                    borderRadius: borderRadius.xs,
                  },
                ]}
              >
                <Text
                  style={{
                    color: getStatusColor(b.status),
                    fontSize: typography.fontSizes.xs - 2,
                    fontWeight: '800',
                  }}
                >
                  {b.status.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.bookingDatesRow}>
              <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs }}>
                📅 {b.pickupDate} → {b.returnDate} ({b.rentalDays} days)
              </Text>
              <Text
                style={{
                  color: colors.primary,
                  fontSize: typography.fontSizes.sm,
                  fontWeight: '800',
                }}
              >
                ${b.pricing.total}
              </Text>
            </View>
          </Card>
        ))}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 32,
  },
  profileAvatar: {
    width: 38,
    height: 38,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 18,
  },
  topGreeting: {
    marginBottom: 14,
  },
  greetingText: {
    letterSpacing: -0.3,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  statCard: {
    width: '48%',
    flexGrow: 1,
    borderWidth: 1,
  },
  statTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statValue: {
    letterSpacing: -0.5,
  },
  statLabel: {
    marginTop: 6,
    fontWeight: '500',
  },
  dualStrip: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  stripCard: {
    flex: 1,
    borderWidth: 1,
  },
  stripContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  sectionTitle: {
    letterSpacing: -0.2,
  },
  quickActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    width: '31%',
    flexGrow: 1,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  actionTitle: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  utilizationCard: {
    borderWidth: 1,
  },
  utilRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBarTrack: {
    height: 8,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
  utilSubtextRow: {
    marginTop: 6,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  bookingItemCard: {
    borderWidth: 1,
    marginBottom: 10,
  },
  bookingItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
  },
  bookingDatesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(148, 163, 184, 0.2)',
  },
});
