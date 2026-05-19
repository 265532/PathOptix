
import React from 'react';
import { BarChart3, Zap } from 'lucide-react';

const ModelEval: React.FC = () => {
  return (
    <div className="bg-bg-secondary rounded-2xl p-5 border border-border-default flex flex-col gap-5 flex-1">
      <div className="flex items-center gap-2 text-text-secondary">
        <BarChart3 size={16} className="text-cyan-400" />
        <span className="text-xs font-bold tracking-wider uppercase">模型评估</span>
      </div>

      <div className="space-y-6">
        <div className="bg-bg-modal rounded-xl p-4 border border-border-default flex justify-between items-center">
          <span className="text-xs text-text-muted">成功率</span>
          <span className="text-xl font-black text-emerald-400">88%</span>
        </div>
        
        <div className="bg-bg-modal rounded-xl p-4 border border-border-default flex justify-between items-center">
          <span className="text-xs text-text-muted">稳定性</span>
          <span className="text-xs font-bold text-cyan-400 px-2 py-1 bg-cyan-500/10 rounded">高度稳定</span>
        </div>

        <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400">
            <Zap size={14} fill="currentColor" />
            <span className="text-[10px] font-black uppercase">AI 优化建议</span>
          </div>
          <p className="text-[10px] text-text-muted leading-relaxed">
            将学习率降至 <span className="text-cyan-400 font-bold">0.0003</span> 可提升 <span className="text-emerald-400">5%</span> 的稳定性。
          </p>
          <button className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold rounded-lg transition-all duration-300">
            立即应用
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModelEval;
