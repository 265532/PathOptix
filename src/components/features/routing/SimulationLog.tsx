
import React from 'react';
import { Terminal } from 'lucide-react';

const SimulationLog: React.FC = () => {
  return (
    <div className="bg-bg-primary border border-border-default p-8 rounded-[32px] h-[350px] flex flex-col shadow-inner">
      <div className="flex justify-between items-center mb-6 border-b border-border-default pb-4">
        <div className="flex items-center gap-2 text-text-muted">
          <Terminal size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">实时模拟日志 (CONSOLE)</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto font-mono text-[10px] space-y-2 scrollbar-hide opacity-80 leading-relaxed">
        <LogEntry time="14:20:11" color="text-emerald-500" msg='INIT: Scenario "Suez_Blockage_v2" loaded.' />
        <LogEntry time="14:20:15" color="text-text-muted" msg="WARP: Running Monte Carlo iterations (8000/8000)..." />
        <LogEntry time="14:20:18" color="text-red-500" msg="ALERT: Port of Shanghai congestion reaches 185% capacity." />
        <LogEntry time="14:20:20" color="text-cyan-400" msg="STABLE: Extreme-Robust path identifies bypass via Arctic Route." />
        <LogEntry time="14:20:25" color="text-text-muted" msg="SYNC: Updating reward matrix for deep reinforcement cluster..." />
        <div className="animate-pulse text-text-primary mt-4">_</div>
      </div>
    </div>
  );
};

const LogEntry = ({ time, color, msg }: any) => (
  <div className="flex gap-4 group">
    <span className="text-text-primary shrink-0">[{time}]</span>
    <span className={`${color} group-hover:brightness-125 transition-all duration-300`}>{msg}</span>
  </div>
);

export default SimulationLog;
