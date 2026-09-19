import { FilterOptions, SortOption, Vehicle, VehicleCategory } from '../types';
import { MOCK_VEHICLES } from './vehicleData';

export interface CategorySummary {
  category: VehicleCategory;
  count: number;
  minPrice: number;
  icon: string;
  badge: string;
  tagline: string;
}

class VehicleService {
  /**
   * Return all vehicles in dataset
   */
  public async getAllVehicles(): Promise<Vehicle[]> {
    return [...MOCK_VEHICLES];
  }

  /**
   * Find vehicle by ID
   */
  public async getVehicleById(id: string): Promise<Vehicle | undefined> {
    return MOCK_VEHICLES.find(v => v.id === id);
  }

  /**
   * Search, filter, and sort vehicles with real local logic
   */
  public async searchAndFilterVehicles(
    query?: string,
    filters?: FilterOptions,
    sort: SortOption = 'rating_desc'
  ): Promise<Vehicle[]> {
    let result = [...MOCK_VEHICLES];

    // 1. Text Search across brand, model, category, location, and features
    if (query && query.trim().length > 0) {
      const q = query.trim().toLowerCase();
      result = result.filter(v => {
        const fullTitle = `${v.brand} ${v.model}`.toLowerCase();
        const brandMatch = v.brand.toLowerCase().includes(q);
        const modelMatch = v.model.toLowerCase().includes(q);
        const catMatch = v.category.toLowerCase().includes(q);
        const locMatch = v.location.toLowerCase().includes(q);
        const featureMatch = v.features.some(f => f.toLowerCase().includes(q));
        return fullTitle.includes(q) || brandMatch || modelMatch || catMatch || locMatch || featureMatch;
      });
    }

    // 2. Filters
    if (filters) {
      // Category
      if (filters.category && filters.category !== 'All') {
        result = result.filter(v => v.category.toLowerCase() === filters.category!.toLowerCase());
      }

      // Price Range
      if (filters.minPrice !== undefined) {
        result = result.filter(v => v.pricePerDay >= filters.minPrice!);
      }
      if (filters.maxPrice !== undefined) {
        result = result.filter(v => v.pricePerDay <= filters.maxPrice!);
      }

      // Transmission
      if (filters.transmission && filters.transmission !== 'All') {
        result = result.filter(
          v => v.transmission.toLowerCase() === filters.transmission!.toLowerCase()
        );
      }

      // Fuel
      if (filters.fuel && filters.fuel !== 'All') {
        result = result.filter(v => v.fuel.toLowerCase() === filters.fuel!.toLowerCase());
      }

      // Seats
      if (filters.seats && filters.seats !== 'All') {
        if (filters.seats === 7) {
          result = result.filter(v => v.seats >= 7);
        } else {
          result = result.filter(v => v.seats === filters.seats);
        }
      }

      // Availability
      if (filters.availableOnly) {
        result = result.filter(v => v.availability === 'Available');
      }
    }

    // 3. Sorting
    switch (sort) {
      case 'price_asc':
        result.sort((a, b) => a.pricePerDay - b.pricePerDay);
        break;
      case 'price_desc':
        result.sort((a, b) => b.pricePerDay - a.pricePerDay);
        break;
      case 'year_desc':
        result.sort((a, b) => b.year - a.year);
        break;
      case 'rating_desc':
      default:
        result.sort((a, b) => b.rating - a.rating);
        break;
    }

    return result;
  }

  /**
   * Return category summaries with count, min price, and metadata
   */
  public getCategoriesSummary(): CategorySummary[] {
    const categories: VehicleCategory[] = ['Economy', 'Sedan', 'SUV', 'Luxury'];

    const meta: Record<
      VehicleCategory,
      { icon: string; badge: string; tagline: string }
    > = {
      Economy: {
        icon: '⚡',
        badge: 'HIGH EFFICIENCY',
        tagline: 'Smart, nimble city mobility with maximum fuel range and easy parking.',
      },
      Sedan: {
        icon: '🚗',
        badge: 'PREMIUM COMFORT',
        tagline: 'Balanced performance, acoustic quietness, and executive road manners.',
      },
      SUV: {
        icon: '🚙',
        badge: 'ALL-TERRAIN & FAMILY',
        tagline: 'High seating command, generous luggage bays, and rugged capability.',
      },
      Luxury: {
        icon: '👑',
        badge: 'EXECUTIVE CLASS',
        tagline: 'Prestige marques engineered with cutting-edge tech and lavish comfort.',
      },
    };

    return categories.map(cat => {
      const vehiclesInCat = MOCK_VEHICLES.filter(v => v.category === cat);
      const minPrice =
        vehiclesInCat.length > 0
          ? Math.min(...vehiclesInCat.map(v => v.pricePerDay))
          : 50;

      return {
        category: cat,
        count: vehiclesInCat.length,
        minPrice,
        ...meta[cat],
      };
    });
  }
}

export const vehicleService = new VehicleService();
