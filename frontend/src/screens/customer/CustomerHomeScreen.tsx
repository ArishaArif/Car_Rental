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
import { useBooking } from '../../context/BookingContext';
import { vehicleService, CategorySummary } from '../../services/vehicleService';
import { notificationService } from '../../services/notificationService';
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
  const { activeRental, bookings } = useBooking();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

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

    const loadUnread = async () => {
      const count = await notificationService.getUnreadCount('Customer');
      setUnreadNotifCount(count);
    };
    loadUnread();

    const unsubscribe = notificationService.subscribe(async () => {
      const count = await notificationService.getUnreadCount('Customer');
      setUnreadNotifCount(count);
    });
    return unsubscribe;
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
            paddingVertical: spacing.sm + 2,
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
            borderBottomWidth: 1,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('CustomerProfile')}
          style={styles.headerUser}
        >
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
            <Text
              numberOfLines={1}
              style={[styles.greeting, { color: colors.textMuted, fontSize: typography.fontSizes.xs }]}
            >
              WELCOME BACK
            </Text>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[
                styles.userName,
                { color: colors.textPrimary, fontSize: typography.fontSizes.md, fontWeight: typography.fontWeights.bold },
              ]}
            >
              {user?.name || 'Customer'}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.headerActions}>
          {/* AI Assistant Shortcut */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('AIAssistant')}
            style={[
              styles.iconBtn,
              {
                backgroundColor: colors.primary + '18',
                borderColor: colors.primary,
                borderRadius: borderRadius.md,
              },
            ]}
            accessibilityLabel="AI Assistant"
          >
            <Text style={{ fontSize: 16 }}>🤖</Text>
          </TouchableOpacity>

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
            accessibilityLabel="Favorites"
          >
            <Text style={{ fontSize: 16 }}>❤️</Text>
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

          {/* Notifications Shortcut with Badge */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('NotificationCenter')}
            style={[
              styles.iconBtn,
              {
                backgroundColor: colors.surfaceVariant,
                borderColor: colors.border,
                borderRadius: borderRadius.md,
              },
            ]}
            accessibilityLabel="Notifications"
          >
            <Text style={{ fontSize: 15 }}>🔔</Text>
            {unreadNotifCount > 0 ? (
              <View
                style={[
                  styles.badgeCount,
                  {
                    backgroundColor: colors.danger,
                    borderRadius: borderRadius.full,
                  },
                ]}
              >
                <Text style={[styles.badgeCountText, { color: '#FFFFFF' }]}>
                  {unreadNotifCount}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>

          {/* Settings Shortcut */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('CustomerSettings')}
            style={[
              styles.iconBtn,
              {
                backgroundColor: colors.surfaceVariant,
                borderColor: colors.border,
                borderRadius: borderRadius.md,
              },
            ]}
            accessibilityLabel="Settings"
          >
            <Text style={{ fontSize: 15 }}>⚙️</Text>
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
              },
            ]}
            accessibilityLabel="Sign out"
          >
            <Text style={{ fontSize: 15 }}>🚪</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.content, { paddingHorizontal: spacing.md, paddingVertical: spacing.md }]}>
        {/* Active Rental In Progress Live Banner */}
        {activeRental ? (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('ActiveRental', { bookingId: activeRental.id })}
            style={[
              styles.activeRentalBanner,
              {
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                borderColor: colors.accent,
                borderRadius: borderRadius.lg,
                padding: spacing.md,
                marginBottom: spacing.md,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.pulseDot, { backgroundColor: colors.accent }]} />
                <Text style={{ color: colors.accent, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 }}>
                  ACTIVE RENTAL IN PROGRESS
                </Text>
              </View>
              <Text style={{ color: colors.accent, fontSize: 11, fontWeight: '800' }}>
                MANAGE KEYLESS →
              </Text>
            </View>
            <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.md, fontWeight: '800', marginTop: 4 }}>
              {activeRental.vehicle.brand} {activeRental.vehicle.model}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs, marginTop: 2 }}>
              Scheduled return: {activeRental.returnDate} · {activeRental.returnLocation}
            </Text>
          </TouchableOpacity>
        ) : null}

        {/* Customer Mobility Quick Hub Bar */}
        <View style={styles.quickBar}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('MyBookings')}
            style={[
              styles.quickBarBtn,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: borderRadius.md,
              },
            ]}
          >
            <Text style={{ fontSize: 16, marginRight: 6 }}>📑</Text>
            <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.xs, fontWeight: '700' }}>
              My Bookings ({bookings.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ActiveRental')}
            style={[
              styles.quickBarBtn,
              {
                backgroundColor: activeRental ? 'rgba(16, 185, 129, 0.12)' : colors.surface,
                borderColor: activeRental ? colors.accent : colors.border,
                borderRadius: borderRadius.md,
              },
            ]}
          >
            <Text style={{ fontSize: 16, marginRight: 6 }}>🔑</Text>
            <Text
              style={{
                color: activeRental ? colors.accent : colors.textPrimary,
                fontSize: typography.fontSizes.xs,
                fontWeight: '700',
              }}
            >
              Active Rental
            </Text>
          </TouchableOpacity>
        </View>

        {/* AI Assistant & Voice Concierge Banner */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => navigation.navigate('AIAssistant')}
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1.5,
            borderColor: colors.primary,
            borderRadius: borderRadius.lg,
            padding: spacing.md,
            marginBottom: spacing.md,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 3,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, marginRight: 8 }}>
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor: colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 20 }}>🤖</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  numberOfLines={1}
                  style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '800' }}
                >
                  AI Assistant & Voice Concierge
                </Text>
                <Text
                  numberOfLines={1}
                  style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}
                >
                  Chat or speak in English, Urdu or Roman Urdu
                </Text>
              </View>
            </View>
            <View
              style={{
                backgroundColor: colors.primary + '18',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: borderRadius.full,
              }}
            >
              <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '700' }}>
                Open ➔
              </Text>
            </View>
          </View>

          {/* Quick AI Prompts */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            {[
              'I need an SUV this weekend',
              '3 din ke liye car chahiye',
              'Islamabad mein Corolla chahiye',
            ].map((prompt, idx) => (
              <TouchableOpacity
                key={`p-${idx}`}
                onPress={() => navigation.navigate('AIAssistant', { initialQuery: prompt })}
                style={{
                  backgroundColor: colors.background,
                  borderWidth: 1,
                  borderColor: colors.border,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: borderRadius.sm,
                }}
              >
                <Text style={{ color: colors.textSecondary, fontSize: 10, fontWeight: '600' }}>
                  💬 "{prompt}"
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>

        {/* Hero Search Box */}
        <Card
          variant="elevated"
          padding="medium"
          style={[styles.heroCard, { borderColor: colors.border, marginBottom: spacing.md }]}
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
              numberOfLines={1}
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

        <View style={[styles.categoriesGrid, { marginBottom: spacing.md }]}>
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
                  numberOfLines={1}
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
                  numberOfLines={1}
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
          contentContainerStyle={{ paddingHorizontal: spacing.md, paddingVertical: spacing.xs }}
          style={{ marginHorizontal: -spacing.md, marginBottom: spacing.md }}
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
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  userAvatarBadge: {
    width: 38,
    height: 38,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
  },
  nameContainer: {
    flex: 1,
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
    gap: 6,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badgeCount: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 17,
    height: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeCountText: {
    fontSize: 9,
    fontWeight: '800',
  },
  content: {
    paddingBottom: 36,
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
    marginTop: 6,
    marginBottom: 6,
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
    gap: 8,
  },
  categoryPill: {
    flexBasis: '48%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
  },
  categoryIcon: {
    fontSize: 22,
    marginRight: 8,
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
  activeRentalBanner: {
    borderWidth: 1.5,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  quickBar: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  quickBarBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
  },
});
