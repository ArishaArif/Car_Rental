/**
 * Notifications REST API Client
 * Connects frontend to /notifications endpoints.
 */

import { apiClient, ApiResponse } from '../services/apiClient';
import { ApiNotificationCreate, ApiNotificationResponse } from './types';

export const notificationsApi = {
  /**
   * Get user notifications
   */
  async getNotifications(): Promise<ApiResponse<ApiNotificationResponse[]>> {
    return apiClient.get<ApiNotificationResponse[]>('/notifications');
  },

  /**
   * Mark a specific notification as read
   */
  async markAsRead(notificationId: string): Promise<ApiResponse<ApiNotificationResponse>> {
    if (!notificationId) {
      throw new Error('Notification ID is required');
    }
    return apiClient.patch<ApiNotificationResponse>(`/notifications/${notificationId}/read`);
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>('/notifications/mark-all-read');
  },

  /**
   * Dispatch a notification
   */
  async createNotification(
    payload: ApiNotificationCreate
  ): Promise<ApiResponse<ApiNotificationResponse>> {
    if (!payload.title || !payload.body) {
      throw new Error('Title and body are required');
    }
    return apiClient.post<ApiNotificationResponse>('/notifications', payload);
  },
};
