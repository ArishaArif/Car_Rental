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
import { CustomerStackParamList } from '../../types';
import { useTheme } from '../../theme';
import { useBooking } from '../../context/BookingContext';
import { ScreenContainer, Header, Card, Button, EmptyState } from '../../components/common';

type ActiveRentalNavProp = NativeStackNavigationProp<
  CustomerStackParamList,
  'ActiveRental'
>;
type ActiveRentalRouteProp = RouteProp<CustomerStackParamList, 'ActiveRental'>;

interface ActiveRentalProps {
  navigation: ActiveRentalNavProp;
  route?: ActiveRentalRouteProp;
}

export const ActiveRentalScreen: React.FC<ActiveRentalProps> = ({ navigation, route }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { activeRental, bookings } = useBooking();

  // Find specific booking by ID if provided, otherwise active rental
  const targetBooking =
    route?.params?.bookingId
      ? bookings.find(b => b.id === route.params?.bookingId) || activeRental
      : activeRental;

  const [isLocked, setIsLocked] = useState(true);
  const [hazardsActive, setHazardsActive] = useState(false);

  if (!targetBooking) {
    return (
      <ScreenContainer
        header={
          <Header
            title="Active Rental"
            showBack
            onBackPress={() => navigation.goBack()}
          />
        }
      >
        <EmptyState
          title="No Active Rental"
          message="You do not have a vehicle actively checked out at this time. Book a ride to enjoy smart keyless access."
          actionTitle="Explore Fleet"
          onAction={() => navigation.navigate('VehicleGallery')}
          style={{ marginTop: 40 }}
        />
      </ScreenContainer>
    );
  }

  const { vehicle } = targetBooking;

  const handleToggleLock = () => {
    const nextState = !isLocked;
    setIsLocked(nextState);
    Alert.alert(
      nextState ? 'Vehicle Locked' : 'Vehicle Unlocked',
      nextState
        ? 'All doors locked and immobilizer armed.'
        : 'Smart keyless proximity unlock engaged. Doors are unlocked.'
    );
  };

  const handleFlashHazards = () => {
    setHazardsActive(true);
    Alert.alert('Hazard Lights Triggered', 'Exterior lamps and horn chirp activated for 5 seconds.');
    setTimeout(() => setHazardsActive(false), 5000);
  };

  const handleRoadsideAssistance = () => {
    Alert.alert(
      '24/7 Roadside Assistance',
      'Velox Rapid Response Team:\n• Toll Free: +92 800 83569\n• Hub West Dispatch: Station #4\n• Towing & battery jump-start included with your rental package.',
      [{ text: 'Dismiss', style: 'cancel' }, { text: 'Call Dispatch (+92 800 83569)' }]
    );
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="Active Rental"
          subtitle={targetBooking.id}
          showBack
          onBackPress={() => navigation.goBack()}
          rightElement={
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleRoadsideAssistance}
              style={[
                styles.sosBtn,
                {
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  borderColor: colors.danger,
                  borderRadius: borderRadius.md,
                },
              ]}
            >
              <Text style={{ color: colors.danger, fontSize: 11, fontWeight: '800' }}>SOS 🚨</Text>
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
            title="Rental Voucher"
            variant="secondary"
            size="large"
            onPress={() => navigation.navigate('BookingDetails', { bookingId: targetBooking.id })}
            style={{ flex: 1, marginRight: 8 }}
          />

          <Button
            title="Return Vehicle →"
            variant="primary"
            size="large"
            onPress={() => navigation.navigate('ReturnVehicle', { bookingId: targetBooking.id })}
            style={{ flex: 1.3 }}
          />
        </View>
      }
    >
      <ScrollView contentContainerStyle={[styles.content, { padding: spacing.md }]}>
        {/* Active Live Status Banner */}
        <View
          style={[
            styles.activeHeroCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.accent,
              borderRadius: borderRadius.lg,
            },
          ]}
        >
          <View style={styles.heroTopRow}>
            <View style={styles.pulseContainer}>
              <View style={[styles.pulseDot, { backgroundColor: colors.accent }]} />
              <Text style={{ color: colors.accent, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 }}>
                RENTAL IN PROGRESS
              </Text>
            </View>

            <View
              style={[
                styles.pinPill,
                {
                  backgroundColor: 'rgba(0, 229, 255, 0.12)',
                  borderColor: colors.primary,
                  borderRadius: borderRadius.xs,
                },
              ]}
            >
              <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '700' }}>
                PIN: {targetBooking.pickupCode}
              </Text>
            </View>
          </View>

          {/* Vehicle Hero Image & Title */}
          <View style={{ alignItems: 'center', marginVertical: spacing.md }}>
            <Image
              source={{ uri: vehicle.image }}
              style={[styles.heroVehicleImage, { borderRadius: borderRadius.md }]}
              resizeMode="cover"
            />
            <Text
              style={[
                styles.vehicleTitle,
                {
                  color: colors.textPrimary,
                  fontSize: typography.fontSizes.xl,
                  fontWeight: typography.fontWeights.heavy,
                  marginTop: 8,
                },
              ]}
            >
              {vehicle.brand} {vehicle.model}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs, marginTop: 2 }}>
              {vehicle.year} · {vehicle.category.toUpperCase()} · Plate: PK-782-VLX
            </Text>
          </View>

          {/* Countdown & Remaining Info */}
          <View
            style={[
              styles.countdownBox,
              {
                backgroundColor: colors.surfaceVariant,
                borderColor: colors.border,
                borderRadius: borderRadius.md,
                padding: spacing.md,
              },
            ]}
          >
            <View style={styles.countdownRow}>
              <View>
                <Text style={{ color: colors.textMuted, fontSize: 10, fontWeight: '700' }}>
                  REMAINING TIME
                </Text>
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: typography.fontSizes.lg,
                    fontWeight: '800',
                    marginTop: 2,
                  }}
                >
                  1 Day 14 Hours
                </Text>
              </View>

              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: colors.textMuted, fontSize: 10, fontWeight: '700' }}>
                  SCHEDULED RETURN
                </Text>
                <Text
                  style={{
                    color: colors.accent,
                    fontSize: typography.fontSizes.xs + 1,
                    fontWeight: '700',
                    marginTop: 2,
                  }}
                >
                  {targetBooking.returnDate} · {targetBooking.returnTime}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Smart Telematics Remote Controls */}
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
          Smart IoT Controls
        </Text>

        <View style={styles.controlsGrid}>
          {/* Lock / Unlock Toggle */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleToggleLock}
            style={[
              styles.controlTile,
              {
                backgroundColor: isLocked ? 'rgba(0, 229, 255, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                borderColor: isLocked ? colors.primary : colors.danger,
                borderRadius: borderRadius.md,
              },
            ]}
          >
            <Text style={{ fontSize: 24 }}>{isLocked ? '🔒' : '🔓'}</Text>
            <Text
              style={{
                color: isLocked ? colors.primary : colors.danger,
                fontSize: typography.fontSizes.xs,
                fontWeight: '700',
                marginTop: 6,
              }}
            >
              {isLocked ? 'Locked' : 'Unlocked'}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 9, marginTop: 2 }}>
              Tap to {isLocked ? 'Unlock' : 'Lock'}
            </Text>
          </TouchableOpacity>

          {/* Flash Hazards */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleFlashHazards}
            style={[
              styles.controlTile,
              {
                backgroundColor: hazardsActive ? 'rgba(234, 179, 8, 0.15)' : colors.surface,
                borderColor: hazardsActive ? '#EAB308' : colors.border,
                borderRadius: borderRadius.md,
              },
            ]}
          >
            <Text style={{ fontSize: 24 }}>⚠️</Text>
            <Text
              style={{
                color: hazardsActive ? '#EAB308' : colors.textPrimary,
                fontSize: typography.fontSizes.xs,
                fontWeight: '700',
                marginTop: 6,
              }}
            >
              Hazards
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 9, marginTop: 2 }}>
              {hazardsActive ? 'Flashing...' : 'Flash Lamps'}
            </Text>
          </TouchableOpacity>

          {/* Horn Chirp */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => Alert.alert('Horn Chirp', 'Vehicle sounder gave 2 audible confirmation beeps.')}
            style={[
              styles.controlTile,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: borderRadius.md,
              },
            ]}
          >
            <Text style={{ fontSize: 24 }}>📢</Text>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: typography.fontSizes.xs,
                fontWeight: '700',
                marginTop: 6,
              }}
            >
              Horn Beep
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 9, marginTop: 2 }}>Locate Vehicle</Text>
          </TouchableOpacity>
        </View>

        {/* Live Telematics Snapshot */}
        <Card
          variant="elevated"
          padding="medium"
          style={{
            borderColor: colors.border,
            borderRadius: borderRadius.md,
            marginTop: spacing.md,
          }}
        >
          <View style={styles.telematicsRow}>
            <View style={styles.telematicsItem}>
              <Text style={{ color: colors.textMuted, fontSize: 10, fontWeight: '700' }}>
                STARTING ODOMETER
              </Text>
              <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '700', marginTop: 2 }}>
                {targetBooking.pickupMileage || 14280} km
              </Text>
            </View>

            <View style={[styles.vertDivider, { backgroundColor: colors.border }]} />

            <View style={styles.telematicsItem}>
              <Text style={{ color: colors.textMuted, fontSize: 10, fontWeight: '700' }}>
                ESTIMATED FUEL
              </Text>
              <Text style={{ color: colors.accent, fontSize: 13, fontWeight: '700', marginTop: 2 }}>
                92% Full
              </Text>
            </View>

            <View style={[styles.vertDivider, { backgroundColor: colors.border }]} />

            <View style={styles.telematicsItem}>
              <Text style={{ color: colors.textMuted, fontSize: 10, fontWeight: '700' }}>
                ENGINE STATUS
              </Text>
              <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700', marginTop: 2 }}>
                Ready
              </Text>
            </View>
          </View>
        </Card>

        {/* Mobility Hubs & Schedule */}
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
          Pickup & Return Locations
        </Text>

        <Card variant="elevated" padding="medium" style={{ borderColor: colors.border, borderRadius: borderRadius.md }}>
          <View style={styles.hubItem}>
            <Text style={{ fontSize: 16, marginRight: 8 }}>🟢</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textMuted, fontSize: 10, fontWeight: '700' }}>
                PICKED UP AT ({targetBooking.pickupDate})
              </Text>
              <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.xs + 1, fontWeight: '600' }}>
                {targetBooking.pickupLocation}
              </Text>
            </View>
          </View>

          <View style={[styles.horizDivider, { backgroundColor: colors.border, marginVertical: 10 }]} />

          <View style={styles.hubItem}>
            <Text style={{ fontSize: 16, marginRight: 8 }}>🏁</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textMuted, fontSize: 10, fontWeight: '700' }}>
                SCHEDULED RETURN AT ({targetBooking.returnDate} · {targetBooking.returnTime})
              </Text>
              <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.xs + 1, fontWeight: '600' }}>
                {targetBooking.returnLocation}
              </Text>
            </View>
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
  sosBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
  },
  activeHeroCard: {
    borderWidth: 1.5,
    padding: 16,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pulseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  pinPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
  },
  heroVehicleImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#0F172A',
  },
  vehicleTitle: {
    letterSpacing: -0.4,
  },
  countdownBox: {
    borderWidth: 1,
    marginTop: 4,
  },
  countdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    letterSpacing: -0.2,
  },
  controlsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  controlTile: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderWidth: 1,
  },
  telematicsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  telematicsItem: {
    flex: 1,
    alignItems: 'center',
  },
  vertDivider: {
    width: 1,
    height: 28,
  },
  hubItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  horizDivider: {
    height: 1,
  },
  footerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
  },
});
