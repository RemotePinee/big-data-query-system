import { Request, Response, NextFunction } from 'express';
import { authenticate, isAdmin } from '../../src/middlewares/auth.middleware';
import jwt from 'jsonwebtoken';

// Mock jwt
jest.mock('jsonwebtoken');
const mockedJwt = jwt as jest.Mocked<typeof jwt>;

describe('Auth Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should return 401 if no authorization header', () => {
      authenticate(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        code: 401,
        message: '未提供认证令牌'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if authorization header does not start with Bearer', () => {
      mockReq.headers = { authorization: 'Invalid token' };

      authenticate(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        code: 401,
        message: '未提供认证令牌'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', () => {
      mockReq.headers = { authorization: 'Bearer invalid_token' };
      mockedJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      authenticate(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        code: 401,
        message: '认证失败，无效的令牌',
        error: 'Invalid token'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next if token is valid', () => {
      const mockUser = { id: 1, username: 'testuser', role: 'user' };
      mockReq.headers = { authorization: 'Bearer valid_token' };
      mockedJwt.verify.mockReturnValue(mockUser as any);

      authenticate(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });

  describe('isAdmin', () => {
    it('should return 401 if user is not authenticated', () => {
      mockReq.user = null;

      isAdmin(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        code: 401,
        message: '未认证的用户'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 if user is not admin', () => {
      mockReq.user = { id: 1, username: 'testuser', role: 'user' };

      isAdmin(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        code: 403,
        message: '权限不足，需要管理员权限'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next if user is admin', () => {
      mockReq.user = { id: 1, username: 'admin', role: 'admin' };

      isAdmin(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });
});
