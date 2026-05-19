import axios, { AxiosRequestConfig, AxiosError, CancelTokenSource } from 'axios';
import { axiosInstance } from './axiosInstance';
import { loadingStateManager } from './loadingState';
import { ApiError, RequestOptions } from './types';

export const extractErrorMessage = (error: AxiosError): string => {
  if (error.response?.data && typeof error.response.data === 'object') {
    const data = error.response.data as Record<string, unknown>;
    if (data.detail) return String(data.detail);
    if (data.message) return String(data.message);
  }

  if (error.message.includes('timeout')) return '请求超时，请稍后重试';
  if (error.message.includes('Network Error')) return '网络连接失败，请检查后端服务是否已启动 (localhost:8010)';
  return `请求失败 (${error.response?.status || '未知'})`;
};

export interface RequestConfig extends AxiosRequestConfig {
  showLoading?: boolean;
  retry?: number;
  retryDelay?: number;
}

export class HttpClient {
  private pendingRequests: Map<string, CancelTokenSource> = new Map();
  private defaultRetryCount: number = 3;
  private defaultRetryDelay: number = 1000;

  private generateRequestKey(config: RequestConfig): string {
    return `${config.method?.toUpperCase() || 'GET'}:${config.url || ''}:${JSON.stringify(config.params || {})}`;
  }

  public async request<T = unknown>(config: RequestConfig): Promise<T> {
    const requestKey = this.generateRequestKey(config);
    const cancelTokenSource = axios.CancelToken.source();
    this.pendingRequests.set(requestKey, cancelTokenSource);

    const finalConfig: RequestConfig = {
      ...config,
      cancelToken: cancelTokenSource.token,
    };

    if (config.showLoading !== false) {
      loadingStateManager.increment();
    }

    try {
      const retryCount = config.retry ?? this.defaultRetryCount;
      const retryDelay = config.retryDelay ?? this.defaultRetryDelay;
      let lastError: ApiError | null = null;

      for (let attempt = 0; attempt <= retryCount; attempt++) {
        try {
          if (attempt > 0) {
            await this.delay(retryDelay * attempt);
          }
          const response = await axiosInstance.request<T>(finalConfig);
          return response.data;
        } catch (error) {
          if (this.isCancelError(error)) {
            throw { code: -1, message: '请求已取消' } as ApiError;
          }
          lastError = this.normalizeError(error);
          if (!this.isRetryableError(lastError) || attempt === retryCount) {
            throw lastError;
          }
        }
      }
      throw lastError;
    } catch (error) {
      throw error;
    } finally {
      this.pendingRequests.delete(requestKey);
      if (config.showLoading !== false) {
        loadingStateManager.decrement();
      }
    }
  }

  public cancelRequest(requestKey: string): void {
    const cancelTokenSource = this.pendingRequests.get(requestKey);
    if (cancelTokenSource) {
      cancelTokenSource.cancel('请求已被手动取消');
      this.pendingRequests.delete(requestKey);
    }
  }

  public cancelAllRequests(): void {
    this.pendingRequests.forEach((source) => {
      source.cancel('所有请求已被取消');
    });
    this.pendingRequests.clear();
    loadingStateManager.reset();
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private isCancelError(error: unknown): boolean {
    return axios.isCancel(error);
  }

  private isRetryableError(error: ApiError): boolean {
    if (!error.code) return false;
    return [408, 429, 500, 502, 503, 504].includes(error.code);
  }

  private normalizeError(error: unknown): ApiError {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      return {
        code: axiosError.response?.status || -1,
        message: extractErrorMessage(axiosError),
        url: axiosError.config?.url,
      };
    }
    return {
      code: -1,
      message: error instanceof Error ? error.message : '未知错误',
    };
  }

  public get<T = unknown>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  public post<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  public put<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  public delete<T = unknown>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  public patch<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }
}

export const httpClient = new HttpClient();

// [DEMO MODE] 固定 Token，无需登录
export const DEMO_TOKEN = 'demo_admin_token_2026';

/**
 * 构建包含 Bearer Token 的请求头。
 * [DEMO MODE] 直接注入固定 Token，跳过 localStorage。
 * 供 httpClient (axios) 和原生 fetch (如 AIChatPanel SSE) 统一使用。
 */
export function buildAuthHeaders(extra?: Record<string, string>): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${DEMO_TOKEN}`,
    ...extra,
  };
}
