/**
 * Admin Oversight & Governance REST API Client
 * Connects frontend to /admin endpoints (KPIs, Users, Providers, Verifications, Disputes, Config).
 */

import { apiClient, ApiResponse } from '../services/apiClient';
import {
  ApiAdminKPIsResponse,
  ApiAdminPaymentRecordResponse,
  ApiAdminProviderRecordResponse,
  ApiAdminUserRecordResponse,
  ApiDisputeRecordResponse,
  ApiDisputeUpdateRequest,
  ApiSystemConfigSchema,
  ApiVerificationItemResponse,
  ApiVerificationReviewRequest,
} from './types';

export const adminApi = {
  /**
   * Get platform-wide KPIs
   */
  async getKPIs(): Promise<ApiResponse<ApiAdminKPIsResponse>> {
    return apiClient.get<ApiAdminKPIsResponse>('/admin/kpis');
  },

  /**
   * Get full directory of users
   */
  async getUsers(): Promise<ApiResponse<ApiAdminUserRecordResponse[]>> {
    return apiClient.get<ApiAdminUserRecordResponse[]>('/admin/users');
  },

  /**
   * Suspend or activate a user account
   */
  async updateUserStatus(userId: string, isActive: boolean): Promise<ApiResponse<any>> {
    if (!userId) {
      throw new Error('User ID is required');
    }
    return apiClient.patch<any>(`/admin/users/${userId}/status`, undefined, {
      params: { is_active: isActive },
    });
  },

  /**
   * Get list of verified/registered fleet providers
   */
  async getProviders(): Promise<ApiResponse<ApiAdminProviderRecordResponse[]>> {
    return apiClient.get<ApiAdminProviderRecordResponse[]>('/admin/providers');
  },

  /**
   * Get verification document queue
   */
  async getVerifications(status?: string): Promise<ApiResponse<ApiVerificationItemResponse[]>> {
    return apiClient.get<ApiVerificationItemResponse[]>('/admin/verifications', { status });
  },

  /**
   * Review (Approve, Reject) a verification request
   */
  async reviewVerification(
    itemId: string,
    payload: ApiVerificationReviewRequest
  ): Promise<ApiResponse<ApiVerificationItemResponse>> {
    if (!itemId) {
      throw new Error('Verification item ID is required');
    }
    return apiClient.post<ApiVerificationItemResponse>(
      `/admin/verifications/${itemId}/review`,
      payload
    );
  },

  /**
   * Get platform payment audits & provider payout ledgers
   */
  async getPayments(): Promise<ApiResponse<ApiAdminPaymentRecordResponse[]>> {
    return apiClient.get<ApiAdminPaymentRecordResponse[]>('/admin/payments');
  },

  /**
   * Get rental disputes
   */
  async getDisputes(status?: string): Promise<ApiResponse<ApiDisputeRecordResponse[]>> {
    return apiClient.get<ApiDisputeRecordResponse[]>('/admin/disputes', { status });
  },

  /**
   * Update dispute status & investigation notes
   */
  async updateDispute(
    disputeId: string,
    payload: ApiDisputeUpdateRequest
  ): Promise<ApiResponse<ApiDisputeRecordResponse>> {
    if (!disputeId) {
      throw new Error('Dispute ID is required');
    }
    return apiClient.patch<ApiDisputeRecordResponse>(`/admin/disputes/${disputeId}`, payload);
  },

  /**
   * Get platform system configuration (rates, categories, regions)
   */
  async getConfig(): Promise<ApiResponse<ApiSystemConfigSchema>> {
    return apiClient.get<ApiSystemConfigSchema>('/admin/config');
  },

  /**
   * Update platform system configuration
   */
  async updateConfig(
    payload: Partial<ApiSystemConfigSchema>
  ): Promise<ApiResponse<ApiSystemConfigSchema>> {
    return apiClient.patch<ApiSystemConfigSchema>('/admin/config', payload);
  },
};
