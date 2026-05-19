
import React, { useState, useCallback } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import { DashboardView } from './components/features/dashboard';
import { RouteOptimizationView } from './components/features/routing';
import { TrainingOptimizationView } from './components/features/training';
import { CarbonMonitoringView } from './components/features/carbon';
import { SettingsView } from './components/features/settings';
import { ComplianceSecurityView } from './components/features/compliance';
import { OrderManagementView } from './components/features/orders';
import { CustomerServiceView } from './components/features/customer-service';

// [DEMO MODE] 登录与鉴权已完全移除 — 直接进入仪表盘

const App: React.FC = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('pathoptix-sidebar-collapsed');
    return saved === 'true';
  });

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('pathoptix-sidebar-collapsed', String(next));
      return next;
    });
  }, []);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <DashboardView onViewChange={setActiveView} />;
      case 'route': return <RouteOptimizationView />;
      case 'opti': return <TrainingOptimizationView />;
      case 'carbon': return <CarbonMonitoringView onViewChange={setActiveView} />;
      case 'compliance': return <ComplianceSecurityView />;
      case 'orders': return <OrderManagementView />;
      case 'customer_service': return <CustomerServiceView />;
      case 'settings': return <SettingsView onLogout={() => setActiveView('dashboard')} />;
      default: return <DashboardView onViewChange={setActiveView} />;
    }
  };

  return (
    <div className="flex h-screen bg-bg-primary text-text-secondary overflow-hidden font-inter transition-colors duration-300">
      <Sidebar activeView={activeView} onViewChange={setActiveView} isCollapsed={isSidebarCollapsed} />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header onLogout={() => setActiveView('dashboard')} onViewChange={setActiveView} isSidebarCollapsed={isSidebarCollapsed} onToggleSidebar={toggleSidebar} />
        <div className="flex-1 overflow-y-auto">
          {renderView()}
        </div>
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/5 blur-[150px] rounded-full -z-10" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-500/5 blur-[120px] rounded-full -z-10" />
      </main>
    </div>
  );
};

export default App;
