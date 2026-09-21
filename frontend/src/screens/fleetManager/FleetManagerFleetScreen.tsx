import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { FleetManagerStackParamList, Vehicle, VehicleAvailability } from '../../types';
import { useTheme } from '../../theme';
import { useFleet } from '../../context/FleetContext';
import { ScreenContainer, Header, Card, Input, EmptyState } from '../../components/common';

type FleetManagerFleetNavProp = NativeStackNavigationProp<
  FleetManagerStackParamList,
  'FleetManagerFleet'
>;
type FleetManagerFleetRouteProp = RouteProp<
  FleetManagerStackParamList,
  'FleetManagerFleet'
>;

interface Props {
  navigation: FleetManagerFleetNavProp;
  route: FleetManagerFleetRouteProp;
}

const STATUS_FILTERS: (VehicleAvailability | 'All')[] = [
  'All',
  'Available',
  'Active Rental',
  'Booked',
  'Maintenance',
  'Archived',
];

export const FleetManagerFleetScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { vehicles } = useFleet();

  const initialFilter = route.params?.filterStatus || 'All';
  const [activeStatus, setActiveStatus] = useState<VehicleAvailability | 'All'>(initialFilter);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVehicles = vehicles.filter(v => {
    if (activeStatus !== 'All' && v.availability !== activeStatus) return false;
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      return (
        `${v.brand} ${v.model}`.toLowerCase().includes(q) ||
        v.location.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: VehicleAvailability) => {
    switch (status) {
      case 'Available':
        return { label: 'AVAILABLE', color: colors.accent, bg: 'rgba(16, 185, 129, 0.15)' };
      case 'Active Rental':
      case 'Rented':
        return { label: 'IN RENTAL', color: colors.primary, bg: 'rgba(0, 229, 255, 0.15)' };
      case 'Booked':
      case 'Reserved':
        return { label: 'BOOKED', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.15)' };
      case 'Maintenance':
        return { label: 'MAINTENANCE', color: colors.warning, bg: 'rgba(245, 158, 11, 0.15)' };
      case 'Archived':
      default:
        return { label: 'ARCHIVED', color: colors.textMuted, bg: 'rgba(148, 163, 184, 0.15)' };
    }
  };

  const renderItem = ({ item }: { item: Vehicle }) => {
    const badge = getStatusBadge(item.availability);

    return (
      <Card
        variant="elevated"
        padding="medium"
        style={[styles.vehicleCard, { borderColor: colors.border }]}
        onPress={() =>
          navigation.navigate('FleetManagerVehicleDetails', { vehicleId: item.id })
        }
      >
        <View style={styles.topRow}>
          <Image source={{ uri: item.image }} style={styles.thumb} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: typography.fontSizes.sm + 1,
                  fontWeight: '700',
                  flex: 1,
                }}
              >
                {item.brand} {item.model}
              </Text>
              <View
                style={[
                  styles.badgePill,
                  { backgroundColor: badge.bg, borderColor: badge.color, borderRadius: borderRadius.xs },
                ]}
              >
                <Text style={{ color: badge.color, fontSize: 9, fontWeight: '800' }}>
                  {badge.label}
                </Text>
              </View>
            </View>

            <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>
              {item.year} • {item.category} • {item.transmission}
            </Text>

            <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 2 }}>
              📍 {item.location}
            </Text>
          </View>
        </View>

        {/* Telematics Bar */}
        <View style={[styles.telematicsBar, { backgroundColor: colors.surfaceVariant, borderRadius: borderRadius.sm }]}>
          <View style={styles.telemCol}>
            <Text style={{ color: colors.textMuted, fontSize: 9 }}>ODOMETER</Text>
            <Text style={{ color: colors.textPrimary, fontSize: 11, fontWeight: '700' }}>
              {item.mileage?.toLocaleString() || '15,000'} km
            </Text>
          </View>

          <View style={styles.telemDivider} />

          <View style={styles.telemCol}>
            <Text style={{ color: colors.textMuted, fontSize: 9 }}>FUEL / POWER</Text>
            <Text style={{ color: colors.accent, fontSize: 11, fontWeight: '700' }}>
              {item.fuel} (100%)
            </Text>
          </View>

          <View style={styles.telemDivider} />

          <View style={styles.telemCol}>
            <Text style={{ color: colors.textMuted, fontSize: 9 }}>HEALTH</Text>
            <Text
              style={{
                color: item.availability === 'Maintenance' ? colors.warning : colors.accent,
                fontSize: 11,
                fontWeight: '700',
              }}
            >
              {item.availability === 'Maintenance' ? 'In Service' : 'Certified'}
            </Text>
          </View>
        </View>

        {/* Quick Operations Actions */}
        <View style={[styles.actionRow, { borderTopColor: colors.border }]}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('FleetManagerVehicleDetails', { vehicleId: item.id })
            }
            style={[styles.smallBtn, { backgroundColor: colors.surfaceVariant, borderRadius: borderRadius.sm }]}
          >
            <Text style={{ color: colors.textPrimary, fontSize: 11, fontWeight: '700' }}>
              Details
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('ScheduleMaintenance', { vehicleId: item.id })}
            style={[styles.smallBtn, { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderRadius: borderRadius.sm }]}
          >
            <Text style={{ color: colors.warning, fontSize: 11, fontWeight: '700' }}>
              + Service
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('NewInspection', { vehicleId: item.id })}
            style={[styles.smallBtn, { backgroundColor: 'rgba(0, 229, 255, 0.15)', borderRadius: borderRadius.sm }]}
          >
            <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '700' }}>
              + Inspect
            </Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <ScreenContainer
      header={
        <Header
          title="Fleet Telematics Registry"
          subtitle={`${vehicles.length} Vehicles Under Operations`}
          showBack
          onBackPress={() => navigation.goBack()}
        />
      }
    >
      <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.xs }}>
        <Input
          placeholder="Filter brand, model, depot location..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          containerStyle={{ marginBottom: 4 }}
          leftIcon={<Text style={{ fontSize: 14 }}>🔍</Text>}
        />

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STATUS_FILTERS}
          keyExtractor={item => item}
          contentContainerStyle={styles.filterRow}
          renderItem={({ item }) => {
            const isSelected = activeStatus === item;
            return (
              <TouchableOpacity
                onPress={() => setActiveStatus(item)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderRadius: borderRadius.full,
                  },
                ]}
              >
                <Text
                  style={{
                    color: isSelected ? colors.textInverse : colors.textSecondary,
                    fontSize: 11,
                    fontWeight: isSelected ? '700' : '500',
                  }}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <FlatList
        data={filteredVehicles}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={[styles.listContent, { padding: spacing.md }]}
        ListEmptyComponent={
          <EmptyState
            title="No Matching Vehicles"
            message={`No vehicles matching "${activeStatus}".`}
            actionTitle="Show All Fleet"
            onAction={() => setActiveStatus('All')}
          />
        }
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  filterRow: {
    paddingVertical: 8,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  listContent: {
    paddingBottom: 32,
    gap: 12,
  },
  vehicleCard: {
    borderWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumb: {
    width: 75,
    height: 60,
    borderRadius: 6,
  },
  badgePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
  },
  telematicsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    marginTop: 10,
  },
  telemCol: {
    flex: 1,
    alignItems: 'center',
  },
  telemDivider: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  smallBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
});
