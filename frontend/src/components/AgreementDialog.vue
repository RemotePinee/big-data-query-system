<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="80%"
    max-width="800px"
    :before-close="handleClose"
    class="agreement-dialog"
  >
    <div class="agreement-content" v-html="renderedContent"></div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button type="primary" @click="handleAgree" v-if="showAgreeButton">
          我已阅读并同意
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { marked } from 'marked'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '协议内容'
  },
  content: {
    type: String,
    default: ''
  },
  showAgreeButton: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'agree', 'close'])

const visible = ref(false)

// 配置marked选项
marked.setOptions({
  breaks: true,
  gfm: true,
  sanitize: false
})

// 计算属性：将markdown内容转换为HTML
const renderedContent = computed(() => {
  if (!props.content) return ''
  
  try {
    // 如果内容包含markdown语法，则解析为HTML
    if (props.content.includes('#') || props.content.includes('**') || props.content.includes('*') || 
        props.content.includes('`') || props.content.includes('[') || props.content.includes('- ')) {
      return marked(props.content)
    }
    // 否则直接返回原内容（可能已经是HTML）
    return props.content
  } catch (error) {
    console.error('Markdown解析错误:', error)
    return props.content
  }
})

watch(() => props.modelValue, (newVal) => {
  visible.value = newVal
})

watch(visible, (newVal) => {
  emit('update:modelValue', newVal)
})

const handleClose = () => {
  visible.value = false
  emit('close')
}

const handleAgree = () => {
  emit('agree')
  handleClose()
}
</script>

<style scoped>
.agreement-dialog :deep(.el-dialog) {
  border-radius: 12px;
}

.agreement-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 24px;
  border-radius: 12px 12px 0 0;
}

.agreement-dialog :deep(.el-dialog__title) {
  color: white;
  font-weight: 600;
  font-size: 18px;
}

.agreement-dialog :deep(.el-dialog__headerbtn .el-dialog__close) {
  color: white;
  font-size: 20px;
}

.agreement-dialog :deep(.el-dialog__headerbtn .el-dialog__close:hover) {
  color: #f0f0f0;
}

.agreement-content {
  max-height: 60vh;
  overflow-y: auto;
  padding: 20px 0;
  line-height: 1.8;
  font-size: 14px;
  color: #333;
}

.agreement-content :deep(h1),
.agreement-content :deep(h2),
.agreement-content :deep(h3),
.agreement-content :deep(h4),
.agreement-content :deep(h5),
.agreement-content :deep(h6) {
  color: #2c3e50;
  margin: 20px 0 10px 0;
  font-weight: 600;
}

.agreement-content :deep(h1) {
  font-size: 24px;
  border-bottom: 2px solid #3498db;
  padding-bottom: 10px;
}

.agreement-content :deep(h2) {
  font-size: 20px;
}

.agreement-content :deep(h3) {
  font-size: 18px;
}

.agreement-content :deep(p) {
  margin: 12px 0;
  text-align: justify;
}

.agreement-content :deep(ul),
.agreement-content :deep(ol) {
  margin: 12px 0;
  padding-left: 24px;
}

.agreement-content :deep(li) {
  margin: 8px 0;
}

.agreement-content :deep(strong) {
  color: #e74c3c;
  font-weight: 600;
}

.agreement-content :deep(em) {
  color: #3498db;
  font-style: italic;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 0 0 0;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .agreement-dialog :deep(.el-dialog) {
    width: 95% !important;
    margin: 5vh auto !important;
  }
  
  .agreement-content {
    max-height: 50vh;
    font-size: 13px;
  }
  
  .dialog-footer {
    flex-direction: column;
  }
  
  .dialog-footer .el-button {
    width: 100%;
  }
}

.agreement-content :deep(code) {
  background-color: #f8f9fa;
  color: #e83e8c;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
}

.agreement-content :deep(pre) {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 16px;
  overflow-x: auto;
  margin: 16px 0;
}

.agreement-content :deep(pre code) {
  background: none;
  color: #333;
  padding: 0;
}

.agreement-content :deep(blockquote) {
  border-left: 4px solid #3498db;
  background-color: #f8f9fa;
  margin: 16px 0;
  padding: 12px 16px;
  color: #6c757d;
  font-style: italic;
}

.agreement-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
  border: 1px solid #dee2e6;
}

.agreement-content :deep(th),
.agreement-content :deep(td) {
  border: 1px solid #dee2e6;
  padding: 8px 12px;
  text-align: left;
}

.agreement-content :deep(th) {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #495057;
}

.agreement-content :deep(a) {
  color: #3498db;
  text-decoration: none;
}

.agreement-content :deep(a:hover) {
  color: #2980b9;
  text-decoration: underline;
}

.agreement-content :deep(hr) {
  border: none;
  border-top: 2px solid #e9ecef;
  margin: 24px 0;
}
</style>