import React from 'react';
import { useChartTheme } from '@hooks/useChartTheme';

interface PatencyScoreProps {
  score: number;
}

const PatencyScore: React.FC<PatencyScoreProps> = ({ score }) => {
  const chartTheme = useChartTheme();
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getScoreColor = (s: number) => {
    if (s < 40) return { stroke: '#ef4444', text: 'text-red-400', label: 'CRITICAL' };
    if (s < 60) return { stroke: '#f59e0b', text: 'text-amber-400', label: 'WARNING' };
    if (s < 80) return { stroke: '#3b82f6', text: 'text-blue-400', label: 'MODERATE' };
    return { stroke: '#10b981', text: 'text-emerald-400', label: 'STABLE' };
  };

  const cfg = getScoreColor(score);

  return (
    <div className="h-full bg-bg-secondary border border-border-default rounded-3xl p-4 md:p-6 relative overflow-hidden flex flex-col items-center justify-center">
      <div className="flex items-center gap-2 mb-6 self-start">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="7.5 4.21 12 6.81 16.5 4.21" />
          <polyline points="7.5 19.79 7.5 14.6 3 12" />
          <polyline points="21 12 16.5 14.6 16.5 19.79" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
        <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">全球通畅率</h3>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="relative w-32 h-32 md:w-44 md:h-44 flex items-center justify-center">
          <div className="absolute inset-8 blur-[35px] rounded-full opacity-60" style={{ backgroundColor: cfg.stroke + '0D' }} />
          <svg viewBox="0 0 160 160" className="w-full h-full transform -rotate-90 overflow-visible" style={{ filter: `drop-shadow(0 0 12px ${cfg.stroke}26)` }}>
            <circle cx="80" cy="80" r={radius} stroke="#1e293b" strokeWidth="10" fill="transparent" strokeOpacity="0.3" />
            <circle
              cx="80" cy="80" r={radius}
              stroke={cfg.stroke}
              strokeWidth="10"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <div className="flex items-baseline">
              <span className="text-4xl md:text-5xl font-black text-text-primary tracking-tighter italic drop-shadow-lg">
                {score.toFixed(1)}
              </span>
              <span className="text-lg font-bold ml-0.5" style={{ color: cfg.stroke }}>%</span>
            </div>
            <div className="flex flex-col items-center mt-2">
              <div className="h-px w-6 bg-border-default mb-2 opacity-60" />
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap ${cfg.text}`}>
                {cfg.label}
              </span>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-text-muted font-bold text-center leading-relaxed max-w-[200px]">
          全球航线通畅率综合评估，由 PPO 强化学习引擎实时计算
        </p>
      </div>

      {/* 装饰 */}
      <div className="absolute -bottom-8 -right-8 w-24 h-24 blur-3xl opacity-5 rounded-full pointer-events-none" style={{ backgroundColor: cfg.stroke }} />
    </div>
  );
};

export default PatencyScore;
