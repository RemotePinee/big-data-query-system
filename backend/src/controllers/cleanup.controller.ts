import { Request, Response } from 'express';
import { SchedulerService } from '../services/scheduler.service';

export class CleanupController {
  // 手动执行清理任务
  static async runCleanup(req: Request, res: Response) {
    try {
      await SchedulerService.runCleanupNow();
      
      res.json({
        success: true,
        message: '清理任务执行完成'
      });
    } catch (error: any) {
      console.error('执行清理任务失败:', error);
      res.status(500).json({
        success: false,
        message: '执行清理任务失败',
        error: error.message
      });
    }
  }
  
  // 获取过期统计
  static async getExpiringStats(req: Request, res: Response) {
    try {
      const stats = await SchedulerService.getExpiringStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      console.error('获取过期统计失败:', error);
      res.status(500).json({
        success: false,
        message: '获取过期统计失败',
        error: error.message
      });
    }
  }
}