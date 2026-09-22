import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ProviderStackParamList,
  ProviderSubscription,
  SubscriptionPlan,
} from '../../../types';
import { useTheme } from '../../../theme';
import { subscriptionService, SUBSCRIPTION_PLANS } from '../../../services/subscriptionService';
import { ScreenContainer, Header, Card, Button } from '../../../components/common';

type UpgradeNavProp = NativeStackNavigationProp<
  ProviderStackParamList,
  'UpgradeConfirmation'
>;
type UpgradeRouteProp = RouteProp<ProviderStackParamList, 'UpgradeConfirmation'>;

interface Props {
  navigation: UpgradeNavProp;
  route: UpgradeRouteProp;
}

type FlowStep = 'confirm' | 'processing' | 'success';

export const UpgradeConfirmationScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { targetPlanId, billingCycle = 'monthly' } = route.params;

  const [currentSub, setCurrentSub] = useState<ProviderSubscription | null>(null);
  const [step, setStep] = useState<FlowStep>('confirm');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const targetPlan: SubscriptionPlan | undefined = SUBSCRIPTION_PLANS.find(
    p => p.id === targetPlanId
  );

  useEffect(() => {
    const loadCurrent = async () => {
      const data = await subscriptionService.getCurrentSubscription();
      setCurrentSub(data);
    };
    loadCurrent();
  }, []);

  const handleExecuteUpgrade = async () => {
    setStep('processing');
    setErrorMessage(null);
    try {
      await subscriptionService.upgradePlan(targetPlanId, billingCycle);
      setStep('success');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to complete subscription upgrade.');
      setStep('confirm');
    }
  };

  if (!targetPlan) {
    return (
      <ScreenContainer>
        <Header title="Plan Not Found" showBack onBackPress={() => navigation.goBack()} />
        <View style={{ padding: 20 }}>
          <Text style={{ color: colors.danger }}>Invalid plan selection.</Text>
        </View>
      </ScreenContainer>
    );
  }

  const price = billingCycle === 'annual' ? targetPlan.annualPrice : targetPlan.monthlyPrice;
  const cycleText = billingCycle === 'annual' ? 'billed annually' : 'billed monthly';

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title={
            step === 'success'
              ? 'Upgrade Complete'
              : step === 'processing'
              ? 'Processing Upgrade'
              : 'Review Plan Change'
          }
          subtitle="SaaS Subscription Management"
          showBack={step === 'confirm'}
          onBackPress={() => navigation.goBack()}
        />
      }
    >
      <View style={[styles.content, { padding: spacing.md }]}>
        {/* Step 1: Confirmation */}
        {step === 'confirm' && (
          <View>
            <Card variant="elevated" padding="large" style={styles.card}>
              <Text style={[styles.superLabel, { color: colors.primary }]}>
                UPGRADE DESTINATION
              </Text>
              <Text
                style={[
                  styles.targetTitle,
                  {
                    color: colors.textPrimary,
                    fontSize: typography.fontSizes.xxl,
                    fontWeight: typography.fontWeights.heavy,
                  },
                ]}
              >
                {targetPlan.name} Plan
              </Text>
              <Text style={[styles.targetTagline, { color: colors.textSecondary }]}>
                {targetPlan.tagline}
              </Text>

              {/* Price summary */}
              <View
                style={[
                  styles.priceSummaryBox,
                  { backgroundColor: colors.surfaceVariant, borderRadius: borderRadius.sm },
                ]}
              >
                <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                  New Subscription Rate:
                </Text>
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: typography.fontSizes.xl,
                    fontWeight: '900',
                    marginTop: 2,
                  }}
                >
                  ${price} USD
                  <Text style={{ fontSize: 11, color: colors.textSecondary, fontWeight: '400' }}>
                    {' '}({cycleText})
                  </Text>
                </Text>
              </View>

              {/* Comparison Diffs */}
              <Text
                style={[
                  styles.diffHeading,
                  {
                    color: colors.textPrimary,
                    fontSize: typography.fontSizes.sm,
                    fontWeight: typography.fontWeights.bold,
                  },
                ]}
              >
                Immediate Capacity Unlocked:
              </Text>

              <View style={styles.diffRows}>
                <View style={styles.diffRow}>
                  <Text style={[styles.diffLabel, { color: colors.textSecondary }]}>
                    🚗 Vehicle Capacity:
                  </Text>
                  <Text style={[styles.diffVal, { color: colors.primary, fontWeight: '800' }]}>
                    {targetPlan.vehicleLimit === -1
                      ? 'Unlimited Inventory'
                      : `Up to ${targetPlan.vehicleLimit} Vehicles`}
                  </Text>
                </View>

                <View style={styles.diffRow}>
                  <Text style={[styles.diffLabel, { color: colors.textSecondary }]}>
                    📑 Monthly Bookings:
                  </Text>
                  <Text style={[styles.diffVal, { color: colors.secondary, fontWeight: '800' }]}>
                    {targetPlan.bookingLimit === -1
                      ? 'Unlimited Reservations'
                      : `Up to ${targetPlan.bookingLimit} / month`}
                  </Text>
                </View>

                <View style={styles.diffRow}>
                  <Text style={[styles.diffLabel, { color: colors.textSecondary }]}>
                    ⚡ Smart Pricing:
                  </Text>
                  <Text style={[styles.diffVal, { color: colors.textPrimary }]}>
                    {targetPlan.smartPricingAccess}
                  </Text>
                </View>

                <View style={[styles.diffRow, { borderBottomWidth: 0 }]}>
                  <Text style={[styles.diffLabel, { color: colors.textSecondary }]}>
                    👥 Operator Seats:
                  </Text>
                  <Text style={[styles.diffVal, { color: colors.textPrimary }]}>
                    {targetPlan.teamMembers === -1 ? 'Unlimited' : `${targetPlan.teamMembers} Members`}
                  </Text>
                </View>
              </View>

              {/* Billing notes */}
              <View
                style={[
                  styles.paymentNoteBox,
                  { borderColor: colors.border, borderRadius: borderRadius.sm },
                ]}
              >
                <Text style={{ fontSize: 11, color: colors.textSecondary, lineHeight: 16 }}>
                  💳 Your primary card (Visa ending in 4242) will be charged ${price}.
                  New limits take effect immediately. You can modify your tier anytime.
                </Text>
              </View>

              {errorMessage && (
                <Text style={{ color: colors.danger, fontSize: 11, marginTop: 8 }}>
                  {errorMessage}
                </Text>
              )}

              {/* CTA */}
              <Button
                title={`Confirm & Upgrade to ${targetPlan.name}`}
                variant="primary"
                size="large"
                fullWidth
                onPress={handleExecuteUpgrade}
                style={{ marginTop: 16 }}
              />

              <Button
                title="Keep Current Plan"
                variant="outline"
                size="medium"
                fullWidth
                onPress={() => navigation.goBack()}
                style={{ marginTop: 8 }}
              />
            </Card>
          </View>
        )}

        {/* Step 2: Processing */}
        {step === 'processing' && (
          <Card variant="elevated" padding="large" style={styles.processingCard}>
            <ActivityIndicator size="large" color={colors.primary} style={{ marginBottom: 20 }} />
            <Text
              style={[
                styles.processingTitle,
                {
                  color: colors.textPrimary,
                  fontSize: typography.fontSizes.lg,
                  fontWeight: typography.fontWeights.bold,
                },
              ]}
            >
              Provisioning Fleet Quotas...
            </Text>
            <Text
              style={[
                styles.processingSub,
                {
                  color: colors.textSecondary,
                  fontSize: typography.fontSizes.xs,
                  textAlign: 'center',
                  marginTop: 6,
                  lineHeight: 18,
                },
              ]}
            >
              Updating subscription authorization and unlocking {targetPlan.name} tier telematics.
            </Text>
          </Card>
        )}

        {/* Step 3: Success */}
        {step === 'success' && (
          <Card variant="elevated" padding="large" style={styles.successCard}>
            <View style={[styles.successCircle, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Text style={{ fontSize: 36 }}>🎉</Text>
            </View>

            <Text
              style={[
                styles.successTitle,
                {
                  color: colors.textPrimary,
                  fontSize: typography.fontSizes.xl,
                  fontWeight: typography.fontWeights.heavy,
                  marginTop: 14,
                },
              ]}
            >
              Subscription Upgraded!
            </Text>

            <Text
              style={[
                styles.successSub,
                {
                  color: colors.textSecondary,
                  fontSize: typography.fontSizes.sm,
                  textAlign: 'center',
                  marginTop: 6,
                  lineHeight: 20,
                },
              ]}
            >
              You are now active on the <Text style={{ color: colors.primary, fontWeight: '700' }}>{targetPlan.name} Tier</Text>.
              Your fleet capacity has been expanded to{' '}
              <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>
                {targetPlan.vehicleLimit === -1 ? 'Unlimited Vehicles' : `${targetPlan.vehicleLimit} Vehicles`}
              </Text>.
            </Text>

            {/* Unlocked Highlights */}
            <View
              style={[
                styles.unlockedBox,
                { backgroundColor: colors.surfaceVariant, borderRadius: borderRadius.md, width: '100%' },
              ]}
            >
              <Text style={{ color: colors.success || '#10B981', fontSize: 11, fontWeight: '800', marginBottom: 6 }}>
                ACTIVE CAPABILITIES UNLOCKED:
              </Text>
              {targetPlan.features.slice(0, 4).map((f, i) => (
                <View key={i} style={styles.unlockedRow}>
                  <Text style={{ color: colors.success || '#10B981', fontSize: 12, marginRight: 6 }}>✓</Text>
                  <Text style={{ color: colors.textPrimary, fontSize: 11, flex: 1 }}>{f}</Text>
                </View>
              ))}
            </View>

            {/* Return actions */}
            <Button
              title="Go to Subscription Overview"
              variant="primary"
              size="large"
              fullWidth
              onPress={() => navigation.navigate('SubscriptionOverview')}
              style={{ marginTop: 20, marginBottom: 8 }}
            />

            <Button
              title="Return to Provider Dashboard"
              variant="outline"
              size="medium"
              fullWidth
              onPress={() => navigation.navigate('ProviderDashboard')}
            />
          </Card>
        )}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 40,
  },
  card: {
    borderWidth: 1,
  },
  superLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  targetTitle: {
    letterSpacing: -0.3,
    marginTop: 2,
  },
  targetTagline: {
    fontSize: 12,
    marginTop: 2,
  },
  priceSummaryBox: {
    padding: 12,
    marginTop: 14,
    marginBottom: 14,
  },
  diffHeading: {
    marginTop: 4,
    marginBottom: 8,
  },
  diffRows: {
    marginBottom: 12,
  },
  diffRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(148, 163, 184, 0.15)',
  },
  diffLabel: {
    fontSize: 11,
  },
  diffVal: {
    fontSize: 11,
    maxWidth: '60%',
    textAlign: 'right',
  },
  paymentNoteBox: {
    borderWidth: 1,
    padding: 10,
    marginTop: 6,
  },
  processingCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    borderWidth: 1,
  },
  processingTitle: {
    letterSpacing: -0.2,
  },
  processingSub: {
    maxWidth: 280,
  },
  successCard: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  successCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    letterSpacing: -0.3,
  },
  successSub: {
    maxWidth: 320,
  },
  unlockedBox: {
    padding: 12,
    marginTop: 16,
  },
  unlockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
  },
});
