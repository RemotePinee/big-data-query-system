# 🚀 GitHub开源发布指南

## ✅ **必须推送的文件**

### 📁 **项目核心代码**
```
✅ backend/src/                     # 后端源代码
✅ frontend/src/                    # 前端源代码
✅ backend/tests/                   # 测试代码
✅ backend/sql/                     # 数据库初始化脚本
✅ backend/package.json             # 后端依赖配置
✅ frontend/package.json            # 前端依赖配置
```

### 🔧 **配置文件**
```
✅ backend/tsconfig.json            # TypeScript配置
✅ backend/tsconfig.build.json      # 构建配置
✅ backend/tsconfig.test.json       # 测试配置
✅ backend/jest.config.js           # Jest测试配置
✅ frontend/vite.config.ts          # Vite配置
✅ frontend/tsconfig.json           # 前端TypeScript配置
```

### 🐳 **部署配置**
```
✅ docker-compose.yml               # Docker编排配置
✅ backend/Dockerfile               # 后端Docker配置
✅ frontend/Dockerfile              # 前端Docker配置
✅ frontend/nginx.conf              # Nginx配置
✅ backend/ecosystem.config.js      # PM2配置
```

### 📚 **文档文件**
```
✅ README.md                        # 项目说明
✅ LICENSE                          # 开源协议
✅ USER_MANUAL.md                   # 用户手册
✅ TECHNICAL_GUIDE.md               # 技术文档
✅ QUICK_START.md                   # 快速开始
✅ backend/TESTING_STRATEGY.md      # 测试策略
✅ GITHUB_PUBLISHING_GUIDE.md       # 本文档
```

### 🎯 **便民脚本**
```
✅ start-development.bat            # 开发环境启动脚本
✅ start-production.bat             # 生产环境启动脚本
```

### 📝 **示例配置**
```
✅ backend/.env.example             # 环境变量示例（需创建）
✅ frontend/.env.example            # 前端环境变量示例（需创建）
```

---

## ❌ **不要推送的文件** (已在.gitignore中)

### 🔒 **敏感信息**
```
❌ backend/.env                     # 包含数据库密码、API密钥
❌ frontend/.env                    # 包含API地址等配置
❌ backend/.env.production          # 生产环境配置
```

### 📦 **构建产物**
```
❌ backend/dist/                    # 编译后的JS文件
❌ frontend/dist/                   # 前端构建产物
❌ backend/node_modules/            # 依赖包
❌ frontend/node_modules/           # 前端依赖包
```

### 📊 **运行时数据**
```
❌ backend/logs/                    # 日志文件
❌ backend/coverage/                # 测试覆盖率报告
❌ backend/uploads/                 # 用户上传文件
❌ *.log                            # 所有日志文件
```

### 🛠️ **开发工具文件**
```
❌ .vscode/                         # VS Code配置
❌ .idea/                           # IntelliJ IDEA配置
❌ *.swp, *.swo                     # Vim临时文件
```

---

## 🎯 **推送前必做清单**

### 1. ✅ 创建环境变量示例文件
```bash
# 创建后端环境变量示例
cp backend/.env backend/.env.example
# 然后手动移除敏感信息，只保留变量名和说明
```

### 2. ✅ 检查敏感信息
- [ ] 数据库密码已移除
- [ ] API密钥已移除  
- [ ] 域名和IP地址已替换为示例值
- [ ] 支付配置已移除或示例化

### 3. ✅ 验证构建
```bash
# 测试后端构建
cd backend && npm run build

# 测试前端构建  
cd frontend && npm run build

# 运行测试
cd backend && npm test
```

### 4. ✅ 更新文档
- [ ] README.md包含完整的安装说明
- [ ] 技术文档是最新的
- [ ] 用户手册完整
- [ ] 快速开始指南可用

---

## 📋 **推荐的.env.example内容结构**

### backend/.env.example
```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# JWT配置
JWT_SECRET=your_jwt_secret_key

# 服务配置
PORT=3000
NODE_ENV=production

# 支付配置示例（请替换为实际值）
WECHAT_APP_ID=your_wechat_app_id
WECHAT_MCH_ID=your_wechat_mch_id
ALIPAY_APP_ID=your_alipay_app_id
```

---

## 🚀 **推送命令**

```bash
# 1. 检查当前状态
git status

# 2. 添加所有需要的文件
git add .

# 3. 提交
git commit -m "feat: 初始化开源项目"

# 4. 推送到GitHub
git push origin main
```

---

## ⚠️ **安全提醒**

1. **永远不要**推送包含真实密码的文件
2. **务必检查**commit历史中是否包含敏感信息
3. **定期审查**.gitignore文件是否完整
4. **使用GitHub Secrets**存储CI/CD中的敏感配置

---

## 🎉 **开源项目优化建议**

1. **添加GitHub Actions**进行自动化测试
2. **创建Issue模板**方便用户反馈问题
3. **设置PR模板**规范贡献流程
4. **添加CONTRIBUTING.md**说明贡献指南
5. **使用语义化版本**管理发布

**记住：开源的目标是让其他人能够轻松理解、安装和使用您的项目！**
