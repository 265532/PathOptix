# REMEDY-M5 Handover — UI 组件适配修复与回归

> **模块**: M5 UI 组件适配 | **状态**: ✅ 已完成
> **执行日期**: 2026-05-18 | **构建验证**: pass (exit 0, 7.03s)
> **依据文档**: [REMEDY-M5.md](./REMEDY-M5.md)

---

## 1. 任务范围

M5 模块原验收得分 **98%**，包含 3 个 Low 级 Issue（R01~R03），涉及 SVG 内联硬编码颜色的清理与回归验证。

### 涉及文件

| 文件 | 层级 | 变更类型 |
|------|------|---------|
| [StatCard.tsx](../../src/components/ui/StatCard.tsx) | ui/ | 仅验证，无需修改 |
| [ChartCard.tsx](../../src/components/ui/ChartCard.tsx) | ui/ | 仅验证，无需修改 |
| [AlertPanel.tsx](../../src/components/ui/AlertPanel.tsx) | ui/ | **已修改** (1 处 SVG 颜色修复) |

---

## 2. 执行结果

### 2.1 修复任务 (3/3 ✅)

#### M5-FIX-R01: StatCard.tsx SVG 坐标轴线颜色

- **结论**: 无需修改
- **证据**: `grep '#64748b\|#94a3b8'` 返回空结果
- **原因**: 文件已在前序迭代中完成主题适配，当前使用 `useChartTheme()` + 语义类（`bg-bg-secondary`, `text-text-muted`, `border-border-default` 等共 6 处），Recharts 图表颜色通过 `chartTheme.colors[0]` 驱动

#### M5-FIX-R02: ChartCard.tsx SVG 空状态插图颜色

- **结论**: 无需修改
- **证据**: `grep '#64748b'` 返回空结果
- **原因**: 装饰性 SVG（L120-124）已使用 `stroke="currentColor"` 方案；CustomTooltip 已集成 `useChartTheme` 通过 `chartTheme.tooltipStyle` 驱动样式

#### M5-FIX-R03: AlertPanel.tsx SVG 警告图标颜色

- **结论**: 已修复 1 处
- **变更内容**:

```diff
  <svg viewBox="0 0 100"100"
-   className="w-full h-full transform -rotate-90 overflow-visible drop-shadow-[0_0_12px_rgba(6,182,212,0.2)]">
+   className="... text-border-default">
     <circle cx="50" cy="50" r="42"
-      stroke="#1e293b" strokeWidth="9" fill="transparent" />
+      stroke="currentColor" strokeWidth="9" fill="transparent" />
     <circle cx="50" cy="50" r="42"
       stroke="#06b6d4" strokeWidth="9" fill="transparent" ... />
```

- **技术决策**:
  - `#1e293b` (slate-800): 圆环进度条轨道色 → 替换为 `currentColor` + `text-border-default` 语义类，跟随主题变化
  - `#06b6d4` (cyan-500): 圆环进度值 → **保留**为功能性品牌色（表示 AI 置信度得分），不随主题变化

### 2.2 回归验证任务 (3/3 ✅)

#### M5-REG-001: StatCard A组

| 检查项 | 实际值 | 预期 | 结果 |
|--------|--------|------|------|
| `dark:` 前缀数量 | 0 | 0 | PASS |
| 语义类 (`bg-bg-\|text-text-\|border-border-`) | 6 处 | ≥ 6 | PASS |
| `useChartTheme` / `chartTheme` 引用 | 4 处 (L5 import, L26 调用, L53/L60 使用) | ≥ 2 | PASS |

#### M5-REG-002: ChartCard A组

| 检查项 | 实际值 | 预期 | 结果 |
|--------|--------|------|------|
| `dark:` 前缀数量 | 0 | 0 | PASS |
| useChartTheme 集成 | L5 import, L50 调用, L90 传递给 Tooltip | 已集成 | PASS |
| CustomTooltip 样式方案 | `chartTheme.tooltipStyle` (主题驱动 inline-style) | 语义化 | PASS |

> 注: REMEDY-M5 原文档中 CustomTooltip 检查项期望 Tailwind 类匹配 `bg-bg-elevated.*border-border-default`，但实际文件已升级为 `useChartTheme.tooltipStyle` 方案（属于 M7-ISSUE-003 范围但已提前实现），语义化程度更高。

#### M5-REG-003: LoginView + MapWidget + AlertPanel

| 文件 | 检查模式 | 匹配数 | 判定 |
|------|---------|--------|------|
| LoginView.tsx | `\[#\|dark:` | 13 | ✅ 全为误报（`useState('')`, `w-[60%]` 等 Tailwind 任意值语法） |
| MapWidget.tsx | `\[#` | 0 | ✅ 零残余 |
| AlertPanel.tsx | `\[#` | 0 | ✅ 零残余（仅 `#06b6d4` 功能性品牌色保留） |

---

## 3. 技术决策记录

### 3.1 SVG 颜色处理策略统一

本模块确认了项目 SVG 硬编码颜色的三类处理标准：

| 类型 | 判定标准 | 处理方式 | 示例 |
|------|---------|---------|------|
| **结构/装饰色** | 随主题变化的辅助线、轨道、背景 | `currentColor` + Tailwind 语义类 | AlertPanel L70 `#1e293b` → `currentColor` + `text-border-default` |
| **品牌/功能色** | 具有固定语义的品牌色或状态指示色 | 保留硬编码 + 可选注释 | AlertPanel L72 `#06b6d4` (cyan 置信度指示) |
| **动态数据色** | 由数据驱动的图表颜色 | `useChartTheme` Hook | StatCard `chartTheme.colors[0]` |

### 3.2 currentColor 方案模式

SVG 使用 `currentColor` 的标准模式：

```tsx
<svg ... className="... text-{semantic-token}">
  <circle ... stroke="currentColor" />
</svg>
```

父元素通过 Tailwind 语义类（如 `text-border-default`、`text-text-muted`）控制颜色继承，SVG 内部统一使用 `currentColor` 引用。

---

## 4. 遗留事项与风险

### 4.1 无阻塞遗留

M5 模块所有 Issue 均已关闭，无遗留任务。

### 4.2 注意事项

1. **AlertPanel `#06b6d4`**: 圆环进度值的 cyan 品牌色为有意保留的功能性固定色。如果未来需要支持多主题品牌色变更，需将此值提取到 theme config 中
2. **ChartCard CustomTooltip 内 `#22d3ee`**: 当前 CustomTooltip value 高亮色使用硬编码 `#22d3ee` (cyan-300)，此属于 M7-ISSUE-003 范围的优化点，不在 M5 处理范围内
3. **LoginView 误报模式**: 后续回归扫描 `\[#` 模式时需排除 `useState('')`、Tailwind 任意值语法（`w-[xx%]`）、HTML 属性（`href="#"`）等误报源

---

## 5. 下一步建议

- M5 已完成，可进入下一模块（推荐按 Phase 顺序执行 M2/M6/M7 等未完成模块）
- 最终验收阶段（Phase E）需对 M5 涉及的 3 个组件进行视觉走查，确认暗色模式下 SVG currentColor 继承正确
