import React from 'react';
import { Shield, CheckCircle, Loader, Clock, DollarSign } from 'lucide-react';

interface PreemptiveAction {
  id: string;
  target_order: string;
  strategy: string;
  cost_saved: string;
  status: 'QUEUED' | 'EXECUTING' | 'COMPLETED';
}

interface PpoPreemptiveLogProps {
  actions: PreemptiveAction[];
  currentTimeLabel: string;
}

const PpoPreemptiveLog: React.FC<PpoPreemptiveLogProps> = ({ actions, currentTimeLabel }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'COMPLETED': return { icon: <CheckCircle size={14} />, label: '已执行', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };
      case 'EXECUTING': return { icon: <Loader size={14} className="animate-spin" />, label: '执行中', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' };
      default: return { icon: <Clock size={14} />, label: '待执行', color: 'text-text-muted', bg: 'bg-text-muted/10 border-border-default/30' };
    }
  };

  const totalSaved = actions.reduce((sum, a) => {
    const match = a.cost_saved.match(/\$([0-9,]+)/);
    return sum + (match ? parseInt(match[1].replace(/,/g, ''), 10) : 0);
  }, 0);

  const completedCount = actions.filter(a => a.status === 'COMPLETED').length;

  return (
    <div className="bg-bg-secondary border border-border-default rounded-3xl p-8 flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
          <Shield size={16} className="text-emerald-400" />
        </div>
        <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">PPO 主动防御策略</h3>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-bg-elevated/50 rounded-xl p-3 text-center border border-border-default/40">
          <div className="text-lg font-black text-text-primary">{actions.length}</div>
          <div className="text-[9px] text-text-muted font-bold uppercase">策略总数</div>
        </div>
        <div className="bg-emerald-500/5 rounded-xl p-3 text-center border border-emerald-500/20">
          <div className="text-lg font-black text-emerald-400">{completedCount}</div>
          <div className="text-[9px] text-text-muted font-bold uppercase">已完成</div>
        </div>
        <div className="bg-amber-500/5 rounded-xl p-3 text-center border border-amber-500/20">
          <div className="text-lg font-black text-amber-400">${totalSaved.toLocaleString()}</div>
          <div className="text-[9px] text-text-muted font-bold uppercase">节省金额</div>
        </div>
      </div>

      {/* Action list */}
      <div className="space-y-3 flex-1 overflow-y-auto max-h-[380px] pr-1">
        {actions.map((action) => {
          const statusCfg = getStatusConfig(action.status);
          return (
            <div
              key={action.id}
              className={`rounded-2xl border p-4 transition-all duration-300 ${statusCfg.bg}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black text-blue-400 font-mono">{action.target_order}</span>
                <div className={`flex items-center gap-1 text-[9px] font-black uppercase ${statusCfg.color}`}>
                  {statusCfg.icon}
                  <span>{statusCfg.label}</span>
                </div>
              </div>

              <p className="text-[11px] text-text-secondary font-bold leading-relaxed mb-3">
                {action.strategy}
              </p>

              {action.cost_saved !== '—' && (
                <div className="flex items-center gap-1.5">
                  <DollarSign size={12} className="text-emerald-500" />
                  <span className="text-[11px] font-black text-emerald-400">
                    已节省 {action.cost_saved}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-border-default flex items-center justify-between">
        <span className="text-[10px] text-text-muted font-bold">PPO 引擎 · {currentTimeLabel}</span>
        <span className="text-[9px] text-emerald-400 font-black uppercase tracking-widest">PathOptix RL</span>
      </div>
    </div>
  );
};

export default PpoPreemptiveLog;
