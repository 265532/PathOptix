
import React, { useState, useRef, useEffect } from 'react';
import { Database, AlertTriangle, ChevronDown, Check, CheckCircle2 } from 'lucide-react';

const AuditChange: React.FC = () => {
  const [typeOpen, setTypeOpen] = useState(false);
  const [regionOpen, setRegionOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [selectedType, setSelectedType] = useState('路由更新');
  const [selectedRegion, setSelectedRegion] = useState('亚太地区');

  const typeOptions = ['路由更新', '模型权重', '安全策略', '访问控制'];
  const regionOptions = ['亚太地区', '欧非中东', '北美地区', '全球范围'];

  // 点击外部关闭下拉框的简易处理
  const typeRef = useRef<HTMLDivElement>(null);
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (typeRef.current && !typeRef.current.contains(event.target as Node)) setTypeOpen(false);
      if (regionRef.current && !regionRef.current.contains(event.target as Node)) setRegionOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 处理提交变更申请
  const handleSubmitChange = () => {
    // 显示成功提示
    setShowSuccess(true);
    
    // 3秒后隐藏提示
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  return (
    <div className="bg-bg-secondary border border-border-default rounded-3xl p-4 md:p-8 flex flex-col gap-4 md:gap-6 h-full relative">
      {/* 成功提示 */}
      {showSuccess && (
        <div className="absolute top-6 right-6 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-3 flex items-center gap-3 shadow-lg shadow-emerald-500/10 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="text-emerald-500">
            <CheckCircle2 size={16} />
          </div>
          <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">提交成功</span>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-indigo-400"><Database size={20} /></div>
          <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">数据变更审计</h3>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 md:gap-4 relative">
        {/* 类型下拉框 */}
        <div className="flex-1 relative" ref={typeRef}>
          <div 
            onClick={() => { setTypeOpen(!typeOpen); setRegionOpen(false); }}
            className={`w-full bg-bg-primary border rounded-xl px-4 py-3 flex items-center justify-between text-xs transition-all duration-300 cursor-pointer select-none ${
              typeOpen ? 'border-indigo-500 ring-1 ring-indigo-500/20 text-text-primary' : 'border-border-default text-text-muted hover:border-border-input'
            }`}
          >
            <span>{selectedType}</span>
            <ChevronDown size={14} className={`transition-transform duration-300 ${typeOpen ? 'rotate-180 text-indigo-400' : 'text-text-muted'}`} />
          </div>
          
          {typeOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-bg-elevated border border-border-default rounded-xl shadow-2xl py-2 z-30 animate-in fade-in slide-in-from-top-2 duration-200">
              {typeOptions.map((opt) => (
                <div 
                  key={opt}
                  onClick={() => { setSelectedType(opt); setTypeOpen(false); }}
                  className={`px-4 py-2.5 text-xs flex items-center justify-between cursor-pointer transition-colors duration-300 ${
                    selectedType === opt ? 'bg-indigo-600/10 text-indigo-400 font-bold' : 'text-text-muted hover:bg-bg-tertiary hover:text-text-secondary'
                  }`}
                >
                  {opt}
                  {selectedType === opt && <Check size={12} />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 区域下拉框 */}
        <div className="flex-1 relative" ref={regionRef}>
          <div 
            onClick={() => { setRegionOpen(!regionOpen); setTypeOpen(false); }}
            className={`w-full bg-bg-primary border rounded-xl px-4 py-3 flex items-center justify-between text-xs transition-all duration-300 cursor-pointer select-none ${
              regionOpen ? 'border-indigo-500 ring-1 ring-indigo-500/20 text-text-primary' : 'border-border-default text-text-muted hover:border-border-input'
            }`}
          >
            <span className="truncate">区域：{selectedRegion}</span>
            <ChevronDown size={14} className={`transition-transform duration-300 ${regionOpen ? 'rotate-180 text-indigo-400' : 'text-text-muted'}`} />
          </div>

          {regionOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-bg-elevated border border-border-default rounded-xl shadow-2xl py-2 z-30 animate-in fade-in slide-in-from-top-2 duration-200">
              {regionOptions.map((opt) => (
                <div 
                  key={opt}
                  onClick={() => { setSelectedRegion(opt); setRegionOpen(false); }}
                  className={`px-4 py-2.5 text-xs flex items-center justify-between cursor-pointer transition-colors duration-300 ${
                    selectedRegion === opt ? 'bg-indigo-600/10 text-indigo-400 font-bold' : 'text-text-muted hover:bg-bg-tertiary hover:text-text-secondary'
                  }`}
                >
                  {opt}
                  {selectedRegion === opt && <Check size={12} />}
                </div>
              ))}
            </div>
          )}
        </div>

        <button 
          onClick={handleSubmitChange}
          className="px-6 py-3 bg-indigo-600 text-white text-xs font-black rounded-xl shadow-lg shadow-indigo-600/20 hover:scale-105 transition-all duration-300 uppercase tracking-widest active:scale-95 shrink-0"
        >
          提交变更申请
        </button>
      </div>

      {/* 警告框 */}
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex gap-4 items-center">
        <div className="p-2 bg-amber-500/20 rounded-lg text-amber-500 shrink-0">
          <AlertTriangle size={16} />
        </div>
        <p className="text-[11px] text-amber-500 font-bold leading-relaxed">
          检测到 {selectedRegion === '亚太地区' ? 'APAC' : selectedRegion} 日志中存在潜在不一致风险
        </p>
      </div>

      <div className="overflow-x-auto -mx-4 md:mx-0">
        <table className="w-full min-w-[400px]">
          <thead>
            <tr className="border-b border-border-default">
              <th className="pb-4 text-left text-[10px] font-black text-text-muted uppercase tracking-widest">ID</th>
              <th className="pb-4 text-left text-[10px] font-black text-text-muted uppercase tracking-widest">操作</th>
              <th className="pb-4 text-right text-[10px] font-black text-text-muted uppercase tracking-widest">状态</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default/30">
            {[
              { id: "#8291", action: "手动审计批准", status: "成功", color: "text-emerald-500", bg: "bg-emerald-500/10" },
              { id: "#8290", action: "系统同步触发", status: "待定", color: "text-amber-500", bg: "bg-amber-500/10" },
              { id: "#8288", action: "规则库更新", status: "完成", color: "text-emerald-500", bg: "bg-emerald-500/10" }
            ].map((row, idx) => (
              <tr key={idx} className="group hover:bg-bg-tertiary/20 transition-all duration-300">
                <td className="py-5 text-xs font-bold text-text-muted">{row.id}</td>
                <td className="py-5 text-xs font-bold text-text-secondary">{row.action}</td>
                <td className="py-5 text-right">
                  <span className={`px-2 py-1 ${row.bg} border border-border-default rounded text-[10px] font-black ${row.color}`}>
                    {row.status}
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

export default AuditChange;
