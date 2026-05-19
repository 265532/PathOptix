
import React from 'react';
import { useChartTheme } from '@hooks/useChartTheme';

const SensitivityChart: React.FC<{ isStress?: boolean }> = ({ isStress }) => {
  const chartTheme = useChartTheme();
  return (
    <div className="bg-bg-tertiary/60 backdrop-blur-xl rounded-[24px] p-6 border border-border-default shadow-2xl flex flex-col min-h-[300px]">
      <div className="mb-8">
        <h3 className="text-xs font-black text-text-primary uppercase tracking-[0.15em]">场景敏感度分析</h3>
        <p className="text-[9px] text-text-muted font-bold mt-1 uppercase tracking-[0.05em] leading-relaxed">
          环境剧烈变动时的韧性衰减曲线
        </p>
      </div>

      <div className="relative mb-6 h-[200px]">
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[8px] text-text-primary font-black pr-2">
          <span>100</span>
          <span>50</span>
          <span>0</span>
        </div>
        
        <div className="ml-6 h-full">
          <svg width="100%" height="100%" viewBox="0 0 300 200">
            {/* 网格线 */}
            <line x1="0" y1="20" x2="300" y2="20" stroke={chartTheme.gridColor} strokeDasharray="1 10" />
            <line x1="0" y1="100" x2="300" y2="100" stroke={chartTheme.gridColor} strokeDasharray="1 10" />
            <line x1="0" y1="180" x2="300" y2="180" stroke={chartTheme.gridColor} strokeDasharray="1 10" />
            
            {/* 场景标签 */}
            <text x="50" y="195" fill={chartTheme.axisTextColor} fontSize="10" fontWeight="bold">常规运营</text>
            <text x="150" y="195" fill={chartTheme.axisTextColor} fontSize="10" fontWeight="bold">高拥堵场景</text>
            <text x="250" y="195" fill={chartTheme.axisTextColor} fontSize="10" fontWeight="bold">极端地缘风险</text>
            
            {/* 鲁棒性路径 - 绿色 */}
            <path d="M50,80 L150,90 L250,100" stroke="#10b981" strokeWidth="2" fill="none" />
            <circle cx="50" cy="80" r="3" fill="#10b981" />
            <circle cx="150" cy="90" r="3" fill="#10b981" />
            <circle cx="250" cy="100" r="3" fill="#10b981" />
            
            {/* 成本最优 - 蓝色虚线 */}
            <path d="M50,100 L150,120 L250,160" stroke="#3b82f6" strokeWidth="1.5" fill="none" strokeDasharray="4 4" />
            <circle cx="50" cy="100" r="3" fill="#3b82f6" />
            <circle cx="150" cy="120" r="3" fill="#3b82f6" />
            <circle cx="250" cy="160" r="3" fill="#3b82f6" />
            
            {/* 速度优先 - 橙色点线 */}
            <path d="M50,70 L150,110 L250,140" stroke="#f59e0b" strokeWidth="1.5" fill="none" strokeDasharray="2 2" />
            <circle cx="50" cy="70" r="3" fill="#f59e0b" />
            <circle cx="150" cy="110" r="3" fill="#f59e0b" />
            <circle cx="250" cy="140" r="3" fill="#f59e0b" />
            
            {/* 环保路径 - 紫色 */}
            <path d="M50,90 L150,100 L250,110" stroke="#8b5cf6" strokeWidth="1.5" fill="none" />
            <circle cx="50" cy="90" r="3" fill="#8b5cf6" />
            <circle cx="150" cy="100" r="3" fill="#8b5cf6" />
            <circle cx="250" cy="110" r="3" fill="#8b5cf6" />
          </svg>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between bg-bg-elevated/40 p-2.5 rounded-xl border border-border-default/50">
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-emerald-500 rounded-full" />
            <span className="text-[9px] font-black text-text-muted uppercase tracking-tighter">鲁棒性路径 (Robustness)</span>
          </div>
          <span className="text-[9px] text-emerald-500 font-black uppercase">高稳定性</span>
        </div>
        <div className="flex items-center justify-between bg-bg-elevated/40 p-2.5 rounded-xl border border-border-default/50">
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-blue-500 border-b border-dashed rounded-full" />
            <span className="text-[9px] font-black text-text-muted uppercase tracking-tighter">成本最优 (Cost-Optimized)</span>
          </div>
          <span className="text-[9px] text-blue-500 font-black uppercase">高风险</span>
        </div>
        <div className="flex items-center justify-between bg-bg-elevated/40 p-2.5 rounded-xl border border-border-default/50">
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-amber-500 border-b border-dotted rounded-full" />
            <span className="text-[9px] font-black text-text-muted uppercase tracking-tighter">速度优先 (Speed-Focused)</span>
          </div>
          <span className="text-[9px] text-amber-500 font-black uppercase">中风险</span>
        </div>
        <div className="flex items-center justify-between bg-bg-elevated/40 p-2.5 rounded-xl border border-border-default/50">
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-purple-500 rounded-full" />
            <span className="text-[9px] font-black text-text-muted uppercase tracking-tighter">环保路径 (Eco-Friendly)</span>
          </div>
          <span className="text-[9px] text-purple-500 font-black uppercase">低风险</span>
        </div>
      </div>
    </div>
  );
};

export default SensitivityChart;
