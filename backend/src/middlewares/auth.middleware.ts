import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

// 扩展Request接口，添加user属性
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// 验证用户是否已登录
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    // 从请求头获取token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        code: 401,
        message: '未提供认证令牌'
      });
    }
    
    // 提取token
    const token = authHeader.split(' ')[1];
    
    try {
      // 验证token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // 将解码后的用户信息添加到请求对象
      req.user = decoded;
      
      next();
    } catch (jwtError: any) {
      return res.status(401).json({
        code: 401,
        message: '认证失败，无效的令牌',
        error: jwtError.message
      });
    }
  } catch (error) {
    console.error('认证中间件异常:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器错误，认证失败'
    });
  }
};

// 验证用户是否为管理员
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        code: 401,
        message: '未认证的用户'
      });
    }
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: '权限不足，需要管理员权限'
      });
    }
    
    next();
  } catch (error) {
    console.error('权限验证失败:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器错误，权限验证失败'
    });
  }
};

// 为了兼容性，导出authMiddleware别名
export const authMiddleware = authenticate;
