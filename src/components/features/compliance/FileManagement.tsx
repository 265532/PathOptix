
import React, { useState, useRef } from 'react';
import { Folder, UploadCloud, FileText, CheckCircle2 } from 'lucide-react';
import type { UploadedFile } from '../../../types';

const FileManagement: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理文件上传
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (fileList) {
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      const newFiles: UploadedFile[] = [];

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        if (allowedTypes.includes(file.type)) {
          newFiles.push({
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            name: file.name,
            type: file.type,
            size: file.size
          });
        }
      }

      if (newFiles.length > 0) {
        setFiles([...files, ...newFiles]);
      }
    }
  };

  // 处理点击上传区域
  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  // 处理自动识别解析
  const handleAutoParse = () => {
    if (files.length === 0) return;

    setIsParsing(true);

    // 模拟10秒识别过程
    setTimeout(() => {
      setIsParsing(false);
      setShowSuccess(true);
      
      // 3秒后关闭成功提示
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }, 10000);
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="h-full bg-bg-secondary border border-border-default rounded-3xl p-4 md:p-6 flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Folder size={18} className="text-indigo-400" fill="currentColor" fillOpacity={0.2} />
          <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">合规文件管理</h3>
        </div>
        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded-full border border-emerald-500/20">已验证</span>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        {/* 文件上传区域 */}
        <div 
          className="flex-1 border-2 border-dashed border-border-default rounded-3xl flex flex-col items-center justify-center p-8 hover:border-indigo-500/40 transition-all duration-300 group cursor-pointer bg-bg-secondary/20"
          onClick={handleClickUpload}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.xlsx"
            className="hidden"
            onChange={handleFileUpload}
          />
          <div className="p-4 bg-bg-tertiary/40 rounded-full text-text-muted group-hover:text-indigo-400 transition-colors duration-300 mb-4 group-hover:scale-110">
            <UploadCloud size={32} />
          </div>
          <div className="text-sm font-bold text-text-secondary">上传合规文件</div>
          <div className="text-[10px] text-text-muted mt-2 font-medium">支持 PDF, XLSX 格式</div>
        </div>

        {/* 已上传文件列表 */}
        {files.length > 0 && (
          <div className="space-y-2">
            <div className="text-[10px] text-text-muted font-black uppercase tracking-widest">已上传文件</div>
            <div className="bg-bg-secondary/40 border border-border-default rounded-xl p-3 space-y-2">
              {files.map(file => (
                <div key={file.id} className="flex items-center justify-between p-2 bg-bg-secondary/60 rounded-lg border border-border-default">
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="text-indigo-400" />
                    <div className="text-xs font-bold text-text-secondary truncate max-w-[200px]">{file.name}</div>
                  </div>
                  <div className="text-[9px] text-text-muted">{formatFileSize(file.size)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 自动识别解析按钮 */}
        <button 
          onClick={handleAutoParse}
          disabled={isParsing || files.length === 0}
          className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-lg transition-all flex items-center justify-center gap-2 ${
            isParsing 
              ? 'bg-indigo-600/5 border border-indigo-600/10 text-indigo-400/50 cursor-not-allowed' 
              : files.length === 0
              ? 'bg-indigo-600/5 border border-indigo-600/10 text-indigo-400/50 cursor-not-allowed' 
              : 'bg-indigo-600/10 border border-indigo-600/30 text-indigo-400 hover:bg-indigo-600/20 shadow-indigo-600/5'
          }`}
        >
          {isParsing ? '识别中...' : '自动识别解析'}
        </button>

        {/* 成功提示 */}
        {showSuccess && (
          <div className="mt-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <CheckCircle2 size={14} className="text-emerald-500" />
            <span className="text-[10px] font-bold text-emerald-400">识别成功，文件已保存到数据库</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileManagement;
