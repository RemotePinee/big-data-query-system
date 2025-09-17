import { Router, Request, Response } from 'express';
import { CleanupController } from '../controllers/cleanup.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { adminMiddleware } from '../middlewares/admin.middleware';

const router = Router();

// 手动执行清理任务（仅管理员）
router.post('/run', authenticate, adminMiddleware, (req: Request, res: Response) => {
  return CleanupController.runCleanup(req, res);
});

// 获取过期统计（仅管理员）
router.get('/stats', authenticate, adminMiddleware, (req: Request, res: Response) => {
  return CleanupController.getExpiringStats(req, res);
});

export default router;