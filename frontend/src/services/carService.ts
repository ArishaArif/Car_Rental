import { Car, FleetStats } from '../types';
import { MOCK_CARS, MOCK_FLEET_STATS } from './mockData';
import { vehiclesApi } from '../api/vehiclesApi';

function mapApiVehicleToCar(v: any): Car {
  return {
    id: String(v.id),
    name: `${v.brand} ${v.model}`,
    brand: v.brand,
    model: v.model,
    year: v.year,
    category: v.category || 'Sedan',
    pricePerDay: v.price_per_day,
    fuelType: v.fuel_type || 'Petrol',
    transmission: v.transmission || 'Automatic',
    seats: v.seats || 5,
    status: v.availability === 'Available' ? 'Available' : 'Rented',
    imageUrl: v.image,
    rating: v.rating || 5.0,
    tripsCount: v.trips_count || 12,
    location: v.location || 'Downtown Hub',
    features: v.features || ['Bluetooth Audio', 'Air Conditioning'],
  };
}

export const carService = {
  async getCars(): Promise<Car[]> {
    try {
      const response = await vehiclesApi.getVehicles();
      if (response.success && response.data && response.data.length > 0) {
        return response.data.map(mapApiVehicleToCar);
      }
      return MOCK_CARS;
    } catch {
      return MOCK_CARS;
    }
  },

  async getCarById(id: string): Promise<Car | undefined> {
    try {
      const response = await vehiclesApi.getVehicleById(id);
      if (response.success && response.data) {
        return mapApiVehicleToCar(response.data);
      }
      return MOCK_CARS.find(c => c.id === id);
    } catch {
      return MOCK_CARS.find(c => c.id === id);
    }
  },

  async getFleetStats(): Promise<FleetStats> {
    try {
      const response = await vehiclesApi.getFleetStats();
      if (response.success && response.data) {
        const d = response.data;
        return {
          totalVehicles: d.total_vehicles,
          activeRentals: d.rented_vehicles,
          availableVehicles: d.available_vehicles,
          maintenanceVehicles: d.maintenance_vehicles,
          totalRevenue: d.total_revenue,
          utilizationRate: d.utilization_rate,
        };
      }
      return MOCK_FLEET_STATS;
    } catch {
      return MOCK_FLEET_STATS;
    }
  },
};
