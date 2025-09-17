# 大数据查询系统

一个基于 Node.js + Vue.js 的现代化大数据查询系统，提供高效的数据查询、分析和可视化功能。

## ✨ 特性

- 🚀 高性能数据查询引擎
- 📊 实时数据可视化
- 🔐 完整的用户权限管理
- 💳 集成支付系统
- 🛡️ 企业级安全防护
- 📱 响应式设计，支持移动端

## 🏗️ 技术栈

### 后端
- Node.js + Express.js
- TypeScript
- MySQL 数据库
- Redis 缓存
- JWT 身份认证

### 前端
- Vue.js 3
- TypeScript
- Vite 构建工具
- Element Plus UI 组件库

## 📁 项目结构

```
production-package/
├── backend/          # 后端代码
│   ├── src/         # 源代码
│   ├── sql/         # 数据库初始化文件
│   ├── package.json # 依赖配置
│   └── .env.example # 环境变量示例
├── frontend/        # 前端代码
│   ├── src/         # 源代码
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
   git clone https://github.com/your-username/big-data-query-system.git
   cd big-data-query-system
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
   - 前端：http://localhost:5173
   - 后端API：http://localhost:3000

## 🔧 配置说明

### 后端环境变量

```env
# 服务器配置
PORT=3000
NODE_ENV=development

# 数据库配置
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name

# JWT配置
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```

### 前端环境变量

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_TITLE=大数据查询系统
VITE_APP_ENV=development
```

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
