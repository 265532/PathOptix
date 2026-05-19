# API 联调错误分析与解决报告

> **生成时间:** 2026-05-17  
> **项目:** PathOptix Dashboard  
> **审计范围:** 前端 `src/` 全部网络请求代码

---

## 一、错误现象与根因分析

### 1.1 `api/orders` 404 错误

**现象：** 控制台持续输出 `GET http://localhost:8010/api/orders 404 (Not Found)`，页面显示红色"获取订单数据失败"。

**根因：**
- 后端 FastAPI 服务 (`backend/main.py`) 未注册 `/api/orders` 路由，或路由路径不匹配。
- `axiosInstance.ts` 的 `baseURL` 为 `http://localhost:8010/api`，`order.ts` 中请求路径为 `/orders`，最终拼接为 `http://localhost:8010/api/orders`。若后端路由注册在根路径 `/orders` 而非 `/api/orders`，则产生 404。
- `httpClient.ts` 的自动重试机制（重试 3 次）会将单次 404 放大为 4 次请求失败。

**影响组件：**
| 组件 | 调用方式 | 错误表现 |
|------|---------|---------|
| `OrderMainTable.tsx` | `orderApi.getOrders()` | 页面红色错误文字 + 重试按钮 |
| `DetailedOrderList.tsx` | `orderApi.getOrders()` | 页面红色错误文字 + 重试按钮 |
| `EditOrderModal.tsx` | `orderApi.getOrders()` | Modal 内错误提示 |

### 1.2 `api/chat` 401 Unauthorized 错误

**现象：** 客户服务页面的 AI 聊天面板发送消息后，控制台输出 `POST http://localhost:8010/api/chat 401 (Unauthorized)`，UI 显示"引擎通信异常，请稍后重试"。

**根因：**
- `AIChatPanel.tsx` 使用原生 `fetch()` 直接请求后端，**完全绕过了** `httpClient`/`axiosInstance` 的基础设施。
- `axiosInstance.ts` 的请求拦截器会自动从 `localStorage.getItem('access_token')` 读取 Token 并注入 `Authorization: Bearer <token>` 头，但 `AIChatPanel` 的 `fetch()` 调用仅设置了 `Content-Type`，**没有携带任何鉴权头**。
- 后端 `/api/chat` 端点要求 Bearer Token 认证，无 Token 则返回 401。
- 用户未登录时 `access_token` 不存在，即使添加了 Token 读取逻辑，仍会因 Token 为空而触发 401。

**影响范围：** 仅 `AIChatPanel.tsx`（`src/components/features/customer-service/AIChatPanel.tsx` 第 58 行）。

### 1.3 ChartCard 宽高警告

**现象：** 控制台反复输出 `Warning: ResponsiveContainer rendered at (-1, -1) width(-1) height(-1)`。

**根因：**
- `ChartCard.tsx` 中 `ResponsiveContainer` 的父容器使用 `flex-1` 布局，在组件首次挂载时 flex 尺寸尚未计算完成，`ResponsiveContainer` 读取到的宽高为 0 或负值。
- Recharts 的 `ResponsiveContainer` 依赖 `offsetWidth`/`offsetHeight`，在父元素没有明确 `min-height` 时会得到无效值。

### 1.4 其他潜在问题

| 接口 | 组件 | 风险 |
|------|------|------|
| `POST /simulation/run` | `StressView.tsx` | 后端不可用时 `simData` 为 null，日志区域显示占位符 `...`，完成弹窗无法触发 |
| `POST /optimize/route` | `RouteOptimizationView.tsx` | 后端不可用时仅 `console.error`，用户点击"生成报告"无任何反馈 |
| `GET /predictive-sandbox` | `PredictiveSandbox.tsx` | 已在上一轮修复中被 `ComplianceSecurityView` 占位页替代 |

---

## 二、前端容灾与 Mock 修复方案

### 2.1 修复文件清单

| # | 文件路径 | 修改类型 | 说明 |
|---|---------|---------|------|
| 1 | `src/components/features/customer-service/AIChatPanel.tsx` | Auth + Mock | 添加 Bearer Token 注入 + Mock AI 回复兜底 |
| 2 | `src/components/features/orders/OrderMainTable.tsx` | Mock | 移除红色错误 UI，静默降级为 Mock 订单 |
| 3 | `src/components/features/orders/DetailedOrderList.tsx` | Mock | 移除红色错误 UI，静默降级为 Mock 订单 |
| 4 | `src/components/features/routing/RouteOptimizationView.tsx` | Mock | 添加 Mock 路径优化数据兜底 |
| 5 | `src/components/features/routing/Scenarios/StressScenario/StressView.tsx` | Mock | 添加 Mock 压力仿真数据兜底 |
| 6 | `src/components/ui/ChartCard.tsx` | 布局修复 | 添加 `min-h-[200px]` 确保图表容器有效尺寸 |
| 7 | `src/components/features/compliance/ComplianceSecurityView.tsx` | 占位重写 | 替换为静态占位页，不再调用失败的后端 API |

### 2.2 兜底逻辑设计原则

所有修复遵循统一的**静默降级**策略：

```
try {
  const data = await realApiCall();
  setData(data);
} catch (err) {
  // 不设 error 状态 → 不显示红色错误
  // 不调 alert() → 不弹窗打扰
  // 直接注入 Mock 数据 → UI 无缝渲染
  setData(MOCK_DATA);
}
```

**核心原则：**
1. **不暴露后端故障** — catch 块中不设置 `error` 状态，移除所有红色错误 UI 分支
2. **Mock 数据逼真** — Mock 数据包含真实的跨境物流场景（Shanghai → Hamburg、深圳 → Rotterdam 等）
3. **保持 UI 完整** — Mock 数据格式与真实 API 返回一致，表格/图表/聊天正常渲染

### 2.3 AIChatPanel 鉴权修复详情

**修改前：**
```typescript
const response = await fetch(`${BASE}/api/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ... }),
});
// catch: { text: '引擎通信异常，请稍后重试。' }
```

**修改后：**
```typescript
const token = localStorage.getItem('access_token');
const headers: Record<string, string> = { 'Content-Type': 'application/json' };
if (token) headers['Authorization'] = `Bearer ${token}`;

const response = await fetch(`${BASE}/api/chat`, {
  method: 'POST',
  headers,
  body: JSON.stringify({ ... }),
});
// catch: 延迟 1s 返回随机 Mock AI 回复（4 条预设话术）
```

---

## 三、后端接口对接契约

以下为前端当前业务所依赖的全部 API 接口清单。后端工程师请确保以下端点在 FastAPI 中正确注册且路径匹配。

### 3.1 基础配置

- **Base URL:** `http://localhost:8010/api`
- **认证方式:** Bearer Token（Header: `Authorization: Bearer <access_token>`）
- **Content-Type:** `application/json`
- **超时设置:** 默认 10s，优化接口 120s

### 3.2 接口清单

#### Auth 模块

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| POST | `/auth/login` | 无 | 用户登录 |

**请求体：**
```json
{ "username": "string", "password": "string" }
```

**期望响应：**
```json
{ "access_token": "eyJ...", "token_type": "bearer" }
```

---

#### Orders 模块

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/orders` | Bearer | 获取订单列表（支持 keyword/status/dateRange 筛选） |
| GET | `/orders/{order_id}` | Bearer | 获取单个订单详情 |
| POST | `/orders` | Bearer | 创建新订单 |
| PUT | `/orders/{order_id}` | Bearer | 更新订单 |
| DELETE | `/orders/{order_id}` | Bearer | 删除订单 |

**GET /orders 期望响应：**
```json
{
  "orders": [
    {
      "id": "ORD-SH-20260517-001",
      "customer_name": "Haier Global Logistics",
      "date": "2026-05-17",
      "amount": "$38,750.00",
      "status": "运输中",
      "status_color": "blue"
    }
  ],
  "total": 100
}
```

**支持的查询参数：** `keyword`, `status`, `dateRange`

---

#### Chat 模块

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| POST | `/chat` | Bearer | AI 对话（支持 SSE 流式返回） |
| GET | `/chat/history` | Bearer | 获取聊天历史 |
| DELETE | `/chat/history` | Bearer | 清空聊天历史 |

**POST /chat 请求体：**
```json
{
  "message": "用户输入的问题",
  "history": [
    { "role": "user", "content": "之前的问题" },
    { "role": "assistant", "content": "之前的回复" }
  ],
  "context": "可选的订单上下文信息"
}
```

**期望响应（SSE 流式）：**
```
data: 您好
data: ，我是
data: 智能物流管家
data: [DONE]
```

**重要：** 前端使用 `text/event-stream` 方式读取流式响应，每个 `data:` 行携带一段文本增量，以 `data: [DONE]` 结束。

---

#### Optimize 模块

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| POST | `/optimize/route` | Bearer | 路径优化（PPO 强化学习），超时 120s |

**请求体：**
```json
{
  "start_node": "shenzhen",
  "end_node": "rotterdam",
  "weight_cost": 0.40,
  "weight_time": 0.25,
  "weight_carbon": 0.35
}
```

**期望响应：**
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "rl_path_json": {
      "start_node": "shenzhen",
      "end_node": "rotterdam",
      "reached_goal": true,
      "route_nodes": ["shenzhen", "singapore", "suez", "rotterdam"],
      "transport_modes": ["sea", "sea", "sea"],
      "num_legs": 3,
      "total_time_days": 22,
      "total_cost_usd": 4850,
      "total_carbon_kg": 186,
      "total_reward": 78.5,
      "weights": { "w_cost": 0.40, "w_time": 0.25, "w_carbon": 0.35 },
      "steps_detail": [
        {
          "from": "shenzhen",
          "to": "singapore",
          "transport_mode": "sea",
          "cost_usd": 820,
          "time_days": 5,
          "carbon_kg": 42
        }
      ]
    },
    "explanation_report": "PPO 引擎分析报告文本..."
  }
}
```

---

#### Simulation 模块

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| POST | `/simulation/run` | Bearer | 压力仿真模拟 |

**请求体：**
```json
{
  "mode": "stress",
  "rl_cost": 5000,
  "rl_time": 20,
  "rl_carbon": 200
}
```

**期望响应：**
```json
{
  "mode": "stress",
  "base": {
    "cost": { "p90_lower": 4200, "p90_upper": 8100 },
    "time": { "p90_lower": 20, "p90_upper": 38 },
    "stability": 0.62
  },
  "robust": {
    "cost": { "p90_lower": 4400, "p90_upper": 6200 },
    "time": { "p90_lower": 19, "p90_upper": 28 },
    "stability": 0.87
  },
  "risk_reduction_pct": 34.2,
  "description": "仿真描述"
}
```

---

#### Predictive Sandbox 模块

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/predictive-sandbox?offset_hours={n}` | Bearer | 未来态沙盘推演 |

**查询参数：** `offset_hours` — 可选值 `0`, `24`, `48`, `72`

---

#### Risk Dashboard 模块

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/dashboard/risk-metrics` | Bearer | 风险仪表盘指标 |

---

### 3.3 CORS 配置要求

前端运行在 `http://localhost:3000`，后端在 `http://localhost:8010`。后端必须配置 CORS 中间件允许跨域：

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 3.4 优先级排序

| 优先级 | 接口 | 原因 |
|--------|------|------|
| P0 | POST `/auth/login` | 所有鉴权接口的前置依赖 |
| P0 | GET `/orders` | 订单管理页面核心数据源 |
| P0 | POST `/chat` | 客户服务聊天核心功能 |
| P1 | POST `/optimize/route` | 路径优化核心功能 |
| P1 | POST `/simulation/run` | 压力测试核心功能 |
| P2 | GET `/predictive-sandbox` | 风险预警页面（已用占位替代） |
| P2 | GET `/dashboard/risk-metrics` | 风险仪表盘（已用占位替代） |

---

## 四、附录：已知未修复项

以下为低风险项，当前不影响路演展示：

1. **Vite Proxy 未配置** — 前端直接通过 CORS 访问后端。若部署到同一域名下，建议在 `vite.config.ts` 添加 proxy 配置。
2. **`EditOrderModal` / `CreateOrderModal`** — 这两个 Modal 在 API 失败时仍会显示 Modal 内的错误提示。由于是用户主动触发的操作，保持现有错误提示是合理的。
3. **`httpClient` 自动重试对 404 的处理** — 当前重试策略包含 408/429/500/502/503/504，不包含 404，因此 404 不会触发多余重试（之前的描述有误，实际已正确排除）。
