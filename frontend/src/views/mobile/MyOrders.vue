<template>
  <div class="my-orders">
    <!-- 顶部导航 -->
    <div class="top-nav">
      <button @click="goBack" class="nav-btn">
        <i class="fas fa-arrow-left"></i>
      </button>
      <h1 class="nav-title">我的订单</h1>
      <button @click="refreshOrders" class="nav-btn" :disabled="loading">
        <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
      </button>
    </div>

    <!-- 订单状态筛选 -->
    <div class="filter-container">
      <div 
        class="filter-tabs" 
        ref="filterTabs"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <div 
          v-for="tab in statusTabs" 
          :key="tab.value"
          class="filter-tab"
          :class="{ active: activeStatus === tab.value }"
          @click="changeStatus(tab.value)"
        >
          <span class="tab-text">{{ tab.label }}</span>
        </div>
      </div>
      <div class="filter-gradient"></div>
    </div>

    <!-- 订单列表 -->
    <div class="orders-container">
      <!-- 加载状态 -->
      <div v-if="loading && orders.length === 0" class="loading-state">
        <i class="fas fa-spinner fa-spin loading-icon"></i>
        <p class="loading-text">加载中...</p>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!loading && orders.length === 0" class="empty-state">
        <i class="fas fa-shopping-cart empty-icon"></i>
        <p class="empty-text">暂无订单</p>
        <p class="empty-desc">您还没有任何订单记录</p>
      </div>

      <!-- 订单列表 -->
      <div v-else class="orders-list">
        <div 
          v-for="order in orders" 
          :key="order.id"
          class="order-item"
          @click="viewOrderDetail(order)"
        >
          <!-- 订单头部 -->
          <div class="order-header">
            <div class="order-info">
              <span class="order-number">订单号: {{ order.orderNo }}</span>
              <span class="order-date">{{ formatDate(order.createdAt) }}</span>
            </div>
            <span class="order-status" :class="getStatusClass(order.status)">
              {{ getStatusText(order.status) }}
            </span>
          </div>

          <!-- 订单内容 -->
          <div class="order-content">
            <div class="order-details">
              <div class="detail-row">
                <span class="detail-label">查询类型:</span>
                <span class="detail-value">{{ order.queryType || '数据查询' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">查询参数:</span>
                <span class="detail-value">{{ order.queryParams || '***' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">结果数量:</span>
                <span class="detail-value">{{ order.resultCount || 0 }} 条</span>
              </div>
            </div>
            
            <div class="order-amount">
              <span class="amount-label">订单金额</span>
              <span class="amount-value">{{ order.amount || '¥0.00' }}</span>
            </div>
          </div>

          <!-- 订单操作 -->
          <div class="order-actions">
            <button 
              v-if="order.status === 'pending'"
              @click.stop="cancelOrder(order)"
              class="action-btn cancel-btn"
            >
              取消订单
            </button>
            <button 
              v-if="order.status === 'pending'"
              @click.stop="payOrder(order)"
              class="action-btn pay-btn"
            >
              立即支付
            </button>
            <button 
              v-if="order.status === 'completed'"
              @click.stop="downloadResult(order)"
              class="action-btn download-btn"
            >
              下载结果
            </button>
            <button 
              @click.stop="viewOrderDetail(order)"
              class="action-btn detail-btn"
            >
              查看详情
            </button>
          </div>
        </div>
      </div>

      <!-- 加载更多 -->
      <div v-if="hasMore && !loading" class="load-more">
        <button @click="loadMore" class="load-more-btn">
          加载更多
        </button>
      </div>

      <!-- 底部加载状态 -->
      <div v-if="loading && orders.length > 0" class="bottom-loading">
        <i class="fas fa-spinner fa-spin"></i>
        <span>加载中...</span>
      </div>
    </div>

    <!-- 订单详情弹窗 -->
    <div v-if="showOrderDetail" class="modal-overlay" @click="closeOrderDetail">
      <div class="modal-content order-detail-modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">订单详情</h3>
          <button @click="closeOrderDetail" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body" v-if="selectedOrder">
          <div class="detail-section">
            <h4 class="section-title">基本信息</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="item-label">订单号</span>
                <span class="item-value">{{ selectedOrder.orderNumber }}</span>
              </div>
              <div class="detail-item">
                <span class="item-label">创建时间</span>
                <span class="item-value">{{ formatDateTime(selectedOrder.createdAt) }}</span>
              </div>
              <div class="detail-item">
                <span class="item-label">订单状态</span>
                <span class="item-value" :class="getStatusClass(selectedOrder.status)">
                  {{ getStatusText(selectedOrder.status) }}
                </span>
              </div>
              <div class="detail-item">
                <span class="item-label">订单金额</span>
                <span class="item-value amount">{{ selectedOrder.amount || '¥0.00' }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4 class="section-title">查询信息</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="item-label">查询类型</span>
                <span class="item-value">{{ selectedOrder.queryType || '数据查询' }}</span>
              </div>
              <div class="detail-item">
                <span class="item-label">查询参数</span>
                <span class="item-value">{{ selectedOrder.queryParams || '***' }}</span>
              </div>
              <div class="detail-item">
                <span class="item-label">结果数量</span>
                <span class="item-value">{{ selectedOrder.resultCount || 0 }} 条</span>
              </div>
            </div>
          </div>

          <div v-if="selectedOrder.status === 'completed'" class="detail-section">
            <h4 class="section-title">查询结果</h4>
            <div class="result-preview">
              <p class="result-text">查询已完成，点击下载按钮获取完整结果</p>
              <button @click="downloadResult(selectedOrder)" class="download-result-btn">
                <i class="fas fa-download"></i>
                下载结果文件
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { orderApi } from '@/api/order.ts'

const router = useRouter()
const route = useRoute()

// 订单数据
const orders = ref([])
const loading = ref(false)
const hasMore = ref(true)
const currentPage = ref(1)
const activeStatus = ref('all')

// 订单详情
const showOrderDetail = ref(false)
const selectedOrder = ref(null)

// 滑动相关状态
const filterTabs = ref(null)
const touchState = ref({
  startX: 0,
  startY: 0,
  currentX: 0,
  startScrollLeft: 0,
  isDragging: false,
  startTime: 0,
  velocityX: 0,
  lastMoveTime: 0,
  animationId: null
})

// 状态筛选标签（不显示数量，避免分页导致的数量不准确问题）
const statusTabs = computed(() => [
  { label: '全部', value: 'all' },
  { label: '待支付', value: 'pending' },
  { label: '已支付', value: 'paid' },
  { label: '处理中', value: 'processing' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' }
])

// 订单数据现在通过API获取

// 获取订单状态样式类
const getStatusClass = (status) => {
  const statusMap = {
    pending: 'status-pending',
    paid: 'status-paid',
    processing: 'status-processing',
    completed: 'status-completed',
    cancelled: 'status-cancelled',
    failed: 'status-failed'
  }
  return statusMap[status] || ''
}

// 获取订单状态文本
const getStatusText = (status) => {
  const statusMap = {
    pending: '待支付',
    paid: '已支付',
    processing: '处理中',
    completed: '已完成',
    cancelled: '已取消',
    failed: '查询失败'
  }
  return statusMap[status] || '未知'
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
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

// 返回上一页
const goBack = () => {
  router.back()
}

// 刷新订单
const refreshOrders = async () => {
  currentPage.value = 1
  hasMore.value = true
  await fetchOrders(true)
}

// 切换状态筛选
const changeStatus = (status) => {
  activeStatus.value = status
  currentPage.value = 1
  hasMore.value = true
  fetchOrders(true)
}

// 触摸开始
const handleTouchStart = (e) => {
  if (!filterTabs.value) return
  
  const touch = e.touches[0]
  touchState.value.startX = touch.clientX
  touchState.value.startY = touch.clientY
  touchState.value.currentX = touch.clientX
  touchState.value.startScrollLeft = filterTabs.value.scrollLeft
  touchState.value.isDragging = false
  touchState.value.startTime = Date.now()
  touchState.value.velocityX = 0
  touchState.value.lastMoveTime = touchState.value.startTime
  
  // 停止任何正在进行的动画
  if (touchState.value.animationId) {
    cancelAnimationFrame(touchState.value.animationId)
    touchState.value.animationId = null
  }
}

// 触摸移动
const handleTouchMove = (e) => {
  if (!filterTabs.value) return
  
  const touch = e.touches[0]
  const deltaX = touchState.value.startX - touch.clientX
  const deltaY = Math.abs(touchState.value.startY - touch.clientY)
  
  // 判断是否为水平滑动
  if (!touchState.value.isDragging && Math.abs(deltaX) > 5) {
    if (deltaY < Math.abs(deltaX) * 0.5) {
      touchState.value.isDragging = true
      e.preventDefault()
    }
  }
  
  if (touchState.value.isDragging) {
    e.preventDefault()
    
    // 计算速度
    const now = Date.now()
    const timeDelta = now - touchState.value.lastMoveTime
    if (timeDelta > 0) {
      touchState.value.velocityX = (touch.clientX - touchState.value.currentX) / timeDelta
    }
    touchState.value.currentX = touch.clientX
    touchState.value.lastMoveTime = now
    
    // 应用滚动，添加边界阻尼
    let newScrollLeft = touchState.value.startScrollLeft + deltaX
    const maxScrollLeft = filterTabs.value.scrollWidth - filterTabs.value.clientWidth
    
    // 边界阻尼效果
    if (newScrollLeft < 0) {
      newScrollLeft = newScrollLeft * 0.3 // 左边界阻尼
    } else if (newScrollLeft > maxScrollLeft) {
      const overScroll = newScrollLeft - maxScrollLeft
      newScrollLeft = maxScrollLeft + overScroll * 0.3 // 右边界阻尼
    }
    
    filterTabs.value.scrollLeft = newScrollLeft
  }
}

// 触摸结束
const handleTouchEnd = (e) => {
  if (!filterTabs.value || !touchState.value.isDragging) {
    touchState.value.isDragging = false
    return
  }
  
  e.preventDefault()
  touchState.value.isDragging = false
  
  // 惯性滑动
  if (Math.abs(touchState.value.velocityX) > 0.1) {
    startInertiaScroll()
  }
}

// 惯性滑动
const startInertiaScroll = () => {
  if (!filterTabs.value) return
  
  let velocity = touchState.value.velocityX * 20 // 增强初始速度
  const deceleration = 0.92 // 调整减速系数，更自然
  const minVelocity = 0.3 // 降低最小速度阈值
  
  const animate = () => {
    if (Math.abs(velocity) < minVelocity) {
      touchState.value.animationId = null
      return
    }
    
    const currentScrollLeft = filterTabs.value.scrollLeft
    const newScrollLeft = currentScrollLeft - velocity
    const maxScrollLeft = filterTabs.value.scrollWidth - filterTabs.value.clientWidth
    
    // 边界处理 - 添加回弹效果
    if (newScrollLeft < 0) {
      // 左边界回弹
      const bounceDistance = Math.abs(newScrollLeft)
      const dampedDistance = bounceDistance * 0.3
      filterTabs.value.scrollLeft = -dampedDistance
      velocity *= -0.5 // 反向并减速
      if (Math.abs(velocity) < 1) {
        // 回弹到边界
        smoothScrollTo(0)
        touchState.value.animationId = null
        return
      }
    } else if (newScrollLeft > maxScrollLeft) {
      // 右边界回弹
      const bounceDistance = newScrollLeft - maxScrollLeft
      const dampedDistance = bounceDistance * 0.3
      filterTabs.value.scrollLeft = maxScrollLeft + dampedDistance
      velocity *= -0.5 // 反向并减速
      if (Math.abs(velocity) < 1) {
        // 回弹到边界
        smoothScrollTo(maxScrollLeft)
        touchState.value.animationId = null
        return
      }
    } else {
      filterTabs.value.scrollLeft = newScrollLeft
    }
    
    velocity *= deceleration
    touchState.value.animationId = requestAnimationFrame(animate)
  }
  
  touchState.value.animationId = requestAnimationFrame(animate)
}

// 平滑滚动到指定位置
const smoothScrollTo = (targetScrollLeft) => {
  if (!filterTabs.value) return
  
  const startScrollLeft = filterTabs.value.scrollLeft
  const distance = targetScrollLeft - startScrollLeft
  const duration = 300 // 动画持续时间
  const startTime = Date.now()
  
  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    // 使用缓动函数
    const easeOutCubic = 1 - Math.pow(1 - progress, 3)
    const currentScrollLeft = startScrollLeft + distance * easeOutCubic
    
    filterTabs.value.scrollLeft = currentScrollLeft
    
    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }
  
  requestAnimationFrame(animate)
}

// 获取订单列表
const fetchOrders = async (reset = false) => {
  if (loading.value) return
  
  try {
    loading.value = true
    
    const params = {
      page: reset ? 1 : currentPage.value,
      limit: 10,
      status: activeStatus.value === 'all' ? undefined : activeStatus.value
    }
    
    const response = await orderApi.getUserOrders(params)
    
    if (response.code === 200) {
      const newOrders = response.data.orders || []
      
      if (reset) {
        orders.value = newOrders
      } else {
        orders.value = [...orders.value, ...newOrders]
      }
      
      // 检查是否还有更多数据
      hasMore.value = newOrders.length === params.limit && newOrders.length > 0
      
      if (reset) {
        currentPage.value = 1
      }
    } else {
      ElMessage.error(response.message || '获取订单列表失败')
    }
  } catch (error) {
    console.error('获取订单列表失败:', error)
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

// 加载更多
const loadMore = () => {
  currentPage.value++
  fetchOrders()
}

// 查看订单详情
const viewOrderDetail = (order) => {
  selectedOrder.value = order
  showOrderDetail.value = true
}

// 关闭订单详情
const closeOrderDetail = () => {
  showOrderDetail.value = false
  selectedOrder.value = null
}

// 取消订单
const cancelOrder = async (order) => {
  try {
    const result = await ElMessageBox.confirm(
      '确定要取消这个订单吗？取消后无法恢复。',
      '取消订单',
      {
        confirmButtonText: '确定取消',
        cancelButtonText: '我再想想',
        type: 'warning'
      }
    )
    
    if (result === 'confirm') {
      const response = await orderApi.cancelOrder(order.id)
      
      if (response.code === 200) {
        order.status = 'cancelled'
        ElMessage.success('订单已取消')
        // 刷新订单列表
        await refreshOrders()
      } else {
        ElMessage.error(response.message || '取消订单失败')
      }
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消订单失败:', error)
      ElMessage.error('取消订单失败')
    }
  }
}

// 支付订单
const payOrder = (order) => {
  router.push(`/mobile/payment/${order.orderNo}`)
}

// 下载结果
const downloadResult = async (order) => {
  try {
    ElMessage.success('开始下载查询结果...')
    
    // 调用下载API
    const response = await fetch(`/api/orders/orderNo/${order.orderNo}/download`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    // 获取响应数据
    const data = await response.json()
    
    // 创建下载链接
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    // 从响应头或数据中获取文件名
    const filename = `查询结果_${order.orderNo}_${new Date().toISOString().slice(0, 10)}.json`
    link.download = filename
    
    // 触发下载
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    ElMessage.success('下载完成！')
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error('下载失败，请稍后重试')
  }
}

onMounted(() => {
  // 检查URL参数中的状态筛选
  if (route.query.status) {
    activeStatus.value = route.query.status
  }
  fetchOrders(true)
})
</script>

<style scoped>
.my-orders {
  min-height: 100vh;
  background: #f8f9fa;
  padding-bottom: 20px;
}

/* 顶部导航 */
.top-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: #f8f9fa;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-btn:hover:not(:disabled) {
  background: #e9ecef;
}

.nav-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.nav-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

/* 筛选标签容器 */
.filter-container {
  position: relative;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.filter-tabs {
  display: flex;
  padding: 0 16px;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
  /* 性能优化 */
  will-change: scroll-position;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
  /* 触摸优化 */
  touch-action: pan-x;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

.filter-tabs::-webkit-scrollbar {
  display: none;
}

.filter-gradient {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 20px;
  background: linear-gradient(to left, rgba(255, 255, 255, 0.9), transparent);
  pointer-events: none;
  z-index: 1;
}

.filter-tab {
  display: flex;
  align-items: center;
  padding: 16px 12px;
  cursor: pointer;
  position: relative;
  white-space: nowrap;
  transition: all 0.2s ease;
  flex-shrink: 0;
  min-width: fit-content;
}

.filter-tab.active {
  color: #007bff;
}

.filter-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #007bff;
}

.tab-text {
  font-size: 15px;
  font-weight: 500;
}

.tab-badge {
  background: #007bff;
  color: #fff;
  font-size: 11px;
  padding: 1px 5px;
  border-radius: 8px;
  margin-left: 4px;
  min-width: 16px;
  text-align: center;
  line-height: 1.2;
}

.filter-tab.active .tab-badge {
  background: #fff;
  color: #007bff;
}

/* 响应式优化 */
@media (max-width: 375px) {
  .filter-tabs {
    padding: 0 12px;
  }
  
  .filter-tab {
    padding: 16px 8px;
  }
  
  .tab-text {
    font-size: 14px;
  }
  
  .tab-badge {
    font-size: 10px;
    padding: 1px 4px;
    margin-left: 3px;
    min-width: 14px;
  }
}

@media (max-width: 320px) {
  .filter-tabs {
    padding: 0 8px;
  }
  
  .filter-tab {
    padding: 16px 6px;
  }
  
  .tab-text {
    font-size: 13px;
  }
}

/* 订单容器 */
.orders-container {
  padding: 20px;
}

/* 加载和空状态 */
.loading-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.loading-icon,
.empty-icon {
  font-size: 48px;
  color: #ccc;
  margin-bottom: 16px;
}

.loading-text,
.empty-text {
  font-size: 16px;
  color: #666;
  margin: 0 0 8px 0;
}

.empty-desc {
  font-size: 14px;
  color: #999;
  margin: 0;
}

/* 订单列表 */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-item {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.order-item:hover {
  transform: translateY(-2px);
  background: #f8f9fa;
}

/* 订单头部 */
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.order-info {
  flex: 1;
}

.order-number {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.order-date {
  font-size: 14px;
  color: #666;
}

.order-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-paid {
  background: #cce5ff;
  color: #004085;
}

.status-processing {
  background: #d1ecf1;
  color: #0c5460;
}

.status-completed {
  background: #d4edda;
  color: #155724;
}

.status-cancelled {
  background: #f8d7da;
  color: #721c24;
}

.status-failed {
  background: #f8d7da;
  color: #721c24;
}

/* 订单内容 */
.order-content {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.order-details {
  flex: 1;
}

.detail-row {
  display: flex;
  margin-bottom: 8px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-label {
  font-size: 14px;
  color: #666;
  width: 80px;
  flex-shrink: 0;
}

.detail-value {
  font-size: 14px;
  color: #333;
  flex: 1;
}

.order-amount {
  text-align: right;
  margin-left: 20px;
}

.amount-label {
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.amount-value {
  font-size: 18px;
  font-weight: 600;
  color: #007bff;
}

/* 订单操作 */
.order-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn {
  background: #f8f9fa;
  color: #666;
}

.cancel-btn:hover {
  background: #e9ecef;
}

.pay-btn {
  background: #007bff;
  color: #fff;
}

.pay-btn:hover {
  background: #0056b3;
}

.download-btn {
  background: #28a745;
  color: #fff;
}

.download-btn:hover {
  background: #1e7e34;
}

.detail-btn {
  background: #f8f9fa;
  color: #333;
}

.detail-btn:hover {
  background: #e9ecef;
}

/* 加载更多 */
.load-more {
  text-align: center;
  margin-top: 20px;
}

.load-more-btn {
  padding: 12px 24px;
  border: none;
  background: #f8f9fa;
  color: #333;
  border-radius: 10px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.load-more-btn:hover {
  background: #e9ecef;
}

.bottom-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  color: #666;
}

/* 订单详情弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.modal-close {
  width: 32px;
  height: 32px;
  border: none;
  background: #f8f9fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
}

.detail-grid {
  display: grid;
  gap: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f8f9fa;
}

.detail-item:last-child {
  border-bottom: none;
}

.item-label {
  font-size: 14px;
  color: #666;
}

.item-value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.item-value.amount {
  color: #007bff;
  font-size: 16px;
}

.result-preview {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
}

.result-text {
  font-size: 14px;
  color: #666;
  margin: 0 0 16px 0;
}

.download-result-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  background: #28a745;
  color: #fff;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.download-result-btn:hover {
  background: #1e7e34;
}
</style>