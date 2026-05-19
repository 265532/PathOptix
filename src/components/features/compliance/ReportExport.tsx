
import React, { useState } from 'react';
import { FileDown, Rocket, Eye, Database, Clock } from 'lucide-react';

const ReportExport: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [historyItems, setHistoryItems] = useState([
    { id: 1, title: "季度合规报告_Q3.pdf", date: "2023-10-24 14:20" },
    { id: 2, title: "亚太区域风险评估.xlsx", date: "2023-10-22 09:15" },
    { id: 3, title: "年度审计汇总报告.pdf", date: "2023-09-30 16:45" }
  ]);

  // 生成季度合规报告
  const generateComplianceReport = () => {
    setIsGenerating(true);

    // 模拟生成过程（2秒）
    setTimeout(() => {
      // 获取当前季度
      const now = new Date();
      const year = now.getFullYear();
      const quarter = Math.floor(now.getMonth() / 3) + 1;
      const reportTitle = `季度合规报告_Q${quarter}_${year}.pdf`;
      const reportDate = now.toISOString().slice(0, 10) + ' ' + now.toTimeString().slice(0, 5);

      // 创建一个新窗口，生成PDF内容
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        // 构建PDF内容
        const htmlContent = `
          <!DOCTYPE html>
          <html lang="zh-CN">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${reportTitle}</title>
            <style>
              body {
                font-family: 'Inter', sans-serif;
                background: white;
                color: black;
                margin: 40px;
                padding: 40px;
                border: 1px solid #e5e7eb;
              }
              .container {
                max-width: 1200px;
                margin: 0 auto;
              }
              h1 {
                font-size: 32px;
                font-weight: bold;
                margin-bottom: 20px;
                color: #1e293b;
              }
              h2 {
                font-size: 24px;
                font-weight: bold;
                margin-top: 40px;
                margin-bottom: 20px;
                color: #1e293b;
              }
              h3 {
                font-size: 18px;
                font-weight: bold;
                margin-top: 30px;
                margin-bottom: 15px;
                color: #1e293b;
              }
              p {
                margin-bottom: 15px;
                line-height: 1.6;
              }
              .subtitle {
                font-size: 14px;
                color: #64748b;
                margin-bottom: 40px;
              }
              .section {
                margin-bottom: 40px;
              }
              .summary {
                background-color: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 30px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
              }
              th, td {
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid #e2e8f0;
              }
              th {
                background-color: #f8fafc;
                font-weight: bold;
              }
              .footer {
                margin-top: 60px;
                padding-top: 20px;
                border-top: 1px solid #e2e8f0;
                text-align: center;
                font-size: 12px;
                color: #64748b;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>季度合规报告</h1>
              <div class="subtitle">${reportDate}</div>
              <div class="subtitle">季度: ${year}年 Q${quarter}</div>
              
              <div class="summary">
                <h3>报告摘要</h3>
                <p>本报告总结了 ${year} 年第 ${quarter} 季度的合规情况，包括监管要求遵守情况、风险评估结果、内部控制有效性等方面。</p>
              </div>
              
              <div class="section">
                <h2>1. 合规状态概览</h2>
                <table>
                  <thead>
                    <tr>
                      <th>合规领域</th>
                      <th>状态</th>
                      <th>风险等级</th>
                      <th>备注</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>数据安全</td>
                      <td>合规</td>
                      <td>低</td>
                      <td>所有系统已通过安全审计</td>
                    </tr>
                    <tr>
                      <td>隐私保护</td>
                      <td>合规</td>
                      <td>低</td>
                      <td>已更新隐私政策</td>
                    </tr>
                    <tr>
                      <td>环境法规</td>
                      <td>部分合规</td>
                      <td>中</td>
                      <td>需要改进能源使用效率</td>
                    </tr>
                    <tr>
                      <td>劳动法规</td>
                      <td>合规</td>
                      <td>低</td>
                      <td>所有员工合同符合法规要求</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div class="section">
                <h2>2. 风险评估结果</h2>
                <p>本季度共识别出 5 项潜在风险，其中 2 项已得到解决，3 项正在处理中。</p>
              </div>
              
              <div class="section">
                <h2>3. 改进建议</h2>
                <ul>
                  <li>加强环境法规合规培训</li>
                  <li>更新数据安全策略</li>
                  <li>完善内部控制流程</li>
                </ul>
              </div>
              
              <div class="footer">
                <p>本报告由合规部门生成，仅供内部参考使用。</p>
                <p>生成时间: ${reportDate}</p>
              </div>
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
      }

      // 更新导出历史记录
      const newReport = {
        id: historyItems.length + 1,
        title: reportTitle,
        date: reportDate
      };
      setHistoryItems([newReport, ...historyItems]);

      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="bg-bg-secondary border border-border-default rounded-3xl p-8 flex flex-col gap-6 h-full">
      <div className="flex items-center gap-3">
        <div className="text-indigo-400"><FileDown size={20} /></div>
        <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">报告生成与导出</h3>
      </div>

      <div className="flex gap-4">
        <div className="flex-[2.5] bg-bg-primary border border-border-default rounded-xl px-4 py-3 flex items-center justify-between text-xs text-text-muted group cursor-pointer hover:border-border-input transition-all duration-300">
          <div className="flex items-center gap-3">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            <span>标准 PDF 格式 (.pdf)</span>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"></path></svg>
        </div>
        <button 
          onClick={generateComplianceReport}
          disabled={isGenerating}
          className={`flex-1 px-6 py-3 text-text-primary text-xs font-black rounded-xl shadow-lg shadow-indigo-600/20 hover:scale-105 transition-all duration-300 uppercase tracking-widest flex items-center justify-center gap-2 ${isGenerating ? 'bg-bg-tertiary cursor-not-allowed' : 'bg-indigo-600'}`}
        >
          {isGenerating ? (
            <>
              <Clock size={14} className="animate-spin" />
              生成中...
            </>
          ) : (
            <>
              <Rocket size={14} fill="currentColor" />
              生成合规报告
            </>
          )}
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-3">
        <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest">导出历史记录</h4>
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
          {historyItems.map((item) => (
            <HistoryItem key={item.id} title={item.title} date={item.date} />
          ))}
        </div>
      </div>
    </div>
  );
};

const HistoryItem = ({ title, date }: any) => (
  <div className="bg-bg-primary p-4 rounded-xl border border-border-default/50 flex items-center justify-between hover:border-border-input transition-all duration-300 group cursor-pointer">
    <div className="flex items-center gap-4">
      <div className="p-2 bg-bg-tertiary/40 rounded-lg text-text-muted group-hover:text-indigo-400 transition-colors duration-300">
        <FileDown size={14} />
      </div>
      <div>
        <div className="text-xs font-bold text-text-secondary">{title}</div>
        <div className="text-[9px] text-text-muted font-medium mt-1 uppercase tracking-tighter">{date}</div>
      </div>
    </div>
    <div className="text-text-muted group-hover:text-indigo-400 transition-colors duration-300">
      <Eye size={16} />
    </div>
  </div>
);

export default ReportExport;
