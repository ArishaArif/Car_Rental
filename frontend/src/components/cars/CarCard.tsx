import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Vehicle } from '../../types';
import { useTheme } from '../../theme';
import { useFavorites } from '../../context/FavoritesContext';
import { Card } from '../common/Card';

export interface CarCardProps {
  vehicle: Vehicle;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  horizontal?: boolean;
}

export const CarCard: React.FC<CarCardProps> = ({
  vehicle,
  onPress,
  style,
  horizontal = false,
}) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { isFavorite, toggleFavorite } = useFavorites();

  const favorited = isFavorite(vehicle.id);
  const isAvailable = vehicle.availability === 'Available';

  const handleFavoritePress = (e: any) => {
    e?.stopPropagation?.();
    toggleFavorite(vehicle.id);
  };

  const getCategoryColor = () => {
    switch (vehicle.category) {
      case 'Luxury':
        return colors.secondary;
      case 'SUV':
        return '#F59E0B'; // Warm amber
      case 'Economy':
        return colors.accent;
      case 'Sedan':
      default:
        return colors.primary;
    }
  };

  const categoryColor = getCategoryColor();

  if (horizontal) {
    return (
      <Card
        variant="elevated"
        padding="none"
        onPress={onPress}
        style={[
          styles.horizontalCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: borderRadius.lg,
          },
          style,
        ]}
      >
        <View style={styles.horizontalImageContainer}>
          <Image
            source={{ uri: vehicle.image }}
            style={styles.horizontalImage}
            resizeMode="cover"
          />
          <View
            style={[
              styles.horizontalCategoryBadge,
              {
                backgroundColor: categoryColor,
                borderRadius: borderRadius.xs,
              },
            ]}
          >
            <Text
              style={[
                styles.categoryText,
                { color: '#FFFFFF', fontSize: typography.fontSizes.xs - 2 },
              ]}
            >
              {vehicle.category.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={[styles.horizontalBody, { padding: spacing.sm + 2 }]}>
          <View style={styles.topRow}>
            <Text
              numberOfLines={1}
              style={[
                styles.brandModel,
                {
                  color: colors.textPrimary,
                  fontSize: typography.fontSizes.md,
                  fontWeight: typography.fontWeights.bold,
                  flex: 1,
                },
              ]}
            >
              {vehicle.brand} {vehicle.model}
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleFavoritePress}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.favoriteButton}
            >
              <Text style={{ fontSize: 18 }}>{favorited ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.ratingLocationRow}>
            <Text style={{ color: colors.warning, fontSize: typography.fontSizes.xs }}>
              ★ {vehicle.rating.toFixed(2)}
            </Text>
            <Text
              numberOfLines={1}
              style={[
                styles.locationText,
                { color: colors.textMuted, fontSize: typography.fontSizes.xs - 1, marginLeft: 6 },
              ]}
            >
              📍 {vehicle.location}
            </Text>
          </View>

          <View style={styles.priceRow}>
            <Text
              style={[
                styles.priceNumber,
                {
                  color: colors.primary,
                  fontSize: typography.fontSizes.lg,
                  fontWeight: typography.fontWeights.heavy,
                },
              ]}
            >
              ${vehicle.pricePerDay}
            </Text>
            <Text
              style={[
                styles.perDayText,
                { color: colors.textSecondary, fontSize: typography.fontSizes.xs },
              ]}
            >
              {' '}/ day
            </Text>
          </View>
        </View>
      </Card>
    );
  }

  return (
    <Card
      variant="elevated"
      padding="none"
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: borderRadius.lg,
          marginBottom: spacing.md,
        },
        style,
      ]}
    >
      {/* Top Image Section */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: vehicle.image }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Category Pill */}
        <View
          style={[
            styles.categoryBadge,
            {
              backgroundColor: categoryColor,
              borderRadius: borderRadius.sm,
            },
          ]}
        >
          <Text style={[styles.categoryText, { color: '#FFFFFF', fontSize: typography.fontSizes.xs - 2 }]}>
            {vehicle.category.toUpperCase()}
          </Text>
        </View>

        {/* Availability Badge */}
        <View
          style={[
            styles.availabilityBadge,
            {
              backgroundColor: isAvailable ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.85)',
              borderRadius: borderRadius.sm,
            },
          ]}
        >
          <Text style={[styles.availabilityText, { color: '#FFFFFF', fontSize: typography.fontSizes.xs - 2 }]}>
            {vehicle.availability.toUpperCase()}
          </Text>
        </View>

        {/* Favorite Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleFavoritePress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={[
            styles.favoriteCircle,
            {
              backgroundColor: 'rgba(10, 14, 26, 0.75)',
              borderRadius: borderRadius.full,
            },
          ]}
        >
          <Text style={{ fontSize: 18 }}>{favorited ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      {/* Card Details Body */}
      <View style={[styles.body, { padding: spacing.md }]}>
        {/* Title & Year */}
        <View style={styles.titleRow}>
          <Text
            numberOfLines={1}
            style={[
              styles.title,
              {
                color: colors.textPrimary,
                fontSize: typography.fontSizes.lg,
                fontWeight: typography.fontWeights.bold,
                flex: 1,
              },
            ]}
          >
            {vehicle.brand} {vehicle.model}
          </Text>
          <View
            style={[
              styles.yearPill,
              {
                backgroundColor: colors.surfaceVariant,
                borderRadius: borderRadius.xs,
              },
            ]}
          >
            <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs - 1, fontWeight: '600' }}>
              {vehicle.year}
            </Text>
          </View>
        </View>

        {/* Location & Rating */}
        <View style={styles.subRow}>
          <Text
            numberOfLines={1}
            style={[
              styles.location,
              {
                color: colors.textMuted,
                fontSize: typography.fontSizes.xs,
                flex: 1,
              },
            ]}
          >
            📍 {vehicle.location}
          </Text>

          <View style={styles.ratingPill}>
            <Text style={{ color: colors.warning, fontSize: typography.fontSizes.xs, fontWeight: '700' }}>
              ★ {vehicle.rating.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Specs Chips Row */}
        <View style={styles.specsRow}>
          <View
            style={[
              styles.specChip,
              {
                backgroundColor: colors.surfaceVariant,
                borderRadius: borderRadius.xs,
              },
            ]}
          >
            <Text style={[styles.specText, { color: colors.textSecondary, fontSize: typography.fontSizes.xs - 1 }]}>
              👥 {vehicle.seats} Seats
            </Text>
          </View>

          <View
            style={[
              styles.specChip,
              {
                backgroundColor: colors.surfaceVariant,
                borderRadius: borderRadius.xs,
              },
            ]}
          >
            <Text style={[styles.specText, { color: colors.textSecondary, fontSize: typography.fontSizes.xs - 1 }]}>
              ⚙️ {vehicle.transmission}
            </Text>
          </View>

          <View
            style={[
              styles.specChip,
              {
                backgroundColor: colors.surfaceVariant,
                borderRadius: borderRadius.xs,
              },
            ]}
          >
            <Text style={[styles.specText, { color: colors.textSecondary, fontSize: typography.fontSizes.xs - 1 }]}>
              ⛽ {vehicle.fuel}
            </Text>
          </View>
        </View>

        {/* Price & Action Row */}
        <View style={styles.bottomPriceRow}>
          <View>
            <Text style={[styles.priceLabel, { color: colors.textMuted, fontSize: typography.fontSizes.xs - 1 }]}>
              DAILY RATE
            </Text>
            <View style={styles.priceContainer}>
              <Text
                style={[
                  styles.priceValue,
                  {
                    color: colors.primary,
                    fontSize: typography.fontSizes.xl,
                    fontWeight: typography.fontWeights.heavy,
                  },
                ]}
              >
                ${vehicle.pricePerDay}
              </Text>
              <Text
                style={[
                  styles.priceUnit,
                  { color: colors.textSecondary, fontSize: typography.fontSizes.xs },
                ]}
              >
                {' '}/ day
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.viewButton,
              {
                backgroundColor: 'rgba(0, 229, 255, 0.12)',
                borderColor: colors.primary,
                borderRadius: borderRadius.sm,
              },
            ]}
          >
            <Text
              style={[
                styles.viewButtonText,
                {
                  color: colors.primary,
                  fontSize: typography.fontSizes.xs,
                  fontWeight: typography.fontWeights.bold,
                },
              ]}
            >
              VIEW DETAILS →
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    overflow: 'hidden',
    borderWidth: 1,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
    backgroundColor: '#1E293B',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  categoryText: {
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  availabilityBadge: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  availabilityText: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  favoriteCircle: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    width: '100%',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    letterSpacing: -0.2,
  },
  yearPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  location: {
    letterSpacing: 0.1,
  },
  ratingPill: {
    marginLeft: 8,
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  specsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  specChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  specText: {
    fontWeight: '500',
  },
  bottomPriceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  priceLabel: {
    letterSpacing: 0.8,
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceValue: {
    letterSpacing: -0.5,
  },
  priceUnit: {
    fontWeight: '500',
  },
  viewButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  viewButtonText: {
    letterSpacing: 0.5,
  },
  // Horizontal Variant
  horizontalCard: {
    width: 250,
    marginRight: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  horizontalImageContainer: {
    width: '100%',
    height: 130,
    position: 'relative',
    backgroundColor: '#1E293B',
  },
  horizontalImage: {
    width: '100%',
    height: '100%',
  },
  horizontalCategoryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  horizontalBody: {
    width: '100%',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandModel: {
    letterSpacing: -0.2,
  },
  favoriteButton: {
    marginLeft: 6,
  },
  ratingLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
  },
  priceNumber: {
    letterSpacing: -0.5,
  },
  perDayText: {
    fontWeight: '500',
  },
});
