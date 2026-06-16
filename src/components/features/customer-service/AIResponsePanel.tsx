
import React from 'react';
import { Zap, Sparkles, Send } from 'lucide-react';

const AIResponsePanel: React.FC = () => {
  return (
    <div className="bg-bg-secondary border border-border-default rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-xl flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap size={18} className="text-purple-400" fill="currentColor" fillOpacity={0.2} />
          <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">AI 自动回复建议</h3>
        </div>
        <Sparkles size={16} className="text-purple-400 animate-pulse" />
      </div>

      <div className="space-y-4">
        <SuggestionItem 
          title="针对物流延误的回复模板" 
          desc="尊敬的客户，受天气影响，您的包裹在 APAC Hub 存在 2 天预期延迟..."
          confidence={92}
        />
        <SuggestionItem 
          title="满意度回访邀约" 
          desc="感谢您选择 PathOptix 服务，邀请您对本次客服质量进行评价..."
          confidence={88}
        />
      </div>

      <div className="relative group mt-2">
        <textarea 
          placeholder="输入问题或需求，AI 实时生成响应内容..."
          className="w-full h-24 bg-bg-primary border border-border-default rounded-2xl p-4 text-xs text-text-secondary focus:outline-none focus:border-purple-500 transition-all duration-300 resize-none"
        />
        <button className="absolute bottom-4 right-4 p-2 bg-purple-600 text-white rounded-lg shadow-lg hover:scale-110 transition-all duration-300">
          <Send size={14} />
        </button>
      </div>
    </div>
  );
};

const SuggestionItem = ({ title, desc, confidence }: any) => (
  <div className="p-4 bg-bg-primary border border-border-default rounded-2xl hover:border-purple-500/30 transition-all duration-300 cursor-pointer group">
    <div className="flex justify-between items-center mb-2">
      <div className="text-[10px] font-black text-text-primary uppercase tracking-tight">{title}</div>
      <span className="text-[9px] font-black text-purple-400 px-1.5 py-0.5 bg-purple-500/10 rounded">{confidence}% 置信度</span>
    </div>
    <p className="text-[10px] text-text-muted line-clamp-2 leading-relaxed italic group-hover:text-text-secondary transition-colors duration-300">
      "{desc}"
    </p>
  </div>
);

export default AIResponsePanel;
