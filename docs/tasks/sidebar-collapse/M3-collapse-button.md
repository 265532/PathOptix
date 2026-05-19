# M3: 折叠按钮 + Header 集成

> **模块**: M3 | **任务数**: 3 | **依赖**: M1 (需要 onToggleSidebar prop) + M2 (Sidebar 已适配)
> **需求依据**: [sidebar-collapse-requirement.md](../../sidebar-collapse-requirement.md) §3.3 (F-20~F-25) + D-03

---

## Task 3.1: 创建 CollapseToggle 组件

**新建文件**: `src/components/ui/CollapseToggle.tsx`

**组件规格**:

| 属性 | 值 |
|------|-----|
| Props 接口 | `interface CollapseToggleProps { isCollapsed: boolean; onToggle: () => void; className?: string; size?: 'sm' \| 'md' \| 'lg'; }` |
| 尺寸配置 | sm: `w-7 h-7`, md: `w-8 h-8` (默认), lg: `w-9 h-9` |
| 图标（展开态） | `PanelLeftClose` from lucide-react (size=16/18/20) |
| 图标（折叠态） | `PanelLeftOpen` from lucide-react (size=16/18/20) |
| aria-label | 动态: `"收起侧边栏"` / `"展开侧bar"` |
| hover 效果 | `hover:bg-bg-tertiary/50` 或 `hover:bg-bg-secondary` |
| 过渡动画 | `transition-colors duration-200` |

**参考实现**:
```typescript
import React from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

interface CollapseToggleProps {
  isCollapsed: boolean;
  onToggle: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeConfig = {
  sm: { container: 'w-7 h-7', icon: 14 },
  md: { container: 'w-8 h-8', icon: 16 },
  lg: { container: 'w-9 h-9', icon: 18 },
};

const CollapseToggle: React.FC<CollapseToggleProps> = ({
  isCollapsed,
  onToggle,
  className = '',
  size = 'md',
}) => {
  const config = sizeConfig[size];

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-tertiary/50 transition-colors duration-200 ${config.container} ${className}`}
      aria-label={isCollapsed ? '展开侧边栏' : '收起侧边栏'}
      aria-expanded={!isCollapsed}
    >
      {isCollapsed
        ? <PanelLeftOpen size={config.icon} />
        : <PanelLeftClose size={config.icon} />
      }
    </button>
  );
};

export default CollapseToggle;
```

**验证**:
- [ ] 组件文件创建于 `src/components/ui/CollapseToggle.tsx`
- [ ] Props 接口完整，无 any 类型
- [ ] 三种尺寸 (sm/md/lg) 均有对应配置
- [ ] aria-label 和 aria-expanded 正确动态生成

---

## Task 3.2: Header.tsx 左侧边框集成折叠按钮

**文件**: `src/components/layout/Header.tsx`

**集成位置**: Header 根容器左侧边缘，在 Header 内容区之前

**当前 Header 结构** (简化):
```tsx
<div className="bg-bg-secondary/60 ...">
  <HeaderContent ... />  {/* Logo, 搜索, 通知等 */}
</div>
```

**目标结构**:
```tsx
<div className="bg-bg-secondary/60 ... flex items-center">
  {/* 折叠按钮 — 位于最左侧 */}
  <CollapseToggle
    isCollapsed={isSidebarCollapsed}
    onToggle={onToggleSidebar}
    size="md"
    className="shrink-0 mr-2"
  />

  {/* 原 Header 内容 */}
  <HeaderContent ... />
</div>
```

**操作步骤**:
1. 文件顶部新增 import: `import CollapseToggle from '@ui/CollapseToggle';`
2. 在 HeaderProps 中确认/添加: `isCollapsed?: boolean; onToggleSidebar?: () => void;`
3. 在 Header JSX 返回的最外层 div 内部、现有内容之前插入 `<CollapseToggle>` 按钮
4. 按钮位置: 紧贴左边缘，与内容区间距 `mr-2` 或 `mr-3`
5. 确保 Header 的 flex 布局能容纳新按钮（不破坏原有布局）

**布局注意事项**:
- Header 当前可能使用 `flex items-center justify-between` 布局
- 新增按钮后需调整为 `flex items-center gap-X` 或在左侧区域包裹一个 flex 容器
- 按钮不应遮挡或挤压 Header 的其他元素

**验证**:
- [ ] CollapseToggle 按钮出现在 Header 左侧
- [ ] 点击按钮可切换 Sidebar 折叠状态
- [ ] 按钮图标正确切换（展开→关闭图标，折叠→打开图标）
- [ ] Header 内其他元素（Logo、搜索、通知、用户头像）布局不受影响
- [ ] 双主题下按钮样式正常

---

## Task 3.3: barrel 导出更新

**文件**: `src/components/ui/index.ts`

**当前导出列表** (假设):
```typescript
export { default as StatCard } from './StatCard';
export { default as ChartCard } from './ChartCard';
export { default as LoginView } from './LoginView';
export { default as ThemeToggle } from './ThemeToggle';
// ...
```

**新增导出**:
```typescript
export { default as CollapseToggle } from './CollapseToggle';
export { default as Tooltip } from './Tooltip';  // 如 M4 已创建
```

**验证**:
- [ ] index.ts 包含 `CollapseToggle` 导出
- [ ] 路径别名 `@ui/CollapseToggle` 可正常导入

---

## 完成标准

- [ ] Task 3.1: CollapseToggle 组件创建完成，3 种尺寸 + 双图标 + a11y
- [ ] Task 3.2: Header 左侧成功集成按钮，点击可触发 Sidebar 切换
- [ ] Task 3.3: barrel 导出已更新
- [ ] `npm run build` 构建成功
