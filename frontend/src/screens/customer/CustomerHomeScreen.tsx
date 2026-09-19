import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList, Vehicle } from '../../types';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import { vehicleService, CategorySummary } from '../../services/vehicleService';
import { ScreenContainer, Card, CarCard, Loading } from '../../components/common';

type CustomerHomeScreenNavigationProp = NativeStackNavigationProp<
  CustomerStackParamList,
  'CustomerHome'
>;

interface CustomerHomeScreenProps {
  navigation: CustomerHomeScreenNavigationProp;
}

export const CustomerHomeScreen: React.FC<CustomerHomeScreenProps> = ({ navigation }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { user, logout } = useAuth();
  const { favorites } = useFavorites();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const all = await vehicleService.getAllVehicles();
        setVehicles(all);
        setCategories(vehicleService.getCategoriesSummary());
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const featuredCars = vehicles.slice(0, 4);
  const topRatedCars = [...vehicles].sort((a, b) => b.rating - a.rating).slice(0, 4);

  if (loading) {
    return <Loading fullScreen message="Loading curated fleet..." />;
  }

  return (
    <ScreenContainer scrollable>
      {/* Custom Header Bar */}
      <View
        style={[
          styles.headerBar,
          {
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm + 4,
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
            borderBottomWidth: 1,
          },
        ]}
      >
        <View style={styles.headerUser}>
          <View
            style={[
              styles.userAvatarBadge,
              {
                backgroundColor: 'rgba(0, 229, 255, 0.15)',
                borderColor: colors.primary,
                borderRadius: borderRadius.full,
              },
            ]}
          >
            <Text style={styles.avatarText}>{user?.avatarUrl || '🚗'}</Text>
          </View>
          <View style={styles.nameContainer}>
            <Text style={[styles.greeting, { color: colors.textMuted, fontSize: typography.fontSizes.xs }]}>
              WELCOME BACK
            </Text>
            <Text
              style={[
                styles.userName,
                { color: colors.textPrimary, fontSize: typography.fontSizes.md, fontWeight: typography.fontWeights.bold },
              ]}
            >
              {user?.name || 'Customer'}
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          {/* Favorites Shortcut with Badge */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Favorites')}
            style={[
              styles.iconBtn,
              {
                backgroundColor: colors.surfaceVariant,
                borderColor: colors.border,
                borderRadius: borderRadius.md,
              },
            ]}
          >
            <Text style={{ fontSize: 18 }}>❤️</Text>
            {favorites.length > 0 ? (
              <View
                style={[
                  styles.badgeCount,
                  {
                    backgroundColor: colors.primary,
                    borderRadius: borderRadius.full,
                  },
                ]}
              >
                <Text style={[styles.badgeCountText, { color: colors.textInverse }]}>
                  {favorites.length}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>

          {/* Sign Out Shortcut */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={logout}
            style={[
              styles.iconBtn,
              {
                backgroundColor: colors.surfaceVariant,
                borderColor: colors.border,
                borderRadius: borderRadius.md,
                marginLeft: 8,
              },
            ]}
          >
            <Text style={{ fontSize: 16 }}>🚪</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.content, { paddingHorizontal: spacing.md, paddingVertical: spacing.md }]}>
        {/* Hero Search Box */}
        <Card
          variant="elevated"
          padding="medium"
          style={[styles.heroCard, { borderColor: colors.border, marginBottom: spacing.lg }]}
        >
          <View style={styles.heroTextContainer}>
            <Text
              style={[
                styles.heroTitle,
                {
                  color: colors.textPrimary,
                  fontSize: typography.fontSizes.xl,
                  fontWeight: typography.fontWeights.heavy,
                },
              ]}
            >
              Discover & Rent Premium Mobility
            </Text>
            <Text
              style={[
                styles.heroSubtitle,
                {
                  color: colors.textSecondary,
                  fontSize: typography.fontSizes.xs + 1,
                  marginTop: 4,
                },
              ]}
            >
              Explore top brands, instant booking, and keyless unlock.
            </Text>
          </View>

          {/* Fake Interactive Search Input Bar */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('SearchCars')}
            style={[
              styles.searchBarTrigger,
              {
                backgroundColor: colors.surfaceVariant,
                borderColor: colors.primary,
                borderRadius: borderRadius.md,
                marginTop: spacing.md,
              },
            ]}
          >
            <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
            <Text
              style={[
                styles.searchPlaceholder,
                { color: colors.textMuted, fontSize: typography.fontSizes.sm },
              ]}
            >
              Search Corolla, Civic, Fortuner, SUV, City...
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Categories Shortcut Row */}
        <View style={styles.sectionHeader}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.textPrimary,
                fontSize: typography.fontSizes.lg,
                fontWeight: typography.fontWeights.bold,
              },
            ]}
          >
            Categories
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('VehicleCategories')}>
            <Text
              style={[
                styles.sectionLink,
                { color: colors.primary, fontSize: typography.fontSizes.xs + 1, fontWeight: '700' },
              ]}
            >
              VIEW ALL →
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.categoriesGrid, { marginVertical: spacing.sm }]}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.category}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('VehicleGallery', { category: cat.category })}
              style={[
                styles.categoryPill,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: borderRadius.md,
                },
              ]}
            >
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
              <View style={styles.categoryTextWrapper}>
                <Text
                  style={[
                    styles.categoryName,
                    {
                      color: colors.textPrimary,
                      fontSize: typography.fontSizes.sm,
                      fontWeight: typography.fontWeights.bold,
                    },
                  ]}
                >
                  {cat.category}
                </Text>
                <Text
                  style={[
                    styles.categoryCount,
                    { color: colors.textMuted, fontSize: typography.fontSizes.xs - 1 },
                  ]}
                >
                  {cat.count} cars · from ${cat.minPrice}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Featured Vehicles (Horizontal Carousel) */}
        <View style={[styles.sectionHeader, { marginTop: spacing.md }]}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.textPrimary,
                fontSize: typography.fontSizes.lg,
                fontWeight: typography.fontWeights.bold,
              },
            ]}
          >
            Featured Vehicles
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('VehicleGallery')}>
            <Text
              style={[
                styles.sectionLink,
                { color: colors.primary, fontSize: typography.fontSizes.xs + 1, fontWeight: '700' },
              ]}
            >
              SEE MORE →
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: spacing.sm }}
        >
          {featuredCars.map(car => (
            <CarCard
              key={car.id}
              vehicle={car}
              horizontal
              onPress={() => navigation.navigate('CarDetails', { vehicleId: car.id })}
            />
          ))}
        </ScrollView>

        {/* Top Rated Vehicles (Vertical List) */}
        <View style={[styles.sectionHeader, { marginTop: spacing.md }]}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.textPrimary,
                fontSize: typography.fontSizes.lg,
                fontWeight: typography.fontWeights.bold,
              },
            ]}
          >
            Top Rated Fleet
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('VehicleGallery')}>
            <Text
              style={[
                styles.sectionLink,
                { color: colors.primary, fontSize: typography.fontSizes.xs + 1, fontWeight: '700' },
              ]}
            >
              GALLERY ({vehicles.length}) →
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: spacing.sm }}>
          {topRatedCars.map(car => (
            <CarCard
              key={car.id}
              vehicle={car}
              onPress={() => navigation.navigate('CarDetails', { vehicleId: car.id })}
            />
          ))}
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userAvatarBadge: {
    width: 42,
    height: 42,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
  },
  nameContainer: {
    justifyContent: 'center',
  },
  greeting: {
    letterSpacing: 0.8,
    fontWeight: '600',
  },
  userName: {
    letterSpacing: -0.2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badgeCount: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeCountText: {
    fontSize: 10,
    fontWeight: '800',
  },
  content: {
    paddingBottom: 28,
  },
  heroCard: {
    borderWidth: 1,
  },
  heroTextContainer: {
    width: '100%',
  },
  heroTitle: {
    letterSpacing: -0.4,
  },
  heroSubtitle: {
    letterSpacing: 0.1,
  },
  searchBarTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
  },
  searchPlaceholder: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  sectionTitle: {
    letterSpacing: -0.2,
  },
  sectionLink: {
    letterSpacing: 0.5,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryPill: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  categoryTextWrapper: {
    flex: 1,
  },
  categoryName: {
    letterSpacing: -0.2,
  },
  categoryCount: {
    marginTop: 2,
  },
});
