import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList, AdminPaymentRecord } from '../../types';
import { useTheme } from '../../theme';
import { adminService } from '../../services/adminService';
import { ScreenContainer, Header, Card, Input, Button } from '../../components/common';

type AdminPaymentsNavProp = NativeStackNavigationProp<AdminStackParamList, 'AdminPayments'>;

interface Props {
  navigation: AdminPaymentsNavProp;
}

export const AdminPaymentsScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const [payments, setPayments] = useState<AdminPaymentRecord[]>(adminService.getPayments());
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsubscribe = adminService.subscribe(() => {
      setPayments(adminService.getPayments());
    });
    return unsubscribe;
  }, []);

  const filteredPayments = payments.filter(p => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      p.bookingId.toLowerCase().includes(q) ||
      p.customerName.toLowerCase().includes(q) ||
      p.providerName.toLowerCase().includes(q) ||
      p.vehicleName.toLowerCase().includes(q)
    );
  });

  const totalGMV = payments.reduce((acc, p) => acc + p.rentalAmount, 0);
  const totalCommission = payments.reduce((acc, p) => acc + p.platformCommission, 0);
  const totalPayouts = payments.reduce((acc, p) => acc + p.providerPayout, 0);
  const totalDeposits = payments.reduce((acc, p) => acc + p.securityDeposit, 0);

  const handleReleasePayout = (record: AdminPaymentRecord) => {
    Alert.alert('Release Payout', `Disburse $${record.providerPayout.toFixed(2)} to ${record.providerName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm Payout',
        onPress: () => {
          adminService.releasePayout(record.id);
        },
      },
    ]);
  };

  const handleProcessRefund = (record: AdminPaymentRecord) => {
    Alert.alert(
      'Process Deposit Refund',
      `Release security deposit ($${record.securityDeposit}) back to ${record.customerName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Refund Deposit',
          onPress: () => {
            adminService.processRefund(record.id);
          },
        },
      ]
    );
  };

  const getRefundBadge = (status: string) => {
    switch (status) {
      case 'Refunded':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: colors.success || '#10B981', border: '#10B981' };
      case 'Held':
        return { bg: 'rgba(245, 158, 11, 0.15)', text: '#D97706', border: '#F59E0B' };
      case 'Partially Refunded':
        return { bg: 'rgba(99, 102, 241, 0.15)', text: colors.secondary, border: colors.secondary };
      default:
        return { bg: 'rgba(148, 163, 184, 0.15)', text: colors.textSecondary, border: colors.border };
    }
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="Payments & Payouts"
          subtitle="Platform commissions, host settlements & deposits"
          showBack
          onBackPress={() => navigation.goBack()}
        />
      }
    >
      <View style={[styles.content, { padding: spacing.md }]}>
        {/* Financial Summary Cards */}
        <View style={styles.summaryGrid}>
          <Card variant="elevated" padding="small" style={styles.summaryCard}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Gross Volume</Text>
            <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
              ${totalGMV.toLocaleString()}
            </Text>
            <Text style={{ fontSize: 9, color: colors.textMuted, marginTop: 2 }}>Gross bookings</Text>
          </Card>

          <Card variant="elevated" padding="small" style={styles.summaryCard}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Platform Cut (15%)</Text>
            <Text style={[styles.summaryValue, { color: colors.primary }]}>
              ${totalCommission.toFixed(1)}
            </Text>
            <Text style={{ fontSize: 9, color: colors.primary, marginTop: 2, fontWeight: '700' }}>
              Retained commission
            </Text>
          </Card>

          <Card variant="elevated" padding="small" style={styles.summaryCard}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Net Payouts</Text>
            <Text style={[styles.summaryValue, { color: colors.secondary }]}>
              ${totalPayouts.toFixed(1)}
            </Text>
            <Text style={{ fontSize: 9, color: colors.textMuted, marginTop: 2 }}>Host disbursements</Text>
          </Card>

          <Card variant="elevated" padding="small" style={styles.summaryCard}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Escrow Deposits</Text>
            <Text style={[styles.summaryValue, { color: '#F59E0B' }]}>
              ${totalDeposits.toLocaleString()}
            </Text>
            <Text style={{ fontSize: 9, color: '#F59E0B', marginTop: 2, fontWeight: '700' }}>
              Collateral escrow
            </Text>
          </Card>
        </View>

        {/* Search */}
        <Input
          placeholder="Search by booking, customer, provider..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          containerStyle={styles.searchContainer}
        />

        {/* Transactions List */}
        <Text
          style={[
            styles.sectionHeading,
            {
              color: colors.textPrimary,
              fontSize: typography.fontSizes.md,
              fontWeight: typography.fontWeights.bold,
              marginBottom: 12,
            },
          ]}
        >
          Disbursement Ledger
        </Text>

        {filteredPayments.length === 0 ? (
          <Card variant="flat" padding="large" style={styles.emptyCard}>
            <Text style={{ fontSize: 32, textAlign: 'center' }}>💳</Text>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: typography.fontSizes.md,
                fontWeight: '700',
                textAlign: 'center',
                marginTop: 8,
              }}
            >
              No Payment Records
            </Text>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: typography.fontSizes.xs,
                textAlign: 'center',
                marginTop: 4,
              }}
            >
              No payment transactions match your search filter.
            </Text>
          </Card>
        ) : (
          filteredPayments.map(item => {
            const refundBadge = getRefundBadge(item.refundStatus);

            return (
              <Card key={item.id} variant="elevated" padding="medium" style={styles.paymentCard}>
                {/* Header: Booking & Date */}
                <View style={styles.cardHeader}>
                  <View>
                    <Text
                      style={[
                        styles.bookingTag,
                        {
                          color: colors.primary,
                          fontSize: typography.fontSizes.sm,
                          fontWeight: '800',
                        },
                      ]}
                    >
                      {item.bookingId}
                    </Text>
                    <Text
                      style={[
                        styles.vehicleName,
                        { color: colors.textPrimary, fontSize: typography.fontSizes.xs, marginTop: 2 },
                      ]}
                    >
                      🚗 {item.vehicleName}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.payoutBadge,
                      {
                        backgroundColor:
                          item.payoutStatus === 'Paid'
                            ? 'rgba(16, 185, 129, 0.15)'
                            : 'rgba(245, 158, 11, 0.15)',
                        borderColor:
                          item.payoutStatus === 'Paid' ? '#10B981' : '#F59E0B',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.payoutBadgeText,
                        { color: item.payoutStatus === 'Paid' ? colors.success || '#10B981' : '#D97706' },
                      ]}
                    >
                      PAYOUT: {item.payoutStatus.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Counterparties: Customer & Provider */}
                <View
                  style={[
                    styles.counterpartyBox,
                    { backgroundColor: colors.surfaceVariant, borderRadius: borderRadius.sm },
                  ]}
                >
                  <View style={styles.partyRow}>
                    <Text style={[styles.partyLabel, { color: colors.textSecondary }]}>Customer:</Text>
                    <Text style={[styles.partyVal, { color: colors.textPrimary, fontWeight: '700' }]}>
                      👤 {item.customerName}
                    </Text>
                  </View>
                  <View style={[styles.partyRow, { borderBottomWidth: 0 }]}>
                    <Text style={[styles.partyLabel, { color: colors.textSecondary }]}>Host / Provider:</Text>
                    <Text style={[styles.partyVal, { color: colors.secondary, fontWeight: '700' }]}>
                      🏢 {item.providerName}
                    </Text>
                  </View>
                </View>

                {/* Financial Breakdown Table */}
                <View style={styles.finGrid}>
                  <View style={styles.finCol}>
                    <Text style={[styles.finLabel, { color: colors.textMuted }]}>Rental Amount</Text>
                    <Text style={[styles.finVal, { color: colors.textPrimary }]}>
                      ${item.rentalAmount.toFixed(2)}
                    </Text>
                  </View>

                  <View style={styles.finCol}>
                    <Text style={[styles.finLabel, { color: colors.textMuted }]}>Platform Fee</Text>
                    <Text style={[styles.finVal, { color: colors.primary, fontWeight: '700' }]}>
                      +${item.platformCommission.toFixed(2)}
                    </Text>
                  </View>

                  <View style={styles.finCol}>
                    <Text style={[styles.finLabel, { color: colors.textMuted }]}>Host Payout</Text>
                    <Text style={[styles.finVal, { color: colors.secondary, fontWeight: '800' }]}>
                      ${item.providerPayout.toFixed(2)}
                    </Text>
                  </View>
                </View>

                {/* Deposit & Refund Row */}
                <View style={styles.depositRow}>
                  <Text style={[styles.depositText, { color: colors.textSecondary }]}>
                    Security Deposit: <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>${item.securityDeposit}</Text>
                  </Text>
                  <View
                    style={[
                      styles.refundBadge,
                      { backgroundColor: refundBadge.bg, borderColor: refundBadge.border },
                    ]}
                  >
                    <Text style={[styles.refundBadgeText, { color: refundBadge.text }]}>
                      {item.refundStatus.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Financial Actions */}
                <View style={[styles.actionRow, { borderTopColor: colors.border }]}>
                  {item.payoutStatus !== 'Paid' && (
                    <Button
                      title="Disburse Payout"
                      variant="primary"
                      size="small"
                      onPress={() => handleReleasePayout(item)}
                      style={styles.actionBtn}
                    />
                  )}

                  {item.refundStatus === 'Held' && (
                    <Button
                      title="Refund Deposit"
                      variant="secondary"
                      size="small"
                      onPress={() => handleProcessRefund(item)}
                      style={styles.actionBtn}
                    />
                  )}
                </View>
              </Card>
            );
          })
        )}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 40,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  summaryCard: {
    flexBasis: '47%',
    flexGrow: 1,
    borderWidth: 1,
    minHeight: 76,
    justifyContent: 'center',
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  searchContainer: {
    marginBottom: 12,
  },
  sectionHeading: {
    letterSpacing: -0.2,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  paymentCard: {
    marginBottom: 14,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bookingTag: {
    letterSpacing: 0.5,
  },
  vehicleName: {
    fontWeight: '500',
  },
  payoutBadge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  payoutBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  counterpartyBox: {
    padding: 8,
    marginTop: 10,
    marginBottom: 10,
  },
  partyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(148, 163, 184, 0.15)',
  },
  partyLabel: {
    fontSize: 11,
  },
  partyVal: {
    fontSize: 11,
  },
  finGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    marginBottom: 6,
  },
  finCol: {
    flex: 1,
    alignItems: 'center',
  },
  finLabel: {
    fontSize: 9,
  },
  finVal: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  depositRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    marginBottom: 8,
  },
  depositText: {
    fontSize: 11,
  },
  refundBadge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  refundBadgeText: {
    fontSize: 8,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 0.5,
  },
  actionBtn: {
    flex: 1,
  },
});
