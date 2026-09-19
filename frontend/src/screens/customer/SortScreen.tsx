import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList, SortOption } from '../../types';
import { useTheme } from '../../theme';
import { ScreenContainer, Header, Button } from '../../components/common';

type SortScreenNavigationProp = NativeStackNavigationProp<
  CustomerStackParamList,
  'SortScreen'
>;
type SortScreenRouteProp = RouteProp<CustomerStackParamList, 'SortScreen'>;

interface SortScreenProps {
  navigation: SortScreenNavigationProp;
  route: SortScreenRouteProp;
}

interface SortItem {
  id: SortOption;
  title: string;
  subtitle: string;
  icon: string;
}

const SORT_OPTIONS: SortItem[] = [
  {
    id: 'rating_desc',
    title: 'Highest Customer Rating',
    subtitle: 'Top-rated vehicles with verified driver satisfaction first',
    icon: '⭐',
  },
  {
    id: 'price_asc',
    title: 'Daily Price: Low to High',
    subtitle: 'Most economical and value-friendly rates first',
    icon: '💵',
  },
  {
    id: 'price_desc',
    title: 'Daily Price: High to Low',
    subtitle: 'Ultra-luxury and flagship executive vehicles first',
    icon: '💎',
  },
  {
    id: 'year_desc',
    title: 'Model Year: Newest First',
    subtitle: 'Latest generation 2024 and 2023 vehicle releases',
    icon: '📅',
  },
];

export const SortScreen: React.FC<SortScreenProps> = ({ navigation, route }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const [selectedSort, setSelectedSort] = useState<SortOption>(
    route.params?.currentSort || 'rating_desc'
  );

  const handleApply = () => {
    navigation.navigate('VehicleGallery', { sortOption: selectedSort });
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="Sort Vehicles"
          subtitle="Choose how fleet results are ordered"
          showBack
          onBackPress={() => navigation.goBack()}
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
            title="Apply Sorting"
            variant="primary"
            size="large"
            fullWidth
            onPress={handleApply}
          />
        </View>
      }
    >
      <View style={[styles.content, { padding: spacing.md }]}>
        <View style={styles.optionsList}>
          {SORT_OPTIONS.map(opt => {
            const isSelected = selectedSort === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                activeOpacity={0.85}
                onPress={() => setSelectedSort(opt.id)}
                style={[
                  styles.optionCard,
                  {
                    backgroundColor: isSelected ? colors.surface : colors.surfaceVariant,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderWidth: isSelected ? 2 : 1,
                    borderRadius: borderRadius.lg,
                    padding: spacing.md,
                    marginBottom: spacing.md,
                  },
                ]}
              >
                <View style={styles.cardRow}>
                  <View style={styles.iconAndTitle}>
                    <Text style={styles.icon}>{opt.icon}</Text>
                    <View style={styles.textColumn}>
                      <Text
                        style={[
                          styles.title,
                          {
                            color: colors.textPrimary,
                            fontSize: typography.fontSizes.md,
                            fontWeight: typography.fontWeights.bold,
                          },
                        ]}
                      >
                        {opt.title}
                      </Text>
                      <Text
                        style={[
                          styles.subtitle,
                          {
                            color: colors.textSecondary,
                            fontSize: typography.fontSizes.xs,
                            marginTop: 2,
                            lineHeight: 18,
                          },
                        ]}
                      >
                        {opt.subtitle}
                      </Text>
                    </View>
                  </View>

                  {/* Radio Indicator */}
                  <View
                    style={[
                      styles.radioCircle,
                      {
                        borderColor: isSelected ? colors.primary : colors.textMuted,
                        backgroundColor: isSelected ? colors.primary : 'transparent',
                      },
                    ]}
                  >
                    {isSelected ? <View style={styles.radioDot} /> : null}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
  },
  optionsList: {
    width: '100%',
  },
  optionCard: {
    position: 'relative',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconAndTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 12,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  textColumn: {
    flex: 1,
  },
  title: {
    letterSpacing: -0.2,
  },
  subtitle: {
    letterSpacing: 0.1,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0F172A',
  },
  footer: {
    borderTopWidth: 1,
  },
});
