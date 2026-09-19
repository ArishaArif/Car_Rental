import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList, FilterOptions, SortOption, Vehicle, VehicleCategory } from '../../types';
import { useTheme } from '../../theme';
import { vehicleService } from '../../services/vehicleService';
import { ScreenContainer, Header, Input, CarCard, EmptyState } from '../../components/common';

type SearchCarsScreenNavigationProp = NativeStackNavigationProp<
  CustomerStackParamList,
  'SearchCars'
>;
type SearchCarsScreenRouteProp = RouteProp<CustomerStackParamList, 'SearchCars'>;

interface SearchCarsScreenProps {
  navigation: SearchCarsScreenNavigationProp;
  route: SearchCarsScreenRouteProp;
}

const CATEGORIES: (VehicleCategory | 'All')[] = ['All', 'Economy', 'Sedan', 'SUV', 'Luxury'];

export const SearchCarsScreen: React.FC<SearchCarsScreenProps> = ({ navigation, route }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();

  const [query, setQuery] = useState(route.params?.initialQuery || '');
  const [selectedCategory, setSelectedCategory] = useState<VehicleCategory | 'All'>(
    route.params?.initialCategory || 'All'
  );
  const [filters, setFilters] = useState<FilterOptions>({});
  const [sortOption, setSortOption] = useState<SortOption>('rating_desc');
  const [results, setResults] = useState<Vehicle[]>([]);

  const performSearch = useCallback(async () => {
    const activeFilters: FilterOptions = {
      ...filters,
      category: selectedCategory !== 'All' ? selectedCategory : undefined,
    };
    const cars = await vehicleService.searchAndFilterVehicles(query, activeFilters, sortOption);
    setResults(cars);
  }, [query, selectedCategory, filters, sortOption]);

  useEffect(() => {
    performSearch();
  }, [performSearch]);

  const handleClear = () => {
    setQuery('');
    setSelectedCategory('All');
    setFilters({});
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="Search Fleet"
          subtitle="Explore vehicles by brand, model, location"
          showBack
          onBackPress={() => navigation.goBack()}
          rightElement={
            <TouchableOpacity
              onPress={() => navigation.navigate('FilterScreen', { currentFilters: filters })}
              style={[
                styles.filterBtn,
                {
                  backgroundColor: colors.surfaceVariant,
                  borderColor: colors.border,
                  borderRadius: borderRadius.md,
                },
              ]}
            >
              <Text style={{ fontSize: 16 }}>⚙️</Text>
            </TouchableOpacity>
          }
        />
      }
    >
      <View style={[styles.content, { padding: spacing.md }]}>
        {/* Search Input */}
        <Input
          placeholder="Search Corolla, Civic, Sportage, SUV, Terminal..."
          value={query}
          onChangeText={setQuery}
          autoFocus={!route.params?.initialQuery}
          leftIcon={<Text style={{ color: colors.textMuted }}>🔍</Text>}
          rightIcon={
            query.length > 0 ? (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Text style={{ color: colors.textMuted, fontWeight: '700', padding: 4 }}>✕</Text>
              </TouchableOpacity>
            ) : null
          }
        />

        {/* Quick Category Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.categoryScroll, { paddingBottom: spacing.sm }]}
        >
          {CATEGORIES.map(cat => {
            const isActive = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                activeOpacity={0.8}
                onPress={() => setSelectedCategory(cat)}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: isActive ? colors.primary : colors.surfaceVariant,
                    borderColor: isActive ? colors.primary : colors.border,
                    borderRadius: borderRadius.full,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    {
                      color: isActive ? colors.textInverse : colors.textSecondary,
                      fontSize: typography.fontSizes.xs,
                      fontWeight: isActive ? '700' : '500',
                    },
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Results Bar */}
        <View style={styles.resultsBar}>
          <Text
            style={[
              styles.resultsCount,
              { color: colors.textSecondary, fontSize: typography.fontSizes.sm },
            ]}
          >
            Found <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{results.length}</Text> {results.length === 1 ? 'vehicle' : 'vehicles'}
          </Text>

          {/* Quick Sort Trigger */}
          <TouchableOpacity
            onPress={() => {
              setSortOption(prev =>
                prev === 'rating_desc'
                  ? 'price_asc'
                  : prev === 'price_asc'
                  ? 'price_desc'
                  : 'rating_desc'
              );
            }}
            style={styles.sortTrigger}
          >
            <Text style={{ color: colors.primary, fontSize: typography.fontSizes.xs, fontWeight: '700' }}>
              ⇅ {sortOption === 'rating_desc' ? 'TOP RATED' : sortOption === 'price_asc' ? 'PRICE: LOW' : 'PRICE: HIGH'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Vehicle Results List */}
        {results.length === 0 ? (
          <EmptyState
            title="No Matching Vehicles"
            message={`No vehicles found matching "${query}". Try adjusting your filters or search term.`}
            actionTitle="Reset Search"
            onAction={handleClear}
            style={{ marginTop: 24 }}
          />
        ) : (
          <View style={{ marginTop: spacing.sm }}>
            {results.map(car => (
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
  filterBtn: {
    width: 38,
    height: 38,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryScroll: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 4,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
  },
  categoryChipText: {
    letterSpacing: 0.3,
  },
  resultsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  resultsCount: {
    letterSpacing: 0.1,
  },
  sortTrigger: {
    padding: 6,
  },
});
