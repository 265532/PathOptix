import axios, { AxiosInstance, AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ApiError } from './types';
import { DEMO_TOKEN, extractErrorMessage } from './httpClient';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8010') + '/api';

export const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // ====== 请求拦截器：硬编码注入 Demo Token ======
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      if (config.headers) {
        config.headers.Authorization = `Bearer ${DEMO_TOKEN}`;
      }
      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

  // ====== 响应拦截器：仅打印错误，不跳转 ======
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    async (error: AxiosError) => {
      const status = error.response?.status;
      const url = error.config?.url;
      const method = error.config?.method?.toUpperCase();

      if (status === 401) {
        console.warn(
          `[Demo Mode] 401 Unauthorized — ${method} ${url}\n` +
          `→ 后端仍启用了鉴权中间件，请检查对应路由的 Depends(get_current_active_user) 是否已移除。`
        );
      }

      if (status === 404) {
        console.error(
          `[Route] 404 Not Found — ${method} ${BASE_URL}${url}\n` +
          `→ 请检查后端是否注册了该路由。\n` +
          `→ 提示：后端使用 redirect_slashes=False，注意尾部斜杠是否匹配。`
        );
      }

      if (!error.response) {
        console.error(
          `[Network] 无法连接后端 — ${method} ${BASE_URL}${url}\n` +
          `→ 请确认后端服务已启动: uvicorn main:app --reload --port 8010`
        );
      }

      const apiError: ApiError = {
        code: status || -1,
        message: extractErrorMessage(error),
        url: error.config?.url,
        requestData: error.config?.data,
      };

      return Promise.reject(apiError);
    }
  );

  return instance;
};

export const axiosInstance = createAxiosInstance();
