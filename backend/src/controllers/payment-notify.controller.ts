import { Request, Response } from 'express';
import { OrderModel } from '../models/order.model';
import { PaymentConfigModel } from '../models/payment-config.model';
import * as crypto from 'crypto';

export class PaymentNotifyController {
  // 处理微信支付回调
  static async handleWechatNotify(req: Request, res: Response) {
    try {
      console.log('=== 微信支付回调 ===');
      console.log('回调数据:', req.body);
      
      // 解析XML数据
      const xmlData = req.body;
      // 这里需要解析XML并验证签名
      
      // 返回成功响应
      res.set('Content-Type', 'application/xml');
      res.send('<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>');
    } catch (error) {
      console.error('微信支付回调处理失败:', error);
      res.set('Content-Type', 'application/xml');
      res.send('<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[处理失败]]></return_msg></xml>');
    }
  }

  // 处理支付宝回调
  static async handleAlipayNotify(req: Request, res: Response) {
    try {
      console.log('=== 支付宝回调 ===');
      console.log('回调数据:', req.body);
      
      // 验证签名并处理订单状态
      
      res.send('success');
    } catch (error) {
      console.error('支付宝回调处理失败:', error);
      res.send('fail');
    }
  }

  // 处理易支付回调
  static async handleEpayNotify(req: Request, res: Response) {
    try {
      console.log('=== 易支付回调 ===');
      console.log('回调数据:', req.body);
      
      const {
        pid,        // 商户ID
        trade_no,   // 易支付订单号
        out_trade_no, // 商户订单号
        type,       // 支付方式
        name,       // 商品名称
        money,      // 订单金额
        trade_status, // 交易状态
        sign        // 签名
      } = req.body;
      
      // 获取易支付配置
      const paymentConfig = await PaymentConfigModel.findByCode('epay');
      if (!paymentConfig) {
        throw new Error('易支付配置不存在');
      }
      
      // 验证签名
      const isValidSign = this.verifyEpaySign(req.body, paymentConfig.apiKey || '');
      if (!isValidSign) {
        throw new Error('签名验证失败');
      }
      
      // 查找订单
      const order = await OrderModel.findByOrderNo(out_trade_no);
      if (!order) {
        throw new Error('订单不存在');
      }
      
      // 更新订单状态
      if (trade_status === 'TRADE_SUCCESS') {
        await OrderModel.updateStatus(order.id, 'paid');
        console.log(`订单 ${out_trade_no} 支付成功`);
      } else {
        console.log(`订单 ${out_trade_no} 支付状态: ${trade_status}`);
      }
      
      // 返回成功响应
      res.send('success');
    } catch (error) {
      console.error('易支付回调处理失败:', error);
      res.send('fail');
    }
  }

  // 验证易支付签名
  private static verifyEpaySign(params: any, apiKey: string): boolean {
    try {
      const { sign, ...otherParams } = params;
      
      // 按字典序排序参数
      const sortedKeys = Object.keys(otherParams).sort();
      const stringA = sortedKeys
        .filter(key => otherParams[key] !== '' && otherParams[key] !== null)
        .map(key => `${key}=${otherParams[key]}`)
        .join('&');
      
      // 拼接密钥
      const stringSignTemp = `${stringA}${apiKey}`;
      
      // MD5加密
      const calculatedSign = crypto.createHash('md5').update(stringSignTemp, 'utf8').digest('hex');
      
      return calculatedSign === sign;
    } catch (error) {
      console.error('签名验证失败:', error);
      return false;
    }
  }
}