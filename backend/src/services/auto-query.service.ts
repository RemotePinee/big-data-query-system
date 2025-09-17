import { OrderModel } from '../models/order.model';
import { QueryItemModel } from '../models/query-item.model';
import { QueryService } from '../utils/query-service';

class AutoQueryService {
  private queryIntervals: Map<number, NodeJS.Timeout> = new Map();
  private readonly MAX_QUERY_ATTEMPTS = 20; // 增加到20次，提高查询成功率
  private readonly QUERY_INTERVAL = 30000; // 30秒查询一次

  /**
   * 开始自动查询
   * @param orderId 订单ID
   */
  async startAutoQuery(orderId: number): Promise<void> {
    try {
      const order = await OrderModel.findById(orderId);
      if (!order) {
        console.error(`订单不存在: ${orderId}`);
        return;
      }

      // 检查订单状态是否为已支付
      if (order.status !== 'paid') {
        console.log(`订单 ${orderId} 状态不是已支付，跳过自动查询`);
        return;
      }

      // 检查是否已经有查询结果 - 加强检查
      if (order.queryResult && order.queryResult.trim() !== '' && order.queryResult !== 'null') {
        console.log(`订单 ${orderId} 已有查询结果，跳过自动查询`);
        // 确保状态正确
        await OrderModel.updateQueryStatus(orderId, 'completed');
        await OrderModel.updateStatus(orderId, 'completed');
        return;
      }

      // 检查查询状态
      if (order.queryStatus === 'completed' || order.queryStatus === 'max_attempts_reached') {
        console.log(`订单 ${orderId} 查询已完成或达到最大尝试次数，跳过自动查询`);
        return;
      }

      // 检查是否已经在查询中，避免重复启动
      if (this.queryIntervals.has(orderId)) {
        console.log(`订单 ${orderId} 已在自动查询中，跳过重复启动`);
        return;
      }

      // 停止之前的查询（如果存在）
      this.stopAutoQuery(orderId);

      // 设置查询状态为查询中
      await OrderModel.updateQueryStatus(orderId, 'querying');

      console.log(`开始自动查询订单 ${orderId}`);
      
      // 立即执行第一次查询
      await this.performQuery(orderId);

      // 设置定时查询
      const interval = setInterval(async () => {
        await this.performQuery(orderId);
      }, this.QUERY_INTERVAL);

      this.queryIntervals.set(orderId, interval);

    } catch (error) {
      console.error(`启动自动查询失败 (订单ID: ${orderId}):`, error);
      await OrderModel.updateQueryStatus(orderId, 'failed');
    }
  }

  /**
   * 停止自动查询
   * @param orderId 订单ID
   */
  stopAutoQuery(orderId: number): void {
    const interval = this.queryIntervals.get(orderId);
    if (interval) {
      clearInterval(interval);
      this.queryIntervals.delete(orderId);
      console.log(`停止自动查询订单 ${orderId}`);
    }
  }

  /**
   * 执行单次查询
   * @param orderId 订单ID
   */
  private async performQuery(orderId: number): Promise<void> {
    try {
      const order = await OrderModel.findById(orderId);
      if (!order) {
        this.stopAutoQuery(orderId);
        return;
      }

      // 检查是否已达到最大查询次数
      const currentCount = (order.queryCount || 0) + 1;
      await OrderModel.incrementQueryCount(orderId);

      console.log(`执行第 ${currentCount} 次查询 (订单ID: ${orderId})`);

      // 获取查询项目信息
      const queryItem = await QueryItemModel.findById(order.queryItemId);
      if (!queryItem) {
        console.error(`查询项目不存在: ${order.queryItemId}`);
        await OrderModel.updateQueryStatus(orderId, 'failed');
        this.stopAutoQuery(orderId);
        return;
      }

      // 解析查询参数
      let queryParams;
      try {
        queryParams = typeof order.queryParams === 'string' 
          ? JSON.parse(order.queryParams) 
          : order.queryParams;
      } catch (error) {
        console.error(`解析查询参数失败 (订单ID: ${orderId}):`, error);
        await OrderModel.updateQueryStatus(orderId, 'failed');
        this.stopAutoQuery(orderId);
        return;
      }

      // 执行查询
      const queryResult = await QueryService.executeQuery(
        queryItem.id as number,
        queryParams,
        order.userId
      );

      if (queryResult && queryResult.success && queryResult.data) {
        // 查询成功，保存结果
        await OrderModel.updateQueryResult(orderId, JSON.stringify(queryResult));
        await OrderModel.updateQueryStatus(orderId, 'completed');
        await OrderModel.updateStatus(orderId, 'completed');
        
        console.log(`查询成功 (订单ID: ${orderId})`);
        this.stopAutoQuery(orderId);
        
      } else if (currentCount >= this.MAX_QUERY_ATTEMPTS) {
        // 达到最大查询次数，标记为失败
        await OrderModel.updateQueryStatus(orderId, 'max_attempts_reached');
        await OrderModel.updateStatus(orderId, 'failed');
        
        console.log(`查询达到最大尝试次数 (订单ID: ${orderId})`);
        this.stopAutoQuery(orderId);
        
      } else {
        // 继续查询
        console.log(`查询暂无结果，将在 ${this.QUERY_INTERVAL / 1000} 秒后重试 (订单ID: ${orderId})`);
      }

    } catch (error) {
      console.error(`查询执行失败 (订单ID: ${orderId}):`, error);
      
      const order = await OrderModel.findById(orderId);
      const currentCount = order?.queryCount || 0;
      
      if (currentCount >= this.MAX_QUERY_ATTEMPTS) {
        await OrderModel.updateQueryStatus(orderId, 'max_attempts_reached');
        await OrderModel.updateStatus(orderId, 'failed');
        this.stopAutoQuery(orderId);
      }
    }
  }

  /**
   * 获取正在查询的订单列表
   */
  getActiveQueries(): number[] {
    return Array.from(this.queryIntervals.keys());
  }

  /**
   * 停止所有查询
   */
  stopAllQueries(): void {
    for (const orderId of this.queryIntervals.keys()) {
      this.stopAutoQuery(orderId);
    }
  }

  /**
   * 恢复未完成的查询
   */
  async resumeIncompleteQueries(): Promise<void> {
    try {
      console.log('正在恢复未完成的查询...');
      
      // 查找所有状态为 'querying' 的订单
      const incompleteOrders = await OrderModel.findByQueryStatus('querying');
      
      if (incompleteOrders && incompleteOrders.length > 0) {
        console.log(`发现 ${incompleteOrders.length} 个未完成的查询，正在恢复...`);
        
        for (const order of incompleteOrders) {
          const queryCount = order.queryCount || 0;
          if (order.id && queryCount < this.MAX_QUERY_ATTEMPTS) {
            console.log(`恢复查询: 订单ID ${order.id}, 已查询 ${queryCount} 次`);
            await this.startAutoQuery(order.id);
          } else if (queryCount >= this.MAX_QUERY_ATTEMPTS) {
            // 已达到最大查询次数，标记为失败
            await OrderModel.updateQueryStatus(order.id, 'max_attempts_reached');
            await OrderModel.updateStatus(order.id, 'failed');
          }
        }
      } else {
        console.log('没有发现未完成的查询');
      }
    } catch (error) {
      console.error('恢复未完成查询失败:', error);
    }
  }
}

export const autoQueryService = new AutoQueryService();