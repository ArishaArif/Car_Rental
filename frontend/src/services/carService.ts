import { Car, FleetStats } from '../types';
import { MOCK_CARS, MOCK_FLEET_STATS } from './mockData';
import { apiClient } from './apiClient';

export const carService = {
  async getCars(): Promise<Car[]> {
    try {
      // API call structure ready for real backend integration
      const response = await apiClient.get<Car[]>('/cars');
      if (response.success && response.data) {
        return response.data;
      }
      return MOCK_CARS;
    } catch {
      // Fallback to local mock data when backend endpoint is unavailable
      return MOCK_CARS;
    }
  },

  async getCarById(id: string): Promise<Car | undefined> {
    try {
      const response = await apiClient.get<Car>(`/cars/${id}`);
      if (response.success && response.data) {
        return response.data;
      }
      return MOCK_CARS.find(c => c.id === id);
    } catch {
      return MOCK_CARS.find(c => c.id === id);
    }
  },

  async getFleetStats(): Promise<FleetStats> {
    try {
      const response = await apiClient.get<FleetStats>('/fleet/stats');
      if (response.success && response.data) {
        return response.data;
      }
      return MOCK_FLEET_STATS;
    } catch {
      return MOCK_FLEET_STATS;
    }
  },
};
