import { request } from '@/utils/request';

// 查询API对象
export const queryApi = {
  // 获取查询项目列表
  getQueryItems() {
    return request.get('/queries/items');
  },

  // 获取查询分类
  getQueryCategories() {
    return request.get('/queries/categories');
  },

  // 获取查询项目详情
  getQueryItemDetail(id: number) {
    return request.get(`/queries/items/${id}`);
  },

  // 创建查询订单
  createQueryOrder(data: {
    queryItemId: number;
    params: Record<string, any>;
  }) {
    return request.post('/queries/orders', data);
  },

  // 执行查询
  executeQuery(orderId: number) {
    return request.post(`/queries/execute/${orderId}`);
  },

  // 获取查询结果
  getQueryResult(orderNoOrId: string | number) {
    // 如果是数字，使用订单ID路由
    if (typeof orderNoOrId === 'number') {
      return request.get(`/queries/results/${orderNoOrId}`);
    }
    // 如果是字符串，使用订单号路由
    return request.get(`/queries/results/order/${orderNoOrId}`);
  },

  // 更新查询项目
  updateQueryItem(id: number, data: any) {
    return request.put(`/queries/items/${id}`, data);
  },

  // 更新平台可见性
  updatePlatformVisibility(id: number, platform: 'mobile' | 'pc', enabled: boolean, platforms?: any) {
    return request.put(`/queries/items/${id}/platform`, { platform, enabled, platforms });
  }
};

// 向后兼容的函数导出
export const getQueryItems = queryApi.getQueryItems;
export const getQueryCategories = queryApi.getQueryCategories;
export const getQueryItemDetail = queryApi.getQueryItemDetail;
export const createQueryOrder = queryApi.createQueryOrder;
export const executeQuery = queryApi.executeQuery;
export const getQueryResult = queryApi.getQueryResult;

// 为了兼容旧的导入方式，创建 queryAPI 对象
export const queryAPI = {
  ...queryApi,
  // 添加兼容性方法名
  createOrder: queryApi.createQueryOrder,
  getAllItems: queryApi.getQueryItems,
  getItemsByPlatform: queryApi.getQueryItems,
  getItemDetail: queryApi.getQueryItemDetail,
  getCategories: queryApi.getQueryCategories
};

// 默认导出
export default queryApi;
