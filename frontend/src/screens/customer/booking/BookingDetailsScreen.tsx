import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList, Booking } from '../../../types';
import { useTheme } from '../../../theme';
import { useBooking } from '../../../context/BookingContext';
import { bookingService } from '../../../services/bookingService';
import { ScreenContainer, Header, Card, Button, Loading, EmptyState } from '../../../components/common';

type BookingDetailsNavProp = NativeStackNavigationProp<
  CustomerStackParamList,
  'BookingDetails'
>;
type BookingDetailsRouteProp = RouteProp<CustomerStackParamList, 'BookingDetails'>;

interface BookingDetailsProps {
  navigation: BookingDetailsNavProp;
  route: BookingDetailsRouteProp;
}

export const BookingDetailsScreen: React.FC<BookingDetailsProps> = ({
  navigation,
  route,
}) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { bookingId } = route.params;
  const { cancelBooking } = useBooking();

  const [booking, setBooking] = useState<Booking | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const fetchDetails = async () => {
    try {
      const b = await bookingService.getBookingById(bookingId);
      setBooking(b);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [bookingId]);

  if (loading) {
    return <Loading fullScreen message="Loading reservation voucher..." />;
  }

  if (!booking) {
    return (
      <ScreenContainer
        header={
          <Header
            title="Booking Voucher"
            showBack
            onBackPress={() => navigation.goBack()}
          />
        }
      >
        <EmptyState
          title="Voucher Not Found"
          message="Could not load details for this booking ID."
          actionTitle="Back to Bookings"
          onAction={() => navigation.navigate('MyBookings')}
        />
      </ScreenContainer>
    );
  }

  const { vehicle, pricing, customer } = booking;
  const canCancel = booking.status === 'Confirmed';

  const handleCancelPress = () => {
    Alert.alert(
      'Cancel Reservation?',
      'Are you sure you want to cancel this booking? Because this is within the 24-hour free cancellation window, a 100% full refund of $' +
        pricing.total +
        ' will be initiated to your ' +
        booking.paymentMethod +
        '.',
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Confirm Cancellation',
          style: 'destructive',
          onPress: async () => {
            await cancelBooking(booking.id);
            await fetchDetails();
            Alert.alert('Booking Cancelled', 'Your reservation was cancelled and the refund process is underway.');
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="Reservation Voucher"
          subtitle={booking.id}
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
          {canCancel ? (
            <Button
              title="Cancel Booking"
              variant="danger"
              size="large"
              onPress={handleCancelPress}
              style={{ flex: 1, marginRight: 8 }}
            />
          ) : null}

          <Button
            title="Return to Home"
            variant="primary"
            size="large"
            onPress={() => navigation.navigate('CustomerHome')}
            style={{ flex: 1, marginLeft: canCancel ? 8 : 0 }}
          />
        </View>
      }
    >
      <ScrollView contentContainerStyle={[styles.content, { padding: spacing.md }]}>
        {/* Digital Ticket Voucher Box */}
        <Card
          variant="elevated"
          padding="large"
          style={[
            styles.voucherCard,
            {
              borderColor: booking.status === 'Confirmed' ? colors.primary : colors.border,
              backgroundColor: colors.surface,
            },
          ]}
        >
          <View style={styles.voucherTopRow}>
            <View>
              <Text style={{ color: colors.textMuted, fontSize: 10, fontWeight: '700' }}>
                DIGITAL KEYLESS VOUCHER
              </Text>
              <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.lg, fontWeight: '800' }}>
                {booking.id}
              </Text>
            </View>

            <View
              style={[
                styles.statusPill,
                {
                  backgroundColor:
                    booking.status === 'Confirmed'
                      ? 'rgba(0, 229, 255, 0.15)'
                      : booking.status === 'Active'
                      ? 'rgba(16, 185, 129, 0.15)'
                      : colors.surfaceVariant,
                  borderColor:
                    booking.status === 'Confirmed'
                      ? colors.primary
                      : booking.status === 'Active'
                      ? colors.accent
                      : colors.border,
                  borderRadius: borderRadius.xs,
                },
              ]}
            >
              <Text
                style={{
                  color:
                    booking.status === 'Confirmed'
                      ? colors.primary
                      : booking.status === 'Active'
                      ? colors.accent
                      : colors.textSecondary,
                  fontSize: 10,
                  fontWeight: '800',
                }}
              >
                ● {booking.status.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Digital PIN Highlight */}
          <View
            style={[
              styles.pinBox,
              {
                backgroundColor: 'rgba(0, 229, 255, 0.08)',
                borderColor: colors.primary,
                borderRadius: borderRadius.md,
                marginTop: spacing.md,
              },
            ]}
          >
            <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '700' }}>
              🔑 DIGITAL SMART PIN
            </Text>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: typography.fontSizes.xxl,
                fontWeight: '900',
                letterSpacing: 4,
                marginTop: 2,
              }}
            >
              {booking.pickupCode}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 2 }}>
              Present this PIN or enter it on the vehicle console for smart unlocking.
            </Text>
          </View>

          {/* Barcode representation */}
          <View style={[styles.barcodeBox, { backgroundColor: colors.surfaceVariant, borderRadius: borderRadius.sm, marginTop: spacing.md }]}>
            <Text style={{ letterSpacing: 6, color: colors.textPrimary, fontSize: 16, fontWeight: '900' }}>
              ||| | |||| || | ||| |||| | |||
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 4 }}>
              AUTH-TOKEN: {booking.id}-TOKENIZED
            </Text>
          </View>
        </Card>

        {/* Vehicle Specs */}
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
          Vehicle Details
        </Text>

        <Card
          variant="elevated"
          padding="small"
          style={[styles.vehicleCard, { borderColor: colors.border }]}
        >
          <Image
            source={{ uri: vehicle.image }}
            style={[styles.vehicleThumb, { borderRadius: borderRadius.md }]}
            resizeMode="cover"
          />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '800' }}>
              {vehicle.category.toUpperCase()} CLASS
            </Text>
            <Text
              numberOfLines={1}
              style={{
                color: colors.textPrimary,
                fontSize: typography.fontSizes.md,
                fontWeight: '700',
                marginVertical: 2,
              }}
            >
              {vehicle.brand} {vehicle.model}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs }}>
              {vehicle.year} · {vehicle.transmission} · {vehicle.fuel} · {vehicle.seats} Seats
            </Text>
          </View>
        </Card>

        {/* Itinerary */}
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
          Schedule & Mobility Hub
        </Text>

        <Card variant="elevated" padding="medium" style={{ borderColor: colors.border }}>
          <View style={styles.detailRow}>
            <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs }}>Pickup Date & Time</Text>
            <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.xs + 1, fontWeight: '700' }}>
              {booking.pickupDate} at {booking.pickupTime}
            </Text>
          </View>

          <View style={[styles.detailRow, { marginTop: 8 }]}>
            <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs }}>Return Date & Time</Text>
            <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.xs + 1, fontWeight: '700' }}>
              {booking.returnDate} at {booking.returnTime}
            </Text>
          </View>

          <View style={[styles.detailRow, { marginTop: 8 }]}>
            <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs }}>Total Duration</Text>
            <Text style={{ color: colors.primary, fontSize: typography.fontSizes.xs + 1, fontWeight: '700' }}>
              {booking.rentalDays} Days
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: 10 }]} />

          <View style={styles.detailRow}>
            <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs }}>Pickup Location</Text>
            <Text
              numberOfLines={1}
              style={{
                color: colors.textPrimary,
                fontSize: typography.fontSizes.xs + 1,
                fontWeight: '600',
                maxWidth: '60%',
                textAlign: 'right',
              }}
            >
              📍 {booking.pickupLocation}
            </Text>
          </View>

          <View style={[styles.detailRow, { marginTop: 8 }]}>
            <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs }}>Return Location</Text>
            <Text
              numberOfLines={1}
              style={{
                color: colors.textPrimary,
                fontSize: typography.fontSizes.xs + 1,
                fontWeight: '600',
                maxWidth: '60%',
                textAlign: 'right',
              }}
            >
              📍 {booking.returnLocation}
            </Text>
          </View>
        </Card>

        {/* Pricing & Payment Receipt */}
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
          Receipt & Payment Details
        </Text>

        <Card variant="elevated" padding="medium" style={{ borderColor: colors.border }}>
          <View style={styles.detailRow}>
            <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs }}>Payment Method</Text>
            <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.xs + 1, fontWeight: '700' }}>
              {booking.paymentMethod}
            </Text>
          </View>

          <View style={[styles.detailRow, { marginTop: 8 }]}>
            <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs }}>Payment Status</Text>
            <Text style={{ color: colors.accent, fontSize: typography.fontSizes.xs + 1, fontWeight: '800' }}>
              ✓ {booking.paymentStatus.toUpperCase()}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: 10 }]} />

          <View style={styles.detailRow}>
            <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs }}>Rental Subtotal</Text>
            <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.xs, fontWeight: '600' }}>
              ${pricing.subtotal}
            </Text>
          </View>

          <View style={[styles.detailRow, { marginTop: 6 }]}>
            <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs }}>Platform Service Fee</Text>
            <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.xs, fontWeight: '600' }}>
              ${pricing.serviceFee}
            </Text>
          </View>

          <View style={[styles.detailRow, { marginTop: 6 }]}>
            <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs }}>Sales Tax</Text>
            <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.xs, fontWeight: '600' }}>
              ${pricing.taxes}
            </Text>
          </View>

          <View style={[styles.detailRow, { marginTop: 6 }]}>
            <Text style={{ color: colors.accent, fontSize: typography.fontSizes.xs, fontWeight: '600' }}>
              Refundable Security Deposit
            </Text>
            <Text style={{ color: colors.accent, fontSize: typography.fontSizes.xs, fontWeight: '700' }}>
              ${pricing.securityDeposit}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: 10 }]} />

          <View style={styles.detailRow}>
            <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.md, fontWeight: '800' }}>
              Total Paid
            </Text>
            <Text style={{ color: colors.primary, fontSize: typography.fontSizes.lg, fontWeight: '800' }}>
              ${pricing.total}
            </Text>
          </View>
        </Card>

        {/* Driver Details */}
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
          Driver Profile
        </Text>

        <Card variant="elevated" padding="medium" style={{ borderColor: colors.border }}>
          <View style={styles.detailRow}>
            <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs }}>Driver Name</Text>
            <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.xs + 1, fontWeight: '600' }}>
              {customer.fullName}
            </Text>
          </View>

          <View style={[styles.detailRow, { marginTop: 6 }]}>
            <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs }}>Phone</Text>
            <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.xs + 1, fontWeight: '600' }}>
              {customer.phone}
            </Text>
          </View>

          <View style={[styles.detailRow, { marginTop: 6 }]}>
            <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs }}>Email</Text>
            <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.xs + 1, fontWeight: '600' }}>
              {customer.email}
            </Text>
          </View>

          <View style={[styles.detailRow, { marginTop: 6 }]}>
            <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs }}>License ID</Text>
            <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.xs + 1, fontWeight: '600' }}>
              {customer.licenseNumber}
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
  voucherCard: {
    borderWidth: 1.5,
  },
  voucherTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
  },
  pinBox: {
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  barcodeBox: {
    padding: 12,
    alignItems: 'center',
  },
  sectionTitle: {
    letterSpacing: -0.2,
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  vehicleThumb: {
    width: 80,
    height: 60,
    backgroundColor: '#0F172A',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    height: 1,
  },
  footerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
  },
});
