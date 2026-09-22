import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProviderStackParamList, ProviderSubscription, SubscriptionPlanId } from '../../../types';
import { useTheme } from '../../../theme';
import { subscriptionService, SUBSCRIPTION_PLANS } from '../../../services/subscriptionService';
import { ScreenContainer, Header, Card, Button } from '../../../components/common';

type SubscriptionPlansNavProp = NativeStackNavigationProp<
  ProviderStackParamList,
  'SubscriptionPlans'
>;

interface Props {
  navigation: SubscriptionPlansNavProp;
}

export const SubscriptionPlansScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const [sub, setSub] = useState<ProviderSubscription | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  useEffect(() => {
    const loadSub = async () => {
      const data = await subscriptionService.getCurrentSubscription();
      setSub(data);
      if (data) {
        setBillingCycle(data.billingCycle);
      }
    };
    loadSub();
  }, []);

  const handleSelectPlan = (planId: SubscriptionPlanId) => {
    navigation.navigate('UpgradeConfirmation', {
      targetPlanId: planId,
      billingCycle,
    });
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="Subscription Plans"
          subtitle="Choose the optimal tier for your fleet size & yield"
          showBack
          onBackPress={() => navigation.goBack()}
        />
      }
    >
      <View style={[styles.content, { padding: spacing.md }]}>
        {/* Billing Cycle Toggle: Monthly / Annual */}
        <View
          style={[
            styles.billingToggleWrapper,
            { backgroundColor: colors.surfaceVariant, borderRadius: borderRadius.md },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setBillingCycle('monthly')}
            style={[
              styles.cycleBtn,
              {
                backgroundColor: billingCycle === 'monthly' ? colors.surface : 'transparent',
                borderRadius: borderRadius.sm,
              },
            ]}
          >
            <Text
              style={[
                styles.cycleBtnText,
                {
                  color: billingCycle === 'monthly' ? colors.textPrimary : colors.textSecondary,
                  fontWeight: billingCycle === 'monthly' ? '700' : '500',
                },
              ]}
            >
              Monthly Billing
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setBillingCycle('annual')}
            style={[
              styles.cycleBtn,
              {
                backgroundColor: billingCycle === 'annual' ? colors.surface : 'transparent',
                borderRadius: borderRadius.sm,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text
                style={[
                  styles.cycleBtnText,
                  {
                    color: billingCycle === 'annual' ? colors.textPrimary : colors.textSecondary,
                    fontWeight: billingCycle === 'annual' ? '700' : '500',
                  },
                ]}
              >
                Annual Billing
              </Text>
              <View
                style={[
                  styles.discountBadge,
                  { backgroundColor: colors.primary, borderRadius: borderRadius.xs },
                ]}
              >
                <Text style={styles.discountBadgeText}>SAVE 20%</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Plans Cards */}
        {SUBSCRIPTION_PLANS.map(plan => {
          const isCurrentPlan = sub?.planId === plan.id;
          const isPopular = plan.id === 'professional';
          const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
          const cycleLabel = billingCycle === 'annual' ? '/ year' : '/ month';

          return (
            <Card
              key={plan.id}
              variant="elevated"
              padding="large"
              style={[
                styles.planCard,
                {
                  borderColor: isPopular ? colors.primary : colors.border,
                  borderWidth: isPopular ? 2 : 1,
                  backgroundColor: isCurrentPlan ? 'rgba(0, 229, 255, 0.02)' : colors.surface,
                },
              ]}
            >
              {/* Badge row */}
              <View style={styles.badgeRow}>
                {isPopular && (
                  <View
                    style={[
                      styles.popularBadge,
                      { backgroundColor: colors.primary, borderRadius: borderRadius.xs },
                    ]}
                  >
                    <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
                  </View>
                )}

                {isCurrentPlan && (
                  <View
                    style={[
                      styles.currentBadge,
                      { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: '#10B981' },
                    ]}
                  >
                    <Text style={[styles.currentBadgeText, { color: colors.success || '#10B981' }]}>
                      CURRENT PLAN
                    </Text>
                  </View>
                )}
              </View>

              {/* Title & Tagline */}
              <Text
                style={[
                  styles.planName,
                  {
                    color: colors.textPrimary,
                    fontSize: typography.fontSizes.xl,
                    fontWeight: typography.fontWeights.heavy,
                  },
                ]}
              >
                {plan.name}
              </Text>
              <Text style={[styles.planTagline, { color: colors.textSecondary }]}>
                {plan.tagline}
              </Text>

              {/* Price */}
              <View style={styles.priceRow}>
                <Text
                  style={[
                    styles.priceValue,
                    { color: colors.textPrimary, fontSize: 32, fontWeight: '900' },
                  ]}
                >
                  ${price}
                </Text>
                <Text style={[styles.pricePeriod, { color: colors.textSecondary }]}>
                  {cycleLabel}
                </Text>
              </View>

              {/* Core Plan Specs */}
              <View
                style={[
                  styles.specsBox,
                  { backgroundColor: colors.surfaceVariant, borderRadius: borderRadius.sm },
                ]}
              >
                <View style={styles.specRow}>
                  <Text style={[styles.specLabel, { color: colors.textSecondary }]}>
                    🚗 Vehicle Limit:
                  </Text>
                  <Text style={[styles.specValue, { color: colors.textPrimary, fontWeight: '700' }]}>
                    {plan.vehicleLimit === -1 ? 'Unlimited' : `${plan.vehicleLimit} Vehicles`}
                  </Text>
                </View>

                <View style={styles.specRow}>
                  <Text style={[styles.specLabel, { color: colors.textSecondary }]}>
                    📑 Booking Limit:
                  </Text>
                  <Text style={[styles.specValue, { color: colors.textPrimary, fontWeight: '700' }]}>
                    {plan.bookingLimit === -1 ? 'Unlimited' : `${plan.bookingLimit} / month`}
                  </Text>
                </View>

                <View style={styles.specRow}>
                  <Text style={[styles.specLabel, { color: colors.textSecondary }]}>
                    🤖 AI Assistant:
                  </Text>
                  <Text style={[styles.specValue, { color: colors.textPrimary }]}>
                    {plan.aiAssistantAccess}
                  </Text>
                </View>

                <View style={styles.specRow}>
                  <Text style={[styles.specLabel, { color: colors.textSecondary }]}>
                    ⚡ Smart Pricing:
                  </Text>
                  <Text style={[styles.specValue, { color: colors.textPrimary, fontWeight: '700' }]}>
                    {plan.smartPricingAccess}
                  </Text>
                </View>

                <View style={styles.specRow}>
                  <Text style={[styles.specLabel, { color: colors.textSecondary }]}>
                    📊 Analytics:
                  </Text>
                  <Text style={[styles.specValue, { color: colors.textPrimary }]}>
                    {plan.analytics}
                  </Text>
                </View>

                <View style={styles.specRow}>
                  <Text style={[styles.specLabel, { color: colors.textSecondary }]}>
                    👥 Team Members:
                  </Text>
                  <Text style={[styles.specValue, { color: colors.textPrimary, fontWeight: '700' }]}>
                    {plan.teamMembers === -1 ? 'Unlimited' : `${plan.teamMembers} Member Login`}
                  </Text>
                </View>

                <View style={[styles.specRow, { borderBottomWidth: 0 }]}>
                  <Text style={[styles.specLabel, { color: colors.textSecondary }]}>
                    🛡️ Support:
                  </Text>
                  <Text style={[styles.specValue, { color: colors.accent, fontWeight: '700' }]}>
                    {plan.support}
                  </Text>
                </View>
              </View>

              {/* Features List */}
              <View style={styles.featuresList}>
                {plan.features.map((feat, idx) => (
                  <View key={idx} style={styles.featRow}>
                    <Text style={{ color: colors.primary, fontSize: 12, marginRight: 8 }}>✓</Text>
                    <Text style={[styles.featText, { color: colors.textSecondary }]}>{feat}</Text>
                  </View>
                ))}
              </View>

              {/* Action */}
              <Button
                title={
                  isCurrentPlan
                    ? 'Current Active Plan'
                    : `Select ${plan.name} Plan`
                }
                variant={isCurrentPlan ? 'outline' : isPopular ? 'primary' : 'secondary'}
                size="medium"
                fullWidth
                disabled={isCurrentPlan}
                onPress={() => handleSelectPlan(plan.id)}
                style={{ marginTop: 16 }}
              />
            </Card>
          );
        })}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 40,
  },
  billingToggleWrapper: {
    flexDirection: 'row',
    padding: 4,
    marginBottom: 20,
  },
  cycleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cycleBtnText: {
    fontSize: 12,
  },
  discountBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  discountBadgeText: {
    color: '#0F172A',
    fontSize: 8,
    fontWeight: '800',
  },
  planCard: {
    marginBottom: 18,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  popularBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  popularBadgeText: {
    color: '#0F172A',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  currentBadge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  currentBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  planName: {
    letterSpacing: -0.2,
  },
  planTagline: {
    fontSize: 12,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 12,
    marginBottom: 14,
  },
  priceValue: {
    letterSpacing: -0.5,
  },
  pricePeriod: {
    fontSize: 12,
    marginLeft: 6,
  },
  specsBox: {
    padding: 10,
    marginBottom: 12,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(148, 163, 184, 0.15)',
  },
  specLabel: {
    fontSize: 11,
  },
  specValue: {
    fontSize: 11,
    maxWidth: '60%',
    textAlign: 'right',
  },
  featuresList: {
    gap: 6,
  },
  featRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featText: {
    fontSize: 11,
    flex: 1,
  },
});
