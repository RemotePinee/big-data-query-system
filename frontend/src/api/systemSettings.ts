import { request } from '@/utils/request';

export interface SystemSettings {
  pcLogo: string;
  favicon: string;
  systemName: string;
  systemTitle: string; // 新增系统标题字段
  heroTitle: string;
  heroSubtitle: string;
  serviceDescription: string;
  servicePhone: string;
  workTime: string;
  email: string;
  address: string;
  onlineService: string;
  onlineServiceQr: string;
  queryServiceAgreement: string;
  paymentServiceAgreement: string;
  privacyAgreement: string;
  icp: string;
  copyright: string;
}

// 获取系统设置（管理员）
export const getSystemSettings = () => {
  return request.get('/admin/system-settings');
};

// 更新系统设置（管理员）
export const updateSystemSettings = (settings: Partial<SystemSettings>) => {
  return request.post('/admin/system-settings', settings);
};

// 上传Logo（管理员）
export const uploadLogo = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return request.post('/admin/upload-logo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// 获取公开的系统设置（前端显示用）
export const getPublicSettings = () => {
  return request.get('/system-settings/public');
};