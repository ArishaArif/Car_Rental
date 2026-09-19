import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  CustomerStackParamList,
  FilterOptions,
  TransmissionType,
  VehicleCategory,
  VehicleFuelType,
} from '../../types';
import { useTheme } from '../../theme';
import { ScreenContainer, Header, Button } from '../../components/common';

type FilterScreenNavigationProp = NativeStackNavigationProp<
  CustomerStackParamList,
  'FilterScreen'
>;
type FilterScreenRouteProp = RouteProp<CustomerStackParamList, 'FilterScreen'>;

interface FilterScreenProps {
  navigation: FilterScreenNavigationProp;
  route: FilterScreenRouteProp;
}

const CATEGORIES: (VehicleCategory | 'All')[] = ['All', 'Economy', 'Sedan', 'SUV', 'Luxury'];
const TRANSMISSIONS: (TransmissionType | 'All')[] = ['All', 'Automatic', 'Manual'];
const FUELS: (VehicleFuelType | 'All')[] = ['All', 'Petrol', 'Diesel', 'Hybrid', 'Electric'];
const SEATS_OPTIONS: (number | 'All')[] = ['All', 4, 5, 7];

const PRICE_TIERS = [
  { label: 'Any Price', min: undefined, max: undefined },
  { label: 'Under $50', min: 0, max: 50 },
  { label: '$50 - $100', min: 50, max: 100 },
  { label: '$100 - $150', min: 100, max: 150 },
  { label: '$150+', min: 150, max: 500 },
];

export const FilterScreen: React.FC<FilterScreenProps> = ({ navigation, route }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();

  const initial = route.params?.currentFilters || {};

  const [selectedCategory, setSelectedCategory] = useState<VehicleCategory | 'All'>(
    initial.category || 'All'
  );
  const [selectedPriceTier, setSelectedPriceTier] = useState<number>(() => {
    if (initial.maxPrice === 50) return 1;
    if (initial.minPrice === 50 && initial.maxPrice === 100) return 2;
    if (initial.minPrice === 100 && initial.maxPrice === 150) return 3;
    if (initial.minPrice === 150) return 4;
    return 0;
  });
  const [selectedTransmission, setSelectedTransmission] = useState<TransmissionType | 'All'>(
    initial.transmission || 'All'
  );
  const [selectedFuel, setSelectedFuel] = useState<VehicleFuelType | 'All'>(
    initial.fuel || 'All'
  );
  const [selectedSeats, setSelectedSeats] = useState<number | 'All'>(
    initial.seats || 'All'
  );
  const [availableOnly, setAvailableOnly] = useState<boolean>(
    initial.availableOnly || false
  );

  const handleReset = () => {
    setSelectedCategory('All');
    setSelectedPriceTier(0);
    setSelectedTransmission('All');
    setSelectedFuel('All');
    setSelectedSeats('All');
    setAvailableOnly(false);
  };

  const handleApply = () => {
    const tier = PRICE_TIERS[selectedPriceTier];
    const applied: FilterOptions = {
      category: selectedCategory !== 'All' ? selectedCategory : undefined,
      minPrice: tier.min,
      maxPrice: tier.max,
      transmission: selectedTransmission !== 'All' ? selectedTransmission : undefined,
      fuel: selectedFuel !== 'All' ? selectedFuel : undefined,
      seats: selectedSeats !== 'All' ? selectedSeats : undefined,
      availableOnly: availableOnly ? true : undefined,
    };

    navigation.navigate('VehicleGallery', {
      filterParams: applied,
      category: selectedCategory !== 'All' ? selectedCategory : undefined,
    });
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="Filter Vehicles"
          subtitle="Refine by category, price, and specs"
          showBack
          onBackPress={() => navigation.goBack()}
          rightElement={
            <TouchableOpacity onPress={handleReset} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text
                style={{
                  color: colors.danger,
                  fontSize: typography.fontSizes.xs,
                  fontWeight: '700',
                }}
              >
                RESET
              </Text>
            </TouchableOpacity>
          }
        />
      }
      footer={
        <View
          style={[
            styles.footer,
            {
              borderTopColor: colors.border,
              backgroundColor: colors.surface,
              padding: spacing.md,
            },
          ]}
        >
          <Button
            title="Apply Filters"
            variant="primary"
            size="large"
            fullWidth
            onPress={handleApply}
          />
        </View>
      }
    >
      <View style={[styles.content, { padding: spacing.md }]}>
        {/* Category Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: typography.fontSizes.sm }]}>
            CATEGORY
          </Text>
          <View style={styles.chipRow}>
            {CATEGORIES.map(cat => {
              const active = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active ? colors.primary : colors.surfaceVariant,
                      borderColor: active ? colors.primary : colors.border,
                      borderRadius: borderRadius.md,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: active ? colors.textInverse : colors.textSecondary,
                        fontSize: typography.fontSizes.xs,
                        fontWeight: active ? '700' : '500',
                      },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Price Range Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: typography.fontSizes.sm }]}>
            PRICE RANGE (PER DAY)
          </Text>
          <View style={styles.chipRow}>
            {PRICE_TIERS.map((tier, idx) => {
              const active = selectedPriceTier === idx;
              return (
                <TouchableOpacity
                  key={tier.label}
                  onPress={() => setSelectedPriceTier(idx)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active ? colors.primary : colors.surfaceVariant,
                      borderColor: active ? colors.primary : colors.border,
                      borderRadius: borderRadius.md,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: active ? colors.textInverse : colors.textSecondary,
                        fontSize: typography.fontSizes.xs,
                        fontWeight: active ? '700' : '500',
                      },
                    ]}
                  >
                    {tier.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Transmission Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: typography.fontSizes.sm }]}>
            TRANSMISSION
          </Text>
          <View style={styles.chipRow}>
            {TRANSMISSIONS.map(trans => {
              const active = selectedTransmission === trans;
              return (
                <TouchableOpacity
                  key={trans}
                  onPress={() => setSelectedTransmission(trans)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active ? colors.primary : colors.surfaceVariant,
                      borderColor: active ? colors.primary : colors.border,
                      borderRadius: borderRadius.md,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: active ? colors.textInverse : colors.textSecondary,
                        fontSize: typography.fontSizes.xs,
                        fontWeight: active ? '700' : '500',
                      },
                    ]}
                  >
                    {trans}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Fuel Type Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: typography.fontSizes.sm }]}>
            FUEL TYPE
          </Text>
          <View style={styles.chipRow}>
            {FUELS.map(fuel => {
              const active = selectedFuel === fuel;
              return (
                <TouchableOpacity
                  key={fuel}
                  onPress={() => setSelectedFuel(fuel)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active ? colors.primary : colors.surfaceVariant,
                      borderColor: active ? colors.primary : colors.border,
                      borderRadius: borderRadius.md,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: active ? colors.textInverse : colors.textSecondary,
                        fontSize: typography.fontSizes.xs,
                        fontWeight: active ? '700' : '500',
                      },
                    ]}
                  >
                    {fuel}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Seats Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: typography.fontSizes.sm }]}>
            SEATING CAPACITY
          </Text>
          <View style={styles.chipRow}>
            {SEATS_OPTIONS.map(seats => {
              const active = selectedSeats === seats;
              const label = seats === 'All' ? 'Any' : `${seats} Seats`;
              return (
                <TouchableOpacity
                  key={String(seats)}
                  onPress={() => setSelectedSeats(seats)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active ? colors.primary : colors.surfaceVariant,
                      borderColor: active ? colors.primary : colors.border,
                      borderRadius: borderRadius.md,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: active ? colors.textInverse : colors.textSecondary,
                        fontSize: typography.fontSizes.xs,
                        fontWeight: active ? '700' : '500',
                      },
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Availability Toggle */}
        <View style={[styles.section, { borderBottomWidth: 0 }]}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setAvailableOnly(!availableOnly)}
            style={styles.toggleRow}
          >
            <View>
              <Text
                style={[
                  styles.toggleTitle,
                  {
                    color: colors.textPrimary,
                    fontSize: typography.fontSizes.sm,
                    fontWeight: typography.fontWeights.bold,
                  },
                ]}
              >
                Available Only
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs, marginTop: 2 }}>
                Hide currently rented or reserved fleet
              </Text>
            </View>

            <View
              style={[
                styles.checkboxBox,
                {
                  borderColor: availableOnly ? colors.primary : colors.border,
                  backgroundColor: availableOnly ? colors.primary : colors.surfaceVariant,
                  borderRadius: borderRadius.xs,
                },
              ]}
            >
              {availableOnly ? (
                <Text style={{ color: colors.textInverse, fontSize: 12, fontWeight: '800' }}>✓</Text>
              ) : null}
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
  },
  section: {
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  sectionTitle: {
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
  },
  chipText: {
    letterSpacing: 0.2,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  toggleTitle: {
    letterSpacing: -0.2,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    borderTopWidth: 1,
  },
});
