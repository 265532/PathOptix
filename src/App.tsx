
import React, { useState, useCallback, useEffect } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import useBreakpoint from './hooks/useBreakpoint';
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
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';

  const [activeView, setActiveView] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('pathoptix-sidebar-collapsed');
    return saved === 'true';
  });
  const [isMobileSidebarVisible, setIsMobileSidebarVisible] = useState(false);

  // 窗口断点变化时自动调整 Sidebar 状态
  useEffect(() => {
    if (isMobile) {
      // 移动端：隐藏侧边栏
      setIsMobileSidebarVisible(false);
    } else if (isTablet) {
      // 平板：自动折叠为图标模式
      setIsMobileSidebarVisible(false);
      setIsSidebarCollapsed(true);
      localStorage.setItem('pathoptix-sidebar-collapsed', 'true');
    }
    // 桌面端：保持用户上次的折叠偏好，不做强制修改
  }, [isMobile, isTablet]);

  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setIsMobileSidebarVisible(prev => !prev);
    } else {
      setIsSidebarCollapsed(prev => {
        const next = !prev;
        localStorage.setItem('pathoptix-sidebar-collapsed', String(next));
        return next;
      });
    }
  }, [isMobile]);

  const closeMobileSidebar = useCallback(() => {
    setIsMobileSidebarVisible(false);
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
      {/* 移动端遮罩层 */}
      {isMobile && isMobileSidebarVisible && (
        <div
          className="fixed inset-0 bg-black/60 z-40 transition-opacity duration-300"
          onClick={closeMobileSidebar}
        />
      )}

      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        isCollapsed={isMobile ? false : isSidebarCollapsed}
        isMobileOverlay={isMobile}
        isMobileVisible={isMobileSidebarVisible}
        onMobileClose={closeMobileSidebar}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* 移动端汉堡菜单按钮 */}
        {isMobile && (
          <button
            onClick={() => setIsMobileSidebarVisible(true)}
            className="absolute top-4 left-4 z-10 p-2 rounded-xl bg-bg-secondary/80 border border-border-default text-text-secondary hover:text-brand-primary hover:border-brand-primary/30 transition-all duration-300 backdrop-blur-sm"
            aria-label="打开菜单"
          >
            <Menu size={20} />
          </button>
        )}

        <Header onLogout={() => setActiveView('dashboard')} onViewChange={setActiveView} isSidebarCollapsed={isMobile ? false : isSidebarCollapsed} onToggleSidebar={toggleSidebar} />
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
