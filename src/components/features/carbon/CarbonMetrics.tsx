
import React from 'react';
import { Leaf, Zap, ArrowDownUp, Server } from 'lucide-react';

interface MetricsData {
  carbon: { value: number; trend: number };
  energy: { value: number; trend: number };
  offset: { value: number; trend: number };
  pue: { value: number; trend: number };
}

interface CarbonMetricsProps {
  metricsData: MetricsData;
  hasOptimized: boolean;
}

const CarbonMetrics: React.FC<CarbonMetricsProps> = ({ metricsData, hasOptimized }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricBox
        icon={<Leaf size={20} />}
        label="碳排放量"
        value={`${metricsData.carbon.value}t`}
        trend={`${metricsData.carbon.trend > 0 ? '+' : ''}${metricsData.carbon.trend}%`}
        color="text-emerald-400"
        hasOptimized={hasOptimized}
      />
      <MetricBox
        icon={<Zap size={20} />}
        label="能耗"
        value={`${metricsData.energy.value}kWh`}
        trend={`${metricsData.energy.trend > 0 ? '+' : ''}${metricsData.energy.trend}%`}
        color="text-amber-400"
        hasOptimized={hasOptimized}
      />
      <MetricBox
        icon={<ArrowDownUp size={20} />}
        label="碳抵消率"
        value={`${metricsData.offset.value}%`}
        trend={`${metricsData.offset.trend > 0 ? '+' : ''}${metricsData.offset.trend}%`}
        color="text-cyan-400"
        hasOptimized={hasOptimized}
      />
      <MetricBox
        icon={<Server size={20} />}
        label="PUE"
        value={`${metricsData.pue.value}`}
        trend={`${metricsData.pue.trend > 0 ? '+' : ''}${metricsData.pue.trend}`}
        color="text-blue-400"
        hasOptimized={hasOptimized}
      />
    </div>
  );
};

const MetricBox = ({ icon, label, value, trend, color, hasOptimized }: any) => (
  <div className="bg-bg-secondary border border-border-default rounded-3xl p-6 transition-all duration-300 group relative overflow-hidden">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl bg-bg-elevated border border-border-default ${color}`}>
        {icon}
      </div>
      <span className={`text-[10px] font-black px-2 py-1 rounded bg-bg-primary/50 border border-border-default ${trend.startsWith('+') ? 'text-amber-400' : 'text-emerald-400'}`}>
        {trend}
      </span>
    </div>
    <div className="space-y-1">
      <div className="text-3xl font-black text-text-primary tracking-tighter">{value}</div>
      <div className="text-[10px] text-text-muted font-black uppercase tracking-widest">{label}</div>
    </div>
    {hasOptimized && (
      <div className={`absolute -right-4 -bottom-4 w-16 h-16 blur-3xl opacity-5 group-hover:opacity-10 transition-opacity ${color.replace('text', 'bg')}`} />
    )}
  </div>
);

export default CarbonMetrics;
