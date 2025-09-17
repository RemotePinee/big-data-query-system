/**
 * 微信支付工具类型声明
 */

interface WechatConfig {
  debug?: boolean;
  appId: string;
  timestamp: string;
  nonceStr: string;
  signature: string;
  jsApiList: string[];
}

interface PaymentData {
  appId: string;
  timeStamp: string;
  nonceStr: string;
  package: string;
  signType: string;
  paySign: string;
}

interface WechatPaymentResult {
  errMsg: string;
  [key: string]: any;
}

class WechatPayment {
  isSDKLoaded: boolean;
  loadingPromise: Promise<any> | null;

  constructor();

  /**
   * 动态加载微信JS-SDK
   */
  loadJSSDK(): Promise<any>;

  /**
   * 配置微信JS-SDK
   */
  configSDK(config: WechatConfig): Promise<void>;

  /**
   * 调用微信JSAPI支付
   */
  callJSAPIPay(paymentData: PaymentData): Promise<WechatPaymentResult>;

  /**
   * 检查是否在微信环境中
   */
  isWechatEnvironment(): boolean;
}

declare const wechatPayment: WechatPayment;

export default wechatPayment;