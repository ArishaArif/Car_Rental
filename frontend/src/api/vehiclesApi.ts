/**
 * Vehicles & Fleet Catalog REST API Client
 * Connects frontend to /vehicles endpoints.
 */

import { apiClient, ApiResponse } from '../services/apiClient';
import {
  ApiCategoryResponse,
  ApiFleetStatsResponse,
  ApiVehicleCreate,
  ApiVehicleResponse,
  ApiVehicleUpdate,
} from './types';

export interface VehicleFilterParams {
  category?: string;
  status?: string;
  min_price?: number;
  max_price?: number;
  transmission?: string;
  fuel_type?: string;
  include_archived?: boolean;
}

export const vehiclesApi = {
  /**
   * Fetch all vehicles with optional filters
   */
  async getVehicles(params?: VehicleFilterParams): Promise<ApiResponse<ApiVehicleResponse[]>> {
    return apiClient.get<ApiVehicleResponse[]>('/vehicles', params);
  },

  /**
   * Fetch a single vehicle by ID
   */
  async getVehicleById(id: string): Promise<ApiResponse<ApiVehicleResponse>> {
    if (!id) {
      throw new Error('Vehicle ID is required');
    }
    return apiClient.get<ApiVehicleResponse>(`/vehicles/${id}`);
  },

  /**
   * Create a new vehicle listing (Host / Provider)
   */
  async createVehicle(payload: ApiVehicleCreate): Promise<ApiResponse<ApiVehicleResponse>> {
    if (!payload.brand || !payload.model) {
      throw new Error('Vehicle brand and model are required');
    }
    if (!payload.price_per_day || payload.price_per_day <= 0) {
      throw new Error('Please enter a valid positive daily rate');
    }
    const backendPayload = {
      ...payload,
      fuel: payload.fuel || payload.fuel_type || 'Petrol',
    };
    return apiClient.post<ApiVehicleResponse>('/vehicles', backendPayload);
  },

  /**
   * Update an existing vehicle listing
   */
  async updateVehicle(id: string, payload: ApiVehicleUpdate): Promise<ApiResponse<ApiVehicleResponse>> {
    if (!id) {
      throw new Error('Vehicle ID is required');
    }
    return apiClient.patch<ApiVehicleResponse>(`/vehicles/${id}`, payload);
  },

  /**
   * Delete a vehicle from fleet
   */
  async deleteVehicle(id: string): Promise<ApiResponse<{ message: string }>> {
    if (!id) {
      throw new Error('Vehicle ID is required');
    }
    return apiClient.delete<{ message: string }>(`/vehicles/${id}`);
  },

  /**
   * Publish a vehicle to the public marketplace
   */
  async publishVehicle(id: string): Promise<ApiResponse<ApiVehicleResponse>> {
    if (!id) {
      throw new Error('Vehicle ID is required');
    }
    return apiClient.post<ApiVehicleResponse>(`/vehicles/${id}/publish`);
  },

  /**
   * Unpublish a vehicle from the public marketplace
   */
  async unpublishVehicle(id: string): Promise<ApiResponse<ApiVehicleResponse>> {
    if (!id) {
      throw new Error('Vehicle ID is required');
    }
    return apiClient.post<ApiVehicleResponse>(`/vehicles/${id}/unpublish`);
  },

  /**
   * Get vehicle categories with counts
   */
  async getCategories(): Promise<ApiResponse<ApiCategoryResponse[]>> {
    return apiClient.get<ApiCategoryResponse[]>('/vehicles/categories');
  },

  /**
   * Get platform fleet utilization & status metrics
   */
  async getFleetStats(): Promise<ApiResponse<ApiFleetStatsResponse>> {
    return apiClient.get<ApiFleetStatsResponse>('/vehicles/stats');
  },
};
