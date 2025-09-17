import { Router } from 'express';
import { 
  getSystemSettings, 
  updateSystemSettings, 
  uploadLogo,
  getPublicSettings 
} from '../controllers/systemSettingsController';
import { authenticate } from '../middlewares/auth.middleware';
import { adminMiddleware } from '../middlewares/admin.middleware';

const router = Router();

// 管理员路由（需要认证和管理员权限）
router.get('/admin/system-settings', authenticate, adminMiddleware, getSystemSettings);
router.post('/admin/system-settings', authenticate, adminMiddleware, updateSystemSettings);
router.post('/admin/upload-logo', authenticate, adminMiddleware, uploadLogo);

// 公开路由（用于前端获取显示设置）
router.get('/system-settings/public', getPublicSettings);

export default router;