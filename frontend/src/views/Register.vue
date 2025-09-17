<template>
  <div class="register-container">
    <!-- 返回首页按钮 -->
    <div class="back-to-home">
      <el-button text @click="$router.push('/')">
        <el-icon><ArrowLeft /></el-icon>
        返回首页
      </el-button>
    </div>

    <!-- 注册表单 -->
    <div class="register-card">
      <div class="header">
        <h2>注册账户</h2>
        <p>创建您的账户以开始使用</p>
      </div>

      <el-form 
        ref="registerFormRef" 
        :model="formData" 
        :rules="rules" 
        class="register-form"
        @submit.prevent="handleRegister"
      >
        <el-form-item prop="username">
          <el-input
            v-model="formData.username"
            placeholder="用户名"
            size="default"
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="email">
          <el-input
            v-model="formData.email"
            placeholder="邮箱地址"
            size="default"
          >
            <template #prefix>
              <el-icon><Message /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="phone">
          <el-input
            v-model="formData.phone"
            placeholder="手机号码"
            size="default"
          >
            <template #prefix>
              <el-icon><Phone /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="formData.password"
            type="password"
            placeholder="密码"
            size="default"
            show-password
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <el-input
            v-model="formData.confirmPassword"
            type="password"
            placeholder="确认密码"
            size="default"
            show-password
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-button 
          type="primary" 
          size="default" 
          class="register-button"
          :loading="loading"
          @click="handleRegister"
        >
          注册
        </el-button>
        
        <div class="footer-links">
          <span>已有账号? <el-link type="primary" @click="goToLogin">立即登录</el-link></span>
          <el-link type="info" @click="$router.push('/admin/login')">管理后台</el-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Message, Phone, ArrowLeft } from '@element-plus/icons-vue'
import { register } from '@/api/user.ts'

const router = useRouter()
const loading = ref(false)
const registerForm = ref()

const formData = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  phone: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (_rule: any, value: any, callback: any) => {
        if (value !== formData.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

const handleRegister = async () => {
  try {
    const valid = await registerForm.value.validate()
    if (!valid) return

    loading.value = true
    
    const response = await register({
      username: formData.username,
      password: formData.password,
      email: formData.email,
      phone: formData.phone
    })

    if (response && response.code === 201) {
      ElMessage.success('注册成功！请登录')
      goToLogin()
    } else {
      ElMessage.error(response?.message || '注册失败')
    }
  } catch (error: any) {
    console.error('注册失败:', error)
    ElMessage.error(error.message || '注册失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  // 跳转到首页，首页会显示登录弹窗
  router.push('/')
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  padding: 20px;
  position: relative;
}

.back-to-home {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
}

.register-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.header {
  text-align: center;
  margin-bottom: 32px;
}

.header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
}

.header p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.register-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.register-form :deep(.el-input__wrapper) {
  border-radius: 8px;
  border: 1px solid #d1d5db;
  box-shadow: none;
}

.register-form :deep(.el-input__wrapper:hover) {
  border-color: #9ca3af;
}

.register-form :deep(.el-input__wrapper.is-focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.register-button {
  width: 100%;
  margin-top: 8px;
  border-radius: 8px;
  font-weight: 500;
}

.footer-links {
  margin-top: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #6b7280;
}

.footer-links :deep(.el-link) {
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .register-container {
    padding: 16px;
  }
  
  .register-card {
    padding: 32px 24px;
    max-width: 100%;
  }
  
  .header {
    margin-bottom: 24px;
  }
  
  .header h2 {
    font-size: 22px;
  }
  
  .footer-links {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .back-to-home {
    top: 16px;
    left: 16px;
  }
  
  .register-card {
    padding: 24px 20px;
  }
  
  .header h2 {
    font-size: 20px;
  }
}
</style>