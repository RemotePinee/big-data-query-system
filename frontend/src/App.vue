<template>
  <div class="app-container modern-ui">
    <router-view />
  </div>
</template>

<script setup lang="ts">
// App根组件
import { onMounted, nextTick } from 'vue';
import { isMobile } from './utils/device';

onMounted(async () => {
  // 确保页面加载完成后应用样式，避免白屏
  document.body.classList.add('loaded');
  
  // 添加设备类型类名
  if (isMobile()) {
    document.documentElement.classList.add('mobile');
  } else {
    document.documentElement.classList.add('desktop');
  }
  
  // 使用nextTick确保DOM更新后再执行
  await nextTick();
  
  // 添加一个小延迟，确保样式已应用
  setTimeout(() => {
    document.body.style.visibility = 'visible';
    document.body.style.opacity = '1';
  }, 100);
});
</script>

<style>
.app-container {
  margin: 0;
  padding: 0;
  width: 100vw;
  max-width: 100vw;
  min-height: 100vh;
  overflow-x: hidden;
  overflow-y: auto;
  box-sizing: border-box;
}

/* 防止白屏 */
body {
  visibility: visible;
  background-color: #f9fafb;
}

/* 确保内容在移动端正确显示 */
@media (max-width: 768px) {
  .app-container {
    padding: 0;
    margin: 0;
  }
}

/* 完全隐藏移动端滚动条 - 全局强制应用 */
@media (max-width: 768px) {
  html, body, div, section, main, article, aside, nav, header, footer {
    overflow-x: hidden !important;
    -ms-overflow-style: none !important;  /* IE和Edge */
    scrollbar-width: none !important;     /* Firefox */
  }
  
  html::-webkit-scrollbar,
  body::-webkit-scrollbar,
  div::-webkit-scrollbar,
  section::-webkit-scrollbar,
  main::-webkit-scrollbar,
  article::-webkit-scrollbar,
  aside::-webkit-scrollbar,
  nav::-webkit-scrollbar,
  header::-webkit-scrollbar,
  footer::-webkit-scrollbar,
  *::-webkit-scrollbar {
    display: none !important;             /* Chrome, Safari, Opera */
    width: 0 !important;
    height: 0 !important;
    background: transparent !important;
  }
  
  * {
    -ms-overflow-style: none !important;
    scrollbar-width: none !important;
  }
  
  /* 确保所有容器元素都隐藏滚动条 */
  .app-container,
  .mobile-layout,
  .admin-layout,
  .page-container,
  .content-wrapper {
    -ms-overflow-style: none !important;
    scrollbar-width: none !important;
  }
  
  .app-container::-webkit-scrollbar,
  .mobile-layout::-webkit-scrollbar,
  .admin-layout::-webkit-scrollbar,
  .page-container::-webkit-scrollbar,
  .content-wrapper::-webkit-scrollbar {
    display: none !important;
    width: 0 !important;
    height: 0 !important;
  }
}

/* 只在真正的移动端设备上隐藏滚动条 */
.mobile body {
  overflow-x: hidden;
  -ms-overflow-style: none;  /* IE和Edge */
  scrollbar-width: none;     /* Firefox */
}

.mobile body::-webkit-scrollbar {
  display: none;             /* Chrome, Safari, Opera */
}

.mobile html {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.mobile html::-webkit-scrollbar {
  display: none;
}


</style>
