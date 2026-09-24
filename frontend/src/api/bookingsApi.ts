/**
 * Bookings & Rental Lifecycle REST API Client
 * Connects frontend to /bookings endpoints.
 */

import { apiClient, ApiResponse } from '../services/apiClient';
import {
  ApiBookingCreate,
  ApiBookingResponse,
  ApiInvoiceResponse,
  ApiPricingCalculationRequest,
  ApiPricingCalculationResponse,
  ApiRevenueMetricsResponse,
} from './types';

export interface BookingFilterParams {
  status?: string;
  role?: string;
  vehicle_id?: string;
}

export const bookingsApi = {
  /**
   * Fetch all bookings for the authenticated user
   */
  async getBookings(params?: BookingFilterParams): Promise<ApiResponse<ApiBookingResponse[]>> {
    return apiClient.get<ApiBookingResponse[]>('/bookings', params);
  },

  /**
   * Fetch a single booking by ID
   */
  async getBookingById(id: string): Promise<ApiResponse<ApiBookingResponse>> {
    if (!id) {
      throw new Error('Booking ID is required');
    }
    return apiClient.get<ApiBookingResponse>(`/bookings/${id}`);
  },

  /**
   * Calculate live pricing breakdown for dates, protection tier, and add-ons
   */
  async calculatePricing(
    payload: ApiPricingCalculationRequest
  ): Promise<ApiResponse<ApiPricingCalculationResponse>> {
    if (!payload.vehicle_id) {
      throw new Error('Vehicle ID is required for pricing calculation');
    }
    if (!payload.rental_days || payload.rental_days < 1) {
      throw new Error('Rental days must be at least 1');
    }
    return apiClient.post<ApiPricingCalculationResponse>('/bookings/calculate-pricing', payload);
  },

  /**
   * Create a new vehicle reservation
   */
  async createBooking(payload: ApiBookingCreate): Promise<ApiResponse<ApiBookingResponse>> {
    if (!payload.vehicle_id) {
      throw new Error('Please select a vehicle to rent');
    }
    if (!payload.pickup_date || !payload.return_date) {
      throw new Error('Please provide rental dates');
    }
    if (!payload.customer_details?.fullName || !payload.customer_details?.phone) {
      throw new Error('Customer full name and contact number are required');
    }
    return apiClient.post<ApiBookingResponse>('/bookings', payload);
  },

  /**
   * Confirm an upcoming reservation (Provider / Host)
   */
  async confirmBooking(id: string): Promise<ApiResponse<ApiBookingResponse>> {
    if (!id) {
      throw new Error('Booking ID is required');
    }
    return apiClient.post<ApiBookingResponse>(`/bookings/${id}/confirm`);
  },

  /**
   * Cancel a reservation
   */
  async cancelBooking(id: string, reason?: string): Promise<ApiResponse<ApiBookingResponse>> {
    if (!id) {
      throw new Error('Booking ID is required');
    }
    return apiClient.post<ApiBookingResponse>(`/bookings/${id}/cancel`, {
      reason: reason || 'Customer requested cancellation',
    });
  },

  /**
   * Complete key handover & start trip (Pickup)
   */
  async pickupBooking(
    id: string,
    details: { pickup_code: string; pickup_mileage?: number }
  ): Promise<ApiResponse<ApiBookingResponse>> {
    if (!id) {
      throw new Error('Booking ID is required');
    }
    if (!details.pickup_code) {
      throw new Error('Pickup code is required');
    }
    return apiClient.post<ApiBookingResponse>(`/bookings/${id}/pickup`, details);
  },

  /**
   * Complete return check-in & finalize rental
   */
  async returnBooking(
    id: string,
    details: {
      dropoff_mileage?: number;
      dropoff_fuel?: number;
      late_hours?: number;
      damage_charges?: number;
      notes?: string;
    }
  ): Promise<ApiResponse<ApiBookingResponse>> {
    if (!id) {
      throw new Error('Booking ID is required');
    }
    return apiClient.post<ApiBookingResponse>(`/bookings/${id}/return`, details);
  },

  /**
   * Get official tax invoice & receipt for completed booking
   */
  async getInvoice(id: string): Promise<ApiResponse<ApiInvoiceResponse>> {
    if (!id) {
      throw new Error('Booking ID is required');
    }
    return apiClient.get<ApiInvoiceResponse>(`/bookings/${id}/invoice`);
  },

  /**
   * Get provider revenue analytics and reservation counts
   */
  async getRevenueMetrics(): Promise<ApiResponse<ApiRevenueMetricsResponse>> {
    return apiClient.get<ApiRevenueMetricsResponse>('/bookings/revenue/metrics');
  },
};
