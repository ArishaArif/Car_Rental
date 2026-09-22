import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Switch } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { FleetManagerStackParamList } from '../../types';
import { useTheme } from '../../theme';
import { useFleet } from '../../context/FleetContext';
import { useBooking } from '../../context/BookingContext';
import { ScreenContainer, Header, Card, Input, Button } from '../../components/common';

type ProcessReturnNavProp = NativeStackNavigationProp<
  FleetManagerStackParamList,
  'ProcessReturn'
>;
type ProcessReturnRouteProp = RouteProp<
  FleetManagerStackParamList,
  'ProcessReturn'
>;

interface Props {
  navigation: ProcessReturnNavProp;
  route: ProcessReturnRouteProp;
}

export const ProcessReturnScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors, typography, spacing } = useTheme();
  const { returnId } = route.params;
  const { returnsList, processReturn } = useFleet();
  const { bookings, completeRental } = useBooking();

  const retItem = returnsList.find(r => r.id === returnId);

  const [mileage, setMileage] = useState('18450');
  const [fuel, setFuel] = useState('100');
  const [cleanlinessVerified, setCleanlinessVerified] = useState(true);
  const [exteriorClean, setExteriorClean] = useState(true);
  const [notes, setNotes] = useState('Vehicle returned in certified condition. Keyless digital lock validated.');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!retItem) {
    return (
      <ScreenContainer
        header={<Header title="Return Not Found" showBack onBackPress={() => navigation.goBack()} />}
      >
        <View style={{ padding: spacing.xl, alignItems: 'center' }}>
          <Text style={{ color: colors.textSecondary }}>Return record could not be found.</Text>
          <Button title="Back" onPress={() => navigation.goBack()} style={{ marginTop: spacing.md }} />
        </View>
      </ScreenContainer>
    );
  }

  const handleFinishCheckIn = async () => {
    setIsProcessing(true);
    try {
      // Complete in operations
      await processReturn(
        retItem.id,
        Number(mileage) || 18450,
        Number(fuel) || 100,
        notes.trim()
      );

      // If associated booking exists and is Active, complete it
      const matchBooking = bookings.find(b => b.id === retItem.bookingId);
      if (matchBooking && matchBooking.status === 'Active') {
        await completeRental(matchBooking.id, {
          exteriorCondition: exteriorClean ? 'Good' : 'Minor Scratches',
          interiorCondition: cleanlinessVerified ? 'Clean' : 'Needs Cleaning',
          fuelLevel: Number(fuel) || 100,
          odometerReading: Number(mileage) || 18450,
          inspectionPassed: true,
          inspectedAt: new Date().toISOString(),
          generalNotes: notes.trim(),
        });
      }

      Alert.alert(
        'Return Processed',
        `${retItem.vehicleName} checked in. Status reset to Available; customer invoice finalized.`,
        [{ text: 'Done', onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to process return');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="Process Vehicle Return"
          subtitle={retItem.vehicleName}
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
            title={isProcessing ? 'Processing Check-In...' : 'Certify Return & Mark Available'}
            variant="primary"
            size="large"
            fullWidth
            loading={isProcessing}
            onPress={handleFinishCheckIn}
          />
        </View>
      }
    >
      <View style={[styles.content, { padding: spacing.md }]}>
        {/* Reservation Brief */}
        <Card variant="elevated" padding="medium" style={[styles.briefCard, { borderColor: colors.border }]}>
          <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.md, fontWeight: '700' }}>
            {retItem.vehicleName}
          </Text>
          <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600', marginTop: 2 }}>
            Booking Ref: {retItem.bookingId}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>
            Renter: {retItem.customerName} • {retItem.customerPhone}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>
            Return Hub: {retItem.returnLocation}
          </Text>
        </Card>

        {/* Technical Return Telematics */}
        <Text
          style={[
            styles.sectionHeading,
            {
              color: colors.textPrimary,
              fontSize: typography.fontSizes.md,
              fontWeight: typography.fontWeights.bold,
              marginTop: spacing.md,
              marginBottom: 8,
            },
          ]}
        >
          Check-In Telematics
        </Text>

        <View style={{ flexDirection: 'row' }}>
          <Input
            label="Drop-Off Odometer (km) *"
            value={mileage}
            onChangeText={setMileage}
            keyboardType="numeric"
            containerStyle={{ flex: 1, marginRight: 8 }}
          />
          <Input
            label="Fuel / Charge Level (%) *"
            value={fuel}
            onChangeText={setFuel}
            keyboardType="numeric"
            containerStyle={{ flex: 1 }}
          />
        </View>

        {/* Verification Toggles */}
        <Card variant="flat" padding="medium" style={[styles.toggleCard, { borderColor: colors.border }]}>
          <View style={styles.toggleRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '700' }}>
                Interior Sanitation Verified
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                Cabin is clean and personal belongings removed.
              </Text>
            </View>
            <Switch
              value={cleanlinessVerified}
              onValueChange={setCleanlinessVerified}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: 10 }]} />

          <View style={styles.toggleRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '700' }}>
                Exterior Body Condition Clear
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                No fresh scratches, dings, or wheel scuffs observed.
              </Text>
            </View>
            <Switch
              value={exteriorClean}
              onValueChange={setExteriorClean}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor="#FFFFFF"
            />
          </View>
        </Card>

        <Input
          label="Return Check-In Notes"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          containerStyle={{ marginTop: spacing.md }}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
  },
  briefCard: {
    borderWidth: 1,
  },
  sectionHeading: {
    letterSpacing: -0.2,
  },
  toggleCard: {
    borderWidth: 1,
    marginTop: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    height: 1,
  },
  footerBar: {
    borderTopWidth: 1,
  },
});
