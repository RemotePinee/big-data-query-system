import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// 获取用户订单统计
router.get('/stats', authMiddleware, OrderController.getUserOrderStats);

// 获取用户订单列表
router.get('/', authMiddleware, OrderController.getUserOrders);

// 通过订单号获取订单详情（必须在/:orderId之前）
router.get('/orderNo/:orderNo', authMiddleware, OrderController.getOrderDetailByOrderNo);

// 通过订单号下载查询结果（必须在/:orderId之前）
router.get('/orderNo/:orderNo/download', authMiddleware, OrderController.downloadOrderResult);

// 获取订单详情
router.get('/:orderId', authMiddleware, OrderController.getOrderDetail);

// 取消订单
router.put('/:orderId/cancel', authMiddleware, OrderController.cancelOrder);

// 删除订单（硬删除）
router.delete('/:id', authMiddleware, OrderController.deleteOrder);

export default router;