import { request } from '@/utils/request';

export const adminApi = {
  // 获取用户列表
  getUsers: (params: { page: number; limit: number; keyword?: string; role?: string }) => {
    return request.get('/admin/users', { params });
  },

  // 删除用户
  deleteUser: (userId: number) => {
    return request.delete(`/admin/users/${userId}`);
  },

  // 获取注销申请列表
  getDeletionRequests: (params: { page: number; limit: number; keyword?: string; status?: string }) => {
    return request.get('/admin/deletion-requests', { params });
  },

  // 处理注销申请
  processDeletionRequest: (data: { requestId: number; status: 'approved' | 'rejected'; adminNote?: string }) => {
    return request.post('/admin/deletion-requests/process', data);
  },

  // 获取系统统计
  getSystemStats: () => {
    return request.get('/admin/stats');
  },

  // 获取系统设置
  getSystemSettings: () => {
    return request.get('/admin/settings');
  },

  // 更新系统设置
  updateSystemSettings: (data: any) => {
    return request.put('/admin/settings', data);
  }
};

export default adminApi;