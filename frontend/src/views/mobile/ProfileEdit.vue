<template>
  <div class="profile-edit">
    <!-- 顶部导航 -->
    <div class="top-nav">
      <button @click="goBack" class="nav-btn">
        <i class="fas fa-arrow-left"></i>
      </button>
      <h1 class="nav-title">个人资料</h1>
      <button @click="handleSave" class="nav-btn save-btn" :disabled="saving">
        <i class="fas fa-check" v-if="!saving"></i>
        <i class="fas fa-spinner fa-spin" v-else></i>
      </button>
    </div>

    <!-- 头像区域 -->
    <div class="avatar-section">
      <div class="avatar-container">
        <img 
          :src="avatarUrl" 
          :alt="userForm.username || '用户头像'"
          class="avatar-image"
          @error="handleAvatarError"
        />
        <button @click="changeAvatar" class="avatar-edit-btn">
          <i class="fas fa-camera"></i>
        </button>
      </div>
    </div>

    <!-- 表单区域 -->
    <div class="form-section">
      <div class="form-group">
        <label class="form-label">用户名</label>
        <input 
          v-model="userForm.username" 
          type="text" 
          class="form-input"
          placeholder="请输入用户名"
          readonly
        />
        <div class="form-note">用户名不可修改</div>
      </div>

      <div class="form-group">
        <label class="form-label">手机号码</label>
        <input 
          v-model="userForm.phone" 
          type="tel" 
          class="form-input"
          placeholder="请输入手机号码"
        />
      </div>

      <div class="form-group">
        <label class="form-label">邮箱地址</label>
        <input 
          v-model="userForm.email" 
          type="email" 
          class="form-input"
          placeholder="请输入邮箱地址"
        />
      </div>
    </div>

    <!-- 账户信息 -->
    <div class="account-section">
      <h3 class="section-title">账户信息</h3>
      <div class="info-item">
        <span class="info-label">账户余额</span>
        <span class="info-value">开发中</span>
      </div>
      <div class="info-item">
        <span class="info-label">注册时间</span>
        <span class="info-value">{{ formatDate(userInfo?.createdAt) }}</span>
      </div>
    </div>

    <!-- 头像选择弹窗 -->
    <div v-if="showAvatarModal" class="avatar-modal" @click="closeAvatarModal">
      <div class="avatar-modal-content" @click.stop>
        <h3 class="modal-title">选择头像</h3>
        <div class="avatar-grid">
          <div 
            v-for="avatar in avatarList" 
            :key="avatar"
            class="avatar-option"
            @click="selectAvatar(avatar)"
          >
            <img :src="avatar" :alt="'头像选项'" />
          </div>
        </div>
        <button @click="closeAvatarModal" class="modal-close-btn">
          取消
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { userApi } from '@/api/user.ts'

const router = useRouter()
const userStore = useUserStore()

// 用户信息
const userInfo = computed(() => userStore.userInfo)
const saving = ref(false)
const showAvatarModal = ref(false)

// 表单数据
const userForm = ref({
  username: '',
  phone: '',
  email: '',
  avatar: ''
})

// 头像相关
const defaultAvatar = '/default-avatar.svg'
const avatarList = ref([])

// 生成头像列表
const generateAvatarList = () => {
  const avatarImages = [
    'boy-1.png', 'boy-2.png', 'boy-3.png', 'boy-4.png', 'boy-5.png', 'boy-6.png', 'boy-7.png', 'boy-8.png',
    'girl-1.png', 'girl-2.png', 'girl-3.png', 'girl-4.png', 'girl-5.png', 'girl-6.png', 'girl-7.png', 'girl-8.png', 'girl62.png'
  ]
  avatarList.value = avatarImages.map(img => `/avatar/${img}`)
}

// 计算头像URL
const avatarUrl = computed(() => {
  if (userForm.value.avatar) {
    return userForm.value.avatar
  }
  if (userInfo.value?.avatar) {
    return userInfo.value.avatar
  }
  return defaultAvatar
})

// 处理头像加载错误
const handleAvatarError = (event) => {
  event.target.src = defaultAvatar
}

// 更改头像
const changeAvatar = () => {
  showAvatarModal.value = true
}

// 选择头像
const selectAvatar = (avatar) => {
  userForm.value.avatar = avatar
  showAvatarModal.value = false
}

// 关闭头像选择弹窗
const closeAvatarModal = () => {
  showAvatarModal.value = false
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未知'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '未知'
    return date.toLocaleDateString('zh-CN')
  } catch (error) {
    return '未知'
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 保存用户信息
const handleSave = async () => {
  if (saving.value) return
  
  try {
    saving.value = true
    
    // 验证必填字段
    if (!userForm.value.phone?.trim()) {
      ElMessage.warning('请输入手机号码')
      return
    }
    
    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(userForm.value.phone)) {
      ElMessage.warning('请输入正确的手机号码')
      return
    }
    
    // 验证邮箱格式
    if (userForm.value.email && userForm.value.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(userForm.value.email)) {
        ElMessage.warning('请输入正确的邮箱地址')
        return
      }
    }
    

    
    // 调用API更新用户信息
    const updateData = {
      phone: userForm.value.phone.trim(),
      email: userForm.value.email?.trim() || '',
      avatar: userForm.value.avatar || ''
    }
    
    const response = await userApi.updateUserInfo(updateData)
    
    if (response.code === 200) {
      // 更新本地用户信息
      await userStore.getUserInfo()
      ElMessage.success('保存成功')
      router.back()
    } else {
      ElMessage.error(response.message || '保存失败')
    }
  } catch (error) {
    console.error('保存用户信息失败:', error)
    ElMessage.error('保存失败，请稍后重试')
  } finally {
    saving.value = false
  }
}

// 初始化表单数据
const initFormData = () => {
  if (userInfo.value) {
    userForm.value = {
      username: userInfo.value.username || '',
      phone: userInfo.value.phone || '',
      email: userInfo.value.email || '',
      avatar: userInfo.value.avatar || ''
    }
  }
}

onMounted(async () => {
  generateAvatarList()
  
  // 获取最新的用户信息
  try {
    await userStore.getUserInfo()
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
  
  initFormData()
})
</script>

<style scoped>
.profile-edit {
  min-height: 100vh;
  background: #f8f9fa;
  padding-bottom: 20px;
}

/* 顶部导航 */
.top-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: #c3c3c38a;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #333;
}

.nav-btn:hover {
  background: #f8f9fa;
  color: #333;
}

.nav-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.save-btn {
  background: #28a745;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #218838;
}

.nav-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

/* 头像区域 */
.avatar-section {
  padding: 30px 20px;
  background: #fff;
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.avatar-container {
  position: relative;
}

.avatar-image {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  background: transparent;
}

.avatar-edit-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 32px;
  height: 32px;
  border: none;
  background: #007bff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
}

/* 表单区域 */
.form-section {
  background: #fff;
  padding: 20px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: #f8f9fa;
  border-radius: 10px;
  font-size: 16px;
  color: #333;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  background: #e9ecef;
}

.form-input:read-only {
  background: #e9ecef;
  color: #6c757d;
}

.form-note {
  font-size: 12px;
  color: #6c757d;
  margin-top: 4px;
}

/* 账户信息 */
.account-section {
  background: #fff;
  padding: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f8f9fa;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 14px;
  color: #666;
}

.info-value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}



/* 头像选择弹窗 */
.avatar-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.avatar-modal-content {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  margin: 20px;
  max-width: 400px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px 0;
  text-align: center;
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.avatar-option {
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
}

.avatar-option:hover {
  transform: scale(1.05);
}

.avatar-option img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-close-btn {
  width: 100%;
  padding: 12px;
  border: none;
  background: #f8f9fa;
  color: #333;
  border-radius: 10px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-close-btn:hover {
  background: #e9ecef;
}
</style>