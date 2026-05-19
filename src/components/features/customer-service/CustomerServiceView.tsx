
import React, { useState, useCallback } from 'react';
import AIChatPanel from './AIChatPanel';
import OrderSyncPanel, { ActiveOrder } from './OrderSyncPanel';
import FeedbackStatusTable from './FeedbackStatusTable';
import UpdatesFeed from './UpdatesFeed';

const CustomerServiceView: React.FC = () => {
  const [activeOrder, setActiveOrder] = useState<ActiveOrder>({
    id: 'CN82991022',
    status: 'IN TRANSIT',
    shipper: '智联电子制造',
    receiver: '环球商贸 (北京)',
    item: '工业级精密传感器 x12',
  });

  const [agentTrigger, setAgentTrigger] = useState(0);

  const orderContext = `当前用户正在查看订单 ${activeOrder.id}，发货方${activeOrder.shipper}，收货方${activeOrder.receiver}，物品是${activeOrder.item}，目前状态 ${activeOrder.status} 且带有天气预警延误风险。`;

  const triggerAgentReRoute = useCallback(() => {
    setAgentTrigger(prev => prev + 1);
  }, []);

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700 max-w-[1800px] mx-auto w-full">
      {/* 第一行：智能在线聊天 & 订单同步 */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 xl:col-span-8">
          <AIChatPanel orderContext={orderContext} agentTrigger={agentTrigger} orderId={activeOrder.id} />
        </div>
        <div className="col-span-12 xl:col-span-4">
          <OrderSyncPanel activeOrder={activeOrder} onOrderChange={setActiveOrder} onAgentTrigger={triggerAgentReRoute} />
        </div>
      </div>

      {/* 第二行：分类处理 & 更新公示 */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 xl:col-span-6">
          <FeedbackStatusTable />
        </div>
        <div className="col-span-12 xl:col-span-6">
          <UpdatesFeed />
        </div>
      </div>
    </div>
  );
};

export default CustomerServiceView;
