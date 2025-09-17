<template>
  <div class="deletion-requests-container admin-fade-in" :class="{ 'refreshing': isRefreshing }">
    <!-- 页面标题和统计卡片 -->
    <div class="page-header">
      <div class="header-title">
        <h2>🗑️ 注销申请审核</h2>
        <p>管理用户账号注销申请</p>
      </div>
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon">⏳</div>
          <div class="stat-info">
            <div class="stat-number">{{ pendingRequests }}</div>
            <div class="stat-label">待审核</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-info">
            <div class="stat-number">{{ approvedRequests }}</div>
            <div class="stat-label">已通过</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">❌</div>
          <div class="stat-info">
            <div class="stat-number">{{ rejectedRequests }}</div>
            <div class="stat-label">已拒绝</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-info">
            <div class="stat-number">{{ totalRequests }}</div>
            <div class="stat-label">总申请数</div>
          </div>
        </div>
      </div>
    </div>

    <el-card class="admin-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span class="card-title">注销申请列表</span>
            <span class="card-subtitle">共 {{ total }} 条记录</span>
          </div>
          <div class="search-box">
            <el-input
              v-model="searchKeyword"
              placeholder="🔍 搜索用户名/手机号"
              clearable
              @clear="handleSearch"
              class="search-input"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-select
              v-model="searchStatus"
              placeholder="申请状态"
              clearable
              @change="handleSearch"
              class="status-select"
            >
              <el-option label="待审核" value="pending" />
              <el-option label="已通过" value="approved" />
              <el-option label="已拒绝" value="rejected" />
            </el-select>
            <el-button type="primary" @click="handleSearch" class="admin-btn-primary">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
          </div>
        </div>
      </template>
      
      <el-table 
        :data="requests" 
        class="admin-table" 
        v-loading="loading"
        element-loading-text="正在加载申请数据..."
        element-loading-background="rgba(255, 255, 255, 0.8)"
      >
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="username" label="用户信息" width="180">
          <template #default="scope">
            <div class="user-info">
              <el-avatar :size="32" class="user-avatar-small">
                {{ scope.row.username?.charAt(0).toUpperCase() }}
              </el-avatar>
              <div class="user-details">
                <span class="username">{{ scope.row.username }}</span>
                <span class="user-contact">{{ scope.row.phone || scope.row.email }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="注销原因" min-width="200">
          <template #default="scope">
            <el-tooltip :content="scope.row.reason" placement="top" :disabled="scope.row.reason?.length <= 50">
              <span class="reason-text">
                {{ scope.row.reason?.length > 50 ? scope.row.reason.substring(0, 50) + '...' : scope.row.reason }}
              </span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120" align="center">
          <template #default="scope">
            <el-tag 
              :type="getStatusType(scope.row.status)" 
              class="status-tag"
            >
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="requestTime" label="申请时间" width="180" align="center">
          <template #default="scope">
            <span class="time-text">{{ formatTime(scope.row.requestTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="processTime" label="处理时间" width="180" align="center">
          <template #default="scope">
            <span class="time-text">
              {{ scope.row.processTime ? formatTime(scope.row.processTime) : '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="processedByName" label="处理人" width="120" align="center">
          <template #default="scope">
            <span>{{ scope.row.processedByName || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button 
                v-if="scope.row.status === 'pending'"
                type="success" 
                size="small" 
                @click="handleApprove(scope.row)"
                class="admin-btn-success"
              >
                <el-icon><Check /></el-icon>
                通过
              </el-button>
              <el-button 
                v-if="scope.row.status === 'pending'"
                type="danger" 
                size="small" 
                @click="handleReject(scope.row)"
                class="admin-btn-danger"
              >
                <el-icon><Close /></el-icon>
                拒绝
              </el-button>
              <el-button 
                type="info" 
                size="small" 
                @click="handleViewDetail(scope.row)"
                class="admin-btn-info"
              >
                <el-icon><View /></el-icon>
                详情
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          class="admin-pagination"
        />
      </div>
    </el-card>

    <!-- 审核弹窗 -->
    <el-dialog
      v-model="showProcessDialog"
      :title="processType === 'approve' ? '通过申请' : '拒绝申请'"
      width="500px"
      class="admin-dialog"
    >
      <div class="process-form">
        <div class="user-summary">
          <h4>用户信息</h4>
          <p><strong>用户名：</strong>{{ currentRequest?.username }}</p>
          <p><strong>联系方式：</strong>{{ currentRequest?.phone || currentRequest?.email }}</p>
          <p><strong>申请时间：</strong>{{ formatTime(currentRequest?.requestTime) }}</p>
        </div>
        
        <div class="reason-summary">
          <h4>注销原因</h4>
          <p class="reason-content">{{ currentRequest?.reason }}</p>
        </div>

        <div class="admin-note">
          <h4>管理员备注</h4>
          <el-input
            v-model="adminNote"
            type="textarea"
            :rows="4"
            :placeholder="processType === 'approve' ? '请填写通过原因（可选）' : '请填写拒绝原因（必填）'"
            maxlength="500"
            show-word-limit
          />
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showProcessDialog = false">取消</el-button>
          <el-button 
            :type="processType === 'approve' ? 'success' : 'danger'"
            @click="confirmProcess"
            :loading="processing"
          >
            {{ processing ? '处理中...' : (processType === 'approve' ? '确认通过' : '确认拒绝') }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="showDetailDialog"
      title="申请详情"
      width="600px"
      class="admin-dialog"
    >
      <div class="detail-content" v-if="currentRequest">
        <div class="detail-section">
          <h4>用户信息</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <label>用户ID：</label>
              <span>{{ currentRequest.userId }}</span>
            </div>
            <div class="detail-item">
              <label>用户名：</label>
              <span>{{ currentRequest.username }}</span>
            </div>
            <div class="detail-item">
              <label>邮箱：</label>
              <span>{{ currentRequest.email || '-' }}</span>
            </div>
            <div class="detail-item">
              <label>手机号：</label>
              <span>{{ currentRequest.phone || '-' }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4>申请信息</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <label>申请ID：</label>
              <span>{{ currentRequest.id }}</span>
            </div>
            <div class="detail-item">
              <label>申请状态：</label>
              <el-tag :type="getStatusType(currentRequest.status)">
                {{ getStatusText(currentRequest.status) }}
              </el-tag>
            </div>
            <div class="detail-item">
              <label>申请时间：</label>
              <span>{{ formatTime(currentRequest.requestTime) }}</span>
            </div>
            <div class="detail-item" v-if="currentRequest.processTime">
              <label>处理时间：</label>
              <span>{{ formatTime(currentRequest.processTime) }}</span>
            </div>
            <div class="detail-item" v-if="currentRequest.processedByName">
              <label>处理人：</label>
              <span>{{ currentRequest.processedByName }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4>注销原因</h4>
          <div class="reason-detail">
            {{ currentRequest.reason }}
          </div>
        </div>

        <div class="detail-section" v-if="currentRequest.adminNote">
          <h4>管理员备注</h4>
          <div class="admin-note-detail">
            {{ currentRequest.adminNote }}
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showDetailDialog = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Edit, Delete, Check, Close, View } from '@element-plus/icons-vue'
import { adminApi } from '@/api/admin.ts'

// 响应式数据
const loading = ref(false)
const isRefreshing = ref(false)
const requests = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const searchKeyword = ref('')
const searchStatus = ref('')

// 弹窗相关
const showProcessDialog = ref(false)
const showDetailDialog = ref(false)
const currentRequest = ref(null)
const processType = ref('approve') // 'approve' | 'reject'
const adminNote = ref('')
const processing = ref(false)

// 统计数据
const pendingRequests = computed(() => {
  return requests.value.filter(req => req.status === 'pending').length
})

const approvedRequests = computed(() => {
  return requests.value.filter(req => req.status === 'approved').length
})

const rejectedRequests = computed(() => {
  return requests.value.filter(req => req.status === 'rejected').length
})

const totalRequests = computed(() => {
  return requests.value.length
})

// 获取注销申请列表
const fetchRequests = async () => {
  try {
    loading.value = true
    const response = await adminApi.getDeletionRequests({
      page: currentPage.value,
      limit: pageSize.value,
      keyword: searchKeyword.value,
      status: searchStatus.value
    })
    
    if (response.code === 200) {
      requests.value = response.data.requests
      total.value = response.data.total
    } else {
      ElMessage.error(response.message || '获取申请列表失败')
    }
  } catch (error) {
    console.error('获取申请列表失败:', error)
    ElMessage.error('获取申请列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchRequests()
}

// 分页
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  fetchRequests()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  fetchRequests()
}

// 状态相关
const getStatusType = (status) => {
  const statusMap = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status) => {
  const statusMap = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return statusMap[status] || '未知'
}

// 时间格式化
const formatTime = (time) => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

// 通过申请
const handleApprove = (request) => {
  currentRequest.value = request
  processType.value = 'approve'
  adminNote.value = ''
  showProcessDialog.value = true
}

// 拒绝申请
const handleReject = (request) => {
  currentRequest.value = request
  processType.value = 'reject'
  adminNote.value = ''
  showProcessDialog.value = true
}

// 查看详情
const handleViewDetail = (request) => {
  currentRequest.value = request
  showDetailDialog.value = true
}

// 确认处理
const confirmProcess = async () => {
  if (processType.value === 'reject' && !adminNote.value.trim()) {
    ElMessage.error('拒绝申请时必须填写拒绝原因')
    return
  }

  try {
    processing.value = true
    const response = await adminApi.processDeletionRequest({
      requestId: currentRequest.value.id,
      status: processType.value === 'approve' ? 'approved' : 'rejected',
      adminNote: adminNote.value.trim()
    })

    if (response.code === 200) {
      ElMessage.success(`申请${processType.value === 'approve' ? '通过' : '拒绝'}成功`)
      showProcessDialog.value = false
      fetchRequests()
    } else {
      ElMessage.error(response.message || '处理失败')
    }
  } catch (error) {
    console.error('处理申请失败:', error)
    ElMessage.error('处理申请失败')
  } finally {
    processing.value = false
  }
}

// 页面加载
onMounted(() => {
  fetchRequests()
})
</script>

<style scoped>
@import '@/assets/admin-theme.css';

.deletion-requests-container {
  padding: 24px;
  background: var(--admin-gray-50);
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
}

.header-title h2 {
  margin: 0 0 8px 0;
  color: var(--admin-primary);
  font-size: 28px;
  font-weight: 700;
}

.header-title p {
  margin: 0;
  color: var(--admin-gray-600);
  font-size: 16px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: var(--admin-shadow-sm);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--admin-shadow-md);
}

.stat-icon {
  font-size: 32px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--admin-gradient-primary);
  border-radius: 12px;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: var(--admin-primary);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: var(--admin-gray-600);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--admin-primary);
}

.card-subtitle {
  font-size: 14px;
  color: var(--admin-gray-500);
}

.search-box {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.search-input {
  width: 240px;
}

.status-select {
  width: 120px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.username {
  font-weight: 500;
  color: var(--admin-primary);
}

.user-contact {
  font-size: 12px;
  color: var(--admin-gray-500);
}

.reason-text {
  line-height: 1.4;
  color: var(--admin-gray-700);
}

.time-text {
  font-size: 14px;
  color: var(--admin-gray-600);
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.pagination-container {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

.process-form {
  padding: 16px 0;
}

.user-summary,
.reason-summary,
.admin-note {
  margin-bottom: 24px;
}

.user-summary h4,
.reason-summary h4,
.admin-note h4 {
  margin: 0 0 12px 0;
  color: var(--admin-primary);
  font-size: 16px;
  font-weight: 600;
}

.user-summary p {
  margin: 8px 0;
  color: var(--admin-gray-700);
}

.reason-content {
  background: var(--admin-gray-50);
  padding: 12px;
  border-radius: 8px;
  line-height: 1.5;
  color: var(--admin-gray-700);
  margin: 0;
}

.detail-content {
  padding: 16px 0;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h4 {
  margin: 0 0 16px 0;
  color: var(--admin-primary);
  font-size: 16px;
  font-weight: 600;
  border-bottom: 2px solid var(--admin-gray-200);
  padding-bottom: 8px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-item label {
  font-weight: 500;
  color: var(--admin-gray-600);
  min-width: 80px;
}

.reason-detail,
.admin-note-detail {
  background: var(--admin-gray-50);
  padding: 16px;
  border-radius: 8px;
  line-height: 1.6;
  color: var(--admin-gray-700);
  border-left: 4px solid var(--admin-secondary);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.status-tag {
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .deletion-requests-container {
    padding: 16px;
  }
  
  .stats-cards {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
  
  .search-box {
    width: 100%;
    justify-content: stretch;
  }
  
  .search-input {
    flex: 1;
    min-width: 200px;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>