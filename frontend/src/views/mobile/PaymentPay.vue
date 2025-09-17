<template>
  <div class="payment-pay-page">
    <!-- 顶部导航 -->
    <div class="top-nav">
      <button @click="goBack" class="back-btn">
        <i class="el-icon-arrow-left"></i>
      </button>
      <h1 class="page-title">微信支付</h1>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在处理支付...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <h3>支付失败</h3>
      <p>{{ error }}</p>
      <div class="error-actions">
        <button @click="retryPayment" class="retry-btn">重试支付</button>
        <button @click="goToOrders" class="orders-btn">查看订单</button>
      </div>
    </div>

    <!-- 支付处理 -->
    <div v-else class="payment-container">
      <div class="payment-info">
        <h3>订单信息</h3>
        <div class="order-details" v-if="orderInfo">
          <div class="detail-item">
            <span class="label">订单号：</span>
            <span class="value">{{ orderInfo.orderNo }}</span>
          </div>
          <div class="detail-item">
            <span class="label">支付金额：</span>
            <span class="value amount">¥{{ formatAmount(orderInfo.amount) }}</span>
          </div>
        </div>
      </div>

      <div class="payment-status">
        <div class="status-icon">💳</div>
        <p>正在调用微信支付...</p>
        <p class="status-desc">请在弹出的微信支付界面完成支付</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import wechatPayment from '@/utils/wechat-payment'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const error = ref('')
const orderInfo = ref(null)
const paymentData = ref(null)

// 格式化金额
const formatAmount = (amount) => {
  if (!amount) return '0.00'
  return parseFloat(amount).toFixed(2)
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 跳转到订单页面
const goToOrders = () => {
  router.push('/mobile/my-orders')
}

// 重试支付
const retryPayment = () => {
  error.value = ''
  loading.value = true
  processPayment()
}

// 处理支付
const processPayment = async () => {
  try {
    const { orderNo } = route.params
    const urlParams = new URLSearchParams(window.location.search)
    
    // 获取支付参数
    const paymentDataStr = urlParams.get('paymentData')
    const paymentType = urlParams.get('paymentType')
    
    console.log('支付页面参数:', {
      orderNo,
      paymentDataStr,
      paymentType
    })
    
    if (!paymentDataStr) {
      throw new Error('缺少支付参数')
    }
    
    // 解析支付数据
    paymentData.value = JSON.parse(paymentDataStr)
    
    // 设置订单信息
    orderInfo.value = {
      orderNo: orderNo,
      amount: paymentData.value.amount || '0.00'
    }
    
    loading.value = false
    
    // 检查支付参数是否完整
    if (!paymentData.value.appId || !paymentData.value.paySign) {
      throw new Error('支付参数不完整，请重试')
    }
    
    // 延迟一下再调用支付，让用户看到界面
    setTimeout(async () => {
      try {
        // 调用微信支付
        await wechatPayment.callJSAPIPay(paymentData.value)
        
        ElMessage.success('支付成功！')
        
        // 跳转到支付成功页面
        router.push({
          path: `/mobile/payment-success/${orderNo}`,
          query: { 
            orderNo: orderNo,
            amount: orderInfo.value.amount
          }
        })
        
      } catch (payError) {
        console.error('微信支付失败:', payError)
        
        // 检查是否是用户取消
        if (payError.message.includes('用户取消')) {
          ElMessage.warning('支付已取消')
          error.value = '支付已取消，您可以重新发起支付'
        } else {
          error.value = payError.message || '支付失败，请重试'
        }
      }
    }, 1000)
    
  } catch (err) {
    console.error('处理支付失败:', err)
    error.value = err.message || '支付处理失败'
    loading.value = false
  }
}

// 页面加载时处理支付
onMounted(() => {
  processPayment()
})
</script>

<style scoped>
.payment-pay-page {
  min-height: 100vh;
  background: #f5f5f5;
  color: #333;
}

.top-nav {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-btn {
  background: none;
  border: none;
  color: #333;
  font-size: 1.2rem;
  margin-right: 1rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.back-btn:hover {
  background-color: #f0f0f0;
}

.page-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e0e0e0;
  border-top: 3px solid #409eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  padding: 2rem 1rem;
  text-align: center;
  background: white;
  margin: 1rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-container h3 {
  margin: 0 0 1rem 0;
  font-size: 1.3rem;
  color: #f56c6c;
}

.error-container p {
  margin: 0 0 2rem 0;
  color: #666;
  line-height: 1.5;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.retry-btn, .orders-btn {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
}

.retry-btn {
  background: linear-gradient(135deg, #409eff 0%, #36a3f7 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.orders-btn {
  background: white;
  color: #409eff;
  border: 1px solid #409eff;
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.4);
}

.orders-btn:hover {
  background: #f0f8ff;
  border-color: #36a3f7;
  color: #36a3f7;
}

.payment-container {
  padding: 1rem;
}

.payment-info {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.payment-info h3 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  color: #333;
  font-weight: 600;
}



.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
}

.label {
  color: #666;
}

.value {
  font-weight: 600;
  color: #333;
}

.amount {
  color: #f56c6c;
  font-size: 1.1rem;
}

.payment-status {
  text-align: center;
  padding: 2rem 1rem;
  background: white;
  margin: 0 1rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.status-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.payment-status p {
  margin: 0.5rem 0;
  color: #333;
}

.status-desc {
  color: #666;
  font-size: 0.9rem;
}
</style>