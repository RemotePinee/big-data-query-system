<template>
  <div class="api-types-container" :class="{ 'refreshing': isRefreshing }">
    <!-- 危险操作警告 -->
    <el-alert
      title="⚠️ 重要提醒"
      type="warning"
      :closable="false"
      show-icon
      class="danger-warning"
    >
      <template #default>
        <div class="warning-content">
          <p><strong>删除API类型是永久性操作，无法恢复！</strong></p>
          <p>删除前系统会自动检查依赖关系：</p>
          <ul>
            <li>如果该API类型正在被API配置使用，将无法删除</li>
            <li>如果该API类型关联的查询项目有历史订单，将无法删除</li>
            <li>只有完全未被使用的API类型才能被删除</li>
          </ul>
          <p class="warning-note">建议：除非确定不再需要，否则请使用"禁用"功能代替删除</p>
        </div>
      </template>
    </el-alert>

    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>API类型管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleAddType">添加API类型</el-button>
          </div>
        </div>
      </template>
      
      <el-table :data="apiTypes" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="code" label="类型代码" width="150" />
        <el-table-column prop="name" label="类型名称" />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="isActive" label="状态" width="100">
          <template #default="scope">
            <el-switch
              v-model="scope.row.isActive"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
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
        />
      </div>
    </el-card>
    
    <!-- 添加/编辑API类型对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '添加API类型' : '编辑API类型'"
      v-model="dialogVisible"
      width="500px"
      custom-class="admin-edit-dialog"
      :close-on-click-modal="false"
      top="120px"
    >
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="100px">
        <el-form-item label="类型代码" prop="code">
          <el-input 
            v-model="formData.code" 
            placeholder="请输入类型代码（英文，如：person_info）" 
            :disabled="dialogType === 'edit'"
          />
        </el-form-item>
        
        <el-form-item label="类型名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入类型名称" />
        </el-form-item>
        
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入类型描述"
          />
        </el-form-item>
        
        <el-form-item label="状态" prop="isActive">
          <el-switch
            v-model="formData.isActive"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitting">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
// 移除未使用的Refresh导入

// API类型列表
const apiTypes = ref<any[]>([]);
const loading = ref(false);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

// 刷新状态管理
const refreshing = ref(false);
const isRefreshing = ref(false);

// 对话框相关
const dialogVisible = ref(false);
const dialogType = ref<'add' | 'edit'>('add');
const formRef = ref();
const submitting = ref(false);

// 表单数据
const formData = reactive({
  id: '',
  code: '',
  name: '',
  description: '',
  isActive: true
});

// 表单验证规则
const formRules = {
  code: [
    { required: true, message: '请输入类型代码', trigger: 'blur' },
    { pattern: /^[a-z_]+$/, message: '类型代码只能包含小写字母和下划线', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入类型名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ]
};

// 获取API类型列表
const fetchApiTypes = async () => {
  loading.value = true;
  
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/admin/api-types?page=${currentPage.value}&size=${pageSize.value}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await res.json();
    
    if (data.success) {
      // 转换数据库的TINYINT类型到布尔值
      apiTypes.value = data.data.map((item: any) => ({
        ...item,
        isActive: item.isActive === 1 || item.isActive === true
      }));
      
      // 更新分页信息
      if (data.pagination) {
        total.value = data.pagination.total;
        currentPage.value = data.pagination.page;
        pageSize.value = data.pagination.size;
      } else {
        // 兼容旧版本API响应
        total.value = apiTypes.value.length;
      }
    } else {
      ElMessage.error(data.message || '获取API类型列表失败');
      apiTypes.value = [];
      total.value = 0;
    }
  } catch (error) {
    console.error('获取API类型列表失败:', error);
    ElMessage.error('获取API类型列表失败');
    apiTypes.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

// 添加API类型
const handleAddType = () => {
  dialogType.value = 'add';
  resetForm();
  dialogVisible.value = true;
};

// 编辑API类型
const handleEdit = (row: any) => {
  dialogType.value = 'edit';
  resetForm();
  
  // 复制数据到表单
  Object.assign(formData, {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description || '',
    isActive: row.isActive
  });
  
  dialogVisible.value = true;
};

// 删除API类型
const handleDelete = (row: any) => {
  const deleteMessage = `
    <div style="text-align: left;">
      <p><strong style="color: #e74c3c;">⚠️ 危险操作警告</strong></p>
      <p>您即将<strong>永久删除</strong>API类型：<strong>"${row.name}"</strong></p>
      <p style="color: #e74c3c; margin: 10px 0;">此操作无法撤销！数据将被永久删除！</p>
      <p>删除前系统会检查以下依赖关系：</p>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li>是否有API配置正在使用此类型</li>
        <li>是否有查询项目关联此类型</li>
        <li>是否有历史订单使用此类型</li>
      </ul>
      <p style="color: #f39c12;">如果存在依赖关系，删除将被阻止。</p>
      <p><strong>确定要继续吗？</strong></p>
    </div>
  `;

  ElMessageBox.confirm(deleteMessage, '确认删除API类型', {
    confirmButtonText: '确认删除',
    cancelButtonText: '取消',
    type: 'error',
    dangerouslyUseHTMLString: true,
    customClass: 'delete-confirm-dialog',
    beforeClose: (action, instance, done) => {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true;
        instance.confirmButtonText = '删除中...';
        
        // 执行删除操作
        performDelete(row, instance, done);
      } else {
        done();
      }
    }
  }).catch(() => {
    // 取消删除
  });
};

// 执行删除操作
const performDelete = async (row: any, instance: any, done: Function) => {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/admin/api-types/${row.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await res.json();
    
    if (data.success) {
      ElMessage.success('删除成功');
      // 重新获取列表
      await fetchApiTypes();
      done();
    } else {
      ElMessage.error(data.message || '删除失败');
      instance.confirmButtonLoading = false;
      instance.confirmButtonText = '确认删除';
    }
  } catch (error) {
    console.error('删除API类型失败:', error);
    ElMessage.error('删除失败，请检查网络连接');
    instance.confirmButtonLoading = false;
    instance.confirmButtonText = '确认删除';
  }
};

// 修改API类型状态
const handleStatusChange = async (row: any) => {
  const originalStatus = row.isActive;
  
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/admin/api-types/${row.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        isActive: row.isActive
      })
    });
    
    const data = await res.json();
    
    if (data.success) {
      ElMessage.success(`${row.isActive ? '启用' : '禁用'}成功`);
    } else {
      ElMessage.error(data.message || '状态修改失败');
      // 恢复原状态
      row.isActive = originalStatus;
    }
  } catch (error) {
    console.error('修改API类型状态失败:', error);
    ElMessage.error('状态修改失败，请检查网络连接');
    // 恢复原状态
    row.isActive = originalStatus;
  }
};

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    id: '',
    code: '',
    name: '',
    description: '',
    isActive: true
  });
  
  if (formRef.value) {
    formRef.value.resetFields();
  }
};

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      submitting.value = true;
      
      try {
        const token = localStorage.getItem('token');
        
        // 准备提交数据
        const submitData = {
          code: formData.code,
          name: formData.name,
          description: formData.description || null,
          isActive: formData.isActive
        };
        
        let res;
        if (dialogType.value === 'add') {
          // 调用添加API类型的API
          res = await fetch('/api/admin/api-types', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(submitData)
          });
        } else {
          // 调用更新API类型的API
          res = await fetch(`/api/admin/api-types/${formData.id}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(submitData)
          });
        }
        
        const data = await res.json();
        
        if (data.success) {
          ElMessage.success(dialogType.value === 'add' ? '添加成功' : '更新成功');
          dialogVisible.value = false;
          // 重新获取列表
          await fetchApiTypes();
        } else {
          ElMessage.error(data.message || '操作失败');
        }
      } catch (error) {
        console.error('提交API类型失败:', error);
        ElMessage.error('提交失败，请检查网络连接');
      } finally {
        submitting.value = false;
      }
    }
  });
};

// 分页相关
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  fetchApiTypes();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  fetchApiTypes();
};

// 刷新数据函数
const refreshData = async () => {
  if (refreshing.value) return; // 防止重复刷新
  
  refreshing.value = true;
  isRefreshing.value = true;
  
  try {
    // 触发顶部进度条
    window.dispatchEvent(new CustomEvent('startProgress'));
    
    await fetchApiTypes();
    
    ElMessage.success('刷新成功');
  } catch (error) {
    console.error('刷新失败:', error);
    ElMessage.error('刷新失败');
  } finally {
    // 停止顶部进度条
    window.dispatchEvent(new CustomEvent('stopProgress'));
    
    // 延迟重置状态，确保动画完成
    setTimeout(() => {
      refreshing.value = false;
      isRefreshing.value = false;
    }, 300);
  }
};

onMounted(() => {
  fetchApiTypes();
  
  // 监听刷新事件
  window.addEventListener('refreshApiTypes', refreshData);
});

onUnmounted(() => {
  // 移除事件监听
  window.removeEventListener('refreshApiTypes', refreshData);
});
</script>

<style scoped>
.api-types-container {
  padding: 24px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
  transition: all 0.3s ease;
}

/* 刷新动画效果 */
.api-types-container.refreshing {
  opacity: 0.7;
  transform: scale(0.98);
  filter: blur(1px);
}

.api-types-container.refreshing .box-card {
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

.box-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.admin-edit-dialog {
  border-radius: 8px;
}

/* 危险操作警告样式 */
.danger-warning {
  margin-bottom: 20px;
  border-radius: 8px;
}

.warning-content {
  line-height: 1.6;
}

.warning-content p {
  margin: 8px 0;
}

.warning-content ul {
  margin: 8px 0;
  padding-left: 20px;
}

.warning-content li {
  margin: 4px 0;
}

.warning-note {
  color: #e6a23c;
  font-weight: 500;
  margin-top: 12px !important;
}

/* 删除确认对话框样式 */
:deep(.delete-confirm-dialog) {
  border-radius: 8px;
}

:deep(.delete-confirm-dialog .el-message-box__message) {
  line-height: 1.6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .api-types-container {
    padding: 16px;
  }
  
  .card-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .warning-content ul {
    padding-left: 16px;
  }
}
</style>