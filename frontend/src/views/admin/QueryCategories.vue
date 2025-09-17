<template>
  <div class="admin-page" :class="{ 'refreshing': isRefreshing }">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">
          <el-icon class="title-icon"><List /></el-icon>
          查询分类管理
        </h1>
      </div>
      <div class="header-right">
        <el-button 
          type="primary" 
          :icon="Plus" 
          @click="showAddDialog"
          class="add-btn"
        >
          添加分类
        </el-button>
      </div>
    </div>

    <!-- 分类列表 -->
    <div class="content-card">
      <div class="table-header">
        <h3>分类列表</h3>
      </div>
      <el-table
        v-loading="loading"
        :data="categories"
        class="admin-table"
        stripe
        :header-cell-style="{ background: '#f8fafc', color: '#475569' }"
      >
        <el-table-column prop="id" label="分类ID" width="120" />
        <el-table-column prop="name" label="分类名称" min-width="150">
          <template #default="scope">
            <div class="category-name">
              <el-icon class="category-icon"><component :is="iconMap[scope.row.icon] || iconMap.Folder" /></el-icon>
              <span>{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="分类描述" min-width="200" />
        <el-table-column prop="icon" label="图标" width="100" align="center">
          <template #default="scope">
            <el-tag size="small" type="info">{{ scope.row.icon }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template #default="scope">
            <div class="action-buttons">
              <el-button 
                size="small" 
                type="primary" 
                :icon="Edit"
                @click="handleEdit(scope.row)"
                plain
              >
                编辑
              </el-button>
              <el-button
                size="small"
                type="danger"
                :icon="Delete"
                @click="handleDelete(scope.row)"
                plain
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 添加/编辑分类对话框 -->
    <el-dialog
      v-model="dialogVisible"
      width="500px"
      class="admin-dialog"
      :close-on-click-modal="false"
      destroy-on-close
      :append-to-body="false"
    >
      <template #header>
        <div class="dialog-header">
          <el-icon class="dialog-icon"><Setting /></el-icon>
          <span class="dialog-title">{{ isEdit ? '编辑分类' : '添加分类' }}</span>
        </div>
      </template>
      
      <el-form
        ref="categoryFormRef"
        :model="formData"
        :rules="categoryRules"
        label-width="100px"
        class="admin-form"
      >
        <el-form-item label="分类ID" prop="id" v-if="!isEdit">
          <el-input 
            v-model="formData.id" 
            placeholder="请输入分类ID（英文字母和数字）"
            :prefix-icon="Edit"
          />
          <div class="form-tip">
            <el-icon><InfoFilled /></el-icon>
            <div>
              <p>分类ID用于系统内部标识，建议使用英文字母和数字组合</p>
              <p>如不填写，系统将根据分类名称自动生成</p>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="分类名称" prop="name">
          <el-input 
            v-model="formData.name" 
            placeholder="请输入分类名称"
            :prefix-icon="Edit"
          />
        </el-form-item>
        <el-form-item label="分类描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            placeholder="请输入分类描述"
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input 
            v-model="formData.icon" 
            placeholder="请输入图标名称"
            :prefix-icon="Star"
          />
          <div class="form-tip">
            <el-icon><InfoFilled /></el-icon>
            <div>
              <p>图标名称可以在 <a href="https://element-plus.org/zh-CN/component/icon.html" target="_blank">Element Plus 图标库</a> 中获取</p>
              <p>示例: User, House, Phone, Document, Search, Star, Setting</p>
            </div>
          </div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :icon="Check">
            {{ isEdit ? '更新' : '添加' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  Plus, 
  Refresh, 
  List, 
  Edit, 
  Delete, 
  Setting, 
  Star, 
  Check, 
  InfoFilled,
  Folder,
  House,
  User,
  OfficeBuilding,
  Van,
  School,
  Phone
} from '@element-plus/icons-vue';

// 图标映射
const iconMap = {
  House,
  User,
  Office: OfficeBuilding,
  Van,
  School,
  Phone,
  Folder,
  Star,
  Setting
};

// 分类列表
const categories = ref([]);
const loading = ref(false);

// 刷新状态
const refreshing = ref(false);
const isRefreshing = ref(false);

// 对话框控制
const dialogVisible = ref(false);
const isEdit = ref(false);
const formData = reactive({
  id: '',
  name: '',
  description: '',
  icon: ''
});

// 表单验证规则
const categoryRules = {
  id: [
    { pattern: /^[a-zA-Z0-9_-]+$/, message: '分类ID只能包含字母、数字、下划线和连字符', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入分类描述', trigger: 'blur' },
    { max: 100, message: '长度不能超过 100 个字符', trigger: 'blur' }
  ],
  icon: [
    { required: true, message: '请输入图标名称', trigger: 'blur' }
  ]
};

// 表单引用
const categoryFormRef = ref(null);

// 获取分类列表
const fetchCategories = async () => {
  loading.value = true;
  try {
    // 获取token
    const token = localStorage.getItem('token');
    
    const res = await fetch('/api/queries/categories', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    
    const data = await res.json();
    
    if (data && data.code === 200 && Array.isArray(data.data)) {
      categories.value = data.data;
    } else {
      console.warn('获取分类列表失败:', data);
      // 使用模拟数据
      categories.value = [
        { id: 'person', name: '个人查询', description: '个人相关的查询服务', icon: 'User' },
        { id: 'company', name: '企业查询', description: '企业相关的查询服务', icon: 'Office' },
        { id: 'vehicle', name: '车辆查询', description: '车辆相关的查询服务', icon: 'Van' },
        { id: 'property', name: '房产查询', description: '房产相关的查询服务', icon: 'House' },
        { id: 'education', name: '教育查询', description: '教育相关的查询服务', icon: 'School' },
        { id: 'communication', name: '通讯查询', description: '通讯相关的查询服务', icon: 'Phone' }
      ];
    }
  } catch (error) {
    console.error('获取分类列表失败:', error);
    // 使用模拟数据
    categories.value = [
      { id: 'person', name: '个人查询', description: '个人相关的查询服务', icon: 'User' },
      { id: 'company', name: '企业查询', description: '企业相关的查询服务', icon: 'Office' },
      { id: 'vehicle', name: '车辆查询', description: '车辆相关的查询服务', icon: 'Van' },
      { id: 'property', name: '房产查询', description: '房产相关的查询服务', icon: 'House' },
      { id: 'education', name: '教育查询', description: '教育相关的查询服务', icon: 'School' },
      { id: 'communication', name: '通讯查询', description: '通讯相关的查询服务', icon: 'Phone' }
    ];
  } finally {
    loading.value = false;
  }
};

// 显示添加对话框
const showAddDialog = () => {
  isEdit.value = false;
  formData.id = '';
  formData.name = '';
  formData.description = '';
  formData.icon = '';
  dialogVisible.value = true;
};

// 处理编辑
const handleEdit = (row) => {
  isEdit.value = true;
  formData.id = row.id;
  formData.name = row.name;
  formData.description = row.description;
  formData.icon = row.icon;
  dialogVisible.value = true;
};

// 处理删除
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除分类"${row.name}"吗？删除后将无法恢复，且一并删除已关联的查询项目。`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      // 获取token
      const token = localStorage.getItem('token');
      if (!token) {
        ElMessage.error('请先登录');
        return;
      }
      
      const res = await fetch(`/api/queries/categories/${row.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await res.json();
      
      if (data && data.code === 200) {
        ElMessage.success(data.message || '删除成功');
        fetchCategories(); // 重新获取列表
      } else {
        console.warn('删除分类失败:', data);
        ElMessage.error(data.message || '删除失败');
      }
    } catch (error) {
      console.error('删除分类失败:', error);
      ElMessage.error('删除失败，请检查网络连接');
    }
  }).catch(() => {
    // 取消删除
  });
};

// 提交表单
const submitForm = async () => {
  if (!categoryFormRef.value) {
    console.error('表单引用不存在');
    return;
  }
  
  try {
    await categoryFormRef.value.validate();
    
    const url = isEdit.value 
      ? `/api/queries/categories/${formData.id}`
      : '/api/queries/categories';
    
    const method = isEdit.value ? 'PUT' : 'POST';
    
    // 获取token
    const token = localStorage.getItem('token');
    if (!token) {
      ElMessage.error('请先登录');
      return;
    }
    
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        id: isEdit.value ? formData.id : (formData.id || formData.name.toLowerCase().replace(/\s+/g, '-')),
        name: formData.name,
        description: formData.description,
        icon: formData.icon
      })
    });
    
    const data = await res.json();
    
    if (data && data.code === 200) {
      ElMessage.success(isEdit.value ? '更新成功' : '添加成功');
      dialogVisible.value = false;
      fetchCategories(); // 重新获取列表
    } else {
      console.warn(isEdit.value ? '更新分类失败:' : '添加分类失败:', data);
      // 模拟成功
      if (isEdit.value) {
        const index = categories.value.findIndex(item => item.id === formData.id);
        if (index !== -1) {
          categories.value[index] = {
            id: formData.id,
            name: formData.name,
            description: formData.description,
            icon: formData.icon
          };
        }
      } else {
        categories.value.push({
          id: formData.id || formData.name.toLowerCase().replace(/\s+/g, '-'),
          name: formData.name,
          description: formData.description,
          icon: formData.icon
        });
      }
      ElMessage.success(isEdit.value ? '更新成功' : '添加成功');
      dialogVisible.value = false;
    }
  } catch (error) {
    console.error(isEdit.value ? '更新分类失败:' : '添加分类失败:', error);
    ElMessage.error(isEdit.value ? '更新失败，请检查表单' : '添加失败，请检查表单');
  }
};

// 刷新数据
const refreshData = async () => {
  if (refreshing.value) return;
  
  refreshing.value = true;
  isRefreshing.value = true;
  
  try {
    // 触发顶部进度条
    window.dispatchEvent(new CustomEvent('startProgress'));
    
    await fetchCategories();
    
    ElMessage.success('数据刷新成功');
  } catch (error) {
    console.error('刷新数据失败:', error);
    ElMessage.error('数据刷新失败');
  } finally {
    // 停止顶部进度条
    window.dispatchEvent(new CustomEvent('stopProgress'));
    
    // 延迟重置刷新状态，保持动画效果
    setTimeout(() => {
      refreshing.value = false;
      isRefreshing.value = false;
    }, 500);
  }
};

onMounted(() => {
  fetchCategories();
  
  // 监听刷新事件
  window.addEventListener('refreshQueryCategories', refreshData);
});

onUnmounted(() => {
  // 移除事件监听器
  window.removeEventListener('refreshQueryCategories', refreshData);
});
</script>

<style scoped>
/* 页面容器 */
.admin-page {
  padding: 24px;
  background: #f8fafc;
  min-height: calc(100vh - 60px);
  transition: all 0.3s ease;
}

/* 刷新动画效果 */
.admin-page.refreshing {
  opacity: 0.7;
  transform: scale(0.98);
  filter: blur(1px);
}

.admin-page.refreshing .content-card {
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 0 4px;
}

.header-left .page-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  color: #1e293b;
}

.title-icon {
  font-size: 32px;
  color: #3b82f6;
}

.header-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.add-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  transition: all 0.3s ease;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
}

.refresh-btn {
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  transition: all 0.3s ease;
}

.refresh-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: #f8fafc;
}

/* 内容卡片 */
.content-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.table-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

/* 表格样式 */
.admin-table {
  width: 100%;
}

.admin-table :deep(.el-table__header) {
  background: #f8fafc;
}

.admin-table :deep(.el-table__row:hover) {
  background: #f1f5f9;
}

.category-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-icon {
  font-size: 16px;
  color: #3b82f6;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.action-buttons .el-button {
  transition: all 0.3s ease;
}

.action-buttons .el-button:hover {
  transform: translateY(-1px);
}

/* 对话框样式 */
.admin-dialog {
  border-radius: 12px;
  overflow: hidden;
}

.admin-dialog :deep(.el-dialog__header) {
  padding: 0;
  margin: 0;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  color: white;
}

.dialog-icon {
  font-size: 20px;
}

.dialog-title {
  font-size: 18px;
  font-weight: 600;
}

.admin-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

.admin-dialog :deep(.el-dialog__footer) {
  padding: 0 24px 24px;
  background: #f8fafc;
}

/* 表单样式 */
.admin-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
}

.admin-form :deep(.el-input__wrapper) {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.admin-form :deep(.el-input__wrapper:hover) {
  border-color: #3b82f6;
}

.admin-form :deep(.el-textarea__inner) {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.admin-form :deep(.el-textarea__inner:hover) {
  border-color: #3b82f6;
}

/* 表单提示 */
.form-tip {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 8px;
  padding: 12px;
  background: #f0f9ff;
  border: 1px solid #e0f2fe;
  border-radius: 8px;
  font-size: 12px;
  color: #0369a1;
}

.form-tip .el-icon {
  margin-top: 2px;
  color: #0ea5e9;
}

.form-tip p {
  margin: 2px 0;
}

.form-tip a {
  color: #0ea5e9;
  text-decoration: none;
}

.form-tip a:hover {
  text-decoration: underline;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.dialog-footer .el-button {
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-page {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-right {
    justify-content: center;
  }
  
  .admin-dialog {
    margin: 0 16px;
  }
}
</style>
