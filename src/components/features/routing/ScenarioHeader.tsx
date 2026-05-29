﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿
import React from 'react';
import { RefreshCw } from 'lucide-react';

const ScenarioHeader: React.FC = () => {
  return (
    <div className="flex flex-col lg:flex-row gap-8 justify-between">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest italic">仿真运行场景 (CURRENT SIMULATION)</h3>
          <div className="px-3 py-1 bg-bg-secondary border border-border-default rounded-lg flex items-center gap-2 text-[10px] text-text-muted">
            <RefreshCw size={12} className="text-text-muted" /> 更新于: 12 分钟前
          </div>
        </div>
        
        <div className="flex gap-2 p-1 bg-bg-tertiary border border-border-default rounded-xl w-fit">
          <button className="px-6 py-2.5 bg-blue-600 text-white text-xs font-black rounded-lg shadow-lg shadow-blue-500/20">常规运营基准</button>
          <button className="px-6 py-2.5 text-text-muted text-xs font-bold hover:text-text-secondary">极端拥堵压力测试</button>
          <button className="px-6 py-2.5 text-text-muted text-xs font-bold hover:text-text-secondary">政策剧烈波动</button>
        </div>
      </div>

      <div className="bg-bg-tertiary border border-border-default rounded-2xl p-6 min-w-[400px]">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-xs font-bold text-text-muted uppercase tracking-widest">决策偏好权重</h4>
          <button className="text-[10px] font-bold text-blue-500 hover:underline uppercase">重置</button>
        </div>
        <div className="grid grid-cols-2 gap-x-10 gap-y-6">
          <WeightSlider label="成本" value={40} />
          <WeightSlider label="时效" value={25} />
          <WeightSlider label="稳定" value={30} />
          <WeightSlider label="碳排" value={5} />
        </div>
      </div>
    </div>
  );
};

const WeightSlider = ({ label, value }: { label: string, value: number }) => (
  <div className="space-y-3">
    <div className="flex justify-between text-[10px] font-bold uppercase">
      <span className="text-text-muted">[{label}]</span>
      <span className="text-text-primary">{value}%</span>
    </div>
    <div className="h-1 bg-bg-tertiary rounded-full relative">
      <div className="absolute h-full bg-blue-500 rounded-full" style={{ width: `${value}%` }} />
      <div className="absolute w-2.5 h-2.5 bg-bg-secondary rounded-full -top-0.5 border-2 border-blue-500" style={{ left: `${value}%`, transform: 'translateX(-50%)' }} />
    </div>
  </div>
);

export default ScenarioHeader;
