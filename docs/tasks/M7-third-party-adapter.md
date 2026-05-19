# M7: 第三方库适配模块 — 实施任务

> **模块编号**: M7
> **前置依赖**: M1 (基础设施), M2 (状态管理)
> **预估工时**: 2-3 小时
> **风险等级**: 中（Recharts 图表库适配复杂度较高）

---

## 模块目标

创建统一的图表主题配置 Hook（useChartTheme），使 Recharts 和 D3 图表能跟随主题切换。同时处理项目中所有第三方库内部硬编码颜色的覆盖。

---

## Task 7.1: 创建 useChartTheme Hook

**新建文件**: `src/hooks/useChartTheme.ts`

- [ ] **Step 1: 创建 useChartTheme.ts**

```typescript
import { useTheme } from './useTheme';

interface ChartThemeConfig {
  backgroundColor: string;
  gridColor: string;
  axisTextColor: string;
  axisTickColor: string;
  legendTextColor: string;
  tooltipBackgroundColor: string;
  tooltipTextColor: string;
  tooltipBorderColor: string;
  tooltipTitleColor: string;
  areaGradientStart: string;
  areaGradientEnd: string;
  colors: string[];
}

export function useChartTheme(): ChartThemeConfig {
  const { isDark } = useTheme();

  if (isDark) {
    return {
      backgroundColor: 'transparent',
      gridColor: 'rgba(148, 163, 184, 0.08)',
      axisTextColor: 'var(--color-text-muted)',
      axisTickColor: 'var(--color-text-muted)',
      legendTextColor: 'var(--color-text-secondary)',
      tooltipBackgroundColor: 'var(--color-bg-elevated)',
      tooltipTextColor: 'var(--color-text-primary)',
      tooltipBorderColor: 'var(--color-border-default)',
      tooltipTitleColor: 'var(--color-text-primary)',
      areaGradientStart: 'rgba(19, 127, 236, 0.3)',
      areaGradientEnd: 'rgba(19, 127, 236, 0.02)',
      colors: [
        'var(--color-brand-primary)',
        'var(--color-brand-success)',
        'var(--color-brand-warning)',
        'var(--color-brand-accent)',
        '#8b5cf6',
        '#ec4899',
      ],
    };
  }

  return {
    backgroundColor: 'transparent',
    gridColor: 'rgba(100, 116, 139, 0.12)',
    axisTextColor: 'var(--color-text-muted)',
    axisTickColor: 'var(--color-text-muted)',
    legendTextColor: 'var(--color-text-secondary)',
    tooltipBackgroundColor: '#ffffff',
    tooltipTextColor: 'var(--color-text-primary)',
    tooltipBorderColor: 'var(--color-border-default)',
    tooltipTitleColor: 'var(--color-text-primary)',
    areaGradientStart: 'rgba(37, 99, 235, 0.25)',
    areaGradientEnd: 'rgba(37, 99, 235, 0.02)',
    colors: [
      'var(--color-brand-primary)',
      'var(--color-brand-success)',
      'var(--color-brand-warning)',
      'var(--color-brand-accent)',
      '#8b5cf6',
      '#ec4899',
    ],
  };
}
```

**设计说明**:
- Dark/Light 返回不同的 `gridColor`、`tooltipBackgroundColor` 等确保图表在两种主题下都可读
- `colors` 数组使用 CSS 变量引用品牌色，使系列色自动跟随主题
- `areaGradientStart/End` 使用 rgba 确保面积图渐变在两种主题下都有合适透明度

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useChartTheme.ts
git commit -m "feat(M7): create useChartTheme hook for Recharts/D3 theme configuration"
```

---

## Task 7.2: 适配 StatCard 中的 Recharts 图表

**修改文件**: `src/components/ui/StatCard.tsx`

StatCard 中内置了 Recharts LineChart 和 BarChart（L49-L62），其 `stroke` 和 `fill` 属性使用了 props 传入的 `color` 参数。

- [ ] **Step 1: 在 StatCard 中引入 useChartTheme**

在文件顶部添加 import:
```typescript
import { useChartTheme } from '@hooks/useChartTheme';
```

- [ ] **Step 2: 在组件内获取 chartTheme**

在 `const dummyData = ...` 之后添加:
```typescript
const chartTheme = useChartTheme();
```

- [ ] **Step 3: 将图表 stroke/fill 映射到 chartTheme**

将 L51 的:
```tsx
<Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
```
改为:
```tsx
<Line type="monotone" dataKey="value" stroke={chartTheme.colors[0]} strokeWidth={2} dot={false} />
```

将 L58 的:
```tsx
<Bar dataKey="value" fill={color} radius={[1, 1, 0, 0]} fillOpacity={0.4} />
```
改为:
```tsx
<Bar dataKey="value" fill={chartTheme.colors[0]} radius={[1, 1, 0, 0]} fillOpacity={0.4} />
```

- [ ] **Step 4: 为 ResponsiveContainer 容器添加背景适配**

可选：给图表容器添加主题感知背景:
```tsx
<div style={{ backgroundColor: 'var(--color-bg-secondary)' }} className="...existing classes...">
```

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/StatCard.tsx
git commit -m "feat(M7): integrate useChartTheme into StatCard Recharts charts"
```

---

## Task 7.3: 适配 ChartCard 中的 Recharts PieChart

**修改文件**: `src/components/ui/ChartCard.tsx`

ChartCard 使用了 PieChart + Cell + CustomTooltip（L62-L89），数据颜色来自 props `data[].color`。

- [ ] **Step 1: 引入 useChartTheme**

```typescript
import { useChartTheme } from '@hooks/useChartTheme';
```

- [ ] **Step 2: 获取 chartTheme 并应用到 Tooltip**

在 CustomTooltip 组件中使用 chartTheme 的 tooltip 配置。将 L37 的 tooltip div:
```tsx
<div className="bg-slate-50 dark:bg-[#1B212D]/95 backdrop-blur-md border border-slate-300 dark:border-slate-700/50 px-4 py-2 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
```
改为使用 style 注入（因为 CustomTooltip 是独立函数组件，无法直接用 Tailwind 类名引用 CSS 变量）:
```tsx
<div
  style={{
    backgroundColor: 'var(--color-bg-elevated)',
    border: '1px solid var(--color-border-default)',
    borderRadius: '12px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
  }}
  className="px-4 py-2 backdrop-blur-md"
>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/ChartCard.tsx
git commit -m "feat(M7): integrate useChartTheme into ChartCard PieChart tooltip"
```

---

## Task 7.4: 适配其他含 Recharts 的业务组件

以下业务组件中可能包含 Recharts 图表，需要逐一检查和适配：

- [ ] **Step 1: 搜索所有使用 recharts 的文件**

```bash
grep -rl 'from "recharts"\|from \'recharts\'\|from .*recharts' --include="*.tsx" src/
```

预期命中文件列表（基于项目结构推测）:
- `src/components/ui/StatCard.tsx` ← 已在 Task 7.2 处理
- `src/components/ui/ChartCard.tsx` ← 已在 Task 7.3 处理
- `src/components/features/carbon/EmissionChart.tsx`
- `src/components/features/routing/SensitivityChart.tsx`
- `src/components/features/customer-service/SentimentChart.tsx`
- 其他可能存在的图表组件...

- [ ] **Step 2: 逐一适配每个图表组件**

对每个文件执行：
1. `import { useChartTheme } from '@hooks/useChartTheme';`
2. `const chartTheme = useChartTheme();`
3. 将 `<CartesianGrid stroke=...>` → `stroke={chartTheme.gridColor}`
4. 将 `<XAxis/YAxis tick={{ fill: ... }}>` → `fill={chartTheme.axisTextColor}`
5. 将 `<Tooltip contentStyle={...}>` → `contentStyle={{ backgroundColor: chartTheme.tooltipBackgroundColor, color: chartTheme.tooltipTextColor, borderColor: chartTheme.tooltipBorderColor }}`
6. 将 `<Legend wrapperStyle={...}>` → `wrapperStyle={{ color: chartTheme.legendTextColor }}`
7. 将 `<Line stroke=...>` / `<Bar fill=...>` / `<Pie>` 的颜色属性 → 使用 `chartTheme.colors[index]`

- [ ] **Step 3: 分批 Commit**

```bash
git add src/components/features/carbon/EmissionChart.tsx ...
git commit -m "feat(M7): adapt EmissionChart with useChartTheme"

git add src/components/features/routing/SensitivityChart.tsx ...
git commit -m "feat(M7): adapt SensitivityChart with useChartTheme"

# ... 以此类推
```

---

## Task 7.5: 适配 D3.js 可视化组件（如有）

- [ ] **Step 1: 搜索 D3 使用情况**

```bash
grep -rl 'from "d3"\|from \'d3\'\|d3\.' --include="*.tsx" src/
```

- [ ] **Step 2: 对 D3 组件执行 CSS 变量注入**

D3 操作 DOM/SVG 时，使用 `var(--xxx)` 引用 CSS 变量：

```typescript
// 示例：D3 力导向图节点
svg.selectAll('.node-circle')
  .attr('fill', 'var(--color-bg-secondary)')
  .attr('stroke', 'var(--color-brand-primary)')
  .attr('stroke-width', 2);

// D3 连接线
svg.selectAll('.link-line')
  .style('stroke', 'var(--color-border-default)')
  .style('stroke-opacity', 0.3);

// D3 文字标签
svg.selectAll('.node-label')
  .style('fill', 'var(--color-text-primary)')
  .style('font-size', '12px');
```

- [ ] **Step 3: Commit**

```bash
git add <d3-component-files>
git commit -m "feat(M7): adapt D3 visualization components with CSS variable references"
```

---

## Task 7.6: 全局第三方库验证

- [ ] **Step 1: 启动开发服务器，全面检查图表**

```bash
npm run dev
```

检查清单：
- [ ] Dashboard 页面的 StatCard 图表在两种主题下正常
- [ ] Dashboard 页面的 ChartCard 饼图在两种主题下正常
- [ ] 碳监测 EmissionChart 在两种主题下正常
- [ ] 路线优化 SensitivityChart 在两种主题下正常
- [ ] 客户服务 SentimentChart 在两种主题下正常
- [ ] 所有图表的 Tooltip 在两种主题下可读
- [ ] 所有图表的坐标轴文字在两种主题下可读
- [ ] 所有图表的图例在两种主题下可读
- [ ] D3 图表（如有）在两种主题下正常

- [ ] **Step 2: 构建验证**

```bash
npm run build
```

- [ ] **Step 3: 最终 Commit（如有修复）**

```bash
git add -A
git commit -m "fix(M7): fix any remaining third-party library theme issues"
```

---

## 完成标准 Checklist

- [ ] `src/hooks/useChartTheme.tsx` 已创建并通过测试
- [ ] StatCard 内 Recharts 图表已集成 useChartTheme
- [ ] ChartCard 内 Recharts PieChart Tooltip 已适配
- [ ] EmissionChart 已适配
- [ ] SensitivityChart 已适配
- [ ] SentimentChart 已适配
- [ ] 其他含 Recharts 的组件均已适配
- [ ] D3 组件（如有）已使用 CSS 变量引用
- [ ] 全部图表在暗色/亮色模式下均可读可用
- [ ] `npm run build` 成功
