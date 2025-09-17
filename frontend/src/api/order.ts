import { request } from '@/utils/request';

export interface OrderService {
  id: number;
  name: string;
  description: string;
  icon: string;
  iconClass: string;
}

export interface Order {
  id: number;
  orderNo: string;
  service: OrderService;
  status: 'pending' | 'paid' | 'processing' | 'completed' | 'failed' | 'cancelled';
  amount: string;
  queryValue: string;
  queryParams: Record<string, any>;
  result: any;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface OrderStats {
  total: number;
  completed: number;
  pending: number;
  paid: number;
  processing: number;
  failed: number;
}

export interface OrderListResponse {
  orders: Order[];
  stats: OrderStats;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 订单API对象
export const orderApi = {
  // 获取用户订单列表
  getUserOrders(params?: { status?: string; page?: number; limit?: number }) {
    return request.get('/orders', { params });
  },

  // 获取订单详情
  getOrderDetail(orderId: number) {
    return request.get(`/orders/${orderId}`);
  },

  // 通过订单号获取订单详情
  getOrderDetailByOrderNo(orderNo: string) {
    return request.get(`/orders/orderNo/${orderNo}`);
  },

  // 取消订单
  cancelOrder(orderId: number) {
    return request.put(`/orders/${orderId}/cancel`);
  }
};

// 向后兼容的函数导出
export const getUserOrders = orderApi.getUserOrders;
export const getOrderDetail = orderApi.getOrderDetail;
export const cancelOrder = orderApi.cancelOrder;