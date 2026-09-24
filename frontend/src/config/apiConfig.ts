/**
 * Central API Configuration for Velox Car Rental & Fleet Management
 */

// Choose active environment: 'production' | 'local' | 'android_emulator'
export type ApiEnvironment = 'production' | 'local' | 'android_emulator';

export const ACTIVE_ENV: ApiEnvironment = 'production';

export const API_URLS: Record<ApiEnvironment, string> = {
  production: 'https://car-rental-system-backend-m5fh.onrender.com/api/v1',
  local: 'http://localhost:8000/api/v1',
  android_emulator: 'http://10.0.2.2:8000/api/v1',
};

export const API_CONFIG = {
  baseURL: API_URLS[ACTIVE_ENV],
  timeoutMs: 15000,
  apiVersion: '1.0.0',
};
