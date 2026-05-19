import { httpClient } from '../api/httpClient';

export interface Order {
  id: string;
  customer_name: string;
  date: string;
  amount: string;
  status: string;
  status_color: string;
}

export interface OrderListResponse {
  orders: Order[];
  total?: number;
}

export interface OrderFilters {
  keyword?: string;
  status?: string;
  dateRange?: string;
}

export const orderApi = {
  // TODO: 确认后端路由 — 后端 @router.get("/") 需要尾部斜杠，redirect_slashes=False
  getOrders: (filters?: OrderFilters) => {
    return httpClient.get<OrderListResponse>('/orders/', {
      params: filters,
      showLoading: false,
      retry: 2,
    });
  },

  getOrderById: (orderId: string) => {
    return httpClient.get<Order>(`/orders/${orderId}`, { showLoading: true });
  },

  createOrder: (orderData: Partial<Order>) => {
    return httpClient.post<Order>('/orders/', orderData, { showLoading: true });
  },

  updateOrder: (orderId: string, orderData: Partial<Order>) => {
    return httpClient.put<Order>(`/orders/${orderId}`, orderData, { showLoading: true });
  },

  deleteOrder: (orderId: string) => {
    return httpClient.delete<void>(`/orders/${orderId}`, { showLoading: true });
  },

  matchCapacity: (orderId: string) => {
    return httpClient.post<{ success: boolean; matched: boolean }>(
      `/orders/${orderId}/match-capacity`,
      {},
      { showLoading: true }
    );
  },

  analyzeCapacity: (orderId: string) => {
    return httpClient.get<{ capacity: number; utilization: number }>(
      `/orders/${orderId}/capacity-analysis`,
      { showLoading: true }
    );
  },

  getCarbonEmission: (orderId: string) => {
    return httpClient.get<{ carbon: number; unit: string }>(
      `/orders/${orderId}/carbon`,
      { showLoading: true }
    );
  },
};