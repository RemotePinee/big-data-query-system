<template>
  <el-dialog
    :title="`${queryItem?.name} - 平台差异化配置`"
    v-model="visible"
    width="800px"
    @close="handleClose"
  >
    <div class="platform-config-container">
      <el-tabs v-model="activeTab" type="card">
        <!-- 移动端配置 -->
        <el-tab-pane label="移动端配置" name="mobile">
          <div class="platform-config">
            <el-form :model="mobileConfig" label-width="120px">
              <el-form-item label="是否启用">
                <el-switch v-model="mobileConfig.enabled" />
              </el-form-item>
              
              <el-form-item label="显示名称">
                <el-input v-model="mobileConfig.displayName" placeholder="留空则使用默认名称" />
              </el-form-item>
              
              <el-form-item label="显示描述">
                <el-input
                  v-model="mobileConfig.description"
                  type="textarea"
                  :rows="3"
                  placeholder="移动端专用描述"
                />
              </el-form-item>
              
              <el-form-item label="价格设置">
                <el-input-number
                  v-model="mobileConfig.customPrice"
                  :precision="2"
                  :step="0.01"
                  :min="0"
                  placeholder="留空使用默认价格"
                  style="width: 200px;"
                />
                <div class="price-help">
                  <el-alert
                    title="价格设置说明"
                    type="info"
                    :closable="false"
                    show-icon
                  >
                    <template #default>
                      <div class="help-content">
                        <p><strong>价格优先级：</strong></p>
                        <ul>
                          <li>如果设置了平台配置价格，将优先使用平台配置的价格</li>
                          <li>如果未设置平台配置价格（留空），则使用编辑表单中设置的默认价格</li>
                          <li>平台配置价格权重高于编辑表单价格，可实现不同平台的差异化定价</li>
                        </ul>
                      </div>
                    </template>
                  </el-alert>
                </div>
              </el-form-item>
              
              <el-form-item label="排序权重">
                <el-input-number v-model="mobileConfig.order" :min="0" />
                <span class="form-tip">数值越小排序越靠前</span>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
        
        <!-- PC端配置 -->
        <el-tab-pane label="PC端配置" name="pc">
          <div class="platform-config">
            <el-form :model="pcConfig" label-width="120px">
              <el-form-item label="是否启用">
                <el-switch v-model="pcConfig.enabled" />
              </el-form-item>
              
              <el-form-item label="显示名称">
                <el-input v-model="pcConfig.displayName" placeholder="留空则使用默认名称" />
              </el-form-item>
              
              <el-form-item label="显示描述">
                <el-input
                  v-model="pcConfig.description"
                  type="textarea"
                  :rows="3"
                  placeholder="PC端专用描述"
                />
              </el-form-item>
              
              <el-form-item label="价格设置">
                <el-input-number
                  v-model="pcConfig.customPrice"
                  :precision="2"
                  :step="0.01"
                  :min="0"
                  placeholder="留空使用默认价格"
                  style="width: 200px;"
                />
                <div class="price-help">
                  <el-alert
                    title="价格设置说明"
                    type="info"
                    :closable="false"
                    show-icon
                  >
                    <template #default>
                      <div class="help-content">
                        <p><strong>价格优先级：</strong></p>
                        <ul>
                          <li>如果设置了平台配置价格，将优先使用平台配置的价格</li>
                          <li>如果未设置平台配置价格（留空），则使用编辑表单中设置的默认价格</li>
                          <li>平台配置价格权重高于编辑表单价格，可实现不同平台的差异化定价</li>
                        </ul>
                      </div>
                    </template>
                  </el-alert>
                </div>
              </el-form-item>
              
              <el-form-item label="排序权重">
                <el-input-number v-model="pcConfig.order" :min="0" />
                <span class="form-tip">数值越小排序越靠前</span>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
        

      </el-tabs>
    </div>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">保存配置</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Delete } from '@element-plus/icons-vue';

interface QueryItem {
  id: number;
  name: string;
  description?: string;
  price?: number;
  platforms?: any;
}

interface PlatformConfig {
  enabled: boolean;
  displayName: string;
  description: string;
  customPrice: number | null;
  order: number;
}

const props = defineProps<{
  modelValue: boolean;
  queryItem: QueryItem | null;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'save': [config: any];
}>();

const visible = ref(false);
const activeTab = ref('mobile');
const saving = ref(false);

// 移动端配置
const mobileConfig = reactive<PlatformConfig>({
  enabled: true,
  displayName: '',
  description: '',
  customPrice: null,
  order: 0
});

// PC端配置
const pcConfig = reactive<PlatformConfig>({
  enabled: true,
  displayName: '',
  description: '',
  customPrice: null,
  order: 0
});

// 监听对话框显示状态
watch(() => props.modelValue, (newVal) => {
  visible.value = newVal;
  if (newVal && props.queryItem) {
    loadPlatformConfig();
  }
});

watch(visible, (newVal) => {
  emit('update:modelValue', newVal);
});

// 加载平台配置
const loadPlatformConfig = () => {
  if (!props.queryItem) return;
  
  const platforms = props.queryItem.platforms || {};
  
  // 加载移动端配置
  const mobile = platforms.mobile || {};
  Object.assign(mobileConfig, {
    enabled: mobile.enabled !== false,
    displayName: mobile.displayName || '',
    description: mobile.description || '',
    customPrice: mobile.customPrice || null,
    order: mobile.order || props.queryItem.id
  });
  
  // 加载PC端配置
  const pc = platforms.pc || {};
  Object.assign(pcConfig, {
    enabled: pc.enabled !== false,
    displayName: pc.displayName || '',
    description: pc.description || '',
    customPrice: pc.customPrice || null,
    order: pc.order || props.queryItem.id
  });
};

// 保存配置
const handleSave = async () => {
  if (!props.queryItem) return;
  
  saving.value = true;
  
  try {
    const platformsConfig = {
      mobile: {
        enabled: mobileConfig.enabled,
        displayName: mobileConfig.displayName,
        description: mobileConfig.description,
        customPrice: mobileConfig.customPrice,
        order: mobileConfig.order
      },
      pc: {
        enabled: pcConfig.enabled,
        displayName: pcConfig.displayName,
        description: pcConfig.description,
        customPrice: pcConfig.customPrice,
        order: pcConfig.order
      }
    };
    
    emit('save', {
      queryItemId: props.queryItem.id,
      platforms: platformsConfig
    });
    
    ElMessage.success('平台配置保存成功');
    handleClose();
  } catch (error) {
    console.error('保存平台配置失败:', error);
    ElMessage.error('保存失败，请重试');
  } finally {
    saving.value = false;
  }
};

// 关闭对话框
const handleClose = () => {
  visible.value = false;
};
</script>

<style scoped>
.platform-config-container {
  min-height: 400px;
}

.platform-config {
  padding: 20px 0;
}

.form-tip {
  color: #909399;
  font-size: 12px;
  margin-left: 10px;
}

.price-help {
  margin-top: 15px;
}

.help-content {
  font-size: 14px;
  line-height: 1.6;
}

.help-content p {
  margin: 8px 0;
}

.help-content ul {
  margin: 8px 0;
  padding-left: 20px;
}

.help-content li {
  margin: 4px 0;
}


</style>