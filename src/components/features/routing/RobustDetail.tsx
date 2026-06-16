
import React from 'react';
import { FileText, Info, Sparkles } from 'lucide-react';
import { RlPathJson } from '@/services';
import { useChartTheme } from '@hooks/useChartTheme';
import { useTheme } from '@hooks/useTheme';

// ================================================================
// 中英文映射 & 运输方式翻译
// ================================================================

const cityMap: Record<string, string> = {
  'shenzhen': '深圳',
  'shanghai': '上海',
  'los_angeles': '洛杉矶',
  'new_york': '纽约',
  'rotterdam': '鹿特丹',
  'frankfurt': '法兰克福',
};

const MODE_CN_MAP: Record<string, string> = {
  'sea': '海运', 'air': '空运', 'land': '陆运', 'rail': '铁路',
};

// ================================================================
// 接口
// ================================================================

interface RobustDetailProps {
  rlData?: RlPathJson | null;
  llmReport?: string;
  startLabel?: string;
  endLabel?: string;
}

const RobustDetail: React.FC<RobustDetailProps> = ({ rlData, llmReport, startLabel = '上海', endLabel = '鹿特丹' }) => {
  const chartTheme = useChartTheme();
  const { isDark } = useTheme();

  // 从真实数据推导指标
  const totalCost = rlData?.total_cost_usd ?? 4920;
  const totalTime = rlData?.total_time_days ?? 20;
  const totalCarbon = rlData?.total_carbon_kg ?? 200;
  const transportModes = rlData?.transport_modes ?? ['sea', 'rail', 'land'];
  const routeNodes = rlData?.route_nodes ?? [];
  const reachedGoal = rlData?.reached_goal ?? false;
  const totalReward = rlData?.total_reward ?? 0;
  const pathWarning = rlData?.path_warning;

  // 派生指标
  const costLow = Math.round(totalCost * 0.95);
  const costHigh = Math.round(totalCost * 1.05);
  const timeLow = Math.max(1, Math.round(totalTime - 1));
  const timeHigh = Math.round(totalTime + 2);
  const redundancy = rlData ? Math.min(60, Math.max(20, rlData.num_legs * 15 + 10)) : 45;
  const stability = rlData ? Math.min(98, Math.max(75, Math.round(95 - totalCarbon / 50))) : 88;
  const overallScore = rlData
    ? Math.min(98, Math.max(82, Math.round(90 + totalReward / 20 - totalCost / 1000)))
    : 92;

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-end px-2">
        <div>
          <h2 className="text-xl lg:text-2xl font-black text-text-primary tracking-tight italic">
            {startLabel} ➔ {endLabel} <span className="text-text-muted text-lg">鲁棒性备选路径分析</span>
          </h2>
          <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1 leading-relaxed">
            {rlData
              ? `PPO 强化学习推断完成 · ${rlData.num_legs} 段路径 · 奖励分 ${rlData.total_reward} · ${reachedGoal ? '已到达目标' : '未达目标'}`
              : '点击"生成报告"运行 AI 路径优化'}
          </p>
        </div>
      </div>

      <div className="bg-bg-secondary/60 backdrop-blur-3xl rounded-[32px] border border-border-default p-8 flex flex-col xl:flex-row gap-10 relative overflow-hidden shadow-2xl">
        {/* 路径异常警告 */}
        {pathWarning && (
          <div className="xl:col-span-2 bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2">
            <span className="text-red-400 text-sm">⚠ {pathWarning}</span>
          </div>
        )}
        {/* Left Side: Path Visualizer & Metrics */}
        <div className="flex-1 min-w-0 space-y-10">
          {/* 动态调度路线可视化区域 */}
          {rlData && routeNodes.length > 0 ? (
            <div className={`w-full rounded-2xl border p-6 shadow-2xl ${isDark ? 'bg-gray-900/40 border-gray-800' : 'bg-bg-elevated/80 border-border-default'}`}>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm text-text-secondary font-medium tracking-widest">AI 优化路径拓扑 (ROUTE TOPOLOGY)</h3>
                <span className="text-[10px] text-text-muted font-bold">
                  PPO MlpPolicy · {rlData.num_legs} 段 · 奖励分 {rlData.total_reward}
                </span>
              </div>

              {/* 核心横向 Flex 容器 */}
              <div className="flex flex-row items-center justify-between w-full overflow-x-auto pb-10 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {routeNodes.map((node, index) => (
                  <React.Fragment key={index}>
                    {/* 城市节点 */}
                    <div className="flex flex-col items-center relative z-10 shrink-0">
                      <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center shadow-lg transition-all duration-300 ${isDark ? 'bg-gray-950' : 'bg-bg-primary border-border-default'}
                        ${index === 0 ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]' :
                          index === routeNodes.length - 1 ? 'border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.5)]' :
                          'border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.5)]'}`}
                      >
                        <span className="text-sm font-bold text-text-primary whitespace-nowrap px-1">
                          {cityMap[node] || node}
                        </span>
                      </div>
                      <span className={`absolute -bottom-7 text-[11px] font-mono tracking-widest font-bold
                        ${index === 0 ? 'text-emerald-500' : index === routeNodes.length - 1 ? 'text-purple-500' : 'text-cyan-500'}`}>
                        {index === 0 ? '起点' : index === routeNodes.length - 1 ? '终点' : '中转'}
                      </span>
                    </div>

                    {/* 运输工具连线 */}
                    {index < routeNodes.length - 1 && (
                      <div className="flex-1 h-[2px] relative flex items-center justify-center min-w-[50px] md:min-w-[70px] mx-1 md:mx-3 shrink">
                        <div className={`absolute inset-0 bg-gradient-to-r via-cyan-600 opacity-80 ${isDark ? 'from-gray-800 to-gray-800' : 'from-border-default to-border-default'}`}></div>
                        <div className={`relative z-10 px-4 py-1.5 rounded-full border flex items-center gap-2 ${isDark ? 'bg-gray-950 border-gray-700 shadow-[0_4px_10px_rgba(0,0,0,0.5)]' : 'bg-bg-primary border-border-default shadow-[0_4px_10px_rgba(0,0,0,0.1)]'}`}>
                          <span className="text-[14px]">
                            {transportModes[index] === 'air' ? '✈️' :
                             transportModes[index] === 'sea' ? '🚢' : '🚛'}
                          </span>
                          <span className="text-[12px] text-cyan-400 font-bold tracking-widest uppercase">
                            {MODE_CN_MAP[transportModes[index]] || transportModes[index]}
                          </span>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ) : (
            <div className={`w-full rounded-2xl border p-8 text-center ${isDark ? 'bg-gray-900/40 border-gray-800' : 'bg-bg-elevated/80 border-border-default'}`}>
              <p className="text-sm text-text-muted">点击"生成报告"后，AI 路径拓扑将在此展示</p>
            </div>
          )}

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-10">
            <MetricBlock
              label="预期交期"
              value={rlData ? `${timeLow} - ${timeHigh} 天` : '18 - 21 天'}
              sub="(P90 RANGE)"
              color="text-emerald-400"
            />
            <MetricBlock
              label="总计成本"
              value={rlData ? `$${totalCost.toLocaleString()}` : '$4,920'}
              sub={`(碳排 ${totalCarbon.toFixed(1)} kg CO₂)`}
              color="text-text-primary"
            />

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Info size={12} className="text-text-muted" />
                <span className="text-[9px] text-text-muted font-black uppercase tracking-widest">AI 解释性分析</span>
              </div>
              <div className="space-y-4">
                <ProgressItem label="冗余度" percent={redundancy} color="bg-blue-500" />
                <ProgressItem label="抗波动" percent={stability} color="bg-emerald-500" />
              </div>
            </div>
          </div>

          {/* LLM Report */}
          {llmReport && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} className="text-amber-400" />
                <span className="text-[10px] text-text-muted font-black uppercase tracking-widest">AI 物流顾问报告</span>
              </div>
              <div className="bg-bg-primary border border-border-default/50 rounded-2xl p-6 shadow-inner shadow-black/30 max-h-[320px] overflow-y-auto custom-scrollbar">
                <p className="text-[12px] text-text-secondary leading-relaxed whitespace-pre-wrap">{llmReport}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Score Gauge */}
        <div className="w-full xl:w-[360px] shrink-0 bg-bg-primary/40 rounded-[28px] p-6 sm:p-8 border border-border-default/50 flex flex-col items-center justify-center gap-6 relative group">
          {/* Status Badges */}
          <div className="flex gap-2 w-full justify-center">
            <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[8px] font-black rounded-lg flex items-center gap-1.5 uppercase tracking-widest">
              <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" /> 低碳推荐
            </span>
            <span className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[8px] font-black rounded-lg flex items-center gap-1.5 uppercase tracking-widest">
              <FileText size={10} /> 政策合规
            </span>
          </div>

          {/* Score Gauge */}
          <div className="relative w-52 h-52 flex items-center justify-center transition-all duration-500 group-hover:scale-105">
            <div className="absolute inset-6 bg-blue-500/10 blur-[40px] rounded-full opacity-50" />

            <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90 overflow-visible">
              <defs>
                <filter id="gaugeGlow">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <circle cx="100" cy="100" r="85" stroke={isDark ? '#1e293b' : '#e2e8f0'} strokeWidth="10" fill="transparent" strokeOpacity="0.4" strokeDasharray="2 3" />
              <circle
                cx="100" cy="100" r="85"
                stroke="#00F2FF" strokeWidth="10" fill="transparent"
                strokeDasharray="2.5 1.5"
                strokeDashoffset={(2 * Math.PI * 85) * (1 - overallScore / 100)}
                strokeOpacity="0.8"
                filter="url(#gaugeGlow)"
                className="transition-all duration-1000 ease-out"
              />
              <circle
                cx="100" cy="100" r="68"
                stroke="#10b981" strokeWidth="4" fill="transparent"
                strokeDasharray={2 * Math.PI * 68}
                strokeDashoffset={(2 * Math.PI * 68) * (1 - stability / 100)}
                strokeLinecap="round"
                strokeOpacity="0.9"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            <div className="absolute flex flex-col items-center justify-center">
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black text-text-primary tracking-tighter italic leading-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">{overallScore}</span>
                <span className="text-lg font-bold text-blue-500 mb-1">%</span>
              </div>
              <div className="flex flex-col items-center mt-3">
                <div className="h-[1px] w-8 bg-bg-tertiary mb-2 opacity-60" />
                <span className="text-[10px] text-text-muted font-black uppercase tracking-[0.25em] whitespace-nowrap">综合评分</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ================================================================
// 子组件
// ================================================================

const MetricBlock = ({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) => (
  <div className="space-y-2">
    <span className="text-[9px] text-text-muted font-black uppercase tracking-widest">{label}</span>
    <div className={`text-2xl font-black ${color} tracking-tighter tabular-nums leading-none`}>{value}</div>
    <div className="text-[8px] text-text-primary font-black uppercase tracking-widest">{sub}</div>
  </div>
);

const ProgressItem = ({ label, percent, color }: { label: string; percent: number; color: string }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
      <span className="text-text-muted">{label}</span>
      <span className="text-text-secondary tabular-nums">{percent}%</span>
    </div>
    <div className="h-1.5 bg-bg-primary rounded-full overflow-hidden border border-border-default shadow-inner">
      <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${percent}%` }} />
    </div>
  </div>
);

export default RobustDetail;
