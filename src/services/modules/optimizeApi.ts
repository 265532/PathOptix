import { httpClient } from '../api/httpClient';

// ================================================================
// 类型定义
// ================================================================

export interface StepDetail {
  from: string;
  to: string;
  transport_mode: string;
  time_days: number;
  cost_usd: number;
  carbon_kg: number;
}

export interface RlPathJson {
  start_node: string;
  end_node: string;
  reached_goal: boolean;
  route_nodes: string[];
  transport_modes: string[];
  num_legs: number;
  total_time_days: number;
  total_cost_usd: number;
  total_carbon_kg: number;
  total_reward: number;
  weights: { w_cost: number; w_time: number; w_carbon: number };
  steps_detail: StepDetail[];
}

export interface OptimizeResponse {
  code: number;
  msg: string;
  data: {
    rl_path_json: RlPathJson;
    explanation_report: string;
  };
}

export interface OptimizeRequest {
  start_node: string;
  end_node: string;
  weight_cost: number;
  weight_time: number;
  weight_carbon: number;
}

// ================================================================
// API
// ================================================================

export const optimizeApi = {
  optimizeRoute: (params: OptimizeRequest) =>
    httpClient.post<OptimizeResponse>('/optimize/route', params, {
      timeout: 120000,
      showLoading: false,
      retry: 0,
    }),
};
