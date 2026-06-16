
import React, { useState } from 'react';
import { RefreshCw, MapPin, ChevronDown, Sliders, ChevronUp } from 'lucide-react';
import NormalView from './Scenarios/NormalScenario/NormalView';
import StressView from './Scenarios/StressScenario/StressView';
import { optimizeApi, RlPathJson } from '@/services';

// ================================================================
// 城市配置
// ================================================================

const CITIES = [
  { id: 'shenzhen', label: '深圳', en: 'Shenzhen' },
  { id: 'shanghai', label: '上海', en: 'Shanghai' },
  { id: 'new_york', label: '纽约', en: 'New York' },
  { id: 'los_angeles', label: '洛杉矶', en: 'Los Angeles' },
  { id: 'rotterdam', label: '鹿特丹', en: 'Rotterdam' },
  { id: 'frankfurt', label: '法兰克福', en: 'Frankfurt' },
];

// ================================================================
// 组件
// ================================================================

const RouteOptimizationView: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState('normal');
  const [startNode, setStartNode] = useState('shenzhen');
  const [endNode, setEndNode] = useState('rotterdam');
  const [weights, setWeights] = useState({
    cost: 40,
    time: 25,
    carbon: 35,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [rlData, setRlData] = useState<RlPathJson | null>(null);
  const [llmReport, setLlmReport] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isWeightsOpen, setIsWeightsOpen] = useState(false);

  const handleWeightChange = (key: keyof typeof weights, val: number) => {
    setWeights(prev => ({ ...prev, [key]: val }));
  };

  const handleReset = () => {
    setWeights({ cost: 40, time: 25, carbon: 35 });
  };

  const handleOptimize = async () => {
    setIsLoading(true);
    const total = weights.cost + weights.time + weights.carbon;
    try {
      const res = await optimizeApi.optimizeRoute({
        start_node: startNode,
        end_node: endNode,
        weight_cost: parseFloat((weights.cost / total).toFixed(2)),
        weight_time: parseFloat((weights.time / total).toFixed(2)),
        weight_carbon: parseFloat((weights.carbon / total).toFixed(2)),
      });
      setRlData(res.data.rl_path_json);
      setLlmReport(res.data.explanation_report);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('路径优化请求失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getCityLabel = (id: string) =>
    CITIES.find(c => c.id === id)?.label || id;

  const renderActiveScenario = () => {
    switch (activeScenario) {
      case 'normal':
        return <NormalView rlData={rlData} llmReport={llmReport} startLabel={getCityLabel(startNode)} endLabel={getCityLabel(endNode)} />;
      case 'stress':
        return <StressView rlData={rlData} startLabel={getCityLabel(startNode)} endLabel={getCityLabel(endNode)} />;
      default:
        return <NormalView rlData={rlData} llmReport={llmReport} startLabel={getCityLabel(startNode)} endLabel={getCityLabel(endNode)} />;
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 lg:space-y-8 bg-bg-primary min-h-full font-inter animate-in fade-in duration-700">
      {/* Top Header & Weights Panel */}
      <div className="flex flex-col lg:flex-row gap-4 md:gap-6 lg:gap-8 justify-between items-start">
        <div className="space-y-6">
          <div className="flex items-center gap-6">
            <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.25em] italic">仿真运行场景 (CURRENT SIMULATION)</h3>
            <div className="flex items-center gap-2 px-3 py-1 bg-bg-elevated/50 border border-border-default rounded-lg text-[10px] text-text-muted font-bold uppercase tracking-widest">
              <RefreshCw size={12} className="text-text-muted" />
              {lastUpdated
                ? `更新于: ${Math.max(0, Math.floor((Date.now() - lastUpdated.getTime()) / 60000))} 分钟前`
                : '尚未运行'}
            </div>
          </div>

          {/* City Selectors */}
          <div className="flex flex-wrap items-end gap-4">
            <CitySelector value={startNode} onChange={setStartNode} label="起点" />
            <div className="flex items-center gap-2 text-text-muted h-10">
              <span className="w-8 h-[1px] bg-gradient-to-r from-blue-500 to-transparent" />
              <MapPin size={14} className="text-blue-500" />
              <span className="w-8 h-[1px] bg-gradient-to-l from-emerald-500 to-transparent" />
            </div>
            <CitySelector value={endNode} onChange={setEndNode} label="终点" />
            <button
              onClick={handleOptimize}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black rounded-xl shadow-lg shadow-blue-500/20 transition-all duration-300 uppercase tracking-[0.15em] transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" /> 优化中...
                </>
              ) : (
                <>
                  <RefreshCw size={14} /> 生成报告
                </>
              )}
            </button>
          </div>

          {/* Scenario Tabs */}
          <div className="flex flex-wrap p-1 bg-bg-secondary border border-border-default rounded-2xl w-fit">
            <button
              onClick={() => setActiveScenario('normal')}
              className={`px-4 sm:px-8 py-3 rounded-xl text-xs font-black transition-all duration-300 ${activeScenario === 'normal' ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'text-text-muted hover:text-text-secondary'}`}
            >
              常规运营基准
            </button>
            <button
              onClick={() => setActiveScenario('stress')}
              className={`px-4 sm:px-8 py-3 rounded-xl text-xs font-black transition-all duration-300 flex items-center gap-2 ${activeScenario === 'stress' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-text-muted hover:text-text-secondary'}`}
            >
              {activeScenario === 'stress' && <span className="w-1.5 h-1.5 bg-bg-secondary rounded-full animate-ping" />}
              极端拥堵压力测试
            </button>
          </div>
        </div>

        {/* Weights Panel - Mobile: collapsible drawer, Desktop: always visible */}
        <div className="w-full lg:w-auto">
          {/* Mobile toggle button */}
          <button
            onClick={() => setIsWeightsOpen(!isWeightsOpen)}
            className="lg:hidden w-full flex items-center justify-between bg-bg-tertiary/80 backdrop-blur-xl border border-border-default rounded-2xl px-5 py-3 text-xs font-black text-text-primary uppercase tracking-widest"
          >
            <div className="flex items-center gap-2">
              <Sliders size={14} className="text-blue-500" />
              决策偏好权重
            </div>
            {isWeightsOpen ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
          </button>
          <div className={`${isWeightsOpen ? 'block' : 'hidden'} lg:block mt-3 lg:mt-0 bg-bg-tertiary/80 backdrop-blur-xl border border-border-default rounded-3xl p-6 lg:min-w-[420px] shadow-2xl`}>
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xs font-black text-text-primary uppercase tracking-[0.2em]">决策偏好权重</h4>
              <button
                onClick={handleReset}
                className="text-[10px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-widest"
              >
                重置
              </button>
            </div>
            <div className="grid grid-cols-2 gap-x-6 sm:gap-x-12 gap-y-6">
              <WeightSlider label="成本" value={weights.cost} onChange={(v) => handleWeightChange('cost', v)} color="blue" />
              <WeightSlider label="时效" value={weights.time} onChange={(v) => handleWeightChange('time', v)} color="blue" />
              <WeightSlider label="碳排" value={weights.carbon} onChange={(v) => handleWeightChange('carbon', v)} color="blue" />
              <div className="flex items-center gap-3 px-2">
                <span className="text-[9px] text-text-muted font-black uppercase tracking-widest">归一化</span>
                <span className="text-[10px] text-text-muted font-mono tabular-nums">
                  {(weights.cost / (weights.cost + weights.time + weights.carbon)).toFixed(2)} /{' '}
                  {(weights.time / (weights.cost + weights.time + weights.carbon)).toFixed(2)} /{' '}
                  {(weights.carbon / (weights.cost + weights.time + weights.carbon)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="transition-all duration-500">
        {renderActiveScenario()}
      </div>
    </div>
  );
};

// ================================================================
// 城市选择器
// ================================================================

const CitySelector = ({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) => (
  <div className="relative group">
    <div className="text-[8px] text-text-muted font-black uppercase tracking-widest mb-1.5">{label}</div>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-bg-secondary border border-border-default rounded-xl px-4 py-2.5 pr-8 text-sm font-black text-text-primary cursor-pointer hover:border-blue-500/40 focus:border-blue-500 focus:outline-none transition-all duration-300 min-w-[140px]"
      >
        {CITIES.map(c => (
          <option key={c.id} value={c.id}>{c.label} ({c.en})</option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
    </div>
  </div>
);

// ================================================================
// 权重滑块
// ================================================================

const WeightSlider = ({ label, value, onChange, color = 'blue' }: { label: string, value: number, onChange: (val: number) => void, color?: string }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseInt(e.target.value, 10));
  };

  return (
    <div className="space-y-3 group/slider">
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
        <span className="text-text-muted">[{label}]</span>
        <span className="text-text-secondary transition-colors duration-300 group-hover/slider:text-blue-400">{value}%</span>
      </div>
      <div className="h-1.5 bg-bg-elevated rounded-full relative flex items-center">
        <div className={`absolute h-full bg-${color}-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-all duration-150`} style={{ width: `${value}%` }} />
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div
          className={`absolute w-3.5 h-3.5 bg-bg-secondary border-2 border-${color}-500 rounded-full shadow-lg pointer-events-none transition-all duration-150`}
          style={{ left: `${value}%`, transform: 'translateX(-50%)' }}
        />
      </div>
    </div>
  );
};

export default RouteOptimizationView;
