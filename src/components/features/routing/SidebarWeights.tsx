
import React, { useState, useEffect } from 'react';
import { Sliders, Download, Activity, RefreshCw } from 'lucide-react';

const SidebarWeights: React.FC = () => {
  const [weights, setWeights] = useState({
    time: 40,
    cost: 30,
    resilience: 30
  });
  const [isRunning, setIsRunning] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [tempWeights, setTempWeights] = useState({
    time: 40,
    cost: 30,
    resilience: 30
  });

  const handleWeightChange = (key: keyof typeof weights, val: number) => {
    setWeights(prev => ({ ...prev, [key]: val }));
  };

  // 生成随机权重变化
  const generateRandomWeights = () => {
    const baseTime = 40;
    const baseCost = 30;
    const baseResilience = 30;
    
    return {
      time: Math.max(0, Math.min(100, baseTime + Math.floor(Math.random() * 11) - 5)),
      cost: Math.max(0, Math.min(100, baseCost + Math.floor(Math.random() * 11) - 5)),
      resilience: Math.max(0, Math.min(100, baseResilience + Math.floor(Math.random() * 11) - 5))
    };
  };

  // 处理重跑极端仿真
  const handleRerunSimulation = () => {
    setIsRunning(true);
    setShowCompleteModal(false);
    
    // 开始动态数据变化
    const interval = setInterval(() => {
      setTempWeights(generateRandomWeights());
    }, 200); // 每200ms更新一次
    
    // 10秒后停止
    setTimeout(() => {
      clearInterval(interval);
      setIsRunning(false);
      setTempWeights(weights); // 恢复原始权重
      setShowCompleteModal(true); // 显示完成弹窗
    }, 10000);
  };

  // 处理导出压力报告 (PDF)
  const handleExportPDF = () => {
    // 创建一个新窗口，只包含策略多维对比数据
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // 构建HTML内容，只包含策略多维对比数据
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>策略多维对比: 上海→鹿特丹</title>
        <style>
          body {
            font-family: 'Inter', sans-serif;
            background: white;
            color: black;
            margin: 20px;
            padding: 20px;
          }
          .container {
            max-width: 1000px;
            margin: 0 auto;
          }
          h1 {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          h2 {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 20px;
          }
          .subtitle {
            font-size: 12px;
            color: #666;
            margin-bottom: 30px;
          }
          .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          .table th,
          .table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          .table th {
            background-color: #f2f2f2;
            font-weight: bold;
          }
          .warning {
            color: orange;
          }
          .success {
            color: green;
          }
          .bar {
            height: 8px;
            background-color: #f0f0f0;
            border-radius: 4px;
            overflow: hidden;
            margin-top: 8px;
          }
          .bar-fill {
            height: 100%;
          }
          .blue {
            background-color: #3b82f6;
          }
          .green {
            background-color: #10b981;
          }
          .orange {
            background-color: #f97316;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>策略多维对比: 上海 → 鹿特丹</h1>
          <div class="subtitle">EXTREME CONGESTION STRESS ANALYSIS</div>
          <div class="subtitle">蒙特卡洛随机模拟 N=5000 次结果分布</div>
          
          <table class="table">
            <thead>
              <tr>
                <th>决策维度</th>
                <th>成本最优路径 (Base)</th>
                <th>鲁棒性推荐路径 (Robust)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>不确定性成本范围</td>
                <td>$4,200 - $5,900<br/><small>P90 置信区间</small></td>
                <td>$4,850 - $5,150<br/><small>P90 置信区间 (更稳定)</small><br/><small class="success">↑ 优化率 14%</small></td>
              </tr>
              <tr>
                <td>不确定性交付周期</td>
                <td class="warning">22 - 35 天<br/><small>P90 区间 (高波动)</small></td>
                <td>18 - 21 天<br/><small>P90 置信区间</small></td>
              </tr>
              <tr>
                <td>稳定性评分 (Stability)</td>
                <td>62<br/><div class="bar"><div class="bar-fill orange" style="width: 62%"></div></div></td>
                <td>94<br/><div class="bar"><div class="bar-fill green" style="width: 94%"></div></div></td>
              </tr>
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `;

    // 写入HTML内容并触发打印
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // 等待内容加载完成后打印
    printWindow.onload = () => {
      printWindow.print();
      // 打印完成后关闭窗口
      setTimeout(() => {
        printWindow.close();
      }, 1000);
    };
  };

  return (
    <div className="bg-bg-secondary/60 border border-border-default p-6 sm:p-8 rounded-[32px] shadow-2xl">
      <div className="flex items-center gap-3 mb-10">
        <Sliders size={20} className="text-red-500" />
        <h3 className="text-sm font-black text-text-primary uppercase tracking-[0.2em]">决策偏好权重</h3>
      </div>

      <div className="space-y-10">
        <WeightSlider 
          label="时间周期 (TIME)" 
          value={isRunning ? tempWeights.time : weights.time} 
          onChange={(v: number) => handleWeightChange('time', v)}
          badge="AUTO-BOOSTED" 
          color="bg-cyan-400" 
        />
        <WeightSlider 
          label="运输成本 (COST)" 
          value={isRunning ? tempWeights.cost : weights.cost} 
          onChange={(v: number) => handleWeightChange('cost', v)}
          color="bg-red-500" 
        />
        <WeightSlider 
          label="履约韧性 (RESILIENCE)" 
          value={isRunning ? tempWeights.resilience : weights.resilience} 
          onChange={(v: number) => handleWeightChange('resilience', v)}
          color="bg-red-500" 
        />
      </div>

      <div className="mt-12 space-y-4">
        <button 
          onClick={handleRerunSimulation}
          disabled={isRunning}
          className="w-full py-5 bg-red-600 hover:bg-red-500 text-white text-xs font-black rounded-xl shadow-lg shadow-red-600/20 transition-all duration-300 active:scale-95 flex items-center justify-center gap-3 uppercase tracking-[0.2em] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isRunning ? (
            <>
              <RefreshCw size={18} fill="currentColor" className="animate-spin" /> 仿真中...
            </>
          ) : (
            <>
              <Activity size={18} fill="currentColor" /> 重跑极端仿真
            </>
          )}
        </button>
        <button 
          onClick={handleExportPDF}
          disabled={isRunning}
          className="w-full py-5 border border-border-default text-text-muted hover:text-text-secondary text-xs font-black rounded-xl transition-all duration-300 flex items-center justify-center gap-3 uppercase tracking-[0.2em] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <Download size={18} /> 导出压力报告 (PDF)
        </button>
      </div>

      {/* 完成弹窗 */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-50 animate-in fade-in duration-300">
          <div className="bg-bg-modal border border-border-default rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-500">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                <Activity size={32} className="text-emerald-500" />
              </div>
              <h3 className="text-xl font-black text-text-primary uppercase tracking-widest">极端仿真已完成</h3>
              <p className="text-text-muted text-sm">系统已完成10秒的极端拥堵压力测试，所有参数已恢复到基准值。</p>
              <button 
                onClick={() => setShowCompleteModal(false)}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition-all duration-300 active:scale-95"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const WeightSlider = ({ label, value, onChange, badge, color }: any) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseInt(e.target.value, 10));
  };

  return (
    <div className="space-y-4 group/slider">
      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
        <span className="text-text-muted">{label}</span>
        <div className="flex items-center gap-2">
          <span className={`${badge ? 'text-cyan-400' : 'text-text-secondary'} transition-colors duration-300 group-hover/slider:text-text-primary`}>{value}%</span>
          {badge && <span className="px-1.5 py-0.5 bg-cyan-400/10 text-cyan-400 rounded-sm text-[8px]">{badge}</span>}
        </div>
      </div>
      <div className="h-1 bg-bg-secondary rounded-full relative flex items-center">
        {/* Visual Track */}
        <div className={`absolute h-full ${color} rounded-full transition-all duration-150`} style={{ width: `${value}%` }} />
        
        {/* Invisible Input */}
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={value} 
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />

        {/* Knob */}
        <div 
          className={`absolute w-3.5 h-3.5 ${color} border-2 border-white rounded-full pointer-events-none shadow-lg transition-all duration-150`} 
          style={{ left: `${value}%`, transform: 'translateX(-50%)' }} 
        />
      </div>
    </div>
  );
};

export default SidebarWeights;
