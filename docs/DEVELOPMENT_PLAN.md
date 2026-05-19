# PathOptix Dashboard 结构化开发计划

**基于审查报告生成日期**: 2026-05-09
**计划周期**: 12周（3个月）
**目标**: 将项目从当前状态（评分4.4/10）提升至生产就绪状态（评分8.0+/10）

---

## 一、开发阶段总览

```
阶段1: 安全紧急修复 (第1-2周)     ████████████░░░░  P0优先级
阶段2: 基础设施建设 (第3-4周)     ████████████░░░░  P0-P1优先级
阶段3: 架构重构 (第5-7周)         ██████████░░░░░░  P1优先级
阶段4: 功能完善 (第8-10周)        █████████░░░░░░░  P2优先级
阶段5: 测试与优化 (第11-12周)     ████████░░░░░░░░  P2-P3优先级
```

---

## 二、详细任务分解与时间规划

### 🔴 阶段1: 安全紧急修复（第1-2周）
**目标**: 消除所有Critical和High级别安全漏洞
**优先级**: P0 - 阻塞性问题

#### 第1周任务

##### 任务 S1-01: 实现标准JWT认证系统 [P0]
- **预估工时**: 16小时
- **负责人**: 后端开发工程师
- **任务描述**:
  - [ ] 使用python-jose库实现真正的JWT Token生成
  - [ ] 实现Token签名和验证机制
  - [ ] 配置Token过期时间（Access Token: 30分钟, Refresh Token: 7天）
  - [ ] 实现Token刷新机制
  - [ ] 添加黑名单机制支持Token注销
- **验收标准**:
  - ✅ Token包含有效签名，无法伪造
  - ✅ 过期Token自动失效
  - ✅ 可通过在线JWT验证工具验证
- **涉及文件**:
  - `backend/app/services/auth.py` - 重写token相关函数
  - `backend/app/config.py` - 添加JWT配置项
  - `backend/app/api/auth.py` - 更新登录/注册逻辑

##### 任务 S1-02: 强化密钥管理 [P0]
- **预估工时**: 4小时
- **负责人**: DevOps工程师 + 后端开发
- **任务描述**:
  - [ ] 移除硬编码的SECRET_KEY默认值
  - [ ] 启动时检查SECRET_KEY是否配置
  - [ ] 若未配置则拒绝启动并提示错误
  - [ ] 生成强密钥工具脚本
  - [ ] 更新.env.example文档说明
- **验收标准**:
  - ✅ 未配置SECRET_KEY时应用无法启动
  - ✅ 提供密钥生成命令：`python -c "import secrets; print(secrets.token_urlsafe(32))"`
- **涉及文件**:
  - `backend/app/config.py`
  - `backend/.env.example`
  - 新建 `scripts/generate_secret_key.py`

##### 任务 S1-03: 收紧CORS和安全头配置 [P0]
- **预估工时**: 6小时
- **负责人**: 后端开发工程师
- **任务描述**:
  - [ ] 限制CORS允许的来源为实际域名
  - [ ] 限制允许的HTTP方法（GET, POST, PUT, DELETE, PATCH）
  - [ ] 限制允许的请求头
  - [ ] 添加安全响应头中间件：
    - X-Content-Type-Options: nosniff
    - X-Frame-Options: DENY
    - X-XSS-Protection: 1; mode=block
    - Strict-Transport-Security
    - Content-Security-Policy
- **验收标准**:
  - ✅ 仅允许配置的域名跨域访问
  - ✅ 安全头在所有响应中正确设置
  - ✅ 通过安全扫描工具检测
- **涉及文件**:
  - `backend/main.py`
  - 新建 `middleware/security_headers.py`

##### 任务 S1-04: 密码策略优化 [P1]
- **预估工时**: 4小时
- **负责人**: 后端开发工程师
- **任务描述**:
  - [ ] 移除密码截断限制或提高至256字符
  - [ ] 实现密码强度验证（最少8位，含大小写字母+数字+特殊字符）
  - [ ] 添加密码哈希算法升级支持（bcrypt -> argon2）
  - [ ] 实现密码历史记录（防止重用最近5个密码）
- **验收标准**:
  - ✅ 支持长密码（>72字符）不被截断
  - ✅ 弱密码被拒绝
  - ✅ 密码哈希使用现代算法
- **涉及文件**:
  - `backend/app/services/auth.py`
  - `backend/app/schemas/user.py`

#### 第2周任务

##### 任务 S1-05: 前端认证流程安全加固 [P0]
- **预估工时**: 8小时
- **负责人**: 前端开发工程师
- **任务描述**:
  - [ ] 实现Token自动刷新机制
  - [ ] 敏感操作添加二次确认
  - [ ] 登录状态加密存储（考虑HttpOnly Cookie替代localStorage）
  - [ ] 添加会话超时自动登出
  - [ ] 防止XSS攻击（输入过滤、输出编码）
- **验收标准**:
  - ✅ Token即将过期时自动刷新
  - ✅ 无操作30分钟后自动登出
  - ✅ 敏感信息不在localStorage明文存储（可选方案）
- **涉及文件**:
  - `src/services/api/axiosInstance.ts`
  - `src/services/modules/auth.ts`
  - `App.tsx`

##### 任务 S1-06: 安全测试与审计 [P0]
- **预估工时**: 8小时
- **负责人**: 安全工程师 / QA团队
- **任务描述**:
  - [ ] 使用OWASP ZAP进行自动化安全扫描
  - [ ] 手动渗透测试（SQL注入、XSS、CSRF）
  - [ ] 依赖漏洞扫描（npm audit, pip-audit）
  - [ ] 修复发现的所有High及以上漏洞
  - [ ] 生成安全评估报告
- **验收标准**:
  - ✅ OWASP Top 10漏洞全部修复
  - ✅ 无已知CVE漏洞
  - ✅ 通过基础安全基线测试
- **交付物**:
  - 安全评估报告文档
  - 漏洞修复记录

---

### 🟠 阶段2: 基础设施建设（第3-4周）
**目标**: 建立代码质量保障体系和开发规范
**优先级**: P0-P1

#### 第3周任务

##### 任务 I2-01: TypeScript严格模式迁移 [P1]
- **预估工时**: 20小时
- **负责人**: 全体前端开发人员
- **任务描述**:
  - [ ] 在tsconfig.json中启用strict模式
  - [ ] 逐文件修复类型错误（预计200+处）
  - [ ] 消除所有`any`类型使用（45处）
  - [ ] 为组件定义完整的Props接口
  - [ ] 添加全局类型定义文件
- **分步执行计划**:
  ```
  Day 1-2: 启用strict模式，修复编译错误
  Day 3-4: 重构核心组件类型定义
  Day 5: 消除剩余any类型，代码review
  ```
- **验收标准**:
  - ✅ TypeScript编译无错误无警告
  - ✅ any类型使用 < 5处（特殊情况需注释说明）
  - ✅ 所有组件有明确类型定义
- **涉及文件**:
  - `tsconfig.json`
  - 所有`.tsx/.ts`文件（~90个文件）

##### 任务 I2-02: 代码质量工具链搭建 [P1]
- **预估工时**: 12小时
- **负责人**: Tech Lead + DevOps
- **任务描述**:
  ```bash
  # 安装必要的devDependencies
  npm install --save-dev eslint prettier husky lint-staged \
    @typescript-eslint/eslint-plugin @typescript-eslint/parser \
    eslint-config-prettier eslint-plugin-react-hooks \
    eslint-plugin-react @typescript-eslint/eslint-plugin
  
  # 配置文件创建
  - .eslintrc.js          # ESLint规则配置
  - .prettierrc           # Prettier格式化规则
  - .husky/pre-commit     # Git提交钩子
  - .lintstagedrc.json    # 暂存区文件检查
  ```
  - [ ] 配置ESLint规则（推荐Airbnb或Standard风格）
  - [ ] 配置Prettier格式化规则
  - [ ] 设置Husky pre-commit钩子
  - [ ] 配置lint-staged自动修复
  - [ ] 添加VSCode工作区设置（.vscode/settings.json）
- **验收标准**:
  - ✅ `npm run lint`可运行且无错误
  - ✅ `npm run format`可自动格式化代码
  - ✅ Git提交前自动运行lint和format
  - ✅ VSCode保存时自动格式化
- **交付物**:
  - ESLint配置文件
  - Prettier配置文件
  - 开发环境配置文档

##### 任务 I2-03: 项目目录结构重组 [P1]
- **预估工时**: 16小时
- **负责人**: 架构师 + 前端Team Lead
- **任务描述**:
  - [ ] 设计新的目录结构（参考上文建议）
  - [ ] 迁移组件到新位置
  - [ ] 更新所有导入路径
  - [ ] 配置路径别名（@components, @features等）
  - [ ] 清理重复组件（DashboardView等）
  - [ ] 创建index.ts barrel导出文件
- **新结构示例**:
  ```
  src/
  ├── components/
  │   ├── ui/              # Button, Input, Modal等基础组件
  │   ├── layout/          # Sidebar, Header, Layout
  │   └── shared/          # ChartCard, StatCard等共享组件
  ├── features/
  │   ├── auth/            # 认证功能模块
  │   ├── dashboard/       # 仪表板
  │   ├── orders/          # 订单管理
  │   ├── routing/         # 路线优化
  │   ├── training/        # 训练优化
  │   ├── carbon/          # 碳监测
  │   ├── compliance/      # 合规安全
  │   ├── customer/        # 客户服务
  │   └── settings/        # 系统设置
  ├── services/
  ├── stores/
  ├── hooks/
  ├── types/
  └── utils/
  ```
- **验收标准**:
  - ✅ 目录结构清晰，符合功能模块划分
  - ✅ 无循环依赖
  - ✅ 导入路径简洁易读
- **风险提示**:
  - ⚠️ 大规模重构可能引入回归bug
  - ⚠️ 必须配合完整测试覆盖

#### 第4周任务

##### 任务 I2-04: 核心测试框架搭建 [P1]
- **预估工时**: 20小时
- **负责人**: QA Engineer + 前端开发
- **任务描述**:
  ```bash
  # 安装测试依赖
  npm install --save-dev @testing-library/react \
    @testing-library/jest-dom @testing-library/user-event \
    jest-environment-jsdom identity-obj-proxy
  
  # 配置Jest for React Testing Library
  - jest.config.ts 更新
  - setupTests.ts 创建（全局测试配置）
  ```
  - [ ] 配置Jest + React Testing Library环境
  - [ ] 编写测试工具函数（renderWithProviders等）
  - [ ] 创建Mock数据工厂（generateMockOrder等）
  - [ ] 为认证模块编写完整单元测试
  - [ ] 为HTTP客户端编写测试
  - [ ] 配置测试覆盖率报告
- **测试目标**:
  ```
  当前覆盖率: ~5%
  第4周末目标: 核心服务层 >70%
  ```
- **验收标准**:
  - ✅ `npm run test`可正常运行
  - ✅ `npm run test:coverage`生成覆盖率报告
  - ✅ 认证模块覆盖率 >90%
  - ✅ HTTP客户端覆盖率 >80%
- **新增文件**:
  - `src/test-utils/` - 测试工具函数
  - `src/__mocks__/` - Mock数据
  - `src/services/__tests__/` - 扩展测试

##### 任务 I2-05: CI/CD流水线搭建 [P2]
- **预估工时**: 16小时
- **负责人**: DevOps Engineer
- **任务描述**:
  - [ ] 选择CI平台（GitHub Actions / GitLab CI / Jenkins）
  - [ ] 创建CI配置文件：
    ```yaml
    # .github/workflows/ci.yml 示例
    name: CI Pipeline
    on: [push, pull_request]
    jobs:
      test:
        runs-on: ubuntu-latest
        steps:
          - checkout
          - setup Node.js 20
          - npm install
          - npm run lint
          - npm run typecheck
          - npm run test:coverage
          - Upload coverage to Codecov
      build:
        needs: test
        steps:
          - npm run build
          - Upload artifact
      security:
        - npm audit
        - pip-audit (后端)
    ```
  - [ ] 配置自动代码质量门禁
  - [ ] 集成SonarQube（可选）
  - [ ] 配置自动部署到测试环境
- **验收标准**:
  - ✅ Push代码自动触发CI
  - ✅ Lint/Typecheck/Test失败阻止合并
  - ✅ 测试覆盖率低于阈值报警
  - ✅ 主分支自动构建Docker镜像
- **交付物**:
  - CI/CD配置文件
  - 部署脚本
  - 运维手册更新

---

### 🔵 阶段3: 架构重构（第5-7周）
**目标**: 解决架构层面的技术债务
**优先级**: P1

#### 第5周任务

##### 任务 A3-01: 路由系统升级 [P1]
- **预估工时**: 24小时
- **负责人**: 前端架构师 + 2名前端开发
- **任务描述**:
  ```bash
  npm install react-router-dom@6
  ```
  - [ ] 安装React Router v6
  - [ ] 设计路由结构：
    ```typescript
    // src/router/index.tsx
    const router = createBrowserRouter([
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/',
        element: <ProtectedLayout />,  // 需要认证
        children: [
          { index: true, element: <Navigate to="/dashboard" /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'orders', element: <OrdersPage /> },
          { path: 'orders/:id', element: <OrderDetailPage /> },
          { path: 'routing', element: <RoutingPage /> },
          { path: 'training', element: <TrainingPage /> },
          { path: 'carbon', element: <CarbonPage /> },
          { path: 'compliance', element: <CompliancePage /> },
          { path: 'customer-service', element: <CustomerServicePage /> },
          { path: 'settings/*', element: <SettingsPage /> },
        ],
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ]);
    ```
  - [ ] 实现路由守卫（Auth Guard）
  - [ ] 实现懒加载（React.lazy + Suspense）
  - [ ] 迁移现有页面组件
  - [ ] 更新导航链接为Link组件
- **性能优化点**:
  ```typescript
  // 路由级代码分割示例
  const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'));
  const OrdersPage = lazy(() => import('@/features/orders/OrdersPage'));
  
  // 预加载关键路由
  import('@/features/dashboard'); // 预加载仪表板
  ```
- **验收标准**:
  - ✅ URL可直接访问各页面（深度链接）
  - ✅ 浏览器前进后退正常工作
  - ✅ 未认证用户自动跳转登录页
  - ✅ 首屏加载体积减少30%+
- **涉及文件**:
  - 新建 `src/router/`
  - 修改 `App.tsx`
  - 修改 `components/Sidebar.tsx`

##### 任务 A3-02: 状态管理方案引入 [P1]
- **预估工时**: 20小时
- **负责人**: 前端架构师
- **技术选型分析**:

| 方案 | 包大小 | 学习曲线 | 推荐度 |
|------|--------|----------|--------|
| Zustand | ~1KB | 低 | ⭐⭐⭐⭐⭐ 推荐 |
| Redux Toolkit | ~7KB | 中 | ⭐⭐⭐⭐ |
| Jotai | ~2KB | 中 | ⭐⭐⭐ |
| Context API | 0 | 低 | ⭐⭐（复杂场景不适用）|

- **推荐选择: Zustand**
  - 简单易用，API简洁
  - 包体积极小
  - 支持DevTools
  - 支持中间件（persist, devtools, immer）
  
- **实施步骤**:
  ```bash
  npm install zustand
  ```
  - [ ] 创建Store结构：
    ```typescript
    // src/stores/authStore.ts
    interface AuthState {
      user: User | null;
      token: string | null;
      isAuthenticated: boolean;
      login: (credentials: LoginRequest) => Promise<void>;
      logout: () => void;
      checkAuth: () => void;
    }
    
    // src/stores/orderStore.ts
    interface OrderState {
      orders: Order[];
      loading: boolean;
      error: string | null;
      fetchOrders: (filters?: OrderFilters) => Promise<void>;
      createOrder: (data: CreateOrderData) => Promise<void>;
      // ...
    }
    
    // src/stores/uiStore.ts
    interface UIState {
      sidebarOpen: boolean;
      activeModal: string | null;
      toggleSidebar: () => void;
      openModal: (modalId: string) => void;
      closeModal: () => void;
    }
    ```
  - [ ] 迁移现有useState到Store
  - [ ] 实现数据持久化（localStorage sync）
  - [ ] 集成Redux DevTools扩展（调试用）
- **验收标准**:
  - ✅ 全局状态统一管理
  - ✅ 组件间通信清晰
  - ✅ 支持状态持久化
  - ✅ DevTools可调试状态变化
- **预期收益**:
  - 减少50%+的props drilling
  - 状态变更可追踪
  - 便于测试和维护

#### 第6-7周任务

##### 任务 A3-03: API层重构 - 引入TanStack Query [P1]
- **预估工时**: 24小时
- **负责人**: 后端对接的前端开发
- **技术选型**: TanStack React Query (原React Query)
- **优势**:
  - 自动缓存、后台更新、去重请求
  - 乐观更新、分页、无限滚动支持
  - 开发者体验极佳
  - 与Zustand完美配合

- **实施步骤**:
  ```bash
  npm install @tanstack/react-query
  ```
  - [ ] 配置QueryClientProvider
  - [ ] 封装useQuery/useMutation Hooks：
    ```typescript
    // src/hooks/useOrders.ts
    export function useOrders(filters?: OrderFilters) {
      return useQuery({
        queryKey: ['orders', filters],
        queryFn: () => orderApi.getOrders(filters),
        staleTime: 5 * 60 * 1000, // 5分钟
      });
    }
    
    export function useCreateOrder() {
      const queryClient = useQueryClient();
      
      return useMutation({
        mutationFn: orderApi.createOrder,
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['orders'] });
        },
      });
    }
    ```
  - [ ] 迁移所有API调用层
  - [ ] 实现全局错误处理
  - [ ] 配置离线支持（可选）
- **验收标准**:
  - ✅ API调用统一使用Hooks
  - ✅ 自动缓存避免重复请求
  - ✅ Loading/Error状态内置处理
  - ✅ 支持乐观更新

##### 任务 A3-04: 组件库抽象与设计系统 [P2]
- **预估工时**: 32小时
- **负责人**: UI/UX设计师 + 前端开发
- **任务描述**:
  - [ ] 建立Design Tokens（颜色、间距、字体、圆角）
  - [ ] 创建基础UI组件库：
    - Button (Primary, Secondary, Ghost, Icon)
    - Input (Text, Password, Search, Select)
    - Modal/Dialog
    - Table (Sortable, Filterable, Paginated)
    - Card
    - Badge/Tag
    - Toast/Notification
    - Loading Spinner/Skeleton
    - Empty State
    - Error Boundary
  - [ ] 编写Storybook文档（可选但推荐）
  - [ ] 建立组件使用规范
- **Design Tokens示例**:
  ```typescript
  // src/tokens.ts
  export const tokens = {
    colors: {
      primary: {
        50: '#eff6ff',
        500: '#3b82f6',
        600: '#2563eb',
        900: '#1e3a8a',
      },
      background: {
        main: '#05080F',
        card: '#0B121E',
        elevated: '#111827',
      },
      text: {
        primary: '#f8fafc',
        secondary: '#94a3b8',
        muted: '#64748b',
      },
      // ...
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
    },
    borderRadius: {
      sm: '0.375rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      '2xl': '1.5rem',
      '3xl': '2rem',
    },
    // ...
  };
  ```
- **验收标准**:
  - ✅ 复用率高的UI元素抽象为组件
  - ✅ 组件Props接口清晰完善
  - ✅ 统一的视觉风格
  - ✅ 组件文档齐全

---

### 🟢 阶段4: 功能完善（第8-10周）
**目标**: 完成所有业务模块的真实后端集成
**优先级**: P2

#### 第8周: 核心业务模块

##### 任务 F4-01: 订单管理模块完善 [P2]
- **预估工时**: 40小时
- **团队**: 2名全栈开发
- **任务清单**:
  - [ ] **后端API完善**:
    - GET /api/orders - 订单列表（分页、筛选、排序）
    - GET /api/orders/:id - 订单详情
    - POST /api/orders - 创建订单
    - PUT /api/orders/:id - 更新订单
    - DELETE /api/orders/:id - 删除订单
    - POST /api/orders/:id/match-capacity - 运力匹配
    - GET /api/orders/:id/capacity-analysis - 容量分析
    - GET /api/orders/:id/carbon - 碳排放计算
    
  - [ ] **前端集成**:
    - 移除所有Mock数据
    - 连接真实API
    - 实现加载状态和错误处理
    - 添加表单验证
    - 实现批量操作（批量删除、批量导出）
    
  - [ ] **增强功能**:
    - 订单搜索（关键词、高级筛选）
    - 订单导出（Excel格式，使用xlsx库）
    - 打印功能
    - 操作确认对话框
    - 实时订单追踪（WebSocket可选）
- **验收标准**:
  - ✅ CRUD操作完全可用
  - ✅ 数据来自真实数据库
  - ✅ 支持分页（每页20/50/100条）
  - ✅ 导出Excel功能正常
  - ✅ 响应时间 < 500ms（本地网络）

##### 任务 F4-02: 用户权限系统实现 [P2]
- **预估工时**: 32小时
- **团队**: 1名后端 + 1名前端
- **RBAC模型设计**:
  ```
  角色(Roles):
  - super_admin: 超级管理员（全部权限）
  - admin: 管理员（大部分权限）
  - operator: 操作员（订单、路线查看和操作）
  - viewer: 只读用户（仅查看）
  - customer: 客户（查看自己的订单）
  
  权限(Permissions):
  - users:* - 用户管理
  - orders:* - 订单管理
  - routes:view - 路线查看
  - routes:optimize - 路线优化
  - settings:* - 系统设置
  - reports:* - 报表导出
  ```
- **实施内容**:
  - [ ] 后端：数据库模型（Role, Permission, UserRole）
  - [ ] 后端：权限装饰器/依赖注入
  - [ ] 前端：权限控制Hook（usePermission）
  - [ ] 前端：条件渲染和路由守卫
  - [ ] 管理界面：角色和权限分配UI
- **验收标准**:
  - ✅ 不同角色看到不同菜单和功能
  - ✅ API权限校验生效
  - ✅ 无权限访问返回403
  - ✅ 权限变更实时生效（无需重新登录）

#### 第9周: 高级功能模块

##### 任务 F4-03: 路线优化模块真实接入 [P2]
- **预估工时**: 40小时
- **团队**: 2名后端（算法）+ 1名前端
- **前提**: 需要强化学习算法服务就绪
- **任务清单**:
  - [ ] **算法服务集成**:
    - 对接Python强化学习模型推理API
    - 实现异步任务队列（Celery + Redis）
    - 任务状态跟踪（pending → running → completed/failed）
    - 结果缓存和历史记录
    
  - [ ] **前端功能**:
    - 场景参数配置表单
    - 优化任务提交和进度显示
    - 结果可视化（地图路线、对比图表）
    - 结果导出（PDF报告）
    - 历史任务查看
    
  - [ ] **性能优化**:
    - 大数据量渲染优化
    - 地图组件懒加载
    - WebSocket进度推送
- **技术挑战**:
  - ⚠️ 算法服务响应时间可能较长（秒级到分钟级）
  - ⚠️ 需要处理并发任务
  - ⚠️ 结果数据量大，需要分片传输
- **验收标准**:
  - ✅ 可提交优化任务并获得结果
  - ✅ 进度实时显示
  - ✅ 结果可视化准确
  - ✅ 支持取消正在进行的任务

##### 任务 F4-04: AI客户服务模块完善 [P2]
- **预估工时**: 24小时
- **团队**: 1名AI工程师 + 1名前端
- **任务清单**:
  - [ ] **后端LLM集成**:
    - 对接OpenAI/Gemini API
    - Prompt工程优化
    - 上下文管理（对话历史）
    - 流式输出（SSE）
    - 内容安全过滤
    
  - [ ] **前端聊天体验**:
    - Markdown渲染（代码高亮、表格）
    - 打字机效果
    - 消息状态（发送中/已发送/失败）
    - 文件/图片上传
    - 快捷回复模板
    
  - [ ] **知识库集成**（可选）:
    - RAG检索增强生成
    - FAQ自动匹配
    - 订单关联查询
- **验收标准**:
  - ✅ AI回复流畅自然
  - ✅ 支持多轮对话上下文
  - ✅ 流式输出无卡顿
  - ✅ 响应时间 < 3秒

#### 第10周: 辅助功能模块

##### 任务 F4-05: 数据可视化和报表 [P2]
- **预估工时**: 24小时
- **团队**: 1名前端 + 1名数据分析师
- **任务清单**:
  - [ ] **仪表板真实数据**:
    - 关键指标卡片（今日订单、收入、准时率）
    - 趋势图表（折线图、柱状图）
    - 地图热力图
    - 实时数据刷新（轮询/WebSocket）
    
  - [ ] **碳监测模块**:
    - ESG数据看板
    - 排放趋势图
    - 减排目标达成率
    - 碳积分计算器
    - 环保报告导出
    
  - [ ] **合规安全模块**:
    - 安全事件时间线
    - 风险评估矩阵
    - 合规检查清单
    - 审计日志查看器
    - 合规报告生成
- **图表库选型确认**: Recharts（已安装）✓
- **验收标准**:
  - ✅ 图表数据来自真实API
  - ✅ 交互流畅（缩放、tooltip、图例切换）
  - ✅ 响应式布局适配不同屏幕
  - ✅ 导出PNG/PDF功能可用

##### 任务 F4-06: 系统设置和数据同步 [P2]
- **预估工时**: 16小时
- **团队**: 1名全栈开发
- **任务清单**:
  - [ ] **个人设置**:
    - 个人资料编辑
    - 头像上传
    - 密码修改
    - 通知偏好设置
    - 语言/时区设置
    
  - [ ] **系统配置**（管理员）:
    - 全局参数配置
    - 数据源连接管理
    - 邮件/短信服务配置
    - 第三方API密钥管理
    
  - [ ] **数据同步**:
    - 手动触发同步
    - 同步状态监控
    - 冲突解决机制
    - 同步日志查看
- **验收标准**:
  - ✅ 设置项修改即时生效
  - ✅ 数据持久化到数据库
  - ✅ 表单验证完善
  - ✅ 操作有确认提示

---

### 🟣 阶段5: 测试与优化（第11-12周）
**目标**: 达到生产质量标准
**优先级**: P2-P3

#### 第11周: 测试全覆盖

##### 任务 T5-01: 单元测试补充 [P2]
- **预估工时**: 40小时
- **团队**: 2名QA + 1名开发辅助
- **测试覆盖率目标**:

| 模块 | 当前覆盖率 | 目标覆盖率 |
|------|-----------|-----------|
| Services层 (API调用) | 30% | 85% |
| Stores (状态管理) | 0% | 80% |
| Utils (工具函数) | 0% | 90% |
| Hooks (自定义Hooks) | 0% | 80% |
| Components (纯UI组件) | 0% | 70% |
| **总体** | **<5%** | **≥80%** |

- **重点测试场景**:
  - [ ] 认证流程（登录、注册、Token刷新、登出）
  - [ ] 订单CRUD及边界情况
  - [ ] 表单验证逻辑
  - [ ] 错误处理和异常恢复
  - [ ] 权限控制逻辑
  - [ ] 数据转换和格式化
- **测试策略**:
  ```
  优先级排序:
  1. 核心业务逻辑（认证、订单）
  2. 数据处理函数（Utils）
  3. 状态管理（Stores）
  4. 自定义Hooks
  5. 展示型组件
  ```

##### 任务 T5-02: 集成测试和E2E测试 [P3]
- **预估工时**: 24小时
- **团队**: 1名QA自动化工程师
- **工具选型**: Playwright 或 Cypress
- **测试用例设计**:
  - [ ] **用户旅程测试**:
    - 注册 → 登录 → 浏览仪表板 → 创建订单 → 查看详情 → 登出
    - 登录 → 进入设置 → 修改密码 → 重新登录
    - 不同角色的功能访问测试
    
  - [ ] **关键业务流程**:
    - 订单创建到完成的全流程
    - 路线优化的提交流程
    - AI客服对话流程
    - 数据导出流程
    
  - [ ] **兼容性测试**:
    - Chrome/Firefox/Safari最新版
    - 分辨率适配（1920x1080, 1366x768, 移动端）
- **验收标准**:
  - ✅ E2E测试通过率 100%
  - ✅ 核心用户旅程覆盖
  - ✅ CI中自动运行E2E测试

#### 第12周: 性能优化和发布准备

##### 任务 O5-01: 性能优化专项 [P2]
- **预估工时**: 24小时
- **团队**: 性能工程师 + 前端开发
- **优化项目**:

  **1. 构建优化**:
  - [ ] 代码分割策略细化（路由级 + 组件级）
  - [ ] Tree shaking确保无死代码
  - [ ] 第三方库按需导入
  - [ ] Gzip/Brotli压缩配置
  - [ ] CDN静态资源分发

  **2. 运行时优化**:
  - [ ] 大列表虚拟滚动（react-window或react-virtualized）
  - [ ] 图片懒加载和WebP格式转换
  - [ ] React.memo和useMemo合理使用
  - [ ] 防抖节流处理频繁操作
  - [ ] Web Worker处理密集计算（图表渲染）

  **3. 网络优化**:
  - [ ] API响应缓存策略
  - [ ] HTTP/2推送关键资源
  - [ ] 预加载和预连接
  - [ ] Service Worker离线缓存（PWA支持）

- **性能指标目标**:
  ```
  指标                当前值    目标值    测量工具
  First Contentful Paint  ?      < 1.5s   Lighthouse
  Largest Contentful Paint ?      < 2.5s   Lighthouse
  Time to Interactive     ?      < 3.0s   Lighthouse
  Cumulative Layout Shift ?       < 0.1    Lighthouse
  Bundle Size (gzipped)   ?      < 500KB   Bundle Analyzer
  Lighthouse Score        ?       > 90     Lighthouse
  ```

##### 任务 O5-02: 发布准备和文档完善 [P3]
- **预估工时**: 20小时**
- **团队**: Tech Writer + 全体开发
- **文档清单**:

  **必须完成**:
  - [ ] README.md重写（项目介绍、快速开始、开发指南）
  - [ ] API文档完善（Swagger注解补充，使用示例）
  - [ ] 部署文档更新（基于最新架构）
  - [ ] CHANGELOG.md（版本历史）
  - [ ] CONTRIBUTING.md（贡献指南）
  
  **建议完成**:
  - [ ] 架构设计文档（系统架构图、技术决策）
  - [ ] 数据库设计文档（ER图、字段说明）
  - [ ] 用户操作手册（功能截图、操作步骤）
  - [ ] 故障排查手册（常见问题和解决方案）
  - [ ] 开发规范文档（代码风格、Git流程、Code Review标准）

- **发布检查清单**:
  ```
  □ 所有P0/P1问题已关闭
  □ 测试覆盖率 ≥ 80%
  □ 安全扫描无High以上漏洞
  □ 性能指标达标
  □ 文档完整且最新
  □ Docker镜像构建成功
  □ 生产环境部署测试通过
  □ 回滚方案准备就绪
  □ 监控告警配置完成
  ```

---

## 三、资源分配方案

### 3.1 团队配置建议

| 角色 | 人数 | 技能要求 | 主要职责阶段 |
|------|------|----------|-------------|
| **项目经理 (PM)** | 1 | 项目管理、沟通协调 | 全程 |
| **Tech Lead / 架构师** | 1 | 系统设计、技术决策 | 阶段1-3 |
| **后端开发工程师** | 2 | Python/FastAPI、安全 | 阶段1, 4 |
| **前端开发工程师** | 3 | React/TypeScript、状态管理 | 阶段2-4 |
| **QA工程师** | 2 | 自动化测试、性能测试 | 阶段2, 5 |
| **DevOps工程师** | 1 | CI/CD、Docker、云服务 | 阶段2, 5 |
| **UI/UX设计师** | 1 | Design System、交互设计 | 阶段3-4 |
| **安全工程师** | 0.5 | 渗透测试、安全审计 | 阶段1 |
| **AI/算法工程师** | 1 | 强化学习、LLM集成 | 阶段4 |
| **技术文档撰写** | 0.5 | 技术写作、文档维护 | 阶段5 |

**总计**: 约12-13人（部分兼职）

### 3.2 工时预算估算

| 阶段 | 周数 | 人周 | 总工时（按40h/周）|
|------|------|------|------------------|
| 阶段1: 安全修复 | 2周 | 4人 | 320小时 |
| 阶段2: 基础设施 | 2周 | 6人 | 480小时 |
| 阶段3: 架构重构 | 3周 | 6人 | 720小时 |
| 阶段4: 功能完善 | 3周 | 8人 | 960小时 |
| 阶段5: 测试优化 | 2周 | 6人 | 480小时 |
| **合计** | **12周** | - | **~2960小时** |

### 3.3 技术资源需求

**开发环境**:
- 开发服务器: 2台（8核CPU, 16GB RAM, SSD）
- 测试服务器: 1台（同配置）
- 数据库: PostgreSQL（生产）/ SQLite（开发）
- 缓存: Redis（用于Session和任务队列）
- 对象存储: MinIO或AWS S3（文件上传）

**第三方服务**:
- LLM API: OpenAI / Google Gemini（AI客服功能）
- 地图服务: 高德/百度地图API（路线可视化）
- 监控: Sentry（错误监控）+ Grafana（性能监控）
- CI/CD: GitHub Actions / GitLab CI（免费额度足够）

---

## 四、里程碑与交付物

### 里程碑时间线

```
2026-05-09  ┃ 项目启动，审查报告完成
     ↓
2026-05-23  ┃🎯 M1: 安全里程碑
             ┃ ✓ 所有Critical/High安全问题修复
             ┃ ✓ JWT认证系统上线
             ┃ ✓ 通过基础安全审计
     ↓
2026-06-06  ┃🎯 M2: 基础设施里程碑
             ┃ ✓ 代码质量工具链就绪
             ┃ ✓ TypeScript严格模式启用
             ┃ ✓ 目录结构重组完成
             ┃ ✓ CI/CD流水线运行
             ┃ ✓ 核心测试框架搭建完成
     ↓
2026-06-27  ┃🎯 M3: 架构里程碑
             ┃ ✓ React Router v6集成
             ┃ ✓ Zustand状态管理上线
             ┃ ✓ TanStack Query API层重构
             ┃ ✓ Design System v1.0发布
     ↓
2026-07-18  ┃🎯 M4: 功能里程碑
             ┃ ✓ 订单管理模块完整可用
             ┃ ✓ RBAC权限系统上线
             ┃ ✓ 路线优化模块真实接入
             ┃ ✓ AI客服模块完善
             ┃ ✓ 其他模块达到可用状态
     ↓
2026-08-01  ┃🎯 M5: 发布里程碑 ★★★
             ┃ ✓ 测试覆盖率 ≥ 80%
             ┃ ✓ Lighthouse分数 > 90
             ┃ ✓ 安全扫描通过
             ┃ ✓ 生产环境部署成功
             ┃ ✓ 文档体系完善
             ┃ ✓ 🚀 v1.0.0 正式发布！
```

### 各阶段交付物清单

**M1 - 安全里程碑交付物**:
- [ ] 修复后的认证系统代码
- [ ] 安全配置文档
- [ ] 安全评估报告
- [ ] 密钥管理规范
- [ ] CORS配置清单

**M2 - 基础设施里程碑交付物**:
- [ ] ESLint + Prettier配置
- [ ] 新的项目目录结构
- [ ] Jest + RTL测试框架配置
- [ ] CI/CD流水线配置文件
- [ ] 开发环境搭建文档
- [ ] 代码规范文档v1.0

**M3 - 架构里程碑交付物**:
- [ ] 路由配置文件和文档
- [ ] 状态管理设计方案
- [ ] API层重构代码
- [ ] Design Tokens定义
- [ ] 基础UI组件库v1.0
- [ ] 架构设计文档

**M4 - 功能里程碑交付物**:
- [ ] 完整的后端API集合
- [ ] 所有功能模块前端代码
- [ ] 权限管理系统
- [ ] 算法服务对接代码
- [ ] AI客服集成代码
- [ ] 功能测试报告

**M5 - 发布里程碑交付物**:
- [ ] 生产就绪的代码库
- [ ] Docker镜像和部署脚本
- [ ] 完整的测试套件
- [ ] 性能测试报告
- [ ] 安全合规报告
- [ ] 用户文档和技术文档
- [ ] 运维手册
- [ ] Release Notes

---

## 五、风险管理

### 5.1 技术风险

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|----------|
| 重构引入回归Bug | 高 | 高 | 充分测试、灰度发布、快速回滚能力 |
| 第三方API不稳定 | 中 | 高 | 多供应商备选、降级方案、缓存策略 |
| 性能不达标 | 中 | 中 | 提前性能基准测试、持续优化 |
| 技术栈学习曲线 | 低 | 中 | 技术分享、Pair Programming、文档 |

### 5.2 进度风险

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|----------|
| 工期延误 | 中 | 高 | 敏捷开发、每周回顾、预留缓冲时间 |
| 需求变更 | 高 | 中 | 变更控制流程、影响评估、优先级调整 |
| 人员流动 | 低 | 高 | 知识共享、代码Review、文档完善 |
| 资源不足 | 中 | 中 | 外包协作、优先级排序、MVP思维 |

### 5.3 应急预案

**如果工期紧张，可以**:
1. **砍掉非核心功能**: 国际化、主题切换、移动端适配
2. **降低测试覆盖率目标**: 从80%降至60%（后续补齐）
3. **简化权限系统**: 先实现admin/viewer两级
4. **推迟AI功能**: 作为v1.1迭代内容
5. **使用现成组件库**: Ant Design/Material UI替代自建Design System

---

## 六、成功标准与验收准则

### 6.1 质量门槛（必须满足）

- [ ] **安全性**: 无Critical/High漏洞，通过OWASP Top 10检查
- [ ] **稳定性**: 核心流程P0/P1 Bug为零
- [ ] **可维护性**: 代码覆盖率 ≥ 80%，TypeScript零错误
- [ ] **性能**: Lighthouse Performance ≥ 90, FCP < 1.5s
- [ ] **兼容性**: Chrome/Firefox/Safari最新版正常工作
- [ ] **可访问性**: 基础WCAG 2.1 AA标准（可选）

### 6.2 业务价值（期望达到）

- [ ] **用户体验**: 核心流程操作步骤 ≤ 3步完成
- [ ] **功能完整性**: 8大模块全部可用，Mock数据清除
- [ ] **数据准确性**: 展示数据与数据库一致，误差 < 0.1%
- [ ] **效率提升**: 相比手工操作，效率提升 ≥ 50%

---

## 七、持续改进计划

### v1.1 迭代规划（发布后1-2个月）
- 移动端响应式适配
- PWA离线支持
- 高级数据分析功能
- 多语言国际化
- 暗色/亮色主题切换
- 更多图表类型和自定义选项

### v1.2 迭代规划（发布后3-4个月）
- WebSocket实时通信全面应用
- 协作功能（多人同时操作）
- 高级权限和工作流引擎
- 第三方系统集成（ERP, WMS, TMS）
- 移动App（React Native）

### 长期规划（6个月+）
- 微服务架构演进
- 多租户SaaS化
- AI智能推荐和预测
- 区块链数据存证（可选）
- 全球化部署和多区域支持

---

## 八、总结与行动号召

### 核心要点回顾

本开发计划基于全面的系统性审查制定，识别了**2个Critical级别安全漏洞**、**45处类型安全隐患**、**17个Mock数据文件**以及**多项架构层面的问题**。

**立即行动项（本周内）**:
1. 🔴 **停止任何生产部署计划**
2. 🔧 **组建安全修复小组**（至少1后端+1安全）
3. 📋 **召开项目评审会议**，向所有利益相关方汇报审查结果
4. 💰 **申请资源投入**（按上述团队配置）
5. 📅 **确定启动日期**，建议不晚于2026-05-12

### 成功关键因素

✅ **领导层重视** - 安全问题需要管理层支持和资源投入
✅ **全员参与** - 代码质量是全团队的责任
✅ **循序渐进** - 不要试图一次性解决所有问题
✅ **持续改进** - 建立定期的代码审查和质量度量机制
✅ **用户导向** - 始终以用户体验和价值交付为核心

### 最后的话

PathOptix Dashboard拥有良好的产品愿景和UI基础。虽然当前存在严重的技术债务，但只要按照本计划**优先解决安全问题**、**系统性地重构架构**、**逐步完善功能**，完全有能力在3个月内打造出一个**安全、稳定、高性能**的生产级产品。

**现在就开始行动吧！每一天的延迟都是对用户的不负责任。**

---

**文档版本**: v1.0
**最后更新**: 2026-05-09
**维护责任人**: Project Management Office
**审核状态**: 待项目组评审确认
