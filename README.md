# 大数据查询系统

一个基于 Node.js + Vue.js 的现代化大数据查询系统，提供高效的数据查询、分析和可视化功能。

## ✨ 特性

- 🚀 高性能数据查询引擎
- 📊 实时数据可视化和趋势分析
- 🔐 完整的用户权限管理和JWT认证
- 💳 集成多种支付系统（微信、支付宝、易支付）
- 🛡️ 企业级安全防护（Helmet、CORS、限流）
- 📱 响应式设计，支持移动端
- 📈 智能仪表板，实时统计数据
- 🔄 自动趋势计算和对比分析
- 🎯 健康检查和监控系统
- 📝 结构化日志记录（Winston）
- ⚡ Redis 缓存优化
- 🧪 完整的测试覆盖（Jest + Supertest）
- 🐳 Docker 容器化支持
- 🔄 PM2 进程管理

## 🏗️ 技术栈

### 后端
- **框架**: Node.js + Express.js + TypeScript
- **数据库**: MySQL 8.0+ 主数据库
- **缓存**: Redis 6.0+ 高性能缓存
- **认证**: JWT + 中间件认证
- **安全**: Helmet + CORS + 限流 + XSS防护
- **日志**: Winston 结构化日志
- **测试**: Jest + Supertest 单元/集成测试
- **部署**: PM2 + Docker + Nginx
- **监控**: 健康检查端点 + 性能监控

### 前端
- **框架**: Vue.js 3 + Composition API + TypeScript
- **构建**: Vite 4.0+ 快速构建工具
- **UI库**: Element Plus 现代化组件库
- **路由**: Vue Router 4 SPA路由管理
- **状态**: Pinia 轻量级状态管理
- **样式**: SCSS + 响应式设计
- **部署**: Nginx + 静态资源优化

## 📁 项目结构

```
production-package/
├── backend/                    # 🚀 后端服务
│   ├── src/                   # 源代码目录
│   │   ├── controllers/       # 🎮 控制器层
│   │   ├── models/           # 📊 数据模型
│   │   ├── routes/           # 🛣️ 路由配置
│   │   ├── services/         # 🔧 业务逻辑层
│   │   ├── middlewares/      # 🛡️ 中间件（认证、安全、日志）
│   │   ├── config/           # ⚙️ 配置文件
│   │   └── utils/            # 🛠️ 工具函数（日志、缓存）
│   ├── tests/                # 🧪 测试文件
│   │   ├── controllers/      # 控制器测试
│   │   ├── middlewares/      # 中间件测试
│   │   ├── utils/            # 工具函数测试
│   │   └── setup.ts          # 测试环境配置
│   ├── sql/                  # 📂 数据库脚本
│   ├── logs/                 # 📝 日志文件目录
│   ├── coverage/             # 📊 测试覆盖率报告
│   ├── dist/                 # 🏗️ 构建输出目录
│   ├── Dockerfile            # 🐳 Docker配置
│   ├── ecosystem.config.js   # 🔄 PM2配置
│   ├── jest.config.js        # 🧪 Jest测试配置
│   ├── tsconfig.json         # 📝 TypeScript配置
│   ├── .eslintrc.js          # 📏 ESLint代码规范
│   ├── package.json          # 📦 依赖配置
│   └── .env.example          # 🔐 环境变量示例
├── frontend/                  # 🎨 前端应用
│   ├── src/                  # 源代码目录
│   │   ├── views/            # 📄 页面组件
│   │   ├── components/       # 🧩 通用组件
│   │   ├── layouts/          # 🏗️ 布局组件
│   │   ├── stores/           # 📦 状态管理
│   │   ├── router/           # 🛣️ 路由配置
│   │   ├── api/              # 🔌 API接口
│   │   └── utils/            # 🛠️ 工具函数
│   ├── public/               # 📁 静态资源
│   ├── dist/                 # 🏗️ 构建输出
│   ├── Dockerfile            # 🐳 Docker配置
│   ├── nginx.conf            # 🌐 Nginx配置
│   ├── package.json          # 📦 依赖配置
│   └── .env.example          # 🔐 环境变量示例
├── docker-compose.yml         # 🐳 Docker编排配置
├── start-production.bat       # 🚀 生产环境启动脚本
├── start-development.bat      # 🛠️ 开发环境启动脚本
├── USER_MANUAL.md            # 📖 用户使用手册
├── QUICK_START.md            # ⚡ 快速开始指南
├── TECHNICAL_GUIDE.md        # 🔬 技术架构文档
├── LICENSE                   # 📄 开源许可证
└── README.md                 # 📚 项目说明（本文件）
```

## 🚀 快速开始

### 📋 环境要求

| 组件 | 版本要求 | 说明 |
|------|----------|------|
| **Node.js** | >= 16.0.0 | 推荐使用 LTS 版本 |
| **MySQL** | >= 8.0 | 主数据库，需要支持JSON类型 |
| **Redis** | >= 6.0 | 缓存服务，可选但强烈推荐 |
| **操作系统** | Windows/Linux/macOS | 跨平台支持 |

### 📖 文档导航

在开始之前，推荐阅读以下文档：

- 📖 **[用户手册](USER_MANUAL.md)** - 详细的功能说明和使用指南
- ⚡ **[快速开始](QUICK_START.md)** - 5分钟快速部署指南
- 🔬 **[技术文档](TECHNICAL_GUIDE.md)** - 系统架构和开发指南

### 🛠️ 安装步骤

#### 方法一：一键启动（推荐新手）

```bash
# 1. 克隆项目
git clone https://github.com/RemotePinee/big-data-query-system.git
cd big-data-query-system/production-package

# 2. 配置环境变量（重要！）
cp backend/.env.example backend/.env
# 编辑 backend/.env 文件，配置数据库连接等

# 3. 初始化数据库
mysql -u root -p your_database_name < backend/sql/production-init-db.sql

# 4. 一键启动开发环境
./start-development.bat  # Windows
# 或者 chmod +x start-development.sh && ./start-development.sh  # Linux/macOS
```

#### 方法二：手动分步安装

<details>
<summary>🔧 点击展开详细步骤</summary>

**1. 后端设置**
```bash
cd backend
npm install

# 配置环境变量（必须配置）
cp .env.example .env
# 编辑 .env 文件，填入数据库连接信息

# 运行测试确保配置正确
npm test

# 启动开发服务器
npm run dev
```

**2. 前端设置**
```bash
cd frontend
npm install

# 配置环境变量（可选）
cp .env.example .env

# 启动开发服务器
npm run dev
```

</details>

#### 🌐 访问应用

| 服务 | 地址 | 说明 |
|------|------|------|
| 🎨 **前端应用** | http://localhost:5176 | 用户界面 |
| 🚀 **后端API** | http://localhost:3000 | API服务 |
| 👑 **管理后台** | http://localhost:5176/admin | 管理界面 |
| 📊 **健康检查** | http://localhost:3000/api/health | 系统状态 |
| 📖 **API文档** | http://localhost:3000/api | 接口文档 |

## ⚙️ 配置说明

### 🔐 后端环境变量（必须配置）

后端 `.env` 文件包含所有关键配置，**必须正确配置才能运行**：

<details>
<summary>📝 点击查看完整配置示例</summary>

```env
# ===========================================
# 基础服务配置
# ===========================================
PORT=3000
NODE_ENV=development

# ===========================================
# 域名配置（生产环境必须修改）
# ===========================================
FRONTEND_URL=http://localhost:5176
API_BASE_URL=http://localhost:3000/api

# ===========================================
# 数据库配置（必须配置）
# ===========================================
DB_HOST=localhost:3306
DB_USER=your_db_user
DB_PASSWORD=your_secure_password
DB_NAME=your_database_name

# ===========================================
# JWT安全配置（必须配置）
# ===========================================
JWT_SECRET=your_very_long_and_secure_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# ===========================================
# Redis缓存配置（推荐配置）
# ===========================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# ===========================================
# 日志配置
# ===========================================
LOG_LEVEL=info
LOG_DIR=./logs

# ===========================================
# 安全限流配置
# ===========================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ===========================================
# 支付回调配置（自动使用API_BASE_URL）
# ===========================================
WECHAT_NOTIFY_URL=${API_BASE_URL}/payments/notify/wechat
ALIPAY_NOTIFY_URL=${API_BASE_URL}/payments/notify/alipay
EPAY_NOTIFY_URL=${API_BASE_URL}/payments/notify/epay
```

</details>

### 🎨 前端环境变量（可选配置）

前端配置相对简单，通常使用默认值即可：

```env
# 开发环境配置示例
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_TITLE=大数据查询系统
VITE_APP_ENV=development
```

> **💡 提示**：前端环境变量通常不需要修改，系统会自动使用合适的默认值。**主要配置工作集中在后端**。

### 🔒 安全配置建议

| 配置项 | 安全建议 | 示例 |
|--------|----------|------|
| **JWT_SECRET** | 使用64位以上随机字符串 | `openssl rand -hex 64` |
| **DB_PASSWORD** | 使用强密码，包含大小写字母、数字、特殊字符 | `MyStr0ng!P@ssw0rd` |
| **NODE_ENV** | 生产环境必须设置为 `production` | `production` |
| **API_BASE_URL** | 生产环境使用HTTPS域名 | `https://api.yourdomain.com` |

## 🎯 主要功能

### 用户端功能
- 🔍 数据查询：支持复杂条件查询和筛选
- 📊 数据可视化：图表展示查询结果
- 💰 付费查询：支持付费获取高级数据
- 👤 用户管理：注册、登录、个人信息管理

### 管理端功能
- 📈 数据统计仪表板：实时展示系统关键指标
- 👥 用户管理：查看和管理所有用户
- 📋 订单管理：查看和处理所有订单
- 💹 趋势分析：自动计算和展示数据趋势
- 📊 图表分析：用户增长、订单量、收入等可视化分析

## 🚀 生产环境部署

### 🐳 Docker 部署（推荐）

**一键部署整个系统**：

```bash
# 1. 配置环境变量
cp backend/.env.example backend/.env
# 编辑 backend/.env 文件

# 2. 启动所有服务
docker-compose up -d

# 3. 查看服务状态
docker-compose ps
```

### 🔧 传统部署方式

<details>
<summary>📦 点击展开传统部署步骤</summary>

#### 后端部署

```bash
cd backend

# 1. 安装依赖
npm install --production

# 2. 运行测试
npm test

# 3. 构建项目
npm run build

# 4. 使用PM2启动（推荐）
npm install -g pm2
pm2 start ecosystem.config.js

# 或者直接启动
npm start
```

#### 前端部署

```bash
cd frontend

# 1. 安装依赖
npm install

# 2. 构建生产版本
npm run build

# 3. 部署到Web服务器
# 将 dist/ 目录内容部署到 Nginx/Apache
```

</details>

### 🌐 部署架构

```
用户请求 → Nginx (反向代理) → Node.js (后端API)
    ↓                                ↓
静态文件服务                      MySQL + Redis
```

### 📊 部署后验证

| 检查项 | 验证地址 | 预期结果 |
|--------|----------|----------|
| 🎯 **健康检查** | `/api/health` | `{"status":"ok"}` |
| 📈 **系统状态** | `/api/ping` | `{"message":"pong"}` |
| 🔧 **就绪检查** | `/api/ready` | 数据库连接正常 |
| 📊 **前端页面** | `/` | 正常加载用户界面 |
| 👑 **管理后台** | `/admin` | 管理员登录页面 |

## 🧪 开发与测试

### 🔍 代码质量保证

```bash
cd backend

# 运行测试套件
npm test                    # 运行所有测试
npm run test:watch         # 监听模式运行测试
npm run test:coverage      # 生成覆盖率报告

# 代码规范检查
npm run lint               # 检查代码规范
npm run lint:fix           # 自动修复代码规范问题

# 类型检查
npx tsc --noEmit          # TypeScript 类型检查
```

### 📊 测试覆盖率

当前测试覆盖率（持续改进中）：

| 类型 | 覆盖率 | 说明 |
|------|--------|------|
| 🧪 **整体覆盖率** | ~6% | 相比初始状态提升了100%+ |
| 🔗 **核心模块覆盖** | 高质量 | 健康检查(100%)、安全中间件(77%)、认证(86%)、日志(64%) |
| 🛡️ **测试框架** | ✅ 完整 | Jest + Supertest + TypeScript，67个测试用例 |

> **🎯 已完成**：健康检查、安全防护、用户认证、数据模型等核心模块的测试覆盖。

## 🤝 贡献指南

我们欢迎所有形式的贡献！请遵循以下步骤：

### 📋 贡献流程

1. **Fork 本仓库** 到你的 GitHub 账户
2. **创建特性分支** (`git checkout -b feature/AmazingFeature`)
3. **遵循代码规范** 运行 `npm run lint` 检查
4. **编写测试** 确保新功能有对应测试
5. **提交更改** (`git commit -m 'Add some AmazingFeature'`)
6. **推送分支** (`git push origin feature/AmazingFeature`)
7. **创建 Pull Request** 详细描述你的更改

### 📝 提交规范

使用 [Conventional Commits](https://conventionalcommits.org/) 格式：

```
feat: 添加新功能
fix: 修复bug
docs: 更新文档
style: 代码格式调整
refactor: 代码重构
test: 添加测试
chore: 构建工具或依赖更新
```

## 📄 许可证

本项目采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) 许可证。

### 🚫 禁止商业使用
- 不允许将本软件用于商业目的
- 不允许销售基于本代码的软件产品
- 如需商业使用，请联系作者获取商业许可

### ✅ 允许的使用
- 个人学习和研究
- 非营利组织使用
- 教育用途
- 开源项目贡献

**商业许可咨询**：如需商业使用，请通过 GitHub Issues 联系我们。

## 🆘 获取帮助

### 📚 文档资源

遇到问题时，请按以下顺序查找解决方案：

1. **📖 查看文档**：
   - [用户手册](USER_MANUAL.md) - 功能使用说明
   - [快速开始](QUICK_START.md) - 部署问题解决
   - [技术文档](TECHNICAL_GUIDE.md) - 架构和开发指南

2. **🔍 常见问题**：
   - 数据库连接失败 → 检查 `.env` 配置
   - JWT认证失败 → 确认 `JWT_SECRET` 配置
   - 端口冲突 → 修改 `PORT` 环境变量
   - Redis连接失败 → 检查Redis服务状态

3. **💬 寻求帮助**：
   - [GitHub Issues](https://github.com/RemotePinee/big-data-query-system/issues)
   - 邮件联系：614807355@qq.com

### 🐛 Bug报告模板

```markdown
**问题描述**：简要描述遇到的问题

**环境信息**：
- 操作系统：Windows/Linux/macOS
- Node.js版本：
- MySQL版本：
- Redis版本：

**复现步骤**：
1. 执行了什么操作
2. 期望的结果
3. 实际的结果

**错误日志**：粘贴相关错误信息
```

## 📊 项目状态

![GitHub stars](https://img.shields.io/github/stars/RemotePinee/big-data-query-system)
![GitHub forks](https://img.shields.io/github/forks/RemotePinee/big-data-query-system)
![GitHub issues](https://img.shields.io/github/issues/RemotePinee/big-data-query-system)
![GitHub license](https://img.shields.io/github/license/RemotePinee/big-data-query-system)

### 🏆 项目特点

- ✅ **生产就绪**：企业级安全防护和性能优化
- 🧪 **测试框架完整**：Jest + TypeScript 配置，核心模块已测试
- 📖 **文档齐全**：详细的用户手册和技术文档
- 🐳 **容器化**：支持Docker一键部署
- 🔒 **安全可靠**：多层安全防护，数据加密存储
- 🚀 **高性能**：Redis缓存，数据库优化
- 🎯 **易维护**：结构化日志，健康检查端点

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给个 Star 支持一下！**

Made with ❤️ by [RemotePinee](https://github.com/RemotePinee)

</div>
