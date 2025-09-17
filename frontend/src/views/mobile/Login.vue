<template>
  <div class="mobile-login">
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
      <h1 class="title">登录</h1>
    </div>

    <!-- 登录表单 -->
    <div class="login-container">
      <div class="login-card">
        <!-- Logo区域 -->
        <div class="logo-section">
          <div class="logo">
            <i class="fas fa-database"></i>
          </div>
          <h2 class="app-name">数据查询平台</h2>
          <p class="welcome-text">欢迎回来，请登录您的账户</p>
        </div>

        <!-- 表单区域 -->
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <div class="input-wrapper">
              <i class="fas fa-user input-icon"></i>
              <input
                v-model="loginForm.username"
                type="text"
                placeholder="请输入用户名或邮箱"
                class="form-input"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <div class="input-wrapper">
              <i class="fas fa-lock input-icon"></i>
              <input
                v-model="loginForm.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="请输入密码"
                class="form-input"
                required
              />
              <button
                type="button"
                class="password-toggle"
                @click="showPassword = !showPassword"
              >
                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
          </div>

          <div class="form-options">
            <label class="remember-me">
              <input type="checkbox" v-model="rememberMe">
              <span class="checkmark"></span>
              记住我
            </label>
            <a href="#" class="forgot-password">忘记密码？</a>
          </div>

          <button
            type="submit"
            class="login-btn"
            :class="{ loading: loading, 'login-btn-active': canSubmit }"
            :disabled="loading"
          >
            <span v-if="!loading">登录</span>
            <span v-else class="loading-text">
              <i class="fas fa-spinner fa-spin"></i>
              登录中...
            </span>
          </button>
        </form>



        <!-- 注册链接 -->
        <div class="register-link">
          <span>还没有账户？</span>
          <router-link to="/mobile/register" class="register-btn">立即注册</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

// 表单数据
const loginForm = reactive({
  username: '',
  password: ''
})

// 状态
const loading = ref(false)
const showPassword = ref(false)
const rememberMe = ref(false)

// 表单验证
const canSubmit = computed(() => {
  return loginForm.username.trim() && loginForm.password.trim()
})

// 返回上一页
const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/mobile/home')
  }
}

// 处理登录
const handleLogin = async () => {
  if (!loginForm.username || !loginForm.password) {
    ElMessage.warning('请填写完整的登录信息')
    return
  }

  loading.value = true
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: loginForm.username,
        password: loginForm.password
      })
    })

    const data = await response.json()

    if (data.code === 200) {
      // 更新用户状态
      userStore.setLoginState(data.data.user, data.data.token)
      
      ElMessage.success('登录成功')
      
      // 跳转到个人中心或返回上一页
      const redirect = router.currentRoute.value.query.redirect
      if (redirect) {
        router.push(redirect)
      } else {
        router.push('/mobile/profile')
      }
    } else {
      ElMessage.error(data.message || '登录失败')
    }
  } catch (error) {
    console.error('登录失败:', error)
    ElMessage.error('网络错误，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.mobile-login {
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

/* 登录容器 */
.login-container {
  position: relative;
  z-index: 10;
  padding: 0 20px 40px;
  flex: 1;
  display: flex;
  align-items: center;
}

.login-card {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 40px 30px;
  box-shadow: 0 20px 40px rgba(156, 163, 175, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.8);
  width: 100%;
}

/* Logo区域 */
.logo-section {
  text-align: center;
  margin-bottom: 40px;
}

.logo {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #e5e7eb, #d1d5db);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  box-shadow: 0 10px 30px rgba(156, 163, 175, 0.2);
}

.logo i {
  font-size: 36px;
  color: white;
}

.app-name {
  font-size: 24px;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 8px;
}

.welcome-text {
  color: #718096;
  font-size: 14px;
  margin: 0;
}

/* 表单样式 */
.login-form {
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 16px;
  color: #a0aec0;
  font-size: 16px;
  z-index: 2;
}

.form-input {
  width: 100%;
  height: 56px;
  padding: 0 50px 0 50px;
  border: 2px solid #e9ecef;
  border-radius: 16px;
  font-size: 16px;
  background: linear-gradient(135deg, #f8f9fb 0%, #f0f2f5 100%);
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #6b7280;
  background: white;
  box-shadow: 0 0 0 3px rgba(156, 163, 175, 0.08);
}

.password-toggle {
  position: absolute;
  right: 16px;
  background: none;
  border: none;
  color: #a0aec0;
  font-size: 16px;
  cursor: pointer;
  padding: 8px;
  z-index: 2;
}

.password-toggle:hover {
  color: #6b7280;
}

/* 表单选项 */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.remember-me {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: #4a5568;
}

.remember-me input {
  display: none;
}

.checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid #e2e8f0;
  border-radius: 4px;
  margin-right: 8px;
  position: relative;
  transition: all 0.3s ease;
}

.remember-me input:checked + .checkmark {
  background: #9ca3af;
  border-color: #9ca3af;
}

.remember-me input:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: -2px;
  left: 2px;
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.forgot-password {
  color: #6b7280;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}

.forgot-password:hover {
  text-decoration: underline;
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  height: 56px;
  background: linear-gradient(135deg, #9ca3af, #6b7280);
  border: none;
  border-radius: 16px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(156, 163, 175, 0.2);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-btn-active {
  background: linear-gradient(135deg, #374151, #1f2937) !important;
  color: white !important;
}

.login-btn-active:hover:not(:disabled) {
  background: linear-gradient(135deg, #1f2937, #111827) !important;
  box-shadow: 0 10px 30px rgba(31, 41, 55, 0.3);
}

.loading-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}



/* 注册链接 */
.register-link {
  text-align: center;
  font-size: 14px;
  color: #718096;
}

.register-btn {
  color: #6b7280;
  text-decoration: none;
  font-weight: 600;
  margin-left: 8px;
}

.register-btn:hover {
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
  .login-card {
    padding: 30px 20px;
  }
  
  .app-name {
    font-size: 20px;
  }
  
  .logo {
    width: 60px;
    height: 60px;
  }
  
  .logo i {
    font-size: 28px;
  }
}
</style>