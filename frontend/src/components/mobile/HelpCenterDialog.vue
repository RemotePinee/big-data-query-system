<template>
  <el-dialog
    v-model="visible"
    title="帮助中心"
    width="90%"
    :before-close="handleClose"
    class="mobile-help-dialog"
    :show-close="true"
    :close-on-click-modal="true"
  >
    <div class="help-content">
      <!-- 常见问题 -->
      <div class="faq-section">
        <h3 class="section-title">常见问题</h3>
        <div class="faq-list">
          <div 
            v-for="faq in faqList" 
            :key="faq.question"
            class="faq-item"
          >
            <div class="faq-question" @click="toggleFAQ(faq)">
              <span>{{ faq.question }}</span>
              <el-icon class="faq-icon" :class="{ expanded: faq.expanded }">
                <ArrowDown />
              </el-icon>
            </div>
            <div v-show="faq.expanded" class="faq-answer">
              <p v-for="paragraph in faq.answer" :key="paragraph">{{ paragraph }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 联系支持 -->
      <div class="contact-section">
        <h3 class="section-title">需要更多帮助？</h3>
        <p class="contact-description">如果您在使用过程中遇到其他问题，请随时联系我们</p>
        <div class="contact-actions">
          <el-button type="primary" @click="showOnlineService">
            <el-icon><ChatDotRound /></el-icon>
            在线客服
          </el-button>
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
import { ref, computed, onMounted } from 'vue'
import { ChatDotRound, ArrowDown } from '@element-plus/icons-vue'
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

// 常见问题数据
const faqList = ref([
  {
    question: '如何注册新账户？',
    answer: [
      '点击页面右上角的"注册"按钮',
      '填写手机号码并获取验证码',
      '设置登录密码',
      '完成注册并登录'
    ],
    expanded: false
  },
  {
    question: '查询服务如何收费？',
    answer: [
      '不同的查询服务有不同的收费标准',
      '您可以在查询页面查看具体价格',
      '支持多种支付方式，安全便捷'
    ],
    expanded: false
  },
  {
    question: '查询结果多久能出来？',
    answer: [
      '大部分查询服务可以实时返回结果',
      '部分复杂查询可能需要1-3分钟',
      '您可以在"我的订单"中查看查询进度'
    ],
    expanded: false
  },
  {
    question: '如何查看历史查询记录？',
    answer: [
      '登录后进入"个人中心"',
      '点击"查询记录"查看所有历史记录',
      '可以按时间、状态等条件筛选'
    ],
    expanded: false
  }
])



// 方法
const handleClose = () => {
  visible.value = false
}

const toggleFAQ = (faq) => {
  faq.expanded = !faq.expanded
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
.mobile-help-dialog {
  --el-dialog-border-radius: 12px;
}

.help-content {
  max-height: 70vh;
  overflow-y: auto;
  padding: 0;
}

.search-section {
  margin-bottom: 20px;
}

.help-categories {
  margin-bottom: 24px;
}

.help-category {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  margin-bottom: 12px;
  overflow: hidden;
}

.category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #f8f9fa;
  cursor: pointer;
  transition: background-color 0.3s;
}

.category-header:hover {
  background: #e9ecef;
}

.category-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.category-icon {
  color: #409eff;
  font-size: 18px;
}

.category-title {
  font-weight: 600;
  color: #303133;
}

.expand-icon {
  transition: transform 0.3s;
  color: #909399;
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

.category-items {
  padding: 0;
}

.help-item {
  padding: 16px;
  border-top: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.3s;
}

.help-item:hover {
  background: #f8f9fa;
}

.item-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.item-description {
  font-size: 12px;
  color: #606266;
  margin: 0;
  line-height: 1.5;
}

.faq-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #409eff;
}

.faq-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  margin-bottom: 8px;
  overflow: hidden;
}

.faq-question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #f8f9fa;
  cursor: pointer;
  font-weight: 500;
  color: #303133;
  transition: background-color 0.3s;
}

.faq-question:hover {
  background: #e9ecef;
}

.faq-icon {
  transition: transform 0.3s;
  color: #909399;
}

.faq-icon.expanded {
  transform: rotate(180deg);
}

.faq-answer {
  padding: 16px;
  background: white;
  border-top: 1px solid #f0f0f0;
}

.faq-answer p {
  margin: 0 0 8px 0;
  color: #606266;
  line-height: 1.6;
}

.faq-answer p:last-child {
  margin-bottom: 0;
}

.contact-section {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.contact-description {
  color: #606266;
  margin: 8px 0 20px 0;
  font-size: 14px;
}

.contact-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.contact-actions .el-button {
  flex: 1;
  min-width: 120px;
}

.dialog-footer {
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .mobile-help-dialog {
    width: 95% !important;
  }
  
  .help-content {
    max-height: 60vh;
  }
  
  .contact-actions {
    flex-direction: column;
  }
  
  .contact-actions .el-button {
    width: 100%;
  }
}
</style>