import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ProviderStackParamList, Vehicle, VehicleAvailability } from '../../types';
import { useTheme } from '../../theme';
import { useFleet } from '../../context/FleetContext';
import { ScreenContainer, Header, Card, Input, Button, EmptyState } from '../../components/common';

type FleetListNavProp = NativeStackNavigationProp<ProviderStackParamList, 'FleetList'>;
type FleetListRouteProp = RouteProp<ProviderStackParamList, 'FleetList'>;

interface Props {
  navigation: FleetListNavProp;
  route: FleetListRouteProp;
}

const STATUS_FILTERS: (VehicleAvailability | 'All')[] = [
  'All',
  'Available',
  'Booked',
  'Active Rental',
  'Maintenance',
  'Archived',
];

export const FleetListScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { vehicles, publishVehicle, unpublishVehicle } = useFleet();

  const initialFilter = route.params?.filterStatus || 'All';
  const [activeStatus, setActiveStatus] = useState<VehicleAvailability | 'All'>(initialFilter);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVehicles = vehicles.filter(v => {
    // Status filter
    if (activeStatus !== 'All' && v.availability !== activeStatus) {
      return false;
    }
    // Search query
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      const title = `${v.brand} ${v.model}`.toLowerCase();
      const cat = v.category.toLowerCase();
      const loc = v.location.toLowerCase();
      return title.includes(q) || cat.includes(q) || loc.includes(q);
    }
    return true;
  });

  const getStatusBadgeStyle = (status: VehicleAvailability) => {
    switch (status) {
      case 'Available':
        return { color: colors.accent, bg: 'rgba(16, 185, 129, 0.15)', label: 'AVAILABLE' };
      case 'Active Rental':
      case 'Rented':
        return { color: colors.primary, bg: 'rgba(0, 229, 255, 0.15)', label: 'ON TRIP' };
      case 'Booked':
      case 'Reserved':
        return { color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.15)', label: 'BOOKED' };
      case 'Maintenance':
        return { color: colors.warning, bg: 'rgba(245, 158, 11, 0.15)', label: 'MAINTENANCE' };
      case 'Archived':
      default:
        return { color: colors.textMuted, bg: 'rgba(148, 163, 184, 0.15)', label: 'ARCHIVED' };
    }
  };

  const handleTogglePublish = (vehicle: Vehicle) => {
    if (vehicle.isPublished) {
      unpublishVehicle(vehicle.id);
    } else {
      publishVehicle(vehicle.id);
    }
  };

  const renderVehicleItem = ({ item }: { item: Vehicle }) => {
    const badge = getStatusBadgeStyle(item.availability);
    const isPublished = item.isPublished !== false && item.availability !== 'Archived';

    return (
      <Card
        variant="elevated"
        padding="none"
        style={[styles.vehicleCard, { borderColor: colors.border }]}
        onPress={() => navigation.navigate('VehicleDetails', { vehicleId: item.id })}
      >
        <View style={styles.imageHeader}>
          <Image source={{ uri: item.image }} style={styles.vehicleImage} resizeMode="cover" />
          <View
            style={[
              styles.statusBadgeOverlay,
              { backgroundColor: badge.bg, borderColor: badge.color, borderRadius: borderRadius.xs },
            ]}
          >
            <Text style={{ color: badge.color, fontSize: 10, fontWeight: '800' }}>
              {badge.label}
            </Text>
          </View>

          <View
            style={[
              styles.publishBadgeOverlay,
              {
                backgroundColor: isPublished ? 'rgba(16, 185, 129, 0.9)' : 'rgba(100, 116, 139, 0.9)',
                borderRadius: borderRadius.xs,
              },
            ]}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 9, fontWeight: '700' }}>
              {isPublished ? '● PUBLISHED' : '○ DRAFT'}
            </Text>
          </View>
        </View>

        <View style={[styles.vehicleDetails, { padding: spacing.md }]}>
          <View style={styles.titlePriceRow}>
            <View style={{ flex: 1 }}>
              <Text
                numberOfLines={1}
                style={{
                  color: colors.textPrimary,
                  fontSize: typography.fontSizes.md,
                  fontWeight: typography.fontWeights.bold,
                }}
              >
                {item.brand} {item.model}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs, marginTop: 2 }}>
                {item.year} • {item.category} • {item.transmission} • {item.fuel}
              </Text>
            </View>
            <View style={styles.priceBlock}>
              <Text
                style={{
                  color: colors.primary,
                  fontSize: typography.fontSizes.lg,
                  fontWeight: typography.fontWeights.heavy,
                }}
              >
                ${item.pricePerDay}
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 10, textAlign: 'right' }}>
                /day
              </Text>
            </View>
          </View>

          <View style={styles.locationRow}>
            <Text numberOfLines={1} style={{ color: colors.textMuted, fontSize: 11 }}>
              📍 {item.location} • {item.mileage?.toLocaleString() || 12000} km
            </Text>
          </View>

          {/* Action Row */}
          <View style={[styles.actionsRow, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              onPress={() => navigation.navigate('VehicleDetails', { vehicleId: item.id })}
              style={[styles.smallBtn, { backgroundColor: colors.surfaceVariant, borderRadius: borderRadius.sm }]}
            >
              <Text numberOfLines={1} style={{ color: colors.textPrimary, fontSize: 11, fontWeight: '700' }}>
                Specs
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('EditVehicle', { vehicleId: item.id })}
              style={[styles.smallBtn, { backgroundColor: colors.surfaceVariant, borderRadius: borderRadius.sm }]}
            >
              <Text numberOfLines={1} style={{ color: colors.textPrimary, fontSize: 11, fontWeight: '700' }}>
                Edit
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('VehicleAvailability', { vehicleId: item.id })}
              style={[styles.smallBtn, { backgroundColor: colors.surfaceVariant, borderRadius: borderRadius.sm }]}
            >
              <Text numberOfLines={1} style={{ color: colors.secondary, fontSize: 11, fontWeight: '700' }}>
                Status
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleTogglePublish(item)}
              style={[
                styles.smallBtn,
                {
                  backgroundColor: isPublished ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  borderRadius: borderRadius.sm,
                },
              ]}
            >
              <Text
                numberOfLines={1}
                style={{
                  color: isPublished ? colors.danger : colors.accent,
                  fontSize: 11,
                  fontWeight: '700',
                }}
              >
                {isPublished ? 'Unpublish' : 'Publish'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <ScreenContainer
      header={
        <Header
          title="Fleet Inventory"
          subtitle={`${vehicles.length} Total Vehicles in Fleet`}
          showBack
          onBackPress={() => navigation.goBack()}
          rightElement={
            <Button
              title="+ Add"
              size="small"
              variant="primary"
              onPress={() => navigation.navigate('AddVehicle')}
            />
          }
        />
      }
    >
      <View style={[styles.topControls, { paddingHorizontal: spacing.md, paddingTop: spacing.sm }]}>
        <Input
          placeholder="Search brand, model, category..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          containerStyle={{ marginBottom: spacing.xs }}
          leftIcon={<Text style={{ fontSize: 14 }}>🔍</Text>}
          rightIcon={
            searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>✕</Text>
              </TouchableOpacity>
            ) : null
          }
        />

        {/* Filter Chips Bar */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STATUS_FILTERS}
          keyExtractor={item => item}
          contentContainerStyle={styles.filterChipsContainer}
          renderItem={({ item }) => {
            const isSelected = activeStatus === item;
            return (
              <TouchableOpacity
                activeOpacity={0.8}
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
                  style={[
                    styles.filterChipText,
                    {
                      color: isSelected ? colors.textInverse : colors.textSecondary,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
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
        renderItem={renderVehicleItem}
        contentContainerStyle={[styles.listContent, { padding: spacing.md }]}
        ListEmptyComponent={
          <EmptyState
            title="No Vehicles Found"
            message={`No vehicles matching filter '${activeStatus}' or query.`}
            actionTitle="Add New Vehicle"
            onAction={() => navigation.navigate('AddVehicle')}
          />
        }
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  topControls: {
    paddingBottom: 4,
  },
  filterChipsContainer: {
    paddingVertical: 8,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
  },
  listContent: {
    paddingBottom: 32,
    gap: 14,
  },
  vehicleCard: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  imageHeader: {
    position: 'relative',
    width: '100%',
    height: 160,
  },
  vehicleImage: {
    width: '100%',
    height: '100%',
  },
  statusBadgeOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
  },
  publishBadgeOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  vehicleDetails: {
    gap: 6,
  },
  titlePriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  priceBlock: {
    alignItems: 'flex-end',
  },
  locationRow: {
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    gap: 5,
  },
  smallBtn: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
