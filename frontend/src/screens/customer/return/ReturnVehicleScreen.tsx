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
import { CustomerStackParamList } from '../../../types';
import { useTheme } from '../../../theme';
import { useBooking } from '../../../context/BookingContext';
import { ScreenContainer, Header, Card, Button, Input, EmptyState } from '../../../components/common';

type ReturnVehicleNavProp = NativeStackNavigationProp<
  CustomerStackParamList,
  'ReturnVehicle'
>;
type ReturnVehicleRouteProp = RouteProp<CustomerStackParamList, 'ReturnVehicle'>;

interface ReturnVehicleProps {
  navigation: ReturnVehicleNavProp;
  route: ReturnVehicleRouteProp;
}

const RETURN_HUBS = [
  'Airport Terminal 1 - Hub West',
  'Downtown Tech District Hub',
  'Central Railway Station Hub',
  'Gulberg Boulevard Mobility Point',
];

export const ReturnVehicleScreen: React.FC<ReturnVehicleProps> = ({
  navigation,
  route,
}) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { bookingId } = route.params;
  const { bookings } = useBooking();

  const booking = bookings.find(b => b.id === bookingId);

  const startingMileage = booking?.pickupMileage || 14280;
  const [selectedHub, setSelectedHub] = useState(booking?.returnLocation || RETURN_HUBS[0]);
  const [odometer, setOdometer] = useState(`${startingMileage + 215}`);
  const [fuelLevel, setFuelLevel] = useState<number>(100);
  const [notes, setNotes] = useState('');

  if (!booking) {
    return (
      <ScreenContainer
        header={
          <Header
            title="Return Vehicle"
            showBack
            onBackPress={() => navigation.goBack()}
          />
        }
      >
        <EmptyState
          title="Booking Not Found"
          message="Could not load vehicle details for this return."
          actionTitle="Back to Bookings"
          onAction={() => navigation.navigate('MyBookings')}
        />
      </ScreenContainer>
    );
  }

  const { vehicle } = booking;

  const handleProceedToInspection = () => {
    const enteredMileage = parseInt(odometer, 10);
    if (isNaN(enteredMileage) || enteredMileage < startingMileage) {
      Alert.alert(
        'Invalid Odometer',
        `Return odometer (${enteredMileage || 0} km) must be greater than starting mileage (${startingMileage} km).`
      );
      return;
    }

    navigation.navigate('ReturnInspection', {
      bookingId: booking.id,
      returnLocation: selectedHub,
      dropoffMileage: enteredMileage,
      dropoffFuel: fuelLevel,
    });
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="Return Vehicle"
          subtitle={`Step 1 of 3 · ${booking.id}`}
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
            title="Cancel"
            variant="secondary"
            size="large"
            onPress={() => navigation.goBack()}
            style={{ flex: 1, marginRight: 8 }}
          />

          <Button
            title="Proceed to Inspection →"
            variant="primary"
            size="large"
            onPress={handleProceedToInspection}
            style={{ flex: 1.8 }}
          />
        </View>
      }
    >
      <ScrollView contentContainerStyle={[styles.content, { padding: spacing.md }]}>
        {/* Vehicle Summary Card */}
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
            <View style={styles.statusPill}>
              <Text style={{ color: colors.accent, fontSize: 10, fontWeight: '800' }}>
                ● {booking.status.toUpperCase()}
              </Text>
            </View>
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
              Expected return: {booking.returnDate} · {booking.returnTime}
            </Text>
          </View>
        </Card>

        {/* Drop-off Mobility Hub Selector */}
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
          Select Drop-off Mobility Hub
        </Text>

        <Card variant="elevated" padding="small" style={{ borderColor: colors.border, borderRadius: borderRadius.md }}>
          {RETURN_HUBS.map(hub => {
            const isSelected = selectedHub === hub;
            return (
              <TouchableOpacity
                key={hub}
                activeOpacity={0.8}
                onPress={() => setSelectedHub(hub)}
                style={[
                  styles.hubRow,
                  {
                    backgroundColor: isSelected ? 'rgba(0, 229, 255, 0.08)' : 'transparent',
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderRadius: borderRadius.sm,
                    padding: spacing.sm + 2,
                    marginBottom: 6,
                  },
                ]}
              >
                <Text style={{ fontSize: 14, marginRight: 8 }}>{isSelected ? '🔘' : '⚪'}</Text>
                <Text
                  style={{
                    color: isSelected ? colors.primary : colors.textPrimary,
                    fontSize: typography.fontSizes.sm,
                    fontWeight: isSelected ? '700' : '500',
                    flex: 1,
                  }}
                >
                  {hub}
                </Text>
              </TouchableOpacity>
            );
          })}
        </Card>

        {/* Vehicle Telematics / Drop-off Readings */}
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
          Drop-off Vehicle Telematics
        </Text>

        <Card variant="elevated" padding="medium" style={{ borderColor: colors.border, borderRadius: borderRadius.md }}>
          <Input
            label="Current Odometer Reading (km)"
            value={odometer}
            onChangeText={setOdometer}
            placeholder="e.g. 14495"
            keyboardType="numeric"
            helperText={`Starting odometer: ${startingMileage} km`}
          />

          <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: spacing.md, marginBottom: 8 }]}>
            Fuel / Charge Level at Drop-off
          </Text>

          <View style={styles.fuelOptionsRow}>
            {[100, 75, 50, 25].map(level => {
              const active = fuelLevel === level;
              return (
                <TouchableOpacity
                  key={level}
                  activeOpacity={0.8}
                  onPress={() => setFuelLevel(level)}
                  style={[
                    styles.fuelChip,
                    {
                      backgroundColor: active ? colors.primary : colors.surfaceVariant,
                      borderColor: active ? colors.primary : colors.border,
                      borderRadius: borderRadius.md,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: active ? colors.textInverse : colors.textPrimary,
                      fontSize: typography.fontSizes.xs,
                      fontWeight: '700',
                    }}
                  >
                    {level}% Full
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Input
            label="Return Notes (Optional)"
            value={notes}
            onChangeText={setNotes}
            placeholder="Any parking bay number or comments..."
            containerStyle={{ marginTop: spacing.md }}
          />
        </Card>

        {/* Instructions */}
        <View
          style={[
            styles.instructionBox,
            {
              backgroundColor: 'rgba(0, 229, 255, 0.06)',
              borderColor: colors.primary,
              borderRadius: borderRadius.md,
              marginTop: spacing.md,
              padding: spacing.md,
            },
          ]}
        >
          <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>
            ℹ️ Return Policy Reminder
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 4, lineHeight: 16 }}>
            Please ensure you have gathered all personal belongings. Next, our standard 5-point mock inspection checklist will verify exterior, interior, fuel, and mileage before final invoice generation.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
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
  statusPill: {
    alignSelf: 'flex-start',
  },
  sectionTitle: {
    letterSpacing: -0.2,
  },
  hubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  fuelOptionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  fuelChip: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  instructionBox: {
    borderWidth: 1,
  },
  footerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
  },
});
