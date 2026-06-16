
import React from 'react';
import { Activity, MoreVertical } from 'lucide-react';

const FeedbackStatusTable: React.FC = () => {
  const data = [
    { id: '#F22910', type: '物流延迟', desc: '上海港受台风影响，...', status: '已同步', color: 'text-emerald-500', dot: 'bg-blue-500' },
    { id: '#F22911', type: '包装受损', desc: '赔付申请已核实，进...', status: '处理中', color: 'text-amber-500', dot: 'bg-orange-500' },
    { id: '#F22915', type: '功能建议', desc: '希望能增加加分仓预警...', status: '待评估', color: 'text-purple-400', dot: 'bg-purple-500' },
  ];

  return (
    <div className="bg-bg-tertiary rounded-2xl md:rounded-[32px] border border-border-default p-4 md:p-8 shadow-2xl h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4 md:mb-8">
        <Activity size={18} className="text-blue-400" />
        <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">分类处理反馈并同步状态</h3>
      </div>

      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-black text-text-muted uppercase tracking-widest border-b border-border-default pb-4">
              <th className="pb-4 font-black">工单号</th>
              <th className="pb-4 font-black">类型</th>
              <th className="pb-4 font-black hidden md:table-cell">最新描述</th>
              <th className="pb-4 font-black text-right">状态</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default/30">
            {data.map((item, idx) => (
              <tr key={idx} className="group hover:bg-bg-tertiary/10 transition-colors duration-300">
                <td className="py-4 md:py-6 font-mono text-xs text-text-muted font-black">{item.id}</td>
                <td className="py-4 md:py-6">
                  <div className="flex items-center gap-2 text-xs font-bold text-text-secondary">
                    <div className={`w-2 h-2 rounded-full ${item.dot}`} />
                    {item.type}
                  </div>
                </td>
                <td className="py-4 md:py-6 text-[11px] text-text-muted max-w-[140px] truncate hidden md:table-cell">{item.desc}</td>
                <td className="py-4 md:py-6 text-right">
                  <span className={`px-3 py-1 bg-bg-secondary border border-border-default rounded-full text-[9px] font-black uppercase ${item.color}`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FeedbackStatusTable;
