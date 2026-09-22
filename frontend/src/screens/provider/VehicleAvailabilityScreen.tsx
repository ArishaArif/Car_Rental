import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ProviderStackParamList, VehicleAvailability } from '../../types';
import { useTheme } from '../../theme';
import { useFleet } from '../../context/FleetContext';
import { ScreenContainer, Header, Input, Button } from '../../components/common';

type VehicleAvailNavProp = NativeStackNavigationProp<
  ProviderStackParamList,
  'VehicleAvailability'
>;
type VehicleAvailRouteProp = RouteProp<
  ProviderStackParamList,
  'VehicleAvailability'
>;

interface Props {
  navigation: VehicleAvailNavProp;
  route: VehicleAvailRouteProp;
}

const AVAILABILITY_OPTIONS: {
  status: VehicleAvailability;
  title: string;
  description: string;
  icon: string;
  badgeColor: string;
}[] = [
  {
    status: 'Available',
    title: 'Available for Rental',
    description: 'Vehicle is prepped, verified, and ready for customer discovery and instant bookings.',
    icon: '✅',
    badgeColor: '#10B981',
  },
  {
    status: 'Booked',
    title: 'Booked / Reserved',
    description: 'Vehicle has upcoming confirmed customer reservation; holding for scheduled pickup.',
    icon: '📅',
    badgeColor: '#8B5CF6',
  },
  {
    status: 'Active Rental',
    title: 'Active Rental (On Road)',
    description: 'Vehicle is currently in customer possession and on an active rental trip.',
    icon: '🔑',
    badgeColor: '#00E5FF',
  },
  {
    status: 'Maintenance',
    title: 'In Maintenance / Service',
    description: 'Vehicle is under routine mechanical service, tire work, or scheduled detailing.',
    icon: '🛠️',
    badgeColor: '#F59E0B',
  },
  {
    status: 'Archived',
    title: 'Archived / Decommissioned',
    description: 'Vehicle is retired from fleet rotation or taken off-market temporarily.',
    icon: '📦',
    badgeColor: '#EF4444',
  },
];

export const VehicleAvailabilityScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { vehicleId } = route.params;
  const { vehicles, setAvailability } = useFleet();

  const vehicle = vehicles.find(v => v.id === vehicleId);

  const [selectedStatus, setSelectedStatus] = useState<VehicleAvailability>(
    vehicle?.availability || 'Available'
  );
  const [reason, setReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!vehicle) {
    return (
      <ScreenContainer
        header={<Header title="Vehicle Not Found" showBack onBackPress={() => navigation.goBack()} />}
      >
        <View style={{ padding: spacing.xl, alignItems: 'center' }}>
          <Text style={{ color: colors.textSecondary }}>Vehicle not found.</Text>
          <Button title="Back" onPress={() => navigation.goBack()} style={{ marginTop: spacing.md }} />
        </View>
      </ScreenContainer>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setAvailability(vehicle.id, selectedStatus);
      Alert.alert(
        'Status Updated',
        `${vehicle.brand} ${vehicle.model} is now marked as "${selectedStatus}".`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to update availability');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="Vehicle Availability"
          subtitle={`${vehicle.brand} ${vehicle.model} • Current: ${vehicle.availability}`}
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
            title={isSaving ? 'Updating Status...' : 'Apply Status Change'}
            variant="primary"
            size="large"
            fullWidth
            loading={isSaving}
            onPress={handleSave}
          />
        </View>
      }
    >
      <View style={[styles.content, { padding: spacing.md }]}>
        <Text
          style={[
            styles.sectionHeading,
            {
              color: colors.textPrimary,
              fontSize: typography.fontSizes.md,
              fontWeight: typography.fontWeights.bold,
              marginBottom: spacing.xs,
            },
          ]}
        >
          Select Operational Status
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs, marginBottom: spacing.md }}>
          Updating vehicle availability directly adjusts customer discovery visibility and dispatch workflows.
        </Text>

        {AVAILABILITY_OPTIONS.map(opt => {
          const isSelected = selectedStatus === opt.status;

          return (
            <TouchableOpacity
              key={opt.status}
              activeOpacity={0.88}
              onPress={() => setSelectedStatus(opt.status)}
              style={[
                styles.optionCard,
                {
                  backgroundColor: isSelected ? colors.surface : colors.surfaceVariant,
                  borderColor: isSelected ? opt.badgeColor : colors.border,
                  borderWidth: isSelected ? 2 : 1,
                  borderRadius: borderRadius.md,
                  padding: spacing.md,
                  marginBottom: spacing.sm + 4,
                },
              ]}
            >
              <View style={styles.optionHeader}>
                <View style={styles.iconAndTitle}>
                  <Text style={{ fontSize: 20, marginRight: 10 }}>{opt.icon}</Text>
                  <View>
                    <Text
                      style={{
                        color: colors.textPrimary,
                        fontSize: typography.fontSizes.sm + 1,
                        fontWeight: '700',
                      }}
                    >
                      {opt.title}
                    </Text>
                    <Text
                      style={{
                        color: opt.badgeColor,
                        fontSize: 10,
                        fontWeight: '800',
                        marginTop: 1,
                      }}
                    >
                      {opt.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Radio Indicator */}
                <View
                  style={[
                    styles.radio,
                    {
                      borderColor: isSelected ? opt.badgeColor : colors.textMuted,
                      backgroundColor: isSelected ? opt.badgeColor : 'transparent',
                    },
                  ]}
                >
                  {isSelected ? <View style={styles.radioInner} /> : null}
                </View>
              </View>

              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: typography.fontSizes.xs,
                  marginTop: 8,
                  lineHeight: 18,
                }}
              >
                {opt.description}
              </Text>
            </TouchableOpacity>
          );
        })}

        <Input
          label="Operational Note / Reason (Optional)"
          placeholder="e.g. Scheduled for 20,000 km oil change; expected back tomorrow"
          value={reason}
          onChangeText={setReason}
          multiline
          numberOfLines={2}
          containerStyle={{ marginTop: spacing.sm }}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
  },
  sectionHeading: {
    letterSpacing: -0.2,
  },
  optionCard: {
    borderWidth: 1,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconAndTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  footerBar: {
    borderTopWidth: 1,
  },
});
