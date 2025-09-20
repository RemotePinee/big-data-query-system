# 🚀 大数据查询系统 - 快速入门指南

## 📋 系统启动（5分钟上手）

### 1. 环境准备
```bash
# 确保已安装
- Node.js >= 16.0.0
- MySQL >= 5.7
- Redis (可选)
```

### 2. 一键启动
```bash
# 开发环境（推荐）
双击 start-development.bat

# 或手动启动
cd backend && npm run dev
cd frontend && npm run dev
```

### 3. 访问系统
- 🌐 **用户端**：http://localhost:5176
- 👨‍💼 **管理后台**：http://localhost:5176/admin
- 🔧 **API接口**：http://localhost:3000/api

---

## 👤 普通用户使用流程

### Step 1: 注册登录
1. 访问首页 → 点击"注册"
2. 填写用户名、密码 → 完成注册
3. 使用账号密码登录系统

### Step 2: 数据查询
1. 点击"数据查询" → 选择查询类型
2. 填写查询参数 → 确认费用
3. 选择支付方式 → 完成支付
4. 等待查询完成 → 查看结果

### Step 3: 个人中心
- 📊 **我的订单**：查看订单状态和历史
- 👤 **个人资料**：修改头像、密码等
- 💰 **账户余额**：查看余额和消费记录

---

## 👨‍💼 管理员使用流程

### Step 1: 登录管理后台
1. 访问：http://localhost:5176/admin
2. 使用管理员账户登录

### Step 2: 系统配置
1. **查询项目管理**：添加/编辑查询项目
2. **API配置**：配置第三方数据源
3. **支付配置**：设置支付接口参数
4. **系统设置**：配置网站基本信息

### Step 3: 日常管理
- 📊 **仪表板**：查看系统运行数据
- 👥 **用户管理**：管理用户账户
- 📋 **订单管理**：处理用户订单
- 💳 **支付管理**：监控支付状态

---

## 📱 移动端使用

系统自动检测设备类型，移动端用户会自动跳转到移动版界面。

**移动端地址**：http://localhost:5176/mobile

---

## ⚙️ 重要配置

### 数据库配置
编辑 `backend/.env` 文件：
```env
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
```

### 域名配置（生产环境）
```env
FRONTEND_URL=https://your-domain.com
API_BASE_URL=https://your-domain.com/api
```

---

## 🔧 常用命令

```bash
# 后端相关
cd backend
npm install          # 安装依赖
npm run dev          # 开发模式
npm run build        # 构建生产版本
npm start            # 启动生产版本
npm test             # 运行测试

# 前端相关
cd frontend
npm install          # 安装依赖
npm run dev          # 开发模式
npm run build        # 构建生产版本
npm run preview      # 预览构建结果
```

---

## 🆘 遇到问题？

### 启动失败
1. 检查Node.js版本：`node --version`
2. 检查端口占用：3000和5176端口
3. 查看错误日志：`backend/logs/app.log`

### 数据库连接失败
1. 确认MySQL服务已启动
2. 检查数据库配置参数
3. 运行数据库初始化脚本

### 支付功能异常
1. 检查支付接口配置
2. 确认回调地址设置
3. 查看支付日志文件

---

## 📞 技术支持

- **邮箱**：614807355@qq.com
- **详细文档**：查看 `USER_MANUAL.md`
- **系统健康检查**：http://localhost:3000/api/health

---

**🎉 恭喜！您已完成系统的基本配置，现在可以开始使用了！**
