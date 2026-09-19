import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList, VehicleCategory } from '../../types';
import { useTheme } from '../../theme';
import { vehicleService, CategorySummary } from '../../services/vehicleService';
import { ScreenContainer, Header, Card } from '../../components/common';

type VehicleCategoriesScreenNavigationProp = NativeStackNavigationProp<
  CustomerStackParamList,
  'VehicleCategories'
>;

interface VehicleCategoriesScreenProps {
  navigation: VehicleCategoriesScreenNavigationProp;
}

export const VehicleCategoriesScreen: React.FC<VehicleCategoriesScreenProps> = ({
  navigation,
}) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const categories: CategorySummary[] = vehicleService.getCategoriesSummary();

  const handleSelectCategory = (cat: VehicleCategory) => {
    navigation.navigate('VehicleGallery', { category: cat });
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="Vehicle Classes"
          subtitle="Explore fleets tailored to every trip style"
          showBack
          onBackPress={() => navigation.goBack()}
        />
      }
    >
      <View style={[styles.content, { padding: spacing.md }]}>
        <View style={styles.introBlock}>
          <Text
            style={[
              styles.heading,
              {
                color: colors.textPrimary,
                fontSize: typography.fontSizes.xl,
                fontWeight: typography.fontWeights.heavy,
              },
            ]}
          >
            Select a Vehicle Category
          </Text>
          <Text
            style={[
              styles.subheading,
              {
                color: colors.textSecondary,
                fontSize: typography.fontSizes.sm,
                marginTop: spacing.xs,
                lineHeight: 20,
              },
            ]}
          >
            Whether navigating compact city streets, heading off-road, or enjoying first-class luxury,
            choose a category to view matching models.
          </Text>
        </View>

        {/* Categories Cards */}
        <View style={styles.list}>
          {categories.map(cat => (
            <Card
              key={cat.category}
              variant="elevated"
              padding="large"
              onPress={() => handleSelectCategory(cat.category)}
              style={[
                styles.categoryCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: borderRadius.lg,
                  marginBottom: spacing.md,
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.iconBadgeRow}>
                  <View
                    style={[
                      styles.iconContainer,
                      {
                        backgroundColor: colors.surfaceVariant,
                        borderRadius: borderRadius.md,
                      },
                    ]}
                  >
                    <Text style={styles.icon}>{cat.icon}</Text>
                  </View>

                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: 'rgba(0, 229, 255, 0.12)',
                        borderColor: colors.primary,
                        borderRadius: borderRadius.xs,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        { color: colors.primary, fontSize: typography.fontSizes.xs - 2 },
                      ]}
                    >
                      {cat.badge}
                    </Text>
                  </View>
                </View>

                {/* Car Count Pill */}
                <View
                  style={[
                    styles.countPill,
                    {
                      backgroundColor: colors.surfaceVariant,
                      borderRadius: borderRadius.sm,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.countText,
                      { color: colors.textSecondary, fontSize: typography.fontSizes.xs },
                    ]}
                  >
                    {cat.count} Vehicles
                  </Text>
                </View>
              </View>

              {/* Title & Tagline */}
              <Text
                style={[
                  styles.categoryTitle,
                  {
                    color: colors.textPrimary,
                    fontSize: typography.fontSizes.xl,
                    fontWeight: typography.fontWeights.bold,
                    marginTop: spacing.sm,
                  },
                ]}
              >
                {cat.category} Class
              </Text>

              <Text
                style={[
                  styles.tagline,
                  {
                    color: colors.textSecondary,
                    fontSize: typography.fontSizes.sm,
                    marginTop: 4,
                    lineHeight: 20,
                  },
                ]}
              >
                {cat.tagline}
              </Text>

              {/* Footer row with price & action */}
              <View style={[styles.cardFooter, { borderTopColor: colors.border, marginTop: spacing.md }]}>
                <View>
                  <Text style={[styles.ratesFromLabel, { color: colors.textMuted, fontSize: typography.fontSizes.xs }]}>
                    RATES START FROM
                  </Text>
                  <Text
                    style={[
                      styles.priceHighlight,
                      { color: colors.primary, fontSize: typography.fontSizes.md, fontWeight: '700' },
                    ]}
                  >
                    ${cat.minPrice} <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs }}>/ day</Text>
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => handleSelectCategory(cat.category)}
                  style={[
                    styles.exploreBtn,
                    {
                      backgroundColor: colors.primary,
                      borderRadius: borderRadius.sm,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.exploreBtnText,
                      { color: colors.textInverse, fontSize: typography.fontSizes.xs, fontWeight: '700' },
                    ]}
                  >
                    EXPLORE →
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 28,
  },
  introBlock: {
    marginBottom: 16,
  },
  heading: {
    letterSpacing: -0.4,
  },
  subheading: {
    letterSpacing: 0,
  },
  list: {
    width: '100%',
  },
  categoryCard: {
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
  },
  badgeText: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  countPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countText: {
    fontWeight: '600',
  },
  categoryTitle: {
    letterSpacing: -0.3,
  },
  tagline: {
    letterSpacing: 0.1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  ratesFromLabel: {
    letterSpacing: 0.6,
    fontWeight: '600',
  },
  priceHighlight: {
    letterSpacing: -0.2,
  },
  exploreBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  exploreBtnText: {
    letterSpacing: 0.5,
  },
});
