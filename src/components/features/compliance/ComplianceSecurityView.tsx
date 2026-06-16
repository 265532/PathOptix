import React from 'react';
import { Globe, Shield, AlertTriangle } from 'lucide-react';
import PredictiveSandbox from './PredictiveSandbox';

const riskMetrics = [
  { label: '全球运输风险指数', value: '32.4', unit: 'Low', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { label: '港口拥堵预警', value: '3', unit: '处活跃', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  { label: '合规覆盖率', value: '97.2', unit: '%', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  { label: 'AI 预警准确率', value: '94.8', unit: '%', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
];

const alerts = [
  { time: '08:32', level: '高', msg: '红海航线苏伊士运河段通行延迟预计 48h，建议启用好望角备选路线', color: 'text-red-400' },
  { time: '07:15', level: '中', msg: '鹿特丹港泊位紧张，EU447-EU512 区域船舶排队增加 23%', color: 'text-amber-400' },
  { time: '06:48', level: '低', msg: '上海浦东国际机场货运区本周吞吐量环比下降 5.2%，关注后续趋势', color: 'text-blue-400' },
];

const ComplianceSecurityView: React.FC = () => {
  return (
    <div className="p-4 md:p-6 lg:p-8 animate-in fade-in duration-700 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center border border-red-500/20">
            <Globe size={18} className="text-orange-400" />
          </div>
          <div>
            <h2 className="text-lg font-black text-text-primary uppercase tracking-widest">全球供应链风险预警</h2>
            <p className="text-[10px] text-text-muted font-bold mt-0.5">PPO 强化学习驱动 · 实时风险感知与主动防御</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-text-muted">
          <Shield size={14} className="text-emerald-400" />
          <span className="text-[10px] font-black uppercase tracking-widest">System Online</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {riskMetrics.map((m, i) => (
          <div key={i} className={`${m.bg} border ${m.border} rounded-2xl p-4 md:p-6 space-y-1 md:space-y-2`}>
            <span className="text-[9px] md:text-[10px] font-black text-text-muted uppercase tracking-widest">{m.label}</span>
            <div className="flex items-baseline gap-1 md:gap-2">
              <span className={`text-2xl md:text-3xl font-black ${m.color} italic tracking-tighter`}>{m.value}</span>
              <span className="text-[10px] md:text-xs text-text-muted font-bold">{m.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts Panel */}
      <div className="bg-bg-secondary border border-border-default rounded-3xl p-4 md:p-8">
        <div className="flex items-center gap-3 mb-4 md:mb-6">
          <AlertTriangle size={14} className="text-amber-400" />
          <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">实时预警</span>
        </div>
        <div className="space-y-3 md:space-y-4">
          {alerts.map((a, i) => (
            <div key={i} className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-bg-tertiary/20 rounded-xl border border-border-default">
              <span className="text-[10px] font-mono text-text-muted mt-0.5 shrink-0">{a.time}</span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full bg-bg-tertiary shrink-0 ${a.color}`}>{a.level}</span>
              <p className="text-[11px] md:text-xs text-text-secondary font-medium leading-relaxed">{a.msg}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Predictive Sandbox Engine */}
      <PredictiveSandbox />
    </div>
  );
};

export default ComplianceSecurityView;
