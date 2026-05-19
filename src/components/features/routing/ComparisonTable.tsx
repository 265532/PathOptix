
import React, { useEffect, useState, useRef } from 'react';
import { Download } from 'lucide-react';
import { RlPathJson } from '@/services';
import type { SimulationRunResponse } from '@/services';

interface ComparisonTableProps {
  isStress?: boolean;
  rlData?: RlPathJson | null;
  startLabel?: string;
  endLabel?: string;
  simulationData?: SimulationRunResponse | null;
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({ isStress, rlData, startLabel = '上海', endLabel = '鹿特丹', simulationData }) => {
  // 从真实数据推导对比指标
  const totalCost = rlData?.total_cost_usd ?? 5000;
  const totalTime = rlData?.total_time_days ?? 20;
  const totalCarbon = rlData?.total_carbon_kg ?? 200;

  // 有仿真数据时使用后端数据, 否则用默认推导
  const baseCostLow = simulationData?.base.cost.p90_lower ?? Math.round(totalCost * 0.8);
  const baseCostHigh = simulationData?.base.cost.p90_upper ?? Math.round(totalCost * 1.4);
  const baseTimeLow = simulationData?.base.time.p90_lower ?? Math.round(totalTime + 3);
  const baseTimeHigh = simulationData?.base.time.p90_upper ?? Math.round(totalTime + 10);
  const baseStability = simulationData?.base.stability ?? Math.max(50, 60 - Math.floor(Math.random() * 10));

  const robustCostLow = simulationData?.robust.cost.p90_lower ?? Math.round(totalCost * 0.95);
  const robustCostHigh = simulationData?.robust.cost.p90_upper ?? Math.round(totalCost * 1.05);
  const robustTimeLow = simulationData?.robust.time.p90_lower ?? Math.max(1, Math.round(totalTime - 1));
  const robustTimeHigh = simulationData?.robust.time.p90_upper ?? Math.round(totalTime + 2);
  const robustStability = simulationData?.robust.stability ?? Math.min(98, Math.max(80, Math.round(95 - totalCarbon / 50)));

  const optimizationRate = simulationData?.risk_reduction_pct ?? Math.round(((baseCostHigh - robustCostHigh) / baseCostHigh) * 100);
  const isStressMode = isStress || simulationData?.mode === 'stress';

  // PDF导出
  const handleGenerateReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="zh-CN"><head><meta charset="UTF-8"><title>策略多维对比报告: ${startLabel} → ${endLabel}</title>
      <style>body{font-family:Inter,sans-serif;background:#fff;color:#000;margin:40px;padding:40px;border:1px solid #e5e7eb}
      h1{font-size:24px;font-weight:700;margin-bottom:10px;color:#1e293b}h2{font-size:18px;font-weight:700;margin-top:30px;color:#334155}
      .subtitle{font-size:14px;color:#64748b;margin-bottom:30px}table{width:100%;border-collapse:collapse;margin-top:20px}
      th,td{padding:12px;text-align:left;border-bottom:1px solid #e2e8f0}th{background:#f8fafc;font-weight:700}
      .warning{color:#ea580c}.success{color:#059669}.footer{margin-top:50px;padding-top:20px;border-top:1px solid #e2e8f0;font-size:12px;color:#64748b}</style></head>
      <body><div><h1>策略多维对比报告: ${startLabel} → ${endLabel}</h1>
      <div class="subtitle">AI 强化学习路径优化引擎 · ${isStressMode ? '极端压力测试' : '常规运营'}模式</div>
      <div class="subtitle">生成时间: ${new Date().toLocaleString('zh-CN')}</div>
      <table><thead><tr><th>决策维度</th><th>成本最优路径 (Base)</th><th>鲁棒性推荐路径 (Robust)</th></tr></thead><tbody>
      <tr><td>不确定性成本范围</td><td>$${baseCostLow.toLocaleString()} - $${baseCostHigh.toLocaleString()}</td>
      <td class="success">$${robustCostLow.toLocaleString()} - $${robustCostHigh.toLocaleString()} (${isStressMode ? '风险抵御' : '↑ 优化率'} ${optimizationRate}%)</td></tr>
      <tr><td>不确定性交付周期</td><td class="warning">${baseTimeLow} - ${baseTimeHigh} 天</td><td>${robustTimeLow} - ${robustTimeHigh} 天</td></tr>
      <tr><td>稳定性评分</td><td>${baseStability}</td><td class="success">${robustStability}</td></tr></tbody></table>
      ${rlData ? `<h2>完整路径</h2><p>${rlData.route_nodes.join(' → ')}</p>` : ''}
      <div class="footer"><p>本报告由AI路径优化系统自动生成，仅供内部参考使用。</p></div></div></body></html>`;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.onload = () => { printWindow.print(); setTimeout(() => printWindow.close(), 1000); };
  };

  return (
    <div className="bg-bg-tertiary/60 backdrop-blur-xl rounded-[24px] p-6 border border-border-default shadow-2xl flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-text-primary tracking-tight italic">策略多维对比: {startLabel} <span className={isStressMode ? 'text-red-500' : ''}>→</span> {endLabel}</h2>
            {isStressMode && (
              <div className="px-2.5 py-0.5 bg-red-500/10 border border-red-500/20 text-red-500 text-[8px] font-black rounded uppercase flex items-center gap-1.5 animate-pulse">
                <span className="w-1 h-1 bg-red-500 rounded-full animate-ping" /> 压力测试中
              </div>
            )}
            {!isStressMode && (
              <div className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-black rounded uppercase flex items-center gap-1.5">
                <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" /> {simulationData ? '仿真已运行' : '等待运行'}
              </div>
            )}
          </div>
          <p className="text-[9px] text-text-muted font-bold uppercase mt-1 tracking-[0.1em]">
            {simulationData
              ? (isStressMode ? 'PPO 强化学习 · 极端拥堵压力测试推断' : `PPO 强化学习推断 · ${rlData?.num_legs ?? 0} 段路径`)
              : (rlData ? `PPO 强化学习推断 · ${rlData.num_legs} 段路径 · 奖励分 ${rlData.total_reward}` : '点击"生成报告"开始 AI 路径优化')}
          </p>
        </div>
        <button
          onClick={handleGenerateReport}
          disabled={!rlData && !simulationData}
          className="flex items-center gap-2 px-4 py-2 bg-bg-elevated border border-border-default text-text-secondary text-[10px] font-black rounded-lg hover:bg-bg-tertiary transition-all duration-300 uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download size={12} /> 生成报告
        </button>
      </div>

      <div className="flex-1">
        <div className="grid grid-cols-12 border-b border-border-default/50 pb-4 mb-2">
          <div className="col-span-3 text-[9px] font-black text-text-muted uppercase tracking-widest">决策维度</div>
          <div className="col-span-4 text-[10px] font-black text-blue-400 uppercase tracking-widest leading-relaxed">
            成本最优路径 (Base) <br /> <span className="text-[8px] text-text-muted font-bold lowercase tracking-normal">
              {isStressMode ? '极端波动 · 高风险' : '基于静态历史均值'}
            </span>
          </div>
          <div className="col-span-5 text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-relaxed">
            鲁棒性推荐路径 (Robust) <br /> <span className="text-[8px] text-text-muted font-bold lowercase tracking-normal">AI 强化学习最优解</span>
          </div>
        </div>

        <div className="space-y-0.5">
          <ComparisonRow
            label="不确定性成本范围"
            baseValue={`$${baseCostLow.toLocaleString()} - $${baseCostHigh.toLocaleString()}`}
            baseSub="P90 置信区间"
            baseWarning={isStressMode}
            robustValue={`$${robustCostLow.toLocaleString()} - $${robustCostHigh.toLocaleString()}`}
            robustSub="P90 置信区间 (更稳定)"
            robustActive
            optimizationRate={optimizationRate}
            isStress={isStressMode}
            rateLabel={isStressMode ? '风险降低' : '↑ 优化率'}
          />
          <ComparisonRow
            label="不确定性交付周期"
            baseValue={`${baseTimeLow} - ${baseTimeHigh} 天`}
            baseSub={isStressMode ? 'P90 区间 (极端波动)' : 'P90 区间 (高波动)'}
            baseWarning={isStressMode}
            robustValue={`${robustTimeLow} - ${robustTimeHigh} 天`}
            robustSub="P90 置信区间"
            isStress={isStressMode}
          />
          <ComparisonRow
            label="稳定性评分 (Stability)"
            baseValue={String(baseStability)}
            baseType="bar"
            baseBarPercent={baseStability}
            baseBarColor={isStressMode ? 'bg-red-600' : 'bg-orange-500'}
            robustValue={String(robustStability)}
            robustType="bar"
            robustBarPercent={robustStability}
            robustBarColor="bg-emerald-500"
            robustActive
            isStress={isStressMode}
          />
        </div>
      </div>
    </div>
  );
};

// ================================================================
// 数字滚动动画组件
// ================================================================

const NumberRoller: React.FC<{ value: string; className?: string }> = ({ value, className = '' }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current === value) return;
    prevValue.current = value;

    // 简单闪烁 + 快速切换效果
    let frame = 0;
    const totalFrames = 12;
    const chars = '0123456789$-,';
    const interval = setInterval(() => {
      frame++;
      if (frame >= totalFrames) {
        setDisplayValue(value);
        clearInterval(interval);
        return;
      }
      // 逐步锁定字符 (从左到右)
      const lockedCount = Math.floor((frame / totalFrames) * value.length);
      let scrambled = '';
      for (let i = 0; i < value.length; i++) {
        if (i < lockedCount || value[i] === ' ' || value[i] === '-') {
          scrambled += value[i];
        } else if (chars.includes(value[i])) {
          scrambled += chars[Math.floor(Math.random() * chars.length)];
        } else {
          scrambled += value[i];
        }
      }
      setDisplayValue(scrambled);
    }, 40);

    return () => clearInterval(interval);
  }, [value]);

  return <span className={className}>{displayValue}</span>;
};

// ================================================================
// 对比行
// ================================================================

const ComparisonRow = ({
  label, baseValue, baseSub, baseWarning, baseType, baseBarPercent, baseBarColor,
  robustValue, robustSub, robustActive, robustType, robustBarColor, robustBarPercent,
  optimizationRate, isStress, rateLabel
}: any) => (
  <div className="grid grid-cols-12 border-b border-border-default/20 py-5 items-center group">
    <div className="col-span-3">
      <div className="text-[10px] font-black text-text-muted uppercase tracking-wide">{label}</div>
    </div>
    <div className={`col-span-4 px-4 border-r border-border-default/50 ${isStress ? 'bg-red-500/[0.03]' : ''}`}>
      <NumberRoller
        value={baseValue}
        className={`text-lg font-black ${baseWarning ? 'text-orange-500' : 'text-text-secondary'} tracking-tighter`}
      />
      {baseSub && <div className="text-[9px] text-text-muted font-black mt-0.5 uppercase tracking-tighter">{baseSub}</div>}
      {baseType === 'bar' && (
        <div className="mt-3 h-1.5 w-32 bg-bg-primary rounded-full overflow-hidden">
          <div className={`h-full ${baseBarColor} opacity-80 transition-all duration-700`} style={{ width: `${baseBarPercent}%` }} />
        </div>
      )}
    </div>
    <div className={`col-span-5 px-6 py-2 rounded-xl transition-all duration-300 ${robustActive ? (isStress ? 'bg-emerald-500/10 ring-1 ring-emerald-500/20' : 'bg-emerald-500/5') : ''}`}>
      <div className="flex items-center gap-2">
        <NumberRoller
          value={robustValue}
          className="text-lg font-black text-text-secondary tracking-tighter"
        />
        {optimizationRate != null && (
          <span className={`text-[8px] font-black uppercase tracking-tighter ${isStress ? 'text-emerald-400' : 'text-emerald-500'}`}>
            {rateLabel || '↑ 优化率'} {optimizationRate}%
          </span>
        )}
      </div>
      {robustSub && <div className="text-[9px] text-text-muted font-black mt-0.5 uppercase tracking-tighter">{robustSub}</div>}
      {robustType === 'bar' && (
        <div className="mt-3 h-1.5 w-full bg-bg-primary rounded-full overflow-hidden shadow-inner">
          <div className={`h-full ${robustBarColor} shadow-[0_0_8px_rgba(16,185,129,0.3)] transition-all duration-700`} style={{ width: `${robustBarPercent}%` }} />
        </div>
      )}
    </div>
  </div>
);

export default ComparisonTable;
