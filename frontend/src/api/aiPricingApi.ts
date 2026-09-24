/**
 * AI & Smart Pricing REST API Client
 * Connects frontend to /pricing and /ai endpoints.
 */

import { apiClient, ApiResponse } from '../services/apiClient';
import {
  ApiAIRecommendationRequest,
  ApiApplyRecommendationRequest,
  ApiDamageAnalysisRequest,
  ApiInspectionAnalysisResponse,
  ApiPhotoTemplateItem,
  ApiVehiclePricingMetricsResponse,
  ApiVehicleResponse,
} from './types';

export const aiPricingApi = {
  // ── Smart Dynamic Pricing ───────────────────────────────────────────────────
  /**
   * Calculate real-time dynamic pricing signals across the entire fleet
   */
  async getFleetPricingMetrics(
    providerId?: string
  ): Promise<ApiResponse<ApiVehiclePricingMetricsResponse[]>> {
    return apiClient.get<ApiVehiclePricingMetricsResponse[]>('/pricing/metrics', {
      provider_id: providerId,
    });
  },

  /**
   * Get dynamic demand surge and rate recommendation for a specific vehicle
   */
  async getVehiclePricingMetrics(
    vehicleId: string
  ): Promise<ApiResponse<ApiVehiclePricingMetricsResponse>> {
    if (!vehicleId) {
      throw new Error('Vehicle ID is required');
    }
    return apiClient.get<ApiVehiclePricingMetricsResponse>(`/pricing/metrics/${vehicleId}`);
  },

  /**
   * Accept and apply recommended daily price
   */
  async applyRecommendation(
    payload: ApiApplyRecommendationRequest
  ): Promise<ApiResponse<ApiVehicleResponse>> {
    if (!payload.vehicle_id || !payload.recommended_price) {
      throw new Error('Vehicle ID and recommended price are required');
    }
    return apiClient.post<ApiVehicleResponse>('/pricing/apply-recommendation', payload);
  },

  // ── Computer Vision Inspection & Recommendations ───────────────────────────
  /**
   * Get guided 6-point vehicle camera capture guidelines and templates
   */
  async getPhotoTemplates(): Promise<ApiResponse<Record<string, ApiPhotoTemplateItem>>> {
    return apiClient.get<Record<string, ApiPhotoTemplateItem>>('/ai/photo-templates');
  },

  /**
   * Analyze multi-angle photographs for scratches, dents, and estimate repair cost
   */
  async analyzeDamagePhotos(
    payload: ApiDamageAnalysisRequest
  ): Promise<ApiResponse<ApiInspectionAnalysisResponse>> {
    if (!payload.vehicle_id) {
      throw new Error('Vehicle ID is required for AI inspection');
    }
    if (!payload.photos || Object.keys(payload.photos).length === 0) {
      throw new Error('At least one photo angle is required for AI analysis');
    }
    // Extended timeout for deep computer vision inference
    return apiClient.post<ApiInspectionAnalysisResponse>('/ai/damage-analysis', payload, {
      timeout: 30000,
    });
  },

  /**
   * AI vehicle match recommendation based on renter criteria
   */
  async recommendVehicles(
    payload: ApiAIRecommendationRequest
  ): Promise<ApiResponse<ApiVehicleResponse[]>> {
    return apiClient.post<ApiVehicleResponse[]>('/ai/recommend', payload);
  },
};
