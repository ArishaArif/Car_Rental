/**
 * Universal REST API Client for Velox Mobile Application
 * High-performance, fault-tolerant HTTP client communicating with FastAPI Backend.
 */

import { API_CONFIG } from '../config/apiConfig';

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
  success: boolean;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
  timeoutMs?: number;
  signal?: AbortSignal;
}

export class ApiError extends Error {
  public status: number;
  public data: any;
  public isNetworkError: boolean;
  public isTimeout: boolean;

  constructor(message: string, status = 500, data: any = null, isNetworkError = false, isTimeout = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.isNetworkError = isNetworkError;
    this.isTimeout = isTimeout;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

class ApiClient {
  private baseURL: string;
  private authToken: string | null = null;
  private refreshToken: string | null = null;
  private defaultTimeout: number;

  constructor() {
    this.baseURL = API_CONFIG.baseURL;
    this.defaultTimeout = API_CONFIG.timeoutMs ?? (API_CONFIG as any).timeout ?? 15000;
  }

  public setAuthToken(token: string | null) {
    this.authToken = token;
  }

  public getAuthToken(): string | null {
    return this.authToken;
  }

  public setRefreshToken(token: string | null) {
    this.refreshToken = token;
  }

  public getRefreshToken(): string | null {
    return this.refreshToken;
  }

  public setBaseURL(url: string) {
    this.baseURL = url.replace(/\/+$/, '');
  }

  public getBaseURL(): string {
    return this.baseURL;
  }

  private buildHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...customHeaders,
    };

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    let url = `${this.baseURL}${cleanEndpoint}`;

    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }

    return url;
  }

  private async parseResponseData(response: Response): Promise<any> {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        return await response.json();
      } catch {
        return null;
      }
    }
    try {
      return await response.text();
    } catch {
      return null;
    }
  }

  private async execute<T>(
    method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
    endpoint: string,
    body?: any,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint, options.params);
    const headers = this.buildHeaders(options.headers);
    const timeoutMs = options.timeoutMs ?? options.timeout ?? this.defaultTimeout;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: options.signal || controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await this.parseResponseData(response);

      if (!response.ok) {
        let errorMessage = `Server error (${response.status})`;

        if (data && typeof data === 'object') {
          if (typeof data.detail === 'string') {
            errorMessage = data.detail;
          } else if (Array.isArray(data.detail)) {
            errorMessage = data.detail
              .map((err: any) => err.msg || `${err.loc?.join('.')}: ${err.type}`)
              .join('; ');
          } else if (data.message) {
            errorMessage = data.message;
          }
        } else if (typeof data === 'string' && data.length > 0) {
          errorMessage = data;
        }

        throw new ApiError(errorMessage, response.status, data, false, false);
      }

      return {
        data: data as T,
        status: response.status,
        success: true,
        message: typeof data === 'object' && data?.message ? data.message : undefined,
      };
    } catch (err: any) {
      clearTimeout(timeoutId);

      if (err instanceof ApiError) {
        throw err;
      }

      const isTimeout = err?.name === 'AbortError';
      const message = isTimeout
        ? `Request timed out after ${timeoutMs / 1000}s. Please check network connection.`
        : err?.message || 'Network error encountered';

      throw new ApiError(message, isTimeout ? 408 : 0, null, !isTimeout, isTimeout);
    }
  }

  public async get<T>(endpoint: string, params?: Record<string, any>, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.execute<T>('GET', endpoint, undefined, { ...options, params });
  }

  public async post<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.execute<T>('POST', endpoint, body, options);
  }

  public async patch<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.execute<T>('PATCH', endpoint, body, options);
  }

  public async put<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.execute<T>('PUT', endpoint, body, options);
  }

  public async delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.execute<T>('DELETE', endpoint, undefined, options);
  }
}

export const apiClient = new ApiClient();
