
import React from 'react';
import { ShieldAlert, Gavel } from 'lucide-react';

const PolicyView: React.FC = () => {
  return (
    <div className="p-4 md:p-6 lg:p-10 bg-amber-500/5 border border-amber-500/20 rounded-[40px] flex flex-col items-center justify-center min-h-[600px] animate-in zoom-in-95 duration-500">
      <div className="p-6 bg-amber-500/10 rounded-full text-amber-500 mb-8 border border-amber-500/20">
        <Gavel size={64} />
      </div>
      <h2 className="text-4xl font-black text-text-primary tracking-tighter mb-4 italic">政策剧烈波动仿真</h2>
      <p className="text-text-muted text-sm font-bold uppercase tracking-widest mb-10 text-center max-w-lg leading-relaxed">
        系统正在加载针对地缘政治剧变、关税调整及贸易禁令的压力模型。此模块处于“高度警觉”状态。
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 w-full max-w-2xl">
        <div className="p-6 bg-bg-elevated/50 rounded-2xl border border-border-default text-center">
          <div className="text-xs font-black text-text-muted uppercase mb-2">法务合规风险</div>
          <div className="text-2xl font-black text-amber-500 tracking-tighter">84%</div>
        </div>
        <div className="p-6 bg-bg-elevated/50 rounded-2xl border border-border-default text-center">
          <div className="text-xs font-black text-text-muted uppercase mb-2">成本补偿系数</div>
          <div className="text-2xl font-black text-text-primary tracking-tighter">x1.42</div>
        </div>
        <div className="p-6 bg-bg-elevated/50 rounded-2xl border border-border-default text-center">
          <div className="text-xs font-black text-text-muted uppercase mb-2">替代供应商</div>
          <div className="text-2xl font-black text-emerald-500 tracking-tighter">14 可用</div>
        </div>
      </div>
    </div>
  );
};

export default PolicyView;
