<template>
  <div class="payment-success-container">
    <div class="success-card">
      <!-- 支付成功状态 -->
      <div class="success-header">
        <div class="success-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <h2>支付成功</h2>
        <p class="success-message">您的查询订单已支付成功，正在为您查询数据...</p>
      </div>

      <!-- 订单信息 -->
      <div class="order-info">
        <h3>订单信息</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">订单号：</span>
            <span class="value">{{ orderInfo.orderNo }}</span>
          </div>
          <div class="info-item">
            <span class="label">查询项目：</span>
            <span class="value">{{ orderInfo.queryItemName }}</span>
          </div>
          <div class="info-item">
            <span class="label">支付金额：</span>
            <span class="value amount">¥{{ formatAmount(orderInfo.amount) }}</span>
          </div>
          <div class="info-item">
            <span class="label">支付时间：</span>
            <span class="value">{{ formatTime(orderInfo.paidAt) }}</span>
          </div>
        </div>
      </div>

      <!-- 查询状态 -->
      <div class="query-status">
        <div class="status-header">
          <h3>查询状态</h3>
          <div class="status-indicator" :class="queryStatusClass">
            <i :class="queryStatusIcon"></i>
            <span>{{ queryStatusText }}</span>
          </div>
        </div>
        
        <!-- 查询进度 -->
        <div v-if="isQuerying" class="query-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressWidth + '%' }"></div>
          </div>
          <p class="progress-text">正在查询数据，请稍候...</p>
        </div>
      </div>

      <!-- 查询结果 -->
      <div v-if="queryResult !== null && !isQuerying" class="query-result">
        <h3>查询结果</h3>
        <div class="result-container">
          <!-- 如果是表格数据 -->
          <div v-if="isTableData" class="table-result">
            <el-table :data="tableData" stripe style="width: 100%">
              <el-table-column
                v-for="column in tableColumns"
                :key="column.prop"
                :prop="column.prop"
                :label="column.label"
                :width="column.width"
              />
            </el-table>
          </div>
          
          <!-- 如果是JSON数据 -->
          <div v-else class="json-result">
            <pre>{{ formatJSON(queryResult) }}</pre>
          </div>
          
          <!-- 如果查询结果为空 -->
          <div v-if="!queryResult || (typeof queryResult === 'object' && Object.keys(queryResult).length === 0)" class="empty-result">
            <p>查询完成，但未返回数据。</p>
          </div>
        </div>
      </div>

      <!-- 查询失败 -->
      <div v-if="queryError" class="query-error">
        <div class="error-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h3>查询失败</h3>
        <p>{{ queryError }}</p>
        <div class="retry-info" v-if="retryCount > 0">
          <p class="retry-count">已重试 {{ retryCount }}/{{ maxRetryCount }} 次</p>
        </div>
        <el-button 
          type="primary" 
          @click="retryQuery"
          :disabled="retryCount >= maxRetryCount"
        >
          {{ retryCount >= maxRetryCount ? '已达最大重试次数' : '重试查询' }}
        </el-button>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button @click="goToOrders">查看订单</el-button>
        <el-button type="primary" @click="goToQuery">继续查询</el-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElTable, ElTableColumn, ElButton } from 'element-plus'

export default {
  name: 'PaymentSuccess',
  components: {
    ElTable,
    ElTableColumn,
    ElButton
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    
    // 响应式数据
    const orderInfo = ref({
      orderNo: '',
      queryItemName: '',
      amount: 0,
      paidAt: ''
    })
    
    const isQuerying = ref(true)
    const queryResult = ref<any[] | null>(null)
    const queryError = ref('')
    const progressWidth = ref(0)
    const queryStartTime = ref(Date.now())
    const maxQueryTime = 3 * 60 * 1000 // 3分钟超时（降低超时时间）
    const maxRetryCount = 3 // 最大重试次数
    const retryCount = ref(0) // 当前重试次数
    const checkCount = ref(0) // 错误检查计数器
    const networkErrorCount = ref(0) // 网络错误计数器
    
    let progressInterval: NodeJS.Timeout | null = null
    let statusCheckInterval: NodeJS.Timeout | null = null
    
    // 计算属性
    const queryStatusClass = computed(() => {
      if (isQuerying.value) return 'status-querying'
      if (queryError.value) return 'status-error'
      if (queryResult.value !== null) return 'status-success'
      return 'status-pending'
    })
    
    const queryStatusIcon = computed(() => {
      if (isQuerying.value) return 'fas fa-spinner fa-spin'
      if (queryError.value) return 'fas fa-times-circle'
      if (queryResult.value !== null) return 'fas fa-check-circle'
      return 'fas fa-clock'
    })
    
    const queryStatusText = computed(() => {
      if (isQuerying.value) return '查询中...'
      if (queryError.value) return '查询失败'
      if (queryResult.value !== null) return '查询完成'
      return '等待查询'
    })
    
    const isTableData = computed(() => {
      return Array.isArray(queryResult.value) && queryResult.value.length > 0
    })
    
    const tableData = computed(() => {
      if (!isTableData.value) return []
      return queryResult.value || []
    })
    
    const tableColumns = computed(() => {
      if (!isTableData.value || !tableData.value || tableData.value.length === 0) return []
      
      const firstRow = tableData.value[0]
      return Object.keys(firstRow).map(key => ({
        prop: key,
        label: key,
        width: 'auto'
      }))
    })
    
    // 方法
    const initOrderInfo = () => {
      // 支持多种订单号参数格式
      const orderNo = route.query.orderNo || route.query.out_trade_no
      
      if (!orderNo) {
        ElMessage.error('订单号不存在')
        router.push('/user')
        return
      }
      
      // 初始化订单信息，先使用路由参数中的信息
      orderInfo.value = {
        orderNo: String(orderNo),
        queryItemName: route.query.name ? String(route.query.name) : '查询服务',
        amount: route.query.money ? parseFloat(String(route.query.money)) : 0,
        paidAt: new Date().toISOString()
      }
      
      // 如果是支付回调，显示支付成功信息
      if (route.query.trade_status === 'TRADE_SUCCESS') {
        ElMessage.success('支付成功！')
      }
      
      // 获取详细的订单信息
      fetchOrderInfo()
    }
    
    const fetchOrderInfo = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`/api/orders/orderNo/${orderInfo.value.orderNo}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (!response.ok) {
          if (response.status === 404) {
            ElMessage.error('订单不存在，请检查订单号是否正确')
            return
          }
          if (response.status === 401) {
            ElMessage.error('登录已过期，请重新登录')
            return
          }
          throw new Error(`API请求失败: ${response.status}`)
        }

        const data = await response.json()
        
        if (data && data.code === 200 && data.data) {
          const order = data.data
          
          // 优先使用API返回的金额，如果为空或为0则使用路由参数中的金额
          const apiAmount = parseFloat(String(order.amount || order.totalAmount || '0'))
          // 修复：从路由参数中获取金额，支持多种参数名
          const routeAmount = parseFloat(String(route.query.amount || route.query.money || route.query.price || '0'))
          
          // 选择有效的金额值，确保不是NaN
          let finalAmount = 0
          if (!isNaN(apiAmount) && apiAmount > 0) {
            finalAmount = apiAmount
          } else if (!isNaN(routeAmount) && routeAmount > 0) {
            finalAmount = routeAmount
          }
          
          // 获取查询项目名称
          let queryItemName = order.queryItemName || order.queryItem?.name || order.itemName
          if (!queryItemName && route.query.name) {
            queryItemName = String(route.query.name)
          }
          if (!queryItemName) {
            queryItemName = '查询服务'
          }
          
          // 获取支付时间
          let paidAt = order.paidAt || order.completedAt || order.paymentTime || order.createdAt
          if (!paidAt) {
            paidAt = new Date().toISOString()
          }
          
          orderInfo.value = {
            orderNo: order.orderNo || order.id || orderInfo.value.orderNo,
            queryItemName: queryItemName,
            amount: finalAmount,
            paidAt: paidAt
          }
          
          // 根据订单状态决定下一步操作
          if (order.status === 'pending') {
            ElMessage.info('正在等待支付确认，请稍候...')
            startOrderStatusCheck()
          } else {
            // 对于其他所有状态（paid, processing, completed, failed等），都启动查询状态检查
            startQueryStatusCheck()
          }
        } else {
          // API返回格式不正确，使用路由参数并启动查询状态检查
          if (route.query.amount || route.query.money || route.query.price) {
            const routeAmount = parseFloat(String(route.query.amount || route.query.money || route.query.price || '0'))
            if (!isNaN(routeAmount) && routeAmount > 0) {
              orderInfo.value.amount = routeAmount
            }
          }
          if (route.query.name) {
            orderInfo.value.queryItemName = String(route.query.name)
          }
          startQueryStatusCheck()
        }
      } catch (error) {
        // 获取订单信息失败，使用路由参数并启动查询状态检查
        if (route.query.amount || route.query.money || route.query.price) {
          const routeAmount = parseFloat(String(route.query.amount || route.query.money || route.query.price || '0'))
          if (!isNaN(routeAmount) && routeAmount > 0) {
            orderInfo.value.amount = routeAmount
          }
        }
        if (route.query.name) {
          orderInfo.value.queryItemName = String(route.query.name)
        }
        startQueryStatusCheck()
        // 移除警告信息，静默处理订单信息获取失败的情况
      }
    }
    
    const startQueryStatusCheck = () => {
      // 如果已经有状态检查在运行，先停止它
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval)
        statusCheckInterval = null
      }
      
      // 重置查询开始时间和计数器
      queryStartTime.value = Date.now()
      checkCount.value = 0
      networkErrorCount.value = 0
      
      // 开始进度条动画
      startProgressAnimation()
      
      // 开始状态检查
      statusCheckInterval = setInterval(async () => {
        await checkQueryStatus()
      }, 2000) // 每2秒检查一次
      
      // 立即检查一次
      checkQueryStatus()
    }
    
    const startProgressAnimation = () => {
      progressWidth.value = 0
      progressInterval = setInterval(() => {
        if (progressWidth.value < 90) {
          progressWidth.value += Math.random() * 10
        }
      }, 500)
    }
    
    const stopProgressAnimation = () => {
      if (progressInterval) {
        clearInterval(progressInterval)
        progressInterval = null
      }
      progressWidth.value = 100
    }
    
    const checkQueryStatus = async () => {
      try {
        // 检查是否超时
        const currentTime = Date.now()
        if (currentTime - queryStartTime.value > maxQueryTime) {
          isQuerying.value = false
          queryError.value = '查询超时，可能是API配置错误或网络问题，请检查配置后重试'
          stopProgressAnimation()
          stopStatusCheck()
          ElMessage.error('查询超时，请检查API配置或稍后重试')
          return
        }
        
        const token = localStorage.getItem('token')
        
        const response = await fetch(`/api/queries/results/order/${orderInfo.value.orderNo}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          
          if (data.code === 200 && data.data) {
            const progress = data.data
            
            if (progress.status === 'completed' && progress.result !== undefined) {
              // 查询完成，只有当前没有结果时才设置结果，避免重复显示
              if (queryResult.value === null) {
                queryResult.value = progress.result
                ElMessage.success('查询完成！')
              }
              isQuerying.value = false
              stopProgressAnimation()
              stopStatusCheck()
            } else if (progress.status === 'failed') {
              // 查询失败
              isQuerying.value = false
              queryError.value = progress.error || progress.message || '查询处理失败，可能是API配置错误，请检查配置后重试'
              stopProgressAnimation()
              stopStatusCheck()
              ElMessage.error(queryError.value)
            } else if (progress.status === 'querying' || progress.status === 'processing') {
              // 查询进行中，继续等待
            } else {
              // 如果数据格式不正确，可能是API配置问题
              checkCount.value++
              if (checkCount.value > 10) { // 连续10次数据格式错误，可能是配置问题
                isQuerying.value = false
                queryError.value = 'API返回数据格式错误，可能是API配置问题，请检查配置'
                stopProgressAnimation()
                stopStatusCheck()
                ElMessage.error('API配置可能有误，请检查配置后重试')
              }
            }
          } else {
            // 如果数据格式不正确，可能是API配置问题
            checkCount.value++
            if (checkCount.value > 10) { // 连续10次数据格式错误，可能是配置问题
              isQuerying.value = false
              queryError.value = 'API返回数据格式错误，可能是API配置问题，请检查配置'
              stopProgressAnimation()
              stopStatusCheck()
              ElMessage.error('API配置可能有误，请检查配置后重试')
            }
          }
        } else if (response.status === 400) {
          // 查询尚未完成，继续等待
          const errorData = await response.json()
          
          // 检查是否是API配置错误导致的400
          if (errorData && errorData.message && errorData.message.includes('API')) {
            checkCount.value++
            if (checkCount.value > 5) { // 连续5次API相关错误，可能是配置问题
              isQuerying.value = false
              queryError.value = 'API配置错误，请检查后台API配置是否正确'
              stopProgressAnimation()
              stopStatusCheck()
              ElMessage.error('API配置错误，请检查后台配置')
              return
            }
          }
        } else if (response.status === 404) {
          // 订单不存在
          const errorData = await response.json()
          console.error('订单不存在:', errorData)
          isQuerying.value = false
          queryError.value = '订单不存在'
          stopProgressAnimation()
          stopStatusCheck()
          ElMessage.error('订单不存在')
        } else if (response.status === 403) {
          // 无权访问
          const errorData = await response.json()
          console.error('无权访问此订单:', errorData)
          isQuerying.value = false
          queryError.value = '无权访问此订单'
          stopProgressAnimation()
          stopStatusCheck()
          ElMessage.error('无权访问此订单')
        } else if (response.status >= 500) {
          // 服务器错误，可能是API配置问题
          const errorData = await response.json().catch(() => ({}))
          console.error('服务器错误:', response.status, errorData)
          checkCount.value++
          if (checkCount.value > 3) { // 连续3次服务器错误，可能是配置问题
            isQuerying.value = false
            queryError.value = '服务器错误，可能是API配置问题，请检查配置'
            stopProgressAnimation()
            stopStatusCheck()
            ElMessage.error('服务器错误，请检查API配置')
          }
        } else {
          const errorData = await response.json().catch(() => ({}))
          isQuerying.value = false
          queryError.value = `查询失败 (${response.status}): ${errorData.message || '未知错误'}`
          stopProgressAnimation()
          stopStatusCheck()
          ElMessage.error(queryError.value)
        }
      } catch (error) {
        isQuerying.value = false
        queryError.value = '网络错误或API配置错误，请检查配置后重试'
        stopProgressAnimation()
        stopStatusCheck()
        ElMessage.error('网络错误，请检查网络连接或API配置')
      }
    }
    
    const startOrderStatusCheck = () => {
      // 开始订单状态检查，每3秒检查一次
      const orderStatusInterval = setInterval(async () => {
        try {
          const token = localStorage.getItem('token')
          const response = await fetch(`/api/orders/orderNo/${orderInfo.value.orderNo}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            if (data && data.code === 200 && data.data) {
              const order = data.data
              
              if (order.status === 'paid' || order.status === 'processing' || order.status === 'completed') {
                // 订单已支付，清除定时器并开始查询状态检查
                clearInterval(orderStatusInterval)
                ElMessage.success('支付确认成功，开始查询数据...')
                startQueryStatusCheck()
              } else if (order.status === 'failed') {
                // 统一错误处理 - 让查询结果API来处理错误信息
                clearInterval(orderStatusInterval)
                // 不在这里设置错误信息，启动查询状态检查让后端统一处理
                startQueryStatusCheck()
              }
              // 如果还是pending状态，继续等待
            }
          }
        } catch (error) {
          console.error('检查订单状态失败:', error)
          // 继续重试，不显示错误
        }
      }, 3000) // 每3秒检查一次
      
      // 移除超时逻辑，让用户可以一直等待支付确认
    }
    
    const stopStatusCheck = () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval)
        statusCheckInterval = null
      }
    }
    
    const retryQuery = async () => {
      try {
        // 检查重试次数
        if (retryCount.value >= maxRetryCount) {
          ElMessage.error(`已达到最大重试次数(${maxRetryCount})，请检查API配置或稍后再试`)
          return
        }
        
        retryCount.value++
        
        // 重置计数器
        checkCount.value = 0
        networkErrorCount.value = 0
        
        const token = localStorage.getItem('token')
        const response = await fetch(`/api/queries/execute/order/${orderInfo.value.orderNo}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          queryError.value = ''
          isQuerying.value = true
          startQueryStatusCheck()
          ElMessage.success(`重新开始查询 (第${retryCount.value}次重试)`)
        } else {
          const errorData = await response.json().catch(() => ({}))
          if (response.status >= 500) {
            throw new Error('服务器错误，可能是API配置问题')
          } else if (response.status === 400 && errorData.message && errorData.message.includes('API')) {
            throw new Error('API配置错误，请检查后台配置')
          } else {
            throw new Error(`重试查询失败: ${response.status}`)
          }
        }
      } catch (error: any) {
        console.error('重试查询失败:', error)
        ElMessage.error(error.message || '重试查询失败')
        
        // 如果是配置相关错误，不再自动重试
        if (error.message && (error.message.includes('API配置') || error.message.includes('服务器错误'))) {
          retryCount.value = maxRetryCount // 阻止进一步重试
        }
      }
    }
    
    const formatTime = (timeStr: string) => {
      if (!timeStr) return ''
      
      try {
        const date = new Date(timeStr)
        return date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      } catch (error) {
        return timeStr
      }
    }
    
    const formatJSON = (data: any) => {
      try {
        // 如果数据包含重复的结构（data和apiResponse相同），只显示其中一个
        if (data && typeof data === 'object') {
          // 检查是否有data和apiResponse字段，且内容相同
          if (data.data && data.apiResponse && JSON.stringify(data.data) === JSON.stringify(data.apiResponse)) {
            // 只返回data部分，避免重复显示
            return JSON.stringify(data.data, null, 2)
          }
          // 如果有data字段但没有重复，优先显示data
          if (data.data && !data.apiResponse) {
            return JSON.stringify(data.data, null, 2)
          }
        }
        return JSON.stringify(data, null, 2)
      } catch (error) {
        return String(data)
      }
    }
    
    const formatAmount = (amount: number) => {
      if (amount === null || amount === undefined || isNaN(amount)) {
        return '0.00'
      }
      return Number(amount).toFixed(2)
    }
    
    const goToOrders = () => {
      router.push('/user')
    }
    
    const goToQuery = () => {
      router.push('/query')
    }
    
    // 生命周期
    onMounted(() => {
      initOrderInfo()
    })
    
    onUnmounted(() => {
      stopProgressAnimation()
      stopStatusCheck()
    })
    
    return {
        orderInfo,
        isQuerying,
        queryResult,
        queryError,
        progressWidth,
        retryCount,
        maxRetryCount,
        queryStatusClass,
        queryStatusIcon,
        queryStatusText,
        isTableData,
        tableData,
        tableColumns,
        retryQuery,
        formatTime,
        formatJSON,
        formatAmount,
        goToOrders,
        goToQuery
      }
  }
}
</script>

<style scoped>
.payment-success-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.success-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 32px;
  max-width: 800px;
  width: 100%;
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.success-header {
  text-align: center;
  margin-bottom: 32px;
}

.success-icon {
  font-size: 64px;
  color: #27ae60;
  margin-bottom: 16px;
}

.success-header h2 {
  color: #2c3e50;
  margin-bottom: 8px;
  font-size: 28px;
  font-weight: 600;
}

.success-message {
  color: #7f8c8d;
  font-size: 16px;
}

.order-info {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}

.order-info h3 {
  color: #2c3e50;
  margin-bottom: 16px;
  font-size: 18px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-item .label {
  color: #7f8c8d;
  font-weight: 500;
}

.info-item .value {
  color: #2c3e50;
  font-weight: 600;
}

.info-item .amount {
  color: #e74c3c;
  font-size: 18px;
}

.query-status {
  margin-bottom: 24px;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.status-header h3 {
  color: #2c3e50;
  font-size: 18px;
  margin: 0;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 500;
}

.status-querying {
  background: #e3f2fd;
  color: #1976d2;
}

.status-success {
  background: #e8f5e8;
  color: #27ae60;
}

.status-error {
  background: #ffebee;
  color: #e74c3c;
}

.query-progress {
  margin-top: 16px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #ecf0f1;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3498db, #2ecc71);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  color: #7f8c8d;
  margin-top: 8px;
  font-size: 14px;
}

.query-result {
  margin-bottom: 24px;
}

.query-result h3 {
  color: #2c3e50;
  margin-bottom: 16px;
  font-size: 18px;
}

.result-container {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  max-height: 400px;
  overflow-y: auto;
}

.json-result pre {
  background: #2c3e50;
  color: #ecf0f1;
  padding: 16px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
  overflow-x: auto;
}

.query-error {
  text-align: center;
  padding: 24px;
  margin-bottom: 24px;
}

.error-icon {
  font-size: 48px;
  color: #e74c3c;
  margin-bottom: 16px;
}

.query-error h3 {
  color: #e74c3c;
  margin-bottom: 8px;
}

.query-error p {
  color: #7f8c8d;
  margin-bottom: 16px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
}

@media (max-width: 768px) {
  .success-card {
    padding: 24px;
    margin: 10px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .status-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>