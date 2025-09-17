<template>
  <div class="result-page">
    <div class="page-header">
      <button class="back-btn" @click="goBack">
        <i class="icon-arrow-left">←</i>
      </button>
      <h1 class="page-title">查询结果</h1>
    </div>
    
    <div class="result-content">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <div class="loading-text">正在查询中...</div>
      </div>
      
      <div v-else-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <div class="error-title">查询失败</div>
        <div class="error-message">{{ error }}</div>
        <button class="retry-btn" @click="loadResult">重试</button>
      </div>
      
      <div v-else-if="result" class="result-success">
        <div class="result-header">
          <div class="result-icon">✅</div>
          <div class="result-title">查询完成</div>
          <div class="result-subtitle">订单号: {{ orderNo }}</div>
        </div>
        
        <div class="result-data">
          <!-- 数据统计信息 -->
          <div class="stats-card">
            <div class="stats-item">
              <div class="stats-label">数据条数</div>
              <div class="stats-value">{{ getDataCount(result) }}</div>
            </div>
            <div class="stats-item">
              <div class="stats-label">查询时间</div>
              <div class="stats-value">{{ getQueryTime(result) }}</div>
            </div>
          </div>

          <!-- 数据列表展示 -->
          <div v-if="getDisplayData(result) && getDisplayData(result).length > 0" class="data-list-card">
            <h3 class="data-title">查询结果 ({{ getDisplayData(result).length }} 条)</h3>
            <div class="data-list">
              <div 
                v-for="(item, index) in getDisplayData(result)" 
                :key="index" 
                class="data-item-card"
              >
                <div class="item-header">
                  <span class="item-index">#{{ index + 1 }}</span>
                  <span v-if="item.time || item.timestamp" class="item-time">
                    {{ formatTime(item.time || item.timestamp) }}
                  </span>
                </div>
                <div class="item-content">
                  <div 
                    v-for="(value, key) in getDisplayFields(item)" 
                    :key="key" 
                    class="field-item"
                  >
                    <div class="field-label">{{ formatFieldName(String(key)) }}</div>
                    <div class="field-value">{{ formatFieldValue(value) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 原始数据展示（当无法解析为列表时） -->
          <div v-else class="data-card">
            <h3 class="data-title">查询结果</h3>
            <div class="data-content">
              <div v-if="typeof result.data === 'object'" class="data-object">
                <div 
                  v-for="(value, key) in result.data" 
                  :key="key" 
                  class="data-item"
                >
                  <div class="data-label">{{ formatLabel(String(key)) }}</div>
                  <div class="data-value">{{ formatValue(value) }}</div>
                </div>
              </div>
              <div v-else class="data-text">
                {{ result.data }}
              </div>
            </div>
          </div>
          
          <div v-if="result.metadata" class="metadata-card">
            <h3 class="data-title">查询信息</h3>
            <div class="metadata-content">
              <div class="metadata-item">
                <div class="metadata-label">查询时间</div>
                <div class="metadata-value">{{ formatTime(result.metadata.queryTime) }}</div>
              </div>
              <div class="metadata-item">
                <div class="metadata-label">数据来源</div>
                <div class="metadata-value">{{ result.metadata.source || '第三方API' }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="result-actions">
          <button class="action-btn primary" @click="downloadResult">
            <i class="icon-download">⬇️</i>
            下载结果
          </button>
          <button class="action-btn secondary" @click="shareResult">
            <i class="icon-share">📤</i>
            分享结果
          </button>
        </div>
      </div>
      
      <div v-else class="empty-state">
        <div class="empty-icon">📄</div>
        <div class="empty-text">暂无查询结果</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { queryApi } from '@/api/query.ts';
import { ElMessage } from 'element-plus';

interface QueryResult {
  success: boolean;
  data: any;
  result?: any; // 添加result属性以匹配后端API响应
  metadata?: {
    queryTime: string;
    source?: string;
    [key: string]: any;
  };
}

const route = useRoute();
const router = useRouter();

const orderNo = ref<string>('');
const result = ref<QueryResult | null>(null);
const loading = ref(false);
const error = ref<string>('');

const loadResult = async () => {
  try {
    loading.value = true;
    error.value = '';
    
    const orderNoParam = route.params.orderNo as string;
    if (!orderNoParam) {
      error.value = '订单号不存在';
      return;
    }
    
    orderNo.value = orderNoParam;
    
    console.log('正在获取查询结果，订单号:', orderNoParam);
    const response = await queryApi.getQueryResult(orderNoParam);
    console.log('API响应:', response);
    
    if (response.code === 200) {
      // 增强数据验证和容错处理
      if (response.data) {
        result.value = response.data;
        console.log('解析后的结果数据:', result.value);
        console.log('数据条数:', getDataCount(result.value));
        console.log('查询时间:', getQueryTime(result.value));
      } else {
        // 如果没有data字段，但响应成功，创建一个默认结构
        result.value = {
          success: true,
          data: null,
          metadata: {
            queryTime: new Date().toISOString()
          }
        };
        console.warn('API响应成功但无数据字段，使用默认结构');
      }
    } else {
      error.value = response.message || '查询失败';
    }
  } catch (err: any) {
    console.error('加载查询结果失败:', err);
    // 增强错误处理
    if (err.code === 'NETWORK_ERROR') {
      error.value = '网络连接失败，请检查网络后重试';
    } else if (err.code === 'TIMEOUT') {
      error.value = '请求超时，请稍后重试';
    } else if (err.response?.status === 404) {
      error.value = '查询结果不存在或已过期';
    } else if (err.response?.status === 500) {
      error.value = '服务器内部错误，请联系客服';
    } else {
      error.value = err.message || '未知错误，请稍后重试';
    }
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  router.back();
};

const formatLabel = (key: string): string => {
  const labelMap: Record<string, string> = {
    name: '企业名称',
    status: '企业状态',
    registeredCapital: '注册资本',
    legalRepresentative: '法定代表人',
    establishDate: '成立日期',
    address: '注册地址',
    businessScope: '经营范围',
    creditCode: '统一社会信用代码'
  };
  return labelMap[key] || key;
};

const formatValue = (value: any): string => {
  if (value === null || value === undefined) {
    return '暂无数据';
  }
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
};

const formatTime = (time: string): string => {
  if (!time) return '暂无时间';
  return new Date(time).toLocaleString('zh-CN');
};

// 通用数据处理函数
const getDataCount = (result: QueryResult | null): number => {
  if (!result) return 0;
  
  // 从API响应中获取实际的查询结果数据
  const actualData = result.result || result.data;
  
  // 尝试从不同的数据结构中获取数据条数
  if (actualData?.data?.result?.list && Array.isArray(actualData.data.result.list)) {
    return actualData.data.result.list.length;
  }
  if (actualData?.result?.list && Array.isArray(actualData.result.list)) {
    return actualData.result.list.length;
  }
  if (actualData?.data?.list && Array.isArray(actualData.data.list)) {
    return actualData.data.list.length;
  }
  if (actualData?.list && Array.isArray(actualData.list)) {
    return actualData.list.length;
  }
  if (Array.isArray(actualData?.data)) {
    return actualData.data.length;
  }
  if (Array.isArray(actualData)) {
    return actualData.length;
  }
  if (actualData && typeof actualData === 'object') {
    return Object.keys(actualData).length;
  }
  return actualData ? 1 : 0;
};

const getQueryTime = (result: QueryResult | null): string => {
  if (!result) return '暂无时间';
  
  // 从API响应中获取实际的查询结果数据
  const actualData = result.result || result.data;
  
  // 尝试从不同位置获取查询时间
  if (result.metadata?.queryTime) {
    return formatTime(result.metadata.queryTime);
  }
  if (actualData?.queryTime) {
    return formatTime(actualData.queryTime);
  }
  if (actualData?.data?.queryTime) {
    return formatTime(actualData.data.queryTime);
  }
  if (actualData?.data?.result?.queryTime) {
    return formatTime(actualData.data.result.queryTime);
  }
  if (actualData?.result?.queryTime) {
    return formatTime(actualData.result.queryTime);
  }
  return '暂无时间';
};

const getDisplayData = (result: QueryResult | null): any[] => {
  if (!result) return [];
  
  // 从API响应中获取实际的查询结果数据
  const actualData = result.result || result.data;
  
  // 尝试从不同的数据结构中获取列表数据
  if (actualData?.data?.result?.list && Array.isArray(actualData.data.result.list)) {
    return actualData.data.result.list;
  }
  if (actualData?.result?.list && Array.isArray(actualData.result.list)) {
    return actualData.result.list;
  }
  if (actualData?.data?.list && Array.isArray(actualData.data.list)) {
    return actualData.data.list;
  }
  if (actualData?.list && Array.isArray(actualData.list)) {
    return actualData.list;
  }
  if (Array.isArray(actualData?.data)) {
    return actualData.data;
  }
  if (Array.isArray(actualData)) {
    return actualData;
  }
  return [];
};

const getDisplayFields = (item: any): Record<string, any> => {
  if (!item || typeof item !== 'object') return {};
  
  // 过滤掉不需要显示的字段
  const excludeFields = ['id', 'timestamp', 'created_at', 'updated_at', 'time'];
  const fields: Record<string, any> = {};
  
  Object.keys(item).forEach(key => {
    if (!excludeFields.includes(key)) {
      fields[key] = item[key];
    }
  });
  
  // 只显示前6个字段，避免显示过多
  const keys = Object.keys(fields).slice(0, 6);
  const result: Record<string, any> = {};
  keys.forEach(key => {
    result[key] = fields[key];
  });
  
  return result;
};

const formatFieldName = (key: string): string => {
  const fieldMap: Record<string, string> = {
    name: '企业名称',
    status: '状态',
    registeredCapital: '注册资本',
    legalRepresentative: '法定代表人',
    establishDate: '成立日期',
    address: '地址',
    businessScope: '经营范围',
    creditCode: '信用代码',
    phone: '电话',
    email: '邮箱',
    website: '网站',
    industry: '行业',
    type: '类型',
    description: '描述',
    amount: '金额',
    quantity: '数量',
    price: '价格',
    location: '位置',
    time: '时间',
    timestamp: '时间戳'
  };
  return fieldMap[key] || key;
};

const formatFieldValue = (value: any): string => {
  if (value === null || value === undefined) {
    return '暂无数据';
  }
  if (typeof value === 'boolean') {
    return value ? '是' : '否';
  }
  if (typeof value === 'number') {
    return value.toLocaleString(); // 格式化数字
  }
  if (typeof value === 'string') {
    // 检查是否是日期格式
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date.toLocaleString('zh-CN');
        }
      } catch (e) {
        // 如果日期解析失败，返回原字符串
      }
    }
    return value;
  }
  if (Array.isArray(value)) {
    return value.length > 0 ? `[${value.length}项]` : '[]';
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2);
    } catch (e) {
      return '[对象]';
    }
  }
  return String(value);
};

const downloadResult = () => {
  if (!result.value) return;
  
  const dataStr = JSON.stringify(result.value, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `查询结果_${orderNo.value}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  ElMessage.success('结果已下载');
};

const shareResult = () => {
  if (navigator.share && result.value) {
    navigator.share({
      title: '查询结果',
      text: `订单 ${orderNo.value} 的查询结果`,
      url: window.location.href
    }).catch(console.error);
  } else {
    // 复制链接到剪贴板
    navigator.clipboard.writeText(window.location.href).then(() => {
      ElMessage.success('链接已复制到剪贴板');
    }).catch(() => {
      ElMessage.error('分享失败');
    });
  }
};

onMounted(() => {
  loadResult();
});
</script>

<style scoped>
.result-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

.back-btn {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 18px;
  cursor: pointer;
  margin-right: 15px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.back-btn:hover {
  background: #f1f5f9;
  color: #334155;
  transform: translateX(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.page-title {
  color: #1e293b;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.result-content {
  max-width: 800px;
  margin: 0 auto;
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 16px;
  opacity: 0.9;
}

.error-state {
  text-align: center;
  padding: 60px 20px;
  color: #ef4444;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 15px;
  color: #ef4444;
}

.error-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #1e293b;
}

.error-message {
  font-size: 14px;
  opacity: 0.8;
  margin-bottom: 20px;
  color: #64748b;
}

.retry-btn {
  background: #ffffff;
  color: #3b82f6;
  border: 1px solid #3b82f6;
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.retry-btn:hover {
  background: #3b82f6;
  color: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.2);
}

.result-success {
  background: #ffffff;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
}

.result-header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.result-icon {
  font-size: 48px;
  margin-bottom: 15px;
  color: #10b981;
}

.result-title {
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 5px;
}

.result-subtitle {
  font-size: 14px;
  color: #64748b;
}

.result-data {
  margin-bottom: 30px;
}

/* 统计信息卡片 */
.stats-card {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-around;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.stats-item {
  text-align: center;
  color: white;
}

.stats-label {
  font-size: 12px;
  opacity: 0.9;
  margin-bottom: 5px;
}

.stats-value {
  font-size: 20px;
  font-weight: 600;
}

/* 数据列表卡片 */
.data-list-card {
  background: #ffffff;
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.data-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.data-item-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 15px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.data-item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #3b82f6;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e2e8f0;
}

.item-index {
  background: #3b82f6;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.item-time {
  font-size: 12px;
  color: #64748b;
  background: #e2e8f0;
  padding: 4px 8px;
  border-radius: 8px;
}

.item-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
}

.field-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.field-value {
  font-size: 14px;
  color: #1e293b;
  word-break: break-all;
  background: white;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.data-card, .metadata-card {
  background: #f8fafc;
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #e2e8f0;
}

.data-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 15px;
}

.data-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid #e2e8f0;
}

.data-item:last-child {
  border-bottom: none;
}

.data-label {
  font-weight: 500;
  color: #475569;
  min-width: 120px;
  flex-shrink: 0;
}

.data-value {
  color: #1e293b;
  text-align: right;
  word-break: break-all;
}

.data-text {
  background: #ffffff;
  border-radius: 10px;
  padding: 15px;
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-all;
  border: 1px solid #e2e8f0;
}

.metadata-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.metadata-label {
  font-size: 14px;
  color: #64748b;
}

.metadata-value {
  font-size: 14px;
  color: #1e293b;
  font-weight: 500;
}

.result-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 25px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn.primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.action-btn.primary:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.action-btn.secondary {
  background: #ffffff;
  color: #64748b;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.action-btn.secondary:hover {
  background: #f8fafc;
  color: #475569;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 15px;
  color: #94a3b8;
}

.empty-text {
  font-size: 16px;
  opacity: 0.8;
}

@media (max-width: 768px) {
  .result-page {
    padding: 15px;
  }
  
  .result-success {
    padding: 20px;
  }
  
  .data-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .data-value {
    text-align: left;
  }
  
  .result-actions {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>