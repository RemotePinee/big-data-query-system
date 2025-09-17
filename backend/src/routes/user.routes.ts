import express from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

// 公开路由
router.post('/register', UserController.register);
router.post('/login', UserController.login);

// 需要认证的路由
router.get('/profile', authenticate, UserController.getUserInfo);
router.put('/profile', authenticate, UserController.updateUserInfo);
router.get('/stats', authenticate, UserController.getUserStats);
router.get('/unread-count', authenticate, UserController.getUnreadCount);
router.put('/change-password', authenticate, UserController.changePassword);
router.get('/login-records', authenticate, UserController.getLoginRecords);
router.post('/request-deletion', authenticate, UserController.requestAccountDeletion);

export default router;