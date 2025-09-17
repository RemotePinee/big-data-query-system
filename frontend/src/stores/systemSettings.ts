import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getPublicSettings } from '@/api/systemSettings.ts';
import type { ApiResponse } from '@/utils/request';

export interface SystemSettings {
  pcLogo: string;
  systemName: string;
  heroTitle: string;
  heroSubtitle: string;
  serviceDescription: string;
  servicePhone: string;
  workTime: string;
  email: string;
  address: string;
  onlineService: string;
  onlineServiceQr: string;
  copyright: string;
  icp: string;
  queryServiceAgreement: string;
  paymentServiceAgreement: string;
  privacyAgreement: string;
}

export const useSystemSettingsStore = defineStore('systemSettings', () => {
  // 状态
  const settings = ref<SystemSettings>({
    pcLogo: '',
    systemName: '大数据查询系统',
    heroTitle: '一站式大数据查询',
    heroSubtitle: '专业、安全、高效的数据查询服务平台',
    serviceDescription: '提供个人信息查询、征信逾期、个人司法涉诉、人企关联、婚姻状况、贷款记录、企业查询等多种数据服务',
    servicePhone: '400-123-4567',
    workTime: '周一至周五 9:00-18:00',
    email: 'service@example.com',
    address: '北京市朝阳区科技园区88号',
    onlineService: '点击联系在线客服',
    onlineServiceQr: '',
    copyright: '大数据查询系统 版权所有',
    icp: '',
    queryServiceAgreement: '',
    paymentServiceAgreement: '',
    privacyAgreement: ''
  });

  const loading = ref(false);
  const loaded = ref(false);
  
  // 防重复请求的Promise缓存
  let fetchPromise: Promise<void> | null = null;

  // 获取系统设置
  const fetchSettings = async () => {
    // 如果已经加载过，直接返回
    if (loaded.value) return;
    
    // 如果正在加载中，返回现有的Promise
    if (fetchPromise) return fetchPromise;
    
    // 创建新的请求Promise
    fetchPromise = (async () => {
      try {
        loading.value = true;
        const response: ApiResponse<SystemSettings> = await getPublicSettings();
        
        if (response.code === 200 && response.data) {
          Object.assign(settings.value, response.data);
          loaded.value = true;
          
          // 更新favicon
          try {
            const { faviconManager } = await import('@/utils/favicon');
            faviconManager.updateFaviconFromSettings(response.data);
          } catch (error) {
            console.error('更新favicon失败:', error);
          }
        }
      } catch (error) {
        console.error('获取系统设置失败:', error);
      } finally {
        loading.value = false;
        // 请求完成后清除Promise缓存
        fetchPromise = null;
      }
    })();
    
    return fetchPromise;
  };

  // 重新加载设置
  const reloadSettings = async () => {
    loaded.value = false;
    await fetchSettings();
  };

  // 获取联系信息
  const getContactInfo = () => {
    return {
      phone: settings.value.servicePhone,
      workTime: settings.value.workTime,
      email: settings.value.email,
      address: settings.value.address,
      onlineService: settings.value.onlineService
    };
  };

  return {
    settings,
    loading,
    loaded,
    fetchSettings,
    reloadSettings,
    getContactInfo
  };
});