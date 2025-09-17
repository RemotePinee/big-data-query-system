<template>
  <div class="payment-config-container admin-fade-in" :class="{ 'refreshing': isRefreshing }">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-title">
        <h2>💳 支付配置管理</h2>
        <p>管理系统支付方式配置和参数</p>
      </div>
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon">💳</div>
          <div class="stat-info">
            <div class="stat-number">{{ paymentConfigs.length }}</div>
            <div class="stat-label">总配置数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-info">
            <div class="stat-number">{{ activeConfigs }}</div>
            <div class="stat-label">已启用</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🔧</div>
          <div class="stat-info">
            <div class="stat-number">{{ wechatConfigs }}</div>
            <div class="stat-label">微信支付</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-info">
            <div class="stat-number">{{ alipayConfigs }}</div>
            <div class="stat-label">支付宝</div>
          </div>
        </div>
      </div>
    </div>

    <el-card class="admin-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span class="card-title">💳 配置列表</span>
            <span class="card-subtitle">共 {{ paymentConfigs.length }} 个配置</span>
          </div>
          <div class="search-box">
            <el-select
              v-model="searchType"
              placeholder="💳 支付类型"
              clearable
              @change="handleSearch"
              class="type-select"
            >
              <el-option label="微信支付" value="wechat" />
              <el-option label="支付宝" value="alipay" />
              <el-option label="易支付" value="epay" />
            </el-select>
            <el-select
              v-model="searchStatus"
              placeholder="📊 状态"
              clearable
              @change="handleSearch"
              class="status-select"
            >
              <el-option label="✅ 已启用" :value="true" />
              <el-option label="❌ 已禁用" :value="false" />
            </el-select>
            <el-button type="success" @click="showCreateDialog" class="admin-btn-secondary">
              <el-icon><Plus /></el-icon>
              添加配置
            </el-button>
          </div>
        </div>
      </template>
      
      <el-table 
        :data="filteredConfigs" 
        class="admin-table" 
        v-loading="loading"
        element-loading-text="正在加载配置数据..."
        element-loading-background="rgba(255, 255, 255, 0.8)"
      >
        <el-table-column prop="name" label="💳 配置名称" width="180">
             <template #default="scope">
               <div class="config-name">
                 <el-icon class="payment-icon" :class="getTypeIconClass(scope.row.type)">
                   <component :is="getTypeIcon(scope.row.type)" />
                 </el-icon>
                 <span class="config-title">{{ scope.row.name }}</span>
               </div>
             </template>
           </el-table-column>
           
           <el-table-column prop="type" label="🏷️ 支付类型" width="110" align="center">
             <template #default="scope">
               <el-tag 
                 :type="getTypeColor(scope.row.type)" 
                 class="admin-tag"
                 effect="light"
               >
                 {{ getTypeName(scope.row.type) }}
               </el-tag>
             </template>
           </el-table-column>
           
           <el-table-column prop="code" label="🔑 配置代码" width="130" show-overflow-tooltip>
             <template #default="scope">
               <code class="config-code">{{ scope.row.code }}</code>
             </template>
           </el-table-column>
           
           <el-table-column prop="merchantId" label="🏪 商户信息" min-width="200" show-overflow-tooltip>
             <template #default="scope">
               <div class="merchant-info">
                 <div v-if="scope.row.appId" class="info-item">
                   <span class="label">应用ID:</span>
                   <span class="value">{{ scope.row.appId }}</span>
                 </div>
                 <div v-if="scope.row.merchantId" class="info-item">
                   <span class="label">商户ID:</span>
                   <span class="value">{{ scope.row.merchantId }}</span>
                 </div>
               </div>
             </template>
           </el-table-column>
           
           <el-table-column prop="isActive" label="📊 状态" width="100" align="center">
             <template #default="scope">
               <el-tag 
                 :type="scope.row.isActive ? 'success' : 'warning'"
                 class="admin-tag"
                 effect="light"
               >
                 {{ scope.row.isActive ? '✅ 已启用' : '❌ 已禁用' }}
               </el-tag>
             </template>
           </el-table-column>
           
           <el-table-column prop="createdAt" label="📅 创建时间" width="150" align="center">
             <template #default="scope">
               <span class="date-text">{{ formatDate(scope.row.createdAt) }}</span>
             </template>
           </el-table-column>
           
           <el-table-column label="⚙️ 操作" width="320" align="center">
          <template #default="scope">
            <div class="action-buttons">
              <el-button 
                size="small" 
                type="primary"
                @click="editConfig(scope.row)"
                class="action-btn"
              >
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button 
                size="small" 
                :type="scope.row.isActive ? 'warning' : 'success'"
                @click="toggleActive(scope.row)"
                :loading="testingConfigId === scope.row.id"
                class="action-btn"
              >
                <el-icon v-if="scope.row.isActive"><Lock /></el-icon>
                <el-icon v-else><Unlock /></el-icon>
                {{ scope.row.isActive ? '禁用' : '启用' }}
              </el-button>
              <el-button 
                size="small" 
                type="info"
                @click="testConfig(scope.row)"
                :loading="testingConfigId === scope.row.id"
                :disabled="testingConfigId !== null"
                class="action-btn"
              >
                <el-icon><Setting /></el-icon>
                测试
              </el-button>
              <el-button 
                size="small" 
                type="danger" 
                @click="deleteConfig(scope.row)"
                class="action-btn"
              >
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container" v-if="paymentConfigs.length > 0">
        <el-pagination
          background
          layout="total, prev, pager, next"
          :total="paymentConfigs.length"
          :page-size="10"
          :current-page="1"
          class="admin-pagination"
        />
      </div>
    </el-card>

    <!-- 创建/编辑对话框 -->
    <el-dialog 
      :title="isEditing ? '编辑支付配置' : '添加支付配置'"
      v-model="dialogVisible"
      width="600px"
      custom-class="admin-edit-dialog"
      :append-to-body="false"
      top="120px"
      @close="resetForm"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="配置名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入配置名称" />
        </el-form-item>

        <el-form-item label="配置代码" prop="code">
          <el-input v-model="form.code" placeholder="请输入配置代码" />
        </el-form-item>

        <el-form-item label="支付类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择支付类型" @change="onTypeChange">
            <el-option label="微信支付" value="wechat" />
            <el-option label="支付宝" value="alipay" />
            <el-option label="易支付" value="epay" />
          </el-select>
        </el-form-item>

        <!-- 微信支付配置 -->
        <template v-if="form.type === 'wechat'">
          <!-- JSAPI使用提示 -->
          <el-form-item>
            <template #label></template>
            <el-alert
              type="warning"
              :closable="false"
              show-icon
              class="wechat-tip"
            >
              <template #default>
                <span class="tip-text">此配置为微信JSAPI支付，<strong class="highlight-text">必须在微信内才可以拉起微信支付</strong></span>
              </template>
            </el-alert>
          </el-form-item>
          
          <el-form-item label="APPID" prop="appId" required>
            <el-input v-model="form.appId" placeholder="请输入APPID" />
          </el-form-item>
          <el-form-item label="AppSecret" prop="appSecret" required>
            <el-input v-model="form.appSecret" type="password" placeholder="请输入AppSecret" show-password />
          </el-form-item>
          <el-form-item label="商户ID" prop="merchantId">
            <el-input v-model="form.merchantId" placeholder="请输入微信商户ID" />
          </el-form-item>
          <el-form-item label="API密钥" prop="apiKey">
            <el-input v-model="form.apiKey" type="password" placeholder="请输入API密钥" show-password />
          </el-form-item>
        </template>

        <!-- 支付宝配置 -->
        <template v-if="form.type === 'alipay'">
          <el-form-item label="应用ID" prop="appId">
            <el-input v-model="form.appId" placeholder="请输入支付宝应用ID" />
          </el-form-item>
          <el-form-item label="私钥" prop="apiKey">
            <el-input v-model="form.apiKey" type="textarea" :rows="4" placeholder="请输入应用私钥" />
          </el-form-item>
          <el-form-item label="公钥" prop="appSecret">
            <el-input v-model="form.appSecret" type="textarea" :rows="4" placeholder="请输入支付宝公钥" />
          </el-form-item>
        </template>

        <!-- 易支付配置 -->
        <template v-if="form.type === 'epay'">
          <el-form-item label="商户ID" prop="merchantId">
            <el-input v-model="form.merchantId" placeholder="请输入易支付商户ID" />
          </el-form-item>
          <el-form-item label="商户密钥" prop="apiKey">
            <el-input v-model="form.apiKey" type="password" placeholder="请输入商户密钥" show-password />
          </el-form-item>
          <el-form-item label="网关地址" prop="apiUrl">
            <el-input v-model="form.apiUrl" placeholder="请输入易支付网关地址" />
          </el-form-item>
          <el-form-item label="PC端支付模式" prop="paymentMode">
            <el-radio-group v-model="form.paymentMode">
              <el-radio label="redirect">跳转模式</el-radio>
              <el-radio label="qrcode">扫码模式</el-radio>
            </el-radio-group>
            <div class="form-tip">
              <el-text type="info" size="small">
                <i class="fas fa-info-circle"></i>
                跳转模式：用户点击后跳转到支付页面；扫码模式：直接显示微信支付二维码。移动端始终使用跳转模式。
              </el-text>
            </div>
            <div style="margin-top: 10px; color: #666; font-size: 12px;">
              当前选择: {{ form.paymentMode }}
            </div>
          </el-form-item>
        </template>

        <el-form-item label="回调地址" prop="notifyUrl">
          <el-input v-model="form.notifyUrl" placeholder="请输入异步回调地址" />
          <div class="form-tip" style="margin-top: 8px;">
            <el-text type="info" size="small">
              <i class="fas fa-info-circle"></i>
              回调路径说明：
            </el-text>
            <div style="margin-top: 4px; padding-left: 16px; color: #666; font-size: 12px; line-height: 1.5;">
              • 微信支付：<code>/api/payment/wechat/notify</code><br>
              • 支付宝：<code>/api/payment/alipay/notify</code><br>
              • 易支付：<code>/api/payment/epay/notify</code><br>
              <span style="color: #E6A23C;">⚠️ 请确保域名可被支付平台访问</span>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="返回地址" prop="returnUrl">
          <el-input v-model="form.returnUrl" placeholder="请输入同步返回地址" />
        </el-form-item>

        <el-form-item label="启用状态">
          <el-switch v-model="form.isActive" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitting">
          {{ isEditing ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Setting, Edit, Delete, Lock, Unlock } from '@element-plus/icons-vue';
// 移除未使用的Refresh导入和未使用的图标
import type { FormInstance, FormRules } from 'element-plus';
import { paymentConfigApi, type PaymentConfig, type CreatePaymentConfigRequest } from '@/api/payment-config.ts';

const paymentConfigs = ref<PaymentConfig[]>([]);
const dialogVisible = ref(false);
const isEditing = ref(false);
const submitting = ref(false);
const testingConfigId = ref<number | null>(null);
const formRef = ref<FormInstance>();
const loading = ref(false);

// 搜索和筛选
const searchType = ref('');
const searchStatus = ref<boolean | ''>('');

// 刷新状态
const refreshing = ref(false);
const isRefreshing = ref(false);

// 计算属性
const activeConfigs = computed(() => {
  return paymentConfigs.value.filter(config => config.isActive).length;
});

const wechatConfigs = computed(() => {
  return paymentConfigs.value.filter(config => config.type === 'wechat').length;
});

const alipayConfigs = computed(() => {
  return paymentConfigs.value.filter(config => config.type === 'alipay').length;
});

const filteredConfigs = computed(() => {
  let filtered = paymentConfigs.value;
  
  if (searchType.value) {
    filtered = filtered.filter(config => config.type === searchType.value);
  }
  
  if (searchStatus.value !== '') {
    filtered = filtered.filter(config => config.isActive === searchStatus.value);
  }
  
  return filtered;
});

const form = ref<CreatePaymentConfigRequest>({
  name: '',
  code: '',
  type: '',
  appId: '',
  merchantId: '',
  apiKey: '',
  appSecret: '',
  apiUrl: '',
  notifyUrl: '',
  returnUrl: '',
  isActive: true,
  paymentMode: 'redirect' // 默认跳转模式
});

const rules: FormRules = {
  name: [
    { required: true, message: '请输入配置名称', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入配置代码', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择支付类型', trigger: 'change' }
  ],
  appId: [
    { required: true, message: '请输入应用ID', trigger: 'blur' }
  ],
  merchantId: [
    { required: true, message: '请输入商户ID', trigger: 'blur' }
  ],
  apiKey: [
    { required: true, message: '请输入API密钥', trigger: 'blur' }
  ]
};

// 获取类型颜色
const getTypeColor = (type: string) => {
  switch (type) {
    case 'wechat': return 'success';
    case 'alipay': return 'primary';
    case 'epay': return 'warning';
    default: return 'info';
  }
};

// 获取类型名称
const getTypeName = (type: string) => {
  switch (type) {
    case 'wechat': return '微信支付';
    case 'alipay': return '支付宝';
    case 'epay': return '易支付';
    default: return type;
  }
};

// 获取类型图标
const getTypeIcon = (type: string) => {
  switch (type) {
    case 'wechat': return 'Setting';
    case 'alipay': return 'Setting';
    case 'epay': return 'Setting';
    default: return 'Setting';
  }
};

// 获取类型图标样式类
const getTypeIconClass = (type: string) => {
  switch (type) {
    case 'wechat': return 'wechat-icon';
    case 'alipay': return 'alipay-icon';
    case 'epay': return 'epay-icon';
    default: return 'default-icon';
  }
};

// 处理搜索
const handleSearch = () => {
  // 搜索逻辑已在计算属性中处理
};

// 格式化日期
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN');
};

// 支付类型改变时的处理
const onTypeChange = () => {
  // 清空相关字段
  form.value.appId = '';
  form.value.merchantId = '';
  form.value.apiKey = '';
  form.value.appSecret = '';
  form.value.apiUrl = '';
  
  // 如果是易支付，设置默认支付模式
  if (form.value.type === 'epay') {
    form.value.paymentMode = 'redirect';
  }
};





// 加载支付配置列表
const loadPaymentConfigs = async () => {
  try {
    const response = await paymentConfigApi.getAll();
    if (response.code === 200) {
      paymentConfigs.value = response.data;
    }
  } catch (error) {
    console.error('加载支付配置失败:', error);
    ElMessage.error('加载支付配置失败');
  }
};

// 显示创建对话框
const showCreateDialog = () => {
  isEditing.value = false;
  resetForm();
  dialogVisible.value = true;
};

// 编辑配置
const editConfig = (config: PaymentConfig) => {
  isEditing.value = true;
  
  // 直接设置表单数据
  form.value = {
    name: config.name,
    code: config.code,
    type: config.type,
    appId: config.appId || '',
    merchantId: config.merchantId || '',
    apiKey: config.apiKey || '',
    appSecret: config.appSecret || '',
    apiUrl: config.apiUrl || '',
    notifyUrl: config.notifyUrl || '',
    returnUrl: config.returnUrl || '',
    isActive: config.isActive,
    paymentMode: config.paymentMode || 'redirect'
  };
  
  (form.value as any).id = config.id;
  dialogVisible.value = true;
};

// 切换激活状态
const toggleActive = async (config: PaymentConfig) => {
  try {
    await paymentConfigApi.toggleActive(config.id);
    ElMessage.success(`${config.isActive ? '禁用' : '启用'}成功`);
    await loadPaymentConfigs();
  } catch (error) {
    console.error('切换状态失败:', error);
    ElMessage.error('操作失败');
  }
};

// 测试配置
const testConfig = async (config: PaymentConfig) => {
  if (testingConfigId.value !== null) {
    ElMessage.warning('请等待当前测试完成');
    return;
  }

  try {
    console.log('开始测试配置:', config.name, 'ID:', config.id);
    
    // 设置测试状态
    testingConfigId.value = config.id;
    
    const response = await paymentConfigApi.testConfig(config.id);
    console.log('测试配置响应:', response);
    
    if (response.code === 200) {
      ElMessage.success({
        message: `配置测试通过！配置名称：${response.data?.configName || config.name}`,
        duration: 3000
      });
    } else {
      ElMessage.error({
        message: response.message || '配置测试失败',
        duration: 5000
      });
    }
  } catch (error: any) {
    console.error('测试配置失败:', error);
    console.error('错误详情:', error.response?.data || error.message);
    
    const errorMessage = error.response?.data?.message || error.message || '配置测试失败';
    ElMessage.error({
      message: `测试失败：${errorMessage}`,
      duration: 5000
    });
  } finally {
    // 清除测试状态
    testingConfigId.value = null;
  }
};

// 删除配置
const deleteConfig = async (config: PaymentConfig) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除支付配置"${config.name}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    await paymentConfigApi.delete(config.id);
    ElMessage.success('删除成功');
    await loadPaymentConfigs();
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除配置失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitting.value = true;

    if (isEditing.value) {
      const id = (form.value as any).id;
      await paymentConfigApi.update(id, form.value);
      ElMessage.success('更新成功');
    } else {
      await paymentConfigApi.create(form.value);
      ElMessage.success('创建成功');
    }

    dialogVisible.value = false;
    await loadPaymentConfigs();
  } catch (error: any) {
    console.error('提交失败:', error);
    ElMessage.error(error.message || '操作失败');
  } finally {
    submitting.value = false;
  }
};

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  form.value = {
    name: '',
    code: '',
    type: '',
    appId: '',
    merchantId: '',
    apiKey: '',
    appSecret: '',
    apiUrl: '',
    notifyUrl: '',
    returnUrl: '',
    isActive: true,
    paymentMode: 'redirect'
  };
};

// 刷新数据
const refreshData = async () => {
  if (refreshing.value) return;
  
  refreshing.value = true;
  isRefreshing.value = true;
  
  try {
    // 触发顶部进度条
    window.dispatchEvent(new CustomEvent('startProgress'));
    
    await loadPaymentConfigs();
    
    ElMessage.success('数据刷新成功');
  } catch (error) {
    console.error('刷新数据失败:', error);
    ElMessage.error('数据刷新失败');
  } finally {
    // 停止顶部进度条
    window.dispatchEvent(new CustomEvent('stopProgress'));
    
    // 延迟重置刷新状态，保持动画效果
    setTimeout(() => {
      refreshing.value = false;
      isRefreshing.value = false;
    }, 500);
  }
};

onMounted(() => {
  loadPaymentConfigs();
  
  // 监听刷新事件
  window.addEventListener('refreshPaymentConfigs', refreshData);
});

onUnmounted(() => {
  // 移除事件监听器
  window.removeEventListener('refreshPaymentConfigs', refreshData);
});
</script>

<style scoped>
.payment-config-container {
  padding: 20px;
  background: #f8f9fa;
  min-height: 100vh;
}

.admin-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  gap: 20px;
}

.header-title h2 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-title p {
  margin: 0;
  color: #7f8c8d;
  font-size: 14px;
}

/* 统计卡片 */
.stats-cards {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 140px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-card:nth-child(2) {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  box-shadow: 0 4px 12px rgba(240, 147, 251, 0.3);
}

.stat-card:nth-child(3) {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3);
}

.stat-card:nth-child(4) {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  box-shadow: 0 4px 12px rgba(67, 233, 123, 0.3);
}

.stat-icon {
  font-size: 24px;
  opacity: 0.9;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  opacity: 0.9;
}

/* 卡片样式 */
.admin-card {
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: none;
  overflow: hidden;
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
  color: #2c3e50;
}

.card-subtitle {
  color: #7f8c8d;
  font-size: 14px;
}

/* 搜索框 */
.search-box {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.type-select,
.status-select {
  width: 140px;
}

.admin-btn-secondary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  font-weight: 500;
  transition: all 0.3s ease;
}

.admin-btn-secondary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* 表格样式 */
.admin-table {
  border-radius: 8px;
  overflow: hidden;
}

.admin-table .el-table__header {
  background: #f8f9fa;
}

.admin-table .el-table__header th {
  background: #f8f9fa;
  color: #495057;
  font-weight: 600;
  border-bottom: 2px solid #e9ecef;
}

.admin-table .el-table__row:hover {
  background: #f8f9fa;
}

.config-name {
  display: flex;
  align-items: center;
  gap: 10px;
}

.payment-icon {
  font-size: 18px;
  padding: 4px;
  border-radius: 6px;
}

.payment-icon.wechat-icon {
  color: #07c160;
  background: rgba(7, 193, 96, 0.1);
}

.payment-icon.alipay-icon {
  color: #1677ff;
  background: rgba(22, 119, 255, 0.1);
}

.payment-icon.epay-icon {
  color: #ff6b35;
  background: rgba(255, 107, 53, 0.1);
}

.config-title {
  font-weight: 500;
  color: #2c3e50;
}

.admin-tag {
  font-weight: 500;
  border-radius: 6px;
  padding: 4px 8px;
}

.config-code {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 4px 8px;
  border-radius: 6px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  color: #495057;
  border: 1px solid #dee2e6;
}

.merchant-info {
  font-size: 12px;
  line-height: 1.4;
}

.merchant-info .info-item {
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.merchant-info .label {
  color: #6c757d;
  font-weight: 500;
  min-width: 50px;
}

.merchant-info .value {
  color: #495057;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  background: #f8f9fa;
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 11px;
}

.date-text {
  color: #6c757d;
  font-size: 12px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 6px;
  justify-content: center;
  flex-wrap: nowrap;
  align-items: center;
}

.action-btn {
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-width: auto;
}

.action-btn:hover {
  transform: translateY(-1px);
}

.action-btn .el-icon {
  margin-right: 2px;
}

/* 分页 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.admin-pagination {
  background: transparent;
}

/* 对话框样式 */
.admin-edit-dialog {
  border-radius: 8px;
}

/* 表单提示 */
.form-tip {
  margin-top: 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border: 1px solid #93c5fd;
  border-radius: 8px;
  font-size: 14px;
  color: #1e40af;
}

/* 刷新动画 */
.payment-config-container {
  transition: all 0.3s ease;
}

.payment-config-container.refreshing {
  opacity: 0.7;
  transform: scale(0.98);
  filter: blur(1px);
}

.payment-config-container.refreshing .content-card {
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

/* 响应式设计 */
@media (max-width: 1200px) {
  .stats-cards {
    gap: 12px;
  }
  
  .stat-card {
    min-width: 120px;
    padding: 16px;
  }
  
  .stat-number {
    font-size: 20px;
  }
}

@media (max-width: 768px) {
  .payment-config-container {
    padding: 12px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
  
  .stat-card {
    min-width: auto;
    padding: 12px;
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }
  
  .stat-icon {
    font-size: 20px;
  }
  
  .stat-number {
    font-size: 18px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    flex-direction: column;
    gap: 8px;
  }
  
  .type-select,
  .status-select {
    width: 100%;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }
  
  .action-btn {
    font-size: 11px;
    padding: 4px 8px;
  }
  
  .merchant-info .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }
  
  .merchant-info .label {
    min-width: auto;
  }
}

/* 微信支付提示样式 */
.wechat-tip {
  border-radius: 6px;
}

.tip-text {
  color: #e6a23c;
  font-size: 14px;
}

.highlight-text {
  color: #f56c6c !important;
  font-weight: 600;
}

@media (max-width: 480px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .admin-table {
    font-size: 11px;
  }
  
  .config-name {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .payment-icon {
    font-size: 14px;
  }
}
</style>