<template>
  <div class="dashboard-container admin-fade-in" :class="{ 'refreshing': isRefreshing }">
    


    <!-- 数据统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon user-icon">👥</div>
        <div class="stat-info">
          <div class="stat-number">{{ statistics.totalUsers }}</div>
          <div class="stat-label">总用户数</div>
          <div class="stat-trend">
            <span class="trend-up">↗ +12%</span>
          </div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon order-icon">📋</div>
        <div class="stat-info">
          <div class="stat-number">{{ statistics.totalOrders }}</div>
          <div class="stat-label">总订单数</div>
          <div class="stat-trend">
            <span class="trend-up">↗ +8%</span>
          </div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon revenue-icon">💰</div>
        <div class="stat-info">
          <div class="stat-number">{{ formatAmount(statistics.totalRevenue) }}</div>
          <div class="stat-label">总收入(元)</div>
          <div class="stat-trend">
            <span class="trend-up">↗ +15%</span>
          </div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon today-icon">📅</div>
        <div class="stat-info">
          <div class="stat-number">{{ statistics.todayOrders }}</div>
          <div class="stat-label">今日订单</div>
          <div class="stat-trend">
            <span class="trend-up">↗ +5%</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 图表区域 -->
    <div class="charts-section">
      <div class="charts-grid">
        <el-card class="admin-card chart-card">
          <template #header>
            <div class="chart-header">
              <div class="chart-title-section">
                <div class="chart-icon">📈</div>
                <div class="chart-info">
                  <h3 class="chart-title">订单统计</h3>
                  <p class="chart-subtitle">订单趋势分析</p>
                </div>
              </div>
              <div class="chart-filters">
                <button 
                  class="filter-btn week-btn"
                  :class="{ active: orderChartType === 'week' }"
                  @click="orderChartType = 'week'"
                >
                  本周
                </button>
                <button 
                  class="filter-btn month-btn"
                  :class="{ active: orderChartType === 'month' }"
                  @click="orderChartType = 'month'"
                >
                  本月
                </button>
              </div>
            </div>
          </template>
          <div class="chart-container">
            <v-chart 
              class="chart" 
              :option="orderChartOption" 
              autoresize
            />
          </div>
        </el-card>
        
        <el-card class="admin-card chart-card">
          <template #header>
            <div class="chart-header">
              <div class="chart-title-section">
                <div class="chart-icon">💹</div>
                <div class="chart-info">
                  <h3 class="chart-title">收入统计</h3>
                  <p class="chart-subtitle">收入趋势分析</p>
                </div>
              </div>
              <div class="chart-filters">
                <button 
                  class="filter-btn week-btn"
                  :class="{ active: revenueChartType === 'week' }"
                  @click="revenueChartType = 'week'"
                >
                  本周
                </button>
                <button 
                  class="filter-btn month-btn"
                  :class="{ active: revenueChartType === 'month' }"
                  @click="revenueChartType = 'month'"
                >
                  本月
                </button>
              </div>
            </div>
          </template>
          <div class="chart-container">
            <v-chart 
              class="chart" 
              :option="revenueChartOption" 
              autoresize
            />
          </div>
        </el-card>
      </div>
    </div>
    
    <!-- 最近订单表格 -->
    <el-card class="admin-card">
      <template #header>
        <div class="chart-header">
          <div class="chart-title-section">
            <div class="chart-icon">🕒</div>
            <div class="chart-info">
              <h3 class="chart-title">最近订单</h3>
              <p class="chart-subtitle">最新的订单记录</p>
            </div>
          </div>
          <el-button type="primary" @click="viewAllOrders" class="admin-btn-secondary view-all-btn">
            <el-icon><View /></el-icon>
            查看全部
          </el-button>
        </div>
      </template>
      <el-table 
        :data="recentOrders" 
        class="admin-table" 
        v-loading="loading"
        element-loading-text="正在加载订单数据..."
        element-loading-background="rgba(255, 255, 255, 0.8)"
      >
        <el-table-column prop="orderNo" label="订单号" width="180" align="center">
          <template #default="scope">
            <span class="order-no">{{ scope.row.orderNo }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="queryItemName" label="查询项目" min-width="150">
          <template #default="scope">
            <span class="query-item">{{ scope.row.queryItemName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="120" align="center">
          <template #default="scope">
            <span class="amount-text">{{ formatAmount(scope.row.amount) }}元</span>
          </template>
        </el-table-column>
        <el-table-column prop="paymentMethod" label="支付方式" width="120" align="center">
          <template #default="scope">
            <el-tag class="admin-tag" effect="light">
              {{ scope.row.paymentMethod }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120" align="center">
          <template #default="scope">
            <el-tag 
              :type="getOrderStatusType(scope.row.status)"
              class="admin-tag"
              effect="light"
            >
              {{ getOrderStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" align="center">
          <template #default="scope">
            <span class="date-text">{{ formatDate(scope.row.createdAt) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { View } from '@element-plus/icons-vue';
import { formatDate, formatAmount } from '../../utils';
import { getDashboardStats, getOrderChartData, getRevenueChartData, getRecentOrders } from '../../api/statistics';
import type { DashboardStats, ChartData, RecentOrder } from '../../api/statistics';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import {
  CanvasRenderer
} from 'echarts/renderers';
import {
  LineChart,
  BarChart
} from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components';

use([
  CanvasRenderer,
  LineChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
]);

const router = useRouter();
const loading = ref(false);
const refreshing = ref(false);
const isRefreshing = ref(false);

// 统计数据
const statistics = reactive<DashboardStats>({
  totalUsers: 0,
  totalOrders: 0,
  totalRevenue: 0,
  todayOrders: 0,
  todayRevenue: 0
});

// 最近订单
const recentOrders = ref<RecentOrder[]>([]);

// 图表数据
const orderChartData = reactive<Record<string, ChartData>>({
  week: {
    dates: [],
    orders: []
  },
  month: {
    dates: [],
    orders: []
  }
});

const revenueChartData = reactive<Record<string, ChartData>>({
  week: {
    dates: [],
    revenue: []
  },
  month: {
    dates: [],
    revenue: []
  }
});

// 图表类型
const orderChartType = ref<'week' | 'month'>('week');
const revenueChartType = ref<'week' | 'month'>('week');

// 订单统计图表配置
const orderChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross'
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: orderChartData[orderChartType.value].dates
  },
  yAxis: {
    type: 'value',
    name: '订单数'
  },
  series: [{
    name: '订单数量',
    type: 'bar',
    data: orderChartData[orderChartType.value].orders,
    itemStyle: {
      color: '#409EFF'
    }
  }]
}));

// 收入统计图表配置
const revenueChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross'
    },
    formatter: function(params: any) {
      const value = params[0].value;
      return `${params[0].name}<br/>${params[0].seriesName}: ¥${value}`;
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: revenueChartData[revenueChartType.value].dates
  },
  yAxis: {
    type: 'value',
    name: '收入(元)',
    axisLabel: {
      formatter: '¥{value}'
    }
  },
  series: [{
    name: '收入',
    type: 'line',
    data: revenueChartData[revenueChartType.value].revenue,
    smooth: true,
    itemStyle: {
      color: '#67C23A'
    },
    areaStyle: {
      color: {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [{
          offset: 0, color: 'rgba(103, 194, 58, 0.3)'
        }, {
          offset: 1, color: 'rgba(103, 194, 58, 0.1)'
        }]
      }
    }
  }]
}));

// 获取统计数据
const fetchStatistics = async () => {
  try {
    console.log('开始获取统计数据...');
    loading.value = true;
    
    const response = await getDashboardStats();
    console.log('统计数据API响应:', response);
    
    if (response.code === 200) {
      // 后端已经返回元为单位的数据，无需转换
      const data = response.data;
      console.log('原始统计数据:', data);
      
      const processedData = {
        ...data,
        totalRevenue: Math.round(data.totalRevenue * 100) / 100, // 保留两位小数
        todayRevenue: Math.round(data.todayRevenue * 100) / 100  // 保留两位小数
      };
      
      console.log('处理后的统计数据:', processedData);
      Object.assign(statistics, processedData);
      console.log('统计数据已更新:', statistics);
    } else {
      console.error('获取统计数据失败:', response.message || '未知错误');
    }
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || '网络连接失败';
    console.error('获取统计数据失败:', errorMessage);
    console.error('完整错误对象:', error);
  } finally {
    loading.value = false;
  }
};

// 获取订单图表数据
const fetchOrderChartData = async (type: 'week' | 'month' = 'week') => {
  try {
    const response = await getOrderChartData(type);
    if (response.code === 200) {
      orderChartData[type] = response.data;
    } else {
      console.error('获取订单图表数据失败:', response.message || '未知错误');
    }
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || '网络连接失败';
    console.error('获取订单图表数据失败:', errorMessage);
  }
};

// 获取收入图表数据
const fetchRevenueChartData = async (type: 'week' | 'month' = 'week') => {
  try {
    const response = await getRevenueChartData(type);
    if (response.code === 200) {
      // 后端已经返回元为单位的数据，保留两位小数
      const data = response.data;
      revenueChartData[type] = {
        dates: data.dates || [],
        revenue: (data.revenue || []).map((amount: number) => Math.round(amount * 100) / 100)
      };
    } else {
      console.error('获取收入图表数据失败:', response.message || '未知错误');
    }
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || '网络连接失败';
    console.error('获取收入图表数据失败:', errorMessage);
  }
};

// 获取最近订单
const fetchRecentOrders = async () => {
  try {
    loading.value = true;
    
    const response = await getRecentOrders(10);
    if (response.code === 200) {
      recentOrders.value = response.data;
    } else {
      console.error('获取最近订单失败:', response.message || '未知错误');
    }
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || '网络连接失败';
    console.error('获取最近订单失败:', errorMessage);
  } finally {
    loading.value = false;
  }
};

// 获取订单状态类型
const getOrderStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': 'warning',
    'paid': 'primary',
    'processing': 'info',
    'completed': 'success',
    'cancelled': 'info',
    'failed': 'danger'
  };
  
  return statusMap[status] || 'info';
};

// 获取订单状态文本
const getOrderStatusText = (status: string) => {
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

// 查看所有订单
const viewAllOrders = () => {
  router.push('/admin/orders');
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
    console.log('开始刷新数据...');
    
    await Promise.all([
      fetchStatistics(),
      fetchRecentOrders(),
      fetchOrderChartData(orderChartType.value),
      fetchRevenueChartData(revenueChartType.value)
    ]);
    
    console.log('数据刷新完成');
    ElMessage.success('控制台数据刷新成功');
  } catch (error) {
    console.error('刷新数据失败:', error);
    ElMessage.error('控制台数据刷新失败');
  } finally {
    refreshing.value = false;
    // 延迟一点时间让动画效果更明显
    setTimeout(() => {
      isRefreshing.value = false;
    }, 300);
  }
};

// 监听图表类型变化
watch(orderChartType, (newType) => {
  fetchOrderChartData(newType);
});

watch(revenueChartType, (newType) => {
  fetchRevenueChartData(newType);
});

onMounted(() => {
  console.log('Dashboard组件已挂载，开始获取数据...');
  console.log('当前token:', localStorage.getItem('token'));
  console.log('当前用户信息:', localStorage.getItem('userInfo'));
  
  fetchStatistics();
  fetchRecentOrders();
  fetchOrderChartData('week');
  fetchOrderChartData('month');
  fetchRevenueChartData('week');
  fetchRevenueChartData('month');
  
  // 监听刷新事件
  window.addEventListener('refreshDashboard', refreshData);
});

onUnmounted(() => {
  // 清理事件监听器
  window.removeEventListener('refreshDashboard', refreshData);
});
</script>

<style scoped>
.dashboard-container {
  padding: 0;
  transition: all 0.3s ease;
}

/* 刷新动画效果 */
.dashboard-container.refreshing {
  opacity: 0.7;
  transform: scale(0.98);
  filter: blur(1px);
}

.dashboard-container.refreshing .stat-card,
.dashboard-container.refreshing .admin-card {
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

/* 页面头部样式 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px 20px;
  background: #c0faa0;
  border-radius: 12px;
  color: #2d5016;
  box-shadow: 0 4px 16px rgba(192, 250, 160, 0.3);
}

.main-title-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  font-size: 32px;
  background: rgba(45, 80, 22, 0.1);
  border-radius: 10px;
  padding: 8px;
  border: 1px solid rgba(45, 80, 22, 0.2);
}

.title-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #2d5016;
  margin: 0;
}

.page-subtitle {
  font-size: 14px;
  color: #4a7c23;
  margin: 0;
  font-weight: 400;
}

.page-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.refresh-btn {
  transition: all 0.3s ease;
}

.refresh-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.refresh-btn .el-icon {
  transition: transform 0.3s ease;
}

.refresh-btn:hover .el-icon {
  transform: rotate(180deg);
}

.view-all-btn {
  background: linear-gradient(135deg, var(--admin-primary) 0%, #5a67d8 100%);
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.view-all-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.4);
}

.view-all-btn .el-icon {
  margin-right: 4px;
}

/* 统计卡片网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--admin-white);
  border: 1px solid var(--admin-border-light);
  border-radius: 16px;
  padding: 0;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  min-height: 140px;
  display: flex;
  flex-direction: column;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.05),
    0 2px 6px rgba(0, 0, 0, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-card:hover {
  transform: translateY(-6px);
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.12),
    0 8px 24px rgba(0, 0, 0, 0.08),
    0 4px 12px rgba(0, 0, 0, 0.06),
    0 0 0 1px rgba(64, 158, 255, 0.1);
  border-color: var(--admin-primary);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(64, 158, 255, 0.02) 0%, 
    rgba(64, 158, 255, 0.05) 100%);
  pointer-events: none;
}

.stat-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--admin-primary), var(--admin-primary-light));
}

.stat-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.stat-info {
  flex: 1;
  padding: 24px;
  position: relative;
  z-index: 2;
}

.stat-value,
.stat-number {
  font-size: 36px;
  font-weight: 800;
  color: var(--admin-text-primary);
  line-height: 1;
  margin-bottom: 8px;
  letter-spacing: -0.02em;
}

.stat-label {
  font-size: 15px;
  color: var(--admin-text-secondary);
  font-weight: 600;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-trend {
  font-size: 13px;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
}

.stat-trend.positive {
  color: var(--admin-success);
}

.stat-trend.negative {
  color: var(--admin-danger);
}

.stat-trend .trend-up,
.stat-trend .trend-down {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  background: rgba(34, 197, 94, 0.1);
  color: var(--admin-success);
  font-size: 12px;
  font-weight: 700;
}

.stat-trend .trend-down {
  background: rgba(239, 68, 68, 0.1);
  color: var(--admin-danger);
}

.stat-icon {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
  background: linear-gradient(135deg, var(--admin-primary) 0%, var(--admin-primary-light) 100%);
  box-shadow: 
    0 8px 20px rgba(64, 158, 255, 0.3),
    0 4px 12px rgba(64, 158, 255, 0.2),
    0 2px 6px rgba(64, 158, 255, 0.15);
  z-index: 3;
  transition: all 0.3s ease;
}

.stat-card:hover .stat-icon {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 
    0 12px 28px rgba(64, 158, 255, 0.4),
    0 6px 16px rgba(64, 158, 255, 0.25),
    0 3px 8px rgba(64, 158, 255, 0.2);
}

/* 不同图标的特殊样式 */
.user-icon {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  box-shadow: 
    0 8px 20px rgba(59, 130, 246, 0.3),
    0 4px 12px rgba(59, 130, 246, 0.2),
    0 2px 6px rgba(59, 130, 246, 0.15);
}

.stat-card:hover .user-icon {
  box-shadow: 
    0 12px 28px rgba(59, 130, 246, 0.4),
    0 6px 16px rgba(59, 130, 246, 0.25),
    0 3px 8px rgba(59, 130, 246, 0.2);
}

.order-icon {
  background: linear-gradient(135deg, #10b981 0%, #047857 100%);
  box-shadow: 
    0 8px 20px rgba(16, 185, 129, 0.3),
    0 4px 12px rgba(16, 185, 129, 0.2),
    0 2px 6px rgba(16, 185, 129, 0.15);
}

.stat-card:hover .order-icon {
  box-shadow: 
    0 12px 28px rgba(16, 185, 129, 0.4),
    0 6px 16px rgba(16, 185, 129, 0.25),
    0 3px 8px rgba(16, 185, 129, 0.2);
}

.revenue-icon {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  box-shadow: 
    0 8px 20px rgba(245, 158, 11, 0.3),
    0 4px 12px rgba(245, 158, 11, 0.2),
    0 2px 6px rgba(245, 158, 11, 0.15);
}

.stat-card:hover .revenue-icon {
  box-shadow: 
    0 12px 28px rgba(245, 158, 11, 0.4),
    0 6px 16px rgba(245, 158, 11, 0.25),
    0 3px 8px rgba(245, 158, 11, 0.2);
}

.today-icon {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  box-shadow: 
    0 8px 20px rgba(139, 92, 246, 0.3),
    0 4px 12px rgba(139, 92, 246, 0.2),
    0 2px 6px rgba(139, 92, 246, 0.15);
}

.stat-card:hover .today-icon {
  box-shadow: 
    0 12px 28px rgba(139, 92, 246, 0.4),
    0 6px 16px rgba(139, 92, 246, 0.25),
    0 3px 8px rgba(139, 92, 246, 0.2);
}

/* 图表区域 */
.charts-section {
  margin-bottom: 24px;
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.chart-card {
  background: var(--admin-white);
  border: 1px solid var(--admin-border-light);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.chart-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: var(--admin-primary);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--admin-border-lighter);
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.chart-title-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chart-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background: linear-gradient(135deg, var(--admin-primary) 0%, var(--admin-primary-light) 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.chart-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.chart-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--admin-text-primary);
  margin: 0;
  letter-spacing: -0.02em;
}

.chart-subtitle {
  font-size: 13px;
  color: var(--admin-text-secondary);
  margin: 0;
  font-weight: 500;
}

.chart-filters {
  display: flex;
  gap: 8px;
  background: rgba(255, 255, 255, 0.25);
  padding: 8px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 
    0 4px 16px rgb(223 223 223 / 22%), 
    inset 0 1px 0 rgb(255 255 255 / 13%);
  position: relative;
  overflow: hidden;
}

.chart-filters::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.3) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.2) 100%
  );
  border-radius: 12px;
  pointer-events: none;
  z-index: 0;
}

.filter-btn {
  border-radius: 8px;
  font-size: 13px;
  padding: 8px 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  cursor: pointer;
  user-select: none;
  position: relative;
  outline: none;
  min-width: 60px;
  z-index: 1;
}

/* 本周按钮样式 - 蓝色主题 */
.week-btn {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  color: #1976d2;
  border-color: #90caf9;
}

.week-btn:hover {
  background: linear-gradient(135deg, #bbdefb 0%, #90caf9 100%);
  color: #0d47a1;
  border-color: #1976d2;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
}

.week-btn.active {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  color: white;
  border-color: #1976d2;
  box-shadow: 0 4px 16px rgba(25, 118, 210, 0.4);
}

/* 本月按钮样式 - 绿色主题 */
.month-btn {
  background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
  color: #388e3c;
  border-color: #81c784;
}

.month-btn:hover {
  background: linear-gradient(135deg, #c8e6c9 0%, #a5d6a7 100%);
  color: #1b5e20;
  border-color: #388e3c;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(56, 142, 60, 0.3);
}

.month-btn.active {
  background: linear-gradient(135deg, #388e3c 0%, #2e7d32 100%);
  color: white;
  border-color: #388e3c;
  box-shadow: 0 4px 16px rgba(56, 142, 60, 0.4);
}

.chart-container {
  height: 320px;
  width: 100%;
  padding: 20px 24px 24px;
}

.chart {
  height: 100%;
  width: 100%;
}

/* 表格卡片 */
.table-card {
  background: var(--admin-white);
  border: 1px solid var(--admin-border-light);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.table-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-color: var(--admin-border);
}

.table-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--admin-border-light);
  background: var(--admin-bg-light);
}

.table-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--admin-text-primary);
  margin: 0 0 4px 0;
}

.table-subtitle {
  font-size: 14px;
  color: var(--admin-text-secondary);
  margin: 0;
}

.table-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.table-content {
  padding: 0;
}

.table-content :deep(.el-table) {
  border: none;
}

.table-content :deep(.el-table__header) {
  background: var(--admin-bg-light);
}

.table-content :deep(.el-table th) {
  background: var(--admin-bg-light);
  border-bottom: 1px solid var(--admin-border-light);
  font-weight: 600;
  color: var(--admin-text-primary);
}

.table-content :deep(.el-table td) {
  border-bottom: 1px solid var(--admin-border-lighter);
}

.table-content :deep(.el-table__row:hover) {
  background: var(--admin-bg-light);
}

/* 表格内容样式 */
.order-no {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: var(--admin-primary);
  font-size: 13px;
}

.query-item {
  color: var(--admin-text-primary);
  font-weight: 500;
}

.amount-text {
  font-weight: 700;
  color: var(--admin-success);
  font-size: 14px;
}

.date-text {
  color: var(--admin-text-secondary);
  font-size: 13px;
  font-family: 'Courier New', monospace;
}

/* 表格标签样式 - 固定位置和大小 */
.admin-table .admin-tag {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  min-width: 80px !important;
  height: 24px !important;
  padding: 0 8px !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  border-radius: 6px !important;
  white-space: nowrap !important;
  text-align: center !important;
  line-height: 1 !important;
  box-sizing: border-box !important;
}

/* 确保表格单元格内容居中且不溢出 */
.admin-table :deep(.el-table__cell) {
  padding: 12px 8px !important;
  vertical-align: middle !important;
}

.admin-table :deep(.el-table td .cell) {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  min-height: 24px !important;
  line-height: 1.4 !important;
}

/* 响应式设计 */
@media (max-width: 1472px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    max-width: 100%;
  }
  
  .stat-card {
    min-height: 130px;
  }
  
  .stat-info {
    padding: 20px;
  }
  
  .stat-value,
  .stat-number {
    font-size: 32px;
  }
  
  .stat-icon {
    top: 16px;
    right: 16px;
    width: 48px;
    height: 48px;
    font-size: 24px;
  }
}

@media (max-width: 1200px) {
  .charts-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .chart-container {
    height: 300px;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 16px;
  }
  
  .main-title-container {
    gap: 10px;
  }
  
  .title-icon {
    font-size: 28px;
    padding: 6px;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .page-subtitle {
    font-size: 13px;
  }
  
  .page-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .stat-value {
    font-size: 28px;
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .chart-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 16px 20px;
  }
  
  .chart-title-section {
    width: 100%;
  }
  
  .chart-filters {
    width: 100%;
    justify-content: flex-end;
  }
  
  .chart-container {
    height: 280px;
    padding: 16px 20px 20px;
  }
  
  .table-header {
    padding: 16px 20px;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 20px;
  }
  
  .stat-content {
    flex-direction: column;
    gap: 16px;
  }
  
  .stat-icon {
    align-self: flex-end;
  }
  
  .chart-header {
    padding: 12px 16px;
  }
  
  .chart-title-section {
    gap: 8px;
  }
  
  .chart-icon {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }
  
  .chart-title {
    font-size: 16px;
  }
  
  .chart-subtitle {
    font-size: 12px;
  }
  
  .chart-container {
    height: 250px;
    padding: 12px 16px 16px;
  }
  
  .chart-filters :deep(.el-radio-button__inner) {
    padding: 4px 8px;
    font-size: 11px;
  }
}
</style>