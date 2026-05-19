
import React from 'react';
import { Clock, Database, Cpu, HardDrive, Activity } from 'lucide-react';

const BottomMetrics: React.FC = () => {
  return (
    <div className="grid grid-cols-5 gap-6">
      <MetricCard icon={<Clock size={20} />} label="训练用时" value="2d 03h 14m" />
      <MetricCard icon={<Database size={20} />} label="数据集" value="18.7 GB" />
      <MetricCard icon={<Cpu size={20} />} label="GPU 利用率" value="94%" accent="text-amber-500" />
      <MetricCard icon={<HardDrive size={20} />} label="显存占用" value="9.2 / 16 GB" />
      <MetricCard icon={<Activity size={20} />} label="吞吐量" value="1850 EPS" accent="text-emerald-500" />
    </div>
  );
};

const MetricCard = ({ icon, label, value, accent = "text-text-primary" }: any) => (
  <div className="bg-bg-secondary rounded-2xl p-6 border border-border-default flex items-center gap-6 group hover:border-blue-500/30 transition-all duration-300">
    <div className="w-14 h-14 bg-bg-modal rounded-2xl flex items-center justify-center text-text-muted group-hover:text-blue-400 transition-colors duration-300">
      {icon}
    </div>
    <div className="flex flex-col gap-1">
      <span className="text-[10px] text-text-muted font-black uppercase tracking-widest">{label}</span>
      <span className={`text-xl font-black ${accent}`}>{value}</span>
    </div>
  </div>
);

export default BottomMetrics;
