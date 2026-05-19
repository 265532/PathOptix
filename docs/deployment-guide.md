# PathOptix Dashboard — Docker 部署指南（Windows → Linux 云服务器）

> **版本**: v2.0（全新编写）
> **适用项目状态**: 2026-05-18（含主题切换功能 + Tailwind npm 迁移后）
> **部署模式**: Docker Compose 前后端分离部署
> **目标读者**: 开发者 / 运维人员

---

## 一、架构总览

### 1.1 技术栈

| 层 | 技术 | 版本 | 容器基础镜像 |
|---|------|------|-------------|
| **前端** | React 19 + TypeScript 5.8 + Vite 6 | 最新 | `node:18-alpine` → `nginx:alpine` |
| **样式** | Tailwind CSS 3.4 (npm) + PostCSS 8.5 | — | 构建时处理 |
| **后端** | Python 3.10 + FastAPI | — | `python:3.10-slim` |
| **数据库** | SQLite | — | 卷持久化 |
| **反向代理** | Nginx (Alpine) | — | 内置于前端容器 |
| **编排** | Docker Compose v2 | — | 宿主机 |

### 1.2 部署架构图

```
┌─────────────────────────────────────────────────────┐
│                Linux 云服务器 (Docker Host)          │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │           Docker Network (bridge)            │   │
│  │                                             │   │
│  │  ┌──────────────────┐  ┌────────────────┐  │   │
│  │  │   frontend       │  │   backend      │  │   │
│  │  │   (Nginx:alpine) │  │(Python:3.10)  │  │   │
│  │  │                  │  │               │  │   │
│  │  │  Port: 9010      │  │ Port: 8010    │  │   │
│  │  │  ┌────────────┐  │  │ ┌───────────┐│  │   │
│  │  │  │ SPA 静态文件│  │  │ │FastAPI    ││  │   │
│  │  │  │ dist/      │  │  │ │API 服务   ││  │   │
│  │  │  └────────────┘  │  │ │           ││  │   │
│  │  │  ┌────────────┐  │  │ ├───────────┤│  │   │
│  │  │  │nginx.conf  │  │  │ │SQLite DB  ││  │   │
│  │  │  │/api→backend│  │  │ │(卷挂载)   ││  │   │
│  │  │  └────────────┘  │  │ └───────────┘│  │   │
│  │  └──────────────────┘  └────────────────┘  │   │
│  │         ↕                     ↕             │   │
│  └─────────┬───────────────────────┬───────────┘   │
│            │                       │               │
│     :9010 (外网)            :8010 (内网)          │
│     浏览器访问              仅容器间通信           │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  Docker Volumes                              │   │
│  │  ├── pathoptix-db-data:/app/data  (SQLite)  │   │
│  │  └── pathoptix-logs:/app/logs      (日志)    │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘

外部访问:
  前端界面: http://<服务器IP>:9010
  API 文档: http://<服务器IP>:9010/docs (Swagger UI)
```

### 1.3 端口规划

| 端口 | 用途 | 对外暴露 | 说明 |
|------|------|---------|------|
| **9010** | 前端 (Nginx) | ✅ 是 | 用户浏览器访问入口 |
| **8010** | 后端 (FastAPI) | ❌ 否 | 仅 Docker 网络内部通信，通过 Nginx `/api/` 转发 |

### 1.4 文件清单

本项目部署涉及以下文件：

| 文件路径 | 用途 | 状态 |
|---------|------|------|
| `docker-compose.yml` | 容器编排定义 | ✅ 已有 |
| `deploy/docker/Dockerfile.frontend` | 前端多阶段构建 | ✅ 已有 |
| `deploy/docker/Dockerfile.backend` | 后端容器构建 | ✅ 已有 |
| `nginx.conf` | Nginx 反向代理配置 | ✅ 已有 |
| `.env.production` | 前端生产环境变量 | ✅ 已有 |
| `.dockerignore` | Docker 构建排除规则 | ✅ 已有 |
| `backend/.env.example` | 后端环境变量模板 | ✅ 已有 |
| `backend/requirements.txt` | Python 依赖列表 | ✅ 应已有 |

---

## 二、前置条件

### 2.1 Windows 开发环境

| 工具 | 最低版本 | 验证命令 |
|------|---------|---------|
| Git | 2.x | `git --version` |
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |
| Docker Desktop | 4.x+ | `docker --version` |
| SSH 客户端 | (Windows 内置 OpenSSH 或 PuTTY) | `ssh -V` |
| 文件传输工具 | scp / WinSCP / FileZilla | — |

### 2.2 Linux 服务器环境

| 要求 | 最低规格 | 推荐规格 |
|------|---------|---------|
| 操作系统 | Ubuntu 20.04+ / CentOS 8+ / Debian 11+ | Ubuntu 22.04 LTS |
| CPU | 1 核 | 2 核 |
| 内存 | 1 GB | 2 GB |
| 磁盘 | 10 GB 可用 | 20 GB SSD |
| 网络 | 公网 IP + 开放端口 9010 | — |
| Docker | 24.0+ | 最新稳定版 |

### 2.3 服务器安全组 / 防火墙

确保以下端口在云服务商安全组和服务器防火墙中放行：

| 协议 | 端口 | 来源 | 用途 |
|------|------|------|------|
| TCP | **9010** | 0.0.0.0/0 (或你的 IP) | 前端访问 |
| TCP | 22 | 你的 IP/32 | SSH 管理 |
| TCP | 8010 | **不开放** | 后端仅内网使用 |

> ⚠️ **安全建议**: 生产环境建议仅对 9010 端口限制特定 IP 段访问，22 端口限制为管理 IP。

---

## 三、部署步骤（完整流程）

### 步骤 1: 本地准备 — 确认项目可构建

在 Windows 本地项目根目录执行：

```bash
# 1. 确认依赖已安装
npm install

# 2. 执行生产构建（验证无报错）
npm run build

# 3. 确认产物生成
ls -la dist/
# 预期输出: index.html, assets/index-xxx.css, assets/index-xxx.js 等

# 4. （可选）运行测试确认通过
npm run test
```

**如果构建失败**：先修复本地构建问题再继续。常见问题：
- Tailwind PostCSS 配置缺失 → 确认 `postcss.config.js` 和 `tailwind.config.js` 存在
- TypeScript 编译错误 → 运行 `npx tsc --noEmit` 查看具体错误

### 步骤 2: 打包项目文件

将需要上传到服务器的文件打包。**不需要上传** `node_modules/`、`dist/`、`.git/` 等目录。

#### 方式 A: 使用 git archive（推荐）

```bash
# 在项目根目录执行，导出除 .gitignore 规则外的所有文件
git archive --format=tar.gz -o pathoptix-deploy.tar.gz HEAD
```

#### 方式 B: 手动选择文件打包

需要包含的文件/目录：
```
pathoptix-deploy/
├── src/                    # 前端源码
├── index.html              # 入口 HTML
├── package.json            # 依赖声明
├── package-lock.json       # 锁定版本
├── vite.config.ts          # Vite 配置
├── tsconfig.json           # TS 配置
├── tsconfig.node.json      # Node TS 配置
├── tailwind.config.js      # Tailwind 配置
├── postcss.config.js       # PostCSS 配置
├── docker-compose.yml      # Docker 编排
├── Dockerfile              # （可选，旧版融合方案）
├── nginx.conf              # Nginx 配置
├── .dockerignore           # Docker 忽略规则
├── .env.production         # 前端环境变量
├── deploy/
│   └── docker/
│       ├── Dockerfile.frontend
│       ├── Dockerfile.backend
│       └── Dockerfile.backend.dev
└── backend/                # 后端代码
    ├── main.py
    ├── requirements.txt
    ├── .env.example
    └── (其他后端文件...)
```

### 步骤 3: 上传到服务器

#### 方式 A: SCP 命令行（PowerShell）

```powershell
# 替换 <user>@<server-ip> 为你的实际服务器信息
scp pathoptix-deploy.tar.gz <user>@<server-ip>:~/
```

#### 方式 B: WinSCP / FileZilla 图形化操作

1. 连接到服务器 `<user>@<server-ip>` (端口 22)
2. 上传 `pathoptix-deploy.tar.gz` 到用户主目录 (`~/`)
3. 或直接拖拽整个 `pathoptix-deploy/` 目录

### 步骤 4: 服务器端 — 解压与构建

SSH 登录到服务器：

```bash
# SSH 登录
ssh <user>@<server-ip>

# 创建工作目录
mkdir -p ~/pathoptix && cd ~/pathoptix

# 解压上传的包
tar -xzf ~/pathoptix-deploy.tar.gz --strip-components=1
# 如果是目录上传: cp -r ~/pathoptix-deploy/* ./

# 确认关键文件存在
ls -la docker-compose.yml deploy/docker/Dockerfile.frontend backend/main.py
```

### 步骤 5: 服务器端 — 配置后端环境变量

```bash
# 从模板创建后端环境变量
cp backend/.env.example backend/.env

# 编辑后端配置（必须修改以下项）
nano backend/.env
```

**必须修改的配置项**:

```bash
# ⚠️ 必须替换为随机生成的密钥（至少 32 字符）
SECRET_KEY="your-random-secret-key-here-minimum-32-chars"

# CORS 允许的前端来源（Docker 内部网络）
BACKEND_CORS_ORIGINS=["http://localhost:9010","http://127.0.0.1:9010"]

# AI API 密钥（如使用百炼等 AI 功能）
DASHSCOPE_API_KEY="your-api-key-if-needed"

# 数据库路径（SQLite 将存储在 Docker 卷中）
DATABASE_URL="sqlite:///./data/pathoptix.db"
```

**生成随机 SECRET_KEY 的方法**:
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
openssl rand -hex 24
```

### 步骤 6: 构建并启动容器

```bash
# 在项目根目录（含 docker-compose.yml）执行

# 构建镜像（首次或代码更新后）
docker compose build

# 启动服务（后台运行）
docker compose up -d

# 查看容器状态
docker compose ps
# 预期输出:
#   NAME                 STATUS         PORTS
#   pathoptix-backend-1  Up X seconds   8010/tcp
#   pathoptix-frontend-1 Up X seconds   0.0.0.0:9010->9010/tcp
```

### 步骤 7: 验证部署

#### 7.1 容器健康检查

```bash
# 查看容器日志（确认无报错启动）
docker compose logs --tail=50

# 检查后端健康状态
curl http://localhost:8010/api/health
# 预期: {"status":"ok","..."} 或类似 JSON 响应

# 检查前端可访问
curl -I http://localhost:9010
# 预期: HTTP/1.1 200 OK
```

#### 7.2 浏览器验证

打开浏览器访问：

| URL | 预期结果 |
|-----|---------|
| `http://<服务器IP>:9010` | PathOptix Dashboard 主页正常显示 |
| `http://<服务器IP>:9010/docs` | Swagger API 文档页面 |
| 点击「登录」按钮 | 登录页正常渲染（暗色默认主题） |
| 点击 ThemeToggle 按钮 | 明暗主题切换流畅（300ms 过渡） |
| 刷新页面 | 主题保持不变（localStorage 持久化生效） |
| 切换各业务模块 | 所有 8 个模块页面正常加载 |

---

## 四、Docker 构建详解

### 4.1 前端镜像 (Dockerfile.frontend)

```dockerfile
# =============================================
# Stage 1: 构建阶段 — 安装依赖 + 生产构建
# =============================================
FROM node:18-alpine AS builder

WORKDIR /app

# 先复制依赖声明文件（利用 Docker 缓存层优化）
COPY package*.json ./

# 安装生产依赖（Tailwind CSS、PostCSS、Autoprefixer 等在此安装）
RUN npm install

# 复制全部源码
COPY . .

# 执行 Vite 生产构建
# 输出: dist/ 目录（含 index.html + css/js/assets）
RUN npm run build

# =============================================
# Stage 2: 运行阶段 — Nginx 提供静态文件服务
# =============================================
FROM nginx:alpine

# 复制构建产物到 Nginx 默认站点目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制自定义 Nginx 配置（含 API 反向代理规则）
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 9010

# 启动 Nginx（前台运行，Docker 需要）
CMD ["nginx", "-g", "daemon off;"]
```

**构建过程说明**:

| 阶段 | 基础镜像 | 大小 | 说明 |
|------|---------|------|------|
| builder | node:18-alpine | ~180MB | npm install + vite build |
| 最终 | nginx:alpine | ~45MB | 仅含 dist/ 静态文件 + nginx.conf |
| **最终镜像大小** | — | **~25-40MB** | 取决于 dist/ 产物体积 |

**注意 — Tailwind CSS 构建差异**:
- 项目已从 CDN Tailwind 迁移至 npm 包（`tailwindcss@^3.4.19`）
- Dockerfile 无需特殊调整，`npm install` 会自动安装 `tailwindcss` + `postcss` + `autoprefixer`
- `vite build` 过程中 PostCSS 插件会自动处理 Tailwind 类名
- 构建时间可能比 CDN 版本稍长（需编译 Tailwind），属正常现象

### 4.2 后端镜像 (Dockerfile.backend)

```dockerfile
FROM python:3.10-slim

WORKDIR /app

# 升级 pip
RUN pip install --upgrade pip

# 安装 Python 依赖
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# 复制后端代码和静态资源
COPY static ./static
COPY backend/ .

# 暴露端口
EXPOSE 8010

# 环境变量
ENV PYTHONUNBUFFERED=1
ENV PORT=8010

# 启动 FastAPI 应用
CMD ["python", "main.py"]
```

### 4.3 Docker Compose 编排

```yaml
services:
  # ==================== 后端服务 ====================
  backend:
    build:
      context: .
      dockerfile: deploy/docker/Dockerfile.backend
    ports:
      - "8010:8010"        # 映射到主机（调试用，生产可移除）
    environment:
      - DEBUG=False
      # CORS: 允许来自前端容器的请求
      - BACKEND_CORS_ORIGINS=["http://localhost:9010","http://127.0.0.1:9010"]
    restart: unless-stopped   # 异常退出自动重启
    volumes:
      # 数据持久化: SQLite 数据库
      - pathoptix-db-data:/app/data
      # 日志持久化
      - pathoptix-logs:/app/logs
    healthcheck:
      test: ["CMD", "python", "-c", "import requests; requests.get('http://localhost:8010/api/health')"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 15s

  # ==================== 前端服务 ====================
  frontend:
    build:
      context: .
      dockerfile: deploy/docker/Dockerfile.frontend
    ports:
      - "9010:9010"        # 对外暴露前端访问端口
    depends_on:
      - backend              # 等待后端就绪后再启动
    restart: unless-stopped

# ==================== 持久化卷 ====================
volumes:
  pathoptix-db-data:
    driver: local
  pathoptix-logs:
    driver: local
```

---

## 五、Nginx 配置详解

### 5.1 配置文件位置与作用

配置文件 [nginx.conf](../nginx.conf) 在 Docker 构建时被复制到前端容器的 `/etc/nginx/conf.d/default.conf`，作为 Nginx 的默认站点配置。

### 5.2 Location 规则说明

| Location 匹配 | 代理目标 | 用途 |
|---------------|---------|------|
| `/` | 本地静态文件 (`try_files $uri $uri/ /index.html`) | **SPA 路由回退** — 所有非文件请求返回 index.html，由 React Router 接管 |
| `/api/` | `proxy_pass http://backend:8010/api/` | **API 反向代理** — 前端 `/api/xxx` 请求转发到后端 FastAPI |
| `/static/` | `proxy_pass http://backend:8010/static/` | 后端静态资源代理 |
| `/docs/` | `proxy_pass http://backend:8010/docs/` | Swagger UI 文档 |
| `/redoc/` | `proxy_pass http://backend:8010/redoc/` | ReDoc 文档 |
| `/openapi.json` | `proxy_pass http://backend:8010/openapi.json` | OpenAPI 规范 JSON |

### 5.3 关键配置解释

```nginx
# SPA 路由支持 — 核心配置
location / {
    try_files $uri $uri/ /index.html;
    # 当用户访问 /orders 或 /dashboard 等路由时，
    # Nginx 先找对应文件 → 不存在则回退到 index.html
    # React Router 根据 URL 渲染对应组件
}

# API 反向代理 — 前后端通信桥梁
location /api/ {
    proxy_pass http://backend:8010/api/;
    # Docker Compose 中 'backend' 服务名即为 DNS 解析域名
    proxy_set_header Host $host;           # 传递原始 Host 头
    proxy_set_header X-Real-IP $remote_addr;    # 传递真实客户端 IP
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;  # 代理链追踪
    proxy_set_header X-Forwarded-Proto $scheme;   # 传递原始协议(http/https)
}
```

### 5.4 前端 API 请求链路

```
浏览器                          Linux 服务器 (Docker)
  │                                │
  │ GET /api/orders                 │
  │ Host: <IP>:9010                │
  │ ──────────────────────────────>│
  │                         ┌──────┴──────┐
  │                         │  Frontend   │
  │                         │  (Nginx:9010)│
  │                         │              │
  │                         │ /api/ 匹配   │
  │                         │ ↓ 转发       │
  │                         │              │
  │                         └──────┬──────┘
  │                                │
  │                         ┌──────┴──────┐
  │                         │  Backend    │
  │                         │ (FastAPI:   │
  │                         │  8010)       │
  │                         │              │
  │                         │ 处理请求     │
  │                         │ 返回 JSON   │
  │                         └──────┬──────┘
  │                                │
  │ <── JSON 响应 ──────────────────│
  │                                │
```

---

## 六、环境变量配置

### 6.1 前端环境变量

文件: `.env.production`（构建时嵌入）

| 变量名 | 当前值 | 说明 |
|--------|-------|------|
| `VITE_API_BASE_URL` | `/api` | 相对路径，通过 Nginx 反向代理转发到后端 |

> **重要**: 此值为 `/api`（相对路径），而非硬编码 IP 地址。这样无论部署在哪台服务器，API 请求都能正确路由到同机的后端容器。

### 6.2 后端环境变量

文件: `backend/.env`（运行时读取）

| 变量名 | 必须 | 示例值 | 说明 |
|--------|------|--------|------|
| `SECRET_KEY` | ✅ | `abc123...` (≥32字符) | JWT 签名密钥，**必须唯一且保密** |
| `DEBUG` | ❌ | `False` | 生产环境关闭调试模式 |
| `DATABASE_URL` | ❌ | `sqlite:///./data/pathoptix.db` | SQLite 数据库路径（Docker 卷内） |
| `BACKEND_CORS_ORIGINS` | ❌ | `["http://localhost:9010"]` | 允许跨域的源 |
| `ALGORITHM` | ❌ | `HS256` | JWT 算法 |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | ❌ | `30` | Token 有效期（分钟） |
| `APP_NAME` | ❌ | `"PathOptix API"` | 应用名称 |
| `DASHSCOPE_API_KEY` | ❌ | `sk-xxxx` | 百炼 AI 服务密钥（如使用 AI 功能） |

---

## 七、日常运维命令

### 7.1 服务管理

```bash
# ====== 在服务器项目目录下执行 ======

# 查看服务状态
docker compose ps

# 查看实时日志
docker compose logs -f

# 查看指定服务日志
docker compose logs -f frontend
docker compose logs -f backend

# 重启服务（代码未变，仅重启容器）
docker compose restart

# 停止服务
docker compose down

# 停止并删除数据卷（⚠️ 会丢失数据！）
docker compose down -v
```

### 7.2 更新部署（代码变更后）

```bash
# 1. 在 Windows 本地提交最新代码
git add . && git commit -m "update: xxx"

# 2. 重新打包上传（参考步骤 2-3）
git archive --format=tar.gz -o pathoptix-deploy.tar.gz HEAD
scp pathoptix-deploy.tar.gz <user>@<server-ip>:~/

# 3. SSH 到服务器
ssh <user>@<server-ip>
cd ~/pathoptix

# 4. 解压新代码
tar -xzf ~/pathoptix-deploy.tar.gz --strip-components=1

# 5. 重新构建并启动（自动停止旧容器）
docker compose up -d --build

# 6. 验证
curl -I http://localhost:9010
```

### 7.3 单独更新前端或后端

```bash
# 仅重新构建并重启前端
docker compose up -d --build frontend

# 仅重新构建并重启后端
docker compose up -d --build backend
```

### 7.4 进入容器调试

```bash
# 进入后端容器
docker compose exec backend bash

# 进入前端容器
docker compose exec frontend sh

# 在容器内执行命令（不进入交互式）
docker compose exec backend python -c "print('test')"
```

### 7.5 数据备份与恢复

```bash
# 备份 SQLite 数据库
docker compose exec backend cp /app/data/pathoptix.db /app/data/pathoptix-backup-$(date +%Y%m%d).db

# 从宿主机复制备份出来
docker cp pathoptix-backend-1:/app/data/pathoptix-backup-20260518.db ./pathoptix-backup.db

# 查看日志占用空间
docker system df -v

# 清理无用镜像和构建缓存
docker system prune -f
```

---

## 八、故障排查

### 8.1 常见问题速查表

| 症状 | 可能原因 | 排查命令 | 解决方法 |
|------|---------|---------|---------|
| 容器无法启动 | 端口被占用 | `ss -tlnp \| grep 9010` | 释放端口或修改映射 |
| 前端白屏 | 构建失败 | `docker compose logs frontend` | 检查 `npm run build` 是否成功 |
| API 请求 404/502 | 后端未启动或崩溃 | `docker compose logs backend` | 检查后端日志，确认 healthcheck 通过 |
| API 请求跨域错误 | CORS 配置错误 | 检查 `BACKEND_CORS_ORIGINS` | 确保 9010 端口在允许列表 |
| 主题切换不生效 | localStorage 问题 | 浏览器 DevTools → Application → Local Storage | 检查 `pathoptix-theme` 键值 |
| 页面样式异常 | Tailwind 未正确构建 | `docker compose exec frontend ls /usr/share/nginx/html/assets/` | 确认 CSS 文件存在且非空 |
| 数据丢失 | 卷未被正确挂载 | `docker volume inspect pathoptix-db-data` | 确认卷存在且有数据文件 |
| 内存不足 OOM | 服务器资源不够 | `docker stats` | 升级服务器或限制容器内存 |

### 8.2 详细排查流程

#### 问题: 前端无法访问 (9010 无响应)

```bash
# 1. 确认容器正在运行
docker compose ps
# 状态应为 "Up"

# 2. 确认端口映射正确
docker port $(docker compose ps -q frontend)
# 预期: 0.0.0.0:9010->9010/tcp

# 3. 确认 Nginx 正常启动
docker compose exec frontend cat /var/log/nginx/error.log

# 4. 确认静态文件存在
docker compose exec frontend ls /usr/share/nginx/html/
# 应看到: index.html, assets/ 目录

# 5. 如果以上均正常，检查服务器防火墙
sudo ufw status
sudo iptables -L -n | grep 9010
```

#### 问题: API 请求失败 (控制台报错)

```bash
# 1. 确认后端容器运行
docker compose ps backend

# 2. 直接测试后端 API
docker compose exec backend curl http://localhost:8010/api/health

# 3. 从前端容器内部测试后端连通性
docker compose exec frontend wget -qO- http://backend:8010/api/health

# 4. 检查后端日志中的错误
docker compose logs backend --tail=100 | grep -i error

# 5. 检查 CORS 配置是否匹配
docker compose exec backend env | grep CORS
```

#### 问题: 构建失败 (npm run build 报错)

```bash
# 1. 查看完整构建日志
docker compose build frontend 2>&1 | tee build.log

# 2. 常见原因: 缺少依赖
#    → 确认 package-lock.json 已上传

# 3. 常见原因: PostCSS/Tailwind 配置缺失
#    → 确认 postcss.config.js 和 tailwind.config.js 在上传包中

# 4. 本地复现问题
npm ci          # 清理重装依赖
npm run build   # 本地构建测试
```

---

## 九、安全加固建议

### 9.1 必做项（上线前）

| # | 安全措施 | 方法 |
|---|---------|------|
| 1 | **更换 SECRET_KEY** | `backend/.env` 中必须设置为 ≥32 字符的随机字符串 |
| 2 | **关闭 DEBUG 模式** | `DEBUG=False`（docker-compose.yml 中已设置） |
| 3 | **限制 9010 端口访问来源** | 云安全组添加 IP 白名单 |
| 4 | **禁用后端 8010 外网访问** | `docker-compose.yml` 中移除 `ports: - "8010:8010"` |
| 5 | **更新基础镜像** | 定期执行 `docker compose pull` 获取安全补丁 |

### 9.2 推荐项（后续迭代）

| # | 安全措施 | 方法 |
|---|---------|------|
| 6 | HTTPS 加密 | 添加 Let's Encrypt 证书（Certbot + Nginx） |
| 7 | 速率限制 | Nginx 添加 `limit_req_zone` 防 DDoS |
| 8 | 安全响应头 | Nginx 添加 `X-Frame-Options`, `X-Content-Type-Options` 等 |
| 9 | 日志审计 | ELK/Splunk 收集 Docker 日志 |
| 10 | 自动备份 | Cron 定时任务备份数据库卷 |

---

## 十、附录

### 10.1 项目当前状态快照（部署时参考）

| 维度 | 当前值 |
|------|--------|
| 前端框架 | React 19.2.4 + TypeScript 5.8 |
| 构建工具 | Vite 6.2.0 |
| 样式方案 | Tailwind CSS 3.4.19 (npm) + PostCSS 8.5.14 |
| 新增特性 | 明暗主题切换（CSS 变量 + data-theme） |
| 新增文件 | themes.css, ThemeContext.tsx, useTheme.ts, useChartTheme.ts, ThemeToggle.tsx |
| 构建产物位置 | `dist/` 目录 |
| 预估产物大小 | ~300-500 KB (gzip 后) |
| 后端框架 | Python 3.10 + FastAPI |
| 数据库 | SQLite (Docker 卷持久化) |

### 10.2 与原部署文档的关键变化

| 变更点 | 原文档 | 当前版本 |
|--------|--------|---------|
| Tailwind 方式 | CDN (`cdn.tailwindcss.com`) | **npm 包** (`tailwindcss@^3.4.19`) |
| 构建依赖 | 无 PostCSS/Autoprefixer | **新增** postcss + autoprefixer |
| 前端新增文件 | — | themes.css, ThemeContext.tsx, ThemeToggle.tsx 等 8 个文件 |
| 前端环境变量 | `VITE_API_BASE_URL=http://81.71.129.36:8010` | **`/api`**（相对路径） |
| FOUC 防闪烁 | 无 | **index.html 同步脚本** |
| Dockerfile.frontend | 无变化 | 无需修改（npm install 自动处理新依赖） |
| nginx.conf | 无变化 | 无需修改 |

### 10.3 一键部署脚本（可选）

如需简化重复部署操作，可在服务器上创建脚本：

```bash
#!/bin/bash
# deploy.sh — PathOptix 一键部署脚本
set -e

echo "=== PathOptix 部署 ==="

# 参数
TAR_FILE="${1:-$HOME/pathoptix-deploy.tar.gz}"
DEPLOY_DIR="$HOME/pathoptix"

echo "[1/4] 解压部署包..."
mkdir -p "$DEPLOY_DIR"
tar -xzf "$TAR_FILE" -C "$DEPLOY_DIR" --strip-components=1

echo "[2/4] 构建 Docker 镜像..."
cd "$DEPLOY_DIR"
docker compose build

echo "[3/4] 启动服务..."
docker compose up -d

echo "[4/4] 等待健康检查..."
sleep 10
if curl -sf http://localhost:9010 > /dev/null; then
  echo "✅ 部署成功! 访问: http://$(hostname -I | awk '{print $1}'):9010"
else
  echo "❌ 部署可能有问题，请检查日志:"
  docker compose logs --tail=30
fi
```

使用方式:
```bash
chmod +x deploy.sh
./deploy.sh ~/pathoptix-deploy.tar.gz
```

---

*文档版本*: v2.0
*创建日期*: 2026-05-18
*适用项目状态*: 含主题切换 + Tailwind npm 迁移后的完整版
*下一步*: 如需配置域名/HTTPS/CI-CD 自动化部署，可在本文档基础上扩展
