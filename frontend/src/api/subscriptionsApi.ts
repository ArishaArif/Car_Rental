/**
 * Subscriptions & Provider SaaS Tiers REST API Client
 * Connects frontend to /subscriptions endpoints.
 */

import { apiClient, ApiResponse } from '../services/apiClient';
import {
  ApiBillingInvoiceRecordResponse,
  ApiProviderSubscriptionResponse,
  ApiSubscriptionPlanResponse,
  ApiUpgradeSubscriptionRequest,
} from './types';

export const subscriptionsApi = {
  /**
   * Get all SaaS subscription tiers (Starter, Professional, Business)
   */
  async getPlans(): Promise<ApiResponse<ApiSubscriptionPlanResponse[]>> {
    return apiClient.get<ApiSubscriptionPlanResponse[]>('/subscriptions/plans');
  },

  /**
   * Get authenticated provider's active subscription & usage quotas
   */
  async getCurrentSubscription(): Promise<ApiResponse<ApiProviderSubscriptionResponse>> {
    return apiClient.get<ApiProviderSubscriptionResponse>('/subscriptions/current');
  },

  /**
   * Upgrade or modify subscription plan & billing cycle
   */
  async upgradeSubscription(
    payload: ApiUpgradeSubscriptionRequest
  ): Promise<ApiResponse<ApiProviderSubscriptionResponse>> {
    if (!payload.target_plan_id) {
      throw new Error('Please select a target subscription plan');
    }
    return apiClient.post<ApiProviderSubscriptionResponse>('/subscriptions/upgrade', payload);
  },

  /**
   * Get subscription billing invoice receipts
   */
  async getInvoices(): Promise<ApiResponse<ApiBillingInvoiceRecordResponse[]>> {
    return apiClient.get<ApiBillingInvoiceRecordResponse[]>('/subscriptions/invoices');
  },
};
