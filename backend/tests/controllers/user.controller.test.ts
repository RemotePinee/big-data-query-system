import { Request, Response } from 'express';
import { UserController } from '../../src/controllers/user.controller';
import { TestHelpers } from '../utils/test-helpers';

// Mock UserModel to avoid database dependencies
jest.mock('../../src/models/user.model', () => ({
  UserModel: {
    findByUsername: jest.fn(),
    findByPhone: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
  }
}));

import { UserModel } from '../../src/models/user.model';

describe('UserController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockReq = TestHelpers.mockRequest();
    mockRes = TestHelpers.mockResponse();
    
    // 清除所有mock调用
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should return error for missing required fields', async () => {
      mockReq.body = {
        username: '',
        password: '',
        phone: ''
      };

      await UserController.register(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 400,
          message: '用户名、密码和手机号为必填项'
        })
      );
    });

    it('should return error for invalid phone format', async () => {
      mockReq.body = {
        username: 'testuser',
        password: 'password123',
        phone: '123456789' // 无效手机号
      };

      await UserController.register(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 400,
          message: '手机号格式不正确'
        })
      );
    });

    it('should return error for existing username', async () => {
      // Mock existing user
      (UserModel.findByUsername as jest.Mock).mockResolvedValue({ id: 1, username: 'testuser' });
      (UserModel.findByPhone as jest.Mock).mockResolvedValue(null);

      mockReq.body = {
        username: 'testuser',
        password: 'password123',
        phone: '13800138000'
      };

      await UserController.register(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 400,
          message: '用户名已存在'
        })
      );
    });

    it('should register successfully with valid data', async () => {
      // Mock no existing user
      (UserModel.findByUsername as jest.Mock).mockResolvedValue(null);
      (UserModel.findByPhone as jest.Mock).mockResolvedValue(null);
      (UserModel.create as jest.Mock).mockResolvedValue({ id: 1, username: 'testuser' });

      mockReq.body = {
        username: 'testuser',
        password: 'password123',
        phone: '13800138000',
        email: 'test@example.com'
      };

      await UserController.register(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 201,
          message: expect.stringContaining('注册成功')
        })
      );
    });
  });

  describe('login', () => {
    it('should return error for missing credentials', async () => {
      mockReq.body = {};

      await UserController.login(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 400,
          message: '用户名和密码为必填项'
        })
      );
    });

    it('should return error for non-existent user', async () => {
      (UserModel.findByUsername as jest.Mock).mockResolvedValue(null);

      mockReq.body = {
        username: 'nonexistent',
        password: 'password123'
      };

      await UserController.login(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 401,
          message: '用户名或密码错误'
        })
      );
    });
  });

  describe('getUserInfo', () => {
    it('should return error for unauthenticated request', async () => {
      mockReq.user = null;

      await UserController.getUserInfo(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 401,
          message: '用户未认证'
        })
      );
    });

    it('should return user info for authenticated user', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        phone: '13800138000',
        balance: 0,
        role: 'user'
      };

      (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);
      mockReq.user = { id: 1, username: 'testuser', role: 'user' };

      await UserController.getUserInfo(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 200,
          data: expect.objectContaining({
            id: 1,
            username: 'testuser'
          })
        })
      );
    });
  });
});

