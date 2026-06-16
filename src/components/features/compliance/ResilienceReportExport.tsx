import React, { useState } from 'react';
import { FileDown, Rocket, Eye, Clock } from 'lucide-react';

const ResilienceReportExport: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [historyItems, setHistoryItems] = useState([
    { id: 1, title: "供应链韧性评估_Q1.pdf", date: "2024-03-20 14:20" },
    { id: 2, title: "碳排放与不可抗力分析.xlsx", date: "2024-03-18 09:15" },
    { id: 3, title: "全球航线风险年鉴.pdf", date: "2024-02-28 16:45" },
  ]);

  const generateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const now = new Date();
      const q = Math.floor(now.getMonth() / 3) + 1;
      const title = `供应链韧性与碳排评估_Q${q}_${now.getFullYear()}.pdf`;
      const date = now.toISOString().slice(0, 10) + ' ' + now.toTimeString().slice(0, 5);

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`<!DOCTYPE html><html><head><title>${title}</title><style>
          body{font-family:Arial,sans-serif;margin:40px;color:#1e293b}
          h1{color:#0f766e;text-align:center}
          h2{color:#0d9488;border-bottom:2px solid #99f6e4;padding-bottom:8px;margin-top:30px}
          table{width:100%;border-collapse:collapse;margin:20px 0}
          th,td{padding:12px;text-align:left;border-bottom:1px solid #e2e8f0}
          th{background:#f0fdf4;font-weight:bold}
          .footer{margin-top:50px;text-align:center;font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:20px}
        </style></head><body>
          <h1>供应链韧性与碳排评估报告</h1>
          <p style="text-align:center;color:#64748b">生成时间: ${date}</p>
          <h2>1. 全球供应链韧性指数</h2>
          <table><thead><tr><th>区域</th><th>韧性得分</th><th>主要风险</th><th>建议措施</th></tr></thead>
          <tbody>
            <tr><td>东亚</td><td>72/100</td><td>台风、港口拥堵</td><td>启用备用码头</td></tr>
            <tr><td>欧洲</td><td>65/100</td><td>罢工、红海绕行</td><td>多式联运分流</td></tr>
            <tr><td>北美</td><td>81/100</td><td>运河限行</td><td>优化铁路运输</td></tr>
          </tbody></table>
          <h2>2. 碳排放趋势</h2>
          <p>本季度全球航线碳排放总量较上季度下降 5.2%，主要得益于 PPO 引擎优化后的路径选择。</p>
          <h2>3. 不可抗力事件复盘</h2>
          <p>本季度共记录 4 起不可抗力事件，AI 引擎自动响应率 100%，平均挽回延误 2.3 天。</p>
          <div class="footer"><p>PathOptix 全球供应链风险与不可抗力预警中心</p></div>
        </body></html>`);
        printWindow.document.close();
        printWindow.onload = () => { printWindow.print(); setTimeout(() => printWindow.close(), 1000); };
      }

      setHistoryItems(prev => [{ id: prev.length + 1, title, date }, ...prev]);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="bg-bg-secondary border border-border-default rounded-3xl p-4 md:p-8 flex flex-col gap-4 md:gap-6 h-full">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-teal-500/10 rounded-full flex items-center justify-center border border-teal-500/20">
          <FileDown size={16} className="text-teal-400" />
        </div>
        <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">报告生成与导出</h3>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
        <div className="flex-[2.5] bg-bg-primary border border-border-default rounded-xl px-4 py-3 flex items-center justify-between text-xs text-text-muted">
          <div className="flex items-center gap-3">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <span>标准 PDF 格式 (.pdf)</span>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
        <button
          onClick={generateReport}
          disabled={isGenerating}
          className={`flex-1 px-6 py-3 text-white text-xs font-black rounded-xl shadow-lg hover:scale-105 transition-all duration-300 uppercase tracking-widest flex items-center justify-center gap-2 ${
            isGenerating ? 'bg-bg-tertiary cursor-not-allowed shadow-none' : 'bg-teal-600 shadow-teal-600/20'
          }`}
        >
          {isGenerating ? (
            <><Clock size={14} className="animate-spin" /> 生成中...</>
          ) : (
            <><Rocket size={14} fill="currentColor" /> 生成韧性与碳排评估报告</>
          )}
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-3">
        <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest">导出历史记录</h4>
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
          {historyItems.map((item) => (
            <div key={item.id} className="bg-bg-primary p-4 rounded-xl border border-border-default/50 flex items-center justify-between hover:border-border-default transition-all duration-300 group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-bg-tertiary/40 rounded-lg text-text-muted group-hover:text-teal-400 transition-colors duration-300">
                  <FileDown size={14} />
                </div>
                <div>
                  <div className="text-xs font-bold text-text-secondary">{item.title}</div>
                  <div className="text-[9px] text-text-muted font-medium mt-1 uppercase tracking-tighter">{item.date}</div>
                </div>
              </div>
              <div className="text-text-muted group-hover:text-teal-400 transition-colors duration-300">
                <Eye size={16} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResilienceReportExport;
