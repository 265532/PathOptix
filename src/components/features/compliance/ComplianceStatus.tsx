
import React from 'react';
import { ClipboardCheck, ShieldEllipsis } from 'lucide-react';

const ComplianceStatus: React.FC = () => {
  const standards = [
    { name: 'ISO 27001', status: '已达成', val: 100, color: 'text-emerald-500' },
    { name: 'GDPR Privacy', status: '审计中', val: 94, color: 'text-cyan-500' },
    { name: 'ESG Governance', status: '已验证', val: 100, color: 'text-indigo-500' },
    { name: 'NIST Framework', status: '改进中', val: 78, color: 'text-amber-500' },
  ];

  return (
    <div className="bg-bg-secondary rounded-3xl p-6 border border-border-default flex flex-col gap-6 h-full shadow-xl">
      <div className="flex items-center gap-3">
        <ClipboardCheck size={20} className="text-indigo-400" />
        <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">全球合规评分指数</h3>
      </div>

      <div className="flex-1 space-y-6">
        {standards.map((item, idx) => (
          <div key={idx} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-text-secondary">{item.name}</span>
              <span className={`text-[10px] font-black uppercase ${item.color}`}>{item.status}</span>
            </div>
            <div className="h-2 bg-bg-secondary rounded-full overflow-hidden flex">
               <div className={`h-full ${item.color.replace('text', 'bg')} transition-all duration-1000`} style={{ width: `${item.val}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-bg-secondary/50 rounded-2xl border border-border-default flex flex-col items-center gap-2">
        <span className="text-[10px] text-text-muted font-black uppercase">综合合规率 (Overall)</span>
        <span className="text-3xl font-black text-text-primary tracking-tighter">93.4%</span>
        <div className="w-full flex gap-1 mt-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
            <div key={i} className={`h-1 flex-1 rounded-full ${i <= 9 ? 'bg-indigo-500' : 'bg-bg-tertiary'}`} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComplianceStatus;
