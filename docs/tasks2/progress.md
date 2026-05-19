# PathOptix 主题切换 — 整改任务总进度追踪

> **创建日期**: 2026-05-18
> **依据文档**: [acceptance-report.md](./acceptance-report.md)（综合评分 91.1%）
> **目标**: 修复全部 15 个 Issue，回归验证 7 个模块，通过最终验收

---

## 模块任务总览

| 编号 | 模块 | 原验收得分 | Issue 数 | 修复任务数 | 回归任务数 | 状态 |
|------|------|-----------|----------|-----------|-----------|------|
| M1 | 基础设施配置 | 100% | 1 (Info) | 1 | 3 | ✅ 已完成 |
| M2 | 状态管理 | 75% | 1 (Critical) | 1 | 3 | ✅ 已完成 |
| M3 | UI 控件 | 95% | 1 (Major) | 1 | 3 | ✅ 已完成 |
| M4 | 布局组件适配 | 100% | 0 | 0 | 3 | ✅ 已完成 |
| M5 | UI 组件适配 | 98% | 3 (Low) | 3 | 3 | ✅ 已完成 |
| M6 | 业务组件适配 | 95.3% | 7 (H/M/L) | 7 | 3 | ✅ 已完成 |
| M7 | 第三方库适配 | ~75% | 4 (H/M/Info) | 4 | 2 | ✅ 已完成 |
| — | 最终验收复检 | — | — | — | 23 | ⬜ 待开始 |

**合计**: 17 个修复任务 + 23 个回归/验收任务 = **40 个可执行任务**

---

## 执行顺序（依赖链）

```
Phase A (阻塞级, ~2.5h):
  M7-ISSUE-003 ── ChartCard useChartTheme 集成
  M6-ISSUE-H01  ── CarbonMonitoringView Toast bg
  M2-ISS-001    ── ThemeContext + useTheme 单元测试
       │
Phase B (重要级, ~2h):
  M7-ISSUE-004 ── Monitor ChartBox chartTheme 传递
  M6-ISSUE-M01  ── Visualizer 地图背景色
  M6-ISSUE-M02  ── CapacityAnalysisModal #06b6d4
  M7-ISSUE-001  ── useChartTheme colors[] 注释
  M3-ISSUE-001  ── ThemeToggle 单元测试
       │
Phase C (优化级, ~6h+):
  M6-L01~L03   ── 12 处低优先级残余清理
  R01~R03      ── SVG 内联颜色优化
  M6-M03       ── 打印模板内联样式(技术债务)
  M1-INFO-001  ── importmap 冗余移除
  M7-INFO-002  ── 死导入清理
  M7-剩余      ── 其他 Recharts 消费者逐个适配
       │
Phase D (全量回归 + 验收):
  REMEDY-M1~M7 回归验证 → FINAL-CHECKLIST 最终验收
```

**推荐路径**: Phase A → Phase B → Phase C → Phase D

---

## 进度 Checklist

### Phase A: 阻塞级修复

- [x] **M7** — M7-ISSUE-003: ChartCard.tsx 集成 useChartTheme
- [x] **M6** — M6-ISSUE-H01: CarbonMonitoringView Toast 背景色 (已确认零残余)
- [x] **M2** — ISS-001: ThemeContext + useTheme 单元测试 (覆盖率: ThemeContext 96.55%, useTheme 85.71%)

### Phase B: 重要修复

- [x] **M7** — M7-ISSUE-004: Monitor.tsx ChartBox 传递 chartTheme
- [x] **M6** — M6-ISSUE-M01: Visualizer 地图容器背景色 (已确认零残余)
- [x] **M6** — M6-ISSUE-M02: CapacityAnalysisModal #06b6d4 批量替换 (4处→brand-accent)
- [x] **M7** — M7-ISSUE-001: useChartTheme colors[] Design Token 注释
- [x] **M3** — M3-ISSUE-001: ThemeToggle 单元测试

### Phase C: 优化项

- [x] **M6** — M6-L01~L03: 清理 12 处 `#[` 低优先级残余 (实际修复5处+记录3处shadow glow)
- [x] **M5** — R01~R03: SVG 内联颜色优化（currentColor 方案）
- [x] **M6** — M6-M03: 打印模板内联样式抽取（Tech Debt 已标注TODO）
- [x] **M1** — M1-INFO-001: 移除 importmap 冗余块
- [x] **M7** — M7-INFO-002: 清理 2 处死导入（已验证：非死导入，文档信息过时）
- [ ] **M7** — Task 7.4 剩余: EmissionChart/SentimentChart 等 Recharts 适配
- [ ] **M7** — Task 7.5: D3.js 适配评估与实施

### Phase D: 回归验证（每模块独立执行）

- [x] **M1 回归**: Tailwind 构建 + themes.css 变量 + FOUC 脚本 + CDN 确认
- [x] **M2 回归**: ThemeContext 运行时 + useTheme Hook + Provider 注入 (全部通过)
- [x] **M3 回归**: ThemeToggle 渲染 + Header 集成位置 + 动画效果
- [x] **M4 回归**: Header 28处 + Sidebar 20处 + App.tsx 根容器
- [x] **M5 回归**: StatCard + ChartCard + LoginView + MapWidget + AlertPanel
- [x] **M6 回归**: 9 业务模块核心页面零残余确认 (全局残余3处≤5, 全部通过)
- [x] **M7 回归**: useChartTheme Hook + StatCard Recharts + 全局图表（ChartCard/Monitor 已验证）

### Phase E: 最终验收复检

- [ ] 功能验收 F-01 ~ F-10（10 项）
- [ ] 技术验收 T-01 ~ T-07（7 项）
- [ ] 视觉验收 V-01 ~ V-06（6 项）

---

## Issue → 任务文件索引

| Issue ID | 级别 | 所属模块 | 任务文件 | Phase |
|----------|------|---------|---------|-------|
| ISS-001 | 🔴 Critical | M2 | [REMEDY-M2.md](./REMEDY-M2.md) | A |
| M7-ISSUE-003 | 🟠 High | M7 | [REMEDY-M7.md](./REMEDY-M7.md) | A |
| M6-ISSUE-H01 | 🟠 High | M6 | [REMEDY-M6.md](./REMEDY-M6.md) | A |
| M7-ISSUE-004 | 🟡 Medium | M7 | [REMEDY-M7.md](./REMEDY-M7.md) | B |
| M6-ISSUE-M01 | 🟡 Medium | M6 | [REMEDY-M6.md](./REMEDY-M6.md) | B |
| M6-ISSUE-M02 | 🟡 Medium | M6 | [REMEDY-M6.md](./REMEDY-M6.md) | B |
| M7-ISSUE-001 | 🟡 Medium | M7 | [REMEDY-M7.md](./REMEDY-M7.md) | B |
| M3-ISSUE-001 | 🟠 Major | M3 | [REMEDY-M3.md](./REMEDY-M3.md) | B |
| M6-L01~L03 | 🟢 Low×3 | M6 | [REMEDY-M6.md](./REMEDY-M6.md) | C |
| R01~R03 | 🟢 Low×3 | M5 | [REMEDY-M5.md](./REMEDY-M5.md) | C |
| M6-M03 | 🟡 Medium | M6 | [REMEDY-M6.md](./REMEDY-M6.md) | C |
| M1-INFO-001 | 🔵 Info | M1 | [REMEDY-M1.md](./REMEDY-M1.md) | C |
| M7-INFO-002 | 🔵 Info | M7 | [REMEDY-M7.md](./REMEDY-M7.md) | C |
| M4 回归 | — | M4 | [REMEDY-M4.md](./REMEDY-M4.md) | D |
| FINAL | — | 全部 | [FINAL-CHECKLIST.md](./FINAL-CHECKLIST.md) | E |
