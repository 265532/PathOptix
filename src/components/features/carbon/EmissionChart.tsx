import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useChartTheme } from '@hooks/useChartTheme';

/* ================================================================
 *  按运输模态分类的模拟数据
 * ================================================================ */

interface DataPoint { time: string; emissions: number; target: number; [key: string]: string | number; }

const DATA_ALL: DataPoint[] = [
  { time: '1:00', emissions: 210, target: 250 },
  { time: '2:00', emissions: 235, target: 250 },
  { time: '3:00', emissions: 198, target: 250 },
  { time: '4:00', emissions: 260, target: 250 },
  { time: '5:00', emissions: 285, target: 250 },
  { time: '6:00', emissions: 310, target: 250 },
  { time: '7:00', emissions: 340, target: 250 },
  { time: '8:00', emissions: 380, target: 250 },
  { time: '9:00', emissions: 420, target: 250 }, // peak
  { time: '10:00', emissions: 445, target: 250 }, // peak
  { time: '11:00', emissions: 390, target: 250 },
  { time: '12:00', emissions: 350, target: 250 },
  { time: '13:00', emissions: 320, target: 250 },
  { time: '14:00', emissions: 410, target: 250 }, // peak
  { time: '15:00', emissions: 360, target: 250 },
];

const DATA_OCEAN: DataPoint[] = [
  { time: '1:00', emissions: 95, target: 120 },
  { time: '2:00', emissions: 102, target: 120 },
  { time: '3:00', emissions: 88, target: 120 },
  { time: '4:00', emissions: 115, target: 120 },
  { time: '5:00', emissions: 125, target: 120 },
  { time: '6:00', emissions: 138, target: 120 },
  { time: '7:00', emissions: 145, target: 120 },
  { time: '8:00', emissions: 152, target: 120 },
  { time: '9:00', emissions: 160, target: 120 },
  { time: '10:00', emissions: 148, target: 120 },
  { time: '11:00', emissions: 135, target: 120 },
  { time: '12:00', emissions: 128, target: 120 },
  { time: '13:00', emissions: 118, target: 120 },
  { time: '14:00', emissions: 140, target: 120 },
  { time: '15:00', emissions: 130, target: 120 },
];

const DATA_RAIL: DataPoint[] = [
  { time: '1:00', emissions: 42, target: 55 },
  { time: '2:00', emissions: 48, target: 55 },
  { time: '3:00', emissions: 38, target: 55 },
  { time: '4:00', emissions: 52, target: 55 },
  { time: '5:00', emissions: 58, target: 55 },
  { time: '6:00', emissions: 65, target: 55 },
  { time: '7:00', emissions: 72, target: 55 },
  { time: '8:00', emissions: 78, target: 55 },
  { time: '9:00', emissions: 82, target: 55 },
  { time: '10:00', emissions: 75, target: 55 },
  { time: '11:00', emissions: 68, target: 55 },
  { time: '12:00', emissions: 60, target: 55 },
  { time: '13:00', emissions: 55, target: 55 },
  { time: '14:00', emissions: 70, target: 55 },
  { time: '15:00', emissions: 62, target: 55 },
];

const DATA_AIR: DataPoint[] = [
  { time: '1:00', emissions: 320, target: 300 },
  { time: '2:00', emissions: 345, target: 300 },
  { time: '3:00', emissions: 290, target: 300 },
  { time: '4:00', emissions: 365, target: 300 },
  { time: '5:00', emissions: 390, target: 300 },
  { time: '6:00', emissions: 415, target: 300 }, // peak
  { time: '7:00', emissions: 450, target: 300 }, // peak
  { time: '8:00', emissions: 480, target: 300 }, // peak
  { time: '9:00', emissions: 510, target: 300 }, // peak
  { time: '10:00', emissions: 460, target: 300 }, // peak
  { time: '11:00', emissions: 420, target: 300 }, // peak
  { time: '12:00', emissions: 380, target: 300 },
  { time: '13:00', emissions: 350, target: 300 },
  { time: '14:00', emissions: 440, target: 300 }, // peak
  { time: '15:00', emissions: 395, target: 300 },
];

const MODE_DATA: Record<string, { data: DataPoint[]; label: string; color: string }> = {
  ALL:   { data: DATA_ALL,   label: '全部模态',   color: '#10b981' },
  Ocean: { data: DATA_OCEAN, label: '海运大本营',  color: '#14b8a6' },
  Rail:  { data: DATA_RAIL,  label: '铁路多式联运', color: '#f59e0b' },
  Air:   { data: DATA_AIR,   label: '航空货运',   color: '#f97316' },
};

/* ================================================================
 *  AI 诊断 Tooltip
 * ================================================================ */

const PEAK_DIAGNOSIS: Record<string, string> = {
  '9:00':  '🚨 激增归因：部分欧洲航线因拥堵切换为空运',
  '10:00': '🚨 激增归因：跨太平洋运力临时调配至亚欧干线',
  '14:00': '🚨 激增归因：晚高峰叠加新加坡港拥堵外溢',
  '7:00':  '🚨 激增归因：早班航空货运集中出港',
  '8:00':  '🚨 激增归因：空运仓位利用率超 95% 触发峰值',
  '6:00':  '🚨 激增归因：晨间铁路班列集中发运',
};

interface TooltipPayload {
  value: number;
  dataKey: string;
  payload: DataPoint;
}

const AiTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) => {
  if (!active || !payload?.length) return null;

  const val = payload[0]?.value ?? 0;
  const isPeak = val > 400;
  const diagnosis = label ? PEAK_DIAGNOSIS[label] : undefined;

  return (
    <div className="bg-bg-elevated/95 backdrop-blur-md border border-border-default rounded-xl p-4 shadow-2xl max-w-[260px]">
      <div className="text-[10px] text-text-muted font-bold mb-1">{label}</div>
      <div className="flex items-baseline gap-1.5">
        <span className={`text-lg font-black ${isPeak ? 'text-red-400' : 'text-emerald-400'}`}>
          {val.toFixed(0)}
        </span>
        <span className="text-[10px] text-text-muted font-bold">kgCO2e/h</span>
      </div>

      {isPeak && diagnosis && (
        <div className="mt-2 pt-2 border-t border-border-default">
          <div className="text-red-400 text-[10px] font-bold leading-relaxed">
            {diagnosis}
          </div>
        </div>
      )}

      {!isPeak && (
        <div className="mt-1 text-[9px] text-text-muted font-bold">正常波动区间</div>
      )}
    </div>
  );
};

/* ================================================================
 *  组件
 * ================================================================ */

interface EmissionChartProps {
  activeMode?: string;
  hasOptimized?: boolean;
}

const EmissionChart: React.FC<EmissionChartProps> = ({ activeMode = 'ALL', hasOptimized }) => {
  const baseConfig = MODE_DATA[activeMode] || MODE_DATA.ALL;
  const chartTheme = useChartTheme();

  // 极绿模式：数据乘以 0.6，颜色切换为健康绿
  const modeConfig = hasOptimized
    ? {
        ...baseConfig,
        data: baseConfig.data.map(d => ({
          ...d,
          emissions: Math.round(d.emissions * 0.6),
          target: Math.round(d.target * 0.6),
        })),
        color: '#10b981',
      }
    : baseConfig;

  const currentEmissions = modeConfig.data[modeConfig.data.length - 1]?.emissions ?? 0;

  return (
    <div className="bg-bg-tertiary rounded-3xl p-4 md:p-8 border border-border-default h-full flex flex-col shadow-2xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 md:mb-10">
        <div>
          <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">
            碳排放实时趋势 (kg/h)
            {activeMode !== 'ALL' && (
              <span className="ml-3 text-[10px] text-amber-400 font-bold normal-case tracking-normal bg-amber-500/10 px-2 py-0.5 rounded-full">
                当前视角：{modeConfig.label}
              </span>
            )}
          </h3>
          <p className="text-[10px] text-text-muted font-bold mt-1">
            {hasOptimized ? '极绿模式已激活 · PPO 多目标优化后的碳排轨迹' : '基于 PPO 算法优化的全球动态路由碳足迹换算'}
          </p>
        </div>
        <div className="flex gap-2">
           <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
             <span className="text-[10px] font-bold text-emerald-400">当前排量: {currentEmissions.toFixed(0)}kg</span>
           </div>
        </div>
      </div>

      <div className="flex-1 min-h-[200px] md:min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={modeConfig.data}>
            <defs>
              <linearGradient id="colorEm" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={modeConfig.color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={modeConfig.color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} vertical={false} />
            <XAxis dataKey="time" stroke={chartTheme.axisStroke} tickLine={false} axisLine={false} tick={{ fill: chartTheme.axisTextColor, fontSize: 10 }} />
            <YAxis stroke={chartTheme.axisStroke} tickLine={false} axisLine={false} tick={{ fill: chartTheme.axisTextColor, fontSize: 10 }} />
            <Tooltip content={<AiTooltip />} />
            <Area
              type="monotone"
              dataKey="emissions"
              stroke={modeConfig.color}
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorEm)"
              animationDuration={800}
            />
            <Area
              type="stepAfter"
              dataKey="target"
              stroke="#ef4444"
              strokeWidth={1}
              strokeDasharray="5 5"
              fill="none"
              animationDuration={0}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EmissionChart;
