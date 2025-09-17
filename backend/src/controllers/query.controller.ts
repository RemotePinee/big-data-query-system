import { Request, Response } from 'express';
import { QueryItemModel, QueryItem } from '../models/query-item.model';
import { ApiConfigModel } from '../models/api-config.model';
import { OrderModel, Order } from '../models/order.model';
import { QueryService } from '../utils/query-service';
import { pool } from '../config/database';

export class QueryController {
  // 创建查询分类
  static async createQueryCategory(req: Request, res: Response) {
    try {
      const { id, name, description, icon } = req.body;
      
      if (!id || !name || !description) {
        return res.status(400).json({
          code: 400,
          message: '分类ID、名称和描述不能为空'
        });
      }
      
      // 检查分类ID是否已存在
      const existingCategory = await QueryItemModel.getCategoryById(id);
      if (existingCategory) {
        return res.status(409).json({
          code: 409,
          message: '分类ID已存在'
        });
      }
      
      // 创建分类
      await QueryItemModel.createCategory({ id, name, description, icon });
      
      res.status(201).json({
        code: 201,
        message: '创建查询分类成功',
        data: { id, name, description, icon }
      });
    } catch (error) {
      console.error('创建查询分类失败:', error);
      res.status(500).json({
        code: 500,
        message: '服务器错误，创建查询分类失败'
      });
    }
  }
  
  // 更新查询分类
  static async updateQueryCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, icon } = req.body;
      
      if (!name || !description) {
        return res.status(400).json({
          code: 400,
          message: '分类名称和描述不能为空'
        });
      }
      
      // 检查分类是否存在
      const existingCategory = await QueryItemModel.getCategoryById(id);
      if (!existingCategory) {
        return res.status(404).json({
          code: 404,
          message: '分类不存在'
        });
      }
      
      // 更新分类
      await QueryItemModel.updateCategory(id, { name, description, icon });
      
      res.status(200).json({
        code: 200,
        message: '更新查询分类成功',
        data: { id, name, description, icon }
      });
    } catch (error) {
      console.error('更新查询分类失败:', error);
      res.status(500).json({
        code: 500,
        message: '服务器错误，更新查询分类失败'
      });
    }
  }
  
  // 删除查询分类
  static async deleteQueryCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // 检查分类是否存在
      const existingCategory = await QueryItemModel.getCategoryById(id);
      if (!existingCategory) {
        return res.status(404).json({
          code: 404,
          message: '分类不存在'
        });
      }
      
      // 获取分类下的所有查询项目
      const itemsInCategory = await QueryItemModel.findByCategory(id);
      
      // 硬删除：先删除分类下的所有查询项目，再删除分类
      if (itemsInCategory && itemsInCategory.length > 0) {
        console.log(`开始级联删除分类 "${id}" 下的 ${itemsInCategory.length} 个查询项目`);
        
        // 逐个删除查询项目
        for (const item of itemsInCategory) {
          try {
            // 确保id存在且为数字类型
            if (item.id && typeof item.id === 'number') {
              await QueryItemModel.delete(item.id);
              console.log(`已删除查询项目: ${item.name} (ID: ${item.id})`);
            } else {
              console.error(`查询项目ID无效 (ID: ${item.id}):`, item);
            }
          } catch (error) {
            console.error(`删除查询项目失败 (ID: ${item.id}):`, error);
            // 继续删除其他项目，不中断整个流程
          }
        }
      }
      
      // 删除分类
      const deleteResult = await QueryItemModel.deleteCategory(id);
      
      if (!deleteResult) {
        return res.status(500).json({
          code: 500,
          message: '删除查询分类失败'
        });
      }
      
      const deletedItemsCount = itemsInCategory ? itemsInCategory.length : 0;
      const message = deletedItemsCount > 0 
        ? `删除查询分类成功，同时删除了 ${deletedItemsCount} 个关联的查询项目`
        : '删除查询分类成功';
      
      res.status(200).json({
        code: 200,
        message: message,
        data: {
          deletedCategory: existingCategory.name,
          deletedItemsCount: deletedItemsCount
        }
      });
    } catch (error) {
      console.error('删除查询分类失败:', error);
      res.status(500).json({
        code: 500,
        message: '服务器错误，删除查询分类失败'
      });
    }
  }

  // 获取查询项目列表
  static async getQueryItems(req: Request, res: Response) {
    try {
      const { category } = req.query;
      
      // 管理员页面应该显示所有项目（包括禁用的）
      const queryItems = await QueryItemModel.findAllForAdmin();
      
      // 如果指定了分类，进行过滤
      const filteredItems = category 
        ? queryItems.filter(item => item.category === category)
        : queryItems;
      
      res.status(200).json({
        code: 200,
        message: '获取查询项目列表成功',
        data: filteredItems
      });
    } catch (error) {
      console.error('获取查询项目列表失败:', error);
      res.status(500).json({
        code: 500,
        message: '服务器错误，获取查询项目列表失败'
      });
    }
  }
  
  // 获取查询项目分类
  static async getQueryCategories(req: Request, res: Response) {
    try {
      const categories = await QueryItemModel.getCategories();
      
      res.status(200).json({
        code: 200,
        message: '获取查询项目分类成功',
        data: categories
      });
    } catch (error) {
      console.error('获取查询项目分类失败:', error);
      res.status(500).json({
        code: 500,
        message: '服务器错误，获取查询项目分类失败'
      });
    }
  }
  
  // 获取查询项目详情
  static async getQueryItemDetail(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const queryItem = await QueryItemModel.findById(parseInt(id));
      
      if (!queryItem) {
        return res.status(404).json({
          code: 404,
          message: '查询项目不存在'
        });
      }
      
      // 解析参数结构
      let paramsSchema = [];
      try {
        if (queryItem.paramsSchema) {
          paramsSchema = JSON.parse(queryItem.paramsSchema);
        }
      } catch (error) {
        console.error('解析参数结构失败:', error);
      }
      
      // 解析平台配置信息
      let platforms = null;
      try {
        if (queryItem.platforms) {
          if (typeof queryItem.platforms === 'string') {
            platforms = JSON.parse(queryItem.platforms);
          } else {
            platforms = queryItem.platforms;
          }
        }
      } catch (error) {
        console.error('解析平台配置失败:', error);
      }
      
      res.status(200).json({
        code: 200,
        message: '获取查询项目详情成功',
        data: {
          ...queryItem,
          paramsSchema,
          platforms
        }
      });
    } catch (error) {
      console.error('获取查询项目详情失败:', error);
      res.status(500).json({
        code: 500,
        message: '服务器错误，获取查询项目详情失败'
      });
    }
  }
  
  // 创建查询订单
  static async createQueryOrder(req: Request, res: Response) {
    try {
      console.log('=== 后端创建查询订单 ===');
      console.log('请求体:', req.body);
      console.log('用户信息:', (req as any).user);
      
      const { queryItemId, params } = req.body;
      const userId = (req as any).user.id;
      
      console.log('解析的参数:');
      console.log('- queryItemId:', queryItemId, typeof queryItemId);
      console.log('- params:', params, typeof params);
      console.log('- userId:', userId);
      
      if (!queryItemId) {
        return res.status(400).json({
          code: 400,
          message: '查询项目ID不能为空'
        });
      }
      
      // 查找查询项目
      console.log('查找查询项目，ID:', queryItemId);
      const queryItem = await QueryItemModel.findById(queryItemId);
      console.log('查询项目结果:', queryItem);
      
      if (!queryItem) {
        return res.status(404).json({
          code: 404,
          message: '查询项目不存在'
        });
      }
      
      // 检查查询项目是否有效
      if (!queryItem.price || queryItem.price <= 0) {
        return res.status(400).json({
          code: 400,
          message: '查询项目价格配置错误'
        });
      }
      
      // 验证查询参数
      try {
        console.log('验证查询参数:', params);
        console.log('参数模式:', queryItem.paramsSchema);
        
        const validation = QueryService.validateParams(params, queryItem.paramsSchema);
        console.log('验证结果:', validation);
        
        if (!validation.valid) {
          return res.status(400).json({
            code: 400,
            message: '查询参数验证失败',
            errors: validation.errors || ['参数验证失败']
          });
        }
      } catch (validationError) {
        console.error('参数验证过程出错:', validationError);
        return res.status(400).json({
          code: 400,
          message: '查询参数验证失败',
          errors: ['参数验证过程出错']
        });
      }
      
      // 生成订单号
      const orderNo = OrderModel.generateOrderNo();
      console.log('生成订单号:', orderNo);
      
      // 创建订单
      const orderData = {
        orderNo,
        userId,
        queryItemId,
        amount: typeof queryItem.price === 'string' ? parseFloat(queryItem.price) : queryItem.price,
        status: 'pending' as const,
        queryParams: JSON.stringify(params)
      };
      
      console.log('创建订单数据:', orderData);
      const orderId = await OrderModel.create(orderData as Order);
      console.log('订单创建成功，ID:', orderId);
      
      res.status(201).json({
        code: 201,
        message: '创建查询订单成功',
        data: {
          orderId,
          orderNo,
          amount: typeof queryItem.price === 'string' ? parseFloat(queryItem.price) : queryItem.price,
          queryItemName: queryItem.name
        }
      });
    } catch (error) {
      console.error('创建查询订单失败:', error);
      console.error('错误堆栈:', (error as Error).stack);
      res.status(500).json({
        code: 500,
        message: '服务器错误，创建查询订单失败',
        error: (error as Error).message
      });
    }
  }
  
  // 通过订单号执行查询
  static async executeQueryByOrderNo(req: Request, res: Response) {
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
      if (order.status !== 'paid') {
        return res.status(400).json({
          code: 400,
          message: '订单未支付，无法执行查询'
        });
      }

      // 检查是否已经有查询结果，避免重复调用API
      if (order.queryResult && order.queryResult.trim() !== '' && order.queryResult !== 'null') {
        console.log(`订单 ${orderNo} 已有查询结果，返回现有结果`);
        let existingResult;
        try {
          existingResult = typeof order.queryResult === 'string' ? JSON.parse(order.queryResult) : order.queryResult;
        } catch (error) {
          existingResult = order.queryResult;
        }
        
        return res.status(200).json({
          code: 200,
          message: '查询结果已存在',
          data: {
            orderId: order.id,
            orderNo: order.orderNo,
            result: existingResult
          }
        });
      }

      // 检查查询状态，避免重复执行
      if (order.queryStatus === 'querying') {
        return res.status(400).json({
          code: 400,
          message: '查询正在进行中，请稍后再试'
        });
      }

      if (order.queryStatus === 'completed') {
        return res.status(400).json({
          code: 400,
          message: '查询已完成'
        });
      }
      
      // 查找查询项目
      const queryItem = await QueryItemModel.findById(order.queryItemId);
      
      if (!queryItem) {
        return res.status(404).json({
          code: 404,
          message: '查询项目不存在'
        });
      }
      
      // 查找API配置
      const apiConfig = await ApiConfigModel.findById(queryItem.apiConfigId);
      
      if (!apiConfig) {
        return res.status(404).json({
          code: 404,
          message: 'API配置不存在'
        });
      }

      // 设置查询状态为查询中，防止重复调用
      await OrderModel.updateQueryStatus(Number(order.id), 'querying');
      
      // 解析查询参数
      let queryParams = {};
      try {
        console.log('=== 执行查询参数解析 ===');
        console.log('订单中存储的queryParams:', order.queryParams);
        console.log('queryParams类型:', typeof order.queryParams);
        
        // 如果queryParams已经是对象，直接使用；如果是字符串，则解析
        if (typeof order.queryParams === 'object' && order.queryParams !== null) {
          queryParams = order.queryParams;
        } else {
          queryParams = JSON.parse(order.queryParams || '{}');
        }
        
        console.log('最终的queryParams对象:', queryParams);
        console.log('查询项目信息:', {
          id: queryItem.id,
          name: queryItem.name,
          paramsSchema: queryItem.paramsSchema
        });
      } catch (error) {
        console.error('解析查询参数失败:', error);
        return res.status(500).json({
          code: 500,
          message: '查询参数解析失败'
        });
      }
      
      // 执行查询
      console.log('调用QueryService.executeQuery，参数:');
      console.log('- queryItemId:', queryItem.id);
      console.log('- queryParams:', queryParams);
      console.log('- userId:', userId);
      
      const queryResult = await QueryService.executeQuery(queryItem.id as number, queryParams, userId);
      
      // 检查查询结果是否有错误
      if (queryResult.error) {
        return res.status(500).json({
          code: 500,
          message: '后端查询处理失败',
          error: queryResult.error
        });
      }
      
      // 格式化查询结果 - 直接使用查询结果数据
      const formattedResult = queryResult.data || queryResult;
      
      // 更新订单查询结果
      await OrderModel.updateQueryResult(Number(order.id), JSON.stringify(formattedResult));
      
      res.status(200).json({
        code: 200,
        message: '查询执行成功',
        data: {
          orderId: order.id,
          orderNo: order.orderNo,
          queryItemName: queryItem.name,
          result: formattedResult
        }
      });
    } catch (error) {
      console.error('执行查询失败:', error);
      res.status(500).json({
        code: 500,
        message: '服务器错误，执行查询失败'
      });
    }
  }

  // 执行查询
  static async executeQuery(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
      const userId = (req as any).user.id;
      
      // 查找订单
      const order = await OrderModel.findById(parseInt(orderId));
      
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
      if (order.status !== 'paid') {
        return res.status(400).json({
          code: 400,
          message: '订单未支付，无法执行查询'
        });
      }
      
      // 查找查询项目
      const queryItem = await QueryItemModel.findById(order.queryItemId);
      
      if (!queryItem) {
        return res.status(404).json({
          code: 404,
          message: '查询项目不存在'
        });
      }
      
      // 查找API配置
      const apiConfig = await ApiConfigModel.findById(queryItem.apiConfigId);
      
      if (!apiConfig) {
        return res.status(404).json({
          code: 404,
          message: 'API配置不存在'
        });
      }
      
      // 解析查询参数
      let queryParams = {};
      try {
        // 如果queryParams已经是对象，直接使用；如果是字符串，则解析
        if (typeof order.queryParams === 'object' && order.queryParams !== null) {
          queryParams = order.queryParams;
        } else {
          queryParams = JSON.parse(order.queryParams || '{}');
        }
      } catch (error) {
        console.error('解析查询参数失败:', error);
        return res.status(500).json({
          code: 500,
          message: '查询参数解析失败'
        });
      }
      
      // 执行查询
      const queryResult = await QueryService.executeQuery(queryItem.id as number, queryParams, userId);
      
      // 检查查询结果是否有错误
      if (queryResult.error) {
        return res.status(500).json({
          code: 500,
          message: '后端查询服务失败',
          error: queryResult.error
        });
      }
      
      // 格式化查询结果 - 直接使用查询结果数据
      const formattedResult = queryResult.data || queryResult;
      
      // 更新订单查询结果
      await OrderModel.updateQueryResult(Number(order.id), JSON.stringify(formattedResult));
      
      res.status(200).json({
        code: 200,
        message: '查询执行成功',
        data: {
          orderId: order.id,
          orderNo: order.orderNo,
          queryItemName: queryItem.name,
          result: formattedResult
        }
      });
    } catch (error) {
      console.error('执行查询失败:', error);
      res.status(500).json({
        code: 500,
        message: '服务器错误，执行查询失败'
      });
    }
  }
  
  // 通过订单号获取查询结果
  static async getQueryResultByOrderNo(req: Request, res: Response) {
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
      
      // 查找查询项目
      const queryItem = await QueryItemModel.findById(order.queryItemId);
      
      if (!queryItem) {
        return res.status(404).json({
          code: 404,
          message: '查询项目不存在'
        });
      }
      
      // 根据订单状态返回不同的响应
      if (order.status === 'pending') {
        return res.status(200).json({
          code: 200,
          message: '订单待支付',
          data: {
            orderId: order.id,
            orderNo: order.orderNo,
            queryItemName: queryItem.name,
            status: 'pending',
            percent: 0
          }
        });
      }
      
      if (order.status === 'paid') {
        // 检查是否有查询结果
        if (order.queryResult) {
          // 解析查询结果
          let queryResult = {};
          try {
            // 检查queryResult的类型，如果已经是对象则直接使用，否则进行JSON解析
            if (typeof order.queryResult === 'object' && order.queryResult !== null) {
              queryResult = order.queryResult;
            } else {
              queryResult = JSON.parse(order.queryResult || '{}');
            }
          } catch (error) {
            console.error('解析查询结果失败:', error);
            return res.status(500).json({
              code: 500,
              message: '查询结果解析失败'
            });
          }
          
          // 如果有查询结果，说明查询已完成，应该返回completed状态
          return res.status(200).json({
            code: 200,
            message: '查询完成',
            data: {
              orderId: order.id,
              orderNo: order.orderNo,
              queryItemName: queryItem.name,
              status: 'completed',
              percent: 100,
              result: queryResult
            }
          });
        } else {
          // 支付成功但查询还在进行中
          return res.status(200).json({
            code: 200,
            message: '查询进行中',
            data: {
              orderId: order.id,
              orderNo: order.orderNo,
              queryItemName: queryItem.name,
              status: 'querying',
              percent: 50
            }
          });
        }
      }
      
      if (order.status === 'completed') {
        // 解析查询结果
        let queryResult = {};
        try {
          if (typeof order.queryResult === 'object' && order.queryResult !== null) {
            queryResult = order.queryResult;
          } else {
            queryResult = JSON.parse(order.queryResult || '{}');
          }
        } catch (error) {
          console.error('解析查询结果失败:', error);
          return res.status(500).json({
            code: 500,
            message: '查询结果解析失败'
          });
        }
        
        return res.status(200).json({
          code: 200,
          message: '查询完成',
          data: {
            orderId: order.id,
            orderNo: order.orderNo,
            queryItemName: queryItem.name,
            status: 'completed',
            percent: 100,
            result: queryResult
          }
        });
      }
      
      if (order.status === 'processing') {
        return res.status(200).json({
          code: 200,
          message: '查询进行中',
          data: {
            orderId: order.id,
            orderNo: order.orderNo,
            queryItemName: queryItem.name,
            status: 'querying',
            percent: 70
          }
        });
      }
      
      if (order.status === 'failed') {
        // 统一错误处理逻辑 - 通过支付方式和查询结果来区分支付失败和查询失败
        let errorMessage = '处理失败';
        let errorType = 'unknown';
        
        // 如果有支付方式且不为空，说明支付已完成，是查询处理失败
        if (order.paymentMethod && order.paymentMethod !== '' && order.paymentMethod !== 'null') {
          errorMessage = '数据查询处理失败，请稍后重试或联系客服';
          errorType = 'query_failed';
        } else {
          // 没有支付方式，说明是支付失败
          errorMessage = '订单支付失败，请重新支付';
          errorType = 'payment_failed';
        }
        
        return res.status(200).json({
          code: 200,
          message: errorMessage,
          data: {
            orderId: order.id,
            orderNo: order.orderNo,
            queryItemName: queryItem.name,
            status: 'failed',
            percent: 0,
            error: errorMessage,
            errorType: errorType
          }
        });
      }
      
      // 其他状态
      return res.status(200).json({
        code: 200,
        message: '订单状态异常',
        data: {
          orderId: order.id,
          orderNo: order.orderNo,
          queryItemName: queryItem.name,
          status: order.status,
          percent: 0
        }
      });
      
    } catch (error) {
      console.error('获取查询结果失败:', error);
      res.status(500).json({
        code: 500,
        message: '服务器错误，获取查询结果失败'
      });
    }
  }

  // 获取查询结果
  static async getQueryResult(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
      const userId = (req as any).user.id;
      
      // 查找订单
      const order = await OrderModel.findById(parseInt(orderId));
      
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
      if (order.status !== 'paid') {
        return res.status(400).json({
          code: 400,
          message: '查询尚未完成'
        });
      }
      
      // 查找查询项目
      const queryItem = await QueryItemModel.findById(order.queryItemId);
      
      if (!queryItem) {
        return res.status(404).json({
          code: 404,
          message: '查询项目不存在'
        });
      }
      
      // 解析查询结果
      let queryResult = {};
      try {
        // 检查queryResult的类型，如果已经是对象则直接使用，否则进行JSON解析
        if (typeof order.queryResult === 'object' && order.queryResult !== null) {
          queryResult = order.queryResult;
        } else {
          queryResult = JSON.parse(order.queryResult || '{}');
        }
      } catch (error) {
        console.error('解析查询结果失败:', error);
        return res.status(500).json({
          code: 500,
          message: '查询结果解析失败'
        });
      }
      
      res.status(200).json({
        code: 200,
        message: '获取查询结果成功',
        data: {
          orderId: order.id,
          orderNo: order.orderNo,
          queryItemName: queryItem.name,
          result: queryResult
        }
      });
    } catch (error) {
      console.error('获取查询结果失败:', error);
      res.status(500).json({
        code: 500,
        message: '服务器错误，获取查询结果失败'
      });
    }
  }
  
  // 创建查询项目
  static async createQueryItem(req: Request, res: Response) {
    try {
      const { name, description, category, price, apiConfigId, queryParams, status, icon, iconClass, iconColor, features } = req.body;
      
      if (!name || !category || !price || !apiConfigId) {
        return res.status(400).json({
          code: 400,
          message: '项目名称、分类、价格和API配置不能为空'
        });
      }
      
      // 检查分类是否存在
      const existingCategory = await QueryItemModel.getCategoryById(category);
      if (!existingCategory) {
        return res.status(404).json({
          code: 404,
          message: '分类不存在'
        });
      }
      
      // 创建查询项目
      const queryItemData = {
        name,
        description,
        category,
        price,
        apiConfigId,
        code: `QRY_${Date.now().toString().substring(5)}`, // 生成唯一代码
        paramsSchema: queryParams ? JSON.stringify(queryParams) : '[]',
        resultSchema: '[]', // 默认空结果结构
        isActive: status === 'active',
        features: features ? JSON.stringify(features) : null,
        icon: icon || 'fas fa-search',
        iconClass: iconClass || 'primary',
        iconColor: iconColor || '#409EFF',
        platforms: JSON.stringify({
          mobile: { enabled: true, order: 0 },
          pc: { enabled: true, order: 0 }
        })
      };
      
      const queryItemId = await QueryItemModel.create(queryItemData);
      
      // 更新平台排序
      const platformsData = {
        mobile: { enabled: true, order: queryItemId },
        pc: { enabled: true, order: queryItemId }
      };
      
      await QueryItemModel.updatePlatforms(Number(queryItemId), JSON.stringify(platformsData));
      
      res.status(201).json({
        code: 201,
        message: '创建查询项目成功',
        data: {
          id: queryItemId,
          ...queryItemData,
          platforms: platformsData
        }
      });
    } catch (error) {
      console.error('创建查询项目失败:', error);
      res.status(500).json({
        code: 500,
        message: '服务器错误，创建查询项目失败'
      });
    }
  }
  
  // 更新查询项目
  static async updateQueryItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, category, price, apiConfigId, queryParams, status, icon, iconClass, iconColor, features } = req.body;
      
      // 查找查询项目
      const queryItem = await QueryItemModel.findById(parseInt(id));
      
      if (!queryItem) {
        return res.status(404).json({
          code: 404,
          message: '查询项目不存在'
        });
      }
      
      // 检查分类是否存在
      if (category) {
        const existingCategory = await QueryItemModel.getCategoryById(category);
        if (!existingCategory) {
          return res.status(404).json({
            code: 404,
            message: '分类不存在'
          });
        }
      }
      
      // 更新查询项目
      const queryItemData: Partial<QueryItem> = {};
      
      if (name) queryItemData.name = name;
      if (description !== undefined) queryItemData.description = description;
      if (category) queryItemData.category = category;
      if (price !== undefined) queryItemData.price = price;
      if (apiConfigId) queryItemData.apiConfigId = Number(apiConfigId);
      if (queryParams) queryItemData.paramsSchema = JSON.stringify(queryParams);
      if (status) queryItemData.isActive = status === 'active';
      if (features !== undefined) queryItemData.features = features ? JSON.stringify(features) : null;
      if (icon !== undefined) queryItemData.icon = icon;
      if (iconClass !== undefined) queryItemData.iconClass = iconClass;
      if (iconColor !== undefined) queryItemData.iconColor = iconColor;
      
      await QueryItemModel.update(parseInt(id), queryItemData);
      
      res.status(200).json({
        code: 200,
        message: '更新查询项目成功',
        data: {
          id: parseInt(id),
          ...queryItem,
          ...queryItemData
        }
      });
    } catch (error) {
      console.error('更新查询项目失败:', error);
      res.status(500).json({
        code: 500,
        message: '服务器错误，更新查询项目失败'
      });
    }
  }
  
  // 删除查询项目
  static async deleteQueryItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // 查找查询项目
      const queryItem = await QueryItemModel.findById(parseInt(id));
      
      if (!queryItem) {
        return res.status(404).json({
          code: 404,
          message: '查询项目不存在'
        });
      }
      
      // 检查是否有相关订单
      const relatedOrders = await OrderModel.findByQueryItemId(parseInt(id));
      
      if (relatedOrders && relatedOrders.length > 0) {
        return res.status(400).json({
          code: 400,
          message: `无法删除查询项目，该项目被 ${relatedOrders.length} 个订单使用。请先处理相关订单。`,
          relatedOrders: relatedOrders.map(order => ({
            id: order.id,
            orderNo: order.orderNo,
            status: order.status,
            createdAt: order.createdAt
          }))
        });
      }
      
      // 删除查询项目
      const deleteResult = await QueryItemModel.delete(parseInt(id));
      
      if (!deleteResult) {
        return res.status(500).json({
          code: 500,
          message: '删除查询项目失败'
        });
      }
      
      res.status(200).json({
        code: 200,
        message: '删除查询项目成功'
      });
    } catch (error) {
      console.error('删除查询项目失败:', error);
      
      // 检查是否是外键约束错误
      if (error instanceof Error && error.message.includes('foreign key constraint fails')) {
        return res.status(400).json({
          code: 400,
          message: '无法删除查询项目，该项目正在被订单使用。请先删除或修改相关订单。'
        });
      }
      
      res.status(500).json({
        code: 500,
        message: '服务器错误，删除查询项目失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }
  
  // 更新平台可见性
  static async updatePlatformVisibility(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { platform, enabled, platforms } = req.body;
      
      // 查找查询项目
      const queryItem = await QueryItemModel.findById(parseInt(id));
      
      if (!queryItem) {
        return res.status(404).json({
          code: 404,
          message: '查询项目不存在'
        });
      }
      
      // 更新平台可见性
      let platformsData;
      if (queryItem.platforms) {
        // 如果platforms是字符串，则解析；如果已经是对象，则直接使用
        if (typeof queryItem.platforms === 'string') {
          platformsData = JSON.parse(queryItem.platforms);
        } else {
          platformsData = queryItem.platforms;
        }
      } else {
        platformsData = {
          mobile: { enabled: true, order: parseInt(id) },
          pc: { enabled: true, order: parseInt(id) }
        };
      }
      
      // 如果提供了完整的platforms对象，则使用它
      if (platforms) {
        platformsData = platforms;
      } 
      // 否则只更新指定平台的可见性
      else if (platform) {
        platformsData[platform] = {
          ...platformsData[platform],
          enabled
        };
      }
      
      // 更新数据库
      await QueryItemModel.updatePlatforms(Number(id), JSON.stringify(platformsData));
      
      res.status(200).json({
        code: 200,
        message: '更新平台可见性成功',
        data: {
          id,
          platforms: platformsData
        }
      });
    } catch (error) {
      console.error('更新平台可见性失败:', error);
      res.status(500).json({
        code: 500,
        message: '服务器错误，更新平台可见性失败'
      });
    }
  }
  
  // 更新首页可见性
  static async updateHomepageVisibility(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { platform, enabled, homepage_visible } = req.body;
      
      // 查找查询项目
      const queryItem = await QueryItemModel.findById(parseInt(id));
      
      if (!queryItem) {
        return res.status(404).json({
          code: 404,
          message: '查询项目不存在'
        });
      }
      
      // 更新首页可见性
      let homepageData;
      if (queryItem.homepage_visible) {
        // 如果homepage_visible是字符串，则解析；如果已经是对象，则直接使用
        if (typeof queryItem.homepage_visible === 'string') {
          homepageData = JSON.parse(queryItem.homepage_visible);
        } else {
          homepageData = queryItem.homepage_visible;
        }
      } else {
        homepageData = {
          mobile: false,
          pc: false
        };
      }
      
      // 如果提供了完整的homepage_visible对象，则使用它
      if (homepage_visible) {
        homepageData = homepage_visible;
      } 
      // 否则只更新指定平台的首页可见性
      else if (platform) {
        homepageData[platform] = enabled;
      }
      
      // 更新数据库
      await QueryItemModel.updateHomepageVisibility(Number(id), JSON.stringify(homepageData));
      
      res.status(200).json({
        code: 200,
        message: '更新首页可见性成功',
        data: {
          id,
          homepage_visible: homepageData
        }
      });
    } catch (error) {
      console.error('更新首页可见性失败:', error);
      res.status(500).json({
        code: 500,
        message: '服务器错误，更新首页可见性失败'
      });
    }
  }
  
  // 保存平台配置
  static async savePlatformConfig(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { platforms } = req.body;
      
      console.log('保存平台配置请求:', { id, platforms });
      
      // 查找查询项目
      const queryItem = await QueryItemModel.findById(parseInt(id));
      
      if (!queryItem) {
        return res.status(404).json({
          code: 404,
          message: '查询项目不存在'
        });
      }
      
      // 验证平台配置数据
      if (!platforms || typeof platforms !== 'object') {
        return res.status(400).json({
          code: 400,
          message: '平台配置数据格式不正确'
        });
      }
      
      // 确保平台配置包含必要的字段
      const validatedPlatforms = {
        mobile: {
          enabled: platforms.mobile?.enabled !== false,
          displayName: platforms.mobile?.displayName || '',
          description: platforms.mobile?.description || '',
          customPrice: platforms.mobile?.customPrice || null,
          originalPrice: platforms.mobile?.originalPrice || null,
          order: platforms.mobile?.order || parseInt(id),
          customParams: platforms.mobile?.customParams || [],
          iconClass: platforms.mobile?.iconClass || 'fas fa-search',
          iconColor: platforms.mobile?.iconColor || '#409EFF',
  

          isHot: platforms.mobile?.isHot || false
        },
        pc: {
          enabled: platforms.pc?.enabled !== false,
          displayName: platforms.pc?.displayName || '',
          description: platforms.pc?.description || '',
          customPrice: platforms.pc?.customPrice || null,
          originalPrice: platforms.pc?.originalPrice || null,
          order: platforms.pc?.order || parseInt(id),
          customParams: platforms.pc?.customParams || [],
          iconClass: platforms.pc?.iconClass || 'fas fa-search',
          iconColor: platforms.pc?.iconColor || '#409EFF',
  

          isHot: platforms.pc?.isHot || false
        }
      };
      
      // 更新数据库
      await QueryItemModel.updatePlatforms(Number(id), JSON.stringify(validatedPlatforms));
      
      res.status(200).json({
        code: 200,
        message: '平台配置保存成功',
        data: {
          id,
          platforms: validatedPlatforms
        }
      });
    } catch (error) {
      console.error('保存平台配置失败:', error);
      res.status(500).json({
        code: 500,
        message: '服务器错误，保存平台配置失败'
      });
    }
  }

  // 获取首页可见的查询项目
  static async getHomepageVisibleItems(req: Request, res: Response) {
    try {
      const { platform } = req.params;
      
      if (!['mobile', 'pc'].includes(platform)) {
        return res.status(400).json({
          code: 400,
          message: '无效的平台参数，只支持 mobile 或 pc'
        });
      }

      // 获取所有查询项目（包含分类名称）
      const allItems = await QueryItemModel.findAllWithCategoryName();
      
      // 过滤出指定平台首页可见的项目
      const homepageItems = allItems.filter(item => {
        // 检查平台可见性
        let platformEnabled = true;
        if (item.platforms) {
          try {
            let platforms;
            if (typeof item.platforms === 'string') {
              platforms = JSON.parse(item.platforms);
            } else {
              platforms = item.platforms;
            }
            platformEnabled = platforms[platform]?.enabled !== false;
          } catch (error) {
            console.error('解析平台配置失败:', error);
          }
        }
        
        // 检查首页可见性
        let homepageVisible = false;
        if (item.homepage_visible) {
          try {
            let homepageConfig;
            if (typeof item.homepage_visible === 'string') {
              homepageConfig = JSON.parse(item.homepage_visible);
            } else {
              homepageConfig = item.homepage_visible;
            }
            homepageVisible = homepageConfig[platform] === true;
          } catch (error) {
            console.error('解析首页可见性配置失败:', error);
          }
        }
        
        return platformEnabled && homepageVisible;
      });
      
      // 格式化数据，添加平台特有功能
      const formattedItems = homepageItems.map(item => {
        let platformConfig = null;
        try {
          if (item.platforms) {
            let platforms;
            if (typeof item.platforms === 'string') {
              platforms = JSON.parse(item.platforms);
            } else {
              platforms = item.platforms;
            }
            platformConfig = platforms[platform] || {};
          }
        } catch (error) {
          console.error('解析平台配置失败:', error);
        }
        
        // 图标配置逻辑：优先使用数据库中管理员配置的图标，如果没有配置则使用默认图标
        let icon = item.icon || 'fas fa-search';
        let iconClass = item.iconClass || 'primary';
        let iconColor = item.iconColor || '#409EFF';
        
        // 如果没有自定义图标，根据分类生成
        if (!item.icon || item.icon === 'fas fa-search') {
          icon = QueryController.getIconByCategory(item.category);
          iconClass = QueryController.getIconClassByCategory(item.category);
        }

        return {
          id: item.id,
          name: item.name,
          code: item.code,
          category: item.category_name || item.category, // 使用分类名称，如果没有则使用分类ID
          price: parseFloat(item.price.toString()),
          description: item.description,
          icon,
          iconClass,
          iconColor,
          features: (() => {
            try {
              if (item.features) {
                if (typeof item.features === 'string') {
                  // 处理双重JSON编码的情况
                  let parsed = JSON.parse(item.features);
                  if (typeof parsed === 'string') {
                    parsed = JSON.parse(parsed);
                  }
                  return Array.isArray(parsed) ? parsed : [];
                } else {
                  return Array.isArray(item.features) ? item.features : [];
                }
              }
              return [];
            } catch (error) {
              console.error('解析features字段失败:', error);
              return [];
            }
          })(),
          displayOrder: platformConfig?.order || 0
        };
      })
      .sort((a, b) => a.displayOrder - b.displayOrder); // 按displayOrder排序

      res.json({
        code: 200,
        message: '获取成功',
        data: formattedItems
      });
    } catch (error) {
      console.error('获取首页可见项目失败:', error);
      res.status(500).json({
        code: 500,
        message: '服务器错误，获取首页可见项目失败'
      });
    }
  }

  // 获取指定平台的查询项目
  static async getQueryItemsByPlatform(req: Request, res: Response) {
    try {
      const { platform } = req.params;
      
      if (!['mobile', 'pc'].includes(platform)) {
        return res.status(400).json({
          code: 400,
          message: '无效的平台参数，只支持 mobile 或 pc'
        });
      }
      
      // 获取所有查询项目（包含分类名称）
      const allItems = await QueryItemModel.findAllWithCategoryName();
      
      // 过滤出指定平台启用的项目
      const platformItems = allItems.filter(item => {
        if (!item.platforms) return true; // 如果没有平台配置，默认启用
        
        try {
          let platforms;
          if (typeof item.platforms === 'string') {
            platforms = JSON.parse(item.platforms);
          } else {
            platforms = item.platforms;
          }
          return platforms[platform]?.enabled !== false;
        } catch (error) {
          console.error('解析平台配置失败:', error);
          return true; // 解析失败时默认启用
        }
      });
      
      // 格式化数据，添加平台特有功能
      const formattedItems = platformItems.map(item => {
        let platformConfig = null;
        try {
          if (item.platforms) {
            let platforms;
            if (typeof item.platforms === 'string') {
              platforms = JSON.parse(item.platforms);
            } else {
              platforms = item.platforms;
            }
            platformConfig = platforms[platform] || {};
          }
        } catch (error) {
          console.error('解析平台配置失败:', error);
        }
        
        // 图标配置逻辑：直接使用数据库中的图标配置，不受平台配置影响
        const iconClass = item.iconClass || item.icon || QueryController.getIconByCategory(item.category);
        const iconColor = item.iconColor || '#409EFF';
        const iconStyleClass = QueryController.getIconClassByCategory(item.category);
        
        // 解析features字段
        let features = [];
        try {
          if (item.features) {
            if (typeof item.features === 'string') {
              // 处理双重JSON编码的情况
              let parsed = JSON.parse(item.features);
              if (typeof parsed === 'string') {
                parsed = JSON.parse(parsed);
              }
              features = parsed;
            } else {
              features = item.features;
            }
          }
        } catch (error) {
          console.error('解析features字段失败:', error);
        }

        return {
          id: item.id,
          name: platformConfig?.displayName || item.name,
          code: item.code,
          category: item.category_name || item.category,
          description: platformConfig?.description || item.description,
          price: platformConfig?.customPrice || item.price,
          basePrice: item.price,
          icon: iconClass,
          iconClass: iconClass, // 使用数据库中配置的图标类名
          iconColor: iconColor, // 自定义颜色
          features: features,
          usage: Math.floor(Math.random() * 20000) + 1000, // 模拟使用次数
          isHot: platformConfig?.isHot || Math.random() > 0.7, // 使用配置的热门标签或随机设置
          displayOrder: platformConfig?.order || item.id,
          originalPrice: platformConfig?.originalPrice || null,
          params_schema: item.paramsSchema, // 添加前端期望的字段名
          placeholder: item.placeholder || `请输入${item.name}所需信息`,
          platformConfig: platformConfig
        };
      });
      
      // 按显示顺序和分类排序
      formattedItems.sort((a, b) => {
        if (a.displayOrder !== b.displayOrder) {
          return a.displayOrder - b.displayOrder;
        }
        return a.category.localeCompare(b.category);
      });
      
      res.status(200).json({
        code: 200,
        message: `获取${platform === 'mobile' ? '移动端' : 'PC端'}查询项目成功`,
        data: formattedItems
      });
    } catch (error) {
      console.error('获取平台查询项目失败:', error);
      res.status(500).json({
        code: 500,
        message: '服务器错误，获取查询项目失败'
      });
    }
  }

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
}