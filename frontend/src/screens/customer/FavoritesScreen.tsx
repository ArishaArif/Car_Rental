import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../types';
import { useTheme } from '../../theme';
import { useFavorites } from '../../context/FavoritesContext';
import { ScreenContainer, Header, CarCard, EmptyState } from '../../components/common';

type FavoritesScreenNavigationProp = NativeStackNavigationProp<
  CustomerStackParamList,
  'Favorites'
>;

interface FavoritesScreenProps {
  navigation: FavoritesScreenNavigationProp;
}

export const FavoritesScreen: React.FC<FavoritesScreenProps> = ({ navigation }) => {
  const { colors, typography, spacing } = useTheme();
  const { favoriteVehicles, clearFavorites } = useFavorites();

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="Saved Fleet"
          subtitle={`${favoriteVehicles.length} vehicles favorited`}
          showBack
          onBackPress={() => navigation.goBack()}
          rightElement={
            favoriteVehicles.length > 0 ? (
              <TouchableOpacity onPress={clearFavorites} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text
                  style={{
                    color: colors.danger,
                    fontSize: typography.fontSizes.xs,
                    fontWeight: '700',
                  }}
                >
                  CLEAR ALL
                </Text>
              </TouchableOpacity>
            ) : null
          }
        />
      }
    >
      <View style={[styles.content, { padding: spacing.md }]}>
        {favoriteVehicles.length === 0 ? (
          <EmptyState
            title="No Saved Vehicles"
            message="Tap the heart icon on any vehicle card to save cars to your personal shortlist during this session."
            actionTitle="Explore Full Fleet"
            onAction={() => navigation.navigate('VehicleGallery')}
            style={{ marginTop: 40 }}
          />
        ) : (
          <View>
            <View style={styles.topInfoBar}>
              <Text
                style={[
                  styles.infoText,
                  { color: colors.textSecondary, fontSize: typography.fontSizes.xs },
                ]}
              >
                Saved items persist in your local session. Tap any vehicle to view full specifications or reserve.
              </Text>
            </View>

            {favoriteVehicles.map(car => (
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
  topInfoBar: {
    marginBottom: 12,
  },
  infoText: {
    letterSpacing: 0.1,
    lineHeight: 18,
  },
});
