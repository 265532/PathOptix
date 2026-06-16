import React from 'react';
import { AlertTriangle, Zap } from 'lucide-react';
import type { IntelligenceNews } from './types';

interface EmergencyAlertPanelProps {
  news: IntelligenceNews[];
}

const EmergencyAlertPanel: React.FC<EmergencyAlertPanelProps> = ({ news }) => {
  return (
    <div className="h-full bg-bg-secondary border border-border-default rounded-3xl p-4 md:p-6 relative overflow-hidden flex flex-col">
      <div className="flex items-center gap-2 mb-4 md:mb-6">
        <div className="w-8 h-8 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
          <AlertTriangle size={16} className="text-red-400" />
        </div>
        <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">突发情报</h3>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide pr-1">
        {news.map((item) => (
          <AlertCard key={item.id} item={item} />
        ))}
      </div>

      {/* 装饰背景 */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/5 blur-3xl rounded-full pointer-events-none" />
    </div>
  );
};

const levelConfig: Record<string, { color: string; bg: string; border: string; label: string }> = {
  CRITICAL: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'CRITICAL' },
  HIGH: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'HIGH' },
  MODERATE: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', label: 'MODERATE' },
};

const AlertCard = ({ item }: { key?: string; item: IntelligenceNews }) => {
  const cfg = levelConfig[item.risk_level] || levelConfig.MODERATE;
  return (
    <div className={`p-4 rounded-2xl border ${cfg.border} ${cfg.bg} space-y-2.5 hover:brightness-110 transition-all cursor-default`}>
      <div className="flex items-center justify-between">
        <span className={`text-[9px] font-black uppercase tracking-widest ${cfg.color}`}>
          {cfg.label}
        </span>
        <span className="text-[9px] text-text-muted font-mono">{item.timestamp}</span>
      </div>
      <p className="text-[11px] text-text-secondary font-bold leading-relaxed">{item.title}</p>
      <div className="flex items-center gap-1.5">
        <Zap size={10} className={cfg.color} />
        <span className="text-[9px] text-text-muted font-bold">{item.region}</span>
      </div>
    </div>
  );
};

export default EmergencyAlertPanel;
