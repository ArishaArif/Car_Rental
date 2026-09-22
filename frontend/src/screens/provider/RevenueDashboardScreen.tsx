import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProviderStackParamList } from '../../types';
import { useTheme } from '../../theme';
import { useBooking } from '../../context/BookingContext';
import { useFleet } from '../../context/FleetContext';
import { ScreenContainer, Header, Card, Button } from '../../components/common';

type RevenueDashboardNavProp = NativeStackNavigationProp<
  ProviderStackParamList,
  'RevenueDashboard'
>;

interface Props {
  navigation: RevenueDashboardNavProp;
}

export const RevenueDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { getRevenueMetrics } = useBooking();
  const { getDashboardKPIs } = useFleet();

  const metrics = getRevenueMetrics();
  const kpis = getDashboardKPIs();

  const maxDayAmount = Math.max(...metrics.weeklyTrend.map(t => t.amount), 1);

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="Revenue & Analytics"
          subtitle="Earnings, Yield & Fleet Utilization"
          showBack
          onBackPress={() => navigation.goBack()}
          rightElement={
            <Button
              title="Reports"
              size="small"
              variant="outline"
              onPress={() => navigation.navigate('RevenueReports')}
            />
          }
        />
      }
    >
      <View style={[styles.content, { padding: spacing.md }]}>
        {/* Main Gross Earnings Banner */}
        <Card
          variant="elevated"
          padding="large"
          style={[styles.mainRevenueCard, { backgroundColor: colors.surface, borderColor: colors.primary }]}
        >
          <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs, letterSpacing: 0.5 }}>
            TOTAL GROSS REVENUE
          </Text>
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 34,
              fontWeight: typography.fontWeights.heavy,
              marginTop: 4,
            }}
          >
            ${metrics.totalRevenue.toLocaleString()}
          </Text>
          <Text style={{ color: colors.accent, fontSize: typography.fontSizes.xs, marginTop: 4, fontWeight: '700' }}>
            ↑ +18.4% vs previous rolling 30 days
          </Text>
        </Card>

        {/* 3-Way Period Breakdown */}
        <View style={styles.periodGrid}>
          <Card variant="flat" padding="medium" style={styles.periodCard}>
            <Text style={{ color: colors.textMuted, fontSize: 10 }}>DAILY</Text>
            <Text style={[styles.periodVal, { color: colors.textPrimary }]}>
              ${metrics.dailyRevenue.toLocaleString()}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 9 }}>avg per 24h</Text>
          </Card>

          <Card variant="flat" padding="medium" style={styles.periodCard}>
            <Text style={{ color: colors.textMuted, fontSize: 10 }}>WEEKLY</Text>
            <Text style={[styles.periodVal, { color: colors.textPrimary }]}>
              ${metrics.weeklyRevenue.toLocaleString()}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 9 }}>last 7 days</Text>
          </Card>

          <Card variant="flat" padding="medium" style={styles.periodCard}>
            <Text style={{ color: colors.textMuted, fontSize: 10 }}>MONTHLY</Text>
            <Text style={[styles.periodVal, { color: colors.primary }]}>
              ${metrics.monthlyRevenue.toLocaleString()}
            </Text>
            <Text style={{ color: colors.accent, fontSize: 9 }}>est. pacing</Text>
          </Card>
        </View>

        {/* Operational Performance Summary Strip */}
        <View style={styles.kpiRow}>
          <Card variant="elevated" padding="small" style={styles.kpiTile}>
            <Text style={{ fontSize: 16 }}>🏁</Text>
            <Text style={[styles.kpiNum, { color: colors.textPrimary }]}>
              {metrics.completedRentalsCount}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 10 }}>Completed Trips</Text>
          </Card>

          <Card variant="elevated" padding="small" style={styles.kpiTile}>
            <Text style={{ fontSize: 16 }}>🚫</Text>
            <Text style={[styles.kpiNum, { color: colors.danger }]}>
              {metrics.cancelledBookingsCount}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 10 }}>
              Cancelled ({metrics.cancellationRate}%)
            </Text>
          </Card>

          <Card variant="elevated" padding="small" style={styles.kpiTile}>
            <Text style={{ fontSize: 16 }}>📊</Text>
            <Text style={[styles.kpiNum, { color: colors.primary }]}>
              {kpis.utilizationRate}%
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 10 }}>Fleet Utilization</Text>
          </Card>
        </View>

        {/* 7-Day Revenue Trend (Lightweight Native Bar Visualization) */}
        <Text
          style={[
            styles.sectionHeading,
            {
              color: colors.textPrimary,
              fontSize: typography.fontSizes.md,
              fontWeight: typography.fontWeights.bold,
              marginTop: spacing.lg,
            },
          ]}
        >
          Weekly Earnings Trend (Last 7 Days)
        </Text>

        <Card variant="elevated" padding="medium" style={styles.trendCard}>
          <View style={styles.barsContainer}>
            {metrics.weeklyTrend.map((dayItem, idx) => {
              const heightRatio = dayItem.amount / maxDayAmount;
              const barHeight = Math.max(16, Math.round(heightRatio * 90));
              return (
                <View key={idx} style={styles.barCol}>
                  <Text style={{ color: colors.textMuted, fontSize: 9, marginBottom: 4 }}>
                    ${dayItem.amount}
                  </Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: barHeight,
                          backgroundColor: idx >= 4 ? colors.primary : colors.secondary,
                          borderRadius: borderRadius.xs,
                        },
                      ]}
                    />
                  </View>
                  <Text style={{ color: colors.textSecondary, fontSize: 10, fontWeight: '700', marginTop: 6 }}>
                    {dayItem.day}
                  </Text>
                </View>
              );
            })}
          </View>
        </Card>

        {/* Revenue by Vehicle Category Meter */}
        <Text
          style={[
            styles.sectionHeading,
            {
              color: colors.textPrimary,
              fontSize: typography.fontSizes.md,
              fontWeight: typography.fontWeights.bold,
              marginTop: spacing.lg,
            },
          ]}
        >
          Revenue Share by Category
        </Text>

        <Card variant="elevated" padding="medium" style={styles.categoryShareCard}>
          {metrics.revenueByCategory.map((cat, cIdx) => (
            <View key={cIdx} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ color: colors.textPrimary, fontSize: 12, fontWeight: '700' }}>
                  {cat.category}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                  ${cat.amount.toLocaleString()} ({cat.percentage}%)
                </Text>
              </View>
              <View
                style={[
                  styles.catBarTrack,
                  { backgroundColor: colors.surfaceVariant, borderRadius: borderRadius.full },
                ]}
              >
                <View
                  style={[
                    styles.catBarFill,
                    {
                      width: `${Math.max(4, cat.percentage)}%`,
                      backgroundColor:
                        cat.category === 'Luxury'
                          ? colors.secondary
                          : cat.category === 'SUV'
                          ? '#F59E0B'
                          : cat.category === 'Sedan'
                          ? colors.primary
                          : colors.accent,
                      borderRadius: borderRadius.full,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </Card>

        {/* Top-Performing Vehicles */}
        <Text
          style={[
            styles.sectionHeading,
            {
              color: colors.textPrimary,
              fontSize: typography.fontSizes.md,
              fontWeight: typography.fontWeights.bold,
              marginTop: spacing.lg,
            },
          ]}
        >
          Top-Performing Fleet Vehicles
        </Text>

        {metrics.topVehicles.map((tv, idx) => (
          <Card
            key={tv.id}
            variant="elevated"
            padding="medium"
            style={[styles.topVehicleCard, { borderColor: colors.border }]}
            onPress={() => navigation.navigate('VehicleDetails', { vehicleId: tv.id })}
          >
            <View style={styles.rankBadge}>
              <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '800' }}>#{idx + 1}</Text>
            </View>
            <Image source={{ uri: tv.image }} style={styles.tvThumb} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.sm, fontWeight: '700' }}>
                {tv.brand} {tv.model}
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs, marginTop: 1 }}>
                {tv.category} • {tv.tripsCount} Completed Trips
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: colors.primary, fontSize: typography.fontSizes.md, fontWeight: '800' }}>
                ${tv.revenue.toLocaleString()}
              </Text>
              <Text style={{ color: colors.accent, fontSize: 10, fontWeight: '700' }}>Gross Yield</Text>
            </View>
          </Card>
        ))}

        <Button
          title="View Comprehensive Ledger & Export"
          variant="secondary"
          size="medium"
          fullWidth
          onPress={() => navigation.navigate('RevenueReports')}
          style={{ marginTop: spacing.md }}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
  },
  mainRevenueCard: {
    borderWidth: 1.5,
  },
  periodGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  periodCard: {
    flex: 1,
    alignItems: 'center',
  },
  periodVal: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  kpiTile: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  kpiNum: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  sectionHeading: {
    letterSpacing: -0.2,
    marginBottom: 8,
  },
  trendCard: {
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 130,
    paddingTop: 10,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
  },
  barTrack: {
    width: 22,
    height: 90,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  barFill: {
    width: '100%',
  },
  categoryShareCard: {
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  catBarTrack: {
    height: 6,
    width: '100%',
  },
  catBarFill: {
    height: '100%',
  },
  topVehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    position: 'relative',
  },
  rankBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#3B82F6',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    zIndex: 1,
  },
  tvThumb: {
    width: 55,
    height: 45,
    borderRadius: 6,
  },
});
