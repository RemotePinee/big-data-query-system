<template>
  <div class="mobile-layout">
    <!-- 主要内容区域 -->
    <div class="main-content">
      <router-view v-slot="{ Component, route }">
        <transition 
          :name="transitionName" 
          mode="out-in"
          @before-enter="onBeforeEnter"
          @enter="onEnter"
          @leave="onLeave"
        >
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </div>
    
    <!-- 底部导航 - 在登录和注册页面隐藏 -->
    <BottomNavigation v-if="!hideBottomNavigation" />
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import BottomNavigation from '@/components/mobile/BottomNavigation.vue'

const route = useRoute()
const transitionName = ref('fade')

// 判断是否隐藏底部导航
const hideBottomNavigation = computed(() => {
  const hiddenRoutes = ['/mobile/login', '/mobile/register', '/mobile/payment', '/mobile/payment-success']
  return hiddenRoutes.includes(route.path) || route.path.startsWith('/mobile/payment/')
})

// 页面顺序映射
const pageOrder = {
  '/mobile': 0,
  '/mobile/query': 1,
  '/mobile/profile': 2
}

let previousPath = route.path

// 监听路由变化，使用统一的淡入淡出动画
watch(() => route.path, (newPath) => {
  transitionName.value = 'fade'
  previousPath = newPath
})

// 简化的动画钩子函数
const onBeforeEnter = (el) => {
  // 让CSS处理动画
}

const onEnter = (el, done) => {
  // 让CSS处理动画
  setTimeout(done, 400)
}

const onLeave = (el, done) => {
  // 让CSS处理动画
  setTimeout(done, 200)
}
</script>

<style scoped>
.mobile-layout {
  min-height: 100vh !important;
  min-height: 100dvh !important; /* 动态视口高度，解决地址栏问题 */
  width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  background: #f8f9fa;
  box-sizing: border-box !important;
  position: relative !important;
}

.main-content {
  flex: 1;
  padding-bottom: 40px; /* 为底部导航栏留出空间 */
  overflow-y: auto;
  position: relative;
}

/* 页面切换动画 - 优雅的淡入淡出效果 */
.fade-enter-active {
  transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-leave-active {
  transition: opacity 0.2s cubic-bezier(0.4, 0, 1, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-left-enter-from,
.slide-left-leave-to,
.slide-right-enter-from,
.slide-right-leave-to {
  opacity: 0;
}
</style>