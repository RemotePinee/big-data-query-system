<template>
  <div class="mobile-home">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="decoration-circle circle-1"></div>
      <div class="decoration-circle circle-2"></div>
      <div class="decoration-blob blob-1"></div>
      <div class="decoration-blob blob-2"></div>
    </div>

    <!-- 英雄展示区域 -->
    <div class="hero-section">
      <div class="hero-image-container">
        <img src="@/assets/images/zhanshi.png" alt="展示图片" class="hero-image" />
      </div>
    </div>

    <!-- SVG Mask Definition -->
    <svg width="0" height="0" style="position: absolute;">
      <defs>
        <mask id="rounded-corners-mask" maskUnits="objectBoundingBox" maskContentUnits="objectBoundingBox">
          <path d="M 0.06 0.08 L 0.94 0.04 Q 1 0.04 1 0.1 L 1 1 L 0 1 L 0 0.14 Q 0 0.08 0.06 0.08 Z" fill="white"/>
        </mask>
      </defs>
    </svg>
    
    <!-- 查询项目展示区域 -->
    <div class="query-container">
      <div class="query-section" v-loading="loading">
        <!-- 查询服务瀑布流 -->
        <div class="waterfall-grid" v-if="queryItems.length > 0">
          <div 
            class="waterfall-card"
            v-for="(item, index) in queryItems"
            :key="item.id"
            @click="selectQueryItem(item)"
          >
            <div class="card-icon">
              <i :class="item.icon || getItemIcon(item.name)" :style="{ color: '#ffffff' }"></i>
            </div>
            <div class="card-content">
              <h3 class="card-title">{{ item.name }}</h3>
              <p class="card-description" v-if="item.description">{{ item.description }}</p>
               <div class="card-price">¥{{ formatPrice(item.price) }}</div>
               <div class="card-category" v-if="item.categoryName">{{ item.categoryName }}</div>
              <div class="card-features" v-if="item.features && item.features.length > 0">
                <span class="feature-tag" v-for="feature in item.features.slice(0, 2)" :key="feature">{{ feature }}</span>
              </div>
            </div>
            <div class="card-action">
              <span class="action-text">立即查询</span>
            </div>
          </div>
        </div>
      </div>
    </div>



    <!-- 查询表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="selectedItem?.name"
      width="90%"
      class="mobile-query-dialog"
    >
      <div class="query-form-container" v-if="selectedItem">
        <div class="query-item-detail">
          <div class="item-description">{{ selectedItem.description }}</div>
          <div class="item-price-section">
            <span class="price-label">查询费用</span>
            <span class="price-value">¥{{ formatPrice(selectedItem.price || 0) }}</span>
          </div>
        </div>
        
        <el-form ref="queryForm" :model="queryParams" :rules="queryRules" label-position="top" class="mobile-query-form">
          <el-form-item 
            v-for="field in selectedItem.fields" 
            :key="field.name" 
            :label="field.label" 
            :prop="field.name"
          >
            <el-input 
              v-if="field.type === 'text' || field.type === 'idcard' || field.type === 'phone' || field.type === 'number'"
              v-model="queryParams[field.name]" 
              :placeholder="field.placeholder"
              :type="field.type === 'number' ? 'number' : 'text'"
              class="mobile-query-input"
            />
            <el-select 
              v-else-if="field.type === 'select'" 
              v-model="queryParams[field.name]" 
              :placeholder="field.placeholder"
              style="width: 100%"
              class="mobile-query-select"
            >
              <el-option 
                v-for="option in getSelectOptions(field.options)" 
                :key="option" 
                :label="option" 
                :value="option"
              />
            </el-select>
            <el-date-picker 
              v-else-if="field.type === 'date'" 
              v-model="queryParams[field.name]" 
              type="date" 
              :placeholder="field.placeholder"
              style="width: 100%"
              class="mobile-query-date-picker"
            />
          </el-form-item>
        </el-form>
        
        <div class="query-agreement">
          <el-checkbox v-model="agreement">
            我已阅读并同意
            <span 
              class="agreement-link"
              @click="showAgreement"
              :class="{ disabled: !systemSettings.queryServiceAgreement }"
            >
              《查询服务协议》
            </span>
          </el-checkbox>
        </div>
      </div>
      
      <template #footer>
        <div class="mobile-query-footer">
          <el-button @click="dialogVisible = false" class="mobile-query-btn mobile-query-btn-cancel">取消</el-button>
          <el-button type="primary" :loading="queryLoading" @click="handleSubmitQuery" class="mobile-query-btn mobile-query-btn-submit">
            提交查询
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 查询服务协议弹窗 -->
    <AgreementDialog
      v-model="queryAgreementDialogVisible"
      :content="systemSettings.queryServiceAgreement"
      title="查询服务协议"
    />

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useSystemSettingsStore } from '@/stores/systemSettings'
import { ElMessage } from 'element-plus'
import AgreementDialog from '@/components/AgreementDialog.vue'

const router = useRouter()
const userStore = useUserStore()
const systemSettingsStore = useSystemSettingsStore()

// 计算属性 - 系统设置
const systemSettings = computed(() => systemSettingsStore.settings)

// 初始化用户状态
userStore.initUserState()

// 查询项目数据
const queryItems = ref([])
const loading = ref(false)

// 选中的查询项目和表单相关
const selectedItem = ref(null)
const dialogVisible = ref(false)
const queryParams = reactive({})
const queryRules = ref({})
const agreement = ref(false)
const queryLoading = ref(false)
const queryForm = ref(null)

// 协议弹窗相关
const queryAgreementDialogVisible = ref(false)

// 统计数据
const totalQueries = computed(() => {
  return queryItems.value.length
})
const todayQueries = ref(0)

// 选择查询项目
const selectQueryItem = (item) => {
  selectedItem.value = item
  
  // 重置查询参数和验证规则
  Object.keys(queryParams).forEach(key => {
    delete queryParams[key]
  })
  queryRules.value = {}
  
  // 根据字段生成验证规则
  if (item.fields && item.fields.length > 0) {
    item.fields.forEach(field => {
      // 初始化参数
      queryParams[field.name] = ''
      
      // 设置验证规则
      const rules = []
      
      if (field.required) {
        rules.push({ required: true, message: `请输入${field.label}`, trigger: 'blur' })
      }
      
      if (field.type === 'idcard') {
        rules.push({ 
          pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, 
          message: '请输入正确的身份证号码', 
          trigger: 'blur' 
        })
      } else if (field.type === 'phone') {
        rules.push({ 
          pattern: /^1[3-9]\d{9}$/, 
          message: '请输入正确的手机号码', 
          trigger: 'blur' 
        })
      }
      
      if (rules.length > 0) {
        queryRules.value[field.name] = rules
      }
    })
  }
  
  agreement.value = false
  dialogVisible.value = true
}

// 处理选择框选项
const getSelectOptions = (options) => {
  if (!options) return []
  if (typeof options === 'string') {
    return options.split(',').map(opt => opt.trim())
  }
  if (Array.isArray(options)) {
    return options
  }
  return []
}

// 提交查询
const handleSubmitQuery = async () => {
  if (!agreement.value) {
    ElMessage.warning('请先阅读并同意查询服务协议')
    return
  }
  
  if (!queryForm.value) return
  
  try {
    await queryForm.value.validate()
    
    queryLoading.value = true
    
    // 创建查询订单
    const token = localStorage.getItem('token')
    const res = await fetch('/api/queries/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify({
        queryItemId: selectedItem.value.id,
        params: queryParams
      })
    })
    
    const data = await res.json()
    
    if (data && (data.code === 200 || data.code === 201) && data.data) {
      dialogVisible.value = false
      ElMessage.success(`查询订单已创建，订单金额：¥${formatPrice(data.data.amount || 0)}`)
      
      // 跳转到支付页面
      router.push({
        path: `/mobile/payment/${data.data.orderNo}`,
        query: {
          queryItemName: data.data.queryItemName || '查询服务',
          amount: data.data.amount || 0,
          createdAt: new Date().toISOString()
        }
      })
    } else {
      ElMessage.error(data?.message || '创建订单失败')
    }
  } catch (error) {
    console.error('提交查询失败:', error)
    ElMessage.error('提交查询失败，请重试')
  } finally {
    queryLoading.value = false
  }
}

// 格式化价格
const formatPrice = (price) => {
  return parseFloat(price || 0).toFixed(2)
}

// 显示协议
const showAgreement = () => {
  queryAgreementDialogVisible.value = true
}

// 获取项目图标
const getItemIcon = (name) => {
  const iconMap = {
    '身份': 'fas fa-id-card',
    '征信': 'fas fa-chart-line',
    '学历': 'fas fa-graduation-cap',
    '企业': 'fas fa-building',
    '车辆': 'fas fa-car',
    '房产': 'fas fa-home',
    '工商': 'fas fa-briefcase',
    '法院': 'fas fa-gavel',
    '银行': 'fas fa-university'
  }
  
  for (const [key, icon] of Object.entries(iconMap)) {
    if (name.includes(key)) {
      return icon
    }
  }
  
  return 'fas fa-file-alt'
}

// 分类数据
const categories = ref([])

// 获取查询分类
const fetchCategories = async () => {
  try {
    const res = await fetch('/api/queries/categories', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    
    const data = await res.json()
    
    if (data && data.code === 200 && Array.isArray(data.data)) {
      categories.value = data.data
    } else {
      // 使用默认分类
      categories.value = [
        { id: 'person', name: '个人查询' },
        { id: 'company', name: '企业查询' },
        { id: 'vehicle', name: '车辆查询' },
        { id: 'property', name: '房产查询' },
        { id: 'education', name: '教育查询' },
        { id: 'communication', name: '通讯查询' }
      ]
    }
  } catch (error) {
    console.error('获取查询分类失败:', error)
    // 使用默认分类
    categories.value = [
      { id: 'person', name: '个人查询' },
      { id: 'company', name: '企业查询' },
      { id: 'vehicle', name: '车辆查询' },
      { id: 'property', name: '房产查询' },
      { id: 'education', name: '教育查询' },
      { id: 'communication', name: '通讯查询' }
    ]
  }
}

// 获取分类名称
const getCategoryName = (categoryId) => {
  if (!categoryId) return '其他'
  
  // 从分类列表中查找对应的分类名称
  const category = categories.value.find(cat => cat.id === categoryId)
  if (category) {
    return category.name
  }
  
  // 如果是中文分类名称，直接返回
  if (categoryId && typeof categoryId === 'string' && /[\u4e00-\u9fa5]/.test(categoryId)) {
    return categoryId
  }
  
  // 兜底映射（兼容旧数据）
  const categoryMap = {
    'identity': '身份信息',
    'credit': '征信查询',
    'education': '学历验证',
    'enterprise': '企业信息',
    'vehicle': '车辆信息',
    'property': '房产信息',
    'business': '工商信息',
    'court': '司法信息',
    'bank': '银行信息',
    'telecom': '通信信息',
    'social': '社保信息',
    'tax': '税务信息'
  }
  
  return categoryMap[categoryId] || categoryId || '其他'
}

// 获取查询项目数据
const fetchQueryItems = async () => {
  try {
    const res = await fetch('/api/queries/items', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    const data = await res.json()
    
    if (data && data.code === 200 && Array.isArray(data.data)) {
      // 过滤移动端可见的项目
      const mobileVisibleItems = data.data.filter(item => {
        if (item.platforms) {
          try {
            const platforms = typeof item.platforms === 'string' 
              ? JSON.parse(item.platforms) 
              : item.platforms
            
            const mobileConfig = platforms.mobile || {}
            return mobileConfig.enabled !== false && mobileConfig.showOnHomepage !== false
          } catch (e) {
            console.error('解析平台可见性设置失败:', e)
            return true
          }
        }
        return true
      })
      
      // 使用移动端价格配置
      queryItems.value = mobileVisibleItems.map(item => {
        let platformConfig = {}
        try {
          if (item.platforms) {
            const platforms = typeof item.platforms === 'string' 
              ? JSON.parse(item.platforms) 
              : item.platforms
            platformConfig = platforms.mobile || {}
          }
        } catch (e) {
          console.error('解析平台配置失败:', e)
        }
        
        return {
          id: item.id,
          name: platformConfig.displayName || item.name,
          description: platformConfig.description || item.description,
          price: platformConfig.customPrice || item.price || 0,
          originalPrice: platformConfig.originalPrice || item.originalPrice || null,
          categoryId: item.category || 'all',
          categoryName: getCategoryName(item.category), // 使用分类映射函数获取分类名称
          features: (() => {
            try {
              if (!item.features) return [];
              
              let parsed = item.features;
              
              // 处理字符串类型的features
              if (typeof parsed === 'string') {
                try {
                  parsed = JSON.parse(parsed);
                } catch (e) {
                  console.warn('第一次JSON解析失败:', e);
                  return [];
                }
              }
              
              // 如果解析后还是字符串，再次解析（处理双重编码）
              if (typeof parsed === 'string') {
                try {
                  parsed = JSON.parse(parsed);
                } catch (e) {
                  console.warn('第二次JSON解析失败:', e);
                  return [];
                }
              }
              
              // 确保返回数组
              if (Array.isArray(parsed)) {
                return parsed;
              } else if (parsed && typeof parsed === 'object') {
                // 如果是对象，尝试提取数组值
                return Object.values(parsed).filter(v => typeof v === 'string');
              }
              
              return [];
            } catch (error) {
              console.error('解析项目特性失败:', error, item.features);
              return [];
            }
          })(),
          fields: (() => {
            try {
              if (!item.params_schema) return []
              return typeof item.params_schema === 'string' 
                ? JSON.parse(item.params_schema) 
                : item.params_schema
            } catch (e) {
              console.error('解析查询参数失败:', e)
              return []
            }
          })(),
          icon: item.icon || platformConfig.iconClass || getItemIcon(item.name),
          iconColor: '#ffffff',
          iconSize: platformConfig.iconSize || item.icon_size || 'medium',
          status: item.status || 'active',
          estimatedTime: '即时查询',
          processingTime: item.processingTime
        }
      })
    } else {
      queryItems.value = []
    }
  } catch (error) {
    console.error('获取查询项目失败:', error)
    queryItems.value = []
  }
}

// 获取今日查询统计
const fetchTodayStats = async () => {
  try {
    // 模拟今日查询数据
    todayQueries.value = Math.floor(Math.random() * 100) + 50
  } catch (error) {
    console.error('获取今日统计失败:', error)
    todayQueries.value = 0
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await systemSettingsStore.fetchSettings() // 初始化系统设置
    await fetchCategories() // 先获取分类数据
    await fetchQueryItems() // 再获取查询项目数据
    await fetchTodayStats()
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* 移动端首页样式 */
.mobile-home {
  height: 100vh;
  height: 100dvh; /* 动态视口高度，解决地址栏问题 */
  background: linear-gradient(180deg, #fafbfc 0%, #f5f6f8 100%);
  position: relative;
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 背景装饰 */
.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -2;
  opacity: 0.6;
}

/* 英雄展示区域 */
.hero-section {
  position: relative;
  z-index: 0;
  margin-bottom: 0;
  padding: 0;
}

.hero-image-container {
  width: 100%;
  height: 300px;
  overflow: hidden;
  background: linear-gradient(135deg, #f8f9fb 0%, #e9ecef 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}



/* 查询容器 */
.query-container {
    flex: 1;
    background: #ffffff;
    position: relative;
    margin-top: -80px;
    padding: 50px 0 20px;
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    z-index: 100;
    mask: url(#rounded-corners-mask);
    -webkit-mask: url(#rounded-corners-mask);
    box-shadow: 0 -8px 25px rgba(0, 0, 0, 0.1);
  }
  


.query-container::-webkit-scrollbar {
  display: none;
}

/* 查询项目展示区域 */
.query-section {
  position: relative;
  z-index: 1;
}

.section-header {
  text-align: center;
  margin-bottom: 24px;
  padding: 0 12px;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0 0 8px 0;
}

.section-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;
  font-weight: 400;
}

/* 瀑布流网格布局 - 使用flexbox实现更好的分布 */
.waterfall-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 20px;
  margin-bottom: 10px;
  padding: 0 20px;
  justify-content: space-between;
}

/* 默认移动端布局：两列 */
.waterfall-card {
  width: calc(50% - 6px) !important;
  flex-shrink: 0;
}

/* 超小屏幕：单列 */
@media (max-width: 320px) {
  .waterfall-grid {
    flex-direction: column;
    gap: 8px;
  }
  
  .waterfall-card {
    width: 100% !important;
  }
}

/* 小屏幕：两列 */
@media (min-width: 321px) and (max-width: 479px) {
  .waterfall-grid {
    gap: 10px;
  }
  
  .waterfall-card {
    width: calc(50% - 5px) !important;
  }
}

/* 中等屏幕：三列 */
@media (min-width: 480px) {
  .waterfall-grid {
    gap: 16px;
  }
  
  .waterfall-card {
    width: calc(33.333% - 11px) !important;
  }
}

.waterfall-card {
  background: #f7f7f7;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgb(85 85 85 / 15%) !important;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  display: flex;
  flex-direction: column;
  box-shadow: none;
  text-align: center;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}

.waterfall-card:hover {
  transform: none;
  box-shadow: none;
}

.card-icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #424242 0%, #050505 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  margin: 0 auto 12px;

  transition: all 0.3s ease;
}

.waterfall-card:hover .card-icon {
  transform: none;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.card-content {
  margin-bottom: 12px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 6px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-description {
  font-size: 11px;
  color: #6b7280;
  margin: 0 0 8px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-category {
  font-size: 10px;
  color: white;
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  padding: 3px 8px;
  border-radius: 12px;
  font-weight: 500;
  margin-bottom: 8px;
  display: inline-block;
  border: none;
}

.card-price {
  font-size: 15px;
  font-weight: 700;
  color: #dc2626;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.card-features {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  justify-content: center;
}

.feature-tag {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 9px;
  margin-right: 3px;
  margin-bottom: 3px;
  border: none;
  font-weight: 500;
  transition: all 0.2s ease;
  letter-spacing: 0.3px;
}

.feature-tag:hover {
  transform: scale(1.05);
}

.feature-tag:nth-child(1) {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  color: #1e40af;
}

.feature-tag:nth-child(2) {
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
  color: #15803d;
}

.feature-tag:nth-child(3) {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #a16207;
}

.feature-tag:nth-child(4) {
  background: linear-gradient(135deg, #fce7f3, #fbcfe8);
  color: #be185d;
}

.feature-tag:nth-child(5) {
  background: linear-gradient(135deg, #ede9fe, #ddd6fe);
  color: #7c3aed;
}

.feature-tag:nth-child(n+6) {
  background: #fce7f3;
  color: #be185d;
}

.feature-tag:nth-child(5) {
  background: #f3e8ff;
  color: #7c3aed;
}

.feature-tag:nth-child(n+6) {
  background: #f1f5f9;
  color: #475569;
}

.card-action {
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
  color: white;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
}

.action-text {
  white-space: nowrap;
}




/* 移动端查询对话框样式 */
.mobile-query-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  padding: 0;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.dialog-content {
  width: 100%;
  max-height: 85vh;
  background: linear-gradient(180deg, #ffffff 0%, #f9fafc 100%);
  border-radius: 24px 24px 0 0;
  padding: 0;
  transform: translateY(100%);
  transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  overflow: hidden;
  border: none;
}

.mobile-query-dialog.show .dialog-content {
  transform: translateY(0);
}

.mobile-query-dialog :deep(.el-dialog) {
  border-radius: 20px 20px 0 0;
  margin: 0;
  width: 100%;
  max-height: 85vh;
  position: relative;
}

.mobile-query-dialog :deep(.el-dialog__header) {
  padding: 24px 28px;
  border-bottom: none;
  background: linear-gradient(135deg, #fafafa 0%, #f5f6f8 100%);
  position: relative;
}

.mobile-query-dialog :deep(.el-dialog__header)::before {
  content: '';
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
}

.mobile-query-dialog :deep(.el-dialog__title) {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  text-align: center;
}

.mobile-query-dialog :deep(.el-dialog__body) {
  padding: 28px;
  max-height: calc(85vh - 140px);
  overflow-y: auto;
  background: linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(249,250,252,0.9) 100%);
}

.query-form-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.query-item-detail {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
}

.item-description {
  color: #666;
  font-size: 14px;
  margin-bottom: 12px;
  line-height: 1.5;
}

.item-price-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-label {
  color: #999;
  font-size: 14px;
}

.price-value {
  color: #e74c3c;
  font-size: 18px;
  font-weight: 600;
}

.mobile-query-form {
  margin-top: 0;
}

.mobile-query-form :deep(.el-form-item) {
  margin-bottom: 24px;
}

.mobile-query-form :deep(.el-form-item__label) {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.mobile-query-input,
.mobile-query-select,
.mobile-query-date-picker {
  height: 48px;
}

.mobile-query-input :deep(.el-input__wrapper),
.mobile-query-select :deep(.el-input__wrapper) {
  background: linear-gradient(135deg, #f8f9fb 0%, #f0f2f5 100%);
  border: none;
  border-radius: 16px;
  box-shadow: none;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.mobile-query-input :deep(.el-input__wrapper):hover,
.mobile-query-input :deep(.el-input__wrapper.is-focus),
.mobile-query-select :deep(.el-input__wrapper):hover,
.mobile-query-select :deep(.el-input__wrapper.is-focus) {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fb 100%);
  transform: translateY(-1px);
  box-shadow: none;
}

.mobile-query-input :deep(.el-input__inner),
.mobile-query-select :deep(.el-input__inner) {
  font-size: 16px;
}

.query-agreement {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.query-agreement :deep(.el-checkbox__label) {
  font-size: 14px;
  color: #666;
}

.agreement-link {
  color: #409eff;
  cursor: pointer;
  text-decoration: underline;
}

.agreement-link.disabled {
  color: #c0c4cc;
  cursor: not-allowed;
  text-decoration: none;
}

.agreement-link.disabled:hover {
  color: #c0c4cc;
  text-decoration: none;
}

.mobile-query-footer {
  display: flex;
  gap: 12px;
  padding: 16px 0 0;
}

.mobile-query-btn {
  flex: 1;
  height: 48px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.mobile-query-btn-cancel {
  background: linear-gradient(135deg, #f8f9fa 0%, #f0f2f5 100%);
  border: none;
  color: #666;
}

.mobile-query-btn-cancel:hover {
  background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
  transform: translateY(-1px);
}

.mobile-query-btn-submit {
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
  border: none;
  color: white;
}

.mobile-query-btn-submit:hover {
  background: linear-gradient(135deg, #229954 0%, #27ae60 100%);
  transform: translateY(-2px);
}

.mobile-query-btn-submit:active {
  background: #229954;
  border-color: #229954;
}

/* 响应式适配 */
@media (max-width: 375px) {
  .header-section {
    margin-bottom: 24px;
    padding: 20px;
  }
  
  .title {
    font-size: 28px;
  }
  
  .section-title {
    font-size: 20px;
  }
  
  .featured-card {
    padding: 20px;
  }
  
  .featured-content {
    gap: 12px;
  }
  
  .featured-icon {
    width: 50px;
    height: 50px;
  }
  
  .featured-icon i {
    font-size: 24px;
  }
  
  .featured-title {
    font-size: 18px;
  }
  
  .featured-desc {
    font-size: 13px;
  }
  
  .query-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .query-card {
    padding: 18px;
  }
  
  .card-icon {
    width: 40px;
    height: 40px;
  }
  
  .card-icon i {
    font-size: 18px;
  }
  
  .card-title {
    font-size: 14px;
  }
  
  .card-desc {
    font-size: 11px;
  }
}

@media (max-width: 320px) {
  .mobile-home {
    padding: 12px;
  }
  
  .title {
    font-size: 24px;
  }
  
  .section-title {
    font-size: 18px;
  }
  
  .featured-card {
    padding: 16px;
  }
  
  .query-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .featured-content {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .featured-meta {
    justify-content: center;
  }
  
  .card-icon {
    width: 44px;
    height: 44px;
  }
  
  .card-icon i {
    font-size: 18px;
  }
}
</style>