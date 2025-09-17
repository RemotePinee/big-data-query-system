<template>
  <div class="query-page modern-ui" :class="{'mobile': mobileDevice}">
    <!-- 背景装饰 -->
    <div class="modern-decoration modern-decoration-circle" style="top: 10%; right: 5%;"></div>
    <div class="modern-decoration modern-decoration-blob" style="bottom: 10%; left: 5%;"></div>
    
    <!-- 导航栏 -->
    <ModernNavbar />
    
    <div class="modern-container">
      <div class="query-header modern-slide-up">
        <h1 class="query-title">数据查询服务</h1>
        <p class="query-description">选择您需要的查询服务，填写相关信息即可获取查询结果</p>
      </div>
      
      <!-- 查询分类 -->
      <div class="query-categories modern-card">
        <div class="categories-buttons">
          <button 
            v-for="category in categories" 
            :key="category.id"
            class="category-button"
            :class="{ 'active': activeCategory === category.id }"
            @click="activeCategory = category.id"
          >
            <div class="category-icon">
              <template v-if="typeof getCategoryIcon(category.id) === 'string'">
                <i :class="getCategoryIcon(category.id)"></i>
              </template>
              <template v-else>
                <el-icon><component :is="getCategoryIcon(category.id)" /></el-icon>
              </template>
            </div>
            <div class="category-info">
              <h3 class="category-name">{{ category.name }}</h3>
              <span class="category-count">{{ getCategoryCount(category.id) }} 项服务</span>
            </div>
            <div class="category-arrow">
              <i class="fas fa-chevron-right"></i>
            </div>
          </button>
        </div>
      </div>
      
      <!-- 查询项目列表 -->
      <div class="query-items">
        <el-row :gutter="24">
          <el-col 
            v-for="(item, index) in filteredItems" 
            :key="item.id" 
            :xs="24" 
            :sm="12" 
            :md="8" 
            :lg="6"
            class="modern-slide-up"
          >
            <div class="query-item-card modern-card card-entrance" :class="`delay-${(index % 8) * 100}`" @click="selectQueryItem(item)">
              <div class="item-badge" :class="`item-badge-${index % 4}`">
                {{ ['热门', '推荐', '精选', '新品'][index % 4] }}
              </div>
              <div class="item-icon">
                <i 
                  :class="item.iconClass || item.icon || 'fas fa-search'"
                  :style="{
                    color: getIconColor(item.iconColor)
                  }"
                ></i>
              </div>
              <div class="item-content">
                <h3 class="item-title">{{ item.name }}</h3>
                <p class="item-description">{{ item.description }}</p>
                <div class="item-price">¥{{ formatAmount(item.price) }}</div>
              </div>
              <div class="item-action">
                <div class="el-button--large modern-btn modern-btn-primary">立即查询</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
      
      <!-- 查询表单对话框 -->
      <el-dialog
        v-model="dialogVisible"
        :title="selectedItem?.name"
        width="90%"
        max-width="600px"
        class="query-dialog"
      >
        <div class="query-form-container">
          <div class="query-item-detail">
            <div class="item-description">{{ selectedItem?.description }}</div>
            <div class="item-price-section">
              <span class="price-label">查询费用</span>
              <span class="price-value">¥{{ formatAmount(selectedItem?.price || 0) }}</span>
            </div>
          </div>
          
          <el-form ref="queryForm" :model="queryParams" :rules="queryRules" label-position="top" class="query-form">
            <el-form-item 
              v-for="field in selectedItem?.fields" 
              :key="field.name" 
              :label="field.label" 
              :prop="field.name"
            >
              <el-input 
                v-if="field.type === 'text' || field.type === 'idcard' || field.type === 'phone'"
                v-model="queryParams[field.name]" 
                :placeholder="field.placeholder"
                class="query-input"
              />
              <el-select 
                v-else-if="field.type === 'select'" 
                v-model="queryParams[field.name]" 
                :placeholder="field.placeholder"
                style="width: 100%"
                class="query-select"
              >
                <el-option 
                  v-for="option in field.options" 
                  :key="option.value" 
                  :label="option.label" 
                  :value="option.value"
                />
              </el-select>
              <el-date-picker 
                v-else-if="field.type === 'date'" 
                v-model="queryParams[field.name]" 
                type="date" 
                :placeholder="field.placeholder"
                style="width: 100%"
                class="query-date-picker"
              />
            </el-form-item>
          </el-form>
          
          <div class="query-agreement">
            <el-checkbox v-model="agreement">
              我已阅读并同意
              <span 
                class="agreement-link"
                @click="showQueryAgreement"
                :class="{ disabled: !systemSettings.queryServiceAgreement }"
              >
                《查询服务协议》
              </span>
            </el-checkbox>
          </div>
        </div>
        
        <template #footer>
          <div class="query-footer">
            <el-button @click="dialogVisible = false" class="query-btn query-btn-cancel">取消</el-button>
            <el-button type="primary" :loading="loading" @click="handleSubmitQuery" class="query-btn query-btn-submit">
              提交查询
            </el-button>
          </div>
        </template>
      </el-dialog>
      
      <!-- 查询流程 -->
      <div class="query-process modern-card modern-slide-up">
        <h2 class="section-title">查询流程</h2>
        <div class="process-steps">
          <div class="process-step">
            <div class="step-number">1</div>
            <div class="step-content">
              <h3>选择查询项目</h3>
              <p>从上方列表中选择您需要的查询服务</p>
            </div>
          </div>
          <div class="process-arrow">
            <el-icon :size="24"><ArrowRight /></el-icon>
          </div>
          <div class="process-step">
            <div class="step-number">2</div>
            <div class="step-content">
              <h3>填写查询信息</h3>
              <p>按要求填写查询所需的相关信息</p>
            </div>
          </div>
          <div class="process-arrow">
            <el-icon :size="24"><ArrowRight /></el-icon>
          </div>
          <div class="process-step">
            <div class="step-number">3</div>
            <div class="step-content">
              <h3>支付查询费用</h3>
              <p>使用在线支付方式完成支付</p>
            </div>
          </div>
          <div class="process-arrow">
            <el-icon :size="24"><ArrowRight /></el-icon>
          </div>
          <div class="process-step">
            <div class="step-number">4</div>
            <div class="step-content">
              <h3>获取查询结果</h3>
              <p>系统将为您展示查询结果</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 常见问题 -->
      <div class="query-faq modern-faq">
        <div class="faq-header">
          <div class="faq-title-section">
            <div class="faq-icon">
              <i class="fas fa-question-circle"></i>
            </div>
            <div class="faq-title-content">
              <h2 class="faq-title">常见问题</h2>
              <p class="faq-subtitle">为您解答使用过程中的疑问</p>
            </div>
          </div>
        </div>
        
        <div class="faq-grid">
          <div class="faq-item" v-for="(faq, index) in faqList" :key="index">
            <div class="faq-question" @click="toggleFaq(index)">
              <div class="question-content">
                <div class="question-icon">
                  <i :class="faq.icon"></i>
                </div>
                <div class="question-text">
                  <h3>{{ faq.question }}</h3>
                </div>
              </div>
              <div class="expand-icon" :class="{ 'expanded': faq.expanded }">
                <i class="fas fa-chevron-down"></i>
              </div>
            </div>
            <div class="faq-answer" :class="{ 'expanded': faq.expanded }">
              <div class="answer-content">
                <p v-html="faq.answer"></p>
                <div v-if="faq.tags" class="answer-tags">
                  <span v-for="tag in faq.tags" :key="tag" class="tag">{{ tag }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="faq-footer">
          <div class="contact-info">
            <h3>还有其他问题？</h3>
            <p>我们的客服团队随时为您提供帮助</p>
            <div class="contact-methods">
              <div class="contact-item">
                <i class="fas fa-phone"></i>
                <span>{{ contactInfo.phone }}</span>
              </div>
              <div class="contact-item">
                <i class="fas fa-clock"></i>
                <span>{{ contactInfo.workTime }}</span>
              </div>
              <div class="contact-item">
                <i class="fas fa-envelope"></i>
                <span>{{ contactInfo.email }}</span>
              </div>
              <div class="contact-item contact-service" @click="showOnlineService">
                <i class="fas fa-comments"></i>
                <span>在线客服</span>
                <i class="fas fa-external-link-alt contact-link-icon"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 在线客服弹窗 -->
  <OnlineServiceDialog v-model="onlineServiceVisible" />
  
  <!-- 协议弹窗 -->
  <AgreementDialog 
    v-model="agreementDialogVisible"
    title="查询服务协议"
    :content="systemSettings.queryServiceAgreement"
  />
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { isMobile } from '../utils/device';
import { useSystemSettingsStore } from '@/stores/systemSettings';
import AgreementDialog from '@/components/AgreementDialog.vue';

const mobileDevice = isMobile();
import { 
  DataAnalysis, 
  Search, 
  ArrowRight,
  House,
  User,
  OfficeBuilding,
  Van,
  School,
  Phone,
  Folder
} from '@element-plus/icons-vue';
import { queryAPI } from '../api/query';
import { formatAmount } from '../utils';
import ModernNavbar from '../components/ModernNavbar.vue';
import OnlineServiceDialog from '../components/OnlineServiceDialog.vue';

const router = useRouter();
const route = useRoute();

// 系统设置store
const systemSettingsStore = useSystemSettingsStore();

// 计算属性 - 从系统设置获取联系信息
const contactInfo = computed(() => systemSettingsStore.getContactInfo());

// 计算属性 - 从系统设置获取设置信息
const systemSettings = computed(() => systemSettingsStore.settings);

// 颜色处理函数
const getIconColor = (color) => {
  if (!color) return '#409EFF';
  
  // 如果已经是具体颜色值（以#开头或rgb开头），直接返回
  if (color.startsWith('#') || color.startsWith('rgb')) {
    return color;
  }
  
  // Element Plus 颜色名称映射
  const colorMap = {
    'primary': '#409EFF',
    'success': '#67C23A',
    'warning': '#E6A23C',
    'danger': '#F56C6C',
    'error': '#F56C6C',
    'info': '#909399'
  };
  
  return colorMap[color] || color;
};



// Element Plus 图标映射
const iconMap = {
  House,
  User,
  Office: OfficeBuilding,
  Van,
  School,
  Phone,
  Folder
};

// 获取分类图标
const getCategoryIcon = (categoryId) => {
  // 如果是"全部"分类，返回FontAwesome图标
  if (categoryId === 'all') {
    return 'fas fa-th-large';
  }
  
  // 从categories数组中找到对应的分类
  const category = categories.value.find(cat => cat.id === categoryId);
  if (category && category.icon) {
    // 如果分类有icon字段，返回对应的Element Plus图标组件
    return iconMap[category.icon] || iconMap.Folder;
  }
  
  // 兜底：使用FontAwesome图标
  const fallbackIconMap = {
    'person': 'fas fa-user',
    'company': 'fas fa-building',
    'vehicle': 'fas fa-car',
    'property': 'fas fa-home',
    'education': 'fas fa-graduation-cap'
  };
  return fallbackIconMap[categoryId] || 'fas fa-folder';
};

// 获取分类下的服务数量
const getCategoryCount = (categoryId) => {
  if (categoryId === 'all') {
    return queryItems.value.length;
  }
  return queryItems.value.filter(item => item.categoryId === categoryId).length;
};

// 查询分类
const categories = ref([]);
const activeCategory = ref('all');

// 查询项目
const queryItems = ref([]);
const filteredItems = computed(() => {
  if (activeCategory.value === 'all') {
    return queryItems.value;
  } else {
    return queryItems.value.filter(item => item.categoryId === activeCategory.value);
  }
});

// 选中的查询项目
const selectedItem = ref(null);
const dialogVisible = ref(false);
const queryParams = reactive({});
const queryRules = ref({});
const agreement = ref(false);
const loading = ref(false);
const queryForm = ref(null);

// 协议弹窗
const agreementDialogVisible = ref(false);

// 在线客服弹窗
const onlineServiceVisible = ref(false);

// FAQ数据
const faqList = ref([
  {
    question: '查询结果多久可以获取？',
    answer: '大部分查询结果会在支付完成后<strong>立即返回</strong>，少数复杂查询可能需要1-24小时。我们会通过短信或邮件及时通知您。',
    icon: 'fas fa-clock',
    expanded: false,
    tags: ['时效性', '通知']
  },
  {
    question: '查询费用如何计算？',
    answer: '查询费用根据不同的查询项目有所不同，在选择查询项目时可以看到具体价格。我们提供<strong>透明定价</strong>，无隐藏费用。',
    icon: 'fas fa-calculator',
    expanded: false,
    tags: ['价格', '透明']
  },
  {
    question: '查询结果的有效期是多久？',
    answer: '查询结果一般保存<strong>7天</strong>，您可以在个人中心查看历史查询记录。重要结果建议及时下载保存。',
    icon: 'fas fa-calendar-alt',
    expanded: false,
    tags: ['有效期', '保存']
  },
  {
    question: '如何保障我的信息安全？',
    answer: '我们采用<strong>全程加密传输</strong>，严格遵守隐私保护规定，确保您的信息安全。所有数据均经过脱敏处理，绝不泄露个人隐私。',
    icon: 'fas fa-shield-alt',
    expanded: false,
    tags: ['安全', '隐私']
  },
  {
    question: '支持哪些支付方式？',
    answer: '我们支持<strong>微信支付、支付宝、银行卡</strong>等多种支付方式，确保您的支付便捷安全。',
    icon: 'fas fa-credit-card',
    expanded: false,
    tags: ['支付', '便捷']
  },
  {
    question: '查询失败如何处理？',
    answer: '如果查询失败，我们会<strong>全额退款</strong>。同时提供人工客服协助，确保您的问题得到妥善解决。',
    icon: 'fas fa-undo-alt',
    expanded: false,
    tags: ['退款', '保障']
  }
]);

// 切换FAQ展开状态 - 手风琴效果，只能展开一个
const toggleFaq = (index) => {
  // 如果当前项已经展开，则关闭它
  if (faqList.value[index].expanded) {
    faqList.value[index].expanded = false;
  } else {
    // 关闭所有其他项，只展开当前项
    faqList.value.forEach((faq, i) => {
      faq.expanded = i === index;
    });
  }
};

// 显示在线客服弹窗
const showOnlineService = () => {
  onlineServiceVisible.value = true;
};

// 显示查询服务协议弹窗
const showQueryAgreement = () => {
  agreementDialogVisible.value = true;
};

// 获取查询分类
const fetchCategories = async () => {
  try {
    // 使用默认分类，因为API可能未实现
    categories.value = [
      { id: 'all', name: '全部', description: '所有查询服务' },
      { id: 'person', name: '个人查询', description: '个人相关信息查询服务' },
      { id: 'company', name: '企业查询', description: '企业相关信息查询服务' },
      { id: 'vehicle', name: '车辆查询', description: '车辆相关信息查询服务' },
      { id: 'property', name: '房产查询', description: '房产相关信息查询服务' },
      { id: 'education', name: '教育查询', description: '学历学籍相关信息查询服务' }
    ];
    activeCategory.value = 'all';
    
    // 尝试从API获取分类，如果成功则替换默认分类
    try {
      const res = await fetch('/api/queries/categories', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      const data = await res.json();
      
      if (data && data.code === 200 && Array.isArray(data.data) && data.data.length > 0) {
        categories.value = [
          { id: 'all', name: '全部', description: '所有查询服务' },
          ...data.data
        ];
      }
    } catch (apiError) {
      console.warn('从API获取查询分类失败，使用默认分类:', apiError);
    }
  } catch (error) {
    console.error('获取查询分类失败:', error);
  }
};

// 获取查询项目
const fetchQueryItems = async () => {
  try {
    // 使用正确的API路径获取PC端查询项目
    const res = await fetch('/api/queries/items', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    const data = await res.json();
    
    if (data && data.code === 200 && data.data) {
      // 过滤只显示PC端可见的项目
      const pcVisibleItems = data.data.filter(item => {
        // 检查平台可见性设置
        if (item.platforms) {
          try {
            const platforms = typeof item.platforms === 'string' 
              ? JSON.parse(item.platforms) 
              : item.platforms
            
            // 如果明确设置了PC端不可见，则过滤掉
            if (platforms.pc && platforms.pc.enabled === false) {
              return false
            }
          } catch (e) {
            console.error('解析平台可见性设置失败:', e)
          }
        }
        return true
      });
      
      // 查询页面使用平台配置的价格，优先级：平台配置价格 > 查询项目管理价格
      queryItems.value = pcVisibleItems.map(item => {
        // 解析平台配置
        let platformConfig = null;
        try {
          if (item.platforms) {
            const platforms = typeof item.platforms === 'string' 
              ? JSON.parse(item.platforms) 
              : item.platforms;
            platformConfig = platforms.pc || {};
          }
        } catch (e) {
          console.error('解析平台配置失败:', e);
          platformConfig = {};
        }
        
        return {
          id: item.id,
          name: platformConfig?.displayName || item.name,  // 优先使用平台配置的显示名称
          description: platformConfig?.description || item.description,  // 优先使用平台配置的描述
          price: platformConfig?.customPrice || item.price || 0,  // 优先使用平台配置的价格
          originalPrice: platformConfig?.originalPrice || item.originalPrice || null,  // 优先使用平台配置的原价
          categoryId: item.category || 'all',
          fields: (() => {
            try {
              if (!item.params_schema) return []
              // 如果已经是对象，直接返回；如果是字符串，则解析
              return typeof item.params_schema === 'string' 
                ? JSON.parse(item.params_schema) 
                : item.params_schema
            } catch (e) {
              console.error('解析查询参数失败:', e, 'params_schema:', item.params_schema)
              return []
            }
          })(),
          icon: item.icon || 'fas fa-search',
          iconClass: item.iconClass || item.icon || 'fas fa-search',  // 使用后端返回的图标配置
          iconColor: item.icon_color || '#409EFF',  // 使用后端返回的图标颜色
          iconSize: item.iconSize || 'medium',  // 使用后端返回的图标尺寸
          status: item.status || 'active',
          features: item.features || [],
          isHot: false  // 查询页面不需要热门标记
        };
      });
      console.log('PC端查询项目列表:', queryItems.value);
    } else {
      // 如果API返回为空，显示空列表
      console.warn('无法从API获取PC端查询项目，显示空列表');
      queryItems.value = [];
      ElMessage.warning('暂无查询服务，请稍后再试');
    }
  } catch (error) {
    console.error('获取查询项目失败:', error);
    // 出错时显示空列表
    queryItems.value = [];
    ElMessage.error('获取查询服务失败，请检查网络连接');
  }
};

// 处理分类切换
const handleCategoryChange = () => {
  // 分类切换时的处理逻辑
};

// 选择查询项目
const selectQueryItem = (item) => {
  selectedItem.value = item;
  
  // 重置查询参数和验证规则
  Object.keys(queryParams).forEach(key => {
    delete queryParams[key];
  });
  queryRules.value = {};
  
  // 根据字段生成验证规则
  if (item.fields && item.fields.length > 0) {
    item.fields.forEach(field => {
      // 初始化参数
      queryParams[field.name] = '';
      
      // 设置验证规则
      const rules = [];
      
      if (field.required) {
        rules.push({ required: true, message: `请输入${field.label}`, trigger: 'blur' });
      }
      
      if (field.type === 'idcard') {
        rules.push({ 
          pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, 
          message: '请输入正确的身份证号码', 
          trigger: 'blur' 
        });
      } else if (field.type === 'phone') {
        rules.push({ 
          pattern: /^1[3-9]\d{9}$/, 
          message: '请输入正确的手机号码', 
          trigger: 'blur' 
        });
      }
      
      if (rules.length > 0) {
        queryRules.value[field.name] = rules;
      }
    });
  }
  
  dialogVisible.value = true;
};

// 提交查询
const handleSubmitQuery = async () => {
  if (!agreement.value) {
    ElMessage.warning('请先阅读并同意查询服务协议');
    return;
  }
  
  if (!queryForm.value) return;
  
  try {
    await queryForm.value.validate();
    
    loading.value = true;
    
    const res = await queryAPI.createOrder({
      queryItemId: selectedItem.value.id,
      params: queryParams
    });
    
    dialogVisible.value = false;
    
    // 检查响应数据结构
    if (!res || !res.data) {
      ElMessage.error('服务器响应数据格式错误');
      return;
    }
    
    const orderData = res.data;
    
    // 显示成功消息
    ElMessage.success(`查询订单已创建，订单金额：¥${formatAmount(orderData.amount || 0)}`);
    
    // 直接跳转到支付页面，传递订单信息
    router.push({
      path: `/payment/${orderData.orderNo}`,
      query: {
        queryItemName: orderData.queryItemName || '查询服务',
        amount: orderData.amount || 0,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('提交查询失败:', error);
    
    // 显示错误消息
    if (error.response && error.response.data && error.response.data.message) {
      ElMessage.error(error.response.data.message);
    } else if (error.message) {
      ElMessage.error(error.message);
    } else {
      ElMessage.error('创建查询订单失败，请稍后重试');
    }
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  try {
    // 确保页面立即显示，不等待数据加载
    await nextTick();
    
    // 并行加载数据，不阻塞页面渲染
    await Promise.all([
      systemSettingsStore.fetchSettings(),
      fetchCategories(),
      fetchQueryItems()
    ]);
    
    // 处理URL参数，如果有service参数则自动选择对应的服务
    const serviceId = route.query.service;
    const serviceName = route.query.name;
    
    if (serviceId) {
      console.log('检测到URL参数 - 服务ID:', serviceId, '服务名称:', serviceName);
      
      // 查找对应的服务
      const targetService = queryItems.value.find(item => item.id == serviceId);
      
      if (targetService) {
         console.log('找到目标服务:', targetService.name);
         ElMessage.success(`已定位到: ${targetService.name}`);
         
         // 自动打开查询弹窗
         setTimeout(() => {
           selectQueryItem(targetService);
         }, 300);
       } else {
         console.warn('未找到对应的服务，服务ID:', serviceId);
         ElMessage.warning(`未找到指定的服务${serviceName ? ': ' + serviceName : ''}`);
       }
    }
    
    // 处理URL hash，实现页面定位
    if (route.hash === '#query-services') {
      console.log('检测到hash定位参数，滚动到查询服务区域');
      setTimeout(() => {
        const queryServicesElement = document.querySelector('.query-categories');
        if (queryServicesElement) {
          queryServicesElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
          console.log('已滚动到查询服务区域');
        }
      }, 800); // 增加延迟确保页面完全加载
    }
    
    // 监听平台配置更新事件
    const { eventBus } = await import('@/utils/eventBus');
    eventBus.on('query-items-refresh', () => {
      console.log('收到平台配置更新事件，刷新查询项目数据');
      fetchQueryItems();
    });
  } catch (error) {
    console.error('组件初始化失败:', error);
    ElMessage.error('数据加载失败，请刷新页面重试');
  }
});

onUnmounted(async () => {
  // 清理事件监听器
  const { eventBus } = await import('@/utils/eventBus');
  eventBus.off('query-items-refresh');
});
</script>

<style scoped>
.query-page {
  min-height: 100vh;
  position: relative;
  background-color: var(--bg-light-alt);
  padding-bottom: var(--space-16);
}

.query-header {
  text-align: center;
  padding: var(--space-12) 0 var(--space-8);
}

.query-title {
  font-size: var(--text-4xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-4);
}

.query-description {
  font-size: var(--text-lg);
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto;
}

.simple-card {
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: var(--space-6);
  margin-bottom: var(--space-8);
}

.query-categories {
  margin-bottom: var(--space-8);
}



.categories-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-bottom: var(--space-5);
}

/* 分类按钮样式 - 长按钮形式 */
.category-button {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 200px;
  max-width: 300px;
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: var(--space-4);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  text-align: left;
  font-family: inherit;
  font-size: inherit;
}

.category-button:hover {
  border-color: #000000;
}

.category-button.active {
  background: #000000;
  border-color: #000000;
  color: #ffffff;
}

.category-button.active .category-name {
  color: #ffffff;
}

.category-button.active .category-desc {
  color: #cccccc;
}

.category-button.active .category-icon {
  background: #ffffff;
  color: #000000;
}

.category-button.active .category-count {
  background: #ffffff;
  color: #000000;
}

.category-button .category-icon {
  margin-right: var(--space-3);
}

.category-info {
  flex: 1;
}

.category-arrow {
  margin-left: auto;
  color: #666666;
  transition: all 0.3s ease;
}

.category-button.active .category-arrow {
  color: #ffffff;
}

.category-icon {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000000;
  font-size: 18px;
  margin-right: var(--space-3);
  transition: all 0.3s ease;
}

.category-info {
  flex: 1;
}

.category-name {
  font-size: var(--text-base);
  font-weight: 600;
  color: #000000;
  margin: 0 0 var(--space-1) 0;
  transition: color 0.3s ease;
}

.category-count {
  display: inline-block;
  padding: 2px 8px;
  background: #f5f5f5;
  color: #000000;
  font-size: var(--text-xs);
  font-weight: 500;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.query-items {
  margin-bottom: var(--space-12);
}

.query-item-card {
  height: 100%;
  padding: var(--space-5);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  margin-bottom: var(--space-4);
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.query-item-card:hover {
  border-color: #000000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.query-item-card:active {
  transform: translateY(0);
  transition: all 0.15s ease;
}

.el-col {
  margin-bottom: var(--space-6);
}

.item-badge {
  position: absolute;
  top: 12px;
  right: -30px;
  background-color: #000000;
  color: #ffffff;
  padding: var(--space-1) var(--space-8);
  font-size: var(--text-xs);
  font-weight: 600;
  transform: rotate(45deg);
}

.item-badge-0 {
  background-color: #000000;
}

.item-badge-1 {
  background-color: #333333;
}

.item-badge-2 {
  background-color: #666666;
}

.item-badge-3 {
  background-color: #999999;
}

.item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 6px;
  background: #f5f5f5;
  margin-bottom: var(--space-3);
  color: #000000;
  font-size: 20px;
  transition: all 0.3s ease;
}

.query-item-card:hover .item-icon {
  background: #000000;
  color: #ffffff;
}

.item-content {
  flex: 1;
}

.item-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: #000000;
  margin-bottom: var(--space-2);
  line-height: 1.4;
}

.item-description {
  color: #666666;
  font-size: var(--text-sm);
  margin-bottom: var(--space-3);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.5;
}

.item-price {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--accent);
  margin-bottom: var(--space-3);
}

.item-action {
  margin-top: auto;
}

/* 查询对话框样式 */
:deep(.query-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.query-dialog .el-dialog__header) {
  background: #000000;
  color: #ffffff;
  padding: 20px 24px;
  margin: 0;
  border-bottom: 1px solid #e5e5e5;
}

:deep(.query-dialog .el-dialog__title) {
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
}

:deep(.query-dialog .el-dialog__headerbtn) {
  top: 20px;
  right: 24px;
}

:deep(.query-dialog .el-dialog__close) {
  color: #ffffff;
  font-size: 18px;
}

:deep(.query-dialog .el-dialog__close:hover) {
  color: #cccccc;
}

:deep(.query-dialog .el-dialog__body) {
  padding: 0;
  background: #ffffff;
}

:deep(.query-dialog .el-dialog__footer) {
  padding: 0;
  background: #f8f9fa;
  border-top: 1px solid #e5e5e5;
}

.query-form-container {
  padding: 24px;
}

.query-item-detail {
  margin-bottom: 24px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
}

.item-description {
  color: #333333;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 16px;
}

.item-price-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid #e5e5e5;
}

.price-label {
  color: #666666;
  font-size: 14px;
}

.price-value {
  color: #000000;
  font-size: 18px;
  font-weight: 700;
}

.query-agreement {
  margin-top: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: center;
}

.query-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
}

/* 查询表单样式 */
:deep(.query-form .el-form-item) {
  margin-bottom: 20px;
}

:deep(.query-form .el-form-item__label) {
  color: #000000;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 8px;
  padding: 0;
}

:deep(.query-form .el-form-item__content) {
  line-height: normal;
}

/* 输入框样式 */
:deep(.query-input .el-input__wrapper) {
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 12px 16px;
  transition: all 0.2s ease;
  box-shadow: none;
}

:deep(.query-input .el-input__wrapper:hover) {
  border-color: #000000;
}

:deep(.query-input .el-input__wrapper.is-focus) {
  border-color: #000000;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
}

:deep(.query-input .el-input__inner) {
  color: #000000;
  font-size: 14px;
}

:deep(.query-input .el-input__inner::placeholder) {
  color: #9ca3af;
}

/* 选择器样式 */
:deep(.query-select .el-select__wrapper) {
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 12px 16px;
  transition: all 0.2s ease;
  box-shadow: none;
}

:deep(.query-select .el-select__wrapper:hover) {
  border-color: #000000;
}

:deep(.query-select .el-select__wrapper.is-focused) {
  border-color: #000000;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
}

:deep(.query-select .el-select__placeholder) {
  color: #9ca3af;
  font-size: 14px;
}

:deep(.query-select .el-select__selected-item) {
  color: #000000;
  font-size: 14px;
}

/* 日期选择器样式 */
:deep(.query-date-picker .el-input__wrapper) {
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 12px 16px;
  transition: all 0.2s ease;
  box-shadow: none;
}

:deep(.query-date-picker .el-input__wrapper:hover) {
  border-color: #000000;
}

:deep(.query-date-picker .el-input__wrapper.is-focus) {
  border-color: #000000;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
}

:deep(.query-date-picker .el-input__inner) {
  color: #000000;
  font-size: 14px;
}

:deep(.query-date-picker .el-input__inner::placeholder) {
  color: #9ca3af;
}

/* 复选框样式 */
:deep(.query-agreement .el-checkbox) {
  color: #333333;
  font-size: 14px;
}

:deep(.query-agreement .el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #000000;
  border-color: #000000;
}

:deep(.query-agreement .el-checkbox__inner:hover) {
  border-color: #000000;
}

:deep(.query-agreement .el-link) {
  color: #000000;
  font-weight: 600;
}

:deep(.query-agreement .el-link:hover) {
  color: #333333;
}

/* 按钮样式 */
.query-btn {
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  border: 1px solid;
}

.query-btn-cancel {
  background: #ffffff;
  color: #666666;
  border-color: #d1d5db;
}

.query-btn-cancel:hover {
  background: #f8f9fa;
  color: #000000;
  border-color: #000000;
}

.query-btn-submit {
  background: #000000;
  color: #ffffff;
  border-color: #000000;
}

.query-btn-submit:hover {
  background: #333333;
  border-color: #333333;
}

/* 查询流程 */
.query-process {
  margin-bottom: var(--space-12);
  padding: var(--space-8);
}

.section-title {
  font-size: var(--text-2xl);
  font-weight: 700;
  text-align: center;
  margin-bottom: var(--space-8);
  color: var(--text-primary);
}

.process-steps {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}

.process-step {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  flex: 1;
  min-width: 200px;
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background-color: #000000;
  color: #ffffff;
  font-weight: 700;
  font-size: var(--text-lg);
}

.step-content h3 {
  font-size: var(--text-lg);
  font-weight: 600;
  margin-bottom: var(--space-1);
  color: var(--text-primary);
}

.step-content p {
  color: var(--text-secondary);
  font-size: var(--text-sm);
}

.process-arrow {
  color: var(--primary);
  margin: 0 var(--space-2);
}

/* 常见问题 - 现代化设计 */
.modern-faq {
  margin-bottom: var(--space-6) !important;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 16px;
  padding: var(--space-8);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.faq-header {
  text-align: center;
  margin-bottom: var(--space-6) !important;
}

.faq-title-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.faq-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #000000 0%, #333333 100%);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 24px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.faq-title-content {
  text-align: left;
}

.faq-title {
  font-size: var(--text-3xl);
  font-weight: 700;
  color: #000000;
  margin: 0 0 var(--space-1) 0;
  background: linear-gradient(135deg, #000000 0%, #333333 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.faq-subtitle {
  color: #666666;
  font-size: var(--text-base);
  margin: 0;
}

.faq-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-bottom: var(--space-4) !important;
}

.faq-item {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e5e5e5;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.faq-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #000000;
}

.faq-question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-5);
  cursor: pointer;
  transition: all 0.3s ease;
  background: #ffffff;
}

.faq-question:hover {
  background: #f8f9fa;
}

.question-content {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex: 1;
}

.question-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000000;
  font-size: 16px;
  transition: all 0.3s ease;
}

.faq-item:hover .question-icon {
  background: linear-gradient(135deg, #000000 0%, #333333 100%);
  color: #ffffff;
  transform: scale(1.1);
}

.question-text h3 {
  font-size: var(--text-lg);
  font-weight: 600;
  color: #000000;
  margin: 0;
  line-height: 1.4;
}

.expand-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  background: #f8f9fa;
  color: #666666;
  transition: all 0.3s ease;
  font-size: 14px;
}

.expand-icon.expanded {
  transform: rotate(180deg);
  background: #000000;
  color: #ffffff;
}

.faq-answer {
  max-height: 0;
  overflow: hidden;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.faq-answer.expanded {
  max-height: 300px;
  border-top: 1px solid #e5e5e5;
}

.answer-content {
  padding: var(--space-5);
}

.answer-content p {
  color: #333333;
  line-height: 1.7;
  margin: 0 0 var(--space-3) 0;
  font-size: var(--text-base);
}

.answer-tags {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.tag {
  background: #000000;
  color: #ffffff;
  padding: var(--space-1) var(--space-3);
  border-radius: 20px;
  font-size: var(--text-xs);
  font-weight: 500;
}

.faq-footer {
  background: linear-gradient(135deg, #000000 0%, #333333 100%);
  border-radius: 12px;
  padding: var(--space-6);
  text-align: center;
  color: #ffffff;
}

.contact-info {
  text-align: center !important;
  display: block !important;
  margin: 0 !important;
  padding: 0 !important;
}

.contact-info h3 {
  font-size: var(--text-xl);
  font-weight: 700;
  margin: 0 0 var(--space-2) 0 !important;
  color: #ffffff;
  text-align: center !important;
  display: block !important;
  width: 100% !important;
}

.contact-info p {
  color: #cccccc;
  margin: 0 0 var(--space-4) 0 !important;
  font-size: var(--text-base);
  text-align: center !important;
  display: block !important;
  width: 100% !important;
}

.contact-methods {
  display: flex !important;
  flex-direction: row !important;
  justify-content: center !important;
  align-items: center !important;
  gap: var(--space-6) !important;
  flex-wrap: wrap !important;
  width: 100% !important;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.contact-item:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.contact-item i {
  font-size: 16px;
  color: #ffffff;
}

.contact-item span {
  color: #ffffff;
  font-weight: 500;
  font-size: var(--text-sm);
}

/* 自定义Element Plus组件样式 */
:deep(.simple-tabs .el-tabs__header) {
  background: transparent;
  border: none;
  margin-bottom: var(--space-4);
}

:deep(.simple-tabs .el-tabs__nav-wrap) {
  padding: 0;
  width: 100%;
}

:deep(.simple-tabs .el-tabs__nav) {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

:deep(.simple-tabs .el-tabs__item) {
  font-size: var(--text-base);
  font-weight: 500;
  color: #666666;
  padding: var(--space-3) var(--space-4);
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  margin: 0;
  transition: all 0.3s ease;
  background: #ffffff;
  flex: 1;
  text-align: center;
  max-width: 200px;
}

:deep(.simple-tabs .el-tabs__item:first-child) {
  margin-right: auto;
}

:deep(.simple-tabs .el-tabs__item:last-child) {
  margin-left: auto;
}

:deep(.simple-tabs .el-tabs__item:not(:first-child):not(:last-child)) {
  margin: 0 var(--space-2);
}

:deep(.simple-tabs .el-tabs__item:hover) {
  color: #000000;
  border-color: #000000;
}

:deep(.simple-tabs .el-tabs__item.is-active) {
  color: #ffffff;
  font-weight: 600;
  background: #000000;
  border-color: #000000;
}

:deep(.simple-tabs .el-tabs__active-bar) {
  display: none;
}

:deep(.simple-collapse .el-collapse-item) {
  border: none;
  margin-bottom: 0;
}

:deep(.simple-collapse .el-collapse-item__header) {
  font-size: var(--text-base);
  font-weight: 600;
  color: #000000;
  background: #ffffff;
  border: none;
  padding: var(--space-4);
  transition: all 0.3s ease;
}

:deep(.simple-collapse .el-collapse-item__header:hover) {
  background: #f5f5f5;
}

:deep(.simple-collapse .el-collapse-item__wrap) {
  border: none;
  background: transparent;
}

:deep(.simple-collapse .el-collapse-item__content) {
  padding: 0;
  background: transparent;
}

:deep(.simple-collapse .el-collapse-item__arrow) {
  color: #000000;
  font-weight: bold;
  transition: all 0.3s ease;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .query-title {
    font-size: var(--text-3xl);
  }
  
  .process-steps {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .process-arrow {
    transform: rotate(90deg);
  }
  
  /* 分类按钮响应式 */
  .categories-buttons {
    gap: var(--space-3);
  }
  
  .category-button {
    padding: var(--space-4);
  }
  
  .category-icon {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }
  
  .category-name {
    font-size: var(--text-base);
  }
  
  /* FAQ响应式 */
  .modern-faq {
    padding: var(--space-6);
  }
  
  .faq-title-section {
    flex-direction: column;
    text-align: center;
  }
  
  .faq-title-content {
    text-align: center;
  }
  
  .faq-grid {
    gap: var(--space-3);
  }
  
  /* 修复faq-footer响应式问题 */
  .faq-footer {
    padding: var(--space-4) var(--space-6) !important;
  }
  
  .contact-info {
    text-align: center !important;
    display: block !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  
  .contact-info h3 {
    text-align: center !important;
    display: block !important;
    width: 100% !important;
  }
  
  .contact-info p {
    text-align: center !important;
    display: block !important;
    width: 100% !important;
  }
  
  .contact-methods {
    display: flex !important;
    flex-direction: row !important;
    justify-content: center !important;
    align-items: center !important;
    width: 100% !important;
  }
  
  .contact-item {
    justify-content: center;
  }
}

/* 卡片入场动画 */
.card-entrance {
  opacity: 0;
  transform: translateY(20px) scale(0.98);
  animation: cardEntranceAnimation 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  animation-fill-mode: both;
}

@keyframes cardEntranceAnimation {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 延迟动画类 */
.delay-0 { animation-delay: 0ms; }
.delay-100 { animation-delay: 100ms; }
.delay-200 { animation-delay: 200ms; }
.delay-300 { animation-delay: 300ms; }
.delay-400 { animation-delay: 400ms; }
.delay-500 { animation-delay: 500ms; }
.delay-600 { animation-delay: 600ms; }
.delay-700 { animation-delay: 700ms; }
.delay-800 { animation-delay: 800ms; }

@media (max-width: 768px) {
  .query-title {
    font-size: var(--text-2xl);
  }
  
  .query-description {
    font-size: var(--text-base);
  }
  
  .section-title {
    font-size: var(--text-xl);
  }
  
  /* 小屏幕分类按钮优化 */
  .categories-buttons {
    gap: var(--space-2);
  }
  
  .category-button {
    padding: var(--space-3);
  }
  
  .category-icon {
    width: 36px;
    height: 36px;
    font-size: 16px;
    margin-right: var(--space-3);
  }
  
  .category-name {
    font-size: var(--text-sm);
  }
  
  .category-desc {
    font-size: var(--text-xs);
  }
  
  /* 小屏幕faq-footer修复 */
  .faq-footer {
    padding: var(--space-3) var(--space-4) !important;
  }
  
  .contact-info {
    text-align: center !important;
    display: block !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  
  .contact-info h3 {
    text-align: center !important;
    display: block !important;
    width: 100% !important;
    font-size: var(--text-lg) !important;
  }
  
  .contact-info p {
    text-align: center !important;
    display: block !important;
    width: 100% !important;
    font-size: var(--text-sm) !important;
  }
  
  .contact-methods {
    display: flex !important;
    flex-direction: row !important;
    justify-content: center !important;
    align-items: center !important;
    width: 100% !important;
    gap: var(--space-4) !important;
  }
  
  .contact-item {
    justify-content: center;
    padding: var(--space-2) var(--space-3) !important;
  }
  
  .contact-item span {
    font-size: var(--text-xs) !important;
  }
}

/* 在线客服按钮样式 */
.contact-service {
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.contact-service:hover {
  background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(64, 158, 255, 0.3);
}

.contact-service:hover .contact-link-icon {
  transform: translateX(3px);
  color: white;
}

.contact-link-icon {
  margin-left: 8px;
  font-size: 12px;
  opacity: 0.7;
  transition: all 0.3s ease;
}

.contact-service::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.contact-service:hover::before {
  left: 100%;
}
</style>