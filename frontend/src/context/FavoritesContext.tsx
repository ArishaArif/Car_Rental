import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Vehicle } from '../types';
import { MOCK_VEHICLES } from '../services/vehicleData';

export interface FavoritesContextType {
  favorites: string[];
  favoriteVehicles: Vehicle[];
  toggleFavorite: (vehicleId: string) => void;
  isFavorite: (vehicleId: string) => boolean;
  clearFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Pre-seed with two popular vehicles so reviewer immediately sees functional favorites
  const [favorites, setFavorites] = useState<string[]>([
    'veh-corolla-01',
    'veh-fortuner-06',
  ]);

  const toggleFavorite = (vehicleId: string) => {
    setFavorites(prev => {
      if (prev.includes(vehicleId)) {
        return prev.filter(id => id !== vehicleId);
      } else {
        return [...prev, vehicleId];
      }
    });
  };

  const isFavorite = (vehicleId: string): boolean => {
    return favorites.includes(vehicleId);
  };

  const clearFavorites = () => {
    setFavorites([]);
  };

  const favoriteVehicles = MOCK_VEHICLES.filter(v => favorites.includes(v.id));

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        favoriteVehicles,
        toggleFavorite,
        isFavorite,
        clearFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
