import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { BookingStatus, ProviderStackParamList } from '../../types';
import { useTheme } from '../../theme';
import { useBooking } from '../../context/BookingContext';
import { ScreenContainer, Header, Card, Button } from '../../components/common';

type ProviderBookingDetailsNavProp = NativeStackNavigationProp<
  ProviderStackParamList,
  'ProviderBookingDetails'
>;
type ProviderBookingDetailsRouteProp = RouteProp<
  ProviderStackParamList,
  'ProviderBookingDetails'
>;

interface Props {
  navigation: ProviderBookingDetailsNavProp;
  route: ProviderBookingDetailsRouteProp;
}

const LIFECYCLE_STEPS: BookingStatus[] = ['Pending', 'Confirmed', 'Active', 'Completed'];

export const ProviderBookingDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { bookingId } = route.params;
  const {
    bookings,
    approveBooking,
    rejectBooking,
    markReady,
    startRental,
    completeRental,
  } = useBooking();

  const booking = bookings.find(b => b.id === bookingId);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!booking) {
    return (
      <ScreenContainer
        header={<Header title="Booking Not Found" showBack onBackPress={() => navigation.goBack()} />}
      >
        <View style={{ padding: spacing.xl, alignItems: 'center' }}>
          <Text style={{ color: colors.textSecondary }}>
            Booking with reference {bookingId} not found.
          </Text>
          <Button title="Back" onPress={() => navigation.goBack()} style={{ marginTop: spacing.md }} />
        </View>
      </ScreenContainer>
    );
  }

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'Active':
        return colors.primary;
      case 'Confirmed':
        return colors.accent;
      case 'Pending':
        return colors.warning;
      case 'Completed':
        return '#3B82F6';
      case 'Cancelled':
      default:
        return colors.danger;
    }
  };

  const statusColor = getStatusColor(booking.status);
  const currentStepIndex = LIFECYCLE_STEPS.indexOf(booking.status);

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await approveBooking(booking.id);
      Alert.alert('Booking Approved', 'Customer notification dispatched; booking confirmed.');
    } catch (err: any) {
      Alert.alert('Error', err?.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = () => {
    Alert.alert(
      'Reject Booking',
      `Are you sure you want to reject this reservation for ${booking.customer.fullName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject Booking',
          style: 'destructive',
          onPress: async () => {
            setIsProcessing(true);
            try {
              await rejectBooking(booking.id, 'Schedule unavailable');
              Alert.alert('Booking Rejected', 'Reservation cancelled.');
            } catch (err: any) {
              Alert.alert('Error', err?.message);
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  const handleMarkReady = async () => {
    setIsProcessing(true);
    try {
      await markReady(booking.id);
      Alert.alert('Vehicle Prepped', 'Marked ready for customer arrival.');
    } catch (err: any) {
      Alert.alert('Error', err?.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartRental = async () => {
    setIsProcessing(true);
    try {
      await startRental(booking.id);
      Alert.alert(
        'Rental Activated',
        'Customer car key activated. Trip started; vehicle marked Active Rental.'
      );
    } catch (err: any) {
      Alert.alert('Error', err?.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompleteRental = async () => {
    Alert.alert(
      'Complete Return & Finalize',
      'Confirm vehicle dropoff check and generate final customer receipt?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete Rental',
          onPress: async () => {
            setIsProcessing(true);
            try {
              await completeRental(booking.id);
              Alert.alert('Rental Completed', 'Vehicle returned to Available inventory and invoice issued.');
            } catch (err: any) {
              Alert.alert('Error', err?.message);
            } finally {
              setIsProcessing(false);
            }
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
          title={booking.id}
          subtitle={`Status: ${booking.status}`}
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
          {booking.status === 'Pending' ? (
            <View style={styles.footerBtnRow}>
              <Button
                title="Reject"
                variant="danger"
                size="large"
                style={{ flex: 1 }}
                loading={isProcessing}
                onPress={handleReject}
              />
              <Button
                title="Approve Booking"
                variant="primary"
                size="large"
                style={{ flex: 2 }}
                loading={isProcessing}
                onPress={handleApprove}
              />
            </View>
          ) : booking.status === 'Confirmed' ? (
            <View style={styles.footerBtnRow}>
              <Button
                title="Mark Ready"
                variant="secondary"
                size="large"
                style={{ flex: 1 }}
                loading={isProcessing}
                onPress={handleMarkReady}
              />
              <Button
                title="Start Rental"
                variant="primary"
                size="large"
                style={{ flex: 1.5 }}
                loading={isProcessing}
                onPress={handleStartRental}
              />
            </View>
          ) : booking.status === 'Active' ? (
            <Button
              title="Complete Rental & Return"
              variant="primary"
              size="large"
              fullWidth
              loading={isProcessing}
              onPress={handleCompleteRental}
            />
          ) : (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.sm }}>
                This booking is {booking.status.toLowerCase()}. No further actions required.
              </Text>
            </View>
          )}
        </View>
      }
    >
      <View style={[styles.content, { padding: spacing.md }]}>
        {/* Status Stepper Progression */}
        {booking.status !== 'Cancelled' ? (
          <Card variant="flat" padding="medium" style={styles.stepperCard}>
            <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '700', marginBottom: 8 }}>
              RESERVATION LIFECYCLE PROGRESSION
            </Text>
            <View style={styles.stepperRow}>
              {LIFECYCLE_STEPS.map((step, idx) => {
                const isPassed = currentStepIndex >= idx;
                const isCurrent = booking.status === step;
                return (
                  <React.Fragment key={step}>
                    <View style={styles.stepItem}>
                      <View
                        style={[
                          styles.stepCircle,
                          {
                            backgroundColor: isPassed ? colors.primary : colors.surfaceVariant,
                            borderColor: isCurrent ? colors.primary : colors.border,
                            borderWidth: isCurrent ? 2 : 1,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            color: isPassed ? colors.textInverse : colors.textMuted,
                            fontSize: 10,
                            fontWeight: '800',
                          }}
                        >
                          {idx + 1}
                        </Text>
                      </View>
                      <Text
                        style={{
                          color: isCurrent ? colors.textPrimary : colors.textMuted,
                          fontSize: 10,
                          fontWeight: isCurrent ? '800' : '500',
                          marginTop: 4,
                        }}
                      >
                        {step}
                      </Text>
                    </View>
                    {idx < LIFECYCLE_STEPS.length - 1 ? (
                      <View
                        style={[
                          styles.stepLine,
                          { backgroundColor: currentStepIndex > idx ? colors.primary : colors.border },
                        ]}
                      />
                    ) : null}
                  </React.Fragment>
                );
              })}
            </View>
          </Card>
        ) : (
          <Card
            variant="flat"
            padding="medium"
            style={[styles.cancelledBanner, { borderColor: colors.danger, marginBottom: spacing.md }]}
          >
            <Text style={{ color: colors.danger, fontWeight: '700' }}>⚠️ Reservation Cancelled</Text>
            <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs, marginTop: 4 }}>
              This reservation was cancelled and released from fleet scheduling.
            </Text>
          </Card>
        )}

        {/* Customer Information Card */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: typography.fontSizes.md }]}>
          Customer Details
        </Text>

        <Card variant="elevated" padding="medium" style={styles.sectionCard}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Full Name</Text>
            <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{booking.customer.fullName}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Contact Phone</Text>
            <Text style={[styles.detailValue, { color: colors.primary }]}>{booking.customer.phone}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Email Address</Text>
            <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{booking.customer.email}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Driving License</Text>
            <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{booking.customer.licenseNumber}</Text>
          </View>
          {booking.customer.notes ? (
            <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Special Notes</Text>
              <Text style={[styles.detailValue, { color: colors.warning }]}>{booking.customer.notes}</Text>
            </View>
          ) : null}
        </Card>

        {/* Vehicle Information */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: typography.fontSizes.md, marginTop: spacing.md }]}>
          Reserved Vehicle
        </Text>

        <Card variant="elevated" padding="medium" style={styles.sectionCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image source={{ uri: booking.vehicle.image }} style={styles.vehicleThumb} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.md, fontWeight: '700' }}>
                {booking.vehicle.brand} {booking.vehicle.model}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs, marginTop: 2 }}>
                {booking.vehicle.year} • {booking.vehicle.category} • {booking.vehicle.transmission}
              </Text>
              <Text style={{ color: colors.primary, fontSize: typography.fontSizes.sm, fontWeight: '800', marginTop: 4 }}>
                ${booking.pricing.dailyPrice} / day
              </Text>
            </View>
          </View>
        </Card>

        {/* Schedule & Routing */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: typography.fontSizes.md, marginTop: spacing.md }]}>
          Rental Schedule & Locations
        </Text>

        <Card variant="elevated" padding="medium" style={styles.sectionCard}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Pickup Date & Time</Text>
            <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
              {booking.pickupDate} at {booking.pickupTime}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Pickup Location</Text>
            <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{booking.pickupLocation}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Return Date & Time</Text>
            <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
              {booking.returnDate} at {booking.returnTime}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Return Location</Text>
            <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{booking.returnLocation}</Text>
          </View>
          <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Rental Duration</Text>
            <Text style={[styles.detailValue, { color: colors.primary, fontWeight: '800' }]}>
              {booking.rentalDays} Days
            </Text>
          </View>
        </Card>

        {/* Financial Itemization */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: typography.fontSizes.md, marginTop: spacing.md }]}>
          Financial Breakdown
        </Text>

        <Card variant="elevated" padding="medium" style={styles.sectionCard}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              Base Rental ({booking.rentalDays} days @ ${booking.pricing.dailyPrice})
            </Text>
            <Text style={[styles.detailValue, { color: colors.textPrimary }]}>${booking.pricing.subtotal}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Platform & Roadside Fee</Text>
            <Text style={[styles.detailValue, { color: colors.textPrimary }]}>${booking.pricing.serviceFee}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Taxes & Surcharges</Text>
            <Text style={[styles.detailValue, { color: colors.textPrimary }]}>${booking.pricing.taxes}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Security Deposit (Refundable)</Text>
            <Text style={[styles.detailValue, { color: colors.textPrimary }]}>${booking.pricing.securityDeposit}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Payment Method / Status</Text>
            <Text style={[styles.detailValue, { color: colors.accent, fontWeight: '700' }]}>
              {booking.paymentMethod} • {booking.paymentStatus.toUpperCase()}
            </Text>
          </View>
          <View style={[styles.detailRow, { borderBottomWidth: 0, marginTop: 4 }]}>
            <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.md, fontWeight: '800' }}>
              Total Gross Amount
            </Text>
            <Text style={{ color: colors.primary, fontSize: typography.fontSizes.xl, fontWeight: '800' }}>
              ${booking.pricing.total}
            </Text>
          </View>
        </Card>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
  },
  stepperCard: {
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    marginBottom: 16,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 4,
    marginBottom: 16,
  },
  cancelledBanner: {
    borderWidth: 1,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionCard: {
    borderWidth: 1,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(148, 163, 184, 0.15)',
  },
  detailLabel: {
    fontSize: 12,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 12,
  },
  vehicleThumb: {
    width: 80,
    height: 60,
    borderRadius: 6,
  },
  footerBar: {
    borderTopWidth: 1,
  },
  footerBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
});
