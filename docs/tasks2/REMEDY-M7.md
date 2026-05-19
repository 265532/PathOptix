# REMEDY-M7: 第三方库适配 — 修复 + 回归

> **原验收得分**: ~75% ⚠️ | **Issue 数**: 4 (🟠High×1, 🟡Medium×2, 🔵Info×1) | **修复任务**: 4 | **回归任务**: 2

---

## Phase A: 阻塞级修复

### M7-FIX-003: ChartCard.tsx 集成 useChartTheme [🟠 High] ⭐ 最关键

| 字段 | 内容 |
|------|------|
| **Issue** | M7-ISSUE-003 |
| **文件** | `src/components/ui/ChartCard.tsx` |
| **影响** | 所有使用 ChartCard 展示饼图/环形图的页面在切换主题时图表颜色不变 |
| **参考模板** | `src/components/ui/StatCard.tsx`（已完成 Recharts 适配） |

**操作步骤**:

1. **添加 import**（文件顶部）:
   ```typescript
   import { useChartTheme } from '@hooks/useChartTheme';
   ```

2. **组件内调用 Hook**:
   ```typescript
   const chartTheme = useChartTheme();
   ```

3. **PieChart colors 绑定**:
   ```typescript
   // 找到 <PieChart> 或 <Pie> 组件
   // 将 colors={["#137fec", "#10b981", ...]} 替换为：
   colors={chartTheme.colors}
   ```

4. **CustomTooltip 语义化**（如存在 CustomTooltip 组件）:
   ```typescript
   // CustomTooltip 容器样式从硬编码改为：
   <div style={{ ...chartTheme.tooltipStyle, ... }}>
     // tooltipStyle 已包含 backgroundColor, color, border 等属性
   </div>
   ```

5. **保存并验证**

**验证命令**:
```bash
# 确认 useChartTheme 已引入
grep -n 'useChartTheme\|chartTheme' src/components/ui/ChartCard.tsx
# 预期: 至少 3 处（1 import + 1 调用 + 1+ 使用）

# 确认 PieChart 使用 chartTheme.colors
grep -n 'chartTheme.colors' src/components/ui/ChartCard.tsx
# 预期: 至少 1 处
```

---

## Phase B: 重要修复

### M7-FIX-004: Monitor.tsx ChartBox 传递 chartTheme [🟡 Medium]

| 字段 | 内容 |
|------|------|
| **Issue** | M7-ISSUE-004 |
| **文件** | `src/components/features/compliance/Monitor.tsx` |
| **问题** | 主组件已调用 useChartTheme()，但子组件 ChartBox 未接收 |

**操作步骤**:

1. 打开 `Monitor.tsx`，确认已有:
   ```typescript
   const chartTheme = useChartTheme();
   ```

2. 定位 `<ChartBox` 的所有调用点

3. **ChartBox Props 扩展**（在 ChartBox 定义处或类型声明处）:
   ```typescript
   interface ChartBoxProps {
     // ...现有 props
     chartTheme?: import('../../hooks/useChartTheme').ChartThemeConfig;
   }
   ```

4. **Monitor.tsx 传入**:
   ```typescript
   <ChartBox chartTheme={chartTheme} {...其他props} />
   ```

5. **ChartBox 内部消费**:
   ```typescript
   // 在 ChartBox 内部的 Recharts 组件中：
   <AreaChart>
     <CartesianGrid stroke={chartTheme?.gridColor} />
     <XAxis stroke={chartTheme?.axisTextColor} />
     <YAxis stroke={chartTheme?.axisTextColor} />
     {/* 其他需要主题感知的 props */}
   </AreaChart>
   ```

**验证**:
```bash
# Monitor.tsx 中 ChartBox 调用包含 chartTheme prop
grep -n 'chartTheme={' src/components/features/compliance/Monitor.tsx
# 预期: 匹配 ChartBox 所在行
```

---

### M7-FIX-001: useChartTheme colors[] Design Token 注释 [🟡 Medium]

| 字段 | 内容 |
|------|------|
| **Issue** | M7-ISSUE-001 |
| **文件** | `src/hooks/useChartTheme.ts` |
| **问题** | colors[] 数组中 6 个色值缺少 Design Token 映射注释 |

**操作步骤**:

1. 打开 `useChartTheme.ts`
2. 找到 `colors: [...]` 数组定义（Dark 和 Light 两套各一个）
3. 添加 JSDoc 行内注释:

```typescript
// Dark theme 配置
const darkColors = [
  '#137fec',  // brand-primary — 主数据系列
  '#10b981',  // success — 正向指标
  '#f59e0b',  // warning — 注意指标
  '#ef4444',  // error — 异常指标
  '#8b5cf6',  // info — 辅助系列 1
  '#06b6d4',  // secondary — 辅助系列 2
];

// Light theme 配置（亮度/饱和度微调以适配浅色背景）
const lightColors = [
  '#0c6bc0',  // brand-primary (加深以保证对比度)
  '#059669',  // success
  '#d97706',  // warning
  '#dc2626',  // error
  '#7c3aed',  // info
  '#0891b2',  // secondary
];
```

---

## Phase C: 优化项

### M7-FIX-INFO-002: 清理两处死导入 [🔵 Info]

| 导入位置 | 死导入内容 |
|---------|-----------|
| `SensitivityChart.tsx` | `RobustDetail` |
| `PatencyScore` 所在文件 | `PatencyScore` |

**操作步骤**:

```bash
# 1. 定位死导入
grep -rn 'import.*RobustDetail' src/components/features/
grep -rn 'import.*PatencyScore' src/components/features/

# 2. 删除对应 import 行（确认确实无使用后再删）
# 3. 验证构建不受影响
npm run build
```

---

## 回归验证任务

### M7-REG-001: useChartTheme Hook 完整性

- [ ] 文件 `src/hooks/useChartTheme.ts` 存在
- [ ] 导出 `ChartThemeConfig` 接口（含 backgroundColor/gridColor/axisStroke/axisTextColor/legendTextColor/tooltipStyle/colors[]）
- [ ] 返回 Dark/Light 两套配置，通过 `isDark` 切换
- [ ] colors[] 含 6 个色值 + Design Token 注释（M7-FIX-001 完成后）

### M7-REG-002: StatCard Recharts 适配确认（已完成的基准）

```bash
# 确认 StatCard 作为 M7 适配的正确范例仍然完好
grep -n 'useChartTheme\|chartTheme\.' src/components/ui/StatCard.tsx
# 预期: 多处匹配（import + 调用 + stroke/fill/grid/axis 使用）
```

---

## 待扩展清单（Phase C 后续）

以下 Recharts 消费者尚未适配 useChartTheme，记录在此供后续逐个处理：

| 优先级 | 文件 | 图表类型 | 状态 |
|--------|------|---------|------|
| P0 | `StatCard.tsx` | LineChart, BarChart | ✅ 已完成 |
| P0 | `ChartCard.tsx` | PieChart | 🔄 本轮修复 (FIX-003) |
| P1 | `Monitor.tsx` (ChartBox) | AreaChart, BarChart | 🔄 本轮修复 (FIX-004) |
| P2 | `EmissionChart.tsx` | 自定义图表 | ⬜ 待适配 |
| P2 | `SentimentChart.tsx` | 图表 | ⬜ 待适配 |
| P2 | `CarbonMonitoringModal.tsx` | 图表 | ⬜ 待适配 |
| P2 | `ESGReportView.tsx` | 图表 | ⬜ 待适配 |
| P2 | `SensitivityChart.tsx` | 图表 | ⬜ 待适配 |
| P2 | `Visualizer.tsx` | D3/地图 | ⬜ 待评估 |

---

## 完成标准

- [ ] M7-FIX-003: ChartCard.tsx 引入 useChartTheme + PieChart colors 绑定 + Tooltip 语义化
- [ ] M7-FIX-004: Monitor.tsx ChartBox 接收 chartTheme prop + 内部消费
- [ ] M7-FIX-001: useChartTheme colors[] 每个色值有 Design Token 注释
- [ ] M7-FIX-INFO-002: RobustDetail 和 PatencyScore 死导入已清理
- [ ] M7-REG-001: Hook 类型完整、双套配置正确
- [ ] M7-REG-002: StatCard 基准适配未受破坏
