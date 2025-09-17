<template>
  <div class="mobile-profile">
    <!-- 英雄区域 -->
    <div class="hero-section">
      <div class="hero-background">
        <div class="hero-pattern"></div>
        <div class="hero-glow"></div>
      </div>
      <!-- 右上角退出登录按钮 -->
      <div v-if="isLoggedIn" class="logout-icon">
        <button @click="handleLogout" class="logout-icon-btn">
          <i class="fas fa-sign-out-alt"></i>
        </button>
      </div>
      <div class="hero-content">
        <div class="user-avatar">
          <img 
            :src="avatarUrl" 
            :alt="userInfo?.username || '用户头像'"
            @error="handleAvatarError"
            @load="handleAvatarLoad"
            :class="{ 'avatar-loading': !avatarLoaded, 'avatar-error': avatarError }"
          />
        </div>
        <div class="user-info">
          <h2 class="user-name">{{ userInfo?.username || '未登录用户' }}</h2>
          <p class="user-subtitle">{{ userInfo?.phone || '欢迎使用数据查询系统' }}</p>
        </div>
        <div v-if="!isLoggedIn" class="login-prompt">
          <button @click="goToLogin" class="hero-login-btn">
            <i class="fas fa-sign-in-alt"></i>
            立即登录
          </button>
        </div>
      </div>
    </div>

    <!-- 个人资料和安全设置卡片 -->
     <div class="profile-cards" v-if="isLoggedIn">
       <div class="profile-card" @click="goToProfile">
         <img src="@/assets/images/icon/1.png" alt="个人资料" class="card-icon" />
         <div class="card-content">
           <h3 class="card-title">个人资料</h3>
           <p class="card-desc">修改个人信息</p>
         </div>
       </div>
       
       <div class="profile-card" @click="goToSecurity">
         <img src="@/assets/images/icon/2.png" alt="安全设置" class="card-icon" />
         <div class="card-content">
           <h3 class="card-title">安全设置</h3>
           <p class="card-desc">密码、手机号等</p>
         </div>
       </div>
     </div>

    <!-- 订单管理按钮 -->
    <div class="order-section" v-if="isLoggedIn">
      <div class="order-buttons">
        <button class="order-btn" @click="goToOrders">
          <i class="fas fa-list-alt"></i>
          <span>我的订单</span>
        </button>
        
        <button class="order-btn" @click="goToQueryHistory">
          <i class="fas fa-search"></i>
          <span>查询记录</span>
        </button>
        
        <button class="order-btn" @click="goToPendingOrders">
          <i class="fas fa-clock"></i>
          <span>待处理</span>
        </button>
      </div>
    </div>

    <!-- 更多功能 -->
    <div class="more-section">
      <div class="more-items">
        <div class="more-item" @click="goToHelp">
          <div class="more-icon">
            <i class="fas fa-question-circle"></i>
          </div>
          <span class="more-title">帮助中心</span>
        </div>
        
        <div class="more-item" @click="goToContact">
          <div class="more-icon">
            <i class="fas fa-headset"></i>
          </div>
          <span class="more-title">联系客服</span>
        </div>
        
        <div class="more-item" @click="goToAbout">
          <div class="more-icon">
            <i class="fas fa-info-circle"></i>
          </div>
          <span class="more-title">关于我们</span>
        </div>
      </div>
    </div>

    <!-- 弹窗组件 -->
    <HelpCenterDialog v-model="helpCenterVisible" />
    <AboutUsDialog v-model="aboutUsVisible" />
    <OnlineServiceDialog v-model="onlineServiceVisible" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useSystemSettingsStore } from '@/stores/systemSettings'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import HelpCenterDialog from '@/components/mobile/HelpCenterDialog.vue'
import AboutUsDialog from '@/components/mobile/AboutUsDialog.vue'
import OnlineServiceDialog from '@/components/OnlineServiceDialog.vue'

const router = useRouter()
const userStore = useUserStore()
const systemSettingsStore = useSystemSettingsStore()

// 初始化用户状态
userStore.initUserState()

// 用户信息和登录状态
const userInfo = computed(() => userStore.userInfo)
const isLoggedIn = computed(() => userStore.isLoggedIn)

// 头像相关
const avatarLoaded = ref(false)
const avatarError = ref(false)
const defaultAvatar = '/default-avatar.svg'

// 弹窗显示状态
const helpCenterVisible = ref(false)
const aboutUsVisible = ref(false)
const onlineServiceVisible = ref(false)

// 头像图片列表 - 使用 Vite 的静态资源导入方式
const avatarImages = [
  'boy-1.png', 'boy-2.png', 'boy-3.png', 'boy-4.png', 'boy-5.png', 'boy-6.png', 'boy-7.png', 'boy-8.png',
  'girl-1.png', 'girl-2.png', 'girl-3.png', 'girl-4.png', 'girl-5.png', 'girl-6.png', 'girl-7.png', 'girl-8.png', 'girl62.png'
]

// 生成随机头像（使用 public 目录的静态资源路径）
const getRandomAvatarUrl = () => {
  const randomIndex = Math.floor(Math.random() * avatarImages.length)
  const imageName = avatarImages[randomIndex]
  // 使用 public 目录的静态资源路径，可以直接通过绝对路径访问
  return `/avatar/${imageName}`
}

// 随机头像URL（在组件初始化时生成，保持不变）
const randomAvatarUrl = ref(getRandomAvatarUrl())

// 计算头像URL
const avatarUrl = computed(() => {
  if (avatarError.value) {
    return defaultAvatar
  }
  if (userInfo.value?.avatar) {
    return userInfo.value.avatar
  }
  // 使用随机头像（无论是否登录）
  if (randomAvatarUrl.value) {
    return randomAvatarUrl.value
  }
  return defaultAvatar
})

// 处理头像加载错误
const handleAvatarError = (event) => {
  console.log('头像加载失败，使用默认头像')
  avatarError.value = true
  avatarLoaded.value = true
  // 确保使用默认头像
  event.target.src = defaultAvatar
}

// 处理头像加载成功
const handleAvatarLoad = () => {
  avatarLoaded.value = true
  avatarError.value = false
}

// 订单统计
const orderStats = ref({
  total: 0,
  completed: 0,
  pending: 0,
  paid: 0,
  processing: 0,
  failed: 0
})

// 获取订单统计
const fetchOrderStats = async () => {
  if (!isLoggedIn.value) return
  
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('/api/orders/stats', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    
    const data = await res.json()
    if (data && data.code === 200 && data.data) {
      orderStats.value = data.data
    }
  } catch (error) {
    console.error('获取订单统计失败:', error)
    // 使用模拟数据
    orderStats.value = {
      total: Math.floor(Math.random() * 20) + 5,
      completed: Math.floor(Math.random() * 15) + 3,
      pending: Math.floor(Math.random() * 5),
      paid: Math.floor(Math.random() * 8) + 2,
      processing: Math.floor(Math.random() * 3),
      failed: Math.floor(Math.random() * 3)
    }
  }
}

// 导航方法
const goToLogin = () => {
  router.push('/mobile/login')
}

const goToOrders = () => {
  if (!isLoggedIn.value) {
    ElMessage.warning('请先登录')
    goToLogin()
    return
  }
  router.push('/mobile/my-orders')
}

const goToQueryHistory = () => {
  if (!isLoggedIn.value) {
    ElMessage.warning('请先登录')
    goToLogin()
    return
  }
  router.push('/mobile/query-history')
}

const goToPendingOrders = () => {
  if (!isLoggedIn.value) {
    ElMessage.warning('请先登录')
    goToLogin()
    return
  }
  router.push('/mobile/my-orders?status=pending')
}

const goToProfile = () => {
  if (!isLoggedIn.value) {
    ElMessage.warning('请先登录')
    goToLogin()
    return
  }
  router.push('/mobile/profile-edit')
}

const goToSecurity = () => {
  if (!isLoggedIn.value) {
    ElMessage.warning('请先登录')
    goToLogin()
    return
  }
  router.push('/mobile/security-settings')
}

const goToHelp = () => {
  helpCenterVisible.value = true
}

const goToContact = () => {
  onlineServiceVisible.value = true
}

const goToAbout = () => {
  aboutUsVisible.value = true
}

// 退出登录
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要退出登录吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await userStore.logout()
    ElMessage.success('退出登录成功')
    
    // 重置订单统计
    orderStats.value = {
      total: 0,
      completed: 0,
      pending: 0,
      failed: 0
    }
  } catch (error) {
    // 用户取消
  }
}

onMounted(async () => {
  // 获取系统设置
  try {
    await systemSettingsStore.fetchSettings()
  } catch (error) {
    console.error('获取系统设置失败:', error)
  }
  
  // 获取最新的用户信息
  try {
    await userStore.getUserInfo()
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
  
  fetchOrderStats()
})
</script>

<style scoped>
.mobile-profile {
  min-height: 100vh;
  background: #fff;
  position: relative;
  padding: 0;
  overflow: hidden;
}

/* 背景装饰 */
.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: visible;
  z-index: 0;
}

.decoration-wave {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(45deg, rgba(255, 107, 107, 0.1), rgba(255, 159, 67, 0.1));
  animation: wave 8s ease-in-out infinite;
}

.decoration-wave-1 {
  width: 300px;
  height: 300px;
  top: -150px;
  right: -150px;
  animation-delay: 0s;
}

.decoration-wave-2 {
  width: 200px;
  height: 200px;
  bottom: -100px;
  left: -100px;
  animation-delay: 2s;
}

.decoration-wave-3 {
  width: 150px;
  height: 150px;
  top: 50%;
  left: -75px;
  animation-delay: 4s;
}

@keyframes wave {
  0%, 100% {
    transform: translateY(0px) scale(1) rotate(0deg);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-30px) scale(1.1) rotate(180deg);
    opacity: 0.6;
  }
}

/* 英雄区域 */
.hero-section {
  position: relative;
  z-index: 1;
  background: #f8f9fa;
  border-radius: 20px;
  padding: 20px 0 40px;
  margin: 0 0 0 0;
  overflow: visible;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.hero-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.08) 0%, transparent 60%),
    radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.06) 0%, transparent 60%),
    radial-gradient(circle at 50% 10%, rgba(59, 130, 246, 0.04) 0%, transparent 50%);
}

.hero-glow {
  position: absolute;
  top: -60%;
  right: -30%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.06) 40%, transparent 80%);
  border-radius: 50%;
  animation: heroFloat 8s ease-in-out infinite;
}

@keyframes heroFloat {
  0%, 100% { transform: translateY(0px) scale(1) rotate(0deg); opacity: 0.7; }
  50% { transform: translateY(-30px) scale(1.15) rotate(5deg); opacity: 1; }
}

.hero-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  padding: 0 28px;
  position: relative;
}

.user-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6366f1;
  font-size: 32px;
  margin-right: 24px;
  box-shadow: 0 16px 40px rgba(99, 102, 241, 0.25), 0 8px 20px rgba(99, 102, 241, 0.15);
  overflow: hidden;
  border: 5px solid rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
}

.user-avatar:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 48px rgba(99, 102, 241, 0.3), 0 12px 24px rgba(99, 102, 241, 0.2);
}

.user-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  transition: all 0.3s ease;
}

.user-avatar img.avatar-loading {
  opacity: 0.8;
  background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
}

.user-avatar img.avatar-error {
  opacity: 1;
  filter: none;
}



.user-info {
  flex: 1;
  color: #1e293b;
}

.user-name {
  font-size: 26px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px 0;
  text-shadow: none;
}

.user-subtitle {
  font-size: 16px;
  color: #64748b;
  margin: 0 0 12px 0;
  font-weight: 500;
}



.login-prompt {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.logout-action {
  margin-left: 16px;
}

.hero-login-btn, .hero-logout-btn {
  padding: 14px 24px;
  border-radius: 20px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.15);
}

.hero-login-btn {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

/* 右上角退出登录图标 */
.logout-icon {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
}

.logout-icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(248,250,252,0.9);
  color: #64748b;
  font-size: 16px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
}

.logout-icon-btn:hover {
  background: rgba(241,245,249,0.95);
  transform: scale(1.1);
  color: #475569;
}

.hero-login-btn:hover {
  transform: translateY(-2px);
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.25);
}



/* 个人资料和安全设置卡片 */
 .profile-cards {
   margin: 24px 20px 0;
   position: relative;
   z-index: 1;
   margin-bottom: 24px;
   margin-top: 0;
   display: flex;
   flex-direction: row;
   gap: 16px;
   overflow: visible;
 }

/* 针对不同浏览器环境的布局优化 - 仅限个人中心页面 */
.mobile-profile {
  @supports (-webkit-appearance: none) {
    /* WebKit浏览器（Safari、Chrome等）优化 */
    .profile-cards {
      display: -webkit-flex;
      -webkit-flex-direction: row;
      flex-direction: row;
    }
    
    .order-buttons {
      display: -webkit-flex;
      -webkit-flex-wrap: wrap;
      flex-wrap: wrap;
    }
  }
}

/* 微信内置浏览器特殊处理 - 仅限个人中心页面 */
.mobile-profile {
  @media screen and (-webkit-min-device-pixel-ratio: 0) {
    .profile-cards {
      display: flex !important;
      flex-direction: row !important;
    }
    
    .order-buttons {
      display: flex !important;
      flex-wrap: wrap !important;
    }
    
    .profile-card {
      flex-shrink: 0 !important;
    }
    
    .order-btn {
      flex-shrink: 0 !important;
    }
  }
}
 
 .profile-card {
   flex: 1;
   background: #f8f9fa;
   border-radius: 10px;
   padding: 20px 16px 16px 16px;
   border: none;
   transition: all 0.2s ease;
   display: flex;
   flex-direction: column;
   align-items: center;
   cursor: pointer;
   position: relative;
 }
 
 .profile-card:hover {
  background: #f0f1f3;
}
 
 .card-icon {
   width: 48px;
   height: 48px;
   object-fit: contain;
   transition: all 0.3s ease;
   margin-bottom: 6px;
 }
 
 .profile-card:hover .card-icon {
   transform: scale(1.1);
 }

.card-content {
   text-align: center;
   flex: 1;
 }
 
 .card-title {
   font-size: 14px;
   font-weight: 600;
   color: #1f2937;
   margin: 0 0 4px 0;
 }
 
 .card-desc {
   font-size: 12px;
   color: #6b7280;
   margin: 0 0 8px 0;
   line-height: 1.3;
 }
 


/* 订单管理按钮 */
.order-section {
  margin: 24px 20px 32px;
  position: relative;
  z-index: 1;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #495057;
  margin: 0 0 16px 0;
  padding-left: 0;
}

.order-buttons {
  display: flex !important;
  flex-direction: row !important;
  gap: 10px;
  flex-wrap: nowrap !important;
  justify-content: space-between !important;
}

/* 针对不同浏览器环境的布局优化 */
@supports (-webkit-appearance: none) {
  /* WebKit浏览器（Safari、Chrome等）优化 */
  .order-buttons {
    display: -webkit-flex !important;
    -webkit-flex-direction: row !important;
    flex-direction: row !important;
    -webkit-flex-wrap: nowrap !important;
    flex-wrap: nowrap !important;
    -webkit-justify-content: space-between !important;
    justify-content: space-between !important;
  }
}

/* 微信内置浏览器特殊处理 */
@media screen and (-webkit-min-device-pixel-ratio: 0) {
  .order-buttons {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: nowrap !important;
    justify-content: space-between !important;
  }
  
  .order-btn {
    flex-shrink: 0 !important;
  }
}

.order-btn {
  flex: 1 !important;
  min-width: 100px;
  max-width: calc(33.333% - 7px) !important;
  background: #f8f9fa;
  border: none;
  border-radius: 10px;
  padding: 16px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex !important;
  flex-direction: column !important;
  align-items: center;
  gap: 8px;
  position: relative;
}

.order-btn:hover {
  background: #e9ecef;
  border-color: #dee2e6;
}

.order-btn i {
  font-size: 18px;
  color: #6c757d;
}

.order-btn span {
  font-size: 13px;
  font-weight: 500;
  color: #495057;
}

/* 移动端响应式优化 */
@media (max-width: 480px) {
  .order-buttons {
    gap: 8px !important;
  }
  
  .order-btn {
    padding: 14px 8px !important;
    min-width: 90px !important;
  }
  
  .order-btn i {
    font-size: 16px !important;
  }
  
  .order-btn span {
    font-size: 12px !important;
  }
}

@media (max-width: 360px) {
  .order-buttons {
    gap: 6px !important;
  }
  
  .order-btn {
    padding: 12px 6px !important;
    min-width: 80px !important;
  }
  
  .order-btn i {
    font-size: 14px !important;
  }
  
  .order-btn span {
    font-size: 11px !important;
  }
}
 
 .profile-card {
   flex: 1;
   background: #f8f9fa;
   border-radius: 10px;
   padding: 20px 16px 16px 16px;
   border: none;
   transition: all 0.2s ease;
   display: flex;
   flex-direction: column;
   align-items: center;
   cursor: pointer;
   position: relative;
 }
 
 .profile-card:hover {
  background: #f0f1f3;
}
 
 .card-icon {
   width: 48px;
   height: 48px;
   object-fit: contain;
   transition: all 0.3s ease;
   margin-bottom: 6px;
 }
 
 .profile-card:hover .card-icon {
   transform: scale(1.1);
 }

.card-content {
   text-align: center;
   flex: 1;
 }
 
 .card-title {
   font-size: 14px;
   font-weight: 600;
   color: #1f2937;
   margin: 0 0 4px 0;
 }
 
 .card-desc {
   font-size: 12px;
   color: #6b7280;
   margin: 0 0 8px 0;
   line-height: 1.3;
 }
 


/* 更多功能 */
.more-section {
  margin: 0 20px 24px;
  position: relative;
  z-index: 1;
}

.more-items {
  background: #f8f9fa;
  border-radius: 10px;
  border: none;
  display: flex;
  flex-direction: column;
}

.more-item {
  display: flex;
  align-items: center;
  padding: 18px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: none;
}

.more-item:last-child {
  border-bottom: none;
}

.more-item:hover {
  background: #e9ecef;
}

.more-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #dee2e6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  font-size: 16px;
  margin-right: 16px;
  transition: all 0.2s ease;
}

.more-item:hover .more-icon {
  background: #ced4da;
  color: #495057;
}

.more-title {
  font-size: 15px;
  font-weight: 500;
  color: #495057;
  flex: 1;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .mobile-profile {
    padding: 16px;
  }
  
  .hero-section {
    padding: 24px 20px;
    margin-bottom: 20px;
  }
  
  .hero-content {
    flex-direction: column;
    text-align: center;
  }
  
  .user-avatar {
    width: 90px;
    height: 90px;
    font-size: 28px;
    margin-right: 0;
    margin-top: 16px;
  }
  
  .user-name {
    font-size: 20px;
  }
  
  .user-subtitle {
    font-size: 14px;
  }
  
  .profile-cards {
     gap: 12px;
   }
   
   .profile-card {
     padding: 14px 10px 10px 10px;
   }
   
   .card-icon {
     width: 50px;
     height: 50px;
   }
   
   .card-content {
     margin-top: 8px;
   }
   
   .card-title {
     font-size: 14px;
   }
   
   .card-desc {
     font-size: 12px;
   }
  
  .order-buttons {
    gap: 8px;
  }
  
  .order-btn {
    padding: 12px 8px;
    min-width: 80px;
  }
  
  .order-btn i {
    font-size: 20px;
  }
  
  .order-btn span {
    font-size: 12px;
  }
  
  .more-item {
    padding: 16px 20px;
  }
  
  .more-icon {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
  
  .more-title {
    font-size: 15px;
  }
  
  .section-title {
    font-size: 16px;
  }
}

@media (max-width: 360px) {
  .mobile-profile {
    padding: 12px;
  }
  
  .hero-section {
    padding: 20px 16px;
  }
  
  .user-avatar {
    width: 60px;
    height: 60px;
    font-size: 24px;
  }
  
  .user-name {
    font-size: 18px;
  }
  
  .order-buttons {
    flex-direction: column;
  }
  
  .order-btn {
    flex-direction: row;
    justify-content: flex-start;
    padding: 12px 16px;
    gap: 12px;
  }
  
  .order-btn i {
     font-size: 18px;
   }
   
   .profile-cards {
     flex-direction: column;
     gap: 10px;
   }
   
   .profile-card {
     padding: 12px 8px 8px 8px;
   }
   
   .card-icon {
     width: 45px;
     height: 45px;
   }
 }
 </style>