import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList, BookingInvoice, Booking } from '../../types';
import { useTheme } from '../../theme';
import { useBooking } from '../../context/BookingContext';
import { bookingService } from '../../services/bookingService';
import { ScreenContainer, Header, Card, Button, Loading, EmptyState } from '../../components/common';

type FinalInvoiceNavProp = NativeStackNavigationProp<
  CustomerStackParamList,
  'FinalInvoice'
>;
type FinalInvoiceRouteProp = RouteProp<CustomerStackParamList, 'FinalInvoice'>;

interface FinalInvoiceProps {
  navigation: FinalInvoiceNavProp;
  route: FinalInvoiceRouteProp;
}

export const FinalInvoiceScreen: React.FC<FinalInvoiceProps> = ({
  navigation,
  route,
}) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { bookingId } = route.params;
  const { getInvoice } = useBooking();

  const [booking, setBooking] = useState<Booking | undefined>(undefined);
  const [invoice, setInvoice] = useState<BookingInvoice | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInvoiceData = async () => {
      try {
        const b = await bookingService.getBookingById(bookingId);
        setBooking(b);
        const inv = await getInvoice(bookingId);
        setInvoice(inv);
      } finally {
        setLoading(false);
      }
    };
    loadInvoiceData();
  }, [bookingId, getInvoice]);

  if (loading) {
    return <Loading fullScreen message="Generating official tax invoice..." />;
  }

  if (!booking || !invoice) {
    return (
      <ScreenContainer
        header={
          <Header
            title="Final Invoice"
            showBack
            onBackPress={() => navigation.goBack()}
          />
        }
      >
        <EmptyState
          title="Invoice Unavailable"
          message="Could not generate or locate the invoice for this booking."
          actionTitle="Back to Bookings"
          onAction={() => navigation.navigate('MyBookings')}
        />
      </ScreenContainer>
    );
  }

  const { vehicle, customer } = booking;

  const handleDownloadPDF = () => {
    Alert.alert(
      'Receipt Downloaded',
      `Tax invoice ${invoice.invoiceNumber}.pdf has been saved to your downloads folder.`
    );
  };

  const handleShare = () => {
    Alert.alert(
      'Share Receipt',
      `Secure invoice link for ${invoice.invoiceNumber} copied to clipboard.`
    );
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="Final Tax Invoice"
          subtitle={invoice.invoiceNumber}
          showBack
          onBackPress={() => navigation.goBack()}
          rightElement={
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleShare}
              style={[
                styles.shareBtn,
                {
                  backgroundColor: colors.surfaceVariant,
                  borderColor: colors.border,
                  borderRadius: borderRadius.md,
                },
              ]}
            >
              <Text style={{ fontSize: 16 }}>📤</Text>
            </TouchableOpacity>
          }
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
            title="Download PDF"
            variant="secondary"
            size="large"
            onPress={handleDownloadPDF}
            style={{ flex: 1, marginRight: 8 }}
          />

          <Button
            title="My Bookings"
            variant="primary"
            size="large"
            onPress={() => navigation.navigate('MyBookings', { initialTab: 'completed' })}
            style={{ flex: 1 }}
          />
        </View>
      }
    >
      <ScrollView contentContainerStyle={[styles.content, { padding: spacing.md }]}>
        {/* Invoice Header Card */}
        <Card
          variant="elevated"
          padding="large"
          style={[
            styles.invoiceHeaderCard,
            {
              borderColor: colors.primary,
              backgroundColor: colors.surface,
              borderRadius: borderRadius.lg,
            },
          ]}
        >
          <View style={styles.brandRow}>
            <View>
              <Text
                style={{
                  color: colors.primary,
                  fontSize: typography.fontSizes.xl,
                  fontWeight: typography.fontWeights.heavy,
                  letterSpacing: 1,
                }}
              >
                VELOX MOBILITY
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 2 }}>
                TAX REG: VLX-PK-98234-GST
              </Text>
            </View>

            <View
              style={[
                styles.paidBadge,
                {
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  borderColor: colors.accent,
                  borderRadius: borderRadius.xs,
                },
              ]}
            >
              <Text style={{ color: colors.accent, fontSize: 10, fontWeight: '800' }}>
                ✓ {invoice.paymentStatus.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: spacing.md }]} />

          <View style={styles.metaRow}>
            <View>
              <Text style={{ color: colors.textMuted, fontSize: 10, fontWeight: '700' }}>
                INVOICE NUMBER
              </Text>
              <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.sm, fontWeight: '700' }}>
                {invoice.invoiceNumber}
              </Text>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: colors.textMuted, fontSize: 10, fontWeight: '700' }}>
                ISSUE DATE
              </Text>
              <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.sm, fontWeight: '700' }}>
                {new Date(invoice.issuedAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </Card>

        {/* Bill To & Vehicle Details */}
        <Card
          variant="elevated"
          padding="medium"
          style={{
            borderColor: colors.border,
            borderRadius: borderRadius.md,
            marginTop: spacing.md,
          }}
        >
          <Text style={{ color: colors.textMuted, fontSize: 10, fontWeight: '700', marginBottom: 4 }}>
            BILLED TO
          </Text>
          <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.sm, fontWeight: '700' }}>
            {customer.fullName}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs, marginTop: 2 }}>
            {customer.phone} · {customer.email}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs - 1, marginTop: 2 }}>
            License ID: {customer.licenseNumber}
          </Text>

          <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: spacing.sm + 2 }]} />

          <Text style={{ color: colors.textMuted, fontSize: 10, fontWeight: '700', marginBottom: 4 }}>
            VEHICLE & TRIP
          </Text>
          <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.sm, fontWeight: '700' }}>
            {vehicle.brand} {vehicle.model} ({vehicle.year})
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs, marginTop: 2 }}>
            Duration: {booking.rentalDays} Days · {booking.pickupDate} to {booking.returnDate}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs - 1, marginTop: 2 }}>
            Pickup: {booking.pickupLocation} · Return: {booking.returnLocation}
          </Text>
        </Card>

        {/* Itemized Calculations Breakdown */}
        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.textPrimary,
              fontSize: typography.fontSizes.md,
              fontWeight: typography.fontWeights.bold,
              marginTop: spacing.lg,
              marginBottom: spacing.xs,
            },
          ]}
        >
          Itemized Charges & Adjustments
        </Text>

        <Card variant="elevated" padding="medium" style={{ borderColor: colors.border, borderRadius: borderRadius.md }}>
          {/* Base Rental */}
          <View style={styles.lineItem}>
            <View>
              <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.xs + 1, fontWeight: '600' }}>
                Base Vehicle Rental
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 10 }}>
                {booking.rentalDays} days @ ${booking.pricing.dailyPrice}/day
              </Text>
            </View>
            <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.sm, fontWeight: '700' }}>
              ${invoice.baseRental}
            </Text>
          </View>

          {/* Service Fee */}
          <View style={[styles.lineItem, { marginTop: 10 }]}>
            <View>
              <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.xs + 1, fontWeight: '600' }}>
                Platform & Roadside Service Fee
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 10 }}>
                10% standard fleet operational fee
              </Text>
            </View>
            <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.sm, fontWeight: '700' }}>
              ${invoice.serviceFee}
            </Text>
          </View>

          {/* Taxes */}
          <View style={[styles.lineItem, { marginTop: 10 }]}>
            <View>
              <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.xs + 1, fontWeight: '600' }}>
                Provincial Sales Tax (GST)
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 10 }}>
                5% government sales tax
              </Text>
            </View>
            <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.sm, fontWeight: '700' }}>
              ${invoice.taxes}
            </Text>
          </View>

          {/* Security Deposit Paid */}
          <View style={[styles.lineItem, { marginTop: 10 }]}>
            <View>
              <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs + 1, fontWeight: '600' }}>
                Security Deposit (Pre-authorized)
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 10 }}>
                Held during trip duration
              </Text>
            </View>
            <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.sm, fontWeight: '600' }}>
              ${invoice.securityDeposit}
            </Text>
          </View>

          {/* Late Charges */}
          <View style={[styles.lineItem, { marginTop: 10 }]}>
            <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs + 1, fontWeight: '600' }}>
              Late Return Charges
            </Text>
            <Text
              style={{
                color: invoice.lateCharges > 0 ? colors.danger : colors.textMuted,
                fontSize: typography.fontSizes.sm,
                fontWeight: '700',
              }}
            >
              ${invoice.lateCharges}
            </Text>
          </View>

          {/* Damage / Detailing Charges */}
          <View style={[styles.lineItem, { marginTop: 10 }]}>
            <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs + 1, fontWeight: '600' }}>
              Damage & Incidentals
            </Text>
            <Text
              style={{
                color: invoice.damageCharges > 0 ? colors.danger : colors.textMuted,
                fontSize: typography.fontSizes.sm,
                fontWeight: '700',
              }}
            >
              ${invoice.damageCharges}
            </Text>
          </View>

          {/* Deposit Refund */}
          <View style={[styles.lineItem, { marginTop: 10 }]}>
            <View>
              <Text style={{ color: colors.accent, fontSize: typography.fontSizes.xs + 1, fontWeight: '700' }}>
                Deposit Refund Initiated
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 10 }}>
                Returned to {booking.paymentMethod}
              </Text>
            </View>
            <Text style={{ color: colors.accent, fontSize: typography.fontSizes.sm, fontWeight: '800' }}>
              -${invoice.depositRefund}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: 12 }]} />

          {/* Final Amount */}
          <View style={styles.lineItem}>
            <View>
              <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.md, fontWeight: '800' }}>
                Final Net Billed
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 10 }}>
                Paid via {booking.paymentMethod}
              </Text>
            </View>
            <Text
              style={{
                color: colors.primary,
                fontSize: typography.fontSizes.xl,
                fontWeight: typography.fontWeights.heavy,
              }}
            >
              ${invoice.finalAmount}
            </Text>
          </View>
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
  },
  shareBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  invoiceHeaderCard: {
    borderWidth: 1.5,
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  paidBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
  },
  divider: {
    height: 1,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    letterSpacing: -0.2,
  },
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
  },
});
