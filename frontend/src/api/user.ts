import { request } from '@/utils/request';

export const userApi = {
  // 用户登录
  login: (data: { username: string; password: string }) => {
    return request.post('/auth/login', data);
  },

  // 用户注册
  register: (data: { username: string; password: string; email: string; phone?: string }) => {
    return request.post('/auth/register', data);
  },

  // 获取用户信息
  getUserInfo: () => {
    return request.get('/users/profile');
  },

  // 修改用户信息
  updateUserInfo: (data: { username?: string; email?: string; phone?: string; nickname?: string; avatar?: string }) => {
    return request.put('/users/profile', data);
  },

  // 修改密码
  changePassword: (data: { oldPassword: string; newPassword: string }) => {
    return request.put('/users/change-password', data);
  },

  // 获取用户查询记录
  getUserQueries: (params: { page: number; limit: number }) => {
    return request.get('/users/queries', { params });
  },

  // 获取用户统计信息
  getUserStats: () => {
    return request.get('/users/stats');
  },

  // 获取未读消息数
  getUnreadCount: () => {
    return request.get('/users/unread-count');
  },

  // 退出登录
  logout: () => {
    return request.post('/users/logout');
  },

  // 申请注销账号
  requestAccountDeletion: (data: { password: string; reason: string }) => {
    return request.post('/users/request-deletion', data);
  }
};

// 保持向后兼容的函数导出
export const login = userApi.login;
export const register = userApi.register;
export const getUserInfo = userApi.getUserInfo;
export const updateUserInfo = userApi.updateUserInfo;
export const changePassword = userApi.changePassword;
export const getUserQueries = userApi.getUserQueries;

// 默认导出
export default userApi;