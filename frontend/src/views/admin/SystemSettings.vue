<template>
  <div class="system-settings">
    <div class="page-header">
      <h2 class="page-title">
        <el-icon><Setting /></el-icon>
        系统设置
      </h2>
      <p class="page-description">配置系统的基本信息和显示内容</p>
    </div>

    <div class="settings-container">
      <el-form
        ref="formRef"
        :model="settings"
        :rules="rules"
        label-width="140px"
        class="settings-form"
      >
        <!-- 两列布局容器 -->
        <div class="settings-grid">
          <!-- 左列 -->
          <div class="settings-column left-column">
            <!-- 基本信息设置 -->
            <el-card class="settings-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <el-icon><Monitor /></el-icon>
                  <span>基本信息设置</span>
                </div>
              </template>

              <el-form-item label="PC端Logo" prop="pcLogo">
                <div class="logo-upload-container">
                  <div class="logo-upload-area" @click="selectLogoFile">
                    <img v-if="settings.pcLogo" :src="getImageUrl(settings.pcLogo)" class="logo-preview" />
                    <div v-else class="logo-placeholder">
                      <el-icon class="logo-uploader-icon"><Plus /></el-icon>
                      <p>点击上传Logo</p>
                    </div>
                  </div>
                  <input 
                    ref="logoFileInput" 
                    type="file" 
                    accept="image/*" 
                    style="display: none" 
                    @change="handleLogoFileChange"
                  />
                  <div class="logo-tips">
                    <p>建议尺寸：200x60px，支持PNG、JPG、GIF、WebP格式，文件大小不超过2MB</p>
                    <div class="logo-actions">
                      <el-button type="primary" size="small" @click="selectLogoFile">
                        <el-icon><Upload /></el-icon>
                        {{ settings.pcLogo ? '更换Logo' : '上传Logo' }}
                      </el-button>
                      <el-button v-if="settings.pcLogo" type="danger" size="small" @click="removeLogo">
                        <el-icon><Delete /></el-icon>
                        删除Logo
                      </el-button>
                    </div>
                  </div>
                </div>
              </el-form-item>

              <el-form-item label="系统名称" prop="systemName">
                <el-input
                  v-model="settings.systemName"
                  placeholder="请输入系统名称"
                  maxlength="50"
                  show-word-limit
                />
              </el-form-item>

              <el-form-item label="网站图标" prop="favicon">
                <div class="favicon-upload-container">
                  <div class="favicon-upload-area" @click="selectFaviconFile">
                    <img v-if="settings.favicon" :src="getImageUrl(settings.favicon)" class="favicon-preview" />
                    <div v-else class="favicon-placeholder">
                      <el-icon class="favicon-uploader-icon"><Plus /></el-icon>
                      <p>点击上传网站图标</p>
                    </div>
                  </div>
                  <input 
                    ref="faviconFileInput" 
                    type="file" 
                    accept="image/*,.ico" 
                    style="display: none" 
                    @change="handleFaviconFileChange"
                  />
                  <div class="favicon-tips">
                    <p>建议尺寸：32x32px或16x16px，支持ICO、PNG、SVG格式，文件大小不超过1MB</p>
                    <div class="favicon-actions">
                      <el-button type="primary" size="small" @click="selectFaviconFile">
                        <el-icon><Upload /></el-icon>
                        {{ settings.favicon ? '更换图标' : '上传图标' }}
                      </el-button>
                      <el-button v-if="settings.favicon" type="danger" size="small" @click="removeFavicon">
                        <el-icon><Delete /></el-icon>
                        删除图标
                      </el-button>
                    </div>
                  </div>
                </div>
              </el-form-item>
            </el-card>

            <!-- 首页顶部区域设置 -->
            <el-card class="settings-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <el-icon><Star /></el-icon>
                  <span>首页顶部区域设置</span>
                </div>
              </template>

              <el-form-item label="主标题" prop="heroTitle">
                <el-input
                  v-model="settings.heroTitle"
                  placeholder="请输入主标题，如：一站式大数据查询"
                  maxlength="100"
                  show-word-limit
                />
              </el-form-item>

              <el-form-item label="副标题" prop="heroSubtitle">
                <el-input
                  v-model="settings.heroSubtitle"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入副标题描述"
                  maxlength="200"
                  show-word-limit
                />
              </el-form-item>

              <el-form-item label="服务介绍" prop="serviceDescription">
                <el-input
                  v-model="settings.serviceDescription"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入服务介绍，如：提供个人信息查询、征信逾期、个人司法涉诉、人企关联、婚姻状况、贷款记录、企业查询等多种数据服务"
                  maxlength="500"
                  show-word-limit
                />
              </el-form-item>
            </el-card>

            <!-- 其他设置 -->
            <el-card class="settings-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <el-icon><Tools /></el-icon>
                  <span>其他设置</span>
                </div>
              </template>

              <el-form-item label="网站备案号" prop="icp">
                <el-input
                  v-model="settings.icp"
                  placeholder="请输入网站备案号"
                  maxlength="50"
                />
              </el-form-item>

              <el-form-item label="版权信息" prop="copyright">
                <el-input
                  v-model="settings.copyright"
                  placeholder="请输入版权信息"
                  maxlength="100"
                />
              </el-form-item>

              <el-form-item label="系统标题" prop="systemTitle">
                <el-input
                  v-model="settings.systemTitle"
                  placeholder="请输入系统标题，设置后移动端将统一显示此标题"
                  maxlength="50"
                  show-word-limit
                />
                <div class="form-item-tip">
                  <el-icon><InfoFilled /></el-icon>
                  <span>设置后，所有页面的标题都将显示此内容，解决微信内标题显示延迟问题</span>
                </div>
              </el-form-item>
            </el-card>
          </div>

          <!-- 右列 -->
          <div class="settings-column right-column">
            <!-- 联系方式设置 -->
            <el-card class="settings-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <el-icon><Phone /></el-icon>
                  <span>联系方式设置</span>
                </div>
              </template>

              <el-form-item label="客服热线" prop="servicePhone">
                <el-input
                  v-model="settings.servicePhone"
                  placeholder="请输入客服热线，如：400-123-4567"
                  maxlength="20"
                />
              </el-form-item>

              <el-form-item label="工作时间" prop="workTime">
                <el-input
                  v-model="settings.workTime"
                  placeholder="请输入工作时间，如：周一至周五 9:00-18:00"
                  maxlength="50"
                />
              </el-form-item>

              <el-form-item label="电子邮箱" prop="email">
                <el-input
                  v-model="settings.email"
                  placeholder="请输入客服邮箱"
                  maxlength="50"
                />
              </el-form-item>

              <el-form-item label="公司地址" prop="address">
                <el-input
                  v-model="settings.address"
                  placeholder="请输入公司地址"
                  maxlength="100"
                />
              </el-form-item>

              <el-form-item label="在线客服二维码" prop="onlineServiceQr">
                <div class="qr-upload-container">
                  <div class="qr-upload-area" @click="selectQrFile">
                    <img v-if="settings.onlineServiceQr" :src="getImageUrl(settings.onlineServiceQr)" class="qr-preview" />
                    <div v-else class="qr-placeholder">
                      <el-icon class="qr-uploader-icon"><Plus /></el-icon>
                      <p>点击上传客服二维码</p>
                    </div>
                  </div>
                  <input 
                    ref="qrFileInput" 
                    type="file" 
                    accept="image/*" 
                    style="display: none" 
                    @change="handleQrFileChange"
                  />
                  <div class="qr-tips">
                    <p>建议尺寸：200x200px，支持PNG、JPG、GIF、WebP格式，文件大小不超过2MB</p>
                    <div class="qr-actions">
                      <el-button type="primary" size="small" @click="selectQrFile">
                        <el-icon><Upload /></el-icon>
                        {{ settings.onlineServiceQr ? '更换二维码' : '上传二维码' }}
                      </el-button>
                      <el-button v-if="settings.onlineServiceQr" type="danger" size="small" @click="removeQr">
                        <el-icon><Delete /></el-icon>
                        删除二维码
                      </el-button>
                    </div>
                  </div>
                </div>
              </el-form-item>
            </el-card>

            <!-- 协议设置 -->
            <el-card class="settings-card protocol-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <el-icon><Document /></el-icon>
                  <span>协议设置</span>
                </div>
              </template>

              <el-form-item label="查询服务协议" prop="queryServiceAgreement">
                <el-input
                  v-model="settings.queryServiceAgreement"
                  type="textarea"
                  :rows="6"
                  placeholder="请输入查询服务协议内容，支持HTML格式"
                  maxlength="5000"
                  show-word-limit
                />
                <div class="form-item-tip">
                  <el-icon><InfoFilled /></el-icon>
                  <span>此协议内容将在用户点击查询服务协议时以弹窗形式展示</span>
                </div>
              </el-form-item>

              <el-form-item label="支付服务协议" prop="paymentServiceAgreement">
                <el-input
                  v-model="settings.paymentServiceAgreement"
                  type="textarea"
                  :rows="6"
                  placeholder="请输入支付服务协议内容，支持HTML格式"
                  maxlength="5000"
                  show-word-limit
                />
                <div class="form-item-tip">
                  <el-icon><InfoFilled /></el-icon>
                  <span>此协议内容将在用户点击支付服务协议时以弹窗形式展示</span>
                </div>
              </el-form-item>

              <el-form-item label="隐私协议" prop="privacyAgreement">
                <el-input
                  v-model="settings.privacyAgreement"
                  type="textarea"
                  :rows="6"
                  placeholder="请输入隐私协议内容，支持HTML格式"
                  maxlength="5000"
                  show-word-limit
                />
                <div class="form-item-tip">
                  <el-icon><InfoFilled /></el-icon>
                  <span>此协议内容将在用户点击隐私协议时以弹窗形式展示</span>
                </div>
              </el-form-item>
            </el-card>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="settings-actions">
          <el-button type="primary" @click="saveSettings" :loading="loading">
            <el-icon><Check /></el-icon>
            保存设置
          </el-button>
          <el-button @click="resetSettings">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Setting, Monitor, Star, Phone, Tools, Plus, Check, Refresh, Upload, Delete, Document, InfoFilled } from '@element-plus/icons-vue';
import { getSystemSettings, updateSystemSettings, uploadLogo } from '@/api/systemSettings.ts';

// 表单引用
const formRef = ref();
const logoFileInput = ref();
const qrFileInput = ref();
const faviconFileInput = ref();
const saving = ref(false);
const loading = ref(false);

// 设置数据
const settings = ref({
  pcLogo: '',
  favicon: '',
  systemName: '大数据查询系统',
  systemTitle: '', // 新增系统标题字段
  heroTitle: '一站式大数据查询',
  heroSubtitle: '专业、安全、高效的数据查询服务平台',
  serviceDescription: '提供个人信息查询、征信逾期、个人司法涉诉、人企关联、婚姻状况、贷款记录、企业查询等多种数据服务',
  servicePhone: '400-123-4567',
  workTime: '周一至周五 9:00-18:00',
  email: 'service@example.com',
  address: '北京市朝阳区科技园区88号',
  onlineService: '点击联系在线客服',
  onlineServiceQr: '',
  queryServiceAgreement: '',
  paymentServiceAgreement: '',
  privacyAgreement: '',
  icp: '',
  copyright: '大数据查询系统 版权所有'
});

// 表单验证规则
const rules = {
  systemName: [
    { required: true, message: '请输入系统名称', trigger: 'blur' }
  ],
  heroTitle: [
    { required: true, message: '请输入主标题', trigger: 'blur' }
  ],
  servicePhone: [
    { pattern: /^[\d\-\+\(\)\s]+$/, message: '请输入正确的电话号码格式', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  queryServiceAgreement: [
    { min: 10, message: '协议内容至少需要10个字符', trigger: 'blur' },
    { max: 5000, message: '协议内容不能超过5000个字符', trigger: 'blur' }
  ],
  paymentServiceAgreement: [
    { min: 10, message: '协议内容至少需要10个字符', trigger: 'blur' },
    { max: 5000, message: '协议内容不能超过5000个字符', trigger: 'blur' }
  ],
  privacyAgreement: [
    { min: 10, message: '协议内容至少需要10个字符', trigger: 'blur' },
    { max: 5000, message: '协议内容不能超过5000个字符', trigger: 'blur' }
  ]
};

// 获取完整的图片URL
const getImageUrl = (url: string) => {
  if (!url) return '';
  
  // 如果已经是完整URL，直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // 处理相对路径
  const baseURL = import.meta.env.VITE_API_BASE_URL || '';
  
  // 开发环境：baseURL = http://localhost:3000/api
  // 生产环境：baseURL = /api
  if (baseURL.startsWith('http')) {
    // 开发环境，移除/api后缀
    const apiBaseUrl = baseURL.replace('/api', '');
    return `${apiBaseUrl}${url}`;
  } else {
    // 生产环境，直接使用当前域名
    return url; // 浏览器会自动解析为当前域名下的路径
  }
};

// 加载设置
const loadSettings = async () => {
  try {
    const response = await getSystemSettings();
    if (response.code === 200 && response.data) {
      Object.assign(settings.value, response.data);
    }
  } catch (error) {
    console.error('加载设置失败:', error);
    ElMessage.error('加载设置失败');
  }
};

// 保存设置
const saveSettings = async () => {
  try {
    await formRef.value.validate();
    saving.value = true;

    const response = await updateSystemSettings(settings.value);
    
    if (response.code === 200) {
      ElMessage.success('设置保存成功');
    } else {
      ElMessage.error(response.message || '保存失败');
    }
  } catch (error) {
    console.error('保存设置失败:', error);
    ElMessage.error('保存失败');
  } finally {
    saving.value = false;
  }
};

// 重置设置
const resetSettings = async () => {
  try {
    await ElMessageBox.confirm('确定要重置所有设置吗？', '确认重置', {
      type: 'warning'
    });
    
    await loadSettings();
    ElMessage.success('设置已重置');
  } catch (error) {
    // 用户取消操作
  }
};

// 选择Logo文件
const selectLogoFile = () => {
  if (logoFileInput.value) {
    logoFileInput.value.click();
  }
};

// 处理Logo文件选择
const handleLogoFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;
  
  // 验证文件
  const isImage = file.type.startsWith('image/');
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isImage) {
    ElMessage.error('只能上传图片文件!');
    target.value = '';
    return;
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!');
    target.value = '';
    return;
  }
  
  // 上传文件
  try {
    const response = await uploadLogo(file);
    
    if (response.code === 200) {
      settings.value.pcLogo = response.data.url;
      ElMessage.success('Logo上传成功');
    } else {
      ElMessage.error(response.message || 'Logo上传失败');
    }
  } catch (error) {
    console.error('Logo上传失败:', error);
    ElMessage.error('Logo上传失败');
  } finally {
    target.value = '';
  }
};

// 删除Logo
const removeLogo = () => {
  settings.value.pcLogo = '';
  ElMessage.success('Logo已删除');
};

// 选择二维码文件
const selectQrFile = () => {
  if (qrFileInput.value) {
    qrFileInput.value.click();
  }
};

// 处理二维码文件选择
const handleQrFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;
  
  // 验证文件
  const isImage = file.type.startsWith('image/');
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isImage) {
    ElMessage.error('只能上传图片文件!');
    target.value = '';
    return;
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!');
    target.value = '';
    return;
  }
  
  // 上传文件
  try {
    const response = await uploadLogo(file);
    
    if (response.code === 200) {
      settings.value.onlineServiceQr = response.data.url;
      ElMessage.success('二维码上传成功');
    } else {
      ElMessage.error(response.message || '二维码上传失败');
    }
  } catch (error) {
    console.error('二维码上传失败:', error);
    ElMessage.error('二维码上传失败');
  } finally {
    target.value = '';
  }
};

// 删除二维码
const removeQr = () => {
  settings.value.onlineServiceQr = '';
  ElMessage.success('二维码已删除');
};

// 选择Favicon文件
const selectFaviconFile = () => {
  if (faviconFileInput.value) {
    faviconFileInput.value.click();
  }
};

// 处理Favicon文件选择
const handleFaviconFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;
  
  // 验证文件
  const isValidType = file.type.startsWith('image/') || file.type === 'image/x-icon';
  const isLt1M = file.size / 1024 / 1024 < 1;

  if (!isValidType) {
    ElMessage.error('只能上传图片文件或ICO文件!');
    target.value = '';
    return;
  }
  if (!isLt1M) {
    ElMessage.error('文件大小不能超过 1MB!');
    target.value = '';
    return;
  }
  
  // 上传文件
  try {
    const response = await uploadLogo(file);
    
    if (response.code === 200) {
      settings.value.favicon = response.data.url;
      ElMessage.success('网站图标上传成功');
      // 动态更新页面favicon
      updatePageFavicon(response.data.url);
    } else {
      ElMessage.error(response.message || '网站图标上传失败');
    }
  } catch (error) {
    console.error('网站图标上传失败:', error);
    ElMessage.error('网站图标上传失败');
  } finally {
    target.value = '';
  }
};

// 删除Favicon
const removeFavicon = () => {
  settings.value.favicon = '';
  ElMessage.success('网站图标已删除');
  // 恢复默认favicon
  updatePageFavicon('/vite.svg');
};

// 更新页面favicon
const updatePageFavicon = (iconUrl: string) => {
  // 使用全局favicon管理器
  import('./../../utils/favicon').then(({ faviconManager }) => {
    faviconManager.updateFavicon(iconUrl);
  });
};

onMounted(() => {
  loadSettings();
});
</script>

<style scoped>
.system-settings {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.page-description {
  color: #606266;
  margin: 0;
  font-size: 14px;
}

.settings-container {
  max-width: none;
  width: 100%;
}

.settings-form {
  padding: 0;
  max-width: none;
  width: 100%;
  margin: 0 auto;
}

/* 两列布局样式 */
.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
  width: 100%;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
  align-items: start;
}

.settings-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}

/* 确保左右两列高度一致 */
.left-column,
.right-column {
  min-height: 100%;
}

/* 让卡片在列中均匀分布，但允许内容溢出时自动调整高度 */
.settings-column .settings-card {
  display: flex;
  flex-direction: column;
  height: auto; /* 允许根据内容自动调整高度 */
  flex: none; /* 不强制均分高度 */
}

.settings-column .settings-card .el-card__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: visible; /* 允许内容溢出显示 */
}

/* 协议设置卡片特殊样式 - 移除固定高度，让其自适应 */
.protocol-card .el-card__body {
  padding: 24px;
}

.protocol-card .el-form-item {
  margin-bottom: 24px;
}

.protocol-card .el-form-item:last-child {
  margin-bottom: 0;
}

/* 左列和右列样式已在.settings-column中统一定义 */

.settings-card {
  margin-bottom: 0;
  border-radius: 8px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.settings-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #303133;
}

.logo-upload-container,
.qr-upload-container,
.favicon-upload-container {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.logo-upload-area,
.qr-upload-area,
.favicon-upload-area {
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s;
  display: block;
}

.logo-upload-area:hover,
.qr-upload-area:hover,
.favicon-upload-area:hover {
  border-color: #409eff;
}

.logo-placeholder,
.qr-placeholder,
.favicon-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.logo-placeholder p,
.qr-placeholder p,
.favicon-placeholder p {
  margin: 8px 0 0 0;
  color: #8c939d;
  font-size: 12px;
}

.logo-uploader-icon,
.qr-uploader-icon,
.favicon-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}

.favicon-upload-area {
  width: 64px;
  height: 64px;
}

.favicon-placeholder {
  padding: 10px;
}

.favicon-placeholder p {
  font-size: 10px;
  text-align: center;
  line-height: 1.2;
}

.favicon-uploader-icon {
  font-size: 20px;
}

.favicon-preview {
  width: 32px;
  height: 32px;
  object-fit: contain;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.logo-preview {
  width: 200px;
  height: 60px;
  object-fit: contain;
  display: block;
}

.qr-preview {
  width: 120px;
  height: 120px;
  object-fit: contain;
  display: block;
  border-radius: 4px;
}

.logo-tips,
.qr-tips {
  flex: 1;
}

.logo-tips p,
.qr-tips p {
  margin: 0 0 8px 0;
  color: #909399;
  font-size: 12px;
}

.logo-actions,
.qr-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.form-actions {
  margin-top: 32px;
  text-align: center;
  padding: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.form-actions .el-button {
  margin: 0 8px;
  min-width: 120px;
}

/* 表单项提示样式 */
.form-item-tip {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
}

.form-item-tip .el-icon {
  font-size: 14px;
}

/* 响应式设计 */
@media (min-width: 1400px) {
  .settings-grid {
    gap: 32px;
  }
  
  .settings-container {
    padding: 24px;
  }
}

@media (max-width: 1200px) {
  .settings-grid {
    grid-template-columns: 1fr;
    gap: 20px;
    max-width: 800px;
  }
  
  .settings-container {
    padding: 16px;
  }
}

@media (max-width: 768px) {
  .system-settings {
    padding: 16px;
  }
  
  .settings-container {
    max-width: 100%;
  }
  
  .settings-grid {
    gap: 16px;
  }
  
  .settings-column {
    gap: 16px;
  }
  
  .logo-upload-container,
  .favicon-upload-container,
  .qr-upload-container {
    flex-direction: column;
    align-items: center;
  }
  
  .form-actions .el-button {
    width: 100%;
    margin: 8px 0;
  }
  
  /* 移动端上传区域优化 */
  .logo-upload-area,
  .favicon-upload-area,
  .qr-upload-area {
    width: 100%;
    max-width: 200px;
    margin: 0 auto;
  }
  
  .logo-upload-area {
    height: 60px;
  }
  
  .favicon-upload-area,
  .qr-upload-area {
    height: 80px;
  }
}

@media (max-width: 480px) {
  .system-settings {
    padding: 8px;
  }
  
  .settings-grid {
    gap: 12px;
  }
  
  .settings-column {
    gap: 12px;
  }
  
  /* 超小屏幕优化 */
  .logo-upload-area {
    height: 50px;
  }
  
  .favicon-upload-area,
  .qr-upload-area {
    height: 60px;
  }
  
  .logo-uploader-icon,
  .favicon-uploader-icon,
  .qr-uploader-icon {
    font-size: 20px;
  }
  
  .logo-placeholder p,
  .favicon-placeholder p,
  .qr-placeholder p {
    font-size: 10px;
  }
}
</style>