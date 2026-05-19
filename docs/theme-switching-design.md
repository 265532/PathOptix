# PathOptix Dashboard 明暗主题切换 — 概要设计文档

> **文档版本**: v1.0
> **创建日期**: 2026-05-17
> **状态**: 待评审
> **关联需求文档**: [theme-switching-requirement.md](./theme-switching-requirement.md)
> **设计决策记录**: 见第 2 节

---

## 1. 设计概述

### 1.1 设计目标

基于需求文档 [theme-switching-requirement.md](./theme-switching-requirement.md)，设计一套**模块化、可维护、可扩展**的明暗主题切换系统。核心设计原则：

| 原则 | 说明 |
|------|------|
| **关注点分离** | 基础配置、状态管理、UI 控件、组件适配分层解耦 |
| **最小侵入** | 主题系统作为增量层叠加，不破坏现有业务逻辑 |
| **渐进式迁移** | 已有 `dark:` 组件保留原策略，新代码统一使用语义类名 |
| **单一数据源** | CSS 变量作为唯一颜色值来源，Tailwind 类名映射到 CSS 变量 |

### 1.2 设计范围

```
┌──────────────────────────────────────────────────────────────┐
│                      本文档设计范围                           │
│                                                              │
│  ✓ Tailwind CDN → npm 迁移（构建配置）                        │
│  ✓ CSS 变量 Design Tokens 体系                               │
│  ✓ ThemeContext 状态管理层                                    │
│  ✓ ThemeToggle UI 控件                                       │
│  ✓ 全部布局 + UI + 业务组件的颜色适配                         │
│  ✓ 第三方库（Recharts/D3）的主题适配                          │
│                                                              │
│  ✗ 不涉及：后端改动、API 变更、业务逻辑变更                     │
└──────────────────────────────────────────────────────────────┘
```

### 1.3 术语定义

| 术语 | 定义 |
|------|------|
| **Design Token (设计令牌)** | CSS 自定义属性（变量），以 `--` 前缀命名，存储颜色/间距/圆角等视觉原子值 |
| **语义化类名** | 如 `bg-bg-primary`、`text-text-primary`，通过 tailwind.config.js 映射到 CSS 变量的 Tailwind 工具类 |
| **data-theme 属性** | `<html>` 元素上的 `data-theme="light\|dark"` 属性，驱动 CSS 变量选择器切换 |
| **dark class** | `<html>` 元素上的 `class="dark"`，驱动 Tailwind `dark:` 前缀生效 |
| **FOUC** | Flash of Unstyled Content，页面加载时短暂显示错误主题的闪烁现象 |
| **Provider 注入点** | React 组件树中 ThemeProvider 挂载的位置 |

---

## 2. 设计决策记录 (DDR)

以下决策已在设计阶段确认：

| 编号 | 决策项 | 选择 | 理由 |
|------|--------|------|------|
| DD-01 | 技术方案 | CSS 变量 + data-theme 属性切换 | 兼容性最好，迁移成本可控 |
| DD-02 | 默认主题 | Dark 为默认 | 项目当前即暗色设计，用户无感知迁移 |
| DD-03 | 持久化策略 | localStorage | 无需后端支持，即时生效 |
| DD-04 | 切换按钮位置 | Header 导航栏右上角 | 全局可达，符合 UX 惯例 |
| DD-05 | 实施范围 | 全量覆盖所有页面 | 避免部分页面风格不一致 |
| DD-06 | Tailwind 迁移 | CDN → npm | 生产就绪，支持自定义配置 |
| DD-07 | **已有 dark: 组件改写策略** | **渐进式：保留 dark: + 新用语义类** | 降低迁移风险，StatCard/ChartCard/LoginView 已按 light-first 编写，修复暗色值即可 |
| DD-08 | **全局过渡动画** | **添加全局过渡动画（300ms）** | 提升用户体验，CSS 变量过渡性能开销极小 |
| DD-09 | **CSS 变量存放位置** | **独立 `src/styles/themes.css` 文件** | 工程化规范，便于维护和扩展 |

---

## 3. 系统架构

### 3.1 模块划分总览

系统划分为 **7 个一级模块**，每个模块职责明确、边界清晰：

```
┌─────────────────────────────────────────────────────────────────┐
│                      明暗主题切换系统                            │
├─────────────┬─────────────┬─────────────┬───────────────────────┤
│             │             │             │                       │
│   M1 基础设施  │   M2 状态管理  │   M3 UI控件  │    M4~M7 适配层      │
│   配置模块     │    模块       │    模块      │                       │
│             │             │             │  M4:布局适配            │
│ M1-A TW配置  │ M2-A Context│ M3-A Toggle │  M5:UI基础组件适配       │
│ M1-B CSS变量 │ M2-B Hook   │             │  M6:业务组件适配(9模块)   │
│ M1-C 入口改造 │             │             │  M7:第三方库适配         │
│             │             │             │                       │
└─────────────┴─────────────┴─────────────┴───────────────────────┘
```

### 3.2 一级模块清单

| 模块编号 | 模块名称 | 层级 | 核心职责 | 新建/修改 |
|---------|---------|------|---------|----------|
| **M1** | 基础设施配置模块 | 构建配置层 | Tailwind 迁移、CSS 变量定义、入口页改造 | 新建 + 修改 |
| **M2** | 主题状态管理模块 | 状态管理层 | ThemeContext、useTheme Hook、持久化逻辑 | 新建 |
| **M3** | 主题 UI 控件模块 | UI 组件层 | ThemeToggle 切换按钮 | 新建 |
| **M4** | 布局组件适配模块 | 适配层 | Header/Sidebar 颜色替换 | 修改 |
| **M5** | UI 基础组件适配模块 | 适配层 | StatCard/ChartCard 等 dark: 修复 + 其他 UI 组件 | 修改 |
| **M6** | 业务组件适配模块 | 适配层 | 9 个 features 目录下全部业务组件 | 修改 |
| **M7** | 第三方库适配模块 | 适配层 | Recharts 图表、D3 可视化的主题适配 | 修改 |

### 3.3 模块依赖关系图

```
                    ┌──────────────────┐
                    │   M1 基础设施配置  │
                    │  (tailwind.config │
                    │   themes.css      │
                    │   index.html)     │
                    └────────┬─────────┘
                             │ 被...引用
              ┌──────────────┼──────────────┬──────────────┐
              ▼              ▼              ▼              ▼
     ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐
     │ M2 状态管理  │  │ M4 布局适配  │  │ M5 UI组件   │  │ M7 第三方库  │
     │ (Context)   │  │(Header/Side)│  │  适配       │  │  适配       │
     └──────┬─────┘  └──────┬─────┘  └──────┬─────┘  └──────┬─────┘
            │               │               │               │
            │ 提供 theme    │ 使用语义类名   │ 使用语义类名    │ 注入主题色
            │  给下游消费者  │ /dark:前缀    │ /dark:前缀    │ props
            │               │               │               │
            └───────┬───────┴───────┬───────┴───────┬───────┘
                    │               │               │
                    ▼               ▼               ▼
              ┌────────────┐  ┌────────────┐  ┌────────────┐
              │ M3 UI控件   │  │ M6 业务组件  │  │  (M7 的消费  │
              │(ThemeToggle)│  │  适配(9模块) │  │   者)       │
              │ *消费 M2*   │  │             │  │             │
              └────────────┘  └────────────┘  └────────────┘
```

**依赖规则**：

| 依赖方向 | 说明 |
|---------|------|
| M1 → 全部模块 | 所有模块都依赖 M1 定义的构建配置和 CSS 变量 |
| M2 → M3, M4, M5, M6 | 状态管理层向所有下游组件提供 theme 上下文 |
| M3 → M2 | ThemeToggle 消费 ThemeContext |
| M4/M5/M6 → M1 + M2 | 适配层同时依赖基础设施（CSS 变量）和状态管理（Context） |
| M7 → M1 | 第三方库适配仅依赖 CSS 变量（不依赖 React Context） |

### 3.4 数据流全景图

```
                    ┌─────────────┐
                    │ localStorage│ ←── 持久化存储
                    │ pathoptix-  │     'light'|'dark'
                    │ theme       │
                    └──────┬──────┘
                           │ 读取(初始化)/写入(切换)
                           │
    ┌──────────────────────┼──────────────────────┐
    │                      │                      │
    ▼                      ▼                      ▼
┌─────────┐         ┌──────────┐           ┌──────────────┐
│ index.html│         │ThemeContext│          │ <html> 元素   │
│ FOUC脚本  │◄────────│ Provider  │──────────►│ .data-theme  │
│(同步读取) │  设置    │ (React)   │  DOM操作   │ .class(dark) │
└─────────┘         └─────┬────┘           └──────┬───────┘
                          │                       │
                   toggleTheme()                  │
                          │                       ▼
                          │              ┌─────────────────┐
                          │              │ CSS 变量解析器    │
                          │              │ (浏览器原生)      │
                          │              │ themes.css 中的   │
                          │              │ [data-theme=x]   │
                          │              │ 选择器生效        │
                          │              └────────┬────────┘
                          │                       │
                          │              CSS 变量值变化
                          │                       │
                          ▼                       ▼
                   ┌──────────┐           ┌──────────────────┐
                   │ThemeToggle│           │  所有使用 CSS 变量 │
                   │ 重新渲染  │           │  /语义类名的元素   │
                   │(图标切换) │           │  自动更新颜色      │
                   └──────────┘           └──────────────────┘
```

---

## 4. 各模块详细设计

---

### M1: 基础设施配置模块

#### 4.1.1 模块职责

为整个主题系统提供**构建时**和**运行时**的基础设施支撑：
- Tailwind 从 CDN 到 npm 的构建工具链迁移
- 完整的 Design Token（CSS 变量）定义
- 应用入口页的防 FOUC 脚本和样式重构

#### 4.1.2 子模块分解

| 子模块 | 产物文件 | 类型 | 职责 |
|--------|---------|------|------|
| **M1-A** | `tailwind.config.js` | 新建 | Tailwind 构建配置：darkMode、自定义颜色扩展、content 路径 |
| **M1-A** | `postcss.config.js` | 新建 | PostCSS 配置：tailwindcss + autoprefixer 插件 |
| **M1-B** | `src/styles/themes.css` | 新建 | CSS 变量完整定义：Dark/Light 双套令牌 + 全局过渡 + 工具类适配 |
| **M1-C** | `index.html` | 修改 | 移除 CDN script → 引入 CSS 入口；添加 FOUC 防护内联脚本；重构 `<style>` 标签 |
| **M1-C** | `package.json` | 修改 | 添加 tailwindcss/postcss/autoprefixer devDependencies |
| **M1-C** | `src/main.tsx` | 修改 | import themes.css 入口文件 |

#### 4.1.3 M1-A: tailwind.config.js 详细设计

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  // 扫描范围：确保所有源码中的类名都被收录
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],

  // 核心：使用 class 策略（非 media），由 JS 控制 dark class 的增删
  darkMode: 'class',

  theme: {
    extend: {
      // ===== 颜色系统：全部映射到 CSS 变量 =====
      colors: {
        // 背景色系
        bg: {
          primary: 'var(--color-bg-primary)',
          secondary: 'var(--color-bg-secondary)',
          tertiary: 'var(--color-bg-tertiary)',
          elevated: 'var(--color-bg-elevated)',
          modal: 'var(--color-bg-modal)',
        },
        // 文字色系
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
        },
        // 品牌/语义色
        brand: {
          primary: 'var(--color-brand-primary)',
          success: 'var(--color-brand-success)',
          warning: 'var(--color-brand-warning)',
          error: 'var(--color-brand-error)',
          accent: 'var(--color-brand-accent)',
        },
        // 边框色系
        border: {
          default: 'var(--color-border-default)',
          input: 'var(--color-border-input)',
          focus: 'var(--color-border-focus)',
        },
      },

      // ===== 保留 Tailwind 默认值的其他扩展项 =====
      // （间距、圆角等沿用默认，无需重复定义）
    },
  },

  plugins: [],
};
```

**关键设计说明**：

| 设计点 | 决策 | 原因 |
|--------|------|------|
| `darkMode: 'class'` | 使用 class 策略 | 允许 JS 主动控制主题切换，而非被动跟随系统偏好 |
| 颜色值使用 `var()` | 引用 CSS 变量 | 当 `[data-theme]` 变化时，CSS 变量自动切换，所有引用处同步更新 |
| 颜色分 4 组（bg/text/brand/border） | 语义分组 | 避免扁平命名冲突，提升可读性 |
| content 包含 `./index.html` | 覆盖 HTML 文件 | 确保 index.html 中可能使用的类名也被扫描到 |

#### 4.1.4 M1-B: themes.css 详细设计

**文件路径**: `src/styles/themes.css`

**结构概览**：

```css
/* ============================================================
   src/styles/themes.css
   PathOptix Dashboard — Design Tokens & 主题变量定义
   ============================================================ */

/* ----- 第 1 部分：通用令牌（不随主题变化）----- */
/* ... font-family, radius, spacing ... */

/* ----- 第 2 部分：暗色主题令牌（默认）----- */
/* :root + [data-theme="dark"] */

/* ----- 第 3 部分：亮色主题令牌 ----- */
/* [data-theme="light"] */

/* ----- 第 4 部分：全局过渡效果 ----- */
/* transition on * or body */

/* ----- 第 5 部分：主题感知的全局工具类 ----- */
/* .glass-card, .glow-cyan, .glow-button, .path-glow, .network-gradient */

/* ----- 第 6 部分：滚动条样式（双主题）----- */

/* ----- 第 7 部分：打印样式（强制亮色）----- */
```

**完整的 CSS 变量清单**（共 26 个变量）：

| 分组 | 变量名 | Dark 值 | Light 值 |
|------|--------|---------|----------|
| **背景 (6)** | `--color-bg-primary` | `#05080F` | `#F8FAFC` |
| | `--color-bg-secondary` | `#0B121E` | `#ffffff` |
| | `--color-bg-tertiary` | `#111827` | `#F1F5F9` |
| | `--color-bg-elevated` | `#1c2127` | `#ffffff` |
| | `--color-bg-modal` | `#0B0F19` | `#ffffff` |
| | `--color-bg-overlay` | `rgba(0,0,0,0.6)` | `rgba(0,0,0,0.5)` |
| **文字 (3)** | `--color-text-primary` | `#ffffff` | `#0F172A` |
| | `--color-text-secondary` | `#9dabb9` | `#475569` |
| | `--color-text-muted` | `#64748b` | `#94A3B8` |
| **边框 (3)** | `--color-border-default` | `rgba(59,71,84,0.5)` | `#E2E8F0` |
| | `--color-border-input` | `#3b4754` | `#CBD5E1` |
| | `--color-border-focus` | `#137fec` | `#2563EB` |
| **品牌 (5)** | `--color-brand-primary` | `#137fec` | `#2563EB` |
| | `--color-brand-success` | `#10b981` | `#059669` |
| | `--color-brand-warning` | `#f59e0b` | `#D97706` |
| | `--color-brand-error` | `#ef4444` | `#DC2626` |
| | `--color-brand-accent` | `#06b6d4` | `#0891B2` |
| **特效 (5)** | `--glow-cyan` | `0 0 15px rgba(6,182,212,0.4)` | `0 0 12px rgba(6,182,212,0.25)` |
| | `--glass-bg` | `rgba(28,33,39,0.7)` | `rgba(255,255,255,0.8)` |
| | `--glass-border` | `rgba(59,71,84,0.5)` | `rgba(226,232,240,0.8)` |
| | `--scrollbar-track` | `#0B0F19` | `#F1F5F9` |
| | `--scrollbar-thumb` | `#1F2937` | `#CBD5E1` |
| **装饰 (1)** | `--network-gradient` | `radial-gradient(...#137fec1a...)` | `radial-gradient(...#3730a308...)` |

**全局过渡效果设计**：

```css
/* 全局颜色过渡：使主题切换平滑 */
/* 仅作用于 background-color, color, border-color, box-shadow */
html {
  transition: background-color 0.3s ease-in-out,
              color 0.3s ease-in-out,
              border-color 0.3s ease-in-out,
              box-shadow 0.3s ease-in-out;
}

/* 对特定交互元素禁用过渡（避免拖慢 hover 等即时反馈）*/
button, a, input, select, textarea {
  transition: none;
}
```

**主题感知工具类改造**：

将 index.html 中现有的硬编码工具类改为 CSS 变量版本：

```css
/* 改造前（index.html 当前写法）*/
.glow-cyan { box-shadow: 0 0 15px rgba(6, 182, 212, 0.4); }

/* 改造后（themes.css 中）*/
[data-theme="dark"] .glow-cyan { box-shadow: var(--glow-cyan); }
[data-theme="light"] .glow-cyan { box-shadow: var(--glow-cyan); }

/* 或简化为（推荐）：*/
.glow-cyan { box-shadow: var(--glow-cyan); }
/* 因为 --glow-cyan 已在 [data-theme] 选择器中定义了不同值 */
```

#### 4.1.5 M1-C: index.html 改造要点

**改造清单**：

| 操作 | 位置 | 详情 |
|------|------|------|
| **删除** | `<head>` 第 8 行 | 移除 `<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries">` |
| **新增** | `<head>` 最前端 | FOUC 防护内联脚本（在所有资源加载前执行） |
| **新增** | `<head>` | 无标题：`<link rel="stylesheet" href="/src/styles/themes.css">`（Vite 处理） |
| **重写** | `<style>` 标签 (L11-L88) | 将 body 硬编码样式改为 `var()` 引用；将工具类改为 `var()` 引用；保留打印样式 |
| **保留** | 字体引入 (Google Fonts) | Inter + Material Symbols Outlined 不变 |
| **保留** | importmap | recharts/lucide-react/react 的 esm.sh 映射不变 |

**FOUC 防护脚本**（必须放在 `<head>` 最顶部，同步执行）：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <!-- ========== FOUC 防护：必须在所有资源之前 ========== -->
  <script>
    (function() {
      var saved = localStorage.getItem('pathoptix-theme');
      var theme = (saved === 'light' || saved === 'dark') ? saved : 'dark';
      document.documentElement.setAttribute('data-theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    })();
  </script>

  <!-- 其余 head 内容... -->
</head>
```

#### 4.1.6 M1 内部接口

| 接口 | 提供者 | 消费者 | 格式 |
|------|--------|--------|------|
| Tailwind 自定义颜色类名 | tailwind.config.js | 所有 TSX 组件 | `bg-bg-primary`, `text-text-primary`, ... |
| CSS 变量值 | themes.css | 浏览器渲染引擎 + tailwind.config.js | `var(--color-xxx)` |
| FOUC 初始状态 | index.html 内联脚本 | 浏览器 DOM | `data-theme` + `.dark` class |
| CSS 入口 | main.tsx import | Vite 构建管线 | `@import '/src/styles/themes.css'` |

---

### M2: 主题状态管理模块

#### 4.2.1 模块职责

管理主题状态的**整个生命周期**：初始化读取、状态持有、切换逻辑、DOM 同步、持久化写入。

#### 4.2.2 子模块分解

| 子模块 | 产物文件 | 类型 | 职责 |
|--------|---------|------|------|
| **M2-A** | `src/contexts/ThemeContext.tsx` | 新建 | ThemeContext 定义 + ThemeProvider 实现 |
| **M2-B** | `src/hooks/useTheme.ts` | 新建 | 便捷 Hook，封装 Context 消费逻辑 |

#### 4.2.3 M2-A: ThemeContext 详细设计

**文件路径**: `src/contexts/ThemeContext.tsx`

**类型定义**：

```typescript
type Theme = 'light' | 'dark';

interface ThemeContextValue {
  /** 当前主题值 */
  theme: Theme;
  /** 是否为暗色模式（便捷属性） */
  isDark: boolean;
  /** 是否为亮色模式（便捷属性） */
  isLight: boolean;
  /** 切换主题方法 */
  toggleTheme: () => void;
  /** 设置指定主题方法（用于未来可能的系统设置页手动选择） */
  setTheme: (theme: Theme) => void;
}
```

**Provider 核心逻辑伪代码**：

```typescript
const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // 初始化：从 localStorage 读取，无则默认 dark
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pathoptix-theme');
      if (saved === 'light' || saved === 'dark') return saved;
    }
    return 'dark';
  });

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    applyTheme(newTheme);
  }, []);

  const applyTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);

    // 同步 DOM 属性（驱动 CSS 变量切换）
    document.documentElement.setAttribute('data-theme', newTheme);

    // 同步 Tailwind dark class
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // 持久化
    localStorage.setItem('pathoptix-theme', newTheme);
  }, []);

  const value: ThemeContextValue = useMemo(() => ({
    theme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    toggleTheme,
    setTheme,
  }), [theme, toggleTheme, setTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
```

**导出**：

```typescript
export { ThemeProvider };
export { ThemeContext };       // 用于高级场景直接消费 Context
export type { Theme, ThemeContextValue }; // 类型导出
```

#### 4.2.4 M2-B: useTheme Hook 详细设计

**文件路径**: `src/hooks/useTheme.ts`

```typescript
import { useContext } from 'react';
import { ThemeContext, type ThemeContextValue } from '@contexts/ThemeContext';

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
```

**使用场景**：

```typescript
// 在任意组件中使用
const { theme, isDark, toggleTheme } = useTheme();
```

#### 4.2.5 Provider 注入点设计

**注入位置**: [main.tsx](../src/main.tsx)，包裹 `<App />`：

```typescript
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';

const rootElement = document.getElementById('root');
if (!rootElement) { throw new Error("Could not find root element"); }

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ThemeProvider>          {/* ← 新增 */}
      <App />
    </ThemeProvider>         {/* ← 新增 */}
  </React.StrictMode>
);
```

**注入层级关系**：

```
main.tsx
 └── <React.StrictMode>
      └── <ThemeProvider>        ← M2 注入点（最外层）
           └── <App>
                ├── <Sidebar>   ← M4 消费 M2
                └── <main>
                     ├── <Header>   ← M4 消费 M2, 内含 M3
                     │    └── <ThemeToggle>  ← M3 消费 M2
                     └── <DashboardView>   ← M6 消费 M2
                          └── <StatCard>    ← M5 消费 M2
```

#### 4.2.6 M2 内部/外部接口

| 接口 | 方向 | 签名 | 说明 |
|------|------|------|------|
| `ThemeProvider.children` | 输入 | `React.ReactNode` | 接收子组件树 |
| `ThemeContextValue.theme` | 输出 | `'light' \| 'dark'` | 当前主题值 |
| `ThemeContextValue.isDark` | 输出 | `boolean` | 暗色判断 |
| `ThemeContextValue.isLight` | 输出 | `boolean` | 亮色判断 |
| `ThemeContextValue.toggleTheme()` | 输出 | `() => void` | 切换主题 |
| `ThemeContextValue.setTheme(t)` | 输出 | `(t: Theme) => void` | 设定主题 |
| `useTheme()` | 输出 | `() => ThemeContextValue` | Hook 封装 |
| `localStorage` | 外部依赖 | `pathoptix-theme` key | 持久化读写 |
| `document.documentElement` | 外部依赖 | DOM API | 设置 data-theme + classList |

---

### M3: 主题 UI 控件模块

#### 4.3.1 模块职责

提供用户可见可操作的**主题切换按钮**，是整个主题系统唯一的用户交互入口。

#### 4.3.2 子模块分解

| 子模块 | 产物文件 | 类型 | 职责 |
|--------|---------|------|------|
| **M3-A** | `src/components/ui/ThemeToggle.tsx` | 新建 | 主题切换图标按钮组件 |

#### 4.3.3 M3-A: ThemeToggle 详细设计

**文件路径**: `src/components/ui/ThemeToggle.tsx`

**Props 接口**：

```typescript
interface ThemeToggleProps {
  /** 自定义类名（可选） */
  className?: string;
  /** 尺寸变体 */
  size?: 'sm' | 'md' | 'lg';
}
```

**内部结构**：

```tsx
<button
  onClick={toggleTheme}
  className={cn(
    'relative inline-flex items-center justify-center',
    'rounded-lg text-slate-500 hover:text-slate-200',
    'transition-colors duration-300',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2',
    sizeClasses[size],
    className
  )}
  aria-label={isDark ? '切换到亮色模式' : '切换到暗色模式'}
  title={isDark ? '切换到亮色模式' : '切换到暗色模式'}
>
  {/* 太阳图标 - 亮色模式下显示（点击后切到暗色） */}
  <Sun
    className={cn(
      'absolute transition-all duration-300 ease-in-out',
      isDark
        ? 'rotate-90 scale-0 opacity-0'
        : 'rotate-0 scale-100 opacity-100'
    )}
    size={iconSize}
  />

  {/* 月亮图标 - 暗色模式下显示（点击后切到亮色） */}
  <Moon
    className={cn(
      'absolute transition-all duration-300 ease-in-out',
      isDark
        ? 'rotate-0 scale-100 opacity-100'
        : '-rotate-90 scale-0 opacity-0'
    )}
    size={iconSize}
  />
</button>
```

**尺寸规格**：

| size | 按钮尺寸 | 图标尺寸 | 用途 |
|------|---------|---------|------|
| `sm` | `w-7 h-7` | `14px` | 紧凑场景 |
| `md` (默认) | `w-9 h-9` | `18px` | Header 工具栏 |
| `lg` | `w-11 h-11` | `22px` | 独立展示 |

**动画规格**：

| 动画 | 触发条件 | 过渡属性 | 时长 | 缓动 |
|------|---------|---------|------|------|
| 图标旋转+缩放淡入 | 主题切换时 | transform, opacity | 300ms | ease-in-out |
| 按钮颜色过渡 | hover 时 | color | 300ms | 默认 |
| Focus ring | 键盘聚焦时 | box-shadow | 即时 | 默认 |

**无障碍**：

| 特性 | 实现 |
|------|------|
| ARIA label | 动态：`aria-label="切换到亮色/暗色模式"` |
| Title 属性 | 同上 |
| 键盘操作 | 原生 button 支持 Tab/Enter/Space |
| Focus visible | `focus-visible:ring-2` 环形焦点指示器 |
| 减少动画偏好 | 未来可通过 `prefers-reduced-motion` 禁用旋转动画 |

#### 4.3.4 在 Header 中的集成位置

**插入点**: [Header.tsx](../src/components/layout/Header.tsx)，右侧区域，**延迟指示器之后、通知铃铛之前**（约 L103 行）

**Header 右侧区域新结构**：

```
Header 右侧 (flex items-center gap-6):
  ├── 延迟指示器 (Activity + "延迟: 24ms")    ← 已有
  ├── 分隔线 (h-10 w-px bg-slate-800)          ← 已有
  ├── [NEW] ThemeToggle                        ← ★ 新增在此
  ├── 通知铃铛 (Bell + 红点 + 下拉面板)        ← 已有
  └── 用户头像下拉菜单                         ← 已有
```

#### 4.3.5 barrel 导出更新

**文件**: [src/components/ui/index.ts](../src/components/ui/index.ts)

```typescript
// 新增导出
export { default as ThemeToggle } from './ThemeToggle';

// 现有导出保持不变
export { default as ChartCard } from './ChartCard';
export { default as StatCard } from './StatCard';
export { default as MapWidget } from './MapWidget';
export { default as AlertPanel } from './AlertPanel';
```

#### 4.3.6 M3 接口

| 接口 | 方向 | 说明 |
|------|------|------|
| Props: `className?` | 输入 | 可选自定义类名 |
| Props: `size?` | 输入 | 尺寸变体 sm/md/lg |
| `useTheme().toggleTheme` | 来自 M2 | 点击时调用 |
| 渲染输出 | 输出 | `<button>` 包裹 Sun/Moon 图标 |

**M3 依赖关系**: 仅依赖 M2（useTheme Hook）和 lucide-react（Sun/Moon 图标）

---

### M4: 布局组件适配模块

#### 4.4.1 模块职责

对项目**两个核心布局组件**（Header 和 Sidebar）进行颜色硬编码→语义化类名的替换，使其响应主题切换。

#### 4.4.2 子模块分解

| 子模块 | 涉及文件 | 替换规模 | 策略 |
|--------|---------|---------|------|
| **M4-A** | `src/components/layout/Header.tsx` | ~15-20 处 | 全部替换为语义类名 |
| **M4-B** | `src/components/layout/Sidebar.tsx` | ~12-18 处 | 全部替换为语义类名 |

#### 4.4.3 M4-A: Header 适配详细设计

**当前硬编码颜色分布**（基于代码分析）：

| 当前值 | 语义替换为 | 出现位置 |
|--------|-----------|---------|
| `bg-[#...]` (Header 背景) | `bg-bg-secondary` + `border-b border-border-default` | header 根元素 |
| `text-white` / `text-slate-200` (Logo/标题) | `text-text-primary` / `text-text-secondary` | Logo 区域文字 |
| `bg-slate-800` (分隔线) | `bg-border-default` | 竖向分隔线 |
| `text-slate-500` (延迟文字) | `text-text-muted` | 延迟指示器 |
| `bg-slate-900` / `bg-slate-800` (各种背景) | `bg-bg-tertiary` / `bg-bg-elevated` | 下拉面板、通知面板 |

**Header 亮色模式特殊处理**：

Header 作为**顶部固定导航栏**，在亮色模式下需要额外的视觉层次手段（因为暗色模式下靠深色差异区分，亮色模式下需要阴影）：

```tsx
{/* Header 根元素 — 适配后 */}
<header className={cn(
  'sticky top-0 z-50 h-20 flex items-center justify-between px-6',
  'bg-bg-secondary border-b border-border-default',
  // 亮色模式添加底部阴影增强层次感
  'shadow-sm dark:shadow-none transition-shadow duration-300'
)}>
```

#### 4.4.4 M4-B: Sidebar 适配详细设计

**当前硬编码颜色分布**：

| 当前值 | 语义替换为 | 出现位置 |
|--------|-----------|---------|
| `bg-[#05080F]` (侧边栏背景) | `bg-bg-primary` | Sidebar 根元素 |
| `border-r border-slate-900` | `border-r border-border-default` | 右边框 |
| `text-white` (Logo 文字) | `text-text-primary` | PathOptix logo |
| `text-slate-400` (菜单未选中) | `text-text-muted` | menuItems |
| `hover:text-slate-200` | `hover:text-text-secondary` | menuItems hover |
| `hover:bg-slate-800/30` | `hover:bg-bg-tertiary/50` | menuItems hover |
| `bg-[#0B121E]` (选中态背景) | `bg-bg-secondary` | active menu item |
| `border-cyan-500/10` (选中态边框) | `border-brand-primary/10` | active menu item |
| `text-cyan-400` (选中态文字) | `text-brand-primary` | active menu item |
| `bg-[#0B121E]` (底部卡片) | `bg-bg-secondary` | 优化率卡片 |
| `border-slate-900` (底部卡片边框) | `border-border-default` | 优化率卡片 |

**Sidebar 亮色模式特殊处理**：

亮色模式下 Sidebar 与主内容区的分隔主要靠**右边框颜色**区分（暗色模式下靠背景深度差区分）：

```tsx
<div className={cn(
  'w-80 bg-bg-primary border-r border-border-default flex flex-col h-full shrink-0',
  // 亮色模式可选：添加微妙的右侧阴影
  'shadow-sm dark:shadow-none'
)}>
```

---

### M5: UI 基础组件适配模块

#### 4.5.1 模块职责

适配 `src/components/ui/` 下的**原子级 UI 组件**。本模块采用**渐进式策略**（DD-07）：

- **A 组**（已使用 `dark:` 的组件）：保留 `dark:` 结构，仅修正暗色值为正确的 Design Token 值
- **B 组**（未使用 `dark:` 的组件）：改写为语义化类名

#### 4.5.2 子模块分解

| 分组 | 涉及文件 | 策略 | 说明 |
|------|---------|------|------|
| **A 组** | `StatCard.tsx` | 保留 dark:，修正暗色值 | 已有 light-first 结构，暗色值需与 Design Token 对齐 |
| **A 组** | `ChartCard.tsx` | 保留 dark:，修正暗色值 | 同上，额外有 tooltip 暗色值 |
| **A 组** | `LoginView.tsx` | 保留 dark:，修正暗色值 | 登录页已有 dark: 结构 |
| **B 组** | `MapWidget.tsx` | 改为语义类名 | 需检查是否有硬编码颜色 |
| **B 组** | `AlertPanel.tsx` | 改为语义类名 | 需检查是否有硬编码颜色 |

#### 4.5.3 A 组组件改造示例（StatCard）

**改造前**（当前代码）：

```tsx
<div className="bg-slate-50 dark:bg-[#151B28] rounded-xl p-5 
  border border-slate-200 dark:border-slate-800/50 
  hover:border-slate-300 dark:hover:border-slate-700 transition-all">

  <span className="text-slate-400 text-xs font-medium">{label}</span>
  <span className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</span>
  <div className="text-[10px] text-slate-500 font-medium">{subtitle}</div>
</div>
```

**改造后**：

```tsx
<div className="bg-bg-secondary rounded-xl p-5 
  border border-border-default 
  hover:border-border-input transition-all duration-300">

  <span className="text-text-muted text-xs font-medium">{label}</span>
  <span className="text-3xl font-bold text-text-primary tracking-tight">{value}</span>
  <div className="text-[10px] text-text-muted font-medium">{subtitle}</div>
</div>
```

**改造说明**：

| 改造前 (light/dark 双写) | 改造后 (CSS 变量自动切换) | 原因 |
|--------------------------|--------------------------|------|
| `bg-slate-50` / `dark:bg-[#151B28]` | `bg-bg-secondary` | CSS 变量根据 data-theme 自动取值 |
| `text-slate-900` / `dark:text-white` | `text-text-primary` | 同上 |
| `border-slate-200` / `dark:border-slate-800/50` | `border-border-default` | 同上 |
| `text-slate-400` / `text-slate-500` | `text-text-muted` | 同上 |

> **注意**: StatCard 改造后的效果：不再需要 `dark:` 前缀，因为 `bg-bg-secondary` 在 dark 下解析为 `#0B121E`，在 light 下解析为 `#ffffff`。代码量减少约 40%。

#### 4.5.4 B 组组件改造原则

对于未使用 `dark:` 的组件，逐一执行：

1. 用 grep 搜索文件中所有 `#[0-9a-fA-F]` 和 `bg-\[`, `text-\[`, `border-\[` 模式
2. 根据语义对照表替换为对应的语义类名
3. 无法归入预定义语义的颜色（如特殊的图表色、地图色）保留原值或提取为新的 CSS 变量

---

### M6: 业务组件适配模块

#### 4.6.1 模块职责

最大的适配模块，覆盖 **9 个业务特性目录**下约 **80+ 个组件文件**的颜色替换。

#### 4.6.2 子模块分解（按业务领域）

| 模块编号 | 业务域 | 目录 | 预估文件数 | 预估颜色替换处 | 优先级 |
|---------|--------|------|-----------|---------------|--------|
| **M6-A** | 认证 | `features/auth/` | 2-3 | 10-15 | P0（登录入口） |
| **M6-B** | 仪表板 | `features/dashboard/` | 5-8 | 20-30 | P0（首页） |
| **M6-C** | 订单管理 | `features/orders/` | 12-18 | 40-60 | P0（核心业务） |
| **M6-D** | 路线优化 | `features/routing/` | 8-12 | 15-25 | P1 |
| **M6-E** | 训练优化 | `features/training/` | 6-8 | 10-15 | P1 |
| **M6-F** | 碳监测 | `features/carbon/` | 6-8 | 10-15 | P1 |
| **M6-G** | 合规安全 | `features/compliance/` | 14-18 | 25-35 | P1 |
| **M6-H** | 客户服务 | `features/customer-service/` | 10-12 | 15-20 | P1 |
| **M6-I** | 系统设置 | `features/settings/` | 8-12 | 10-20 | P2 |

#### 4.6.3 适配方法论

所有业务组件遵循统一的**三步适配流程**：

```
步骤 1: 颜色审计（Audit）
  └── 用正则搜索文件中的硬编码颜色:
      - bg-[#hex], text-[#hex], border-[#hex]
      - from-[#hex]/to-[#hex]
      - bg-slate-* / text-slate-* (需评估是否应替换为语义色)

步骤 2: 语义映射（Map）
  └── 对照「颜色替换规则表」（需求文档 4.4.1 节）
      - 背景色 → bg-bg-{primary,secondary,tertiary,elevated,modal}
      - 文字色 → text-text-{primary,secondary,muted}
      - 品牌色 → text-brand-{primary,success,warning,error,accent} / bg-brand-*
      - 边框色 → border-border-{default,input,focus}

步骤 3: 替换验证（Verify）
  └── 替换后在两种主题下目视检查
      - 暗色模式：视觉效果应与改造前一致（回归测试）
      - 亮色模式：对比度足够、层次清晰、无不合理颜色泄漏
```

#### 4.6.4 特殊场景处理

| 场景 | 处理方式 | 示例 |
|------|---------|------|
| **动态计算的颜色**（如进度条渐变） | 提取为独立 CSS 变量 | `--progress-gradient: linear-gradient(...)` |
| **图表系列色**（Recharts 配置） | 通过 M7 统一处理 | 见 M7 章节 |
| **条件渲染的颜色**（如状态 badge） | 保留品牌色语义类名 | `bg-brand-success` / `bg-brand-error` |
| **透明度/半透明色** | 在 CSS 变量中使用 rgba | `--color-bg-overlay: rgba(0,0,0,0.6)` |
| **SVG stroke/fill 颜色** | 使用 `stroke-var(--color-xxx)` 或 style 注入 | D3 图表场景 |

---

### M7: 第三方库适配模块

#### 4.7.1 模块职责

处理项目中**第三方可视化库**的主题适配，这些库通常有自己的颜色配置体系，不会自动跟随 CSS 变量。

#### 4.7.2 涉及的第三方库

| 库名 | 版本 | 用途 | 适配方式 |
|------|------|------|---------|
| **Recharts** | ^3.7.0 | 统计图表（折线图、柱状图、饼图等） | 通过组件 props 注入主题色 |
| **D3.js** | ^7.9.0 | 高级可视化（地图、网络图、力导向图等） | 通过 style 或 attr 注入 CSS 变量引用 |

#### 4.7.3 M7-A: Recharts 适配设计

**适配策略**: 创建一个 **Recharts 主题配置 Hook**，根据当前主题返回统一的图表样式配置。

**文件路径**: `src/hooks/useChartTheme.ts`（新建，属于 M7 但靠近 hooks 目录）

```typescript
import { useTheme } from './useTheme';

interface ChartThemeConfig {
  /** 图表背景色 */
  backgroundColor: string;
  /** 网格线颜色 */
  gridColor: string;
  /** 坐标轴文字颜色 */
  axisTextColor: string;
  /** 图例文字颜色 */
  legendTextColor: string;
  /** tooltip 背景色 */
  tooltipBackgroundColor: string;
  /** tooltip 文字颜色 */
  tooltipTextColor: string;
  /** 默认系列色列表 */
  colors: string[];
}

export function useChartTheme(): ChartThemeConfig {
  const { isDark } = useTheme();

  return {
    backgroundColor: isDark ? 'var(--color-bg-secondary)' : 'var(--color-bg-secondary)',
    gridColor: isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.15)',
    axisTextColor: isDark ? 'var(--color-text-muted)' : 'var(--color-text-muted)',
    legendTextColor: isDark ? 'var(--color-text-secondary)' : 'var(--color-text-secondary)',
    tooltipBackgroundColor: isDark ? 'var(--color-bg-elevated)' : '#ffffff',
    tooltipTextColor: isDark ? 'var(--color-text-primary)' : 'var(--color-text-primary)',
    colors: [
      'var(--color-brand-primary)',   // 蓝
      'var(--color-brand-success)',   // 绿
      'var(--color-brand-warning)',   // 橙
      'var(--color-brand-accent)',    // 青
      '#8b5cf6',                       // 紫（固定）
      '#ec4899',                       // 粉（固定）
    ],
  };
}
```

**使用方式**（在图表组件中）：

```tsx
const chartTheme = useChartTheme();

<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    <CartesianGrid stroke={chartTheme.gridColor} />
    <XAxis dataKey="name" tick={{ fill: chartTheme.axisTextColor }} />
    <YAxis tick={{ fill: chartTheme.axisTextColor }} />
    <Tooltip
      contentStyle={{
        backgroundColor: chartTheme.tooltipBackgroundColor,
        color: chartTheme.tooltipTextColor,
        border: `1px solid var(--color-border-default)`,
      }}
    />
    <Legend wrapperStyle={{ color: chartTheme.legendTextColor }} />
    <Line type="monotone" dataKey="value" stroke={chartTheme.colors[0]} />
  </LineChart>
</ResponsiveContainer>
```

#### 4.7.4 M7-B: D3.js 适配设计

**适配策略**: D3 通常直接操作 DOM/SVG，需要在 selection 链中使用 CSS 变量引用：

```typescript
// 示例：D3 力导向图的节点着色
svg.selectAll('.node-circle')
  .attr('fill', 'var(--color-bg-secondary)')
  .attr('stroke', 'var(--color-brand-primary)')
  .attr('stroke-width', 2);

svg.selectAll('.node-label')
  .style('fill', 'var(--color-text-primary)')
  .style('font-size', '12px');

svg.selectAll('.link-line')
  .style('stroke', 'var(--color-border-default)')
  .style('stroke-opacity', 0.3);
```

**关键点**: D3 中使用 `var(--xxx)` 引用时，浏览器会在**每次 CSS 变量变化时自动重新解析** SVG 属性值，无需手动监听主题切换事件。

---

## 5. 关键流程设计

### 5.1 应用启动流程（主题初始化）

```
用户打开应用
    │
    ▼
[浏览器解析 index.html <head>]
    │
    ├─→ FOUC 防护脚本同步执行
    │    ├─→ localStorage.getItem('pathoptix-theme')
    │    ├─→ 若无/无效 → 默认 'dark'
    │    ├─→ document.documentElement.setAttribute('data-theme', result)
    │    └─→ document.documentElement.classList.add/remove('dark')
    │
    ├─→ 加载 Google Fonts (Inter, Material Symbols)
    ├─→ 加载 themes.css (CSS 变量定义生效)
    │    └─→ 浏览器根据 [data-theme] 解析对应的 CSS 变量集
    │
    ▼
[React 启动 (main.tsx)]
    │
    ├─→ import './styles/themes.css' (Vite 处理)
    ├─→ <ThemeProvider> 初始化
    │    ├─→ useState 初始值从 localStorage 读取
    │    └─→ applyTheme() 同步 DOM (与 FOUC 脚本结果一致，无闪烁)
    │
    └─→ <App /> 渲染
         └─→ 所有组件使用语义类名 → 解析为当前主题的正确颜色
```

### 5.2 主题切换流程（运行时）

```
用户点击 Header 中的 ThemeToggle 按钮
    │
    ▼
[ThemeToggle.onClick]
    │
    └─→ useTheme().toggleTheme()
         │
         ├─→ 计算 newTheme = theme === 'dark' ? 'light' : 'dark'
         │
         └─→ [ThemeContext.applyTheme(newTheme)]
              │
              ├─→ 1. setState(newTheme) ──────────────────┐
              │                                            │
              ├─→ 2. document.documentElement              │
              │    .setAttribute('data-theme', newTheme)   │
              │    → CSS 变量选择器切换                     │
              │    → 所有 var(--color-xxx) 自动解析为新值    │
              │                                            │
              ├─→ 3. classList.toggle('dark')              │
              │    → Tailwind dark: 前缀的类生效/失效         │
              │                                            │
              └─→ 4. localStorage.setItem(                 │
                   'pathoptix-theme', newTheme)             │
                                                        │
    ◄────────────────────────────────────────────────────┘
    │
    ▼
[React 重渲染受影响组件]
    │
    ├─→ ThemeToggle: isDark 变化 → Sun/Moon 图标切换动画
    ├─→ Header: 可能调整某些亮色专属样式（如阴影）
    ├─→ Sidebar: 菜单项颜色自动跟随 CSS 变量
    └─→ 所有业务组件: 颜色通过 CSS 过渡 (0.3s) 平滑变化
```

### 5.3 颜色替换工作流（组件适配）

```
待适配组件 (例如 OrderMainTable.tsx)
    │
    ▼
[Step 1: 颜色审计]
    │  工具: IDE 全局搜索 #[0-9a-f] 和 bg-[
    │  输出: 该文件中所有硬编码颜色的清单
    │
    ▼
[Step 2: 语义分类]
    │  每个硬编码颜色 → 归入一个语义类别:
    │  - #05080F → bg-primary (主背景)
    │  - #0B121E → bg-secondary (卡片背景)
    │  - #ffffff → text-primary (主文字)
    │  - #137fec → brand-primary (品牌蓝)
    │  - ...
    │
    ▼
[Step 3: 替换执行]
    │  bg-[#05080F]  →  bg-bg-primary
    │  bg-[#0B121E]  →  bg-bg-secondary
    │  text-white     →  text-text-primary
    │  text-[#9dabb9] →  text-text-secondary
    │  border-[#3b4754] → border-border-input
    │
    ▼
[Step 4: 双主题验证]
    │  - 暗色模式: 截图对比，确认与改造前一致
    │  - 亮色模式: 目视检查对比度、层次、可读性
    │
    ▼
[完成]
```

---

## 6. 文件变更总览

### 6.1 新建文件清单（10 个）

| # | 文件路径 | 所属模块 | 行数估算 |
|---|---------|---------|---------|
| 1 | `tailwind.config.js` | M1-A | ~60 |
| 2 | `postcss.config.js` | M1-A | ~12 |
| 3 | `src/styles/themes.css` | M1-B | ~180 |
| 4 | `src/contexts/ThemeContext.tsx` | M2-A | ~80 |
| 5 | `src/hooks/useTheme.ts` | M2-B | ~15 |
| 6 | `src/hooks/useChartTheme.ts` | M7-A | ~40 |
| 7 | `src/components/ui/ThemeToggle.tsx` | M3-A | ~70 |
| 8 | `src/contexts/index.ts` | M2-A | ~5 (barrel) |

### 6.2 修改文件清单（约 100 个）

| 分类 | 文件数 | 主要修改内容 |
|------|-------|-------------|
| **基础设施** | 3 | index.html, package.json, src/main.tsx |
| **布局组件** | 2 | Header.tsx, Sidebar.tsx |
| **UI 基础组件** | 5 | StatCard, ChartCard, MapWidget, AlertPanel, ui/index.ts |
| **认证模块** | 1-2 | LoginView.tsx |
| **仪表板** | 5-8 | DashboardView, Console/, etc. |
| **订单管理** | 12-18 | OrderMainTable, CreateOrderModal, etc. |
| **路线优化** | 8-12 | RouteOptimizationView, Scenarios/, etc. |
| **训练优化** | 6-8 | TrainingOptimizationView, Monitor, etc. |
| **碳监测** | 6-8 | CarbonMonitoringView, ESGReportView, etc. |
| **合规安全** | 14-18 | ComplianceSecurityView, AuditLogs, FileManagement, etc. |
| **客户服务** | 10-12 | CustomerServiceView, AIChatPanel, FeedbackForm, etc. |
| **系统设置** | 8-12 | SettingsView, Account/, AlertSystem/, etc. |
| **合计** | **~96-108** | |

### 6.3 最终目录结构（主题相关新增/变更）

```
PathOptix/
├── tailwind.config.js              ← [新建] M1-A
├── postcss.config.js               ← [新建] M1-A
├── index.html                      ← [修改] M1-C
├── package.json                    ← [修改] M1-C
│
└── src/
    ├── main.tsx                    ← [修改] M1-C (import themes.css + ThemeProvider)
    ├── styles/
    │   └── themes.css              ← [新建] M1-B
    │
    ├── contexts/
    │   ├── ThemeContext.tsx        ← [新建] M2-A
    │   └── index.ts                ← [新建] M2-A (barrel)
    │
    ├── hooks/
    │   ├── useTheme.ts             ← [新建] M2-B
    │   └── useChartTheme.ts        ← [新建] M7-A
    │
    └── components/
        ├── ui/
        │   ├── ThemeToggle.tsx     ← [新建] M3-A
        │   ├── StatCard.tsx        ← [修改] M5-A
        │   ├── ChartCard.tsx       ← [修改] M5-A
        │   ├── MapWidget.tsx       ← [修改] M5-B
        │   ├── AlertPanel.tsx      ← [修改] M5-B
        │   └── index.ts            ← [修改] M3 (导出 ThemeToggle)
        │
        ├── layout/
        │   ├── Header.tsx          ← [修改] M4-A (嵌入 ThemeToggle + 颜色适配)
        │   ├── Sidebar.tsx         ← [修改] M4-B (颜色适配)
        │   └── index.ts
        │
        └── features/
            ├── auth/LoginView.tsx           ← [修改] M6-A
            ├── dashboard/**/*.tsx           ← [修改] M6-B
            ├── orders/**/*.tsx              ← [修改] M6-C
            ├── routing/**/*.tsx             ← [修改] M6-D
            ├── training/**/*.tsx            ← [修改] M6-E
            ├── carbon/**/*.tsx              ← [修改] M6-F
            ├── compliance/**/*.tsx          ← [修改] M6-G
            ├── customer-service/**/*.tsx    ← [修改] M6-H
            └── settings/**/*.tsx            ← [修改] M6-I
```

---

## 7. 接口汇总

### 7.1 模块间接口矩阵

|  | M1 | M2 | M3 | M4 | M5 | M6 | M7 |
|--|----|----|----|----|----|----|----|
| **M1** (基础设施) | - | 提供 CSS 变量 | 提供 TW 类名 | 提供 TW 类名 | 提供 TW 类名 | 提供 TW 类名 | 提供 CSS 变量 |
| **M2** (状态管理) | 依赖 DOM API | - | 提供 useTheme | 提供 useTheme | 提供 useTheme | 提供 useTheme | 提供 useTheme |
| **M3** (UI 控件) | 依赖 lucide | 消费 useTheme | - | 被 M4 引用 | - | - | - |
| **M4** (布局适配) | 依赖 TW 类名 | 消费 useTheme | 引用 ThemeToggle | - | - | - | - |
| **M5** (UI 适配) | 依赖 TW 类名 | 消费 useTheme | - | - | - | - | - |
| **M6** (业务适配) | 依赖 TW 类名 | 消费 useTheme | - | - | - | - | 消费 useChartTheme |
| **M7** (三方适配) | 依赖 CSS 变量 | 消费 useTheme | - | - | - | 被 M6 消费 | - |

### 7.2 公开 API 清单

| API | 所属模块 | 签名 | 消费者 |
|-----|---------|------|--------|
| `<ThemeProvider>` | M2 | `(props: { children: ReactNode }) => JSX.Element` | main.tsx |
| `useTheme()` | M2 | `() => ThemeContextValue` | 所有需要感知主题的组件 |
| `useChartTheme()` | M7 | `() => ChartThemeConfig` | 含 Recharts 图表的组件 |
| `<ThemeToggle>` | M3 | `(props: ThemeToggleProps) => JSX.Element` | Header.tsx |
| `bg-bg-*` | M1 | Tailwind 类名 | 所有组件（替代 bg-[#hex]） |
| `text-text-*` | M1 | Tailwind 类名 | 所有组件（替代 text-[#hex]） |
| `brand-*` | M1 | Tailwind 类名 | 所有组件（替代品牌色硬编码） |
| `border-border-*` | M1 | Tailwind 类名 | 所有组件（替代 border-[#hex]） |

---

## 8. 性能与兼容性考虑

### 8.1 性能影响评估

| 影响项 | 评估 | 说明 |
|--------|------|------|
| CSS 变量解析性能 | **几乎为零开销** | 浏览器原生支持，比类名切换更快 |
| 全局 transition: 0.3s | **低开销** | 仅涉及 compositable 属性（bg/color/border），不触发 layout/paint |
| ThemeContext 重渲染 | **局部性良好** | toggleTheme 只改变 boolean/string state，仅消费组件重渲染 |
| localStorage 读写 | **极低频** | 仅在切换时写入一次（~5KB），初始化时读取一次 |
| FOUC 脚本执行 | **同步但极快** | 仅 5-10 行纯 DOM 操作，< 1ms |

### 8.2 兼容性矩阵

| 浏览器 | CSS 变量 | CSS @media (print) | classList API | localStorage |
|--------|---------|---------------------|---------------|--------------|
| Chrome 90+ | ✅ | ✅ | ✅ | ✅ |
| Firefox 90+ | ✅ | ✅ | ✅ | ✅ |
| Safari 15+ | ✅ | ✅ | ✅ | ✅ |
| Edge 90+ | ✅ | ✅ | ✅ | ✅ |

> 所有目标浏览器均完全支持所需技术特性，无需 polyfill。

### 8.3 回滚策略

若主题切换功能引入问题，回滚方案：

1. **快速回滚**: 移除 `main.tsx` 中的 `<ThemeProvider>` 包裹，所有 `useTheme()` 调用会报错但不影响其他功能
2. **安全回滚**: `git revert` 提交，CDN 版 Tailwind 和硬编码颜色完全恢复
3. **粒度回滚**: 单个组件的颜色替换可以通过 git checkout 恢复该文件

---

## 9. 测试策略

### 9.1 需要测试的单元

| 测试对象 | 测试内容 | 方法 |
|---------|---------|------|
| ThemeProvider | 初始化默认值为 dark；toggleTheme 正确切换；setTheme 直接设定；localStorage 读写正确 | Jest + React Testing Library |
| ThemeToggle | 点击调用 toggleTheme；图标正确显示（暗色→太阳，亮色→月亮）；aria-label 正确 | RTL |
| useTheme | 在 Provider 外抛错；返回正确的 context value | Jest |
| useChartTheme | 暗色/亮色返回不同配置；colors 数组包含 CSS 变量引用 | Jest |
| themes.css | CSS 变量在两种 data-theme 下解析为正确色值 | （手动验证或 Playwright） |

### 9.2 需要回归的场景

| 场景 | 验证方法 |
|------|---------|
| 暗色模式下所有页面与改造前视觉一致 | 截图比对 |
| 亮色模式下所有页面可读可用 | 人工遍历 |
| 切换动画流畅无卡顿 | Performance tab 录制 |
| 打印输出始终为亮色 | Ctrl+P 预览 |
| localStorage 持久化有效 | F5 刷新验证 |
| 首次访问无 FOUC | 禁用缓存后硬刷新观察 |

---

## 10. 风险与缓解

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|---------|
| 大量文件遗漏替换导致混合配色 | 视觉异常 | 中 | 建立颜色审计 checklist；grep 全局搜索 `#[0-9a-f]` 确认零残留 |
| Recharts 图表在亮色模式下不可读 | 数据展示失效 | 中 | useChartHook 统一管理；逐图表验证 |
| Tailwind CDN→npm 迁移导致类名行为差异 | 样式回归 | 低 | 迁移后逐页面截图比对 |
| 全局 transition 影响复杂交互动画（如拖拽） | 交互卡顿 | 低 | 对 interactive 元素单独禁用 transition（已在设计中处理） |
| 现有 `dark:` 组件与新语义类组件风格不一致 | 维护混乱 | 低 | 文档明确标注 A 组/B 组区别；长期逐步统一到语义类 |

---

**文档结束**

> 下一步: 基于本概要设计文档和需求文档，生成详细的实施计划（Implementation Plan），包含每个 Task 的具体代码步骤、验收标准和提交命令。
