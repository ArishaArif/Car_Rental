import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { FleetManagerStackParamList, MaintenanceStatus, MaintenanceType } from '../../types';
import { useTheme } from '../../theme';
import { useFleet } from '../../context/FleetContext';
import { ScreenContainer, Header, Card, Input, Button } from '../../components/common';

type ScheduleMaintNavProp = NativeStackNavigationProp<
  FleetManagerStackParamList,
  'ScheduleMaintenance'
>;
type ScheduleMaintRouteProp = RouteProp<
  FleetManagerStackParamList,
  'ScheduleMaintenance'
>;

interface Props {
  navigation: ScheduleMaintNavProp;
  route: ScheduleMaintRouteProp;
}

const SERVICE_TYPES: MaintenanceType[] = [
  'Oil Change',
  'Brake Inspection',
  'Tire Rotation',
  'Detailing & Cleaning',
  'Scheduled Service',
  'Battery & Electrical',
  'General Repair',
];

export const ScheduleMaintenanceScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { vehicles, scheduleMaintenance } = useFleet();

  const preselectedVehicleId = route.params?.vehicleId;
  const [selectedVehicleId, setSelectedVehicleId] = useState(
    preselectedVehicleId || vehicles[0]?.id || ''
  );
  const [selectedType, setSelectedType] = useState<MaintenanceType>('Oil Change');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [estimatedCost, setEstimatedCost] = useState('120');
  const [serviceCenter, setServiceCenter] = useState('Metro Certified Hub West');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<MaintenanceStatus>('Scheduled');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

  const handleSubmit = async () => {
    if (!selectedVehicle) {
      Alert.alert('Error', 'Please select a vehicle');
      return;
    }

    setIsSubmitting(true);
    try {
      await scheduleMaintenance({
        vehicleId: selectedVehicle.id,
        vehicleName: `${selectedVehicle.brand} ${selectedVehicle.model}`,
        type: selectedType,
        dueDate,
        status,
        estimatedCost: Number(estimatedCost) || 100,
        serviceCenter: serviceCenter.trim() || 'Internal Fleet Depot',
        notes: notes.trim(),
      });

      Alert.alert(
        'Maintenance Scheduled',
        `Work order created for ${selectedVehicle.brand} ${selectedVehicle.model}.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to schedule service');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="Schedule Maintenance"
          subtitle="Create workshop service ticket"
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
            title={isSubmitting ? 'Booking Service...' : 'Confirm Service Ticket'}
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
        {/* Vehicle Selector */}
        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Target Fleet Vehicle *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
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
                <Text
                  style={{
                    color: isSelected ? colors.textInverse : colors.textMuted,
                    fontSize: 10,
                    marginTop: 2,
                  }}
                >
                  {v.availability}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Maintenance Type */}
        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Maintenance Type *</Text>
        <View style={styles.typesGrid}>
          {SERVICE_TYPES.map(st => {
            const isSelected = selectedType === st;
            return (
              <TouchableOpacity
                key={st}
                onPress={() => setSelectedType(st)}
                style={[
                  styles.typeChip,
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
                  {st}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Schedule Inputs */}
        <View style={styles.row}>
          <Input
            label="Service Due Date (YYYY-MM-DD)"
            value={dueDate}
            onChangeText={setDueDate}
            containerStyle={{ flex: 1, marginRight: 8 }}
          />
          <Input
            label="Estimated Cost ($)"
            value={estimatedCost}
            onChangeText={setEstimatedCost}
            keyboardType="numeric"
            containerStyle={{ flex: 1 }}
          />
        </View>

        <Input
          label="Authorized Service Center"
          value={serviceCenter}
          onChangeText={setServiceCenter}
        />

        <Input
          label="Technician Work Notes"
          placeholder="e.g. Check rotor thickness, replace cabin microfilter..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />
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
    padding: 10,
    borderWidth: 1,
    marginRight: 8,
    minWidth: 130,
  },
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  typeChip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
  },
  footerBar: {
    borderTopWidth: 1,
  },
});
