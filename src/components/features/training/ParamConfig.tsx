
import React, { useState } from 'react';
import { SlidersHorizontal, Save, RotateCcw } from 'lucide-react';

interface ConfigState {
  learningRate: string;
  iterations: string;
  epsilon: string;
  gamma: string;
  batchSize: string;
  optimizer: boolean;
  dqn: boolean;
}

const ParamConfig: React.FC = () => {
  // 初始默认值
  const initialValues: ConfigState = {
    learningRate: "0.0005",
    iterations: "1500",
    epsilon: "0.1",
    gamma: "0.9",
    batchSize: "512",
    optimizer: true,
    dqn: true
  };

  // 当前表单编辑中的状态
  const [formData, setFormData] = useState<ConfigState>(initialValues);
  // 上次保存的状态（用于重置功能）
  const [savedData, setSavedData] = useState<ConfigState>(initialValues);

  const handleInputChange = (field: keyof ConfigState, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    setSavedData({ ...formData });
    alert("算法参数已成功保存！");
  };

  const handleReset = () => {
    setFormData({ ...savedData });
  };

  return (
    <div className="bg-bg-secondary rounded-2xl p-5 border border-border-default flex flex-col gap-5">
      <div className="flex items-center gap-2 text-text-secondary">
        <SlidersHorizontal size={16} className="text-cyan-400" />
        <span className="text-xs font-bold tracking-wider uppercase">算法参数配置</span>
      </div>

      <div className="space-y-4">
        <InputGroup 
          label="学习率" 
          value={formData.learningRate} 
          onChange={(val) => handleInputChange('learningRate', val)} 
        />
        <InputGroup 
          label="迭代次数" 
          value={formData.iterations} 
          onChange={(val) => handleInputChange('iterations', val)} 
        />
        <div className="flex gap-3">
          <InputGroup 
            label="探索率" 
            value={formData.epsilon} 
            onChange={(val) => handleInputChange('epsilon', val)} 
          />
          <InputGroup 
            label="折扣因子" 
            value={formData.gamma} 
            onChange={(val) => handleInputChange('gamma', val)} 
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] text-text-muted font-bold uppercase pl-1">批大小</label>
          <div className="relative">
            <select 
              value={formData.batchSize}
              onChange={(e) => handleInputChange('batchSize', e.target.value)}
              className="w-full bg-bg-modal border border-border-default rounded-lg py-2.5 px-3 text-xs text-text-secondary focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer"
            >
              <option value="128">128</option>
              <option value="256">256</option>
              <option value="512">512</option>
              <option value="1024">1024</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 9l6 6 6-6"/></svg>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <ToggleItem 
          label="优化器" 
          active={formData.optimizer} 
          onClick={() => handleInputChange('optimizer', !formData.optimizer)} 
        />
        <ToggleItem 
          label="对齐式DQN" 
          active={formData.dqn} 
          onClick={() => handleInputChange('dqn', !formData.dqn)} 
        />
      </div>

      <div className="flex gap-2 mt-2">
        <button 
          onClick={handleSave}
          className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-black rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/10 active:scale-95"
        >
          <Save size={14} /> 保存
        </button>
        <button 
          onClick={handleReset}
          title="恢复上次保存的值"
          className="px-4 py-3 bg-bg-tertiary hover:bg-bg-tertiary text-text-muted rounded-lg transition-all duration-300 border border-border-input active:scale-95"
        >
          <RotateCcw size={14} />
        </button>
      </div>
    </div>
  );
};

const InputGroup = ({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) => (
  <div className="space-y-2 flex-1">
    <label className="text-[10px] text-text-muted font-bold uppercase pl-1">{label}</label>
    <div className="relative group">
      <input 
        type="text" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-bg-modal border border-border-default rounded-lg py-2.5 px-3 text-xs text-cyan-400 font-mono focus:outline-none focus:border-cyan-500/50 transition-all duration-300 shadow-inner"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-text-primary pointer-events-none group-focus-within:text-cyan-900 transition-colors duration-300">VAL</div>
    </div>
  </div>
);

const ToggleItem = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
  <div className="flex items-center justify-between group cursor-pointer" onClick={onClick}>
    <span className="text-[10px] text-text-muted font-bold uppercase transition-colors duration-300 group-hover:text-text-muted text-text-secondary">{label}</span>
    <div className={`w-10 h-5 rounded-full p-1 flex items-center transition-all duration-300 ${active ? 'bg-cyan-500' : 'bg-bg-tertiary'}`}>
      <div className={`w-3 h-3 bg-white rounded-full shadow-md transition-transform duration-300 ${active ? 'translate-x-5' : 'translate-x-0'}`} />
    </div>
  </div>
);

export default ParamConfig;
