
import React, { useState } from 'react';
import { Leaf, Wind, Battery, Activity } from 'lucide-react';
import CarbonMetrics from './CarbonMetrics';
import EmissionChart from './EmissionChart';
import EnergySourcePanel from './EnergySourcePanel';
import SustainabilityScore from './SustainabilityScore';
import ESGReportView from './ESGReportView';

interface CarbonMonitoringViewProps {
  onViewChange?: (view: string) => void;
}

const CarbonMonitoringView: React.FC<CarbonMonitoringViewProps> = ({ onViewChange }) => {
  const [isESGReportOpen, setIsESGReportOpen] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [hasOptimized, setHasOptimized] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [activeMode, setActiveMode] = useState('ALL');
  const [metricsData, setMetricsData] = useState({
    carbon: {
      value: 2.42,
      trend: -12
    },
    energy: {
      value: 12840,
      trend: 5.4
    },
    offset: {
      value: 65.2,
      trend: 18
    },
    pue: {
      value: 1.21,
      trend: -0.02
    }
  });

  // 处理 PPO 极绿调度
  const handleOptimizeEnergy = () => {
    if (isOptimizing || hasOptimized) return;
    setIsOptimizing(true);

    // 模拟优化过程：数据实时抖动
    let step = 0;
    const totalSteps = 15;
    const interval = setInterval(() => {
      step++;
      setMetricsData(prev => ({
        carbon: {
          value: Math.max(0.6, Math.min(3.0, prev.carbon.value + (Math.random() - 0.7) * 0.1)),
          trend: Math.max(-30, Math.min(-5, prev.carbon.trend + (Math.random() - 0.5) * 1))
        },
        energy: {
          value: Math.max(7000, Math.min(14000, prev.energy.value + (Math.random() - 0.6) * 200)),
          trend: Math.max(-10, Math.min(10, prev.energy.trend + (Math.random() - 0.5) * 0.5))
        },
        offset: {
          value: Math.max(50, Math.min(90, prev.offset.value + (Math.random() - 0.3) * 0.8)),
          trend: Math.max(10, Math.min(35, prev.offset.trend + (Math.random() - 0.5) * 1))
        },
        pue: {
          value: Math.max(50, Math.min(90, prev.pue.value + (Math.random() - 0.4) * 3)),
          trend: Math.max(1, Math.min(15, prev.pue.trend + (Math.random() - 0.3) * 1))
        }
      }));
      if (step >= totalSteps) {
        clearInterval(interval);
        setIsOptimizing(false);
        setHasOptimized(true);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 5000);
      }
    }, 100);
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-700 max-w-[1800px] mx-auto w-full">
      {/* 顶部标题与快速动作 */}
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
              <Leaf size={28} fill="currentColor" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-text-primary tracking-tight">碳排放监控中心</h2>
              <p className="text-text-muted text-xs font-bold uppercase tracking-[0.2em] mt-1">
                GLOBAL SUPPLY CHAIN ESG &amp; CARBON FOOTPRINT TRACKER
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsESGReportOpen(true)}
            className="px-6 py-3 bg-bg-tertiary border border-border-default rounded-xl text-xs font-bold text-text-muted hover:text-emerald-400 transition-all duration-300 flex items-center gap-2 group"
          >
            <Wind size={14} className="group-hover:rotate-45 transition-transform" /> 生成ESG报告
          </button>
          <button
            onClick={handleOptimizeEnergy}
            disabled={isOptimizing || hasOptimized}
            className={`px-6 py-3 rounded-xl text-xs font-black shadow-lg flex items-center gap-2 transition-all ${
              hasOptimized
                ? 'bg-emerald-900 text-emerald-300 border-2 border-emerald-500/50 shadow-emerald-500/30 cursor-default'
                : isOptimizing
                  ? 'bg-bg-tertiary text-text-primary cursor-wait'
                  : 'bg-emerald-600 text-white shadow-emerald-600/20 hover:scale-105 hover:shadow-emerald-500/40'
            }`}
          >
            {isOptimizing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Agent 重新规划中...
              </>
            ) : hasOptimized ? (
              '✅ 极绿模式已激活'
            ) : (
              '⚡ 启动 PPO 极绿调度'
            )}
          </button>
        </div>
      </div>

      {/* 核心指标卡片 */}
      <CarbonMetrics metricsData={metricsData} hasOptimized={hasOptimized} />

      {/* 中间核心分析区 */}
      <div className="grid grid-cols-12 gap-8">
        {/* 趋势图 */}
        <div className="col-span-12 lg:col-span-8 min-h-0">
          <EmissionChart activeMode={activeMode} hasOptimized={hasOptimized} />
        </div>

        {/* 绿色评分与能源分布 */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-8 min-h-0">
          <SustainabilityScore hasOptimized={hasOptimized} />
          <EnergySourcePanel activeMode={activeMode} onModeChange={setActiveMode} hasOptimized={hasOptimized} />
        </div>
      </div>

      {/* 底部详细列表 */}
      <div className="bg-bg-tertiary rounded-3xl p-6 border border-border-default">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-emerald-400" />
            <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">节点能耗排行</h3>
          </div>
          <span className="text-[10px] text-text-muted font-bold uppercase">实时同步：120ms</span>
        </div>
        
        <div className="space-y-4">
          {[
            { node: "Shanghai-IDC-01", usage: "42.8 kW", co2: "12.4kg/h", type: "电网" },
            { node: "Nanjing-Edge-04", usage: "15.2 kW", co2: "0.2kg/h", type: "风能" },
            { node: "Global-Hub-Alpha", usage: "124.5 kW", co2: "45.1kg/h", type: "混合" }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-bg-modal rounded-2xl border border-border-default hover:border-emerald-500/30 transition-all duration-300 group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-bg-elevated flex items-center justify-center text-text-muted group-hover:text-emerald-400 transition-colors duration-300">
                  <Battery size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold text-text-primary">{item.node}</div>
                  <div className="text-[10px] text-text-muted font-medium">能源模式: {item.type}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-black text-text-primary">{item.usage}</div>
                <div className="text-[10px] text-emerald-500 font-bold">{item.co2} 排量</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ESG 报告弹窗组件 */}
      <ESGReportView
        isOpen={isESGReportOpen}
        onClose={() => setIsESGReportOpen(false)}
      />

      {/* 全局 Toast 提示 */}
      {showToast && (
        <div className="fixed top-6 right-6 z-[9999] animate-[toastSlideIn_0.4s_ease-out]">
          <div className="bg-slate-900/95 backdrop-blur-md border border-emerald-500/30 rounded-2xl p-5 shadow-2xl shadow-emerald-900/40 max-w-[420px]">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-emerald-400 text-sm font-black">AI</span>
              </div>
              <div>
                <div className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-1">PPO 极绿调度 · 优化完成</div>
                <p className="text-[11px] text-text-secondary font-bold leading-relaxed">
                  已拦截 <span className="text-red-400 font-black">23</span> 笔高碳排航空订单，智能切换为铁路联运，碳足迹预计下降 <span className="text-emerald-400 font-black">30%</span>。
                </p>
              </div>
              <button onClick={() => setShowToast(false)} className="text-text-muted hover:text-text-secondary transition-colors duration-300 shrink-0">
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateX(40px) translateY(-10px); }
          to { opacity: 1; transform: translateX(0) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default CarbonMonitoringView;
