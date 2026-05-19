
import React from 'react';
import { Search, ShieldAlert, Globe } from 'lucide-react';

const SecurityMonitoring: React.FC = () => {
  return (
    <div className="h-full bg-bg-secondary border border-border-default rounded-3xl p-8 relative overflow-hidden flex flex-col">
      <div className="flex justify-between items-center mb-10 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/20">
            <Search size={16} className="text-indigo-400" />
          </div>
          <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">威胁实时监测引擎</h3>
        </div>
        <div className="flex gap-2">
           <span className="px-3 py-1 bg-emerald-500 text-white text-[9px] font-black rounded uppercase tracking-tighter">系统加固中</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 flex-1 items-center relative z-10">
        {/* 左侧：活跃威胁雷达 */}
        <div className="flex justify-center items-center">
          <div className="relative w-48 h-48 rounded-full border border-border-default flex items-center justify-center">
            {/* 雷达扫描效果 */}
            <div className="absolute inset-0 rounded-full border border-indigo-500/10 animate-ping opacity-20" />
            <div className="absolute inset-4 rounded-full border border-indigo-500/30 animate-pulse" />
            
            <div className="w-36 h-36 rounded-full bg-bg-secondary/50 border-2 border-border-default flex flex-col items-center justify-center shadow-[inset_0_0_30px_rgba(79,70,229,0.1)]">
               <ShieldAlert size={24} className="text-indigo-400 mb-1" />
               <span className="text-4xl font-black text-text-primary">0</span>
               <span className="text-[10px] text-text-muted font-bold uppercase mt-1 tracking-tighter">当前活跃威胁</span>
            </div>
          </div>
        </div>

        {/* 右侧：指标条 */}
        <div className="space-y-6">
          <MonitoringBar label="指令注入防御" status="SECURE" percent={100} color="bg-emerald-500" />
          <MonitoringBar label="异常地理位置尝试" status="BLOCKED" percent={100} color="bg-indigo-500" />
          <MonitoringBar label="敏感数据出口过滤" status="ACTIVE" percent={80} color="bg-cyan-500" />
          <MonitoringBar label="策略完整性校验" status="VERIFYING" percent={100} color="bg-purple-500" />
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-border-default flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3 text-text-muted group cursor-pointer">
          <Globe size={16} className="group-hover:text-indigo-400 transition-colors duration-300" />
          <span className="text-[10px] font-bold uppercase tracking-widest group-hover:text-text-secondary transition-colors duration-300">全球 IP 过滤黑名单</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-black text-text-primary font-mono">1,424,902</span>
          <span className="text-[10px] text-text-muted font-bold uppercase">封禁中</span>
        </div>
      </div>
      
      {/* 装饰性背景网格 */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.8)_1px,transparent_1px)] bg-[size:40px_40px] opacity-10 pointer-events-none" />
    </div>
  );
};

const MonitoringBar = ({ label, status, percent, color }: any) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <span className="text-[11px] font-bold text-text-secondary tracking-tight">{label}</span>
      <span className={`text-[10px] font-black tracking-widest ${status === 'SECURE' ? 'text-emerald-500' : status === 'ACTIVE' ? 'text-cyan-400' : 'text-indigo-400'}`}>
        {status}
      </span>
    </div>
    <div className="h-1 bg-bg-secondary rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${percent}%` }} />
    </div>
  </div>
);

export default SecurityMonitoring;
