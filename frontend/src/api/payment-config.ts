import { request, ApiResponse } from '@/utils/request';

export interface PaymentConfig {
  id: number;
  name: string;
  code: string;
  type: string;
  appId?: string;
  merchantId?: string;
  apiKey?: string;
  appSecret?: string;
  apiUrl?: string;
  notifyUrl?: string;
  returnUrl?: string;
  isActive: boolean;
  paymentMode: 'qrcode' | 'redirect'; // 支付模式：扫码模式或跳转模式
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentConfigRequest {
  name: string;
  code: string;
  type: string;
  appId?: string;
  merchantId?: string;
  apiKey?: string;
  appSecret?: string;
  apiUrl?: string;
  notifyUrl?: string;
  returnUrl?: string;
  isActive: boolean;
  paymentMode: 'qrcode' | 'redirect'; // 支付模式：扫码模式或跳转模式
}

export interface UpdatePaymentConfigRequest extends Partial<CreatePaymentConfigRequest> {}

export const paymentConfigApi = {
  // 获取所有支付配置
  getAll(): Promise<ApiResponse<PaymentConfig[]>> {
    return request.get('/admin/payment-configs');
  },

  // 根据ID获取支付配置
  getById(id: number): Promise<ApiResponse<PaymentConfig>> {
    return request.get(`/admin/payment-configs/${id}`);
  },

  // 创建支付配置
  create(data: CreatePaymentConfigRequest): Promise<ApiResponse<{ id: number }>> {
    return request.post('/admin/payment-configs', data);
  },

  // 更新支付配置
  update(id: number, data: UpdatePaymentConfigRequest): Promise<ApiResponse<void>> {
    return request.put(`/admin/payment-configs/${id}`, data);
  },

  // 删除支付配置
  delete(id: number): Promise<ApiResponse<void>> {
    return request.delete(`/admin/payment-configs/${id}`);
  },

  // 切换激活状态
  toggleActive(id: number): Promise<ApiResponse<void>> {
    return request.patch(`/admin/payment-configs/${id}/toggle`);
  },

  // 测试支付配置
  testConfig(id: number): Promise<ApiResponse<any>> {
    return request.post(`/admin/payment-configs/${id}/test`);
  }
};