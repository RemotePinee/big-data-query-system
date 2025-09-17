import { request } from '@/utils/request';

export interface QueryHistoryItem {
  id: number;
  orderNumber: string;
  queryType: string;
  queryParams: Record<string, any>;
  queryResult?: any;
  status: 'completed' | 'processing' | 'failed';
  resultCount: number;
  amount: string;
  paymentMethod?: string;
  resultExpired: boolean;
  remainingDays: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  duration?: number;
  fileSize?: string;
}

export interface QueryHistoryListResponse {
  list: QueryHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface QueryHistoryParams {
  status?: string;
  keyword?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// 查询记录API对象
export const queryHistoryApi = {
  // 获取用户查询历史列表
  getUserQueryHistory(params?: QueryHistoryParams) {
    return request.get<{
      code: number;
      message: string;
      data: QueryHistoryListResponse;
    }>('/query-history', { params });
  },

  // 获取查询历史详情
  getQueryHistoryDetail(historyId: number) {
    return request.get<{
      code: number;
      message: string;
      data: QueryHistoryItem;
    }>(`/query-history/${historyId}`);
  },

  // 删除查询历史记录
  deleteQueryHistory(historyId: number) {
    return request.delete<{
      code: number;
      message: string;
    }>(`/query-history/${historyId}`);
  },

  // 重新执行查询
  repeatQuery(historyId: number) {
    return request.post<{
      code: number;
      message: string;
      data: { orderNo: string };
    }>(`/query-history/${historyId}/repeat`);
  },

  // 下载查询结果
  downloadResult(historyId: number) {
    return request.get(`/query-history/${historyId}/download`, {
      responseType: 'blob'
    });
  }
};

// 向后兼容的函数导出
export const getUserQueryHistory = queryHistoryApi.getUserQueryHistory;
export const getQueryHistoryDetail = queryHistoryApi.getQueryHistoryDetail;
export const deleteQueryHistory = queryHistoryApi.deleteQueryHistory;
export const repeatQuery = queryHistoryApi.repeatQuery;
export const downloadResult = queryHistoryApi.downloadResult;