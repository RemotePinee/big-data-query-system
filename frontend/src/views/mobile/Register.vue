<template>
  <div class="mobile-register">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="decoration-circle circle-1"></div>
      <div class="decoration-circle circle-2"></div>
      <div class="decoration-blob blob-1"></div>
    </div>

    <!-- 头部 -->
    <div class="header">
      <button class="back-btn" @click="goBack">
        <i class="fas fa-arrow-left"></i>
      </button>
      <h1 class="title">注册</h1>
    </div>

    <!-- 注册表单 -->
    <div class="register-container">
      <div class="register-card">
        <!-- Logo区域 -->
        <div class="logo-section">
          <div class="logo">
            <i class="fas fa-database"></i>
          </div>
          <h2 class="app-name">数据查询平台</h2>
          <p class="welcome-text">创建您的账户，开始数据查询之旅</p>
        </div>

        <!-- 表单区域 -->
        <form @submit.prevent="handleRegister" class="register-form">
          <div class="form-group">
            <div class="input-wrapper">
              <i class="fas fa-user input-icon"></i>
              <input
                v-model="registerForm.username"
                type="text"
                placeholder="请输入用户名 *"
                class="form-input"
                required
                minlength="3"
                maxlength="20"
              />
            </div>
            <div class="input-hint">用户名长度为3-20个字符（必填）</div>
          </div>



          <div class="form-group">
            <div class="input-wrapper">
              <i class="fas fa-phone input-icon"></i>
              <input
                v-model="registerForm.phone"
                type="tel"
                placeholder="请输入手机号码 *"
                class="form-input"
                pattern="[0-9]{11}"
                required
              />
            </div>
            <div class="input-hint">请输入11位手机号码（必填）</div>
          </div>

          <div class="form-group">
            <div class="input-wrapper">
              <i class="fas fa-lock input-icon"></i>
              <input
                v-model="registerForm.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="请输入密码 *"
                class="form-input"
                required
                minlength="6"
              />
              <button
                type="button"
                class="password-toggle"
                @click="showPassword = !showPassword"
              >
                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
            <div v-if="registerForm.password" class="password-strength">
              <div class="strength-bar">
                <div 
                  class="strength-fill" 
                  :class="passwordStrength.level"
                  :style="{ width: passwordStrength.width }"
                ></div>
              </div>
              <span class="strength-text" :class="passwordStrength.level">
                {{ passwordStrength.text }}
              </span>
            </div>
          </div>

          <div class="form-group">
            <div class="input-wrapper">
              <i class="fas fa-lock input-icon"></i>
              <input
                v-model="registerForm.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="请确认密码 *"
                class="form-input"
                required
              />
              <button
                type="button"
                class="password-toggle"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
            <div class="input-hint" :class="{ error: passwordMismatch }">
              {{ passwordMismatch ? '两次输入的密码不一致' : '请再次输入密码确认（必填）' }}
            </div>
          </div>



          <!-- 协议同意 -->
          <div class="agreement">
            <label class="agreement-checkbox">
              <input type="checkbox" v-model="agreeToTerms" required>
              <span class="checkmark"></span>
              <span class="agreement-text">
                我已阅读并同意
                <a href="#" class="agreement-link">《用户协议》</a>
                和
                <a href="#" class="agreement-link">《隐私政策》</a>
              </span>
            </label>
          </div>

          <button
            type="submit"
            class="register-btn"
            :disabled="loading || !canSubmit"
            :class="{ loading: loading, 'register-btn-active': hasInput }"
          >
            <span v-if="!loading">立即注册</span>
            <span v-else class="loading-text">
              <i class="fas fa-spinner fa-spin"></i>
              注册中...
            </span>
          </button>
        </form>

        <!-- 登录链接 -->
        <div class="login-link">
          <span>已有账户？</span>
          <router-link to="/mobile/login" class="login-btn-link">立即登录</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

// 表单数据
const registerForm = reactive({
  username: '',
  phone: '',
  password: '',
  confirmPassword: ''
})

// 状态
const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const agreeToTerms = ref(false)

// 密码强度计算
const passwordStrength = computed(() => {
  const password = registerForm.password
  if (!password) {
    return { level: 'none', width: '0%', text: '' }
  }
  
  let score = 0
  let feedback = []
  
  // 长度检查
  if (password.length >= 8) score += 2
  else if (password.length >= 6) score += 1
  else feedback.push('至少6位')
  
  // 包含数字
  if (/\d/.test(password)) score += 1
  else feedback.push('包含数字')
  
  // 包含小写字母
  if (/[a-z]/.test(password)) score += 1
  else feedback.push('包含小写字母')
  
  // 包含大写字母
  if (/[A-Z]/.test(password)) score += 1
  
  // 包含特殊字符
  if (/[^\w\s]/.test(password)) score += 1
  
  if (score <= 2) {
    return { level: 'weak', width: '33%', text: '弱' }
  } else if (score <= 4) {
    return { level: 'medium', width: '66%', text: '中等' }
  } else {
    return { level: 'strong', width: '100%', text: '强' }
  }
})

// 密码不匹配检查
const passwordMismatch = computed(() => {
  return registerForm.confirmPassword && 
         registerForm.password !== registerForm.confirmPassword
})

// 表单验证
const canSubmit = computed(() => {
  return registerForm.username.trim() &&
         registerForm.phone.trim() &&
         registerForm.password.trim() &&
         registerForm.confirmPassword.trim() &&
         !passwordMismatch.value &&
         agreeToTerms.value
})

// 表单是否有输入
const hasInput = computed(() => {
  return registerForm.username.trim() &&
         registerForm.phone.trim() &&
         registerForm.password.trim() &&
         registerForm.confirmPassword.trim()
})

// 返回上一页
const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/mobile/home')
  }
}

// 发送验证码


// 处理注册
const handleRegister = async () => {
  if (!canSubmit.value) {
    ElMessage.warning('请填写所有必填项：用户名、手机号、密码')
    return
  }
  
  loading.value = true
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: registerForm.username,
        phone: registerForm.phone,
        password: registerForm.password
      })
    })
    
    const data = await response.json()
    
    if (data.code === 201) {
      // 注册成功，保存token和用户信息
      if (data.data.token) {
        localStorage.setItem('token', data.data.token)
        localStorage.setItem('userInfo', JSON.stringify(data.data.user))
      }
      ElMessage.success('注册成功，正在跳转...')
      router.push('/mobile/login')
    } else {
      ElMessage.error(data.message || '注册失败')
    }
  } catch (error) {
    console.error('注册失败:', error)
    ElMessage.error('网络错误，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.mobile-register {
  min-height: 100vh;
  position: relative;
  background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 背景装饰 */
.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(156, 163, 175, 0.05);
  backdrop-filter: blur(10px);
}

.circle-1 {
  width: 200px;
  height: 200px;
  top: -100px;
  right: -100px;
  animation: float 6s ease-in-out infinite;
}

.circle-2 {
  width: 150px;
  height: 150px;
  bottom: -75px;
  left: -75px;
  animation: float 8s ease-in-out infinite reverse;
}

.decoration-blob {
  position: absolute;
  background: rgba(156, 163, 175, 0.03);
  border-radius: 50%;
  filter: blur(40px);
}

.blob-1 {
  width: 300px;
  height: 300px;
  top: 20%;
  left: -150px;
  animation: blob 10s ease-in-out infinite;
}

/* 头部 */
.header {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  padding: 20px;
  padding-top: 40px;
}

.back-btn {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-size: 16px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(156, 163, 175, 0.1);
}

.back-btn:hover {
  background: rgba(255, 255, 255, 1);
  transform: translateX(-2px);
  box-shadow: 0 6px 16px rgba(156, 163, 175, 0.15);
}

.header .title {
  flex: 1;
  text-align: center;
  color: #2d3748;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  margin-right: 40px;
}

/* 注册容器 */
.register-container {
  position: relative;
  z-index: 10;
  padding: 0 20px 40px;
}

.register-card {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 30px 25px;
  box-shadow: 0 20px 40px rgba(156, 163, 175, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

/* Logo区域 */
.logo-section {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #e5e7eb, #d1d5db);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  box-shadow: 0 8px 24px rgba(156, 163, 175, 0.2);
}

.logo i {
  font-size: 28px;
  color: white;
}

.app-name {
  font-size: 20px;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 6px;
}

.welcome-text {
  color: #718096;
  font-size: 13px;
  margin: 0;
}

/* 表单样式 */
.register-form {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  color: #a0aec0;
  font-size: 14px;
  z-index: 2;
}

.form-input {
  width: 100%;
  height: 50px;
  padding: 0 45px 0 45px;
  border: 2px solid #e9ecef;
  border-radius: 14px;
  font-size: 15px;
  background: linear-gradient(135deg, #f8f9fb 0%, #f0f2f5 100%);
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #9ca3af;
  background: white;
  box-shadow: 0 0 0 3px rgba(156, 163, 175, 0.08);
}

.password-toggle {
  position: absolute;
  right: 14px;
  background: none;
  border: none;
  color: #a0aec0;
  font-size: 14px;
  cursor: pointer;
  padding: 6px;
  z-index: 2;
}

.password-toggle:hover {
  color: #9ca3af;
}

.input-hint {
  font-size: 12px;
  color: #a0aec0;
  margin-top: 4px;
  margin-left: 4px;
}

.input-hint.error {
  color: #e53e3e;
}

/* 密码强度 */
.password-strength {
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background: #f3f4f6;
  border-radius: 2px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 2px;
}

.strength-fill.weak {
  background: #f87171;
}

.strength-fill.medium {
  background: #fbbf24;
}

.strength-fill.strong {
  background: #a3a3a3;
}

.strength-text {
  font-size: 12px;
  font-weight: 500;
  min-width: 30px;
}

.strength-text.weak {
  color: #f87171;
}

.strength-text.medium {
  color: #fbbf24;
}

.strength-text.strong {
  color: #a3a3a3;
}

/* 验证码 */
.verification-wrapper {
  display: flex;
  gap: 10px;
}

.verification-input {
  flex: 1;
}

.send-code-btn {
  height: 48px;
  padding: 0 16px;
  background: #9ca3af;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  min-width: 100px;
}

.send-code-btn:hover:not(:disabled) {
  background: #6b7280;
}

.send-code-btn:disabled {
  background: #a0aec0;
  cursor: not-allowed;
}

/* 协议同意 */
.agreement {
  margin-bottom: 20px;
}

.agreement-checkbox {
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  font-size: 13px;
  color: #4a5568;
  line-height: 1.4;
}

.agreement-checkbox input {
  display: none;
}

.checkmark {
  width: 16px;
  height: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 3px;
  margin-right: 8px;
  margin-top: 1px;
  position: relative;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.agreement-checkbox input:checked + .checkmark {
  background: #9ca3af;
  border-color: #9ca3af;
}

.agreement-checkbox input:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: -2px;
  left: 1px;
  color: white;
  font-size: 11px;
  font-weight: bold;
}

.agreement-text {
  flex: 1;
}

.agreement-link {
  color: #9ca3af;
  text-decoration: none;
}

.agreement-link:hover {
  text-decoration: underline;
}

/* 注册按钮 */
.register-btn {
  width: 100%;
  height: 50px;
  background: linear-gradient(135deg, #e5e7eb, #d1d5db);
  color: #374151;
  border: none;
  border-radius: 14px;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  margin-top: 10px;
}

.register-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(156, 163, 175, 0.2);
}

.register-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.register-btn-active {
  background: linear-gradient(135deg, #374151, #1f2937) !important;
  color: white !important;
}

.register-btn-active:hover:not(:disabled) {
  background: linear-gradient(135deg, #1f2937, #111827) !important;
  box-shadow: 0 8px 25px rgba(31, 41, 55, 0.3);
}

.loading-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

/* 登录链接 */
.login-link {
  text-align: center;
  font-size: 13px;
  color: #718096;
}

.login-btn-link {
  color: #6b7280;
  text-decoration: none;
  font-weight: 600;
  margin-left: 8px;
}

.login-btn-link:hover {
  text-decoration: underline;
}

/* 动画 */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes blob {
  0%, 100% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

/* 响应式设计 */
@media (max-width: 480px) {
  .register-card {
    padding: 25px 20px;
  }
  
  .app-name {
    font-size: 18px;
  }
  
  .logo {
    width: 50px;
    height: 50px;
  }
  
  .logo i {
    font-size: 24px;
  }
  
  .form-input {
    height: 44px;
    font-size: 13px;
  }
  
  .send-code-btn {
    height: 44px;
    min-width: 90px;
    font-size: 12px;
  }
}
</style>