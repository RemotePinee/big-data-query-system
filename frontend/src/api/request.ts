import axios from 'axios';
import { ElMessage } from 'element-plus';
import router from '../router';

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api', // 直接使用环境变量或默认值
  timeout: 15000 // 请求超时时间
});

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 从localStorage获取token
    const token = localStorage.getItem('token');
    if (token) {
      // 设置请求头
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data;
    
    // 成功的状态码包括 200, 201 等
    const successCodes = [200, 201];
    
    // 如果返回的状态码不在成功范围内，说明接口请求有问题
    if (!successCodes.includes(res.code)) {
      ElMessage({
        message: res.message || '请求失败',
        type: 'error',
        duration: 3000
      });
      
      // 401: 未登录或token过期
      if (res.code === 401) {
        // 清除本地token
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        
        // 跳转到登录页面，根据当前路径判断是移动端还是桌面端
        const currentPath = router.currentRoute.value.path;
        const loginPath = currentPath.startsWith('/mobile') ? '/mobile/login' : '/login';
        
        router.replace({
          path: loginPath,
          query: { redirect: router.currentRoute.value.fullPath }
        });
      }
      
      return Promise.reject(new Error(res.message || '请求失败'));
    } else {
      return res; // 返回response.data，即后端返回的数据
    }
  },
  error => {
    console.error('响应错误:', error);
    
    // 处理网络错误
    let message = '网络错误，请稍后重试';
    if (error.response) {
      switch (error.response.status) {
        case 401:
          message = '未登录或登录已过期，请重新登录';
          // 清除本地token
          localStorage.removeItem('token');
          localStorage.removeItem('userInfo');
          
          // 跳转到登录页
          router.replace({
            path: '/login',
            query: { redirect: router.currentRoute.value.fullPath }
          });
          break;
        case 403:
          message = '没有权限访问该资源';
          break;
        case 404:
          message = '请求的资源不存在';
          break;
        case 500:
          message = '服务器错误，请稍后重试';
          break;
        default:
          message = `请求失败(${error.response.status})`;
      }
    }
    
    ElMessage({
      message: message,
      type: 'error',
      duration: 3000
    });
    
    return Promise.reject(error);
  }
);

export default service;