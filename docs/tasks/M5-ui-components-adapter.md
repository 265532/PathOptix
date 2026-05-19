# M5: UI 基础组件适配模块 — 实施任务

> **模块编号**: M5
> **前置依赖**: M1 (基础设施), M2 (状态管理)
> **预估工时**: 1-2 小时
> **风险等级**: 低

---

## 模块目标

适配 `src/components/ui/` 下的原子级 UI 组件。采用**渐进式策略**（DD-07）：
- **A 组**（已有 `dark:` 前缀）：StatCard、ChartCard、LoginView — 保留 dark: 结构，修正暗色值为 Design Token 值
- **B 组**（无 `dark:` 前缀）：MapWidget、AlertPanel — 改写为语义化类名

---

## Task 5.1: A 组 — StatCard.tsx 渐进式适配

**修改文件**: `src/components/ui/StatCard.tsx` (70 行)

**策略说明**: StatCard 当前使用 `light-first + dark:` 模式。改造方向：移除 `dark:` 前缀体系，统一使用 M1 定义的语义类名。因为语义类名通过 CSS 变量自动解析，无需双写。

- [ ] **Step 1: 审计当前 StatCard 中的所有颜色类名**

| 当前值 | 出现位置 | 替换为 |
|--------|---------|--------|
| `bg-slate-50` | L27 | `bg-bg-secondary` |
| `dark:bg-[#151B28]` | L27 | 删除（合并到上面的 bg-bg-secondary） |
| `border-slate-200` | L27 | `border-border-default` |
| `dark:border-slate-800/50` | L27 | 删除 |
| `hover:border-slate-300` | L27 | `hover:border-border-input` |
| `dark:hover:border-slate-700` | L27 | 删除 |
| `text-slate-400` | L29 | `text-text-muted` |
| `text-slate-900` | L36 | `text-text-primary` |
| `dark:text-white` | L36 | 删除 |
| `text-slate-500` | L46 | `text-text-muted` |
| `text-cyan-400` | L37,39,49,65 | 保留（品牌色，不替换） |
| `bg-cyan-500/10` | L39 | 保留（品牌色变体） |
| `border-cyan-500/20` | L39 | 保留 |
| `amber-500` | L30 | 保留（warning 色） |

- [ ] **Step 2: 执行 StatCard 改造**

将 L27 的主容器 className 从:
```tsx
<div className="bg-slate-50 dark:bg-[#151B28] rounded-xl p-5 border border-slate-200 dark:border-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700 transition-all group overflow-hidden relative">
```
改为:
```tsx
<div className="bg-bg-secondary rounded-xl p-5 border border-border-default hover:border-border-input transition-all group overflow-hidden relative duration-300">
```

将 L36 的数值文字从:
```tsx
<span className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
```
改为:
```tsx
<span className="text-3xl font-bold text-text-primary tracking-tight">
```

其余位置按 Step 1 表格逐一替换。

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/StatCard.tsx
git commit -m "feat(M5): adapt StatCard to use semantic color tokens (remove dark: prefix)"
```

---

## Task 5.2: A 组 — ChartCard.tsx 渐进式适配

**修改文件**: `src/components/ui/ChartCard.tsx` (128 行)

- [ ] **Step 1: 审计 ChartCard 中的所有颜色类名**

| 当前值 | 出现位置 | 替换为 |
|--------|---------|--------|
| `bg-slate-50` | L37,51 | `bg-bg-secondary` |
| `dark:bg-[#151B28]/60` | L37 | 删除 |
| `dark:bg-[#151B28]/60` | L51 | 删除 |
| `border-slate-200` | L37,51 | `border-border-default` |
| `dark:border-slate-800/40` | L37 | 删除 |
| `dark:border-slate-800/40` | L51 | 删除 |
| `hover:border-slate-300` | L37,51 | `hover:border-border-input` |
| `dark:hover:border-slate-700/60` | L37,51 | 删除 |
| `text-slate-900` | L38,55,96,113 | `text-text-primary` |
| `dark:text-white` | L38,55,96,113 | 删除 |
| `text-slate-600` | L57 | `text-text-muted` |
| `dark:text-white` | L57 | 删除 |
| `text-slate-400` | L111 | `text-text-muted` |
| `bg-slate-50` | L37 (Tooltip) | `bg-bg-elevated` |
| `dark:bg-[#1B212D]/95` | L37 | 删除 |
| `border-slate-300` | L37 (Tooltip) | `border-border-default` |
| `dark:border-slate-700/50` | L37 (Tooltip) | 删除 |
| `text-cyan-400` | 多处 | 保留（品牌色） |
| `emerald-400` | L54 | 保留（success 色） |
| `bg-cyan-500/10`, `bg-emerald-500/10` | L54 | 保留 |
| `shadow-[0_10px_30px_rgba(0,0,0,0.6)]` | L37 | 保留（固定阴影值） |
| `drop-shadow-[0_15px_25px_rgba(0,0,0,0.7)]` | L61 | 保留 |

- [ ] **Step 2: 执行 ChartCard 改造**

按上表逐一替换。重点注意：
- Tooltip 内部的 `CustomTooltip` 组件也需要同步替换
- `data.map` 中的图例项文字颜色也要替换

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/ChartCard.tsx
git commit -m "feat(M5): adapt ChartCard to use semantic color tokens (remove dark: prefix)"
```

---

## Task 5.3: A 组 — LoginView.tsx 适配

**修改文件**: `src/components/features/auth/LoginView.tsx`

- [ ] **Step 1: 审计并替换 LoginView 中的颜色**

LoginView 已使用 `dark:` 前缀，执行与 StatCard 相同的渐进式改造：
- 移除所有 `dark:` 前缀和对应的 light 默认值
- 统一替换为语义类名
- 保留品牌色（cyan-* 等）

- [ ] **Step 2: Commit**

```bash
git add src/components/features/auth/LoginView.tsx
git commit -m "feat(M5): adapt LoginView to use semantic color tokens"
```

---

## Task 5.4: B 组 — MapWidget.tsx 和 AlertPanel.tsx 适配

**修改文件**:
- `src/components/ui/MapWidget.tsx`
- `src/components/ui/AlertPanel.tsx`

- [ ] **Step 1: 审计 MapWidget.tsx 中的硬编码颜色**

```bash
grep -n 'bg-\[#\|text-\[#\|border-\[#\|from-\[#\|to-\[#' src/components/ui/MapWidget.tsx
```

- [ ] **Step 2: 将找到的所有硬编码颜色替换为语义类名**

参照替换规则表：
- `#05080F` 类 → `bg-bg-primary`
- `#0B121E` 类 → `bg-bg-secondary`
- `#111827` 类 → `bg-bg-tertiary`
- `#ffffff` / `white` → `text-text-primary`
- `#9dabb9` / slate-* (文字) → `text-text-secondary` 或 `text-text-muted`
- `#137fec` → `text-brand-primary` 或 `bg-brand-primary`
- `#3b4754` / slate-* (边框) → `border-border-input` 或 `border-border-default`

- [ ] **Step 3: 对 AlertPanel.tsx 执行相同操作**

```bash
grep -n 'bg-\[#\|text-\[#\|border-\[#' src/components/ui/AlertPanel.tsx
```

逐一替换。

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/MapWidget.tsx src/components/ui/AlertPanel.tsx
git commit -m "feat(M5): adapt MapWidget and AlertPanel to use semantic color tokens"
```

---

## Task 5.5: 全量 UI 组件视觉回归测试

- [ ] **Step 1: 启动开发服务器**

```bash
npm run dev
```

- [ ] **Step 2: 暗色模式回归检查**

逐组件确认：
- [ ] StatCard: 卡片背景 `#0B121E`，文字白色，图表区域正常
- [ ] ChartCard: 饼图卡片背景正确，tooltip 正确，图例文字正确
- [ ] LoginView: 登录页背景、输入框、按钮均正常
- [ ] MapWidget: 地图区域正常渲染
- [ ] AlertPanel: 面板样式正常

- [ ] **Step 3: 亮色模式验证**

点击 ThemeToggle 切换到亮色模式：
- [ ] StatCard: 白色/浅灰背景，深色文字，可读性良好
- [ ] ChartCard: 白色背景，深色文字，tooltip 浅色背景
- [ ] LoginView: 浅色登录页，白色卡片居中
- [ ] 所有组件无残留的暗色硬编码

- [ ] **Step 4: 构建验证**

```bash
npm run build
```

预期：构建成功，无错误

---

## 完成标准 Checklist

- [ ] StatCard.tsx: 移除 dark: 前缀，全部使用语义类名 (~8 处替换)
- [ ] ChartCard.tsx: 移除 dark: 前缀，全部使用语义类名 (~18 处替换)
- [ ] LoginView.tsx: 移除 dark: 前缀，全部使用语义类名
- [ ] MapWidget.tsx: 硬编码颜色替换为语义类名
- [ ] AlertPanel.tsx: 硬编码颜色替换为语义类名
- [ ] 暗色模式视觉回归通过
- [ ] 亮色模式视觉验证通过
- [ ] `npm run build` 成功
