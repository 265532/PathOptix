
import React, { useState, useEffect, useRef } from 'react';
import { Terminal } from 'lucide-react';
import { useTheme } from '@hooks/useTheme';

interface LogEntry {
  id: number;
  time: string;
  msg: string;
  color: string;
}

const LogPanel: React.FC = () => {
  const { isDark } = useTheme();
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: 1, color: "text-emerald-500", time: "14:24:01", msg: "环境初始化成功: Warehouse-Grid-v4" },
    { id: 2, color: "text-text-muted", time: "14:24:02", msg: "加载权重文件: dqn_v25_weights.h5" },
    { id: 3, color: "text-blue-400", time: "14:24:05", msg: "代理已注册: POS(0,0,0) 状态: 就绪" },
    { id: 4, color: "text-text-muted", time: "14:24:08", msg: "训练回合 748: R=142.5 L=0.0021" },
    { id: 5, color: "text-blue-500 font-black", time: "14:24:09", msg: "回合 749: 发现新的全局最优解 (R=151.6)" },
    { id: 6, color: "text-amber-500", time: "14:24:11", msg: "[警告] 检测到 GPU 显存紧张 (85% 阈值)" },
    { id: 7, color: "text-slate-400", time: "14:24:12", msg: "训练回合 750: R=138.2 L=0.0019" },
  ]);

  const logEndRef = useRef<HTMLDivElement>(null);

  // 移除了在 logs 改变时调用 scrollToBottom 的 useEffect
  // 这样用户在查看旧日志时，新日志的产生不会强迫页面向下滚动

  useEffect(() => {
    const logMessages = [
      { msg: "执行模型权重全局下发...", color: "text-blue-400" },
      { msg: "训练回合 {episode}: R={reward} L={loss}", color: "text-slate-400" },
      { msg: "发现新的全局最优解 (R={reward})", color: "text-blue-500 font-black" },
      { msg: "[警告] 节点响应延迟波动 (> 45ms)", color: "text-amber-500" },
      { msg: "策略梯度更新完成，开始同步 Cluster B", color: "text-cyan-400" },
      { msg: "探索率 (Epsilon) 已衰减至 0.045", color: "text-text-muted" },
      { msg: "检查点已自动保存: checkpoint_750.h5", color: "text-emerald-500/80" },
      { msg: "环境步进成功，当前平均步骤奖励: +0.24", color: "text-text-muted" },
    ];

    const interval = setInterval(() => {
      const randomMsg = logMessages[Math.floor(Math.random() * logMessages.length)];
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      
      // 动态填充变量
      let finalMsg = randomMsg.msg
        .replace('{episode}', Math.floor(Math.random() * 1000 + 750).toString())
        .replace('{reward}', (Math.random() * 50 + 130).toFixed(1))
        .replace('{loss}', (Math.random() * 0.005).toFixed(4));

      const newLog: LogEntry = {
        id: Date.now(),
        time: timeStr,
        msg: finalMsg,
        color: randomMsg.color
      };

      setLogs(prev => [...prev.slice(-49), newLog]); // 保持最近50条
    }, 30000); // 30秒

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-bg-secondary rounded-2xl p-6 border border-border-default flex flex-col gap-4 flex-1 overflow-hidden">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-text-secondary">
          <Terminal size={16} className="text-blue-400" />
          <span className="text-xs font-bold tracking-wider uppercase">实时日志</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">传输中</span>
        </div>
      </div>

      <div className={`flex-1 rounded-xl p-4 font-mono text-[10px] space-y-2 overflow-y-auto scrollbar-hide border border-border-default shadow-inner min-h-[200px] ${isDark ? 'bg-black/40' : 'bg-bg-elevated'}`}>
        {logs.map((log) => (
          <LogLine key={log.id} color={log.color} time={log.time} msg={log.msg} />
        ))}
        {/* 保持引用但不自动触发滚动 */}
        <div ref={logEndRef} className="animate-pulse text-blue-500 font-black h-4 pt-1">_</div>
      </div>
    </div>
  );
};

const LogLine = ({ color, time, msg }: any) => (
  <div className="flex gap-3 leading-relaxed animate-in fade-in slide-in-from-bottom-1 duration-300">
    <span className="text-text-muted shrink-0">[{time}]</span>
    <span className={color}>{msg}</span>
  </div>
);

export default LogPanel;
