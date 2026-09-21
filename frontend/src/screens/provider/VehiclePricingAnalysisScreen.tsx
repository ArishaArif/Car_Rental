import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Card, Header, ScreenContainer } from '../../components/common';
import { smartPricingService } from '../../services/smartPricingService';
import { vehicleService } from '../../services/vehicleService';
import { useTheme } from '../../theme';
import {
  PricingFactor,
  ProviderStackParamList,
  Vehicle,
  VehiclePricingMetrics,
} from '../../types';

type VehiclePricingAnalysisNavProp = NativeStackNavigationProp<
  ProviderStackParamList,
  'VehiclePricingAnalysis'
>;
type VehiclePricingAnalysisRouteProp = RouteProp<
  ProviderStackParamList,
  'VehiclePricingAnalysis'
>;

interface VehiclePricingAnalysisScreenProps {
  navigation: VehiclePricingAnalysisNavProp;
  route: VehiclePricingAnalysisRouteProp;
}

export const VehiclePricingAnalysisScreen: React.FC<VehiclePricingAnalysisScreenProps> = ({
  navigation,
  route,
}) => {
  const { colors, typography, borderRadius } = useTheme();
  const { vehicleId } = route.params;

  const [vehicle, setVehicle] = useState<Vehicle | undefined>(undefined);
  const [metrics, setMetrics] = useState<VehiclePricingMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const veh = await vehicleService.getVehicleById(vehicleId);
      setVehicle(veh);
      const data = await smartPricingService.getVehiclePricingMetrics(vehicleId);
      setMetrics(data);
    } catch {
      Alert.alert('Error', 'Could not load vehicle pricing analytics.');
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAcceptRecommendation = async () => {
    if (!metrics) return;
    setIsApplying(true);
    try {
      await smartPricingService.acceptRecommendation(
        metrics.vehicleId,
        metrics.recommendedPrice
      );
      setIsApplying(false);
      Alert.alert(
        'Pricing Recommendation Accepted',
        `Successfully updated ${metrics.vehicleName} daily rate to PKR ${metrics.recommendedPrice.toLocaleString()}. This rate is now live across both Provider Fleet and Customer booking flows.`,
        [
          {
            text: 'View Fleet List',
            onPress: () => navigation.navigate('FleetList', {}),
          },
          {
            text: 'OK',
            onPress: () => loadData(),
          },
        ]
      );
    } catch {
      setIsApplying(false);
      Alert.alert('Update Failed', 'Could not apply smart pricing recommendation.');
    }
  };

  if (loading || !metrics) {
    return (
      <ScreenContainer
        header={
          <Header
            title="Pricing Analysis"
            showBack
            onBackPress={() => navigation.goBack()}
          />
        }
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Computing real-time fleet yield metrics...
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  const isPriceIncrease = metrics.difference >= 0;

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="Vehicle Pricing Analysis"
          subtitle={metrics.vehicleName}
          showBack
          onBackPress={() => navigation.goBack()}
        />
      }
      footer={
        <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <Button
            title={
              isApplying
                ? 'Applying Live Rate...'
                : `Accept Recommendation: PKR ${metrics.recommendedPrice.toLocaleString()} →`
            }
            onPress={handleAcceptRecommendation}
            disabled={isApplying}
            fullWidth
          />
        </View>
      }
    >
      {/* Vehicle Summary Header */}
      {vehicle && (
        <Card variant="outlined" style={styles.vehicleCard}>
          <Image source={{ uri: vehicle.image }} style={styles.vehicleImage} />
          <View style={styles.vehicleInfo}>
            <Text style={[styles.vehicleTitle, { color: colors.textPrimary, fontSize: typography.fontSizes.md }]}>
              {vehicle.brand} {vehicle.model} ({vehicle.year})
            </Text>
            <Text style={[styles.vehicleMeta, { color: colors.textSecondary, fontSize: typography.fontSizes.xs }]}>
              {vehicle.category} • {vehicle.transmission} • {vehicle.location}
            </Text>
            <View style={styles.badgeRow}>
              <View style={[styles.availBadge, { backgroundColor: colors.primary + '18' }]}>
                <Text style={[styles.availText, { color: colors.primary }]}>
                  {metrics.availabilityStatus}
                </Text>
              </View>
              <View style={[styles.availBadge, { backgroundColor: '#10B98120' }]}>
                <Text style={[styles.availText, { color: '#10B981' }]}>
                  Demand: {metrics.demandLevel}
                </Text>
              </View>
            </View>
          </View>
        </Card>
      )}

      {/* Pricing Comparison Box */}
      <Card variant="elevated" style={styles.comparisonCard}>
        <Text style={[styles.boxHeader, { color: colors.textSecondary, fontSize: typography.fontSizes.xs }]}>
          SMART YIELD COMPARISON
        </Text>

        <View style={styles.comparisonRow}>
          {/* Current Price */}
          <View style={styles.priceColumn}>
            <Text style={[styles.priceColumnLabel, { color: colors.textSecondary, fontSize: typography.fontSizes.xs }]}>
              CURRENT RATE
            </Text>
            <Text style={[styles.priceColumnAmount, { color: colors.textPrimary, fontSize: typography.fontSizes.xl }]}>
              PKR {metrics.currentPrice.toLocaleString()}
            </Text>
            <Text style={[styles.priceColumnSub, { color: colors.textSecondary, fontSize: typography.fontSizes.xs }]}>
              per day
            </Text>
          </View>

          <View style={styles.arrowColumn}>
            <Text style={[styles.arrowText, { color: isPriceIncrease ? '#10B981' : '#F59E0B' }]}>
              ➔
            </Text>
            <View
              style={[
                styles.deltaBadge,
                {
                  backgroundColor: isPriceIncrease ? '#10B98120' : '#F59E0B20',
                  borderColor: isPriceIncrease ? '#10B981' : '#F59E0B',
                },
              ]}
            >
              <Text
                style={[
                  styles.deltaText,
                  { color: isPriceIncrease ? '#10B981' : '#F59E0B' },
                ]}
              >
                {isPriceIncrease ? '+' : ''}
                {metrics.percentageChange}%
              </Text>
            </View>
          </View>

          {/* Recommended Price */}
          <View style={styles.priceColumn}>
            <Text style={[styles.priceColumnLabel, { color: colors.primary, fontSize: typography.fontSizes.xs }]}>
              RECOMMENDED RATE
            </Text>
            <Text style={[styles.priceColumnAmount, { color: colors.primary, fontSize: typography.fontSizes.xl, fontWeight: '900' }]}>
              PKR {metrics.recommendedPrice.toLocaleString()}
            </Text>
            <Text style={[styles.priceColumnSub, { color: colors.textSecondary, fontSize: typography.fontSizes.xs }]}>
              per day
            </Text>
          </View>
        </View>
      </Card>

      {/* Clear AI Yield Explanation */}
      <Card variant="outlined" style={styles.explanationCard}>
        <View style={styles.explanationHeader}>
          <Text style={styles.aiIcon}>🤖</Text>
          <Text style={[styles.explanationTitle, { color: colors.textPrimary, fontSize: typography.fontSizes.sm }]}>
            AI PRICING RATIONALE
          </Text>
        </View>
        <Text style={[styles.explanationBody, { color: colors.textPrimary, fontSize: typography.fontSizes.sm, lineHeight: 22 }]}>
          {metrics.explanation}
        </Text>
      </Card>

      {/* 6 Key Market Metrics Grid */}
      <View style={styles.metricsHeader}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: typography.fontSizes.sm }]}>
          REAL-TIME MARKET FACTORS
        </Text>
      </View>

      <View style={styles.metricsGrid}>
        <View style={[styles.metricTile, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md }]}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Market Demand</Text>
          <Text style={[styles.metricValue, { color: colors.primary }]}>{metrics.demandLevel}</Text>
          <Text style={[styles.metricSub, { color: colors.textSecondary }]}>High booking velocity</Text>
        </View>

        <View style={[styles.metricTile, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md }]}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Fleet Utilization</Text>
          <Text style={[styles.metricValue, { color: '#10B981' }]}>{metrics.utilizationRate}%</Text>
          <Text style={[styles.metricSub, { color: colors.textSecondary }]}>Active reservations</Text>
        </View>

        <View style={[styles.metricTile, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md }]}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Weekend Surge Factor</Text>
          <Text style={[styles.metricValue, { color: '#F59E0B' }]}>{metrics.weekendFactor}x</Text>
          <Text style={[styles.metricSub, { color: colors.textSecondary }]}>Fri - Sun window</Text>
        </View>

        <View style={[styles.metricTile, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md }]}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Seasonal Tourism Index</Text>
          <Text style={[styles.metricValue, { color: '#6366F1' }]}>{metrics.seasonalFactor}x</Text>
          <Text style={[styles.metricSub, { color: colors.textSecondary }]}>Peak travel multiplier</Text>
        </View>

        <View style={[styles.metricTile, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md }]}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Booking Frequency</Text>
          <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{metrics.bookingFrequency}/mo</Text>
          <Text style={[styles.metricSub, { color: colors.textSecondary }]}>Average turnover</Text>
        </View>

        <View style={[styles.metricTile, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md }]}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Fleet Availability</Text>
          <Text style={[styles.metricValue, { color: '#10B981' }]}>{metrics.availabilityStatus}</Text>
          <Text style={[styles.metricSub, { color: colors.textSecondary }]}>Instant dispatch ready</Text>
        </View>
      </View>

      {/* Itemized Pricing Factor Breakdown */}
      <View style={styles.factorsSection}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: typography.fontSizes.sm, marginBottom: 8 }]}>
          SIGNAL ATTRIBUTION
        </Text>
        {metrics.factors.map((factor: PricingFactor, idx: number) => (
          <View
            key={`factor-${idx}`}
            style={[
              styles.factorRow,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: borderRadius.sm,
              },
            ]}
          >
            <View style={styles.factorLeft}>
              <Text style={styles.factorIcon}>{factor.positive ? '📈' : '📉'}</Text>
              <Text style={[styles.factorLabel, { color: colors.textPrimary, fontSize: typography.fontSizes.sm }]}>
                {factor.label}
              </Text>
            </View>
            <Text
              style={[
                styles.factorImpact,
                { color: factor.positive ? '#10B981' : colors.textSecondary, fontSize: typography.fontSizes.sm },
              ]}
            >
              {factor.impact}
            </Text>
          </View>
        ))}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  vehicleCard: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 16,
  },
  vehicleImage: {
    width: 90,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
    marginRight: 12,
  },
  vehicleInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  vehicleTitle: {
    fontWeight: '800',
  },
  vehicleMeta: {
    marginVertical: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  availBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  availText: {
    fontSize: 10,
    fontWeight: '700',
  },
  comparisonCard: {
    padding: 16,
    marginBottom: 16,
  },
  boxHeader: {
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 12,
    textAlign: 'center',
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceColumn: {
    flex: 1,
    alignItems: 'center',
  },
  priceColumnLabel: {
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  priceColumnAmount: {
    fontWeight: '800',
  },
  priceColumnSub: {
    marginTop: 2,
  },
  arrowColumn: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  arrowText: {
    fontSize: 22,
    fontWeight: '900',
  },
  deltaBadge: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  deltaText: {
    fontSize: 11,
    fontWeight: '800',
  },
  explanationCard: {
    padding: 14,
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  explanationTitle: {
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  explanationBody: {
    fontWeight: '400',
  },
  metricsHeader: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  metricTile: {
    width: '48%',
    padding: 12,
    borderWidth: 1,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  metricSub: {
    fontSize: 10,
  },
  factorsSection: {
    marginBottom: 24,
  },
  factorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    marginBottom: 6,
  },
  factorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  factorIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  factorLabel: {
    fontWeight: '600',
  },
  factorImpact: {
    fontWeight: '700',
  },
});
