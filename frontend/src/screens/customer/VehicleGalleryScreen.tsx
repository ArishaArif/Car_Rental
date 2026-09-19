import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList, FilterOptions, SortOption, Vehicle, VehicleCategory } from '../../types';
import { useTheme } from '../../theme';
import { vehicleService } from '../../services/vehicleService';
import { ScreenContainer, Header, CarCard, EmptyState, Loading } from '../../components/common';

type VehicleGalleryScreenNavigationProp = NativeStackNavigationProp<
  CustomerStackParamList,
  'VehicleGallery'
>;
type VehicleGalleryScreenRouteProp = RouteProp<CustomerStackParamList, 'VehicleGallery'>;

interface VehicleGalleryScreenProps {
  navigation: VehicleGalleryScreenNavigationProp;
  route: VehicleGalleryScreenRouteProp;
}

export const VehicleGalleryScreen: React.FC<VehicleGalleryScreenProps> = ({
  navigation,
  route,
}) => {
  const { colors, typography, spacing, borderRadius } = useTheme();

  const [category, setCategory] = useState<VehicleCategory | undefined>(route.params?.category);
  const [filters, setFilters] = useState<FilterOptions>(route.params?.filterParams || {});
  const [sort, setSort] = useState<SortOption>(route.params?.sortOption || 'rating_desc');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync if route params change
  useEffect(() => {
    if (route.params?.category) {
      setCategory(route.params.category);
    }
    if (route.params?.filterParams) {
      setFilters(route.params.filterParams);
    }
    if (route.params?.sortOption) {
      setSort(route.params.sortOption);
    }
  }, [route.params?.category, route.params?.filterParams, route.params?.sortOption]);

  const loadVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const activeFilters: FilterOptions = {
        ...filters,
        category: category || filters.category,
      };
      const res = await vehicleService.searchAndFilterVehicles('', activeFilters, sort);
      setVehicles(res);
    } finally {
      setLoading(false);
    }
  }, [category, filters, sort]);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  const getSortLabel = () => {
    switch (sort) {
      case 'price_asc':
        return 'Price: Low';
      case 'price_desc':
        return 'Price: High';
      case 'year_desc':
        return 'Newest';
      case 'rating_desc':
      default:
        return 'Top Rated';
    }
  };

  const handleResetFilters = () => {
    setCategory(undefined);
    setFilters({});
    setSort('rating_desc');
  };

  const hasActiveFilters = Boolean(
    category ||
      filters.category ||
      filters.maxPrice ||
      filters.transmission ||
      filters.fuel ||
      filters.seats ||
      filters.availableOnly
  );

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="Vehicle Gallery"
          subtitle={category ? `${category} Class Fleet` : 'All Available Vehicles'}
          showBack
          onBackPress={() => navigation.goBack()}
          rightElement={
            <TouchableOpacity
              onPress={() => navigation.navigate('SearchCars')}
              style={[
                styles.searchIconBtn,
                {
                  backgroundColor: colors.surfaceVariant,
                  borderColor: colors.border,
                  borderRadius: borderRadius.md,
                },
              ]}
            >
              <Text style={{ fontSize: 16 }}>🔍</Text>
            </TouchableOpacity>
          }
        />
      }
    >
      <View style={[styles.content, { padding: spacing.md }]}>
        {/* Controls Bar (Filter & Sort buttons) */}
        <View style={styles.controlsBar}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate('FilterScreen', {
                currentFilters: { ...filters, category: category || filters.category },
              })
            }
            style={[
              styles.controlButton,
              {
                backgroundColor: hasActiveFilters ? 'rgba(0, 229, 255, 0.15)' : colors.surfaceVariant,
                borderColor: hasActiveFilters ? colors.primary : colors.border,
                borderRadius: borderRadius.md,
              },
            ]}
          >
            <Text style={{ fontSize: 14, marginRight: 6 }}>⚙️</Text>
            <Text
              style={[
                styles.controlButtonText,
                {
                  color: hasActiveFilters ? colors.primary : colors.textPrimary,
                  fontSize: typography.fontSizes.xs,
                  fontWeight: '700',
                },
              ]}
            >
              FILTERS {hasActiveFilters ? '●' : ''}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('SortScreen', { currentSort: sort })}
            style={[
              styles.controlButton,
              {
                backgroundColor: colors.surfaceVariant,
                borderColor: colors.border,
                borderRadius: borderRadius.md,
                marginLeft: 10,
              },
            ]}
          >
            <Text style={{ fontSize: 14, marginRight: 6 }}>⇅</Text>
            <Text
              style={[
                styles.controlButtonText,
                {
                  color: colors.textPrimary,
                  fontSize: typography.fontSizes.xs,
                  fontWeight: '700',
                },
              ]}
            >
              {getSortLabel().toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Active Filter Chips Scroll */}
        {hasActiveFilters ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.activeChipsContainer}
          >
            {category ? (
              <View
                style={[
                  styles.activeChip,
                  {
                    backgroundColor: colors.surfaceVariant,
                    borderColor: colors.primary,
                    borderRadius: borderRadius.full,
                  },
                ]}
              >
                <Text style={[styles.activeChipText, { color: colors.primary, fontSize: typography.fontSizes.xs }]}>
                  {category}
                </Text>
                <TouchableOpacity onPress={() => setCategory(undefined)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={[styles.activeChipClose, { color: colors.textMuted }]}>✕</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {filters.transmission ? (
              <View
                style={[
                  styles.activeChip,
                  {
                    backgroundColor: colors.surfaceVariant,
                    borderColor: colors.border,
                    borderRadius: borderRadius.full,
                  },
                ]}
              >
                <Text style={[styles.activeChipText, { color: colors.textSecondary, fontSize: typography.fontSizes.xs }]}>
                  {filters.transmission}
                </Text>
                <TouchableOpacity
                  onPress={() => setFilters(prev => ({ ...prev, transmission: undefined }))}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={[styles.activeChipClose, { color: colors.textMuted }]}>✕</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {filters.fuel ? (
              <View
                style={[
                  styles.activeChip,
                  {
                    backgroundColor: colors.surfaceVariant,
                    borderColor: colors.border,
                    borderRadius: borderRadius.full,
                  },
                ]}
              >
                <Text style={[styles.activeChipText, { color: colors.textSecondary, fontSize: typography.fontSizes.xs }]}>
                  {filters.fuel}
                </Text>
                <TouchableOpacity
                  onPress={() => setFilters(prev => ({ ...prev, fuel: undefined }))}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={[styles.activeChipClose, { color: colors.textMuted }]}>✕</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {filters.availableOnly ? (
              <View
                style={[
                  styles.activeChip,
                  {
                    backgroundColor: colors.surfaceVariant,
                    borderColor: colors.accent,
                    borderRadius: borderRadius.full,
                  },
                ]}
              >
                <Text style={[styles.activeChipText, { color: colors.accent, fontSize: typography.fontSizes.xs }]}>
                  Available Only
                </Text>
                <TouchableOpacity
                  onPress={() => setFilters(prev => ({ ...prev, availableOnly: false }))}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={[styles.activeChipClose, { color: colors.textMuted }]}>✕</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            <TouchableOpacity onPress={handleResetFilters} style={styles.clearAllBtn}>
              <Text style={{ color: colors.danger, fontSize: typography.fontSizes.xs, fontWeight: '700' }}>
                Reset All
              </Text>
            </TouchableOpacity>
          </ScrollView>
        ) : null}

        {/* Results Counter Header */}
        <View style={styles.countHeader}>
          <Text style={[styles.countLabel, { color: colors.textMuted, fontSize: typography.fontSizes.xs }]}>
            SHOWING <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{vehicles.length}</Text> VEHICLES
          </Text>
        </View>

        {/* Vehicle List or Empty State */}
        {loading ? (
          <Loading message="Filtering fleet..." style={{ marginVertical: 32 }} />
        ) : vehicles.length === 0 ? (
          <EmptyState
            title="No Vehicles Found"
            message="We couldn't find any vehicles matching your active criteria. Try loosening your filter criteria."
            actionTitle="Reset Filters"
            onAction={handleResetFilters}
            style={{ marginTop: 24 }}
          />
        ) : (
          <View style={{ marginTop: spacing.xs }}>
            {vehicles.map(car => (
              <CarCard
                key={car.id}
                vehicle={car}
                onPress={() => navigation.navigate('CarDetails', { vehicleId: car.id })}
              />
            ))}
          </View>
        )}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
  },
  searchIconBtn: {
    width: 38,
    height: 38,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderWidth: 1.5,
  },
  controlButtonText: {
    letterSpacing: 0.5,
  },
  activeChipsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    marginBottom: 8,
  },
  activeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  activeChipText: {
    fontWeight: '600',
    marginRight: 6,
  },
  activeChipClose: {
    fontWeight: '700',
  },
  clearAllBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  countHeader: {
    marginVertical: 6,
  },
  countLabel: {
    letterSpacing: 0.8,
    fontWeight: '600',
  },
});
