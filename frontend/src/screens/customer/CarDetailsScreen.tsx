import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList, Vehicle } from '../../types';
import { useTheme } from '../../theme';
import { useFavorites } from '../../context/FavoritesContext';
import { vehicleService } from '../../services/vehicleService';
import { ScreenContainer, Header, Card, Button, Loading, EmptyState } from '../../components/common';

type CarDetailsScreenNavigationProp = NativeStackNavigationProp<
  CustomerStackParamList,
  'CarDetails'
>;
type CarDetailsScreenRouteProp = RouteProp<CustomerStackParamList, 'CarDetails'>;

interface CarDetailsScreenProps {
  navigation: CarDetailsScreenNavigationProp;
  route: CarDetailsScreenRouteProp;
}

export const CarDetailsScreen: React.FC<CarDetailsScreenProps> = ({
  navigation,
  route,
}) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { isFavorite, toggleFavorite } = useFavorites();

  const { vehicleId } = route.params;
  const [vehicle, setVehicle] = useState<Vehicle | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const item = await vehicleService.getVehicleById(vehicleId);
        setVehicle(item);
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [vehicleId]);

  if (loading) {
    return <Loading fullScreen message="Loading vehicle specifications..." />;
  }

  if (!vehicle) {
    return (
      <ScreenContainer
        header={
          <Header
            title="Vehicle Not Found"
            showBack
            onBackPress={() => navigation.goBack()}
          />
        }
      >
        <EmptyState
          title="Car Unavailable"
          message="The requested vehicle could not be loaded."
          actionTitle="Back to Fleet"
          onAction={() => navigation.goBack()}
        />
      </ScreenContainer>
    );
  }

  const favorited = isFavorite(vehicle.id);
  const isAvailable = vehicle.availability === 'Available';

  const handleBookPress = () => {
    navigation.navigate('CheckAvailability', { vehicleId: vehicle.id });
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title={`${vehicle.brand} ${vehicle.model}`}
          subtitle={`${vehicle.year} · ${vehicle.category} Class`}
          showBack
          onBackPress={() => navigation.goBack()}
          rightElement={
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => toggleFavorite(vehicle.id)}
              style={[
                styles.headerFavBtn,
                {
                  backgroundColor: colors.surfaceVariant,
                  borderColor: colors.border,
                  borderRadius: borderRadius.md,
                },
              ]}
            >
              <Text style={{ fontSize: 18 }}>{favorited ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
          }
        />
      }
      footer={
        <View
          style={[
            styles.footerBar,
            {
              borderTopColor: colors.border,
              backgroundColor: colors.surface,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.md,
            },
          ]}
        >
          <View style={styles.footerPriceCol}>
            <Text style={[styles.priceTagLabel, { color: colors.textMuted, fontSize: typography.fontSizes.xs }]}>
              TOTAL ESTIMATE
            </Text>
            <View style={styles.footerPriceRow}>
              <Text
                style={[
                  styles.footerPrice,
                  {
                    color: colors.primary,
                    fontSize: typography.fontSizes.xxl,
                    fontWeight: typography.fontWeights.heavy,
                  },
                ]}
              >
                ${vehicle.pricePerDay}
              </Text>
              <Text style={[styles.footerDayText, { color: colors.textSecondary, fontSize: typography.fontSizes.xs }]}>
                {' '}/ day
              </Text>
            </View>
          </View>

          <Button
            title={isAvailable ? 'Continue to Book' : 'Reserved / Waitlist'}
            variant={isAvailable ? 'primary' : 'secondary'}
            size="large"
            disabled={!isAvailable}
            onPress={handleBookPress}
            style={{ flex: 1, marginLeft: 16 }}
          />
        </View>
      }
    >
      {/* Hero Large Vehicle Image */}
      <View style={styles.heroImageWrapper}>
        <Image
          source={{ uri: vehicle.image }}
          style={styles.heroImage}
          resizeMode="cover"
        />

        {/* Floating Category and Availability Badges */}
        <View style={styles.floatingBadges}>
          <View
            style={[
              styles.floatingCategoryPill,
              {
                backgroundColor: colors.surface,
                borderColor: colors.primary,
                borderRadius: borderRadius.sm,
              },
            ]}
          >
            <Text style={[styles.floatingCategoryText, { color: colors.primary, fontSize: typography.fontSizes.xs }]}>
              {vehicle.category.toUpperCase()}
            </Text>
          </View>

          <View
            style={[
              styles.floatingStatusPill,
              {
                backgroundColor: isAvailable ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.85)',
                borderRadius: borderRadius.sm,
              },
            ]}
          >
            <Text style={[styles.floatingStatusText, { color: '#FFFFFF', fontSize: typography.fontSizes.xs }]}>
              {vehicle.availability.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.content, { padding: spacing.md }]}>
        {/* Title, Brand, Rating Row */}
        <View style={styles.mainTitleRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.brandSubtext, { color: colors.primary, fontSize: typography.fontSizes.sm, fontWeight: '700' }]}>
              {vehicle.brand.toUpperCase()}
            </Text>
            <Text
              style={[
                styles.vehicleTitle,
                {
                  color: colors.textPrimary,
                  fontSize: typography.fontSizes.xxl,
                  fontWeight: typography.fontWeights.heavy,
                },
              ]}
            >
              {vehicle.model}
            </Text>
          </View>

          <View
            style={[
              styles.ratingBox,
              {
                backgroundColor: colors.surfaceVariant,
                borderRadius: borderRadius.md,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.ratingStars, { color: colors.warning, fontSize: typography.fontSizes.md }]}>
              ★ {vehicle.rating.toFixed(2)}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs - 2, marginTop: 2 }}>
              Verified Host
            </Text>
          </View>
        </View>

        {/* Location Notice */}
        <View
          style={[
            styles.locationBar,
            {
              backgroundColor: colors.surfaceVariant,
              borderColor: colors.border,
              borderRadius: borderRadius.md,
              marginTop: spacing.sm,
            },
          ]}
        >
          <Text style={{ fontSize: 16, marginRight: 8 }}>📍</Text>
          <Text
            style={[
              styles.locationInfo,
              { color: colors.textSecondary, fontSize: typography.fontSizes.xs + 1, flex: 1 },
            ]}
          >
            Pick-up & Drop-off: <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{vehicle.location}</Text>
          </Text>
        </View>

        {/* Key Specs Grid */}
        <Text
          style={[
            styles.sectionHeading,
            {
              color: colors.textPrimary,
              fontSize: typography.fontSizes.md,
              fontWeight: typography.fontWeights.bold,
              marginTop: spacing.lg,
            },
          ]}
        >
          Vehicle Specifications
        </Text>

        <View style={[styles.specsGrid, { marginTop: spacing.xs }]}>
          <View style={[styles.specCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md }]}>
            <Text style={styles.specEmoji}>👥</Text>
            <Text style={[styles.specVal, { color: colors.textPrimary }]}>{vehicle.seats} Seats</Text>
            <Text style={[styles.specLbl, { color: colors.textMuted }]}>Capacity</Text>
          </View>

          <View style={[styles.specCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md }]}>
            <Text style={styles.specEmoji}>🚪</Text>
            <Text style={[styles.specVal, { color: colors.textPrimary }]}>{vehicle.doors} Doors</Text>
            <Text style={[styles.specLbl, { color: colors.textMuted }]}>Body</Text>
          </View>

          <View style={[styles.specCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md }]}>
            <Text style={styles.specEmoji}>⚙️</Text>
            <Text style={[styles.specVal, { color: colors.textPrimary }]}>{vehicle.transmission}</Text>
            <Text style={[styles.specLbl, { color: colors.textMuted }]}>Gearbox</Text>
          </View>

          <View style={[styles.specCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md }]}>
            <Text style={styles.specEmoji}>⛽</Text>
            <Text style={[styles.specVal, { color: colors.textPrimary }]}>{vehicle.fuel}</Text>
            <Text style={[styles.specLbl, { color: colors.textMuted }]}>Fuel / Powertrain</Text>
          </View>
        </View>

        {/* Description Section */}
        <Text
          style={[
            styles.sectionHeading,
            {
              color: colors.textPrimary,
              fontSize: typography.fontSizes.md,
              fontWeight: typography.fontWeights.bold,
              marginTop: spacing.lg,
            },
          ]}
        >
          Vehicle Overview
        </Text>

        <Card
          variant="flat"
          padding="medium"
          style={[styles.descriptionCard, { borderColor: colors.border, marginTop: spacing.xs }]}
        >
          <Text
            style={[
              styles.descriptionText,
              {
                color: colors.textSecondary,
                fontSize: typography.fontSizes.sm,
                lineHeight: 22,
              },
            ]}
          >
            {vehicle.description}
          </Text>
        </Card>

        {/* Features Checklist */}
        <Text
          style={[
            styles.sectionHeading,
            {
              color: colors.textPrimary,
              fontSize: typography.fontSizes.md,
              fontWeight: typography.fontWeights.bold,
              marginTop: spacing.lg,
            },
          ]}
        >
          Included Features & Technology
        </Text>

        <View style={[styles.featuresList, { marginTop: spacing.xs }]}>
          {vehicle.features.map((feat, fIdx) => (
            <View
              key={fIdx}
              style={[
                styles.featureItem,
                {
                  backgroundColor: colors.surfaceVariant,
                  borderColor: colors.border,
                  borderRadius: borderRadius.md,
                },
              ]}
            >
              <Text style={[styles.featureCheck, { color: colors.primary }]}>✓</Text>
              <Text
                style={[
                  styles.featureText,
                  {
                    color: colors.textPrimary,
                    fontSize: typography.fontSizes.xs + 1,
                    marginLeft: 8,
                  },
                ]}
              >
                {feat}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  headerFavBtn: {
    width: 38,
    height: 38,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImageWrapper: {
    width: '100%',
    height: 250,
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  floatingBadges: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    flexDirection: 'row',
    gap: 8,
  },
  floatingCategoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  floatingCategoryText: {
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  floatingStatusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  floatingStatusText: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  content: {
    paddingBottom: 28,
  },
  mainTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  brandSubtext: {
    letterSpacing: 1,
  },
  vehicleTitle: {
    letterSpacing: -0.4,
  },
  ratingBox: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  ratingStars: {
    fontWeight: '700',
  },
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
  },
  locationInfo: {
    letterSpacing: 0.1,
  },
  sectionHeading: {
    letterSpacing: -0.2,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specCard: {
    width: '48%',
    padding: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  specEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  specVal: {
    fontSize: 13,
    fontWeight: '700',
  },
  specLbl: {
    fontSize: 11,
    marginTop: 2,
  },
  descriptionCard: {
    borderWidth: 1,
  },
  descriptionText: {
    letterSpacing: 0.1,
  },
  featuresList: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
  },
  featureCheck: {
    fontSize: 14,
    fontWeight: '800',
  },
  featureText: {
    fontWeight: '500',
  },
  footerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
  },
  footerPriceCol: {
    justifyContent: 'center',
  },
  priceTagLabel: {
    letterSpacing: 0.8,
    fontWeight: '600',
  },
  footerPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  footerPrice: {
    letterSpacing: -0.5,
  },
  footerDayText: {
    fontWeight: '500',
  },
});
