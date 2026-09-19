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

export type UserRole = 'Customer' | 'Provider' | 'Admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  token?: string;
  isProfileComplete?: boolean;
  avatarUrl?: string;
  city?: string;
  licenseNumber?: string;
  businessName?: string;
  fleetSize?: string;
  department?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  RoleSelection: undefined;
  Login: { role?: UserRole } | undefined;
  Register: { role?: UserRole } | undefined;
  OtpVerification: {
    email: string;
    phone?: string;
    role: UserRole;
    fromScreen?: 'Register' | 'ForgotPassword';
  };
  ForgotPassword: { role?: UserRole } | undefined;
  ResetPassword: { email: string };
  ProfileSetup: { role: UserRole };
};

export type VehicleCategory = 'Economy' | 'Sedan' | 'SUV' | 'Luxury';
export type TransmissionType = 'Automatic' | 'Manual';
export type VehicleFuelType = 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric';
export type VehicleAvailability = 'Available' | 'Rented' | 'Reserved' | 'Maintenance';

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  category: VehicleCategory;
  image: string;
  pricePerDay: number;
  rating: number;
  seats: number;
  doors: number;
  transmission: TransmissionType;
  fuel: VehicleFuelType;
  location: string;
  availability: VehicleAvailability;
  features: string[];
  description: string;
}

export interface FilterOptions {
  category?: VehicleCategory | 'All';
  minPrice?: number;
  maxPrice?: number;
  transmission?: TransmissionType | 'All';
  fuel?: VehicleFuelType | 'All';
  seats?: number | 'All';
  availableOnly?: boolean;
}

export type SortOption =
  | 'price_asc'
  | 'price_desc'
  | 'rating_desc'
  | 'year_desc';

export type BookingStatus = 'Confirmed' | 'Active' | 'Completed' | 'Cancelled';
export type PaymentMethod = 'Card' | 'JazzCash' | 'EasyPaisa';
export type PaymentStatus = 'Pending' | 'Processing' | 'Paid' | 'Failed';

export interface BookingPricing {
  dailyPrice: number;
  rentalDays: number;
  subtotal: number;
  serviceFee: number;
  taxes: number;
  securityDeposit: number;
  total: number;
}

export interface BookingCustomerDetails {
  fullName: string;
  phone: string;
  email: string;
  licenseNumber: string;
  notes?: string;
}

export interface BookingDraft {
  vehicle: Vehicle;
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
  rentalDays: number;
  pickupLocation: string;
  returnLocation: string;
  sameLocation: boolean;
  pricing: BookingPricing;
  customer?: BookingCustomerDetails;
  paymentMethod?: PaymentMethod;
}

export interface Booking {
  id: string;
  vehicleId: string;
  vehicle: Vehicle;
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
  rentalDays: number;
  pickupLocation: string;
  returnLocation: string;
  pricing: BookingPricing;
  customer: BookingCustomerDetails;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  createdAt: string;
  pickupCode: string;
}

export type CustomerStackParamList = {
  CustomerHome: undefined;
  SearchCars: { initialQuery?: string; initialCategory?: VehicleCategory } | undefined;
  VehicleCategories: undefined;
  VehicleGallery: {
    category?: VehicleCategory;
    filterParams?: FilterOptions;
    sortOption?: SortOption;
  } | undefined;
  FilterScreen: { currentFilters?: FilterOptions } | undefined;
  SortScreen: { currentSort?: SortOption } | undefined;
  CarDetails: { vehicleId: string };
  Favorites: undefined;
  CheckAvailability: { vehicleId: string };
  RentalDates: { vehicleId: string };
  RentalLocation: { vehicleId: string };
  BookingSummary: { vehicleId: string };
  CustomerDetails: { vehicleId: string };
  BookingPayment: { vehicleId: string };
  BookingConfirmation: { bookingId: string };
  MyBookings: undefined;
  BookingDetails: { bookingId: string };
};

export type ProviderStackParamList = {
  ProviderDashboard: undefined;
};

export type AdminStackParamList = {
  AdminConsole: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  CustomerApp: undefined;
  ProviderApp: undefined;
  AdminApp: undefined;
  Home: undefined;
  Details: { carId: string };
};

