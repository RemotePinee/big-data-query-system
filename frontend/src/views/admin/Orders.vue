<template>
  <div class="orders-container admin-fade-in" :class="{ 'refreshing': isRefreshing }">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-title">
        <h2>📋 订单管理</h2>
        <p>管理和查看所有订单信息</p>
      </div>
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon">📋</div>
          <div>
            <div class="stat-number">{{ totalOrdersCount }}</div>
            <div class="stat-label">总订单数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div>
            <div class="stat-number">{{ totalRevenue }}</div>
            <div class="stat-label">总收入</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div>
            <div class="stat-number">{{ completedOrders }}</div>
            <div class="stat-label">已完成</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⏳</div>
          <div>
            <div class="stat-number">{{ pendingOrders }}</div>
            <div class="stat-label">待处理</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📅</div>
          <div>
            <div class="stat-number">{{ todayOrdersCount }}</div>
            <div class="stat-label">今日订单</div>
          </div>
        </div>
      </div>
    </div>

    <el-card class="admin-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <div class="card-title">📋 订单列表</div>
            <div class="card-subtitle">查看和管理所有订单</div>
          </div>
          <div class="search-box">
            <el-input
              v-model="searchKeyword"
              placeholder="🔍 搜索订单号/用户名"
              clearable
              @clear="handleSearch"
              class="search-input"
              :prefix-icon="Search"
            />
            <el-select
              v-model="searchStatus"
              placeholder="📊 订单状态"
              clearable
              @change="handleSearch"
              class="status-select"
            >
              <el-option label="⏳ 待支付" value="pending" />
              <el-option label="💳 已支付" value="paid" />
              <el-option label="✅ 已完成" value="completed" />
              <el-option label="❌ 已取消" value="cancelled" />
            </el-select>
            <el-button type="primary" @click="handleSearch" class="admin-btn-primary">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>

          </div>
        </div>
      </template>
      
      <el-table 
        :data="orders" 
        class="admin-table" 
        v-loading="loading"
        loading-text="正在加载订单数据..."
        element-loading-background="rgba(22, 19, 38, 0.8)"
      >
        <el-table-column prop="orderNo" label="📋 订单号" width="180" align="center">
          <template #default="scope">
            <div class="order-id">
              <span class="order-number">{{ scope.row.orderNo }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="👤 用户名" width="130" align="center">
          <template #default="scope">
            <div class="user-info">
              <el-avatar :size="32" class="user-avatar-small">
                {{ scope.row.username?.charAt(0)?.toUpperCase() || 'U' }}
              </el-avatar>
              <span class="username">{{ scope.row.username || '-' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="queryItemName" label="🔍 查询项目" min-width="180" align="center">
          <template #default="scope">
            <div class="query-item">
              <span class="item-name">{{ scope.row.queryItemName || '-' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="💰 金额" width="110" align="center">
          <template #default="scope">
            <div class="amount-display">
              <span class="amount-value">¥{{ formatAmount(scope.row.amount) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="paymentMethod" label="💳 支付方式" width="120" align="center">
          <template #default="scope">
            <el-tag 
              :type="getPaymentMethodTag(scope.row.paymentMethod)"
              class="payment-tag"
              effect="light"
            >
              {{ getPaymentMethodName(scope.row.paymentMethod) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="📊 状态" width="100" align="center">
          <template #default="scope">
            <el-tag 
              :type="getStatusTag(getDisplayStatus(scope.row))"
              class="status-tag"
              effect="light"
            >
              {{ getStatusName(getDisplayStatus(scope.row)) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="📅 创建时间" width="150" align="center">
          <template #default="scope">
            <div class="date-display">
              <span class="date-text">{{ formatDate(scope.row.createdAt) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="⚙️ 操作" width="300" align="center">
          <template #default="scope">
            <div class="action-buttons">
              <el-button 
                size="small" 
                @click="handleViewDetail(scope.row)"
                class="action-btn admin-btn-secondary"
              >
                <el-icon><View /></el-icon>
                详情
              </el-button>
              <el-button 
                size="small" 
                type="danger" 
                @click="handleDelete(scope.row)"
                class="action-btn"
              >
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          :page-size="pageSize"
          :current-page="currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          class="admin-pagination"
        />
      </div>
    </el-card>
    
    <!-- 订单详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      width="800px"
      custom-class="admin-dialog"
      :append-to-body="false"
      top="120px"
    >
      <template #header>
        <div class="dialog-header">
          <div class="dialog-title">
            <el-icon class="dialog-icon"><Document /></el-icon>
            订单详情
          </div>
        </div>
      </template>
      <div v-if="currentOrder" class="order-detail admin-form">
        <el-descriptions :column="2" border class="order-descriptions">
          <el-descriptions-item label="📋 订单号">
            <span class="order-number">{{ currentOrder.id }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="👤 用户名">
            <span class="username">{{ currentOrder.username }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="🔍 查询项目">
            <span class="item-name">{{ currentOrder.queryItemName }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="💰 金额">
            <span class="amount-value">¥{{ formatAmount(currentOrder.amount) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="💳 支付方式">
            <el-tag :type="getPaymentMethodTag(currentOrder.paymentMethod)" effect="light">
              {{ getPaymentMethodName(currentOrder.paymentMethod) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="📊 状态">
            <el-tag :type="getStatusTag(getDisplayStatus(currentOrder))" effect="light">
              {{ getStatusName(getDisplayStatus(currentOrder)) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="📅 创建时间">
            <span class="date-text">{{ formatDate(currentOrder.createdAt) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="💳 支付时间">
            <span class="date-text">{{ currentOrder.paidAt ? formatDate(currentOrder.paidAt) : '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="✅ 完成时间" :span="2">
            <span class="date-text">{{ currentOrder.completedAt ? formatDate(currentOrder.completedAt) : '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="🔧 查询参数" :span="2">
            <div class="query-params">
              <div v-for="(value, key) in currentOrder.queryParams" :key="key" class="query-param-item">
                <span class="param-name">{{ key }}:</span>
                <span class="param-value">{{ value }}</span>
              </div>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="📊 查询结果" :span="2">
            <div v-if="currentOrder.queryResult" class="query-result">
                <pre>{{ formatQueryResult(currentOrder.queryResult) }}</pre>
              </div>
              <div v-else class="no-result">
                <!-- 如果曾经有过查询结果但已过期 -->
                <div v-if="currentOrder.hasQueryResult && currentOrder.resultExpired" class="expired-result">
                  <div class="expired-info">
                    <el-icon><Warning /></el-icon>
                    <span>⏰ 查询结果已过期</span>
                  </div>
                  <p class="expired-desc">查询结果保存期限为7天，当前结果已过期。如需重新查询，请联系客服。</p>
                </div>
                <!-- 如果订单已支付且正在查询中 -->
                <div v-else-if="(currentOrder.status === 'paid' || currentOrder.status === 'processing') && 
                                currentOrder.queryStatus && 
                                currentOrder.queryStatus !== 'not_started' && 
                                currentOrder.queryStatus !== 'completed'" class="query-status">
                  <div class="query-loading">
                    <el-icon class="is-loading"><Loading /></el-icon>
                    <span>🔄 后台自动查询中...</span>
                  </div>
                  <div class="query-info">
                    <p v-if="currentOrder.queryCount">已查询 {{ currentOrder.queryCount }} 次</p>
                    <p v-if="currentOrder.queryStatus">查询状态：{{ getQueryStatusText(currentOrder.queryStatus) }}</p>
                    <el-button 
                      size="small" 
                      type="primary" 
                      @click="refreshOrderDetail"
                      :loading="refreshing"
                    >
                      <el-icon><Refresh /></el-icon>
                      刷新状态
                    </el-button>
                  </div>
                </div>
                <!-- 其他情况显示查询失败或暂无查询结果 -->
                <div v-else class="no-result-text">
                  <div v-if="(currentOrder.status === 'paid' || currentOrder.status === 'processing') && 
                            currentOrder.queryStatus === 'not_started'">
                    <p>💤 查询尚未开始</p>
                    <div class="query-info">
                      <p v-if="currentOrder.queryCount">已查询 {{ currentOrder.queryCount }} 次</p>
                      <p v-if="currentOrder.queryStatus">查询状态：{{ getQueryStatusText(currentOrder.queryStatus) }}</p>
                      <el-button 
                        size="small" 
                        type="primary" 
                        @click="refreshOrderDetail"
                        :loading="refreshing"
                      >
                        <el-icon><Refresh /></el-icon>
                        刷新状态
                      </el-button>
                    </div>
                  </div>
                  <div v-else-if="(currentOrder.status === 'paid' || currentOrder.status === 'processing') && 
                                  currentOrder.queryStatus === 'querying'">
                    <p>🔄 正在查询中...</p>
                    <div class="query-info">
                      <p v-if="currentOrder.queryCount">已查询 {{ currentOrder.queryCount }} 次</p>
                      <p v-if="currentOrder.queryStatus">查询状态：{{ getQueryStatusText(currentOrder.queryStatus) }}</p>
                      <el-button 
                        size="small" 
                        type="primary" 
                        @click="refreshOrderDetail"
                        :loading="refreshing"
                      >
                        <el-icon><Refresh /></el-icon>
                        刷新状态
                      </el-button>
                    </div>
                  </div>
                  <div v-else-if="currentOrder.status === 'paid' || currentOrder.status === 'processing'">
                    <p>❌ 查询失败</p>
                    <div class="query-info">
                      <p v-if="currentOrder.queryCount">已查询 {{ currentOrder.queryCount }} 次</p>
                      <p v-if="currentOrder.queryStatus">查询状态：{{ getQueryStatusText(currentOrder.queryStatus) }}</p>
                      <el-button 
                        size="small" 
                        type="primary" 
                        @click="refreshOrderDetail"
                        :loading="refreshing"
                      >
                        <el-icon><Refresh /></el-icon>
                        刷新状态
                      </el-button>
                    </div>
                  </div>
                  <div v-else>
                    ❌ 暂无查询结果
                  </div>
                </div>
              </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailDialogVisible = false" class="cancel-btn">
            <el-icon><Close /></el-icon>
            关闭
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  Search, 
  View, 
  Document, 
  Close, 
  Delete,
  Loading,
  Refresh,
  Warning
} from '@element-plus/icons-vue';
import { formatAmount } from '../../utils';
import request from '@/api/request';

// 订单列表
const orders = ref<any[]>([]);
const loading = ref(false);
const refreshing = ref(false);
const isRefreshing = ref(false);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

// 搜索相关
const searchKeyword = ref('');
const searchStatus = ref('');

// 当前选中的订单
const currentOrder = ref<any>(null);

// 对话框相关
const detailDialogVisible = ref(false);

// 统计数据
const stats = ref({
  totalOrders: 0,
  totalRevenue: 0,
  completedOrders: 0,
  pendingOrders: 0,
  todayOrders: 0
});

// 获取统计数据
const fetchStats = async () => {
  try {
    const response = await request.get('/admin/statistics/orders') as any;
    console.log('统计数据响应:', response);
    if (response.code === 200) {
      stats.value = response.data;
      console.log('设置统计数据:', stats.value);
    }
  } catch (error) {
    console.error('获取统计数据失败:', error);
  }
};

// 统计数据计算（作为备用）
const totalOrdersCount = computed(() => {
  return stats.value.totalOrders || orders.value.length;
});

const totalRevenue = computed(() => {
  if (stats.value.totalRevenue) {
    return `¥${formatAmount(stats.value.totalRevenue)}`;
  }
  const completed = orders.value.filter(order => order.status === 'completed');
  const total = completed.reduce((sum, order) => sum + (order.amount || 0), 0);
  return `¥${formatAmount(total)}`;
});

const completedOrders = computed(() => {
  return stats.value.completedOrders || orders.value.filter(order => order.status === 'completed').length;
});

const pendingOrders = computed(() => {
  return stats.value.pendingOrders || orders.value.filter(order => order.status === 'pending' || order.status === 'paid').length;
});

const todayOrdersCount = computed(() => {
  if (stats.value.todayOrders) {
    return stats.value.todayOrders;
  }
  // 作为备用，计算今日订单数
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return orders.value.filter(order => {
    if (!order.createdAt) return false;
    const orderDate = new Date(order.createdAt);
    orderDate.setHours(0, 0, 0, 0);
    return orderDate.getTime() === today.getTime();
  }).length;
});

// 日期格式化函数
const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

// 获取订单列表
const fetchOrders = async () => {
  loading.value = true;
  
  try {
    const params: any = {
      page: currentPage.value,
      pageSize: pageSize.value
    };
    
    if (searchKeyword.value) {
      params.keyword = searchKeyword.value;
    }
    
    if (searchStatus.value) {
      params.status = searchStatus.value;
    }
    
    const response = await request.get('/admin/orders', { params }) as any;
    
    if (response.code === 200) {
      orders.value = response.data.orders || response.data;
      // 使用后端返回的分页信息
      if (response.data.pagination) {
        total.value = response.data.pagination.total;
      } else {
        total.value = response.data.total || orders.value.length;
      }
    } else {
      ElMessage.error(response.message || '获取订单列表失败');
    }
  } catch (error) {
    console.error('获取订单列表失败:', error);
    ElMessage.error('获取订单列表失败');
  } finally {
    loading.value = false;
  }
};

// 获取支付方式名称
const getPaymentMethodName = (method: string) => {
  const methodMap: Record<string, string> = {
    'wechat': '微信支付',
    'alipay': '支付宝',
    'epay': '易支付',
    'other': '其他'
  };
  
  return methodMap[method] || method;
};

// 获取支付方式标签类型
const getPaymentMethodTag = (method: string) => {
  const tagMap: Record<string, string> = {
    'wechat': 'success',
    'alipay': 'primary',
    'epay': 'warning',
    'other': 'info'
  };
  
  return tagMap[method] || 'info';
};

// 获取显示状态（根据查询结果决定实际显示的状态）
const getDisplayStatus = (order: any) => {
  console.log('getDisplayStatus called with order:', {
    id: order.id,
    status: order.status,
    queryStatus: order.queryStatus,
    queryResult: order.queryResult,
    queryCount: order.queryCount
  });
  
  // 如果是已支付或处理中的订单
  if (order.status === 'paid' || order.status === 'processing') {
    // 如果有查询次数但没有查询结果，且查询状态不是未开始或查询中，则显示为失败
    if (order.queryCount > 0 && !order.queryResult && 
        order.queryStatus !== 'not_started' && order.queryStatus !== 'querying') {
      console.log('返回failed状态');
      return 'failed';
    }
    // 如果查询状态明确是失败相关的状态，显示为失败
    if (order.queryStatus === 'failed' || order.queryStatus === 'max_attempts_reached') {
      console.log('返回failed状态 - 明确失败');
      return 'failed';
    }
  }
  console.log('返回原状态:', order.status);
  return order.status;
};

// 获取订单状态名称
const getStatusName = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': '待支付',
    'paid': '已支付',
    'processing': '处理中',
    'completed': '已完成',
    'cancelled': '已取消',
    'failed': '查询失败'
  };
  
  return statusMap[status] || status;
};

// 获取订单状态标签类型
const getStatusTag = (status: string) => {
  const tagMap: Record<string, string> = {
    'pending': 'warning',
    'paid': 'primary',
    'processing': 'info',
    'completed': 'success',
    'cancelled': 'info',
    'failed': 'danger'
  };
  
  return tagMap[status] || 'info';
};

// 查看订单详情
const handleViewDetail = (row: any) => {
  currentOrder.value = row;
  detailDialogVisible.value = true;
  
  // 移除自动查询逻辑，现在查询由后端自动处理
  // 不再在前端触发查询轮询
};

// 处理删除订单
const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除订单 ${row.orderNo} 吗？此操作不可恢复！`,
    '删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      customClass: 'admin-message-box'
    }
  ).then(async () => {
    try {
      const response = await request.delete(`/admin/orders/${row.id}`);
      
      if (response.code === 200) {
        ElMessage.success('订单删除成功');
        // 重新加载订单列表
        await fetchOrders();
      } else {
        ElMessage.error(response.message || '删除订单失败');
      }
    } catch (error) {
      console.error('删除订单失败:', error);
      ElMessage.error('删除订单失败');
    }
  }).catch(() => {
    // 用户取消删除
  });
};

// 搜索订单
const handleSearch = () => {
  // 这里应该调用搜索API
  // 由于我们没有实现该API，这里只是简单过滤本地数据
  fetchOrders();
};

const refreshOrderDetail = async () => {
  if (!currentOrder.value || refreshing.value) return;
  
  try {
    refreshing.value = true;
    
    const response = await request.get(`/admin/orders/${currentOrder.value.id}`);
    
    if (response.code === 200 && response.data) {
      currentOrder.value = response.data;
      ElMessage.success('订单状态已刷新');
    }
  } catch (error) {
    console.error('刷新订单详情失败:', error);
    ElMessage.error('刷新失败');
  } finally {
    refreshing.value = false;
  }
};

// 获取查询状态文本
const getQueryStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'not_started': '未开始',
    'querying': '查询中',
    'completed': '已完成',
    'failed': '查询失败',
    'max_attempts_reached': '已达最大次数'
  };
  return statusMap[status] || status;
};

// 格式化查询结果，避免重复显示
const formatQueryResult = (queryResult: any) => {
  if (!queryResult) return '暂无查询结果';
  
  // 如果有data字段，优先使用data字段的内容
  if (queryResult.data) {
    return JSON.stringify(queryResult.data, null, 2);
  }
  
  // 如果没有data字段但有apiResponse，使用apiResponse
  if (queryResult.apiResponse) {
    return JSON.stringify(queryResult.apiResponse, null, 2);
  }
  
  // 否则直接返回整个结果
  return JSON.stringify(queryResult, null, 2);
};

// 分页相关
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  fetchOrders();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  fetchOrders();
};

// 刷新数据
const refreshData = async () => {
  // 防止重复刷新
  if (refreshing.value || isRefreshing.value) {
    return;
  }
  
  try {
    refreshing.value = true;
    isRefreshing.value = true;
    console.log('开始刷新订单数据...');
    
    await Promise.all([
      fetchOrders(),
      fetchStats()
    ]);
    
    console.log('订单数据刷新完成');
    ElMessage.success('订单数据刷新成功');
  } catch (error) {
    console.error('刷新订单数据失败:', error);
    ElMessage.error('订单数据刷新失败');
  } finally {
    refreshing.value = false;
    // 延迟一点时间让动画效果更明显
    setTimeout(() => {
      isRefreshing.value = false;
    }, 300);
  }
};

onMounted(() => {
  fetchStats();
  fetchOrders();
  
  // 监听刷新事件
  window.addEventListener('refreshOrders', refreshData);
});

onUnmounted(() => {
  // 清理事件监听器
  window.removeEventListener('refreshOrders', refreshData);
});
</script>

<style scoped>
.orders-container {
  padding: 0;
  min-height: 100%;
  transition: all 0.3s ease;
}

/* 刷新动画效果 */
.orders-container.refreshing {
  opacity: 0.7;
  transform: scale(0.98);
  filter: blur(1px);
}

.orders-container.refreshing .stat-card,
.orders-container.refreshing .admin-card {
  animation: refreshPulse 1s ease-in-out infinite;
}

@keyframes refreshPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.02);
    opacity: 0.9;
  }
}

/* 页面头部 */
.page-header {
  margin-bottom: var(--admin-space-xl);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--admin-space-xl);
}

.header-title h2 {
  margin: 0 0 var(--admin-space-sm) 0;
  font-size: 32px;
  font-weight: 700;
  background: var(--admin-gradient-accent);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
}

.header-title p {
  margin: 0;
  color: var(--admin-gray-600);
  font-size: 16px;
}

/* 统计卡片 */
.stats-cards {
  display: flex;
  gap: var(--admin-space-md);
}

.stat-card {
  background: var(--admin-glass-bg);
  backdrop-filter: blur(var(--admin-glass-blur));
  -webkit-backdrop-filter: blur(var(--admin-glass-blur));
  border: 1px solid var(--admin-glass-border);
  border-radius: var(--admin-radius-lg);
  padding: var(--admin-space-lg);
  display: flex;
  align-items: center;
  gap: var(--admin-space-md);
  min-width: 140px;
  box-shadow: var(--admin-shadow-md);
  transition: all var(--admin-transition-normal);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--admin-gradient-secondary);
  z-index: 1;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--admin-shadow-lg);
}

.stat-icon {
  font-size: 24px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--admin-gradient-secondary);
  border-radius: var(--admin-radius-lg);
  box-shadow: var(--admin-shadow-sm);
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: var(--admin-primary);
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: var(--admin-gray-600);
  margin-top: 4px;
}

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--admin-space-md);
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--admin-primary);
}

.card-subtitle {
  font-size: 14px;
  color: var(--admin-gray-500);
}

/* 搜索框 */
.search-box {
  display: flex;
  align-items: center;
  gap: var(--admin-space-md);
  flex-wrap: wrap;
}

.search-input {
  width: 240px;
}

.status-select {
  width: 160px;
}

/* 表格样式 */
.order-id {
  display: flex;
  align-items: center;
  justify-content: center;
}

.order-number {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: var(--admin-primary);
  font-weight: 600;
  background: var(--admin-glass-bg);
  padding: 4px 8px;
  border-radius: var(--admin-radius-sm);
  border: 1px solid var(--admin-glass-border);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--admin-space-sm);
  justify-content: center;
}

.user-avatar-small {
  background: var(--admin-gradient-secondary);
  color: var(--admin-primary);
  font-weight: 600;
  font-size: 14px;
}

.username {
  font-weight: 500;
  color: var(--admin-primary);
}

.query-item {
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-name {
  color: var(--admin-gray-700);
  font-weight: 500;
}

.amount-display {
  display: flex;
  align-items: center;
  justify-content: center;
}

.amount-value {
  font-weight: 700;
  color: var(--admin-success);
  font-size: 16px;
}

.payment-tag, .status-tag {
  font-weight: 500;
}

.date-display {
  display: flex;
  align-items: center;
  justify-content: center;
}

.date-text {
  color: var(--admin-gray-500);
  font-size: 13px;
  font-family: 'Courier New', monospace;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: var(--admin-space-xs);
  justify-content: center;
}

.action-btn {
  padding: 4px 8px !important;
  font-size: 12px !important;
  border-radius: var(--admin-radius-sm) !important;
  transition: all var(--admin-transition-fast) !important;
}

.action-btn:hover {
  transform: translateY(-1px) !important;
}

/* 分页 */
.pagination-container {
  margin-top: var(--admin-space-xl);
  display: flex;
  justify-content: center;
}

/* 订单详情 */
.order-detail {
  padding: var(--admin-space-lg);
}

.order-descriptions {
  border-radius: var(--admin-radius-md);
  overflow: hidden;
}

.query-params {
  background: var(--admin-glass-bg);
  border-radius: var(--admin-radius-md);
  padding: var(--admin-space-md);
  border: 1px solid var(--admin-glass-border);
}

.query-param-item {
  margin-bottom: var(--admin-space-sm);
  display: flex;
  align-items: center;
  gap: var(--admin-space-sm);
}

.param-name {
  font-weight: 600;
  color: var(--admin-primary);
  min-width: 80px;
}

.param-value {
  color: var(--admin-gray-700);
  background: var(--admin-gray-100);
  padding: 2px 8px;
  border-radius: var(--admin-radius-sm);
  font-family: 'Courier New', monospace;
  font-size: 13px;
}

.query-result {
  max-height: 300px;
  overflow-y: auto;
  background: var(--admin-gray-50);
  padding: var(--admin-space-md);
  border-radius: var(--admin-radius-md);
  border: 1px solid var(--admin-gray-200);
}

.query-result pre {
  margin: 0;
  white-space: pre-wrap;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: var(--admin-gray-700);
  line-height: 1.5;
}

.no-result {
  color: var(--admin-gray-500);
  font-style: italic;
  text-align: center;
  padding: var(--admin-space-lg);
  background: var(--admin-gray-50);
  border-radius: var(--admin-radius-md);
  border: 1px dashed var(--admin-gray-300);
}

/* 对话框样式 */
.dialog-header {
  display: flex;
  align-items: center;
  gap: var(--admin-space-md);
}

.dialog-title {
  display: flex;
  align-items: center;
  gap: var(--admin-space-sm);
  font-size: 18px;
  font-weight: 600;
  color: var(--admin-primary);
}

.dialog-icon {
  font-size: 20px;
  color: var(--admin-secondary);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--admin-space-md);
  padding-top: var(--admin-space-lg);
  border-top: 1px solid var(--admin-gray-200);
}

.cancel-btn {
  background: var(--admin-gray-100) !important;
  color: var(--admin-gray-600) !important;
  border: 1px solid var(--admin-gray-300) !important;
  border-radius: var(--admin-radius-md) !important;
  transition: all var(--admin-transition-normal) !important;
}

.cancel-btn:hover {
  background: var(--admin-gray-200) !important;
  color: var(--admin-gray-700) !important;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .stats-cards {
    justify-content: space-between;
  }
  
  .stat-card {
    flex: 1;
    min-width: 120px;
  }
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    justify-content: stretch;
  }
  
  .search-input,
  .status-select {
    flex: 1;
    width: auto;
  }
  
  .stats-cards {
    flex-direction: column;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }
  
  .amount-input-group {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 480px) {
  .header-title h2 {
    font-size: 24px;
  }
  
  .stat-card {
    padding: var(--admin-space-md);
  }
  
  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }
  
  .stat-number {
    font-size: 20px;
  }
}

/* 查询状态样式 */
.query-status {
  display: flex;
  flex-direction: column;
  gap: var(--admin-space-md);
  padding: var(--admin-space-md);
  background: var(--admin-glass-bg);
  border: 1px solid var(--admin-glass-border);
  border-radius: var(--admin-radius-md);
}

.query-loading {
  display: flex;
  align-items: center;
  gap: var(--admin-space-sm);
  color: var(--admin-primary);
  font-weight: 500;
}

.query-loading .el-icon {
  font-size: 16px;
}

.query-info {
  display: flex;
  flex-direction: column;
  gap: var(--admin-space-sm);
}

.query-info p {
  margin: 0;
  font-size: 14px;
  color: var(--admin-gray-600);
}

.no-result-text {
  color: var(--admin-gray-500);
  font-style: italic;
}

/* 过期结果样式 */
.expired-result {
  display: flex;
  flex-direction: column;
  gap: var(--admin-space-md);
  padding: var(--admin-space-md);
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
  border: 1px solid #ffc107;
  border-radius: var(--admin-radius-md);
}

.expired-info {
  display: flex;
  align-items: center;
  gap: var(--admin-space-sm);
  color: #856404;
  font-weight: 500;
}

.expired-info .el-icon {
  font-size: 16px;
  color: #ffc107;
}

.expired-desc {
  margin: 0;
  font-size: 14px;
  color: #856404;
  line-height: 1.5;
}
</style>