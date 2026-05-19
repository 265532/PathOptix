
import React, { useState } from 'react';
import { BarChart2, ChevronUp, ChevronDown } from 'lucide-react';

const RegionalCompliance: React.FC = () => {
  const [expandedRow, setExpandedRow] = useState<number | null>(1);

  return (
    <div className="bg-bg-secondary border border-border-default rounded-3xl p-8 flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-indigo-400"><BarChart2 size={20} /></div>
          <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">区域合规数据报告</h3>
        </div>
      </div>

      <div className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-default">
              <th className="pb-4 text-left text-[10px] font-black text-text-muted uppercase tracking-widest">区域名称</th>
              <th className="pb-4 text-left text-[10px] font-black text-text-muted uppercase tracking-widest">活跃节点</th>
              <th className="pb-4 text-left text-[10px] font-black text-text-muted uppercase tracking-widest">风险等级</th>
              <th className="pb-4 text-left text-[10px] font-black text-text-muted uppercase tracking-widest px-4">合规趋势</th>
              <th className="pb-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default/20">
            {/* Row 1 */}
            <tr className="group hover:bg-bg-tertiary/10 cursor-pointer" onClick={() => setExpandedRow(expandedRow === 0 ? null : 0)}>
              <td className="py-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-bg-secondary border border-border-default rounded flex items-center justify-center text-xs font-black text-text-muted uppercase tracking-widest shrink-0">CN</div>
                  <span className="text-sm font-bold text-text-secondary">华东枢纽集群</span>
                </div>
              </td>
              <td className="py-6 text-xs text-text-muted font-bold">大陆 Hub-01</td>
              <td className="py-6">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-emerald-500">低风险</span>
                </div>
              </td>
              <td className="py-6 px-4">
                 <div className="flex items-end gap-1 h-4">
                    <div className="w-1 h-2 bg-emerald-500/40 rounded-full" />
                    <div className="w-1 h-3 bg-emerald-500/60 rounded-full" />
                    <div className="w-1 h-2.5 bg-emerald-500/80 rounded-full" />
                    <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                 </div>
              </td>
              <td className="py-6 text-right text-text-muted pr-2">
                {expandedRow === 0 ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </td>
            </tr>

            {/* Row 2 (Expanded by Default) */}
            <tr className="group hover:bg-bg-tertiary/10 cursor-pointer" onClick={() => setExpandedRow(expandedRow === 1 ? null : 1)}>
              <td className="py-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-bg-secondary border border-border-default rounded flex items-center justify-center text-xs font-black text-text-muted uppercase tracking-widest shrink-0">SG</div>
                  <span className="text-sm font-bold text-text-secondary">东南亚运营中心</span>
                </div>
              </td>
              <td className="py-6 text-xs text-text-muted font-bold">新加坡 Hub-04</td>
              <td className="py-6">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span className="text-xs font-bold text-amber-500">中风险</span>
                </div>
              </td>
              <td className="py-6 px-4">
                 <div className="flex items-end gap-1 h-4">
                    <div className="w-1 h-3 bg-amber-500/40 rounded-full" />
                    <div className="w-1 h-4 bg-amber-500/60 rounded-full" />
                    <div className="w-1 h-2 bg-amber-500/80 rounded-full" />
                    <div className="w-1 h-3.5 bg-amber-500 rounded-full" />
                 </div>
              </td>
              <td className="py-6 text-right text-text-muted pr-2">
                {expandedRow === 1 ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </td>
            </tr>

            {/* Expanded Detail View */}
            {expandedRow === 1 && (
              <tr>
                <td colSpan={5} className="bg-bg-secondary/40 border-l border-indigo-500 p-8 animate-in slide-in-from-top-2">
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-4 border-l-2 border-border-input">详细日志时间线</h4>
                    <div className="space-y-6 ml-4">
                      <LogItem time="08:00 AM" color="bg-text-muted" msg="与新加坡监管机构的初始同步已完成。" />
                      <LogItem time="10:45 AM" color="bg-amber-500" msg="出口映射中检测到轻微差异。" />
                      <LogItem time="02:20 PM" color="bg-emerald-500" msg="AI 自动修正已应用于新加坡物流节点。" />
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const LogItem = ({ time, color, msg }: any) => (
  <div className="flex items-center gap-4 group">
    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest w-20">{time}</span>
    <div className={`w-2 h-2 rounded-full ${color} shadow-sm group-hover:scale-125 transition-transform shrink-0`} />
    <span className="text-xs font-bold text-text-secondary group-hover:text-text-primary transition-colors duration-300">{msg}</span>
  </div>
);

export default RegionalCompliance;
