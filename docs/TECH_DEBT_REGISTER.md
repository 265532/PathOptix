# PathOptix Dashboard 前端技术债务清单

**项目**: pathoptix-dashboard-replicant (ljy-web)
**最后更新**: 2026-05-09
**维护人**: Frontend Tech Lead
**评审周期**: 每月一次

---

## 一、债务总览

| 严重程度 | 数量 | 状态 |
|----------|------|------|
| 🔴 Critical | 2 | 待修复 |
| 🟠 High | 3 | 待修复 |
| 🟡 Medium | 4 | 部分修复 |
| 🔵 Low | 3 | 待评估 |
| **合计** | **12** | - |

---

## 二、Critical 级别

### TD-01: 认证系统伪JWT实现

- **位置**: `backend/app/services/auth.py`
- **发现日期**: 2026-05-09
- **影响范围**: 全局认证安全
- **描述**:
  - `create_access_token()` 直接返回明文用户名作为Token
  - `decode_access_token()` 无任何签名验证
  - Token无过期时间、无加密、无签名
  - 任何人可伪造Token访问系统
- **修复方案**: 使用 `python-jose` 实现标准JWT（已在依赖中但未使用）
- **预计工时**: 16小时
- **关联文档**: [PROJECT_AUDIT_REPORT.md](./PROJECT_AUDIT_REPORT.md) S-01

### TD-02: 硬编码SECRET_KEY默认值

- **位置**: `backend/app/config.py`
- **发现日期**: 2026-05-09
- **影响范围**: 全局安全
- **描述**:
  - `SECRET_KEY: str = "your-secret-key-here"` 使用公开默认值
  - 即使修复TD-01，此密钥也可被轻易破解
  - 生产环境可能未更改此配置
- **修复方案**: 强制从环境变量读取，未配置时拒绝启动
- **预计工时**: 4小时
- **关联文档**: [PROJECT_AUDIT_REPORT.md](./PROJECT_AUDIT_REPORT.md) S-02

---

## 三、High 级别

### TD-03: LoginView硬编码Mock登录后门

- **位置**: `src/components/features/auth/LoginView.tsx:47-49`
- **发现日期**: 2026-05-09
- **影响范围**: 认证安全
- **描述**:
  ```typescript
  if (username === 'lorry' && password === '123456') {
    localStorage.setItem('access_token', 'mock_token');
    onLogin();
  }
  ```
  - 硬编码的用户名密码组合作为后门
  - 任何知道此凭据的人可绕过正常认证
  - mock_token不是有效的JWT
- **修复方案**: 移除此后门逻辑，依赖后端认证
- **预计工时**: 1小时
- **前置条件**: TD-01修复完成后
- **状态**: 🔴 待修复（需后端JWT先就绪）

### TD-04: TypeScript严格模式未完全启用

- **位置**: `tsconfig.json`
- **发现日期**: 2026-05-09
- **影响范围**: 代码类型安全
- **描述**:
  - `strict: true` 未启用
  - `noImplicitAny` 未启用
  - `noUnusedLocals` / `noUnusedParameters` 未启用
  - 当前代码中存在约45处 `any` 类型使用
- **修复方案**: 逐步启用严格选项，先从 `noImplicitAny` 开始
- **预计工时**: 20小时（含修复所有类型错误）
- **状态**: 🔴 待修复

### TD-05: CORS配置过于宽松

- **位置**: `backend/main.py`
- **发现日期**: 2026-05-09
- **影响范围**: API安全
- **描述**:
  - `allow_methods=["*"]` 允许所有HTTP方法
  - `allow_headers=["*"]` 允许所有请求头
  - 无来源限制，任何域名可跨域访问
- **修复方案**: 明确指定允许的方法、头和来源域名
- **预计工时**: 4小时
- **关联文档**: [PROJECT_AUDIT_REPORT.md](./PROJECT_AUDIT_REPORT.md) S-04

---

## 四、Medium 级别

### TD-06: 测试覆盖率严重不足

- **位置**: `src/services/__tests__/`
- **发现日期**: 2026-05-09
- **影响范围**: 代码质量保障
- **描述**:
  - 当前仅有2个测试文件（auth.test.ts, httpClient.test.ts）
  - 估计覆盖率 < 5%
  - 无组件测试、无集成测试、无E2E测试
- **修复方案**: 分阶段补充测试，目标80%+
- **预计工时**: 80小时（分3个月完成）
- **状态**: 🟡 部分修复（框架已搭建，用例待补充）

### TD-07: 大量Mock数据未替换为真实API

- **位置**: 17个文件
- **发现日期**: 2026-05-09
- **影响范围**: 功能完整性
- **描述**:
  - 订单管理、客户服务、仪表板等模块使用硬编码假数据
  - 产品不可用于生产环境
  - 涉及文件：CreateOrderModal, EditOrderModal, DetailedOrderList, AIChatPanel, FeedbackForm, AIResponsePanel, StatCard, ChartCard, TrainingLogModal, ComplianceSecurityView, EmissionChart 等
- **修复方案**: 逐步替换为真实API调用
- **预计工时**: 120小时（分模块完成）
- **状态**: 🔴 待修复

### TD-08: 缺少代码质量工具链

- **位置**: 项目根目录
- **发现日期**: 2026-05-09
- **影响范围**: 代码一致性
- **描述**:
  - 无 ESLint 配置
  - 无 Prettier 配置
  - 无 Husky / lint-staged Git钩子
  - 无 Commitlint 提交规范检查
- **修复方案**: 安装并配置完整的代码质量工具链
- **预计工时**: 12小时
- **状态**: 🔴 待修复

### TD-09: 无路由管理库

- **位置**: `src/App.tsx`
- **发现日期**: 2026-05-09
- **影响范围**: 用户体验、可维护性
- **描述**:
  - 使用 switch-case 手动路由
  - 无URL历史记录、无深度链接
  - 无路由守卫、无懒加载
- **修复方案**: 集成 React Router v6
- **预计工时**: 24小时
- **状态**: 🔴 待修复

---

## 五、Low 级别

### TD-10: 无全局状态管理方案

- **位置**: 全局
- **发现日期**: 2026-05-09
- **影响范围**: 组件间通信
- **描述**:
  - 43个文件中209次 useState/useEffect 调用
  - 状态分散在各组件中
  - Props drilling 严重
- **修复方案**: 引入 Zustand 或 Redux Toolkit
- **预计工时**: 20小时
- **状态**: 🔵 评估中

### TD-11: 生产环境API地址暴露

- **位置**: `.env.production`, `ENV_CONFIG.md`, `src/services/api/axiosInstance.ts`
- **发现日期**: 2026-05-09
- **影响范围**: 信息安全
- **描述**:
  - 默认API地址硬编码为 `http://81.71.129.36:8010`
  - 生产IP暴露在代码库中
- **修复方案**: 使用相对路径或环境变量注入
- **预计工时**: 2小时
- **状态**: 🔵 评估中

### TD-12: 后端依赖版本过旧

- **位置**: `backend/requirements.txt`
- **发现日期**: 2026-05-09
- **影响范围**: 安全性、兼容性
- **描述**:
  - `langchain 0.1.20` 已弃用，应迁移到 `langchain-core`
  - `langchain-openai 0.0.8` 版本过旧
  - `fastapi 0.104.1` 可升级到 0.115.x
  - `openai 1.12.0` 可升级
- **修复方案**: 评估并升级依赖版本
- **预计工时**: 8小时
- **状态**: 🔵 评估中

---

## 六、技术决策记录

### 决策记录格式

| 编号 | 日期 | 决策内容 | 理由 | 影响 |
|------|------|----------|------|------|
| D-01 | 2026-05-09 | 暂不引入i18n | 当前仅面向国内用户 | 未来扩展需重构文本 |
| D-02 | 2026-05-09 | 使用npm而非yarn/pnpm | 团队习惯统一 | 锁定包管理器 |
| D-03 | 2026-05-09 | 优先Tailwind而非CSS Modules | 开发效率高、一致性好 | 样式与组件耦合 |
| D-04 | 2026-05-09 | 强制函数式组件 | 现代React最佳实践 | 不支持类组件模式 |
| D-05 | 2026-05-09 | 强制路径别名 | 避免深层相对路径 | 需配置vite别名 |

### 技术选型裁决

| 争议场景 | 方案A | 方案B | 最终裁决 | 理由 |
|----------|-------|-------|----------|------|
| ESLint vs Prettier | ESLint负责质量 | Prettier负责格式 | 同时使用 | eslint-config-prettier消除冲突，各司其职 |
| TypeScript strict vs 宽松 | 启用strict | 保持现状 | 逐步启用strict | 先从noImplicitAny开始，渐进式收紧 |
| 函数组件 vs 类组件 | 全部函数式 | 特殊情况用类 | 强制函数式组件 | React官方推荐，Hooks生态更完善 |
| Hooks vs Class State | Hooks | setState | 强制Hooks | 逻辑复用更灵活，代码更简洁 |
| Tailwind vs CSS Modules | 纯Tailwind | 混合使用 | 优先Tailwind | 开发效率高，复杂动画可用全局CSS |
| 路径别名 vs 相对路径 | 别名 | 相对路径 | 强制别名 | 避免深层嵌套，可读性更好 |

---

## 七、修复优先级与时间线

```
第1周  ┃ 🔴 TD-01, TD-02, TD-05  安全问题紧急修复
第2周  ┃ 🔴 TD-03, TD-04          Mock后门移除 + TS严格模式
第3-4周 ┃ 🟠 TD-08, TD-09         工具链搭建 + 路由重构
第5-8周 ┃ 🟡 TD-06, TD-07         测试补充 + Mock数据替换
第9-12周 ┃ 🔵 TD-10, TD-11, TD-12  状态管理 + 依赖升级
```

---

## 八、变更日志

| 日期 | 变更内容 |
|------|----------|
| 2026-05-09 | 初始版本，从AI开发规约中抽取技术债内容独立维护 |
| 2026-05-09 | TD-08部分修复：清理了13处console.log/error语句 |

---

**本文档为活文档**，随项目开发持续更新。修复完成的项目将标记为 ✅ 并移至历史记录。
