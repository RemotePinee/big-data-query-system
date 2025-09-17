<template>
  <div class="payment-success">
    <!-- 成功状态显示 -->
    <div class="success-content" v-if="!state.loading && !state.error">
      <div class="success-icon">
        <div class="checkmark-circle">
          <div class="checkmark"></div>
        </div>
      </div>
      
      <h1 class="success-title">支付成功</h1>
      <p class="success-message">您的订单已支付成功，正在为您查询数据...</p>
      
      <div class="order-info">
        <div class="info-item">
          <span class="info-label">订单号</span>
          <span class="info-value">{{ orderNo }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">支付金额</span>
          <span class="info-value price">¥{{ formatPrice(paymentAmount) }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">支付时间</span>
          <span class="info-value">{{ formatDateTime(new Date()) }}</span>
        </div>
      </div>
    </div>

    <!-- 数据查询进度 -->
    <div class="query-progress" v-if="!state.loading && !state.error">
      <div class="progress-header">
        <h3 class="progress-title">数据查询进度</h3>
        <div class="progress-status" :class="state.queryStatus">
          <i class="fas fa-spinner fa-spin" v-if="state.queryStatus === 'querying'"></i>
          <i class="fas fa-check-circle" v-else-if="state.queryStatus === 'completed'"></i>
          <i class="fas fa-exclamation-triangle" v-else-if="state.queryStatus === 'failed'"></i>
          <span class="status-text">{{ statusText }}</span>
        </div>
      </div>
      
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: state.progressPercent + '%' }"></div>
      </div>
      
      <div class="progress-steps">
        <div class="step" :class="{ active: state.currentStep >= 1, completed: state.currentStep > 1 }">
          <div class="step-icon">
            <i class="fas fa-credit-card"></i>
          </div>
          <span class="step-text">支付确认</span>
        </div>
        <div class="step" :class="{ active: state.currentStep >= 2, completed: state.currentStep > 2 }">
          <div class="step-icon">
            <i class="fas fa-database"></i>
          </div>
          <span class="step-text">数据查询</span>
        </div>
        <div class="step" :class="{ active: state.currentStep >= 3, completed: state.currentStep > 3 }">
          <div class="step-icon">
            <i class="fas fa-chart-bar"></i>
          </div>
          <span class="step-text">结果生成</span>
        </div>
      </div>
    </div>

    <!-- 查询结果预览 -->
    <div class="result-preview" v-if="state.queryResult && !state.loading && !state.error">
      <h3 class="preview-title">查询结果预览</h3>
      <div class="result-summary">
        <div class="summary-item">
          <span class="summary-label">查询状态</span>
          <span class="summary-value success">成功</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">数据条数</span>
          <span class="summary-value">{{ getDataCount(state.queryResult) }} 条</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">查询时间</span>
          <span class="summary-value">{{ state.queryResult.queryTime || '< 1秒' }}</span>
        </div>
      </div>
      
      <!-- 简化的数据展示 -->
      <div class="data-preview" v-if="getDisplayData(state.queryResult) && getDisplayData(state.queryResult).length > 0">
        <div class="preview-header">
          <span class="preview-label">数据样例</span>
          <span class="preview-count">(显示前3条)</span>
        </div>
        <div class="data-items">
          <div 
            class="data-item" 
            v-for="(item, index) in getDisplayData(state.queryResult).slice(0, 3)" 
            :key="index"
          >
            <div class="item-header">
              <span class="item-index">#{{ index + 1 }}</span>
              <span class="item-time" v-if="item.time || item.timestamp">
                {{ formatDateTime(item.time || item.timestamp) }}
              </span>
            </div>
            <div class="item-content">
              <div 
                class="field-item" 
                v-for="(value, key) in getDisplayFields(item)" 
                :key="key"
              >
                <span class="field-label">{{ formatFieldName(key) }}</span>
                <span class="field-value">{{ formatFieldValue(value) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-buttons" v-if="!state.loading && !state.error">
      <button 
        class="btn btn-secondary" 
        @click="goToOrders"
        v-if="state.queryStatus === 'querying'"
      >
        <i class="fas fa-list"></i>
        <span>查看订单</span>
      </button>
      
      <button 
        class="btn btn-primary" 
        @click="viewResults"
        v-if="state.queryStatus === 'completed'"
      >
        <i class="fas fa-eye"></i>
        <span>查看结果</span>
      </button>
      
      <button 
        class="btn btn-secondary" 
        @click="goHome"
      >
        <i class="fas fa-home"></i>
        <span>返回首页</span>
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="state.loading" class="loading-overlay">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <p class="loading-text">正在处理支付结果...</p>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-if="state.error" class="error-overlay">
      <div class="error-content">
        <div class="error-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h3 class="error-title">处理失败</h3>
        <p class="error-message">{{ state.error }}</p>
        <div class="error-actions">
          <button class="btn btn-primary" @click="retryQuery">重试</button>
          <button class="btn btn-secondary" @click="goToOrders">查看订单</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { orderApi } from '@/api/order'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// ===== 状态管理 =====
const state = ref({
  // 页面状态
  loading: true,
  error: null,
  
  // 订单信息
  orderNo: '',
  orderInfo: null,
  paymentAmount: 0,
  
  // 查询状态
  queryStatus: 'initializing', // initializing, pending, querying, completed, failed
  queryResult: null,
  queryProgress: 0,
  
  // 步骤状态
  currentStep: 1, // 1: 支付确认, 2: 数据查询, 3: 查询完成
  progressPercent: 0,
  
  // 定时器管理
  statusCheckTimer: null,
  progressTimer: null,
  
  // 查询控制
  queryStartTime: Date.now(),
  maxQueryTime: 3 * 60 * 1000, // 3分钟超时
  checkCount: 0,
  networkErrorCount: 0
})

// ===== 计算属性 =====
const statusText = computed(() => {
  switch (state.value.queryStatus) {
    case 'initializing':
      return '正在初始化...'
    case 'pending':
      return '等待支付确认'
    case 'querying':
      return '正在查询数据...'
    case 'completed':
      return '查询完成'
    case 'failed':
      return '查询失败'
    default:
      return '处理中...'
  }
})

const orderNo = computed(() => {
  return state.value.orderNo || route.query.orderNo || route.query.out_trade_no || ''
})

const paymentAmount = computed(() => {
  // 优先使用订单信息中的金额
  if (state.value.orderInfo && state.value.orderInfo.amount) {
    return state.value.orderInfo.amount
  }
  
  // 其次使用状态中的金额
  if (state.value.paymentAmount) {
    return state.value.paymentAmount
  }
  
  // 最后尝试从路由参数获取
  const routeAmount = route.query.amount || route.query.total_amount || route.query.money
  if (routeAmount) {
    return parseFloat(routeAmount)
  }
  
  return 0
})

// ===== 定时器管理 =====
let timers = {
  orderStatus: null,
  queryProgress: null
}

const clearAllTimers = () => {
  if (timers.orderStatus) {
    clearInterval(timers.orderStatus)
    timers.orderStatus = null
  }
  if (timers.queryProgress) {
    clearInterval(timers.queryProgress)
    timers.queryProgress = null
  }
}

// ===== 错误处理 =====
const handleError = (error, context = '') => {
  console.error(`PaymentSuccess ${context}:`, error)
  
  let errorMessage = '未知错误'
  
  if (error.message) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      errorMessage = '网络连接失败，请检查网络后重试'
    } else if (error.message.includes('404')) {
      errorMessage = '订单不存在或已过期'
    } else if (error.message.includes('401')) {
      errorMessage = '身份验证失败，请重新登录'
    } else if (error.message.includes('403')) {
      errorMessage = '没有权限访问此订单'
    } else if (error.message.includes('500')) {
      errorMessage = '服务器内部错误，请稍后重试'
    } else {
      errorMessage = error.message
    }
  }
  
  state.value.error = errorMessage
  state.value.queryStatus = 'failed'
  state.value.loading = false
}

// ===== API 调用 =====
const fetchOrderInfo = async () => {
  try {
    console.log(`获取订单信息: ${state.value.orderNo}`)
    
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/orders/orderNo/${state.value.orderNo}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        console.error('订单不存在，请检查订单号是否正确')
        return
      }
      if (response.status === 401) {
        console.error('登录已过期，请重新登录')
        return
      }
      throw new Error(`API请求失败: ${response.status}`)
    }

    const data = await response.json()
    
    if (data && data.code === 200 && data.data) {
      const order = data.data
      state.value.orderInfo = order
      
      // 优先使用API返回的金额，如果为空或为0则使用路由参数中的金额
      const apiAmount = parseFloat(String(order.amount || order.totalAmount || '0'))
      const routeAmount = parseFloat(String(route.query.amount || route.query.money || route.query.price || '0'))
      
      // 选择有效的金额值，确保不是NaN
      let finalAmount = 0
      if (!isNaN(apiAmount) && apiAmount > 0) {
        finalAmount = apiAmount
      } else if (!isNaN(routeAmount) && routeAmount > 0) {
        finalAmount = routeAmount
      }
      
      console.log('金额处理:', { apiAmount, routeAmount, finalAmount })
      state.value.paymentAmount = finalAmount
      
      // 根据订单状态决定下一步操作
      if (order.status === 'pending') {
        console.log('正在等待支付确认，请稍候...')
        startOrderStatusCheck()
      } else {
        // 对于其他所有状态（paid, processing, completed, failed等），都启动查询状态检查
        startQueryStatusCheck()
      }
      
      return order
    } else {
      // API返回格式不正确，使用路由参数并启动查询状态检查
      if (route.query.amount || route.query.money || route.query.price) {
        const routeAmount = parseFloat(String(route.query.amount || route.query.money || route.query.price || '0'))
        if (!isNaN(routeAmount) && routeAmount > 0) {
          state.value.paymentAmount = routeAmount
        }
      }
      startQueryStatusCheck()
    }
  } catch (error) {
    // 获取订单信息失败，使用路由参数并启动查询状态检查
    if (route.query.amount || route.query.money || route.query.price) {
      const routeAmount = parseFloat(String(route.query.amount || route.query.money || route.query.price || '0'))
      if (!isNaN(routeAmount) && routeAmount > 0) {
        state.value.paymentAmount = routeAmount
      }
    }
    startQueryStatusCheck()
    // 静默处理订单信息获取失败的情况
  }
}

// 移除不再使用的fetchQueryResult函数

// ===== 轮询管理 =====
const startOrderStatusCheck = () => {
  console.log('开始订单状态检查')
  
  state.value.queryStatus = 'pending'
  state.value.currentStep = 1
  
  timers.orderStatus = setInterval(async () => {
    try {
      const order = await fetchOrderInfo()
      
      if (order && (order.status === 'paid' || order.status === 'processing' || order.status === 'completed')) {
        clearInterval(timers.orderStatus)
        timers.orderStatus = null
        
        if (order.status === 'completed' && order.result) {
          // 订单已完成且有结果
          state.value.queryStatus = 'completed'
          state.value.queryResult = order.result
          state.value.currentStep = 3
          state.value.progressPercent = 100
        } else {
          // 订单已支付，开始查询轮询
          startQueryStatusCheck()
        }
      } else if (order && order.status === 'failed') {
        clearInterval(timers.orderStatus)
        timers.orderStatus = null
        startQueryStatusCheck() // 让查询API处理错误信息
      }
    } catch (error) {
      console.error('订单状态检查失败:', error)
      // 网络错误时继续轮询
    }
  }, 3000)
}

// 开始查询状态检查
const startQueryStatusCheck = () => {
  // 如果已经有状态检查在运行，先停止它
  clearAllTimers()
  
  // 重置查询开始时间和计数器
  state.value.queryStartTime = Date.now()
  state.value.checkCount = 0
  state.value.networkErrorCount = 0
  
  // 设置初始状态
  state.value.queryStatus = 'querying'
  state.value.currentStep = 2
  state.value.progressPercent = 33
  
  // 开始状态检查
  timers.queryProgress = setInterval(async () => {
    await checkQueryStatus()
  }, 3000) // 每3秒检查一次
  
  // 立即检查一次
  checkQueryStatus()
}

const checkQueryStatus = async () => {
  try {
    // 检查是否超时
    const currentTime = Date.now()
    if (currentTime - state.value.queryStartTime > state.value.maxQueryTime) {
      state.value.queryStatus = 'failed'
      state.value.error = '查询超时，可能是API配置错误或网络问题，请检查配置后重试'
      clearAllTimers()
      return
    }
    
    const token = localStorage.getItem('token')
    
    const response = await fetch(`/api/queries/results/order/${state.value.orderNo}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      
      if (data.code === 200 && data.data) {
        const progress = data.data
        
        if (progress.status === 'completed' && progress.result !== undefined) {
          // 查询完成
          state.value.queryResult = progress.result
          state.value.queryStatus = 'completed'
          state.value.currentStep = 3
          state.value.progressPercent = 100
          console.log('查询完成！原始数据:', progress.result)
          console.log('解析后数据条数:', getDataCount(progress.result))
          console.log('解析后显示数据:', getDisplayData(progress.result))
          clearAllTimers()
        } else if (progress.status === 'failed') {
          // 查询失败
          state.value.queryStatus = 'failed'
          state.value.error = progress.error || progress.message || '查询处理失败，可能是API配置错误，请检查配置后重试'
          clearAllTimers()
        } else if (progress.status === 'processing' || progress.status === 'querying') {
          // 查询进行中
          state.value.queryStatus = 'querying'
          state.value.currentStep = 2
          if (progress.progress !== undefined) {
            state.value.progressPercent = Math.min(33 + progress.progress * 0.67, 99)
          }
        }
      } else if (data.code === 404) {
        // 查询记录不存在，可能还在处理中
        state.value.queryStatus = 'querying'
        state.value.currentStep = 2
      } else {
        // 其他错误
        state.value.checkCount++
        if (state.value.checkCount >= 10) {
          state.value.queryStatus = 'failed'
          state.value.error = data.message || '查询状态检查失败'
          clearAllTimers()
        }
      }
    } else if (response.status === 404) {
      // 查询记录不存在，可能还在处理中
      state.value.queryStatus = 'querying'
      state.value.currentStep = 2
    } else if (response.status === 401) {
      // 认证失败
      state.value.queryStatus = 'failed'
      state.value.error = '登录已过期，请重新登录'
      clearAllTimers()
    } else {
      // 网络错误或其他HTTP错误
      state.value.networkErrorCount++
      if (state.value.networkErrorCount >= 5) {
        state.value.queryStatus = 'failed'
        state.value.error = `网络错误 (${response.status})，请检查网络连接或稍后重试`
        clearAllTimers()
      }
    }
  } catch (error) {
    console.error('查询状态检查失败:', error)
    state.value.networkErrorCount++
    if (state.value.networkErrorCount >= 5) {
      state.value.queryStatus = 'failed'
      state.value.error = '网络连接失败，请检查网络连接或稍后重试'
      clearAllTimers()
    }
  }
}

// ===== 初始化逻辑 =====
const initializeOrder = async () => {
  try {
    console.log('开始初始化订单信息')
    
    // 初始化用户状态
    userStore.initUserState()
    
    // 支持多种订单号参数格式
    state.value.orderNo = route.params.orderNo || 
                         route.query.orderNo || 
                         route.query.out_trade_no || 
                         route.query.order_no ||
                         route.query.orderno || ''
    
    if (!state.value.orderNo) {
      throw new Error('订单号不存在，请检查支付链接是否正确')
    }
    
    // 支持多种金额参数名
    const routeAmount = route.query.amount || 
                       route.query.money || 
                       route.query.total_amount ||
                       route.query.price || 0
    state.value.paymentAmount = isNaN(parseFloat(routeAmount)) ? 0 : parseFloat(routeAmount)
    
    // 如果是支付回调，显示支付成功信息
    if (route.query.trade_status === 'TRADE_SUCCESS') {
      console.log('支付成功回调')
    }
    
    console.log('订单号:', state.value.orderNo, '金额:', state.value.paymentAmount)
    
    // 获取订单详细信息
    await fetchOrderInfo()
    
  } catch (error) {
    handleError(error, '初始化')
  } finally {
    state.value.loading = false
  }
}

// ===== 用户操作 =====
const retryQuery = () => {
  console.log('重试处理')
  
  // 重置状态
  state.value.loading = true
  state.value.error = null
  state.value.queryStatus = 'initializing'
  state.value.queryResult = null
  state.value.currentStep = 1
  state.value.progressPercent = 0
  
  // 清理定时器
  clearAllTimers()
  
  // 重新初始化
  initializeOrder()
}

const viewResults = () => {
  // 跳转到查询结果页面，传递订单号
  router.push(`/mobile/result/${state.value.orderNo}`)
}

const goHome = () => {
  router.push('/mobile')
}

const goToOrders = () => {
  router.push('/mobile/my-orders')
}

// ===== 工具函数 =====
const formatPrice = (price) => {
  return parseFloat(price || 0).toFixed(2)
}

const formatDateTime = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN')
}

const getDisplayFields = (item) => {
  if (!item || typeof item !== 'object') return {}
  
  const fields = {}
  const keys = Object.keys(item).filter(key => 
    key !== 'id' && 
    key !== 'timestamp' && 
    key !== 'time' &&
    key !== 'created_at' && 
    key !== 'updated_at'
  ).slice(0, 4)
  
  keys.forEach(key => {
    fields[key] = item[key]
  })
  
  return fields
}

const formatFieldName = (key) => {
  const fieldMap = {
    name: '姓名',
    phone: '电话',
    email: '邮箱',
    address: '地址',
    company: '公司',
    title: '职位',
    age: '年龄',
    gender: '性别',
    status: '状态',
    time: '时间',
    timestamp: '时间戳'
  }
  return fieldMap[key] || key
}

const formatFieldValue = (value) => {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'boolean') return value ? '是' : '否'
  if (typeof value === 'number') return value.toLocaleString() // 格式化数字
  if (typeof value === 'string') {
    // 检查是否是日期格式
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
      try {
        const date = new Date(value)
        if (!isNaN(date.getTime())) {
          return date.toLocaleString('zh-CN')
        }
      } catch (e) {
        // 如果日期解析失败，返回原字符串
      }
    }
    return value
  }
  if (Array.isArray(value)) {
    return value.length > 0 ? `[${value.length}项]` : '[]'
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2)
    } catch (e) {
      return '[对象]'
    }
  }
  return String(value)
}

// ===== 数据处理函数 =====
const getDataCount = (queryResult) => {
  if (!queryResult) return 0
  
  // 如果有totalCount字段，直接返回
  if (queryResult.totalCount !== undefined) {
    return queryResult.totalCount
  }
  
  // 检查data字段
  if (queryResult.data) {
    // 如果data是数组，返回长度
    if (Array.isArray(queryResult.data)) {
      return queryResult.data.length
    }
    
    // 如果data是对象，检查result.list
    if (queryResult.data.result && Array.isArray(queryResult.data.result.list)) {
      return queryResult.data.result.list.length
    }
  }
  
  return 0
}

const getDisplayData = (queryResult) => {
  if (!queryResult) return []
  
  // 从API响应中获取实际的查询结果数据
  const actualData = queryResult.result || queryResult.data;
  
  // 尝试从不同的数据结构中获取列表数据
  if (actualData?.data?.result?.list && Array.isArray(actualData.data.result.list)) {
    return actualData.data.result.list.slice(0, 3);
  }
  if (actualData?.result?.list && Array.isArray(actualData.result.list)) {
    return actualData.result.list.slice(0, 3);
  }
  if (actualData?.data?.list && Array.isArray(actualData.data.list)) {
    return actualData.data.list.slice(0, 3);
  }
  if (actualData?.list && Array.isArray(actualData.list)) {
    return actualData.list.slice(0, 3);
  }
  if (Array.isArray(actualData?.data)) {
    return actualData.data.slice(0, 3);
  }
  if (Array.isArray(actualData)) {
    return actualData.slice(0, 3);
  }
  
  // 如果data是数组，直接返回前3条（保持向后兼容）
  if (Array.isArray(queryResult.data)) {
    return queryResult.data.slice(0, 3)
  }
  
  // 如果data是对象，检查result.list（保持向后兼容）
  if (queryResult.data && queryResult.data.result && Array.isArray(queryResult.data.result.list)) {
    return queryResult.data.result.list.slice(0, 3)
  }
  
  return []
}

// ===== 生命周期 =====
onMounted(() => {
  initializeOrder()
})

onUnmounted(() => {
  clearAllTimers()
})
</script>

<style scoped>
.payment-success {
  min-height: 100vh;
  background: linear-gradient(180deg, #fafbfc 0%, #f5f6f8 100%);
  padding: 20px;
  padding-bottom: 100px;
}

/* 成功状态 */
.success-content {
  text-align: center;
  margin-bottom: 30px;
}

.success-icon {
  margin-bottom: 20px;
}

.checkmark-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
  margin: 0 auto;
  position: relative;
  animation: scaleIn 0.5s ease-out;
}

.checkmark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 30px;
  height: 30px;
}

.checkmark::after {
  content: '';
  position: absolute;
  left: 8px;
  top: 12px;
  width: 8px;
  height: 16px;
  border: solid #fff;
  border-width: 0 3px 3px 0;
  transform: rotate(45deg);
  animation: checkmark 0.3s ease-out 0.2s both;
}

@keyframes scaleIn {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes checkmark {
  0% {
    opacity: 0;
    transform: rotate(45deg) scale(0);
  }
  100% {
    opacity: 1;
    transform: rotate(45deg) scale(1);
  }
}

.success-title {
  font-size: 24px;
  font-weight: 700;
  color: #27ae60;
  margin: 0 0 8px 0;
}

.success-message {
  font-size: 16px;
  color: #666;
  margin: 0 0 24px 0;
}

.order-info {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  text-align: left;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
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

.info-value.price {
  font-size: 16px;
  font-weight: 700;
  color: #e74c3c;
}

/* 查询进度 */
.query-progress {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.progress-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.progress-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
}

.progress-status.querying {
  color: #667eea;
}

.progress-status.completed {
  color: #27ae60;
}

.progress-status.failed {
  color: #e74c3c;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 24px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
}

.step:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 20px;
  left: 60%;
  right: -40%;
  height: 2px;
  background: #f0f0f0;
  z-index: 1;
}

.step.completed:not(:last-child)::after {
  background: #27ae60;
}

.step-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  position: relative;
  z-index: 2;
  transition: all 0.3s ease;
}

.step.active .step-icon {
  background: #667eea;
  color: #fff;
}

.step.completed .step-icon {
  background: #27ae60;
  color: #fff;
}

.step-text {
  font-size: 12px;
  color: #666;
  text-align: center;
}

.step.active .step-text {
  color: #667eea;
  font-weight: 500;
}

.step.completed .step-text {
  color: #27ae60;
  font-weight: 500;
}

/* 结果预览 */
.result-preview {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.preview-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
}

.result-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.summary-item {
  text-align: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.summary-label {
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.summary-value {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.summary-value.success {
  color: #27ae60;
}

.data-preview {
  border-top: 1px solid #f0f0f0;
  padding-top: 20px;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.preview-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.preview-count {
  font-size: 12px;
  color: #666;
}

.data-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.data-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.item-index {
  font-size: 12px;
  font-weight: 600;
  color: #667eea;
}

.item-time {
  font-size: 12px;
  color: #666;
}

.item-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
}

.field-item {
  display: flex;
  flex-direction: column;
}

.field-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 2px;
}

.field-value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  word-break: break-all;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.btn {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-primary {
  background: #007bff;
  color: #fff;
}

.btn-primary:hover {
  background: #0056b3;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #6c757d;
  color: #fff;
  border: 1px solid #6c757d;
}

.btn-secondary:hover {
  background: #545b62;
  border-color: #545b62;
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
  padding: 40px;
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

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: nowrap;
}

.error-actions .btn {
  flex: 1;
  min-width: 100px;
  height: 44px;
  padding: 0 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.error-actions .btn-primary {
  background: #007bff;
  color: #fff;
}

.error-actions .btn-primary:hover {
  background: #0056b3;
  transform: translateY(-1px);
}

.error-actions .btn-secondary {
  background: #6c757d;
  color: #fff;
  border: 1px solid #6c757d;
}

.error-actions .btn-secondary:hover {
  background: #545b62;
  border-color: #545b62;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .payment-success {
    padding: 16px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .btn {
    padding: 12px 16px;
    font-size: 14px;
  }
  
  .result-summary {
    grid-template-columns: 1fr;
  }
  
  .item-content {
    grid-template-columns: 1fr;
  }
}
</style>