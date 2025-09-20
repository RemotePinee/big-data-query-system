# 🏗️ 大数据查询系统 - 技术架构文档

## 📊 系统架构概览

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端 (Vue.js)  │    │  后端 (Node.js)  │    │  数据库 (MySQL)  │
│                 │    │                 │    │                 │
│ - 用户界面      │◄──►│ - API接口       │◄──►│ - 用户数据      │
│ - 管理后台      │    │ - 业务逻辑      │    │ - 订单数据      │
│ - 移动端适配    │    │ - 数据处理      │    │ - 配置数据      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │ 缓存 (Redis)     │              │
         │              │                 │              │
         └──────────────►│ - 会话缓存      │◄─────────────┘
                        │ - 数据缓存      │
                        │ - 限流控制      │
                        └─────────────────┘
```

---

## 🛠️ 技术栈详解

### 前端技术栈
- **框架**：Vue.js 3 + Composition API
- **构建工具**：Vite 7.1.5
- **UI组件库**：Element Plus 2.11.2
- **路由管理**：Vue Router 4.5.1
- **状态管理**：Pinia 2.3.1
- **HTTP客户端**：Axios 1.12.1
- **图表库**：ECharts 5.6.0 + Vue-ECharts 7.0.3
- **图标库**：Lucide Vue Next + FontAwesome
- **样式**：CSS3 + 响应式设计

### 后端技术栈
- **运行环境**：Node.js >= 16.0.0
- **框架**：Express.js 4.21.2
- **语言**：TypeScript 4.9.5
- **数据库ORM**：原生MySQL2 3.15.0
- **身份认证**：JWT (jsonwebtoken 9.0.2)
- **密码加密**：bcryptjs 2.4.3
- **缓存**：Redis 4.7.1
- **定时任务**：node-cron 3.0.3
- **文件上传**：Multer 2.0.2
- **安全防护**：Helmet 8.1.0 + express-rate-limit 8.1.0

### 数据库设计
- **主数据库**：MySQL 8.0+
- **缓存数据库**：Redis 7.0+
- **数据库连接池**：MySQL2 连接池管理

---

## 📁 项目结构详解

```
production-package/
├── backend/                    # 后端代码
│   ├── src/                   # 源代码
│   │   ├── controllers/       # 控制器层
│   │   ├── models/           # 数据模型层
│   │   ├── routes/           # 路由层
│   │   ├── services/         # 业务逻辑层
│   │   ├── middlewares/      # 中间件
│   │   ├── utils/            # 工具函数
│   │   └── config/           # 配置文件
│   ├── tests/                # 测试文件
│   ├── logs/                 # 日志文件
│   ├── uploads/              # 上传文件
│   ├── dist/                 # 构建输出
│   ├── .env                  # 环境变量
│   ├── .env.example          # 环境变量示例
│   ├── package.json          # 依赖配置
│   ├── tsconfig.json         # TypeScript配置
│   ├── jest.config.js        # 测试配置
│   ├── .eslintrc.js          # 代码规范配置
│   ├── ecosystem.config.js   # PM2配置
│   └── Dockerfile            # Docker配置
├── frontend/                  # 前端代码
│   ├── src/                  # 源代码
│   │   ├── views/            # 页面组件
│   │   ├── components/       # 通用组件
│   │   ├── layouts/          # 布局组件
│   │   ├── stores/           # 状态管理
│   │   ├── router/           # 路由配置
│   │   ├── api/              # API接口
│   │   ├── utils/            # 工具函数
│   │   └── assets/           # 静态资源
│   ├── public/               # 公共资源
│   ├── dist/                 # 构建输出
│   ├── package.json          # 依赖配置
│   ├── vite.config.ts        # Vite配置
│   ├── tsconfig.json         # TypeScript配置
│   ├── nginx.conf            # Nginx配置
│   └── Dockerfile            # Docker配置
├── docker-compose.yml        # Docker编排
├── start-development.bat     # 开发环境启动脚本
├── start-production.bat      # 生产环境启动脚本
├── README.md                 # 项目说明
├── USER_MANUAL.md            # 用户手册
├── QUICK_START.md            # 快速入门
└── TECHNICAL_GUIDE.md        # 技术文档
```

---

## 🔧 核心功能模块

### 1. 用户认证模块
```typescript
// JWT认证流程
class AuthService {
  login(username, password) → JWT Token
  register(userInfo) → User Account
  verifyToken(token) → User Info
  refreshToken(token) → New Token
}
```

**特性**：
- JWT无状态认证
- 密码bcrypt加密
- 登录限流保护
- 自动token刷新

### 2. 数据查询模块
```typescript
// 查询处理流程
class QueryService {
  createQuery(params) → Order
  processQuery(orderId) → Query Result
  getResult(orderId) → Result Data
  downloadResult(orderId) → File Stream
}
```

**特性**：
- 多种数据源支持
- 异步查询处理
- 结果缓存机制
- 自动重试机制

### 3. 支付处理模块
```typescript
// 支付处理流程
class PaymentService {
  createPayment(orderId, amount) → Payment Order
  processCallback(paymentData) → Payment Status
  verifySignature(data, signature) → Boolean
  refundOrder(orderId, amount) → Refund Result
}
```

**支持的支付方式**：
- 微信支付（扫码、H5）
- 支付宝（扫码、网页）
- 易支付（第三方）

### 4. 缓存管理模块
```typescript
// 缓存策略
class CacheService {
  get(key) → Cached Data
  set(key, value, ttl) → Success
  del(key) → Success
  flush() → Success
}
```

**缓存策略**：
- 用户会话缓存（30分钟）
- 查询结果缓存（1小时）
- API响应缓存（5分钟）
- 配置数据缓存（24小时）

---

## 📊 数据库设计

### 核心数据表

#### 用户表 (users)
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  avatar VARCHAR(255),
  balance DECIMAL(10,2) DEFAULT 0.00,
  role ENUM('user','admin') DEFAULT 'user',
  status ENUM('active','inactive','suspended') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 订单表 (orders)
```sql
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  order_no VARCHAR(32) UNIQUE NOT NULL,
  query_item_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending','paid','processing','completed','cancelled') DEFAULT 'pending',
  query_params TEXT,
  result_data LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (query_item_id) REFERENCES query_items(id)
);
```

#### 查询项目表 (query_items)
```sql
CREATE TABLE query_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  api_config_id INT,
  status ENUM('active','inactive') DEFAULT 'active',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (api_config_id) REFERENCES api_configs(id)
);
```

### 数据库索引策略
```sql
-- 用户表索引
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- 订单表索引
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_order_no ON orders(order_no);

-- 查询项目索引
CREATE INDEX idx_query_items_status ON query_items(status);
CREATE INDEX idx_query_items_sort_order ON query_items(sort_order);
```

---

## 🔐 安全机制

### 1. 身份认证安全
- **JWT Token**：使用RS256算法签名
- **密码加密**：bcrypt + salt 加密存储
- **登录限流**：15分钟内最多5次尝试
- **Token过期**：7天自动过期，支持刷新

### 2. 接口安全防护
```typescript
// 安全中间件栈
app.use(helmet());                    // 安全头部
app.use(rateLimit({...}));           // 限流控制
app.use(sqlInjectionProtection);     // SQL注入防护
app.use(xssProtection);              // XSS防护
app.use(authenticate);               // 身份验证
```

### 3. 数据传输安全
- **HTTPS加密**：生产环境强制HTTPS
- **CORS配置**：严格的跨域访问控制
- **CSP策略**：内容安全策略防护
- **请求签名**：关键接口使用数字签名

### 4. 支付安全
- **签名验证**：所有支付回调验证签名
- **金额校验**：服务端验证支付金额
- **重复支付检测**：防止重复扣款
- **异常监控**：支付异常实时告警

---

## 📈 性能优化

### 1. 前端性能优化
```typescript
// Vite配置优化
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          ui: ['element-plus'],
          charts: ['echarts', 'vue-echarts']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'axios']
  }
});
```

**优化策略**：
- 代码分割和懒加载
- 静态资源压缩
- CDN加速
- 浏览器缓存策略

### 2. 后端性能优化
```typescript
// 缓存装饰器
@cache(3600) // 缓存1小时
async getQueryResult(orderId: number) {
  return await this.queryService.getResult(orderId);
}

// 数据库连接池
const pool = mysql.createPool({
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000
});
```

**优化策略**：
- Redis缓存热点数据
- 数据库连接池管理
- 异步处理长耗时任务
- 响应数据压缩

### 3. 数据库性能优化
```sql
-- 查询优化示例
-- 使用索引优化查询
EXPLAIN SELECT * FROM orders 
WHERE user_id = ? AND status = 'completed' 
ORDER BY created_at DESC 
LIMIT 10;

-- 分页查询优化
SELECT * FROM orders 
WHERE id > ? 
ORDER BY id 
LIMIT 10;
```

**优化策略**：
- 合理设计数据库索引
- 避免N+1查询问题
- 使用读写分离
- 定期清理冗余数据

---

## 🔍 监控和日志

### 1. 系统监控
```typescript
// 健康检查端点
app.get('/api/health', async (req, res) => {
  const health = {
    status: 'OK',
    timestamp: Date.now(),
    services: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      memory: process.memoryUsage(),
      uptime: process.uptime()
    }
  };
  res.json(health);
});
```

### 2. 日志管理
```typescript
// 结构化日志
logger.info('User login', {
  userId: user.id,
  username: user.username,
  ip: req.ip,
  userAgent: req.get('User-Agent')
});

logger.error('Payment failed', {
  orderId: order.id,
  amount: order.amount,
  error: error.message,
  stack: error.stack
});
```

**日志级别**：
- **ERROR**：系统错误和异常
- **WARN**：警告信息和潜在问题
- **INFO**：重要操作记录
- **DEBUG**：调试信息（开发环境）

### 3. 性能指标
- **响应时间**：API接口响应时间监控
- **并发量**：同时在线用户数统计
- **错误率**：接口错误率统计
- **资源使用**：CPU、内存、磁盘使用率

---

## 🚀 部署方案

### 1. Docker部署（推荐）
```bash
# 构建和启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f backend
```

### 2. PM2部署
```bash
# 安装PM2
npm install -g pm2

# 启动应用
pm2 start ecosystem.config.js

# 监控应用
pm2 monit
```

### 3. Nginx反向代理
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 4. 环境配置
```bash
# 生产环境变量
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
API_BASE_URL=https://your-domain.com/api

# 数据库配置
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-secure-password

# Redis配置
REDIS_HOST=your-redis-host
REDIS_PASSWORD=your-redis-password
```

---

## 🧪 测试策略

### 1. 单元测试
```typescript
// 用户服务测试示例
describe('UserService', () => {
  it('should register user successfully', async () => {
    const userData = {
      username: 'testuser',
      password: 'password123',
      email: 'test@example.com'
    };
    
    const user = await userService.register(userData);
    expect(user.username).toBe(userData.username);
    expect(user.password).not.toBe(userData.password); // 应该被加密
  });
});
```

### 2. 集成测试
```typescript
// API集成测试示例
describe('Auth API', () => {
  it('POST /api/auth/login', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'password123'
      });
      
    expect(response.status).toBe(200);
    expect(response.body.data.token).toBeDefined();
  });
});
```

### 3. 测试覆盖率
```bash
# 运行测试并生成覆盖率报告
npm run test:coverage

# 查看覆盖率报告
open coverage/lcov-report/index.html
```

**覆盖率目标**：
- 代码覆盖率 > 80%
- 分支覆盖率 > 70%
- 函数覆盖率 > 90%

---

## 📚 开发规范

### 1. 代码规范
```typescript
// ESLint + Prettier配置
// .eslintrc.js
module.exports = {
  extends: [
    '@typescript-eslint/recommended',
    'prettier'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn'
  }
};
```

### 2. Git工作流
```bash
# 功能开发流程
git checkout -b feature/new-feature
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature
# 创建Pull Request
```

**提交信息规范**：
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具变动

### 3. API设计规范
```typescript
// RESTful API设计
GET    /api/users          # 获取用户列表
POST   /api/users          # 创建用户
GET    /api/users/:id      # 获取指定用户
PUT    /api/users/:id      # 更新用户
DELETE /api/users/:id      # 删除用户

// 响应格式统一
{
  "code": 200,
  "message": "success",
  "data": {...},
  "timestamp": 1234567890
}
```

---

## 🔄 版本升级指南

### 升级前准备
1. **数据备份**：备份数据库和重要文件
2. **依赖检查**：检查依赖版本兼容性
3. **测试验证**：在测试环境验证升级

### 升级步骤
```bash
# 1. 停止服务
pm2 stop all

# 2. 备份代码
cp -r production-package production-package.backup

# 3. 更新代码
git pull origin main

# 4. 安装依赖
cd backend && npm install
cd ../frontend && npm install

# 5. 数据库迁移
npm run migrate

# 6. 构建项目
npm run build

# 7. 启动服务
pm2 start ecosystem.config.js
```

### 回滚方案
```bash
# 如果升级失败，快速回滚
pm2 stop all
rm -rf production-package
mv production-package.backup production-package
pm2 start ecosystem.config.js
```

---

## 📞 技术支持

### 开发团队联系方式
- **技术负责人**：614807355@qq.com
- **GitHub仓库**：[项目地址]
- **技术文档**：本文档

### 社区支持
- **Issue报告**：GitHub Issues
- **功能建议**：GitHub Discussions
- **安全问题**：私信联系维护者

---

*最后更新：2025年9月20日*
