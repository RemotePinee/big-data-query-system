import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import { testConnection } from './config/database';
import { initDatabase } from './utils/init-db';
import { cleanAndInsertTestOrders } from './utils/clean-orders';
import { SchedulerService } from './services/scheduler.service';
import { autoQueryService } from './services/auto-query.service';
import { logger, requestLogger } from './utils/logger';

// 加载环境变量
dotenv.config();

// 创建Express应用
const app: Express = express();
const port = process.env.PORT || 3000;

// 安全中间件
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// 限流中间件
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP在15分钟内最多100个请求
  message: {
    error: '请求过于频繁，请稍后再试'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// 压缩中间件
app.use(compression());

// 请求日志中间件
app.use(requestLogger);

// CORS配置 - 根据环境变量动态设置
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [
      process.env.FRONTEND_URL || 'https://cx.webui.asia'
    ]
  : [
      'http://localhost:5176',
      'http://127.0.0.1:5176',
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// XML解析中间件 - 专门处理微信支付回调
app.use('/api/payments/wechat/notify', express.raw({ type: 'application/xml' }));
app.use('/api/payments/wechat/notify', express.raw({ type: 'text/xml' }));
app.use('/api/payments/wechat/notify', express.text({ type: 'text/plain' }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 测试路由
app.get('/', (req: Request, res: Response) => {
  res.json({ message: '大数据查询系统API服务运行正常' });
});

// API根路径
app.get('/api', (req: Request, res: Response) => {
  res.json({ 
    message: '大数据查询系统API',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      queries: '/api/queries', 
      payments: '/api/payments',
      admin: {
        platformConfig: '/api/admin/platform-config'
      }
    }
  });
});

// 导入路由
import userRoutes from './routes/user.routes';
import queryRoutes from './routes/query.routes';
import orderRoutes from './routes/order.routes';
import paymentRoutes from './routes/payment.routes';
import paymentNotifyRoutes from './routes/payment-notify.routes';
import platformConfigRoutes from './routes/platform-config.routes';
import paymentConfigRoutes from './routes/payment-config.routes';
import adminRoutes from './routes/admin.routes';
import cleanupRoutes from './routes/cleanup.routes';
import systemSettingsRoutes from './routes/systemSettings';
import queryHistoryRoutes from './routes/query-history.routes';
import healthRoutes from './routes/health.routes';

// 注册路由
app.use('/api/auth', userRoutes); // 认证路由 (包含login)
app.use('/api/users', userRoutes); // 用户路由
app.use('/api/queries', queryRoutes); // 查询路由
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
// 注释掉重复的支付回调路由，使用payment.routes.ts中的回调处理
// app.use('/api/payment', paymentNotifyRoutes); // 支付回调路由
app.use('/api/query-history', queryHistoryRoutes); // 查询历史路由

// 管理员路由
app.use('/api/admin', adminRoutes);
app.use('/api/admin/platform-config', platformConfigRoutes);
app.use('/api/admin/payment-configs', paymentConfigRoutes);
app.use('/api/admin/cleanup', cleanupRoutes);

// 系统设置路由
app.use('/api', systemSettingsRoutes);

// 健康检查路由
app.use('/api', healthRoutes);

// 启动服务器
const startServer = async () => {
  try {
    // 测试数据库连接
    await testConnection();
    
    // 初始化数据库表
    await initDatabase();
    
    // 清理订单数据并插入测试数据 - 已注释，避免重启时重置订单状态
    // await cleanAndInsertTestOrders();
    
    // 定时任务已移至宝塔面板计划任务处理，不再在服务器启动时初始化
    // SchedulerService.initialize();
    
    // 恢复未完成的自动查询
    await autoQueryService.resumeIncompleteQueries();
    
    app.listen(port, () => {
      logger.info('🚀 服务器启动成功！');
      logger.info(`📍 服务地址: http://localhost:${port}`);
      logger.info(`📖 API文档: http://localhost:${port}/api`);
      logger.info('✅ 所有服务已就绪！');
    });
  } catch (error) {
    logger.error('服务器启动失败', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    process.exit(1);
  }
};

startServer();