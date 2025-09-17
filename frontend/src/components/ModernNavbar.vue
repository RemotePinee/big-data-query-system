<template>
  <nav class="modern-navbar" :class="{'modern-navbar-glass': !mobileDevice}">
    <div class="navbar-logo">
      <router-link to="/" class="logo-link">
        <img 
          v-if="systemSettingsStore.settings.pcLogo" 
          :src="getImageUrl(systemSettingsStore.settings.pcLogo)" 
          class="logo-image"
          :alt="systemSettingsStore.settings.systemName || '大数据查询系统'"
        />
        <template v-else>
          <el-icon :size="40"><DataAnalysis /></el-icon>
          <span>{{ systemSettingsStore.settings.systemName || '大数据查询系统' }}</span>
        </template>
      </router-link>
    </div>
    
    <div class="navbar-links">
      <router-link to="/" class="nav-link" active-class="active">首页</router-link>
      <a href="#" class="nav-link" :class="{ active: $route.path === '/query' }" @click="handleQueryClick">数据查询</a>
      <router-link to="/about" class="nav-link" active-class="active">关于我们</router-link>
    </div>
    
    <div class="navbar-actions">
      <template v-if="!isLoggedIn">
        <el-button class="modern-btn modern-btn-outline" @click="handleRegister">
          注册
        </el-button>
        <el-button class="modern-btn modern-btn-primary" @click="showLoginModal">
          登录
        </el-button>
      </template>
      
      <div v-else class="user-dropdown-container" @click="toggleUserMenu">
        <div class="user-profile">
          <div class="modern-avatar">{{ userInfo?.username?.charAt(0) || 'U' }}</div>
          <span class="username">{{ userInfo?.username || '用户' }}</span>
          <el-icon><ArrowDown /></el-icon>
        </div>
        
        <!-- 自定义下拉菜单 -->
        <div v-if="userMenuVisible" class="custom-dropdown-menu" @click.stop>
          <div class="dropdown-item" @click="goToUser">
            <el-icon><User /></el-icon>
            <span>个人中心</span>
          </div>
          <div v-if="isAdmin" class="dropdown-item" @click="goToAdmin">
            <el-icon><Setting /></el-icon>
            <span>管理后台</span>
          </div>
          <div class="dropdown-item dropdown-divider" @click="handleLogout">
            <el-icon><SwitchButton /></el-icon>
            <span>退出登录</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 移动端菜单按钮 -->
    <div class="mobile-menu-toggle" @click="toggleMobileMenu">
      <el-icon v-if="!mobileMenuOpen"><Menu /></el-icon>
      <el-icon v-else><Close /></el-icon>
    </div>
    
    <!-- 移动端菜单 -->
    <div class="mobile-menu" :class="{ 'mobile-menu-open': mobileMenuOpen }">
      <div class="mobile-menu-links">
        <router-link to="/" class="mobile-nav-link" @click="closeMobileMenu">首页</router-link>
        <a href="#" class="mobile-nav-link" @click="handleMobileQueryClick">数据查询</a>
        <router-link to="/about" class="mobile-nav-link" @click="closeMobileMenu">关于我们</router-link>
        
        <template v-if="!isLoggedIn">
          <router-link to="/login" class="mobile-nav-link" @click="closeMobileMenu">登录</router-link>
          <router-link to="/register" class="mobile-nav-link" @click="closeMobileMenu">注册</router-link>
        </template>
        <template v-else>
          <router-link to="/user" class="mobile-nav-link" @click="closeMobileMenu">个人中心</router-link>
          <router-link v-if="isAdmin" to="/admin" class="mobile-nav-link" @click="closeMobileMenu">管理后台</router-link>
          <a href="#" class="mobile-nav-link" @click="handleLogoutMobile">退出登录</a>
        </template>
      </div>
    </div>
  </nav>
  
  <!-- 登录弹窗 -->
  <LoginModal v-model="loginModalVisible" @login-success="handleLoginSuccess" />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { DataAnalysis, User, Setting, SwitchButton, ArrowDown, Menu, Close } from '@element-plus/icons-vue';
import { isLoggedIn as checkIsLoggedIn, getUserInfo, clearUserInfo } from '../utils';
import { isMobile } from '../utils/device';
import LoginModal from './LoginModal.vue';
import { useSystemSettingsStore } from '@/stores/systemSettings';

const mobileDevice = isMobile();

const router = useRouter();
const route = useRoute();
const userInfo = ref(getUserInfo());
const mobileMenuOpen = ref(false);
const loginModalVisible = ref(false);
const userMenuVisible = ref(false);

// 系统设置store
const systemSettingsStore = useSystemSettingsStore();

// 响应式的登录状态
const isLoggedIn = ref(checkIsLoggedIn());

// 判断是否为管理员
const isAdmin = computed(() => {
  return userInfo.value?.role === 'admin';
});

// 更新用户状态
const updateUserStatus = () => {
  isLoggedIn.value = checkIsLoggedIn();
  userInfo.value = getUserInfo();
};

// 监听路由变化，更新用户状态
watch(() => route.path, () => {
  updateUserStatus();
});

// 组件挂载时更新状态
onMounted(() => {
  updateUserStatus();
  // 加载系统设置
  systemSettingsStore.fetchSettings();
  // 添加点击外部关闭菜单的事件监听器
  document.addEventListener('click', handleClickOutside);
});

// 组件卸载时清理
onUnmounted(() => {
  // 确保恢复body的overflow样式
  document.body.style.overflow = '';
  // 移除点击外部事件监听器
  document.removeEventListener('click', handleClickOutside);
});

// 切换移动端菜单
const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
  
  // 当菜单打开时，禁止页面滚动
  if (mobileMenuOpen.value) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
};

// 关闭移动端菜单
const closeMobileMenu = () => {
  mobileMenuOpen.value = false;
  document.body.style.overflow = '';
};

// 显示登录弹窗
const showLoginModal = () => {
  loginModalVisible.value = true;
};

// 登录成功处理
const handleLoginSuccess = () => {
  loginModalVisible.value = false;
  updateUserStatus();
  // 移除重复的登录成功提示，LoginModal中已经显示了
};

// 处理数据查询点击
const handleQueryClick = (e) => {
  e.preventDefault();
  if (isLoggedIn.value) {
    router.push('/query');
  } else {
    ElMessage.warning('请先登录后再进行数据查询');
    showLoginModal();
  }
};

// 处理注册
const handleRegister = () => {
  console.log('注册按钮被点击');
  router.push('/register');
};

// 退出登录
const handleLogout = () => {
  clearUserInfo();
  updateUserStatus(); // 立即更新状态
  ElMessage.success('退出登录成功');
  router.push('/');
};

// 移动端数据查询点击
const handleMobileQueryClick = (e) => {
  e.preventDefault();
  closeMobileMenu();
  if (isLoggedIn.value) {
    router.push('/query');
  } else {
    ElMessage.warning('请先登录后再进行数据查询');
    showLoginModal();
  }
};

// 移动端退出登录
const handleLogoutMobile = (e) => {
  e.preventDefault();
  handleLogout();
  closeMobileMenu();
};

// 处理下拉菜单命令
const handleCommand = (command) => {
  console.log('下拉菜单命令:', command);
  switch (command) {
    case 'user':
      router.push('/user');
      break;
    case 'admin':
      router.push('/admin');
      break;
    case 'logout':
      handleLogout();
      break;
    default:
      console.warn('未知命令:', command);
  }
};

// 用户头像点击事件
const onUserProfileClick = (e) => {
  console.log('用户头像被点击');
  e.stopPropagation();
};

// 切换用户菜单
const toggleUserMenu = (e) => {
  e.stopPropagation();
  userMenuVisible.value = !userMenuVisible.value;
  console.log('用户菜单切换:', userMenuVisible.value);
};

// 跳转到用户中心
const goToUser = () => {
  console.log('跳转到用户中心');
  userMenuVisible.value = false;
  router.push('/user');
};

// 跳转到管理后台
const goToAdmin = () => {
  console.log('在新窗口打开管理后台');
  userMenuVisible.value = false;
  // 在新窗口中打开管理后台
  window.open('/admin', '_blank');
};

// 点击外部关闭菜单
const handleClickOutside = () => {
  userMenuVisible.value = false;
};

// 获取图片完整URL
const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const baseURL = import.meta.env.VITE_API_BASE_URL || '';
  if (baseURL.startsWith('http')) {
    // 开发环境，移除 /api 后缀并拼接完整URL
    const cleanBaseURL = baseURL.replace(/\/api$/, '');
    return `${cleanBaseURL}${url}`;
  } else {
    // 生产环境，返回相对路径
    return url;
  }
};


</script>

<style scoped>
.navbar-logo {
  display: flex;
  align-items: center;
}

.logo-link {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  text-decoration: none;
  font-weight: 700;
  font-size: 24px;
  color: #000000;
  position: relative;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-xl);
  transition: all var(--transition-normal);
  overflow: hidden;
}

.logo-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(192, 250, 160, 0.1);
  border-radius: var(--radius-xl);
  opacity: 0;
  transition: all var(--transition-normal);
  z-index: -1;
}

.logo-link:hover::before {
  opacity: 1;
  transform: scale(1.02);
}

.logo-link:hover {
  transform: translateY(-1px);
  filter: brightness(1.1);
}

.logo-image {
  height: 45px;
  max-width: 180px;
  object-fit: contain;
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
}

.logo-link:hover .logo-image {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.logo-link .el-icon {
  color: #000000;
  padding: var(--space-2);
  border-radius: var(--radius-lg);
  font-size: 40px;
}

.logo-link:hover .el-icon {
  transform: rotate(5deg) scale(1.05);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
}

.logo-link span {
  color: #000000;
  font-weight: 700;
  letter-spacing: 0.5px;
  position: relative;
}

@keyframes logoIconFloat {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-2px);
  }
}

.navbar-links {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
}

.nav-link {
  text-decoration: none;
  color: #000000;
  font-weight: 500;
  transition: all var(--transition-normal);
  position: relative;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.nav-link:hover {
  color: #000000;
  background: rgba(192, 250, 160, 0.2);
  transform: translateY(-1px);
}

.nav-link.active {
  color: white;
  background: #000000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transform: translateY(-1px);
}

.nav-link.router-link-active {
  color: #000000;
  background: rgba(192, 250, 160, 0.3);
  font-weight: 600;
}

.nav-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.6s;
}

.nav-link.active::before {
  left: 100%;
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  cursor: pointer;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-lg);
  transition: background-color var(--transition-normal);
  position: relative;
  z-index: 100;
  pointer-events: auto;
  color: #000000;
}

.user-profile:hover {
  background: rgba(192, 250, 160, 0.2);
  transform: translateY(-1px);
}

.modern-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #c0faa0;
  color: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

/* 确保下拉菜单可见 */
.el-dropdown {
  position: relative;
  z-index: 100;
}

.el-dropdown-menu {
  z-index: 1000 !important;
}

/* 自定义下拉菜单容器 */
.user-dropdown-container {
  position: relative;
  display: inline-block;
}

/* 自定义下拉菜单 */
.custom-dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 160px;
  padding: 8px 0;
  margin-top: 4px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  color: #000000;
  font-size: 14px;
}

.dropdown-item:hover {
  background-color: rgba(192, 250, 160, 0.2);
  color: #000000;
}

.dropdown-item.dropdown-divider {
  border-top: 1px solid #e4e7ed;
  margin-top: 4px;
  padding-top: 12px;
}

.dropdown-item .el-icon {
  font-size: 16px;
}

.username {
  font-weight: 500;
  color: #000000;
  font-size: 16px;
}

/* 确保按钮可以点击 */
.modern-btn {
  cursor: pointer;
  pointer-events: auto;
  z-index: 10;
  position: relative;
}

.modern-btn-outline {
  background: transparent;
  border: 2px solid #000000;
  color: #000000;
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
  font-size: 14px;
}

.modern-btn-outline:hover {
  background: #c0faa0;
  color: #000000;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(192, 250, 160, 0.3);
}

.modern-btn-primary {
  background: #c0faa0;
  color: #000000;
  border: none;
  padding: 6px 12px;
  font-size: 14px;
}

.modern-btn-primary:hover {
  background: #a8e682;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(192, 250, 160, 0.4);
}

/* 移动端菜单 */
.mobile-menu-toggle {
  display: none;
  cursor: pointer;
  font-size: var(--text-xl);
  color: #000000;
}

.mobile-menu {
  display: none;
  position: fixed;
  top: 60px;
  left: 0;
  width: 100%;
  height: calc(100vh - 60px);
  background-color: var(--bg-light);
  z-index: 999;
  transform: translateX(100%);
  transition: transform var(--transition-normal);
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.mobile-menu-open {
  transform: translateX(0);
}

.mobile-menu-links {
  display: flex;
  flex-direction: column;
  padding: var(--space-4);
}

.mobile-nav-link {
  text-decoration: none;
  color: #000000;
  font-weight: 500;
  padding: var(--space-5);
  border-bottom: 1px solid var(--border-light);
  transition: background-color var(--transition-normal);
  font-size: 16px;
  display: flex;
  align-items: center;
}

.mobile-nav-link:hover {
  background-color: var(--gray-100);
}

.mobile-nav-link:active {
  background-color: var(--gray-200);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .navbar-links, .navbar-actions {
    display: none;
  }
  
  .mobile-menu-toggle {
    display: block;
  }
  
  .mobile-menu {
    display: block;
  }
}
</style>