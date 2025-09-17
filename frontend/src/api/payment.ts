import { request } from '@/utils/request';

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

export interface PaymentMethod {
  id: number;
  name: string;
  code: string;
  type: string;
}

export interface CreatePaymentRequest {
  orderNo: string;
  paymentMethod: string;
}

export interface CreatePaymentResponse {
  orderNo: string;
  paymentMethod: string;
  amount: number;
  payUrl: string;
  qrCodeData?: string;
  isTestMode?: boolean;
  realFormat?: boolean;
  paymentInfo?: any;
}

export interface PaymentStatusResponse {
  success: boolean;
  message: string;
  status: string;
  orderNo: string;
  amount: number;
  paidAt?: string;
  completedAt?: string;
}

export const paymentApi = {
  // 获取支付方式列表
  getPaymentMethods(): Promise<ApiResponse<PaymentMethod[]>> {
    return request.get('/payments/methods');
  },

  // 创建支付订单
  createPayment(data: CreatePaymentRequest): Promise<ApiResponse<CreatePaymentResponse>> {
    return request.post('/payments/create', data);
  },

  // 查询支付状态
  checkPaymentStatus(orderNo: string): Promise<ApiResponse<PaymentStatusResponse>> {
    return request.get(`/payments/status/${orderNo}`);
  }
};

// 向后兼容的函数导出
export const getPaymentMethods = paymentApi.getPaymentMethods;
export const createPayment = paymentApi.createPayment;
export const checkPaymentStatus = paymentApi.checkPaymentStatus;