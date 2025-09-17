<template>
  <div class="admin-layout">
    <!-- 刷新进度条 -->
    <div v-if="refreshProgress > 0" class="refresh-progress-bar">
      <div class="progress-fill" :style="{ width: refreshProgress + '%' }"></div>
    </div>
    
    <!-- 移动端遮罩层 -->
    <div 
      v-if="isMobileMenuOpen" 
      class="mobile-overlay"
      @click="toggleMobileMenu"
    ></div>
    
    <!-- 侧边栏 -->
    <div class="admin-sidebar" :class="{ 'mobile-open': isMobileMenuOpen }">
      <div class="sidebar-header" style="justify-content: flex-start !important; text-align: left !important; display: flex !important; align-items: center !important;">
        <div class="logo-section" style="justify-content: flex-start !important; text-align: left !important; width: 100% !important; display: flex !important; align-items: center !important;">
          <div class="logo-icon">⚡</div>
          <div class="logo-info">
            <div class="logo-title">管理中心</div>
            <div class="logo-subtitle">Admin Panel</div>
          </div>
        </div>
      </div>
      <el-menu
        :default-active="$route.path"
        router
        class="admin-menu"
        :collapse="false"
      >
        <el-menu-item index="/admin" class="admin-slide-in">
          <el-icon><House /></el-icon>
          <span>控制台</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/users" class="admin-slide-in">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/orders" class="admin-slide-in">
          <el-icon><Document /></el-icon>
          <span>订单管理</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/api-types" class="admin-slide-in">
          <el-icon><Menu /></el-icon>
          <span>API类型管理</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/api-config" class="admin-slide-in">
          <el-icon><Setting /></el-icon>
          <span>API接口配置</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/query-categories" class="admin-slide-in">
          <el-icon><Menu /></el-icon>
          <span>查询分类管理</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/query-items" class="admin-slide-in">
          <el-icon><Search /></el-icon>
          <span>查询项目管理</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/payment-config" class="admin-slide-in">
          <el-icon><CreditCard /></el-icon>
          <span>支付接口配置</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/system-settings" class="admin-slide-in">
          <el-icon><Setting /></el-icon>
          <span>系统设置</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/deletion-requests" class="admin-slide-in">
          <el-icon><Delete /></el-icon>
          <span>注销申请审核</span>
        </el-menu-item>

      </el-menu>
    </div>
    
    <!-- 右侧内容区域 -->
    <div class="admin-right">
      <!-- 顶部导航栏 -->
      <div class="admin-header">
        <div class="header-content">
          <div class="header-left">
            <!-- 移动端菜单按钮 -->
            <el-button 
              type="text" 
              class="mobile-menu-btn"
              :icon="Operation"
              @click="toggleMobileMenu"
            />
            <!-- 移动端标题 -->
            <div class="mobile-title">
              <div class="mobile-logo-icon">⚡</div>
              <span>管理中心</span>
            </div>
          </div>
          <div class="header-right">
            <div class="admin-user-area">
              <!-- 用户信息区域 -->
              <div class="user-profile">
                <div class="user-avatar-wrapper">
                  <el-avatar 
                    :size="36" 
                    class="user-avatar"
                    :src="userInfo?.avatar"
                  >
                    {{ userInfo?.username?.charAt(0)?.toUpperCase() || 'A' }}
                  </el-avatar>
                  <div class="user-status-dot"></div>
                </div>
                <div class="user-details">
                  <div class="user-name">{{ userInfo?.username || '管理员' }}</div>
                  <div class="user-role">{{ userInfo?.role === 'admin' ? '系统管理员' : '普通用户' }}</div>
                </div>
              </div>
              
              <!-- 操作按钮区域 -->
              <div class="user-actions">
                <el-tooltip content="刷新数据" placement="bottom">
                  <el-button 
                    type="text" 
                    class="action-btn refresh-btn"
                    :icon="Refresh"
                    @click="handleCommand('refresh')"
                    circle
                  />
                </el-tooltip>
                <el-tooltip content="退出登录" placement="bottom">
                  <el-button 
                    type="text" 
                    class="action-btn logout-btn"
                    :icon="SwitchButton"
                    @click="handleCommand('logout')"
                    circle
                  />
                </el-tooltip>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 主内容区域 -->
      <div class="admin-main">
        <div class="admin-content admin-fade-in">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { House, User, Search, Setting, CreditCard, Document, Menu, SwitchButton, Refresh, Operation, Delete } from '@element-plus/icons-vue';
import { getUserInfo } from '../../utils/index';

const router = useRouter();
const route = useRoute();
const userInfo = ref<any>(null);
const refreshProgress = ref(0);
const isMobileMenuOpen = ref(false);


onMounted(() => {
  userInfo.value = getUserInfo();
  
  // 检查是否为管理员
  if (!userInfo.value || userInfo.value.role !== 'admin') {
    ElMessage.error('无权限访问管理后台');
    router.push('/');
    return;
  }
});

// 监听路由变化，自动关闭移动端菜单
watch(() => route.path, () => {
  isMobileMenuOpen.value = false;
});

// 移动端菜单切换函数
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

// 刷新数据函数
const refreshData = async () => {
  try {
    // 开始进度条动画
    refreshProgress.value = 0;
    const progressInterval = setInterval(() => {
      if (refreshProgress.value < 90) {
        refreshProgress.value += Math.random() * 15 + 5; // 随机增加5-20%
      }
    }, 100);
    
    // 根据当前页面触发不同的刷新事件
     const currentRoute = router.currentRoute.value;
     const path = currentRoute.path;
     
     if (path === '/admin' || path === '/admin/') {
       window.dispatchEvent(new CustomEvent('refreshDashboard'));
     } else if (path === '/admin/users') {
       window.dispatchEvent(new CustomEvent('refreshUsers'));
     } else if (path === '/admin/orders') {
       window.dispatchEvent(new CustomEvent('refreshOrders'));
     } else if (path === '/admin/api-config') {
       window.dispatchEvent(new CustomEvent('refreshApiConfigs'));
     } else if (path === '/admin/api-types') {
       window.dispatchEvent(new CustomEvent('refreshApiTypes'));
     } else if (path === '/admin/payment-config') {
       window.dispatchEvent(new CustomEvent('refreshPaymentConfigs'));
     } else if (path === '/admin/platform-config') {
       window.dispatchEvent(new CustomEvent('refreshPlatformConfig'));
     } else if (path === '/admin/query-categories') {
       window.dispatchEvent(new CustomEvent('refreshQueryCategories'));
     } else if (path === '/admin/query-items') {
       window.dispatchEvent(new CustomEvent('refreshQueryItems'));
     } else if (path === '/admin/test') {
       window.dispatchEvent(new CustomEvent('refreshTest'));
     } else {
       // 其他页面触发通用刷新事件
       window.dispatchEvent(new CustomEvent('refreshPage'));
     }
    
    // 模拟刷新完成
    setTimeout(() => {
      // 完成进度条
      refreshProgress.value = 100;
      clearInterval(progressInterval);
      
      // 隐藏进度条
      setTimeout(() => {
        refreshProgress.value = 0;
      }, 500);
    }, 1200);
  } catch (error) {
    refreshProgress.value = 0;
    ElMessage.error('数据刷新失败');
  }
};

const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      ElMessage.info('个人资料功能开发中...');
      break;
    case 'refresh':
      refreshData();
      break;
    case 'logout':
      logout();
      break;
  }
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userInfo');
  ElMessage.success('退出登录成功');
  router.push('/');
};
</script>

<style scoped>
@import '@/assets/admin-theme.css';

/* 刷新进度条样式 */
.refresh-progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(255, 255, 255, 0.1);
  z-index: 9999;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #c0faa0;
  transition: width 0.3s ease;
  box-shadow: 0 0 10px rgba(192, 250, 160, 0.5);
  position: relative;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 20px;
  background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.4));
  animation: shimmer 1s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-20px); }
  100% { transform: translateX(20px); }
}

/* 确保admin页面贴合窗口 */
:global(body) {
  margin: 0 !important;
  padding: 0 !important;
  width: 100vw !important;
  max-width: 100vw !important;
  overflow-x: hidden !important;
  box-sizing: border-box !important;
}

:global(html) {
  margin: 0 !important;
  padding: 0 !important;
  width: 100vw !important;
  max-width: 100vw !important;
  overflow-x: hidden !important;
  box-sizing: border-box !important;
}

:global(#app) {
  margin: 0 !important;
  padding: 0 !important;
  width: 100vw !important;
  max-width: 100vw !important;
  overflow-x: hidden !important;
  box-sizing: border-box !important;
}

:global(.app-container) {
  margin: 0 !important;
  padding: 0 !important;
  width: 100vw !important;
  max-width: 100vw !important;
  overflow-x: hidden !important;
  box-sizing: border-box !important;
}



.admin-layout {
  height: 100vh;
  display: flex;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  width: 100vw;
  max-width: 100vw;
  overflow: hidden;
}

.admin-header {
  height: 80px;
  padding: 0 !important;
  display: flex;
  align-items: center;
  position: relative;
  z-index: 2000;
  flex-shrink: 0;
  background: #161326 !important;
  border-bottom: 1px solid rgba(192, 250, 160, 0.15);
  border-left: none;
  border-top-right-radius: 16px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
}





.admin-header::before {
  display: none !important;
}

.admin-right {
  flex: 1;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
}

.header-content {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mobile-menu-btn {
  display: none;
  width: 44px;
  height: 44px;
  color: #ffffff !important;
  background: rgba(192, 250, 160, 0.15) !important;
  border: 2px solid rgba(192, 250, 160, 0.3) !important;
  border-radius: 8px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
  transition: all var(--admin-transition-normal);
  font-size: 18px !important;
}

.mobile-menu-btn:hover {
  background: rgba(192, 250, 160, 0.25) !important;
  border-color: rgba(192, 250, 160, 0.5) !important;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(192, 250, 160, 0.2) !important;
}

.mobile-title {
  display: none;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--admin-text-primary);
}

.mobile-logo-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--admin-primary), var(--admin-secondary));
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: white;
  box-shadow: 0 2px 8px rgba(192, 250, 160, 0.3);
}

.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
  display: none;
}

.header-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.admin-user-area {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 16px;
  margin-right: 40px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(192, 250, 160, 0.15);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.admin-user-area:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(192, 250, 160, 0.25);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar-wrapper {
  position: relative;
}

.user-avatar {
  background: linear-gradient(135deg, #c0faa0 0%, #a8e6cf 100%);
  color: #161326;
  font-weight: 600;
  border: 2px solid rgba(192, 250, 160, 0.3);
  transition: all 0.3s ease;
}

.user-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(192, 250, 160, 0.3);
}

.user-status-dot {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 10px;
  height: 10px;
  background: #22c55e;
  border: 2px solid #161326;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  color: #ffffff;
  font-weight: 600;
  font-size: 14px;
  line-height: 1.2;
  letter-spacing: 0.2px;
}

.user-role {
  color: #c0faa0;
  font-size: 11px;
  font-weight: 500;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 12px;
  border-left: 1px solid rgba(192, 250, 160, 0.15);
}

.action-btn {
  width: 32px !important;
  height: 32px !important;
  border: 1px solid rgba(192, 250, 160, 0.2) !important;
  background: rgba(255, 255, 255, 0.05) !important;
  color: rgba(255, 255, 255, 0.8) !important;
  transition: all 0.3s ease !important;
  backdrop-filter: blur(5px) !important;
}

.action-btn:hover {
  background: rgba(192, 250, 160, 0.1) !important;
  border-color: rgba(192, 250, 160, 0.4) !important;
  color: #c0faa0 !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(192, 250, 160, 0.2) !important;
}

.settings-btn:hover {
  background: rgba(59, 130, 246, 0.1) !important;
  border-color: rgba(59, 130, 246, 0.4) !important;
  color: #3b82f6 !important;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.1) !important;
  border-color: rgba(239, 68, 68, 0.4) !important;
  color: #ef4444 !important;
}

.admin-sidebar {
  background: #161326;
  width: 220px;
  min-width: 220px;
  flex-shrink: 0;
  height: 100vh;
  overflow: hidden;
  border-right: none;
  display: flex;
  flex-direction: column;
  z-index: 1001;
  position: relative;
}



.admin-sidebar::before {
  display: none !important;
}

.sidebar-header {
  padding: var(--admin-space-md) var(--admin-space-xl);
  border-bottom: none;
  background: #161326;
  flex-shrink: 0;
  position: relative;
  z-index: 10;
  display: flex !important;
  justify-content: flex-start !important;
  align-items: center !important;
  text-align: left !important;
}

/* 强制覆盖任何全局样式 */
.admin-sidebar .sidebar-header {
  justify-content: flex-start !important;
  text-align: left !important;
}

.admin-layout .admin-sidebar .sidebar-header {
  justify-content: flex-start !important;
  text-align: left !important;
}

.sidebar-header::before {
  display: none !important;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: var(--admin-space-md);
  justify-content: flex-start !important;
  width: 100%;
}

.logo-icon {
  font-size: 30px;
  width: 55px;
  height: 55px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #c0faa0 0%, #a8e6cf 100%);
  color: #161326;
  border-radius: var(--admin-radius-lg);
  box-shadow: 0 4px 15px rgba(192, 250, 160, 0.3);
  border: 2px solid rgba(192, 250, 160, 0.4);
  font-weight: bold;
}

.logo-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.logo-title {
  color: #ffffff;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-shadow: none;
  position: relative;
  z-index: 20;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}

.logo-subtitle {
  color: #c0faa0;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 1;
  position: relative;
  z-index: 20;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}

.admin-menu {
  background: transparent !important;
  border-right: none !important;
  padding: var(--admin-space-md) 0;
  width: 100%;
  flex: 1;
}

:deep(.el-menu-item) {
  height: 56px !important;
  line-height: 56px !important;
  padding: 0 20px !important;
  margin: 0 !important;
  display: flex !important;
  align-items: center !important;
  background-color: transparent !important;
  border-bottom: none !important;
  color: #bfcbd9 !important;
  transition: all var(--admin-transition-normal) !important;
}

:deep(.el-menu-item:hover) {
  background-color: rgba(192, 250, 160, 0.1) !important;
  color: var(--admin-secondary) !important;
  transform: translateX(4px) !important;
}

:deep(.el-menu-item.is-active) {
  background: var(--admin-gradient-secondary) !important;
  color: var(--admin-primary) !important;
  border-radius: 0 var(--admin-radius-md) var(--admin-radius-md) 0 !important;
  margin-right: var(--admin-space-sm) !important;
  box-shadow: var(--admin-shadow-md) !important;
}

:deep(.el-menu-item .el-icon) {
  margin-right: 8px !important;
  font-size: 16px !important;
  color: inherit !important;
}

:deep(.el-menu-item span) {
  font-size: 14px !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  color: inherit !important;
}

.admin-main {
  flex: 1;
  background: var(--admin-white-soft);
  overflow-y: scroll;
  height: calc(100vh - 80px);
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.admin-content {
  padding: var(--admin-space-xl);
  min-height: calc(100vh - 80px + 200px);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .admin-sidebar {
    width: 180px;
    min-width: 180px;
  }
  

  
  .logo-subtitle {
    display: none;
  }
  
  .user-info {
    display: none;
  }
}

@media (max-width: 768px) {
  .admin-header {
    padding: 0 var(--admin-space-md) !important;
    border-top-right-radius: 12px;
    border-bottom-left-radius: 0;
  }
  
  .admin-header::after {
    display: none;
  }
  
  .admin-user-area {
    margin-right: 6px;
    padding: 6px 12px;
    gap: 12px;
    border-radius: 8px;
  }
  
  .user-details {
    display: none;
  }
  
  .user-actions {
    padding-left: 0;
    border-left: none;
  }
  
  .admin-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 220px !important;
    min-width: 220px !important;
    transform: translateX(-100%);
    transition: transform var(--admin-transition-normal);
    z-index: 999;
  }
  

  
  .admin-sidebar.mobile-open {
    transform: translateX(0);
  }
  
  .mobile-menu-btn {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    background: rgba(192, 250, 160, 0.2) !important;
    border: 2px solid rgba(192, 250, 160, 0.4) !important;
    color: #ffffff !important;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15) !important;
  }
  
  .mobile-title {
    display: flex !important;
  }
  
  .mobile-overlay {
    display: block !important;
  }
  
  .sidebar-header {
    padding: 16px;
    justify-content: flex-start !important;
  }
  
  .logo-info {
    display: flex;
  }
  
  /* 强制显示菜单项文字 - 移动端 */
  .admin-sidebar .el-menu .el-menu-item {
    padding: 0 16px !important;
    justify-content: flex-start !important;
    height: 48px !important;
    display: flex !important;
    align-items: center !important;
    width: 100% !important;
  }
  
  .admin-sidebar .el-menu .el-menu-item .el-icon {
    margin-right: 10px !important;
    font-size: 16px !important;
    flex-shrink: 0 !important;
  }
  
  .admin-sidebar .el-menu .el-menu-item span {
    display: block !important;
    font-size: 14px !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    color: inherit !important;
    opacity: 1 !important;
    visibility: visible !important;
    flex: 1 !important;
  }
  
  /* 额外的强制样式 */
  :deep(.el-menu-item) {
    padding: 0 16px !important;
    justify-content: flex-start !important;
    height: 48px !important;
    display: flex !important;
    align-items: center !important;
    width: 100% !important;
  }
  
  :deep(.el-menu-item .el-icon) {
    margin-right: 10px !important;
    font-size: 16px !important;
    flex-shrink: 0;
  }
  
  :deep(.el-menu-item span) {
    display: block !important;
    font-size: 14px !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    color: inherit !important;
    opacity: 1 !important;
    visibility: visible !important;
    flex: 1 !important;
  }
  
  .admin-content {
    padding: var(--admin-space-md);
  }
  
  .admin-right {
    width: 100% !important;
    margin-left: 0 !important;
  }
}

@media (max-width: 480px) {
  .admin-header {
    padding: 0 !important;
    height: 60px;
    border-top-right-radius: 8px;
  }
  
  .admin-user-area {
    margin-right: 4px;
    padding: 4px 8px;
    gap: 8px;
    border-radius: 6px;
  }
  
  .action-btn {
    width: 28px !important;
    height: 28px !important;
  }
  
  .admin-main {
    height: calc(100vh - 60px);
  }
  
  .logo-icon {
    width: 36px;
    height: 36px;
    font-size: 20px;
  }
  
  .admin-content {
    padding: 10px;
  }
}

/* 滚动条美化 */
.admin-sidebar::-webkit-scrollbar {
  width: 6px;
}

.admin-sidebar::-webkit-scrollbar-track {
  background: rgba(192, 250, 160, 0.1);
}

.admin-sidebar::-webkit-scrollbar-thumb {
  background: var(--admin-secondary);
  border-radius: var(--admin-radius-sm);
}

.admin-main::-webkit-scrollbar {
  width: 8px;
  background: #f5f5f5;
}

.admin-main::-webkit-scrollbar-track {
  background: #f5f5f5;
  margin: 0;
  border-radius: 0;
}

.admin-main::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 0;
  border: none;
  min-height: 20px;
}

.admin-main::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.admin-main::-webkit-scrollbar-corner {
  background: #f5f5f5;
}

/* 确保 Element Plus 弹窗不被顶部导航遮挡 */
:deep(.el-overlay) {
  z-index: 9999 !important;
}

:deep(.el-dialog) {
  z-index: 10000 !important;
}

:deep(.el-dialog__wrapper) {
  z-index: 10000 !important;
  padding-top: 0 !important;
}

:deep(.el-message-box) {
  z-index: 10001 !important;
}

:deep(.el-message-box__wrapper) {
  z-index: 10001 !important;
}

:deep(.el-drawer) {
  z-index: 9999 !important;
}

/* 全局覆盖 Element Plus 弹窗的 margin-top */

/* 移动端菜单文字强制显示 */
@media (max-width: 768px) {
  /* 全局强制覆盖样式 */
  .admin-sidebar .el-menu-item span,
  .admin-sidebar.mobile-open .el-menu-item span,
  .admin-layout .admin-sidebar .el-menu-item span {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    font-size: 14px !important;
    color: inherit !important;
  }
}

/* 全局强制覆盖sidebar-header样式 */
.sidebar-header[data-v-74ec1d76],
.admin-sidebar .sidebar-header,
.admin-layout .sidebar-header,
[data-v-74ec1d76] .sidebar-header {
  padding: 13px 10px 13px 7px !important;
  justify-content: flex-start !important;
  text-align: left !important;
  display: flex !important;
  align-items: center !important;
}

.sidebar-header[data-v-74ec1d76] .logo-section,
.admin-sidebar .sidebar-header .logo-section,
.admin-layout .sidebar-header .logo-section {
  justify-content: flex-start !important;
  text-align: left !important;
  width: 100% !important;
}
</style>