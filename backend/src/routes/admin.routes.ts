import { Router } from 'express';
import { ApiConfigController } from '../controllers/api-config.controller';
import { ApiTypeController } from '../controllers/api-type.controller';
import { StatisticsController } from '../controllers/statistics.controller';
import { UserController } from '../controllers/user.controller';
import { OrderController } from '../controllers/order.controller';
import { AdminController } from '../controllers/admin.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { adminMiddleware } from '../middlewares/admin.middleware';

const router = Router();

// 所有管理员路由都需要认证和管理员权限
router.use(authMiddleware);
router.use(adminMiddleware);

// API配置管理路由（复数形式 - 用于列表获取）
router.get('/api-configs', ApiConfigController.getApiConfigs);

// API配置管理路由（单数形式 - 用于单个操作）
router.get('/api-config/:id', ApiConfigController.getApiConfigById);
router.post('/api-config', ApiConfigController.createApiConfig);
router.put('/api-config/:id', ApiConfigController.updateApiConfig);
router.delete('/api-config/:id', ApiConfigController.deleteApiConfig);
router.post('/api-config/test', ApiConfigController.testApiConfig);

// API类型管理路由
router.get('/api-types', ApiTypeController.getApiTypes);
router.get('/api-types/:id', ApiTypeController.getApiTypeById);
router.post('/api-types', ApiTypeController.createApiType);
router.put('/api-types/:id', ApiTypeController.updateApiType);
router.delete('/api-types/:id', ApiTypeController.deleteApiType);

// 统计数据路由
router.get('/statistics/dashboard', StatisticsController.getDashboardStats);
router.get('/statistics/orders/chart', StatisticsController.getOrderChartData);
router.get('/statistics/revenue/chart', StatisticsController.getRevenueChartData);
router.get('/statistics/orders/recent', StatisticsController.getRecentOrders);
router.get('/statistics/users', StatisticsController.getUserStats);
router.get('/statistics/orders', StatisticsController.getOrderStats);

// 用户管理路由
router.get('/users', AdminController.getUsers);
router.put('/users/:id/status', AdminController.updateUserStatus);
router.delete('/users/:id', AdminController.deleteUser);

// 订单管理路由
router.get('/orders', OrderController.getAllOrders);
router.get('/orders/:id', OrderController.getOrderDetail);
router.delete('/orders/:id', OrderController.deleteOrder);

// 注销申请管理路由
router.get('/deletion-requests', AdminController.getDeletionRequests);
router.post('/deletion-requests/process', AdminController.processDeletionRequest);

// 系统统计路由
router.get('/stats', AdminController.getSystemStats);

export default router;
