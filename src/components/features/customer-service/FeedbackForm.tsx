
import React, { useState, useRef } from 'react';
import { MessageSquare, ChevronDown, Paperclip, Send, FileText, FileImage, X, Upload, CheckCircle } from 'lucide-react';
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

interface FeedbackFormProps {
  onAddFeedback: (feedback: FeedbackData) => void;
  onUpdateFeedbackProgress: (feedbackId: string, progress: number, status: string) => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ onAddFeedback, onUpdateFeedbackProgress }) => {
  const [feedbackType, setFeedbackType] = useState('投诉处理');
  const [urgency, setUrgency] = useState('普通');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const handleTypeChange = (type: string) => {
    setFeedbackType(type);
  };

  const handleUrgencyChange = (level: string) => {
    setUrgency(level);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      processFiles(Array.from(selectedFiles));
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      processFiles(Array.from(droppedFiles));
    }
  };

  const handleRemoveFile = (id: string) => {
    setFiles(files.filter(file => file.id !== id));
  };

  const processFiles = (fileList: File[]) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const newFiles: UploadedFile[] = [];

    fileList.forEach(file => {
      if (allowedTypes.includes(file.type)) {
        newFiles.push({
          id: Date.now() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type,
          size: file.size
        });
      }
    });

    if (newFiles.length > 0) {
      setFiles([...files, ...newFiles]);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes('image')) {
      return <FileImage size={16} className="text-green-400" />;
    } else if (type.includes('pdf')) {
      return <FileText size={16} className="text-red-400" />;
    }
    return <FileText size={16} className="text-blue-400" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const handleSubmitFeedback = () => {
    if (!description.trim()) {
      alert('请填写详细描述');
      return;
    }

    const newFeedback: FeedbackData = {
      id: 'FB-' + Date.now() + Math.floor(Math.random() * 1000),
      type: feedbackType,
      urgency: urgency,
      description: description,
      files: [...files],
      status: '待处理',
      progress: 0,
      submittedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };

    onAddFeedback(newFeedback);

    setDescription('');
    setFiles([]);
    if (descriptionRef.current) {
      descriptionRef.current.value = '';
    }

    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);

    simulateProgressUpdate(newFeedback.id);
  };

  const simulateProgressUpdate = (feedbackId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      if (progress <= 100) {
        const status = progress === 100 ? '已完成' : 
                      progress === 75 ? '处理中' : 
                      progress === 50 ? '已受理' : '待处理';
        
        onUpdateFeedbackProgress(feedbackId, progress, status);
      } else {
        clearInterval(interval);
      }
    }, 2000);
  };

  return (
    <div className="bg-bg-tertiary rounded-2xl md:rounded-[32px] border border-border-default p-4 md:p-8 shadow-2xl relative">
      <div className="flex items-center gap-3 mb-4 md:mb-8">
        <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
          <MessageSquare size={20} />
        </div>
        <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">系统内提交反馈</h3>
      </div>

      {showSuccess && (
        <div className="absolute top-4 right-4 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-black py-2 px-4 rounded-full flex items-center gap-2 shadow-lg shadow-green-500/10 animate-in slide-in-from-top-4 duration-300">
          <CheckCircle size={14} />
          提交成功
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
        <div className="space-y-2">
          <label className="text-[10px] text-text-muted font-black uppercase tracking-widest">反馈类型</label>
          <div className="bg-bg-secondary border border-border-default rounded-xl px-4 py-3 flex items-center justify-between text-xs text-text-secondary cursor-pointer">
            <span>{feedbackType}</span>
            <ChevronDown size={14} className="text-text-muted" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] text-text-muted font-black uppercase tracking-widest">紧急程度</label>
          <div className="bg-bg-secondary border border-border-default rounded-xl px-4 py-3 flex items-center justify-between text-xs text-text-secondary cursor-pointer">
            <span>{urgency}</span>
            <ChevronDown size={14} className="text-text-muted" />
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-6">
        <label className="text-[10px] text-text-muted font-black uppercase tracking-widest">详细描述</label>
        <textarea 
          ref={descriptionRef}
          placeholder="请描述您遇到的问题或建议..."
          className="w-full h-32 bg-bg-secondary border border-border-default rounded-2xl p-4 text-xs text-text-secondary focus:outline-none focus:border-blue-500 transition-all duration-300 resize-none"
          onChange={handleDescriptionChange}
        />
      </div>

      <div className="space-y-2 mb-8">
        <label className="text-[10px] text-text-muted font-black uppercase tracking-widest">附加凭证</label>
        
        <div 
          className={`border-2 border-dashed ${isDragging ? 'border-blue-500' : 'border-border-default'} rounded-2xl p-8 flex flex-col items-center justify-center group cursor-pointer hover:border-blue-500/40 transition-all duration-300 ${isDragging ? 'bg-blue-500/10' : 'bg-bg-secondary/20'}`}
          onClick={handleClickUpload}
          onDragStart={handleDragStart}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input 
            ref={fileInputRef}
            type="file" 
            multiple 
            accept=".jpg,.jpeg,.png,.pdf" 
            className="hidden"
            onChange={handleFileChange}
          />
          <Paperclip size={24} className="text-text-muted group-hover:text-blue-400 transition-colors duration-300 mb-2" />
          <div className="text-xs font-bold text-text-muted">点击或拖拽文件上传凭证</div>
          <div className="text-[9px] text-text-muted mt-1 uppercase">(JPG, PNG, PDF)</div>
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            <div className="text-[10px] text-text-muted font-black uppercase tracking-widest">已上传文件</div>
            <div className="bg-bg-secondary border border-border-default rounded-xl p-4 space-y-3">
              {files.map(file => (
                <div key={file.id} className="flex items-center justify-between p-2 bg-bg-secondary/60 rounded-lg border border-border-default">
                  <div className="flex items-center gap-3">
                    {getFileIcon(file.type)}
                    <div>
                      <div className="text-xs font-bold text-text-secondary truncate max-w-[200px]">{file.name}</div>
                      <div className="text-[9px] text-text-muted">{formatFileSize(file.size)}</div>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(file.id);
                    }}
                    className="p-1.5 bg-bg-tertiary/60 rounded-full hover:bg-red-500/20 hover:text-red-400 transition-colors duration-300"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <button 
        onClick={handleSubmitFeedback}
        className="w-full py-5 bg-bg-secondary text-text-primary text-sm font-black rounded-2xl shadow-xl hover:scale-[1.01] transition-all duration-300 active:scale-95 uppercase tracking-widest flex items-center justify-center gap-2"
      >
        <Send size={16} />
        提交反馈
      </button>
    </div>
  );
};

export default FeedbackForm;
