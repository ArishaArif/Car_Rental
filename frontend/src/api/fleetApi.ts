/**
 * Fleet Operations REST API Client
 * Connects frontend to /fleet endpoints (Maintenance, Inspections, Damages, Tasks).
 */

import { apiClient, ApiResponse } from '../services/apiClient';
import {
  ApiDamageReportCreate,
  ApiDamageReportResponse,
  ApiDamageReportUpdate,
  ApiFleetTaskCreate,
  ApiFleetTaskResponse,
  ApiFleetTaskUpdate,
  ApiInspectionCreate,
  ApiInspectionResponse,
  ApiMaintenanceCreate,
  ApiMaintenanceResponse,
  ApiMaintenanceUpdate,
} from './types';

export const fleetApi = {
  // ── Maintenance ─────────────────────────────────────────────────────────────
  async getMaintenanceList(params?: {
    status?: string;
    vehicle_id?: string;
  }): Promise<ApiResponse<ApiMaintenanceResponse[]>> {
    return apiClient.get<ApiMaintenanceResponse[]>('/fleet/maintenance', params);
  },

  async scheduleMaintenance(
    payload: ApiMaintenanceCreate
  ): Promise<ApiResponse<ApiMaintenanceResponse>> {
    if (!payload.vehicle_id || !payload.vehicle_name) {
      throw new Error('Vehicle ID and name are required to schedule service');
    }
    if (!payload.due_date) {
      throw new Error('Please select a service due date');
    }
    return apiClient.post<ApiMaintenanceResponse>('/fleet/maintenance', payload);
  },

  async updateMaintenance(
    id: string,
    payload: ApiMaintenanceUpdate
  ): Promise<ApiResponse<ApiMaintenanceResponse>> {
    if (!id) {
      throw new Error('Maintenance record ID is required');
    }
    return apiClient.patch<ApiMaintenanceResponse>(`/fleet/maintenance/${id}`, payload);
  },

  // ── Inspections ─────────────────────────────────────────────────────────────
  async getInspections(params?: {
    status?: string;
    vehicle_id?: string;
  }): Promise<ApiResponse<ApiInspectionResponse[]>> {
    return apiClient.get<ApiInspectionResponse[]>('/fleet/inspections', params);
  },

  async recordInspection(
    payload: ApiInspectionCreate
  ): Promise<ApiResponse<ApiInspectionResponse>> {
    if (!payload.vehicle_id || !payload.vehicle_name) {
      throw new Error('Vehicle ID and name are required for inspection');
    }
    return apiClient.post<ApiInspectionResponse>('/fleet/inspections', payload);
  },

  // ── Damage Reports ──────────────────────────────────────────────────────────
  async getDamageReports(params?: {
    status?: string;
    vehicle_id?: string;
  }): Promise<ApiResponse<ApiDamageReportResponse[]>> {
    return apiClient.get<ApiDamageReportResponse[]>('/fleet/damages', params);
  },

  async createDamageReport(
    payload: ApiDamageReportCreate
  ): Promise<ApiResponse<ApiDamageReportResponse>> {
    if (!payload.vehicle_id || !payload.description) {
      throw new Error('Vehicle ID and incident description are required');
    }
    return apiClient.post<ApiDamageReportResponse>('/fleet/damages', payload);
  },

  async updateDamageReport(
    id: string,
    payload: ApiDamageReportUpdate
  ): Promise<ApiResponse<ApiDamageReportResponse>> {
    if (!id) {
      throw new Error('Damage report ID is required');
    }
    return apiClient.patch<ApiDamageReportResponse>(`/fleet/damages/${id}`, payload);
  },

  // ── Operations Tasks ────────────────────────────────────────────────────────
  async getTasks(params?: {
    status?: string;
    priority?: string;
  }): Promise<ApiResponse<ApiFleetTaskResponse[]>> {
    return apiClient.get<ApiFleetTaskResponse[]>('/fleet/tasks', params);
  },

  async createTask(
    payload: ApiFleetTaskCreate
  ): Promise<ApiResponse<ApiFleetTaskResponse>> {
    if (!payload.title || !payload.description) {
      throw new Error('Task title and description are required');
    }
    return apiClient.post<ApiFleetTaskResponse>('/fleet/tasks', payload);
  },

  async updateTask(
    id: string,
    payload: ApiFleetTaskUpdate
  ): Promise<ApiResponse<ApiFleetTaskResponse>> {
    if (!id) {
      throw new Error('Task ID is required');
    }
    return apiClient.patch<ApiFleetTaskResponse>(`/fleet/tasks/${id}`, payload);
  },
};
