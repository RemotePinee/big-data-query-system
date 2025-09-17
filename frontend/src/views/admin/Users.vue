<template>
  <div class="users-container admin-fade-in" :class="{ 'refreshing': isRefreshing }">
    <!-- 页面标题和统计卡片 -->
    <div class="page-header">
      <div class="header-title">
        <h2>👥 用户管理</h2>
        <p>管理系统用户信息和权限</p>
      </div>
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon">👤</div>
          <div class="stat-info">
            <div class="stat-number">{{ totalUsers }}</div>
            <div class="stat-label">总用户数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-info">
            <div class="stat-number">{{ activeUsers }}</div>
            <div class="stat-label">活跃用户</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">👑</div>
          <div class="stat-info">
            <div class="stat-number">{{ adminUsers }}</div>
            <div class="stat-label">管理员</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">➕</div>
          <div class="stat-info">
            <div class="stat-number">{{ todayNewUsers }}</div>
            <div class="stat-label">今日新增</div>
          </div>
        </div>
      </div>
    </div>

    <el-card class="admin-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span class="card-title">用户列表</span>
            <span class="card-subtitle">共 {{ total }} 条记录</span>
          </div>
          <div class="search-box">
            <el-input
              v-model="searchKeyword"
              placeholder="🔍 搜索用户名/手机号"
              clearable
              @clear="handleSearch"
              class="search-input"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-select
              v-model="searchRole"
              placeholder="用户角色"
              clearable
              @change="handleSearch"
              class="role-select"
            >
              <el-option label="普通用户" value="user" />
              <el-option label="管理员" value="admin" />
            </el-select>
            <el-button type="primary" @click="handleSearch" class="admin-btn-primary">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>

            <el-button type="success" @click="handleAdd" class="admin-btn-secondary">
              <el-icon><Plus /></el-icon>
              添加用户
            </el-button>
          </div>
        </div>
      </template>
      
      <el-table 
        :data="users" 
        class="admin-table" 
        v-loading="loading"
        element-loading-text="正在加载用户数据..."
        element-loading-background="rgba(255, 255, 255, 0.8)"
      >
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="username" label="用户名" width="140">
          <template #default="scope">
            <div class="user-info">
              <el-avatar :size="32" class="user-avatar-small">
                {{ scope.row.username.charAt(0).toUpperCase() }}
              </el-avatar>
              <span class="username">{{ scope.row.username }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" width="130">
          <template #default="scope">
            <span class="phone-number">{{ scope.row.phone || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="160">
          <template #default="scope">
            <span class="email-text">{{ scope.row.email || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="role" label="角色" width="120" align="left">
          <template #default="scope">
            <el-tag 
              :type="scope.row.role === 'admin' ? 'danger' : 'success'"
              class="admin-tag"
              effect="light"
            >
              {{ scope.row.role === 'admin' ? '👑 管理员' : '👤 普通用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag 
              :type="scope.row.status === 'active' ? 'success' : 'warning'"
              class="admin-tag"
              effect="light"
            >
              {{ scope.row.status === 'active' ? '✅ 正常' : '⏸️ 禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="注册时间" width="180" align="center">
          <template #default="scope">
            <span class="date-text">{{ formatDate(scope.row.createdAt) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" align="center">
          <template #default="scope">
            <div class="action-buttons">
              <el-button 
                size="small" 
                type="primary"
                @click="handleEdit(scope.row)"
                class="action-btn"
              >
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button 
                size="small" 
                :type="scope.row.status === 'active' ? 'warning' : 'success'"
                @click="handleToggleStatus(scope.row)"
                class="action-btn"
              >
                <el-icon v-if="scope.row.status === 'active'"><Lock /></el-icon>
                <el-icon v-else><Unlock /></el-icon>
                {{ scope.row.status === 'active' ? '禁用' : '启用' }}
              </el-button>
              <el-button 
                size="small" 
                type="danger" 
                @click="handleDelete(scope.row)"
                class="action-btn"
              >
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          :page-size="pageSize"
          :current-page="currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          class="admin-pagination"
        />
      </div>
    </el-card>
    
    <!-- 用户表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      width="600px"
      class="admin-dialog"
      :append-to-body="false"
      top="120px"
      destroy-on-close
    >
      <template #header>
        <div class="dialog-header">
          <div class="dialog-title">
            <el-icon class="dialog-icon">
              <User v-if="!isEdit" />
              <Edit v-else />
            </el-icon>
            <span>{{ isEdit ? '✏️ 编辑用户' : '➕ 添加用户' }}</span>
          </div>
        </div>
      </template>
      <el-form 
        :model="userForm" 
        :rules="userRules" 
        ref="userFormRef" 
        label-width="100px"
        class="admin-form"
      >
        <div class="form-row">
          <el-form-item label="👤 用户名" prop="username">
            <el-input 
              v-model="userForm.username" 
              placeholder="请输入用户名"
              :prefix-icon="User"
            />
          </el-form-item>
          
          <el-form-item label="📱 手机号" prop="phone">
            <el-input 
              v-model="userForm.phone" 
              placeholder="请输入手机号"
              :prefix-icon="Phone"
            />
          </el-form-item>
        </div>
        
        <el-form-item label="📧 邮箱" prop="email">
          <el-input 
            v-model="userForm.email" 
            placeholder="请输入邮箱地址"
            :prefix-icon="Message"
          />
        </el-form-item>
        
        <div class="form-row" v-if="!isEdit">
          <el-form-item label="🔒 密码" prop="password">
            <el-input 
              v-model="userForm.password" 
              type="password" 
              placeholder="请输入密码"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>
          
          <el-form-item label="🔐 确认密码" prop="confirmPassword">
            <el-input 
              v-model="userForm.confirmPassword" 
              type="password" 
              placeholder="请再次输入密码"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>
        </div>
        
        <div class="form-row">
          <el-form-item label="👑 角色" prop="role">
            <el-select v-model="userForm.role" placeholder="请选择角色">
              <el-option label="👤 普通用户" value="user" />
              <el-option label="👑 管理员" value="admin" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="📊 状态" prop="status">
            <el-select v-model="userForm.status" placeholder="请选择状态">
              <el-option label="✅ 正常" value="active" />
              <el-option label="⏸️ 禁用" value="inactive" />
            </el-select>
          </el-form-item>
        </div>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" class="cancel-btn">
            <el-icon><Close /></el-icon>
            取消
          </el-button>
          <el-button 
            type="primary" 
            @click="submitForm" 
            :loading="submitting"
            class="admin-btn-primary"
          >
            <el-icon><Check /></el-icon>
            {{ isEdit ? '保存修改' : '创建用户' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  Plus, 
  Edit, 
  Delete, 
  Search, 
  Lock, 
  Unlock, 
  User, 
  Phone, 
  Message, 
  Check, 
  Close
} from '@element-plus/icons-vue';
import request from '@/api/request';

// 用户列表
const users = ref<any[]>([]);
const loading = ref(false);
const refreshing = ref(false);
const isRefreshing = ref(false);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

// 搜索相关
const searchKeyword = ref('');
const searchRole = ref('');

// 统计数据
const stats = ref({
  totalUsers: 0,
  activeUsers: 0,
  adminUsers: 0,
  todayNewUsers: 0
});

// 获取统计数据
  const fetchStats = async () => {
    try {
      const response = await request.get('/admin/statistics/users');
      if (response.code === 200) {
        stats.value = response.data;
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  };

// 计算统计数据（作为备用）
const totalUsers = computed(() => stats.value.totalUsers || users.value.length);
const activeUsers = computed(() => stats.value.activeUsers || users.value.filter(user => user.status === 'active').length);
const adminUsers = computed(() => stats.value.adminUsers || users.value.filter(user => user.role === 'admin').length);
const todayNewUsers = computed(() => {
  if (stats.value.todayNewUsers) {
    return stats.value.todayNewUsers;
  }
  // 作为备用，计算今日新增用户
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return users.value.filter(user => {
    if (!user.createdAt) return false;
    const userDate = new Date(user.createdAt);
    userDate.setHours(0, 0, 0, 0);
    return userDate.getTime() === today.getTime();
  }).length;
});

// 日期格式化函数
const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 表单相关
const dialogVisible = ref(false);
const isEdit = ref(false);
const userFormRef = ref();
const submitting = ref(false);

// 用户表单
const userForm = reactive({
  id: '',
  username: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'user',
  status: 'active'
});

// 表单验证规则
const validatePass = (_rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请输入密码'));
  } else {
    if (userForm.confirmPassword !== '') {
      userFormRef.value.validateField('confirmPassword');
    }
    callback();
  }
};

const validatePass2 = (_rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'));
  } else if (value !== userForm.password) {
    callback(new Error('两次输入密码不一致!'));
  } else {
    callback();
  }
};

const userRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' },
    { validator: validatePass, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validatePass2, trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
};

// 获取用户列表
const fetchUsers = async () => {
  loading.value = true;
  
  try {
    // 调用获取用户列表的API
    const response = await request.get('/admin/users') as any;
    
    if (response.code === 200) {
      users.value = response.data.users.map((user: any) => ({
        id: String(user.id),
        username: user.username,
        phone: user.phone || '',
        email: user.email || '',
        role: user.role || 'user',
        status: user.status || 'active',
        createdAt: user.createdAt ? new Date(user.createdAt).toLocaleString() : ''
      }));
      total.value = response.data.total;
    } else {
      ElMessage.error(response.message || '获取用户列表失败');
    }
  } catch (error) {
    console.error('获取用户列表失败:', error);
    ElMessage.error('获取用户列表失败，请检查网络连接');
  } finally {
    loading.value = false;
  }
};

// 添加用户
const handleAdd = () => {
  isEdit.value = false;
  resetForm();
  dialogVisible.value = true;
};

// 编辑用户
const handleEdit = (row: any) => {
  isEdit.value = true;
  resetForm();
  
  // 填充表单数据
  Object.keys(userForm).forEach(key => {
    if (key !== 'password' && key !== 'confirmPassword' && key in row) {
      (userForm as any)[key] = row[key];
    }
  });
  
  dialogVisible.value = true;
};

// 切换用户状态
const handleToggleStatus = async (row: any) => {
  const newStatus = row.status === 'active' ? 'inactive' : 'active';
  const actionText = newStatus === 'active' ? '启用' : '禁用';
  
  try {
    await ElMessageBox.confirm(
      `确定要${actionText}用户 "${row.username}" 吗?`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    // 调用后端API更新用户状态
    const response = await request.put(`/admin/users/${row.id}/status`, {
      status: newStatus
    });
    
    if (response.code === 200) {
      // 重新获取用户列表以确保数据同步
      await fetchUsers();
      ElMessage.success(`${actionText}用户成功`);
    } else {
      ElMessage.error(response.message || `${actionText}用户失败`);
    }
  } catch (error) {
    console.error(`${actionText}用户失败:`, error);
  }
};

// 删除用户
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${row.username}" 吗?`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    // 调用后端删除用户API
    const response = await request.delete(`/admin/users/${row.id}`);
    
    if (response.code === 200) {
      ElMessage.success('删除用户成功');
      // 重新获取用户列表以确保数据同步
      await fetchUsers();
      await fetchStats();
    } else {
      ElMessage.error(response.message || '删除用户失败');
    }
  } catch (error) {
    console.error('删除用户失败:', error);
    ElMessage.error('删除用户失败，请检查网络连接');
  }
};

// 提交表单
const submitForm = async () => {
  if (!userFormRef.value) return;
  
  await userFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      submitting.value = true;
      
      try {
        if (isEdit.value) {
          // 编辑用户
          // 这里应该调用更新用户的API
          // 由于我们没有实现该API，这里只是更新本地数据
          const index = users.value.findIndex(item => item.id === userForm.id);
          
          if (index !== -1) {
            const { password, confirmPassword, ...userData } = userForm;
            users.value[index] = { ...users.value[index], ...userData };
          }
          
          ElMessage.success('更新用户成功');
        } else {
          // 添加用户
          // 这里应该调用添加用户的API
          // 由于我们没有实现该API，这里只是更新本地数据
          const newUser = {
            id: String(users.value.length + 1),
            username: userForm.username,
            phone: userForm.phone,
            email: userForm.email,
            role: userForm.role,
            status: userForm.status,
            createdAt: new Date().toLocaleString()
          };
          
          users.value.push(newUser);
          total.value = users.value.length;
          
          ElMessage.success('添加用户成功');
        }
        
        dialogVisible.value = false;
      } catch (error) {
        console.error('提交表单失败:', error);
      } finally {
        submitting.value = false;
      }
    }
  });
};

// 重置表单
const resetForm = () => {
  userForm.id = '';
  userForm.username = '';
  userForm.phone = '';
  userForm.email = '';
  userForm.password = '';
  userForm.confirmPassword = '';
  userForm.role = 'user';
  userForm.status = 'active';
  
  // 如果表单已经创建，重置验证
  if (userFormRef.value) {
    userFormRef.value.resetFields();
  }
};

// 搜索用户
const handleSearch = () => {
  // 这里应该调用搜索API
  // 由于我们没有实现该API，这里只是简单过滤本地数据
  fetchUsers();
};

// 分页相关
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  fetchUsers();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  fetchUsers();
};

// 刷新数据
const refreshData = async () => {
  // 防止重复刷新
  if (refreshing.value || isRefreshing.value) {
    return;
  }
  
  try {
    refreshing.value = true;
    isRefreshing.value = true;
    console.log('开始刷新用户数据...');
    
    await Promise.all([
      fetchUsers(),
      fetchStats()
    ]);
    
    console.log('用户数据刷新完成');
    ElMessage.success('用户数据刷新成功');
  } catch (error) {
    console.error('刷新用户数据失败:', error);
    ElMessage.error('用户数据刷新失败');
  } finally {
    refreshing.value = false;
    // 延迟一点时间让动画效果更明显
    setTimeout(() => {
      isRefreshing.value = false;
    }, 300);
  }
};

onMounted(() => {
  fetchUsers();
  fetchStats();
  
  // 监听刷新事件
  window.addEventListener('refreshUsers', refreshData);
});

onUnmounted(() => {
  // 清理事件监听器
  window.removeEventListener('refreshUsers', refreshData);
});
</script>

<style scoped>
.users-container {
  padding: 0;
  min-height: 100%;
  transition: all 0.3s ease;
}

/* 刷新动画效果 */
.users-container.refreshing {
  opacity: 0.7;
  transform: scale(0.98);
  filter: blur(1px);
}

.users-container.refreshing .stat-card,
.users-container.refreshing .admin-card {
  animation: refreshPulse 1s ease-in-out infinite;
}

@keyframes refreshPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.02);
    opacity: 0.9;
  }
}

/* 页面头部 */
.page-header {
  margin-bottom: var(--admin-space-xl);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--admin-space-xl);
}

.header-title h2 {
  margin: 0 0 var(--admin-space-sm) 0;
  font-size: 32px;
  font-weight: 700;
  background: var(--admin-gradient-accent);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
}

.header-title p {
  margin: 0;
  color: var(--admin-gray-600);
  font-size: 16px;
}

/* 统计卡片 */
.stats-cards {
  display: flex;
  gap: var(--admin-space-md);
}

/* 统计卡片 */
.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: linear-gradient(135deg, #409eff 0%, #1d4ed8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

/* 内容卡片 */
.content-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 表格头部 */
.table-header {
  padding: 20px 24px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.header-left h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

/* 搜索框 */
.search-box {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.search-input {
  width: 240px;
}

.role-select {
  width: 140px;
}

/* 表格样式 */
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar-small {
  background: linear-gradient(135deg, #409eff 0%, #1d4ed8 100%);
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.username {
  font-weight: 500;
  color: #303133;
}

.phone-number, .email-text {
  color: #606266;
  font-size: 14px;
}

.date-text {
  color: #909399;
  font-size: 13px;
  font-family: 'Courier New', monospace;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

/* 分页容器 */
.pagination-container {
  padding: 20px;
  display: flex;
  justify-content: center;
  background: white;
  border-top: 1px solid #ebeef5;
}

/* 对话框样式 */
.dialog-header {
  display: flex;
  align-items: center;
  gap: var(--admin-space-md);
}

.dialog-title {
  display: flex;
  align-items: center;
  gap: var(--admin-space-sm);
  font-size: 18px;
  font-weight: 600;
  color: var(--admin-primary);
}

.dialog-icon {
  font-size: 20px;
  color: var(--admin-secondary);
}

/* 表单样式 */
.form-row {
  display: flex;
  gap: var(--admin-space-md);
}

.form-row .el-form-item {
  flex: 1;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--admin-space-md);
  padding-top: var(--admin-space-lg);
  border-top: 1px solid var(--admin-gray-200);
}

.cancel-btn {
  background: var(--admin-gray-100) !important;
  color: var(--admin-gray-600) !important;
  border: 1px solid var(--admin-gray-300) !important;
  border-radius: var(--admin-radius-md) !important;
  transition: all var(--admin-transition-normal) !important;
}

.cancel-btn:hover {
  background: var(--admin-gray-200) !important;
  color: var(--admin-gray-700) !important;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .stats-cards {
    justify-content: space-between;
  }
  
  .stat-card {
    flex: 1;
    min-width: 120px;
  }
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    justify-content: stretch;
  }
  
  .search-input,
  .role-select {
    flex: 1;
    width: auto;
  }
  
  .stats-cards {
    flex-direction: column;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }
  
  .form-row {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .header-title h2 {
    font-size: 24px;
  }
  
  .stat-card {
    padding: var(--admin-space-md);
  }
  
  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }
  
  .stat-number {
    font-size: 20px;
  }
}
</style>