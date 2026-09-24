/**
 * Auth & User Profile REST API Client
 * Connects frontend to /auth and /users FastAPI endpoints with robust validation.
 */

import { apiClient, ApiResponse } from '../services/apiClient';
import {
  ApiRegisterRequest,
  ApiResendOtpRequest,
  ApiResetPasswordRequest,
  ApiTokenResponse,
  ApiUserResponse,
  ApiUserUpdateRequest,
  ApiVerifyOtpRequest,
} from './types';

export const authApi = {
  /**
   * Register a new user account (Customer, Provider, FleetManager, Admin)
   */
  async register(payload: {
    name: string;
    email: string;
    password?: string;
    role?: 'Customer' | 'Provider' | 'FleetManager' | 'Admin';
    phone?: string;
    city?: string;
    license_number?: string;
    business_name?: string;
    fleet_size?: string;
    department?: string;
  }): Promise<ApiResponse<{ message: string; email: string }>> {
    const cleanEmail = (payload.email || '').trim().toLowerCase();
    const cleanName = (payload.name || '').trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }
    if (!cleanName || cleanName.length < 2) {
      throw new Error('Please enter your full name (minimum 2 characters).');
    }

    const backendPayload: ApiRegisterRequest = {
      full_name: cleanName,
      email: cleanEmail,
      password: payload.password,
      role: payload.role || 'Customer',
      phone_number: payload.phone?.trim() || undefined,
      city: payload.city,
      license_number: payload.license_number,
      business_name: payload.business_name,
      fleet_size: payload.fleet_size,
      department: payload.department,
    };

    return apiClient.post<{ message: string; email: string }>('/auth/register', backendPayload);
  },

  /**
   * Login with email and password
   */
  async login(payload: { email: string; password?: string; role?: string }): Promise<ApiResponse<ApiTokenResponse>> {
    const cleanEmail = (payload.email || '').trim().toLowerCase();
    const cleanPass = payload.password || '';

    if (!cleanEmail) {
      throw new Error('Email is required.');
    }
    if (!cleanPass) {
      throw new Error('Password is required.');
    }

    return apiClient.post<ApiTokenResponse>('/auth/login', {
      email: cleanEmail,
      password: cleanPass,
    });
  },

  /**
   * Verify registration or login 6-digit OTP
   */
  async verifyOtp(payload: {
    email: string;
    otp: string;
    purpose?: string;
  }): Promise<ApiResponse<{ message: string }>> {
    const cleanEmail = (payload.email || '').trim().toLowerCase();
    const cleanOtp = (payload.otp || '').trim();

    if (!cleanOtp || cleanOtp.length !== 6) {
      throw new Error('Please enter the complete 6-digit verification code.');
    }

    const backendPayload: ApiVerifyOtpRequest = {
      email: cleanEmail,
      otp_code: cleanOtp,
      purpose: payload.purpose || 'email_verification',
    };

    return apiClient.post<{ message: string }>('/auth/verify-otp', backendPayload);
  },

  /**
   * Resend a fresh 6-digit OTP code to email
   */
  async resendOtp(payload: { email: string; purpose?: string }): Promise<ApiResponse<{ message: string }>> {
    const cleanEmail = (payload.email || '').trim().toLowerCase();
    const backendPayload: ApiResendOtpRequest = {
      email: cleanEmail,
      purpose: payload.purpose || 'email_verification',
    };
    return apiClient.post<{ message: string }>('/auth/resend-otp', backendPayload);
  },

  /**
   * Request password reset OTP email
   */
  async forgotPassword(payload: { email: string }): Promise<ApiResponse<{ message: string; email: string }>> {
    const cleanEmail = (payload.email || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Please enter your registered email address.');
    }
    return apiClient.post<{ message: string; email: string }>('/auth/forgot-password', {
      email: cleanEmail,
    });
  },

  /**
   * Verify password reset OTP and set new password
   */
  async resetPassword(payload: {
    email: string;
    otp: string;
    newPassword: string;
  }): Promise<ApiResponse<{ message: string }>> {
    const cleanEmail = (payload.email || '').trim().toLowerCase();
    const cleanOtp = (payload.otp || '').trim();

    if (!cleanOtp || cleanOtp.length !== 6) {
      throw new Error('Please enter the complete 6-digit OTP code.');
    }
    if (!payload.newPassword || payload.newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters with upper, lower, number & symbol.');
    }

    const backendPayload: ApiResetPasswordRequest = {
      email: cleanEmail,
      otp_code: cleanOtp,
      new_password: payload.newPassword,
    };

    return apiClient.post<{ message: string }>('/auth/reset-password', backendPayload);
  },

  /**
   * Retrieve the currently authenticated user profile
   */
  async getMe(): Promise<ApiResponse<ApiUserResponse>> {
    return apiClient.get<ApiUserResponse>('/users/me');
  },

  /**
   * Update authenticated user profile fields
   */
  async updateProfile(payload: ApiUserUpdateRequest): Promise<ApiResponse<ApiUserResponse>> {
    return apiClient.patch<ApiUserResponse>('/users/me', payload);
  },

  /**
   * Invalidate session & refresh token on server
   */
  async logout(refreshToken?: string | null): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>('/auth/logout', {
      refresh_token: refreshToken || undefined,
    });
  },
};
