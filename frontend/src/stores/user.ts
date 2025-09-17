import { defineStore } from 'pinia';
import { ref } from 'vue';
import { userApi } from '@/api/user.ts';
import type { ApiResponse } from '@/utils/request';

interface UserInfo {
  id: number;
  username: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: string;
  createdAt: string;
}

interface LoginForm {
  username: string;
  password: string;
}

interface RegisterForm {
  username: string;
  email: string;
  phone: string;
  password: string;
}

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserInfo | null>(null);
  const token = ref<string>('');
  const isLoggedIn = ref<boolean>(false);

  // 初始化用户状态
  const initUserState = () => {
    const savedToken = localStorage.getItem('token');
    const savedUserInfo = localStorage.getItem('userInfo');
    
    if (savedToken && savedUserInfo) {
      token.value = savedToken;
      userInfo.value = JSON.parse(savedUserInfo);
      isLoggedIn.value = true;
    }
  };

  // 登录
  const login = async (loginForm: LoginForm) => {
    try {
      const response: ApiResponse<{ token: string; user: UserInfo }> = await userApi.login(loginForm);
      
      if (response && response.code === 200) {
        const { token: userToken, user } = response.data;
        
        // 获取本地已有的用户信息，保留头像
        let existingUserInfo: Partial<UserInfo> = {};
        try {
          const existingData = localStorage.getItem('userInfo');
          if (existingData && existingData !== 'null' && existingData !== 'undefined') {
            existingUserInfo = JSON.parse(existingData);
          }
        } catch (e) {
          existingUserInfo = {};
        }
        
        // 合并用户信息，保留本地头像
        const mergedUser = {
          ...user,
          avatar: existingUserInfo.avatar || user.avatar
        };
        
        // 保存用户信息
        token.value = userToken;
        userInfo.value = mergedUser;
        isLoggedIn.value = true;
        
        // 持久化存储
        localStorage.setItem('token', userToken);
        localStorage.setItem('userInfo', JSON.stringify(mergedUser));
        
        return response;
      } else {
        throw new Error((response && response.message) || '登录失败');
      }
    } catch (error: any) {
      console.error('登录失败:', error);
      throw error;
    }
  };

  // 注册
  const register = async (registerForm: RegisterForm) => {
    try {
      const response: ApiResponse<any> = await userApi.register(registerForm);
      
      if (response.code === 201) {
        return response;
      } else {
        throw new Error(response.message || '注册失败');
      }
    } catch (error: any) {
      console.error('注册失败:', error);
      throw error;
    }
  };

  // 退出登录
  const logout = async () => {
    try {
      // 清除本地状态
      token.value = '';
      userInfo.value = null;
      isLoggedIn.value = false;
      
      // 清除持久化存储
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      
      // 可以调用后端登出接口
      // await userApi.logout();
      
    } catch (error) {
      console.error('退出登录失败:', error);
      // 即使后端接口失败，也要清除本地状态
      token.value = '';
      userInfo.value = null;
      isLoggedIn.value = false;
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
    }
  };

  // 获取用户信息
  const getUserInfo = async () => {
    try {
      const response: ApiResponse<UserInfo> = await userApi.getUserInfo();
      
      if (response.code === 200) {
        // 获取本地已有的用户信息，保留头像
        let existingUserInfo: Partial<UserInfo> = {};
        try {
          const existingData = localStorage.getItem('userInfo');
          if (existingData && existingData !== 'null' && existingData !== 'undefined') {
            existingUserInfo = JSON.parse(existingData);
          }
        } catch (e) {
          existingUserInfo = {};
        }
        
        // 合并用户信息，保留本地头像
        const mergedUser = {
          ...response.data,
          avatar: existingUserInfo.avatar || response.data.avatar
        };
        
        userInfo.value = mergedUser;
        localStorage.setItem('userInfo', JSON.stringify(mergedUser));
        return mergedUser;
      } else {
        throw new Error(response.message || '获取用户信息失败');
      }
    } catch (error: any) {
      console.error('获取用户信息失败:', error);
      throw error;
    }
  };

  // 更新用户信息
  const updateUserInfo = async (updateData: Partial<UserInfo>) => {
    try {
      const response: ApiResponse<UserInfo> = await userApi.updateUserInfo(updateData);
      
      if (response.code === 200) {
        userInfo.value = { ...userInfo.value, ...response.data };
        localStorage.setItem('userInfo', JSON.stringify(userInfo.value));
        return response.data;
      } else {
        throw new Error(response.message || '更新用户信息失败');
      }
    } catch (error: any) {
      console.error('更新用户信息失败:', error);
      throw error;
    }
  };

  // 修改密码
  const changePassword = async (oldPassword: string, newPassword: string) => {
    try {
      const response: ApiResponse<any> = await userApi.changePassword({
        oldPassword,
        newPassword
      });
      
      if (response.code === 200) {
        return response;
      } else {
        throw new Error(response.message || '修改密码失败');
      }
    } catch (error: any) {
      console.error('修改密码失败:', error);
      throw error;
    }
  };

  // 检查是否为管理员
  const isAdmin = () => {
    return userInfo.value?.role === 'admin';
  };

  // 检查登录状态
  const checkLoginStatus = () => {
    const savedToken = localStorage.getItem('token');
    return !!savedToken && isLoggedIn.value;
  };

  // 直接设置登录状态（用于测试或其他场景）
  const setLoginState = (user: UserInfo, userToken: string) => {
    token.value = userToken;
    userInfo.value = user;
    isLoggedIn.value = true;
    
    // 持久化存储
    localStorage.setItem('token', userToken);
    localStorage.setItem('userInfo', JSON.stringify(user));
  };

  return {
    // 状态
    userInfo,
    token,
    isLoggedIn,
    
    // 方法
    initUserState,
    login,
    register,
    logout,
    getUserInfo,
    updateUserInfo,
    changePassword,
    isAdmin,
    checkLoginStatus,
    setLoginState
  };
});