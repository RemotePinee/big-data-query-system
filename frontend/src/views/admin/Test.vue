<template>
  <div class="test-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>API测试页面</span>
        </div>
      </template>
      
      <div class="test-section">
        <h3>登录状态检查</h3>
        <p>Token: {{ token || '未登录' }}</p>
        <p>用户信息: {{ userInfo ? JSON.stringify(userInfo) : '无' }}</p>
        <p>是否管理员: {{ isAdmin ? '是' : '否' }}</p>
        
        <el-button @click="quickLogin" type="primary">快速登录管理员</el-button>
        <el-button @click="checkLoginStatus">检查登录状态</el-button>
        <el-button @click="logout">退出登录</el-button>
      </div>
      
      <div class="test-section">
        <h3>API测试</h3>
        <el-button @click="testDashboardAPI">测试仪表盘API</el-button>
        <el-button @click="testOrdersAPI">测试订单API</el-button>
        <el-button @click="testRevenueAPI">测试收入API</el-button>
        
        <div v-if="apiResult" class="api-result">
          <h4>API结果:</h4>
          <pre>{{ JSON.stringify(apiResult, null, 2) }}</pre>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
import { getDashboardStats, getRecentOrders, getRevenueChartData } from '@/api/statistics.ts';

const userStore = useUserStore();
const apiResult = ref<any>(null);

const token = computed(() => userStore.token);
const userInfo = computed(() => userStore.userInfo);
const isAdmin = computed(() => userStore.isAdmin());

// 快速登录管理员
const quickLogin = async () => {
  try {
    await userStore.login({
      username: 'admin',
      password: 'admin123'
    });
    console.log('管理员登录成功');
  } catch (error) {
    console.error('登录失败:', error);
  }
};

// 检查登录状态
const checkLoginStatus = () => {
  userStore.initUserState();
  console.log('登录状态已刷新');
};

// 退出登录
const logout = async () => {
  await userStore.logout();
  console.log('已退出登录');
};

// 测试仪表盘API
const testDashboardAPI = async () => {
  try {
    const response = await getDashboardStats();
    apiResult.value = response;
    console.log('仪表盘API测试结果:', response);
  } catch (error) {
    apiResult.value = { error: error };
    console.error('仪表盘API测试失败:', error);
  }
};

// 测试订单API
const testOrdersAPI = async () => {
  try {
    const response = await getRecentOrders(5);
    apiResult.value = response;
    console.log('订单API测试结果:', response);
  } catch (error) {
    apiResult.value = { error: error };
    console.error('订单API测试失败:', error);
  }
};

// 测试收入API
const testRevenueAPI = async () => {
  try {
    const response = await getRevenueChartData('week');
    apiResult.value = response;
    console.log('收入API测试结果:', response);
  } catch (error) {
    apiResult.value = { error: error };
    console.error('收入API测试失败:', error);
  }
};

onMounted(() => {
  userStore.initUserState();
});
</script>

<style scoped>
.test-container {
  padding: 20px;
}

.test-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 4px;
}

.test-section h3 {
  margin-top: 0;
  color: #333;
}

.test-section p {
  margin: 10px 0;
  color: #666;
}

.test-section .el-button {
  margin-right: 10px;
  margin-bottom: 10px;
}

.api-result {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.api-result h4 {
  margin-top: 0;
  color: #333;
}

.api-result pre {
  background-color: #fff;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
  line-height: 1.4;
}
</style>