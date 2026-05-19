# M3: 主题 UI 控件模块 — 实施任务

> **模块编号**: M3
> **前置依赖**: M1 (基础设施), M2 (状态管理)
> **预估工时**: 1 小时
> **风险等级**: 低

---

## 模块目标

创建 ThemeToggle 图标按钮组件，作为用户切换明暗主题的唯一交互入口。组件位于 Header 右上角，使用 Sun/Moon 图标，带平滑过渡动画。

---

## Task 3.1: 创建 ThemeToggle 组件

**新建文件**: `src/components/ui/ThemeToggle.tsx`

**注意**: 项目中**没有** `cn()` 工具函数（clsx/twMerge），本组件使用基础模板字符串方式处理类名合并。

- [ ] **Step 1: 创建 ThemeToggle.tsx**

```typescript
import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@hooks/useTheme';
import type { Theme } from '@contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeConfig = {
  sm: { button: 'w-7 h-7', icon: 14 },
  md: { button: 'w-9 h-9', icon: 18 },
  lg: { button: 'w-11 h-11', icon: 22 },
};

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', size = 'md' }) => {
  const { theme, toggleTheme, isDark } = useTheme();
  const config = sizeConfig[size];

  const label = isDark ? '切换到亮色模式' : '切换到暗色模式';

  return (
    <button
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-200 transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2 ${config.button} ${className}`}
      aria-label={label}
      title={label}
      type="button"
    >
      <Sun
        className={`absolute transition-all duration-300 ease-in-out ${
          isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
        }`}
        size={config.icon}
      />
      <Moon
        className={`absolute transition-all duration-300 ease-in-out ${
          isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
        }`}
        size={config.icon}
      />
    </button>
  );
};

export default ThemeToggle;
```

**关键设计说明**:
- 使用 `absolute` 定位让 Sun/Moon 图标重叠在同一位置，通过 `scale` + `opacity` + `rotate` 实现切换动画
- `focus-visible:ring` 使用 CSS 变量 `var(--color-brand-primary)` 自动跟随主题色
- `aria-label` 动态生成，符合无障碍规范
- 默认 `size='md'` 匹配 Header 工具栏尺寸

- [ ] **Step 2: 更新 UI 组件 barrel 导出**

**修改文件**: `src/components/ui/index.ts`

当前内容:
```typescript
export { default as ChartCard } from './ChartCard';
export { default as StatCard } from './StatCard';
export { default as MapWidget } from './MapWidget';
export { default as AlertPanel } from './AlertPanel';
```

替换为:
```typescript
export { default as ChartCard } from './ChartCard';
export { default as StatCard } from './StatCard';
export { default as MapWidget } from './MapWidget';
export { default as AlertPanel } from './AlertPanel';
export { default as ThemeToggle } from './ThemeToggle';
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/ThemeToggle.tsx src/components/ui/index.ts
git commit -m "feat(M3): create ThemeToggle component with Sun/Moon icon transition animation"
```

---

## Task 3.2: 将 ThemeToggle 集成到 Header

**修改文件**: `src/components/layout/Header.tsx`

**插入位置**: Header 右侧区域，延迟指示器之后、通知铃铛之前（第 103 行附近）

当前代码结构（右侧区域，L97-L103）:
```tsx
<div className="flex items-center gap-6">
  {/* 延迟指示器 */}
  <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
    <Activity size={14} />
    <span>延迟: 24ms</span>
  </div>

  <div className="h-10 w-px bg-slate-800 mx-2" />

  {/* ← 在此插入 ThemeToggle */}

  {/* 通知铃铛 */}
  <div className="relative" ref={notificationRef}>
```

- [ ] **Step 1: 在 Header.tsx 顶部添加 import**

在现有 import 行后添加:
```typescript
import ThemeToggle from '@ui/ThemeToggle';
```

- [ ] **Step 2: 在分隔线之后、通知铃铛之前插入 ThemeToggle**

找到:
```tsx
<div className="h-10 w-px bg-slate-800 mx-2" />
```

在其**下方**添加:
```tsx
<ThemeToggle />
```

插入后该区域的代码变为:
```tsx
<div className="flex items-center gap-6">
  <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
    <Activity size={14} />
    <span>延迟: 24ms</span>
  </div>

  <div className="h-10 w-px bg-slate-800 mx-2" />

  <ThemeToggle />

  <div className="relative" ref={notificationRef}>
    {/* ... 通知铃铛 ... */}
```

- [ ] **Step 3: 验证**

```bash
npm run dev
```

预期效果:
- Header 右侧区域出现太阳/月亮图标按钮（当前为暗色模式，显示月亮图标 ☑️）
- 点击按钮 → 图标旋转切换为太阳 → 页面整体颜色变化（如果 M4/M5/M6 尚未完成适配，则仅看到 Toggle 自身动画和 HTML 属性变化）
- hover 时显示 tooltip "切换到亮色模式"

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Header.tsx
git commit -m "feat(M3): integrate ThemeToggle into Header toolbar"
```

---

## Task 3.3: 可选 — 为 ThemeToggle 编写单元测试

- [ ] **Step 1: 创建测试文件**

**新建文件**: `src/components/ui/__tests__/ThemeToggle.test.ts`

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '../../../contexts/ThemeContext';
import ThemeToggle from '../ThemeToggle';

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
};

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.removeItem('pathoptix-theme');
  });

  it('should render a button with aria-label', () => {
    renderWithTheme(<ThemeToggle />);

    const button = screen.getByRole('button', { name: /切换到/ });
    expect(button).toBeInTheDocument();
  });

  it('should show moon icon in dark mode by default', () => {
    renderWithTheme(<ThemeToggle />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', '切换到亮色模式');
  });

  it('should call toggleTheme on click', () => {
    renderWithTheme(<ThemeToggle />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(localStorage.getItem('pathoptix-theme')).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('should support size prop', () => {
    const { container } = renderWithTheme(<ThemeToggle size="lg" />);

    const button = container.querySelector('button');
    expect(button?.className).toContain('w-11');
  });
});
```

- [ ] **Step 2: 运行测试**

```bash
npm test -- --testPathPattern="ThemeToggle" --verbose
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/__tests__/ThemeToggle.test.ts
git commit -m "test(M3): add unit tests for ThemeToggle component"
```

---

## 完成标准 Checklist

- [ ] `src/components/ui/ThemeToggle.tsx` 已创建并导出
- [ ] `src/components/ui/index.ts` 已更新 barrel 导出
- [ ] `src/components/layout/Header.tsx` 已集成 ThemeToggle（延迟指示器之后）
- [ ] 点击 Toggle 能触发主题切换（DOM 属性变化可见）
- [ ] Sun/Moon 图标切换动画流畅（300ms rotate+scale+opacity）
- [ ] 单元测试通过
- [ ] `npm run build` 成功

---

## 向下游模块提供的接口

| 接口 | 签名 | 文件 | 消费者 |
|------|------|------|--------|
| `<ThemeToggle>` | `(props: ThemeToggleProps) => JSX.Element` | `src/components/ui/ThemeToggle.tsx` | M4 (Header) |
| 导出名 | `ThemeToggle` | `src/components/ui/index.ts` | 任意导入方 |
