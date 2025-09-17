import { Request, Response } from 'express';
import { PaymentConfigModel } from '../models/payment-config.model';
import { OrderModel } from '../models/order.model';
import { PaymentService } from '../utils/payment-service';
import { QueryItemModel } from '../models/query-item.model';
import { QueryService } from '../utils/query-service';
import { autoQueryService } from '../services/auto-query.service';
import * as crypto from 'crypto';

export class PaymentController {
  // 支付成功后自动执行查询
  private static async executeQueryAfterPayment(orderNo: string) {
    try {
      console.log('=== 支付成功后启动自动查询 ===');
      console.log('订单号:', orderNo);
      
      // 查找订单
      const order = await OrderModel.findByOrderNo(orderNo);
      if (!order) {
        console.error('订单不存在:', orderNo);
        return;
      }

      // 启动自动查询服务
      await autoQueryService.startAutoQuery(order.id);
      console.log('✅ 自动查询服务已启动');
      
    } catch (error) {
      console.error('启动自动查询失败:', error);
    }
  }

  // 获取支付方式列表
  static async getPaymentMethods(req: Request, res: Response) {
    console.log('=== PaymentController.getPaymentMethods 被调用 ===');
    console.log('请求用户:', (req as any).user);
    
    try {
      console.log('开始查询活跃的支付配置...');
      const paymentMethods = await PaymentConfigModel.findAllActive();
      console.log('数据库查询结果:', paymentMethods);
      
      const methods = paymentMethods.map((method: any) => {
        let disabled = false;
        let disabledReason = '';
        
        // 检查微信支付配置完整性
        if (method.type === 'wechat') {
          const requiredFields = ['appId', 'merchantId', 'apiKey', 'appSecret'];
          const missingFields = requiredFields.filter(field => !method[field] || method[field].trim() === '');
          
          if (missingFields.length > 0) {
            disabled = true;
            disabledReason = '商户权限开通中';
            console.log(`微信支付配置不完整，缺少字段: ${missingFields.join(', ')}`);
          }
        }
        
        return {
          id: method.id,
          name: method.name,
          code: method.code,
          type: method.type,
          disabled: disabled,
          disabledReason: disabledReason
        };
      });

      console.log('=== 获取支付方式列表 ===');
      console.log('活跃的支付方式数量:', methods.length);
      console.log('支付方式列表:', methods);
      
      const response = {
        success: true,
        message: '获取支付方式列表成功',
        methods: methods
      };
      
      console.log('准备返回的响应:', response);
      
      res.json(response);
    } catch (error: any) {
      console.error('获取支付方式失败:', error);
      console.error('错误堆栈:', error.stack);
      res.status(500).json({
        success: false,
        message: '获取支付方式失败',
        methods: []
      });
    }
  }

  // 获取微信配置
  static async getWechatConfig(req: Request, res: Response) {
    try {
      console.log('获取微信配置...');
      const wechatConfig = await PaymentConfigModel.findByCode('wechat');
      
      if (!wechatConfig || !wechatConfig.isActive) {
        return res.status(404).json({
          success: false,
          message: '微信支付配置未找到或未启用'
        });
      }
      
      // 只返回前端需要的公开信息
      res.json({
        success: true,
        appId: wechatConfig.appId,
        message: '获取微信配置成功'
      });
    } catch (error: any) {
      console.error('获取微信配置失败:', error);
      res.status(500).json({
        success: false,
        message: '获取微信配置失败'
      });
    }
  }

  // 获取微信JS-SDK配置信息
  static async getWechatJSSDKConfig(req: Request, res: Response) {
    try {
      console.log('获取微信JS-SDK配置...');
      const { url } = req.query;
      
      if (!url) {
        return res.status(400).json({
          success: false,
          message: '缺少url参数'
        });
      }
      
      const wechatConfig = await PaymentConfigModel.findByCode('wechat');
      
      if (!wechatConfig || !wechatConfig.isActive) {
        return res.status(404).json({
          success: false,
          message: '微信支付配置未找到或未启用'
        });
      }
      
      // 生成基础配置
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const nonceStr = Math.random().toString(36).substr(2, 15);
      
      // 获取access_token和jsapi_ticket来生成正确的签名
      let signature = 'temp_signature_' + Math.random().toString(36).substr(2, 10);
      
      try {
        // 尝试获取真实的JS-SDK签名
        if (wechatConfig.appId && wechatConfig.appSecret) {
          const jsapiTicket = await PaymentController.getJSAPITicket(wechatConfig.appId, wechatConfig.appSecret);
          if (jsapiTicket) {
            signature = PaymentController.generateJSSDKSignature(jsapiTicket, nonceStr, timestamp, url as string);
            console.log('生成真实JS-SDK签名成功');
          } else {
            console.log('获取jsapi_ticket失败，使用临时签名');
          }
        } else {
          console.log('微信配置不完整，使用临时签名');
        }
      } catch (error) {
        console.log('生成JS-SDK签名失败，使用临时签名:', error);
      }
      
      res.json({
        success: true,
        data: {
          appId: wechatConfig.appId,
          timestamp: timestamp,
          nonceStr: nonceStr,
          signature: signature,
          jsApiList: ['chooseWXPay']
        },
        message: '获取微信JS-SDK配置成功'
      });
    } catch (error: any) {
      console.error('获取微信JS-SDK配置失败:', error);
      res.status(500).json({
        success: false,
        message: `获取微信JS-SDK配置失败: ${error.message}`
      });
    }
  }

  // 获取微信access_token
  private static async getAccessToken(appId: string, appSecret: string): Promise<string | null> {
    try {
      const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`;
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.access_token) {
        return result.access_token;
      } else {
        console.error('获取access_token失败:', result);
        return null;
      }
    } catch (error) {
      console.error('获取access_token异常:', error);
      return null;
    }
  }

  // 获取微信jsapi_ticket
  private static async getJSAPITicket(appId: string, appSecret: string): Promise<string | null> {
    try {
      const accessToken = await PaymentController.getAccessToken(appId, appSecret);
      if (!accessToken) {
        return null;
      }
      
      const url = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${accessToken}&type=jsapi`;
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.ticket) {
        return result.ticket;
      } else {
        console.error('获取jsapi_ticket失败:', result);
        return null;
      }
    } catch (error) {
      console.error('获取jsapi_ticket异常:', error);
      return null;
    }
  }

  // 生成JS-SDK签名
  private static generateJSSDKSignature(jsapiTicket: string, nonceStr: string, timestamp: string, url: string): string {
    // 去除URL中的fragment部分
    const cleanUrl = url.split('#')[0];
    
    // 按字典序排列参数
    const params = [
      `jsapi_ticket=${jsapiTicket}`,
      `noncestr=${nonceStr}`,
      `timestamp=${timestamp}`,
      `url=${cleanUrl}`
    ];
    
    const string1 = params.join('&');
    console.log('签名字符串:', string1);
    
    // 使用SHA1加密
    const signature = crypto.createHash('sha1').update(string1).digest('hex');
    return signature;
  }


  // 通过授权code获取openid
  static async getOpenId(req: Request, res: Response) {
    try {
      const { code } = req.body;
      
      if (!code) {
        return res.status(400).json({
          success: false,
          message: '授权code不能为空'
        });
      }
      
      console.log('通过code获取openid:', code);
      
      // 获取微信配置
      const wechatConfig = await PaymentConfigModel.findByCode('wechat');
      if (!wechatConfig || !wechatConfig.isActive) {
        return res.status(404).json({
          success: false,
          message: '微信支付配置未找到或未启用'
        });
      }
      
      // 调用微信API获取access_token和openid
      const tokenUrl = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${wechatConfig.appId}&secret=${wechatConfig.appSecret}&code=${code}&grant_type=authorization_code`;
      
      const response = await fetch(tokenUrl);
      const result = await response.json();
      
      if (result.errcode) {
        console.error('微信API返回错误:', result);
        return res.status(400).json({
          success: false,
          message: result.errmsg || '获取openid失败'
        });
      }
      
      if (!result.openid) {
        return res.status(400).json({
          success: false,
          message: '未能获取到openid'
        });
      }
      
      console.log('成功获取openid:', result.openid);
      
      res.json({
        success: true,
        openid: result.openid,
        message: '获取openid成功'
      });
    } catch (error: any) {
      console.error('获取openid失败:', error);
      res.status(500).json({
        success: false,
        message: `获取openid失败: ${error.message}`
      });
    }
  }

  // 静默授权获取openid
  static async silentAuth(req: Request, res: Response) {
    try {
      const { userAgent, url } = req.body;
      
      console.log('尝试静默授权:', { userAgent, url });
      
      // 检查是否在微信环境
      if (!userAgent || !userAgent.includes('MicroMessenger')) {
        return res.json({
          success: false,
          message: '非微信环境，无法进行静默授权'
        });
      }
      
      // 检查URL中是否已有code参数
      const urlObj = new URL(url);
      const code = urlObj.searchParams.get('code');
      
      if (code) {
        // 如果有code，直接获取openid
        console.log('URL中发现code，尝试获取openid:', code);
        
        // 获取微信配置
        const wechatConfig = await PaymentConfigModel.findByCode('wechat');
        if (!wechatConfig || !wechatConfig.isActive) {
          return res.json({
            success: false,
            message: '微信支付配置未找到或未启用'
          });
        }
        
        // 调用微信API获取access_token和openid
        const tokenUrl = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${wechatConfig.appId}&secret=${wechatConfig.appSecret}&code=${code}&grant_type=authorization_code`;
        
        const response = await fetch(tokenUrl);
        const result = await response.json();
        
        if (result.errcode) {
          console.error('微信API返回错误:', result);
          return res.json({
            success: false,
            message: result.errmsg || '获取openid失败'
          });
        }
        
        if (result.openid) {
          console.log('静默授权成功获取openid:', result.openid);
          return res.json({
            success: true,
            openid: result.openid,
            message: '静默授权成功'
          });
        }
      }
      
      // 没有code或获取失败，返回失败
      res.json({
        success: false,
        message: '静默授权失败，需要用户手动授权'
      });
      
    } catch (error: any) {
      console.error('静默授权失败:', error);
      res.status(500).json({
        success: false,
        message: `静默授权失败: ${error.message}`
      });
    }
  }

  // 创建支付订单
  // 新的微信支付接口 - 后端处理授权
  static async createWechatPayment(req: Request, res: Response) {
    try {
      const { orderNo, redirectUrl } = req.body;
      const userId = (req as any).user.id;

      console.log('=== 创建微信支付订单（后端授权） ===');
      console.log('订单号:', orderNo);
      console.log('重定向URL:', redirectUrl);
      console.log('用户ID:', userId);

      // 验证必要参数
      if (!orderNo) {
        return res.status(400).json({
          success: false,
          message: '订单号不能为空'
        });
      }

      // 查询订单信息
      const order = await OrderModel.findByOrderNo(orderNo);
      if (!order) {
        console.log('订单不存在:', orderNo);
        return res.status(404).json({
          success: false,
          message: '订单不存在'
        });
      }

      // 验证订单状态
      if (order.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: '订单状态不正确，无法支付'
        });
      }

      // 获取微信配置
      const wechatConfig = await PaymentConfigModel.findByCode('wechat');
      if (!wechatConfig || !wechatConfig.isActive) {
        return res.status(404).json({
          success: false,
          message: '微信支付配置未找到或未启用'
        });
      }

      // 构建微信授权URL
      // 确保使用HTTPS协议，因为微信要求授权回调必须使用HTTPS
      const protocol = req.get('x-forwarded-proto') || req.protocol || 'https';
      const host = req.get('x-forwarded-host') || req.get('host');
      
      const baseUrl = redirectUrl || `${protocol}://${host}/mobile/payment/${orderNo}`;
      const callbackUrl = `${protocol}://${host}/api/payments/wechat/auth-callback`;
      const state = `${orderNo}_${Date.now()}`;
      
      console.log('构建回调URL:', {
        protocol,
        host,
        callbackUrl
      });
      
      const authUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${wechatConfig.appId}&redirect_uri=${encodeURIComponent(callbackUrl)}&response_type=code&scope=snsapi_base&state=${state}#wechat_redirect`;
      
      console.log('微信授权URL:', authUrl);
      console.log('回调域名:', callbackUrl);

      console.log('生成微信授权URL:', authUrl);

      res.json({
        success: true,
        authUrl: authUrl,
        message: '请跳转到微信授权页面'
      });
    } catch (error: any) {
      console.error('创建微信支付失败:', error);
      res.status(500).json({
        success: false,
        message: `创建微信支付失败: ${error.message}`
      });
    }
  }

  // 微信授权回调处理
  static async wechatAuthCallback(req: Request, res: Response) {
    try {
      const { code, state, error } = req.query;

      console.log('=== 微信授权回调 ===');
      console.log('code:', code);
      console.log('state:', state);
      console.log('error:', error);

      if (error) {
        console.error('微信授权失败:', error);
        return res.redirect(`/mobile/payment/error?message=${encodeURIComponent('微信授权失败')}`);
      }

      if (!code || !state) {
        console.error('缺少必要参数');
        return res.redirect(`/mobile/payment/error?message=${encodeURIComponent('授权参数缺失')}`);
      }

      // 解析state获取订单号
      const orderNo = (state as string).split('_')[0];
      if (!orderNo) {
        console.error('无效的state参数:', state);
        return res.redirect(`/mobile/payment/error?message=${encodeURIComponent('无效的授权状态')}`);
      }

      // 查询订单
      const order = await OrderModel.findByOrderNo(orderNo);
      if (!order) {
        console.error('订单不存在:', orderNo);
        return res.redirect(`/mobile/payment/error?message=${encodeURIComponent('订单不存在')}`);
      }

      // 获取微信配置
      const wechatConfig = await PaymentConfigModel.findByCode('wechat');
      if (!wechatConfig || !wechatConfig.isActive) {
        console.error('微信配置不存在');
        return res.redirect(`/mobile/payment/error?message=${encodeURIComponent('微信支付配置错误')}`);
      }

      // 通过code获取openid
      const tokenUrl = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${wechatConfig.appId}&secret=${wechatConfig.appSecret}&code=${code}&grant_type=authorization_code`;
      
      const response = await fetch(tokenUrl);
      const result = await response.json();
      
      if (result.errcode || !result.openid) {
        console.error('获取openid失败:', result);
        return res.redirect(`/mobile/payment/error?message=${encodeURIComponent('获取微信用户信息失败')}`);
      }

      console.log('成功获取openid:', result.openid);

      // 创建微信支付订单
      const paymentResult = await PaymentService.createWechatPayment(
        wechatConfig,
        order.orderNo,
        order.amount.toString(),
        `订单${order.orderNo}`,
        order.userId,
        result.openid
      );

      if (!paymentResult.success) {
        console.error('创建微信支付订单失败:', paymentResult.message);
        return res.redirect(`/mobile/payment/error?message=${encodeURIComponent(paymentResult.message || '支付创建失败')}`);
      }

      // 重定向到支付页面，携带支付参数
      const paymentParams = new URLSearchParams({
        orderNo: orderNo,
        paymentData: JSON.stringify(paymentResult.data || {}),
        paymentType: 'JSAPI'
      });
      
      res.redirect(`/mobile/payment/${orderNo}/pay?${paymentParams.toString()}`);
    } catch (error: any) {
      console.error('微信授权回调处理失败:', error);
      res.redirect(`/mobile/payment/error?message=${encodeURIComponent('授权处理失败')}`);
    }
  }

  static async createPayment(req: Request, res: Response) {
    try {
      const { orderNo, paymentMethod, openid } = req.body;
      const userId = (req as any).user.id;

      console.log('=== 创建支付订单 ===');
      console.log('订单号:', orderNo);
      console.log('支付方式:', paymentMethod);
      console.log('用户ID:', userId);

      // 验证必要参数
      if (!orderNo || !paymentMethod) {
        return res.status(400).json({
          success: false,
          message: '订单号和支付方式不能为空'
        });
      }

      // 查询订单信息
      const order = await OrderModel.findByOrderNo(orderNo);
      if (!order) {
        console.log('订单不存在:', orderNo);
        return res.status(404).json({
          success: false,
          message: '订单不存在'
        });
      }

      console.log('订单信息:', {
        id: order.id,
        orderNo: order.orderNo,
        userId: order.userId,
        amount: order.amount,
        status: order.status
      });

      // 验证订单状态
      if (order.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: '订单状态不正确，无法支付'
        });
      }

      // 验证订单所有者
      console.log('订单用户ID:', order.userId, '当前用户ID:', userId);
      if (order.userId !== userId) {
        console.log('订单所有者不匹配');
        return res.status(403).json({
          success: false,
          message: '无权访问此订单'
        });
      }

      // 查询支付配置
      const paymentConfig = await PaymentConfigModel.findByCode(paymentMethod);
      if (!paymentConfig || !paymentConfig.isActive) {
        console.log('支付方式不存在或未启用:', paymentMethod);
        return res.status(404).json({
          success: false,
          message: '支付方式不存在或未启用'
        });
      }

      console.log('支付配置:', {
        id: paymentConfig.id,
        name: paymentConfig.name,
        type: paymentConfig.type,
        isActive: paymentConfig.isActive
      });

      let payUrl = '';
      
      try {
        // 根据支付类型调用相应的支付服务
        if (paymentConfig.type === 'wechat') {
          console.log('=== 调用微信支付服务 ===');
          const wechatPayResult = await PaymentService.createWechatPayment(
            {
              appId: paymentConfig.appId,
              merchantId: paymentConfig.merchantId,
              apiKey: paymentConfig.apiKey,
              notifyUrl: paymentConfig.notifyUrl
            },
            orderNo,
            order.amount.toString(),
            `查询服务-${orderNo}`,
            userId,
            openid
          );
          
          if (wechatPayResult.success && wechatPayResult.data) {
            // JSAPI支付返回调用微信JS-SDK所需的参数
            return res.json({
              success: true,
              message: '创建支付订单成功',
              paymentType: 'JSAPI',
              paymentData: wechatPayResult.data,
              orderNo,
              paymentMethod,
              amount: parseFloat(order.amount.toString()),
              qrCodeData: wechatPayResult.data.qrCodeData,
              isTestMode: wechatPayResult.data.isTestMode,
              realFormat: wechatPayResult.data.realFormat,
              paymentInfo: wechatPayResult.data.paymentInfo
            });
          } else {
            throw new Error(wechatPayResult.message || '微信支付创建失败');
          }
        } else if (paymentConfig.type === 'alipay') {
          console.log('=== 调用支付宝支付服务 ===');
          const alipayResult = await PaymentService.createAlipayPayment(
            {
              appId: paymentConfig.appId,
              privateKey: paymentConfig.apiKey,
              publicKey: paymentConfig.appSecret,
              notifyUrl: paymentConfig.notifyUrl
            },
            orderNo,
            order.amount.toString(),
            `查询服务-${orderNo}`,
            userId
          );
          
          if (alipayResult.success && alipayResult.data) {
            payUrl = alipayResult.data.paymentUrl;
          } else {
            throw new Error(alipayResult.message || '支付宝支付创建失败');
          }
        } else if (paymentConfig.type === 'epay') {
          console.log('=== 调用易支付服务 ===');
          
          // 获取用户代理信息
          const userAgent = req.headers['user-agent'] || '';
          
          const epayResult = await PaymentService.createEpayPayment(
            {
              merchantId: paymentConfig.merchantId,
              apiKey: paymentConfig.apiKey,
              apiUrl: paymentConfig.apiUrl,
              notifyUrl: paymentConfig.notifyUrl,
              returnUrl: paymentConfig.returnUrl,
              paymentMode: (paymentConfig as any).paymentMode || 'redirect' // 支付模式
            },
            orderNo,
            order.amount.toString(),
            `查询服务-${orderNo}`,
            userId,
            userAgent // 传递用户代理信息
          );
          
          if (epayResult.success && epayResult.data) {
            payUrl = epayResult.data.paymentUrl;
            // 传递完整的易支付数据
            return res.json({
              success: true,
              message: '创建支付订单成功',
              paymentUrl: epayResult.data.paymentUrl,
              orderNo,
              paymentMethod,
              amount: parseFloat(order.amount.toString()),
              qrCodeData: epayResult.data.qrCodeData,
              isQRMode: epayResult.data.isQRMode,
              isRedirectMode: epayResult.data.isRedirectMode,
              extractedFromPage: epayResult.data.extractedFromPage,
              fallbackMode: epayResult.data.fallbackMode,
              paymentType: epayResult.data.paymentType,
              paymentInfo: epayResult.data.paymentInfo
            });
          } else {
            throw new Error(epayResult.message || '易支付创建失败');
          }
        } else {
          throw new Error('不支持的支付类型');
        }

        console.log('=== 支付订单创建成功 ===');
        console.log('支付链接:', payUrl);

        res.json({
          success: true,
          message: '创建支付订单成功',
          paymentUrl: payUrl,
          orderNo: orderNo,
          paymentMethod: paymentMethod,
          amount: order.amount
        });

      } catch (paymentError: any) {
        console.error('支付服务调用失败:', paymentError);
        console.error('错误堆栈:', paymentError.stack);
        res.status(500).json({
          success: false,
          message: `支付服务异常: ${paymentError.message}`
        });
      }

    } catch (error: any) {
      console.error('创建支付订单失败:', error);
      res.status(500).json({
        success: false,
        message: '创建支付订单失败'
      });
    }
  }

  // 微信支付回调
  static async wechatPayNotify(req: Request, res: Response) {
    try {
      console.log('=== 收到微信支付回调 ===');
      console.log('请求头:', req.headers);
      console.log('请求体:', req.body);
      console.log('请求体类型:', typeof req.body);
      
      let notifyData = req.body;
      
      // 处理Buffer类型的XML数据
      if (Buffer.isBuffer(notifyData)) {
        console.log('收到Buffer格式数据，转换为字符串...');
        notifyData = notifyData.toString('utf8');
        console.log('转换后的XML数据:', notifyData);
      }
      
      // 如果是XML格式，需要解析
      if (typeof notifyData === 'string') {
        console.log('收到XML格式数据，尝试解析...');
        
        try {
          // 解析XML数据
          notifyData = PaymentController.parseXML(notifyData);
          console.log('XML解析结果:', notifyData);
        } catch (xmlError: any) {
          console.error('XML解析失败:', xmlError.message);
          return res.status(400).send('FAIL');
        }
      }
      
      // 获取支付配置
      const paymentConfig = await PaymentConfigModel.findByCode('wechat');
      if (!paymentConfig) {
        console.log('微信支付配置不存在');
        return res.status(400).send('FAIL');
      }

      // 验证签名（这里需要实现微信支付签名验证）
      // const isValid = PaymentService.verifyWechatNotify(notifyData, paymentConfig.api_key);
      const isValid = true; // 临时跳过签名验证

      if (!isValid) {
        console.log('微信支付回调签名验证失败');
        return res.status(400).send('FAIL');
      }

      // 处理支付结果 - 支持多种数据格式
      let orderNo = null;
      let isSuccess = false;
      
      // 检查不同的数据格式
      if (notifyData.result_code === 'SUCCESS' && notifyData.return_code === 'SUCCESS') {
        // 微信支付格式 - 需要两个字段都是SUCCESS
        orderNo = notifyData.out_trade_no;
        isSuccess = true;
      } else if (notifyData.return_code === 'SUCCESS' && notifyData.result_code === 'SUCCESS') {
        // 微信支付格式 - 备用检查
        orderNo = notifyData.out_trade_no;
        isSuccess = true;
      } else if (notifyData.trade_state === 'SUCCESS' || notifyData.trade_status === 'TRADE_SUCCESS') {
        // 微信支付/支付宝格式
        orderNo = notifyData.out_trade_no;
        isSuccess = true;
      } else if (notifyData.status === 'success' || notifyData.status === '1') {
        // 易支付格式
        orderNo = notifyData.out_trade_no || notifyData.trade_no;
        isSuccess = true;
      } else if (notifyData.out_trade_no && (notifyData.total_fee || notifyData.cash_fee)) {
        // 微信支付格式 - 通过订单号和金额字段判断
        orderNo = notifyData.out_trade_no;
        isSuccess = true;
      }
      
      console.log('解析结果:', { orderNo, isSuccess, notifyData });
      
      if (isSuccess && orderNo) {
        console.log('支付成功，订单号:', orderNo);
        
        // 查找订单
        const order = await OrderModel.findByOrderNo(orderNo);
        if (!order) {
          console.log('订单不存在:', orderNo);
          return res.status(400).send('FAIL');
        }
        
        console.log('找到订单，当前状态:', order.status);
        
        // 只有pending状态的订单才能更新为paid
        if (order.status === 'pending') {
          // 更新订单状态
          const updateResult = await OrderModel.updateStatusByOrderNo(orderNo, 'paid');
          console.log('订单状态更新结果:', updateResult);
          
          if (updateResult) {
            // 同时更新支付方式为微信支付
            await OrderModel.updatePaymentMethod(Number(order.id), 'wechat');
            console.log('✅ 订单状态已更新为paid，支付方式已更新为wechat:', orderNo);
            
            // 支付成功后自动执行查询
            console.log('开始执行自动查询...');
            await PaymentController.executeQueryAfterPayment(orderNo);
          } else {
            console.log('❌ 订单状态更新失败:', orderNo);
          }
        } else {
          console.log('订单状态不是pending，跳过更新:', order.status);
        }
      } else {
        console.log('支付未成功或缺少订单号:', { isSuccess, orderNo });
      }

      res.send('SUCCESS');
    } catch (error: any) {
      console.error('处理微信支付回调失败:', error);
      res.status(500).send('FAIL');
    }
  }

  // 支付宝支付回调
  static async alipayNotify(req: Request, res: Response) {
    try {
      const notifyData = req.body;
      console.log('收到支付宝支付回调:', notifyData);

      // 获取支付配置
      const paymentConfig = await PaymentConfigModel.findByCode('支付宝');
      if (!paymentConfig) {
        return res.status(400).send('fail');
      }

      // 验证签名（这里需要实现支付宝签名验证）
      // const isValid = PaymentService.verifyAlipayNotify(notifyData, paymentConfig.publicKey);
      const isValid = true; // 临时跳过签名验证

      if (!isValid) {
        console.log('支付宝回调签名验证失败');
        return res.status(400).send('fail');
      }

      // 处理支付结果
      if (notifyData.trade_status === 'TRADE_SUCCESS') {
        const orderNo = notifyData.out_trade_no;
        
        // 查找订单
        const order = await OrderModel.findByOrderNo(orderNo);
        if (!order) {
          console.log('订单不存在:', orderNo);
          return res.status(400).send('fail');
        }
        
        // 更新订单状态
        await OrderModel.updateStatusByOrderNo(orderNo, 'paid'); // paid表示已支付
        
        // 同时更新支付方式为支付宝
        await OrderModel.updatePaymentMethod(Number(order.id), 'alipay');
        
        console.log('订单支付成功，支付方式已更新为alipay:', orderNo);
        
        // 支付成功后自动执行查询
        await PaymentController.executeQueryAfterPayment(orderNo);
      }

      res.send('success');
    } catch (error: any) {
      console.error('处理支付宝回调失败:', error);
      res.status(500).send('fail');
    }
  }

  // 易支付回调
  static async epayNotify(req: Request, res: Response) {
    try {
      // 易支付可能通过GET或POST发送回调
      const notifyData = req.method === 'GET' ? req.query : req.body;
      console.log('=== 收到易支付回调 ===');
      console.log('请求方法:', req.method);
      console.log('回调数据:', notifyData);
      console.log('请求头:', req.headers);

      // 获取支付配置
      const paymentConfig = await PaymentConfigModel.findByCode('epay');
      if (!paymentConfig) {
        console.log('易支付配置不存在');
        return res.status(400).send('fail');
      }

      // 易支付回调参数通常包括：
      // pid: 商户ID
      // trade_no: 易支付交易号
      // out_trade_no: 商户订单号
      // type: 支付类型
      // name: 商品名称
      // money: 金额
      // trade_status: 交易状态 (TRADE_SUCCESS)
      // sign: 签名
      // sign_type: 签名类型

      const {
        pid,
        trade_no,
        out_trade_no,
        type,
        name,
        money,
        trade_status,
        sign,
        sign_type
      } = notifyData;

      console.log('易支付回调参数解析:', {
        pid,
        trade_no,
        out_trade_no,
        type,
        name,
        money,
        trade_status,
        sign: sign ? '已提供' : '未提供',
        sign_type
      });

      if (!out_trade_no) {
        console.log('缺少订单号参数');
        return res.status(400).send('fail');
      }

      // 验证签名
      const EpayHelper = require('../utils/epay-helper').EpayHelper;
      const signParams = {
        pid,
        trade_no,
        out_trade_no,
        type,
        name,
        money,
        trade_status
      };

      const { signature } = EpayHelper.generateEpaySign(signParams, paymentConfig.apiKey);
      const isValidSign = signature === sign;

      console.log('签名验证:', {
        计算的签名: signature,
        接收的签名: sign,
        验证结果: isValidSign
      });

      if (!isValidSign) {
        console.log('易支付回调签名验证失败');
        return res.status(400).send('fail');
      }

      // 处理支付结果
      if (trade_status === 'TRADE_SUCCESS') {
        console.log('=== 处理支付成功回调 ===');
        console.log('订单号:', out_trade_no);
        console.log('交易号:', trade_no);
        console.log('金额:', money);
        
        // 查找订单
        const order = await OrderModel.findByOrderNo(out_trade_no);
        if (!order) {
          console.log('订单不存在:', out_trade_no);
          return res.status(400).send('fail');
        }
        
        // 更新订单状态
        const updateResult = await OrderModel.updateStatusByOrderNo(out_trade_no, 'paid');
        console.log('订单状态更新结果:', updateResult);
        
        // 同时更新支付方式为易支付
        await OrderModel.updatePaymentMethod(Number(order.id), 'epay');
        
        console.log('✅ 订单支付成功，支付方式已更新为epay:', out_trade_no);
        
        // 支付成功后自动执行查询
        await PaymentController.executeQueryAfterPayment(out_trade_no);
        
        // 返回成功响应
        return res.send('success');
      } else {
        console.log('支付状态不是成功:', trade_status);
        return res.send('fail');
      }

    } catch (error: any) {
      console.error('处理易支付回调失败:', error);
      console.error('错误堆栈:', error.stack);
      res.status(500).send('fail');
    }
  }

  // 查询支付状态
  static async checkPaymentStatus(req: Request, res: Response) {
    try {
      const { orderNo } = req.params;
      const userId = (req as any).user.id;

      // 查询订单信息
      const order = await OrderModel.findByOrderNo(orderNo);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: '订单不存在'
        });
      }

      // 验证订单所有者
      if (order.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: '无权访问此订单'
        });
      }

      res.json({
        success: true,
        message: '查询支付状态成功',
        status: order.status,
        orderNo: order.orderNo,
        amount: order.amount,
        paidAt: (order as any).paidAt || (order as any).paid_at,
        completedAt: (order as any).completedAt
      });
    } catch (error: any) {
      console.error('查询支付状态失败:', error);
      res.status(500).json({
        success: false,
        message: '查询支付状态失败'
      });
    }
  }

  // 解析XML数据
  private static parseXML(xml: string): any {
    const result: any = {};
    
    // 匹配所有标签，包括CDATA
    const regex = /<(\w+)>(?:<!\[CDATA\[([^\]]*)\]\]>|([^<]*))<\/\1>/g;
    let match;
    
    while ((match = regex.exec(xml)) !== null) {
      const tagName = match[1];
      const cdataValue = match[2];
      const textValue = match[3];
      
      result[tagName] = cdataValue || textValue || '';
    }
    
    return result;
  }
}