import { pool } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Order {
  id: number;
  orderNo: string;
  userId: number;
  queryItemId: number;
  amount: number;
  status: 'pending' | 'paid' | 'processing' | 'completed' | 'failed' | 'cancelled';
  paymentMethod?: string;
  queryParams?: string;
  queryResult?: string;
  queryCount?: number;
  queryStatus?: 'not_started' | 'querying' | 'completed' | 'failed' | 'max_attempts_reached';
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
}

export class OrderModel {
  // 生成订单号
  static generateOrderNo(): string {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hour = now.getHours().toString().padStart(2, '0');
    const minute = now.getMinutes().toString().padStart(2, '0');
    const second = now.getSeconds().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `${year}${month}${day}${hour}${minute}${second}${random}`;
  }

  // 创建订单
  static async create(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO orders 
       (order_no, user_id, query_item_id, amount, status, payment_method, query_params, query_result) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        order.orderNo,
        order.userId,
        order.queryItemId,
        order.amount,
        order.status,
        order.paymentMethod || null,
        order.queryParams || null,
        order.queryResult || null
      ]
    );
    
    return result.insertId;
  }

  // 根据订单号查找订单
  static async findByOrderNo(orderNo: string): Promise<Order | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM orders WHERE order_no = ?',
      [orderNo]
    );
    
    if (rows.length === 0) {
      return null;
    }
    
    const row = rows[0];
    return {
      id: row.id,
      orderNo: row.order_no,
      userId: row.user_id,
      queryItemId: row.query_item_id,
      amount: row.amount,
      status: row.status,
      paymentMethod: row.payment_method,
      queryParams: row.query_params,
      queryResult: row.query_result,
      queryCount: row.query_count,
      queryStatus: row.query_status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      paidAt: row.paid_at
    };
  }

  // 根据ID查找订单
  static async findById(id: number): Promise<Order | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM orders WHERE id = ?',
      [id]
    );
    
    if (rows.length === 0) {
      return null;
    }
    
    const row = rows[0];
    return {
      id: row.id,
      orderNo: row.order_no,
      userId: row.user_id,
      queryItemId: row.query_item_id,
      amount: row.amount,
      status: row.status,
      paymentMethod: row.payment_method,
      queryParams: row.query_params,
      queryResult: row.query_result,
      queryStatus: row.query_status,
      queryCount: row.query_count,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      paidAt: row.paid_at
    };
  }

  // 根据用户ID查找订单
  static async findByUserId(userId: number): Promise<Order[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    
    return rows.map(row => ({
      id: row.id,
      orderNo: row.order_no,
      userId: row.user_id,
      queryItemId: row.query_item_id,
      amount: row.amount,
      status: row.status,
      paymentMethod: row.payment_method,
      queryParams: row.query_params,
      queryResult: row.query_result,
      queryCount: row.query_count,
      queryStatus: row.query_status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      paidAt: row.paid_at
    }));
  }

  // 更新订单状态（根据ID）
  static async updateStatus(id: number, status: Order['status']): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE orders SET status = ?, updated_at = NOW(), paid_at = CASE WHEN ? = "paid" THEN NOW() ELSE paid_at END WHERE id = ?',
      [status, status, id]
    );
    
    return result.affectedRows > 0;
  }

  // 更新订单状态（根据订单号）
  static async updateStatusByOrderNo(orderNo: string, status: Order['status']): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE orders SET status = ?, updated_at = NOW(), paid_at = CASE WHEN ? = "paid" THEN NOW() ELSE paid_at END WHERE order_no = ?',
      [status, status, orderNo]
    );
    
    return result.affectedRows > 0;
  }

  // 更新支付方式
  static async updatePaymentMethod(id: number, paymentMethod: string): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE orders SET payment_method = ?, updated_at = NOW() WHERE id = ?',
      [paymentMethod, id]
    );
    
    return result.affectedRows > 0;
  }

  // 更新查询结果
  static async updateQueryResult(id: number, queryResult: string): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE orders SET query_result = ?, updated_at = NOW() WHERE id = ?',
      [queryResult, id]
    );
    
    return result.affectedRows > 0;
  }

  // 更新查询状态和次数
  static async updateQueryStatus(id: number, queryStatus: Order['queryStatus'], queryCount?: number): Promise<boolean> {
    let sql = 'UPDATE orders SET query_status = ?, updated_at = NOW()';
    let params: any[] = [queryStatus];
    
    if (queryCount !== undefined) {
      sql += ', query_count = ?';
      params.push(queryCount);
    }
    
    sql += ' WHERE id = ?';
    params.push(id);
    
    const [result] = await pool.execute<ResultSetHeader>(sql, params);
    return result.affectedRows > 0;
  }

  // 增加查询次数
  static async incrementQueryCount(id: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE orders SET query_count = query_count + 1, updated_at = NOW() WHERE id = ?',
      [id]
    );
    
    return result.affectedRows > 0;
  }

  // 根据查询状态查找订单
  static async findByQueryStatus(queryStatus: Order['queryStatus']): Promise<Order[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM orders WHERE query_status = ?',
      [queryStatus]
    );
    return rows as Order[];
  }

  // 获取所有订单（管理员用）
  static async findAll(): Promise<Order[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM orders ORDER BY created_at DESC'
    );
    
    return rows.map(row => ({
      id: row.id,
      orderNo: row.order_no,
      userId: row.user_id,
      queryItemId: row.query_item_id,
      amount: row.amount,
      status: row.status,
      paymentMethod: row.payment_method,
      queryParams: row.query_params,
      queryResult: row.query_result,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      paidAt: row.paid_at
    }));
  }

  // 根据查询项目ID查找订单
  static async findByQueryItemId(queryItemId: number): Promise<Order[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM orders WHERE query_item_id = ? ORDER BY created_at DESC',
      [queryItemId]
    );
    
    return rows.map(row => ({
      id: row.id,
      orderNo: row.order_no,
      userId: row.user_id,
      queryItemId: row.query_item_id,
      amount: row.amount,
      status: row.status,
      paymentMethod: row.payment_method,
      queryParams: row.query_params,
      queryResult: row.query_result,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      paidAt: row.paid_at
    }));
  }

  // 删除订单
  static async delete(id: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM orders WHERE id = ?',
      [id]
    );
    
    return result.affectedRows > 0;
  }

  // 检查查询结果是否过期（7天）
  static async isQueryResultExpired(id: number): Promise<boolean> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT created_at, query_result 
       FROM orders 
       WHERE id = ? 
       AND query_result IS NOT NULL 
       AND query_result != ''`,
      [id]
    );
    
    if (rows.length === 0) {
      return false; // 没有查询结果或订单不存在
    }
    
    const createdAt = new Date(rows[0].created_at);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    
    return diffDays >= 7;
  }

  // 获取查询结果剩余天数
  static async getQueryResultRemainingDays(id: number): Promise<number | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT created_at, query_result 
       FROM orders 
       WHERE id = ? 
       AND query_result IS NOT NULL 
       AND query_result != ''`,
      [id]
    );
    
    if (rows.length === 0) {
      return null; // 没有查询结果或订单不存在
    }
    
    const createdAt = new Date(rows[0].created_at);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    const remainingDays = 7 - diffDays;
    
    return Math.max(0, remainingDays);
  }
}