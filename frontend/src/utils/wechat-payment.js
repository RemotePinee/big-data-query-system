/**
 * 微信支付工具类
 * 处理微信JS-SDK加载和JSAPI支付
 */

class WechatPayment {
  constructor() {
    this.isSDKLoaded = false
    this.loadingPromise = null
  }

  /**
   * 动态加载微信JS-SDK
   * @returns {Promise} 返回微信JS-SDK对象
   */
  loadJSSDK() {
    // 如果已经在加载中，返回同一个Promise
    if (this.loadingPromise) {
      return this.loadingPromise
    }

    // 如果已经加载完成，直接返回
    if (window.wx && this.isSDKLoaded) {
      return Promise.resolve(window.wx)
    }

    this.loadingPromise = new Promise((resolve, reject) => {
      // 检查是否已经存在
      if (window.wx) {
        this.isSDKLoaded = true
        resolve(window.wx)
        return
      }

      // 动态创建script标签加载JS-SDK
      const script = document.createElement('script')
      script.src = 'https://res.wx.qq.com/open/js/jweixin-1.6.0.js'
      script.onload = () => {
        this.isSDKLoaded = true
        resolve(window.wx)
      }
      script.onerror = (error) => {
        console.error('微信JS-SDK加载失败:', error)
        reject(new Error('微信JS-SDK加载失败'))
      }
      document.head.appendChild(script)
    })

    return this.loadingPromise
  }

  /**
   * 配置微信JS-SDK
   * @param {Object} config 微信配置参数
   */
  async configSDK(config) {
    try {
      await this.loadJSSDK()
      
      return new Promise((resolve, reject) => {
        // 检查是否是临时签名（开发环境兼容）
        const isTemporarySignature = config.signature && config.signature.startsWith('temp_signature');
        
        if (isTemporarySignature) {
          console.log('检测到临时签名，可能在开发环境或签名生成失败');
          console.log('尝试继续支付流程，但可能会失败');
        }
        
        console.log('配置微信JS-SDK:', {
          appId: config.appId,
          timestamp: config.timestamp,
          nonceStr: config.nonceStr,
          signature: config.signature.substring(0, 10) + '...', // 只显示签名前10位
          url: window.location.href.split('#')[0]
        });
        
        window.wx.config({
          debug: false, // 生产环境关闭调试
          appId: config.appId,
          timestamp: config.timestamp,
          nonceStr: config.nonceStr,
          signature: config.signature,
          jsApiList: ['chooseWXPay']
        })

        window.wx.ready(() => {
          console.log('微信JS-SDK配置成功')
          resolve()
        })

        window.wx.error((error) => {
          console.error('微信JS-SDK配置失败:', error)
          
          // 根据错误类型提供更详细的错误信息
          let errorMessage = '微信JS-SDK配置失败';
          if (error.errMsg) {
            if (error.errMsg.includes('invalid signature')) {
              errorMessage = '微信签名验证失败，请检查服务器配置';
            } else if (error.errMsg.includes('invalid url domain')) {
              errorMessage = '域名未在微信后台配置，请联系管理员';
            } else if (error.errMsg.includes('invalid appid')) {
              errorMessage = 'AppID配置错误，请检查微信支付配置';
            }
          }
          
          // 如果是临时签名，允许继续尝试
          if (isTemporarySignature) {
            console.log('临时签名配置失败，但继续尝试支付');
            resolve();
          } else {
            // 真实签名失败，应该拒绝
            reject(new Error(errorMessage));
          }
        })
      })
    } catch (error) {
      console.error('JS-SDK加载失败:', error);
      throw new Error('微信JS-SDK加载失败');
    }
  }

  /**
   * 调用微信JSAPI支付
   * @param {Object} paymentData 支付参数
   * @returns {Promise} 支付结果
   */
  async callJSAPIPay(paymentData) {
    try {
      await this.loadJSSDK()
      
      // 获取微信JS-SDK配置
      const config = await this.getWechatJSSDKConfig()
      
      // 配置JS-SDK
      await this.configSDK(config)
      
      // 确保paymentData包含appId
      if (!paymentData.appId && config.appId) {
        paymentData.appId = config.appId
      }
      
      return new Promise((resolve, reject) => {
        window.wx.chooseWXPay({
          timestamp: paymentData.timeStamp,
          nonceStr: paymentData.nonceStr,
          package: paymentData.package,
          signType: paymentData.signType || 'MD5',
          paySign: paymentData.paySign,
          success: function(res) {
            console.log('微信支付成功:', res)
            resolve(res)
          },
          fail: function(res) {
            console.error('微信支付失败:', res)
            reject(new Error('微信支付失败: ' + (res.errMsg || '未知错误')))
          },
          cancel: function(res) {
            console.log('用户取消支付:', res)
            reject(new Error('用户取消支付'))
          }
        })
      })
    } catch (error) {
      console.error('调用微信支付失败:', error)
      throw error
    }
  }


  


  /**
   * 获取微信JS-SDK配置
   * @returns {Promise<Object>} JS-SDK配置
   */
  async getWechatJSSDKConfig() {
    try {
      const url = encodeURIComponent(window.location.href.split('#')[0])
      const response = await fetch(`/api/payments/wechat/jssdk-config?url=${url}`)
      const data = await response.json()
      
      if (data.success) {
        return data.data
      } else {
        throw new Error(data.message || '获取微信JS-SDK配置失败')
      }
    } catch (error) {
      console.error('获取微信JS-SDK配置失败:', error)
      throw error
    }
  }

  /**
   * 检查是否在微信环境中
   * @returns {boolean}
   */
  isWechatEnvironment() {
    return /micromessenger/i.test(navigator.userAgent)
  }
  

}

// 创建单例实例
const wechatPayment = new WechatPayment()

export default wechatPayment