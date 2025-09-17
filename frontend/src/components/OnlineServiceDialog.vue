<template>
  <el-dialog
    v-model="visible"
    title="联系在线客服"
    width="400px"
    :before-close="handleClose"
    class="online-service-dialog"
  >
    <div class="service-content">
      <div v-if="qrCodeUrl" class="qr-section">
        <div class="qr-title">
          <el-icon><ChatDotRound /></el-icon>
          <span>扫码联系客服</span>
        </div>
        <div class="qr-container">
          <img :src="qrCodeUrl" alt="客服二维码" class="qr-image" />
        </div>
        <p class="qr-tips">使用微信扫描上方二维码，即可联系在线客服</p>
      </div>
      
      <div v-else class="no-qr-section">
        <div class="no-qr-icon">
          <el-icon><ChatDotRound /></el-icon>
        </div>
        <p class="no-qr-text">暂未配置客服二维码</p>
        <p class="contact-fallback">请通过以下方式联系我们：</p>
        <div class="contact-info">
          <div class="contact-item">
            <el-icon><Phone /></el-icon>
            <span>{{ contactInfo.phone }}</span>
          </div>
          <div class="contact-item">
            <el-icon><Message /></el-icon>
            <span>{{ contactInfo.email }}</span>
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
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ChatDotRound, Phone, Message } from '@element-plus/icons-vue';
import { useSystemSettingsStore } from '@/stores/systemSettings';

// Props
interface Props {
  modelValue: boolean;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

// 系统设置store
const systemSettingsStore = useSystemSettingsStore();

// 计算属性
const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
});

const qrCodeUrl = computed(() => {
  const qr = systemSettingsStore.settings.onlineServiceQr;
  if (qr && !qr.startsWith('http')) {
    // 如果是相对路径，添加基础URL
    return `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || ''}${qr}`;
  }
  return qr;
});

const contactInfo = computed(() => systemSettingsStore.getContactInfo());

// 方法
const handleClose = () => {
  visible.value = false;
};
</script>

<style scoped>
.online-service-dialog {
  --el-dialog-border-radius: 12px;
}

.service-content {
  text-align: center;
  padding: 20px 0;
}

.qr-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qr-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
}

.qr-container {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.qr-image {
  width: 200px;
  height: 200px;
  object-fit: contain;
  border-radius: 8px;
}

.qr-tips {
  color: #606266;
  font-size: 14px;
  margin: 0;
  line-height: 1.5;
}

.no-qr-section {
  padding: 20px 0;
}

.no-qr-icon {
  font-size: 48px;
  color: #dcdfe6;
  margin-bottom: 16px;
}

.no-qr-text {
  font-size: 16px;
  color: #909399;
  margin: 0 0 16px 0;
}

.contact-fallback {
  font-size: 14px;
  color: #606266;
  margin: 0 0 16px 0;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #409eff;
  font-size: 14px;
}

.dialog-footer {
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .online-service-dialog :deep(.el-dialog) {
    width: 90% !important;
    margin: 20px auto !important;
    max-width: none !important;
  }
  
  .online-service-dialog :deep(.el-dialog__body) {
    padding: 16px !important;
  }
  
  .service-content {
    padding: 10px 0;
  }
  
  .qr-image {
    width: 160px;
    height: 160px;
  }
  
  .qr-container {
    padding: 16px;
  }
  
  .qr-title {
    font-size: 14px;
    margin-bottom: 16px;
  }
  
  .qr-tips {
    font-size: 12px;
  }
  
  .no-qr-text {
    font-size: 14px;
  }
  
  .contact-fallback {
    font-size: 12px;
  }
  
  .contact-item {
    font-size: 12px;
  }
}
</style>