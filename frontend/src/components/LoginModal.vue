<template>
  <el-dialog
    v-model="visible"
    title=""
    width="380px"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
    class="login-modal"
    custom-class="login-dialog-custom"
    top="30vh"
    :append-to-body="false"
    @close="handleClose"
  >
    <div class="login-content">
      <!-- 关闭按钮 -->
      <div class="close-btn" @click="handleClose">
        <el-icon :size="16">
          <Close />
        </el-icon>
      </div>

      <!-- 头部 -->
      <div class="header">
        <div class="logo">
          <el-icon :size="24">
            <DataAnalysis />
          </el-icon>
        </div>
        <h2>登录</h2>
      </div>

      <!-- 表单 -->
      <el-form 
        ref="formRef" 
        :model="formData" 
        :rules="rules" 
        size="default"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="formData.username"
            placeholder="用户名"
            :prefix-icon="User"
            clearable
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="formData.password"
            type="password"
            placeholder="密码"
            :prefix-icon="Lock"
            show-password
            clearable
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item>
          <el-button 
            type="primary" 
            class="login-btn" 
            :loading="loading" 
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 底部链接 -->
      <div class="footer">
        <el-link @click="goToRegister">注册账号</el-link>
        <el-link @click="goToAdminLogin">管理后台</el-link>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElForm } from 'element-plus';
import { User, Lock, DataAnalysis, Close } from '@element-plus/icons-vue';
import { login } from '@/api/user.ts';
import { saveUserInfo } from '@/utils';

const router = useRouter();

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
});

// Emits
const emit = defineEmits(['update:modelValue', 'login-success']);

// 表单引用
const formRef = ref();

// 弹窗显示状态
const visible = ref(false);

// 监听外部传入的显示状态
watch(() => props.modelValue, (newVal) => {
  visible.value = newVal;
});

// 监听内部显示状态变化
watch(visible, (newVal) => {
  emit('update:modelValue', newVal);
});

// 加载状态
const loading = ref(false);

// 表单数据
const formData = reactive({
  username: '',
  password: ''
});

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应为3-20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应为6-20个字符', trigger: 'blur' }
  ]
};

// 关闭弹窗
const handleClose = () => {
  visible.value = false;
  // 重置表单
  if (formRef.value) {
    formRef.value.resetFields();
  }
  formData.username = '';
  formData.password = '';
};

// 登录处理
const handleLogin = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
  } catch (error) {
    return;
  }

  loading.value = true;
  console.log('开始登录，用户名:', formData.username);

  try {
    const loginData = {
      username: formData.username,
      password: formData.password
    };
    console.log('发送登录请求:', loginData);
    
    const res = await login(loginData);
    console.log('登录响应:', res);
    
    // 保存token和用户信息
    localStorage.setItem('token', res.data.token);
    saveUserInfo(res.data.user);
    
    ElMessage.success('登录成功');
    
    // 关闭弹窗
    handleClose();
    
    // 触发登录成功事件
    emit('login-success', res.data.user);
    
    // 跳转到首页
    router.push('/');
  } catch (error) {
    console.error('登录失败详细信息:', error);
    console.error('错误响应:', error.response);
    console.error('错误请求:', error.request);
    
    if (error.response) {
      const message = error.response.data?.message || '登录失败，请检查用户名和密码';
      ElMessage.error(message);
    } else if (error.request) {
      ElMessage.error('网络连接失败，请检查网络连接');
    } else {
      ElMessage.error('登录失败，请稍后重试');
    }
  } finally {
    loading.value = false;
  }
};

// 跳转到注册
const goToRegister = () => {
  handleClose();
  router.push('/register');
};

// 跳转到管理后台登录
const goToAdminLogin = () => {
  handleClose();
  router.push('/admin/login');
};
</script>

<style scoped>
/* 弹窗遮罩层 */
:deep(.el-overlay) {
  background: transparent !important;
  backdrop-filter: blur(20px) !important;
  -webkit-backdrop-filter: blur(20px) !important;
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  z-index: 2000 !important;
}

/* 强制弹窗样式 - 多种选择器确保生效 */
:deep(.el-dialog) {
  margin-top: 30vh !important;
  width: 380px !important;
  max-width: 90vw !important;
  max-height: 90vh !important;
  border-radius: 16px !important;
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(20px) !important;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15) !important;
}

/* 自定义弹窗类样式 */
:deep(.login-dialog-custom) {
  margin-top: 30vh !important;
}

/* 全局强制样式 */
.login-dialog-custom {
  margin-top: 30vh !important;
}

:deep(.el-dialog__header) {
  display: none;
}

:deep(.el-dialog__body) {
  padding: 0;
}

/* 主容器 */
.login-content {
  position: relative;
  padding: 24px;
  background: #ffffff;
}

/* 关闭按钮 */
.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(34, 197, 94, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
}

.close-btn:hover {
  background: rgba(34, 197, 94, 0.2);
  transform: scale(1.1);
}

.close-btn .el-icon {
  color: #22c55e;
}

/* 头部 */
.header {
  text-align: center;
  margin-bottom: 24px;
}

.logo {
  width: 48px;
  height: 48px;
  margin: 0 auto 12px;
  background: linear-gradient(135deg, #10b981 0%, #22c55e 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 20px rgba(34, 197, 94, 0.3);
}

.header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #065f46;
  margin: 0;
}

/* 表单样式 */
:deep(.el-form-item) {
  margin-bottom: 16px;
}

:deep(.el-input__wrapper) {
  background: #f8fffe;
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: 16px;
  padding: 10px 12px;
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.05);
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover) {
  border-color: rgba(34, 197, 94, 0.4);
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.1);
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #22c55e;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
  background: #ffffff;
}

:deep(.el-input__inner) {
  font-size: 14px;
  color: #064e3b;
}

:deep(.el-input__inner::placeholder) {
  color: #6b7280;
}

:deep(.el-input__prefix) {
  color: #22c55e;
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  height: 40px;
  background: linear-gradient(135deg, #10b981 0%, #22c55e 100%);
  border: none;
  border-radius: 16px;
  font-weight: 600;
  font-size: 14px;
  color: white;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.login-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(34, 197, 94, 0.4);
}

.login-btn:active {
  transform: translateY(0);
}

/* 底部链接 */
.footer {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(34, 197, 94, 0.1);
}

.footer .el-link {
  font-size: 13px;
  color: #059669;
  text-decoration: none;
  transition: all 0.3s ease;
}

.footer .el-link:hover {
  color: #047857;
  transform: translateY(-1px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-content {
    padding: 20px;
  }
  
  .header h2 {
    font-size: 18px;
  }
  
  .logo {
    width: 40px;
    height: 40px;
  }
}

@media (max-width: 480px) {
  .login-content {
    padding: 16px;
  }
  
  .footer {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }
}
</style>