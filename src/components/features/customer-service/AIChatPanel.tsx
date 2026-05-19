
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Headset, User, Send, Zap } from 'lucide-react';
import type { ChatMessage } from '@services';
import { buildAuthHeaders } from '@services';

type ExtendedMessage = ChatMessage & { type?: 'chat' | 'system' };

interface AIChatPanelProps {
  orderContext?: string;
  agentTrigger?: number;
  orderId?: string;
}

const AGENT_PROMPT_TEMPLATE = (orderId: string) =>
  `用户点击了重路由诊断按钮。请你以系统底层 AI 调度引擎的身份，输出一份简短、硬核的重路由执行报告。包含以下三点：1. 正在扫描路网拓扑... 2. 发现原航线（海运）存在严重拥堵和天气风险；3. 已生成 PPO 备选方案：建议在【洛杉矶】节点截断，转为【空运】直飞【法兰克福】。预计增加成本 $240，挽回延误 3 天。请用极简的、带有科技感和终端输出风格的语言回答。当前诊断订单：${orderId}`;

const AIChatPanel: React.FC<AIChatPanelProps> = ({ orderContext, agentTrigger = 0, orderId = '' }) => {
  const [messages, setMessages] = useState<ExtendedMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: '您好！我是您的智能物流管家。您可以直接输入订单号或问题关键词，如"我的快件在哪"、"运费争议"等。',
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      type: 'chat',
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const prevTriggerRef = useRef(agentTrigger);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  }, [messages]);

  const streamLLMResponse = useCallback(async (
    prompt: string,
    assistantId: string,
    context?: string,
    isAgentCall = false
  ) => {
    const history = messages
      .filter(m => m.id !== '1' && m.type !== 'system')
      .map(m => ({
        role: m.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: m.text,
      }));

    const controller = new AbortController();
    abortRef.current = controller;
    setIsLoading(true);

    try {
      const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8010';

      const response = await fetch(`${BASE}/api/chat`, {
        method: 'POST',
        headers: buildAuthHeaders(),
        body: JSON.stringify({ message: prompt, history, context: isAgentCall ? undefined : context }),
        signal: controller.signal,
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error(`[Chat] 401 Unauthorized — POST ${BASE}/api/chat`);
          throw new Error('未授权：请先登录后再使用聊天功能');
        }
        if (response.status === 404) {
          console.error(`[Chat] 404 Not Found — POST ${BASE}/api/chat\n→ 请检查后端 @router.post("") 是否注册`);
          throw new Error('接口不存在 (404)：请检查后端 /api/chat 路由配置');
        }
        throw new Error(`HTTP ${response.status}：${response.statusText}`);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const payload = line.slice(6);
            if (payload === '[DONE]') break;
            accumulated += payload;
            setMessages(prev =>
              prev.map(m => m.id === assistantId ? { ...m, text: accumulated } : m)
            );
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        const errorMsg = err instanceof Error ? err.message : '未知通信错误';
        console.error('[Chat] 请求失败:', errorMsg);
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId && m.text === ''
              ? { ...m, text: `[通信异常] ${errorMsg}` }
              : m
          )
        );
      }
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }, [messages]);

  useEffect(() => {
    if (agentTrigger <= 0 || agentTrigger === prevTriggerRef.current) return;
    prevTriggerRef.current = agentTrigger;

    const currentOrderId = orderId;
    const systemMsgId = `sys-${Date.now()}`;
    const assistantId = `agent-${Date.now()}`;

    setMessages(prev => [
      ...prev,
      {
        id: systemMsgId,
        sender: 'bot',
        text: `⚡ 接收到管理员指令：正在唤醒 PPO 强化学习引擎，评估订单 ${currentOrderId} 的重路由方案...`,
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        type: 'system',
      },
      {
        id: assistantId,
        sender: 'bot',
        text: '',
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        type: 'chat',
      }
    ]);

    setTimeout(() => {
      streamLLMResponse(AGENT_PROMPT_TEMPLATE(currentOrderId), assistantId, undefined, true);
    }, 50);
  }, [agentTrigger, orderId, streamLLMResponse]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userText = inputText.trim();
    const userMessage: ExtendedMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      type: 'chat',
    };

    const assistantId = (Date.now() + 1).toString();
    setMessages(prev => [
      ...prev,
      userMessage,
      {
        id: assistantId,
        sender: 'bot',
        text: '',
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        type: 'chat',
      }
    ]);
    setInputText('');

    await streamLLMResponse(userText, assistantId, orderContext);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="bg-bg-tertiary rounded-[32px] border border-border-default p-8 flex flex-col h-[600px] shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-400 border border-blue-500/20">
            <Headset size={24} />
          </div>
          <div>
            <h3 className="text-lg font-black text-text-primary tracking-tight">7×24h 智能在线</h3>
            <p className="text-xs text-text-muted font-bold">
              {isLoading ? 'AI 正在思考...' : 'AI 已就绪，为您实时解答'}
            </p>
          </div>
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-6 pr-2 scrollbar-hide">
        {messages.map((message) => {
          if (message.type === 'system') {
            return (
              <div key={message.id} className="flex justify-center">
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-2.5 flex items-center gap-2 max-w-lg">
                  <Zap size={12} className="text-amber-400 animate-pulse shrink-0" />
                  <p className="text-[11px] text-amber-400/90 font-mono font-bold leading-relaxed">{message.text}</p>
                </div>
              </div>
            );
          }

          return (
            <div key={message.id} className={`flex gap-4 items-start ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${message.sender === 'user' ? 'bg-bg-tertiary text-text-muted' : 'bg-blue-600/20 border border-blue-500/20 text-blue-400'}`}>
                {message.sender === 'user' ? <User size={16} /> : <Headset size={16} />}
              </div>
              <div className={`space-y-1 ${message.sender === 'user' ? 'text-right' : ''}`}>
                <div className={`p-4 rounded-2xl max-w-lg text-sm leading-relaxed whitespace-pre-wrap ${message.sender === 'user' ? 'bg-brand-primary/10 text-text-primary font-medium shadow-lg shadow-blue-600/20 rounded-tr-none inline-block' : 'bg-bg-secondary border border-border-default rounded-tl-none'}`}>
                  {message.text || (
                    <span className="inline-flex gap-1">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  )}
                </div>
                <div className={`text-[10px] text-text-muted font-bold ${message.sender === 'user' ? 'mr-1' : 'ml-1'}`}>
                  {message.timestamp}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="mt-8 relative">
        <input
          type="text"
          placeholder="输入您的问题..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={isLoading}
          className="w-full bg-bg-elevated border border-border-input rounded-2xl pl-6 pr-16 py-5 text-sm text-text-secondary focus:outline-none focus:border-blue-500 transition-all duration-300 shadow-inner disabled:opacity-50"
        />
        <button
          onClick={(e) => { e.preventDefault(); sendMessage(); }}
          disabled={isLoading || !inputText.trim()}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default AIChatPanel;
