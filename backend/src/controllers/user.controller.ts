import { Request, Response } from 'express';
import { User, UserModel } from '../models/user.model';
import jwt, { SignOptions } from 'jsonwebtoken';
import { StringValue } from 'ms';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET: string = process.env.JWT_SECRET || 'default_secret_key';
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d';

export class UserController {
  // 用户注册
  static async register(req: Request, res: Response) {
    try {
      const { username, password, email, phone } = req.body;
      
      // 验证必填字段
      if (!username || !password || !phone) {
        return res.status(400).json({
          code: 400,
          message: '用户名、密码和手机号为必填项'
        });
      }
      
      // 验证手机号格式
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({
          code: 400,
          message: '手机号格式不正确'
        });
      }
      
      // 检查用户名是否已存在
      const existingUser = await UserModel.findByUsername(username);
      if (existingUser) {
        return res.status(400).json({
          code: 400,
          message: '用户名已存在'
        });
      }
      
      // 检查手机号是否已存在
      const existingPhone = await UserModel.findByPhone(phone);
      if (existingPhone) {
        return res.status(400).json({
          code: 400,
          message: '手机号已被注册'
        });
      }
      
      // 创建新用户
      const newUser: User = {
        username,
        password,
        email,
        phone,
        balance: 0,
        role: 'user'
      };
      
      const userId = await UserModel.create(newUser);
      
      // 注册成功后自动生成JWT令牌
      const payload = {
        id: userId,
        username: username,
        role: 'user'
      };
      
      const signOptions: SignOptions = {
        expiresIn: JWT_EXPIRES_IN as StringValue
      };
      
      const token = jwt.sign(payload, JWT_SECRET, signOptions);
      
      res.status(201).json({
        code: 201,
        message: '注册成功',
        data: {
          token,
          user: {
            id: userId,
            username,
            email,
            phone,
            balance: 0,
            role: 'user'
          }
        }
      });
    } catch (error) {
      console.error('注册失败:', error);
      res.status(500).json({
        code: 500,
        message: '服务器错误，注册失败'
      });
    }
  }
  
  // 用户登录
  static async login(req: Request, res: Response) {
    try {
      console.log('收到登录请求:', req.body);
      const { username, password } = req.body;
      
      // 验证必填字段
      if (!username || !password) {
        console.log('登录失败: 缺少必填字段');
        return res.status(400).json({
          code: 400,
          message: '用户名和密码为必填项'
        });
      }
      
      // 查找用户
      const user = await UserModel.findByUsername(username);
      if (!user) {
        return res.status(401).json({
          code: 401,
          message: '用户名或密码错误'
        });
      }
      
      // 检查用户状态
      if (user.status && user.status !== 'active') {
        let message = '账户已被禁用';
        if (user.status === 'suspended') {
          message = '账户已被暂停，请联系管理员';
        } else if (user.status === 'inactive') {
          message = '账户已被停用，请联系管理员';
        }
        return res.status(403).json({
          code: 403,
          message
        });
      }

      // 验证密码
      const isPasswordValid = await UserModel.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          code: 401,
          message: '用户名或密码错误'
        });
      }
      
      // 生成JWT令牌
      const payload = {
        id: user.id,
        username: user.username,
        role: user.role
      };
      
      const signOptions: SignOptions = {
        expiresIn: JWT_EXPIRES_IN as StringValue
      };
      
      const token = jwt.sign(payload, JWT_SECRET, signOptions);
      
      res.status(200).json({
        code: 200,
        message: '登录成功',
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            phone: user.phone,
            balance: user.balance,
            role: user.role
          }
        }
      });
    } catch (error) {
      console.error('登录失败:', error);
      res.status(500).json({
        code: 500,
        message: '服务器错误，登录失败'
      });
    }
  }
  
  // 获取用户信息
  static async getUserInfo(req: Request, res: Response) {
    try {
      // 从请求中获取用户ID（通过auth中间件设置）
      const userId = (req as any).user.id;
      
      // 查找用户
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          code: 404,
          message: '用户不存在'
        });
      }
      
      // 返回用户信息（不包含密码）
      const { password, ...userInfo } = user;
      
      res.status(200).json({
        code: 200,
        message: '获取用户信息成功',
        data: userInfo
      });
    } catch (error) {
      console.error('获取用户信息失败:', error);
      res.status(500).json({
        code: 500,
        message: '服务器错误，获取用户信息失败'
      });
    }
  }
  
  // 更新用户信息
  static async updateUserInfo(req: Request, res: Response) {
    try {
      // 从请求中获取用户ID（通过auth中间件设置）
      const userId = (req as any).user.id;
      
      // 获取要更新的字段
      const { username, email, phone, avatar } = req.body;
      
      // 如果要更新用户名，检查是否已存在
      if (username !== undefined) {
        const existingUser = await UserModel.findByUsername(username);
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({
            code: 400,
            message: '用户名已存在'
          });
        }
      }
      
      // 如果要更新手机号，检查是否已存在
      if (phone !== undefined) {
        const existingPhone = await UserModel.findByPhone(phone);
        if (existingPhone && existingPhone.id !== userId) {
          return res.status(400).json({
            code: 400,
            message: '手机号已被注册'
          });
        }
      }
      
      // 如果要更新邮箱，检查是否已存在
      if (email !== undefined) {
        const existingEmail = await UserModel.findByEmail(email);
        if (existingEmail && existingEmail.id !== userId) {
          return res.status(400).json({
            code: 400,
            message: '邮箱已被注册'
          });
        }
      }
      
      // 构建更新对象
      const updateData: Partial<User> = {};
      if (username !== undefined) updateData.username = username;
      if (email !== undefined) updateData.email = email;
      if (phone !== undefined) updateData.phone = phone;
      if (avatar !== undefined) updateData.avatar = avatar;
      
      // 如果没有要更新的字段
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          code: 400,
          message: '没有提供要更新的字段'
        });
      }
      
      // 更新用户信息
      const success = await UserModel.update(userId, updateData);
      if (!success) {
        return res.status(404).json({
          code: 404,
          message: '用户不存在或更新失败'
        });
      }
      
      // 获取更新后的用户信息
      const updatedUser = await UserModel.findById(userId);
      
      res.status(200).json({
        code: 200,
        message: '更新用户信息成功',
        data: {
          id: updatedUser?.id,
          username: updatedUser?.username,
          email: updatedUser?.email,
          phone: updatedUser?.phone,
          realName: updatedUser?.realName,
          idCard: updatedUser?.idCard
        }
      });
    } catch (error) {
      console.error('更新用户信息失败:', error);
      res.status(500).json({
        code: 500,
        message: '服务器错误，更新用户信息失败'
      });
    }
  }
  
  // 修改密码
  static async changePassword(req: Request, res: Response) {
    try {
      // 从请求中获取用户ID（通过auth中间件设置）
      const userId = (req as any).user.id;
      
      const { oldPassword, newPassword } = req.body;
      
      // 验证必填字段
      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          code: 400,
          message: '旧密码和新密码为必填项'
        });
      }
      
      // 查找用户
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          code: 404,
          message: '用户不存在'
        });
      }
      
      // 验证旧密码
      const isPasswordValid = await UserModel.verifyPassword(oldPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          code: 401,
          message: '旧密码错误'
        });
      }
      
      // 更新密码
      const success = await UserModel.update(userId, { password: newPassword });
      if (!success) {
        return res.status(500).json({
          code: 500,
          message: '修改密码失败'
        });
      }
      
      res.status(200).json({
        code: 200,
        message: '修改密码成功'
      });
    } catch (error) {
      console.error('修改密码失败:', error);
      res.status(500).json({
        code: 500,
        message: '服务器错误，修改密码失败'
      });
    }
  }

  // 获取用户统计信息
  static async getUserStats(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      
      // 获取用户基本信息
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          code: 404,
          message: '用户不存在'
        });
      }
      
      // 获取用户的所有订单来统计查询次数
      const { OrderModel } = require('../models/order.model');
      const userOrders = await OrderModel.findByUserId(userId);
      
      // 统计查询次数（已支付的订单）
      const totalQueries = userOrders.filter((order: any) => order.status === 'paid').length;
      
      // 统计已完成的查询（有查询结果的订单）
      const completedQueries = userOrders.filter((order: any) => 
        order.status === 'paid' && order.queryResult
      ).length;
      
      // 获取真实的用户余额
      const balance = user.balance || 0;
      
      const stats = {
        totalQueries,             // 总查询次数（已支付订单数）
        balance,                  // 账户余额（从用户表获取）
        completedQueries,         // 已完成查询数
        totalOrders: userOrders.length,  // 总订单数
        level: 'VIP'              // 用户等级
      };
      
      res.status(200).json({
        code: 200,
        message: '获取用户统计成功',
        data: stats
      });
    } catch (error) {
      console.error('获取用户统计失败:', error);
      res.status(500).json({
        code: 500,
        message: '服务器错误，获取用户统计失败'
      });
    }
  }

  // 获取未读消息数量
  static async getUnreadCount(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      
      // 这里可以从数据库查询真实的未读消息数量
      // 暂时返回模拟数据
      const unreadCount = {
        count: 2
      };
      
      res.status(200).json({
        code: 200,
        message: '获取未读消息数量成功',
        data: unreadCount
      });
    } catch (error) {
      console.error('获取未读消息数量失败:', error);
      res.status(500).json({
        code: 500,
        message: '服务器错误，获取未读消息数量失败'
      });
    }
  }

  // 获取登录记录
  static async getLoginRecords(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { page = 1, limit = 10 } = req.query;
      
      // 模拟登录记录数据（实际项目中应从数据库获取）
      const mockLoginRecords = [
        {
          id: 1,
          loginTime: new Date(Date.now() - 1000 * 60 * 30), // 30分钟前
          ip: '192.168.1.100',
          location: '北京市',
          device: 'Chrome 浏览器',
          status: 'success'
        },
        {
          id: 2,
          loginTime: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2小时前
          ip: '192.168.1.100',
          location: '北京市',
          device: 'Chrome 浏览器',
          status: 'success'
        },
        {
          id: 3,
          loginTime: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1天前
          ip: '192.168.1.101',
          location: '上海市',
          device: 'Safari 浏览器',
          status: 'success'
        },
        {
          id: 4,
          loginTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2天前
          ip: '192.168.1.102',
          location: '广州市',
          device: 'Firefox 浏览器',
          status: 'failed'
        },
        {
          id: 5,
          loginTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3天前
          ip: '192.168.1.100',
          location: '北京市',
          device: 'Chrome 浏览器',
          status: 'success'
        }
      ];
      
      // 分页处理
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const total = mockLoginRecords.length;
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      const paginatedRecords = mockLoginRecords.slice(startIndex, endIndex);
      
      res.status(200).json({
        code: 200,
        message: '获取登录记录成功',
        data: {
          list: paginatedRecords,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum)
          }
        }
      });
    } catch (error) {
      console.error('获取登录记录失败:', error);
      res.status(500).json({
        code: 500,
        message: '服务器错误，获取登录记录失败'
      });
    }
  }

  // 获取所有用户（管理员专用）
  static async getAllUsers(req: Request, res: Response) {
    try {
      // 获取所有用户
      const allUsers = await UserModel.findAll();
      
      // 格式化用户数据，移除敏感信息
      const formattedUsers = allUsers.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: 'active', // User模型中没有status字段，默认为active
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }));
      
      res.status(200).json({
        code: 200,
        message: '获取用户列表成功',
        data: formattedUsers
      });
    } catch (error) {
      console.error('获取用户列表失败:', error);
      res.status(500).json({
        code: 500,
        message: '服务器错误，获取用户列表失败'
      });
    }
  }

  // 申请账号注销
  static async requestAccountDeletion(req: Request, res: Response) {
    try {
      const { password, reason } = req.body;
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({
          code: 401,
          message: '用户未登录'
        });
      }
      
      if (!password) {
        return res.status(400).json({
          code: 400,
          message: '请输入密码确认'
        });
      }
      
      // 验证密码
      const user = await UserModel.findById(userId);
      if (!user || user.password !== password) {
        return res.status(400).json({
          code: 400,
          message: '密码错误'
        });
      }
      
      // 检查是否已有待处理的注销申请
      const existingRequest = await UserModel.findPendingDeletionRequest(userId);
      if (existingRequest) {
        return res.status(400).json({
          code: 400,
          message: '您已有待处理的注销申请，请耐心等待审核'
        });
      }
      
      // 创建注销申请记录
      await UserModel.createDeletionRequest({
        userId,
        reason: reason || '用户主动申请注销',
        status: 'pending',
        requestTime: new Date()
      });
      
      res.status(200).json({
        code: 200,
        message: '账号注销申请已提交，我们将在3个工作日内处理您的申请'
      });
    } catch (error) {
      console.error('申请账号注销失败:', error);
      res.status(500).json({
        code: 500,
        message: '服务器错误，申请提交失败'
      });
    }
  }
}
