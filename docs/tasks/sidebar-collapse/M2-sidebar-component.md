# M2: Sidebar 组件适配 — 折叠/展开双模式 UI

> **模块**: M2 | **任务数**: 5 | **依赖**: M1（需要 isCollapsed prop）
> **需求依据**: [sidebar-collapse-requirement.md](../../sidebar-collapse-requirement.md) §3.2 (F-10~F-15) + D-02/D-06/D-10/D-11

---

## Task 2.1: SidebarProps 接口扩展

**文件**: `src/components/layout/Sidebar.tsx`

**当前接口** (L5-L8):
```typescript
interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}
```

**目标接口**:
```typescript
interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isCollapsed?: boolean;  // 新增
}
```

**操作步骤**:
1. 在 SidebarProps 中新增 `isCollapsed?: boolean`
2. 解构时获取: `const { activeView, onViewChange, isCollapsed = false } = props;`

---

## Task 2.2: 容器宽度动态切换

**文件**: `src/components/layout/Sidebar.tsx` L22

**当前代码**:
```tsx
<div className="w-80 bg-bg-primary border-r border-border-default flex flex-col h-full shrink-0 transition-all duration-300 shadow-sm">
```

**目标代码**:
```tsx
<div className={`bg-bg-primary border-r border-border-default flex flex-col h-full shrink-0 transition-all duration-300 ease-in-out shadow-sm overflow-hidden ${
  isCollapsed ? 'w-16' : 'w-80'
}`}>
```

**关键变更**:
- `w-80` → 条件渲染: `{ isCollapsed ? 'w-16' : 'w-80' }`
- 添加 `overflow-hidden` 防止折叠时内容溢出
- 添加 `ease-in-out` 缓动函数（更平滑）
- 保持 `transition-all duration-300`

**验证**:
- [ ] 展开态: `w-80` (320px)
- [ ] 折叠态: `w-16` (64px)
- [ ] 有 `transition-all duration-300 ease-in-out`

---

## Task 2.3: Logo 区域条件渲染

**文件**: `src/components/layout/Sidebar.tsx` L23-L28

**当前代码**:
```tsx
<div className="p-8 flex items-center gap-4">
  <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
    <Box className="text-black" size={24} />
  </div>
  <span className="text-xl font-black tracking-tighter text-text-primary uppercase italic">PathOptix</span>
</div>
```

**目标代码**:
```tsx
<div className={`flex items-center ${isCollapsed ? 'justify-center p-4' : 'p-8 gap-4'}`}>
  <div className={`bg-cyan-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)] ${
    isCollapsed ? 'w-9 h-9' : 'w-10 h-10'
  }`}>
    <Box className="text-black" size={isCollapsed ? 20 : 24} />
  </div>
  {!isCollapsed && (
    <span className="text-xl font-black tracking-tighter text-text-primary uppercase italic">PathOptix</span>
  )}
</div>
```

**行为差异**:

| 属性 | 展开态 | 折叠态 |
|------|--------|--------|
| padding | `p-8` | `p-4`（更紧凑） |
| 布局方向 | `flex row gap-4` | `flex col justify-center` |
| 图标容器 | `w-10 h-10`, icon `size=24` | `w-9 h-9`, icon `size=20`（略缩小） |
| 文字 | 显示「PathOptix」 | **隐藏** |

**验证**:
- [ ] 展开态: Box图标(24px) + PathOptix文字，水平排列
- [ ] 折叠态: 仅 Box图标(20px)，垂直居中，无文字
- [ ] 品牌发光效果(`shadow-[...]`) 在两种模式下均保留

---

## Task 2.4: 菜单项条件渲染

**文件**: `src/components/layout/Sidebar.tsx` L31-L49

**当前代码** (每个菜单项 button):
```tsx
<button
  key={item.id}
  onClick={() => onViewChange(item.id)}
  className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl ...`}
>
  <span className={...}>{item.icon}</span>
  <span className="font-bold text-base">{item.label}</span>
  {activeView === item.id && (
    <div className="ml-auto w-2 h-2 rounded-full bg-brand-primary ..." />
  )}
</button>
```

**目标代码**:
```tsx
<button
  key={item.id}
  onClick={() => onViewChange(item.id)}
  className={`relative w-full flex items-center ${isCollapsed ? 'justify-center px-3 py-3' : 'gap-4 px-5 py-4'} rounded-xl transition-all duration-300 group ${
    activeView === item.id
      ? 'bg-bg-secondary border border-brand-primary/10 text-brand-primary shadow-[inset_0_0_20px_rgba(34,211,238,0.05)]'
      : 'text-text-muted hover:text-text-secondary hover:bg-bg-tertiary/30'
  }`}
  title={isCollapsed ? item.label : undefined}
>
  {/* 图标 */}
  <span className={activeView === item.id ? 'text-brand-primary' : 'text-text-muted group-hover:text-text-secondary'}>
    {item.icon}
  </span>

  {/* 文字 — 展开时显示 */}
  {!isCollapsed && (
    <span className="font-bold text-base">{item.label}</span>
  )}

  {/* 激活指示器 */}
  {activeView === item.id && (
    isCollapsed ? (
      /* 折叠态: 底部横条 */
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-brand-primary" />
    ) : (
      /* 展开态: 右侧圆点 */
      <div className="ml-auto w-2 h-2 rounded-full bg-brand-primary shadow-[0_0_10px_rgba(34,211,238,1)]" />
    )
  )}
</button>
```

**行为差异**:

| 元素 | 展开态 | 折叠态 |
|------|--------|--------|
| 布局 | `flex-row gap-4 px-5 py-4` | `justify-center px-3 py-3`（紧凑居中） |
| 图标 | 正常尺寸(20px) | 正常尺寸(20px)，居中 |
| 文字 label | **显示** (`font-bold text-base`) | **隐藏** |
| 激活指示器 | 右侧圆点 (`ml-auto w-2 h-2`) | **底部横条** (`absolute -bottom-1 w-6 h-0.5`) |
| Tooltip | 无需 | `title={item.label}` 原生 tooltip 或集成 Tooltip 组件 |

**验证**:
- [ ] 展开态: 图标+文字+右侧圆点，与当前视觉效果一致
- [ ] 折叠态: 仅图标居中，激活项有底部横条
- [ ] hover 样式在两种模式下均正常
- [ ] `title` 属性在折叠态下提供基础 tooltip（M4 可升级为自定义 Tooltip）

---

## Task 2.5: 底部统计卡片简化 + 分隔标题处理

**文件**: `src/components/layout/Sidebar.tsx` L51-L81

### 2.5a: 「系统管理」分隔标题 (L51)

**当前代码**:
```tsx
<div className="mt-10 px-5 pb-3 text-[10px] uppercase tracking-[0.2em] text-text-muted font-black">系统管理</div>
```

**目标代码**:
```tsx
{!isCollapsed && (
  <div className="mt-10 px-5 pb-3 text-[10px] uppercase tracking-[0.2em] text-text-muted font-black">系统管理</div>
)}
{isCollapsed && <div className="mt-6 mx-auto w-8 h-px bg-border-default" />}
```

**行为**: 展开时显示「系统管理」文字；折叠时替换为一条细分隔线。

### 2.5b: 设置菜单项 (L53-L66)

同 Task 2.4 的模式改造，与普通菜单项保持一致。

### 2.5c: 底部统计卡片 (L71-L81)

**当前代码**:
```tsx
<div className="p-6 mt-auto">
  <div className="bg-bg-secondary rounded-xl p-5 border border-border-default space-y-3">
    <div className="flex justify-between items-center">
      <span className="text-xs font-bold text-text-muted">总体优化率</span>
      <span className="text-brand-primary font-black">78%</span>
    </div>
    <div className="w-full h-1.5 bg-bg-primary rounded-full overflow-hidden">
      <div className="h-full bg-brand-primary rounded-full w-[78%] shadow-[0_0_8px_rgba(6,182,212,0.4)]" />
    </div>
  </div>
</div>
```

**目标代码**:
```tsx
<div className={`${isCollapsed ? 'p-3 mt-auto' : 'p-6 mt-auto'}`}>
  <div className={`bg-bg-secondary rounded-xl border border-border-default ${
    isCollapsed ? 'p-3 flex flex-col items-center space-y-1' : 'p-5 space-y-3'
  }`}>
    {isCollapsed ? (
      /* 折叠态: 仅百分比 */
      <>
        <span className="text-xs font-bold text-brand-primary">78%</span>
        <div className="w-8 h-1 bg-bg-primary rounded-full overflow-hidden">
          <div className="h-full bg-brand-primary rounded-full w-[78%]" />
        </div>
      </>
    ) : (
      /* 展开态: 完整卡片 */
      <>
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-text-muted">总体优化率</span>
          <span className="text-brand-primary font-black">78%</span>
        </div>
        <div className="w-full h-1.5 bg-bg-primary rounded-full overflow-hidden">
          <div className="h-full bg-brand-primary rounded-full w-[78%] shadow-[0_0_8px_rgba(6,182,212,0.4)]" />
        </div>
      </>
    )}
  </div>
</div>
```

**行为差异**:

| 属性 | 展开态 | 折叠态 |
|------|--------|--------|
| padding | `p-6` | `p-3`（紧凑） |
| 卡片内布局 | `space-y-3` 纵向堆叠 | `flex-col items-center` 居中 |
| 标签文字 | **显示**「总体优化率」 | **隐藏** |
| 百分比 | 显示 | **显示**（核心信息保留） |
| 进度条 | `w-full h-1.5` | 缩小为 `w-8 h-1` |

**验证**:
- [ ] 展开态: 底部卡片与当前视觉效果完全一致（无回归）
- [ ] 折叠态: 仅显示 `78%` + 迷你进度条，居中对齐
- [ ] 「系统管理」标题: 展开时显示文字，折叠时显示分隔线

---

## 完成标准

- [ ] Task 2.1: Props 接口扩展完成
- [ ] Task 2.2: 容器宽度 w-80 ↔ w-16 切换正确
- [ ] Task 2.3: Logo 区域展开=图标+文字, 折叠=仅图标居中
- [ ] Task 2.4: 菜单项展开=完整, 折叠=仅图标+底部横条指示器
- [ ] Task 2.5: 底部卡片展开=完整, 折叠=仅百分比；分隔标题条件显示
- [ ] 整体: TypeScript 编译零错误，`npm run build` 成功
