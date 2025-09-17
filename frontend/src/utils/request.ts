import axios from 'axios';
import { ElMessage } from 'element-plus';

// API响应类型定义
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

// 扩展axios实例类型
declare module 'axios' {
  export interface AxiosInstance {
    request<T = any>(config: any): Promise<ApiResponse<T>>;
    get<T = any>(url: string, config?: any): Promise<ApiResponse<T>>;
    delete<T = any>(url: string, config?: any): Promise<ApiResponse<T>>;
    head<T = any>(url: string, config?: any): Promise<ApiResponse<T>>;
    post<T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>>;
    put<T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>>;
    patch<T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>>;
  }
}

// 创建axios实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  },
  // 禁用代理，直接连接到后端
  proxy: false
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 添加token到请求头
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const { data } = response;
    
    // 如果返回的状态码为2xx，说明接口请求成功，可以正常拿到数据
    if (response.status >= 200 && response.status < 300) {
      return data;
    }
    
    // 其他状态码都当作错误处理
    ElMessage.error(data.message || '请求失败');
    return Promise.reject(new Error(data.message || '请求失败'));
  },
  (error) => {
    // 处理HTTP错误状态码
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // 如果是登录接口或修改密码接口的401错误，不要在这里处理，让组件自己处理
          if (error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/change-password')) {
            // 让组件处理错误信息
            break;
          }
          ElMessage.error('未授权，请重新登录');
          localStorage.removeItem('token');
          localStorage.removeItem('userInfo');
          // PC端没有独立登录页面，跳转到首页让用户通过弹窗登录
          window.location.href = '/';
          break;
        case 403:
          ElMessage.error('拒绝访问');
          break;
        case 404:
          ElMessage.error('请求地址出错');
          break;
        case 408:
          ElMessage.error('请求超时');
          break;
        case 500:
          ElMessage.error('服务器内部错误');
          break;
        case 501:
          ElMessage.error('服务未实现');
          break;
        case 502:
          ElMessage.error('网关错误');
          break;
        case 503:
          ElMessage.error('服务不可用');
          break;
        case 504:
          ElMessage.error('网关超时');
          break;
        case 505:
          ElMessage.error('HTTP版本不受支持');
          break;
        default:
          ElMessage.error(data?.message || `连接错误${status}`);
      }
    } else if (error.request) {
      ElMessage.error('网络连接异常');
    } else {
      ElMessage.error('请求失败');
    }
    
    return Promise.reject(error);
  }
);

export { request };