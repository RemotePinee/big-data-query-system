import cron from 'node-cron';
import { CleanupService } from './cleanup.service';

export class SchedulerService {
  private static isInitialized = false;
  
  // 初始化定时任务
  static initialize(): void {
    if (this.isInitialized) {
      console.log('定时任务已经初始化');
      return;
    }
    
    console.log('=== 初始化定时任务调度器 ===');
    
    // 每天凌晨2点执行清理任务
    cron.schedule('0 2 * * *', async () => {
      console.log('执行定时清理任务:', new Date().toISOString());
      try {
        await CleanupService.cleanupExpiredQueryResults();
      } catch (error) {
        console.error('定时清理任务执行失败:', error);
      }
    }, {
      timezone: 'Asia/Shanghai'
    });
    
    // 每小时检查一次即将过期的结果（用于监控）
    cron.schedule('0 * * * *', async () => {
      try {
        const stats = await CleanupService.getExpiringResultsStats();
        if (stats.expiring24h > 0) {
          console.log(`提醒: 有 ${stats.expiring24h} 个查询结果将在24小时内过期`);
        }
      } catch (error) {
        console.error('检查过期统计失败:', error);
      }
    }, {
      timezone: 'Asia/Shanghai'
    });
    
    this.isInitialized = true;
    console.log('✅ 定时任务调度器初始化完成');
    console.log('- 每天凌晨2点清理7天前的查询结果');
    console.log('- 每小时检查即将过期的查询结果');
  }
  
  // 手动执行清理任务（用于测试）
  static async runCleanupNow(): Promise<void> {
    console.log('手动执行清理任务');
    await CleanupService.cleanupExpiredQueryResults();
  }
  
  // 获取过期统计
  static async getExpiringStats() {
    return await CleanupService.getExpiringResultsStats();
  }
}