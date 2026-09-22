import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProviderStackParamList, ProviderSubscription } from '../../../types';
import { useTheme } from '../../../theme';
import { subscriptionService, SUBSCRIPTION_PLANS } from '../../../services/subscriptionService';
import { ScreenContainer, Header, Card, Button } from '../../../components/common';

type SubscriptionUsageNavProp = NativeStackNavigationProp<
  ProviderStackParamList,
  'SubscriptionUsage'
>;

interface Props {
  navigation: SubscriptionUsageNavProp;
}

export const SubscriptionUsageScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const [sub, setSub] = useState<ProviderSubscription | null>(null);

  useEffect(() => {
    const loadSub = async () => {
      const data = await subscriptionService.getCurrentSubscription();
      setSub(data);
    };
    loadSub();
  }, []);

  if (!sub) {
    return <ScreenContainer loading loadingMessage="Loading usage metrics..." />;
  }

  const currentPlan = SUBSCRIPTION_PLANS.find(p => p.id === sub.planId);

  const vehicleLimit = sub.usage.vehicleLimit;
  const isUnlimitedVehicles = vehicleLimit === -1;
  const remainingVehicles = isUnlimitedVehicles
    ? 'Unlimited'
    : Math.max(0, vehicleLimit - sub.usage.vehiclesUsed);
  const vehiclePercent = isUnlimitedVehicles
    ? 25
    : Math.min(100, Math.round((sub.usage.vehiclesUsed / vehicleLimit) * 100));

  const bookingLimit = sub.usage.bookingLimit;
  const isUnlimitedBookings = bookingLimit === -1;
  const remainingBookings = isUnlimitedBookings
    ? 'Unlimited'
    : Math.max(0, bookingLimit - sub.usage.bookingsUsed);
  const bookingPercent = isUnlimitedBookings
    ? 30
    : Math.min(100, Math.round((sub.usage.bookingsUsed / bookingLimit) * 100));

  const teamSeatsLimit = sub.usage.teamSeatsLimit;
  const isUnlimitedSeats = teamSeatsLimit === -1;
  const teamPercent = isUnlimitedSeats
    ? 20
    : Math.min(100, Math.round((sub.usage.teamSeatsUsed / teamSeatsLimit) * 100));

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="Usage & Fleet Quotas"
          subtitle={`${currentPlan?.name || 'Professional'} Tier Telematics`}
          showBack
          onBackPress={() => navigation.goBack()}
        />
      }
    >
      <View style={[styles.content, { padding: spacing.md }]}>
        {/* Cycle Reset Banner */}
        <Card
          variant="flat"
          padding="medium"
          style={[styles.bannerCard, { borderColor: colors.border }]}
        >
          <View style={styles.bannerRow}>
            <Text style={{ fontSize: 24, marginRight: 10 }}>⏱️</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.bannerTitle, { color: colors.textPrimary }]}>
                Billing Cycle Resets in 24 Days
              </Text>
              <Text style={[styles.bannerSub, { color: colors.textSecondary }]}>
                Next quota renewal date: {sub.renewalDate}. Unused monthly bookings do not roll over.
              </Text>
            </View>
          </View>
        </Card>

        {/* 1. Vehicle Fleet Limit */}
        <Card variant="elevated" padding="medium" style={styles.metricCard}>
          <View style={styles.metricTop}>
            <Text style={[styles.metricTitle, { color: colors.textPrimary }]}>
              🚗 Vehicle Capacity Quota
            </Text>
            <Text style={[styles.metricCount, { color: colors.primary, fontWeight: '800' }]}>
              {sub.usage.vehiclesUsed} / {isUnlimitedVehicles ? 'Unlimited' : `${vehicleLimit} Max`}
            </Text>
          </View>

          <View style={[styles.barTrack, { backgroundColor: colors.surfaceVariant, borderRadius: borderRadius.full }]}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${vehiclePercent}%`,
                  backgroundColor: colors.primary,
                  borderRadius: borderRadius.full,
                },
              ]}
            />
          </View>

          <View style={styles.metricFooter}>
            <Text style={[styles.footerDetail, { color: colors.textMuted }]}>
              {vehiclePercent}% allocated
            </Text>
            <Text style={[styles.footerHighlight, { color: colors.primary }]}>
              {remainingVehicles} slots remaining
            </Text>
          </View>
        </Card>

        {/* 2. Monthly Bookings Quota */}
        <Card variant="elevated" padding="medium" style={[styles.metricCard, { marginTop: 14 }]}>
          <View style={styles.metricTop}>
            <Text style={[styles.metricTitle, { color: colors.textPrimary }]}>
              📑 Monthly Booking Quota
            </Text>
            <Text style={[styles.metricCount, { color: colors.secondary, fontWeight: '800' }]}>
              {sub.usage.bookingsUsed} / {isUnlimitedBookings ? 'Unlimited' : `${bookingLimit} Max`}
            </Text>
          </View>

          <View style={[styles.barTrack, { backgroundColor: colors.surfaceVariant, borderRadius: borderRadius.full }]}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${bookingPercent}%`,
                  backgroundColor: colors.secondary,
                  borderRadius: borderRadius.full,
                },
              ]}
            />
          </View>

          <View style={styles.metricFooter}>
            <Text style={[styles.footerDetail, { color: colors.textMuted }]}>
              {bookingPercent}% quota used
            </Text>
            <Text style={[styles.footerHighlight, { color: colors.secondary }]}>
              {remainingBookings} bookings remaining
            </Text>
          </View>
        </Card>

        {/* 3. Team Member Seats */}
        <Card variant="elevated" padding="medium" style={[styles.metricCard, { marginTop: 14 }]}>
          <View style={styles.metricTop}>
            <Text style={[styles.metricTitle, { color: colors.textPrimary }]}>
              👥 Team Member Seats
            </Text>
            <Text style={[styles.metricCount, { color: colors.accent, fontWeight: '800' }]}>
              {sub.usage.teamSeatsUsed} / {isUnlimitedSeats ? 'Unlimited' : `${teamSeatsLimit} Seats`}
            </Text>
          </View>

          <View style={[styles.barTrack, { backgroundColor: colors.surfaceVariant, borderRadius: borderRadius.full }]}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${teamPercent}%`,
                  backgroundColor: colors.accent,
                  borderRadius: borderRadius.full,
                },
              ]}
            />
          </View>

          <View style={styles.metricFooter}>
            <Text style={[styles.footerDetail, { color: colors.textMuted }]}>
              {isUnlimitedSeats ? 'Unlimited operator ACL' : `${teamSeatsLimit - sub.usage.teamSeatsUsed} seats available`}
            </Text>
            <Text style={[styles.footerHighlight, { color: colors.accent }]}>
              Active seats: {sub.usage.teamSeatsUsed}
            </Text>
          </View>
        </Card>

        {/* Upgrade Callout */}
        <Card
          variant="elevated"
          padding="large"
          style={[styles.calloutCard, { borderColor: colors.primary, marginTop: spacing.lg }]}
        >
          <Text style={[styles.calloutTitle, { color: colors.textPrimary }]}>
            Need More Fleet Capacity?
          </Text>
          <Text style={[styles.calloutSub, { color: colors.textSecondary }]}>
            Upgrade to the Business plan for unlimited vehicles, unlimited monthly bookings, and multi-zone Smart Pricing.
          </Text>
          <Button
            title="Explore Upgrades"
            variant="primary"
            size="medium"
            fullWidth
            onPress={() => navigation.navigate('SubscriptionPlans')}
            style={{ marginTop: 12 }}
          />
        </Card>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 40,
  },
  bannerCard: {
    borderWidth: 1,
    marginBottom: 16,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  bannerSub: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16,
  },
  metricCard: {
    borderWidth: 1,
  },
  metricTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  metricCount: {
    fontSize: 12,
  },
  barTrack: {
    height: 8,
    width: '100%',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
  },
  metricFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  footerDetail: {
    fontSize: 11,
  },
  footerHighlight: {
    fontSize: 11,
    fontWeight: '700',
  },
  calloutCard: {
    borderWidth: 1.5,
  },
  calloutTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  calloutSub: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },
});
