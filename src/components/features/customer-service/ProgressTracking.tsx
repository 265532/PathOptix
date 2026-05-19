
import React from 'react';
import { Target, CheckCircle2, Circle, Clock, MoreHorizontal, RefreshCw } from 'lucide-react';
import type { UploadedFile } from '../../../types';

interface FeedbackData {
  id: string;
  type: string;
  urgency: string;
  description: string;
  files: UploadedFile[];
  status: string;
  progress: number;
  submittedAt: string;
}

interface ProgressTrackingProps {
  feedbackList: FeedbackData[];
}

const ProgressTracking: React.FC<ProgressTrackingProps> = ({ feedbackList }) => {
  const latestFeedback = feedbackList.length > 0 ? feedbackList[0] : null;

  return (
    <div className="bg-bg-tertiary rounded-[32px] border border-border-default p-8 h-full flex flex-col shadow-2xl relative overflow-hidden">
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
            <Target size={20} />
          </div>
          <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">投诉处理与进度跟踪</h3>
        </div>
        {latestFeedback ? (
          <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-black rounded uppercase">
            正在处理: {latestFeedback.id}
          </span>
        ) : (
          <span className="px-3 py-1 bg-bg-elevated/30 border border-border-input/50 text-text-muted text-[9px] font-black rounded uppercase">
            暂无处理任务
          </span>
        )}
      </div>

      {latestFeedback ? (
        <div className="flex-1 space-y-12 pl-4">
          <ProgressStep 
            icon={<CheckCircle2 size={18} />} 
            title="提交反馈" 
            time={latestFeedback.submittedAt} 
            active 
            completed 
          />
          <ProgressStep 
            icon={latestFeedback.progress >= 50 ? <CheckCircle2 size={18} /> : <Circle size={18} />} 
            title="正在审核" 
            time={latestFeedback.submittedAt} 
            active={latestFeedback.progress >= 50} 
            completed={latestFeedback.progress >= 50} 
          />
          <ProgressStep 
            icon={latestFeedback.progress >= 75 ? <CheckCircle2 size={18} /> : latestFeedback.progress >= 50 ? <RefreshCw size={18} className="animate-spin-slow" /> : <Circle size={18} />} 
            title="正在处理" 
            desc="已分派给物流客服小组 A-03" 
            active={latestFeedback.progress >= 75 || (latestFeedback.progress >= 50 && latestFeedback.progress < 75)} 
            completed={latestFeedback.progress >= 75} 
          />
          <ProgressStep 
            icon={latestFeedback.progress >= 100 ? <CheckCircle2 size={18} /> : <Circle size={18} />} 
            title="已解决" 
            desc="等待确认..." 
            active={latestFeedback.progress >= 100} 
            completed={latestFeedback.progress >= 100} 
            last
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-bg-tertiary/60 rounded-full flex items-center justify-center mb-6">
            <Clock size={32} className="text-text-muted" />
          </div>
          <div className="text-sm font-bold text-text-muted text-center">暂无投诉记录</div>
          <div className="text-[10px] text-text-muted mt-2 text-center">提交反馈后将显示处理进度</div>
        </div>
      )}

      {latestFeedback && (
        <div className="absolute left-[59px] top-[140px] bottom-[140px] w-0.5 bg-bg-tertiary -z-10 overflow-hidden">
          <div className="h-[${latestFeedback.progress}%] bg-gradient-to-b from-emerald-500 to-blue-500 transition-all duration-500" />
        </div>
      )}
    </div>
  );
};



const ProgressStep = ({ icon, title, time, desc, active, completed, last }: any) => (
  <div className="flex gap-8 relative">
    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0 z-10 ${
      completed ? 'bg-emerald-500 border-emerald-500 text-white' :
      active ? 'bg-blue-600 border-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' :
      'bg-bg-secondary border-border-default text-text-muted'
    }`}>
      {icon}
    </div>
    <div className="space-y-1">
      <h4 className={`text-sm font-black uppercase tracking-widest ${active || completed ? 'text-text-primary' : 'text-text-muted'}`}>
        {title}
      </h4>
      {time && <p className="text-[10px] text-text-muted font-bold font-mono">{time}</p>}
      {desc && <p className="text-[10px] text-text-muted font-medium italic">{desc}</p>}
    </div>
  </div>
);

export default ProgressTracking;
