<template>
  <div class="mobile-payment">
    <!-- 头部导航 -->
    <div class="payment-header">
      <button class="back-btn" @click="goBack">
        <i class="fas fa-arrow-left"></i>
      </button>
      <h1 class="page-title">订单支付</h1>
      <div class="header-spacer"></div>
    </div>

    <!-- 订单信息卡片 -->
    <div class="order-card" v-if="orderInfo">
      <div class="order-header">
        <div class="order-icon">
          <i :class="getQueryItemIcon(orderInfo)"></i>
        </div>
        <div class="order-details">
          <h3 class="order-title">{{ orderInfo.service?.name || orderInfo.queryItemName || '查询服务' }}</h3>
          <p class="order-number">订单号：{{ orderInfo.orderNo }}</p>
        </div>
      </div>
      
      <div class="order-info">
        <div class="info-row">
          <span class="info-label">查询类型</span>
          <span class="info-value">{{ orderInfo.queryItemName || '数据查询' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">创建时间</span>
          <span class="info-value">{{ formatDateTime(orderInfo.createdAt) }}</span>
        </div>
        <div class="info-row price-row">
          <span class="info-label">支付金额</span>
          <span class="price-value">{{ formatDisplayAmount(orderInfo.amount) }}</span>
        </div>
      </div>
    </div>

    <!-- 支付方式选择 -->
    <div class="payment-methods">
      <h3 class="section-title">选择支付方式</h3>
      <div class="payment-options">
        <div 
          class="payment-option" 
          v-for="method in paymentMethods" 
          :key="method.id"
          :class="{ 
            active: selectedMethod === method.id,
            disabled: method.disabled 
          }"
          @click="selectPaymentMethod(method.id)"
        >
          <div class="method-icon">
            <i :class="method.icon"></i>
          </div>
          <div class="method-info">
            <h4 class="method-name">{{ method.name }}</h4>
            <p class="method-desc">
              <span>{{ method.description }}</span>
              <span v-if="method.disabled && method.disabledReason" class="disabled-reason">{{ method.disabledReason }}</span>
            </p>
          </div>
          <div class="method-radio">
            <i class="fas fa-check-circle" v-if="selectedMethod === method.id"></i>
            <i class="far fa-circle" v-else></i>
          </div>
        </div>
      </div>
    </div>



    <!-- 支付协议 -->
    <div class="payment-agreement">
      <label class="agreement-checkbox">
        <input type="checkbox" v-model="agreementChecked">
        <span class="checkmark"></span>
        <span class="agreement-text">
          我已阅读并同意
          <span 
            class="agreement-link" 
            @click="showAgreement"
            :class="{ disabled: !systemSettings.paymentServiceAgreement }"
          >
            《支付服务协议》
          </span>
          和
          <span 
            class="agreement-link" 
            @click="showPrivacy"
            :class="{ disabled: !systemSettings.privacyAgreement }"
          >
            《隐私政策》
          </span>
        </span>
      </label>
    </div>

    <!-- 支付按钮 -->
    <div class="payment-footer">
      <div class="total-amount">
        <span class="amount-label">应付金额</span>
        <span class="amount-value">{{ formatDisplayAmount(orderInfo?.amount || '¥0.00') }}</span>
      </div>
      
      <button 
        class="pay-btn" 
        :disabled="!selectedMethod || !agreementChecked || paymentLoading"
        @click="handlePayment"
      >
        <i class="fas fa-spinner fa-spin" v-if="paymentLoading"></i>
        <span v-else>立即支付</span>
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <p class="loading-text">正在加载订单信息...</p>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-if="error" class="error-overlay">
      <div class="error-content">
        <div class="error-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h3 class="error-title">加载失败</h3>
        <p class="error-message">{{ error }}</p>
        <button class="retry-btn" @click="loadOrderInfo">重试</button>
      </div>
    </div>

    <!-- 协议弹窗 -->
    <AgreementDialog
      v-model="paymentAgreementDialogVisible"
      :content="systemSettings.paymentServiceAgreement"
      title="支付服务协议"
    />
    
    <AgreementDialog
      v-model="privacyAgreementDialogVisible"
      :content="systemSettings.privacyAgreement"
      title="隐私政策"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useSystemSettingsStore } from '@/stores/systemSettings'
import wechatPayment from '@/utils/wechat-payment'
import { getPaymentMethodInfo, isWechatEnvironment } from '@/utils/wechat'
import AgreementDialog from '@/components/AgreementDialog.vue'

// 检查是否有微信支付方式
const hasWechatPayment = computed(() => {
  return paymentMethods.value.some(method => method.type === 'wechat' && !method.disabled)
})

const route = useRoute()
const router = useRouter()

// 系统设置store
const systemSettingsStore = useSystemSettingsStore()
const systemSettings = computed(() => systemSettingsStore.settings)

// 响应式数据
const orderInfo = ref(null)
const loading = ref(false)
const error = ref('')
const selectedMethod = ref('')
const agreementChecked = ref(false)
const paymentLoading = ref(false)
const wechatOpenId = ref('')

// 协议弹窗相关
const paymentAgreementDialogVisible = ref(false)
const privacyAgreementDialogVisible = ref(false)



// 支付方式配置
const paymentMethods = ref([])

// 获取支付方式
const loadPaymentMethods = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch('/api/payments/methods', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      const methods = data.methods || []
      
      // 检查是否在微信环境中
      const isWechat = isWechatEnvironment()
      
      // 转换为移动端格式并添加图标
      paymentMethods.value = methods.map(method => {
        const methodInfo = getPaymentMethodInfo(method.code)
        
        return {
          id: method.code,
          name: method.name,
          description: methodInfo.description,
          icon: getMethodIcon(method.code),
          disabled: method.disabled || methodInfo.disabled,
          disabledReason: methodInfo.disabledReason,
          type: method.type // 添加支付类型
        }
      }).sort((a, b) => {
        // 易支付排在前面
        if (a.id === 'epay') return -1
        if (b.id === 'epay') return 1
        return 0
      })
      
      // 如果有微信支付，预加载微信JS-SDK（openid已在onMounted中预加载）
      if (hasWechatPayment.value) {
        try {
          await wechatPayment.loadJSSDK()
          console.log('微信JS-SDK预加载成功')
        } catch (error) {
          console.error('微信JS-SDK预加载失败:', error)
        }
      }
    }
  } catch (error) {
    console.error('获取支付方式失败:', error)
    // 使用默认支付方式
    paymentMethods.value = [
      {
        id: 'epay',
        name: '易支付',
        description: '支持多种银行卡支付',
        icon: 'fas fa-credit-card'
      }
    ]
  }
}

// 获取支付方式图标
const getMethodIcon = (code) => {
  const iconMap = {
    'alipay': 'fas fa-wallet',
    'wechat': 'fas fa-comments', 
    'epay': 'fas fa-credit-card',
    'lakala': 'fas fa-mobile-alt'
  }
  return iconMap[code] || 'fas fa-credit-card'
}

// 获取支付方式描述
const getMethodDescription = (code) => {
  const isWechat = /micromessenger/i.test(navigator.userAgent)
  
  const descMap = {
    'alipay': '推荐使用支付宝快捷支付',
    'wechat': isWechat ? '使用微信支付' : '请在微信中打开使用',
    'epay': '支持多种银行卡支付',
    'lakala': '拉卡拉聚合支付'
  }
  return descMap[code] || '安全便捷支付'
}

// 预加载微信JS-SDK（不获取openid，避免页面跳转）
const preloadWechatAuth = async () => {
  // 检查是否在微信环境中
  const isWechat = isWechatEnvironment()
  if (!isWechat) {
    console.log('非微信环境，跳过微信授权预加载')
    return
  }
  
  try {
    console.log('开始预加载微信JS-SDK...')
    // 仅加载JS-SDK，不获取openid
    await wechatPayment.loadJSSDK()
    console.log('微信JS-SDK预加载成功')
  } catch (error) {
    console.log('微信JS-SDK预加载失败:', error.message)
  }
}

// 获取订单信息
const loadOrderInfo = async () => {
  const orderNo = route.params.orderNo
  if (!orderNo) {
    error.value = '订单号不存在'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/orders/orderNo/${orderNo}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    })

    const data = await response.json()

    if (data && data.code === 200 && data.data) {
      orderInfo.value = data.data
      
      // 如果订单已支付，跳转到结果页面
      if (data.data.status === 'paid' || data.data.status === 'completed') {
        ElMessage.success('订单已支付，正在跳转到结果页面...')
        router.replace(`/mobile/result/${orderNo}`)
        return
      }
    } else {
      error.value = data?.message || '获取订单信息失败'
    }
  } catch (err) {
    console.error('获取订单信息失败:', err)
    error.value = '网络错误，请检查网络连接'
  } finally {
    loading.value = false
  }
}

// 选择支付方式
const selectPaymentMethod = (methodId) => {
  const method = paymentMethods.value.find(m => m.id === methodId)
  if (method && method.disabled) {
    const reason = method.disabledReason || '该支付方式暂时不可用'
    ElMessage.warning(reason)
    return
  }
  selectedMethod.value = methodId
}



// 微信支付相关逻辑已移至 @/utils/wechat-payment

// 处理支付
const handlePayment = async () => {
  if (!selectedMethod.value) {
    ElMessage.warning('请选择支付方式')
    return
  }

  if (!agreementChecked.value) {
    ElMessage.warning('请先阅读并同意支付协议')
    return
  }

  paymentLoading.value = true

  try {
    const token = localStorage.getItem('token')
    const requestBody = {
      orderNo: orderInfo.value.orderNo,
      paymentMethod: selectedMethod.value,
      platform: 'mobile'
    }
    
    let response;
    
    // 如果是微信支付，根据环境选择支付方式
    if (selectedMethod.value === 'wechat') {
      // 检查是否在微信环境中
      if (wechatPayment.isWechatEnvironment()) {
        console.log('微信环境，使用JSAPI支付')
        
        // 先尝试静默授权获取openid
        let openid = null
        try {
          const authResponse = await fetch('/api/payments/wechat/silent-auth', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token ? `Bearer ${token}` : ''
            },
            body: JSON.stringify({
              userAgent: navigator.userAgent,
              url: window.location.href
            })
          })
          
          const authData = await authResponse.json()
          if (authData.success && authData.openid) {
            openid = authData.openid
            console.log('静默授权获取openid成功:', openid)
          } else {
            console.log('静默授权失败，需要用户授权')
            // 如果静默授权失败，使用授权支付流程
            const response = await fetch('/api/payments/wechat/create-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
              },
              body: JSON.stringify({
                orderNo: orderInfo.value.orderNo,
                redirectUrl: window.location.href
              })
            })
            
            const data = await response.json()
            
            if (data && data.success && data.authUrl) {
              console.log('跳转到微信授权页面:', data.authUrl)
              window.location.href = data.authUrl
              return
            } else {
              throw new Error(data.message || '创建微信支付失败')
            }
          }
        } catch (error) {
          console.error('获取openid失败:', error)
          throw new Error('获取微信用户信息失败，请重试')
        }
        
        // 在微信环境中使用JSAPI支付
        response = await fetch('/api/payments/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
          body: JSON.stringify({
            ...requestBody,
            paymentType: 'JSAPI',
            openid: openid
          })
        })
      } else {
        console.log('非微信环境，使用授权支付流程')
        // 非微信环境使用授权支付
        response = await fetch('/api/payments/wechat/create-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
          body: JSON.stringify({
            orderNo: orderInfo.value.orderNo,
            redirectUrl: window.location.href
          })
        })
        
        const data = await response.json()
        
        if (data && data.success && data.authUrl) {
          console.log('跳转到微信授权页面:', data.authUrl)
          // 直接跳转到微信授权页面
          window.location.href = data.authUrl
          return
        } else {
          throw new Error(data.message || '创建微信支付失败')
        }
      }
    } else {
      // 其他支付方式使用原有接口
      response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(requestBody)
      })
    }

    const data = await response.json()

    if (data && data.success) {
      // 根据支付类型处理不同的支付流程
      if (data.paymentType === 'JSAPI' && data.paymentData) {
        // 检查支付参数是否完整
        if (!data.paymentData.appId || !data.paymentData.paySign) {
          throw new Error('支付参数不完整，请重试')
        }
        
        // 微信JSAPI支付
        try {
          // 直接调用微信支付，callJSAPIPay方法内部会处理JS-SDK配置
          await wechatPayment.callJSAPIPay(data.paymentData)
          ElMessage.success('支付成功！')
          // 跳转到支付成功页面，传递订单号作为路径参数，金额作为查询参数
          router.push({
            name: 'MobilePaymentSuccess',
            params: { 
              orderNo: orderInfo.value.orderNo
            },
            query: {
              amount: orderInfo.value.amount
            }
          })
        } catch (error) {
          console.error('微信支付失败:', error)
          
          // 检查是否是JS-SDK配置问题
          if (error.message.includes('config:invalid signature') || 
              error.message.includes('config:invalid url domain') ||
              error.message.includes('config:invalid appid')) {
            ElMessageBox.confirm(
              `微信支付配置错误：${error.message}\n\n这通常是因为：\n1. 微信应用ID(AppId)配置错误\n2. 缺少JS-SDK签名配置\n3. 域名未在微信后台配置\n\n请联系管理员检查微信支付配置。`,
              '微信支付配置错误',
              {
                confirmButtonText: '联系管理员',
                cancelButtonText: '返回订单',
                type: 'error'
              }
            ).then(() => {
              // 可以跳转到联系页面或显示联系信息
              ElMessage.info('请联系技术支持解决微信支付配置问题')
            }).catch(() => {
              router.push('/mobile/my-orders')
            })
          } else {
            ElMessageBox.confirm(
              `微信支付失败：${error.message}\n\n可能的原因：\n1. 网络连接问题\n2. 用户取消支付\n3. 支付金额异常`,
              '支付失败',
              {
                confirmButtonText: '重试支付',
                cancelButtonText: '返回订单',
                type: 'error'
              }
            ).then(() => {
              // 重试支付
              handlePayment()
            }).catch(() => {
              // 返回订单页面
              router.push('/mobile/my-orders')
            })
          }
        }
      } else if (data.paymentUrl) {
        // 跳转到支付页面（其他支付方式）
        window.location.href = data.paymentUrl
      } else if (data.qrCodeData) {
        // 显示二维码支付
        ElMessage.info('请使用手机扫码支付')
      } else {
        ElMessage.success('支付请求已创建，请完成支付')
      }
    } else {
      ElMessage.error(data?.message || '创建支付失败')
    }
  } catch (err) {
    console.error('创建支付失败:', err)
    ElMessage.error('支付失败，请重试')
  } finally {
    paymentLoading.value = false
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 显示协议
const showAgreement = () => {
  paymentAgreementDialogVisible.value = true
}

// 显示隐私政策
const showPrivacy = () => {
  privacyAgreementDialogVisible.value = true
}



// 格式化价格
const formatPrice = (price) => {
  if (price === null || price === undefined || price === '' || isNaN(price)) {
    return '0.00'
  }
  return parseFloat(price).toFixed(2)
}

// 格式化显示金额（处理后端返回的已格式化金额）
const formatDisplayAmount = (amount) => {
  if (!amount) return '¥0.00'
  // 如果已经是格式化的字符串（如 "¥10.00"），直接返回
  if (typeof amount === 'string' && amount.includes('¥')) {
    return amount
  }
  // 如果是数字，格式化后返回
  return `¥${formatPrice(amount)}`
}

// 根据查询项目获取对应图标
const getQueryItemIcon = (orderInfo) => {
  if (!orderInfo) return 'fas fa-search'
  
  // 优先使用后端返回的图标信息
  if (orderInfo.service?.icon) {
    return orderInfo.service.icon
  }
  
  // 如果有查询项目信息，根据分类返回图标
  const category = orderInfo.category || orderInfo.service?.category
  
  const iconMap = {
    'personal': 'fas fa-id-card',
    'business': 'fas fa-building',
    'communication': 'fas fa-mobile-alt',
    'vehicle': 'fas fa-car',
    'financial': 'fas fa-credit-card',
    'network': 'fas fa-globe',
    'legal': 'fas fa-gavel',
    'education': 'fas fa-graduation-cap',
    'property': 'fas fa-home'
  }
  
  return iconMap[category] || 'fas fa-search'
}

// 格式化日期时间
const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 页面挂载时加载数据
onMounted(async () => {
  // 检查是否在微信环境中，预加载JS-SDK
  const isWechat = /micromessenger/i.test(navigator.userAgent)
  if (isWechat) {
    console.log('💰 支付页面预加载微信JS-SDK...')
    preloadWechatAuth().catch(error => {
      console.log('微信JS-SDK预加载失败:', error.message)
    })
  }
  
  // 并行加载系统设置、订单信息和支付方式
  await Promise.all([
    systemSettingsStore.fetchSettings(),
    loadOrderInfo(),
    loadPaymentMethods()
  ])
})
</script>

<style scoped>
.mobile-payment {
  height: 100vh;
  background: linear-gradient(180deg, #fafbfc 0%, #f5f6f8 100%);
  padding-bottom: 80px;
  position: relative;
  overflow-y: auto;
  box-sizing: border-box;
}

/* 头部导航 */
.payment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.back-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: #f8f9fa;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #666;
}

.back-btn:hover {
  background: #e9ecef;
  transform: translateX(-2px);
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.header-spacer {
  width: 40px;
}

/* 订单信息卡片 */
.order-card {
  margin: 20px;
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.order-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.order-icon {
  width: 48px;
  height: 48px;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #495057;
  font-size: 20px;
  margin-right: 16px;
}

.order-details {
  flex: 1;
}

.order-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
}

.order-number {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-size: 14px;
  color: #666;
}

.info-value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.price-row .price-value {
  font-size: 18px;
  font-weight: 700;
  color: #e74c3c;
}

/* 支付方式选择 */
.payment-methods {
  margin: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
}

.payment-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.payment-option {
  background: #fff;
  border: 2px solid #f0f0f0;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.payment-option:hover {
  border-color: #e0e0e0;
  transform: translateY(-1px);
}

.payment-option.active {
  border-color: #27ae60;
  background: rgba(39, 174, 96, 0.05);
}

.disabled-reason {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 2px;
  display: block;
}

.payment-option.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.payment-option.disabled .method-name::after {
  content: '（暂不可用）';
  color: #dc3545;
  font-size: 12px;
  margin-left: 8px;
}

.method-icon {
  width: 40px;
  height: 40px;
  background: #f8f9fa;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 18px;
  color: #666;
}

.payment-option.active .method-icon {
  background: rgba(39, 174, 96, 0.1);
  color: #27ae60;
}

.method-info {
  flex: 1;
}

.method-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
}

.method-desc {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.method-radio {
  font-size: 20px;
  color: #27ae60;
}

.payment-option:not(.active) .method-radio {
  color: #ddd;
}

/* 支付协议 */
.payment-agreement {
  margin: 20px;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
}

.agreement-checkbox {
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  position: relative;
}

.agreement-checkbox input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid #ddd;
  border-radius: 4px;
  margin-right: 12px;
  margin-top: 2px;
  flex-shrink: 0;
  position: relative;
  transition: all 0.2s ease;
}

.agreement-checkbox input[type="checkbox"]:checked + .checkmark {
  background: #27ae60;
  border-color: #27ae60;
}

.agreement-checkbox input[type="checkbox"]:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: -2px;
  left: 2px;
  color: #fff;
  font-size: 12px;
  font-weight: bold;
}

.agreement-text {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.agreement-link {
  color: #667eea;
  text-decoration: none;
  cursor: pointer;
}

.agreement-link:hover {
  text-decoration: underline;
}

.agreement-link.disabled {
  color: #ccc;
  cursor: not-allowed;
}

.agreement-link.disabled:hover {
  text-decoration: none;
}

/* 支付按钮 */
.payment-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 16px 20px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 100;
}

.total-amount {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.amount-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 2px;
}

.amount-value {
  font-size: 20px;
  font-weight: 700;
  color: #e74c3c;
}

.pay-btn {
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
  color: #fff;
  border: none;
  border-radius: 25px;
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
  justify-content: center;
}

.pay-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

.pay-btn:disabled {
  background: #ddd;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}



/* 加载和错误状态 */
.loading-overlay,
.error-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-content,
.error-content {
  text-align: center;
  padding: 31px 24px 13px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f0f0f0;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.error-icon {
  font-size: 48px;
  color: #e74c3c;
  margin-bottom: 16px;
}

.error-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.error-message {
  font-size: 14px;
  color: #666;
  margin: 0 0 20px 0;
}

.retry-btn {
  background: #667eea;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  background: #5a6fd8;
}



/* 响应式设计 */
@media (max-width: 480px) {
  .order-card {
    margin: 16px;
    padding: 20px;
  }
  
  .payment-methods {
    margin: 16px;
  }
  
  .payment-agreement {
    margin: 16px;
  }
  
  .payment-footer {
    padding: 12px 16px;
  }
  
  .pay-btn {
    padding: 12px 24px;
    font-size: 14px;
  }
}
</style>