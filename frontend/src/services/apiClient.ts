export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
  success: boolean;
}

export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

class ApiClient {
  private baseURL: string;
  private authToken: string | null = null;

  constructor(config: ApiClientConfig = { baseURL: 'http://localhost:5000/api' }) {
    this.baseURL = config.baseURL;
  }

  public setAuthToken(token: string | null) {
    this.authToken = token;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  public async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();
      return {
        data,
        status: response.status,
        success: response.ok,
      };
    } catch (error: any) {
      throw new Error(error?.message || 'Network request failed');
    }
  }

  public async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });

      const data = await response.json();
      return {
        data,
        status: response.status,
        success: response.ok,
      };
    } catch (error: any) {
      throw new Error(error?.message || 'Network request failed');
    }
  }
}

export const apiClient = new ApiClient();
