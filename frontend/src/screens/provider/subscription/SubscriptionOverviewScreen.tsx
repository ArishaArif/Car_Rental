import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProviderStackParamList, ProviderSubscription, SubscriptionPlan } from '../../../types';
import { useTheme } from '../../../theme';
import { useAuth } from '../../../context/AuthContext';
import { subscriptionService, SUBSCRIPTION_PLANS } from '../../../services/subscriptionService';
import { ScreenContainer, Header, Card, Button } from '../../../components/common';

type SubscriptionOverviewNavProp = NativeStackNavigationProp<
  ProviderStackParamList,
  'SubscriptionOverview'
>;

interface Props {
  navigation: SubscriptionOverviewNavProp;
}

export const SubscriptionOverviewScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { user } = useAuth();
  const [sub, setSub] = useState<ProviderSubscription | null>(null);

  useEffect(() => {
    const loadSub = async () => {
      const data = await subscriptionService.getCurrentSubscription();
      setSub(data);
    };
    loadSub();

    const unsubscribe = subscriptionService.subscribe(async () => {
      const data = await subscriptionService.getCurrentSubscription();
      setSub(data);
    });
    return unsubscribe;
  }, []);

  if (!sub) {
    return (
      <ScreenContainer loading loadingMessage="Loading subscription overview..." />
    );
  }

  const currentPlan: SubscriptionPlan | undefined = SUBSCRIPTION_PLANS.find(
    p => p.id === sub.planId
  );

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

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="SaaS Subscription"
          subtitle={user?.businessName || 'Apex Fleet Holdings'}
          showBack
          onBackPress={() => navigation.goBack()}
        />
      }
    >
      <View style={[styles.content, { padding: spacing.md }]}>
        {/* Current Plan Hero Card */}
        <Card variant="elevated" padding="large" style={styles.heroCard}>
          <View style={styles.planHeaderRow}>
            <View>
              <Text style={[styles.planSuper, { color: colors.primary }]}>ACTIVE TIER</Text>
              <Text
                style={[
                  styles.planTitle,
                  {
                    color: colors.textPrimary,
                    fontSize: typography.fontSizes.xxl,
                    fontWeight: typography.fontWeights.heavy,
                  },
                ]}
              >
                {currentPlan?.name || 'Professional'} Plan
              </Text>
              <Text style={[styles.planTagline, { color: colors.textSecondary }]}>
                {currentPlan?.tagline}
              </Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    sub.status === 'Active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  borderColor: sub.status === 'Active' ? '#10B981' : colors.danger,
                },
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  { color: sub.status === 'Active' ? colors.success || '#10B981' : colors.danger },
                ]}
              >
                {sub.status.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Pricing & Renewal row */}
          <View style={[styles.planMetaRow, { borderTopColor: colors.border }]}>
            <View>
              <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Billing Rate</Text>
              <Text
                style={[
                  styles.metaPrice,
                  { color: colors.textPrimary, fontSize: typography.fontSizes.lg, fontWeight: '800' },
                ]}
              >
                ${sub.billingCycle === 'annual' ? currentPlan?.annualPrice : currentPlan?.monthlyPrice}
                <Text style={{ fontSize: 11, color: colors.textSecondary, fontWeight: '400' }}>
                  {' '}/ {sub.billingCycle === 'annual' ? 'yr' : 'mo'}
                </Text>
              </Text>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Renews On</Text>
              <Text style={[styles.metaVal, { color: colors.textPrimary, fontWeight: '700' }]}>
                📅 {sub.renewalDate}
              </Text>
            </View>
          </View>
        </Card>

        {/* Current Usage Telematics Gauges */}
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
            Current Usage & Remaining Quotas
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SubscriptionUsage')}>
            <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>
              Details →
            </Text>
          </TouchableOpacity>
        </View>

        {/* Usage Gauges Card */}
        <Card variant="elevated" padding="medium" style={styles.usageCard}>
          {/* Vehicles Gauge */}
          <View style={styles.gaugeBlock}>
            <View style={styles.gaugeHeader}>
              <Text style={[styles.gaugeTitle, { color: colors.textPrimary }]}>
                🚗 Fleet Allocation
              </Text>
              <Text style={[styles.gaugeNumbers, { color: colors.textPrimary }]}>
                {sub.usage.vehiclesUsed} / {isUnlimitedVehicles ? '∞' : vehicleLimit} Used
              </Text>
            </View>

            {/* Progress Bar */}
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

            <View style={styles.remainingRow}>
              <Text style={[styles.remainingText, { color: colors.textMuted }]}>
                Remaining Vehicle Limit:
              </Text>
              <Text style={[styles.remainingHighlight, { color: colors.primary }]}>
                {remainingVehicles} vehicles available
              </Text>
            </View>
          </View>

          {/* Bookings Gauge */}
          <View style={[styles.gaugeBlock, { marginTop: 14 }]}>
            <View style={styles.gaugeHeader}>
              <Text style={[styles.gaugeTitle, { color: colors.textPrimary }]}>
                📑 Monthly Reservations
              </Text>
              <Text style={[styles.gaugeNumbers, { color: colors.textPrimary }]}>
                {sub.usage.bookingsUsed} / {isUnlimitedBookings ? '∞' : bookingLimit} Used
              </Text>
            </View>

            {/* Progress Bar */}
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

            <View style={styles.remainingRow}>
              <Text style={[styles.remainingText, { color: colors.textMuted }]}>
                Remaining Booking Limit:
              </Text>
              <Text style={[styles.remainingHighlight, { color: colors.secondary }]}>
                {remainingBookings} bookings remaining
              </Text>
            </View>
          </View>
        </Card>

        {/* Enabled Features Checklist */}
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
          Enabled Features in {currentPlan?.name} Tier
        </Text>

        <Card variant="elevated" padding="medium" style={styles.featuresCard}>
          {sub.enabledFeatures.map((feature, fIdx) => (
            <View key={fIdx} style={styles.featureRow}>
              <View style={[styles.checkCircle, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <Text style={{ color: colors.success || '#10B981', fontSize: 11, fontWeight: '800' }}>
                  ✓
                </Text>
              </View>
              <Text style={[styles.featureText, { color: colors.textPrimary }]}>{feature}</Text>
            </View>
          ))}
        </Card>

        {/* Action Buttons: Plans, Usage, Billing History */}
        <View style={styles.actionButtonsContainer}>
          <Button
            title="Change / Upgrade Subscription Plan"
            variant="primary"
            size="large"
            fullWidth
            onPress={() => navigation.navigate('SubscriptionPlans')}
            style={{ marginBottom: 10 }}
          />

          <View style={styles.buttonRow}>
            <Button
              title="Usage Telematics"
              variant="outline"
              size="medium"
              onPress={() => navigation.navigate('SubscriptionUsage')}
              style={{ flex: 1, marginRight: 6 }}
            />
            <Button
              title="Billing History"
              variant="secondary"
              size="medium"
              onPress={() => navigation.navigate('BillingHistory')}
              style={{ flex: 1, marginLeft: 6 }}
            />
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 40,
  },
  heroCard: {
    borderWidth: 1,
    marginBottom: 16,
  },
  planHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  planSuper: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  planTitle: {
    letterSpacing: -0.3,
    marginTop: 2,
  },
  planTagline: {
    fontSize: 11,
    marginTop: 2,
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  planMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 14,
    borderTopWidth: 0.5,
  },
  metaLabel: {
    fontSize: 10,
  },
  metaPrice: {
    marginTop: 2,
  },
  metaVal: {
    fontSize: 12,
    marginTop: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    letterSpacing: -0.2,
  },
  usageCard: {
    borderWidth: 1,
  },
  gaugeBlock: {
    width: '100%',
  },
  gaugeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  gaugeTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  gaugeNumbers: {
    fontSize: 11,
    fontWeight: '600',
  },
  barTrack: {
    height: 8,
    width: '100%',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
  },
  remainingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  remainingText: {
    fontSize: 11,
  },
  remainingHighlight: {
    fontSize: 11,
    fontWeight: '700',
  },
  featuresCard: {
    borderWidth: 1,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  featureText: {
    fontSize: 12,
    flex: 1,
  },
  actionButtonsContainer: {
    marginTop: 20,
  },
  buttonRow: {
    flexDirection: 'row',
  },
});
