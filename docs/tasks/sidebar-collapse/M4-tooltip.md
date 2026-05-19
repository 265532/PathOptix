# M4: Tooltip 组件

> **模块**: M4 | **任务数**: 2 | **依赖**: 无（独立组件，M2 消费）
> **需求依据**: [sidebar-collapse-requirement.md](../../sidebar-collapse-requirement.md) §3.4 (F-30~F-35) + D-12

---

## Task 4.1: 创建 Tooltip 组件

**新建文件**: `src/components/ui/Tooltip.tsx`

**设计决策**:

| 决策项 | 选择 |
|--------|------|
| 实现方式 | **纯 CSS + data-attribute 方案**（轻量，无额外依赖） |
| 触发方式 | CSS `:hover` 伪类 + `::after` 伪元素 |
| 位置 | 目标元素**右侧**水平居中对齐 |
| 动画 | CSS `opacity` + `translate` 过渡 ~150ms |
| z-index | `z-50`（确保在 Sidebar 之上但不遮盖 Header） |

### 组件接口

```typescript
interface TooltipProps {
  content: string;           // Tooltip 显示文本
  children: React.ReactNode;  // 触发元素（菜单项图标/按钮等）
  position?: 'top' | 'right' | 'bottom' | 'left';  // 默认 'right'
  className?: string;
}
```

### 参考实现

```typescript
import React from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

const positionStyles = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-3',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-3',
};

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'right',
  className = '',
}) => {
  return (
    <div className={`relative inline-flex group ${className}`}>
      {children}
      {/* Tooltip 内容 */}
      <div
        className={`
          absolute ${positionStyles[position]}
          px-3 py-1.5
          bg-bg-elevated/95 backdrop-blur-sm
          border border-border-default
          rounded-lg shadow-sm
          text-text-primary text-xs font-medium
          whitespace-nowrap
          pointer-events-none
          opacity-0 group-hover:opacity-100
          transition-opacity duration-150
          z-50
        `}
      >
        {content}
        {/* 小箭头 */}
        <span className={`absolute w-1.5 h-1.5 bg-bg-elevated border-border-default rotate-45 ${
          position === 'right' ? '-left-[5px] top-1/2 -translate-y-1/2 border-b border-r' :
          position === 'left' ? '-right-[5px] top-1/2 -translate-y-1/2 border-b border-l' :
          position === 'top' ? 'bottom-[-5px] left-1/2 -translate-x-1/2 border-r border-b' :
          'top-[-5px] left-1/2 -translate-x-1/2 border-t border-l'
        }`} />
      </div>
    </div>
  );
};

export default Tooltip;
```

**关键特性**:
- 使用 CSS `group` + `group-hover:` 实现 hover 触发（Tailwind 原生支持）
- `pointer-events-none`: 确保 Tooltip 不干扰鼠标事件（避免闪烁）
- `whitespace-nowrap`: 防止长文本换行
- 小箭头指示器: 通过旋转的伪元素边框实现三角形箭头
- 四方向定位: 通过 position prop 切换 CSS 类

**验证**:
- [ ] 文件创建于 `src/components/ui/Tooltip.tsx`
- [ ] Props 接口完整，无 any 类型
- [ ] 支持 4 个方向的 Tooltip 定位
- [ ] hover 时淡入 (opacity 0→1, 150ms)
- [ ] 鼠标移出时自动消失
- [ ] 样式使用 Design Token 语义类（bg-bg-elevated, text-text-primary, border-border-default）

---

## Task 4.2: Sidebar 菜单项集成 Tooltip

**文件**: `src/components/layout/Sidebar.tsx`

**集成位置**: Task 2.4 中改造后的菜单项 `<button>` 内部

**前提条件**:
- M4 Task 4.1 的 Tooltip 组件已创建
- M2 Task 2.4 的菜单项条件渲染已完成

**操作步骤**:

1. 文件顶部新增 import:
   ```typescript
   import Tooltip from '@ui/Tooltip';
   ```

2. 在折叠态菜单项中，用 `<Tooltip>` 包裹图标:
   ```tsx
   <button ... title={isCollapsed ? item.label : undefined}>
     <Tooltip content={item.label} position="right">
       <span className={...}>{item.icon}</span>
     </Tooltip>

     {!isCollapsed && (
       <span className="font-bold text-base">{item.label}</span>
     )}
     ...
   </button>
   ```

3. 注意事项:
   - 仅在 `isCollapsed` 时需要 Tooltip（展开时有文字标签，不需要）
   - 但为简化代码逻辑，可始终包裹 Tooltip 组件（Tooltip 自身不渲染任何可见内容在非 hover 时）
   - 移除 `title` 属性（改用自定义 Tooltip 替代原生 title）

**验证**:
- [ ] 折叠模式下鼠标悬停菜单项 → 右侧弹出 Tooltip 显示中文 label
- [ ] 展开模式下悬停 → 无 Tooltip（或 Tooltip 存在不影响视觉）
- [ ] Tooltip 样式与全局 Design Token 一致
- [ ] 快速移过多个菜单项 → Tooltip 不滞后/不重叠

---

## 完成标准

- [ ] Task 4.1: Tooltip 组件创建完成，4 向定位 + hover 动画 + 箭头
- [ ] Task 4.2: Sidebar 菜单项正确集成 Tooltip（仅折叠态生效）
- [ ] `npm run build` 构建成功
