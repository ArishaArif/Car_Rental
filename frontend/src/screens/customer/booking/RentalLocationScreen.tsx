import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../../types';
import { useTheme } from '../../../theme';
import { useBooking } from '../../../context/BookingContext';
import { ScreenContainer, Header, Card, Button } from '../../../components/common';
import { BookingProgress } from '../../../components/booking';

type RentalLocationNavProp = NativeStackNavigationProp<
  CustomerStackParamList,
  'RentalLocation'
>;
type RentalLocationRouteProp = RouteProp<CustomerStackParamList, 'RentalLocation'>;

interface RentalLocationProps {
  navigation: RentalLocationNavProp;
  route: RentalLocationRouteProp;
}

interface HubOption {
  id: string;
  name: string;
  badge: string;
  address: string;
  hours: string;
}

const FLEET_HUBS: HubOption[] = [
  {
    id: 'hub-airport-1',
    name: 'Airport Terminal 1 - Hub West',
    badge: 'AIRPORT SHUTTLE',
    address: 'Departure Level Gate 4, Parking Bay W2',
    hours: 'Open 24/7 · Keyless Lockers',
  },
  {
    id: 'hub-downtown',
    name: 'Downtown Tech District Hub',
    badge: 'METRO EXPRESS',
    address: '7th Avenue Silicon Boulevard, Building B',
    hours: '6:00 AM – 11:30 PM Daily',
  },
  {
    id: 'hub-central-station',
    name: 'Central Metro Station Station Bay 4',
    badge: 'TRANSIT HUB',
    address: 'Underground Level 1, Bay 14',
    hours: 'Open 24/7 · Smart Access',
  },
  {
    id: 'hub-grand-plaza',
    name: 'Grand Plaza Fleet Depot',
    badge: 'EXECUTIVE LOUNGE',
    address: 'Mall Concourse Valet Reception, Level P2',
    hours: '8:00 AM – 10:00 PM Daily',
  },
  {
    id: 'hub-vip-terminal',
    name: 'Executive VIP Terminal & Lounge',
    badge: 'PRESTIGE DEPOT',
    address: 'Private Aviation Boulevard, Hangar 3',
    hours: 'Open 24/7 · VIP Attendant',
  },
];

export const RentalLocationScreen: React.FC<RentalLocationProps> = ({
  navigation,
  route,
}) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { vehicleId } = route.params;
  const { draft, setLocations } = useBooking();

  const defaultPickup = draft?.pickupLocation || FLEET_HUBS[0].name;
  const [pickupLoc, setPickupLoc] = useState<string>(defaultPickup);
  const [sameLocation, setSameLocation] = useState<boolean>(draft?.sameLocation ?? true);
  const [returnLoc, setReturnLoc] = useState<string>(
    draft?.returnLocation && !draft.sameLocation ? draft.returnLocation : defaultPickup
  );

  const handlePickupSelect = (name: string) => {
    setPickupLoc(name);
    if (sameLocation) {
      setReturnLoc(name);
    }
  };

  const handleToggleSameLocation = (val: boolean) => {
    setSameLocation(val);
    if (val) {
      setReturnLoc(pickupLoc);
    }
  };

  const handleContinue = () => {
    setLocations(pickupLoc, returnLoc, sameLocation);
    navigation.navigate('BookingSummary', { vehicleId });
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="Pickup & Return"
          subtitle="Select branch or mobility hub"
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
          <View style={styles.footerCol}>
            <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs, fontWeight: '600' }}>
              SELECTED ROUTE
            </Text>
            <Text
              numberOfLines={1}
              style={{
                color: colors.textPrimary,
                fontSize: typography.fontSizes.sm,
                fontWeight: '700',
                marginTop: 2,
              }}
            >
              {sameLocation ? 'Roundtrip Hub' : 'One-way Trip'}
            </Text>
          </View>

          <Button
            title="Review Summary →"
            variant="primary"
            size="large"
            onPress={handleContinue}
            style={{ flex: 1, marginLeft: 16 }}
          />
        </View>
      }
    >
      <BookingProgress currentStep="location" />

      <View style={[styles.content, { padding: spacing.md }]}>
        {/* Same Location Toggle Card */}
        <Card
          variant="elevated"
          padding="medium"
          style={[
            styles.toggleCard,
            {
              borderColor: colors.border,
              backgroundColor: colors.surface,
              marginBottom: spacing.md,
            },
          ]}
        >
          <View style={styles.toggleRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: typography.fontSizes.sm + 1,
                  fontWeight: typography.fontWeights.bold,
                }}
              >
                Return vehicle to same location
              </Text>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: typography.fontSizes.xs,
                  marginTop: 2,
                }}
              >
                Drop off the vehicle at the exact pickup branch
              </Text>
            </View>

            <Switch
              value={sameLocation}
              onValueChange={handleToggleSameLocation}
              trackColor={{ false: colors.border, true: colors.primaryDark }}
              thumbColor={sameLocation ? colors.primary : colors.textMuted}
            />
          </View>
        </Card>

        {/* Pickup Location Section */}
        <View style={styles.sectionHeaderRow}>
          <Text
            style={[
              styles.sectionHeading,
              {
                color: colors.textPrimary,
                fontSize: typography.fontSizes.md,
                fontWeight: typography.fontWeights.bold,
              },
            ]}
          >
            1. Select Pickup Hub
          </Text>
          <Text style={{ color: colors.primary, fontSize: typography.fontSizes.xs, fontWeight: '700' }}>
            START LOCATION
          </Text>
        </View>

        <View style={styles.hubsList}>
          {FLEET_HUBS.map(hub => {
            const isSelected = pickupLoc === hub.name;
            return (
              <TouchableOpacity
                key={`pickup-${hub.id}`}
                activeOpacity={0.85}
                onPress={() => handlePickupSelect(hub.name)}
                style={[
                  styles.hubCard,
                  {
                    backgroundColor: isSelected ? 'rgba(0, 229, 255, 0.08)' : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderRadius: borderRadius.md,
                  },
                ]}
              >
                <View style={styles.hubTopRow}>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.hubName,
                        {
                          color: colors.textPrimary,
                          fontSize: typography.fontSizes.sm + 1,
                          fontWeight: '700',
                        },
                      ]}
                    >
                      {hub.name}
                    </Text>
                    <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs, marginTop: 2 }}>
                      📍 {hub.address}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.radioCircle,
                      {
                        borderColor: isSelected ? colors.primary : colors.border,
                        backgroundColor: isSelected ? colors.primary : 'transparent',
                        borderRadius: borderRadius.full,
                      },
                    ]}
                  >
                    {isSelected ? <Text style={{ color: colors.textInverse, fontSize: 10, fontWeight: '900' }}>✓</Text> : null}
                  </View>
                </View>

                <View style={styles.hubFooterRow}>
                  <View
                    style={[
                      styles.badgePill,
                      {
                        backgroundColor: colors.surfaceVariant,
                        borderRadius: borderRadius.xs,
                      },
                    ]}
                  >
                    <Text style={{ color: colors.primary, fontSize: typography.fontSizes.xs - 2, fontWeight: '700' }}>
                      {hub.badge}
                    </Text>
                  </View>
                  <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs - 1 }}>
                    🕒 {hub.hours}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Return Location Section (If different) */}
        {!sameLocation ? (
          <View style={{ marginTop: spacing.lg }}>
            <View style={styles.sectionHeaderRow}>
              <Text
                style={[
                  styles.sectionHeading,
                  {
                    color: colors.textPrimary,
                    fontSize: typography.fontSizes.md,
                    fontWeight: typography.fontWeights.bold,
                  },
                ]}
              >
                2. Select Drop-off Location
              </Text>
              <Text style={{ color: colors.accent, fontSize: typography.fontSizes.xs, fontWeight: '700' }}>
                RETURN HUB
              </Text>
            </View>

            <View style={styles.hubsList}>
              {FLEET_HUBS.map(hub => {
                const isSelected = returnLoc === hub.name;
                return (
                  <TouchableOpacity
                    key={`return-${hub.id}`}
                    activeOpacity={0.85}
                    onPress={() => setReturnLoc(hub.name)}
                    style={[
                      styles.hubCard,
                      {
                        backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.08)' : colors.surface,
                        borderColor: isSelected ? colors.accent : colors.border,
                        borderRadius: borderRadius.md,
                      },
                    ]}
                  >
                    <View style={styles.hubTopRow}>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.hubName,
                            {
                              color: colors.textPrimary,
                              fontSize: typography.fontSizes.sm + 1,
                              fontWeight: '700',
                            },
                          ]}
                        >
                          {hub.name}
                        </Text>
                        <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs, marginTop: 2 }}>
                          📍 {hub.address}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.radioCircle,
                          {
                            borderColor: isSelected ? colors.accent : colors.border,
                            backgroundColor: isSelected ? colors.accent : 'transparent',
                            borderRadius: borderRadius.full,
                          },
                        ]}
                      >
                        {isSelected ? <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '900' }}>✓</Text> : null}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ) : null}

        {/* Keyless Handover Notice */}
        <Card
          variant="flat"
          padding="medium"
          style={[styles.noticeCard, { borderColor: colors.border, marginTop: spacing.lg }]}
        >
          <Text style={{ color: colors.primary, fontSize: typography.fontSizes.sm, fontWeight: '700' }}>
            📱 Digital Keyless Handover
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs, marginTop: 4, lineHeight: 18 }}>
            Upon arrival at your chosen hub, simply enter your booking confirmation PIN at the Velox Key Station or unlock directly with the mobile app.
          </Text>
        </Card>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
  },
  toggleCard: {
    borderWidth: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionHeading: {
    letterSpacing: -0.2,
  },
  hubsList: {
    gap: 8,
  },
  hubCard: {
    padding: 12,
    borderWidth: 1.5,
  },
  hubTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  hubName: {
    letterSpacing: -0.2,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  hubFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(148, 163, 184, 0.15)',
  },
  badgePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  noticeCard: {
    borderWidth: 1,
  },
  footerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
  },
  footerCol: {
    justifyContent: 'center',
  },
});
