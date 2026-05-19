# M6: 业务组件适配模块 — 实施任务

> **模块编号**: M6
> **前置依赖**: M1 (基础设施), M2 (状态管理)
> **预估工时**: 8-16 小时（最大模块）
> **风险等级**: 高（涉及 ~80+ 个文件，需系统性执行）

---

## 模块目标

对 9 个业务特性目录下**所有组件文件**进行硬编码颜色→语义化类名的替换。这是工作量最大的模块，需要系统性的方法论支撑。

---

## 通用工作流程（每个子任务都遵循）

每个业务组件文件的适配遵循以下 **4 步标准流程**:

```
Step 1: 颜色审计 (Audit)
  └── 用 grep 搜索文件中的硬编码颜色模式

Step 2: 语义映射 (Map)
  └── 对照替换规则表，确定每个颜色的语义类别

Step 3: 替换执行 (Replace)
  └── 逐一执行替换

Step 4: 双主题验证 (Verify)
  └── 暗色回归 + 亮目视检查
```

### 颜色替换速查表（随身参考）

| 你看到的 | 替换为 | 条件 |
|---------|--------|------|
| `#05080F` | `bg-bg-primary` | 最深背景 |
| `#0B121E` | `bg-bg-secondary` | 卡片/面板背景 |
| `#0B0F19` | `bg-bg-modal` | 弹窗背景 |
| `#111827` | `bg-bg-tertiary` | 列表项/次级区 |
| `#1c2127` | `bg-bg-elevated` | 输入框/悬浮层 |
| `#151B28` | `bg-bg-secondary` | 图表卡片背景 |
| `#1B212D` | `bg-bg-elevated` | Tooltip 背景 |
| `#0F172A` | 特殊深色 | 保留或评估 |
| `white`, `#ffffff` | `text-text-primary` | 主文字（需看上下文） |
| `#E2E8F0` | `text-text-secondary` | body 默认文字 |
| `#9dabb9` | `text-text-secondary` | 次要文字 |
| `slate-200` (边框) | `border-border-default` | 卡片边框 |
| `slate-300` | `border-border-input` | 输入框边框 |
| `slate-800` (边框/分割) | `border-border-default` | 分隔线 |
| `slate-900` (背景) | `bg-bg-elevated` | 深色填充 |
| `#3b4754` | `border-border-input` | 输入框边框 |
| `#137fec` | `text-brand-primary` / `bg-brand-primary` | 品牌蓝色 |
| `#10b981` | 保留 | success 绿 |
| `#f59e0b` | 保留 | warning 橙 |
| `#ef4444` | 保留 | error 红 |
| `#06b6d4` | 保留 | accent 青 |
| `cyan-*` | 保留 | 品牌青色系 |
| `emerald-*` | 保留 | 品牌绿色系 |
| `rgba(28,33,39,...)` | `var(--glass-bg)` | 毛玻璃背景 |
| `rgba(59,71,84,...)` | `var(--glass-border)` | 毛玻璃边框 |

---

## Task 6.1: M6-A — 认证模块 (auth/)

**目录**: `src/components/features/auth/`
**预估文件数**: 2-3
**预估替换处**: 10-15

- [ ] **Step 1: 审计 auth/ 目录下所有文件的颜色**

```bash
grep -rn 'bg-\[#\|text-\[#\|border-\[#\|from-\[#\|to-\[#' src/components/features/auth/
```

- [ ] **Step 2: 对 LoginView.tsx 执行替换**（如 M5 Task 5.3 未完成则在此完成）

- [ ] **Step 3: 对 auth/ 目录下其他文件执行替换**

- [ ] **Step 4: 验证登录页在两种主题下的表现**

- [ ] **Step 5: Commit**

```bash
git add src/components/features/auth/
git commit -m "feat(M6-A): adapt auth module components for theme switching"
```

---

## Task 6.2: M6-B — 仪表板模块 (dashboard/)

**目录**: `src/components/features/dashboard/`
**子目录**: Console/ (ConsoleModule, NodeGrid, SystemPulse)
**预估文件数**: 5-8
**预估替换处**: 20-30

- [ ] **Step 1: 审计 dashboard/ 目录**

```bash
grep -rn 'bg-\[#\|text-\[#\|border-\[#' src/components/features/dashboard/
```

- [ ] **Step 2: 逐一文件执行 Audit → Map → Replace → Verify**

优先处理顺序：
1. `DashboardView.tsx` — 主视图入口
2. `Console/ConsoleModule.tsx`
3. `Console/NodeGrid.tsx`
4. `Console/SystemPulse.tsx`

- [ ] **Step 3: 特别关注仪表板特有元素**

- StatCard / ChartCard 引用（已在 M5 处理，此处确认 import 无问题）
- 数据卡片中的数字高亮色
- 控制台节点的状态指示灯颜色
- 系统脉冲动画的颜色

- [ ] **Step 4: Commit**

```bash
git add src/components/features/dashboard/
git commit -m "feat(M6-B): adapt dashboard module components for theme switching"
```

---

## Task 6.3: M6-C — 订单管理模块 (orders/) ⚠️ 最高优先级

**目录**: `src/components/features/orders/`
**预估文件数**: 12-18 (**最大子模块**)
**预估替换处**: 40-60

- [ ] **Step 1: 全量审计 orders/ 目录**

```bash
grep -rn 'bg-\[#\|text-\[#\|border-\[#' src/components/features/orders/
```

建议将输出保存到文件中用于追踪：
```bash
grep -rn 'bg-\[#\|text-\[#\|border-\[#' src/components/features/orders/ > orders-color-audit.txt
wc -l orders-color-audit.txt
```

- [ ] **Step 2: 按优先级排序处理文件**

| 优先级 | 文件 | 理由 |
|--------|------|------|
| P0 | `OrderMainTable.tsx` | 核心表格，用户最常看到 |
| P0 | `OrderManagementView.tsx` | 模块入口 |
| P0 | `OrderMetrics.tsx` | 指标展示 |
| P1 | `CreateOrderModal.tsx` | 弹窗表单 |
| P1 | `EditOrderModal.tsx` | 弹窗表单 |
| P1 | `DetailedOrderList.tsx` | 列表展示 |
| P1 | `FilterModal.tsx` | 筛选弹窗 |
| P1 | `OrderModalParts.tsx` | 弹窗公共部分 |
| P2 | `CapacityAnalysisModal.tsx` | 分析弹窗 |
| P2 | `CapacityMatchingModal.tsx` | 匹配弹窗 |
| P2 | `CarbonMonitoringModal.tsx` | 碳监控弹窗 |
| P2 | `InventoryAlerts.tsx` | 预警组件 |
| P2 | `LiveTracking.tsx` | 追踪组件 |

- [ ] **Step 3: 逐一处理每个文件（P0 → P2）**

对每个文件执行标准 4 步流程。对于订单管理模块，特别关注：

**表格相关**:
- 表头背景色 → `bg-bg-tertiary`
- 斑马纹行 → 可用 `even:bg-bg-primary odd:bg-bg-secondary` 或保持 Tailwind 默认
- 边框色 → `border-border-default`
- hover 高亮 → `hover:bg-bg-tertiary/50`
- 排序列头箭头 → `text-text-muted`
- 分页器颜色 → `text-text-muted` / `bg-bg-secondary`

**Modal 弹窗相关**:
- 遮罩层 → 已由 CSS 变量 `--color-bg-overlay` 处理（全局）
- 弹窗背景 → `bg-bg-modal`
- 弹窗内卡片 → `bg-bg-secondary` + `border-border-default`
- 表单输入框 → `bg-bg-elevated` + `border-border-input`
- 按钮 primary → `bg-brand-primary text-white`
- 按钮 secondary → `bg-bg-tertiary text-text-primary`
- 关闭按钮图标 → `text-text-muted hover:text-text-primary`

**状态 Badge 相关**:
- success → `bg-emerald-500/10 text-emerald-500` （保留品牌色）
- warning → `bg-amber-500/10 text-amber-500` （保留）
- error → `bg-red-500/10 text-red-500` （保留）
- info → `bg-blue-500/10 text-blue-500` （保留）
- default → `bg-bg-tertiary text-text-muted`

- [ ] **Step 4: 分批 Commit（建议每 3-5 个文件提交一次）**

```bash
git add src/components/features/orders/OrderMainTable.tsx src/components/features/orders/OrderManagementView.tsx src/components/features/orders/OrderMetrics.tsx
git commit -m "feat(M6-C): adapt order management core views (table, metrics, main)"

git add src/components/features/orders/CreateOrderModal.tsx src/components/features/orders/EditOrderModal.tsx src/components/features/orders/DetailedOrderList.tsx
git commit -m "feat(M6-C): adapt order modals and list views"

# ... 以此类推
```

---

## Task 6.4: M6-D — 路线优化模块 (routing/)

**目录**: `src/components/features/routing/`
**子目录**: Scenarios/ (NormalScenario, PolicyScenario, StressScenario)
**预估文件数**: 8-12
**预估替换处**: 15-25

- [ ] **Step 1: 审计 routing/ 目录**

- [ ] **Step 2: 优先处理核心文件**

| 优先级 | 文件 |
|--------|------|
| P0 | `RouteOptimizationView.tsx` |
| P0 | `ScenarioHeader.tsx` |
| P1 | `ComparisonTable.tsx`, `PressureMap.tsx` |
| P1 | `SensitivityChart.tsx`, `SimulationLog.tsx`, `SidebarWeights.tsx` |
| P2 | `RobustDetail.tsx` |
| P2 | `Scenarios/NormalScenario/NormalView.tsx` |
| P2 | `Scenarios/PolicyScenario/PolicyView.tsx` |
| P2 | `Scenarios/StressScenario/StressView.tsx` |

- [ ] **Step 3: 特别关注路线优化特有元素**

- 地图背景色（可能需要保留特殊处理）
- 场景参数配置面板
- 压力测试 tab 的激活态颜色 (`bg-red-500/5` 等 — 保留)
- 敏感度图表的颜色系列

- [ ] **Step 4: Commit**

```bash
git add src/components/features/routing/
git commit -m "feat(M6-D): adapt routing optimization module for theme switching"
```

---

## Task 6.5: M6-E — 训练优化模块 (training/)

**目录**: `src/components/features/training/`
**预估文件数**: 6-8
**预估替换处**: 10-15

- [ ] **Step 1: 审计 training/ 目录**

- [ ] **Step 2: 优先处理**

| 优先级 | 文件 |
|--------|------|
| P0 | `TrainingOptimizationView.tsx` |
| P0 | `Monitor.tsx` |
| P1 | `ParamConfig.tsx`, `ModelEval.tsx` |
| P1 | `Visualizer.tsx`, `HistoryPanel.tsx` |
| P2 | `LogPanel.tsx`, `BottomMetrics.tsx` |

- [ ] **Step 3: Commit**

```bash
git add src/components/features/training/
git commit -m "feat(M6-E): adapt training optimization module for theme switching"
```

---

## Task 6.6: M6-F — 碳监测模块 (carbon/)

**目录**: `src/components/features/carbon/`
**预估文件数**: 6-8
**预估替换处**: 10-15

- [ ] **Step 1: 审计 carbon/ 目录**

- [ ] **Step 2: 优先处理**

| 优先级 | 文件 |
|--------|------|
| P0 | `CarbonMonitoringView.tsx` |
| P0 | `ESGReportView.tsx` |
| P1 | `EmissionChart.tsx`, `CarbonMetrics.tsx` |
| P1 | `EnergySourcePanel.tsx`, `SustainabilityScore.tsx` |

- [ ] **Step 3: Commit**

```bash
git add src/components/features/carbon/
git commit -m "feat(M6-F): adapt carbon monitoring module for theme switching"
```

---

## Task 6.7: M6-G — 合规安全模块 (compliance/)

**目录**: `src/components/features/compliance/`
**预估文件数**: 14-18 (**第二大子模块**)
**预估替换处**: 25-35

- [ ] **Step 1: 全量审计 compliance/ 目录**

```bash
grep -rn 'bg-\[#\|text-\[#\|border-\[#' src/components/features/compliance/ > compliance-audit.txt
```

- [ ] **Step 2: 按优先级分批处理**

| 优先级 | 文件 |
|--------|------|
| P0 | `ComplianceSecurityView.tsx` |
| P0 | `SecurityHeader.tsx`, `RiskDashboardCenter.tsx` |
| P1 | `AuditLogs.tsx`, `AuditChange.tsx`, `FileManagement.tsx` |
| P1 | `ComplianceStatus.tsx`, `CongestionMonitor.tsx` |
| P1 | `EmergencyAlertPanel.tsx`, `ThreatMonitor.tsx` |
| P1 | `SecurityMonitoring.tsx`, `FutureRiskRadar.tsx` |
| P2 | 其余文件（PatencyScore, PpoPreemptiveLog, PredictiveSandbox, RegionalCompliance, ReportExport, ResilienceReportExport） |

- [ ] **Step 3: 分批 Commit**

```bash
# 第一批：核心视图
git add src/components/features/compliance/ComplianceSecurityView.tsx ...
git commit -m "feat(M6-G-P1): adapt compliance core views"

# 第二批：审计和安全
git add src/components/features/compliance/AuditLogs.tsx ...
git commit -m "feat(M6-G-P2): adapt audit and security sub-modules"

# 第三批：剩余
git add src/components/features/compliance/
git commit -m "feat(M6-G-P3): adapt remaining compliance components"
```

---

## Task 6.8: M6-H — 客户服务模块 (customer-service/)

**目录**: `src/components/features/customer-service/`
**预估文件数**: 10-12
**预估替换处**: 15-20

- [ ] **Step 1: 审计 customer-service/ 目录**

- [ ] **Step 2: 优先处理**

| 优先级 | 文件 |
|--------|------|
| P0 | `CustomerServiceView.tsx` |
| P0 | `AIChatPanel.tsx` |
| P1 | `FeedbackForm.tsx`, `ProgressTracking.tsx` |
| P1 | `AIResponsePanel.tsx`, `FeedbackStatusTable.tsx` |
| P2 | `SentimentChart.tsx`, `ServiceStats.tsx`, `SupportQueue.tsx`, `UpdatesFeed.tsx`, `OrderSyncPanel.tsx` |

- [ ] **Step 3: 特别关注 AI 聊天面板**

- 聊天气泡背景 → `bg-bg-secondary`
- 用户消息气泡 → `bg-brand-primary/10`（自己）vs `bg-bg-tertiary`（对方）
- 输入框 → `bg-bg-elevated` + `border-border-input`
- 发送按钮 → `bg-brand-primary`

- [ ] **Step 4: Commit**

```bash
git add src/components/features/customer-service/
git commit -m "feat(M6-H): adapt customer service module for theme switching"
```

---

## Task 6.9: M6-I — 系统设置模块 (settings/)

**目录**: `src/components/features/settings/`
**子目录**: Account/, AlertSystem/, DataSync/, GlobalRegion/, ModelPermissions/
**预估文件数**: 8-12
**预估替换处**: 10-20

- [ ] **Step 1: 审计 settings/ 目录**

- [ ] **Step 2: 优先处理**

| 优先级 | 文件 |
|--------|------|
| P0 | `SettingsView.tsx` |
| P1 | `Account/` 下所有文件 |
| P1 | `AlertSystem/` 下所有文件 |
| P2 | `DataSync/`, `GlobalRegion/`, `ModelPermissions/` 下所有文件 |

- [ ] **Step 3: Commit**

```bash
git add src/components/features/settings/
git commit -m "feat(M6-I): adapt settings module for theme switching"
```

---

## Task 6.10: 全局残留扫描与清理

- [ ] **Step 1: 全项目范围搜索残留硬编码颜色**

```bash
# 搜索所有仍包含硬编码 hex 颜色的 .tsx 文件
grep -rl 'bg-\[#\|text-\[#\|border-\[#' --include="*.tsx" src/
```

预期结果：**零命中**（或仅有 brand/special-use 色的合理保留）

- [ ] **Step 2: 若发现残留，记录并修复**

对每个残留文件补充执行 4 步流程。

- [ ] **Step 3: 最终 Commit（如有修复）**

```bash
git add -A
git commit -m "fix(M6): cleanup remaining hardcoded colors found during final scan"
```

---

## 完成标准 Checklist

- [ ] **M6-A** auth/: 全部文件适配完成 ✅
- [ ] **M6-B** dashboard/: 全部文件适配完成 ✅
- [ ] **M6-C** orders/: 全部文件适配完成 ✅ (12-18 个文件)
- [ ] **M6-D** routing/: 全部文件适配完成 ✅
- [ ] **M6-E** training/: 全部文件适配完成 ✅
- [ ] **M6-F** carbon/: 全部文件适配完成 ✅
- [ ] **M6-G** compliance/: 全部文件适配完成 ✅ (14-18 个文件)
- [ ] **M6-H** customer-service/: 全部文件适配完成 ✅
- [ ] **M6-I** settings/: 全部文件适配完成 ✅
- [ ] 全局 grep 残留扫描：零硬编码颜色残留（brand 色除外）
- [ ] `npm run build` 构建成功
- [ ] 全页面遍历：暗色模式无视觉回归
- [ ] 全页面遍历：亮色模式全部页面可读可用
