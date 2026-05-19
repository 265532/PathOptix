# PathOptix Dashboard 明暗主题切换 — 总体进度追踪

> **创建日期**: 2026-05-17
> **需求文档**: [theme-switching-requirement.md](../theme-switching-requirement.md)
> **设计文档**: [theme-switching-design.md](../theme-switching-design.md)

---

## 模块总览

| 编号 | 模块名称 | 任务文档 | 子任务数 | 状态 | 完成度 |
|------|---------|---------|---------|------|--------|
| M1 | 基础设施配置 | [M1-infrastructure.md](./M1-infrastructure.md) | 7 | ✅ 已完成 | 100% |
| M2 | 状态管理 | [M2-state-management.md](./M2-state-management.md) | 4 | ✅ 已完成 | 100% |
| M3 | UI 控件 | [M3-ui-toggle.md](./M3-ui-toggle.md) | 3 | ✅ 已完成 | 100% |
| M4 | 布局组件适配 | [M4-layout-adapter.md](./M4-layout-adapter.md) | 3 | ✅ 已完成 | 100% |
| M5 | UI 组件适配 | [M5-ui-components-adapter.md](./M5-ui-components-adapter.md) | 5 | ✅ 已完成 | 100% |
| M6 | 业务组件适配 | [M6-business-adapter.md](./M6-business-adapter.md) | 10 | ✅ 已完成 | 100% |
| M7 | 第三方库适配 | [M7-third-party-adapter.md](./M7-third-party-adapter.md) | 6 | 🔄 进行中 | 0% |

---

## 执行顺序（依赖链）

```
Phase 1 (基础设施):     M1 ──────────────────────────────┐
Phase 2 (核心框架):     M2 (依赖 M1) ────┐               │
                       M3 (依赖 M1+M2) ──┤               │
Phase 3 (布局适配):     M4 (依赖 M1+M2+M3)                │
Phase 4 (组件适配):     M5 (依赖 M1+M2)   ←──────────────┘
                       M6 (依赖 M1+M2)
Phase 5 (三方适配):     M7 (依赖 M1+M2)
```

**推荐执行路径**: M1 → M2 → M3 → M4 → M5 → M6 → M7

---

## 进度 Checklist

### Phase 1: 基础设施

- [x] **M1** — 基础设施配置模块
  - [x] Task 1.1: 安装 Tailwind npm 依赖
  - [x] Task 1.2: 创建 PostCSS 配置文件
  - [x] Task 1.3: 创建 Tailwind 配置文件
  - [x] Task 1.4: 创建 CSS 变量定义文件 (themes.css)
  - [x] Task 1.5: 改造 index.html 入口页
  - [x] Task 1.6: 修改 main.tsx 引入 themes.css
  - [x] Task 1.7: 验证构建与开发服务器

### Phase 2: 核心框架

- [x] **M2** — 状态管理模块
  - [x] Task 2.1: 创建 ThemeContext.tsx + index.ts
  - [x] Task 2.2: 创建 useTheme Hook
  - [x] Task 2.3: 将 ThemeProvider 注入 main.tsx
  - [ ] Task 2.4: 单元测试

- [x] **M3** — UI 控件模块
  - [x] Task 3.1: 创建 ThemeToggle 组件
  - [x] Task 3.2: 将 ThemeToggle 集成到 Header
  - [ ] Task 3.3: 可选 — ThemeToggle 单元测试

### Phase 3: 布局适配

- [x] **M4** — 布局组件适配模块
  - [x] Task 4.1: Header.tsx 颜色适配 (~25 处替换)
  - [x] Task 4.2: Sidebar.tsx 颜色适配 (~20 处替换)
  - [x] Task 4.3: App.tsx 根容器适配

### Phase 4: 组件适配

- [x] **M5** — UI 基础组件适配模块
  - [x] Task 5.1: StatCard.tsx 渐进式适配 (A 组)
  - [x] Task 5.2: ChartCard.tsx 渐进式适配 (A 组)
  - [x] Task 5.3: LoginView.tsx 适配 (A 组)
  - [x] Task 5.4: MapWidget + AlertPanel 适配 (B 组)
  - [x] Task 5.5: 全量 UI 组件视觉回归测试

- [x] **M6** — 业务组件适配模块
  - [x] Task 6.1: M6-A 认证模块 (auth/)
  - [x] Task 6.2: M6-B 仪表板 (dashboard/)
  - [x] Task 6.3: M6-C 订单管理 (orders/) ⚠️ 最大子模块
  - [x] Task 6.4: M6-D 路线优化 (routing/)
  - [x] Task 6.5: M6-E 训练优化 (training/)
  - [x] Task 6.6: M6-F 碳监测 (carbon/)
  - [x] Task 6.7: M6-G 合规安全 (compliance/) ⚠️ 第二大
  - [x] Task 6.8: M6-H 客户服务 (customer-service/)
  - [x] Task 6.9: M6-I 系统设置 (settings/)
  - [x] Task 6.10: 全局残留扫描与清理

### Phase 5: 第三方库适配

- [ ] **M7** — 第三方库适配模块
  - [ ] Task 7.1: 创建 useChartTheme Hook
  - [ ] Task 7.2: 适配 StatCard Recharts 图表
  - [ ] Task 7.3: 适配 ChartCard Recharts PieChart
  - [ ] Task 7.4: 适配其他业务组件中的 Recharts
  - [ ] Task 7.5: 适配 D3.js 可视化组件（如有）
  - [ ] Task 7.6: 全局第三方库验证

---

## 最终验收 Checklist（全部模块完成后执行）

### 功能验收
- [ ] F-01: 点击 Header 切换按钮可在明/暗主题间切换
- [ ] F-02: 切换后图标正确对应（暗→太阳，亮→月亮）
- [ ] F-03: 刷新页面后主题保持为上次选择
- [ ] F-04: 首次访问默认为暗色主题
- [ ] F-05: 关闭浏览器重新打开后主题保持
- [ ] F-06: 所有 8 个业务模块在两种主题下均正常显示
- [ ] F-07: 登录页在两种主题下均正常显示
- [ ] F-08: Header 和 Sidebar 在两种主题下正常
- [ ] F-09: 表格、表单、Modal、图表在两种主题下可用
- [ ] F-10: 打印预览始终为亮色样式

### 技术验收
- [ ] T-01: `npm run build` 构建成功，零报错
- [ ] T-02: `npm run dev` 开发服务器正常启动
- [ ] T-03: 零 `console.log` 残留
- [ ] T-04: 零新的 `any` 类型引入
- [ ] T-05: 硬编码颜色值从 236 处降至 0 处（brand 色除外）
- [ ] T-06: Tailwind CDN 引用已完全移除
- [ ] T-07: `tailwind.config.js` 和 `postcss.config.js` 配置正确

### 视觉验收
- [ ] V-01: 亮色模式文字对比度符合 WCAG AA 标准
- [ ] V-02: 两种模式下品牌色使用一致
- [ ] V-03: 亮色模式下卡片之间有足够层次感
- [ ] V-04: 切换动画流畅无卡顿（300ms）
- [ ] V-05: 无 FOUC（首次加载无闪烁）
- [ ] V-06: 所有自定义工具类在两种主题下表现正常

---

## 文件产出清单

| # | 文件 | 类型 | 所属模块 | 状态 |
|---|------|------|---------|------|
| 1 | `tailwind.config.js` | 新建 | M1 | ✅ |
| 2 | `postcss.config.js` | 新建 | M1 | ✅ |
| 3 | `src/styles/themes.css` | 新建 | M1 | ✅ |
| 4 | `index.html` (改造) | 修改 | M1 | ✅ |
| 5 | `package.json` (更新) | 修改 | M1 | ✅ |
| 6 | `src/main.tsx` (更新) | 修改 | M1+M2 | ✅ |
| 7 | `src/contexts/ThemeContext.tsx` | 新建 | M2 | ✅ |
| 8 | `src/contexts/index.ts` | 新建 | M2 | ✅ |
| 9 | `src/hooks/useTheme.ts` | 新建 | M2 | ✅ |
| 10 | `src/hooks/useChartTheme.ts` | 新建 | M7 | ⬜ |
| 11 | `src/components/ui/ThemeToggle.tsx` | 新建 | M3 | ✅ |
| 12 | `src/components/ui/index.ts` (更新) | 修改 | M3 | ✅ |
| 13 | `src/components/layout/Header.tsx` (更新) | 修改 | M3+M4 | ✅ |
| 14 | `src/components/layout/Sidebar.tsx` (更新) | 修改 | M4 | ✅ |
| 15 | `src/App.tsx` (更新) | 修改 | M4 | ✅ |
| 16 | `src/components/ui/StatCard.tsx` (更新) | 修改 | M5+M7 | ✅ |
| 17 | `src/components/ui/ChartCard.tsx` (更新) | 修改 | M5+M7 | ✅ |
| 18 | `src/components/features/auth/LoginView.tsx` (更新) | 修改 | M5/M6-A | ✅ |
| 19 | `src/components/ui/MapWidget.tsx` (更新) | 修改 | M5 | ✅ |
| 20 | `src/components/ui/AlertPanel.tsx` (更新) | 修改 | M5 | ✅ |
| 21-96 | 业务组件文件 (更新) | 修改 | M6 | ✅ |
