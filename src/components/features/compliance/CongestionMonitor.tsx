import React from 'react';
import { Activity, Globe, CloudRain, Route, TrendingUp } from 'lucide-react';
import type { RiskMetrics } from './types';

interface CongestionMonitorProps {
  metrics: RiskMetrics | null;
}

const CongestionMonitor: React.FC<CongestionMonitorProps> = ({ metrics }) => {
  const m = metrics ?? {
    congestion_index: 0,
    weather_disruption: 0,
    patency_rate: 0,
    affected_routes: 0,
    updated_at: '-',
  };

  const getStatus = (val: number, thresholds: [number, number]) => {
    if (val >= thresholds[1]) return { label: 'HIGH RISK', color: 'text-red-400', barColor: 'bg-red-500' };
    if (val >= thresholds[0]) return { label: 'ELEVATED', color: 'text-amber-400', barColor: 'bg-amber-500' };
    return { label: 'NORMAL', color: 'text-emerald-400', barColor: 'bg-emerald-500' };
  };

  const congestionStatus = getStatus(m.congestion_index, [50, 70]);
  const weatherStatus = getStatus(m.weather_disruption, [40, 60]);

  return (
    <div className="h-full bg-bg-secondary border border-border-default rounded-3xl p-4 md:p-8 relative overflow-hidden flex flex-col">
      <div className="flex justify-between items-center mb-6 md:mb-10 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-500/10 rounded-full flex items-center justify-center border border-orange-500/20">
            <Activity size={16} className="text-orange-400" />
          </div>
          <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">全球拥堵与天气监测</h3>
        </div>
        <span className="text-[9px] text-text-muted font-mono">更新于 {m.updated_at}</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-12 flex-1 items-center relative z-10">
        {/* 左侧：拥堵指数仪表 */}
        <div className="flex justify-center items-center">
          <div className="relative w-36 h-36 md:w-48 md:h-48 rounded-full border border-border-default flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-orange-500/10 animate-ping opacity-20" />
            <div className="absolute inset-4 rounded-full border border-orange-500/30 animate-pulse" />
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-bg-elevated/50 border-2 border-border-default flex flex-col items-center justify-center shadow-[inset_0_0_30px_rgba(249,115,22,0.1)]">
              <span className="text-4xl font-black text-text-primary italic">{m.congestion_index.toFixed(1)}</span>
              <span className={`text-[10px] font-black uppercase mt-1 tracking-tighter ${congestionStatus.color}`}>
                {congestionStatus.label}
              </span>
              <span className="text-[9px] text-text-muted font-bold mt-1">CONGESTION INDEX</span>
            </div>
          </div>
        </div>

        {/* 右侧：指标条 */}
        <div className="space-y-6">
          <MetricBar
            icon={<CloudRain size={14} />}
            label="天气干扰指数"
            value={m.weather_disruption}
            status={weatherStatus}
          />
          <MetricBar
            icon={<Route size={14} />}
            label="受影响航线数"
            value={m.affected_routes}
            status={m.affected_routes > 15
              ? { label: 'BLOCKED', color: 'text-red-400', barColor: 'bg-red-500' }
              : { label: 'ACTIVE', color: 'text-emerald-400', barColor: 'bg-emerald-500' }
            }
            unit="条"
            max={50}
          />
          <MetricBar
            icon={<TrendingUp size={14} />}
            label="全局通畅率"
            value={m.patency_rate}
            status={m.patency_rate < 40
              ? { label: 'CRITICAL', color: 'text-red-400', barColor: 'bg-red-500' }
              : m.patency_rate < 60
                ? { label: 'WARNING', color: 'text-amber-400', barColor: 'bg-amber-500' }
                : { label: 'STABLE', color: 'text-emerald-400', barColor: 'bg-emerald-500' }
            }
            unit="%"
          />
        </div>
      </div>

      <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-border-default flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3 text-text-muted">
          <Globe size={16} />
          <span className="text-[10px] font-bold uppercase tracking-widest">全球供应链实时态势</span>
        </div>
        <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">PathOptix RL Engine</span>
      </div>

      {/* 装饰网格 */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.8)_1px,transparent_1px)] bg-[size:40px_40px] opacity-10 pointer-events-none" />
    </div>
  );
};

interface MetricBarProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  status: { label: string; color: string; barColor: string };
  unit?: string;
  max?: number;
}

const MetricBar = ({ icon, label, value, status, unit = '', max = 100 }: MetricBarProps) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2 text-text-secondary">
        {icon}
        <span className="text-[11px] font-bold tracking-tight">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-black text-text-primary">
          {typeof value === 'number' ? (Number.isInteger(value) ? value : value.toFixed(1)) : value}{unit}
        </span>
        <span className={`text-[9px] font-black tracking-widest ${status.color}`}>
          {status.label}
        </span>
      </div>
    </div>
    <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
      <div
        className={`h-full ${status.barColor} rounded-full transition-all duration-1000 shadow-[0_0_6px_rgba(255,255,255,0.1)]`}
        style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
      />
    </div>
  </div>
);

export default CongestionMonitor;
