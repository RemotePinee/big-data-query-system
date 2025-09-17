import { Router } from 'express';
import { QueryHistoryController } from '../controllers/query-history.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// 获取用户查询历史列表
router.get('/', authMiddleware, QueryHistoryController.getUserQueryHistory);

// 获取查询历史详情
router.get('/:historyId', authMiddleware, QueryHistoryController.getQueryHistoryDetail);

// 下载查询结果
router.get('/:historyId/download', authMiddleware, QueryHistoryController.downloadResult);

// 删除查询历史记录
router.delete('/:historyId', authMiddleware, QueryHistoryController.deleteQueryHistory);

// 批量删除查询历史记录
router.delete('/', authMiddleware, QueryHistoryController.batchDeleteQueryHistory);

// 重新执行查询
router.post('/:historyId/repeat', authMiddleware, QueryHistoryController.repeatQuery);

export default router;