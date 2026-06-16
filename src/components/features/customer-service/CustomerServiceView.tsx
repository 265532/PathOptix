
import React, { useState, useCallback } from 'react';
import AIChatPanel from './AIChatPanel';
import AIResponsePanel from './AIResponsePanel';
import OrderSyncPanel, { ActiveOrder } from './OrderSyncPanel';
import SupportQueue from './SupportQueue';
import ProgressTracking from './ProgressTracking';
import FeedbackForm from './FeedbackForm';
import FeedbackStatusTable from './FeedbackStatusTable';
import ServiceStats from './ServiceStats';
import SentimentChart from './SentimentChart';
import UpdatesFeed from './UpdatesFeed';
import type { UploadedFile } from '../../../types';

interface FeedbackData {
  id: string;
  type: string;
  urgency: string;
  description: string;
  files: UploadedFile[];
  status: string;
  progress: number;
  submittedAt: string;
}

const CustomerServiceView: React.FC = () => {
  const [activeOrder, setActiveOrder] = useState<ActiveOrder>({
    id: 'CN82991022',
    status: 'IN TRANSIT',
    shipper: '智联电子制造',
    receiver: '环球商贸 (北京)',
    item: '工业级精密传感器 x12',
  });

  const [agentTrigger, setAgentTrigger] = useState(0);
  const [feedbackList, setFeedbackList] = useState<FeedbackData[]>([]);

  const orderContext = `当前用户正在查看订单 ${activeOrder.id}，发货方${activeOrder.shipper}，收货方${activeOrder.receiver}，物品是${activeOrder.item}，目前状态 ${activeOrder.status} 且带有天气预警延误风险。`;

  const triggerAgentReRoute = useCallback(() => {
    setAgentTrigger(prev => prev + 1);
  }, []);

  const handleAddFeedback = useCallback((feedback: FeedbackData) => {
    setFeedbackList(prev => [feedback, ...prev]);
  }, []);

  const handleUpdateFeedbackProgress = useCallback((feedbackId: string, progress: number, status: string) => {
    setFeedbackList(prev =>
      prev.map(f => f.id === feedbackId ? { ...f, progress, status } : f)
    );
  }, []);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 lg:space-y-8 animate-in fade-in duration-700 max-w-[1800px] mx-auto w-full">
      {/* 第一行：智能在线聊天 & 订单同步 */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-6">
        <div className="xl:col-span-8">
          <AIChatPanel orderContext={orderContext} agentTrigger={agentTrigger} orderId={activeOrder.id} />
        </div>
        <div className="xl:col-span-4">
          <OrderSyncPanel activeOrder={activeOrder} onOrderChange={setActiveOrder} onAgentTrigger={triggerAgentReRoute} />
        </div>
      </div>

      {/* 第二行：AI 自动回复建议 */}
      <AIResponsePanel />

      {/* 第三行：待办服务工单 & 投诉处理进度 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <SupportQueue />
        <ProgressTracking feedbackList={feedbackList} />
      </div>

      {/* 第四行：服务指标统计 */}
      <ServiceStats />

      {/* 第五行：提交反馈 & 分类处理反馈 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <FeedbackForm onAddFeedback={handleAddFeedback} onUpdateFeedbackProgress={handleUpdateFeedbackProgress} />
        <FeedbackStatusTable />
      </div>

      {/* 第六行：客户情感分析 & 更新公示 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <SentimentChart />
        <UpdatesFeed />
      </div>
    </div>
  );
};

export default CustomerServiceView;
