
import React from 'react';
import { Activity, Zap, Info } from 'lucide-react';

const MapWidget: React.FC = () => {
  return (
    <div className="bg-bg-secondary/80 backdrop-blur-xl rounded-[32px] border border-border-default p-10 relative overflow-hidden h-[600px] shadow-2xl flex flex-col">
      <div className="flex justify-between items-start z-10">
        <div>
          <div className="flex items-center gap-3">
            <div className="text-cyan-400">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
            <h3 className="text-3xl font-black text-text-primary tracking-tight italic">全球实时智能态势</h3>
          </div>
          <p className="text-[10px] text-cyan-500 font-black uppercase tracking-[0.2em] mt-2 ml-1">
            自主路径 management system
          </p>
        </div>

        <div className="px-4 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-full flex items-center gap-3 group cursor-pointer hover:bg-emerald-500/10 transition-all">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">神经网络路径优化已激活</span>
        </div>
      </div>

      <div className="flex-1 relative mt-4">
        <svg viewBox="0 0 1000 500" className="w-full h-full">
          <defs>
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path 
            d="M200,200 Q500,50 850,250" 
            fill="none" 
            stroke="url(#pathGradient)" 
            strokeWidth="4" 
            className="opacity-40"
          />
          <path 
            d="M200,200 Q500,50 850,250" 
            fill="none" 
            stroke="url(#pathGradient)" 
            strokeWidth="4" 
            strokeDasharray="100, 1000"
            filter="url(#glow)"
          >
            <animate attributeName="stroke-dashoffset" from="1100" to="0" dur="3s" repeatCount="indefinite" />
          </path>

          <path 
            d="M200,200 Q550,350 780,420" 
            fill="none" 
            stroke="#334155" 
            strokeWidth="2" 
            strokeDasharray="8 8" 
          />

          <g className="cursor-pointer">
            <circle cx="200" cy="200" r="18" fill="#3b82f6" fillOpacity="0.1" />
            <circle cx="200" cy="200" r="12" fill="#3b82f6" fillOpacity="0.3" className="animate-pulse" />
            <circle cx="200" cy="200" r="6" fill="#60a5fa" filter="url(#glow)" />
            <text x="200" y="240" textAnchor="middle" className="fill-[var(--color-text-muted)] text-[12px] font-black uppercase tracking-widest">起始节点 ALPHA</text>
          </g>

          <g className="cursor-pointer">
            <circle cx="850" cy="250" r="18" fill="#10b981" fillOpacity="0.1" />
            <circle cx="850" cy="250" r="12" fill="#10b981" fillOpacity="0.3" className="animate-pulse" />
            <circle cx="850" cy="250" r="6" fill="#34d399" filter="url(#glow)" />
            <text x="850" y="290" textAnchor="middle" className="fill-emerald-400 text-[14px] font-black uppercase tracking-widest italic">优化目标节点</text>
          </g>

          <g className="cursor-pointer">
            <circle cx="780" cy="420" r="14" fill="#f59e0b" fillOpacity="0.1" />
            <circle cx="780" cy="420" r="5" fill="#f59e0b" filter="url(#glow)" />
            <text x="750" y="445" textAnchor="middle" className="fill-amber-500 text-[11px] font-black uppercase tracking-widest">检测中...</text>
          </g>

          <circle r="3" fill="#fff" filter="url(#glow)">
            <animateMotion dur="4s" repeatCount="indefinite" path="M200,200 Q500,50 850,250" />
          </circle>
          <circle r="2" fill="#00F2FF" filter="url(#glow)">
            <animateMotion dur="5s" repeatCount="indefinite" begin="1s" path="M200,200 Q500,50 850,250" />
          </circle>
        </svg>
      </div>

      <div className="absolute bottom-10 left-10 flex items-center gap-6 z-20">
        <div className="bg-bg-modal/60 backdrop-blur-md border border-border-default p-6 rounded-[28px] flex items-center gap-8 shadow-2xl group hover:border-cyan-500/30 transition-all">
          <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90 overflow-visible">
              <circle cx="50" cy="50" r="42" stroke="#1e293b" strokeWidth="8" fill="transparent" />
              <circle 
                cx="50" cy="50" r="42" stroke="#06b6d4" strokeWidth="8" fill="transparent" 
                strokeDasharray="264" strokeDashoffset={264 * (1 - 0.78)} strokeLinecap="round"
                className="path-glow transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-black text-text-primary italic leading-none">78%</span>
            </div>
            <div className="absolute -top-3 px-2 bg-bg-secondary border border-border-default rounded-md">
               <span className="text-[8px] text-text-muted font-black uppercase tracking-widest whitespace-nowrap">置信度评分</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="space-y-0.5">
              <h4 className="text-xl font-black text-text-primary tracking-tight italic group-hover:text-cyan-400 transition-colors">高可靠性</h4>
              <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">机器学习模型 V4.2.0-稳定版</p>
            </div>
            
            <div className="flex gap-6 pt-2 border-t border-border-default">
              <div className="flex flex-col gap-0.5">
                <span className="text-[8px] text-text-muted font-black uppercase tracking-tighter">延迟</span>
                <span className="text-xs font-black text-cyan-400 font-mono tracking-tighter italic">12MS</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[8px] text-text-muted font-black uppercase tracking-tighter">数据包</span>
                <span className="text-xs font-black text-cyan-400 font-mono tracking-tighter italic">24.5K/S</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 right-10 bg-bg-elevated/60 backdrop-blur-2xl border border-border-default p-6 rounded-2xl min-w-[180px] z-10 shadow-2xl">
        <div className="flex items-center justify-between mb-4 border-b border-border-default pb-3">
          <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">全局节点图例</span>
          <Info size={12} className="text-text-muted" />
        </div>
        <div className="space-y-3">
          <LegendItem color="bg-blue-500" label="AI 中央枢纽" />
          <LegendItem color="bg-emerald-500" label="优化节点" />
          <LegendItem color="bg-amber-500" label="风险评估" />
        </div>
      </div>
      
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 0)', backgroundSize: '30px 30px' }} />
    </div>
  );
};

const LegendItem = ({ color, label }: { color: string, label: string }) => (
  <div className="flex items-center gap-3 group cursor-pointer">
    <div className={`w-2.5 h-2.5 rounded-full ${color} shadow-[0_0_8px_rgba(0,0,0,0.5)] group-hover:scale-125 transition-transform`} />
    <span className="text-[11px] font-black text-text-secondary group-hover:text-text-primary transition-colors uppercase tracking-tight">{label}</span>
  </div>
);

export default MapWidget;
