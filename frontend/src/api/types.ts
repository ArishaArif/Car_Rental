/**
 * Strongly-Typed REST API Contracts for Velox Mobile Client
 * Mirrors FastAPI Pydantic Models for End-to-End Type Safety.
 */

// ==================== AUTH & USERS ====================
export interface ApiTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface ApiRegisterRequest {
  full_name: string;
  email: string;
  password?: string;
  role?: 'Customer' | 'Provider' | 'FleetManager' | 'Admin';
  phone_number?: string;
  city?: string;
  license_number?: string;
  license_expiry?: string;
  business_name?: string;
  fleet_size?: string;
  department?: string;
}

export interface ApiLoginRequest {
  email: string;
  password?: string;
  role?: string;
}

export interface ApiVerifyOtpRequest {
  email: string;
  otp_code: string;
  purpose?: string;
}

export interface ApiResendOtpRequest {
  email: string;
  purpose?: string;
}

export interface ApiForgotPasswordRequest {
  email: string;
}

export interface ApiResetPasswordRequest {
  email: string;
  otp_code: string;
  new_password?: string;
}

export interface ApiUserResponse {
  id: string;
  email: string;
  name: string;
  role: 'Customer' | 'Provider' | 'FleetManager' | 'Admin';
  phone?: string;
  is_active: boolean;
  is_verified: boolean;
  city?: string;
  avatar_url?: string;
  license_number?: string;
  license_expiry?: string;
  business_name?: string;
  fleet_size?: string;
  department?: string;
  preferences?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ApiUserUpdateRequest {
  name?: string;
  phone?: string;
  city?: string;
  avatar_url?: string;
  license_number?: string;
  license_expiry?: string;
  business_name?: string;
  fleet_size?: string;
  department?: string;
  preferences?: Record<string, any>;
}

// ==================== VEHICLES ====================
export interface ApiVehicleCreate {
  brand: string;
  model: string;
  year: number;
  category: 'Economy' | 'Sedan' | 'SUV' | 'Luxury';
  image: string;
  price_per_day: number;
  weekly_price?: number;
  security_deposit?: number;
  seats?: number;
  doors?: number;
  luggage?: number;
  transmission?: 'Automatic' | 'Manual';
  fuel_type?: 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric';
  location: string;
  features?: string[];
  specs?: Record<string, any>;
  license_plate?: string;
  color?: string;
  mileage?: number;
  is_published?: boolean;
}

export interface ApiVehicleUpdate extends Partial<ApiVehicleCreate> {
  availability?: 'Available' | 'Booked' | 'Active Rental' | 'Maintenance' | 'Archived' | 'Rented' | 'Reserved';
}

export interface ApiVehicleResponse {
  id: string;
  brand: string;
  model: string;
  year: number;
  category: 'Economy' | 'Sedan' | 'SUV' | 'Luxury';
  image: string;
  images?: string[];
  price_per_day: number;
  weekly_price?: number;
  security_deposit?: number;
  rating: number;
  trips_count?: number;
  seats: number;
  doors: number;
  luggage?: number;
  transmission: 'Automatic' | 'Manual';
  fuel_type: 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric';
  location: string;
  availability: 'Available' | 'Booked' | 'Active Rental' | 'Maintenance' | 'Archived' | 'Rented' | 'Reserved';
  features: string[];
  specs?: Record<string, any>;
  host_id?: string;
  license_plate?: string;
  color?: string;
  mileage?: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiFleetStatsResponse {
  total_vehicles: number;
  available_vehicles: number;
  rented_vehicles: number;
  maintenance_vehicles: number;
  total_revenue: number;
  utilization_rate: number;
}

export interface ApiCategoryResponse {
  id: string;
  name: string;
  icon: string;
  count: number;
}

// ==================== BOOKINGS ====================
export interface ApiCustomerDetails {
  fullName: string;
  phone: string;
  email: string;
  licenseNumber?: string;
  notes?: string;
}

export interface ApiBookingCreate {
  vehicle_id: string;
  start_date: string;
  end_date: string;
  pickup_time?: string;
  dropoff_time?: string;
  pickup_location: string;
  dropoff_location: string;
  trip_type?: 'City' | 'Outstation' | 'Chauffeur' | 'Self-Drive';
  protection_plan?: 'Basic' | 'Premium' | 'Full';
  add_ons?: string[];
  customer_details: ApiCustomerDetails;
}

export interface ApiPricingCalculationRequest {
  vehicle_id: string;
  start_date: string;
  end_date: string;
  protection_plan?: 'Basic' | 'Premium' | 'Full';
  add_ons?: string[];
}

export interface ApiPricingCalculationResponse {
  base_daily_rate: number;
  rental_days: number;
  subtotal: number;
  discount_amount: number;
  protection_cost: number;
  add_ons_total: number;
  platform_fee: number;
  tax_amount: number;
  security_deposit: number;
  total_amount: number;
}

export interface ApiBookingResponse {
  id: string;
  booking_code: string;
  vehicle_id: string;
  customer_id: string;
  provider_id?: string;
  start_date: string;
  end_date: string;
  pickup_time?: string;
  dropoff_time?: string;
  pickup_location: string;
  dropoff_location: string;
  trip_type: string;
  protection_plan: string;
  add_ons: string[];
  customer_details: ApiCustomerDetails;
  status: 'Pending' | 'Confirmed' | 'Active' | 'Completed' | 'Cancelled';
  payment_status: 'Unpaid' | 'Paid' | 'Refunded' | 'Partially Refunded';
  subtotal: number;
  discount: number;
  protection_fee: number;
  platform_fee: number;
  taxes: number;
  deposit: number;
  total_price: number;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiInvoiceResponse {
  invoice_id: string;
  invoice_number: string;
  booking_id: string;
  customer_name: string;
  customer_email: string;
  provider_name?: string;
  vehicle_name: string;
  rental_period: string;
  subtotal: number;
  discount: number;
  protection_fee: number;
  platform_fee: number;
  taxes: number;
  deposit: number;
  total_amount: number;
  paid_at?: string;
  payment_method: string;
}

export interface ApiRevenueMetricsResponse {
  today_revenue: number;
  this_week_revenue: number;
  this_month_revenue: number;
  total_revenue: number;
  active_rentals_count: number;
  completed_trips_count: number;
}

// ==================== FLEET OPERATIONS ====================
export interface ApiMaintenanceCreate {
  vehicle_id: string;
  vehicle_name: string;
  vehicle_plate?: string;
  type?: string;
  due_date: string;
  estimated_cost?: number;
  service_center?: string;
  notes?: string;
}

export interface ApiMaintenanceUpdate {
  status?: 'Scheduled' | 'In Progress' | 'Completed' | 'Overdue';
  completed_date?: string;
  actual_cost?: number;
  notes?: string;
  odometer_at_service?: number;
}

export interface ApiMaintenanceResponse {
  id: string;
  vehicle_id: string;
  vehicle_name: string;
  vehicle_plate: string;
  type: string;
  due_date: string;
  completed_date?: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Overdue';
  estimated_cost: number;
  actual_cost?: number;
  service_center: string;
  notes?: string;
  odometer_at_service?: number;
  created_at: string;
  updated_at: string;
}

export interface ApiInspectionCreate {
  vehicle_id: string;
  vehicle_name: string;
  booking_id?: string;
  inspector_name?: string;
  date: string;
  status?: 'Pending' | 'In Progress' | 'Completed' | 'Failed';
  type?: 'Routine' | 'Pre-Trip' | 'Post-Return';
  exterior_condition?: string;
  interior_condition?: string;
  tires_and_brakes?: string;
  fuel_level?: number;
  odometer_reading?: number;
  passed?: boolean;
  notes?: string;
}

export interface ApiInspectionResponse {
  id: string;
  vehicle_id: string;
  vehicle_name: string;
  booking_id?: string;
  inspector_name: string;
  date: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Failed';
  type: string;
  exterior_condition: string;
  interior_condition: string;
  tires_and_brakes: string;
  fuel_level: number;
  odometer_reading: number;
  passed: boolean;
  notes?: string;
  created_at: string;
}

export interface ApiDamageReportCreate {
  vehicle_id: string;
  vehicle_name: string;
  booking_id?: string;
  customer_name?: string;
  damage_status?: string;
  description: string;
  estimated_charge?: number;
  photo_url?: string;
}

export interface ApiDamageReportUpdate {
  review_status?: 'Pending Review' | 'Approved' | 'Disputed' | 'Resolved';
  estimated_charge?: number;
  description?: string;
}

export interface ApiDamageReportResponse {
  id: string;
  vehicle_id: string;
  vehicle_name: string;
  booking_id?: string;
  customer_name: string;
  damage_status: string;
  description: string;
  estimated_charge: number;
  review_status: 'Pending Review' | 'Approved' | 'Disputed' | 'Resolved';
  photo_url?: string;
  resolved_at?: string;
  reported_at: string;
}

export interface ApiFleetTaskCreate {
  title: string;
  description: string;
  vehicle_id?: string;
  vehicle_name?: string;
  priority?: 'High' | 'Medium' | 'Low';
  due_time?: string;
  category?: 'Cleaning' | 'Preparation' | 'Shuttle' | 'Inspection' | 'Maintenance';
}

export interface ApiFleetTaskUpdate {
  status?: 'Pending' | 'Completed';
  priority?: 'High' | 'Medium' | 'Low';
  due_time?: string;
}

export interface ApiFleetTaskResponse {
  id: string;
  title: string;
  description: string;
  vehicle_id?: string;
  vehicle_name?: string;
  priority: 'High' | 'Medium' | 'Low';
  due_time: string;
  status: 'Pending' | 'Completed';
  category: string;
  created_at: string;
}

// ==================== SUBSCRIPTIONS ====================
export interface ApiSubscriptionPlanResponse {
  id: 'starter' | 'professional' | 'business';
  name: string;
  tagline: string;
  monthly_price: number;
  annual_price: number;
  vehicle_limit: number;
  booking_limit: number;
  ai_assistant_access: string;
  smart_pricing_access: string;
  analytics: string;
  team_members: number;
  support: string;
  features: string[];
}

export interface ApiProviderSubscriptionResponse {
  id: string;
  provider_id: string;
  plan_id: 'starter' | 'professional' | 'business';
  plan_name?: string;
  status: 'Active' | 'Past Due' | 'Cancelled' | 'Trial';
  billing_cycle: 'monthly' | 'annual';
  start_date: string;
  renewal_date: string;
  usage: {
    vehiclesUsed: number;
    vehicleLimit: number;
    bookingsUsed: number;
    bookingLimit: number;
    teamSeatsUsed: number;
    teamSeatsLimit: number;
  };
  enabled_features: string[];
  created_at: string;
  updated_at: string;
}

export interface ApiUpgradeSubscriptionRequest {
  target_plan_id: 'starter' | 'professional' | 'business';
  billing_cycle?: 'monthly' | 'annual';
  payment_method?: string;
}

export interface ApiBillingInvoiceRecordResponse {
  id: string;
  invoice_number: string;
  provider_id: string;
  date: string;
  amount: number;
  plan_name: string;
  billing_cycle: string;
  status: string;
  payment_method: string;
  pdf_url?: string;
  created_at: string;
}

// ==================== ADMIN ====================
export interface ApiAdminKPIsResponse {
  totalCustomers: number;
  totalProviders: number;
  totalVehicles: number;
  activeRentals: number;
  totalBookings: number;
  platformRevenue: number;
  pendingVerifications: number;
  openDisputes: number;
}

export interface ApiAdminUserRecordResponse {
  id: string;
  name: string;
  email: string;
  role: 'Customer' | 'Provider' | 'FleetManager' | 'Admin';
  phone?: string;
  city?: string;
  joinedDate: string;
  verificationStatus: 'Pending' | 'Verified' | 'Rejected';
  status: 'Active' | 'Suspended';
  licenseNumber?: string;
  businessName?: string;
  totalBookingsOrVehicles: number;
}

export interface ApiAdminProviderRecordResponse {
  id: string;
  name: string;
  businessName: string;
  email: string;
  phone: string;
  city: string;
  fleetCount: number;
  activeRentals: number;
  monthlyRevenue: number;
  verificationStatus: 'Pending' | 'Verified' | 'Rejected';
  status: 'Active' | 'Suspended';
  joinedDate: string;
  rating: number;
}

export interface ApiVerificationItemResponse {
  id: string;
  targetId: string;
  targetName: string;
  role: 'Customer' | 'Provider';
  documentType: string;
  documentNumber: string;
  submittedAt: string;
  status: 'Pending' | 'Verified' | 'Rejected';
  notes?: string;
  documentUrl?: string;
}

export interface ApiVerificationReviewRequest {
  status: 'Pending' | 'Verified' | 'Rejected';
  notes?: string;
}

export interface ApiAdminPaymentRecordResponse {
  id: string;
  bookingId: string;
  customerName: string;
  providerName: string;
  vehicleName: string;
  rentalAmount: number;
  platformCommission: number;
  providerPayout: number;
  securityDeposit: number;
  refundStatus: 'Held' | 'Refunded' | 'Partially Refunded';
  payoutStatus: 'Pending' | 'Processing' | 'Paid';
  transactionDate: string;
}

export interface ApiDisputeRecordResponse {
  id: string;
  bookingId: string;
  customerName: string;
  providerName: string;
  vehicleName: string;
  disputedAmount: number;
  reason: string;
  status: 'Open' | 'Under Review' | 'Resolved';
  reportedAt: string;
  evidence?: string;
  adminNotes?: string;
}

export interface ApiDisputeUpdateRequest {
  status?: 'Open' | 'Under Review' | 'Resolved';
  admin_notes?: string;
}

export interface ApiSystemConfigSchema {
  commission_rate: number;
  vehicle_categories: Array<{ id: string; name: string; isActive: boolean; basePrice: number }>;
  regions: Array<{ id: string; name: string; stateOrCountry: string; isActive: boolean }>;
  pricing_baseline: {
    minDailyRate: number;
    defaultDeposit: number;
    peakMultiplierBaseline: number;
  };
}

// ==================== AI & SMART PRICING ====================
export interface ApiVehiclePricingMetricsResponse {
  vehicle_id: string;
  vehicle_name: string;
  current_price: number;
  recommended_price: number;
  difference: number;
  percentage_change: number;
  demand_level: 'Low' | 'Moderate' | 'High' | 'Peak';
  utilization_rate: number;
  weekend_factor: number;
  seasonal_factor: number;
  availability_status: string;
  booking_frequency: number;
  explanation: string;
  factors: Array<{ label: string; impact: string; positive: boolean }>;
}

export interface ApiApplyRecommendationRequest {
  vehicle_id: string;
  recommended_price: number;
}

export interface ApiPhotoTemplateItem {
  angle: string;
  title: string;
  instruction: string;
  guide_box_label: string;
  sample_url?: string;
}

export interface ApiDamageAnalysisRequest {
  vehicle_id: string;
  photos: Record<string, string>;
  booking_id?: string;
}

export interface ApiInspectionAnalysisResponse {
  vehicle_id: string;
  total_damages_detected: number;
  overall_severity: 'None' | 'Minor' | 'Moderate' | 'Severe';
  estimated_repair_cost: number;
  confidence_score: number;
  findings: Array<{
    angle: string;
    damage_type: string;
    severity: string;
    location_on_panel: string;
    repair_estimate: number;
    confidence: number;
  }>;
  ai_summary: string;
}

export interface ApiAIRecommendationRequest {
  seats?: number;
  category?: string;
  max_price?: number;
  fuel_type?: string;
  city?: string;
}

// ==================== NOTIFICATIONS ====================
export interface ApiNotificationResponse {
  id: string;
  user_id?: string;
  role?: string;
  title: string;
  body: string;
  type: 'booking' | 'maintenance' | 'system' | 'dispute' | 'payment';
  reference_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface ApiNotificationCreate {
  title: string;
  body: string;
  type?: 'booking' | 'maintenance' | 'system' | 'dispute' | 'payment';
  user_id?: string;
  role?: string;
  reference_id?: string;
}
