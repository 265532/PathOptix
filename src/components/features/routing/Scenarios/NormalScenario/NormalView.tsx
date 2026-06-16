
import React from 'react';
import ComparisonTable from '../../ComparisonTable';
import SensitivityChart from '../../SensitivityChart';
import RobustDetail from '../../RobustDetail';
import { RlPathJson } from '@/services';

interface NormalViewProps {
  rlData?: RlPathJson | null;
  llmReport?: string;
  startLabel?: string;
  endLabel?: string;
}

const NormalView: React.FC<NormalViewProps> = ({ rlData, llmReport, startLabel, endLabel }) => {
  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-700">
      {/* Middle Grid: Comparison Table + Sensitivity Chart */}
      <div className="grid grid-cols-12 gap-4 md:gap-6 lg:gap-8">
        <div className="col-span-12 xl:col-span-8">
          <ComparisonTable rlData={rlData} startLabel={startLabel} endLabel={endLabel} />
        </div>
        <div className="col-span-12 xl:col-span-4">
          <SensitivityChart />
        </div>
      </div>

      {/* Bottom Section: Robust Detail */}
      <RobustDetail rlData={rlData} llmReport={llmReport} startLabel={startLabel} endLabel={endLabel} />
    </div>
  );
};

export default NormalView;
