// API配置文件
// 统一管理API请求的基础配置

// 获取API基础URL
const getApiBaseUrl = (): string => {
  // 优先使用环境变量配置的API基础URL
  const envApiUrl = import.meta.env.VITE_API_BASE_URL;
  if (envApiUrl) {
    return envApiUrl;
  }
  
  // 在开发环境中，使用相对路径，Vite会自动代理到后端
  // 在生产环境中，也使用相对路径，需要确保前端和后端部署在同一域名下
  return '';
};

// 创建统一的fetch请求函数
export const apiRequest = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const baseUrl = getApiBaseUrl();
  const fullUrl = `${baseUrl}${url}`;
  
  // 默认配置
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // 自动添加认证token
  const token = localStorage.getItem('token');
  if (token) {
    (defaultOptions.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(fullUrl, defaultOptions);
    return response;
  } catch (error) {
    console.error('API请求失败:', error);
    throw error;
  }
};

// 常用的API请求方法
export const api = {
  get: (url: string, options?: RequestInit) => 
    apiRequest(url, { method: 'GET', ...options }),
  
  post: (url: string, data?: any, options?: RequestInit) => 
    apiRequest(url, { 
      method: 'POST', 
      body: data ? JSON.stringify(data) : undefined,
      ...options 
    }),
  
  put: (url: string, data?: any, options?: RequestInit) => 
    apiRequest(url, { 
      method: 'PUT', 
      body: data ? JSON.stringify(data) : undefined,
      ...options 
    }),
  
  delete: (url: string, options?: RequestInit) => 
    apiRequest(url, { method: 'DELETE', ...options }),
};

// API端点常量
export const API_ENDPOINTS = {
  // 管理员API配置
  ADMIN_API_CONFIG: '/api/admin/api-config',
  ADMIN_API_CONFIGS: '/api/admin/api-configs',
  ADMIN_API_CONFIG_TEST: '/api/admin/api-config/test',
  
  // 查询项目
  QUERY_ITEMS: '/api/queries/items',
  QUERY_CATEGORIES: '/api/queries/categories',
  
  // 认证
  AUTH_LOGIN: '/api/auth/login',
  AUTH_LOGOUT: '/api/auth/logout',
} as const;