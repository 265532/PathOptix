
import React from 'react';
import { ShieldCheck, Lock, Fingerprint, Search } from 'lucide-react';

const SecurityHeader: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-end">
      <div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
            <ShieldCheck size={28} fill="currentColor" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-text-primary tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-bg-secondary to-text-muted">合规与安全中心</h2>
            <p className="text-text-muted text-[9px] md:text-xs font-bold uppercase tracking-[0.15em] md:tracking-[0.2em] mt-1">
              Zero-Trust Architecture & Governance Control
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 sm:gap-4">
        <div className="flex items-center gap-4 md:gap-6 px-4 md:px-6 py-3 bg-bg-secondary border border-border-default rounded-2xl">
          <div className="flex flex-col">
            <span className="text-[9px] text-text-muted font-black uppercase">最后安全扫描</span>
            <span className="text-xs font-bold text-text-secondary">14:22:04 (今日)</span>
          </div>
          <div className="w-px h-8 bg-bg-tertiary" />
          <div className="flex flex-col">
            <span className="text-[9px] text-text-muted font-black uppercase">安全防御等级</span>
            <span className="text-xs font-bold text-emerald-400 tracking-widest">PRO-ULTRA</span>
          </div>
        </div>
        <button className="px-4 md:px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-600/20 flex items-center gap-2 hover:scale-105 transition-all duration-300 uppercase tracking-widest">
          <Search size={14} /> 全域安全扫描
        </button>
      </div>
    </div>
  );
};

export default SecurityHeader;
