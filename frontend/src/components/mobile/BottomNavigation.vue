<template>
  <div class="floating-dock">
    <div class="dock-container">
      <div 
        v-for="item in navItems" 
        :key="item.name"
        class="dock-item"
        :class="{ active: isActive(item.path) }"
        @click="handleNavClick(item.path)"
      >
        <div class="dock-icon">
          <i :class="item.icon"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 导航项配置
const navItems = [
  {
    name: 'home',
    label: '首页',
    icon: 'fas fa-home',
    path: '/mobile/home'
  },
  {
    name: 'profile',
    label: '个人',
    icon: 'fas fa-user',
    path: '/mobile/profile'
  }
]

// 检查路由是否激活
const isActive = (path) => {
  return route.path === path
}

// 处理导航点击
const handleNavClick = (path) => {
  console.log('导航点击:', path, '当前路径:', route.path)
  if (route.path !== path) {
    router.push(path)
  }
}
</script>

<style scoped>
.floating-dock {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 16px 16px 0 0;
  padding: 6px 6px;
  z-index: 1000;
  box-shadow: 0 -4px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1);
  animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dock-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 70px;
}

.dock-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 50px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  color: rgba(0, 0, 0, 0.7);
  z-index: 1;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.dock-item::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 50px;
  height: 45px;
  background: rgba(0, 0, 0, 0.8);
  opacity: 0;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translate(-50%, -50%) scale(0.9);
  z-index: -1;
}

.dock-item:hover {
  transform: translateY(-2px) scale(1.02);
  color: rgba(0, 0, 0, 0.9);
}

.dock-item:hover::before {
  opacity: 0.1;
  transform: translate(-50%, -50%) scale(1);
}

.dock-item.active {
  color: #fff;
  transform: translateY(-1px) scale(1.01);
}

.dock-item.active::before {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}

.dock-icon {
  font-size: 30px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dock-item:hover .dock-icon {
  transform: scale(1.1);
}

.dock-item.active .dock-icon {
  transform: scale(1.1);
}

/* 响应式设计 */
@media (max-width: 375px) {
  .floating-dock {
    padding: 8px 6px;
  }
  
  .dock-item {
    width: 48px;
    height: 48px;
    border-radius: 16px;
  }
  
  .dock-item::before {
    border-radius: 16px;
  }
  
  .dock-icon {
    font-size: 20px;
  }
}
</style>