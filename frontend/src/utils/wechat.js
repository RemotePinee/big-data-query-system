/**
 * 微信环境检测工具
 */

/**
 * 检测是否在微信环境中
 * @returns {boolean} 是否在微信环境
 */
export const isWechatEnvironment = () => {
  return /micromessenger/i.test(navigator.userAgent)
}

/**
 * 检测是否在微信小程序环境中
 * @returns {boolean} 是否在微信小程序环境
 */
export const isWechatMiniProgram = () => {
  return /miniprogram/i.test(navigator.userAgent) || window.__wxjs_environment === 'miniprogram'
}

/**
 * 获取微信环境信息
 * @returns {Object} 微信环境信息
 */
export const getWechatEnvironmentInfo = () => {
  const userAgent = navigator.userAgent
  const isWechat = isWechatEnvironment()
  const isMiniProgram = isWechatMiniProgram()
  
  return {
    isWechat,
    isMiniProgram,
    userAgent,
    canUseWechatPay: isWechat && !isMiniProgram, // 只有在微信浏览器中且非小程序环境才能使用微信支付
    environmentType: isMiniProgram ? 'miniprogram' : (isWechat ? 'wechat' : 'browser')
  }
}

/**
 * 检查微信支付是否可用
 * @returns {Object} 微信支付可用性检查结果
 */
export const checkWechatPayAvailability = () => {
  const envInfo = getWechatEnvironmentInfo()
  
  if (!envInfo.isWechat) {
    return {
      available: false,
      reason: '请在微信中打开使用',
      suggestion: '请使用微信扫码或在微信中打开链接'
    }
  }
  
  if (envInfo.isMiniProgram) {
    return {
      available: false,
      reason: '小程序环境不支持',
      suggestion: '请在微信浏览器中打开'
    }
  }
  
  return {
    available: true,
    reason: '微信支付可用',
    suggestion: ''
  }
}

/**
 * 获取支付方式的可用性和描述
 * @param {string} paymentMethod 支付方式代码
 * @returns {Object} 支付方式信息
 */
export const getPaymentMethodInfo = (paymentMethod) => {
  const envInfo = getWechatEnvironmentInfo()
  
  switch (paymentMethod) {
    case 'wechat':
      const wechatCheck = checkWechatPayAvailability()
      return {
        disabled: !wechatCheck.available,
        disabledReason: wechatCheck.reason,
        description: envInfo.isWechat ? '使用微信支付' : '请在微信中打开使用'
      }
    
    case 'alipay':
      return {
        disabled: false,
        disabledReason: '',
        description: '推荐使用支付宝快捷支付'
      }
    
    case 'epay':
      return {
        disabled: false,
        disabledReason: '',
        description: '支持多种银行卡支付'
      }
    
    default:
      return {
        disabled: false,
        disabledReason: '',
        description: '安全便捷支付'
      }
  }
}

export default {
  isWechatEnvironment,
  isWechatMiniProgram,
  getWechatEnvironmentInfo,
  checkWechatPayAvailability,
  getPaymentMethodInfo
}