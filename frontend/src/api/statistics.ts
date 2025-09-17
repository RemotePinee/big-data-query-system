import { request } from '@/utils/request';

// 统计数据接口
export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
}

export interface ChartData {
  dates: string[];
  orders?: number[];
  revenue?: number[];
}

export interface RecentOrder {
  id: number;
  orderNo: string;
  queryItemName: string;
  amount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// 获取仪表盘统计数据
export const getDashboardStats = (): Promise<{
  code: number;
  message: string;
  data: DashboardStats;
}> => {
  return request.get('/admin/statistics/dashboard');
};

// 获取订单图表数据
export const getOrderChartData = (type: 'week' | 'month' = 'week'): Promise<{
  code: number;
  message: string;
  data: ChartData;
}> => {
  return request.get('/admin/statistics/orders/chart', {
    params: { type }
  });
};

// 获取收入图表数据
export const getRevenueChartData = (type: 'week' | 'month' = 'week'): Promise<{
  code: number;
  message: string;
  data: ChartData;
}> => {
  return request.get('/admin/statistics/revenue/chart', {
    params: { type }
  });
};

// 获取最近订单
export const getRecentOrders = (limit: number = 10): Promise<{
  code: number;
  message: string;
  data: RecentOrder[];
}> => {
  return request.get('/admin/statistics/orders/recent', {
    params: { limit }
  });
};