<template>
  <div class="admin-page" :class="{ 'refreshing': isRefreshing }">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">
          <el-icon class="title-icon"><Document /></el-icon>
          查询项目管理
        </h1>
      </div>
      <div class="header-right">
        <el-button 
          type="primary" 
          :icon="Plus" 
          @click="handleAddItem"
          class="add-btn"
        >
          添加查询项目
        </el-button>
      </div>
    </div>

    <!-- 查询项目列表 -->
    <div class="content-card">
      <div class="table-header">
        <h3>查询项目列表</h3>
      </div>
      <el-table
        v-loading="loading"
        :data="queryItems"
        class="admin-table"
        stripe
        :header-cell-style="{ background: '#f8fafc', color: '#475569' }"
      >
        <el-table-column prop="id" label="项目ID" width="90" />
        <el-table-column prop="name" label="项目名称" min-width="180">
          <template #default="scope">
            <div class="item-name">
              <el-icon class="item-icon">
                <i :class="scope.row.icon || 'fas fa-search'"></i>
              </el-icon>
              <span>{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="110">
          <template #default="scope">
            <el-tag size="small" type="info">
              {{ getCategoryName(scope.row.category) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="90" align="center">
          <template #default="scope">
            <span class="price-text">{{ formatAmount(scope.row.price) }}元</span>
          </template>
        </el-table-column>
        <el-table-column prop="apiConfigId" label="关联API" width="110">
          <template #default="scope">
            <el-tag size="small" type="success">
              {{ getApiConfigName(scope.row.api_config_id || scope.row.apiConfigId, scope.row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="平台可见性" width="120" align="center">
          <template #default="scope">
            <div class="platform-visibility">
              <el-tooltip content="移动端可见" placement="top">
                <el-switch
                  :model-value="getPlatformEnabled(scope.row, 'mobile')"
                  @change="(val: boolean) => handlePlatformVisibilityChange(scope.row, 'mobile', val)"
                  size="small"
                  class="platform-switch mobile"
                />
              </el-tooltip>
              <el-tooltip content="PC端可见" placement="top">
                <el-switch
                  :model-value="getPlatformEnabled(scope.row, 'pc')"
                  @change="(val: boolean) => handlePlatformVisibilityChange(scope.row, 'pc', val)"
                  size="small"
                  class="platform-switch pc"
                />
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="首页可见" width="100" align="center">
          <template #default="scope">
            <div class="homepage-visibility">
              <el-tooltip content="PC端首页显示" placement="top">
                <el-switch
                  :model-value="getHomepageEnabled(scope.row, 'pc')"
                  @change="(val: boolean) => handleHomepageVisibilityChange(scope.row, 'pc', val)"
                  size="small"
                  class="homepage-switch pc"
                />
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="70" align="center">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="'active'"
              :inactive-value="'inactive'"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="320" align="center">
          <template #default="scope">
            <div class="action-buttons">
              <el-button 
                size="small" 
                type="primary" 
                :icon="Edit"
                @click="handleEdit(scope.row)"
                plain
              >
                编辑
              </el-button>
              <el-button 
                size="small" 
                type="info" 
                :icon="Setting"
                @click="handlePlatformConfig(scope.row)"
                plain
              >
                平台配置
              </el-button>
              <el-button
                size="small"
                type="danger"
                :icon="Delete"
                @click="handleDelete(scope.row)"
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
    
    <!-- 添加/编辑查询项目对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '添加查询项目' : '编辑查询项目'"
      v-model="dialogVisible"
      width="900px"
      custom-class="admin-edit-dialog query-item-dialog"
      :close-on-click-modal="false"
      top="80px"
    >
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="90px" class="compact-form">
        <!-- 基础信息 -->
        <div class="form-section">
          <div class="form-section-title">
            <el-icon><InfoFilled /></el-icon>
            <span>基础信息</span>
          </div>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="项目名称" prop="name">
                <el-input v-model="formData.name" placeholder="请输入项目名称" size="default" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="查询分类" prop="category">
                <el-select v-model="formData.category" placeholder="请选择查询分类" style="width: 100%" size="default">
                  <el-option 
                    v-for="category in categories" 
                    :key="category.id" 
                    :label="category.name" 
                    :value="category.id" 
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="价格(元)" prop="price">
                <el-input-number v-model="formData.price" :precision="2" :step="0.01" :min="0" style="width: 100%" size="default" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="关联API" prop="apiConfigId">
                <el-select v-model="formData.apiConfigId" placeholder="请选择关联API" style="width: 100%" size="default">
                  <el-option
                    v-for="api in apiConfigs"
                    :key="api.id"
                    :label="api.name"
                    :value="api.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="状态" prop="status">
                <el-switch
                  v-model="formData.status"
                  :active-value="'active'"
                  :inactive-value="'inactive'"
                  active-text="启用"
                  inactive-text="禁用"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <!-- 占位列 -->
            </el-col>
          </el-row>
          
          <el-form-item label="项目描述" prop="description">
            <el-input
              v-model="formData.description"
              type="textarea"
              :rows="3"
              placeholder="请输入项目描述"
              size="default"
            />
          </el-form-item>
        </div>
        
        <!-- 查询参数配置 -->
        <div class="form-section">
          <div class="form-section-title">
            <el-icon><Setting /></el-icon>
            <span>查询参数配置</span>
          </div>
          
          <el-form-item label="查询参数" prop="queryParams">
            <div class="params-list">
              <div v-for="(param, index) in formData.queryParams" :key="index" class="param-item">
                <el-row :gutter="12">
                  <el-col :span="4">
                    <el-input v-model="param.name" placeholder="参数名称" size="default" />
                  </el-col>
                  <el-col :span="4">
                    <el-input v-model="param.label" placeholder="参数标签" size="default" />
                  </el-col>
                  <el-col :span="4">
                    <el-select v-model="param.type" placeholder="参数类型" size="default" style="width: 100%">
                      <el-option label="文本" value="text" />
                      <el-option label="数字" value="number" />
                      <el-option label="日期" value="date" />
                      <el-option label="选择" value="select" />
                    </el-select>
                  </el-col>
                  <el-col :span="8">
                    <el-input
                      v-model="param.placeholder"
                      placeholder="输入框提示文字"
                      size="default"
                    />
                  </el-col>
                  <el-col :span="2">
                    <el-checkbox v-model="param.required" size="small">必填</el-checkbox>
                  </el-col>
                  <el-col :span="2" style="display: flex; align-items: center; justify-content: flex-start;">
                    <el-button type="danger" size="default" @click="removeParam(index)" :icon="Delete" circle />
                  </el-col>
                </el-row>
                
                <el-row v-if="param.type === 'select'" :gutter="12" style="margin-top: 8px">
                  <el-col :span="4">
                    <div style="text-align: right; line-height: 32px; color: #606266; font-size: 13px;">选项值：</div>
                  </el-col>
                  <el-col :span="19">
                    <el-input
                      v-model="param.options"
                      placeholder="选项值，多个选项用逗号分隔，如：选项1,选项2,选项3"
                      size="default"
                    />
                  </el-col>
                </el-row>
              </div>
              
              <div class="add-param">
                <el-button type="primary" @click="addParam" size="default">添加参数</el-button>
              </div>
            </div>
          </el-form-item>
        </div>
        
        <!-- 图标配置 -->
        <div class="form-section">
          <div class="form-section-title">
            <el-icon><Setting /></el-icon>
            <span>图标配置</span>
          </div>
          
          <el-form-item label="图标配置">
            <el-card class="icon-config-card">
              <template #header>
                <div class="card-header">
                  <span>图标设置</span>
                  <div class="icon-preview">
                    <div 
                      class="service-icon"
                      :style="getIconContainerStyle()"
                    >
                      <i 
                        :class="formData.icon || 'fas fa-search'"
                        :style="getIconStyle()"
                      ></i>
                    </div>
                  </div>
                </div>
              </template>
            
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="图标类名" prop="icon">
                  <el-input 
                    v-model="formData.icon" 
                    placeholder="如：fas fa-search, fab fa-github, far fa-heart"
                    @input="updateIconPreview"
                  >
                    <template #append>
                      <el-button @click="showIconGuide = !showIconGuide">
                        <i class="fas fa-question-circle"></i> 图标指南
                      </el-button>
                    </template>
                  </el-input>
                  
                  <!-- 图标指南 -->
                  <div v-if="showIconGuide" class="icon-guide">
                    <div class="guide-header">
                      <h4><i class="fas fa-info-circle"></i> 图标使用指南</h4>
                      <el-button size="small" text @click="showIconGuide = false">
                        <i class="fas fa-times"></i>
                      </el-button>
                    </div>
                    <div class="guide-content">
                      <p><strong>图标来源：</strong></p>
                      <ul>
                        <li><strong>Font Awesome：</strong> <a href="https://fontawesome.com/icons" target="_blank">https://fontawesome.com/icons</a></li>
                        <li><strong>Element Plus：</strong> <a href="https://element-plus.org/zh-CN/component/icon.html" target="_blank">Element Plus 图标</a></li>
                      </ul>
                      <p><strong>使用示例：</strong></p>
                      <div class="example-icons">
                        <div class="example-item">
                          <code>fas fa-search</code> <i class="fas fa-search"></i> 搜索
                        </div>
                        <div class="example-item">
                          <code>fas fa-user</code> <i class="fas fa-user"></i> 用户
                        </div>
                        <div class="example-item">
                          <code>fas fa-building</code> <i class="fas fa-building"></i> 企业
                        </div>
                        <div class="example-item">
                          <code>fab fa-github</code> <i class="fab fa-github"></i> GitHub
                        </div>
                        <div class="example-item">
                          <code>far fa-heart</code> <i class="far fa-heart"></i> 心形（空心）
                        </div>
                      </div>
                      <p><strong>前缀说明：</strong></p>
                      <ul>
                        <li><code>fas</code> - 实心图标</li>
                        <li><code>far</code> - 空心图标</li>
                        <li><code>fab</code> - 品牌图标</li>
                        <li><code>fal</code> - 细线图标（需Pro版本）</li>
                      </ul>
                    </div>
                  </div>
                  
                  <!-- 预设图标选择 -->
                  <div class="icon-suggestions">
                    <div class="suggestions-header">
                      <span>常用图标：</span>
                      <el-button size="small" text @click="showAllIcons = !showAllIcons">
                        {{ showAllIcons ? '收起' : '展开全部' }}
                        <i :class="showAllIcons ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
                      </el-button>
                    </div>
                    <div class="icon-grid" :class="{ 'show-all': showAllIcons }">
                      <el-button 
                        v-for="iconOption in iconOptions" 
                        :key="iconOption.value"
                        size="small" 
                        @click="selectIcon(iconOption.value)"
                        class="icon-suggestion-btn"
                        :type="formData.icon === iconOption.value ? 'primary' : 'default'"
                      >
                        <i :class="iconOption.value"></i> {{ iconOption.label }}
                      </el-button>
                    </div>
                  </div>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="自定义颜色" prop="iconColor">
                  <div style="display: flex; align-items: center; gap: 10px; width: 100%;">
                    <el-color-picker 
                      v-model="formData.iconColor" 
                      @change="onCustomColorChange"
                      show-alpha
                      style="flex-shrink: 0;"
                    />
                    <el-input 
                      v-model="formData.iconColor" 
                      placeholder="#409EFF"
                      style="flex: 1; min-width: 100px; max-width: 230px;"
                      @input="onCustomColorChange"
                    />
                  </div>
                </el-form-item>
              </el-col>
              

            </el-row>
            
            <!-- 图标配置提示 -->
            <div style="margin-top: 16px; padding: 12px; background-color: #fdf6ec; border: 1px solid #f5dab1; border-radius: 4px;">
              <el-text size="small" type="warning">
                <i class="fas fa-info-circle"></i>
                注意：图标颜色配置仅在pc端查询页面生效，首页图标统一为白色
              </el-text>
            </div>
          </el-card>
          </el-form-item>
        </div>

        <!-- 项目特性配置 -->
        <div class="form-section">
          <div class="form-section-title">
            <el-icon><Tools /></el-icon>
            <span>项目特性</span>
          </div>
          
          <el-form-item label="项目特性" prop="features">
            <div class="features-config">
              <div class="features-input">
                <el-input
                  v-model="newFeature"
                  placeholder="输入特性标签，如：实时查询、权威数据、快速响应等"
                  size="default"
                  @keyup.enter="addFeature"
                >
                  <template #append>
                    <el-button @click="addFeature" :disabled="!newFeature.trim()">
                      <i class="fas fa-plus"></i> 添加
                    </el-button>
                  </template>
                </el-input>
              </div>
              <div class="features-list" v-if="formData.features.length > 0">
                <el-tag
                  v-for="(feature, index) in formData.features"
                  :key="index"
                  closable
                  @close="removeFeature(index)"
                  size="default"
                  class="feature-tag"
                >
                  {{ feature }}
                </el-tag>
              </div>
              <div class="features-help">
                <el-text size="small" type="info">
                  <i class="fas fa-info-circle"></i>
                  特性标签将在首页展示，建议使用简洁明了的词语，如：实时查询、权威数据、快速响应等
                </el-text>
              </div>
            </div>
          </el-form-item>
        </div>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitting">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 平台配置对话框 -->
    <PlatformConfigDialog
      v-model="platformConfigVisible"
      :query-item="selectedQueryItem"
      @save="handlePlatformConfigSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  Plus, 
  Document, 
  Edit, 
  Delete, 
  Setting,
  InfoFilled,
  Tools
} from '@element-plus/icons-vue';
import { formatAmount } from '../../utils';
import PlatformConfigDialog from '../../components/PlatformConfigDialog.vue';

// 查询项目列表
const queryItems = ref<any[]>([]);
const loading = ref(false);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

// 刷新状态
const refreshing = ref(false);
const isRefreshing = ref(false);

// API配置列表
const apiConfigs = ref<any[]>([]);

// 查询分类列表
const categories = ref<any[]>([]);

// 对话框相关
const dialogVisible = ref(false);
const dialogType = ref<'add' | 'edit'>('add');
const formRef = ref();
const submitting = ref(false);

// 平台配置对话框相关
const platformConfigVisible = ref(false);
const selectedQueryItem = ref<any>(null);

// 图标配置相关
const showIconGuide = ref(false);
const showAllIcons = ref(false);

// 特性配置相关
const newFeature = ref('');

// 图标选项
const iconOptions = ref([
  { label: '搜索', value: 'fas fa-search' },
  { label: '用户', value: 'fas fa-user' },
  { label: '企业', value: 'fas fa-building' },
  { label: '车辆', value: 'fas fa-car' },
  { label: '房屋', value: 'fas fa-home' },
  { label: '教育', value: 'fas fa-graduation-cap' },
  { label: '法律', value: 'fas fa-gavel' },
  { label: '电话', value: 'fas fa-phone' },
  { label: '邮件', value: 'fas fa-envelope' },
  { label: '证件', value: 'fas fa-id-card' },
  { label: '银行', value: 'fas fa-university' },
  { label: '医疗', value: 'fas fa-heartbeat' },
  { label: '工作', value: 'fas fa-briefcase' },
  { label: '位置', value: 'fas fa-map-marker-alt' },
  { label: '时间', value: 'fas fa-clock' },
  { label: '文档', value: 'fas fa-file-alt' }
]);

// 表单数据
const formData = reactive({
  id: '',
  name: '',
  type: 'person',
  category: '',
  price: 0,
  apiConfigId: '',
  queryParams: [] as any[],
  description: '',
  status: 'active',
  icon: 'fas fa-search',
  iconColor: '#409EFF',
  homepageVisible: {
    mobile: false,
    pc: false
  },
  features: [] as string[]
});

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入项目名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择查询分类', trigger: 'change' }
  ],
  price: [
    { required: true, message: '请输入价格', trigger: 'blur' }
  ],
  apiConfigId: [
    { required: true, message: '请选择关联API', trigger: 'change' }
  ]
};

// 获取查询项目列表
const fetchQueryItems = async () => {
  loading.value = true;
  
  try {
    // 从后端API获取查询项目列表
    const token = localStorage.getItem('token');
    const res = await fetch('/api/queries/items', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await res.json();
    
    if (data && data.code === 200 && data.data) {
      // 处理从API获取的数据
      queryItems.value = data.data.map((item: any) => {
        // 确保每个项目都有platforms属性
        if (!item.platforms) {
          item.platforms = {
            mobile: { enabled: true, order: item.id },
            pc: { enabled: true, order: item.id }
          };
        } else if (typeof item.platforms === 'string') {
          try {
            item.platforms = JSON.parse(item.platforms);
          } catch (e) {
            console.error('解析platforms失败:', e);
            item.platforms = {
              mobile: { enabled: true, order: item.id },
              pc: { enabled: true, order: item.id }
            };
          }
        }
        
        // 解析查询参数
        try {
          // 优先使用 params_schema，然后是 paramsSchema
          const paramsData = item.params_schema || item.paramsSchema;
          if (paramsData && typeof paramsData === 'string') {
            item.queryParams = JSON.parse(paramsData);
            item.paramsSchema = item.queryParams; // 统一字段名
          } else if (paramsData) {
            item.queryParams = paramsData;
            item.paramsSchema = paramsData; // 统一字段名
          } else {
            item.queryParams = [];
            item.paramsSchema = [];
          }
        } catch (e) {
          console.error('解析查询参数失败:', e);
          item.queryParams = [];
          item.paramsSchema = [];
        }
        
        // 确保type字段存在
        if (!item.type) {
          item.type = item.category === '企业查询' ? 'company' : 'person';
        }
        
        // 确保status字段存在且默认为active
        if (!item.status) {
          item.status = item.is_active ? 'active' : 'inactive';
        }
        
        // 解析特性字段
        try {
          if (item.features && typeof item.features === 'string') {
            item.features = JSON.parse(item.features);
          } else if (!item.features) {
            item.features = [];
          }
        } catch (e) {
          console.error('解析特性失败:', e);
          item.features = [];
        }
        
        console.log('处理后的项目:', item);
        return item;
      });
      
      total.value = queryItems.value.length;
      console.log('从API获取的查询项目列表:', queryItems.value);
    } else {
      console.warn('API返回数据格式不正确:', data);
      ElMessage.warning('获取查询项目列表失败，请稍后再试');
      queryItems.value = [];
    }
  } catch (error) {
    console.error('获取查询项目列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 获取API配置列表
const fetchApiConfigs = async () => {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/admin/api-configs', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await res.json();
    
    if (data && data.code === 200 && Array.isArray(data.data)) {
      apiConfigs.value = data.data;
      console.log('从API获取的API配置列表:', apiConfigs.value);
    } else {
      console.warn('API返回数据格式不正确:', data);
      apiConfigs.value = [];
    }
  } catch (error) {
    console.error('获取API配置列表失败:', error);
    apiConfigs.value = [];
  }
};

// 获取查询分类列表
const fetchCategories = async () => {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/queries/categories', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await res.json();
    
    if (data && data.code === 200 && Array.isArray(data.data)) {
      categories.value = data.data;
    } else {
      console.warn('API返回数据格式不正确:', data);
      // 使用默认分类
      categories.value = [
        { id: 'person', name: '个人查询', description: '个人相关信息查询服务' },
        { id: 'company', name: '企业查询', description: '企业相关信息查询服务' },
        { id: 'vehicle', name: '车辆查询', description: '车辆相关信息查询服务' },
        { id: 'property', name: '房产查询', description: '房产相关信息查询服务' },
        { id: 'education', name: '教育查询', description: '学历学籍相关信息查询服务' },
        { id: 'communication', name: '通讯查询', description: '通讯相关信息查询服务' }
      ];
    }
  } catch (error) {
    console.error('获取查询分类失败:', error);
    // 使用默认分类
    categories.value = [
      { id: 'person', name: '个人查询', description: '个人相关信息查询服务' },
      { id: 'company', name: '企业查询', description: '企业相关信息查询服务' },
      { id: 'vehicle', name: '车辆查询', description: '车辆相关信息查询服务' },
      { id: 'property', name: '房产查询', description: '房产相关信息查询服务' },
      { id: 'education', name: '教育查询', description: '学历学籍相关信息查询服务' },
      { id: 'communication', name: '通讯查询', description: '通讯相关信息查询服务' }
    ];
  }
};

// 获取API配置名称
const getApiConfigName = (id: string | number, row?: any) => {
  // 如果行数据中有api_config_name，直接使用
  if (row && row.api_config_name) {
    return row.api_config_name;
  }
  
  // 否则从apiConfigs列表中查找
  if (!id) return '';
  const api = apiConfigs.value.find(item => item.id == id); // 使用==进行类型转换比较
  return api ? api.name : '';
};

// 获取分类名称
const getCategoryName = (categoryId: string) => {
  if (!categoryId) return '';
  const category = categories.value.find(item => item.id === categoryId);
  return category ? category.name : categoryId;
};

// 添加查询项目
const handleAddItem = () => {
  dialogType.value = 'add';
  resetForm();
  dialogVisible.value = true;
};

// 编辑查询项目
const handleEdit = (row: any) => {
  dialogType.value = 'edit';
  resetForm();
  
  console.log('编辑行数据:', row);
  
  // 复制数据到表单
  Object.assign(formData, {
    id: row.id,
    name: row.name,
    type: row.type,
    category: row.category,
    price: parseFloat(row.price), // 直接使用原始价格值，不进行单位转换
    apiConfigId: row.api_config_id || row.apiConfigId, // 兼容两种字段名
    description: row.description,
    status: row.is_active ? 'active' : 'inactive',
    icon: row.icon || 'fas fa-search',
    iconColor: row.icon_color || row.iconColor || '#409EFF'
  });
  
  // 解析查询参数
  try {
    // 优先使用 params_schema，然后是 paramsSchema，最后是 queryParams
    const paramsData = row.params_schema || row.paramsSchema || row.queryParams;
    if (paramsData) {
      if (typeof paramsData === 'string') {
        formData.queryParams = JSON.parse(paramsData);
      } else {
        formData.queryParams = paramsData;
      }
    } else {
      formData.queryParams = [];
    }
  } catch (error) {
    console.error('解析查询参数失败:', error);
    formData.queryParams = [];
  }
  
  // 解析首页可见性配置
  try {
    if (row.homepage_visible) {
      if (typeof row.homepage_visible === 'string') {
        formData.homepageVisible = JSON.parse(row.homepage_visible);
      } else {
        formData.homepageVisible = row.homepage_visible;
      }
    } else {
      formData.homepageVisible = {
        mobile: false,
        pc: false
      };
    }
  } catch (error) {
    console.error('解析首页可见性配置失败:', error);
    formData.homepageVisible = {
      mobile: false,
      pc: false
    };
  }
  
  // 解析特性配置
  try {
    if (row.features) {
      if (typeof row.features === 'string') {
        formData.features = JSON.parse(row.features);
      } else if (Array.isArray(row.features)) {
        formData.features = row.features;
      } else {
        formData.features = [];
      }
    } else {
      formData.features = [];
    }
  } catch (error) {
    console.error('解析特性配置失败:', error);
    formData.features = [];
  }
  
  console.log('编辑表单数据:', formData);
  
  dialogVisible.value = true;
};

// 删除查询项目
const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定要删除查询项目"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // 调用删除查询项目的API
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/queries/items/${row.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await res.json();
      
      if (data.code === 200) {
        ElMessage.success('删除成功');
        // 重新获取查询项目列表，确保数据同步
        await fetchQueryItems();
      } else {
        ElMessage.error(data.message || '删除失败');
      }
    } catch (error) {
      console.error('删除查询项目失败:', error);
      ElMessage.error('删除失败，请检查网络连接');
    }
  }).catch(() => {
    // 取消删除
  });
};

// 修改查询项目状态
const handleStatusChange = async (row: any) => {
  const originalStatus = row.status;
  try {
    // 调用后端API更新查询项目状态
    const response = await fetch(`/api/queries/items/${row.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        status: row.status
      })
    });
    
    const data = await response.json();
    
    if (data.code === 200) {
      ElMessage.success(`${row.status === 'active' ? '启用' : '禁用'}成功`);
      // 重新获取查询项目列表以确保数据同步
      await fetchQueryItems();
    } else {
      // 恢复原状态
      row.status = originalStatus;
      ElMessage.error(data.message || '状态更新失败');
    }
  } catch (error) {
    console.error('修改查询项目状态失败:', error);
    // 恢复原状态
    row.status = originalStatus;
    ElMessage.error('状态更新失败，请检查网络连接');
  }
};

// 获取平台可见性状态
const getPlatformEnabled = (row: any, platform: 'mobile' | 'pc') => {
  if (!row.platforms) {
    return true;
  }
  
  if (!row.platforms[platform]) {
    return true;
  }
  
  return row.platforms[platform].enabled;
};

// 获取首页可见性状态
const getHomepageEnabled = (row: any, platform: 'mobile' | 'pc') => {
  if (!row.homepage_visible) return false;
  
  if (typeof row.homepage_visible === 'string') {
    try {
      const homepageVisible = JSON.parse(row.homepage_visible);
      return homepageVisible[platform] || false;
    } catch (e) {
      console.error('解析homepage_visible失败:', e);
      return false;
    }
  }
  
  return row.homepage_visible[platform] || false;
};

// 处理首页可见性变更
const handleHomepageVisibilityChange = async (row: any, platform: 'mobile' | 'pc', enabled: boolean) => {
  try {
    // 确保homepage_visible对象存在并正确解析
    let homepageVisible = {
      mobile: false,
      pc: false
    };
    
    if (row.homepage_visible) {
      if (typeof row.homepage_visible === 'string') {
        try {
          homepageVisible = JSON.parse(row.homepage_visible);
        } catch (e) {
          console.error('解析homepage_visible失败:', e);
        }
      } else if (typeof row.homepage_visible === 'object') {
        homepageVisible = { ...row.homepage_visible };
      }
    }
    
    // 更新首页可见性
    homepageVisible[platform] = enabled;
    
    // 调用API更新首页可见性
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/queries/items/${row.id}/homepage-visible`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        platform,
        enabled,
        homepage_visible: homepageVisible
      })
    });
    
    const data = await res.json();
    
    if (data && data.code === 200) {
      // 更新本地数据
      row.homepage_visible = homepageVisible;
      ElMessage.success(`${platform === 'mobile' ? '移动端' : 'PC端'}首页显示设置成功`);
      
      // 刷新查询项目列表，确保数据同步
      await fetchQueryItems();
    } else {
      console.warn('API返回数据格式不正确:', data);
      ElMessage.warning(`${platform === 'mobile' ? '移动端' : 'PC端'}首页显示设置失败，请稍后再试`);
    }
  } catch (error) {
    console.error('修改首页可见性失败:', error);
    ElMessage.error(`${platform === 'mobile' ? '移动端' : 'PC端'}首页显示设置失败`);
  }
};

// 处理平台可见性变更
const handlePlatformVisibilityChange = async (row: any, platform: 'mobile' | 'pc', enabled: boolean) => {
  try {
    // 确保platforms对象存在
    if (!row.platforms) {
      row.platforms = {
        mobile: { enabled: true, order: row.id },
        pc: { enabled: true, order: row.id }
      };
    }
    
    // 确保platform对象存在
    if (!row.platforms[platform]) {
      row.platforms[platform] = { enabled: true, order: row.id };
    }
    
    // 更新平台可见性
    row.platforms[platform].enabled = enabled;
    
    // 调用API更新平台可见性
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/queries/items/${row.id}/platforms`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        platform,
        enabled,
        platforms: row.platforms
      })
    });
    
    const data = await res.json();
    
    if (data && data.code === 200) {
      ElMessage.success(`${platform === 'mobile' ? '移动端' : 'PC端'}可见性设置成功`);
      
      // 刷新查询项目列表，确保数据同步
      await fetchQueryItems();
    } else {
      console.warn('API返回数据格式不正确:', data);
      ElMessage.warning(`${platform === 'mobile' ? '移动端' : 'PC端'}可见性设置失败，请稍后再试`);
      // 恢复原状态
      row.platforms[platform].enabled = !enabled;
    }
  } catch (error) {
    console.error('修改平台可见性失败:', error);
    // 恢复原状态
    row.platforms[platform].enabled = !enabled;
    ElMessage.error(`${platform === 'mobile' ? '移动端' : 'PC端'}可见性设置失败`);
  }
};

// 处理平台配置
const handlePlatformConfig = (row: any) => {
  selectedQueryItem.value = row;
  platformConfigVisible.value = true;
};

// 保存平台配置
const handlePlatformConfigSave = async (config: any) => {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/queries/items/${config.queryItemId}/platform-config`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        platforms: config.platforms
      })
    });
    
    const data = await res.json();
    
    if (data && data.code === 200) {
      ElMessage.success('平台配置保存成功');
      // 刷新查询项目列表
      await fetchQueryItems();
    } else {
      console.warn('API返回数据格式不正确:', data);
      ElMessage.warning('平台配置保存失败，请稍后再试');
    }
  } catch (error) {
    console.error('保存平台配置失败:', error);
    ElMessage.error('保存失败，请检查网络连接');
  }
};

// 添加参数
const addParam = () => {
  formData.queryParams.push({
    name: '',
    label: '',
    type: 'text',
    required: false,
    placeholder: '',
    options: ''
  });
};

// 移除参数
const removeParam = (index: number) => {
  formData.queryParams.splice(index, 1);
};

// 特性管理方法
const addFeature = () => {
  const feature = newFeature.value.trim();
  if (feature && !formData.features.includes(feature)) {
    formData.features.push(feature);
    newFeature.value = '';
  } else if (formData.features.includes(feature)) {
    ElMessage.warning('该特性已存在');
  }
};

const removeFeature = (index: number) => {
  formData.features.splice(index, 1);
};

// 图标相关方法
const selectIcon = (iconValue: string) => {
  formData.icon = iconValue;
  updateIconPreview();
};

const updateIconPreview = () => {
  // 触发响应式更新，用于实时预览图标效果
  console.log('图标预览更新:', {
    icon: formData.icon,
    iconColor: formData.iconColor
  });
};



// 自定义颜色变更事件
const onCustomColorChange = () => {
  // 自定义颜色只影响图标本身的颜色，不影响容器背景
  updateIconPreview();
};

// 获取图标容器样式
const getIconContainerStyle = () => {
  const style: any = {
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f5f7fa', // 浅灰色背景，让图标颜色更突出
    border: '1px solid #e4e7ed'
  };
  
  return style;
};

// 获取图标样式
const getIconStyle = () => {
  const style: any = {};
  
  // 应用用户设置的图标颜色，如果没有设置则使用默认颜色
  if (formData.iconColor && formData.iconColor.trim() !== '') {
    style.color = formData.iconColor;
  } else {
    style.color = '#409EFF'; // 默认主题色
  }
  
  return style;
};

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    id: '',
    name: '',
    type: 'person',
    price: 0,
    apiConfigId: '',
    queryParams: [],
    description: '',
    status: 'active',
    icon: 'fas fa-search',
    iconColor: '#409EFF', // 默认主题色
    homepageVisible: {
      mobile: false,
      pc: false
    },
    features: []
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
        // 保持价格为元单位（不转换为分）
        const data = {
          ...formData,
          price: parseFloat(formData.price.toString()),
          // 确保查询参数是字符串格式
          paramsSchema: JSON.stringify(formData.queryParams),
          // 确保apiConfigId是数字
          apiConfigId: formData.apiConfigId ? Number(formData.apiConfigId) : null,
          // 确保首页可见性是字符串格式
          homepageVisible: JSON.stringify(formData.homepageVisible),
          // 确保特性是字符串格式
          features: JSON.stringify(formData.features)
        };
        
        console.log('提交的数据:', data);
        
        if (dialogType.value === 'add') {
          // 调用添加查询项目的API
          const token = localStorage.getItem('token');
          const res = await fetch('/api/queries/items', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
          });
          
          const responseData = await res.json();
          
          if (responseData && responseData.code === 200) {
            ElMessage.success('添加成功');
            // 刷新查询项目列表
            await fetchQueryItems();
          } else {
            console.warn('API返回数据格式不正确:', responseData);
            ElMessage.warning('添加失败，请稍后再试');
          }
        } else {
          // 调用更新查询项目的API
          const token = localStorage.getItem('token');
          const res = await fetch(`/api/queries/items/${formData.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
          });
          
          const responseData = await res.json();
          
          if (responseData && responseData.code === 200) {
            ElMessage.success('更新成功');
            // 刷新查询项目列表
            await fetchQueryItems();
            
            // 确保列表已经更新
            console.log('更新后的查询项目列表:', queryItems.value);
          } else {
            console.warn('API返回数据格式不正确:', responseData);
            ElMessage.warning('更新失败，请稍后再试');
          }
        }
        
        dialogVisible.value = false;
      } catch (error) {
        console.error('提交查询项目失败:', error);
        ElMessage.error('操作失败，请检查网络连接');
      } finally {
        submitting.value = false;
      }
    }
  });
};

// 分页相关
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  fetchQueryItems();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  fetchQueryItems();
};

// 刷新数据
const refreshData = async () => {
  if (refreshing.value) return;
  
  refreshing.value = true;
  isRefreshing.value = true;
  
  try {
    // 触发顶部进度条
    window.dispatchEvent(new CustomEvent('startProgress'));
    
    await Promise.all([
      fetchQueryItems(),
      fetchApiConfigs(),
      fetchCategories()
    ]);
    
    ElMessage.success('数据刷新成功');
  } catch (error) {
    console.error('刷新数据失败:', error);
    ElMessage.error('刷新数据失败，请稍后再试');
  } finally {
    // 停止顶部进度条
    window.dispatchEvent(new CustomEvent('stopProgress'));
    
    refreshing.value = false;
    
    // 延迟重置刷新状态，保持动画效果
    setTimeout(() => {
      isRefreshing.value = false;
    }, 300);
  }
};

onMounted(() => {
  fetchQueryItems();
  fetchApiConfigs();
  fetchCategories();
  
  // 监听刷新事件
  window.addEventListener('refreshQueryItems', refreshData);
});

onUnmounted(() => {
  // 移除事件监听器
  window.removeEventListener('refreshQueryItems', refreshData);
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

.item-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-icon {
  font-size: 16px;
  color: #3b82f6;
}

.price-text {
  font-weight: 600;
  color: #059669;
}

.platform-visibility {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
}

.platform-switch {
  margin: 0;
}

.platform-switch.mobile {
  --el-switch-on-color: #67c23a;
}

.platform-switch.pc {
  --el-switch-on-color: #409eff;
}

/* 首页可见性样式 */
.homepage-visibility {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
}

.homepage-switch {
  margin: 0;
}

.homepage-switch.mobile {
  --el-switch-on-color: #e6a23c;
}

.homepage-switch.pc {
  --el-switch-on-color: #f56c6c;
}

/* 首页配置样式 */
.homepage-config {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.config-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background: #fafbfc;
  transition: all 0.3s ease;
}

.config-item:hover {
  border-color: #c6d1f0;
  background: #f8faff;
}

.config-desc {
  font-size: 12px;
  color: #909399;
  margin-left: auto;
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

/* 表单相关样式 */
.params-list {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  background-color: #f8fafc;
}

.param-item {
  margin-bottom: 16px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background-color: white;
  transition: all 0.3s ease;
}

.param-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
}

.param-item:last-child {
  margin-bottom: 0;
}

.add-param {
  text-align: center;
  margin-top: 16px;
}

.icon-config-card {
  margin-top: 12px;
  border-radius: 8px;
}

.icon-config-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.icon-preview {
  display: flex;
  align-items: center;
  gap: 12px;
}

.service-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 2px solid #e2e8f0;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
}



.icon-preview .service-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
  margin-left: 10px;
  transition: all 0.3s ease;
}





/* 图标颜色现在通过内联样式设置，不再需要这些CSS类 */

.icon-guide {
  margin-top: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background: #f8f9fa;
  overflow: hidden;
}

.guide-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #409eff;
  color: white;
  margin: 0;
}

.guide-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.guide-content {
  padding: 16px;
  font-size: 13px;
  line-height: 1.6;
}

.guide-content p {
  margin: 0 0 12px 0;
}

.guide-content ul {
  margin: 8px 0 16px 20px;
  padding: 0;
}

.guide-content li {
  margin-bottom: 6px;
}

.guide-content a {
  color: #409eff;
  text-decoration: none;
}

.guide-content a:hover {
  text-decoration: underline;
}

.example-icons {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px;
  margin: 8px 0;
}

.example-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  font-size: 12px;
}

.example-item:last-child {
  margin-bottom: 0;
}

.example-item code {
  background: #f1f2f3;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  min-width: 120px;
  display: inline-block;
}

.example-item i {
  width: 16px;
  text-align: center;
  color: #409eff;
}

.icon-suggestions {
  margin-top: 15px;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}

.suggestions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 13px;
  color: #606266;
}

.icon-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
  max-height: 120px;
  overflow: hidden;
  transition: max-height 0.3s ease;
  width: 100%;
  box-sizing: border-box;
  align-content: flex-start;
}

.icon-grid.show-all {
  max-height: none;
}

.icon-suggestion-btn {
  flex: 0 0 25%;
  padding: 6px 8px;
  font-size: 11px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: flex-start;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  box-sizing: border-box;
  height: 32px;
  line-height: 1.2;
  margin: 0 4px 6px 0;
}

.icon-suggestion-btn:nth-child(4n) {
  margin-right: 0;
}

.icon-suggestion-btn i {
  flex-shrink: 0;
  width: 14px;
  text-align: center;
  font-size: 12px;
}

/* 修复下拉框箭头错位问题 */
.el-select {
  width: 100%;
}

.el-select .el-input__wrapper {
  display: flex;
  align-items: center;
}

.el-select .el-input__suffix {
  display: flex;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* 表单分组样式 */
.form-section {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  background: #fafbfc;
  transition: all 0.3s ease;
}

.form-section:hover {
  border-color: #c6d1f0;
  background: #f8faff;
}

.form-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e4e7ed;
}

.form-section-title .el-icon {
  color: #409eff;
  font-size: 16px;
}

.form-section .el-form-item {
  margin-bottom: 16px;
}

/* 特性配置样式 */
.features-config {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.features-input {
  width: 100%;
}

.features-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background: #fafbfc;
  min-height: 50px;
  align-items: flex-start;
  align-content: flex-start;
}

.feature-tag {
  margin: 0;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  background: #409eff;
  color: white;
  border: 1px solid #409eff;
  transition: all 0.3s ease;
}

.feature-tag:hover {
  background: #66b1ff;
  border-color: #66b1ff;
  transform: translateY(-1px);
}

.features-help {
  padding: 8px 12px;
  background: #f0f9ff;
  border: 1px solid #bfdbfe;
  border-radius: 4px;
  font-size: 12px;
  color: #1e40af;
}

.features-help .fas {
  margin-right: 4px;
  color: #3b82f6;
}

/* 查询项目对话框样式 */
.query-item-dialog {
  border-radius: 12px;
}

.query-item-dialog .el-dialog__header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e4e7ed;
}

.query-item-dialog .el-dialog__body {
  padding: 24px;
  max-height: 70vh;
  overflow-y: auto;
}

/* 紧凑表单样式 */
.compact-form .el-form-item__label {
  font-size: 13px;
  font-weight: 500;
  color: #606266;
}

.compact-form .el-input__wrapper {
  font-size: 13px;
}

.compact-form .el-select .el-input__wrapper {
  font-size: 13px;
}

.compact-form .el-input-number {
  width: 100%;
}

.compact-form .el-input-number .el-input__wrapper {
  font-size: 13px;
}

.compact-form .el-textarea__inner {
  font-size: 13px;
}

/* 参数列表样式 */
.params-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 12px;
  background: white;
}

.param-item {
  padding: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  margin-bottom: 12px;
  background: #fafbfc;
}

.param-item:last-child {
  margin-bottom: 0;
}

.add-param {
  text-align: center;
  padding: 12px;
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

.admin-page.refreshing .content-card {
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

<!-- 全局样式 - 覆盖后台管理弹框位置 -->
<style>
.admin-edit-dialog.el-dialog {
  margin-top: 8vh !important;
}

.el-overlay .admin-edit-dialog.el-dialog {
  margin-top: 8vh !important;
}

body .el-overlay .admin-edit-dialog.el-dialog {
  margin-top: 8vh !important;
}
</style>