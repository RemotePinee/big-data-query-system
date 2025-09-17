import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
  };
}

export class AdminController {
  // 获取所有用户（管理员专用）
  static async getUsers(req: AuthRequest, res: Response) {
    try {
      const { page = 1, limit = 20, keyword = '', role = '' } = req.query;
      
      // 验证管理员权限
      if (req.user?.role !== 'admin') {
        return res.status(403).json({
          code: 403,
          message: '权限不足'
        });
      }

      const users = await UserModel.findAll();
      
      // 过滤用户
      let filteredUsers = users.filter(user => {
        const matchKeyword = !keyword || 
          user.username.toLowerCase().includes(keyword.toString().toLowerCase()) ||
          (user.phone && user.phone.includes(keyword.toString())) ||
          (user.email && user.email.toLowerCase().includes(keyword.toString().toLowerCase()));
        
        const matchRole = !role || user.role === role;
        
        return matchKeyword && matchRole;
      });

      // 分页
      const total = filteredUsers.length;
      const startIndex = (Number(page) - 1) * Number(limit);
      const endIndex = startIndex + Number(limit);
      const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

      // 移除密码字段
      const safeUsers = paginatedUsers.map(user => {
        const { password, ...safeUser } = user;
        return safeUser;
      });

      res.json({
        code: 200,
        message: '获取用户列表成功',
        data: {
          users: safeUsers,
          total,
          page: Number(page),
          limit: Number(limit)
        }
      });
    } catch (error) {
      console.error('获取用户列表失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取用户列表失败'
      });
    }
  }

  // 更新用户状态
  static async updateUserStatus(req: AuthRequest, res: Response) {
    try {
      // 验证管理员权限
      if (req.user?.role !== 'admin') {
        return res.status(403).json({
          code: 403,
          message: '权限不足'
        });
      }

      const { id } = req.params;
      const { status } = req.body;

      // 验证状态值
      if (!['active', 'inactive', 'suspended'].includes(status)) {
        return res.status(400).json({
          code: 400,
          message: '无效的状态值'
        });
      }

      // 检查用户是否存在
      const user = await UserModel.findById(Number(id));
      if (!user) {
        return res.status(404).json({
          code: 404,
          message: '用户不存在'
        });
      }

      // 不能禁用自己
      if (user.id === req.user?.id && status !== 'active') {
        return res.status(400).json({
          code: 400,
          message: '不能禁用自己的账户'
        });
      }

      // 更新用户状态
      const success = await UserModel.update(Number(id), { status });
      
      if (success) {
        res.json({
          code: 200,
          message: '用户状态更新成功'
        });
      } else {
        res.status(500).json({
          code: 500,
          message: '用户状态更新失败'
        });
      }
    } catch (error) {
      console.error('更新用户状态失败:', error);
      res.status(500).json({
        code: 500,
        message: '更新用户状态失败'
      });
    }
  }

  // 删除用户
  static async deleteUser(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      
      // 验证管理员权限
      if (req.user?.role !== 'admin') {
        return res.status(403).json({
          code: 403,
          message: '权限不足'
        });
      }

      // 不能删除自己
      if (Number(id) === req.user.id) {
        return res.status(400).json({
          code: 400,
          message: '不能删除自己的账户'
        });
      }

      const user = await UserModel.findById(Number(id));
      if (!user) {
        return res.status(404).json({
          code: 404,
          message: '用户不存在'
        });
      }

      // 真正删除用户数据
      const success = await UserModel.delete(Number(id));
      
      if (success) {
        res.json({
          code: 200,
          message: '用户删除成功'
        });
      } else {
        res.status(500).json({
          code: 500,
          message: '删除用户失败'
        });
      }
    } catch (error) {
      console.error('删除用户失败:', error);
      res.status(500).json({
        code: 500,
        message: '删除用户失败'
      });
    }
  }

  // 获取注销申请列表
  static async getDeletionRequests(req: AuthRequest, res: Response) {
    try {
      // 验证管理员权限
      if (req.user?.role !== 'admin') {
        return res.status(403).json({
          code: 403,
          message: '权限不足'
        });
      }

      const { page = 1, limit = 20, keyword = '', status = '' } = req.query;
      
      const allRequests = await UserModel.getAllDeletionRequests();
      
      // 过滤申请
      let filteredRequests = allRequests.filter(request => {
        const matchKeyword = !keyword || 
          request.username?.toLowerCase().includes(keyword.toString().toLowerCase()) ||
          (request.phone && request.phone.includes(keyword.toString())) ||
          (request.email && request.email.toLowerCase().includes(keyword.toString().toLowerCase()));
        
        const matchStatus = !status || request.status === status;
        
        return matchKeyword && matchStatus;
      });

      // 分页
      const total = filteredRequests.length;
      const startIndex = (Number(page) - 1) * Number(limit);
      const endIndex = startIndex + Number(limit);
      const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

      res.json({
        code: 200,
        message: '获取注销申请列表成功',
        data: {
          requests: paginatedRequests,
          total,
          page: Number(page),
          limit: Number(limit)
        }
      });
    } catch (error) {
      console.error('获取注销申请列表失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取注销申请列表失败'
      });
    }
  }

  // 处理注销申请
  static async processDeletionRequest(req: AuthRequest, res: Response) {
    try {
      // 验证管理员权限
      if (req.user?.role !== 'admin') {
        return res.status(403).json({
          code: 403,
          message: '权限不足'
        });
      }

      const { requestId, status, adminNote } = req.body;
      
      if (!requestId || !status || !['approved', 'rejected'].includes(status)) {
        return res.status(400).json({
          code: 400,
          message: '参数错误'
        });
      }

      const success = await UserModel.processDeletionRequest(
        requestId,
        status,
        req.user.id,
        adminNote
      );

      if (success) {
        res.json({
          code: 200,
          message: `申请${status === 'approved' ? '通过' : '拒绝'}成功`
        });
      } else {
        res.status(400).json({
          code: 400,
          message: '处理申请失败'
        });
      }
    } catch (error) {
      console.error('处理注销申请失败:', error);
      res.status(500).json({
        code: 500,
        message: '处理注销申请失败'
      });
    }
  }

  // 获取系统统计
  static async getSystemStats(req: AuthRequest, res: Response) {
    try {
      // 验证管理员权限
      if (req.user?.role !== 'admin') {
        return res.status(403).json({
          code: 403,
          message: '权限不足'
        });
      }

      const users = await UserModel.findAll();
      const deletionRequests = await UserModel.getAllDeletionRequests();
      
      const stats = {
        totalUsers: users.length,
        activeUsers: users.filter(user => user.role === 'user').length,
        adminUsers: users.filter(user => user.role === 'admin').length,
        pendingDeletionRequests: deletionRequests.filter(req => req.status === 'pending').length,
        approvedDeletionRequests: deletionRequests.filter(req => req.status === 'approved').length,
        rejectedDeletionRequests: deletionRequests.filter(req => req.status === 'rejected').length
      };

      res.json({
        code: 200,
        message: '获取系统统计成功',
        data: stats
      });
    } catch (error) {
      console.error('获取系统统计失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取系统统计失败'
      });
    }
  }
}