import { createApp } from 'vue';
// 使用按需导入 Element Plus 以减少包体积
import {
  ElButton, ElInput, ElForm, ElFormItem, ElIcon, ElCard, ElTable, ElTableColumn,
  ElPagination, ElDialog, ElSelect, ElOption, ElSwitch, ElTag, ElTabs, ElTabPane,
  ElRow, ElCol, ElCheckbox, ElLink, ElEmpty, ElResult, ElTooltip, ElInputNumber,
  ElDatePicker, ElColorPicker, ElCollapse, ElCollapseItem, ElMenu, ElMenuItem, 
  ElRadio, ElRadioGroup, ElMessage, ElMessageBox, vLoading
} from 'element-plus';
// 只导入需要的 Element Plus 样式
import 'element-plus/es/components/button/style/css';
import 'element-plus/es/components/input/style/css';
import 'element-plus/es/components/form/style/css';
import 'element-plus/es/components/form-item/style/css';
import 'element-plus/es/components/icon/style/css';
import 'element-plus/es/components/card/style/css';
import 'element-plus/es/components/table/style/css';
import 'element-plus/es/components/table-column/style/css';
import 'element-plus/es/components/pagination/style/css';
import 'element-plus/es/components/dialog/style/css';
import 'element-plus/es/components/select/style/css';
import 'element-plus/es/components/option/style/css';
import 'element-plus/es/components/switch/style/css';
import 'element-plus/es/components/tag/style/css';
import 'element-plus/es/components/tabs/style/css';
import 'element-plus/es/components/tab-pane/style/css';
import 'element-plus/es/components/row/style/css';
import 'element-plus/es/components/col/style/css';
import 'element-plus/es/components/checkbox/style/css';
import 'element-plus/es/components/link/style/css';
import 'element-plus/es/components/empty/style/css';
import 'element-plus/es/components/result/style/css';
import 'element-plus/es/components/tooltip/style/css';
import 'element-plus/es/components/input-number/style/css';
import 'element-plus/es/components/date-picker/style/css';
import 'element-plus/es/components/color-picker/style/css';
import 'element-plus/es/components/collapse/style/css';
import 'element-plus/es/components/collapse-item/style/css';
import 'element-plus/es/components/menu/style/css';
import 'element-plus/es/components/menu-item/style/css';
import 'element-plus/es/components/radio/style/css';
import 'element-plus/es/components/radio-group/style/css';
import 'element-plus/es/components/message/style/css';
import 'element-plus/es/components/message-box/style/css';
import 'element-plus/es/components/loading/style/css';
// 基础样式
import 'element-plus/theme-chalk/base.css';
import '@fortawesome/fontawesome-free/css/all.css';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import './assets/main.css';

// 移动端适配
import { isMobile } from './utils/device';
// 移动端样式
import './assets/mobile-ui.css';
// 初始化本地存储
import { initializeLocalStorage } from './utils';
import { faviconManager } from './utils/favicon';
import { initTitleManager } from './utils/title';

// 应用启动时清理无效的localStorage数据
initializeLocalStorage();

const app = createApp(App);

// 添加全局属性
app.config.globalProperties.$isMobile = isMobile();

// 设置移动端视口
if (isMobile()) {
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
  }
  
  // 添加移动端样式类
  document.documentElement.classList.add('mobile');
} else {
  document.documentElement.classList.add('desktop');
}

app.use(createPinia());

// 注册 Element Plus 组件
const components = [
  ElButton, ElInput, ElForm, ElFormItem, ElIcon, ElCard, ElTable, ElTableColumn,
  ElPagination, ElDialog, ElSelect, ElOption, ElSwitch, ElTag, ElTabs, ElTabPane,
  ElRow, ElCol, ElCheckbox, ElLink, ElEmpty, ElResult, ElTooltip, ElInputNumber,
  ElDatePicker, ElColorPicker, ElCollapse, ElCollapseItem, ElMenu, ElMenuItem,
  ElRadio, ElRadioGroup
];

// 全局注册 ElMessage 和 ElMessageBox
app.config.globalProperties.$message = ElMessage;
app.config.globalProperties.$messageBox = ElMessageBox;

components.forEach(component => {
  if (component.name) {
    app.component(component.name, component);
  }
});

// 注册 Element Plus 指令
app.directive('loading', vLoading);

app.use(router);

// 初始化用户状态
import { useUserStore } from './stores/user';
const userStore = useUserStore();
userStore.initUserState();

// 初始化favicon管理器
faviconManager.init();

// 初始化标题管理器
(async () => {
  await initTitleManager();
})();

// 忽略Chrome扩展相关错误
window.addEventListener('error', (event) => {
  if (event.message && (
    event.message.includes('runtime.lastError') ||
    event.message.includes('message port closed') ||
    event.message.includes('Could not establish connection')
  )) {
    event.preventDefault();
    return false;
  }
});

// 忽略未处理的Promise拒绝（扩展相关）
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message && (
    event.reason.message.includes('runtime.lastError') ||
    event.reason.message.includes('message port closed') ||
    event.reason.message.includes('Could not establish connection')
  )) {
    event.preventDefault();
    return false;
  }
});

app.mount('#app');

// 移除预加载动画
setTimeout(() => {
  const appLoading = document.querySelector('.app-loading');
  if (appLoading) {
    appLoading.remove();
  }
}, 100);
