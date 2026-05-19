# PathOptix Dashboard — 系统架构文档

> 最后更新: 2026-05-17 | 版本: v2.4

## 1. 项目概览

PathOptix 是一个跨境物流路径优化系统，前端使用 React 19 + Vite 6 + TypeScript，后端使用 FastAPI + SQLAlchemy + SQLite，核心算法为 PPO 强化学习与 LangGraph 多智能体编排。

## 2. 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | React 19, TypeScript 5.x |
| 构建工具 | Vite 6 |
| 样式 | Tailwind CSS (CDN), 深色 Glassmorphism 主题 |
| 图表 | Recharts |
| HTTP 客户端 | Axios (双层封装: axiosInstance + httpClient) |
| 后端框架 | FastAPI (Python), Uvicorn |
| ORM | SQLAlchemy |
| 数据库 | SQLite (默认), PostgreSQL (可选) |
| AI 引擎 | stable-baselines3 (PPO), langgraph, langchain, gymnasium |

## 3. 目录结构

```
项目根/
├── backend/                          # Python 后端
│   ├── main.py                       # FastAPI 入口，端口 8010
│   ├── app/
│   │   ├── config.py                 # Pydantic Settings (环境变量)
│   │   ├── api/                      # 路由层 (HTTP → Service)
│   │   │   ├── __init__.py           # 聚合所有 router
│   │   │   ├── auth.py               # 登录/注册/Token
│   │   │   ├── chat.py               # SSE 流式聊天
│   │   │   ├── order.py              # 订单 CRUD
│   │   │   ├── optimization.py       # 路径优化
│   │   │   ├── simulation.py         # 蒙特卡洛仿真
│   │   │   ├── risk_dashboard.py     # 风险指标看板
│   │   │   ├── risk_graph.py         # 风险知识图谱
│   │   │   └── predictive_sandbox.py # 未来态沙盘推演
│   │   ├── models/                   # SQLAlchemy ORM 模型
│   │   │   ├── database.py           # Engine / Session / Base
│   │   │   ├── user.py               # User 表
│   │   │   ├── order.py              # Order 表
│   │   │   └── risk.py               # IntelligenceNews / RiskMetrics / DispatchLog
│   │   ├── schemas/                  # Pydantic v2 请求/响应模型
│   │   └── services/                 # 业务逻辑层
│   │       ├── auth.py               # JWT 签发/验签 + 密码哈希
│   │       ├── auth_service.py       # 用户认证/注册业务逻辑
│   │       ├── chat.py               # LLM 对话 (DashScope qwen-turbo)
│   │       ├── order.py              # 订单 CRUD 逻辑
│   │       ├── simulation.py         # 蒙特卡洛仿真引擎
│   │       ├── risk_dashboard.py     # 风险指标聚合
│   │       ├── risk_graph.py         # 风险图谱构建
│   │       ├── predictive_sandbox.py # 时序种子数据 (T+0/24/48/72h)
│   │       └── ai/                   # RL 核心引擎
│   │           ├── logistics_env.py  # Gymnasium 环境
│   │           ├── train_agent.py    # PPO 训练/预测
│   │           ├── xrl_workflow.py   # LangGraph 可解释性工作流
│   │           └── db_init.py        # 图数据初始化
│   ├── init_orders.py                # 种子数据注入脚本
│   ├── orders.json                   # 订单种子数据 (96 条)
│   └── requirements.txt
│
├── src/                              # React 前端
│   ├── App.tsx                       # 根组件 (useState 驱动视图切换)
│   ├── main.tsx                      # Vite 入口
│   ├── services/                     # API 通信层
│   │   ├── api/
│   │   │   ├── axiosInstance.ts      # Axios 实例 + 拦截器
│   │   │   ├── httpClient.ts         # 重试/去重/加载状态封装
│   │   │   ├── loadingState.ts       # 全局加载计数器
│   │   │   └── types.ts             # ApiError / RequestOptions
│   │   ├── modules/                  # 按业务领域拆分的 API 模块
│   │   │   ├── auth.ts, chat.ts, order.ts
│   │   │   ├── optimizeApi.ts, simulationApi.ts
│   │   │   ├── predictiveSandboxApi.ts, riskDashboardApi.ts
│   │   └── index.ts                  # Barrel 导出
│   ├── components/
│   │   ├── ui/                       # 通用 UI 组件
│   │   │   ├── ChartCard.tsx, StatCard.tsx
│   │   │   ├── MapWidget.tsx, AlertPanel.tsx
│   │   ├── layout/                   # 布局组件
│   │   │   ├── Header.tsx, Sidebar.tsx
│   │   └── features/                 # 业务功能模块 (按视图划分)
│   │       ├── dashboard/            # 综合指挥控制台
│   │       │   └── Console/          # ConsoleModule, NodeGrid, SystemPulse
│   │       ├── routing/              # 路径优化 + 场景仿真
│   │       │   └── Scenarios/        # Normal, Stress, Policy 场景
│   │       ├── training/             # 模型训练监控
│   │       ├── carbon/               # 碳排放监测
│   │       ├── compliance/           # 风险预警 + 沙盘推演
│   │       ├── orders/               # 订单管理
│   │       ├── customer-service/     # AI 智能客服
│   │       ├── settings/             # 系统设置
│   │       └── auth/                 # 登录页 (Demo 模式未使用)
│   ├── types/                        # 全局类型定义
│   └── utils/                        # 工具函数
│
├── .env.development                  # VITE_API_BASE_URL=http://localhost:8010
└── docker-compose.yml
```

## 4. 架构分层

### 4.1 后端三层架构

```
┌─────────────────────────────────────────────┐
│  API 路由层 (app/api/)                       │
│  职责: 路由定义、参数校验、依赖注入              │
│  模式: @router.get/post + Depends(get_db)    │
├─────────────────────────────────────────────┤
│  业务服务层 (app/services/)                   │
│  职责: 业务逻辑、数据处理、AI 推理              │
│  模式: 纯函数, 接收 db:Session, 返回 dict/ORM  │
├─────────────────────────────────────────────┤
│  数据模型层 (app/models/)                     │
│  职责: 数据库表结构定义 (SQLAlchemy ORM)       │
│  模式: class Order(Base), Column 定义         │
└─────────────────────────────────────────────┘
```

### 4.2 前端组件层次

```
App.tsx (根组件, useState 管理 activeView)
├── Sidebar (导航菜单)
├── Header (顶部栏)
└── renderView() → switch(activeView)
    ├── DashboardView → ConsoleModule + StatCards
    ├── RouteOptimizationView → NormalView / StressView
    ├── TrainingOptimizationView
    ├── CarbonMonitoringView
    ├── ComplianceSecurityView → PredictiveSandbox
    ├── OrderManagementView
    ├── CustomerServiceView → AIChatPanel
    └── SettingsView
```

## 5. 数据流

```
[浏览器] → Vite Dev Server (:3000)
    → Axios httpClient.get('/api/orders/')
    → FastAPI (:8010/api/orders/)
    → order.py 路由 → order_service.get_orders(db)
    → SQLAlchemy → SQLite (app.db)
    → JSON Response → 前端渲染
```

### 5.1 HTTP 客户端架构

```
┌──────────────────────────────────┐
│  httpClient (HttpClient 类)       │
│  - 请求去重 (pendingRequests Map) │
│  - 自动重试 (可配置次数)           │
│  - 加载状态管理 (loadingStateManager)│
│  - buildAuthHeaders() 导出        │
├──────────────────────────────────┤
│  axiosInstance (Axios 实例)       │
│  - baseURL = VITE_API_BASE_URL/api│
│  - 请求拦截器: 注入 Bearer Token   │
│  - 响应拦截器: 401/404 日志记录    │
└──────────────────────────────────┘
特殊: AIChatPanel 使用原生 fetch() 处理 SSE 流式响应
```

## 6. 核心模块说明

| 模块 | 前端组件 | 后端路由 | 功能 |
|------|---------|---------|------|
| 综合指挥控制台 | DashboardView | — | 系统总览, PPO 收敛曲线, Agent 节点状态 |
| 路径优化 | RouteOptimizationView | /api/optimization/route | PPO 路径规划 + LLM 解释报告 |
| 极端压力测试 | StressView | /api/simulation/run | 蒙特卡洛仿真 (N=5000) |
| 碳排放监测 | CarbonMonitoringView | — | ESG 报告, 排放图表 |
| 风险预警 | ComplianceSecurityView | /api/predictive-sandbox | 时序沙盘推演 (T+0/24/48/72h) |
| 订单管理 | OrderManagementView | /api/orders/ | CRUD + 运力匹配 |
| AI 客服 | CustomerServiceView | /api/chat | SSE 流式对话 (DashScope qwen-turbo) |
| 模型训练 | TrainingOptimizationView | — | PPO 训练进度监控 |

## 7. 关键设计决策

### 7.1 视图路由: 状态驱动而非 URL 路由

App.tsx 使用 `useState('dashboard')` + `switch` 语句控制视图切换，不使用 React Router。适用于单页演示场景，缺点是无浏览器历史、无深链接。

### 7.2 鉴权: Demo 模式

所有后端路由已移除 `Depends(get_current_active_user)` 依赖。前端硬编码 `demo_admin_token_2026`，所有请求携带此 Token。鉴权系统完整保留在 `auth.py` / `auth_service.py` 中，可随时恢复。

### 7.3 样式: 深色 Glassmorphism

- 背景: `bg-[#05080F]` / `bg-[#0B121E]`
- 容器: `backdrop-blur-2xl`, `border-slate-800/60`, `rounded-3xl`
- 发光: `shadow-[0_0_20px_rgba(6,182,212,0.1)]`
- Tailwind 通过 CDN 加载 (index.html)，无 PostCSS 配置

### 7.4 路径别名

同时在 `vite.config.ts` 和 `tsconfig.json` 中定义:
- `@/` → `src/`
- `@services/` → `src/services/`
- `@components/` → `src/components/`
- `@features/` → `src/components/features/`

## 8. 运行方式

```bash
# 后端
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8010

# 前端
npm run dev     # Vite dev server on :3000

# Docker
docker-compose up  # backend:8010 + frontend:9010
```

## 9. 已知技术债

| 类别 | 问题 | 严重度 |
|------|------|--------|
| 死代码 | 22 个前端组件从未被导入 (compliance 14, customer-service 6, routing 2) | 中 |
| 死代码 | auth/ 目录 (LoginView) Demo 模式下未使用 | 低 |
| 死代码 | global.types.ts 定义 4 个类型但无任何组件引用 | 低 |
| 死代码 | utils/useLoading.ts 完整实现但从未导入 | 低 |
| 死代码 | backend services/auth.py 的 get_current_user 在 Demo 模式下是死代码 | 低 |
| 代码重复 | compliance/types.ts 与 riskDashboardApi.ts 重复定义 3 个类型 | 中 |
| 代码重复 | auth 逻辑分在 auth.py + auth_service.py 两个文件 | 低 |
| 类型安全 | ConsoleModule 的 QuickStat / ControlToggle 使用 `any` props | 中 |
| 类型安全 | Header.tsx 使用 `useState<any[]>` | 低 |
| 无错误边界 | 无 ErrorBoundary, 任一组件抛错将导致白屏 | 高 |
| 无状态管理 | stores/ 目录为空, 全靠 useState + prop drilling | 中 |
| Stub 服务 | match_capacity / analyze_capacity / get_carbon_emission 返回硬编码数据 | 低 |
| 无模型关系 | 零 SQLAlchemy relationship() 声明, 无外键约束 | 中 |
| 孤立脚本 | init_orders.py / seed_risk_data.py 未集成到应用启动流程 | 低 |
| 数据类型 | risk 模型用 String 存储时间而非 DateTime | 低 |
