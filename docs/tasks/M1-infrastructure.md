# M1: 基础设施配置模块 — 实施任务

> **模块编号**: M1
> **依赖关系**: 无前置依赖（所有其他模块的基础）
> **预估工时**: 2-3 小时
> **风险等级**: 中（Tailwind 迁移可能影响现有样式）

---

## 模块目标

完成 Tailwind CSS 从 CDN 到 npm 的迁移，建立完整的 Design Token CSS 变量体系，改造应用入口页，为后续所有主题适配工作提供基础设施支撑。

---

## Task 1.1: 安装 Tailwind npm 依赖

- [ ] **Step 1: 安装 tailwindcss + postcss + autoprefixer**

```bash
npm install --save-dev tailwindcss postcss autoprefixer
```

- [ ] **Step 2: 验证安装成功**

```bash
npm list tailwindcss postcss autoprefixer
```

预期输出: 显示三个包及其版本号（tailwindcss ^4.x 或 ^3.x, postcss ^8.x, autoprefixer ^10.x）

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(M1): install tailwindcss, postcss, autoprefixer as devDependencies"
```

---

## Task 1.2: 创建 PostCSS 配置文件

**新建文件**: `postcss.config.js` (项目根目录)

- [ ] **Step 1: 创建 postcss.config.js**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 2: 验证文件存在**

```bash
ls -la postcss.config.js
```

- [ ] **Step 3: Commit**

```bash
git add postcss.config.js
git commit -m "chore(M1): add PostCSS config with tailwindcss and autoprefixer"
```

---

## Task 1.3: 创建 Tailwind 配置文件

**新建文件**: `tailwind.config.js` (项目根目录)

- [ ] **Step 1: 创建 tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
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
          focus: 'var(--color-border-focus)',
        },
      },
    },
  },
  plugins: [],
};
```

**关键设计点说明**:
- `darkMode: 'class'` — 使用 class 策略而非 media，允许 JS 主动控制
- `content` 包含 `./index.html` 和 `./src/**/*.{js,ts,jsx,tsx}`
- 颜色分 4 组语义命名空间：bg / text / brand / border
- 所有颜色值引用 CSS 变量 `var(--color-xxx)`

- [ ] **Step 2: Commit**

```bash
git add tailwind.config.js
git commit -m "feat(M1): create tailwind.config.js with darkMode:class and semantic color tokens"
```

---

## Task 1.4: 创建 CSS 变量定义文件 (themes.css)

**新建文件**: `src/styles/themes.css`
**新建目录**: `src/styles/` (如不存在)

- [ ] **Step 1: 创建目录**

```bash
mkdir -p src/styles
```

- [ ] **Step 2: 创建 themes.css**

```css
/* ============================================================
   PathOptix Dashboard — Design Tokens & Theme Variables
   文件路径: src/styles/themes.css
   ============================================================ */

/* ----- 第 1 部分：通用令牌（不随主题变化）----- */
:root {
  --font-family: 'Inter', sans-serif;
}

/* ----- 第 2 部分：暗色主题令牌（默认）----- */
[data-theme="dark"],
:root {
  /* 背景色系 */
  --color-bg-primary: #05080F;
  --color-bg-secondary: #0B121E;
  --color-bg-tertiary: #111827;
  --color-bg-elevated: #1c2127;
  --color-bg-modal: #0B0F19;
  --color-bg-overlay: rgba(0, 0, 0, 0.6);

  /* 文字色系 */
  --color-text-primary: #ffffff;
  --color-text-secondary: #9dabb9;
  --color-text-muted: #64748b;

  /* 边框色系 */
  --color-border-default: rgba(59, 71, 84, 0.5);
  --color-border-input: #3b4754;
  --color-border-focus: #137fec;

  /* 品牌/语义色 */
  --color-brand-primary: #137fec;
  --color-brand-success: #10b981;
  --color-brand-warning: #f59e0b;
  --color-brand-error: #ef4444;
  --color-brand-accent: #06b6d4;

  /* 特效 */
  --glow-cyan: 0 0 15px rgba(6, 182, 212, 0.4);
  --glass-bg: rgba(28, 33, 39, 0.7);
  --glass-border: rgba(59, 71, 84, 0.5);
  --network-gradient: radial-gradient(circle at center, #137fec1a 0%, transparent 70%);
  --scrollbar-track: #0B0F19;
  --scrollbar-thumb: #1F2937;
}

/* ----- 第 3 部分：亮色主题令牌 ----- */
[data-theme="light"] {
  /* 背景色系 */
  --color-bg-primary: #F8FAFC;
  --color-bg-secondary: #ffffff;
  --color-bg-tertiary: #F1F5F9;
  --color-bg-elevated: #ffffff;
  --color-bg-modal: #ffffff;
  --color-bg-overlay: rgba(0, 0, 0, 0.5);

  /* 文字色系 */
  --color-text-primary: #0F172A;
  --color-text-secondary: #475569;
  --color-text-muted: #94A3B8;

  /* 边框色系 */
  --color-border-default: #E2E8F0;
  --color-border-input: #CBD5E1;
  --color-border-focus: #2563EB;

  /* 品牌/语义色 */
  --color-brand-primary: #2563EB;
  --color-brand-success: #059669;
  --color-brand-warning: #D97706;
  --color-brand-error: #DC2626;
  --color-brand-accent: #0891B2;

  /* 特效 */
  --glow-cyan: 0 0 12px rgba(6, 182, 212, 0.25);
  --glass-bg: rgba(255, 255, 255, 0.8);
  --glass-border: rgba(226, 232, 240, 0.8);
  --network-gradient: radial-gradient(circle at center, #3730a308 0%, transparent 70%);
  --scrollbar-track: #F1F5F9;
  --scrollbar-thumb: #CBD5E1;
}

/* ----- 第 4 部分：Tailwind 基础层导入 ----- */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ----- 第 5 部分：全局过渡效果 ----- */
html {
  transition: background-color 0.3s ease-in-out,
              color 0.3s ease-in-out,
              border-color 0.3s ease-in-out,
              box-shadow 0.3s ease-in-out;
}

button, a, input, select, textarea {
  transition: none;
}

/* ----- 第 6 部分：全局基础样式 ----- */
body {
  font-family: var(--font-family), sans-serif;
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  margin: 0;
  overflow-x: hidden;
}

/* ----- 第 7 部分：滚动条（双主题适配）----- */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: var(--scrollbar-track);
}
::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb);
  border-radius: 10px;
}

/* ----- 第 8 部分：主题感知工具类 ----- */
.glow-cyan {
  box-shadow: var(--glow-cyan);
}
.path-glow {
  filter: drop-shadow(0 0 4px rgba(6, 182, 212, 0.8));
}
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
}
.glow-button:hover {
  box-shadow: 0 0 20px rgba(19, 127, 236, 0.4);
}
.network-gradient {
  background: var(--network-gradient);
}

/* ----- 第 9 部分：打印样式（强制亮色）----- */
@media print {
  .no-print {
    display: none !important;
  }
  body {
    background: white !important;
    color: black !important;
  }
  .print-container {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 20px !important;
    background: white !important;
    color: black !important;
  }
  table {
    width: 100% !important;
    border-collapse: collapse !important;
  }
  h1, h2, h3, h4, h5, h6 {
    color: black !important;
  }
  div {
    border-color: black !important;
    background: white !important;
    color: black !important;
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/styles/themes.css
git commit -m "feat(M1): create themes.css with full Design Tokens for dark/light themes"
```

---

## Task 1.5: 改造 index.html 入口页

**修改文件**: `index.html` (项目根目录)

当前文件共 105 行，需执行以下精确操作：

- [ ] **Step 1: 在 `<head>` 最顶部插入 FOUC 防护脚本**

在 `<meta charset="UTF-8">` 这一行**之前**插入：

```html
    <!-- FOUC 防护：在 React 渲染前同步设置主题 -->
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
```

- [ ] **Step 2: 删除 CDN Tailwind script 标签**

删除第 8 行:
```html
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
```

替换为（无，直接删除即可。Tailwind 现在通过 PostCSS + themes.css 的 `@tailwind` 指令加载）

- [ ] **Step 3: 重写 `<style>` 标签内容**

将第 11-88 行的 `<style>...</style>` 整体**替换**为一个极简版本（因为主要样式已移至 themes.css）：

```html
    <style>
      /* 仅保留不能通过 Tailwind/CSS 变量表达的特殊样式 */
      .scrollbar-hide::-webkit-scrollbar { display: none; }
      .animate-in { animation: animateIn 0.3s ease-out; }
      @keyframes animateIn {
        from { opacity: 0; transform: translateY(-8px); }
        to { opacity: 1; transform: translateY(0); }
      }
    </style>
```

**注意**: 原 `<style>` 中的 body/滚动条/glass-card/glow-cyan/glow-button/network-gradient/打印样式已全部迁移到 `themes.css`，此处不再重复。

- [ ] **Step 4: 验证 index.html 最终结构**

确认 `<head>` 中的顺序为：
1. FOUC 防护 `<script>`
2. `<meta charset>`
3. `<meta viewport>`
4. `<title>`
5. Google Fonts links (`<link>` x2)
6. 极简 `<style>` （仅 scrollbar-hide + animate-in）
7. importmap `<script>`
8. `</head>`

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat(M1): refactor index.html - remove CDN Tailwind, add FOUC guard, simplify style tag"
```

---

## Task 1.6: 修改 main.tsx 引入 themes.css

**修改文件**: `src/main.tsx`

当前内容 (16 行):

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 1: 在 main.tsx 顶部添加 CSS 入口导入**

在第 2 行 `import React from 'react';` 之后添加:

```typescript
import './styles/themes.css';
```

完整文件变为:

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/themes.css';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 2: Commit**

```bash
git add src/main.tsx
git commit -m "feat(M1): import themes.css in main.tsx entry point"
```

---

## Task 1.7: 验证构建与开发服务器

- [ ] **Step 1: 启动开发服务器验证**

```bash
npm run dev
```

预期结果：
- Vite 开发服务器启动于 http://localhost:3000
- 浏览器打开页面能看到界面（此时只有暗色主题，CSS 变量生效）
- 无控制台报错

- [ ] **Step 2: 执行生产构建验证**

```bash
npm run build
```

预期结果：
- 构建成功，输出到 `dist/` 目录
- 无 Tailwind 相关错误
- 无 CSS 解析错误

- [ ] **Step 3: 如有问题进行修复**

常见问题排查：
- 若 `@tailwind base/components/utilities` 报错 → 检查 tailwindcss 版本是否为 v4（v4 语法不同，需用 `@import "tailwindcss"` 替代）
- 若 PostCSS 报错 → 检查 postcss.config.js 是否正确导出
- 若颜色全部消失 → 检查 themes.css 中 `@tailwind` 指令是否正确加载

- [ ] **Step 4: 视觉回归检查**

对比改造前后的页面截图：
- 暗色模式下应与改造前**视觉一致**（Design Token 的 Dark 值来自原有硬编码值）
- 特别检查：body 背景、Sidebar 背景、Header 背景、卡片背景、文字颜色、边框颜色

- [ ] **Step 5: 最终 Commit（如有修复）**

```bash
git add -A
git commit -m "fix(M1): fix any issues found during build verification"
```

---

## 完成标准 Checklist

- [ ] `npm install tailwindcss postcss autoprefixer` 成功
- [ ] `postcss.config.js` 已创建并配置正确
- [ ] `tailwind.config.js` 已创建，包含 darkMode:'class' 和 26 个语义颜色变量
- [ ] `src/styles/themes.css` 已创建，包含完整的 Dark/Light Design Token 定义
- [ ] `index.html` 已移除 CDN script，添加 FOUC 脚本，简化 style 标签
- [ ] `src/main.tsx` 已导入 themes.css
- [ ] `npm run dev` 启动正常，页面可访问
- [ ] `npm run build` 构建成功
- [ ] 暗色模式视觉回归测试通过

---

## 与下游模块的接口约定

M1 完成后向以下模块提供：

| 接口 | 内容 | 消费者 |
|------|------|--------|
| Tailwind 类名 | `bg-bg-*`, `text-text-*`, `brand-*`, `border-*` | M4, M5, M6 |
| CSS 变量 | `var(--color-xxx)` 全集 | M7 (第三方库) |
| FOUC 初始状态 | `data-theme` + `.dark` class | M2 (Provider 初始化对齐) |
