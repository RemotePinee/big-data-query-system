<template>
  <div class="mobile-query">
    <!-- 头部导航 -->
    <div class="header">
      <button class="back-btn" @click="goBack">
        <i class="fas fa-arrow-left"></i>
      </button>
      <h1 class="page-title">{{ categoryName }}</h1>
      <div class="header-spacer"></div>
    </div>

    <!-- 查询项目列表 -->
    <div class="query-items" v-if="!selectedItem">
      <div 
        v-for="item in filteredItems" 
        :key="item.id"
        class="query-item"
        @click="selectItem(item)"
      >
        <div class="item-icon">
          <i :class="getItemIcon(item.name)"></i>
        </div>
        <div class="item-content">
          <h3 class="item-name">{{ item.name }}</h3>
          <p class="item-desc">{{ item.description }}</p>
          <div class="item-footer">
            <span class="item-price">¥{{ formatPrice(item.price) }}</span>
            <span class="item-time">{{ item.processingTime || '即时' }}</span>
          </div>
        </div>
        <div class="item-arrow">
          <i class="fas fa-chevron-right"></i>
        </div>
      </div>
      
      <div v-if="filteredItems.length === 0" class="empty-state">
        <i class="fas fa-search"></i>
        <p>该分类暂无可用服务</p>
      </div>
    </div>

    <!-- 查询表单 -->
    <div class="query-form" v-if="selectedItem">
      <div class="form-header">
        <button class="back-btn" @click="selectedItem = null">
          <i class="fas fa-arrow-left"></i>
        </button>
        <h2 class="form-title">{{ selectedItem.name }}</h2>
      </div>
      
      <div class="form-content">
        <div class="service-info">
          <div class="info-item">
            <span class="info-label">服务价格</span>
            <span class="info-value price">¥{{ formatPrice(selectedItem.price) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">处理时间</span>
            <span class="info-value">{{ selectedItem.processingTime || '即时' }}</span>
          </div>
        </div>
        
        <form @submit.prevent="submitQuery" class="param-form">
          <div 
            v-for="param in queryParams" 
            :key="param.name"
            class="form-group"
          >
            <label class="form-label">{{ param.label }}</label>
            <input 
              v-if="param.type === 'text' || param.type === 'number'"
              :type="param.type"
              v-model="formData[param.name]"
              :placeholder="param.placeholder"
              :required="param.required"
              class="form-input"
            />
            <select 
              v-else-if="param.type === 'select'"
              v-model="formData[param.name]"
              :required="param.required"
              class="form-select"
            >
              <option value="">请选择{{ param.label }}</option>
              <option 
                v-for="option in param.options" 
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
            <textarea 
              v-else-if="param.type === 'textarea'"
              v-model="formData[param.name]"
              :placeholder="param.placeholder"
              :required="param.required"
              class="form-textarea"
              rows="3"
            ></textarea>
          </div>
          
          <div class="agreement-section">
            <label class="agreement-checkbox">
              <input type="checkbox" v-model="agreement" required>
              <span class="checkmark"></span>
              <span class="agreement-text">
                我已阅读并同意 
                <a 
                  href="#" 
                  @click.prevent="showTerms"
                  :class="{ disabled: !systemSettings.queryServiceAgreement }"
                >
                  服务条款
                </a> 
                和 
                <a 
                  href="#" 
                  @click.prevent="showPrivacy"
                  :class="{ disabled: !systemSettings.privacyAgreement }"
                >
                  隐私政策
                </a>
              </span>
            </label>
          </div>
          
          <button 
            type="submit" 
            class="submit-btn"
            :disabled="loading || !agreement"
          >
            <i v-if="loading" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-search"></i>
            {{ loading ? '提交中...' : '立即查询' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useSystemSettingsStore } from '@/stores/systemSettings'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const systemSettingsStore = useSystemSettingsStore()

// 计算属性 - 系统设置
const systemSettings = computed(() => systemSettingsStore.settings)

// 响应式数据
const queryItems = ref([])
const selectedItem = ref(null)
const formData = ref({})
const agreement = ref(false)
const loading = ref(false)

// 计算属性
const categoryId = computed(() => route.query.category || 'all')
const categoryName = computed(() => {
  const categoryMap = {
    'all': '全部服务',
    'person': '个人查询',
    'company': '企业查询',
    'vehicle': '车辆查询',
    'property': '房产查询',
    'education': '教育查询',
    'other': '其他查询'
  }
  return categoryMap[categoryId.value] || '查询服务'
})

const filteredItems = computed(() => {
  if (categoryId.value === 'all') {
    return queryItems.value
  }
  return queryItems.value.filter(item => 
    item.categoryId === categoryId.value || 
    (categoryId.value === 'other' && !item.categoryId)
  )
})

const queryParams = computed(() => {
  if (!selectedItem.value) return []
  
  try {
    const params = selectedItem.value.params
    return typeof params === 'string' ? JSON.parse(params) : params || []
  } catch (error) {
    console.error('解析查询参数失败:', error)
    return []
  }
})

// 方法
const goBack = () => {
  router.go(-1)
}

const formatPrice = (price) => {
  return parseFloat(price || 0).toFixed(2)
}

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

const selectItem = (item) => {
  selectedItem.value = item
  formData.value = {}
  agreement.value = false
  
  // 初始化表单数据
  queryParams.value.forEach(param => {
    formData.value[param.name] = param.defaultValue || ''
  })
}

const submitQuery = async () => {
  if (!userStore.userInfo.id) {
    ElMessage.warning('请先登录')
    router.push('/mobile/login')
    return
  }
  
  if (!agreement.value) {
    ElMessage.warning('请先同意服务条款和隐私政策')
    return
  }
  
  loading.value = true
  
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('/api/queries/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        queryItemId: selectedItem.value.id,
        params: formData.value,
        platform: 'mobile'
      })
    })
    
    const data = await res.json()
    
    if (data && (data.code === 200 || data.code === 201) && data.data) {
      ElMessage.success('订单创建成功，正在跳转到支付页面...')
      
      // 跳转到支付页面
      setTimeout(() => {
        router.push(`/mobile/payment/${data.data.orderNo}`)
      }, 1000)
    } else {
      throw new Error(data.message || '创建订单失败')
    }
  } catch (error) {
    console.error('提交查询失败:', error)
    ElMessage.error(error.message || '提交查询失败，请重试')
  } finally {
    loading.value = false
  }
}

const showTerms = () => {
  if (systemSettings.value.queryServiceAgreement) {
    window.open(systemSettings.value.queryServiceAgreement, '_blank')
  } else {
    ElMessage.info('服务条款功能开发中...')
  }
}

const showPrivacy = () => {
  if (systemSettings.value.privacyAgreement) {
    window.open(systemSettings.value.privacyAgreement, '_blank')
  } else {
    ElMessage.info('隐私政策功能开发中...')
  }
}

// 获取查询项目
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
    
    if (data && data.code === 200 && data.data) {
      // 过滤移动端可见的项目
      const mobileVisibleItems = data.data.filter(item => {
        if (item.platforms) {
          try {
            const platforms = typeof item.platforms === 'string' 
              ? JSON.parse(item.platforms) 
              : item.platforms
            
            if (platforms.mobile && platforms.mobile.enabled === false) {
              return false
            }
          } catch (e) {
            console.error('解析平台可见性设置失败:', e)
          }
        }
        return true
      })
      
      // 使用移动端价格配置
      queryItems.value = mobileVisibleItems.map(item => {
        let platformConfig = null
        try {
          if (item.platforms) {
            platformConfig = typeof item.platforms === 'string' 
              ? JSON.parse(item.platforms) 
              : item.platforms
          }
        } catch (e) {
          console.error('解析平台配置失败:', e)
        }
        
        // 使用移动端价格，如果没有则使用默认价格
        const mobilePrice = platformConfig?.mobile?.price
        const finalPrice = mobilePrice !== undefined ? mobilePrice : item.price
        
        return {
          ...item,
          price: finalPrice
        }
      })
    }
  } catch (error) {
    console.error('获取查询项目失败:', error)
    ElMessage.error('获取查询项目失败')
  }
}

onMounted(() => {
  fetchQueryItems()
})
</script>

<style scoped>
.mobile-query {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-bottom: 80px;
}

/* 头部导航 */
.header {
  display: flex;
  align-items: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateX(-2px);
}

.page-title {
  flex: 1;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  color: white;
  margin: 0;
}

.header-spacer {
  width: 40px;
}

/* 查询项目列表 */
.query-items {
  padding: 20px;
}

.query-item {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.query-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.item-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  margin-right: 16px;
}

.item-content {
  flex: 1;
}

.item-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
}

.item-desc {
  font-size: 13px;
  color: #666;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-price {
  font-size: 16px;
  font-weight: 600;
  color: #667eea;
}

.item-time {
  font-size: 12px;
  color: #999;
  background: rgba(102, 126, 234, 0.1);
  padding: 2px 8px;
  border-radius: 8px;
}

.item-arrow {
  font-size: 14px;
  color: #ccc;
  margin-left: 12px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.8);
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 16px;
  margin: 0;
}

/* 查询表单 */
.query-form {
  padding: 20px;
}

.form-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.form-title {
  flex: 1;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  color: white;
  margin: 0 0 0 40px;
}

.form-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.service-info {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  font-size: 14px;
  color: #666;
}

.info-value {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.info-value.price {
  font-size: 18px;
  font-weight: 600;
  color: #667eea;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.form-input, .form-select, .form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: white;
}

.form-input:focus, .form-select:focus, .form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.agreement-section {
  margin: 24px 0;
}

.agreement-checkbox {
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  font-size: 13px;
  line-height: 1.5;
}

.agreement-checkbox input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid #ddd;
  border-radius: 4px;
  margin-right: 8px;
  margin-top: 1px;
  flex-shrink: 0;
  transition: all 0.3s ease;
  position: relative;
}

.agreement-checkbox input[type="checkbox"]:checked + .checkmark {
  background: #667eea;
  border-color: #667eea;
}

.agreement-checkbox input[type="checkbox"]:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: -2px;
  left: 2px;
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.agreement-text {
  color: #666;
}

.agreement-text a {
  color: #667eea;
  text-decoration: none;
}

.agreement-text a:hover {
  text-decoration: underline;
}

.agreement-text a.disabled {
  color: #ccc;
  cursor: not-allowed;
}

.agreement-text a.disabled:hover {
  text-decoration: none;
}

.submit-btn {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 响应式设计 */
@media (max-width: 375px) {
  .header, .query-items, .query-form {
    padding: 16px;
  }
  
  .query-item {
    padding: 16px;
  }
  
  .item-icon {
    width: 44px;
    height: 44px;
    font-size: 18px;
  }
  
  .form-content {
    padding: 20px;
  }
}
</style>