# PathOptix Dashboard 明暗主题切换功能需求文档

> **文档版本**: v1.0
> **创建日期**: 2026-05-17
> **状态**: 待评审
> **关联文档**: [AI 开发规约](../.trae/rules/ai-development-specification.md) | [项目审查报告](./PROJECT_AUDIT_REPORT.md) | [技术债务清单](./TECH_DEBT_REGISTER.md)

***

## 1. 项目背景与目标

### 1.1 背景

PathOptix Dashboard 当前**仅有暗色主题**，所有颜色值（共 236 处）均硬编码在组件中，分布在 96 个源码文件内。项目在 [PROJECT\_AUDIT\_REPORT.md](./PROJECT_AUDIT_REPORT.md) 的「未实现的关键功能」列表中明确标注：

> ❌ 暗色/亮色主题切换 —— 未实现

同时，[DEVELOPMENT\_PLAN.md](./DEVELOPMENT_PLAN.md) 的 v1.1 迭代规划中也将其列为待实现功能。

### 1.2 目标

为 PathOptix Dashboard 构建完整的**明暗主题切换系统**，使应用支持 Dark（暗色）和 Light（亮色）两套视觉方案，用户可随时一键切换，且选择能跨会话持久保存。

### 1.3 核心目标

| 目标        | 描述                         |
| --------- | -------------------------- |
| **双主题支持** | 完整的 Dark + Light 两套设计令牌    |
| **全量覆盖**  | 所有页面、组件、布局均适配双主题           |
| **即时切换**  | 无刷新、无闪烁的主题切换体验             |
| **持久化**   | 用户选择通过 localStorage 跨会话保存  |
| **可维护性**  | 消除硬编码颜色，统一使用 CSS 变量        |
| **生产就绪**  | Tailwind 从 CDN 迁移至 npm 安装版 |

***

## 2. 需求确认记录

以下决策已与需求方确认：

| 编号   | 决策项         | 确认结果                                   |
| ---- | ----------- | -------------------------------------- |
| D-01 | 技术实现方案      | **CSS 变量 +** **`data-theme`** **属性切换** |
| D-02 | 默认主题        | **暗色模式（Dark）为默认**                      |
| D-03 | 持久化策略       | **localStorage 持久化**                   |
| D-04 | 切换按钮位置      | **Header 导航栏右上角**（太阳/月亮图标）             |
| D-05 | 实施范围        | **全量覆盖（所有页面）**                         |
| D-06 | 亮色配色来源      | **由本需求文档推导推荐**                         |
| D-07 | Tailwind 迁移 | **同步迁移至 npm 版本**                       |

***

## 3. 现状分析

### 3.1 当前技术栈（样式相关）

| 项目                 | 当前状态                                    | 问题                        |
| ------------------ | --------------------------------------- | ------------------------- |
| Tailwind CSS       | **CDN Play 版本** (`cdn.tailwindcss.com`) | 无配置文件、无法自定义主题、不适合生产环境     |
| PostCSS            | 未配置                                     | 无法使用 `@apply`、`theme()` 等 |
| tailwind.config.js | 不存在                                     | 无法扩展 design tokens        |
| CSS 变量             | 未定义                                     | 颜色全部硬编码                   |
| darkMode 配置        | 不存在                                     | `dark:` 前缀行为不可控           |
| 主题切换机制             | 不存在                                     | 无 ThemeContext / Provider |

### 3.2 硬编码颜色统计

| 类别                    | 出现次数      | 分布文件数          |
| --------------------- | --------- | -------------- |
| `bg-[#hex]` (背景色)     | **211 次** | \~96 个文件       |
| `text-[#hex]` (文字色)   | **15 次**  | \~3 个文件        |
| `border-[#hex]` (边框色) | **9 次**   | \~4 个文件        |
| 渐变色 `from-/to-`       | **1 次**   | \~1 个文件        |
| **合计**                | **236 处** | **\~96 个源码文件** |

### 3.3 当前高频颜色值（暗色主题 Design Tokens）

#### 背景色系

| 颜色值       | 语义角色         | 使用频率               |
| --------- | ------------ | ------------------ |
| `#05080F` | 主背景色         | 高（App根容器、侧边栏、页面底色） |
| `#0B121E` | 卡片背景         | 最高（各模块卡片、面板、弹窗）    |
| `#0B0F19` | 弹窗/浮层背景      | 中                  |
| `#111827` | 输入框/次级卡片/列表项 | 高                  |
| `#151B28` | 图表卡片背景       | 低                  |
| `#1c2127` | 登录页输入框       | 中                  |
| `#0F172A` | 特殊面板背景       | 低                  |
| `#1E293B` | 半透明覆盖层       | 低                  |

#### 文字色系

| 颜色值                 | 语义角色                 |
| ------------------- | -------------------- |
| `#ffffff` / `white` | 主文本（标题、重要数据）         |
| `#E2E8F0`           | body 默认文字色           |
| `#9dabb9`           | 次要文本（描述、placeholder） |
| `#64748b`           | 弱化文本（辅助信息）           |

#### 品牌色/强调色

| 颜色值       | 语义角色                  |
| --------- | --------------------- |
| `#137fec` | 主品牌色（蓝色）— 按钮、链接、focus |
| `#10b981` | 成功状态（绿色）              |
| `#f59e0b` | 警告状态（橙色）              |
| `#ef4444` | 错误状态（红色）              |
| `#06b6d4` | 青色强调（AI 洞察等）          |

#### 边框/分割线

| 颜色值            | 语义角色      |
| -------------- | --------- |
| `#3b4754`      | 输入框边框     |
| `slate-800/50` | 卡片边框（半透明） |

### 3.4 全局 CSS 现状（index.html `<style>` 标签）

当前全局样式定义在 [index.html](../index.html) 的 `<style>` 标签中（第 11-88 行），包含：

* body 基础样式（硬编码 `background-color: #05080F`）

* 自定义滚动条样式

* 工具类：`.glow-cyan`, `.path-glow`, `.glass-card`, `.glow-button`, `.network-gradient`

* 打印媒体查询样式

### 3.5 已有 `dark:` 前缀使用情况

部分组件（约 10 个文件，100+ 处）已经使用了 Tailwind 的 `dark:` 前缀，包括：

* `StatCard.tsx`, `ChartCard.tsx`

* `LoginView.tsx`

* `ProgressTracking.tsx`, `FeedbackForm.tsx`

* `FileManagement.tsx`, `ESGReportView.tsx`

* `AuditChange.tsx`, `AuditLogs.tsx`

**问题**：由于没有 `tailwind.config.js` 配置 `darkMode`，这些 `dark:` 类的行为依赖浏览器默认的 `prefers-color-scheme`，项目无法主动控制。

***

## 4. 技术方案

### 4.1 整体架构

```
┌─────────────────────────────────────────────────────┐
│                    用户界面层                         │
│  ┌──────────┐  ┌───────────┐  ┌──────────────────┐  │
│  │ ThemeToggle│  │ 各业务组件  │  │ Layout 组件       │  │
│  │ (Header)  │  │ (features)│  │ (Sidebar/Header) │  │
│  └────┬─────┘  └─────┬─────┘  └───────┬──────────┘  │
│       │              │                │              │
├───────┼──────────────┼────────────────┼──────────────┤
│       ▼              ▼                ▼              │
│  ┌─────────────────────────────────────────────┐    │
│  │         ThemeProvider (React Context)         │    │
│  │  - 管理 theme 状态 (light/dark)               │    │
│  │  - 切换 data-theme 属性                      │    │
│  │  - 同步 localStorage                        │    │
│  └────────────────────┬────────────────────────┘    │
│                       │                              │
├───────────────────────┼──────────────────────────────┤
│                       ▼                              │
│  ┌─────────────────────────────────────────────┐    │
│  │          CSS 变量层 (:root 选择器)             │    │
│  │  [data-theme="light"] → Light 令牌            │    │
│  │  [data-theme="dark"]  → Dark 令牌             │    │
│  └─────────────────────────────────────────────┘    │
│                                                       │
│  ┌─────────────────────────────────────────────┐    │
│  │     tailwind.config.js (npm 版)              │    │
│  │  - darkMode: 'class'                        │    │
│  │  - theme.extend.colors → 引用 CSS 变量        │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### 4.2 核心机制：CSS 变量 + data-theme

#### 4.2.1 CSS 变量定义结构

```css
/* ===== 全局 CSS 变量（定义在 index.html 或全局 CSS 文件中）===== */

:root {
  /* ---- 通用间距/圆角/字体（不随主题变化）---- */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --font-family: 'Inter', sans-serif;
}

/* ===== 暗色主题（默认）===== */
[data-theme="dark"],
:root {
  --color-bg-primary: #05080F;
  --color-bg-secondary: #0B121E;
  --color-bg-tertiary: #111827;
  --color-bg-elevated: #1c2127;
  --color-bg-modal: #0B0F19;
  --color-bg-overlay: rgba(0, 0, 0, 0.6);

  --color-text-primary: #ffffff;
  --color-text-secondary: #9dabb9;
  --color-text-muted: #64748b;

  --color-border-default: rgba(59, 71, 84, 0.5);
  --color-border-input: #3b4754;

  --color-brand-primary: #137fec;
  --color-brand-success: #10b981;
  --color-brand-warning: #f59e0b;
  --color-brand-error: #ef4444;
  --color-brand-accent: #06b6d4;

  --color-scrollbar-track: #0B0F19;
  --color-scrollbar-thumb: #1F2937;
}

/* ===== 亮色主题 ===== */
[data-theme="light"] {
  --color-bg-primary: #F8FAFC;
  --color-bg-secondary: #ffffff;
  --color-bg-tertiary: #F1F5F9;
  --color-bg-elevated: #ffffff;
  --color-bg-modal: #ffffff;
  --color-bg-overlay: rgba(0, 0, 0, 0.5);

  --color-text-primary: #0F172A;
  --color-text-secondary: #475569;
  --color-text-muted: #94A3B8;

  --color-border-default: #E2E8F0;
  --color-border-input: #CBD5E1;

  --color-brand-primary: #2563EB;
  --color-brand-success: #059669;
  --color-brand-warning: #D97706;
  --color-brand-error: #DC2626;
  --color-brand-accent: #0891B2;

  --color-scrollbar-track: #F1F5F9;
  --color-scrollbar-thumb: #CBD5E1;
}
```

#### 4.2.2 切换机制

```typescript
// 伪代码 — 主题切换核心逻辑
type Theme = 'light' | 'dark';

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
}>({ theme: 'dark', toggleTheme: () => {} });

// 切换时执行：
// 1. 更新 React state
// 2. 设置 document.documentElement.dataset.theme = newTheme
// 3. 写入 localStorage.setItem('theme', newTheme)
```

### 4.3 Tailwind 迁移策略（CDN → npm）

#### 4.3.1 迁移步骤概览

1. 安装 tailwindcss + 相关依赖（npm）
2. 创建 `tailwind.config.js` / `postcss.config.js`
3. 将 index.html 中的 CDN script 替换为 CSS 入口导入
4. 在 tailwind.config.js 中扩展主题色（引用 CSS 变量）
5. 配置 `darkMode: 'class'`
6. 全量替换硬编码颜色为 Tailwind 类名或 CSS 变量引用

#### 4.3.2 tailwind.config.js 关键配置

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 使用 CSS 变量作为颜色值
        bg: {
          primary: 'var(--color-bg-primary)',
          secondary: 'var(--color-bg-secondary)',
          tertiary: 'var(--color-bg-tertiary)',
          elevated: 'var(--color-bg-elevated)',
          modal: 'var(--color-bg-modal)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
        },
        brand: {
          primary: 'var(--color-brand-primary)',
          success: 'var(--color-brand-success)',
          warning: 'var(--color-brand-warning)',
          error: 'var(--color-brand-error)',
          accent: 'var(--color-brand-accent)',
        },
        border: {
          default: 'var(--color-border-default)',
          input: 'var(--color-border-input)',
        },
      },
    },
  },
  plugins: [],
};
```

### 4.4 组件适配策略

#### 4.4.1 颜色替换规则

| 替换前（硬编码）                     | 替换后（语义化类名）              | 说明       |
| ---------------------------- | ----------------------- | -------- |
| `bg-[#05080F]`               | `bg-bg-primary`         | 主背景      |
| `bg-[#0B121E]`               | `bg-bg-secondary`       | 卡片/面板背景  |
| `bg-[#111827]`               | `bg-bg-tertiary`        | 次级区域背景   |
| `bg-[#1c2127]`               | `bg-bg-elevated`        | 输入框/悬浮背景 |
| `text-white` / `text-[#fff]` | `text-text-primary`     | 主文字      |
| `text-[#9dabb9]`             | `text-text-secondary`   | 次要文字     |
| `text-[#64748b]`             | `text-text-muted`       | 弱化文字     |
| `border-slate-800/50`        | `border-border-default` | 默认边框     |
| `border-[#3b4754]`           | `border-border-input`   | 输入框边框    |
| `text-[#137fec]`             | `text-brand-primary`    | 品牌主色文字   |
| `bg-[#137fec]`               | `bg-brand-primary`      | 品牌主色背景   |

#### 4.4.2 渐变色和特殊效果处理

渐变色和发光效果等复杂样式需要特殊处理：

```css
/* 暗色主题 */
[data-theme="dark"] {
  --glow-cyan: 0 0 15px rgba(6, 182, 212, 0.4);
  --glass-bg: rgba(28, 33, 39, 0.7);
  --glass-border: rgba(59, 71, 84, 0.5);
  --network-gradient: radial-gradient(circle at center, #137fec1a 0%, transparent 70%);
}

/* 亮色主题 */
[data-theme="light"] {
  --glow-cyan: 0 0 12px rgba(6, 182, 212, 0.25);
  --glass-bg: rgba(255, 255, 255, 0.8);
  --glass-border: rgba(226, 232, 240, 0.8);
  --network-gradient: radial-gradient(circle at center, #3730a308 0%, transparent 70%);
}
```

***

## 5. 设计令牌规范（Design Tokens）

### 5.1 完整配色表

#### 5.1.1 暗色主题（Dark Theme）

| Token 变量名                | 色值                   | 用途               |
| ------------------------ | -------------------- | ---------------- |
| `--color-bg-primary`     | `#05080F`            | 页面主背景、侧边栏底色      |
| `--color-bg-secondary`   | `#0B121E`            | 卡片背景、面板容器        |
| `--color-bg-tertiary`    | `#111827`            | 列表项、次级区块         |
| `--color-bg-elevated`    | `#1c2127`            | 输入框、下拉菜单、悬浮层     |
| `--color-bg-modal`       | `#0B0F19`            | Modal 弹窗外层       |
| `--color-bg-overlay`     | `rgba(0,0,0,0.6)`    | 遮罩层              |
| `--color-text-primary`   | `#ffffff`            | 标题、关键数据、重要文字     |
| `--color-text-secondary` | `#9dabb9`            | 正文、描述文字          |
| `--color-text-muted`     | `#64748b`            | placeholder、辅助提示 |
| `--color-border-default` | `rgba(59,71,84,0.5)` | 卡片边框、分割线         |
| `--color-border-input`   | `#3b4754`            | 输入框边框            |
| `--color-border-focus`   | `#137fec`            | 聚焦态边框            |
| `--color-brand-primary`  | `#137fec`            | 主操作按钮、链接、活跃态     |
| `--color-brand-success`  | `#10b981`            | 成功状态、正向指标        |
| `--color-brand-warning`  | `#f59e0b`            | 警告状态、注意提示        |
| `--color-brand-error`    | `#ef4444`            | 错误状态、危险操作        |
| `--color-brand-accent`   | `#06b6d4`            | AI 洞察、特殊强调       |

#### 5.1.2 亮色主题（Light Theme）

| Token 变量名                | 色值                | 用途             | 设计依据                |
| ------------------------ | ----------------- | -------------- | ------------------- |
| `--color-bg-primary`     | `#F8FAFC`         | 页面主背景          | Slate-50，极浅灰白，护眼    |
| `--color-bg-secondary`   | `#ffffff`         | 卡片背景           | 纯白，与主背景形成层次         |
| `--color-bg-tertiary`    | `#F1F5F9`         | 次级区块           | Slate-100，区分内容区     |
| `--color-bg-elevated`    | `#ffffff`         | 输入框/悬浮层        | 纯白 + 阴影表达层级         |
| `--color-bg-modal`       | `#ffffff`         | Modal 弹窗       | 纯白                  |
| `--color-bg-overlay`     | `rgba(0,0,0,0.5)` | 遮罩层            | 半透明黑                |
| `--color-text-primary`   | `#0F172A`         | 标题/关键数据        | Slate-900，高对比度      |
| `--color-text-secondary` | `#475569`         | 正文/描述          | Slate-600，舒适阅读      |
| `--color-text-muted`     | `#94A3B8`         | placeholder/辅助 | Slate-400，弱化但不消失    |
| `--color-border-default` | `#E2E8F0`         | 卡片边框/分割线       | Slate-200，轻量分隔      |
| `--color-border-input`   | `#CBD5E1`         | 输入框边框          | Slate-300，可见但不抢眼    |
| `--color-border-focus`   | `#2563EB`         | 聚焦态边框          | Blue-600，比暗色更深的蓝    |
| `--color-brand-primary`  | `#2563EB`         | 主操作按钮/链接       | Blue-600，亮色下加深保证对比度 |
| `--color-brand-success`  | `#059669`         | 成功状态           | Emerald-600         |
| `--color-brand-warning`  | `#D97706`         | 警告状态           | Amber-600           |
| `--color-brand-error`    | `#DC2626`         | 错误状态           | Red-600             |
| `--color-brand-accent`   | `#0891B2`         | 特殊强调           | Cyan-600            |

### 5.2 间距系统（不变）

沿用规约中的 4px 网格系统：

| Token          | 值               | Tailwind 对应 |
| -------------- | --------------- | ----------- |
| `--spacing-xs` | `0.25rem` (4px) | `space-x-1` |
| `--spacing-sm` | `0.5rem` (8px)  | `space-x-2` |
| `--spacing-md` | `1rem` (16px)   | `space-x-4` |
| `--spacing-lg` | `1.5rem` (24px) | `space-x-6` |
| `--spacing-xl` | `2rem` (32px)   | `space-x-8` |

### 5.3 圆角系统（不变）

| Token          | 值          | Tailwind 对应   |
| -------------- | ---------- | ------------- |
| `--radius-sm`  | `0.375rem` | `rounded-sm`  |
| `--radius-md`  | `0.5rem`   | `rounded-md`  |
| `--radius-lg`  | `0.75rem`  | `rounded-lg`  |
| `--radius-xl`  | `1rem`     | `rounded-xl`  |
| `--radius-2xl` | `1.5rem`   | `rounded-2xl` |

***

## 6. 功能需求

### 6.1 主题切换控件（ThemeToggle）

#### 6.1.1 位置与外观

* **位置**: Header 导航栏右上角区域（用户头像左侧）

* **形态**: 图标按钮（Icon Button），无文字标签

* **图标**:

  * 暗色模式时显示: ☀️ 太阳图标（`Sun` from lucide-react）→ 点击切换到亮色

  * 亮色模式时显示: 🌙 月亮图标（`Moon` from lucide-react）→ 点击切换到暗色

* **尺寸**: 与 Header 中其他图标按钮一致（约 `w-9 h-9`）

* **交互**: Click 触发切换，带平滑过渡动画（旋转 + 淡入淡出）

* **Tooltip**: hover 时显示 "切换到亮色模式" / "切换到暗色模式"

#### 6.1.2 行为逻辑

```
用户点击 ThemeToggle
    ↓
调用 toggleTheme()
    ↓
1. 计算新主题值 (dark ↔ light)
2. 更新 React Context 状态
3. 设置 <html data-theme="newTheme">
4. localStorage.setItem('pathoptix-theme', newTheme)
    ↓
所有使用 CSS 变量的元素自动响应颜色变化
```

#### 6.1.3 动画要求

* 图标切换时：当前图标 scale(0) 旋转 90° 淡出 → 新图标 scale(1) 旋转 0° 淡入

* 过渡时长: 300ms

* 缓动函数: ease-in-out

* 页面整体颜色过渡: 可选（CSS `transition: color 0.3s, background-color 0.3s`），需评估性能影响

### 6.2 ThemeProvider

#### 6.2.1 职责

* 管理当前主题状态（`'light' | 'dark'`）

* 应用初始化时读取 localStorage 恢复用户偏好（若无则默认 `'dark'`）

* 提供 `toggleTheme()` 方法

* 通过 React Context 向全组件树传递主题状态

* 同步更新 `<html>` 元素的 `data-theme` 属性和 `class`（`dark` class 给 Tailwind 用）

#### 6.2.2 接口设计

```typescript
interface ThemeContextValue {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isDark: boolean;   // 便捷属性
  isLight: boolean;  // 便捷属性
}
```

#### 6.2.3 挂载位置

ThemeProvider 必须包裹在 App 的最外层（高于路由、高于布局），确保所有子组件均可访问主题上下文。

### 6.3 默认行为与初始化

1. **首次访问**: 默认使用暗色主题（`dark`）
2. **再次访问**: 读取 `localStorage.getItem('pathoptix-theme')`，恢复用户上次选择
3. **localStorage key**: `pathoptix-theme`，值为 `'light'` 或 `'dark'`
4. **避免 FOUC（无样式闪烁）**: 在 `index.html` 的 `<head>` 中内联一段脚本，在 React 渲染之前就读取 localStorage 并设置 `data-theme`，确保首屏即正确主题

```html
<!-- index.html <head> 中防止闪烁的内联脚本 -->
<script>
  (function() {
    var saved = localStorage.getItem('pathoptix-theme');
    if (saved === 'light' || saved === 'dark') {
      document.documentElement.setAttribute('data-theme', saved);
      if (saved === 'dark') {
        document.documentElement.classList.add('dark');
      }
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.classList.add('dark');
    }
  })();
</script>
```

### 6.4 打印样式

当前的打印媒体查询已有基础（将背景设白、文字设黑）。主题切换后需确保：

* 打印时始终使用**亮色配色**（无论当前主题是什么）

* 打印输出不受 `data-theme` 影响

***

## 7. 实施范围与涉及文件

### 7.1 需要新建的文件

| 文件路径                                | 用途                         |
| ----------------------------------- | -------------------------- |
| `src/contexts/ThemeContext.tsx`     | 主题上下文 + Provider           |
| `src/components/ui/ThemeToggle.tsx` | 主题切换按钮组件                   |
| `src/hooks/useTheme.ts`             | 便捷 Hook（可选，封装 Context 消费）  |
| `tailwind.config.js`                | Tailwind 配置（含主题色扩展）        |
| `postcss.config.js`                 | PostCSS 配置                 |
| `src/styles/themes.css`             | CSS 变量定义文件（或放入 index.html） |

### 7.2 需要修改的文件

#### 7.2.1 基础设施层

| 文件路径             | 修改内容                                                            |
| ---------------- | --------------------------------------------------------------- |
| `index.html`     | 移除 CDN script → 改用 CSS 入口；添加防 FOUC 内联脚本；重构 `<style>` 标签为 CSS 变量 |
| `package.json`   | 添加 `tailwindcss`, `postcss`, `autoprefixer` 到 devDependencies   |
| `vite.config.ts` | 可能需要添加相关插件配置                                                    |
| `src/main.tsx`   | 包裹 ThemeProvider                                                |
| `src/App.tsx`    | 确保 ThemeProvider 在最外层                                           |

#### 7.2.2 布局组件层

| 文件路径                                | 修改内容                            |
| ----------------------------------- | ------------------------------- |
| `src/components/layout/Header.tsx`  | 嵌入 ThemeToggle 组件；Header 自身颜色适配 |
| `src/components/layout/Sidebar.tsx` | 所有硬编码颜色替换为语义化类名                 |
| `src/components/layout/index.ts`    | 如有需要，导出新组件                      |

#### 7.2.3 UI 基础组件层

| 文件路径                              | 修改内容                  |
| --------------------------------- | --------------------- |
| `src/components/ui/StatCard.tsx`  | 移除旧 `dark:` 硬编码，改用新体系 |
| `src/components/ui/ChartCard.tsx` | 同上                    |
| `src/components/ui/index.ts`      | 导出 ThemeToggle        |

#### 7.2.4 业务特性模块（按目录）

| 模块目录                         | 涉及文件               | 修改说明            |
| ---------------------------- | ------------------ | --------------- |
| `features/auth/`             | `LoginView.tsx`    | 登录页完整适配双主题      |
| `features/dashboard/`        | Dashboard 相关视图     | 仪表板所有卡片/图表/数据展示 |
| `features/orders/`           | 订单管理全部组件 (\~15个文件) | 表格、表单、Modal、列表  |
| `features/routing/`          | 路线优化全部组件           | 地图面板、参数配置、结果展示  |
| `features/training/`         | 训练优化全部组件           | 监控面板、日志查看       |
| `features/carbon/`           | 碳监测全部组件            | ESG 报告、排放图表     |
| `features/compliance/`       | 合规安全全部组件           | 审计日志、文件管理、变更追踪  |
| `features/customer-service/` | 客户服务全部组件           | AI 聊天、反馈表单、进度追踪 |
| `features/settings/`         | 设置页面               | 设置项展示、表单控件      |

#### 7.2.5 其他可能涉及的文件

| 文件路径                             | 说明                 |
| -------------------------------- | ------------------ |
| `src/types/global.types.ts`      | 可能需要新增 Theme 相关类型  |
| `src/services/api/httpClient.ts` | 一般不需要改动（API 层无关样式） |

### 7.3 不需要修改的文件

* 后端代码（Python/FastAPI）— 主题是纯前端功能

* `src/services/` 目录下的 API 模块 — 无样式代码

* 测试文件 — 除非测试中包含样式断言

* `tsconfig.json` — 除非类型定义变更

***

## 8. 亮色主题 UI 效果描述

### 8.1 整体视觉效果

| 区域     | 暗色（当前）         | 亮色（目标）                    |
| ------ | -------------- | ------------------------- |
| 页面底色   | 深邃黑蓝 `#05080F` | 浅灰白 `#F8FAFC`             |
| 卡片/面板  | 深蓝灰 `#0B121E`  | 纯白 `#ffffff` + 细微阴影       |
| 侧边栏    | 同主背景           | 浅灰 `#F8FAFC` + 右侧分隔线      |
| 输入框    | 深色填充 `#1c2127` | 白色填充 + 灰色边框               |
| 文字     | 白/浅灰为主         | 深灰/黑为主                    |
| 品牌/强调色 | 亮蓝 `#137fec`   | 加深蓝 `#2563EB`（保证白色背景下对比度） |

### 8.2 关键组件亮色效果说明

#### Header（顶部导航栏）

* 背景: 白色 (`#ffffff`) + 底部细阴影

* Logo/标题: 深色文字

* 导航链接: 深灰色，hover 时显示品牌蓝色下划线

* ThemeToggle 图标: 适应亮色背景（深色图标）

#### Sidebar（侧边栏）

* 背景: 极浅灰 (`#F8FAFC`)

* 菜单项文字: 深灰色

* 活跃菜单项: 浅蓝色背景 + 品牌蓝色文字 + 左侧竖条指示器

* 分隔线: 浅灰色

#### 数据卡片（StatCard / ChartCard）

* 背景: 纯白 + 圆角 + 细边框 + 轻投影

* 数值文字: 深色（接近黑色）

* 标签文字: 中灰色

* 图表: 背景自适应，保持数据清晰可读

#### 表格（订单列表等）

* 表头: 浅灰背景 + 深色文字 + 底部边框

* 行: 斑马纹交替（白色 / 极浅灰）

* 边框: 浅灰色

* hover 行: 浅蓝色高亮

#### Modal 弹窗

* 背景: 纯白

* 遮罩层: 半透明黑色

* 关闭按钮: 深色图标

#### 表单（输入框、下拉框）

* 填充: 白色

* 边框: 中灰色

* focus 态: 品牌蓝色边框 + 浅蓝色光晕

* placeholder: 浅灰色

#### 登录页

* 背景: 浅灰渐变或纯色

* 登录卡片: 白色居中卡片 + 投影

* 输入框: 白色填充 + 灰色边框

* 按钮: 品牌蓝色填充 + 白色文字

***

## 9. 验收标准

### 9.1 功能验收

| 编号   | 验收项                         | 验证方法                    |
| ---- | --------------------------- | ----------------------- |
| F-01 | 点击 Header 右上角切换按钮可在明/暗主题间切换 | 手动点击，观察整体颜色变化           |
| F-02 | 切换后图标正确对应（暗色显示太阳，亮色显示月亮）    | 视觉检查                    |
| F-03 | 刷新页面后主题保持为上次选择              | 切换到亮色 → F5 刷新 → 仍为亮色    |
| F-04 | 首次访问默认为暗色主题                 | 清除 localStorage 后首次加载检查 |
| F-05 | 关闭浏览器重新打开后主题保持              | 完整退出重启验证                |
| F-06 | 所有 8 个业务模块在两种主题下均正常显示       | 逐页面遍历检查                 |
| F-07 | 登录页在两种主题下均正常显示              | 分别在两种主题下访问 /login       |
| F-08 | Header 和 Sidebar 在两种主题下正常   | 视觉检查布局组件                |
| F-09 | 表格、表单、Modal、图表在两种主题下可用      | 逐组件类型验证                 |
| F-10 | 打印预览始终为亮色样式                 | Ctrl+P 检查打印预览           |

### 9.2 视觉验收

| 编号   | 验收项                                             |
| ---- | ----------------------------------------------- |
| V-01 | 亮色模式下文字对比度符合 WCAG AA 标准（正文 ≥ 4.5:1）             |
| V-02 | 两种主题下品牌色使用一致，视觉识别度高                             |
| V-03 | 亮色模式下卡片之间有足够层次感（不只是纯白一片）                        |
| V-04 | 切换动画流畅，无卡顿（300ms 过渡）                            |
| V-05 | 无 FOUC（首次加载时不会闪一下错误主题的颜色）                       |
| V-06 | 所有自定义工具类（.glass-card, .glow-cyan 等）在两种主题下均有合适表现 |

### 9.3 技术验收

| 编号   | 验收项                                             |
| ---- | ----------------------------------------------- |
| T-01 | `npm run build` 构建成功，无报错                        |
| T-02 | `npm run dev` 开发服务器正常启动                         |
| T-03 | 零 `console.log` 残留（开发调试日志）                      |
| T-04 | 零新的 `any` 类型引入                                  |
| T-05 | 硬编码颜色值从 236 处降至 0 处（全部替换为语义化引用）                 |
| T-06 | Tailwind CDN 引用已完全移除                            |
| T-07 | `tailwind.config.js` 和 `postcss.config.js` 配置正确 |

### 9.4 兼容性验收

| 编号   | 验收项           |
| ---- | ------------- |
| C-01 | Chrome 最新版正常  |
| C-02 | Firefox 最新版正常 |
| C-03 | Safari 最新版正常  |
| C-04 | Edge 最新版正常    |

***

## 10. 风险与应对

| 风险                               | 影响                | 概率 | 应对措施                                                   |
| -------------------------------- | ----------------- | -- | ------------------------------------------------------ |
| 96 个文件的 236 处硬编码颜色遗漏替换           | 部分组件切换主题后颜色异常     | 中  | 使用 grep/IDE 全局搜索 `#[0-9a-fA-F]` 和 `bg-\[` 等模式逐一核对      |
| Recharts 图表库的主题适配困难              | 图表在亮色模式下不可读       | 中  | Recharts 支持 style/theme 配置，需针对每个图表组件单独设置 fill/stroke 色 |
| CDN → npm 迁移导致某些 Tailwind 类名行为差异 | 样式回归              | 低  | 迁移后逐页面视觉比对截图                                           |
| CSS 变量性能（大量动态颜色计算）               | 低端设备掉帧            | 极低 | CSS 变量由浏览器原生支持，性能几乎无开销                                 |
| 第三方库（如 d3、recharts）内部硬编码颜色       | 库组件不跟随主题切换        | 中  | 通过覆盖库的全局样式变量或 props 注入解决                               |
| 全局样式切换导致现有 `dark:` 前缀行为变化        | 已使用 `dark:` 的组件异常 | 中  | 迁移时统一审查所有 `dark:` 用法，纳入新体系                             |

***

## 11. 实施约束

1. **遵循 AI 开发规约**: 所有代码必须符合 [.trae/rules/ai-development-specification.md](../.trae/rules/ai-development-specification.md)
2. **不引入新** **`any`** **类型**: 主题相关代码类型必须完整
3. **不使用 console.log**: 调试完成后必须清除
4. **保持现有功能不变**: 主题切换是增量功能，不得破坏任何现有业务逻辑
5. **包管理器**: 仅使用 npm，禁止混用 yarn/pnpm
6. **Tailwind 优先**: 样式以 Tailwind 工具类为主，仅复杂效果使用 CSS 变量
7. **组件分层**: ThemeToggle 放在 `src/components/ui/`，ThemeContext 放在 `src/contexts/`

***

## 12. 交付物清单

| 编号 | 交付物                          | 格式             | 位置                                     |
| -- | ---------------------------- | -------------- | -------------------------------------- |
| 1  | 本需求文档                        | Markdown       | `docs/theme-switching-requirement.md`  |
| 2  | ThemeContext + ThemeProvider | TypeScript/TSX | `src/contexts/ThemeContext.tsx`        |
| 3  | ThemeToggle 组件               | TSX            | `src/components/ui/ThemeToggle.tsx`    |
| 4  | useTheme Hook（可选）            | TypeScript     | `src/hooks/useTheme.ts`                |
| 5  | CSS 变量定义                     | CSS            | `src/styles/themes.css` 或 `index.html` |
| 6  | tailwind.config.js           | JavaScript     | 项目根目录                                  |
| 7  | postcss.config.js            | JavaScript     | 项目根目录                                  |
| 8  | 所有组件的颜色替换                    | TSX            | 全部 96 个涉事文件                            |
| 9  | index.html 更新                | HTML           | 项目根目录                                  |
| 10 | 模块交接文档                       | Markdown       | `docs/theme/handover.md`（实施完成后生成）      |

***

## 附录 A：文件影响面清单（预估）

以下为需要做颜色替换的主要文件分类统计：

| 分类                       | 预估文件数    | 预估颜色替换处   |
| ------------------------ | -------- | --------- |
| 布局组件 (layout/)           | 3-5      | 30-50     |
| UI 基础组件 (ui/)            | 5-8      | 20-30     |
| 认证模块 (auth/)             | 2-3      | 10-15     |
| 仪表板 (dashboard/)         | 5-8      | 20-30     |
| 订单管理 (orders/)           | 12-18    | 40-60     |
| 路线优化 (routing/)          | 5-8      | 15-25     |
| 训练优化 (training/)         | 3-5      | 10-15     |
| 碳监测 (carbon/)            | 3-5      | 10-15     |
| 合规安全 (compliance/)       | 5-8      | 15-25     |
| 客户服务 (customer-service/) | 5-8      | 15-20     |
| 设置 (settings/)           | 2-4      | 5-10      |
| 其他散落组件                   | 5-10     | 10-20     |
| **合计**                   | **\~96** | **\~236** |

***

**文档结束**

> 下一步: 本文档经需求方确认后，将基于此生成详细的实施计划（Implementation Plan），包含每个 Task 的具体代码步骤。

