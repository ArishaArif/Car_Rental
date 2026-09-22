import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BillingInvoiceRecord, ProviderStackParamList } from '../../../types';
import { useTheme } from '../../../theme';
import { subscriptionService } from '../../../services/subscriptionService';
import { ScreenContainer, Header, Card, Button } from '../../../components/common';

type BillingHistoryNavProp = NativeStackNavigationProp<
  ProviderStackParamList,
  'BillingHistory'
>;

interface Props {
  navigation: BillingHistoryNavProp;
}

export const BillingHistoryScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const [invoices, setInvoices] = useState<BillingInvoiceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const list = await subscriptionService.getBillingHistory();
        setInvoices(list);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();

    const unsubscribe = subscriptionService.subscribe(async () => {
      const list = await subscriptionService.getBillingHistory();
      setInvoices(list);
    });
    return unsubscribe;
  }, []);

  const handleDownloadInvoice = (invoice: BillingInvoiceRecord) => {
    Alert.alert(
      'Tax Receipt Downloaded',
      `Official VAT invoice receipt ${invoice.invoiceNumber} for $${invoice.amount.toFixed(2)} has been saved to your downloads folder.`
    );
  };

  return (
    <ScreenContainer
      scrollable
      loading={isLoading}
      loadingMessage="Loading billing records..."
      header={
        <Header
          title="Billing History"
          subtitle="Tax receipts, past payments & billing statements"
          showBack
          onBackPress={() => navigation.goBack()}
        />
      }
    >
      <View style={[styles.content, { padding: spacing.md }]}>
        {/* Payment Method Card */}
        <Card variant="elevated" padding="medium" style={styles.paymentMethodCard}>
          <View style={styles.cardRow}>
            <View style={styles.cardIconBox}>
              <Text style={{ fontSize: 22 }}>💳</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                Primary Payment Method
              </Text>
              <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                Visa ending in •••• 4242 (Renews automatically)
              </Text>
            </View>
            <Button
              title="Edit"
              variant="outline"
              size="small"
              onPress={() => Alert.alert('Payment Method', 'Card update is locked in prototype mode.')}
            />
          </View>
        </Card>

        {/* Invoices List */}
        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.textPrimary,
              fontSize: typography.fontSizes.md,
              fontWeight: typography.fontWeights.bold,
              marginTop: spacing.md,
              marginBottom: 10,
            },
          ]}
        >
          Statement Records ({invoices.length})
        </Text>

        {invoices.length === 0 ? (
          <Card variant="flat" padding="large" style={styles.emptyCard}>
            <Text style={{ fontSize: 32, textAlign: 'center' }}>🧾</Text>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: typography.fontSizes.md,
                fontWeight: '700',
                textAlign: 'center',
                marginTop: 8,
              }}
            >
              No Invoices Generated Yet
            </Text>
          </Card>
        ) : (
          invoices.map(invoice => (
            <Card
              key={invoice.id}
              variant="elevated"
              padding="medium"
              style={styles.invoiceCard}
            >
              <View style={styles.invoiceHeader}>
                <View>
                  <Text
                    style={[
                      styles.invoiceNumber,
                      { color: colors.primary, fontSize: typography.fontSizes.sm, fontWeight: '800' },
                    ]}
                  >
                    {invoice.invoiceNumber}
                  </Text>
                  <Text style={[styles.invoiceDate, { color: colors.textSecondary }]}>
                    Issued on {invoice.date}
                  </Text>
                </View>

                <View
                  style={[
                    styles.paidBadge,
                    {
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      borderColor: '#10B981',
                      borderRadius: borderRadius.xs,
                    },
                  ]}
                >
                  <Text style={[styles.paidText, { color: colors.success || '#10B981' }]}>
                    PAID
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.invoiceDetails,
                  { backgroundColor: colors.surfaceVariant, borderRadius: borderRadius.sm },
                ]}
              >
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Plan Tier:</Text>
                  <Text style={[styles.detailVal, { color: colors.textPrimary, fontWeight: '700' }]}>
                    {invoice.planName} ({invoice.billingCycle})
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Payment Instrument:</Text>
                  <Text style={[styles.detailVal, { color: colors.textPrimary }]}>
                    {invoice.paymentMethod}
                  </Text>
                </View>

                <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Total Charged:</Text>
                  <Text style={[styles.detailVal, { color: colors.success || '#10B981', fontWeight: '800' }]}>
                    ${invoice.amount.toFixed(2)} USD
                  </Text>
                </View>
              </View>

              <View style={styles.actionRow}>
                <Button
                  title="Download Receipt PDF"
                  variant="outline"
                  size="small"
                  fullWidth
                  onPress={() => handleDownloadInvoice(invoice)}
                />
              </View>
            </Card>
          ))
        )}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 40,
  },
  paymentMethodCard: {
    borderWidth: 1,
    marginBottom: 8,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIconBox: {
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  sectionTitle: {
    letterSpacing: -0.2,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  invoiceCard: {
    marginBottom: 12,
    borderWidth: 1,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  invoiceNumber: {
    letterSpacing: 0.3,
  },
  invoiceDate: {
    fontSize: 11,
    marginTop: 2,
  },
  paidBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  paidText: {
    fontSize: 9,
    fontWeight: '800',
  },
  invoiceDetails: {
    padding: 8,
    marginTop: 10,
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(148, 163, 184, 0.15)',
  },
  detailLabel: {
    fontSize: 11,
  },
  detailVal: {
    fontSize: 11,
  },
  actionRow: {
    paddingTop: 4,
  },
});
