import express from 'express';
import { PaymentConfigController } from '../controllers/payment-config.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { adminMiddleware } from '../middlewares/admin.middleware';

const router = express.Router();

// 获取所有支付配置
router.get('/', authMiddleware, adminMiddleware, PaymentConfigController.getAll);

// 根据ID获取支付配置
router.get('/:id', authMiddleware, adminMiddleware, PaymentConfigController.getById);

// 创建支付配置
router.post('/', authMiddleware, adminMiddleware, PaymentConfigController.create);

// 更新支付配置
router.put('/:id', authMiddleware, adminMiddleware, PaymentConfigController.update);

// 删除支付配置
router.delete('/:id', authMiddleware, adminMiddleware, PaymentConfigController.delete);

// 切换激活状态
router.patch('/:id/toggle', authMiddleware, adminMiddleware, PaymentConfigController.toggleActive);

// 测试支付配置
router.post('/:id/test', authMiddleware, adminMiddleware, PaymentConfigController.testConfig);

export default router;