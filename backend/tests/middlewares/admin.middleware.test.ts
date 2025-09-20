import { Request, Response, NextFunction } from 'express';
import { adminMiddleware, AuthenticatedRequest } from '../../src/middlewares/admin.middleware';
import { logger } from '../../src/utils/logger';

// Mock logger
jest.mock('../../src/utils/logger', () => ({
  logger: {
    error: jest.fn()
  }
}));

describe('Admin Middleware', () => {
  let req: Partial<AuthenticatedRequest>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  describe('successful admin access', () => {
    it('should call next() when user is authenticated admin', () => {
      req.user = {
        id: 1,
        username: 'admin',
        role: 'admin'
      };

      adminMiddleware(req as AuthenticatedRequest, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should handle admin user with different id and username', () => {
      req.user = {
        id: 999,
        username: 'superadmin',
        role: 'admin'
      };

      adminMiddleware(req as AuthenticatedRequest, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('authentication failures', () => {
    it('should return 401 when user is not authenticated (no user)', () => {
      req.user = undefined;

      adminMiddleware(req as AuthenticatedRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        code: 401,
        message: '未授权访问'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when user is null', () => {
      req.user = null as any;

      adminMiddleware(req as AuthenticatedRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        code: 401,
        message: '未授权访问'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('authorization failures', () => {
    it('should return 403 when user is not admin (regular user)', () => {
      req.user = {
        id: 1,
        username: 'user',
        role: 'user'
      };

      adminMiddleware(req as AuthenticatedRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        code: 403,
        message: '需要管理员权限'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 when user has moderator role', () => {
      req.user = {
        id: 2,
        username: 'moderator',
        role: 'moderator'
      };

      adminMiddleware(req as AuthenticatedRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        code: 403,
        message: '需要管理员权限'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 when user has empty role', () => {
      req.user = {
        id: 3,
        username: 'user',
        role: ''
      };

      adminMiddleware(req as AuthenticatedRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        code: 403,
        message: '需要管理员权限'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 when user role is undefined', () => {
      req.user = {
        id: 4,
        username: 'user',
        role: undefined as any
      };

      adminMiddleware(req as AuthenticatedRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        code: 403,
        message: '需要管理员权限'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should be case sensitive for admin role', () => {
      req.user = {
        id: 5,
        username: 'user',
        role: 'Admin' // Capital A
      };

      adminMiddleware(req as AuthenticatedRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        code: 403,
        message: '需要管理员权限'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject admin role with spaces', () => {
      req.user = {
        id: 6,
        username: 'user',
        role: ' admin ' // With spaces
      };

      adminMiddleware(req as AuthenticatedRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        code: 403,
        message: '需要管理员权限'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should return 500 when error occurs during authentication check', () => {
      // Create a mock request that throws when accessing user property
      const problematicReq = {};
      Object.defineProperty(problematicReq, 'user', {
        get() {
          throw new Error('Property access error');
        }
      });

      adminMiddleware(problematicReq as AuthenticatedRequest, res as Response, next);

      expect(logger.error).toHaveBeenCalledWith('管理员权限验证失败', {
        error: 'Property access error'
      });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        code: 500,
        message: '服务器内部错误'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle errors thrown during role checking', () => {
      // Create a user object that throws when accessing role property
      const problematicUser = { id: 1, username: 'admin' };
      Object.defineProperty(problematicUser, 'role', {
        get() {
          throw new Error('Role access error');
        }
      });
      
      req.user = problematicUser as any;

      adminMiddleware(req as AuthenticatedRequest, res as Response, next);

      expect(logger.error).toHaveBeenCalledWith('管理员权限验证失败', {
        error: 'Role access error'
      });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        code: 500,
        message: '服务器内部错误'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle non-Error exceptions', () => {
      // Create a request that throws a string when accessing user
      const problematicReq = {};
      Object.defineProperty(problematicReq, 'user', {
        get() {
          throw 'String error';
        }
      });

      adminMiddleware(problematicReq as AuthenticatedRequest, res as Response, next);

      expect(logger.error).toHaveBeenCalledWith('管理员权限验证失败', {
        error: 'String error'
      });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        code: 500,
        message: '服务器内部错误'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle user object with missing properties', () => {
      req.user = {
        id: 1,
        username: 'admin'
        // role is missing
      } as any;

      adminMiddleware(req as AuthenticatedRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        code: 403,
        message: '需要管理员权限'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle user object with null role', () => {
      req.user = {
        id: 1,
        username: 'admin',
        role: null as any
      };

      adminMiddleware(req as AuthenticatedRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        code: 403,
        message: '需要管理员权限'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle user object with numeric role', () => {
      req.user = {
        id: 1,
        username: 'admin',
        role: 1 as any // numeric role
      };

      adminMiddleware(req as AuthenticatedRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        code: 403,
        message: '需要管理员权限'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle user object with boolean role', () => {
      req.user = {
        id: 1,
        username: 'admin',
        role: true as any // boolean role
      };

      adminMiddleware(req as AuthenticatedRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        code: 403,
        message: '需要管理员权限'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('response chain verification', () => {
    it('should ensure response methods are called in correct order', () => {
      req.user = undefined;

      adminMiddleware(req as AuthenticatedRequest, res as Response, next);

      // Verify that status was called before json
      const statusMock = res.status as jest.Mock;
      const jsonMock = res.json as jest.Mock;
      expect(statusMock.mock.invocationCallOrder[0]).toBeLessThan(jsonMock.mock.invocationCallOrder[0]);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        code: 401,
        message: '未授权访问'
      });
    });

    it('should ensure status and json are called exactly once for auth failure', () => {
      req.user = null as any;

      adminMiddleware(req as AuthenticatedRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledTimes(0);
    });

    it('should ensure status and json are called exactly once for authz failure', () => {
      req.user = {
        id: 1,
        username: 'user',
        role: 'user'
      };

      adminMiddleware(req as AuthenticatedRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledTimes(0);
    });

    it('should ensure next is called exactly once for success', () => {
      req.user = {
        id: 1,
        username: 'admin',
        role: 'admin'
      };

      adminMiddleware(req as AuthenticatedRequest, res as Response, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledTimes(0);
      expect(res.json).toHaveBeenCalledTimes(0);
    });
  });

  describe('integration scenarios', () => {
    it('should work correctly in middleware chain', () => {
      const middlewareChain = [
        (req: any, res: any, next: any) => {
          req.user = { id: 1, username: 'admin', role: 'admin' };
          next();
        },
        adminMiddleware,
        (req: any, res: any, next: any) => {
          res.json({ success: true });
        }
      ];

      let currentIndex = 0;
      const mockNext = jest.fn(() => {
        currentIndex++;
        if (currentIndex < middlewareChain.length) {
          middlewareChain[currentIndex](req as AuthenticatedRequest, res as Response, mockNext);
        }
      });

      middlewareChain[0](req as AuthenticatedRequest, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(2); // Called by first middleware and adminMiddleware
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('should stop middleware chain on authentication failure', () => {
      req.user = undefined; // No authenticated user

      adminMiddleware(req as AuthenticatedRequest, res as Response, next);

      expect(next).toHaveBeenCalledTimes(0); // Should not proceed to next middleware
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        code: 401,
        message: '未授权访问'
      });
    });

    it('should stop middleware chain on authorization failure', () => {
      req.user = { id: 1, username: 'user', role: 'user' }; // Not admin

      adminMiddleware(req as AuthenticatedRequest, res as Response, next);

      expect(next).toHaveBeenCalledTimes(0); // Should not proceed to next middleware
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        code: 403,
        message: '需要管理员权限'
      });
    });
  });
});
