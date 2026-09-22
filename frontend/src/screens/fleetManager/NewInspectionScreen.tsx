import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { FleetManagerStackParamList } from '../../types';
import { useTheme } from '../../theme';
import { useFleet } from '../../context/FleetContext';
import { useAuth } from '../../context/AuthContext';
import { ScreenContainer, Header, Card, Input, Button } from '../../components/common';

type NewInspNavProp = NativeStackNavigationProp<
  FleetManagerStackParamList,
  'NewInspection'
>;
type NewInspRouteProp = RouteProp<
  FleetManagerStackParamList,
  'NewInspection'
>;

interface Props {
  navigation: NewInspNavProp;
  route: NewInspRouteProp;
}

const INSP_TYPES = ['Pre-Trip', 'Post-Return', 'Routine', 'Maintenance Check'] as const;
const EXTERIOR_OPTIONS = ['Good', 'Minor Scratches', 'Damaged'] as const;
const INTERIOR_OPTIONS = ['Clean', 'Normal', 'Needs Cleaning'] as const;
const TIRE_OPTIONS = ['Good', 'Fair', 'Needs Replacement'] as const;

export const NewInspectionScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors, spacing, borderRadius } = useTheme();
  const { vehicles, createInspection } = useFleet();
  const { user } = useAuth();

  const preselectedVehicleId = route.params?.vehicleId;
  const preselectedBookingId = route.params?.bookingId;

  const [selectedVehicleId, setSelectedVehicleId] = useState(
    preselectedVehicleId || vehicles[0]?.id || ''
  );
  const [bookingId, setBookingId] = useState(preselectedBookingId || '');
  const [inspType, setInspType] = useState<typeof INSP_TYPES[number]>('Pre-Trip');
  const [exterior, setExterior] = useState<typeof EXTERIOR_OPTIONS[number]>('Good');
  const [interior, setInterior] = useState<typeof INTERIOR_OPTIONS[number]>('Clean');
  const [tires, setTires] = useState<typeof TIRE_OPTIONS[number]>('Good');
  const [fuel, setFuel] = useState('100');
  const [odometer, setOdometer] = useState('15200');
  const [passed, setPassed] = useState(true);
  const [notes, setNotes] = useState('All fluid levels, tire pressures, and safety lights verified.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

  const handleSubmit = async () => {
    if (!selectedVehicle) {
      Alert.alert('Error', 'Please select a vehicle');
      return;
    }

    setIsSubmitting(true);
    try {
      await createInspection({
        vehicleId: selectedVehicle.id,
        vehicleName: `${selectedVehicle.brand} ${selectedVehicle.model}`,
        bookingId: bookingId.trim() || undefined,
        inspectorName: user?.name || 'Marcus Chen',
        date: new Date().toISOString().split('T')[0],
        status: 'Completed',
        type: inspType,
        exteriorCondition: exterior,
        interiorCondition: interior,
        tiresAndBrakes: tires,
        fuelLevel: Number(fuel) || 100,
        odometerReading: Number(odometer) || 15000,
        passed,
        notes: notes.trim(),
      });

      Alert.alert(
        'Inspection Certified',
        `${inspType} inspection logged. Result: ${passed ? 'PASSED' : 'FAILED - Routed to Service'}.`,
        [{ text: 'Done', onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to submit inspection');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="Vehicle Inspection Audit"
          subtitle="Complete multi-point condition review"
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
            title={isSubmitting ? 'Certifying...' : 'Certify & Save Inspection'}
            variant="primary"
            size="large"
            fullWidth
            loading={isSubmitting}
            onPress={handleSubmit}
          />
        </View>
      }
    >
      <View style={[styles.content, { padding: spacing.md }]}>
        {/* Vehicle Selection */}
        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Target Vehicle *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
          {vehicles.map(v => {
            const isSelected = selectedVehicleId === v.id;
            return (
              <TouchableOpacity
                key={v.id}
                onPress={() => setSelectedVehicleId(v.id)}
                style={[
                  styles.vehicleChip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderRadius: borderRadius.md,
                  },
                ]}
              >
                <Text
                  style={{
                    color: isSelected ? colors.textInverse : colors.textPrimary,
                    fontSize: 12,
                    fontWeight: isSelected ? '700' : '500',
                  }}
                >
                  {v.brand} {v.model}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Input
          label="Booking Reference (Optional)"
          placeholder="e.g. VLX-BK-91823"
          value={bookingId}
          onChangeText={setBookingId}
        />

        {/* Inspection Type */}
        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Audit Type</Text>
        <View style={styles.choiceRow}>
          {INSP_TYPES.map(t => {
            const isSelected = inspType === t;
            return (
              <TouchableOpacity
                key={t}
                onPress={() => setInspType(t)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? colors.secondary : colors.surfaceVariant,
                    borderColor: isSelected ? colors.secondary : colors.border,
                    borderRadius: borderRadius.sm,
                  },
                ]}
              >
                <Text
                  style={{
                    color: isSelected ? '#FFFFFF' : colors.textPrimary,
                    fontSize: 11,
                    fontWeight: isSelected ? '700' : '500',
                  }}
                >
                  {t}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Condition Check: Exterior */}
        <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 10 }]}>
          1. Exterior Paint & Bodywork
        </Text>
        <View style={styles.choiceRow}>
          {EXTERIOR_OPTIONS.map(opt => {
            const isSelected = exterior === opt;
            return (
              <TouchableOpacity
                key={opt}
                onPress={() => setExterior(opt)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderRadius: borderRadius.sm,
                  },
                ]}
              >
                <Text
                  style={{
                    color: isSelected ? colors.textInverse : colors.textPrimary,
                    fontSize: 11,
                    fontWeight: '700',
                  }}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Condition Check: Interior */}
        <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 10 }]}>
          2. Cabin & Upholstery Cleanliness
        </Text>
        <View style={styles.choiceRow}>
          {INTERIOR_OPTIONS.map(opt => {
            const isSelected = interior === opt;
            return (
              <TouchableOpacity
                key={opt}
                onPress={() => setInterior(opt)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderRadius: borderRadius.sm,
                  },
                ]}
              >
                <Text
                  style={{
                    color: isSelected ? colors.textInverse : colors.textPrimary,
                    fontSize: 11,
                    fontWeight: '700',
                  }}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Condition Check: Tires & Brakes */}
        <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 10 }]}>
          3. Tires, Wheels & Brake Pads
        </Text>
        <View style={styles.choiceRow}>
          {TIRE_OPTIONS.map(opt => {
            const isSelected = tires === opt;
            return (
              <TouchableOpacity
                key={opt}
                onPress={() => setTires(opt)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderRadius: borderRadius.sm,
                  },
                ]}
              >
                <Text
                  style={{
                    color: isSelected ? colors.textInverse : colors.textPrimary,
                    fontSize: 11,
                    fontWeight: '700',
                  }}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Telematics Metrics */}
        <View style={{ flexDirection: 'row', marginTop: 8 }}>
          <Input
            label="Fuel / Charge Level (%)"
            value={fuel}
            onChangeText={setFuel}
            keyboardType="numeric"
            containerStyle={{ flex: 1, marginRight: 8 }}
          />
          <Input
            label="Odometer (km)"
            value={odometer}
            onChangeText={setOdometer}
            keyboardType="numeric"
            containerStyle={{ flex: 1 }}
          />
        </View>

        <Input
          label="Inspector Remarks"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={2}
        />

        {/* Pass / Fail Toggle */}
        <Card variant="flat" padding="medium" style={[styles.passCard, { borderColor: colors.border }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={{ color: colors.textPrimary, fontWeight: '700', fontSize: 13 }}>
                Inspection Passed
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>
                {passed
                  ? 'Vehicle meets all safety standards for customer handover.'
                  : 'Fails safety certification; vehicle will be locked into Maintenance.'}
              </Text>
            </View>
            <Switch
              value={passed}
              onValueChange={setPassed}
              trackColor={{ false: colors.danger, true: colors.accent }}
              thumbColor="#FFFFFF"
            />
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
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  vehicleChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  choiceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
  },
  passCard: {
    borderWidth: 1,
    marginTop: 10,
  },
  footerBar: {
    borderTopWidth: 1,
  },
});
