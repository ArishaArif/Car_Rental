import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList, Vehicle } from '../../../types';
import { useTheme } from '../../../theme';
import { useBooking } from '../../../context/BookingContext';
import { vehicleService } from '../../../services/vehicleService';
import { ScreenContainer, Header, Card, Button, Loading, EmptyState } from '../../../components/common';
import { BookingProgress } from '../../../components/booking';

type CheckAvailabilityNavProp = NativeStackNavigationProp<
  CustomerStackParamList,
  'CheckAvailability'
>;
type CheckAvailabilityRouteProp = RouteProp<CustomerStackParamList, 'CheckAvailability'>;

interface CheckAvailabilityProps {
  navigation: CheckAvailabilityNavProp;
  route: CheckAvailabilityRouteProp;
}

export const CheckAvailabilityScreen: React.FC<CheckAvailabilityProps> = ({
  navigation,
  route,
}) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { vehicleId } = route.params;
  const { draft, initDraft } = useBooking();

  const [vehicle, setVehicle] = useState<Vehicle | undefined>(draft?.vehicle);
  const [loading, setLoading] = useState(!draft || draft.vehicle.id !== vehicleId);

  useEffect(() => {
    const loadVehicle = async () => {
      try {
        const item = await vehicleService.getVehicleById(vehicleId);
        if (item) {
          setVehicle(item);
          initDraft(item);
        }
      } finally {
        setLoading(false);
      }
    };

    if (!vehicle || vehicle.id !== vehicleId) {
      loadVehicle();
    } else {
      initDraft(vehicle);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleId]);

  if (loading) {
    return <Loading fullScreen message="Checking real-time vehicle availability..." />;
  }

  if (!vehicle) {
    return (
      <ScreenContainer
        header={
          <Header
            title="Vehicle Unavailable"
            showBack
            onBackPress={() => navigation.goBack()}
          />
        }
      >
        <EmptyState
          title="Vehicle Not Found"
          message="We could not verify the status of this car. Please choose another vehicle."
          actionTitle="Back to Fleet"
          onAction={() => navigation.goBack()}
        />
      </ScreenContainer>
    );
  }

  const isAvailable = vehicle.availability === 'Available';

  const handleProceedToDates = () => {
    navigation.navigate('RentalDates', { vehicleId: vehicle.id });
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="Check Availability"
          subtitle={`${vehicle.brand} ${vehicle.model}`}
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
          <View style={styles.footerPriceCol}>
            <Text style={[styles.footerLabel, { color: colors.textMuted, fontSize: typography.fontSizes.xs }]}>
              DAILY RATE
            </Text>
            <View style={styles.footerPriceRow}>
              <Text
                style={[
                  styles.footerPrice,
                  {
                    color: colors.primary,
                    fontSize: typography.fontSizes.xl,
                    fontWeight: typography.fontWeights.heavy,
                  },
                ]}
              >
                ${vehicle.pricePerDay}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs }}>
                {' '}/ day
              </Text>
            </View>
          </View>

          <Button
            title={isAvailable ? 'Select Rental Dates →' : 'Vehicle Reserved'}
            variant="primary"
            size="large"
            disabled={!isAvailable}
            onPress={handleProceedToDates}
            style={{ flex: 1, marginLeft: 16 }}
          />
        </View>
      }
    >
      <BookingProgress currentStep="dates" />

      <View style={[styles.content, { padding: spacing.md }]}>
        {/* Vehicle Preview Card */}
        <Card
          variant="elevated"
          padding="none"
          style={[styles.vehicleCard, { borderColor: colors.border }]}
        >
          <Image
            source={{ uri: vehicle.image }}
            style={styles.vehicleImage}
            resizeMode="cover"
          />
          <View style={{ padding: spacing.md }}>
            <View style={styles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.primary, fontSize: typography.fontSizes.xs, fontWeight: '700' }}>
                  {vehicle.category.toUpperCase()} CLASS
                </Text>
                <Text
                  style={[
                    styles.vehicleName,
                    {
                      color: colors.textPrimary,
                      fontSize: typography.fontSizes.lg,
                      fontWeight: typography.fontWeights.bold,
                    },
                  ]}
                >
                  {vehicle.brand} {vehicle.model}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: isAvailable
                      ? 'rgba(16, 185, 129, 0.15)'
                      : 'rgba(239, 68, 68, 0.15)',
                    borderColor: isAvailable ? colors.accent : colors.danger,
                    borderRadius: borderRadius.sm,
                  },
                ]}
              >
                <Text
                  style={{
                    color: isAvailable ? colors.accent : colors.danger,
                    fontSize: typography.fontSizes.xs,
                    fontWeight: '700',
                  }}
                >
                  {isAvailable ? '● AVAILABLE NOW' : '● RESERVED'}
                </Text>
              </View>
            </View>

            {/* Quick Specs */}
            <View style={[styles.specsRow, { marginTop: spacing.sm }]}>
              <Text style={[styles.specItem, { color: colors.textSecondary, fontSize: typography.fontSizes.xs }]}>
                ⚙️ {vehicle.transmission}
              </Text>
              <Text style={[styles.specItem, { color: colors.textSecondary, fontSize: typography.fontSizes.xs }]}>
                ⛽ {vehicle.fuel}
              </Text>
              <Text style={[styles.specItem, { color: colors.textSecondary, fontSize: typography.fontSizes.xs }]}>
                👥 {vehicle.seats} Seats
              </Text>
              <Text style={[styles.specItem, { color: colors.textSecondary, fontSize: typography.fontSizes.xs }]}>
                ★ {vehicle.rating.toFixed(1)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Real-time Status Card */}
        <Card
          variant="flat"
          padding="medium"
          style={[styles.statusCard, { borderColor: colors.border, marginTop: spacing.md }]}
        >
          <View style={styles.statusHeaderRow}>
            <Text style={{ fontSize: 24, marginRight: 10 }}>⚡</Text>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: typography.fontSizes.md,
                  fontWeight: typography.fontWeights.bold,
                }}
              >
                Instant Reservation Confirmed
              </Text>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: typography.fontSizes.xs,
                  marginTop: 2,
                  lineHeight: 18,
                }}
              >
                This vehicle is verified by the Velox Hub host and is ready for immediate booking without manual approval delays.
              </Text>
            </View>
          </View>
        </Card>

        {/* Tentative Schedule Selection Preview */}
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
          Tentative Rental Schedule
        </Text>

        <Card
          variant="elevated"
          padding="medium"
          style={[styles.scheduleCard, { borderColor: colors.border }]}
        >
          <View style={styles.scheduleRow}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs, fontWeight: '600' }}>
                PICKUP
              </Text>
              <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.sm, fontWeight: '700', marginTop: 4 }}>
                {draft?.pickupDate || 'Tomorrow'}
              </Text>
              <Text style={{ color: colors.primary, fontSize: typography.fontSizes.xs, marginTop: 2 }}>
                ⏰ {draft?.pickupTime || '10:00 AM'}
              </Text>
            </View>

            <View style={styles.arrowBox}>
              <Text style={{ color: colors.textMuted, fontSize: 18 }}>→</Text>
              <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs - 2, fontWeight: '700' }}>
                {draft?.rentalDays || 3} DAYS
              </Text>
            </View>

            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs, fontWeight: '600' }}>
                RETURN
              </Text>
              <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.sm, fontWeight: '700', marginTop: 4 }}>
                {draft?.returnDate || 'In 3 Days'}
              </Text>
              <Text style={{ color: colors.primary, fontSize: typography.fontSizes.xs, marginTop: 2 }}>
                ⏰ {draft?.returnTime || '10:00 AM'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleProceedToDates}
            style={[
              styles.changeDatesBtn,
              {
                backgroundColor: colors.surfaceVariant,
                borderColor: colors.primary,
                borderRadius: borderRadius.md,
                marginTop: spacing.md,
              },
            ]}
          >
            <Text style={{ color: colors.primary, fontSize: typography.fontSizes.xs, fontWeight: '700' }}>
              📅 CUSTOMIZE PICKUP & RETURN DATES →
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Protection & Host Guarantee */}
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
          Velox Booking Guarantee
        </Text>

        <View style={styles.perksList}>
          <View style={[styles.perkItem, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md }]}>
            <Text style={styles.perkIcon}>🛡️</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.sm, fontWeight: '700' }}>
                Comprehensive Insurance Included
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs, marginTop: 2 }}>
                Collision damage waiver and 24/7 roadside assistance on all trips.
              </Text>
            </View>
          </View>

          <View style={[styles.perkItem, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md }]}>
            <Text style={styles.perkIcon}>🔑</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.sm, fontWeight: '700' }}>
                Contactless Digital Unlock
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs, marginTop: 2 }}>
                Skip the rental counter. Unlock with your mobile PIN at pickup.
              </Text>
            </View>
          </View>

          <View style={[styles.perkItem, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md }]}>
            <Text style={styles.perkIcon}>⏱️</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.sm, fontWeight: '700' }}>
                Free Cancellation
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs, marginTop: 2 }}>
                Cancel up to 24 hours prior to pickup for a 100% full refund.
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
  },
  vehicleCard: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  vehicleImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#0F172A',
  },
  vehicleName: {
    letterSpacing: -0.2,
    marginTop: 2,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
  },
  specsRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  specItem: {
    fontWeight: '500',
  },
  statusCard: {
    borderWidth: 1,
  },
  statusHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  sectionTitle: {
    letterSpacing: -0.2,
  },
  scheduleCard: {
    borderWidth: 1,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  arrowBox: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  changeDatesBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  perksList: {
    gap: 8,
  },
  perkItem: {
    flexDirection: 'row',
    padding: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  perkIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  footerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
  },
  footerPriceCol: {
    justifyContent: 'center',
  },
  footerLabel: {
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  footerPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  footerPrice: {
    letterSpacing: -0.5,
  },
});
