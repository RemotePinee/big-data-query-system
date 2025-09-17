<template>
  <div class="user-center-container">
    <!-- 侧边栏 -->
    <div class="sidebar">
      <!-- 用户信息卡片 -->
      <div class="user-profile-card">
        <div class="avatar-section">
          <div class="avatar-wrapper" @click="changeAvatar">
            <img v-if="avatarUrl" :src="avatarUrl" class="avatar-img" @error="handleAvatarError" />
            <div v-else class="avatar-placeholder">
              <el-icon><User /></el-icon>
            </div>
            <div class="avatar-edit-overlay">
              <el-icon><Camera /></el-icon>
            </div>
          </div>
          <div class="user-info">
            <h3 class="username">{{ userForm.username || '未设置用户名' }}</h3>
            <p class="user-email">{{ userForm.email || '未设置邮箱' }}</p>
          </div>
        </div>
      </div>
      
      <!-- 导航菜单 -->
      <div class="nav-menu">
        <div class="menu-title">账户管理</div>
        <div 
          class="menu-item" 
          :class="{ active: activeTab === 'profile' }"
          @click="activeTab = 'profile'"
        >
          <div class="menu-icon">
            <el-icon><User /></el-icon>
          </div>
          <span class="menu-text">个人信息</span>
        </div>
        <div 
          class="menu-item" 
          :class="{ active: activeTab === 'password' }"
          @click="activeTab = 'password'"
        >
          <div class="menu-icon">
            <el-icon><Lock /></el-icon>
          </div>
          <span class="menu-text">修改密码</span>
        </div>
        <div 
          class="menu-item" 
          :class="{ active: activeTab === 'orders' }"
          @click="activeTab = 'orders'"
        >
          <div class="menu-icon">
            <el-icon><Document /></el-icon>
          </div>
          <span class="menu-text">我的订单</span>
        </div>
      </div>
      
      <!-- 退出登录按钮 -->
      <div class="logout-section">
        <div class="menu-item logout-btn" @click="logout">
          <div class="menu-icon">
            <el-icon><SwitchButton /></el-icon>
          </div>
          <span class="menu-text">退出登录</span>
        </div>
      </div>
    </div>
    
    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 页面头部 -->
      <div class="content-header">
        <div class="header-left">
          <h1 class="page-title">{{ getPageTitle() }}</h1>
          <p class="page-description">{{ getPageDescription() }}</p>
        </div>
        <div class="header-right">
          <el-tooltip content="返回首页" placement="bottom">
            <div class="home-btn" @click="goHome">
              <el-icon><HomeFilled /></el-icon>
            </div>
          </el-tooltip>
        </div>
      </div>
      
      <!-- 内容区域 -->
      <div class="content-body">

        <!-- 个人信息 -->
        <div v-if="activeTab === 'profile'" class="content-section">
          <div class="section-card">
            <div class="card-header">
              <h3>基本信息</h3>
              <p>管理您的个人基本信息</p>
            </div>
            <div class="card-body">
              <el-form 
                ref="userFormRef" 
                :model="userForm" 
                :rules="userRules" 
                label-width="100px"
                class="profile-form"
              >
                <el-row :gutter="24">
                  <el-col :span="12">
                    <el-form-item label="用户名" prop="username">
                      <el-input v-model="userForm.username" placeholder="请输入用户名" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="邮箱" prop="email">
                      <el-input v-model="userForm.email" placeholder="请输入邮箱" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="手机号" prop="phone">
                      <el-input v-model="userForm.phone" placeholder="请输入手机号" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item>
                  <el-button 
                    type="primary" 
                    @click="updateUserInfo" 
                    :loading="updating"
                  >
                    保存修改
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </div>

        
        <!-- 密码修改 -->
        <div v-else-if="activeTab === 'password'" class="content-section">
          <div class="section-card">
            <div class="card-header">
              <h3>修改密码</h3>
              <p>为了您的账户安全，请定期修改密码</p>
            </div>
            <div class="card-body">
              <el-form 
                ref="passwordFormRef" 
                :model="passwordForm" 
                :rules="passwordRules" 
                label-width="100px"
                class="password-form"
              >
                <el-row :gutter="24">
                  <el-col :span="12">
                    <el-form-item label="当前密码" prop="currentPassword">
                      <el-input v-model="passwordForm.currentPassword" type="password" placeholder="请输入当前密码" show-password />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="24">
                  <el-col :span="12">
                    <el-form-item label="新密码" prop="newPassword">
                      <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" show-password />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="确认密码" prop="confirmPassword">
                      <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请确认新密码" show-password />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item>
                  <el-button 
                    type="primary" 
                    @click="updatePassword" 
                    :loading="updating"
                  >
                    修改密码
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </div>

        
        <!-- 我的订单 -->
        <div v-else-if="activeTab === 'orders'" class="content-section">
          <div class="section-card">
            <div class="card-header">
              <h3>我的订单</h3>
              <p>查看和管理您的所有订单</p>
              <div class="order-actions">
                <button 
                  v-if="!isLoggedIn"
                  class="login-btn"
                  @click="simulateLogin"
                >
                  模拟登录
                </button>
              </div>
            </div>
            <div class="card-body">
              <div v-if="orders.length > 0">
                <el-table :data="orders" style="width: 100%" v-loading="loadingOrders">
                  <el-table-column prop="orderNo" label="订单号" width="180" />
                  <el-table-column prop="queryName" label="查询项目" />
                  <el-table-column prop="amount" label="金额" width="120">
                    <template #default="scope">
                      ¥{{ scope.row.amount }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="status" label="状态" width="120">
                    <template #default="scope">
                      <el-tag :type="getStatusType(scope.row.status)">
                        {{ getStatusText(scope.row.status) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="createdAt" label="创建时间" width="180">
                    <template #default="scope">
                      {{ formatDate(scope.row.createdAt) }}
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="200">
                    <template #default="scope">
                      <el-button size="small" class="action-btn" @click="handleViewDetail(scope.row)">查看详情</el-button>
                      <el-button v-if="scope.row.status === 'completed'" size="small" class="action-btn" @click="handleDownloadResult(scope.row)">下载结果</el-button>
                    </template>
                  </el-table-column>
                </el-table>
                
                <!-- 分页 -->
                <div v-if="totalOrders > 0" class="pagination-wrapper">
                  <el-pagination
                    v-model:current-page="currentPage"
                    :page-size="pageSize"
                    :total="totalOrders"
                    layout="total, prev, pager, next, jumper"
                    @current-change="handlePageChange"
                  />
                </div>
              </div>
              <div v-else class="empty-state">
                <el-empty description="暂无订单数据">
                  <el-button type="primary" @click="$router.push('/query')">立即查询</el-button>
                </el-empty>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 订单详情弹窗 -->
    <el-dialog
      v-model="orderDetailVisible"
      title="订单详情"
      width="600px"
      :before-close="closeOrderDetail"
      class="order-detail-dialog"
    >
      <div v-if="currentOrderDetail" class="order-detail">
        <div class="detail-section">
          <h4 class="section-title">基本信息</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">订单号</span>
              <div class="value">
                <span>{{ currentOrderDetail.orderNo }}</span>
                <el-button 
                  type="text" 
                  size="small" 
                  @click="copyOrderNo(currentOrderDetail.orderNo)"
                  class="copy-btn"
                >
                  <el-icon><DocumentCopy /></el-icon>
                </el-button>
              </div>
            </div>
            <div class="detail-item">
              <span class="label">查询项目</span>
              <span class="value">{{ currentOrderDetail.queryName }}</span>
            </div>
            <div class="detail-item">
              <span class="label">订单金额</span>
              <span class="value amount">{{ currentOrderDetail.amount }}</span>
            </div>
            <div class="detail-item">
              <span class="label">订单状态</span>
              <div class="value">
                <el-tag :type="getStatusType(currentOrderDetail.status)" class="status-tag">
                  {{ getStatusText(currentOrderDetail.status) }}
                </el-tag>
              </div>
            </div>
            <div class="detail-item">
              <span class="label">创建时间</span>
              <span class="value">{{ formatDate(currentOrderDetail.createdAt) }}</span>
            </div>
          </div>
        </div>
        
        <div v-if="currentOrderDetail.queryParams" class="detail-section">
          <h4 class="section-title">查询参数</h4>
          <div class="detail-grid">
            <div class="detail-item" v-for="(value, key) in currentOrderDetail.queryParams" :key="key">
              <span class="label">{{ key }}</span>
              <span class="value">{{ value }}</span>
            </div>
          </div>
        </div>
        
        <div v-if="currentOrderDetail.result" class="detail-section">
          <h4 class="section-title">查询结果</h4>
          <div class="result-container">
            <div class="result-header">
              <span>查询结果数据</span>
              <el-button 
                type="text" 
                size="small" 
                @click="copyOrderNo(JSON.stringify(currentOrderDetail.result, null, 2))"
                class="copy-btn"
              >
                <el-icon><DocumentCopy /></el-icon>
                复制结果
              </el-button>
            </div>
            <div class="result-content">
              <pre>{{ JSON.stringify(currentOrderDetail.result, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeOrderDetail" class="cancel-btn">关闭</el-button>
          <el-button
            v-if="currentOrderDetail && currentOrderDetail.status === 'completed'"
            type="primary"
            class="primary-btn"
            @click="handleDownloadResult(currentOrderDetail)"
          >
            <el-icon><Download /></el-icon>
            下载结果
          </el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 头像选择弹窗 -->
     <el-dialog
       v-model="avatarDialogVisible"
       title="选择头像"
       width="500px"
       :before-close="closeAvatarDialog"
       class="avatar-dialog"
     >
       <div class="avatar-selection-section">
         <div class="current-avatar">
           <div class="current-label">当前头像</div>
           <img v-if="avatarUrl" :src="avatarUrl" class="preview-avatar" />
           <div v-else class="preview-placeholder">
             <el-icon><User /></el-icon>
           </div>
         </div>
         
         <div class="avatar-grid">
           <div 
             v-for="avatar in avatarList" 
             :key="avatar"
             class="avatar-option"
             :class="{ selected: selectedAvatar === avatar }"
             @click="selectAvatar(avatar)"
           >
             <img :src="avatar" :alt="'头像选项'" />
             <div v-if="selectedAvatar === avatar" class="selected-mark">
               <el-icon><Check /></el-icon>
             </div>
           </div>
         </div>
       </div>
       
       <template #footer>
         <div class="dialog-footer">
           <el-button @click="closeAvatarDialog">取消</el-button>
           <el-button type="primary" @click="confirmAvatarChange" :disabled="!selectedAvatar">确认更换</el-button>
         </div>
       </template>
     </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  User, 
  Lock, 
  Document,
  DocumentCopy,
  Download,
  SwitchButton,
  HomeFilled,
  Camera,
  Check
} from '@element-plus/icons-vue';
import { orderApi } from '@/api/order.ts';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
// import { userApi } from '@/api/user.ts'; // 暂时注释掉未使用的导入

const router = useRouter();
const userStore = useUserStore();

// 头像相关
const avatarDialogVisible = ref(false);
const defaultAvatar = '/default-avatar.svg';
const avatarList = ref<string[]>([]);
const selectedAvatar = ref('');

// 生成头像列表
const generateAvatarList = () => {
  const avatarImages = [
    'boy-1.png', 'boy-2.png', 'boy-3.png', 'boy-4.png', 'boy-5.png', 'boy-6.png', 'boy-7.png', 'boy-8.png',
    'girl-1.png', 'girl-2.png', 'girl-3.png', 'girl-4.png', 'girl-5.png', 'girl-6.png', 'girl-7.png', 'girl-8.png', 'girl62.png'
  ];
  avatarList.value = avatarImages.map(img => `/avatar/${img}`);
};

// 计算头像URL
const avatarUrl = computed(() => {
  if (userForm.avatar) {
    return userForm.avatar;
  }
  if (selectedAvatar.value) {
    return selectedAvatar.value;
  }
  return defaultAvatar;
});
const activeTab = ref('profile');

// 用户信息表单
const userFormRef = ref();
const updating = ref(false);
const userForm = reactive({
  username: '',
  phone: '',
  email: '',
  avatar: '',
  createdAt: ''
});

// 密码表单
const passwordFormRef = ref();
const updatingPassword = ref(false);
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// 订单相关
const orders = ref<any[]>([]);
const loadingOrders = ref(false);
const totalOrders = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

// 登录状态检查
const isLoggedIn = computed(() => {
  return !!localStorage.getItem('token');
});

// 表单验证规则
const userRules = {
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
};

const validatePass = (_rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请输入密码'));
  } else {
    if (passwordForm.confirmPassword !== '') {
      if (!passwordFormRef.value) return;
      passwordFormRef.value.validateField('confirmPassword', () => null);
    }
    callback();
  }
};

const validatePass2 = (_rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'));
  } else if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入密码不一致!'));
  } else {
    callback();
  }
};

const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, validator: validatePass, trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validatePass2, trigger: 'blur' }
  ]
};

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN');
};

// 模拟登录函数
const simulateLogin = () => {
  // 生成一个模拟的JWT token
  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoidGVzdCIsImlhdCI6MTYzOTU2NzIwMCwiZXhwIjoxNjM5NjUzNjAwfQ.test';
  const mockUserInfo = {
    id: 1,
    username: 'test',
    email: 'test@example.com',
    phone: '13800138000',
    realName: '测试用户'
  };
  
  localStorage.setItem('token', mockToken);
  localStorage.setItem('userInfo', JSON.stringify(mockUserInfo));
  
  ElMessage.success('模拟登录成功');
  
  // 重新获取用户信息和订单
  fetchUserInfo();
  fetchOrders();
};

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    // 使用userStore获取用户信息，复用移动端逻辑
    await userStore.getUserInfo();
    Object.assign(userForm, userStore.userInfo);
  } catch (error) {
    console.error('获取用户信息失败:', error);
  }
};

// 获取订单列表
const fetchOrders = async () => {
  loadingOrders.value = true;
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value
    };
    
    const response = await orderApi.getUserOrders(params);
    
    if (response.code === 200) {
      // 转换API返回的数据格式为前端需要的格式
       orders.value = response.data.orders.map((order: any) => {
         // 处理金额：移除¥符号并转换为数字
         let amount = 0;
         if (order.amount) {
           const amountStr = order.amount.toString().replace('¥', '');
           amount = parseFloat(amountStr) || 0;
         }
         
         // 状态映射：将后端状态转换为前端显示状态
           let mappedStatus = order.status;
           switch (order.status) {
             case 'paid':
               mappedStatus = 'completed';
               break;
             case 'pending':
               mappedStatus = 'unpaid';
               break;
             case 'failed':
               mappedStatus = 'failed';
               break;
             case 'cancelled':
               mappedStatus = 'cancelled';
               break;
             default:
               mappedStatus = order.status;
           }
          
          return {
            orderNo: order.orderNo || order.order_no || order.id,
            queryName: order.service?.name || order.queryItemName || order.query_name || '查询服务',
            amount: amount,
            status: mappedStatus,
            createdAt: order.createdAt || order.created_at
          };
       });
      totalOrders.value = response.data.pagination?.total || response.data.total || 0;
    } else {
      ElMessage.error(response.message || '获取订单列表失败');
    }
  } catch (error: any) {
    console.error('获取订单列表失败:', error);
    ElMessage.error('获取订单列表失败');
    orders.value = [];
    totalOrders.value = 0;
  } finally {
    loadingOrders.value = false;
  }
};

// 订单详情弹窗状态
const orderDetailVisible = ref(false);
const currentOrderDetail = ref<any>(null);

// 查看订单详情
const handleViewDetail = async (order: any) => {
  try {
    // 调用订单详情API
    const response = await orderApi.getOrderDetailByOrderNo(order.orderNo);
    
    if (response.code === 200) {
      // 设置订单详情数据
      currentOrderDetail.value = {
        ...order,
        ...response.data
      };
      orderDetailVisible.value = true;
    } else {
      ElMessage.error(response.message || '获取订单详情失败');
    }
  } catch (error: any) {
    console.error('获取订单详情失败:', error);
    ElMessage.error('获取订单详情失败');
  }
};

// 关闭订单详情弹窗
const closeOrderDetail = () => {
  orderDetailVisible.value = false;
  currentOrderDetail.value = null;
};

// 复制订单号
const copyOrderNo = async (orderNo: string) => {
  try {
    await navigator.clipboard.writeText(orderNo);
    ElMessage.success('订单号已复制到剪贴板');
  } catch (error) {
    ElMessage.error('复制失败');
  }
};

// 更新个人信息
const updateUserInfo = async () => {
  if (!userFormRef.value) return;
  
  await userFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      updating.value = true;
      
      try {
        // 使用userStore保存用户信息，复用移动端逻辑
        await userStore.updateUserInfo({
          username: userForm.username,
          phone: userForm.phone,
          email: userForm.email,
          avatar: userForm.avatar
        });
        
        ElMessage.success('个人信息更新成功');
        updating.value = false;
      } catch (error) {
        console.error('更新个人信息失败:', error);
        ElMessage.error('更新个人信息失败');
        updating.value = false;
      }
    }
  });
};

// 修改密码
const updatePassword = async () => {
  if (!passwordFormRef.value) return;
  
  await passwordFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      updatingPassword.value = true;
      
      try {
        // 调用userStore的修改密码方法
        await userStore.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
        
        ElMessage.success('密码修改成功');
        
        // 重置表单
        passwordForm.currentPassword = '';
        passwordForm.newPassword = '';
        passwordForm.confirmPassword = '';
        
        updatingPassword.value = false;
      } catch (error: any) {
        console.error('修改密码失败:', error);
        
        // 显示具体的错误信息
        const errorMessage = error.response?.data?.message || error.message || '修改密码失败';
        ElMessage.error(errorMessage);
        
        updatingPassword.value = false;
      }
    }
  });
};

// 头像相关方法
const changeAvatar = () => {
  avatarDialogVisible.value = true;
};

const closeAvatarDialog = () => {
  avatarDialogVisible.value = false;
  selectedAvatar.value = '';
};

const handleAvatarError = (event: any) => {
  event.target.src = defaultAvatar;
};

const selectAvatar = (avatar: string) => {
  selectedAvatar.value = avatar;
};

const confirmAvatarChange = async () => {
  if (selectedAvatar.value) {
    userForm.avatar = selectedAvatar.value;
    
    // 使用userStore保存头像，复用移动端逻辑
    try {
      await userStore.updateUserInfo({
        avatar: selectedAvatar.value
      });
      ElMessage.success('头像更换成功');
    } catch (error) {
      console.error('保存头像失败:', error);
      ElMessage.error('头像保存失败');
    }
  }
  closeAvatarDialog();
};



// 获取状态类型
const getStatusType = (status: string) => {
  switch (status) {
    case 'completed':
    case 'paid':
      return 'success';
    case 'processing':
      return 'warning';
    case 'unpaid':
    case 'pending':
      return 'info';
    case 'failed':
    case 'cancelled':
      return 'danger';
    default:
      return 'info';
  }
};

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    completed: '已完成',
    failed: '失败',
    unpaid: '待支付',
    cancelled: '已取消',
    paid: '已支付'
  };
  return statusMap[status] || '未知状态';
};

// 分页处理
const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchOrders(); // 重新获取订单数据
};

// 下载查询结果
const handleDownloadResult = async (order: any) => {
  try {
    ElMessage.info('正在准备下载...');
    
    // 调用下载API
    const response = await fetch(`/api/orders/orderNo/${order.orderNo}/download`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userStore.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '下载失败');
    }
    
    // 获取文件名
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `查询结果_${order.orderNo}_${new Date().toISOString().slice(0, 10)}.json`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = decodeURIComponent(filenameMatch[1].replace(/['"]/g, ''));
      }
    }
    
    // 获取数据并创建下载
    const data = await response.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    
    // 创建下载链接
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    // 清理
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    ElMessage.success('下载成功');
  } catch (error: any) {
    console.error('下载查询结果失败:', error);
    ElMessage.error(error.message || '下载失败，请稍后再试');
  }
};

// 获取页面标题
const getPageTitle = () => {
  switch (activeTab.value) {
    case 'profile':
      return '个人信息';
    case 'password':
      return '修改密码';
    case 'orders':
      return '我的订单';
    default:
      return '个人中心';
  }
};

// 获取页面描述
const getPageDescription = () => {
  switch (activeTab.value) {
    case 'profile':
      return '管理您的个人基本信息';
    case 'password':
      return '为了您的账户安全，请定期修改密码';
    case 'orders':
      return '查看和管理您的所有订单';
    default:
      return '欢迎来到个人中心';
  }
};



// 退出登录
const logout = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要退出登录吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    
    // 清除本地存储的用户信息
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    
    ElMessage.success('退出登录成功');
    
    // 跳转到首页
    router.push('/');
  } catch {
    // 用户取消退出
  }
};

// 返回首页
const goHome = () => {
  router.push('/');
};

onMounted(() => {
  generateAvatarList();
  fetchUserInfo();
  fetchOrders();
});
</script>

<style scoped>
.user-center-container {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
}

/* 侧边栏样式 */
.sidebar {
  width: 280px;
  background: #ffffff;
  border-right: 1px solid #e2e8f0;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  justify-content: space-between;
}

.user-profile-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.avatar-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.avatar-wrapper:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.avatar-wrapper:hover .avatar-edit-overlay {
  opacity: 1;
}

.avatar-edit-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: white;
  font-size: 20px;
}

.avatar-uploader {
  display: block;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #c0faa0;
  box-sizing: border-box;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #c0faa0;
  cursor: pointer;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.avatar-placeholder:hover {
  background: #cbd5e1;
}

.avatar-placeholder .el-icon {
  font-size: 24px;
  color: #64748b;
}

.user-info {
  text-align: center;
}

.username {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.user-email {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.nav-menu {
  flex: 1;
}

.menu-title {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 16px;
  padding: 0 12px;
}

/* 退出登录按钮样式 */
.logout-section {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.logout-btn {
  color: #ef4444 !important;
  transition: all 0.3s ease;
  background: #fef2f2;
  border-radius: 8px;
  justify-content: center !important;
  align-items: center !important;
  text-align: center;
  gap: 8px !important;
}

.logout-btn:hover {
  background: #fee2e2 !important;
  color: #dc2626 !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);
}

.logout-btn .menu-icon {
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logout-btn:hover .menu-icon {
  color: #dc2626;
}

.logout-btn .menu-text {
  text-align: center;
  font-weight: 500;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 4px;
}

.menu-item:hover {
  background: #f1f5f9;
}

.menu-item.active {
  background: #c0faa0;
  color: #000000;
  font-weight: 600;
}

.menu-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-text {
  font-size: 14px;
  font-weight: 500;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.header-left {
  flex: 1;
}

.header-right {
  display: flex;
  align-items: center;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.page-description {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

/* 返回首页按钮样式 */
.home-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #64748b;
}

.home-btn:hover {
  background: #10b981;
  border-color: #10b981;
  color: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.home-btn .el-icon {
  font-size: 18px;
}

.content-body {
  background: #ffffff;
  border-radius: 12px;
  min-height: calc(100vh - 200px);
}

.content-section {
  padding: 0;
}

.section-card {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.card-header {
  padding: 24px 24px 0 24px;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 0;
}

.card-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.card-header p {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 24px 0;
}

.card-body {
  padding: 24px;
}



/* 表单样式 */
.profile-form {
  max-width: 800px;
}

.profile-form .el-form-item {
  margin-bottom: 24px;
}

.profile-form .el-form-item__label {
  font-weight: 600;
  color: #374151;
}

.profile-form .el-input__wrapper {
  border-radius: 8px;
  border: 1px solid #d1d5db;
  transition: all 0.2s ease;
}

.profile-form .el-input__wrapper:hover {
  border-color: #c0faa0;
}

.profile-form .el-input__wrapper.is-focus {
  border-color: #c0faa0;
  box-shadow: 0 0 0 3px rgba(192, 250, 160, 0.1);
}

.password-form {
  max-width: 600px;
}

.password-form .el-form-item {
  margin-bottom: 24px;
}

.password-form .el-form-item__label {
  font-weight: 600;
  color: #374151;
}

.password-form .el-input__wrapper {
  border-radius: 8px;
  border: 1px solid #d1d5db;
  transition: all 0.2s ease;
}

.password-form .el-input__wrapper:hover {
  border-color: #c0faa0;
}

.password-form .el-input__wrapper.is-focus {
  border-color: #c0faa0;
  box-shadow: 0 0 0 3px rgba(192, 250, 160, 0.1);
}

/* 订单表格样式 */
.el-table {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.el-table th {
  background: #f8fafc;
  color: #374151;
  font-weight: 600;
  border-bottom: 1px solid #e2e8f0;
}

.el-table td {
  border-bottom: 1px solid #f1f5f9;
}

.el-table .el-table__row:hover {
  background: #f8fafc;
}

/* 分页样式 */
.pagination-wrapper {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: center;
}

.el-pagination {
  gap: 8px;
}

.el-pagination .el-pager li {
  border-radius: 6px;
  margin: 0 2px;
  transition: all 0.2s ease;
}

.el-pagination .el-pager li.is-active {
  background: #000000;
  border-color: #000000;
  color: #c0faa0;
}

.el-pagination .el-pager li:hover {
  background: #f1f5f9;
}

/* 空状态样式 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-state .el-empty {
  padding: 40px 0;
}

.empty-state .el-empty__description {
  color: #64748b;
  font-size: 16px;
  margin-bottom: 24px;
}

.empty-state .el-button {
  background: #000000;
  border-color: #000000;
  color: #c0faa0;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 600;
}

.empty-state .el-button:hover {
  background: #333333;
  border-color: #333333;
}

/* 按钮样式 */
.el-button {
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.el-button--primary {
  background: #000000;
  border-color: #000000;
  color: #c0faa0;
}

.el-button--primary:hover {
  background: #333333;
  border-color: #333333;
  transform: translateY(-1px);
}

.el-button--primary.is-loading {
  background: #666666;
  border-color: #666666;
}

.el-button--small {
  padding: 8px 16px;
  font-size: 12px;
}

.el-button.is-link {
  color: #000000;
  text-decoration: none;
}

.el-button.is-link:hover {
  color: #333333;
  text-decoration: underline;
}

/* 标签样式 */
.el-tag {
  border-radius: 6px;
  font-weight: 500;
  border: none;
}

.el-tag--success {
  background: #d1fae5;
  color: #059669;
}

.el-tag--warning {
  background: #fef3c7;
  color: #d97706;
}

.el-tag--info {
  background: #e0e7ff;
  color: #3730a3;
}

.el-tag--danger {
  background: #fee2e2;
  color: #dc2626;
}

/* 登录按钮样式 */
.order-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.login-btn {
  padding: 8px 16px;
  background: #67c23a;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.login-btn:hover {
  background: #5daf34;
}

/* 操作按钮样式 */
.action-btn {
  background: #000000 !important;
  color: #ffffff !important;
  border: 1px solid #000000 !important;
  border-radius: 4px;
  padding: 6px 12px;
  margin-right: 8px;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: #C0FAA0 !important;
  color: #000000 !important;
  border-color: #C0FAA0 !important;
}

/* 头像弹窗样式 */
.avatar-dialog {
  border-radius: 12px;
  overflow: hidden;
}

.avatar-dialog .el-dialog__header {
  background: #000000;
  color: #c0faa0;
  padding: 20px 24px;
  margin: 0;
}

.avatar-dialog .el-dialog__title {
  font-size: 18px;
  font-weight: 600;
  color: #c0faa0;
}

.avatar-dialog .el-dialog__headerbtn {
  top: 20px;
  right: 24px;
}

.avatar-dialog .el-dialog__headerbtn .el-dialog__close {
  color: #c0faa0;
  font-size: 18px;
}

.avatar-dialog .el-dialog__body {
  padding: 24px;
}

.avatar-selection-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.current-avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 2px dashed #e5e7eb;
}

.current-label {
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
}

.preview-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #c0faa0;
}

.preview-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #e5e7eb;
}

.preview-placeholder .el-icon {
  font-size: 24px;
  color: #9ca3af;
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 16px;
  max-height: 300px;
  overflow-y: auto;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.avatar-option {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 3px solid transparent;
}

.avatar-option:hover {
  transform: scale(1.05);
  border-color: #c0faa0;
}

.avatar-option.selected {
  border-color: #000000;
  transform: scale(1.1);
}

.avatar-option img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.selected-mark {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 24px;
  height: 24px;
  background: #000000;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c0faa0;
  font-size: 12px;
  border: 2px solid #ffffff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-center-container {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
    padding: 16px;
  }
  
  .nav-menu {
    display: flex;
    gap: 8px;
    overflow-x: auto;
  }
  
  .menu-title {
    display: none;
  }
  
  .menu-item {
    white-space: nowrap;
    margin-bottom: 0;
  }
  
  .main-content {
    padding: 16px;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .card-body {
    padding: 16px;
  }
  
  .profile-form .el-col,
  .password-form .el-col {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .sidebar {
    padding: 12px;
  }
  
  .user-profile-card {
    padding: 16px;
  }
  
  .avatar-img,
  .avatar-placeholder {
    width: 60px;
    height: 60px;
  }
  
  .username {
    font-size: 16px;
  }
  
  .main-content {
    padding: 12px;
  }
  
  .card-header,
  .card-body {
    padding: 16px;
  }
}

/* 订单详情弹窗样式 */
.order-detail-dialog {
  border-radius: 12px;
  overflow: hidden;
}

.order-detail-dialog .el-dialog__header {
  background: #000000;
  color: #c0faa0;
  padding: 20px 24px;
  margin: 0;
}

.order-detail-dialog .el-dialog__title {
  font-size: 18px;
  font-weight: 600;
  color: #c0faa0;
}

.order-detail-dialog .el-dialog__headerbtn {
  top: 20px;
  right: 24px;
}

.order-detail-dialog .el-dialog__headerbtn .el-dialog__close {
  color: #c0faa0;
  font-size: 18px;
}

.order-detail-dialog .el-dialog__body {
  padding: 0;
}

.order-detail {
  padding: 24px;
}

.detail-section {
  margin-bottom: 32px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #e5e7eb;
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 40px;
  height: 2px;
  background: #000000;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.detail-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #e5e7eb;
  transition: all 0.3s ease;
}

.detail-item:hover {
  background: #f1f5f9;
  border-left-color: #000000;
}

.detail-item .label {
  font-weight: 600;
  color: #374151;
  min-width: 80px;
  flex-shrink: 0;
}

.detail-item .value {
  color: #1f2937;
  flex: 1;
  text-align: right;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.detail-item .value.amount {
  font-size: 18px;
  font-weight: 700;
  color: #059669;
}

.copy-btn {
  padding: 4px 8px !important;
  color: #000000 !important;
  border: 1px solid #e5e7eb !important;
  border-radius: 6px !important;
  transition: all 0.2s ease !important;
}

.copy-btn:hover {
  background: #000000 !important;
  color: #c0faa0 !important;
  border-color: #000000 !important;
}

.status-tag {
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 20px;
}

.result-container {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
  color: #374151;
}

.result-content {
  padding: 20px;
  max-height: 300px;
  overflow-y: auto;
}

.result-content pre {
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: #374151;
  white-space: pre-wrap;
  word-break: break-all;
  background: transparent;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  background: #f8fafc;
  border-top: 1px solid #e5e7eb;
}

.cancel-btn {
  padding: 10px 20px !important;
  border: 1px solid #d1d5db !important;
  color: #6b7280 !important;
  background: white !important;
  border-radius: 8px !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
}

.cancel-btn:hover {
  border-color: #9ca3af !important;
  color: #374151 !important;
}

.primary-btn {
  padding: 10px 20px !important;
  background: #000000 !important;
  border: 1px solid #000000 !important;
  color: #c0faa0 !important;
  border-radius: 8px !important;
  font-weight: 600 !important;
  transition: all 0.2s ease !important;
}

.primary-btn:hover {
  background: #c0faa0 !important;
  color: #000000 !important;
  border-color: #c0faa0 !important;
}

/* 弹窗响应式设计 */
@media (max-width: 768px) {
  .order-detail-dialog {
    width: 95% !important;
    margin: 5vh auto !important;
  }
  
  .order-detail {
    padding: 16px;
  }
  
  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .detail-item .value {
    text-align: left;
    justify-content: flex-start;
  }
  
  .dialog-footer {
    padding: 16px;
    flex-direction: column;
  }
  
  .cancel-btn,
  .primary-btn {
    width: 100% !important;
  }
}

</style>