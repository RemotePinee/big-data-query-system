<template>
  <div class="security-settings">
    <!-- 顶部导航 -->
    <div class="top-nav">
      <button @click="goBack" class="nav-btn">
        <i class="fas fa-arrow-left"></i>
      </button>
      <h1 class="nav-title">安全设置</h1>
    </div>

    <!-- 密码设置 -->
    <div class="settings-section">
      <h3 class="section-title">密码设置</h3>
      
      <div class="setting-item" @click="showChangePassword = true">
        <div class="setting-info">
          <i class="fas fa-lock setting-icon"></i>
          <div class="setting-content">
            <div class="setting-label">修改密码</div>
            <div class="setting-desc">定期修改密码，保护账户安全</div>
          </div>
        </div>
        <i class="fas fa-chevron-right setting-arrow"></i>
      </div>
    </div>



    <!-- 登录记录 -->
    <div class="settings-section">
      <h3 class="section-title">登录记录</h3>
      
      <div class="setting-item" @click="viewLoginHistory">
        <div class="setting-info">
          <i class="fas fa-history setting-icon"></i>
          <div class="setting-content">
            <div class="setting-label">查看登录记录</div>
            <div class="setting-desc">查看最近的登录时间和设备</div>
          </div>
        </div>
        <i class="fas fa-chevron-right setting-arrow"></i>
      </div>
    </div>

    <!-- 其他设置 -->
    <div class="settings-section">
      <h3 class="section-title">其他设置</h3>
      
      <div class="setting-item" @click="clearCache">
        <div class="setting-info">
          <i class="fas fa-trash-alt setting-icon"></i>
          <div class="setting-content">
            <div class="setting-label">清除缓存</div>
            <div class="setting-desc">清除本地缓存数据</div>
          </div>
        </div>
        <i class="fas fa-chevron-right setting-arrow"></i>
      </div>

      <div class="setting-item danger-item" @click="showDeleteAccount = true">
        <div class="setting-info">
          <i class="fas fa-user-times setting-icon danger-icon"></i>
          <div class="setting-content">
            <div class="setting-label danger-text">注销账户</div>
            <div class="setting-desc">永久删除账户和所有数据</div>
          </div>
        </div>
        <i class="fas fa-chevron-right setting-arrow"></i>
      </div>
    </div>

    <!-- 修改密码弹窗 -->
    <div v-if="showChangePassword" class="modal-overlay" @click="closeChangePassword">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">修改密码</h3>
        
        <div class="form-group">
          <label class="form-label">当前密码</label>
          <div class="password-input-wrapper">
            <input 
              v-model="passwordForm.currentPassword" 
              :type="showCurrentPassword ? 'text' : 'password'"
              class="form-input"
              placeholder="请输入当前密码"
            />
            <button 
              type="button" 
              class="password-toggle"
              @click="showCurrentPassword = !showCurrentPassword"
            >
              <i :class="showCurrentPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">新密码</label>
          <div class="password-input-wrapper">
            <input 
              v-model="passwordForm.newPassword" 
              :type="showNewPassword ? 'text' : 'password'"
              class="form-input"
              placeholder="请输入新密码"
            />
            <button 
              type="button" 
              class="password-toggle"
              @click="showNewPassword = !showNewPassword"
            >
              <i :class="showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
          <div class="password-strength">
            <div class="strength-bar">
              <div 
                class="strength-fill" 
                :class="passwordStrength.class"
                :style="{ width: passwordStrength.width }"
              ></div>
            </div>
            <span class="strength-text" :class="passwordStrength.class">
              {{ passwordStrength.text }}
            </span>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">确认新密码</label>
          <div class="password-input-wrapper">
            <input 
              v-model="passwordForm.confirmPassword" 
              :type="showConfirmPassword ? 'text' : 'password'"
              class="form-input"
              placeholder="请再次输入新密码"
            />
            <button 
              type="button" 
              class="password-toggle"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>

        <div class="modal-actions">
          <button @click="closeChangePassword" class="btn-cancel">
            取消
          </button>
          <button 
            @click="handleChangePassword" 
            class="btn-confirm"
            :disabled="!canSubmitPassword || changingPassword"
          >
            <i class="fas fa-spinner fa-spin" v-if="changingPassword"></i>
            {{ changingPassword ? '修改中...' : '确认修改' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 注销账户确认弹窗 -->
    <div v-if="showDeleteAccount" class="modal-overlay" @click="closeDeleteAccount">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title danger-text">注销账户</h3>
        <p class="modal-desc">
          注销账户将永久删除您的所有数据，包括订单记录、查询历史等，此操作不可恢复。
        </p>
        
        <div class="form-group">
          <label class="form-label">请输入密码确认</label>
          <input 
            v-model="deleteAccountForm.password" 
            type="password"
            class="form-input"
            placeholder="请输入当前密码"
          />
        </div>

        <div class="form-group">
          <label class="form-label">注销原因</label>
          <textarea 
            v-model="deleteAccountForm.reason" 
            class="form-textarea"
            placeholder="请简要说明注销原因（必填）"
            rows="3"
          ></textarea>
        </div>

        <div class="modal-actions">
          <button @click="closeDeleteAccount" class="btn-cancel">
            取消
          </button>
          <button 
            @click="handleDeleteAccount" 
            class="btn-danger"
            :disabled="!deleteAccountForm.password || !deleteAccountForm.reason || deletingAccount"
          >
            <i class="fas fa-spinner fa-spin" v-if="deletingAccount"></i>
            {{ deletingAccount ? '注销中...' : '确认注销' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { userApi } from '@/api/user.ts'

const router = useRouter()
const userStore = useUserStore()

// 安全设置
const securitySettings = ref({
  loginProtection: true,
  smsVerification: false,
  emailNotification: true
})

// 修改密码相关
const showChangePassword = ref(false)
const changingPassword = ref(false)
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 注销账户相关
const showDeleteAccount = ref(false)
const deletingAccount = ref(false)
const deleteAccountForm = ref({
  password: '',
  reason: ''
})

// 密码强度计算
const passwordStrength = computed(() => {
  const password = passwordForm.value.newPassword
  if (!password) {
    return { width: '0%', class: '', text: '' }
  }
  
  let score = 0
  let feedback = []
  
  // 长度检查
  if (password.length >= 8) score += 1
  else feedback.push('至少8位')
  
  // 包含数字
  if (/\d/.test(password)) score += 1
  else feedback.push('包含数字')
  
  // 包含小写字母
  if (/[a-z]/.test(password)) score += 1
  else feedback.push('包含小写字母')
  
  // 包含大写字母
  if (/[A-Z]/.test(password)) score += 1
  else feedback.push('包含大写字母')
  
  // 包含特殊字符
  if (/[^\w\s]/.test(password)) score += 1
  else feedback.push('包含特殊字符')
  
  if (score <= 2) {
    return {
      width: '33%',
      class: 'weak',
      text: '弱 - ' + feedback.slice(0, 2).join('、')
    }
  } else if (score <= 3) {
    return {
      width: '66%',
      class: 'medium',
      text: '中等 - ' + (feedback.length > 0 ? feedback[0] : '还可以更强')
    }
  } else {
    return {
      width: '100%',
      class: 'strong',
      text: '强'
    }
  }
})

// 是否可以提交密码修改
const canSubmitPassword = computed(() => {
  return passwordForm.value.currentPassword &&
         passwordForm.value.newPassword &&
         passwordForm.value.confirmPassword &&
         passwordForm.value.newPassword === passwordForm.value.confirmPassword &&
         passwordForm.value.newPassword.length >= 6
})

// 返回上一页
const goBack = () => {
  router.back()
}

// 更新安全设置
const updateSetting = async (key, value) => {
  try {
    // 这里可以调用API保存设置
    console.log(`更新设置: ${key} = ${value}`)
    ElMessage.success('设置已更新')
  } catch (error) {
    console.error('更新设置失败:', error)
    ElMessage.error('设置更新失败')
    // 回滚设置
    securitySettings.value[key] = !value
  }
}

// 查看登录记录
const viewLoginHistory = () => {
  ElMessage.info('登录记录功能开发中')
}

// 清除缓存
const clearCache = async () => {
  try {
    const result = await ElMessageBox.confirm(
      '清除缓存后需要重新登录，确定要继续吗？',
      '清除缓存',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    if (result === 'confirm') {
      // 清除本地存储
      localStorage.clear()
      sessionStorage.clear()
      
      ElMessage.success('缓存已清除')
      
      // 跳转到移动端登录页
      setTimeout(() => {
        router.push('/mobile/login')
      }, 1000)
    }
  } catch (error) {
    // 用户取消
  }
}

// 关闭修改密码弹窗
const closeChangePassword = () => {
  showChangePassword.value = false
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  showCurrentPassword.value = false
  showNewPassword.value = false
  showConfirmPassword.value = false
}

// 处理密码修改
const handleChangePassword = async () => {
  if (!canSubmitPassword.value) return
  
  try {
    changingPassword.value = true
    
    const response = await userApi.changePassword({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword
    })
    
    if (response.code === 200) {
      ElMessage.success('密码修改成功')
      closeChangePassword()
    } else {
      ElMessage.error(response.message || '密码修改失败')
    }
  } catch (error) {
    console.error('修改密码失败:', error)
    ElMessage.error('密码修改失败，请稍后重试')
  } finally {
    changingPassword.value = false
  }
}

// 关闭注销账户弹窗
const closeDeleteAccount = () => {
  showDeleteAccount.value = false
  deleteAccountForm.value = {
    password: '',
    reason: ''
  }
}

// 处理账户注销
const handleDeleteAccount = async () => {
  if (!deleteAccountForm.value.password || !deleteAccountForm.value.reason) {
    ElMessage.error('请填写完整信息')
    return
  }
  
  try {
    deletingAccount.value = true
    
    const response = await userApi.requestAccountDeletion({
      password: deleteAccountForm.value.password,
      reason: deleteAccountForm.value.reason
    })
    
    if (response.code === 200) {
      ElMessage.success('账户注销申请已提交，将在3个工作日内处理')
      closeDeleteAccount()
    } else {
      ElMessage.error(response.message || '注销申请提交失败')
    }
  } catch (error) {
    console.error('注销账户失败:', error)
    ElMessage.error('注销申请提交失败，请稍后重试')
  } finally {
    deletingAccount.value = false
  }
}

onMounted(() => {
  // 初始化安全设置
})
</script>

<style scoped>
.security-settings {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 0 16px 20px 16px;
}

/* 顶部导航 */
.top-nav {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  background: #fff;
  position: sticky;
  margin-top: 10px;
  margin-bottom: 15px;
  border-radius: 12px;
  top: 0;
  z-index: 100;
  position: relative;
}

.nav-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.nav-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: #f8f9fa;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-btn:hover {
  background: #e9ecef;
}



/* 设置区域 */
.settings-section {
  background: #fff;
  margin-bottom: 20px;
  padding: 20px 16px;
  border-radius: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid #f8f9fa;
  cursor: pointer;
  transition: all 0.2s ease;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item:hover {
  background: #f8f9fa;
  margin: 0 -20px;
  padding-left: 20px;
  padding-right: 20px;
  border-radius: 10px;
}

.setting-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.setting-icon {
  width: 20px;
  color: #666;
  margin-right: 12px;
}

.setting-content {
  flex: 1;
}

.setting-label {
  font-size: 16px;
  color: #333;
  font-weight: 500;
  margin-bottom: 4px;
}

.setting-desc {
  font-size: 14px;
  color: #666;
}

.setting-arrow {
  color: #ccc;
  font-size: 14px;
}

/* 开关样式 */
.setting-switch {
  position: relative;
}

.setting-switch input[type="checkbox"] {
  display: none;
}

.switch-label {
  display: block;
  width: 50px;
  height: 28px;
  background: #ccc;
  border-radius: 14px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

.switch-label::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 24px;
  height: 24px;
  background: #fff;
  border-radius: 50%;
  transition: all 0.3s ease;
}

input[type="checkbox"]:checked + .switch-label {
  background: #007bff;
}

input[type="checkbox"]:checked + .switch-label::after {
  left: 24px;
}

/* 危险操作样式 */
.danger-item .setting-icon.danger-icon {
  color: #dc3545;
}

.danger-text {
  color: #dc3545 !important;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  width: 100%;
  max-width: 400px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px 0;
  text-align: center;
}

.modal-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 20px;
}

/* 表单样式 */
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

.password-input-wrapper {
  position: relative;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: #f8f9fa;
  border-radius: 10px;
  font-size: 16px;
  color: #333;
  transition: all 0.2s ease;
  box-sizing: border-box;
  font-family: inherit;
}

.form-input {
  padding-right: 48px;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  background: #e9ecef;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: none;
  color: #666;
  cursor: pointer;
  padding: 4px;
}

/* 密码强度 */
.password-strength {
  margin-top: 8px;
}

.strength-bar {
  height: 4px;
  background: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 4px;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s ease;
}

.strength-fill.weak {
  background: #dc3545;
}

.strength-fill.medium {
  background: #ffc107;
}

.strength-fill.strong {
  background: #28a745;
}

.strength-text {
  font-size: 12px;
}

.strength-text.weak {
  color: #dc3545;
}

.strength-text.medium {
  color: #ffc107;
}

.strength-text.strong {
  color: #28a745;
}

/* 按钮样式 */
.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn-cancel,
.btn-confirm,
.btn-danger {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-cancel {
  background: #f8f9fa;
  color: #333;
}

.btn-cancel:hover {
  background: #e9ecef;
}

.btn-confirm {
  background: #007bff;
  color: #fff;
}

.btn-confirm:hover:not(:disabled) {
  background: #0056b3;
}

.btn-confirm:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-danger {
  background: #dc3545;
  color: #fff;
}

.btn-danger:hover:not(:disabled) {
  background: #c82333;
}

.btn-danger:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>