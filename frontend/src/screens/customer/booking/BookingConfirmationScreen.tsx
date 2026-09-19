import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList, Booking } from '../../../types';
import { useTheme } from '../../../theme';
import { useBooking } from '../../../context/BookingContext';
import { bookingService } from '../../../services/bookingService';
import { ScreenContainer, Header, Card, Button, Loading, EmptyState } from '../../../components/common';

type BookingConfirmationNavProp = NativeStackNavigationProp<
  CustomerStackParamList,
  'BookingConfirmation'
>;
type BookingConfirmationRouteProp = RouteProp<
  CustomerStackParamList,
  'BookingConfirmation'
>;

interface BookingConfirmationProps {
  navigation: BookingConfirmationNavProp;
  route: BookingConfirmationRouteProp;
}

export const BookingConfirmationScreen: React.FC<BookingConfirmationProps> = ({
  navigation,
  route,
}) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { bookingId } = route.params;
  const { clearDraft } = useBooking();

  const [booking, setBooking] = useState<Booking | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      try {
        const item = await bookingService.getBookingById(bookingId);
        setBooking(item);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [bookingId]);

  if (loading) {
    return <Loading fullScreen message="Finalizing reservation voucher..." />;
  }

  if (!booking) {
    return (
      <ScreenContainer
        header={
          <Header
            title="Confirmation"
            showBack
            onBackPress={() => navigation.navigate('CustomerHome')}
          />
        }
      >
        <EmptyState
          title="Booking Not Found"
          message="Could not locate this booking voucher."
          actionTitle="Go Home"
          onAction={() => navigation.navigate('CustomerHome')}
        />
      </ScreenContainer>
    );
  }

  const { vehicle, pricing, customer } = booking;

  const handleCopyId = () => {
    Alert.alert('Booking ID Copied', `${booking.id} has been copied to your clipboard.`);
  };

  const handleViewBooking = () => {
    navigation.navigate('BookingDetails', { bookingId: booking.id });
  };

  const handleReturnHome = () => {
    clearDraft();
    navigation.navigate('CustomerHome');
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="Booking Confirmation"
          subtitle={booking.id}
          showBack={false}
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
            title="View Booking"
            variant="secondary"
            size="large"
            onPress={handleViewBooking}
            style={{ flex: 1, marginRight: 8 }}
          />
          <Button
            title="Return Home"
            variant="primary"
            size="large"
            onPress={handleReturnHome}
            style={{ flex: 1, marginLeft: 8 }}
          />
        </View>
      }
    >
      <View style={[styles.content, { padding: spacing.md }]}>
        {/* Celebration Banner */}
        <Card
          variant="elevated"
          padding="large"
          style={[
            styles.celebrationCard,
            {
              borderColor: colors.accent,
              backgroundColor: colors.surface,
            },
          ]}
        >
          <View
            style={[
              styles.successCircle,
              {
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                borderColor: colors.accent,
                borderRadius: borderRadius.full,
              },
            ]}
          >
            <Text style={{ fontSize: 32 }}>🎉</Text>
          </View>

          <Text
            style={[
              styles.celebrationTitle,
              {
                color: colors.textPrimary,
                fontSize: typography.fontSizes.xl,
                fontWeight: typography.fontWeights.heavy,
                marginTop: spacing.sm,
              },
            ]}
          >
            Booking Confirmed!
          </Text>

          <Text
            style={{
              color: colors.textSecondary,
              fontSize: typography.fontSizes.xs + 1,
              textAlign: 'center',
              marginTop: 4,
              lineHeight: 18,
            }}
          >
            Your reservation has been confirmed with instant keyless pickup authorization.
          </Text>

          {/* Booking ID Pill */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleCopyId}
            style={[
              styles.bookingIdBox,
              {
                backgroundColor: colors.surfaceVariant,
                borderColor: colors.border,
                borderRadius: borderRadius.md,
                marginTop: spacing.md,
              },
            ]}
          >
            <View>
              <Text style={{ color: colors.textMuted, fontSize: 10, fontWeight: '700' }}>
                RESERVATION REFERENCE NUMBER
              </Text>
              <Text
                style={{
                  color: colors.primary,
                  fontSize: typography.fontSizes.md,
                  fontWeight: '800',
                  marginTop: 2,
                }}
              >
                {booking.id}
              </Text>
            </View>
            <Text style={{ fontSize: 16, marginLeft: 12 }}>📋</Text>
          </TouchableOpacity>

          {/* Keyless Smart PIN */}
          <View
            style={[
              styles.pinBox,
              {
                backgroundColor: 'rgba(0, 229, 255, 0.08)',
                borderColor: colors.primary,
                borderRadius: borderRadius.md,
                marginTop: spacing.sm,
              },
            ]}
          >
            <Text style={{ color: colors.primary, fontSize: typography.fontSizes.xs, fontWeight: '700' }}>
              🔑 DIGITAL UNLOCK SMART PIN
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
              Enter this code at the station kiosk or mobile unlock screen
            </Text>
          </View>
        </Card>

        {/* Vehicle Card */}
        <Text
          style={[
            styles.sectionHeading,
            {
              color: colors.textPrimary,
              fontSize: typography.fontSizes.md,
              fontWeight: typography.fontWeights.bold,
              marginTop: spacing.lg,
              marginBottom: spacing.xs,
            },
          ]}
        >
          Reserved Vehicle
        </Text>

        <Card
          variant="elevated"
          padding="small"
          style={[styles.vehicleRowCard, { borderColor: colors.border }]}
        >
          <Image
            source={{ uri: vehicle.image }}
            style={[styles.vehicleImage, { borderRadius: borderRadius.md }]}
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
              {vehicle.year} · {vehicle.transmission} · {vehicle.fuel}
            </Text>
          </View>
        </Card>

        {/* Rental Details Recap */}
        <Text
          style={[
            styles.sectionHeading,
            {
              color: colors.textPrimary,
              fontSize: typography.fontSizes.md,
              fontWeight: typography.fontWeights.bold,
              marginTop: spacing.lg,
              marginBottom: spacing.xs,
            },
          ]}
        >
          Itinerary & Handover
        </Text>

        <Card
          variant="elevated"
          padding="medium"
          style={[styles.detailsCard, { borderColor: colors.border }]}
        >
          <View style={styles.detailRow}>
            <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs }}>
              Pickup Schedule
            </Text>
            <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.xs + 1, fontWeight: '700' }}>
              {booking.pickupDate} ({booking.pickupTime})
            </Text>
          </View>

          <View style={[styles.detailRow, { marginTop: 8 }]}>
            <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs }}>
              Return Schedule
            </Text>
            <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.xs + 1, fontWeight: '700' }}>
              {booking.returnDate} ({booking.returnTime})
            </Text>
          </View>

          <View style={[styles.detailRow, { marginTop: 8 }]}>
            <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs }}>
              Duration
            </Text>
            <Text style={{ color: colors.primary, fontSize: typography.fontSizes.xs + 1, fontWeight: '700' }}>
              {booking.rentalDays} {booking.rentalDays === 1 ? 'Day' : 'Days'}
            </Text>
          </View>

          <View style={[styles.detailDivider, { backgroundColor: colors.border, marginVertical: 10 }]} />

          <View style={styles.detailRow}>
            <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs }}>
              Pickup Hub
            </Text>
            <Text
              numberOfLines={1}
              style={{
                color: colors.textPrimary,
                fontSize: typography.fontSizes.xs + 1,
                fontWeight: '600',
                maxWidth: '65%',
                textAlign: 'right',
              }}
            >
              📍 {booking.pickupLocation}
            </Text>
          </View>

          <View style={[styles.detailRow, { marginTop: 8 }]}>
            <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs }}>
              Drop-off Hub
            </Text>
            <Text
              numberOfLines={1}
              style={{
                color: colors.textPrimary,
                fontSize: typography.fontSizes.xs + 1,
                fontWeight: '600',
                maxWidth: '65%',
                textAlign: 'right',
              }}
            >
              📍 {booking.returnLocation}
            </Text>
          </View>
        </Card>

        {/* Payment & Receipt Info */}
        <Text
          style={[
            styles.sectionHeading,
            {
              color: colors.textPrimary,
              fontSize: typography.fontSizes.md,
              fontWeight: typography.fontWeights.bold,
              marginTop: spacing.lg,
              marginBottom: spacing.xs,
            },
          ]}
        >
          Payment Information
        </Text>

        <Card
          variant="elevated"
          padding="medium"
          style={[styles.paymentCard, { borderColor: colors.border }]}
        >
          <View style={styles.detailRow}>
            <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs }}>
              Payment Method
            </Text>
            <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.xs + 1, fontWeight: '700' }}>
              {booking.paymentMethod}
            </Text>
          </View>

          <View style={[styles.detailRow, { marginTop: 8 }]}>
            <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs }}>
              Payment Status
            </Text>
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
              <Text style={{ color: colors.accent, fontSize: 11, fontWeight: '800' }}>
                ✓ {booking.paymentStatus.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={[styles.detailRow, { marginTop: 8 }]}>
            <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs }}>
              Total Amount Paid
            </Text>
            <Text
              style={{
                color: colors.primary,
                fontSize: typography.fontSizes.lg,
                fontWeight: typography.fontWeights.heavy,
              }}
            >
              ${pricing.total}
            </Text>
          </View>

          <View style={[styles.detailDivider, { backgroundColor: colors.border, marginVertical: 10 }]} />

          <View style={styles.detailRow}>
            <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs }}>
              Registered Driver
            </Text>
            <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.xs + 1, fontWeight: '600' }}>
              {customer.fullName} ({customer.phone})
            </Text>
          </View>
        </Card>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 28,
  },
  celebrationCard: {
    alignItems: 'center',
    borderWidth: 1.5,
  },
  successCircle: {
    width: 64,
    height: 64,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  celebrationTitle: {
    letterSpacing: -0.4,
  },
  bookingIdBox: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pinBox: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  sectionHeading: {
    letterSpacing: -0.2,
  },
  vehicleRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  vehicleImage: {
    width: 80,
    height: 60,
    backgroundColor: '#0F172A',
  },
  detailsCard: {
    borderWidth: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailDivider: {
    height: 1,
  },
  paymentCard: {
    borderWidth: 1,
  },
  paidBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
  },
  footerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
  },
});
