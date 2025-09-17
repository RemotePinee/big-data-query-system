import { pool } from '../config/database';
import bcrypt from 'bcryptjs';

export interface User {
  id?: number;
  username: string;
  password: string;
  email?: string;
  phone?: string;
  avatar?: string;
  realName?: string;
  idCard?: string;
  balance: number;
  role: 'user' | 'admin';
  status?: 'active' | 'inactive' | 'suspended';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DeletionRequest {
  id?: number;
  userId: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestTime: Date;
  processTime?: Date;
  processedBy?: number;
  adminNote?: string;
}

export class UserModel {
  // 创建用户
  static async create(user: User): Promise<number> {
    try {
      // 密码加密
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      
      const [result]: any = await pool.execute(
        `INSERT INTO users (username, password, email, phone, avatar, balance, role) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          user.username,
          hashedPassword,
          user.email || null,
          user.phone || null,
          user.avatar || null,
          user.balance || 0,
          user.role || 'user'
        ]
      );
      
      return result.insertId;
    } catch (error) {
      console.error('创建用户失败:', error);
      throw error;
    }
  }
  
  // 通过用户名查找用户
  static async findByUsername(username: string): Promise<User | null> {
    try {
      const [rows]: any = await pool.execute(
        `SELECT id, username, password, email, phone, avatar, 
         balance, role, status, created_at as createdAt, updated_at as updatedAt 
         FROM users WHERE username = ?`,
        [username]
      );
      
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('查找用户失败:', error);
      throw error;
    }
  }

  // 通过手机号查找用户
  static async findByPhone(phone: string): Promise<User | null> {
    try {
      const [rows]: any = await pool.execute(
        `SELECT id, username, password, email, phone, avatar, 
         balance, role, status, created_at as createdAt, updated_at as updatedAt 
         FROM users WHERE phone = ?`,
        [phone]
      );
      
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('查找用户失败:', error);
      throw error;
    }
  }

  // 通过邮箱查找用户
  static async findByEmail(email: string): Promise<User | null> {
    try {
      const [rows]: any = await pool.execute(
        `SELECT id, username, password, email, phone, avatar, 
         balance, role, status, created_at as createdAt, updated_at as updatedAt 
         FROM users WHERE email = ?`,
        [email]
      );
      
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('查找用户失败:', error);
      throw error;
    }
  }
  
  // 通过ID查找用户
  static async findById(id: number): Promise<User | null> {
    try {
      const [rows]: any = await pool.execute(
        `SELECT id, username, password, email, phone, avatar, 
         balance, role, status, created_at as createdAt, updated_at as updatedAt 
         FROM users WHERE id = ?`,
        [id]
      );
      
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('查找用户失败:', error);
      throw error;
    }
  }
  
  // 更新用户信息
  static async update(id: number, userData: Partial<User>): Promise<boolean> {
    try {
      // 如果包含密码，需要加密
      if (userData.password) {
        const salt = await bcrypt.genSalt(10);
        userData.password = await bcrypt.hash(userData.password, salt);
      }
      
      // 构建更新语句
      const updateFields = Object.keys(userData).map(key => {
        // 转换驼峰命名为下划线命名
        const dbField = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        return `${dbField} = ?`;
      });
      
      const values = Object.values(userData);
      values.push(id); // 添加WHERE条件的值
      
      const [result]: any = await pool.execute(
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
        values
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('更新用户失败:', error);
      throw error;
    }
  }
  
  // 更新用户余额
  static async updateBalance(id: number, amount: number): Promise<boolean> {
    try {
      const [result]: any = await pool.execute(
        `UPDATE users SET balance = balance + ? WHERE id = ?`,
        [amount, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('更新用户余额失败:', error);
      throw error;
    }
  }
  
  // 验证密码
  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // 获取所有用户（管理员用）
  static async findAll(): Promise<User[]> {
    try {
      const [rows]: any = await pool.execute(
        `SELECT id, username, password, email, phone, avatar, 
         balance, role, status, created_at as createdAt, updated_at as updatedAt 
         FROM users ORDER BY created_at DESC`
      );
      
      return rows;
    } catch (error) {
      console.error('获取所有用户失败:', error);
      throw error;
    }
  }

  // 查找用户的待处理注销申请
  static async findPendingDeletionRequest(userId: number): Promise<DeletionRequest | null> {
    try {
      const [rows]: any = await pool.execute(
        `SELECT id, user_id as userId, reason, status, request_time as requestTime,
         process_time as processTime, processed_by as processedBy, admin_note as adminNote
         FROM user_deletion_requests 
         WHERE user_id = ? AND status = 'pending'`,
        [userId]
      );
      
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('查找注销申请失败:', error);
      throw error;
    }
  }

  // 创建注销申请
  static async createDeletionRequest(request: DeletionRequest): Promise<number> {
    try {
      const [result]: any = await pool.execute(
        `INSERT INTO user_deletion_requests (user_id, reason, status, request_time)
         VALUES (?, ?, ?, ?)`,
        [request.userId, request.reason, request.status, request.requestTime]
      );
      
      return result.insertId;
    } catch (error) {
      console.error('创建注销申请失败:', error);
      throw error;
    }
  }

  // 获取所有注销申请（管理员用）
  static async getAllDeletionRequests(): Promise<any[]> {
    try {
      const [rows]: any = await pool.execute(
        `SELECT dr.id, dr.user_id as userId, u.username, u.email, u.phone,
         dr.reason, dr.status, dr.request_time as requestTime,
         dr.process_time as processTime, dr.processed_by as processedBy,
         dr.admin_note as adminNote, admin.username as processedByName
         FROM user_deletion_requests dr
         LEFT JOIN users u ON dr.user_id = u.id
         LEFT JOIN users admin ON dr.processed_by = admin.id
         ORDER BY dr.request_time DESC`
      );
      
      return rows;
    } catch (error) {
      console.error('获取注销申请列表失败:', error);
      throw error;
    }
  }

  // 处理注销申请
  static async processDeletionRequest(
    requestId: number, 
    status: 'approved' | 'rejected', 
    processedBy: number, 
    adminNote?: string
  ): Promise<boolean> {
    try {
      const [result]: any = await pool.execute(
        `UPDATE user_deletion_requests 
         SET status = ?, process_time = NOW(), processed_by = ?, admin_note = ?
         WHERE id = ?`,
        [status, processedBy, adminNote || '', requestId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('处理注销申请失败:', error);
      throw error;
    }
  }

  // 删除用户（硬删除）
  static async delete(id: number): Promise<boolean> {
    try {
      // 先删除用户相关的订单记录
      await pool.execute(
        `DELETE FROM orders WHERE user_id = ?`,
        [id]
      );
      
      // 再删除用户记录
      const [result]: any = await pool.execute(
        `DELETE FROM users WHERE id = ?`,
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('删除用户失败:', error);
      throw error;
    }
  }
}