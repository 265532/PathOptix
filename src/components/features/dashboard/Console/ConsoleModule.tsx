
import React, { useState, useEffect } from 'react';
import { Zap, Shield, Cpu, Share2, Activity, Radio, Globe, Brain, Timer } from 'lucide-react';
import SystemPulse from './SystemPulse';
import NodeGrid from './NodeGrid';
import { useTheme } from '@hooks/useTheme';

const ConsoleModule: React.FC = () => {
  const { isDark } = useTheme();
  const [latency, setLatency] = useState(0.024);
  const [nodes, setNodes] = useState(4);
  const [throughput, setThroughput] = useState(1250);
  const [reward, setReward] = useState(142);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [autoTraining, setAutoTraining] = useState(true);
  const [crossDomainSync, setCrossDomainSync] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(prev => Math.max(0.015, Math.min(0.045, prev + (Math.random() - 0.5) * 0.005)));
      
      if (Math.random() > 0.8) {
        setNodes(prev => Math.max(3, Math.min(6, prev + (Math.random() > 0.5 ? 1 : -1))));
      }

      setThroughput(prev => Math.max(1180, Math.min(1320, prev + (Math.random() - 0.5) * 15)));

      setReward(prev => Math.max(130, Math.min(160, prev + (Math.random() > 0.5 ? 1 : -1))));
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const handleGlobalOptimization = () => {
    setIsOptimizing(true);

    let step = 0;
    const totalSteps = 20;
    const interval = setInterval(() => {
      step++;

      setLatency(prev => Math.max(0.015, Math.min(0.045, prev + (Math.random() - 0.5) * 0.01)));
      setNodes(prev => Math.max(3, Math.min(7, prev + (Math.random() > 0.5 ? 1 : -1))));
      setThroughput(prev => Math.max(1100, Math.min(1400, prev + (Math.random() - 0.5) * 30)));
      setReward(prev => Math.max(120, Math.min(170, prev + (Math.random() > 0.5 ? 3 : -2))));

      if (step >= totalSteps) {
        clearInterval(interval);
        setIsOptimizing(false);
      }
    }, 300);
  };

  return (
    <div className={`bg-bg-secondary/80 backdrop-blur-2xl rounded-[40px] border p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] relative overflow-hidden group ${isDark ? 'border-white/[0.06]' : 'border-border-default/40'}`}>
      {/* 极光背景装饰 */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full -z-10 group-hover:bg-cyan-500/15 transition-all duration-1000" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/5 blur-[120px] rounded-full -z-10" />

      <div className="flex flex-col xl:flex-row gap-12 items-stretch">
        {/* 左侧：系统动力中心 */}
        <div className="flex-[1.5] space-y-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-2xl text-cyan-400 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                <Radio size={24} className="animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-black text-text-primary uppercase tracking-[0.2em]">综合指挥控制台</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">PATHOPTIX RL &amp; MULTI-AGENT ENGINE V2.4</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-[9px] text-text-muted font-black uppercase tracking-widest mb-1">当前决策时延</div>
                <div className="text-sm font-mono font-black text-cyan-400 transition-all duration-500 tabular-nums">
                  {latency.toFixed(3)}ms
                </div>
              </div>
              <div className="h-8 w-px bg-bg-tertiary" />
              <div className="text-right">
                <div className="text-[9px] text-text-muted font-black uppercase tracking-widest mb-1">活跃 Agent 数量</div>
                <div className="text-sm font-mono font-black text-text-primary transition-all duration-500 tabular-nums">
                  {nodes}
                </div>
              </div>
            </div>
          </div>
          
          <SystemPulse />
          
          <div className="grid grid-cols-4 gap-4">
            <QuickStat icon={<Zap size={14} />} label="并行并发规划" value={throughput.toFixed(0)} unit="Orders/s" color="text-cyan-400" />
            <QuickStat icon={<Activity size={14} />} label="PPO 全局均值" value={`+${reward}`} unit="Avg Reward" color="text-emerald-400" />
            <QuickStat icon={<Timer size={14} />} label="大模型推理/RAG耗时" value="245" unit="ms" color="text-blue-400" />
            <QuickStat icon={<Brain size={14} />} label="AI 策略采纳率" value="94.2" unit="%" color="text-text-secondary" />
          </div>
        </div>

        {/* 垂直分割线 */}
        <div className={`hidden xl:block w-px bg-gradient-to-b from-transparent via-border-default to-transparent mx-2 ${isDark ? '' : 'opacity-40'}`} />

        {/* 右侧：集群矩阵与核心指令 */}
        <div className="flex-1 flex flex-col gap-10">
          <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between text-text-muted border-b border-border-default/50 pb-4">
              <div className="flex items-center gap-3">
                <Cpu size={18} className="text-text-muted" />
                <span className="text-xs font-black uppercase tracking-[0.2em]">LangGraph 智能体计算负载</span>
              </div>
              <button 
                onClick={() => alert('管理 Agent 功能已触发')}
                className="text-[10px] font-black text-blue-500 hover:text-blue-400 transition-colors duration-300 active:scale-95"
              >
                管理 Agent
              </button>
            </div>
            <NodeGrid />
          </div>

          <div className="grid grid-cols-2 gap-4">
        <ControlToggle 
          icon={<Zap size={14} />} 
          label="Agent 全托管模式" 
          active={autoTraining}
          onClick={() => setAutoTraining(!autoTraining)}
        />
        <ControlToggle 
          icon={<Share2 size={14} />} 
          label="外部情报感知 (RAG)" 
          active={crossDomainSync}
          onClick={() => setCrossDomainSync(!crossDomainSync)}
        />
      </div>

          <button
            onClick={handleGlobalOptimization}
            disabled={isOptimizing}
            className={`w-full py-5 text-white text-xs font-black rounded-2xl uppercase tracking-[0.3em] transition-all duration-300 transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 ${
              isOptimizing
                ? 'bg-bg-tertiary cursor-not-allowed shadow-[0_20px_40px_-10px_rgba(6,182,212,0.1)]'
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-[0_20px_40px_-10px_rgba(6,182,212,0.3)] hover:shadow-[0_20px_60px_-10px_rgba(6,182,212,0.6)] hover:brightness-110'
            }`}
          >
            {isOptimizing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                PPO 重算中...
              </>
            ) : (
              <>
                <Zap size={16} fill="currentColor" />
                ⚡ 强制下发全局 PPO 重算
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const QuickStat = ({ icon, label, value, unit, color }: any) => {
  const { isDark } = useTheme();
  return (
  <div className={`border rounded-2xl p-4 group/stat hover:border-cyan-500/30 transition-all duration-300 ${isDark ? 'bg-white/[0.015] border-white/[0.04]' : 'bg-bg-elevated/50 border-border-default'}`}>
    <div className="flex items-center gap-2 mb-2">
       <span className="text-text-muted group-hover/stat:text-cyan-500 transition-colors duration-300">{icon}</span>
       <div className="text-[8px] text-text-muted font-black uppercase tracking-widest">{label}</div>
    </div>
    <div className="flex items-baseline gap-1">
      <div className={`text-xl font-black ${color} tracking-tight tabular-nums`}>{value}</div>
      <div className="text-[8px] text-text-primary font-black uppercase">{unit}</div>
    </div>
  </div>
  );
};

const ControlToggle = ({ icon, label, active = false, onClick }: any) => (
  <div 
    onClick={onClick}
    className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 cursor-pointer group/toggle ${active ? 'bg-cyan-500/5 border-cyan-500/20' : 'bg-bg-elevated/30 border-border-default'} active:scale-95`}
  >
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg transition-colors duration-300 ${active ? 'bg-cyan-500/20 text-cyan-400' : 'bg-bg-tertiary text-text-muted'}`}>
        {icon}
      </div>
      <span className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-text-secondary' : 'text-text-muted'}`}>{label}</span>
    </div>
    <div 
      className={`w-7 h-4 rounded-full p-0.5 flex items-center transition-colors duration-300 cursor-pointer ${active ? 'bg-cyan-500' : 'bg-bg-tertiary'}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${active ? 'translate-x-3' : ''}`} />
    </div>
  </div>
);

export default ConsoleModule;
