import { httpClient } from '../api/httpClient';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  orderId?: string;
}

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  response: string;
  order_id?: string;
}

export const chatApi = {
  // TODO: 确认后端路由 — 后端 @router.post("") 无尾部斜杠
  sendMessage: (message: string) => {
    return httpClient.post<ChatResponse>('/chat', { message } as ChatRequest, {
      showLoading: false,
      timeout: 30000,
      retry: 1,
    });
  },

  getChatHistory: (sessionId?: string) => {
    return httpClient.get<ChatMessage[]>('/chat/history', {
      params: sessionId ? { session_id: sessionId } : undefined,
      showLoading: false,
    });
  },

  clearChatHistory: (sessionId?: string) => {
    return httpClient.delete<void>('/chat/history', {
      params: sessionId ? { session_id: sessionId } : undefined,
      showLoading: true,
    });
  },
};
