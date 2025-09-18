# 大数据查询系统

一个基于 Node.js + Vue.js 的现代化大数据查询系统，提供高效的数据查询、分析和可视化功能。

## ✨ 特性

- 🚀 高性能数据查询引擎
- 📊 实时数据可视化和趋势分析
- 🔐 完整的用户权限管理
- 💳 集成支付系统
- 🛡️ 企业级安全防护
- 📱 响应式设计，支持移动端
- 📈 智能仪表板，实时统计数据
- 🔄 自动趋势计算和对比分析

## 🏗️ 技术栈

### 后端
- Node.js + Express.js
- TypeScript
- MySQL 数据库
- Redis 缓存
- JWT 身份认证
- RESTful API 设计
- 数据统计和趋势分析

### 前端
- Vue.js 3 + Composition API
- TypeScript
- Vite 构建工具
- Element Plus UI 组件库
- Vue Router 4 路由管理
- Pinia 状态管理

## 📁 项目结构

```
production-package/
├── backend/          # 后端代码
│   ├── src/         # 源代码
│   │   ├── controllers/  # 控制器层
│   │   ├── models/      # 数据模型
│   │   ├── routes/      # 路由配置
│   │   ├── services/    # 业务逻辑层
│   │   ├── middlewares/ # 中间件
│   │   ├── config/      # 配置文件
│   │   └── utils/       # 工具函数
│   ├── sql/         # 数据库初始化文件
│   ├── package.json # 依赖配置
│   └── .env.example # 环境变量示例
├── frontend/        # 前端代码
│   ├── src/         # 源代码
│   │   ├── views/       # 页面组件
│   │   ├── components/  # 通用组件
│   │   ├── layouts/     # 布局组件
│   │   ├── stores/      # 状态管理
│   │   ├── router/      # 路由配置
│   │   ├── api/         # API接口
│   │   └── utils/       # 工具函数
│   ├── public/      # 静态资源
│   ├── package.json # 依赖配置
│   └── .env.example # 环境变量示例
└── README.md        # 本文件
```

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- MySQL >= 5.7
- Redis >= 6.0

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/RemotePinee/big-data-query-system.git
   cd big-data-query-system/production-package
   ```

2. **后端设置**
   ```bash
   cd backend
   npm install
   
   # 配置环境变量
   cp .env.example .env
   # 编辑 .env 文件，填入你的数据库和其他配置信息
   
   # 初始化数据库
   mysql -u root -p your_database_name < sql/production-init-db.sql
   
   # 启动开发服务器
   npm run dev
   ```

3. **前端设置**
   ```bash
   cd frontend
   npm install
   
   # 配置环境变量
   cp .env.example .env
   # 编辑 .env 文件，配置API地址等信息
   
   # 启动开发服务器
   npm run dev
   ```

4. **访问应用**
   - 前端：http://localhost:5176
   - 后端API：http://localhost:3000
   - 管理后台：http://localhost:5176/admin

## 🔧 配置说明

### 后端环境变量（重要）

后端需要配置数据库、JWT、支付等关键信息：

```env
# 服务器配置
PORT=3000
NODE_ENV=development

# 域名配置（生产环境需要修改）
FRONTEND_URL=http://localhost:5176
API_BASE_URL=http://localhost:3000/api

# 数据库配置（必须配置）
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name

# JWT配置（必须配置）
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# 支付配置（可选）
# 微信支付、支付宝、易支付等配置...
```

### 前端环境变量（可选）

前端配置相对简单，通常使用默认值即可：

```env
# 开发环境配置示例
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_TITLE=大数据查询系统
VITE_APP_ENV=development
```

> **注意**：前端环境变量通常不需要修改，系统会自动使用合适的默认值。主要配置工作集中在后端。

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

## 📦 生产环境部署

### 后端部署

1. **构建项目**
   ```bash
   cd backend
   npm run build
   ```

2. **使用PM2启动**
   ```bash
   npm install -g pm2
   pm2 start dist/index.js --name "big-data-api"
   ```

### 前端部署

1. **构建项目**
   ```bash
   cd frontend
   npm run build
   ```

2. **部署到Web服务器**
   - 将 `dist` 目录的内容复制到Web服务器根目录
   - 配置Nginx或Apache等Web服务器

## 🤝 贡献指南

我们欢迎所有形式的贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

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

## 🆘 支持

如果你遇到任何问题，请：

1. 查看 [Issues](https://github.com/RemotePinee/big-data-query-system/issues) 页面
2. 创建新的 Issue 描述你的问题
3. 或者发送邮件到：614807355@qq.com

## 📊 项目状态

![GitHub stars](https://img.shields.io/github/stars/RemotePinee/big-data-query-system)
![GitHub forks](https://img.shields.io/github/forks/RemotePinee/big-data-query-system)
![GitHub issues](https://img.shields.io/github/issues/RemotePinee/big-data-query-system)
![GitHub license](https://img.shields.io/github/license/RemotePinee/big-data-query-system)
