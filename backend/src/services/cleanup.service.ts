import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';

export class CleanupService {
  // 清理7天前的查询结果
  static async cleanupExpiredQueryResults(): Promise<void> {
    try {
      console.log('=== 开始清理过期查询结果 ===');
      
      // 查找7天前的订单
      const [expiredOrders] = await pool.execute<RowDataPacket[]>(
        `SELECT id, order_no, query_result, created_at 
         FROM orders 
         WHERE query_result IS NOT NULL 
         AND query_result != '' 
         AND created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)`
      );
      
      if (expiredOrders.length === 0) {
        console.log('没有需要清理的过期查询结果');
        return;
      }
      
      console.log(`找到 ${expiredOrders.length} 个过期查询结果需要清理`);
      
      // 清理查询结果
      const [updateResult] = await pool.execute(
        `UPDATE orders 
         SET query_result = NULL, 
             updated_at = NOW() 
         WHERE query_result IS NOT NULL 
         AND query_result != '' 
         AND created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)`
      );
      
      console.log(`✅ 成功清理了 ${(updateResult as any).affectedRows} 个过期查询结果`);
      
      // 记录清理日志
      expiredOrders.forEach(order => {
        console.log(`清理订单: ${order.order_no}, 创建时间: ${order.created_at}`);
      });
      
    } catch (error) {
      console.error('清理过期查询结果失败:', error);
      throw error;
    }
  }
  
  // 获取即将过期的查询结果统计
  static async getExpiringResultsStats(): Promise<{
    expiring24h: number;
    expiring3days: number;
    total: number;
  }> {
    try {
      // 24小时内过期
      const [expiring24h] = await pool.execute<RowDataPacket[]>(
        `SELECT COUNT(*) as count 
         FROM orders 
         WHERE query_result IS NOT NULL 
         AND query_result != '' 
         AND created_at < DATE_SUB(NOW(), INTERVAL 6 DAY)
         AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
      );
      
      // 3天内过期
      const [expiring3days] = await pool.execute<RowDataPacket[]>(
        `SELECT COUNT(*) as count 
         FROM orders 
         WHERE query_result IS NOT NULL 
         AND query_result != '' 
         AND created_at < DATE_SUB(NOW(), INTERVAL 4 DAY)
         AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
      );
      
      // 总计有查询结果的订单
      const [total] = await pool.execute<RowDataPacket[]>(
        `SELECT COUNT(*) as count 
         FROM orders 
         WHERE query_result IS NOT NULL 
         AND query_result != ''`
      );
      
      return {
        expiring24h: expiring24h[0].count,
        expiring3days: expiring3days[0].count,
        total: total[0].count
      };
    } catch (error) {
      console.error('获取过期统计失败:', error);
      throw error;
    }
  }
}