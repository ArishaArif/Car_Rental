import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, Alert, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProviderStackParamList, PricingRule, VehiclePricingMetrics } from '../../types';
import { useTheme } from '../../theme';
import { ScreenContainer, Header, Card, Input, Button } from '../../components/common';
import { smartPricingService } from '../../services/smartPricingService';

type SmartPricingNavProp = NativeStackNavigationProp<
  ProviderStackParamList,
  'SmartPricing'
>;

interface Props {
  navigation: SmartPricingNavProp;
}

export const SmartPricingScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();

  const [aiPricingEnabled, setAiPricingEnabled] = useState(true);
  const [weekendSurge, setWeekendSurge] = useState('15');
  const [holidayPeak, setHolidayPeak] = useState('25');
  const [weeklyDiscount, setWeeklyDiscount] = useState('12');
  const [minDays, setMinDays] = useState('2');
  const [isSaving, setIsSaving] = useState(false);
  const [pricingList, setPricingList] = useState<VehiclePricingMetrics[]>([]);

  const loadPricing = async () => {
    try {
      const data = await smartPricingService.getAllFleetPricingMetrics();
      setPricingList(data);
    } catch (err) {
      console.warn('Could not load fleet pricing metrics', err);
    }
  };

  useEffect(() => {
    loadPricing();
  }, []);

  const [rules, setRules] = useState<PricingRule[]>([
    {
      id: 'rule-01',
      name: 'Friday - Sunday Weekend Surge',
      peakMultiplier: 1.15,
      weekendSurgePercent: 15,
      weeklyDiscountPercent: 0,
      minRentalDays: 2,
      isActive: true,
    },
    {
      id: 'rule-02',
      name: 'Extended Rental Weekly Benefit (7+ Days)',
      peakMultiplier: 1.0,
      weekendSurgePercent: 0,
      weeklyDiscountPercent: 12,
      minRentalDays: 7,
      isActive: true,
    },
    {
      id: 'rule-03',
      name: 'Airport Logistics Peak Demand Multiplier',
      peakMultiplier: 1.25,
      weekendSurgePercent: 20,
      weeklyDiscountPercent: 5,
      minRentalDays: 1,
      isActive: false,
    },
  ]);

  const toggleRule = (id: string) => {
    setRules(prev =>
      prev.map(r => (r.id === id ? { ...r, isActive: !r.isActive } : r))
    );
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      Alert.alert(
        'Pricing Matrix Updated',
        'Smart yield optimization parameters applied across active fleet.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }, 400);
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="Smart Dynamic Pricing"
          subtitle="Automate Yield & Occupancy Optimization"
          showBack
          onBackPress={() => navigation.goBack()}
        />
      }
      footer={
        <View
          style={[
            styles.footerBar,
            {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
              padding: spacing.md,
            },
          ]}
        >
          <Button
            title={isSaving ? 'Applying...' : 'Save Pricing Parameters'}
            variant="primary"
            size="large"
            fullWidth
            loading={isSaving}
            onPress={handleSave}
          />
        </View>
      }
    >
      <View style={[styles.content, { padding: spacing.md }]}>
        {/* Dynamic AI Pricing Master Toggle */}
        <Card
          variant="elevated"
          padding="large"
          style={[
            styles.masterCard,
            {
              backgroundColor: colors.surface,
              borderColor: aiPricingEnabled ? colors.primary : colors.border,
            },
          ]}
        >
          <View style={styles.toggleRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 20, marginRight: 6 }}>⚡</Text>
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: typography.fontSizes.md,
                    fontWeight: typography.fontWeights.bold,
                  }}
                >
                  AI Occupancy Surge Pricing
                </Text>
              </View>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: typography.fontSizes.xs,
                  marginTop: 4,
                  lineHeight: 18,
                }}
              >
                Automatically flex daily rental prices up or down according to metropolitan demand,
                weather, and fleet availability.
              </Text>
            </View>
            <Switch
              value={aiPricingEnabled}
              onValueChange={setAiPricingEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </Card>

        {/* Global Multipliers Section */}
        <Text
          style={[
            styles.sectionHeading,
            {
              color: colors.textPrimary,
              fontSize: typography.fontSizes.md,
              fontWeight: typography.fontWeights.bold,
              marginTop: spacing.lg,
              marginBottom: 8,
            },
          ]}
        >
          Yield Parameter Controls
        </Text>

        <View style={styles.formRow}>
          <Input
            label="Weekend Surge (%)"
            value={weekendSurge}
            onChangeText={setWeekendSurge}
            keyboardType="numeric"
            containerStyle={{ flex: 1, marginRight: 8 }}
          />
          <Input
            label="Holiday Multiplier (%)"
            value={holidayPeak}
            onChangeText={setHolidayPeak}
            keyboardType="numeric"
            containerStyle={{ flex: 1 }}
          />
        </View>

        <View style={styles.formRow}>
          <Input
            label="Weekly Discount (7+ Days %)"
            value={weeklyDiscount}
            onChangeText={setWeeklyDiscount}
            keyboardType="numeric"
            containerStyle={{ flex: 1, marginRight: 8 }}
          />
          <Input
            label="Min Rental Duration (Days)"
            value={minDays}
            onChangeText={setMinDays}
            keyboardType="numeric"
            containerStyle={{ flex: 1 }}
          />
        </View>

        {/* Active Rules List */}
        <Text
          style={[
            styles.sectionHeading,
            {
              color: colors.textPrimary,
              fontSize: typography.fontSizes.md,
              fontWeight: typography.fontWeights.bold,
              marginTop: spacing.md,
              marginBottom: 8,
            },
          ]}
        >
          Automated Pricing Rules ({rules.length})
        </Text>

        {rules.map(rule => (
          <Card
            key={rule.id}
            variant="flat"
            padding="medium"
            style={[
              styles.ruleCard,
              {
                borderColor: rule.isActive ? colors.primary : colors.border,
                borderWidth: rule.isActive ? 1.5 : 1,
                marginBottom: 10,
              },
            ]}
          >
            <View style={styles.toggleRow}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '700' }}>
                  {rule.name}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>
                  Surge: +{rule.weekendSurgePercent}% • Discount: {rule.weeklyDiscountPercent}% • Min: {rule.minRentalDays}d
                </Text>
              </View>
              <Switch
                value={rule.isActive}
                onValueChange={() => toggleRule(rule.id)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </Card>
        ))}

        {/* Fleet Dynamic Yield Recommendations */}
        <Text
          style={[
            styles.sectionHeading,
            {
              color: colors.textPrimary,
              fontSize: typography.fontSizes.md,
              fontWeight: typography.fontWeights.bold,
              marginTop: spacing.lg,
              marginBottom: 8,
            },
          ]}
        >
          Vehicle Pricing Recommendations ({pricingList.length})
        </Text>

        {pricingList.map(item => (
          <Card
            key={item.vehicleId}
            variant="outlined"
            padding="medium"
            style={{ marginBottom: 10 }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '800' }}>
                  {item.vehicleName}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>
                  Demand: {item.demandLevel} • Utilization: {item.utilizationRate}%
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: colors.textSecondary, fontSize: 10 }}>Current: PKR {item.currentPrice.toLocaleString()}</Text>
                <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '900' }}>
                  PKR {item.recommendedPrice.toLocaleString()}/d
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
              <TouchableOpacity
                onPress={() => navigation.navigate('VehiclePricingAnalysis', { vehicleId: item.vehicleId })}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: borderRadius.sm,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ color: colors.textPrimary, fontSize: 11, fontWeight: '700' }}>
                  Analyze Signals 📊
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={async () => {
                  await smartPricingService.acceptRecommendation(item.vehicleId, item.recommendedPrice);
                  Alert.alert('Price Updated', `${item.vehicleName} daily rate updated to PKR ${item.recommendedPrice.toLocaleString()}.`);
                  loadPricing();
                }}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: borderRadius.sm,
                  backgroundColor: colors.primary,
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>
                  Accept Rate ✓
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        ))}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
  },
  masterCard: {
    borderWidth: 1.5,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeading: {
    letterSpacing: -0.2,
  },
  formRow: {
    flexDirection: 'row',
  },
  ruleCard: {
    borderRadius: 8,
  },
  footerBar: {
    borderTopWidth: 1,
  },
});
