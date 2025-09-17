<template>
  <div class="admin-page" :class="{ 'refreshing': isRefreshing }">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">
          <el-icon class="title-icon"><Setting /></el-icon>
          API配置管理
        </h1>
      </div>
      <div class="header-right">
        <el-button 
          type="primary" 
          @click="handleAddConfig" 
          :icon="Plus"
          class="add-btn"
        >
          添加API配置
        </el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="content-card">
      <div class="table-header">
        <h3>API配置列表</h3>
      </div>
      
      <el-table 
        :data="apiConfigs" 
        v-loading="loading"
        loading-text="正在加载API配置数据..."
        class="admin-table"
        stripe
        :border="false"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="API名称" min-width="150">
          <template #default="scope">
            <div class="api-name">
              <el-icon class="api-icon"><Link /></el-icon>
              {{ scope.row.name }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="provider" label="提供商" min-width="120" />
        <el-table-column prop="type" label="API类型" width="120">
          <template #default="scope">
            <el-tag :type="getApiTypeTag(scope.row.type)" size="small">
              {{ getApiTypeName(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="url" label="API地址" show-overflow-tooltip min-width="200" />
        <el-table-column label="加密状态" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.encryptionEnabled" type="success" size="small">
              <el-icon><Lock /></el-icon>
              已加密
            </el-tag>
            <el-tag v-else type="info" size="small">
              <el-icon><Unlock /></el-icon>
              未加密
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="'active'"
              :inactive-value="'inactive'"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button 
                size="small" 
                @click="handleEdit(scope.row)" 
                :icon="Edit"
                plain
              >
                编辑
              </el-button>
              <el-button 
                size="small" 
                type="success" 
                @click="handleTest(scope.row)" 
                :loading="scope.row.testing"
                :icon="VideoPlay"
                plain
              >
                测试
              </el-button>
              <el-button 
                size="small" 
                type="danger" 
                @click="handleDelete(scope.row)"
                :icon="Delete"
                plain
              >
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
        />
      </div>
    </div>
    
    <!-- 添加/编辑API配置对话框 -->
    <el-dialog
      v-model="dialogVisible"
      width="900px"
      class="admin-dialog api-config-dialog"
      :close-on-click-modal="false"
      destroy-on-close
      :append-to-body="false"
     >
      <template #header>
        <div class="dialog-header">
          <el-icon class="dialog-icon"><Setting /></el-icon>
          <span>{{ dialogType === 'add' ? '添加API配置' : '编辑API配置' }}</span>
        </div>
      </template>
      
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="90px" class="admin-form compact-form">
        <!-- 基础信息 -->
        <div class="form-section">
          <div class="form-section-title">
            <el-icon><Document /></el-icon>
            <span>基础信息</span>
          </div>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="API名称" prop="name">
                <el-input v-model="formData.name" placeholder="请输入API名称" size="default">
                  <template #prefix>
                    <el-icon><Document /></el-icon>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="提供商" prop="provider">
                <el-input v-model="formData.provider" placeholder="请输入API提供商" size="default">
                  <template #prefix>
                    <el-icon><OfficeBuilding /></el-icon>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="API类型" prop="type">
                <el-select v-model="formData.type" placeholder="请选择API类型" style="width: 100%" size="default">
                  <template #prefix>
                    <el-icon><Menu /></el-icon>
                  </template>
                  <el-option 
                    v-for="apiType in apiTypes" 
                    :key="apiType.code" 
                    :label="apiType.name" 
                    :value="apiType.code" 
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="请求方法" prop="method">
                <el-select v-model="formData.method" placeholder="请选择请求方法" style="width: 100%" size="default">
                  <el-option label="GET" value="GET" />
                  <el-option label="POST" value="POST" />
                  <el-option label="PUT" value="PUT" />
                  <el-option label="DELETE" value="DELETE" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-form-item label="基础URL" prop="baseUrl">
            <el-input v-model="formData.baseUrl" placeholder="请输入基础URL，例如：https://api.example.com" size="default">
              <template #prefix>
                <el-icon><Link /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item label="API路径" prop="apiPath">
            <el-input v-model="formData.apiPath" placeholder="请输入API路径，例如：/api/v1/query" size="default">
              <template #prefix>
                <el-icon><FolderOpened /></el-icon>
              </template>
            </el-input>
            <div class="form-tip">
              <el-icon><InfoFilled /></el-icon>
              完整URL = 基础URL + API路径
            </div>
          </el-form-item>
        </div>
        
        <!-- 认证配置 -->
        <div class="form-section">
          <div class="form-section-title">
            <el-icon><Lock /></el-icon>
            <span>认证配置</span>
          </div>
          
          <el-form-item label="认证方式" prop="authType">
            <el-select v-model="formData.authType" placeholder="请选择认证方式" style="width: 100%" size="default">
              <el-option label="无认证" value="none" />
              <el-option label="API Key" value="apiKey" />
              <el-option label="Bearer Token" value="bearer" />
              <el-option label="Basic Auth" value="basic" />
              <el-option label="Access-Id" value="accessId" />
              <el-option label="OAuth2" value="oauth2" />
            </el-select>
          </el-form-item>
          
          <template v-if="formData.authType === 'apiKey'">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Key名称" prop="apiKeyName">
                  <el-input v-model="formData.apiKeyName" placeholder="请输入API Key名称" size="default" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Key位置" prop="apiKeyLocation">
                  <el-select v-model="formData.apiKeyLocation" placeholder="请选择API Key位置" style="width: 100%" size="default">
                    <el-option label="Header" value="header" />
                    <el-option label="Query" value="query" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-form-item label="Key值" prop="apiKeyValue">
              <el-input v-model="formData.apiKeyValue" placeholder="请输入API Key值" show-password size="default" />
            </el-form-item>
          </template>
          
          <template v-if="formData.authType === 'bearer'">
            <el-form-item label="Token" prop="bearerToken">
              <el-input v-model="formData.bearerToken" placeholder="请输入Token" show-password size="default" />
            </el-form-item>
          </template>
          
          <template v-if="formData.authType === 'basic'">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="用户名" prop="username">
                  <el-input v-model="formData.username" placeholder="请输入用户名" size="default" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="密码" prop="password">
                  <el-input v-model="formData.password" placeholder="请输入密码" show-password size="default" />
                </el-form-item>
              </el-col>
            </el-row>
          </template>
          
          <template v-if="formData.authType === 'accessId'">
            <el-form-item label="Access-Id" prop="accessId">
              <el-input v-model="formData.accessId" placeholder="请输入Access-Id" show-password size="default" />
            </el-form-item>
          </template>
        </div>
        
        <!-- 请求配置 -->
        <div class="form-section">
          <div class="form-section-title">
            <el-icon><Setting /></el-icon>
            <span>请求配置</span>
          </div>
          
          <el-form-item label="请求头" prop="headers">
            <div class="headers-list">
              <div v-for="(header, index) in formData.headers" :key="index" class="header-item">
                <el-row :gutter="10">
                  <el-col :span="10">
                    <el-input v-model="header.name" placeholder="Header名称" />
                  </el-col>
                  <el-col :span="10">
                    <el-input v-model="header.value" placeholder="Header值" />
                  </el-col>
                  <el-col :span="4">
                    <el-button type="danger" icon="Delete" circle @click="removeHeader(index)" />
                  </el-col>
                </el-row>
              </div>
              
              <div class="add-header">
                <el-button type="primary" @click="addHeader">添加请求头</el-button>
              </div>
            </div>
          </el-form-item>
          
          <el-form-item label="请求参数" prop="requestParams">
            <div class="params-list">
              <div v-for="(param, index) in formData.requestParams" :key="index" class="param-item">
                <el-row :gutter="10">
                  <el-col :span="7">
                    <el-input v-model="param.name" placeholder="参数名称" />
                  </el-col>
                  <el-col :span="7">
                    <el-input v-model="param.description" placeholder="参数描述" />
                  </el-col>
                  <el-col :span="7">
                    <el-input v-model="param.testValue" placeholder="测试值（可选）" />
                  </el-col>
                  <el-col :span="3">
                    <el-button type="danger" icon="Delete" circle @click="removeRequestParam(index)" />
                  </el-col>
                </el-row>
              </div>
              
              <div class="add-param">
                <el-button type="primary" @click="addRequestParam">添加请求参数</el-button>
              </div>
            </div>
          </el-form-item>
        </div>
        
        <!-- 响应配置 -->
        <div class="form-section">
          <div class="form-section-title">
            <el-icon><Document /></el-icon>
            <span>响应配置</span>
          </div>
          
          <el-form-item label="响应映射" prop="responseMapping">
            <el-input
              v-model="formData.responseMapping"
              type="textarea"
              :rows="5"
              placeholder="请输入响应映射JSON格式，例如：{ 'name': 'data.name', 'age': 'data.age' }"
              size="default"
            />
          </el-form-item>
        </div>
        
        <!-- 加密配置 -->
        <div class="form-section">
          <div class="form-section-title">
            <el-icon><Lock /></el-icon>
            <span>加密配置</span>
          </div>
          
          <el-form-item label="数据加密">
            <el-switch
              v-model="formData.encryptionEnabled"
              active-text="启用加密"
              inactive-text="禁用加密"
            />
          </el-form-item>
          
          <template v-if="formData.encryptionEnabled">
            <el-form-item label="加密类型" prop="encryptionType">
              <el-select v-model="formData.encryptionType" placeholder="请选择加密类型" style="width: 100%" size="default">
                <el-option label="AES" value="aes" />
                <el-option label="RSA" value="rsa" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="加密密钥" prop="encryptionKey">
              <el-input 
                v-model="formData.encryptionKey" 
                placeholder="请输入16进制加密密钥" 
                show-password 
                size="default"
              />
            </el-form-item>
            
            <template v-if="formData.encryptionType === 'aes'">
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="加密模式" prop="encryptionMode">
                    <el-select v-model="formData.encryptionMode" placeholder="请选择加密模式" style="width: 100%" size="default">
                      <el-option label="CBC" value="cbc" />
                      <el-option label="ECB" value="ecb" />
                      <el-option label="CFB" value="cfb" />
                      <el-option label="OFB" value="ofb" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="填充方式" prop="encryptionPadding">
                    <el-select v-model="formData.encryptionPadding" placeholder="请选择填充方式" style="width: 100%" size="default">
                      <el-option label="PKCS7" value="pkcs7" />
                      <el-option label="PKCS5" value="pkcs5" />
                      <el-option label="无填充" value="none" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="编码格式" prop="encryptionEncoding">
                    <el-select v-model="formData.encryptionEncoding" placeholder="请选择编码格式" style="width: 100%" size="default">
                      <el-option label="Base64" value="base64" />
                      <el-option label="Hex" value="hex" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </template>
          </template>
        </div>
        
        <!-- 其他配置 -->
        <div class="form-section">
          <div class="form-section-title">
            <el-icon><Setting /></el-icon>
            <span>其他配置</span>
          </div>
          
          <el-form-item label="动态参数" prop="dynamicParams">
            <el-input
              v-model="formData.dynamicParams"
              type="textarea"
              :rows="3"
              placeholder='请输入动态参数配置JSON格式，例如：{ "t": "timestamp13", "nonce": "random:8" }'
              size="default"
            />
            <div class="form-tip">
              支持的动态参数类型：timestamp（时间戳）、timestamp13（13位时间戳）、uuid（UUID）、random:N（N位随机字符串）
            </div>
          </el-form-item>
          
          <el-form-item label="状态" prop="status">
            <el-switch
              v-model="formData.status"
              :active-value="'active'"
              :inactive-value="'inactive'"
              active-text="启用"
              inactive-text="禁用"
            />
          </el-form-item>
        </div>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" :icon="Close">
            取消
          </el-button>
          <el-button type="primary" @click="submitForm" :loading="submitting" :icon="Check">
            {{ dialogType === 'add' ? '添加' : '保存' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  Plus, 
  Edit, 
  Delete, 
  VideoPlay,
  Lock,
  Unlock,
  Setting,
  Link,
  Document,
  OfficeBuilding,
  Menu,
  FolderOpened,
  InfoFilled,
  Close,
  Check
} from '@element-plus/icons-vue';

// API配置列表
const apiConfigs = ref<any[]>([]);
const loading = ref(false);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

// 刷新状态
const refreshing = ref(false);
const isRefreshing = ref(false);

// API类型列表
const apiTypes = ref<any[]>([]);

// 对话框相关
const dialogVisible = ref(false);
const dialogType = ref<'add' | 'edit'>('add');
const formRef = ref();
const submitting = ref(false);

// 表单数据
const formData = reactive({
  id: '',
  name: '',
  provider: '',
  type: '',
  baseUrl: '',
  apiPath: '',
  method: 'GET',
  authType: 'none',
  apiKeyName: '',
  apiKeyLocation: 'header',
  apiKeyValue: '',
  bearerToken: '',
  username: '',
  password: '',
  accessId: '',
  headers: [] as { name: string; value: string }[],
  requestParams: [] as { name: string; description: string; testValue?: string }[],
  responseMapping: '',
  // 加密相关字段
  encryptionEnabled: false,
  encryptionType: 'aes',
  encryptionKey: '',
  encryptionMode: 'cbc',
  encryptionPadding: 'pkcs7',
  encryptionEncoding: 'base64',
  // 动态参数
  dynamicParams: '',
  status: 'active'
});

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入API名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  provider: [
    { required: true, message: '请输入API提供商', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择API类型', trigger: 'change' }
  ],
  baseUrl: [
    { required: true, message: '请输入基础URL', trigger: 'blur' }
  ],
  method: [
    { required: true, message: '请选择请求方法', trigger: 'change' }
  ],
  authType: [
    { required: true, message: '请选择认证方式', trigger: 'change' }
  ]
};

// 获取API配置列表
const fetchApiConfigs = async () => {
  loading.value = true;
  
  try {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/admin/api-configs', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    
    if (data.success) {
      // 转换后端数据格式到前端格式
      apiConfigs.value = data.data.map((item: any) => ({
        id: item.id.toString(),
        name: item.name,
        provider: item.provider,
        type: item.type || 'other',
        baseUrl: item.baseUrl || '',
        apiPath: item.apiPath || '',
        url: (item.baseUrl || '') + (item.apiPath || ''),
        method: item.requestMethod || 'GET',
        authType: item.apiKey ? 'apiKey' : (item.token ? 'bearer' : (item.accessId ? 'accessId' : 'none')),
        apiKeyName: item.apiKeyName || 'X-API-KEY',
        apiKeyLocation: item.apiKeyLocation || 'header',
        apiKeyValue: item.apiKey || '',
        bearerToken: item.token || '',
        username: '',
        password: '',
        accessId: item.accessId || '',
        headers: (() => {
          if (!item.headers || item.headers === 'null') return [];
          if (typeof item.headers === 'string') {
            try {
              return JSON.parse(item.headers);
            } catch {
              return [];
            }
          }
          return Array.isArray(item.headers) ? item.headers : [];
        })(),
        requestParams: (() => {
          if (!item.requestParams || item.requestParams === 'null') return [];
          if (typeof item.requestParams === 'string') {
            try {
              return JSON.parse(item.requestParams);
            } catch {
              return [];
            }
          }
          return Array.isArray(item.requestParams) ? item.requestParams : [];
        })(),
        responseMapping: item.responseFormat || '',
        // 加密相关字段
        encryptionEnabled: Boolean(item.encryptionEnabled),
        encryptionType: item.encryptionType || 'aes',
        encryptionKey: item.encryptionKey || '',
        encryptionMode: item.encryptionMode || 'cbc',
        encryptionPadding: item.encryptionPadding || 'pkcs7',
        encryptionEncoding: item.encryptionEncoding || 'base64',
        // 动态参数
        dynamicParams: item.dynamicParams ? (typeof item.dynamicParams === 'string' ? item.dynamicParams : JSON.stringify(item.dynamicParams, null, 2)) : '',
        status: item.isActive ? 'active' : 'inactive'
      }));
      
      total.value = apiConfigs.value.length;
    } else {
      ElMessage.error(data.message || '获取API配置列表失败');
      apiConfigs.value = [];
    }
  } catch (error: any) {
    console.error('获取API配置列表失败:', error);
    ElMessage.error('获取API配置列表失败');
    apiConfigs.value = [];
  } finally {
    loading.value = false;
  }
};

// 获取API类型列表
const fetchApiTypes = async () => {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/admin/api-types', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await res.json();
    
    if (data.success) {
      apiTypes.value = data.data;
    } else {
      ElMessage.error(data.message || '获取API类型列表失败');
      // 使用默认API类型
      apiTypes.value = [
        { code: 'person_info', name: '个人信息查询' },
        { code: 'person_credit', name: '个人征信查询' },
        { code: 'company_info', name: '企业信息查询' },
        { code: 'other', name: '其他' }
      ];
    }
  } catch (error: any) {
    console.error('获取API类型列表失败:', error);
    // 使用默认API类型
    apiTypes.value = [
      { code: 'person_info', name: '个人信息查询' },
      { code: 'person_credit', name: '个人征信查询' },
      { code: 'company_info', name: '企业信息查询' },
      { code: 'other', name: '其他' }
    ];
  }
};

// 获取API类型名称
const getApiTypeName = (type: string) => {
  const apiType = apiTypes.value.find(item => item.code === type);
  return apiType ? apiType.name : type;
};

// 获取API类型标签类型
const getApiTypeTag = (type: string) => {
  if (type.startsWith('person_')) {
    return 'primary';
  } else if (type.startsWith('company_')) {
    return 'success';
  } else {
    return 'info';
  }
};

// 添加API配置
const handleAddConfig = () => {
  dialogType.value = 'add';
  resetForm();
  dialogVisible.value = true;
};

// 编辑API配置
const handleEdit = (row: any) => {
  dialogType.value = 'edit';
  resetForm();
  
  // 复制数据到表单
  Object.assign(formData, {
    id: row.id,
    name: row.name,
    provider: row.provider,
    type: row.type || 'other',
    baseUrl: row.baseUrl || '',
    apiPath: row.apiPath || '',
    method: row.method,
    authType: row.authType,
    apiKeyName: row.apiKeyName || 'X-API-KEY',
    apiKeyLocation: row.apiKeyLocation || 'header',
    apiKeyValue: row.apiKeyValue || '',
    bearerToken: row.bearerToken || '',
    username: row.username || '',
    password: row.password || '',
    accessId: row.accessId || '',
    headers: JSON.parse(JSON.stringify(row.headers || [])),
    requestParams: JSON.parse(JSON.stringify(row.requestParams || [])),
    responseMapping: row.responseMapping || '',
    // 加密相关字段
    encryptionEnabled: Boolean(row.encryptionEnabled),
    encryptionType: row.encryptionType || 'aes',
    encryptionKey: row.encryptionKey || '',
    encryptionMode: row.encryptionMode || 'cbc',
    encryptionPadding: row.encryptionPadding || 'pkcs7',
    encryptionEncoding: row.encryptionEncoding || 'base64',
    // 动态参数
    dynamicParams: row.dynamicParams ? (typeof row.dynamicParams === 'string' ? row.dynamicParams : JSON.stringify(row.dynamicParams, null, 2)) : '',
    status: row.status
  });
  
  dialogVisible.value = true;
};

// 删除API配置
const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定要删除API配置"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/api-configs/${row.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await res.json();
      
      if (data.success) {
        ElMessage.success('删除成功');
        // 重新获取列表
        await fetchApiConfigs();
      } else {
        // 如果有关联的查询项目，显示详细信息
        if (data.relatedItems && data.relatedItems.length > 0) {
          ElMessageBox.alert(
            `<div>
              <p><strong>无法删除API配置</strong></p>
              <p>以下查询项目正在使用此配置，请先删除或修改这些查询项目：</p>
              <div style="background: #f5f5f5; padding: 10px; border-radius: 4px; margin-top: 10px;">
                ${data.relatedItems.map((item: any) => 
                  `<div style="margin: 5px 0;">• ${item.name} (${item.category})</div>`
                ).join('')}
              </div>
            </div>`,
            '删除失败',
            {
              dangerouslyUseHTMLString: true,
              confirmButtonText: '确定',
              type: 'warning'
            }
          );
        } else {
          ElMessage.error(data.message || '删除失败');
        }
      }
    } catch (error: any) {
      console.error('删除API配置失败:', error);
      ElMessage.error('删除失败，请检查网络连接');
    }
  }).catch(() => {
    // 取消删除
  });
};

// 测试API配置
const handleTest = async (row: any) => {
  // 设置测试状态
  row.testing = true;
  
  try {
    const token = localStorage.getItem('token');
    
    // 构建测试请求数据
    const testData: any = {
      url: (row.baseUrl || '') + (row.apiPath || ''),
      method: row.method || 'GET',
      headers: {},
      params: {},
      auth: {}
    };
    
    // 处理认证信息
    if (row.authType === 'apiKey' && row.apiKeyValue) {
      testData.auth.apiKey = row.apiKeyValue;
      testData.auth.apiKeyName = row.apiKeyName || 'X-API-KEY';
      testData.auth.apiKeyLocation = row.apiKeyLocation || 'header';
    }
    
    if (row.authType === 'bearer' && row.bearerToken) {
      testData.auth.token = row.bearerToken;
    }
    
    if (row.authType === 'accessId' && row.accessId) {
      testData.auth.accessId = row.accessId;
    }
    
    // 处理自定义请求头
    if (row.headers) {
      try {
        const customHeaders = typeof row.headers === 'string' ? JSON.parse(row.headers) : row.headers;
        if (Array.isArray(customHeaders)) {
          customHeaders.forEach((header: any) => {
            if (header.name && header.value) {
              testData.headers[header.name] = header.value;
            }
          });
        }
      } catch (e) {
        console.warn('解析自定义请求头失败:', e);
      }
    }
    
    // 询问用户是否需要传递参数
    const shouldIncludeParams = await new Promise((resolve) => {
      ElMessageBox.confirm(
        '是否在测试时传递请求参数？',
        '测试选项',
        {
          confirmButtonText: '传递参数',
          cancelButtonText: '不传递参数',
          type: 'info',
          distinguishCancelAndClose: true
        }
      ).then(() => {
        resolve(true);
      }).catch((action) => {
        if (action === 'cancel') {
          resolve(false);
        } else {
          // 用户点击了关闭按钮，取消测试
          throw new Error('用户取消测试');
        }
      });
    });

    // 处理请求参数（仅在用户选择传递参数时）
    if (shouldIncludeParams && row.requestParams) {
      try {
        const params = typeof row.requestParams === 'string' ? JSON.parse(row.requestParams) : row.requestParams;
        if (Array.isArray(params)) {
          params.forEach((param: any) => {
            if (param.name) {
              // 优先使用参数的测试值，如果没有则使用描述，最后使用智能默认值
              let testValue = param.testValue || param.description;
              
              if (!testValue) {
                // 根据参数名称智能生成测试值
                const paramName = param.name.toLowerCase();
                if (paramName.includes('id') || paramName.includes('uid')) {
                  testValue = '123456';
                } else if (paramName.includes('name') || paramName.includes('username')) {
                  testValue = 'test_user';
                } else if (paramName.includes('email')) {
                  testValue = 'test@example.com';
                } else if (paramName.includes('phone') || paramName.includes('mobile')) {
                  testValue = '13800138000';
                } else if (paramName.includes('page')) {
                  testValue = '1';
                } else if (paramName.includes('size') || paramName.includes('limit')) {
                  testValue = '10';
                } else if (paramName.includes('keyword') || paramName.includes('query')) {
                  testValue = 'test';
                } else {
                  testValue = 'test_value';
                }
              }
              
              testData.params[param.name] = testValue;
            }
          });
        }
      } catch (e) {
        console.warn('解析请求参数失败:', e);
      }
    }
    
    // 处理加密配置
    if (row.encryptionEnabled) {
      testData.encryption = {
        enabled: true,
        type: row.encryptionType || 'aes',
        key: row.encryptionKey,
        mode: row.encryptionMode || 'cbc',
        padding: row.encryptionPadding || 'pkcs7',
        encoding: row.encryptionEncoding || 'base64'
      };
    }
    
    // 处理动态参数
    if (row.dynamicParams) {
      testData.dynamicParams = row.dynamicParams;
    }
    
    // 发送测试数据
    
    // 调用测试API配置的API
        const res = await fetch('/api/admin/api-config/test', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    const result = await res.json();
    
    // 处理后端返回结果
    
    if (result.success && result.data) {
      const testResult = result.data;
      
      if (testResult.success) {
        ElMessage.success(`API测试成功！响应时间: ${testResult.responseTime || 'N/A'}`);
        
        // 显示详细测试结果
        ElMessageBox.alert(
          `<div>
            <p><strong>状态码:</strong> ${testResult.status || 'N/A'}</p>
            <p><strong>响应时间:</strong> ${testResult.responseTime || 'N/A'}</p>
            <p><strong>响应数据:</strong></p>
            <pre style="max-height: 300px; overflow-y: auto; background: #f5f5f5; padding: 10px; border-radius: 4px;">${JSON.stringify(testResult.data || {}, null, 2)}</pre>
          </div>`,
          'API测试结果',
          {
            dangerouslyUseHTMLString: true,
            confirmButtonText: '确定'
          }
        );
      } else {
        ElMessage.error(`API测试失败: ${testResult.error || '未知错误'}`);
        
        // 显示错误详情
        ElMessageBox.alert(
          `<div>
            <p><strong>错误信息:</strong> ${testResult.error || '未知错误'}</p>
            <p><strong>状态码:</strong> ${testResult.details?.status || 'N/A'}</p>
            <p><strong>错误详情:</strong></p>
            <pre style="max-height: 300px; overflow-y: auto; background: #f5f5f5; padding: 10px; border-radius: 4px;">${JSON.stringify(testResult.details || {}, null, 2)}</pre>
          </div>`,
          'API测试失败',
          {
            dangerouslyUseHTMLString: true,
            confirmButtonText: '确定'
          }
        );
      }
    } else {
      ElMessage.error(`API测试失败: ${result.message || '未知错误'}`);
      
      // 显示错误详情
      ElMessageBox.alert(
        `<div>
          <p><strong>错误信息:</strong> ${result.message || '未知错误'}</p>
          <p><strong>完整响应:</strong></p>
          <pre style="max-height: 300px; overflow-y: auto; background: #f5f5f5; padding: 10px; border-radius: 4px;">${JSON.stringify(result, null, 2)}</pre>
        </div>`,
        'API测试失败',
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '确定'
        }
      );
    }
  } catch (error: any) {
    console.error('测试API配置失败:', error);
    
    // 检查是否是用户取消测试
    if (error?.message === '用户取消测试') {
      ElMessage.info('已取消测试');
    } else {
      ElMessage.error('测试失败，请检查网络连接');
    }
  } finally {
    // 清除测试状态
    row.testing = false;
  }
};

// 修改API配置状态
const handleStatusChange = async (row: any) => {
  const originalStatus = row.status;
  
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/admin/api-config/${row.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        isActive: row.status === 'active'
      })
    });
    
    const data = await res.json();
    
    if (data.success) {
      ElMessage.success(`${row.status === 'active' ? '启用' : '禁用'}成功`);
    } else {
      ElMessage.error(data.message || '状态修改失败');
      // 恢复原状态
      row.status = originalStatus;
    }
  } catch (error: any) {
    console.error('修改API配置状态失败:', error);
    ElMessage.error('状态修改失败，请检查网络连接');
    // 恢复原状态
    row.status = originalStatus;
  }
};

// 添加请求头
const addHeader = () => {
  formData.headers.push({
    name: '',
    value: ''
  });
};

// 移除请求头
const removeHeader = (index: number) => {
  formData.headers.splice(index, 1);
};

// 添加请求参数
const addRequestParam = () => {
  formData.requestParams.push({
    name: '',
    description: '',
    testValue: ''
  });
};

// 移除请求参数
const removeRequestParam = (index: number) => {
  formData.requestParams.splice(index, 1);
};

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    id: '',
    name: '',
    provider: '',
    type: '',
    baseUrl: '',
    apiPath: '',
    method: 'GET',
    authType: 'none',
    apiKeyName: '',
    apiKeyLocation: 'header',
    apiKeyValue: '',
    bearerToken: '',
    username: '',
    password: '',
    accessId: '',
    headers: [],
    requestParams: [],
    responseMapping: '',
    // 加密相关字段
    encryptionEnabled: false,
    encryptionType: 'aes',
    encryptionKey: '',
    encryptionMode: 'cbc',
    encryptionPadding: 'pkcs7',
    encryptionEncoding: 'base64',
    // 动态参数
    dynamicParams: '',
    status: 'active'
  });
  
  if (formRef.value) {
    formRef.value.resetFields();
  }
};

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      submitting.value = true;
      
      try {
        const token = localStorage.getItem('token');
        
        // 准备提交数据，转换为后端格式
        const submitData: any = {
          name: formData.name,
          provider: formData.provider,
          type: formData.type,
          baseUrl: formData.baseUrl,
          apiPath: formData.apiPath,
          requestMethod: formData.method,
          requestFormat: 'json',
          responseFormat: formData.responseMapping || null,
          isActive: formData.status === 'active'
        };

        // 处理认证信息
        if (formData.authType === 'apiKey') {
          submitData.apiKey = formData.apiKeyValue || null;
          submitData.apiKeyName = formData.apiKeyName || 'X-API-KEY';
          submitData.apiKeyLocation = formData.apiKeyLocation || 'header';
        } else {
          submitData.apiKey = null;
          submitData.apiKeyName = null;
          submitData.apiKeyLocation = null;
        }

        if (formData.authType === 'bearer') {
          submitData.token = formData.bearerToken || null;
        } else {
          submitData.token = null;
        }

        if (formData.authType === 'accessId') {
          submitData.accessId = formData.accessId || null;
        } else {
          submitData.accessId = null;
        }

        // 处理headers
        if (formData.headers.length > 0) {
          submitData.headers = JSON.stringify(formData.headers);
        } else {
          submitData.headers = null;
        }

        // 处理requestParams
        if (formData.requestParams.length > 0) {
          submitData.requestParams = JSON.stringify(formData.requestParams);
        } else {
          submitData.requestParams = null;
        }

        // 处理加密配置
        submitData.encryptionEnabled = formData.encryptionEnabled;
        if (formData.encryptionEnabled) {
          submitData.encryptionType = formData.encryptionType;
          submitData.encryptionKey = formData.encryptionKey;
          submitData.encryptionMode = formData.encryptionMode;
          submitData.encryptionPadding = formData.encryptionPadding;
          submitData.encryptionEncoding = formData.encryptionEncoding;
        }

        // 处理动态参数
        if (formData.dynamicParams) {
          submitData.dynamicParams = formData.dynamicParams;
        }
        
        let res;
        if (dialogType.value === 'add') {
          // 调用添加API配置的API
          res = await fetch('/api/admin/api-config', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(submitData)
          });
        } else {
          // 调用更新API配置的API
          res = await fetch(`/api/admin/api-config/${formData.id}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(submitData)
          });
        }
        
        const data = await res.json();
        
        if (data.success) {
          ElMessage.success(dialogType.value === 'add' ? '添加成功' : '更新成功');
          dialogVisible.value = false;
          // 重新获取列表
          await fetchApiConfigs();
        } else {
          ElMessage.error(data.message || '操作失败');
        }
      } catch (error: any) {
        console.error('提交API配置失败:', error);
        ElMessage.error('提交失败，请检查网络连接');
      } finally {
        submitting.value = false;
      }
    }
  });
};

// 刷新数据
const refreshData = async () => {
  if (refreshing.value) return;
  
  refreshing.value = true;
  isRefreshing.value = true;
  
  try {
    // 触发顶部进度条
    window.dispatchEvent(new CustomEvent('startProgress'));
    
    await fetchApiConfigs();
    
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

// 分页相关
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  fetchApiConfigs();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  fetchApiConfigs();
};

onMounted(() => {
  fetchApiConfigs();
  fetchApiTypes();
  
  // 监听刷新事件
  window.addEventListener('refreshApiConfigs', refreshData);
});

onUnmounted(() => {
  // 移除事件监听器
  window.removeEventListener('refreshApiConfigs', refreshData);
});
</script>

<style scoped>
/* 页面容器 */
.admin-page {
  padding: 24px;
  background: #f8fafc;
  min-height: 100vh;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 0 4px;
}

.header-left .page-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  color: #1e293b;
}

.title-icon {
  font-size: 32px;
  color: #3b82f6;
}

.header-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.add-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  transition: all 0.3s ease;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
}

.refresh-btn {
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  transition: all 0.3s ease;
}

.refresh-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: #f8fafc;
}

/* 内容卡片 */
.content-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.table-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

/* 表格样式 */
.admin-table {
  width: 100%;
}

.admin-table :deep(.el-table__header) {
  background: #f8fafc;
}

.admin-table :deep(.el-table__row:hover) {
  background: #f1f5f9;
}

.api-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.api-icon {
  font-size: 16px;
  color: #3b82f6;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.action-buttons .el-button {
  transition: all 0.3s ease;
}

.action-buttons .el-button:hover {
  transform: translateY(-1px);
}

/* 分页容器 */
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  padding: 20px;
  background: #f8fafc;
}

/* 表单优化样式 */
.api-config-dialog .admin-form {
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 8px;
}

.api-config-dialog .admin-form::-webkit-scrollbar {
  width: 6px;
}

.api-config-dialog .admin-form::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.api-config-dialog .admin-form::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.api-config-dialog .admin-form::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 表单项间距优化 */
.api-config-dialog .el-form-item {
  margin-bottom: 18px;
}

.api-config-dialog .el-form-item__label {
  font-weight: 500;
  color: var(--admin-text-primary);
  font-size: 14px;
}

.api-config-dialog .el-input,
.api-config-dialog .el-select {
  font-size: 14px;
}

.api-config-dialog .el-input__inner,
.api-config-dialog .el-select__input {
  height: 36px;
  line-height: 36px;
}

/* 表单分组样式 */
.form-section {
  background: var(--admin-bg-light);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid var(--admin-border-lighter);
}

.form-section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--admin-text-primary);
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--admin-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-section-title .el-icon {
  color: var(--admin-primary);
  font-size: 18px;
}

/* 表单样式 */
.headers-list,
.params-list {
  border: 1px solid var(--admin-border-light);
  border-radius: 8px;
  padding: 16px;
  background: var(--admin-bg-light);
  max-height: 300px;
  overflow-y: auto;
}

.header-item,
.param-item {
  margin-bottom: 16px;
  padding: 16px;
  background: var(--admin-white);
  border-radius: 8px;
  border: 1px solid var(--admin-border-lighter);
  transition: all 0.3s ease;
}

.header-item:hover,
.param-item:hover {
  border-color: var(--admin-border);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.header-item:last-child,
.param-item:last-child {
  margin-bottom: 0;
}

.add-header,
.add-param {
  display: flex;
  justify-content: center;
  margin-top: 12px;
}

.form-tip {
  font-size: 12px;
  color: var(--admin-text-secondary);
  margin-top: 6px;
  line-height: 1.4;
  padding: 8px 12px;
  background: var(--admin-bg-light);
  border-radius: 6px;
  border-left: 3px solid var(--admin-primary);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .search-form {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input,
  .search-select {
    min-width: auto;
    width: 100%;
  }
  
  .page-actions {
    flex-direction: column;
    gap: 8px;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .page-actions {
    width: 100%;
    flex-direction: row;
    justify-content: flex-end;
  }
  
  .table-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 16px 20px;
  }
  
  .table-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .table-actions-buttons {
    justify-content: center;
  }
  
  .search-section {
    padding: 16px 20px;
  }
  
  .table-pagination {
    padding: 16px 20px;
  }
}

@media (max-width: 480px) {
  .search-form {
    gap: 12px;
  }
  
  .page-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .table-actions-buttons {
    flex-direction: column;
    gap: 6px;
  }
  
  .table-actions-buttons .el-button {
    width: 100%;
    justify-content: center;
  }
}

/* 刷新动画样式 */
.admin-page {
  transition: all 0.3s ease;
}

.admin-page.refreshing {
  opacity: 0.7;
  transform: scale(0.98);
  filter: blur(1px);
}

.admin-page.refreshing .table-card {
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
</style>