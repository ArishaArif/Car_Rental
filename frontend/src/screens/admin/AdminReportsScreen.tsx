import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../types';
import { useTheme } from '../../theme';
import { adminService } from '../../services/adminService';
import { ScreenContainer, Header, Card } from '../../components/common';

type AdminReportsNavProp = NativeStackNavigationProp<AdminStackParamList, 'AdminReports'>;

interface Props {
  navigation: AdminReportsNavProp;
}

export const AdminReportsScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const [kpis, setKpis] = useState(adminService.getKPIs());

  useEffect(() => {
    const unsubscribe = adminService.subscribe(() => {
      setKpis(adminService.getKPIs());
    });
    return unsubscribe;
  }, []);

  const completedRentals = Math.round(kpis.totalBookings * 0.81);
  const utilization = 78.5; // percentage

  // Category distribution data
  const categoryStats = [
    { name: 'Luxury', share: 34, revenue: 43670, color: colors.secondary },
    { name: 'SUV', share: 28, revenue: 35960, color: colors.primary },
    { name: 'Electric', share: 20, revenue: 25690, color: colors.accent },
    { name: 'Sedan', share: 12, revenue: 15410, color: '#10B981' },
    { name: 'Sports', share: 6, revenue: 7720, color: '#F59E0B' },
  ];

  // Regional performance data
  const regionalStats = [
    { region: 'Austin Hub Central', volume: '$46,200', percent: 36 },
    { region: 'Los Angeles Metro', volume: '$39,800', percent: 31 },
    { region: 'San Francisco Bay Area', volume: '$28,450', percent: 22 },
    { region: 'Miami South Beach', volume: '$14,000', percent: 11 },
  ];

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="Global Analytics & Reports"
          subtitle="Real-time telematics, yields & ecosystem health"
          showBack
          onBackPress={() => navigation.goBack()}
        />
      }
    >
      <View style={[styles.content, { padding: spacing.md }]}>
        {/* 6 Lightweight Summary Cards */}
        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.textPrimary,
              fontSize: typography.fontSizes.md,
              fontWeight: typography.fontWeights.bold,
              marginBottom: 10,
            },
          ]}
        >
          Executive Summary Indicators
        </Text>

        <View style={styles.metricsGrid}>
          {/* Total Bookings */}
          <Card variant="elevated" padding="medium" style={styles.metricCard}>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Total Bookings</Text>
            <Text style={[styles.cardVal, { color: colors.textPrimary }]}>
              {kpis.totalBookings.toLocaleString()}
            </Text>
            <Text style={[styles.cardSub, { color: colors.primary }]}>Platform lifetime</Text>
          </Card>

          {/* Completed Rentals */}
          <Card variant="elevated" padding="medium" style={styles.metricCard}>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Completed Rentals</Text>
            <Text style={[styles.cardVal, { color: colors.success || '#10B981' }]}>
              {completedRentals.toLocaleString()}
            </Text>
            <Text style={[styles.cardSub, { color: colors.success || '#10B981' }]}>
              81% fulfillment
            </Text>
          </Card>

          {/* Platform Revenue */}
          <Card variant="elevated" padding="medium" style={styles.metricCard}>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Platform Revenue</Text>
            <Text style={[styles.cardVal, { color: colors.primary }]}>
              ${kpis.platformRevenue.toLocaleString()}
            </Text>
            <Text style={[styles.cardSub, { color: colors.textMuted }]}>Retained commission</Text>
          </Card>

          {/* Active Vehicles */}
          <Card variant="elevated" padding="medium" style={styles.metricCard}>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Active Vehicles</Text>
            <Text style={[styles.cardVal, { color: colors.accent }]}>
              {kpis.totalVehicles}
            </Text>
            <Text style={[styles.cardSub, { color: colors.accent }]}>Total registered</Text>
          </Card>

          {/* Utilization */}
          <Card variant="elevated" padding="medium" style={styles.metricCard}>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Fleet Utilization</Text>
            <Text style={[styles.cardVal, { color: colors.secondary }]}>
              {utilization}%
            </Text>
            <Text style={[styles.cardSub, { color: colors.secondary }]}>Operational yield</Text>
          </Card>

          {/* Open Disputes */}
          <Card variant="elevated" padding="medium" style={styles.metricCard}>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Open Disputes</Text>
            <Text style={[styles.cardVal, { color: colors.danger }]}>
              {kpis.openDisputes}
            </Text>
            <Text style={[styles.cardSub, { color: colors.danger }]}>Requiring action</Text>
          </Card>
        </View>

        {/* Revenue by Vehicle Category (Custom CSS Progress Bars) */}
        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.textPrimary,
              fontSize: typography.fontSizes.md,
              fontWeight: typography.fontWeights.bold,
              marginTop: spacing.lg,
              marginBottom: 10,
            },
          ]}
        >
          Revenue by Category Distribution
        </Text>

        <Card variant="elevated" padding="medium" style={styles.chartCard}>
          {categoryStats.map((item, idx) => (
            <View key={idx} style={styles.barItem}>
              <View style={styles.barHeader}>
                <Text style={[styles.barName, { color: colors.textPrimary }]}>{item.name}</Text>
                <Text style={[styles.barAmt, { color: colors.textSecondary }]}>
                  ${item.revenue.toLocaleString()} ({item.share}%)
                </Text>
              </View>

              {/* Bar track and fill */}
              <View style={[styles.barTrack, { backgroundColor: colors.surfaceVariant, borderRadius: borderRadius.full }]}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${item.share}%`,
                      backgroundColor: item.color,
                      borderRadius: borderRadius.full,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </Card>

        {/* Regional Hub Performance */}
        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.textPrimary,
              fontSize: typography.fontSizes.md,
              fontWeight: typography.fontWeights.bold,
              marginTop: spacing.lg,
              marginBottom: 10,
            },
          ]}
        >
          Regional Hub Performance
        </Text>

        <Card variant="elevated" padding="medium" style={styles.chartCard}>
          {regionalStats.map((reg, rIdx) => (
            <View key={rIdx} style={styles.barItem}>
              <View style={styles.barHeader}>
                <Text style={[styles.barName, { color: colors.textPrimary }]}>{reg.region}</Text>
                <Text style={[styles.barAmt, { color: colors.primary, fontWeight: '700' }]}>
                  {reg.volume} ({reg.percent}%)
                </Text>
              </View>

              <View style={[styles.barTrack, { backgroundColor: colors.surfaceVariant, borderRadius: borderRadius.full }]}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${reg.percent}%`,
                      backgroundColor: colors.primary,
                      borderRadius: borderRadius.full,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </Card>

        {/* Telematics Health & SLA Card */}
        <Card
          variant="flat"
          padding="medium"
          style={[styles.healthCard, { borderColor: colors.border, marginTop: spacing.md }]}
        >
          <Text style={[styles.healthTitle, { color: colors.primary }]}>
            🛡️ Platform Audit & SLA Health
          </Text>
          <Text style={[styles.healthDesc, { color: colors.textSecondary }]}>
            99.94% API telemetry uptime. Automated fraud screening active across all KYC submissions.
            Zero unhandled payment webhooks.
          </Text>
        </Card>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 40,
  },
  sectionTitle: {
    letterSpacing: -0.2,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCard: {
    width: '48%',
    borderWidth: 1,
    minHeight: 90,
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardVal: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  cardSub: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  chartCard: {
    borderWidth: 1,
  },
  barItem: {
    marginBottom: 12,
  },
  barHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  barName: {
    fontSize: 12,
    fontWeight: '600',
  },
  barAmt: {
    fontSize: 11,
  },
  barTrack: {
    height: 8,
    width: '100%',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
  },
  healthCard: {
    borderWidth: 1,
  },
  healthTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },
  healthDesc: {
    fontSize: 11,
    lineHeight: 16,
  },
});
