
import React from 'react';
import { ScrollText, ShieldCheck, UserCheck, AlertOctagon } from 'lucide-react';

const AuditLogs: React.FC = () => {
  const logs = [
    { time: '14:24:02', user: 'SYS_AGENT_01', action: '执行模型权重全局下发', status: 'SUCCESS', icon: <UserCheck size={14} /> },
    { time: '14:18:45', user: 'ADMIN_KV', action: '修改路径优化启发式参数', status: 'LOGGED', icon: <ShieldCheck size={14} /> },
    { time: '13:55:12', user: 'SG_NODE_AUTH', action: '尝试跨域数据库同步', status: 'DENIED', icon: <AlertOctagon size={14} className="text-red-500" /> },
    { time: '13:42:01', user: 'SYSTEM', action: '自动漏洞扫描完成', status: 'SECURE', icon: <ScrollText size={14} /> },
  ];

  return (
    <div className="bg-bg-secondary rounded-3xl p-4 md:p-8 border border-border-default shadow-2xl">
      <div className="flex items-center justify-between mb-4 md:mb-8">
        <div className="flex items-center gap-3">
          <ScrollText size={18} className="text-indigo-400" />
          <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">安全审计与回溯日志</h3>
        </div>
        <button className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest">查看完整报告 →</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border-default">
              <th className="pb-4 text-[10px] font-black text-text-muted uppercase tracking-widest px-4">时间</th>
              <th className="pb-4 text-[10px] font-black text-text-muted uppercase tracking-widest px-4">操作主体</th>
              <th className="pb-4 text-[10px] font-black text-text-muted uppercase tracking-widest px-4">指令/行为描述</th>
              <th className="pb-4 text-[10px] font-black text-text-muted uppercase tracking-widest px-4">安全状态</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default/30">
            {logs.map((log, idx) => (
              <tr key={idx} className="group hover:bg-bg-tertiary/20 transition-colors duration-300">
                <td className="py-4 px-4 font-mono text-xs text-text-muted tracking-tighter">{log.time}</td>
                <td className="py-4 px-4">
                  <span className="px-2 py-1 bg-bg-secondary border border-border-default rounded text-[10px] font-bold text-indigo-400">
                    {log.user}
                  </span>
                </td>
                <td className="py-4 px-4 text-xs font-medium text-text-secondary">{log.action}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <span className={log.status === 'DENIED' ? 'text-red-500' : 'text-emerald-500'}>
                      {log.icon}
                    </span>
                    <span className={`text-[10px] font-black tracking-widest ${log.status === 'DENIED' ? 'text-red-500' : 'text-emerald-500'}`}>
                      {log.status}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogs;
