<template>
  <div class="admin-login-page">
    <div class="login-container">
      <!-- 左侧插画区域 -->
      <div class="left-panel">
        <!-- 装饰性背景元素 -->
        <div class="bg-decorations">
        <div class="grid-pattern"></div>
      </div>
      
      <!-- 弧形分割线 -->
      <svg class="curved-divider" viewBox="0 0 100 100" preserveAspectRatio="none">
        <ellipse cx="100" cy="50" rx="50" ry="50" fill="white"/>
      </svg>
        
        <div class="brand-section">
          <h2 class="brand-title">数据管理平台</h2>
          <p class="brand-subtitle">Data Management Platform</p>
          <div class="brand-divider"></div>
        </div>
        
        <div class="illustration">
          <div class="dashboard-preview">
            <!-- 模拟仪表盘界面 -->
            <div class="dashboard-header">
              <div class="header-dot"></div>
              <div class="header-dot"></div>
              <div class="header-dot"></div>
            </div>
            <div class="dashboard-content">
              <div class="chart-area">
                <div class="chart-bar bar-1"></div>
                <div class="chart-bar bar-2"></div>
                <div class="chart-bar bar-3"></div>
                <div class="chart-bar bar-4"></div>
                <div class="chart-bar bar-5"></div>
              </div>
              <div class="stats-cards">
                <div class="stat-card card-1"></div>
                <div class="stat-card card-2"></div>
              </div>
            </div>
          </div>
          
          <!-- 浮动数据元素 -->
          <div class="floating-elements">
            <div class="floating-item item-1">📈</div>
            <div class="floating-item item-2">💡</div>
            <div class="floating-item item-3">🎯</div>
            <div class="floating-item item-4">⚙️</div>
          </div>
        </div>
        
        <div class="features">
          <div class="feature-item">
            <div class="feature-icon-bg">
              <span class="feature-icon">📊</span>
            </div>
            <span>智能分析</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon-bg">
              <span class="feature-icon">🔒</span>
            </div>
            <span>安全可靠</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon-bg">
              <span class="feature-icon">⚡</span>
            </div>
            <span>高效管理</span>
          </div>
        </div>
      </div>
      
      <!-- 右侧登录区域 -->
      <div class="right-panel">
        <div class="login-card">
          <div class="login-header">
            <h1 class="login-title">欢迎登录</h1>
            <p class="login-subtitle">请输入您的账号信息</p>
          </div>
          
          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="rules"
            class="login-form"
            size="large"
            @keyup.enter="handleLogin"
          >
            <el-form-item prop="username">
              <el-input
                v-model="loginForm.username"
                placeholder="请输入用户名"
                prefix-icon="User"
                class="login-input"
              />
            </el-form-item>
            
            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                prefix-icon="Lock"
                show-password
                class="login-input"
              />
            </el-form-item>
            
            <el-button
              type="primary"
              class="login-btn"
              :loading="loading"
              @click="handleLogin"
              size="large"
            >
              {{ loading ? '登录中...' : '登录' }}
            </el-button>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElForm } from 'element-plus';
import { User, Lock, Right, Loading, ArrowLeft } from '@element-plus/icons-vue';
import { login } from '@/api/user.ts';
import { saveUserInfo } from '@/utils';

const router = useRouter();
const route = useRoute();

// 表单引用
const loginFormRef = ref();

// 加载状态
const loading = ref(false);

// 表单数据
const loginForm = reactive({
  username: '',
  password: ''
});

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入管理员账号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
};

// 登录处理
const handleLogin = async () => {
  if (!loginFormRef.value) return;
  
  try {
    await loginFormRef.value.validate();
  } catch (error) {
    return;
  }

  loading.value = true;

  try {
    const res = await login({
      username: loginForm.username,
      password: loginForm.password
    });
    
    // 检查是否为管理员
    if (res.data.user.role !== 'admin') {
      ElMessage.error('此账号无管理员权限，请使用管理员账号登录');
      return;
    }
    
    // 保存token和用户信息
    localStorage.setItem('token', res.data.token);
    saveUserInfo(res.data.user);
    
    ElMessage.success('登录成功');
    
    // 跳转到管理后台
    const redirect = route.query.redirect;
    if (redirect && redirect.toString().startsWith('/admin')) {
      router.replace(redirect.toString());
    } else {
      router.replace('/admin');
    }
  } catch (error) {
    console.error('登录失败:', error);
    
    if (error.response) {
      const message = error.response.data?.message || '登录失败，请检查用户名和密码';
      ElMessage.error(message);
    } else if (error.request) {
      ElMessage.error('网络连接失败，请检查网络连接');
    } else {
      ElMessage.error('登录失败，请稍后重试');
    }
  } finally {
    loading.value = false;
  }
};

// 返回用户登录
const goToUserLogin = () => {
  router.push('/login');
};
</script>

<style scoped>
/* 导入后台管理主题 */
@import '@/assets/admin-theme.css';

.admin-login-page {
  min-height: 100vh;
  background: var(--admin-gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.admin-login-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 80%, rgba(192, 250, 160, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%);
  z-index: 1;
}

.login-container {
  display: flex;
  width: 100%;
  max-width: 1000px;
  height: 600px;
  background: transparent;
  backdrop-filter: blur(var(--admin-glass-blur));
  border-radius: var(--admin-radius-2xl);
  box-shadow: var(--admin-shadow-xl);
  border: none;
  overflow: hidden;
  position: relative;
  z-index: 2;
  animation: fadeInUp 0.8s ease-out;
}

/* 左侧插画区域 */
.left-panel {
  flex: 1;
  background: var(--admin-gradient-primary);
  padding: 3rem 2rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  border-top-left-radius: var(--admin-radius-2xl);
  border-bottom-left-radius: var(--admin-radius-2xl);
  box-shadow: var(--admin-shadow-xl);
}

/* 弧形分割线 */
.curved-divider {
  position: absolute;
  top: 0;
  right: -1px;
  width: 80px;
  height: 100%;
  z-index: 100;
  pointer-events: none;
}

.left-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    linear-gradient(45deg, transparent 30%, rgba(192, 250, 160, 0.1) 50%, transparent 70%),
    radial-gradient(circle at 30% 70%, rgba(192, 250, 160, 0.15) 0%, transparent 50%);
  z-index: 1;
}

/* 装饰性背景元素 */
.bg-decorations {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}



.grid-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(90deg, rgba(192, 250, 160, 0.1) 1px, transparent 1px),
    linear-gradient(rgba(192, 250, 160, 0.1) 1px, transparent 1px);
  background-size: 40px 40px;
  opacity: 0.3;
}



.brand-section {
  position: relative;
  z-index: 2;
  text-align: center;
  margin-bottom: 2.5rem;
  margin-top: 3rem;
}

.brand-icon-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 1.5rem;
}

.brand-icon {
  font-size: 4rem;
  display: block;
  position: relative;
  z-index: 2;
}

.icon-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  background: radial-gradient(circle, rgba(192, 250, 160, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
  100% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.8; }
}

.brand-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--admin-secondary);
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: -0.5px;
}

.brand-subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  font-weight: 300;
  margin-bottom: 1rem;
}

.brand-divider {
  width: 60px;
  height: 3px;
  background: var(--admin-secondary);
  margin: 0 auto;
  border-radius: 2px;
  box-shadow: 0 0 10px rgba(192, 250, 160, 0.5);
}

.illustration {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  flex: 1;
  padding-top: 2rem;
  transform: scale(1.2);
}

/* 仪表盘预览 */
.dashboard-preview {
  width: 200px;
  height: 140px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  animation: dashboardFloat 4s ease-in-out infinite;
  position: relative;
  overflow: hidden;
}

@keyframes dashboardFloat {
  0%, 100% { 
    transform: translateY(0px) scale(1); 
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }
  50% { 
    transform: translateY(-10px) scale(1.02); 
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
  }
}

.dashboard-header {
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
}

.header-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(192, 250, 160, 0.6);
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chart-area {
  display: flex;
  align-items: end;
  gap: 8px;
  height: 80px;
  padding: 0 8px;
}

.chart-bar {
  background: linear-gradient(to top, var(--admin-secondary), rgba(192, 250, 160, 0.6));
  border-radius: 3px 3px 0 0;
  width: 20px;
  animation: chartGrow 3s ease-in-out infinite;
}

.bar-1 { height: 40%; animation-delay: 0s; }
.bar-2 { height: 70%; animation-delay: 0.2s; }
.bar-3 { height: 90%; animation-delay: 0.4s; }
.bar-4 { height: 60%; animation-delay: 0.6s; }
.bar-5 { height: 80%; animation-delay: 0.8s; }

@keyframes chartGrow {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(1.1); }
}

.stats-cards {
  display: flex;
  gap: 8px;
}

.stat-card {
  flex: 1;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* 浮动元素 */
.floating-elements {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.floating-item {
  position: absolute;
  font-size: 1.5rem;
  animation: floatAround 8s ease-in-out infinite;
}

.item-1 {
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.item-2 {
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.item-3 {
  bottom: 30%;
  left: 20%;
  animation-delay: 4s;
}

.item-4 {
  top: 40%;
  right: 30%;
  animation-delay: 6s;
}

@keyframes floatAround {
  0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.6; }
  25% { transform: translateY(-15px) rotate(90deg); opacity: 0.8; }
  50% { transform: translateY(-10px) rotate(180deg); opacity: 1; }
  75% { transform: translateY(-20px) rotate(270deg); opacity: 0.8; }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.features {
  position: absolute;
  bottom: 3rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex !important;
  flex-direction: row !important;
  gap: 1rem;
  z-index: 2;
  justify-content: center;
  flex-wrap: wrap;
  width: 90%;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.85rem;
  padding: 0.4rem 0.8rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  white-space: nowrap;
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.feature-icon-bg {
  width: 24px;
  height: 24px;
  background: rgba(192, 250, 160, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(192, 250, 160, 0.3);
}

.feature-icon {
  font-size: 0.9rem;
}



.floating-icon {
  position: absolute;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  animation: floatIcon 4s ease-in-out infinite;
}

.floating-1 {
  top: 20px;
  right: 30px;
  animation-delay: 1s;
}

.floating-2 {
  bottom: 30px;
  left: 30px;
  animation-delay: 3s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes floatIcon {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(180deg); }
}

/* 弧形分割 */
.curved-divider {
  position: absolute;
  top: 0;
  right: -1px;
  width: 100px;
  height: 100%;
  z-index: 3;
}

.curved-divider svg {
  width: 100%;
  height: 100%;
}

.floating-shapes {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, 
    rgba(192, 250, 160, 0.12) 0%, 
    rgba(168, 230, 207, 0.08) 50%, 
    rgba(192, 250, 160, 0.06) 100%
  );
  backdrop-filter: blur(15px);
  border: 1px solid rgba(192, 250, 160, 0.15);
  box-shadow: 
    0 8px 32px rgba(192, 250, 160, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  animation: float 25s infinite linear;
}

.shape-1 {
  width: 120px;
  height: 120px;
  top: 15%;
  left: 8%;
  animation-delay: 0s;
}

.shape-2 {
  width: 80px;
  height: 80px;
  top: 70%;
  left: 85%;
  animation-delay: -8s;
}

.shape-3 {
  width: 60px;
  height: 60px;
  top: 85%;
  left: 15%;
  animation-delay: -15s;
}

.shape-4 {
  width: 100px;
  height: 100px;
  top: 5%;
  left: 75%;
  animation-delay: -20s;
}

.shape-5 {
  width: 140px;
  height: 140px;
  top: 45%;
  left: 3%;
  animation-delay: -12s;
}

@keyframes float {
  0% { transform: translateY(0px) rotate(0deg) scale(1); }
  25% { transform: translateY(-20px) rotate(90deg) scale(1.05); }
  50% { transform: translateY(0px) rotate(180deg) scale(1); }
  75% { transform: translateY(20px) rotate(270deg) scale(0.95); }
  100% { transform: translateY(0px) rotate(360deg) scale(1); }
}

/* 右侧登录区域 */
.right-panel {
  flex: 1;
  background: white;
  padding: 3rem 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-top-right-radius: var(--admin-radius-2xl);
  border-bottom-right-radius: var(--admin-radius-2xl);
  box-shadow: var(--admin-shadow-xl);
}



.login-card {
  width: 100%;
  max-width: 350px;
}

.login-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.login-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--admin-primary);
  margin-bottom: 0.5rem;
  background: var(--admin-gradient-accent);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-subtitle {
  color: var(--admin-gray-600);
  font-size: 0.95rem;
}

.login-form {
  width: 100%;
}

/* 品牌标识区域 */
.brand-header {
  margin-bottom: 48px;
  text-align: center;
}

.logo-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 32px;
}

.logo-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, var(--admin-primary), var(--admin-secondary));
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: var(--admin-bg-primary);
  box-shadow: 
    0 8px 32px rgba(192, 250, 160, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  animation: logoGlow 3s ease-in-out infinite alternate;
}

@keyframes logoGlow {
  0% { box-shadow: 0 8px 32px rgba(192, 250, 160, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2); }
  100% { box-shadow: 0 12px 40px rgba(192, 250, 160, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3); }
}

.logo-info {
  text-align: left;
}

.brand-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 4px 0;
  text-shadow: 0 2px 10px rgba(192, 250, 160, 0.3);
  letter-spacing: -0.5px;
}

.brand-subtitle {
  color: var(--admin-primary);
  font-size: 0.9rem;
  margin: 0;
  font-weight: 600;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-shadow: 0 1px 5px rgba(192, 250, 160, 0.2);
}

.welcome-text {
  text-align: center;
}

.welcome-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 8px 0;
  letter-spacing: -0.3px;
  text-shadow: 0 1px 8px rgba(255, 255, 255, 0.1);
}

.welcome-desc {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
  margin: 0;
  line-height: 1.5;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

/* 表单样式 */
.form-item-wrapper {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #606266;
}

.login-button {
  width: 100%;
  margin-top: 16px;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
}

/* Element Plus 组件样式覆盖 */
.login-form :deep(.el-form-item) {
  margin-bottom: 1.5rem;
}

.login-input :deep(.el-input__wrapper) {
  height: 48px;
  border-radius: var(--admin-radius-md);
  border: 1px solid var(--admin-gray-300);
  box-shadow: none;
  padding: 0 16px;
  transition: all var(--admin-transition-normal);
}

.login-input :deep(.el-input__wrapper:hover) {
  border-color: var(--admin-gray-400);
}

.login-input :deep(.el-input__wrapper.is-focus) {
  border-color: var(--admin-primary);
  box-shadow: 0 0 0 3px rgba(22, 19, 38, 0.1);
}

.login-input :deep(.el-input__inner) {
  font-size: 0.95rem;
}

.login-btn {
  width: 100%;
  height: 48px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: var(--admin-radius-md);
  background: #161326 !important;
  border: none !important;
  color: white !important;
  cursor: pointer;
  margin-top: 1rem;
  transition: all 0.3s ease;
  box-shadow: var(--admin-shadow-md);
  position: relative;
  z-index: 1;
}

.login-btn:hover {
  background: #c0faa0 !important;
  color: #161326 !important;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(192, 250, 160, 0.4);
}

.login-btn:active {
  transform: translateY(0);
  transition: all 0.1s ease;
}

/* 底部链接 */
.footer-links {
  text-align: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--admin-border);
}

.footer-link {
  color: var(--admin-text-secondary);
  text-decoration: none;
  font-size: 13px;
  margin: 0 12px;
  transition: all var(--admin-transition-normal);
}

.footer-link:hover {
  color: var(--admin-primary);
}



/* 响应式设计 */
@media (max-width: 1024px) {
  .login-container {
    max-width: 800px;
    height: 500px;
  }
  
  .left-panel {
    padding: 2rem 1.5rem;
  }
  
  .right-panel {
    padding: 2rem 1.5rem;
  }
  
  .brand-title {
    font-size: 1.8rem;
  }
  
  .illustration {
    transform: scale(1);
  }
  
  .dashboard-preview {
    width: 160px;
    height: 120px;
  }
  
  .floating-item {
    font-size: 1.2rem;
  }
}

@media (max-width: 768px) {
  .admin-login-page {
    padding: 1rem;
  }
  
  .login-container {
    flex-direction: column;
    height: auto;
    min-height: 600px;
  }
  
  .left-panel {
    padding: 2rem 1.5rem 1.5rem;
    position: relative;
    overflow: hidden;
    border-radius: var(--admin-radius-2xl) var(--admin-radius-2xl) 0 0;
  }
  
  .right-panel {
    padding: 1.5rem;
    border-radius: 0 0 var(--admin-radius-2xl) var(--admin-radius-2xl);
  }
  
  /* 隐藏弧形分割线 */
  .curved-divider {
    display: none;
  }
  
  .brand-title {
    font-size: 1.6rem;
  }
  
  .brand-section {
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .illustration {
    transform: scale(0.8);
    padding-top: 1rem;
  }
  
  .dashboard-preview {
    width: 140px;
    height: 100px;
  }
  
  .floating-elements {
    display: none;
  }
  
  .features {
    position: relative;
    bottom: auto;
    left: auto;
    transform: none;
    margin-top: 1rem;
    flex-direction: row;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
  }
  
  .feature-item {
    font-size: 0.75rem;
    padding: 0.3rem 0.6rem;
    gap: 0.3rem;
  }
  
  .feature-icon-bg {
    width: 20px;
    height: 20px;
  }
  
  .feature-icon {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .admin-login-page {
    padding: 0.5rem;
  }
  
  .login-container {
    border-radius: var(--admin-radius-lg);
    min-height: 500px;
  }
  
  .left-panel {
    padding: 1.5rem 1rem 1rem;
    border-radius: var(--admin-radius-lg) var(--admin-radius-lg) 0 0;
  }
  
  .right-panel {
    padding: 1rem;
    border-radius: 0 0 var(--admin-radius-lg) var(--admin-radius-lg);
  }
  
  /* 确保弧形分割线被隐藏 */
  .curved-divider {
    display: none;
  }
  
  .brand-title {
    font-size: 1.4rem;
  }
  
  .brand-section {
    margin-top: 1rem;
    margin-bottom: 1rem;
  }
  
  .login-title {
    font-size: 1.6rem;
  }
  
  .illustration {
    transform: scale(0.7);
    padding-top: 0.5rem;
  }
  
  .dashboard-preview {
    width: 120px;
    height: 80px;
    padding: 0.5rem;
  }
  
  .chart-area {
    height: 40px;
    gap: 4px;
  }
  
  .chart-bar {
    width: 12px;
  }
  
  .stats-cards {
    gap: 4px;
  }
  
  .stat-card {
    height: 20px;
  }
  
  .features {
    gap: 0.3rem;
    margin-top: 0.5rem;
  }
  
  .feature-item {
    font-size: 0.7rem;
    padding: 0.2rem 0.4rem;
  }
  
  .feature-icon-bg {
    width: 16px;
    height: 16px;
  }
  
  .feature-icon {
    font-size: 0.7rem;
  }
  
  .login-card {
    max-width: 100%;
  }
  
  .grid-pattern {
    background-size: 20px 20px;
  }
}

/* 加载动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>