# M6: 测试与回归验证

> **模块**: M6 | **任务数**: 3 | **依赖**: M1~M5 全部完成
> **需求依据**: [sidebar-collapse-requirement.md](../../sidebar-collapse-requirement.md) §6 (验收标准) + §4 (非功能需求)

---

## Task 6.1: 核心逻辑单元测试

**新建文件**: `src/components/layout/__tests__/SidebarCollapse.test.tsx`

### 测试覆盖范围

| 测试场景 | 验证内容 | 优先级 |
|---------|---------|--------|
| 默认状态 | isCollapsed 初始值为 `false`（localStorage 无记录时） | P0 |
| localStorage 读取 | 有记录 `'true'` 时初始为 collapsed，`'false'` 时为 expanded | P0 |
| toggle 切换 | 每次调用 toggle 在 true/false 间交替 | P0 |
| localStorage 写入 | 每次 toggle 后 localStorage 值正确更新 | P0 |
| Props 传递 | Sidebar 和 Header 正确接收 isCollapsed 和 onToggleSidebar | P0 |

### 参考测试代码

```typescript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '../../../contexts/ThemeContext';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// 简化的 App 包装组件（仅包含 sidebar collapse 相关逻辑）
const TestApp: React.FC<{ initialCollapsed?: boolean }> = ({ initialCollapsed }) => {
  const [isCollapsed, setIsCollapsed] = React.useState(() => {
    if (initialCollapsed !== undefined) return initialCollapsed;
    const saved = localStorage.getItem('pathoptix-sidebar-collapsed');
    return saved === 'true';
  });

  const toggleSidebar = React.useCallback(() => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('pathoptix-sidebar-collapsed', String(next));
      return next;
    });
  }, []);

  return (
    <ThemeProvider>
      <div data-testid="app">
        <button data-testid="toggle" onClick={toggleSidebar}>Toggle</button>
        <span data-testid="state">{String(isCollapsed)}</span>
        <span data-testid="sidebar-width">{isCollapsed ? 'w-16' : 'w-80'}</span>
      </div>
    </ThemeProvider>
  );
};

describe('Sidebar Collapse State Management', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('默认状态', () => {
    it('should default to expanded (false) when no localStorage value', () => {
      render(<TestApp />);
      expect(screen.getByTestId('state').textContent).toBe('false');
      expect(screen.getByTestId('sidebar-width').textContent).toBe('w-80');
    });
  });

  describe('localStorage 持久化', () => {
    it('should read collapsed state from localStorage', () => {
      localStorageMock.setItem('pathoptix-sidebar-collapsed', 'true');
      render(<TestApp />);
      expect(screen.getByTestId('state').textContent).toBe('true');
    });

    it('should read expanded state from localStorage', () => {
      localStorageMock.setItem('pathoptix-sidebar-collapsed', 'false');
      render(<TestApp />);
      expect(screen.getByTestId('state').textContent).toBe('false');
    });
  });

  describe('toggle 切换', () => {
    it('should toggle between expanded and collapsed', async () => {
      const { container } = render(<TestApp />);

      // 初始展开
      expect(screen.getByTestId('state').textContent).toBe('false');

      // 点击切换 → 折叠
      fireEvent.click(screen.getByTestId('toggle'));
      expect(screen.getByTestId('state').textContent).toBe('true');
      expect(localStorageMock.getItem('pathoptix-sidebar-collapsed')).toBe('true');

      // 再次点击 → 展开
      fireEvent.click(screen.getByTestId('toggle'));
      expect(screen.getByTestId('state').textContent).toBe('false');
      expect(localStorageMock.getItem('pathoptix-sidebar-collapsed')).toBe('false');
    });

    it('should persist each toggle to localStorage', () => {
      render(<TestApp />);

      fireEvent.click(screen.getByTestId('toggle'));
      expect(localStorageMock.getItem('pathoptix-sidebar-collapsed')).toBe('true');

      fireEvent.click(screen.getByTestId('toggle'));
      expect(localStorageMock.getItem('pathoptix-sidebar-collapsed')).toBe('false');

      fireEvent.click(screen.getByTestId('toggle'));
      expect(localStorageMock.getItem('pathoptix-sidebar-collapsed')).toBe('true');
    });
  });
});
```

**验证**:
- [ ] 测试文件创建于 `src/components/layout/__tests__/SidebarCollapse.test.tsx`
- [ ] 5 个测试用例全部通过
- [ ] 覆盖率: 核心逻辑 ≥80%

---

## Task 6.2: 各业务模块视觉回归验证

**目的**: 确保 Sidebar 折叠后各业务页面布局无异常。

### 验证方法

对以下每个页面/模块进行视觉检查：

| # | 模块 | 文件路径 | 检查项 |
|---|------|---------|--------|
| 1 | Dashboard | `features/dashboard/*.tsx` | 卡片网格自适应、StatChart 正常显示 |
| 2 | 订单管理 | `features/orders/OrderMainTable.tsx` | 表格宽度自适应、无水平滚动条 |
| 3 | 路径优化 | `features/routing/RouteOptimizationView.tsx` | 地图容器自适应 |
| 4 | 训练优化 | `features/training/*` | 图表/卡片正常 |
| 5 | 碳监测 | `features/carbon/CarbonMonitoringView.tsx` | 图表/Toast 正常 |
| 6 | 合规安全 | `features/compliance/ComplianceSecurityView.tsx` | 数据展示完整 |
| 7 | 客户服务 | `features/customer-service/*` | 布局正常 |
| 8 | 系统设置 | `features/settings/*` | 表单/选项卡正常 |
| 9 | 登录页 | `features/auth/LoginView.tsx` | 居中布局不受影响 |

### 检查命令

```bash
# 构建确认
npm run build

# 启动开发服务器
npm run dev

# 手动检查清单:
# 1. 打开浏览器 → 确认展开态（与修改前一致）
# 2. 点击折叠按钮 → 确认:
#    a) Sidebar 缩窄至图标模式
#    b) 主内容区变宽
#    c) 各菜单项 hover 显示 Tooltip
#    d) 底部显示简化百分比
# 3. 逐一点击 8 个业务模块 → 确认无布局异常
# 4. 再次点击按钮 → 确认恢复展开态（无回归）
```

### 回归风险点

| 风险点 | 文件 | 影响 | 应对 |
|--------|------|------|------|
| 固定宽度依赖 | 某些组件可能硬编码了 `calc(100vw - 320px)` 等 | 布局错位 | 改用 flex 自适应或百分比 |
| 绝对定位元素 | 使用 `left: 320px` 定位的元素 | 位置偏移 | 改用相对定位或 CSS 变量 |
| Canvas/SVG | 地图/图表可能监听 resize 重绘 | 显示异常 | 确认 ResizeObserver 触发重绘 |

**验证**:
- [ ] 展开态: 所有 9 个模块与修改前视觉效果一致（零回归）
- [ ] 折叠态: 所有 9 个模块主内容区自动扩展，无截断/溢出/重叠
- [ ] 切换过程: 动画流畅，无闪烁/白屏

---

## Task 6.3: 双主题兼容性验证

**目的**: 确认 Sidebar 折叠功能在 Dark/Light 两种主题下均正常工作。

### 验证矩阵

| 组合 | Sidebar | 按钮 | Tooltip | 底部卡片 | 菜单项 | 主内容区 |
|------|---------|------|---------|---------|--------|---------|
| Dark + 展开 | ✅ | ✅ | N/A | ✅ | ✅ | ✅ |
| Dark + 折叠 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Light + 展开 | ✅ | ✅ | N/A | ✅ | ✅ | ✅ |
| Light + 折叠 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### 检查项

**Dark 主题折叠态**:
- [ ] Sidebar 背景: `bg-bg-primary` (dark token)
- [ ] 图标颜色: inactive → `text-text-muted`, active → `text-brand-primary`
- [ ] Tooltip: `bg-bg-elevated` (dark), 文字可读
- [ ] 折叠按钮: 图标清晰可见
- [ ] 激活指示横条: `bg-brand-primary` 发光效果可见

**Light 主题折叠态**:
- [ ] Sidebar 背景: `bg-bg-primary` (light token, #F8FAFC)
- [ ] 图标颜色: 对比度足够（text-muted on bg-primary）
- [ ] Tooltip: `bg-bg-elevated` (light), 文字可读（注意 V-01 text-muted 对比度问题）
- [ ] 折叠按钮: 图标清晰可见
- [ ] 激活指示横条: 可见

**主题切换 + 折叠联动的边界情况**:
- [ ] Dark 展开态 → 切换 Light → 保持展开 → 视觉正确
- [ ] Dark 折叠态 → 切换 Light → 保持折叠 → 视觉正确
- [ ] Light 展开态 → 折叠 → 再切回 Dark → 无样式残留

**验证**:
- [ ] 4 种组合全部通过
- [ ] 主题切换动画(300ms) 与折叠动画不冲突
- [ ] 无 FOUC（主题+折叠状态均从 localStorage 正确恢复）

---

## 完成标准

- [ ] Task 6.1: 单元测试 5 用例全通过，覆盖率 ≥80%
- [ ] Task 6.2: 9 个业务模块 × 2 种模式 = 18 个检查点全部通过
- [ ] Task 6.3: 2 主题 × 2 模式 = 4 种组合 + 3 个边界情况全部通过
- [ ] `npm run build` + `npm run test` 全绿
