<template>
  <el-dialog
    v-model="visible"
    title="关于我们"
    width="90%"
    :before-close="handleClose"
    class="mobile-about-dialog"
    :show-close="true"
    :close-on-click-modal="true"
  >
    <div class="about-content">
      <!-- 公司介绍 -->
      <div class="company-intro">
        <div class="company-logo">
          <el-icon :size="48"><DataAnalysis /></el-icon>
        </div>
        <h2 class="company-name">{{ systemSettingsStore.settings.systemName }}</h2>
        <p class="company-description">
          专业的数据查询服务平台，致力于为用户提供准确、快速、安全的数据查询服务。
          我们拥有丰富的数据资源和先进的技术架构，确保每一次查询都能获得可靠的结果。
        </p>
      </div>

      <!-- 核心优势 -->
      <div class="advantages-section">
        <h3 class="section-title">核心优势</h3>
        <div class="advantages-grid">
          <div 
            v-for="advantage in advantages" 
            :key="advantage.title"
            class="advantage-card"
          >
            <div class="advantage-icon">
              <el-icon :size="24"><component :is="advantage.icon" /></el-icon>
            </div>
            <h4 class="advantage-title">{{ advantage.title }}</h4>
            <p class="advantage-description">{{ advantage.description }}</p>
          </div>
        </div>
      </div>

      <!-- 联系信息 -->
      <div class="contact-section">
        <h3 class="section-title">联系我们</h3>
        <div class="contact-info">
          <div class="contact-item">
            <el-icon class="contact-icon"><Phone /></el-icon>
            <div class="contact-details">
              <div class="contact-label">客服热线</div>
              <div class="contact-value">{{ contactInfo.phone }}</div>
            </div>
          </div>
          
          <div class="contact-item">
            <el-icon class="contact-icon"><Timer /></el-icon>
            <div class="contact-details">
              <div class="contact-label">工作时间</div>
              <div class="contact-value">{{ contactInfo.workTime }}</div>
            </div>
          </div>
          
          <div class="contact-item">
            <el-icon class="contact-icon"><Message /></el-icon>
            <div class="contact-details">
              <div class="contact-label">电子邮箱</div>
              <div class="contact-value">{{ contactInfo.email }}</div>
            </div>
          </div>
          
          <div class="contact-item">
            <el-icon class="contact-icon"><Location /></el-icon>
            <div class="contact-details">
              <div class="contact-label">公司地址</div>
              <div class="contact-value">{{ contactInfo.address }}</div>
            </div>
          </div>
        </div>
        
        <div class="contact-actions">
          <el-button type="primary" @click="showOnlineService">
            <el-icon><ChatDotRound /></el-icon>
            在线客服
          </el-button>
        </div>
      </div>

      <!-- 版权信息 -->
      <div class="copyright-section">
        <div class="copyright-text">
          <div>© {{ new Date().getFullYear() }} {{ systemSettingsStore.settings.copyright }}</div>
          <div v-if="systemSettingsStore.settings.icp" class="icp-info">
            {{ systemSettingsStore.settings.icp }}
          </div>
        </div>
      </div>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 在线客服弹窗 -->
  <OnlineServiceDialog v-model="onlineServiceVisible" />
</template>

<script setup>
import { ref, computed, markRaw, onMounted } from 'vue'
import { 
  DataAnalysis, Star, User, Phone, Message, Location, 
  ChatDotRound, Timer, Lock, Connection
} from '@element-plus/icons-vue'
import { useSystemSettingsStore } from '@/stores/systemSettings'
import OnlineServiceDialog from '@/components/OnlineServiceDialog.vue'

// Props
  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false
    }
  })

// Emits
const emit = defineEmits(['update:modelValue'])

// 系统设置store
const systemSettingsStore = useSystemSettingsStore()

// 响应式数据
const onlineServiceVisible = ref(false)

// 计算属性
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const contactInfo = computed(() => systemSettingsStore.getContactInfo())

// 核心优势数据
const advantages = ref([
  {
    title: '数据准确可靠',
    description: '多重验证机制，确保数据的真实性和准确性',
    icon: markRaw(Star)
  },
  {
    title: '查询速度快',
    description: '先进的技术架构，实现秒级响应',
    icon: markRaw(Connection)
  },
  {
    title: '信息安全保障',
    description: '严格的数据加密和隐私保护措施',
    icon: markRaw(Lock)
  },
  {
    title: '专业客服支持',
    description: '7×24小时专业客服团队在线服务',
    icon: markRaw(User)
  }
])

// 方法
const handleClose = () => {
  visible.value = false
}

const showOnlineService = () => {
  onlineServiceVisible.value = true
}

// 组件挂载时获取系统设置
onMounted(async () => {
  try {
    await systemSettingsStore.fetchSettings()
  } catch (error) {
    console.error('获取系统设置失败:', error)
  }
})
</script>

<style scoped>
.mobile-about-dialog {
  --el-dialog-border-radius: 12px;
}

.about-content {
  max-height: 70vh;
  overflow-y: auto;
  padding: 0;
}

.company-intro {
  text-align: center;
  padding: 24px 0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 24px;
}

.company-logo {
  color: #409eff;
  margin-bottom: 16px;
}

.company-name {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
}

.company-description {
  color: #606266;
  line-height: 1.6;
  margin: 0;
  font-size: 14px;
}

.advantages-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 20px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #409eff;
}

.advantages-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.advantage-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  transition: transform 0.3s, box-shadow 0.3s;
}

.advantage-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.advantage-icon {
  color: #409eff;
  margin-bottom: 12px;
}

.advantage-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.advantage-description {
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

.contact-section {
  margin-bottom: 24px;
}

.contact-info {
  margin-bottom: 20px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.contact-item:last-child {
  border-bottom: none;
}

.contact-icon {
  color: #409eff;
  font-size: 20px;
  flex-shrink: 0;
}

.contact-details {
  flex: 1;
}

.contact-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.contact-value {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.contact-actions {
  text-align: center;
}

.copyright-section {
  text-align: center;
  padding: 20px 0;
  border-top: 1px solid #f0f0f0;
  background: #f8f9fa;
  border-radius: 8px;
}

.copyright-text {
  color: #909399;
  font-size: 12px;
  line-height: 1.5;
}

.icp-info {
  margin-top: 4px;
}

.dialog-footer {
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .mobile-about-dialog {
    width: 95% !important;
  }
  
  .about-content {
    max-height: 60vh;
  }
  
  .advantages-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .company-name {
    font-size: 20px;
  }
  
  .section-title {
    font-size: 16px;
  }
}
</style>