<template>
  <div class="query-history">
    <!-- 顶部导航 -->
    <div class="top-nav">
      <button @click="goBack" class="nav-btn">
        <i class="fas fa-arrow-left"></i>
      </button>
      <h1 class="nav-title">查询记录</h1>
      <button @click="refreshHistory" class="nav-btn" :disabled="loading">
        <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
      </button>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-section">
      <div class="search-bar">
        <i class="fas fa-search search-icon"></i>
        <input 
          v-model="searchKeyword" 
          type="text" 
          class="search-input"
          placeholder="搜索查询记录..."
          @input="handleSearch"
        />
        <button v-if="searchKeyword" @click="clearSearch" class="clear-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="filter-section">
        <div class="filter-tabs">
          <div 
            v-for="tab in filterTabs" 
            :key="tab.value"
            class="filter-tab"
            :class="{ active: activeFilter === tab.value }"
            @click="changeFilter(tab.value)"
          >
            {{ tab.label }}
          </div>
        </div>
        
        <button @click="showDatePicker = true" class="date-filter-btn">
          <i class="fas fa-calendar-alt"></i>
          {{ dateRangeText }}
        </button>
      </div>
    </div>

    <!-- 查询记录列表 -->
    <div class="history-container">
      <!-- 加载状态 -->
      <div v-if="loading && historyList.length === 0" class="loading-state">
        <i class="fas fa-spinner fa-spin loading-icon"></i>
        <p class="loading-text">加载中...</p>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!loading && historyList.length === 0" class="empty-state">
        <i class="fas fa-history empty-icon"></i>
        <p class="empty-text">暂无查询记录</p>
        <p class="empty-desc">您还没有进行过任何查询</p>
      </div>

      <!-- 记录列表 -->
      <div v-else class="history-list">
        <div 
          v-for="record in filteredHistory" 
          :key="record.id"
          class="history-item"
          @click="viewRecordDetail(record)"
        >
          <!-- 记录头部 -->
          <div class="record-header">
            <div class="record-info">
              <h3 class="record-title">{{ record.queryType }}</h3>
              <span class="record-time">{{ formatDateTime(record.createdAt) }}</span>
            </div>
            <div class="record-status">
              <span class="status-badge" :class="getStatusClass(record.status)">
                {{ getStatusText(record.status) }}
              </span>
            </div>
          </div>

          <!-- 记录内容 -->
          <div class="record-content">
            <div class="record-params">
              <span class="params-label">查询参数:</span>
              <span class="params-value">{{ formatQueryParams(record.queryParams) }}</span>
            </div>
            <div class="record-result">
              <span class="result-label">结果数量:</span>
              <span class="result-value">{{ record.resultCount }} 条</span>
            </div>
          </div>

          <!-- 记录操作 -->
          <div class="record-actions">
            <button 
              v-if="record.status === 'completed' && record.resultCount > 0"
              @click.stop="downloadResult(record)"
              class="action-btn download-btn"
            >
              <i class="fas fa-download"></i>
              下载
            </button>
            <button 
              @click.stop="repeatQuery(record)"
              class="action-btn repeat-btn"
            >
              <i class="fas fa-redo"></i>
              重新查询
            </button>
            <button 
              @click.stop="deleteRecord(record)"
              class="action-btn delete-btn"
            >
              <i class="fas fa-trash"></i>
              删除
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
      <div v-if="loading && historyList.length > 0" class="bottom-loading">
        <i class="fas fa-spinner fa-spin"></i>
        <span>加载中...</span>
      </div>
    </div>

    <!-- 记录详情弹窗 -->
    <div v-if="showRecordDetail" class="modal-overlay" @click="closeRecordDetail">
      <div class="modal-content record-detail-modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">查询详情</h3>
          <button @click="closeRecordDetail" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body" v-if="selectedRecord">
          <div class="detail-section">
            <h4 class="section-title">基本信息</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="item-label">查询类型</span>
                <span class="item-value">{{ selectedRecord.queryType }}</span>
              </div>
              <div class="detail-item">
                <span class="item-label">查询时间</span>
                <span class="item-value">{{ formatDateTime(selectedRecord.createdAt) }}</span>
              </div>
              <div class="detail-item">
                <span class="item-label">查询状态</span>
                <span class="item-value" :class="getStatusClass(selectedRecord.status)">
                  {{ getStatusText(selectedRecord.status) }}
                </span>
              </div>
              <div class="detail-item">
                <span class="item-label">耗时</span>
                <span class="item-value">{{ selectedRecord.duration || '0' }}秒</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4 class="section-title">查询参数</h4>
            <div class="params-detail">
              <pre class="params-code">{{ formatParams(selectedRecord.queryParams) }}</pre>
            </div>
          </div>

          <div v-if="selectedRecord.status === 'completed'" class="detail-section">
            <h4 class="section-title">查询结果</h4>
            <div class="result-summary">
              <div class="summary-item">
                <span class="summary-label">结果数量</span>
                <span class="summary-value">{{ selectedRecord.resultCount }} 条</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">文件大小</span>
                <span class="summary-value">{{ selectedRecord.fileSize || '未知' }}</span>
              </div>
            </div>
            
            <div v-if="selectedRecord.resultCount > 0" class="result-actions">
              <button @click="downloadResult(selectedRecord)" class="download-result-btn">
                <i class="fas fa-download"></i>
                下载完整结果
              </button>
              <button @click="previewResult(selectedRecord)" class="preview-result-btn">
                <i class="fas fa-eye"></i>
                预览结果
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 日期选择弹窗 -->
    <div v-if="showDatePicker" class="modal-overlay" @click="closeDatePicker">
      <div class="modal-content date-picker-modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">选择日期范围</h3>
          <button @click="closeDatePicker" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="date-presets">
            <button 
              v-for="preset in datePresets" 
              :key="preset.value"
              @click="selectDatePreset(preset)"
              class="preset-btn"
              :class="{ active: selectedDatePreset === preset.value }"
            >
              {{ preset.label }}
            </button>
          </div>
          
          <div class="custom-date-range">
            <div class="date-input-group">
              <label class="date-label">开始日期</label>
              <input 
                v-model="customDateRange.start" 
                type="date" 
                class="date-input"
              />
            </div>
            <div class="date-input-group">
              <label class="date-label">结束日期</label>
              <input 
                v-model="customDateRange.end" 
                type="date" 
                class="date-input"
              />
            </div>
          </div>
          
          <div class="modal-actions">
            <button @click="closeDatePicker" class="btn-cancel">
              取消
            </button>
            <button @click="applyDateFilter" class="btn-confirm">
              确定
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { queryHistoryApi } from '@/api/query-history.ts'

const router = useRouter()

// 查询记录数据
const historyList = ref([])
const loading = ref(false)
const hasMore = ref(true)
const currentPage = ref(1)
const totalPages = ref(0)

// 搜索和筛选
const searchKeyword = ref('')
const activeFilter = ref('all')
const selectedDatePreset = ref('all')
const customDateRange = ref({ start: '', end: '' })

// 弹窗状态
const showRecordDetail = ref(false)
const showDatePicker = ref(false)
const selectedRecord = ref(null)

// 筛选标签
const filterTabs = [
  { label: '全部', value: 'all' },
  { label: '已完成', value: 'completed' },
  { label: '进行中', value: 'processing' },
  { label: '失败', value: 'failed' }
]

// 日期预设
const datePresets = [
  { label: '全部时间', value: 'all' },
  { label: '今天', value: 'today' },
  { label: '最近7天', value: 'week' },
  { label: '最近30天', value: 'month' },
  { label: '自定义', value: 'custom' }
]

// 格式化查询参数显示
const formatQueryParams = (params) => {
  if (!params || typeof params !== 'object') return '无参数'
  
  const entries = Object.entries(params)
  if (entries.length === 0) return '无参数'
  
  return entries.map(([key, value]) => `${key}: ${value}`).join(', ')
}

// 过滤后的历史记录
const filteredHistory = computed(() => {
  let filtered = historyList.value
  
  // 按状态筛选
  if (activeFilter.value !== 'all') {
    filtered = filtered.filter(record => record.status === activeFilter.value)
  }
  
  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(record => 
      record.queryType.toLowerCase().includes(keyword) ||
      record.queryParams.toLowerCase().includes(keyword)
    )
  }
  
  return filtered
})

// 日期范围文本
const dateRangeText = computed(() => {
  const preset = datePresets.find(p => p.value === selectedDatePreset.value)
  return preset ? preset.label : '自定义时间'
})

// 获取状态样式类
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

// 获取状态文本
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

// 格式化日期时间
const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 格式化查询参数（用于详情弹窗）
const formatParams = (params) => {
  try {
    if (typeof params === 'object' && params !== null) {
      return JSON.stringify(params, null, 2)
    }
    return JSON.stringify(JSON.parse(params), null, 2)
  } catch {
    return typeof params === 'string' ? params : JSON.stringify(params, null, 2)
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 刷新历史记录
const refreshHistory = async () => {
  currentPage.value = 1
  hasMore.value = true
  await fetchHistory(true)
}

// 处理搜索
const handleSearch = () => {
  // 实时搜索，这里可以添加防抖逻辑
}

// 清除搜索
const clearSearch = () => {
  searchKeyword.value = ''
}

// 切换筛选
const changeFilter = (filter) => {
  activeFilter.value = filter
}

// 获取历史记录
const fetchHistory = async (reset = false) => {
  if (loading.value) return
  
  try {
    loading.value = true
    
    const params = {
      status: activeFilter.value,
      keyword: searchKeyword.value,
      page: reset ? 1 : currentPage.value,
      limit: 10
    }
    
    const response = await queryHistoryApi.getUserQueryHistory(params)
    
    if (response.code === 200) {
      const { list, pagination } = response.data
      
      if (reset) {
        historyList.value = list
        currentPage.value = 1
      } else {
        historyList.value = [...historyList.value, ...list]
      }
      
      totalPages.value = pagination.totalPages
      hasMore.value = pagination.page < pagination.totalPages
    } else {
      ElMessage.error(response.message || '获取查询记录失败')
    }
  } catch (error) {
    console.error('获取查询记录失败:', error)
    ElMessage.error('获取查询记录失败')
  } finally {
    loading.value = false
  }
}

// 加载更多
const loadMore = () => {
  currentPage.value++
  fetchHistory()
}

// 查看记录详情
const viewRecordDetail = (record) => {
  selectedRecord.value = record
  showRecordDetail.value = true
}

// 关闭记录详情
const closeRecordDetail = () => {
  showRecordDetail.value = false
  selectedRecord.value = null
}

// 下载结果
const downloadResult = async (record) => {
  try {
    ElMessage.success('开始下载查询结果...')
    
    // 调用下载API
    const response = await fetch(`/api/query-history/${record.id}/download`, {
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
    
    // 从响应数据中获取文件名
    const filename = `查询结果_${record.orderNumber || record.id}_${new Date().toISOString().slice(0, 10)}.json`
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

// 预览结果
const previewResult = (record) => {
  ElMessage.info('结果预览功能开发中...')
}

// 重新查询
const repeatQuery = async (record) => {
  try {
    const response = await queryHistoryApi.repeatQuery(record.id)
    
    if (response.code === 200) {
      ElMessage.success('重新查询已提交，请稍后查看结果')
      // 刷新列表
      await refreshHistory()
    } else {
      ElMessage.error(response.message || '重新查询失败')
    }
  } catch (error) {
    console.error('重新查询失败:', error)
    ElMessage.error('重新查询失败')
  }
}

// 删除记录
const deleteRecord = async (record) => {
  try {
    const result = await ElMessageBox.confirm(
      '确定要删除这条查询记录吗？删除后无法恢复。',
      '删除记录',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    if (result === 'confirm') {
      const response = await queryHistoryApi.deleteQueryHistory(record.id)
      
      if (response.code === 200) {
        // 从列表中移除
        const index = historyList.value.findIndex(item => item.id === record.id)
        if (index > -1) {
          historyList.value.splice(index, 1)
        }
        ElMessage.success('记录已删除')
      } else {
        ElMessage.error(response.message || '删除失败')
      }
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除记录失败:', error)
      ElMessage.error('删除记录失败')
    }
  }
}

// 关闭日期选择器
const closeDatePicker = () => {
  showDatePicker.value = false
}

// 选择日期预设
const selectDatePreset = (preset) => {
  selectedDatePreset.value = preset.value
  
  if (preset.value !== 'custom') {
    customDateRange.value = { start: '', end: '' }
  }
}

// 应用日期筛选
const applyDateFilter = () => {
  // 这里实现日期筛选逻辑
  ElMessage.success('日期筛选已应用')
  closeDatePicker()
}

onMounted(() => {
  fetchHistory(true)
})
</script>

<style scoped>
.query-history {
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

/* 搜索和筛选区域 */
.search-section {
  background: #fff;
  padding: 16px 20px;
  margin-bottom: 16px;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.search-bar {
  position: relative;
  margin-bottom: 16px;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-size: 16px;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 48px;
  border: none;
  background: #f8f9fa;
  border-radius: 10px;
  font-size: 16px;
  color: #333;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  background: #e9ecef;
}

.clear-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: none;
  color: #666;
  cursor: pointer;
  padding: 4px;
}

.filter-section {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-tabs {
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: flex-start;
  flex: 1;
  min-width: 0;
}

.filter-tab {
  padding: 6px 12px;
  border-radius: 16px;
  background: #f8f9fa;
  color: #666;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
  min-width: fit-content;
  text-align: center;
  border: 1px solid transparent;
}

.filter-tab.active {
  background: #007bff;
  color: #fff;
  border-color: #007bff;
  font-weight: 500;
}

.filter-tab:hover {
  background: #e9ecef;
}

.filter-tab.active:hover {
  background: #0056b3;
}

.date-filter-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: none;
  background: #f8f9fa;
  color: #666;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  white-space: nowrap;
}

.date-filter-btn:hover {
  background: #e9ecef;
}

/* 历史记录容器 */
.history-container {
  padding: 0 20px;
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

/* 历史记录列表 */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.history-item {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.history-item:hover {
  transform: translateY(-2px);
  background: #f8f9fa;
}

/* 记录头部 */
.record-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

@media (max-width: 480px) {
  .record-header {
    flex-direction: column;
    gap: 8px;
  }
}

.record-info {
  flex: 1;
}

.record-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
  line-height: 1.4;
}

.record-time {
  font-size: 14px;
  color: #666;
}

.record-status {
  align-self: flex-start;
}

.status-badge {
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
  background: #e2e3e5;
  color: #383d41;
}

.status-failed {
  background: #f8d7da;
  color: #721c24;
}

/* 记录内容 */
.record-content {
  margin-bottom: 16px;
}

.record-params,
.record-result {
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
  gap: 2px;
}

.record-result:last-child {
  margin-bottom: 0;
}

@media (min-width: 480px) {
  .record-params,
  .record-result {
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }
  
  .params-label,
  .result-label {
    min-width: 80px;
    flex-shrink: 0;
  }
}

.params-label,
.result-label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.params-value,
.result-value {
  font-size: 14px;
  color: #333;
  word-break: break-all;
  line-height: 1.4;
}

/* 记录操作 */
.record-actions {
  display: flex;
  gap: 6px;
  justify-content: flex-start;
  flex-wrap: wrap;
}

@media (max-width: 480px) {
  .record-actions {
    gap: 4px;
  }
  
  .action-btn {
    flex: 1;
    min-width: 0;
    justify-content: center;
  }
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 32px;
  white-space: nowrap;
}

.download-btn {
  background: #28a745;
  color: #fff;
}

.download-btn:hover {
  background: #1e7e34;
}

.repeat-btn {
  background: #007bff;
  color: #fff;
}

.repeat-btn:hover {
  background: #0056b3;
}

.delete-btn {
  background: #dc3545;
  color: #fff;
}

.delete-btn:hover {
  background: #c82333;
}

/* 加载更多 */
.load-more {
  text-align: center;
  margin-top: 20px;
}

.load-more-btn {
  padding: 12px 24px;
  border: none;
  background: #f3f3f3;
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

/* 弹窗样式 */
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

.params-detail {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
}

.params-code {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #333;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

.result-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.summary-item {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
}

.summary-label {
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.summary-value {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.result-actions {
  display: flex;
  gap: 12px;
}

.download-result-btn,
.preview-result-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.download-result-btn {
  background: #28a745;
  color: #fff;
}

.download-result-btn:hover {
  background: #1e7e34;
}

.preview-result-btn {
  background: #007bff;
  color: #fff;
}

.preview-result-btn:hover {
  background: #0056b3;
}

/* 日期选择器 */
.date-picker-modal {
  max-width: 90vw;
  width: 100%;
}

.date-presets {
  display: flex;
  gap: 6px;
  margin-bottom: 20px;
  overflow-x: auto;
  padding-bottom: 2px;
}

@media (max-width: 480px) {
  .date-presets {
    gap: 4px;
  }
}

.preset-btn {
  padding: 8px 12px;
  border: none;
  background: #f8f9fa;
  color: #333;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  white-space: nowrap;
}

@media (max-width: 480px) {
  .preset-btn {
    padding: 6px 10px;
    font-size: 12px;
  }
}

.preset-btn:hover {
  background: #e9ecef;
}

.preset-btn.active {
  background: #007bff;
  color: #fff;
}

.custom-date-range {
  margin-bottom: 20px;
}

.date-input-group {
  margin-bottom: 12px;
}

.date-input-group:last-child {
  margin-bottom: 0;
}

.date-label {
  display: block;
  font-size: 14px;
  color: #333;
  margin-bottom: 6px;
}

.date-input {
  width: 100%;
  padding: 10px 12px;
  border: none;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  box-sizing: border-box;
}

.date-input:focus {
  outline: none;
  background: #e9ecef;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.btn-cancel,
.btn-confirm {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel {
  background: #f8f9fa;
  color: #333;
}

.btn-cancel:hover {
  background: #e9ecef;
}

.btn-confirm {
  background: #007bff;
  color: #fff;
}

.btn-confirm:hover {
  background: #0056b3;
}
</style>