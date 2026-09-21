import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProviderStackParamList } from '../../types';
import { useTheme } from '../../theme';
import { useBooking } from '../../context/BookingContext';
import { ScreenContainer, Header, Card, Button } from '../../components/common';

type RevenueReportsNavProp = NativeStackNavigationProp<
  ProviderStackParamList,
  'RevenueReports'
>;

interface Props {
  navigation: RevenueReportsNavProp;
}

const TIMEFRAMES = ['This Month', 'Last Month', 'Quarter-to-Date', 'Year-to-Date'];

export const RevenueReportsScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { bookings, getRevenueMetrics } = useBooking();
  const [selectedTimeframe, setSelectedTimeframe] = useState('This Month');

  const metrics = getRevenueMetrics();

  // Multiplier based on timeframe
  const timeframeMultiplier =
    selectedTimeframe === 'Year-to-Date'
      ? 4.5
      : selectedTimeframe === 'Quarter-to-Date'
      ? 2.8
      : selectedTimeframe === 'Last Month'
      ? 0.95
      : 1.0;

  const grossEarnings = Math.round(metrics.monthlyRevenue * timeframeMultiplier);
  const platformFees = Math.round(grossEarnings * 0.1);
  const taxesCollected = Math.round(grossEarnings * 0.05);
  const netEarnings = grossEarnings - platformFees;

  const handleExport = (format: 'CSV' | 'PDF') => {
    Alert.alert(
      `Export ${format} Statement`,
      `Your official ${selectedTimeframe} financial audit statement in ${format} format is being compiled and downloaded.`,
      [{ text: 'Dismiss' }]
    );
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="Revenue Reports"
          subtitle="Financial Ledger & Statements"
          showBack
          onBackPress={() => navigation.goBack()}
        />
      }
    >
      <View style={[styles.content, { padding: spacing.md }]}>
        {/* Timeframe Chips */}
        <View style={styles.timeframeRow}>
          {TIMEFRAMES.map(tf => {
            const isSelected = selectedTimeframe === tf;
            return (
              <TouchableOpacity
                key={tf}
                onPress={() => setSelectedTimeframe(tf)}
                style={[
                  styles.tfChip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderRadius: borderRadius.full,
                  },
                ]}
              >
                <Text
                  style={{
                    color: isSelected ? colors.textInverse : colors.textSecondary,
                    fontSize: 11,
                    fontWeight: isSelected ? '700' : '500',
                  }}
                >
                  {tf}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Executive Summary Card */}
        <Card variant="elevated" padding="large" style={[styles.summaryCard, { borderColor: colors.border }]}>
          <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '700' }}>
            ESTIMATED NET PAYOUT ({selectedTimeframe.toUpperCase()})
          </Text>
          <Text
            style={{
              color: colors.accent,
              fontSize: 32,
              fontWeight: typography.fontWeights.heavy,
              marginTop: 4,
            }}
          >
            ${netEarnings.toLocaleString()}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs, marginTop: 4 }}>
            Disbursed bi-weekly to verified business ACH account.
          </Text>

          <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: 14 }]} />

          <View style={styles.summaryItem}>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Total Gross Bookings</Text>
            <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '700' }}>
              ${grossEarnings.toLocaleString()}
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Velox Platform Fee (10%)</Text>
            <Text style={{ color: colors.danger, fontSize: 13, fontWeight: '700' }}>
              -${platformFees.toLocaleString()}
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Sales Taxes Remitted</Text>
            <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: '700' }}>
              ${taxesCollected.toLocaleString()}
            </Text>
          </View>
        </Card>

        {/* Completed Bookings Ledger */}
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
          Recent Settled Transactions
        </Text>

        {bookings.map(b => (
          <Card
            key={b.id}
            variant="flat"
            padding="medium"
            style={[styles.ledgerRowCard, { borderColor: colors.border }]}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '700' }}>
                {b.vehicle.brand} {b.vehicle.model} • {b.id}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>
                Renter: {b.customer.fullName} • {b.rentalDays} Days
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 2 }}>
                📅 {b.pickupDate} → {b.returnDate}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '800' }}>
                +${b.pricing.subtotal}
              </Text>
              <Text style={{ color: colors.accent, fontSize: 10, fontWeight: '700' }}>
                {b.paymentStatus.toUpperCase()}
              </Text>
            </View>
          </Card>
        ))}

        {/* Export Actions */}
        <View style={styles.exportRow}>
          <Button
            title="Download CSV"
            variant="outline"
            size="medium"
            style={{ flex: 1 }}
            onPress={() => handleExport('CSV')}
          />
          <Button
            title="Export PDF Report"
            variant="secondary"
            size="medium"
            style={{ flex: 1 }}
            onPress={() => handleExport('PDF')}
          />
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
  },
  timeframeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  tfChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  summaryCard: {
    borderWidth: 1,
  },
  divider: {
    height: 1,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionHeading: {
    letterSpacing: -0.2,
    marginBottom: 8,
  },
  ledgerRowCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
  },
  exportRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
});
