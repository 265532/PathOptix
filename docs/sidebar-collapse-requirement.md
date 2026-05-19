# PathOptix Dashboard 侧边栏伸缩 — 需求文档

> **创建日期**: 2026-05-18
> **需求类型**: 新功能（UI 交互增强）
> **关联功能**: 明暗主题切换（需兼容双主题）
> **状态**: ✅ 需求已确认

---

## 1. 背景与动机

### 1.1 当前状态

当前 Sidebar 为**固定宽度布局**，存在以下特征：

| 属性 | 当前值 |
|------|--------|
| 宽度 | `w-80`（320px），固定不变 |
| 内容 | Logo 区 + 8 个菜单项 + 底部统计卡片 |
| 布局方式 | Flex 子元素，`shrink-0`（不可收缩） |
| 主内容区 | `flex-1`，占据剩余空间 |
| 文件位置 | [Sidebar.tsx](../src/components/layout/Sidebar.tsx)（86 行） |
| 父容器 | [App.tsx](../src/App.tsx) L34-L45 的 flex 容器 |

### 1.2 问题与动机

| # | 问题 | 影响 |
|---|------|------|
| P-01 | Sidebar 固定占用 320px 宽度，在小分辨率屏幕（如 1366×768）下内容区过窄 | 用户体验下降 |
| P-02 | 用户在浏览数据密集型视图（如表格、地图）时希望最大化内容展示区域 | 效率损失 |
| P-03 | 无折叠能力，与现代 IDE/工具（VS Code、Figma）的侧边栏交互模式不一致 | 习惯不符 |

### 1.3 目标

实现 Sidebar 的**可折叠/可展开**功能，允许用户在「展开模式」（完整菜单）和「图标模式」（仅图标 + Tooltip）之间自由切换，释放屏幕空间给主内容区域。

---

## 2. 设计决策记录

以下决策已通过 Q&A 确认，作为需求实现的唯一依据。

### D-01: 触发方式 — 按钮点击

| 决策项 | 选择 | 说明 |
|--------|------|------|
| 触发方式 | **按钮点击** | 在 Header 左侧边缘放置折叠/展开切换按钮 |
| 排除项 | 拖拽手柄、双击边缘、键盘快捷键 | 本次不实现 |

**理由**: 按钮触发是最直观、最易发现的交互方式，符合 VS Code / Slack 等主流工具的设计语言。拖拽手柄增加实现复杂度且发现率低。

### D-02: 折叠形态 — 仅图标模式

| 决策项 | 选择 | 说明 |
|--------|------|------|
| 展开宽度 | `w-80`（320px）— 保持现状不变 |
| 折叠宽度 | `w-16`（64px）— 仅显示图标 |
| 菜单项行为 | 图标居中 + hover 时 Tooltip 显示完整名称 |
| 排除项 | 完全隐藏（w-0）、半宽模式（w-48） | |

**理由**: w-16 (64px) 是行业标准的最小图标侧边栏宽度，足以容纳 20px 图标 + 合理的 padding。完全隐藏会导致导航功能难以发现。

### D-03: 按钮位置 — Header 左侧边框

| 决策项 | 选择 | 说明 |
|--------|------|------|
| 按钮位置 | **Header 组件左边缘**（Sidebar 与 Header 交界处） |
| 视觉样式 | 小型圆形/方形按钮，含 PanelLeftClose / PanelLeftOpen 图标 |
| 排除项 | Sidebar 内部、两处都有 | |

**理由**: 将控制权放在 Header 区域而非 Sidebar 内部，确保折叠后按钮仍然可见且可达。这与 VS Code 的 Activity Bar 切换按钮位置一致。

### D-04: 主内容区行为 — 自适应扩展

| 决策项 | 选择 | 说明 |
|--------|------|------|
| 折叠时 | 主内容区 `<main>` 自动扩展填满释放的 ~256px 空间 |
| 展开时 | 主内容区恢复原始宽度 |
| 动画 | 使用 CSS transition 平滑过渡（与主题切换一致） |

**理由**: 自适应扩展是用户期望的核心价值——折叠 Sidebar 的目的就是获得更多内容空间。

### D-05: 状态持久化 — localStorage

| 决策项 | 选择 | 说明 |
|--------|------|------|
| 存储键名 | `'pathoptix-sidebar-collapsed'` |
| 存储值 | `'true'` / `'false'`（字符串） |
| 默认值 | `'false'`（即默认展开） |
| 读取时机 | 组件初始化时同步读取 |

**理由**: 与主题切换（`pathoptix-theme`）保持一致的用户体验模式。

### D-06: 底部统计卡片 — 简化显示

| 决策项 | 选择 | 说明 |
|--------|------|------|
| 展开时 | 完整显示：「总体优化率」标签 + 进度条 + 百分比 |
| 折叠时 | **简化为仅显示百分比数字**（如 `78%`）居中显示 |
| 排除项 | 完全隐藏、始终完整显示 | |

**理由**: 百分比是核心信息，保留它让折叠状态下 Sidebar 仍有信息价值；隐藏标签和进度条以节省空间。

### D-07: 默认状态 — 默认展开

| 决策项 | 选择 | 说明 |
|--------|------|------|
| 首次访问 | **展开模式**（与当前行为一致） |
| 无记忆时 | 展开模式 |
| 有记忆时 | 以 localStorage 记录为准 |

**理由**: 展开模式展示了完整的导航结构和品牌标识，对新用户更友好。

### D-08: 响应式范围 — 仅桌面端

| 决策项 | 选择 | 说明 |
|--------|------|------|
| 本次范围 | **桌面端手动折叠**（≥1024px 或无断点限制） |
| 移动端 | 不做自动折叠适配（留待后续迭代） |
| 最小宽度保障 | 折叠后 Sidebar 保持 `w-16`，不被压缩至更小 |

**理由**: 聚焦核心功能，避免一次引入过多复杂度。移动端适配可作为独立需求后续规划。

### D-09: 动画方案 — CSS Transition

| 决策项 | 选择 | 说明 |
|--------|------|------|
| 过渡属性 | `width` + 可选 `padding` / `opacity` / `transform` |
| 时长 | **300ms**（与主题切换动画一致） |
| 缓动函数 | `ease-in-out`（或 `cubic-bezier` 更平滑曲线） |
| 性能 | 仅过渡 width（触发 layout reflow，但 Sidebar 折叠频率极低，可接受） |

**注意**: Sidebar 已有 `transition-all duration-300`（[Sidebar.tsx L22](../src/components/layout/Sidebar.tsx#L22)），可直接复用或精确化。

### D-10: Logo 区域处理

| 决策项 | 选择 | 说明 |
|--------|------|------|
| 展开时 | Box 图标(40px) + 「PathOptix」文字 |
| 折叠时 | **仅显示 Box 图标**（缩小至 32px 或保持 40px 居中） |
| 文字 | 隐藏 |

### D-11: 激活指示器处理

| 决策项 | 选择 | 说明 |
|--------|------|------|
| 展开时 | 菜单项右侧显示 8px 圆点（`w-2 h-2 rounded-full bg-brand-primary`） |
| 折叠时 | **圆点改为图标下方的小横条**（类似 VS Code Activity Bar 的激活指示器） |

**理由**: 折叠模式下右侧无空间放置圆点，改为底部横条是行业通用做法。

### D-12: Tooltip 实现

| 决策项 | 选择 | 说明 |
|--------|------|------|
| 实现方式 | **CSS + data-attribute 方案**（优先）或轻量 React 组件 |
| 触发时机 | mouseenter 时显示，mouseleave 后延迟 200ms 隐藏 |
| 位置 | 菜单项**右侧**弹出（因 Sidebar 在页面左侧） |
| 样式 | 与 Design Token 一致（bg-bg-elevated, text-text-primary, border-border-default, shadow-sm） |
| 内容 | 显示菜单项的 `label` 文本（中文） |

**注意**: 项目当前未引入 UI 库的 Tooltip 组件（如 Radix/UI），需评估使用纯 CSS `::after` 伪元素 + `attr()` 还是创建轻量 Tooltip 组件。

### D-13: 主题兼容性

| 决策项 | 选择 | 说明 |
|--------|------|------|
| 双主题支持 | ✅ 必须 | 折叠按钮、Tooltip、Sidebar 全部响应 dark/light 主题切换 |
| Design Token | 复用现有语义类 | bg-bg-primary, text-text-muted, border-border-default 等 |
| 图标颜色 | 遵循现有逻辑 | active → text-brand-primary, inactive → text-text-muted |

### D-14: 无障碍访问（A11y）

| 决策项 | 选择 | 说明 |
|--------|------|------|
| 按钮 aria-label | 动态 | 「收起侧边栏」/「展开侧边栏」 |
| 键盘导航 | 支持 | Tab 可聚焦到折叠按钮，Enter/Space 触发 |
| 焦点管理 | 折叠时焦点跟随按钮 | 避免焦点丢失到不可见元素 |
| screen reader | 折叠状态可通过 aria-expanded 传达 | `<button aria-expanded={false}>` |

---

## 3. 功能需求

### 3.1 核心功能

| ID | 功能描述 | 优先级 |
|----|---------|--------|
| F-01 | 点击 Header 左侧折叠按钮，Sidebar 从 w-80 缩至 w-16（图标模式） | P0 |
| F-02 | 再次点击同一按钮，Sidebar 从 w-16 恢复至 w-80（展开模式） | P0 |
| F-03 | 折叠/展开过程中有 300ms 平滑过渡动画 | P0 |
| F-04 | 折叠时主内容区自动扩展填充释放的空间 | P0 |
| F-05 | 折叠状态通过 localStorage 持久化，刷新后保持 | P0 |
| F-06 | 首次访问（无 localStorage 记录）默认为展开模式 | P0 |

### 3.2 折叠模式 UI 行为

| ID | 功能描述 | 优先级 |
|----|---------|--------|
| F-10 | Logo 区：仅显示 Box 图标（居中），隐藏「PathOptix」文字 | P0 |
| F-11 | 菜单项：图标居中，文字隐藏 | P0 |
| F-12 | 菜单项 hover：右侧弹出 Tooltip 显示完整中文名称 | P0 |
| F-13 | 激活菜单项：图标下方显示激活指示横条（替代右侧圆点） | P1 |
| F-14 | 底部统计卡片：简化为仅显示百分比数字（如 `78%`）居中 | P1 |
| F-15 | 分隔标题（「系统管理」）：隐藏文字，保留分隔线或完全隐藏 | P2 |

### 3.3 折叠按钮

| ID | 功能描述 | 优先级 |
|----|---------|--------|
| F-20 | 按钮位于 Header 组件左侧边框处 | P0 |
| F-21 | 展开态显示 PanelLeftClose（向左箭头/ChevronLeft）图标 | P0 |
| F-22 | 折叠态显示 PanelLeftOpen（向右箭头/ChevronRight）图标 | P0 |
| F-23 | 按钮 aria-label 动态变化：「收起侧边栏」/「展开侧边栏」 | P0 |
| F-24 | 按钮 hover 有视觉反馈（bg 变化或 icon 高亮） | P1 |
| F-25 | 按钮尺寸：32×32px 或 28×28px，不破坏 Header 布局 | P0 |

### 3.4 Tooltip

| ID | 功能描述 | 优先级 |
|----|---------|--------|
| F-30 | 折叠模式下鼠标悬停菜单项时显示 Tooltip | P0 |
| F-31 | Tooltip 位于 Sidebar 右侧水平弹出 | P0 |
| F-32 | Tooltip 样式：bg-bg-elevated, text-text-primary, border-border-default, shadow-sm, rounded-lg, px-3 py-2, text-sm | P0 |
| F-33 | Tooltip 有淡入淡出动画（~150ms） | P1 |
| F-34 | Tooltip 不遮挡相邻菜单项 | P1 |
| F-35 | 展开模式下 Tooltip 不显示 | P0 |

### 3.5 状态管理与 API

| ID | 功能描述 | 优先级 |
|----|---------|--------|
| F-40 | 定义 `isCollapsed: boolean` 状态（建议提升至 App.tsx 或 Context） | P0 |
| F-41 | 提供 `toggleSidebar()` 切换函数 | P0 |
| F-42 | Sidebar 组件接收 `isCollapsed` prop 并据此渲染不同 UI | P0 |
| F-43 | Header 组件接收 `isCollapsed` + `toggleSidebar` props | P0 |
| F-44 | localStorage 键名：`pathoptix-sidebar-collapsed` | P0 |

---

## 4. 非功能需求

### 4.1 性能

| ID | 要求 | 标准 |
|----|------|------|
| NF-01 | 折叠/展开动画帧率 | ≥ 30fps（60fps 最佳），无明显卡顿 |
| NF-02 | 过渡期间 CPU 占用 | 不阻塞主线程，不造成交互延迟 |
| NF-03 | localStorage 读写 | 同步读取（初始化时一次性），写入仅在状态变更时 |

### 4.2 兼容性

| ID | 要求 | 标准 |
|----|------|------|
| NF-04 | 浏览器兼容 | Chrome 90+, Firefox 90+, Edge 90+, Safari 15+ |
| NF-05 | 分辨率支持 | 最低 1280×720（折叠后内容区 ≥ 1200px） |
| NF-06 | 字体缩放 | 125%/150% DPI 下折叠模式仍可用 |

### 4.3 可访问性（A11y）

| ID | 要求 | 标准 |
|----|------|------|
| NF-07 | WCAG 2.1 操作性 | 折叠按钮可通过键盘操作（Tab + Enter/Space） |
| NF-08 | ARIA 属性 | button 含 `aria-expanded` 反映当前状态 |
| NF-09 | 焦点管理 | 折叠时不丢失焦点，焦点停留在触发按钮上 |
| NF-10 | Screen Reader | 折叠状态下能通过 SR 理解当前导航位置 |

### 4.4 代码质量

| ID | 要求 | 标准 |
|----|------|------|
| NF-11 | TypeScript 类型 | Props 接口完整定义，禁止 `any` |
| NF-12 | 组件职责 | 遵循三层架构（layout 层组件） |
| NF-13 | 样式规范 | Tailwind 语义类为主，与主题切换 Design Token 一致 |
| NF-14 | console.log | 零残留（开发调试完成后清除） |

---

## 5. 受影响文件清单

### 5.1 必须修改的文件

| # | 文件路径 | 修改类型 | 修改内容概要 |
|---|---------|---------|-------------|
| 1 | `src/components/layout/Sidebar.tsx` | **重大修改** | 接收 isCollapsed prop，条件渲染 Logo/菜单/卡片，添加 Tooltip |
| 2 | `src/components/layout/Header.tsx` | **中等修改** | 添加折叠按钮（L106 附近），接收 isCollapsed + toggleSidebar props |
| 3 | `src/App.tsx` | **小修改** | 新增 isCollapsed state，传递给 Sidebar 和 Header |
| 4 | `src/styles/themes.css` | **小修改** | 如需要，添加 Tooltip 相关工具类样式 |

### 5.2 可能新建的文件

| # | 文件路径 | 用途 |
|---|---------|------|
| 5 | `src/components/ui/Tooltip.tsx` | 轻量 Tooltip 组件（如选择 React 组件方案） |
| 6 | `src/hooks/useSidebar.ts` | 如提取为 Hook（可选，视复杂度而定） |

### 5.3 不需要修改的文件

- `src/contexts/ThemeContext.tsx` — 主题切换不受影响
- `src/hooks/useTheme.ts` / `useChartTheme.ts` — 无关
- `src/components/ui/StatCard.tsx`, `ChartCard.tsx` 等 — UI 组件层无关
- 所有 `src/components/features/` 业务组件 — 无需改动

---

## 6. 验收标准

### 6.1 功能验收（F）

| 编号 | 验收项 | 通过标准 |
|------|--------|---------|
| F-AC-01 | 按钮点击可切换 Sidebar 展开/折叠 | 点击后宽度在 w-80 ↔ w-16 之间切换 |
| F-AC-02 | 切换动画流畅 | 300ms 过渡，无闪烁/抖动 |
| F-AC-03 | 内容区自适应 | 折叠时 main 区域宽度增加 ~256px |
| F-AC-04 | 刷新保持状态 | localStorage 写入/读取正确 |
| F-AC-05 | 默认展开 | 清除 localStorage 后首次加载为展开态 |
| F-AC-06 | 折叠态图标居中 | 菜单图标水平居中于 w-16 宽度内 |
| F-AC-07 | Tooltip 正确显示 | hover 菜单项时右侧弹出，内容为中文 label |
| F-AC-08 | Tooltip 不干扰展开态 | 展开模式下无 Tooltip |
| F-AC-09 | 底部卡片简化 | 折叠时仅显示百分比数字 |
| F-AC-10 | 激活指示器正确 | 展开态=右侧圆点，折叠态=底部横条 |
| F-AC-11 | 按钮图标切换 | 展开态→关闭图标，折叠态→打开图标 |
| F-AC-12 | 双主题兼容 | Dark/Light 模式下折叠/展开均正常显示 |

### 6.2 技术验收（T）

| 编号 | 验收项 | 通过标准 |
|------|--------|---------|
| T-AC-01 | `npm run build` 零报错 | Exit code = 0 |
| T-AC-02 | 零 console.log 残留 | grep 无结果 |
| T-AC-03 | 零新增 any 类型 | 类型定义完整 |
| T-AC-04 | Tailwind 类名规范 | 使用语义类，无硬编码颜色 |
| T-AC-05 | Props 接口定义 | SidebarProps 扩展，HeaderProps 扩展 |

### 6.3 视觉验收（V）

| 编号 | 验收项 | 通过标准 |
|------|--------|---------|
| V-AC-01 | 展开态视觉不变 | 与当前视觉效果 100% 一致（无回归） |
| V-AC-02 | 折叠态视觉整洁 | 图标对齐、间距合理、无溢出/截断 |
| V-AC-03 | 按钮可见性 | Header 中按钮清晰可见，不过于突兀 |
| V-AC-04 | Tooltip 样式一致性 | 与全局 Design Token 风格统一 |
| V-AC-05 | 暗色模式折叠态 | 所有元素在暗色背景下对比度足够 |
| V-AC-06 | 亮色模式折叠态 | 所有元素在亮色背景下对比度足够 |

---

## 7. 风险分析

| # | 风险 | 概率 | 影响 | 缓解措施 |
|---|------|------|------|---------|
| R-01 | width transition 触发 layout reflow，低端设备可能卡顿 | 低 | 中 | 300ms 已足够平滑；可考虑用 transform: translateX 替代（但改变布局模型） |
| R-02 | Tooltip 实现方案选型不当导致体验差 | 中 | 低 | 提供两种方案（CSS伪元素 vs React 组件）供选择 |
| R-03 | isCollapsed 状态提升至 App.tsx 导致不必要的重渲染 | 中 | 低 | 使用 React.memo 包裹子组件；或使用 Context 隔离 |
| R-04 | 折叠后某些业务页面布局异常（依赖固定 Sidebar 宽度的硬编码） | 中 | 中 | 全面回归测试各模块；修复发现的问题 |
| R-05 | lucide-react 图标库缺少 PanelLeftClose/Open 图标 | 低 | 低 | 备选: ChevronLeft/ChevronRight / PanelLeft / PanelLeftClose（lucide 已包含） |

---

## 8. 设计参考

### 8.1 交互参考

| 产品 | 折叠方式 | 按钮位置 | 折叠宽度 | Tooltip |
|------|---------|---------|---------|---------|
| **VS Code** | Activity Bar 左侧按钮 | Activity Bar 底部 | 48px | 右侧弹出 |
| **Slack** | Workspace 图标点击 | 左上角 | 56px | 右侧弹出 |
| **Figma** | 左上角箭头按钮 | 左上角 | 60px | 右侧弹出 |
| **Notion** | 左侧箭头 | Sidebar 顶部 | 52px | 右侧弹出 |
| **PathOptix（目标）** | Header 左侧按钮 | Header 左边缘 | **64px (w-16)** | 右侧弹出 |

### 8.2 线框图描述

```
展开态（当前）:
┌─────────────────┬──────────────────────────────────────┐
│  Sidebar (w-80) │  Header (flex-1)                     │
│ ┌──────────────┐│ ┌───┐ [Toggle] [Bell] [User]        │
│ │ 📦 PathOptix ││ └───┘                                │
│ ├──────────────┤│──────────────────────────────────────│
│ │ 📊 仪表盘   ││                                      │
│ │ 🛤️ 路径优化  ││         Main Content Area            │
│ │ ⚡ 训练优化  ││         (flex-1, overflow-auto)      │
│ │ 🍃 碳监控   ││                                      │
│ │ 🌐 供应链   ││                                      │
│ │ 🛒 订单     ││                                      │
│ │ 💬 客服     ││                                      │
│ ├──────────────┤│                                      │
│ │ ⚙️ 设置     ││                                      │
│ ├──────────────┤│                                      │
│ │ 总体: 78%   ││                                      │
│ │ ████████░░ ││                                      │
│ └──────────────┘│                                      │
└─────────────────┴──────────────────────────────────────┘

折叠态（目标）:
┌──────┬──────────────────────────────────────────────────┐
│ SB   │  Header (flex-1, 更宽)                          │
│(w-16)│ [◀] [Header Content...] [Bell] [User]          │
│      │──────────────────────────────────────────────────│
│ 📦   │                                              │
│ 📊   │         Main Content Area (+256px 宽度)       │
│ ⚡   │                                              │
│ 🍃   │                                              │
│ 🌐   │                                              │
│ 🛒   │                                              │
│ 💬   │                                              │
│ ───  │                                              │
│ ⚙️   │                                              │
│      │                                              │
│ 78%  │                                              │
└──────┴──────────────────────────────────────────────────┘
  ↑
  Tooltip on hover:
  ┌──────────────┐
  │  仪表盘       │  ← 右侧弹出
  └──────────────┘
```

---

## 9. 实施约束

| 约束 | 说明 |
|------|------|
| 架构 | 必须遵循项目三层架构（ui → layout → features），本功能属于 **layout 层** |
| 状态管理 | 使用 useState + Props 传递（当前阶段），不引入新状态管理库 |
| 样式 | Tailwind 语义类 + Design Token，与主题切换系统完全兼容 |
| 图标 | 使用 lucide-react（项目已有依赖），优先选用 PanelLeftClose / PanelLeftOpen |
| 测试 | 核心交互编写单元测试（toggle 行为 + localStorage 持久化） |
| 语言 | 注释和文档使用中文，代码标识符使用英文 |

---

## 10. 附录

### 10.1 关键文件引用

```
项目根目录: c:\doc\project\PathOptix\

相关源码:
  src/
  ├── components/
  │   ├── layout/
  │   │   ├── Sidebar.tsx          ← 主要修改目标（86行）
  │   │   ├── Header.tsx           ← 添加折叠按钮
  │   │   └── index.ts
  │   └── ui/
  │       └── (可能新建 Tooltip.tsx)
  ├── App.tsx                      ← 状态提升
  ├── styles/
  │   └── themes.css               ← 可能添加 Tooltip 样式
  └── contexts/
      └── ThemeContext.tsx          ← 不修改（仅参考）

关联文档:
  docs/
  ├── theme-switching-requirement.md    ← 主题切换需求（需兼容）
  ├── tasks2/
  │   ├── FINAL-ACCEPTANCE-REPORT.md   ← 最终验收报告
  │   └── handover/                    ← 各模块交接文档
  └── sidebar-collapse-design.md       ← 概要设计文档（待生成）
```

### 10.2 术语表

| 术语 | 定义 |
|------|------|
| 展开模式（Expanded） | Sidebar 完整显示，w-80（320px），包含图标+文字+卡片 |
| 折叠模式（Collapsed） | Sidebar 仅显示图标，w-16（64px），hover 显示 Tooltip |
| Tooltip | 鼠标悬停时弹出的文本提示框，用于显示被隐藏的菜单名称 |
| Activity Bar | VS Code 术语，指仅图标的窄侧边栏（本项目称为折叠态 Sidebar） |
| toggle | 切换操作，在两种模式间交替转换 |

---

*文档版本*: v1.0
*最后更新*: 2026-05-18
*下一步*: 确认需求无误后，生成概要设计文档（sidebar-collapse-design.md）
