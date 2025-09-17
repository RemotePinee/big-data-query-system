import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
  };
}

export const adminMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // 检查用户是否已通过身份验证
    if (!req.user) {
      return res.status(401).json({
        code: 401,
        message: '未授权访问'
      });
    }

    // 检查用户是否为管理员
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: '需要管理员权限'
      });
    }

    next();
  } catch (error) {
    console.error('管理员权限验证失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误'
    });
  }
};