// Car Rental & Fleet Management System Domain Types

export type CarCategory = 'Luxury' | 'SUV' | 'Sedan' | 'Electric' | 'Sports' | 'Compact';
export type FuelType = 'Electric' | 'Hybrid' | 'Petrol' | 'Diesel';
export type CarStatus = 'Available' | 'Rented' | 'Maintenance' | 'Reserved';
export type RentalStatus = 'Active' | 'Upcoming' | 'Completed' | 'Cancelled';

export interface Car {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  category: CarCategory;
  pricePerDay: number;
  fuelType: FuelType;
  transmission: 'Automatic' | 'Manual';
  seats: number;
  status: CarStatus;
  imageUrl: string;
  rating: number;
  tripsCount: number;
  location: string;
  features: string[];
}

export interface Rental {
  id: string;
  carId: string;
  carName: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: RentalStatus;
  pickupLocation: string;
  dropoffLocation: string;
}

export interface FleetStats {
  totalVehicles: number;
  activeRentals: number;
  availableVehicles: number;
  maintenanceVehicles: number;
  totalRevenue: number;
  utilizationRate: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'Customer' | 'Provider' | 'Admin';
  avatarUrl?: string;
}

export type RootStackParamList = {
  Home: undefined;
  Details: { carId: string };
};
