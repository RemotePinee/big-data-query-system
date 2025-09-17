import express from 'express';
import { PaymentController } from '../controllers/payment.controller';

const router = express.Router();

// 微信支付回调
router.post('/wechat/notify', PaymentController.wechatPayNotify);

// 支付宝支付回调
router.post('/alipay/notify', PaymentController.alipayNotify);

// 易支付回调 - 支持GET和POST两种方法
router.get('/epay/notify', PaymentController.epayNotify);
router.post('/epay/notify', PaymentController.epayNotify);

export default router;