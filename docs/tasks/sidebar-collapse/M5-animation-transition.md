# M5: 动画与过渡

> **模块**: M5 | **任务数**: 2 | **依赖**: M2（Sidebar 宽度切换已完成）+ M3（按钮已集成）
> **需求依据**: [sidebar-collapse-requirement.md](../../sidebar-collapse-requirement.md) §D-09 (动画方案)

---

## Task 5.1: Sidebar 宽度过渡动画验证与优化

**文件**: `src/components/layout/Sidebar.tsx` — 根容器 div (L22)

**已在 Task 2.2 中实现的基础过渡**:
```tsx
<div className={`... transition-all duration-300 ease-in-out ... ${
  isCollapsed ? 'w-16' : 'w-80'
}`}>
```

### 验证清单

| 检查项 | 要求 | 验证方法 |
|--------|------|---------|
| transition 属性存在 | `transition-all` 或 `transition-[width,padding]` | 代码审查 |
| duration | `300ms`（或 `duration-300`） | 代码审查 |
| 缓动函数 | `ease-in-out`（或 `ease` / `cubic-bezier`） | 代码审查 |
| 无 `will-change` 滥用 | 不在 width 过渡元素上使用 will-change | 代码审查 |
| overflow 处理 | 折叠时内容不溢出 Sidebar 边界 | 浏览器验证 |

### 可选优化（如基础过渡不够平滑）

**优化 A: 使用 transform 替代 width 过渡**

> 注意: 这会改变布局模型，需评估对主内容区的影响。

```tsx
{/* 方案: 用 scaleX + 负 margin 模拟宽度变化 */}
<div
  className={`w-80 bg-bg-primary ... shrink-0 transition-transform duration-300 ease-in-out origin-left ${
    isCollapsed ? 'scale-x-[0.2]' : 'scale-x-100'
  }`}
  style={{ transformOrigin: 'left center' }}
>
```

**优化 B: 仅过渡必要属性（替代 transition-all）**

```tsx
<div
  className={`
    bg-bg-primary border-r border-border-default flex flex-col h-full
    shrink-0 shadow-sm overflow-hidden
    transition-[width,padding] duration-300 ease-in-out
    ${isCollapsed ? 'w-16' : 'w-80'}
  `}
>
```

> 推荐: 使用方案 B，精确指定过渡属性避免不必要的重绘。

**验证**:
- [ ] 过渡时长 300ms ± 10ms
- [ ] 过程中无闪烁/抖动/文字截断
- [ ] 低端设备（4 核以下 CPU）无明显卡顿

---

## Task 5.2: 主内容区自适应扩展验证

**文件**: `src/App.tsx` — main 元素 (L37)

**当前代码**:
```tsx
<main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
```

### 验证清单

| 检查项 | 要求 | 验证方法 |
|--------|------|---------|
| main 使用 `flex-1` | 自动填充剩余空间 | 代码审查 |
| `min-w-0` 存在 | 防止内容区溢出导致水平滚动 | 代码审查 |
| Sidebar 折叠后 main 变宽 | 视觉确认 main 区域增加 ~256px | 浏览器测量 |
| 内容区内布局无异常 | 表格/图表/地图等组件正常渲染 | 各页面走查 |

### 可能需要的调整

**场景 A: Header 也需要跟随**
- Header 当前可能固定宽度或使用 `flex-1`
- 确认 Header 在 Sidebar 折叠后自动扩展（通常已通过 flex 布局自然实现）

**场景 B: 内部绝对定位装饰元素**
- App.tsx L42-L43 有两个模糊光晕装饰:
  ```tsx
  <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/5 blur-[150px] ..." />
  <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-500/5 blur-[120px] ..." />
  ```
- 这些是背景装饰，应跟随 main 区域自适应，无需修改

**验证**:
- [ ] 展开态: main 区域宽度 = `屏幕宽度 - 320px(Sidebar)`
- [ ] 折叠态: main 区域宽度 = `屏幕宽度 - 64px(Sidebar)` ≈ +256px
- [ ] Header 与 main 同步扩展
- [ ] 所有业务页面在两种模式下均无水平滚动条

---

## 完成标准

- [ ] Task 5.1: Sidebar 过渡动画流畅（300ms, ease-in-out, 无卡顿）
- [ ] Task 5.2: 主内容区正确自适应扩展，各业务页面无回归问题
- [ ] 双主题下（Dark/Light）过渡动画均正常
