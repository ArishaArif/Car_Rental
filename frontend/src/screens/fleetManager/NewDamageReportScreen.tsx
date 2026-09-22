import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { DamageStatus, FleetManagerStackParamList } from '../../types';
import { useTheme } from '../../theme';
import { useFleet } from '../../context/FleetContext';
import { ScreenContainer, Header, Input, Button } from '../../components/common';

type NewDamageReportNavProp = NativeStackNavigationProp<
  FleetManagerStackParamList,
  'NewDamageReport'
>;
type NewDamageReportRouteProp = RouteProp<
  FleetManagerStackParamList,
  'NewDamageReport'
>;

interface Props {
  navigation: NewDamageReportNavProp;
  route: NewDamageReportRouteProp;
}

const DAMAGE_CATEGORIES: DamageStatus[] = [
  'Minor Scratches',
  'Dented Panel',
  'Cracked Glass',
  'Interior Damage',
  'Wheel Rim Scuff',
  'Mechanical / Engine',
];

export const NewDamageReportScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors, spacing, borderRadius } = useTheme();
  const { vehicles, createDamageReport } = useFleet();

  const preselectedVehicleId = route.params?.vehicleId;
  const preselectedBookingId = route.params?.bookingId;

  const [selectedVehicleId, setSelectedVehicleId] = useState(
    preselectedVehicleId || vehicles[0]?.id || ''
  );
  const [bookingId, setBookingId] = useState(preselectedBookingId || 'VLX-BK-91823');
  const [customerName, setCustomerName] = useState('Muhammad Ahmed');
  const [damageStatus, setDamageStatus] = useState<DamageStatus>('Minor Scratches');
  const [estimatedCharge, setEstimatedCharge] = useState('150');
  const [description, setDescription] = useState('Rear bumper scrape observed during dropoff inspection.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

  const handleSubmit = async () => {
    if (!selectedVehicle) {
      Alert.alert('Error', 'Please choose a vehicle');
      return;
    }

    setIsSubmitting(true);
    try {
      await createDamageReport({
        vehicleId: selectedVehicle.id,
        vehicleName: `${selectedVehicle.brand} ${selectedVehicle.model}`,
        bookingId: bookingId.trim(),
        customerName: customerName.trim(),
        damageStatus,
        description: description.trim(),
        estimatedCharge: Number(estimatedCharge) || 100,
        reviewStatus: 'Pending Review',
      });

      Alert.alert('Incident Reported', 'Damage report logged for manager claims review.', [
        { text: 'Done', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to file report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="File Damage Incident"
          subtitle="Document vehicle damage & repair costs"
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
            title={isSubmitting ? 'Filing Report...' : 'Submit Incident Report'}
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
        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Involved Vehicle *</Text>
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

        <View style={{ flexDirection: 'row' }}>
          <Input
            label="Associated Booking ID *"
            value={bookingId}
            onChangeText={setBookingId}
            containerStyle={{ flex: 1, marginRight: 8 }}
          />
          <Input
            label="Renter / Driver Name"
            value={customerName}
            onChangeText={setCustomerName}
            containerStyle={{ flex: 1 }}
          />
        </View>

        {/* Damage Category */}
        <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 4 }]}>
          Damage Category *
        </Text>
        <View style={styles.choiceRow}>
          {DAMAGE_CATEGORIES.map(cat => {
            const isSelected = damageStatus === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setDamageStatus(cat)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? colors.danger : colors.surfaceVariant,
                    borderColor: isSelected ? colors.danger : colors.border,
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
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Input
          label="Estimated Repair Cost ($) *"
          value={estimatedCharge}
          onChangeText={setEstimatedCharge}
          keyboardType="numeric"
        />

        <Input
          label="Incident Description & Location on Vehicle"
          value={description}
          onChangeText={setDescription}
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
  footerBar: {
    borderTopWidth: 1,
  },
});
