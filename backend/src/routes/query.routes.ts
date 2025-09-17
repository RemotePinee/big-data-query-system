import { Router } from 'express';
import { QueryController } from '../controllers/query.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// 公开路由
router.get('/items', QueryController.getQueryItems);
router.get('/categories', QueryController.getQueryCategories);
router.get('/items/:id', QueryController.getQueryItemDetail);
router.get('/homepage/:platform', QueryController.getHomepageVisibleItems);
router.get('/:platform', QueryController.getQueryItemsByPlatform);

// 需要认证的路由
router.post('/orders', authenticate, QueryController.createQueryOrder);
router.post('/execute/:orderId', authenticate, QueryController.executeQuery);
router.post('/execute/order/:orderNo', authenticate, QueryController.executeQueryByOrderNo);
router.get('/results/:orderId', authenticate, QueryController.getQueryResult);
router.get('/results/order/:orderNo', authenticate, QueryController.getQueryResultByOrderNo);

// 查询项目管理相关路由
router.post('/items', authenticate, QueryController.createQueryItem);
router.put('/items/:id', authenticate, QueryController.updateQueryItem);
router.delete('/items/:id', authenticate, QueryController.deleteQueryItem);

// 平台配置相关路由
router.put('/items/:id/platforms', authenticate, QueryController.updatePlatformVisibility);
router.put('/items/:id/platform-config', authenticate, QueryController.savePlatformConfig);

// 首页可见性相关路由
router.put('/items/:id/homepage-visible', authenticate, QueryController.updateHomepageVisibility);

// 分类管理相关路由
router.post('/categories', authenticate, QueryController.createQueryCategory);
router.put('/categories/:id', authenticate, QueryController.updateQueryCategory);
router.delete('/categories/:id', authenticate, QueryController.deleteQueryCategory);

export default router;
