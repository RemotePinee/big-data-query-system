import { pool } from '../../src/config/database';
import jwt from 'jsonwebtoken';

export class TestHelpers {
  // 创建测试用户token
  static createTestToken(userId: number, role: string = 'user'): string {
    return jwt.sign(
      { id: userId, role },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '1h' }
    );
  }

  // 创建测试数据库连接
  static async getTestConnection() {
    return await pool.getConnection();
  }

  // 清理测试数据
  static async cleanupTestData() {
    const connection = await pool.getConnection();
    try {
      await connection.execute('DELETE FROM users WHERE username LIKE "test_%"');
      await connection.execute('DELETE FROM orders WHERE id > 1000');
      await connection.execute('DELETE FROM query_items WHERE id > 1000');
    } finally {
      connection.release();
    }
  }

  // 创建测试用户
  static async createTestUser(username: string = 'test_user') {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)',
        [username, 'test_password', `${username}@test.com`, 'user']
      );
      return (result as any).insertId;
    } finally {
      connection.release();
    }
  }

  // 创建测试订单
  static async createTestOrder(userId: number, amount: number = 10.00) {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        'INSERT INTO orders (user_id, amount, status, order_no) VALUES (?, ?, ?, ?)',
        [userId, amount, 'pending', `TEST_${Date.now()}`]
      );
      return (result as any).insertId;
    } finally {
      connection.release();
    }
  }

  // 模拟HTTP请求
  static mockRequest(overrides: any = {}) {
    return {
      body: {},
      params: {},
      query: {},
      headers: {},
      user: null,
      ...overrides
    };
  }

  // 模拟HTTP响应
  static mockResponse() {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
  }
}

