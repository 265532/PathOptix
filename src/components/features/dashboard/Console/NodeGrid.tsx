
import React from 'react';

const NodeGrid: React.FC = () => {
  const nodes = [
    { id: '运力调度核心', role: 'Routing', load: 85, status: 'online' },
    { id: '全球合规审查', role: 'Compliance', load: 42, status: 'online' },
    { id: '动态成本核算', role: 'Cost-Eval', load: 94, status: 'warning' },
    { id: '异常气象预警', role: 'Weather', load: 12, status: 'idle' },
  ];

  return (
    <div className="space-y-4">
      {nodes.map(node => (
        <div key={node.role} className="space-y-1.5">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase">
            <span className="text-text-muted tracking-tighter">
              Agent: <span className="text-text-muted">{node.id}</span> <span className="text-text-primary">({node.role})</span>
            </span>
            <span className={node.load > 90 ? 'text-amber-500' : 'text-text-secondary'}>{node.load}%</span>
          </div>
          <div className="h-1.5 bg-bg-primary rounded-full flex overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                node.load > 90 ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' :
                node.load < 20 ? 'bg-bg-tertiary' : 'bg-cyan-500'
              }`}
              style={{ width: `${node.load}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default NodeGrid;
