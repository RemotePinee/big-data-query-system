import { Request, Response } from 'express';
import { OrderModel, Order } from '../models/order.model';
import { QueryItemModel } from '../models/query-item.model';
import { UserModel } from '../models/user.model';

export class OrderController {
  // 根据分类获取图标
  private static getIconByCategory(category: string): string {
    const iconMap: { [key: string]: string } = {
      'personal': 'fas fa-id-card',
      'business': 'fas fa-building',
      'communication': 'fas fa-mobile-alt',
      'vehicle': 'fas fa-car',
      'financial': 'fas fa-credit-card',
      'network': 'fas fa-globe',
      'legal': 'fas fa-gavel',
      'education': 'fas fa-graduation-cap',
      'property': 'fas fa-home'
    };
    
    return iconMap[category] || 'fas fa-search';
  }
  
  // 根据分类获取图标样式类
  private static getIconClassByCategory(category: string): string {
    const classMap: { [key: string]: string } = {
      'personal': 'primary',
      'business': 'success',
      'communication': 'warning',
      'vehicle': 'error',
      'financial': 'secondary',
      'network': 'info',
      'legal': 'dark',
      'education': 'primary',
      'property': 'success'
    };
    
    return classMap[category] || 'primary';
  }
  // 获取用户订单列表
  static async getUserOrders(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { status, page = 1, limit = 10 } = req.query;
      
      let orders = await OrderModel.findByUserId(userId);
      
      // 按状态过滤
      if (status && status !== 'all') {
        orders = orders.filter(order => order.status === status);
      }
      
      // 分页
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      const paginatedOrders = orders.slice(startIndex, endIndex);
      
      // 获取查询项目信息
      const ordersWithDetails = await Promise.all(
        paginatedOrders.map(async (order: Order) => {
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
                if (queryResult) {
                  // 尝试从不同的数据结构中获取数据条数
                  if (queryResult.data?.result?.list && Array.isArray(queryResult.data.result.list)) {
                    resultCount = queryResult.data.result.list.length;
                  } else if (queryResult.result?.list && Array.isArray(queryResult.result.list)) {
                    resultCount = queryResult.result.list.length;
                  } else if (queryResult.data?.list && Array.isArray(queryResult.data.list)) {
                    resultCount = queryResult.data.list.length;
                  } else if (queryResult.list && Array.isArray(queryResult.list)) {
                    resultCount = queryResult.list.length;
                  } else if (Array.isArray(queryResult)) {
                    resultCount = queryResult.length;
                  } else if (typeof queryResult === 'object') {
                    resultCount = Object.keys(queryResult).length;
                  } else {
                    resultCount = queryResult ? 1 : 0;
                  }
                }
              }
            } catch (e) {
              console.error('解析查询结果失败:', e);
            }
            
            // 构建服务信息
            const service = {
              id: queryItem?.id || 0,
              name: queryItem?.name || '未知服务',
              description: queryItem?.description || '',
              icon: 'fas fa-search',
              iconClass: 'primary'
            };
            
            // 获取查询值（从查询参数中提取主要查询值）
            const queryValue = Object.values(queryParams)[0] || '';
            
            // 检查查询结果过期信息
            let resultExpired = false;
            let remainingDays = null;
            if (queryResult) {
              resultExpired = await OrderModel.isQueryResultExpired(order.id);
              remainingDays = await OrderModel.getQueryResultRemainingDays(order.id);
            }
            
            return {
              id: order.id,
              orderNo: order.orderNo,
              service,
              status: order.status,
              amount: order.amount, // 返回数字格式，前端自行格式化
        amountFormatted: `¥${order.amount}`, // 提供格式化版本
              queryValue: queryValue.toString(),
              queryParams,
              result: resultExpired ? null : queryResult, // 过期则不返回结果
              resultCount, // 添加结果数量字段
              resultExpired,
              remainingDays,
              paymentMethod: order.paymentMethod,
              createdAt: order.createdAt,
              updatedAt: order.updatedAt,
              completedAt: order.status === 'completed' ? order.updatedAt : null
            };
          } catch (error) {
            console.error('处理订单详情失败:', error);
            return {
              id: order.id,
              orderNo: order.orderNo,
              service: {
                id: 0,
                name: '未知服务',
                description: '',
                icon: 'fas fa-search',
                iconClass: 'primary'
              },
              status: order.status,
              amount: `¥${order.amount}`,
              queryValue: '',
              queryParams: {},
              result: null,
              resultCount: 0, // 添加结果数量字段
              paymentMethod: order.paymentMethod,
              createdAt: order.createdAt,
              updatedAt: order.updatedAt,
              completedAt: null
            };
          }
        })
      );
      
      // 计算统计信息
      const stats = {
        total: orders.length,
        completed: orders.filter((o: Order) => o.status === 'completed').length,
        pending: orders.filter((o: Order) => o.status === 'pending').length,
        failed: orders.filter((o: Order) => o.status === 'failed').length
      };
      
      res.json({
        code: 200,
        message: '获取订单列表成功',
        data: {
          orders: ordersWithDetails,
          stats,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: orders.length,
            totalPages: Math.ceil(orders.length / limitNum)
          }
        }
      });
    } catch (error) {
      console.error('获取用户订单列表失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取订单列表失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }
  
  // 获取订单详情
  static async getOrderDetail(req: Request, res: Response) {
    try {
      const { orderId, id } = req.params;
      const userId = (req as any).user.id;
      const isAdmin = (req as any).user.role === 'admin';
      
      // 使用orderId或id参数
      const orderIdParam = orderId || id;
      const order = await OrderModel.findById(parseInt(orderIdParam));
      
      if (!order) {
        return res.status(404).json({
          code: 404,
          message: '订单不存在'
        });
      }
      
      // 管理员可以访问所有订单，普通用户只能访问自己的订单
      if (!isAdmin && order.userId !== userId) {
        return res.status(403).json({
          code: 403,
          message: '无权访问此订单'
        });
      }
      
      return OrderController.formatOrderDetail(order, res);
    } catch (error) {
      console.error('获取订单详情失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取订单详情失败'
      });
    }
  }
  
  // 通过订单号获取订单详情
  static async getOrderDetailByOrderNo(req: Request, res: Response) {
    try {
      const { orderNo } = req.params;
      const userId = (req as any).user.id;
      
      const order = await OrderModel.findByOrderNo(orderNo);
      
      if (!order) {
        return res.status(404).json({
          code: 404,
          message: '订单不存在'
        });
      }
      
      // 验证订单所有者
       if (order.userId !== userId) {
         return res.status(403).json({
           code: 403,
           message: '无权访问此订单'
         });
       }
       
       return OrderController.formatOrderDetail(order, res);
     } catch (error) {
       console.error('通过订单号获取订单详情失败:', error);
       res.status(500).json({
         code: 500,
         message: '获取订单详情失败'
       });
     }
   }
   
   // 下载订单查询结果
  static async downloadOrderResult(req: Request, res: Response) {
    try {
      const { orderNo } = req.params;
      const userId = (req as any).user.id;
      
      // 查找订单
      const order = await OrderModel.findByOrderNo(orderNo);
      
      if (!order) {
        return res.status(404).json({
          code: 404,
          message: '订单不存在'
        });
      }
      
      // 验证订单所有者
      if (order.userId !== userId) {
        return res.status(403).json({
          code: 403,
          message: '无权访问此订单'
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
      console.error('下载订单查询结果失败:', error);
      res.status(500).json({
        code: 500,
        message: '服务器错误，下载失败'
      });
    }
  }

  // 格式化订单详情的共用方法
   static async formatOrderDetail(order: Order, res: Response) {
     try {
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
      
      // 检查查询结果过期信息
      let resultExpired = false;
      let remainingDays = null;
      let hasQueryResult = false;
      
      // 检查是否有查询结果（不管是否过期）
      if (order.queryResult && typeof order.queryResult === 'string' && order.queryResult.trim() !== '') {
        hasQueryResult = true;
        resultExpired = await OrderModel.isQueryResultExpired(order.id);
        remainingDays = await OrderModel.getQueryResultRemainingDays(order.id);
      } else if (order.queryResult && typeof order.queryResult === 'object' && order.queryResult !== null) {
        hasQueryResult = true;
        resultExpired = await OrderModel.isQueryResultExpired(order.id);
        remainingDays = await OrderModel.getQueryResultRemainingDays(order.id);
      }

      const orderDetail = {
        id: order.id,
        orderNo: order.orderNo,
        service: {
          id: queryItem?.id || 0,
          name: queryItem?.name || '未知服务',
          description: queryItem?.description || '',
          category: queryItem?.category || '',
          icon: queryItem?.icon || OrderController.getIconByCategory(queryItem?.category || ''),
          iconClass: OrderController.getIconClassByCategory(queryItem?.category || '')
        },
        status: order.status,
        amount: order.amount, // 返回数字格式，前端自行格式化
        amountFormatted: `¥${order.amount}`, // 提供格式化版本
        queryParams,
        queryResult: (hasQueryResult && !resultExpired) ? queryResult : null, // 有结果且未过期才返回
        hasQueryResult, // 标识是否曾经有过查询结果
        resultExpired,
        remainingDays,
        queryCount: order.queryCount || 0,
        queryStatus: order.queryStatus || (order.status === 'paid' && (order.queryCount || 0) > 0 ? 'failed' : 'not_started'),
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        completedAt: order.status === 'paid' ? order.updatedAt : null
      };
      
      res.json({
        code: 200,
        message: '获取订单详情成功',
        data: orderDetail
      });
    } catch (error) {
      console.error('获取订单详情失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取订单详情失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }
  
  // 取消订单
  static async cancelOrder(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
      const userId = (req as any).user.id;

      const order = await OrderModel.findById(parseInt(orderId));

      if (!order) {
        return res.status(404).json({ message: '订单不存在' });
      }

      // 检查订单是否属于当前用户
      if (order.userId !== userId) {
        return res.status(403).json({ message: '无权访问此订单' });
      }

      if (order.status !== 'pending') {
        return res.status(400).json({ message: '只能取消待支付的订单' });
      }

      await OrderModel.updateStatus(order.id, 'cancelled');

      res.json({
        success: true,
        message: '订单已取消'
      });
    } catch (error) {
      console.error('取消订单失败:', error);
      res.status(500).json({ message: '取消订单失败' });
    }
  }

  // 管理员获取所有订单
  static async getAllOrders(req: Request, res: Response) {
    try {
      const { status, page = 1, limit = 10, pageSize, keyword } = req.query;
      const limitNum = parseInt((pageSize || limit) as string);
      
      let allOrders = await OrderModel.findAll();
      let filteredOrders = [...allOrders];
      
      // 按状态过滤
      if (status && status !== 'all') {
        filteredOrders = filteredOrders.filter(order => order.status === status);
      }
      
      // 按关键词搜索（订单号或用户名）
      if (keyword) {
        const searchKeyword = keyword.toString().toLowerCase();
        filteredOrders = filteredOrders.filter(order => {
          return order.orderNo.toLowerCase().includes(searchKeyword);
        });
      }
      
      // 分页
      const pageNum = parseInt(page as string);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
      
      // 获取订单详细信息
      const ordersWithDetails = await Promise.all(
        paginatedOrders.map(async (order: Order) => {
          try {
            // 获取用户信息
            const user = await UserModel.findById(order.userId);
            const username = user?.username || '未知用户';
            
            // 获取查询项目信息
            const queryItem = await QueryItemModel.findById(order.queryItemId);
            const queryItemName = queryItem?.name || '未知查询项目';
            
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
            
            // 获取查询值（从查询参数中提取主要查询值）
            const queryValue = Object.values(queryParams)[0] || '';
            
            // 根据订单状态和支付方式确定显示的支付方式
            let displayPaymentMethod = '未支付';
            if (order.status === 'paid') {
              displayPaymentMethod = order.paymentMethod || '未知支付方式';
            } else if (order.paymentMethod) {
              displayPaymentMethod = order.paymentMethod;
            }
            
            // 解析查询结果
            let queryResult = null;
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
            
            return {
              id: order.id,
              orderNo: order.orderNo,
              username: username,
              userId: order.userId,
              queryItemName: queryItemName,
              queryValue: queryValue.toString(),
              queryParams: queryParams,
              queryResult: queryResult,
              queryCount: order.queryCount || 0,
              queryStatus: order.queryStatus || (order.status === 'paid' && (order.queryCount || 0) > 0 ? 'failed' : 'not_started'),
              amount: order.amount,
              status: order.status,
              paymentMethod: displayPaymentMethod,
              createdAt: order.createdAt,
              updatedAt: order.updatedAt
            };
          } catch (error) {
            console.error('处理订单详情失败:', error);
            return {
              id: order.id,
              orderNo: order.orderNo,
              username: '未知用户',
              userId: order.userId,
              queryItemName: '未知查询项目',
              queryValue: '',
              queryParams: {},
              queryResult: null,
              queryCount: order.queryCount || 0,
              queryStatus: order.queryStatus || (order.status === 'paid' && (order.queryCount || 0) > 0 ? 'failed' : 'not_started'),
              amount: order.amount,
              status: order.status,
              paymentMethod: '未知',
              createdAt: order.createdAt,
              updatedAt: order.updatedAt
            };
          }
        })
      );
      
      // 计算统计信息
      const stats = {
        total: filteredOrders.length,
        completed: filteredOrders.filter((o: Order) => o.status === 'paid').length,
        pending: filteredOrders.filter((o: Order) => o.status === 'pending').length,
        failed: filteredOrders.filter((o: Order) => o.status === 'failed').length,
        cancelled: filteredOrders.filter((o: Order) => o.status === 'cancelled').length
      };
      
      res.json({
        code: 200,
        message: '获取订单列表成功',
        data: {
          orders: ordersWithDetails,
          stats,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: filteredOrders.length,
            totalPages: Math.ceil(filteredOrders.length / limitNum)
          }
        }
      });
    } catch (error) {
      console.error('获取所有订单失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取订单列表失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  // 获取用户订单统计
  static async getUserOrderStats(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      
      // 获取用户的所有订单
      const userOrders = await OrderModel.findByUserId(userId);
      
      // 计算统计数据
      const stats = {
        total: userOrders.length,
        completed: userOrders.filter(order => order.status === 'completed').length,
        pending: userOrders.filter(order => order.status === 'pending').length,
        paid: userOrders.filter(order => order.status === 'paid').length,
        processing: userOrders.filter(order => order.status === 'processing').length,
        failed: userOrders.filter(order => order.status === 'failed').length
      };
      
      res.json({
        code: 200,
        message: '获取订单统计成功',
        data: stats
      });
    } catch (error) {
      console.error('获取用户订单统计失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取订单统计失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  // 删除订单（硬删除）
  static async deleteOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const orderId = parseInt(id);

      if (!orderId || isNaN(orderId)) {
        return res.status(400).json({
          code: 400,
          message: '订单ID无效'
        });
      }

      // 检查订单是否存在
      const order = await OrderModel.findById(orderId);
      if (!order) {
        return res.status(404).json({
          code: 404,
          message: '订单不存在'
        });
      }

      // 执行硬删除
      const deleted = await OrderModel.delete(orderId);
      
      if (deleted) {
        res.json({
          code: 200,
          message: '订单删除成功'
        });
      } else {
        res.status(500).json({
          code: 500,
          message: '订单删除失败'
        });
      }
    } catch (error) {
      console.error('删除订单失败:', error);
      res.status(500).json({
        code: 500,
        message: '删除订单失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }
}