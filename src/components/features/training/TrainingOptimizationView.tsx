
import React from 'react';
import ParamConfig from './ParamConfig';
import ModelEval from './ModelEval';
import Monitor from './Monitor';
import Visualizer from './Visualizer';
import HistoryPanel from './HistoryPanel';
import LogPanel from './LogPanel';
import BottomMetrics from './BottomMetrics';

const TrainingOptimizationView: React.FC = () => {
  return (
    <div className="p-6 bg-bg-primary min-h-full flex flex-col gap-6 animate-in fade-in duration-700">
         {/* 底部指标 */}
      <BottomMetrics />
      
      <div className="flex flex-1 gap-6 min-h-0">
        
        {/* 左侧：配置与评估 */}
        <div className="w-64 flex flex-col gap-6 shrink-0">
          <ParamConfig />
          <ModelEval />
        </div>

        {/* 中间：监控与可视化 */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          <Monitor />
          <Visualizer />
        </div>

        {/* 右侧：历史与日志 */}
        <div className="w-80 flex flex-col gap-6 shrink-0">
          <HistoryPanel />
          <LogPanel />
        </div>
      </div>

   
      

    </div>
  );
};

export default TrainingOptimizationView;
