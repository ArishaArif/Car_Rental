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

export type UserRole = 'Customer' | 'Provider' | 'FleetManager' | 'Admin';

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
  licenseExpiry?: string;
  businessName?: string;
  fleetSize?: string;
  department?: string;
  preferences?: CustomerPreferences;
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
export type VehicleAvailability =
  | 'Available'
  | 'Booked'
  | 'Active Rental'
  | 'Maintenance'
  | 'Archived'
  | 'Rented'
  | 'Reserved';

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  category: VehicleCategory;
  image: string;
  images?: string[];
  pricePerDay: number;
  weeklyPrice?: number;
  securityDeposit?: number;
  rating: number;
  seats: number;
  doors: number;
  transmission: TransmissionType;
  fuel: VehicleFuelType;
  location: string;
  mileage?: number;
  availability: VehicleAvailability;
  features: string[];
  description: string;
  isPublished?: boolean;
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

export type BookingStatus = 'Pending' | 'Confirmed' | 'Active' | 'Completed' | 'Cancelled';
export type PaymentMethod = 'Card' | 'JazzCash' | 'EasyPaisa';
export type PaymentStatus = 'Pending' | 'Processing' | 'Paid' | 'Failed';

export interface VehicleInspection {
  exteriorCondition: 'Good' | 'Minor Scratches' | 'Damaged';
  interiorCondition: 'Clean' | 'Normal' | 'Needs Cleaning';
  fuelLevel: number; // percentage 0 - 100
  odometerReading: number; // km
  generalNotes?: string;
  inspectionPassed: boolean;
  inspectedAt: string;
}

export interface BookingInvoice {
  invoiceNumber: string;
  bookingId: string;
  issuedAt: string;
  baseRental: number;
  serviceFee: number;
  taxes: number;
  securityDeposit: number;
  lateCharges: number;
  damageCharges: number;
  depositRefund: number;
  finalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
}

export type AppLanguage = 'English' | 'Urdu' | 'Roman Urdu';

export interface CustomerPreferences {
  language: AppLanguage;
  preferredCategory: VehicleCategory | 'All';
  preferredTransmission: TransmissionType | 'All';
  pushNotifications: boolean;
  smsNotifications: boolean;
  emailReceipts: boolean;
  biometricLogin: boolean;
  locationServices: boolean;
  currency: 'USD' | 'PKR';
  distanceUnit: 'km' | 'mi';
}

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
  pickupMileage?: number;
  dropoffMileage?: number;
  dropoffFuel?: number;
  inspection?: VehicleInspection;
  invoice?: BookingInvoice;
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
  MyBookings: { initialTab?: 'all' | 'upcoming' | 'active' | 'completed' | 'cancelled' } | undefined;
  BookingDetails: { bookingId: string };
  ActiveRental: { bookingId?: string } | undefined;
  ReturnVehicle: { bookingId: string };
  ReturnInspection: {
    bookingId: string;
    returnLocation?: string;
    dropoffMileage?: number;
    dropoffFuel?: number;
  };
  ReturnConfirmation: { bookingId: string };
  FinalInvoice: { bookingId: string };
  AIAssistant: { initialQuery?: string; initialLanguage?: LanguageMode } | undefined;
  AIDamageInspection: { bookingId: string; vehicleId?: string };
  AIDamageReport: { inspectionResult: InspectionAnalysisResult; bookingId: string };
  CustomerProfile: undefined;
  EditProfile: undefined;
  CustomerSettings: undefined;
};

export type ProviderStackParamList = {
  ProviderDashboard: undefined;
  FleetList: { filterStatus?: VehicleAvailability } | undefined;
  VehicleDetails: { vehicleId: string };
  AddVehicle: undefined;
  EditVehicle: { vehicleId: string };
  VehicleAvailability: { vehicleId: string };
  ProviderBookings: { initialFilter?: BookingStatus } | undefined;
  ProviderBookingDetails: { bookingId: string };
  RevenueDashboard: undefined;
  RevenueReports: undefined;
  SmartPricing: { vehicleId?: string } | undefined;
  VehiclePricingAnalysis: { vehicleId: string };
  ProviderProfile: undefined;
};

export type FleetManagerStackParamList = {
  FleetManagerDashboard: undefined;
  FleetManagerFleet: { filterStatus?: VehicleAvailability } | undefined;
  FleetManagerVehicleDetails: { vehicleId: string };
  FleetMaintenance: { filterStatus?: MaintenanceStatus } | undefined;
  ScheduleMaintenance: { vehicleId?: string } | undefined;
  FleetInspections: { filterStatus?: InspectionStatus } | undefined;
  NewInspection: { vehicleId?: string; bookingId?: string } | undefined;
  ActiveRentals: undefined;
  FleetReturns: { filterStatus?: ReturnStatus } | undefined;
  ProcessReturn: { returnId: string };
  DamageReports: { filterStatus?: DamageReviewStatus } | undefined;
  NewDamageReport: { vehicleId?: string; bookingId?: string } | undefined;
  FleetTasks: undefined;
  FleetManagerProfile: undefined;
};

export type AdminStackParamList = {
  AdminConsole: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  CustomerApp: undefined;
  ProviderApp: undefined;
  FleetManagerApp: undefined;
  AdminApp: undefined;
  Home: undefined;
  Details: { carId: string };
};

// ==========================================
// Operational & Fleet Management Types
// ==========================================

export type MaintenanceType =
  | 'Oil Change'
  | 'Brake Inspection'
  | 'Tire Rotation'
  | 'Detailing & Cleaning'
  | 'Scheduled Service'
  | 'Battery & Electrical'
  | 'General Repair';

export type MaintenanceStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Overdue';

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  vehicleName: string;
  vehiclePlate?: string;
  type: MaintenanceType;
  dueDate: string;
  completedDate?: string;
  status: MaintenanceStatus;
  estimatedCost: number;
  actualCost?: number;
  serviceCenter: string;
  notes?: string;
  odometerAtService?: number;
}

export type InspectionStatus = 'Pending' | 'In Progress' | 'Completed' | 'Failed';

export interface FleetInspection {
  id: string;
  vehicleId: string;
  vehicleName: string;
  bookingId?: string;
  inspectorName: string;
  date: string;
  status: InspectionStatus;
  type: 'Pre-Trip' | 'Post-Return' | 'Routine' | 'Maintenance Check';
  exteriorCondition: 'Good' | 'Minor Scratches' | 'Damaged';
  interiorCondition: 'Clean' | 'Normal' | 'Needs Cleaning';
  tiresAndBrakes: 'Good' | 'Fair' | 'Needs Replacement';
  fuelLevel: number;
  odometerReading: number;
  passed: boolean;
  notes?: string;
}

export type ReturnStatus = 'Expected' | 'Inspection Required' | 'Completed';

export interface FleetReturn {
  id: string;
  bookingId: string;
  vehicleId: string;
  vehicleName: string;
  customerName: string;
  customerPhone: string;
  expectedReturnDate: string;
  expectedReturnTime: string;
  returnLocation: string;
  status: ReturnStatus;
  actualReturnDate?: string;
  dropoffMileage?: number;
  dropoffFuel?: number;
  lateHours?: number;
  conditionNotes?: string;
}

export type DamageStatus =
  | 'Minor Scratches'
  | 'Dented Panel'
  | 'Cracked Glass'
  | 'Interior Damage'
  | 'Wheel Rim Scuff'
  | 'Mechanical / Engine';

export type DamageReviewStatus = 'Pending Review' | 'Approved' | 'Disputed' | 'Resolved';

export interface DamageReport {
  id: string;
  vehicleId: string;
  vehicleName: string;
  bookingId: string;
  customerName: string;
  reportedAt: string;
  damageStatus: DamageStatus;
  description: string;
  estimatedCharge: number;
  reviewStatus: DamageReviewStatus;
  resolvedAt?: string;
  photoUrl?: string;
}

export interface FleetTask {
  id: string;
  title: string;
  description: string;
  vehicleId?: string;
  vehicleName?: string;
  priority: 'High' | 'Medium' | 'Low';
  dueTime: string;
  status: 'Pending' | 'Completed';
  category: 'Preparation' | 'Cleaning' | 'Shuttle' | 'Inspection' | 'Maintenance';
}

export interface PricingRule {
  id: string;
  name: string;
  peakMultiplier: number;
  weekendSurgePercent: number;
  weeklyDiscountPercent: number;
  minRentalDays: number;
  isActive: boolean;
}

// ==========================================
// AI Assistant & Voice Types
// ==========================================

export type LanguageMode = 'English' | 'Urdu' | 'Roman Urdu';

export type VoiceUIState = 'Ready' | 'Listening' | 'Processing' | 'Responding' | 'Error';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  language?: LanguageMode;
  recommendations?: Vehicle[];
  quickReplies?: string[];
  isVoiceInput?: boolean;
}

// ==========================================
// AI Damage Inspection Types
// ==========================================

export type PhotoCategory =
  | 'Front'
  | 'Rear'
  | 'Left'
  | 'Right'
  | 'Interior'
  | 'Dashboard';

export type DamageType = 'No Damage' | 'Scratch' | 'Dent' | 'Glass Crack';

export type DamageSeverity = 'None' | 'Minor' | 'Moderate' | 'Severe';

export interface DamageFinding {
  id: string;
  category: PhotoCategory;
  damageType: DamageType;
  severity: DamageSeverity;
  location: string;
  confidence: number; // e.g. 0.94 (mocked)
  estimatedRepairCost: number; // PKR
  evidenceImageUrl: string;
  notes: string;
}

export interface CapturedPhoto {
  category: PhotoCategory;
  uri: string;
  capturedAt: string;
  label: string;
}

export interface InspectionAnalysisResult {
  inspectionId: string;
  vehicleId: string;
  bookingId?: string;
  analyzedAt: string;
  findings: DamageFinding[];
  totalEstimatedCost: number;
  overallCondition: 'Passed - No Damage' | 'Needs Minor Repair' | 'Requires Provider Attention';
  disclaimer: string;
}

// ==========================================
// Smart Pricing Types
// ==========================================

export interface PricingFactor {
  label: string;
  impact: string;
  positive: boolean;
}

export interface VehiclePricingMetrics {
  vehicleId: string;
  vehicleName: string;
  currentPrice: number;
  recommendedPrice: number;
  difference: number;
  percentageChange: number;
  demandLevel: 'Low' | 'Moderate' | 'High' | 'Peak';
  utilizationRate: number; // e.g. 85%
  weekendFactor: number; // e.g. 1.15
  seasonalFactor: number; // e.g. 1.10
  availabilityStatus: VehicleAvailability;
  bookingFrequency: number; // bookings / month
  explanation: string;
  factors: PricingFactor[];
}


