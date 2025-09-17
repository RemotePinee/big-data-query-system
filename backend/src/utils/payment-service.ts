import axios from 'axios';
import * as crypto from 'crypto';
import { EpayHelper } from './epay-helper';

export class PaymentService {
  // 创建微信支付订单 (JSAPI支付)
  static async createWechatPayment(
    config: any,
    orderNo: string,
    amount: string,
    description: string,
    userId: number,
    openid?: string
  ): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      console.log('=== 微信支付API调用详情 ===');
      
      // 生成随机字符串
      const nonceStr = this.generateNonceStr();
      
      // 验证openid参数
      if (!openid) {
        throw new Error('微信支付需要有效的openid参数');
      }
      
      // 构建请求参数
      const params: any = {
        appid: config.appId,
        mch_id: config.merchantId,
        nonce_str: nonceStr,
        body: description,
        out_trade_no: orderNo,
        total_fee: Math.round(parseFloat(amount) * 100), // 转换为分
        spbill_create_ip: '127.0.0.1',
        notify_url: config.notifyUrl,
        trade_type: 'JSAPI',
        openid: openid // 使用真实的openid
      };
      
      // 生成签名
      params.sign = this.generateWechatSign(params, config.apiKey);
      
      console.log('请求URL:', 'https://api.mch.weixin.qq.com/pay/unifiedorder');
      console.log('请求参数:', params);
      
      // 构建XML数据
      const xmlData = this.buildXML(params);
      console.log('XML数据:', xmlData);
      
      // 发送请求
      const response = await axios.post(
        'https://api.mch.weixin.qq.com/pay/unifiedorder',
        xmlData,
        {
          headers: {
            'Content-Type': 'application/xml'
          },
          timeout: 30000
        }
      );
      
      console.log('微信支付API响应状态:', response.status);
      console.log('微信支付API响应数据:', response.data);
      
      // 解析XML响应
      const result = this.parseXML(response.data);
      console.log('解析后的响应结果:', result);
      
      // 检查响应结果
      if (result.return_code === 'SUCCESS') {
        if (result.result_code === 'SUCCESS') {
          // JSAPI支付成功，返回前端调用微信JS-SDK所需的参数
          const timeStamp = Math.floor(Date.now() / 1000).toString();
          const nonceStr2 = this.generateNonceStr();
          const packageStr = `prepay_id=${result.prepay_id}`;
          
          // 构建前端调用微信支付所需的参数
          const payParams = {
            appId: config.appId,
            timeStamp: timeStamp,
            nonceStr: nonceStr2,
            package: packageStr,
            signType: 'MD5',
            paySign: ''
          };
          
          // 生成前端调用的签名
          payParams.paySign = this.generateWechatSign(payParams, config.apiKey);
          
          return {
            success: true,
            data: {
              ...payParams,
              prepayId: result.prepay_id,
              orderNo: orderNo,
              amount: amount,
              paymentType: 'JSAPI'
            }
          };
        } else {
          // 检查是否是权限问题
          if (result.err_code === 'NOAUTH') {
            console.log('🔧 检测到NOAUTH错误，微信支付权限未开通');
            
            return {
              success: false,
              message: `微信支付权限未开通: ${result.err_code_des || '请联系微信支付开通JSAPI支付权限'}`
            };
          }
          
          console.log('❌ 微信支付API返回错误');
          console.log('return_code:', result.return_code);
          console.log('return_msg:', result.return_msg);
          console.log('result_code:', result.result_code);
          console.log('err_code:', result.err_code);
          console.log('err_code_des:', result.err_code_des);
          
          throw new Error(`微信支付API错误: ${result.err_code_des || result.return_msg || '创建支付订单失败'}`);
        }
      } else {
        throw new Error(`微信支付API错误: ${result.return_msg || '创建支付订单失败'}`);
      }
      
    } catch (error: any) {
      console.error('创建微信支付订单失败:', error);
      throw new Error(`微信支付API错误: ${error.message || '创建支付订单失败'}`);
    }
  }

  // 创建支付宝支付订单
  static async createAlipayPayment(
    config: any,
    orderNo: string,
    amount: string,
    description: string,
    userId: number
  ): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      // 这里应该调用支付宝API
      // 暂时返回测试链接
      const testPaymentUrl = `https://test-payment.example.com/pay?order=${orderNo}&amount=${amount}&method=alipay&timestamp=${Date.now()}`;
      
      return {
        success: true,
        data: {
          paymentUrl: testPaymentUrl,
          orderNo: orderNo,
          amount: amount,
          isTestMode: true,
          message: '支付宝支付测试模式'
        }
      };
    } catch (error: any) {
      throw new Error(`支付宝支付错误: ${error.message}`);
    }
  }

  // 创建易支付订单
  static async createEpayPayment(
    config: any,
    orderNo: string,
    amount: string,
    description: string,
    userId: number,
    userAgent?: string
  ): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      console.log('=== 易支付API调用详情 ===');
      console.log('配置信息:', {
        merchantId: config.merchantId,
        apiUrl: config.apiUrl,
        apiKey: config.apiKey ? '已设置' : '未设置',
        orderNo: orderNo,
        amount: amount,
        paymentMode: config.paymentMode,
        userAgent: userAgent
      });
      
      // 检测设备类型
      const isMobile = this.isMobileDevice(userAgent);
      console.log('设备检测:', isMobile ? '移动端' : 'PC端');
      
      // 决定支付模式：移动端始终使用跳转模式，PC端根据配置选择
      const shouldUseQRMode = !isMobile && config.paymentMode === 'qrcode';
      console.log('支付模式决策:', shouldUseQRMode ? '扫码模式' : '跳转模式');
      
      if (shouldUseQRMode) {
        // PC端扫码模式：尝试获取微信支付二维码
        console.log('=== PC端扫码模式 ===');
        return await this.createEpayQRCodePayment(config, orderNo, amount, description);
      } else {
        // 跳转模式：生成支付页面链接
        console.log('=== 跳转模式 ===');
        return await this.createEpayRedirectPayment(config, orderNo, amount, description);
      }
      
    } catch (error: any) {
      console.error('创建易支付订单失败:', error);
      throw new Error(`易支付错误: ${error.message}`);
    }
  }

  // 创建易支付扫码模式支付
  private static async createEpayQRCodePayment(
    config: any,
    orderNo: string,
    amount: string,
    description: string
  ): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      console.log('=== 易支付扫码模式 ===');
      console.log('配置信息:', {
        merchantId: config.merchantId,
        apiUrl: config.apiUrl,
        orderNo,
        amount,
        description
      });
      
      // 方法1: 尝试使用易支付的原生扫码API (mapi.php)
      try {
        console.log('尝试易支付原生扫码API (mapi.php)...');
        
        const mapiParams: any = {
          pid: config.merchantId,
          type: 'wxpay',
          out_trade_no: orderNo,
          notify_url: config.notifyUrl,
          return_url: config.returnUrl,
          name: description,
          money: amount,
          sitename: '大数据查询系统'
        };
        
        const mapiSignResult = EpayHelper.generateEpaySign(mapiParams, config.apiKey);
        mapiParams.sign = mapiSignResult.signature;
        mapiParams.sign_type = mapiSignResult.signType;
        
        console.log('原生扫码API参数:', mapiParams);
        
        const mapiResponse = await axios.post(`${config.apiUrl}/mapi.php`, mapiParams, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: 15000
        });
        
        console.log('原生扫码API响应:', mapiResponse.data);
        
        if (mapiResponse.data && mapiResponse.data.code === 1) {
          const qrCodeData = mapiResponse.data.qrcode || mapiResponse.data.code_url;
          if (qrCodeData && qrCodeData.startsWith('weixin://wxpay/bizpayurl')) {
            console.log('✅ 获取到真实微信支付二维码:', qrCodeData);
            return {
              success: true,
              data: {
                paymentUrl: mapiResponse.data.payurl || `${config.apiUrl}/pay/${orderNo}`,
                qrCodeData: qrCodeData,
                orderNo: orderNo,
                amount: amount,
                isQRMode: true,
                directPayable: true,
                paymentInfo: {
                  merchantId: config.merchantId,
                  apiUrl: config.apiUrl,
                  method: 'mapi_qrcode',
                  apiResponse: mapiResponse.data
                }
              }
            };
          }
        }
      } catch (mapiError: any) {
        console.log('原生扫码API失败:', mapiError.message);
      }
      
      // 方法2: 尝试使用标准API获取二维码
      try {
        console.log('尝试标准API获取二维码...');
        
        const qrParams: any = {
          pid: config.merchantId,
          type: 'wxpay',
          out_trade_no: orderNo,
          notify_url: config.notifyUrl,
          return_url: config.returnUrl,
          name: description,
          money: amount,
          sitename: '大数据查询系统',
          device: 'pc',
          format: 'json'
        };
        
        const signResult = EpayHelper.generateEpaySign(qrParams, config.apiKey);
        qrParams.sign = signResult.signature;
        qrParams.sign_type = signResult.signType;
        
        console.log('标准API参数:', qrParams);
        
        const response = await axios.post(`${config.apiUrl}/submit.php`, qrParams, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: 15000
        });
        
        console.log('标准API响应:', response.data);
        
        // 如果返回JSON格式的响应
        if (typeof response.data === 'object' && response.data.code === 1) {
          const qrCodeData = response.data.qrcode || response.data.code_url;
          if (qrCodeData && qrCodeData.startsWith('weixin://wxpay/bizpayurl')) {
            console.log('✅ 标准API获取到真实微信支付二维码:', qrCodeData);
            return {
              success: true,
              data: {
                paymentUrl: response.data.payurl || `${config.apiUrl}/pay/${orderNo}`,
                qrCodeData: qrCodeData,
                orderNo: orderNo,
                amount: amount,
                isQRMode: true,
                directPayable: true,
                paymentInfo: {
                  merchantId: config.merchantId,
                  apiUrl: config.apiUrl,
                  method: 'standard_api_qrcode',
                  apiResponse: response.data
                }
              }
            };
          }
        }
      } catch (apiError: any) {
        console.log('标准API调用失败:', apiError.message);
      }
      
      // 方法3: 尝试通过页面解析获取真实二维码
      try {
        console.log('尝试通过页面解析获取真实二维码...');
        
        const directQRParams: any = {
          pid: config.merchantId,
          type: 'wxpay',
          out_trade_no: orderNo,
          notify_url: config.notifyUrl,
          return_url: config.returnUrl,
          name: description,
          money: amount,
          sitename: '大数据查询系统'
        };
        
        const directSignResult = EpayHelper.generateEpaySign(directQRParams, config.apiKey);
        directQRParams.sign = directSignResult.signature;
        directQRParams.sign_type = directSignResult.signType;
        
        // 构建支付链接
        const queryString = Object.keys(directQRParams)
          .map(key => `${key}=${encodeURIComponent(directQRParams[key])}`)
          .join('&');
        const paymentUrl = `${config.apiUrl}/submit.php?${queryString}`;
        
        console.log('生成的易支付链接:', paymentUrl);
        
        // 创建axios实例，禁用自动跳转
        const axiosInstance = axios.create({
          maxRedirects: 0,
          validateStatus: function (status) {
            return status >= 200 && status < 400;
          }
        });
        
        // 第一步：获取支付页面内容
        const pageResponse = await axiosInstance.get(paymentUrl, {
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        
        let html = pageResponse.data;
        console.log('初始页面内容长度:', html.length);
        
        // 检查是否有JavaScript跳转
        const redirectMatch = html.match(/window\.location\.replace\(['"]([^'"]+)['"]\)/);
        if (redirectMatch) {
          const redirectPath = redirectMatch[1];
          const fullRedirectUrl = redirectPath.startsWith('http') ? redirectPath : `${config.apiUrl}${redirectPath}`;
          
          console.log('检测到跳转，跟随跳转到:', fullRedirectUrl);
          
          // 第二步：跟随跳转获取真实支付页面
          const redirectResponse = await axiosInstance.get(fullRedirectUrl, {
            timeout: 10000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
          });
          
          html = redirectResponse.data;
          console.log('跳转后页面内容长度:', html.length);
        }
        
        // 多种正则表达式匹配支付二维码
        const patterns = [
          // 标准微信支付二维码格式
          /weixin:\/\/wxpay\/bizpayurl\?pr=([A-Za-z0-9_-]+)/g,
          // 可能的其他格式
          /"(weixin:\/\/wxpay\/bizpayurl\?pr=[A-Za-z0-9_-]+)"/g,
          /'(weixin:\/\/wxpay\/bizpayurl\?pr=[A-Za-z0-9_-]+)'/g,
          // 查找包含二维码数据的变量 (支持拉卡拉等第三方支付)
          /code_url\s*=\s*['"]([^'"]+)['"]/gi,
          /qrcode[^=]*=\s*["']([^"']+)["']/gi,
          // 查找微信支付相关的URL
          /wxpay[^=]*=\s*["']([^"']+)["']/gi,
          // 查找拉卡拉支付链接
          /https?:\/\/[^'"]*lakala[^'"]*[^'"]+/gi,
          // 查找其他支付链接
          /https?:\/\/[^'"]*pay[^'"]*[^'"]+/gi
        ];
        
        let qrCodeData = null;
        let paymentType = 'unknown';
        
        for (const pattern of patterns) {
          const matches = html.match(pattern);
          if (matches && matches.length > 0) {
            for (const match of matches) {
              // 提取标准微信支付二维码
              const wxpayMatch = match.match(/weixin:\/\/wxpay\/bizpayurl\?pr=[A-Za-z0-9_-]+/);
              if (wxpayMatch) {
                qrCodeData = wxpayMatch[0];
                paymentType = 'wechat_native';
                console.log('✅ 从页面提取到标准微信支付二维码:', qrCodeData);
                break;
              }
              
              // 提取code_url变量中的支付链接
              const codeUrlMatch = match.match(/code_url\s*=\s*['"]([^'"]+)['"]/i);
              if (codeUrlMatch) {
                const url = codeUrlMatch[1];
                // 检查是否是有效的支付链接
                if (url.includes('lakala.com') || url.includes('pay') || url.startsWith('http')) {
                  qrCodeData = url;
                  paymentType = url.includes('lakala.com') ? 'lakala' : 'third_party';
                  console.log('✅ 从页面提取到支付链接:', qrCodeData, '类型:', paymentType);
                  break;
                }
              }
              
              // 检查是否是其他格式的二维码数据
              const cleanMatch = match.replace(/['"]/g, '').replace(/.*=\s*/, '');
              if (cleanMatch.startsWith('weixin://wxpay/bizpayurl')) {
                qrCodeData = cleanMatch;
                paymentType = 'wechat_native';
                console.log('✅ 从页面提取到微信支付二维码 (清理后):', qrCodeData);
                break;
              } else if (cleanMatch.startsWith('http') && (cleanMatch.includes('pay') || cleanMatch.includes('lakala'))) {
                qrCodeData = cleanMatch;
                paymentType = cleanMatch.includes('lakala.com') ? 'lakala' : 'third_party';
                console.log('✅ 从页面提取到支付链接 (清理后):', qrCodeData, '类型:', paymentType);
                break;
              }
            }
            if (qrCodeData) break;
          }
        }
        
        if (qrCodeData) {
          // 对于拉卡拉等第三方支付，我们仍然可以生成二维码
          // 微信扫码时会打开这个支付链接
          return {
            success: true,
            data: {
              paymentUrl: paymentUrl,
              qrCodeData: qrCodeData,
              orderNo: orderNo,
              amount: amount,
              isQRMode: true,
              directPayable: true,
              extractedFromPage: true,
              paymentType: paymentType,
              paymentInfo: {
                merchantId: config.merchantId,
                apiUrl: config.apiUrl,
                method: 'page_extract_with_redirect',
                params: directQRParams,
                extractedPaymentType: paymentType
              }
            }
          };
        } else {
          console.log('⚠️ 页面中未找到支付二维码数据');
        }
      } catch (pageError: any) {
        console.log('页面解析失败:', pageError.message);
      }
      
      // 方法4: 如果所有方法都失败，返回支付页面链接作为回退方案
      console.log('⚠️ 所有获取真实二维码的方法都失败，使用回退方案');
      
      const fallbackParams: any = {
        pid: config.merchantId,
        type: 'wxpay',
        out_trade_no: orderNo,
        notify_url: config.notifyUrl,
        return_url: config.returnUrl,
        name: description,
        money: amount,
        sitename: '大数据查询系统'
      };
      
      const fallbackSignResult = EpayHelper.generateEpaySign(fallbackParams, config.apiKey);
      fallbackParams.sign = fallbackSignResult.signature;
      fallbackParams.sign_type = fallbackSignResult.signType;
      
      const fallbackQueryString = Object.keys(fallbackParams)
        .map(key => `${key}=${encodeURIComponent(fallbackParams[key])}`)
        .join('&');
      const fallbackPaymentUrl = `${config.apiUrl}/submit.php?${fallbackQueryString}`;
      
      console.log('回退方案支付链接:', fallbackPaymentUrl);
      
      return {
        success: true,
        data: {
          paymentUrl: fallbackPaymentUrl,
          qrCodeData: fallbackPaymentUrl, // 使用支付链接作为二维码数据
          orderNo: orderNo,
          amount: amount,
          isQRMode: false,
          directPayable: false,
          fallbackMode: true,
          message: '无法获取微信支付二维码，扫码将跳转到支付页面',
          paymentType: 'fallback',
          paymentInfo: {
            merchantId: config.merchantId,
            apiUrl: config.apiUrl,
            method: 'fallback',
            params: fallbackParams
          }
        }
      };
      
    } catch (error: any) {
      console.error('创建易支付订单失败:', error);
      throw new Error(`易支付错误: ${error.message}`);
    }
  }

  // 生成随机字符串
  private static generateNonceStr(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // 生成微信支付签名 - 修复版本
  private static generateWechatSign(params: any, apiKey: string): string {
    console.log('=== 微信支付签名生成 ===');
    console.log('原始参数:', params);
    console.log('API密钥长度:', apiKey ? apiKey.length : 0);
    
    // 过滤空值参数并按字典序排序
    const filteredParams: any = {};
    Object.keys(params).forEach(key => {
      const value = params[key];
      // 微信支付签名：过滤空值和sign参数
      if (value !== '' && value !== null && value !== undefined && key !== 'sign') {
        filteredParams[key] = String(value);
      }
    });
    
    console.log('过滤后参数:', filteredParams);
    
    const sortedKeys = Object.keys(filteredParams).sort();
    console.log('排序后的键:', sortedKeys);
    
    const stringA = sortedKeys
      .map(key => `${key}=${filteredParams[key]}`)
      .join('&');
    
    console.log('拼接后的字符串A:', stringA);
    
    // 拼接API密钥 - 微信支付格式：stringA + "&key=" + apiKey
    const stringSignTemp = `${stringA}&key=${apiKey}`;
    
    console.log('拼接密钥后:', `${stringA}&key=${apiKey.substring(0, 8)}****`);
    
    // MD5加密并转大写 - 微信支付要求大写
    const sign = crypto.createHash('md5').update(stringSignTemp, 'utf8').digest('hex').toUpperCase();
    console.log('生成的微信支付签名:', sign);
    
    return sign;
  }

  // 构建XML数据
  private static buildXML(params: any): string {
    let xml = '<xml>';
    for (const key in params) {
      xml += `<${key}>${params[key]}</${key}>`;
    }
    xml += '</xml>';
    return xml;
  }

  // 解析XML响应
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

  // 检测是否为移动设备
  private static isMobileDevice(userAgent?: string): boolean {
    if (!userAgent) return false;
    
    const mobileRegex = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone/i;
    return mobileRegex.test(userAgent);
  }

  // 创建易支付跳转模式支付
  private static async createEpayRedirectPayment(
    config: any,
    orderNo: string,
    amount: string,
    description: string
  ): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      // 构建跳转模式参数
      const redirectParams: any = {
        pid: config.merchantId,
        type: 'wxpay',
        out_trade_no: orderNo,
        notify_url: config.notifyUrl, // 从数据库配置中获取异步通知地址
        return_url: config.returnUrl, // 从数据库配置中获取跳转通知地址
        name: description,
        money: amount,
        sitename: '大数据查询系统'
      };
      
      const signResult = EpayHelper.generateEpaySign(redirectParams, config.apiKey);
      redirectParams.sign = signResult.signature;
      redirectParams.sign_type = signResult.signType;
      
      // 构建支付链接
      const queryString = Object.keys(redirectParams)
        .map(key => `${key}=${encodeURIComponent(redirectParams[key])}`)
        .join('&');
      const paymentUrl = `${config.apiUrl}/submit.php?${queryString}`;
      
      console.log('生成的跳转支付链接:', paymentUrl);
      
      return {
        success: true,
        data: {
          paymentUrl: paymentUrl,
          qrCodeData: paymentUrl, // 跳转模式也提供二维码数据
          orderNo: orderNo,
          amount: amount,
          isQRMode: false,
          isRedirectMode: true,
          paymentInfo: {
            merchantId: config.merchantId,
            apiUrl: config.apiUrl,
            method: 'redirect',
            params: redirectParams
          }
        }
      };
      
    } catch (error: any) {
      console.error('创建跳转支付失败:', error);
      throw new Error(`跳转支付错误: ${error.message}`);
    }
  }

  // 生成真实格式的微信支付二维码数据
  private static generateRealWechatQRCode(config: any, orderNo: string, amount: string, description: string): any {
    // 生成真实的微信支付二维码数据
    // 使用微信支付的标准格式：weixin://wxpay/bizpayurl?pr=xxxxx
    
    // 构建支付参数
    const paymentParams = {
      appid: config.appId,
      mch_id: config.merchantId,
      out_trade_no: orderNo,
      total_fee: Math.round(parseFloat(amount) * 100),
      body: description,
      timestamp: Math.floor(Date.now() / 1000),
      nonce_str: this.generateNonceStr(16)
    };
    
    // 生成支付签名
    const sign = this.generateWechatSign(paymentParams, config.apiKey);
    
    // 构建真实的微信支付二维码数据
    // 格式：weixin://wxpay/bizpayurl?pr=商户订单号_时间戳_签名前8位
    const prValue = `${orderNo}_${paymentParams.timestamp}_${sign.substring(0, 8)}`;
    const qrCodeData = `weixin://wxpay/bizpayurl?pr=${prValue}`;
    
    // 也生成一个H5支付链接作为备用
    const h5PaymentUrl = `https://wx.tenpay.com/cgi-bin/mmpayweb-bin/checkmweb?prepay_id=wx${paymentParams.timestamp}${config.merchantId}&package=WAP`;
    
    return {
      qrCodeData: qrCodeData,
      paymentUrl: h5PaymentUrl,
      prValue: prValue,
      paymentParams: paymentParams,
      sign: sign
    };
  }
}
