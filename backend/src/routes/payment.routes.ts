import express from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();

// 获取支付方式列表
router.get('/methods', authMiddleware, PaymentController.getPaymentMethods);

// 创建支付订单
router.post('/create', authMiddleware, PaymentController.createPayment);

// 查询支付状态
router.get('/status/:orderNo', authMiddleware, PaymentController.checkPaymentStatus);

// 微信相关接口
router.get('/wechat/config', PaymentController.getWechatConfig); // 获取微信配置（不需要认证）
router.get('/wechat/jssdk-config', PaymentController.getWechatJSSDKConfig); // 获取微信JS-SDK配置（不需要认证）
router.post('/wechat/get-openid', PaymentController.getOpenId); // 获取openid（不需要认证）
router.post('/wechat/silent-auth', PaymentController.silentAuth); // 静默授权（不需要认证）
router.post('/wechat/create-payment', authMiddleware, PaymentController.createWechatPayment); // 创建微信支付（后端授权）
router.get('/wechat/auth-callback', PaymentController.wechatAuthCallback); // 微信授权回调（不需要认证）

// 支付回调路由（不需要认证）
router.post('/wechat/notify', PaymentController.wechatPayNotify);
router.post('/alipay/notify', PaymentController.alipayNotify);
router.post('/epay/notify', PaymentController.epayNotify);
router.get('/epay/notify', PaymentController.epayNotify); // 易支付可能使用GET回调

export default router;
