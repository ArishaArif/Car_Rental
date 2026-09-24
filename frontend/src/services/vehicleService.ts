import { FilterOptions, SortOption, Vehicle, VehicleAvailability, VehicleCategory } from '../types';
import { MOCK_VEHICLES } from './vehicleData';
import { vehiclesApi } from '../api/vehiclesApi';
import { ApiVehicleResponse } from '../api/types';

export interface CategorySummary {
  category: VehicleCategory;
  count: number;
  minPrice: number;
  icon: string;
  badge: string;
  tagline: string;
}

export interface FleetStatsSummary {
  totalVehicles: number;
  availableVehicles: number;
  rentedVehicles: number;
  maintenanceVehicles: number;
  archivedVehicles: number;
  utilizationRate: number;
}

type VehicleChangeListener = (vehicles: Vehicle[]) => void;

function mapApiVehicleToFrontend(apiV: ApiVehicleResponse): Vehicle {
  return {
    id: String(apiV.id),
    brand: apiV.brand,
    model: apiV.model,
    year: apiV.year,
    category: (apiV.category as VehicleCategory) || 'Sedan',
    image: apiV.image,
    images: apiV.images && apiV.images.length > 0 ? apiV.images : [apiV.image],
    pricePerDay: apiV.price_per_day,
    weeklyPrice: apiV.weekly_price || Math.round(apiV.price_per_day * 6.2),
    securityDeposit: apiV.security_deposit || 200,
    rating: apiV.rating || 5.0,
    seats: apiV.seats || 5,
    doors: apiV.doors || 4,
    transmission: (apiV.transmission as any) || 'Automatic',
    fuel: (apiV.fuel_type as any) || 'Petrol',
    location: apiV.location || 'Central Depot & Hub West',
    mileage: apiV.mileage || 15000,
    availability: (apiV.availability as VehicleAvailability) || 'Available',
    features: apiV.features || ['Bluetooth Audio', 'Air Conditioning', 'Keyless Entry'],
    description: (apiV.specs as any)?.description || `${apiV.brand} ${apiV.model} maintained to official certified standards.`,
    isPublished: apiV.is_published !== undefined ? apiV.is_published : true,
  };
}

class VehicleService {
  // In-memory unified fleet store initialized from MOCK_VEHICLES
  private vehicles: Vehicle[] = MOCK_VEHICLES.map(v => ({
    ...v,
    isPublished: v.isPublished !== undefined ? v.isPublished : true,
    weeklyPrice: v.weeklyPrice || Math.round(v.pricePerDay * 6.2),
    securityDeposit: v.securityDeposit || 200,
    mileage: v.mileage || Math.floor(12000 + Math.random() * 30000),
  }));

  private listeners: VehicleChangeListener[] = [];
  private hasSyncedWithBackend: boolean = false;

  constructor() {
    // Proactively fetch live vehicles from backend in background
    this.syncFromBackend().catch(err => {
      console.warn('[VehicleService] Initial backend sync background warning:', err?.message);
    });
  }

  public async syncFromBackend(): Promise<Vehicle[]> {
    try {
      const res = await vehiclesApi.getVehicles({ include_unapproved: true });
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const liveVehicles = res.data.map(mapApiVehicleToFrontend);

        // Merge live vehicles with mock dataset without duplicates
        const liveIds = new Set(liveVehicles.map(v => v.id));
        const keptMocks = this.vehicles.filter(v => !liveIds.has(v.id));
        this.vehicles = [...liveVehicles, ...keptMocks];
        this.hasSyncedWithBackend = true;
        this.notifyListeners();
        return [...this.vehicles];
      }
    } catch (err: any) {
      console.warn('[VehicleService] Live vehicles fetch warning (using cache):', err?.message);
    }
    return [...this.vehicles];
  }

  /**
   * Subscribe to vehicle dataset updates
   */
  public subscribe(listener: VehicleChangeListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    const copy = [...this.vehicles];
    this.listeners.forEach(listener => {
      try {
        listener(copy);
      } catch (err) {
        console.warn('Error in vehicle change listener', err);
      }
    });
  }

  /**
   * Return all vehicles in dataset.
   * If includeArchived is false (default for customer app), only published, non-archived vehicles are returned.
   */
  public async getAllVehicles(includeArchived: boolean = false): Promise<Vehicle[]> {
    if (!this.hasSyncedWithBackend) {
      await this.syncFromBackend();
    }

    if (includeArchived) {
      return [...this.vehicles];
    }
    return this.vehicles.filter(v => v.availability !== 'Archived' && v.isPublished !== false);
  }

  /**
   * Find vehicle by ID
   */
  public async getVehicleById(id: string): Promise<Vehicle | undefined> {
    const local = this.vehicles.find(v => v.id === id);
    if (local) return local;

    try {
      const res = await vehiclesApi.getVehicleById(id);
      if (res.success && res.data) {
        const mapped = mapApiVehicleToFrontend(res.data);
        this.vehicles.unshift(mapped);
        this.notifyListeners();
        return mapped;
      }
    } catch (err) {
      // not found on backend or offline
    }

    return undefined;
  }

  /**
   * Add a new vehicle to fleet
   */
  public async addVehicle(data: Omit<Vehicle, 'id'> | Partial<Vehicle>): Promise<Vehicle> {
    const localId = `veh-${Date.now().toString().slice(-6)}`;
    const newVehicle: Vehicle = {
      id: localId,
      brand: data.brand || 'Toyota',
      model: data.model || 'Corolla',
      year: data.year || new Date().getFullYear(),
      category: data.category || 'Sedan',
      image:
        data.image ||
        'https://images.unsplash.com/photo-1623869675781-80aa31012a5a?q=80&w=800',
      images: data.images || [
        data.image ||
          'https://images.unsplash.com/photo-1623869675781-80aa31012a5a?q=80&w=800',
      ],
      pricePerDay: data.pricePerDay || 65,
      weeklyPrice: data.weeklyPrice || Math.round((data.pricePerDay || 65) * 6.2),
      securityDeposit: data.securityDeposit || 200,
      rating: data.rating || 5.0,
      seats: data.seats || 5,
      doors: data.doors || 4,
      transmission: data.transmission || 'Automatic',
      fuel: data.fuel || 'Petrol',
      location: data.location || 'Central Depot & Hub West',
      mileage: data.mileage || 1500,
      availability: data.availability || 'Available',
      features: data.features || ['Bluetooth Audio', 'Air Conditioning', 'Keyless Entry'],
      description:
        data.description ||
        'Newly added fleet vehicle maintained to official certified standards.',
      isPublished: data.isPublished !== undefined ? data.isPublished : true,
    };

    try {
      const apiRes = await vehiclesApi.createVehicle({
        brand: newVehicle.brand,
        model: newVehicle.model,
        year: newVehicle.year,
        category: newVehicle.category,
        image: newVehicle.image,
        price_per_day: newVehicle.pricePerDay,
        weekly_price: newVehicle.weeklyPrice,
        security_deposit: newVehicle.securityDeposit,
        seats: newVehicle.seats,
        doors: newVehicle.doors,
        transmission: newVehicle.transmission as any,
        fuel_type: newVehicle.fuel as any,
        location: newVehicle.location,
        features: newVehicle.features,
        mileage: newVehicle.mileage,
        is_published: newVehicle.isPublished,
      });

      if (apiRes.success && apiRes.data) {
        const live = mapApiVehicleToFrontend(apiRes.data);
        this.vehicles = [live, ...this.vehicles];
        this.notifyListeners();
        return live;
      }
    } catch (err: any) {
      console.warn('[VehicleService] Live vehicle creation fallback to local:', err?.message);
    }

    this.vehicles = [newVehicle, ...this.vehicles];
    this.notifyListeners();
    return newVehicle;
  }

  /**
   * Update an existing vehicle's fields
   */
  public async updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle> {
    const idx = this.vehicles.findIndex(v => v.id === id);
    if (idx === -1) {
      throw new Error(`Vehicle ${id} not found`);
    }

    try {
      const apiPayload: any = {};
      if (updates.pricePerDay !== undefined) apiPayload.price_per_day = updates.pricePerDay;
      if (updates.weeklyPrice !== undefined) apiPayload.weekly_price = updates.weeklyPrice;
      if (updates.availability !== undefined) apiPayload.availability = updates.availability;
      if (updates.isPublished !== undefined) apiPayload.is_published = updates.isPublished;
      if (updates.location !== undefined) apiPayload.location = updates.location;

      if (Object.keys(apiPayload).length > 0) {
        await vehiclesApi.updateVehicle(id, apiPayload);
      }
    } catch (err: any) {
      console.warn('[VehicleService] Live vehicle update fallback:', err?.message);
    }

    this.vehicles[idx] = {
      ...this.vehicles[idx],
      ...updates,
    };

    this.notifyListeners();
    return this.vehicles[idx];
  }

  /**
   * Publish vehicle to customer discovery
   */
  public async publishVehicle(id: string): Promise<Vehicle> {
    const idx = this.vehicles.findIndex(v => v.id === id);
    if (idx === -1) throw new Error(`Vehicle ${id} not found`);

    try {
      await vehiclesApi.publishVehicle(id);
    } catch (err: any) {
      console.warn('[VehicleService] Live publish fallback:', err?.message);
    }

    const current = this.vehicles[idx];
    const newAvail = current.availability === 'Archived' ? 'Available' : current.availability;

    this.vehicles[idx] = {
      ...current,
      isPublished: true,
      availability: newAvail,
    };

    this.notifyListeners();
    return this.vehicles[idx];
  }

  /**
   * Unpublish vehicle (hidden from customers, retained in fleet)
   */
  public async unpublishVehicle(id: string): Promise<Vehicle> {
    const idx = this.vehicles.findIndex(v => v.id === id);
    if (idx === -1) throw new Error(`Vehicle ${id} not found`);

    try {
      await vehiclesApi.unpublishVehicle(id);
    } catch (err: any) {
      console.warn('[VehicleService] Live unpublish fallback:', err?.message);
    }

    this.vehicles[idx] = {
      ...this.vehicles[idx],
      isPublished: false,
    };

    this.notifyListeners();
    return this.vehicles[idx];
  }

  /**
   * Archive vehicle (retired/decommissioned from fleet)
   */
  public async archiveVehicle(id: string): Promise<Vehicle> {
    const idx = this.vehicles.findIndex(v => v.id === id);
    if (idx === -1) throw new Error(`Vehicle ${id} not found`);

    try {
      await vehiclesApi.updateVehicle(id, { availability: 'Archived', is_published: false });
    } catch (err: any) {
      console.warn('[VehicleService] Live archive fallback:', err?.message);
    }

    this.vehicles[idx] = {
      ...this.vehicles[idx],
      isPublished: false,
      availability: 'Archived',
    };

    this.notifyListeners();
    return this.vehicles[idx];
  }

  /**
   * Update vehicle availability status
   */
  public async updateAvailability(
    id: string,
    availability: VehicleAvailability
  ): Promise<Vehicle> {
    const idx = this.vehicles.findIndex(v => v.id === id);
    if (idx === -1) throw new Error(`Vehicle ${id} not found`);

    try {
      await vehiclesApi.updateVehicle(id, { availability });
    } catch (err: any) {
      console.warn('[VehicleService] Live updateAvailability fallback:', err?.message);
    }

    this.vehicles[idx] = {
      ...this.vehicles[idx],
      availability,
    };

    this.notifyListeners();
    return this.vehicles[idx];
  }

  /**
   * Calculate real-time fleet statistics
   */
  public getFleetStats(): FleetStatsSummary {
    const totalVehicles = this.vehicles.length;
    const availableVehicles = this.vehicles.filter(v => v.availability === 'Available').length;
    const rentedVehicles = this.vehicles.filter(
      v => v.availability === 'Active Rental' || v.availability === 'Rented' || v.availability === 'Booked'
    ).length;
    const maintenanceVehicles = this.vehicles.filter(
      v => v.availability === 'Maintenance'
    ).length;
    const archivedVehicles = this.vehicles.filter(
      v => v.availability === 'Archived'
    ).length;

    const activeFleet = totalVehicles - archivedVehicles;
    const utilizationRate = activeFleet > 0 ? Math.round((rentedVehicles / activeFleet) * 100) : 0;

    return {
      totalVehicles,
      availableVehicles,
      rentedVehicles,
      maintenanceVehicles,
      archivedVehicles,
      utilizationRate,
    };
  }

  /**
   * Search, filter, and sort vehicles with real local logic
   */
  public async searchAndFilterVehicles(
    query?: string,
    filters?: FilterOptions,
    sort: SortOption = 'rating_desc',
    includeUnpublished: boolean = false
  ): Promise<Vehicle[]> {
    let result = await this.getAllVehicles(includeUnpublished);

    // Filter out unpublished or archived vehicles for customer discovery
    if (!includeUnpublished) {
      result = result.filter(v => v.isPublished !== false && v.availability !== 'Archived');
    }

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
        return (
          fullTitle.includes(q) ||
          brandMatch ||
          modelMatch ||
          catMatch ||
          locMatch ||
          featureMatch
        );
      });
    }

    // 2. Filters
    if (filters) {
      if (filters.category && filters.category !== 'All') {
        result = result.filter(
          v => v.category.toLowerCase() === filters.category!.toLowerCase()
        );
      }
      if (filters.minPrice !== undefined) {
        result = result.filter(v => v.pricePerDay >= filters.minPrice!);
      }
      if (filters.maxPrice !== undefined) {
        result = result.filter(v => v.pricePerDay <= filters.maxPrice!);
      }
      if (filters.transmission && filters.transmission !== 'All') {
        result = result.filter(
          v => v.transmission.toLowerCase() === filters.transmission!.toLowerCase()
        );
      }
      if (filters.fuel && filters.fuel !== 'All') {
        result = result.filter(v => v.fuel.toLowerCase() === filters.fuel!.toLowerCase());
      }
      if (filters.seats && filters.seats !== 'All') {
        if (filters.seats === 7) {
          result = result.filter(v => v.seats >= 7);
        } else {
          result = result.filter(v => v.seats === filters.seats);
        }
      }
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
      const vehiclesInCat = this.vehicles.filter(
        v => v.category === cat && v.isPublished !== false && v.availability !== 'Archived'
      );
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
