
import React, { useState } from 'react';
import { AlertTriangle, Zap, Terminal, CheckCircle } from 'lucide-react';

interface AlertPanelProps {
  onOpenLog?: () => void;
}

const AlertPanel: React.FC<AlertPanelProps> = ({ onOpenLog }) => {
  const [showSuccess, setShowSuccess] = useState(false);

  const handleApplyStrategy = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  return (
    <div className="space-y-4 h-full">
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3">
        <div className="bg-red-500/20 p-2 rounded-lg h-fit">
          <AlertTriangle className="text-red-500" size={18} />
        </div>
        <div>
          <h4 className="text-xs font-bold text-red-500 mb-1">高拥堵风险</h4>
          <p className="text-[10px] text-red-400/80 leading-relaxed">上海港延迟比基准预测增加了 <span className="font-bold text-red-400">42%</span>。</p>
        </div>
      </div>

      <div className="bg-bg-secondary border border-cyan-500/30 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-3">
          <Zap className="text-cyan-400" size={20} fill="currentColor" />
          <h4 className="text-xs font-bold text-text-primary">AI 优化已就绪</h4>
        </div>
        <p className="text-[10px] text-text-muted leading-relaxed">
          北美航线的新强化学习策略可减少 <span className="text-cyan-400 font-bold">2.3%</span> 的延迟。
        </p>
        <button 
          onClick={handleApplyStrategy}
          className="w-full py-2 bg-cyan-500 text-white text-[11px] font-bold rounded-lg hover:bg-cyan-400 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)]"
        >
          应用策略
        </button>
        
        {showSuccess && (
          <div className="mt-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <CheckCircle size={14} className="text-emerald-500" />
            <span className="text-[10px] font-bold text-emerald-400">应用成功</span>
          </div>
        )}
      </div>

      <div className="bg-bg-secondary rounded-[24px] border border-border-default p-6 flex flex-col flex-1 min-h-[200px] shadow-2xl relative overflow-hidden group">
        <h4 className="text-[12px] font-bold text-text-muted/80 uppercase tracking-widest mb-6">强化学习策略评分</h4>
        
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-0.5">
            <div className="flex items-baseline">
               <span className="text-5xl font-black text-text-primary italic tracking-tighter tabular-nums drop-shadow-md">78</span>
               <span className="text-2xl font-bold text-cyan-500 italic ml-1">%</span>
            </div>
            <p className="text-[11px] text-text-muted font-bold uppercase tracking-widest opacity-80">系统置信度</p>
          </div>

          <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
            <div className="absolute inset-4 bg-cyan-500/5 blur-2xl rounded-full group-hover:bg-cyan-500/10 transition-all" />
            
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90 overflow-visible drop-shadow-[0_0_12px_rgba(6,182,212,0.2)] text-border-default">
              <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="9" fill="transparent" />
              <circle 
                cx="50" cy="50" r="42" stroke="#06b6d4" strokeWidth="9" fill="transparent" 
                strokeDasharray="264" strokeDashoffset={264 * (1 - 0.78)} strokeLinecap="round" 
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-[14px] font-black text-text-primary italic leading-none drop-shadow-lg">高</span>
            </div>
          </div>
        </div>

        <button 
          onClick={onOpenLog}
          className="mt-auto flex items-center justify-center gap-3 py-3.5 bg-bg-secondary border border-border-default rounded-xl text-[11px] font-black text-text-muted hover:text-text-primary hover:border-border-input hover:bg-bg-tertiary transition-all uppercase tracking-[0.2em] shadow-inner group/btn"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-text-muted group-hover/btn:text-cyan-400 transition-colors tracking-tighter font-mono">›_</span>
            <span>查看实时训练日志</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default AlertPanel;
