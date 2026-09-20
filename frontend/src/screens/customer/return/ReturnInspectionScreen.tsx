import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList, VehicleInspection } from '../../../types';
import { useTheme } from '../../../theme';
import { useBooking } from '../../../context/BookingContext';
import { ScreenContainer, Header, Card, Button, EmptyState } from '../../../components/common';

type ReturnInspectionNavProp = NativeStackNavigationProp<
  CustomerStackParamList,
  'ReturnInspection'
>;
type ReturnInspectionRouteProp = RouteProp<CustomerStackParamList, 'ReturnInspection'>;

interface ReturnInspectionProps {
  navigation: ReturnInspectionNavProp;
  route: ReturnInspectionRouteProp;
}

export const ReturnInspectionScreen: React.FC<ReturnInspectionProps> = ({
  navigation,
  route,
}) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { bookingId, returnLocation, dropoffMileage, dropoffFuel } = route.params;
  const { bookings, completeReturn } = useBooking();

  const booking = bookings.find(b => b.id === bookingId);

  const [exterior, setExterior] = useState<'Good' | 'Minor Scratches' | 'Damaged'>('Good');
  const [interior, setInterior] = useState<'Clean' | 'Normal' | 'Needs Cleaning'>('Clean');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!booking) {
    return (
      <ScreenContainer
        header={
          <Header
            title="Inspection"
            showBack
            onBackPress={() => navigation.goBack()}
          />
        }
      >
        <EmptyState
          title="Booking Not Found"
          message="Could not load vehicle details for inspection."
          actionTitle="Back to Bookings"
          onAction={() => navigation.navigate('MyBookings')}
        />
      </ScreenContainer>
    );
  }

  const { vehicle } = booking;
  const startingMileage = booking.pickupMileage || 14280;
  const finalMileage = dropoffMileage || startingMileage + 215;
  const tripDistance = Math.max(0, finalMileage - startingMileage);
  const finalFuel = dropoffFuel !== undefined ? dropoffFuel : 100;

  // Calculate damage charges based on mock inspection
  const damageCharges = exterior === 'Minor Scratches' ? 30 : exterior === 'Damaged' ? 100 : 0;
  const cleaningCharge = interior === 'Needs Cleaning' ? 25 : 0;
  const fuelCharge = finalFuel < 100 ? (100 - finalFuel) * 0.5 : 0;
  const totalIncidentalCharges = damageCharges + cleaningCharge + fuelCharge;

  const handleSubmitReturn = async () => {
    setIsSubmitting(true);
    try {
      const inspectionData: VehicleInspection = {
        exteriorCondition: exterior,
        interiorCondition: interior,
        fuelLevel: finalFuel,
        odometerReading: finalMileage,
        generalNotes: `Vehicle returned to ${returnLocation || booking.returnLocation}. Inspection passed with mock diagnostics.`,
        inspectionPassed: true,
        inspectedAt: new Date().toISOString(),
      };

      await completeReturn(booking.id, inspectionData, 0, totalIncidentalCharges);

      navigation.navigate('ReturnConfirmation', { bookingId: booking.id });
    } catch (err: any) {
      Alert.alert('Return Error', err?.message || 'Could not complete vehicle return.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="Vehicle Inspection"
          subtitle={`Step 2 of 3 · ${booking.id}`}
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
          <Button
            title="Back"
            variant="secondary"
            size="large"
            onPress={() => navigation.goBack()}
            style={{ flex: 1, marginRight: 8 }}
          />

          <Button
            title={isSubmitting ? 'Locking Vehicle...' : 'Complete Return →'}
            variant="primary"
            size="large"
            loading={isSubmitting}
            onPress={handleSubmitReturn}
            style={{ flex: 2 }}
          />
        </View>
      }
    >
      <ScrollView contentContainerStyle={[styles.content, { padding: spacing.md }]}>
        {/* Mock Data Transparency Notice */}
        <View
          style={[
            styles.noticeCard,
            {
              backgroundColor: 'rgba(0, 229, 255, 0.08)',
              borderColor: colors.primary,
              borderRadius: borderRadius.md,
              marginBottom: spacing.md,
            },
          ]}
        >
          <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>
            🔍 Prototype Diagnostic Notice
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 4, lineHeight: 16 }}>
            Inspection criteria use realistic local prototype telemetry. In production, this integrates with station IoT sensors and high-resolution bay cameras.
          </Text>
        </View>

        {/* Vehicle Quick Summary */}
        <Card
          variant="elevated"
          padding="small"
          style={[styles.vehicleCard, { borderColor: colors.border, borderRadius: borderRadius.md }]}
        >
          <Image
            source={{ uri: vehicle.image }}
            style={[styles.vehicleThumb, { borderRadius: borderRadius.md }]}
            resizeMode="cover"
          />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '800' }}>
              RETURNING VEHICLE
            </Text>
            <Text
              numberOfLines={1}
              style={{
                color: colors.textPrimary,
                fontSize: typography.fontSizes.md,
                fontWeight: '700',
                marginTop: 2,
              }}
            >
              {vehicle.brand} {vehicle.model}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs }}>
              Trip Distance: {tripDistance} km driven
            </Text>
          </View>
        </Card>

        {/* Exterior Condition */}
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
          1. Exterior Condition
        </Text>

        <Card variant="elevated" padding="small" style={{ borderColor: colors.border, borderRadius: borderRadius.md }}>
          {(['Good', 'Minor Scratches', 'Damaged'] as const).map(option => {
            const active = exterior === option;
            return (
              <TouchableOpacity
                key={option}
                activeOpacity={0.8}
                onPress={() => setExterior(option)}
                style={[
                  styles.optionRow,
                  {
                    backgroundColor: active ? 'rgba(0, 229, 255, 0.08)' : 'transparent',
                    borderColor: active ? colors.primary : colors.border,
                    borderRadius: borderRadius.sm,
                    padding: spacing.sm + 2,
                    marginBottom: 6,
                  },
                ]}
              >
                <Text style={{ fontSize: 14, marginRight: 8 }}>{active ? '🔘' : '⚪'}</Text>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: active ? colors.primary : colors.textPrimary,
                      fontSize: typography.fontSizes.sm,
                      fontWeight: active ? '700' : '500',
                    }}
                  >
                    {option === 'Good' ? 'Good (Pristine, no new scratches)' : option}
                  </Text>
                  {option !== 'Good' ? (
                    <Text style={{ color: colors.danger, fontSize: 10, marginTop: 2 }}>
                      +{option === 'Minor Scratches' ? '$30' : '$100'} damage assessment charge
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </Card>

        {/* Interior Condition */}
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
          2. Interior Cabin Condition
        </Text>

        <Card variant="elevated" padding="small" style={{ borderColor: colors.border, borderRadius: borderRadius.md }}>
          {(['Clean', 'Normal', 'Needs Cleaning'] as const).map(option => {
            const active = interior === option;
            return (
              <TouchableOpacity
                key={option}
                activeOpacity={0.8}
                onPress={() => setInterior(option)}
                style={[
                  styles.optionRow,
                  {
                    backgroundColor: active ? 'rgba(0, 229, 255, 0.08)' : 'transparent',
                    borderColor: active ? colors.primary : colors.border,
                    borderRadius: borderRadius.sm,
                    padding: spacing.sm + 2,
                    marginBottom: 6,
                  },
                ]}
              >
                <Text style={{ fontSize: 14, marginRight: 8 }}>{active ? '🔘' : '⚪'}</Text>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: active ? colors.primary : colors.textPrimary,
                      fontSize: typography.fontSizes.sm,
                      fontWeight: active ? '700' : '500',
                    }}
                  >
                    {option === 'Clean' ? 'Clean (Immaculate interior)' : option}
                  </Text>
                  {option === 'Needs Cleaning' ? (
                    <Text style={{ color: colors.danger, fontSize: 10, marginTop: 2 }}>
                      +$25 deep detailing charge
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </Card>

        {/* Telematics Reading Summary */}
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
          3. Mileage & Fuel Verification
        </Text>

        <Card variant="elevated" padding="medium" style={{ borderColor: colors.border, borderRadius: borderRadius.md }}>
          <View style={styles.metricRow}>
            <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs }}>Return Odometer</Text>
            <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.xs + 1, fontWeight: '700' }}>
              {finalMileage} km
            </Text>
          </View>
          <View style={[styles.metricRow, { marginTop: 8 }]}>
            <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs }}>Starting Odometer</Text>
            <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs + 1 }}>
              {startingMileage} km
            </Text>
          </View>
          <View style={[styles.metricRow, { marginTop: 8 }]}>
            <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs }}>Distance Driven</Text>
            <Text style={{ color: colors.accent, fontSize: typography.fontSizes.xs + 1, fontWeight: '800' }}>
              {tripDistance} km (Included in rental)
            </Text>
          </View>
          <View style={[styles.metricRow, { marginTop: 8 }]}>
            <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs }}>Fuel Level</Text>
            <Text style={{ color: colors.primary, fontSize: typography.fontSizes.xs + 1, fontWeight: '700' }}>
              {finalFuel}% Full
            </Text>
          </View>
        </Card>

        {/* General Condition Checklist */}
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
          4. General Condition & Diagnostics
        </Text>

        <Card variant="elevated" padding="medium" style={{ borderColor: colors.border, borderRadius: borderRadius.md }}>
          <View style={styles.checkItem}>
            <Text style={{ color: colors.accent, fontSize: 14, marginRight: 8 }}>✓</Text>
            <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.xs + 1, flex: 1 }}>
              Keyless transponder securely placed in mobility bay
            </Text>
          </View>
          <View style={[styles.checkItem, { marginTop: 8 }]}>
            <Text style={{ color: colors.accent, fontSize: 14, marginRight: 8 }}>✓</Text>
            <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.xs + 1, flex: 1 }}>
              Smart telematics diagnostic check passed (Brakes, Engine, Tire Pressure: OK)
            </Text>
          </View>
          <View style={[styles.checkItem, { marginTop: 8 }]}>
            <Text style={{ color: colors.accent, fontSize: 14, marginRight: 8 }}>✓</Text>
            <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.xs + 1, flex: 1 }}>
              All windows closed and parking brake engaged
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
  noticeCard: {
    padding: 12,
    borderWidth: 1,
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
  sectionTitle: {
    letterSpacing: -0.2,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
  },
});
