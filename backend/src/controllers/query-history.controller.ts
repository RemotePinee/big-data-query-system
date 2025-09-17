import { Request, Response } from 'express';
import { OrderModel } from '../models/order.model';
import { QueryItemModel } from '../models/query-item.model';

export class QueryHistoryController {
  // 获取用户查询历史列表
  static async getUserQueryHistory(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { 
        status, 
        keyword, 
        startDate, 
        endDate, 
        page = 1, 
        limit = 10 
      } = req.query;
      
      // 获取用户的所有订单（作为查询历史）
      let orders = await OrderModel.findByUserId(userId);
      
      // 按状态过滤
      if (status && status !== 'all') {
        orders = orders.filter(order => order.status === status);
      }
      
      // 按关键词搜索
      if (keyword) {
        const searchKeyword = (keyword as string).toLowerCase();
        orders = orders.filter(order => {
          const orderNo = order.orderNo?.toLowerCase() || '';
          const queryParams = JSON.stringify(order.queryParams || {}).toLowerCase();
          return orderNo.includes(searchKeyword) || queryParams.includes(searchKeyword);
        });
      }
      
      // 按日期范围过滤
      if (startDate) {
        const start = new Date(startDate as string);
        orders = orders.filter(order => new Date(order.createdAt) >= start);
      }
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999); // 设置为当天结束时间
        orders = orders.filter(order => new Date(order.createdAt) <= end);
      }
      
      // 按创建时间倒序排列
      orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      // 分页
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const total = orders.length;
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      const paginatedOrders = orders.slice(startIndex, endIndex);
      
      // 获取详细信息
      const historyWithDetails = await Promise.all(
        paginatedOrders.map(async (order) => {
          try {
            const queryItem = await QueryItemModel.findById(order.queryItemId);
            
            // 解析查询参数
            let queryParams = {};
            try {
              if (typeof order.queryParams === 'object' && order.queryParams !== null) {
                queryParams = order.queryParams;
              } else {
                queryParams = JSON.parse(order.queryParams || '{}');
              }
            } catch (e) {
              console.error('解析查询参数失败:', e);
            }
            
            // 解析查询结果
            let queryResult = null;
            let resultCount = 0;
            try {
              if (order.queryResult) {
                if (typeof order.queryResult === 'object' && order.queryResult !== null) {
                  queryResult = order.queryResult;
                } else {
                  queryResult = JSON.parse(order.queryResult);
                }
                
                // 计算结果数量
                if (Array.isArray(queryResult)) {
                  resultCount = queryResult.length;
                } else if (queryResult && typeof queryResult === 'object') {
                  resultCount = Object.keys(queryResult).length;
                } else {
                  resultCount = queryResult ? 1 : 0;
                }
              }
            } catch (e) {
              console.error('解析查询结果失败:', e);
            }
            
            // 保持原始状态，不进行映射
            return {
              id: order.id,
              orderNumber: order.orderNo,
              queryType: queryItem?.name || '未知查询',
              queryParams: JSON.stringify(queryParams),
              status: order.status,
              resultCount,
              amount: order.amount,
              createdAt: order.createdAt,
              updatedAt: order.updatedAt
            };
          } catch (error) {
            console.error('处理查询历史详情失败:', error);
            return {
              id: order.id,
              orderNumber: order.orderNo,
              queryType: '未知查询',
              queryParams: '{}',
              status: 'failed',
              resultCount: 0,
              amount: order.amount,
              createdAt: order.createdAt,
              updatedAt: order.updatedAt
            };
          }
        })
      );
      
      res.status(200).json({
        code: 200,
        message: '获取查询历史成功',
        data: {
          list: historyWithDetails,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum)
          }
        }
      });
    } catch (error) {
      console.error('获取查询历史失败:', error);
      res.status(500).json({
        code: 500,
        message: '服务器错误，获取查询历史失败'
      });
    }
  }
  
  // 获取查询历史详情
  static async getQueryHistoryDetail(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { historyId } = req.params;
      
      // 获取订单详情
      const order = await OrderModel.findById(parseInt(historyId));
      if (!order) {
        return res.status(404).json({
          code: 404,
          message: '查询记录不存在'
        });
      }
      
      // 验证订单所有权
      if (order.userId !== userId) {
        return res.status(403).json({
          code: 403,
          message: '无权访问此查询记录'
        });
      }
      
      // 获取查询项目信息
      const queryItem = await QueryItemModel.findById(order.queryItemId);
      
      // 解析查询参数和结果
      let queryParams = {};
      let queryResult = null;
      
      try {
        if (typeof order.queryParams === 'object' && order.queryParams !== null) {
          queryParams = order.queryParams;
        } else {
          queryParams = JSON.parse(order.queryParams || '{}');
        }
      } catch (e) {
        console.error('解析查询参数失败:', e);
      }
      
      try {
        if (order.queryResult) {
          if (typeof order.queryResult === 'object' && order.queryResult !== null) {
            queryResult = order.queryResult;
          } else {
            queryResult = JSON.parse(order.queryResult);
          }
        }
      } catch (e) {
        console.error('解析查询结果失败:', e);
      }
      
      // 检查结果是否过期
      const resultExpired = await OrderModel.isQueryResultExpired(order.id);
      const remainingDays = await OrderModel.getQueryResultRemainingDays(order.id);
      
      const statusMap: { [key: string]: string } = {
        'paid': 'completed',
        'pending': 'processing',
        'processing': 'processing',
        'failed': 'failed',
        'cancelled': 'failed'
      };
      
      const historyDetail = {
        id: order.id,
        orderNumber: order.orderNo,
        queryType: queryItem?.name || '未知查询',
        queryParams,
        queryResult: resultExpired ? null : queryResult,
        status: statusMap[order.status] || 'failed',
        amount: order.amount,
        paymentMethod: order.paymentMethod,
        resultExpired,
        remainingDays,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        completedAt: order.status === 'paid' ? order.updatedAt : null
      };
      
      res.status(200).json({
        code: 200,
        message: '获取查询历史详情成功',
        data: historyDetail
      });
    } catch (error) {
      console.error('获取查询历史详情失败:', error);
      res.status(500).json({
        code: 500,
        message: '服务器错误，获取查询历史详情失败'
      });
    }
  }
  
  // 删除查询历史记录
  static async deleteQueryHistory(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { historyId } = req.params;
      
      // 获取订单详情
      const order = await OrderModel.findById(parseInt(historyId));
      if (!order) {
        return res.status(404).json({
          code: 404,
          message: '查询记录不存在'
        });
      }
      
      // 验证订单所有权
      if (order.userId !== userId) {
        return res.status(403).json({
          code: 403,
          message: '无权删除此查询记录'
        });
      }
      
      // 只允许删除已完成或失败的记录
      if (!['paid', 'failed', 'cancelled'].includes(order.status)) {
        return res.status(400).json({
          code: 400,
          message: '只能删除已完成或失败的查询记录'
        });
      }
      
      // 删除订单记录
      const success = await OrderModel.delete(order.id);
      if (!success) {
        return res.status(500).json({
          code: 500,
          message: '删除查询记录失败'
        });
      }
      
      res.status(200).json({
        code: 200,
        message: '删除查询记录成功'
      });
    } catch (error) {
      console.error('删除查询记录失败:', error);
      res.status(500).json({
        code: 500,
        message: '服务器错误，删除查询记录失败'
      });
    }
  }
  
  // 批量删除查询历史记录
  static async batchDeleteQueryHistory(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { historyIds } = req.body;
      
      if (!Array.isArray(historyIds) || historyIds.length === 0) {
        return res.status(400).json({
          code: 400,
          message: '请提供要删除的记录ID列表'
        });
      }
      
      let deletedCount = 0;
      const errors: string[] = [];
      
      for (const historyId of historyIds) {
        try {
          // 获取订单详情
          const order = await OrderModel.findById(parseInt(historyId));
          if (!order) {
            errors.push(`记录 ${historyId} 不存在`);
            continue;
          }
          
          // 验证订单所有权
          if (order.userId !== userId) {
            errors.push(`无权删除记录 ${historyId}`);
            continue;
          }
          
          // 只允许删除已完成或失败的记录
          if (!['paid', 'failed', 'cancelled'].includes(order.status)) {
            errors.push(`记录 ${historyId} 状态不允许删除`);
            continue;
          }
          
          // 删除订单记录
          const success = await OrderModel.delete(order.id);
          if (success) {
            deletedCount++;
          } else {
            errors.push(`删除记录 ${historyId} 失败`);
          }
        } catch (error) {
          console.error(`删除记录 ${historyId} 时出错:`, error);
          errors.push(`删除记录 ${historyId} 时出错`);
        }
      }
      
      res.status(200).json({
        code: 200,
        message: `成功删除 ${deletedCount} 条记录`,
        data: {
          deletedCount,
          errors
        }
      });
    } catch (error) {
      console.error('批量删除查询记录失败:', error);
      res.status(500).json({
        code: 500,
        message: '服务器错误，批量删除查询记录失败'
      });
    }
  }
  
  // 重新执行查询
  static async repeatQuery(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { historyId } = req.params;
      
      // 获取原始订单详情
      const originalOrder = await OrderModel.findById(parseInt(historyId));
      if (!originalOrder) {
        return res.status(404).json({
          code: 404,
          message: '原查询记录不存在'
        });
      }
      
      // 验证订单所有权
      if (originalOrder.userId !== userId) {
        return res.status(403).json({
          code: 403,
          message: '无权访问此查询记录'
        });
      }
      
      // 获取查询项目信息
      const queryItem = await QueryItemModel.findById(originalOrder.queryItemId);
      if (!queryItem) {
        return res.status(404).json({
          code: 404,
          message: '查询项目不存在'
        });
      }
      
      // 解析原始查询参数
      let queryParams = {};
      try {
        if (typeof originalOrder.queryParams === 'object' && originalOrder.queryParams !== null) {
          queryParams = originalOrder.queryParams;
        } else {
          queryParams = JSON.parse(originalOrder.queryParams || '{}');
        }
      } catch (e) {
        console.error('解析查询参数失败:', e);
        return res.status(400).json({
          code: 400,
          message: '原查询参数格式错误'
        });
      }
      
      res.status(200).json({
        code: 200,
        message: '获取重复查询信息成功',
        data: {
          queryItem: {
            id: queryItem.id,
            name: queryItem.name,
            description: queryItem.description,
            price: queryItem.price
          },
          queryParams
        }
      });
    } catch (error) {
      console.error('重新执行查询失败:', error);
      res.status(500).json({
        code: 500,
        message: '服务器错误，重新执行查询失败'
      });
    }
  }

  // 下载查询结果
  static async downloadResult(req: Request, res: Response) {
    try {
      const { historyId } = req.params;
      const userId = (req as any).user.id;
      
      // 查找订单
      const order = await OrderModel.findById(parseInt(historyId));
      
      if (!order) {
        return res.status(404).json({
          code: 404,
          message: '查询记录不存在'
        });
      }
      
      // 验证订单所有者
      if (order.userId !== userId) {
        return res.status(403).json({
          code: 403,
          message: '无权访问此查询记录'
        });
      }
      
      // 检查订单状态
      if (order.status !== 'completed' && order.queryStatus !== 'completed') {
        return res.status(400).json({
          code: 400,
          message: '查询尚未完成，无法下载结果'
        });
      }
      
      // 检查是否有查询结果
      if (!order.queryResult) {
        return res.status(404).json({
          code: 404,
          message: '查询结果不存在'
        });
      }
      
      // 解析查询结果
      let queryResult = null;
      try {
        if (typeof order.queryResult === 'object' && order.queryResult !== null) {
          queryResult = order.queryResult;
        } else {
          queryResult = JSON.parse(order.queryResult);
        }
      } catch (e) {
        console.error('解析查询结果失败:', e);
        return res.status(500).json({
          code: 500,
          message: '查询结果格式错误'
        });
      }
      
      // 获取查询项目信息
      const queryItem = await QueryItemModel.findById(order.queryItemId);
      const queryItemName = queryItem ? queryItem.name : '查询结果';
      
      // 生成文件名
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${queryItemName}_${order.orderNo}_${timestamp}.json`;
      
      // 设置响应头
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
      
      // 返回格式化的JSON数据
       const downloadData = {
         orderNo: order.orderNo,
         queryItemName: queryItemName,
         queryParams: order.queryParams,
         queryResult: queryResult,
         completedAt: order.paidAt || order.updatedAt,
         downloadTime: new Date().toISOString()
       };
      
      res.json(downloadData);
    } catch (error) {
      console.error('下载查询结果失败:', error);
      res.status(500).json({
        code: 500,
        message: '服务器错误，下载失败'
      });
    }
  }
}