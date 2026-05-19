import React, { useState, useEffect, useCallback } from 'react';
import { riskDashboardApi } from '@services';
import type { RiskDashboardData } from '@services';
import EmergencyAlertPanel from './EmergencyAlertPanel';
import CongestionMonitor from './CongestionMonitor';
import PatencyScore from './PatencyScore';

const RiskDashboardCenter: React.FC = () => {
  const [data, setData] = useState<RiskDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRiskData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const json = await riskDashboardApi.getRiskMetrics();
      setData(json);
    } catch (err) {
      console.error('[RiskDashboardCenter] 获取风险数据失败:', err);
      setError('获取风险数据失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRiskData();
  }, [fetchRiskData]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 animate-in fade-in duration-700 bg-bg-primary">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3"><SkeletonCard height="h-[360px]" /></div>
          <div className="lg:col-span-6"><SkeletonCard height="h-[420px]" /></div>
          <div className="lg:col-span-3"><SkeletonCard height="h-[360px]" /></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 flex items-center justify-center h-[600px]">
        <div className="text-center space-y-4">
          <div className="text-red-400 text-sm font-medium">{error || '数据加载异常'}</div>
          <button
            onClick={fetchRiskData}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all duration-300"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-700 bg-bg-primary">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3">
          <EmergencyAlertPanel news={data.news} />
        </div>
        <div className="lg:col-span-6">
          <CongestionMonitor metrics={data.metrics} />
        </div>
        <div className="lg:col-span-3">
          <PatencyScore score={data.metrics?.patency_rate ?? 0} />
        </div>
      </div>
    </div>
  );
};

const SkeletonCard = React.memo(({ height = 'h-[360px]' }: { height?: string }) => (
  <div className={`${height} bg-bg-secondary border border-border-default rounded-3xl p-8 animate-pulse`}>
    <div className="flex items-center gap-3 mb-8">
      <div className="w-8 h-8 bg-bg-tertiary rounded-full" />
      <div className="h-4 w-32 bg-bg-tertiary rounded" />
    </div>
    <div className="space-y-4">
      <div className="h-3 bg-bg-tertiary/60 rounded w-full" />
      <div className="h-3 bg-bg-tertiary/60 rounded w-4/5" />
      <div className="h-3 bg-bg-tertiary/60 rounded w-3/5" />
    </div>
  </div>
));

export default RiskDashboardCenter;
