
import React from 'react';
import { ShoppingBag, Truck, Clock, AlertCircle } from 'lucide-react';

interface OrderMetricsProps {
  onDetailClick?: () => void;
  onDelayClick?: () => void;
  onTransitClick?: () => void;
  onTotalClick?: () => void;
  activeStatus?: string | null;
}

const OrderMetrics: React.FC<OrderMetricsProps> = ({ onDetailClick, onDelayClick, onTransitClick, onTotalClick, activeStatus }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      <StatBox
        icon={<ShoppingBag size={20} />}
        label="总订单量"
        value="12,842"
        trend="+14.2%"
        color="text-blue-400"
        onClick={onTotalClick}
        isClickable
        tip="查看全部"
        isActive={!activeStatus}
      />
      <StatBox
        icon={<Truck size={20} />}
        label="运输中"
        value="2,142"
        trend="+5.1%"
        color="text-cyan-400"
        onClick={onTransitClick}
        isClickable
        tip="筛选运输中"
        isActive={activeStatus === '运输中'}
      />
      <StatBox
        icon={<Clock size={20} />}
        label="平均处理时效"
        value="0.8h"
        trend="-12%"
        color="text-emerald-400"
      />
      <StatBox
        icon={<AlertCircle size={20} />}
        label="异常延误"
        value="14"
        trend="-2"
        color="text-amber-500"
        onClick={onDelayClick}
        isClickable
        tip="查看延误"
      />
    </div>
  );
};

const StatBox = ({ icon, label, value, trend, color, onClick, isClickable, tip, isActive }: any) => (
  <div
    onClick={onClick}
    className={`bg-bg-secondary border rounded-3xl p-6 transition-all duration-300 group relative overflow-hidden ${
      isActive ? 'border-blue-500/50 shadow-lg shadow-blue-500/10' : 'border-border-default'
    } ${
      isClickable ? 'cursor-pointer hover:border-blue-500/50 hover:scale-[1.02] active:scale-95 hover:shadow-blue-500/10' : 'hover:border-border-default'
    }`}
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl bg-bg-elevated border border-border-default ${color}`}>
        {icon}
      </div>
      <span className={`text-[10px] font-black px-2 py-1 rounded bg-bg-primary/50 border border-border-default ${trend.startsWith('+') ? 'text-emerald-400' : 'text-amber-400'}`}>
        {trend}
      </span>
    </div>
    <div className="space-y-1">
      <div className="text-3xl font-black text-text-primary tracking-tighter">{value}</div>
      <div className="flex items-center gap-2">
        <div className="text-[10px] text-text-muted font-black uppercase tracking-widest">{label}</div>
        {isClickable && (
          <span className="text-[8px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-black animate-pulse uppercase">点击{tip}</span>
        )}
      </div>
    </div>
    {/* 背景修饰光 */}
    {isClickable && (
      <div className={`absolute -right-4 -bottom-4 w-16 h-16 blur-3xl opacity-5 group-hover:opacity-10 transition-opacity ${color.replace('text', 'bg')}`} />
    )}
  </div>
);

export default OrderMetrics;
