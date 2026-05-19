# M4: 布局组件适配模块 — 实施任务

> **模块编号**: M4
> **前置依赖**: M1 (基础设施), M2 (状态管理), M3 (ThemeToggle)
> **预估工时**: 1-2 小时
> **风险等级**: 中（布局组件影响全局视觉）

---

## 模块目标

对 Header.tsx 和 Sidebar.tsx 两个核心布局组件进行**全量颜色硬编码→语义化类名替换**，使其完整响应明暗主题切换。同时验证 ThemeToggle 在 Header 中的集成效果。

---

## Task 4.1: Header.tsx 颜色适配

**修改文件**: `src/components/layout/Header.tsx` (253 行)

### 颜色审计结果（Header 中所有硬编码颜色）

| 行号 | 当前值 | 语义替换 | 说明 |
|------|--------|---------|------|
| L82 | `bg-[#0B0F19]/60` | `bg-bg-secondary/60` | Header 背景半透明 |
| L82 | `border-slate-800` | `border-border-default` | 底部边框 |
| L86 | `text-cyan-500` | `text-brand-accent` (或保留) | RK 标识色 — 品牌色可保持不变 |
| L87 | `text-cyan-400` | 同上 | RK 文字色 |
| L88 | `bg-slate-800` | `bg-border-default` | 分隔线 |
| L89 | `text-slate-100` | `text-text-primary` | 主标题文字 |
| L98 | `text-slate-500` | `text-text-muted` | 延迟指示器文字 |
| L103 | `bg-slate-800` | `bg-border-default` | 分隔线竖线 |
| L108 | `text-slate-400` | `text-text-muted` | 通知铃铛默认色 |
| L108 | `hover:text-slate-200` | `hover:text-text-secondary` | 通知铃铛 hover |
| L111 | `border-[#0B0F19]` | `border-bg-modal` | 红点徽标边框 |
| L115 | `bg-[#0B121E]/95` | `bg-bg-secondary/95` | 下拉面板背景 |
| L115 | `border-slate-800` | `border-border-default` | 下拉面板边框 |
| L116 | `bg-slate-900/40` | `bg-bg-tertiary/40` | 通知头部背景 |
| L117 | `text-white` | `text-text-primary` | 通知标题 |
| L118 | `text-slate-500` | `text-text-muted` | 通知计数 |
| L125 | `hover:bg-slate-800/30` | `hover:bg-bg-tertiary/30` | 通知项 hover |
| L136 | `text-white` | `text-text-primary` | 通知项标题 |
| L139 | `text-slate-400` | `text-text-muted` | 通知项描述 |
| L147 | `border-slate-800/50` | `border-border-default/50` | 通知底部边框 |
| L147 | `text-blue-400` | `text-brand-primary` | "查看全部"链接 |
| L158-L159 | `bg-slate-800/80`, `border-cyan-500/30` | `bg-bg-tertiary/80`, `border-brand-primary/30` | 用户下拉激活态 |
| L163 | `text-slate-200` / `text-cyan-400` | `text-text-primary` / `text-brand-primary` | 用户名文字 |
| L172-173 | `border-slate-700` / `border-cyan-500` | `border-border-input` / `border-brand-primary` | 头像边框 |
| L176 | `border-[#0B0F19]` | `border-bg-modal` | 认证徽章边框 |
| L183 | `bg-[#0B121E]/95` | `bg-bg-secondary/95` | 用户下拉面板 |
| L188 | `text-white` | `text-text-primary` | 用户名 |
| L220 | `bg-red-500/5`, `text-red-400` | 保留（品牌 error 色） | 退出按钮 |
| L240 | `hover:bg-slate-800/60` | `hover:bg-bg-tertiary/60` | DropdownItem hover |
| L242 | `bg-slate-900` | `bg-bg-elevated` | DropdownItem 图标背景 |
| L246 | `text-slate-200` | `text-text-primary` | DropdownItem 标签 |
| L247 | `text-slate-600` | `text-text-muted` | DropdownItem 描述 |

- [ ] **Step 1: 执行 Header.tsx 全量颜色替换**

使用 IDE 的全局替换功能，逐条执行上述表格中的替换。对于每一条：

1. 在 Header.tsx 中搜索左侧「当前值」
2. 替换为右侧「语义替换」值
3. 确认无遗漏

**批量替换命令参考**（在 VSCode 中）:
```
# 先做最安全的大批替换（不会误伤的精确匹配）
bg-[#0B0F19] → bg-bg-modal
bg-[#0B121E] → bg-bg-secondary
bg-[#05080F] → bg-bg-primary  (如果出现)

# 然后逐个处理有上下文歧义的
```

> **注意**: 品牌色 (`cyan-*`, `emerald-*`, `red-*`, `blue-*`, `amber-*`) 通常**不需要替换**，因为它们是语义化的功能色，在暗色和亮色模式下都应保持一致。仅替换中性色（slate-*、#[hex]、white/black 等）。

- [ ] **Step 2: 为 Header 根元素添加亮色模式阴影**

将 L82 的 header 根元素 className 从:
```tsx
<header className="h-20 border-b border-slate-800 bg-[#0B0F19]/60 backdrop-blur-xl px-10 flex items-center justify-between sticky top-0 z-50">
```
改为:
```tsx
<header className="h-20 border-b border-border-default bg-bg-secondary/60 backdrop-blur-xl px-10 flex items-center justify-between sticky top-0 z-50 shadow-sm">
```

添加 `shadow-sm` 使亮色模式下 Header 有底部阴影增强层次感。

- [ ] **Step 3: 视觉验证**

```bash
npm run dev
```

检查项：
- [ ] 暗色模式下 Header 视觉与改造前**一致**
- [ ] 点击 ThemeToggle 切换到亮色模式后：
  - [ ] Header 背景变为白色/浅灰
  - [ ] 文字变为深色
  - [ ] 边框可见但不抢眼
  - [ ] 底部阴影增加层次感
  - [ ] 下拉面板、通知面板正确响应
  - [ ] ThemeToggle 图标正确显示为太阳

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Header.tsx
git commit -m "feat(M4): adapt Header component with semantic color tokens for dark/light themes"
```

---

## Task 4.2: Sidebar.tsx 颜色适配

**修改文件**: `src/components/layout/Sidebar.tsx` (86 行)

### 颜色审计结果（Sidebar 中所有硬编码颜色）

| 行号 | 当前值 | 语义替换 | 说明 |
|------|--------|---------|------|
| L22 | `bg-[#05080F]` | `bg-bg-primary` | Sidebar 根背景 |
| L22 | `border-slate-900` | `border-border-default` | 右边框 |
| L27 | `text-white` | `text-text-primary` | Logo 文字 |
| L37 | `bg-[#0B121E]` | `bg-bg-secondary` | 菜单选中态背景 |
| L37 | `border-cyan-500/10` | `border-brand-primary/10` | 菜单选中态边框 |
| L37 | `text-cyan-400` | `text-brand-primary` | 菜单选中态文字 |
| L37 | `shadow-[inset_0_0_20px_rgba(34,211,238,0.05)]` | 保留或微调 | 选中态内发光（品牌色相关） |
| L38 | `text-slate-400` | `text-text-muted` | 菜单未选中文字 |
| L38 | `hover:text-slate-200` | `hover:text-text-secondary` | 菜单项 hover 文字 |
| L38 | `hover:bg-slate-800/30` | `hover:bg-bg-tertiary/30` | 菜单项 hover 背景 |
| L41 | `text-slate-500` | `text-text-muted` | 未选中图标色 |
| L41 | `group-hover:text-slate-300` | `group-hover:text-text-secondary` | 图标 hover 色 |
| L46 | `bg-cyan-400` | `bg-brand-primary` | 活跃指示点 |
| L51 | `text-slate-600` | `text-text-muted` | 分区标题 |
| L57 | `bg-[#0B121E]` | `bg-bg-secondary` | 设置菜单选中态 |
| L57-58 | 同 L37-38 | 同上 | 设置菜单颜色 |
| L61 | `text-slate-500` | `text-text-muted` | 设置图标未选中 |
| L72 | `bg-[#0B121E]` | `bg-bg-secondary` | 底部卡片背景 |
| L72 | `border-slate-900` | `border-border-default` | 底部卡片边框 |
| L74 | `text-slate-500` | `text-text-muted` | 卡片标签文字 |
| L75 | `text-cyan-400` | `text-brand-primary` | 卡片数值（品牌色） |
| L77 | `bg-slate-950` | `bg-bg-primary` | 进度条轨道 |
| L78 | `bg-cyan-500` | `bg-brand-primary` | 进度条填充 |

- [ ] **Step 1: 执行 Sidebar.tsx 全量颜色替换**

按照上表逐一替换。特别注意：
- Logo 区域的 `shadow-[0_0_15px_rgba(6,182,212,0.4)]` 是 cyan 发光效果，属于**特效**而非语义背景色，应保留原值或改用 `shadow-[0_0_15px_var(--glow-cyan)]`
- 进度条的 `shadow-[0_0_8px_rgba(6,182,212,0.4)]` 同理

- [ ] **Step 2: 为 Sidebar 根元素添加亮色模式右边框强调**

将 L22 的根 div 从:
```tsx
<div className="w-80 bg-[#05080F] border-r border-slate-900 flex flex-col h-full shrink-0 transition-all duration-300">
```
改为:
```tsx
<div className="w-80 bg-bg-primary border-r border-border-default flex flex-col h-full shrink-0 transition-all duration-300 shadow-sm">
```

- [ ] **Step 3: 视觉验证**

```bash
npm run dev
```

检查项：
- [ ] 暗色模式下 Sidebar 与改造前一致
- [ ] 亮色模式下：
  - [ ] Sidebar 背景为浅灰色
  - [ ] 右侧分隔线清晰可见
  - [ ] 菜单项文字为深灰色
  - [ ] 选中菜单项有浅蓝背景 + 蓝色文字 + 左侧指示器
  - [ ] 底部优化率卡片为白底 + 细边框
  - [ ] Logo 文字为深色

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Sidebar.tsx
git commit -m "feat(M4): adapt Sidebar component with semantic color tokens for dark/light themes"
```

---

## Task 4.3: App.tsx 根容器适配

**修改文件**: `src/App.tsx`

- [ ] **Step 1: 替换 App 根容器的硬编码背景色**

当前 L34:
```tsx
<div className="flex h-screen bg-[#05080F] text-slate-200 overflow-hidden font-inter">
```

替换为:
```tsx
<div className="flex h-screen bg-bg-primary text-text-secondary overflow-hidden font-inter transition-colors duration-300">
```

变更说明:
- `bg-[#05080F]` → `bg-bg-primary` (CSS 变量)
- `text-slate-200` → `text-text-secondary` (body 级文字色)
- 添加 `transition-colors duration-300` 使根容器也参与主题过渡

- [ ] **Step 2: Commit**

```bash
git add src/App.tsx
git commit -m "feat(M4): adapt App root container with semantic color tokens"
```

---

## 完成标准 Checklist

- [ ] Header.tsx 全部硬编码颜色已替换为语义类名（~25+ 处）
- [ ] Sidebar.tsx 全部硬编码颜色已替换为语义类名（~20+ 处）
- [ ] App.tsx 根容器背景色已替换
- [ ] 暗色模式视觉回归：Header + Sidebar + App 与改造前一致
- [ ] 亮色模式视觉验证：对比度足够、层次清晰、无颜色泄漏
- [ ] ThemeToggle 在 Header 中正常工作，点击可切换主题
- [ ] `npm run build` 成功
