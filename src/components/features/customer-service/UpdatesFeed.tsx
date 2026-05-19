
import React from 'react';
import { Megaphone, ChevronRight } from 'lucide-react';

const UpdatesFeed: React.FC = () => {
  return (
    <div className="bg-bg-tertiary rounded-[32px] border border-border-default p-8 shadow-2xl flex flex-col h-full relative overflow-hidden group">
      <div className="flex items-center gap-3 mb-8 relative z-10">
        <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400">
          <Megaphone size={20} />
        </div>
        <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">用户建议采纳与更新公示</h3>
      </div>

      <div className="flex-1 space-y-6 relative z-10">
        <UpdateItem 
          tag="新功能上线" 
          title="【建议采纳】实时轨迹回放 2.0" 
          desc="根据用户反馈，我们优化了地图刷新率，并新增了节点拍照存档功能，现在可以在反馈中直接引用拍照凭证。"
          date="2023-11-22"
        />
        <UpdateItem 
          tag="系统优化" 
          title="AI 语音转文字搜索增强" 
          desc="提升了对于方言及模糊订单号的识别准确度，大幅缩短了电话投诉的人工干预时间。"
          date="2023-11-18"
        />
      </div>

      <button className="w-full mt-8 py-3 text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center justify-center gap-2 hover:text-blue-400 transition-colors duration-300">
        查看更多更新 <ChevronRight size={14} />
      </button>

      <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
        <Megaphone size={200} className="text-blue-500 transform rotate-12" />
      </div>
    </div>
  );
};

const UpdateItem = ({ tag, title, desc, date }: any) => (
  <div className="p-6 bg-bg-primary/40 border border-border-default rounded-[24px] hover:border-blue-500/30 transition-all duration-300 cursor-pointer">
    <div className="flex justify-between items-center mb-3">
      <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{tag}</span>
      <span className="text-[10px] text-text-muted font-bold font-mono">{date}</span>
    </div>
    <h4 className="text-xs font-black text-text-primary mb-2">{title}</h4>
    <p className="text-[11px] text-text-muted leading-relaxed font-medium">
      {desc}
    </p>
  </div>
);

export default UpdatesFeed;
