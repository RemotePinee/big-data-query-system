import { pool } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface PaymentConfig {
  id: number;
  name: string;
  code: string;
  type: string;
  appId?: string;
  merchantId?: string;
  apiKey?: string;
  appSecret?: string;
  apiUrl?: string;
  notifyUrl?: string;
  returnUrl?: string;
  isActive: boolean;
  paymentMode?: 'qrcode' | 'redirect'; // 支付模式：扫码模式或跳转模式
  createdAt: Date;
  updatedAt: Date;
}

export class PaymentConfigModel {
  // 查找所有激活的支付配置
  static async findAllActive(): Promise<PaymentConfig[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM payment_configs WHERE is_active = 1 ORDER BY id ASC'
    );
    
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      code: row.code,
      type: row.type,
      appId: row.app_id,
      merchantId: row.merchant_id,
      apiKey: row.api_key,
      appSecret: row.app_secret,
      apiUrl: row.api_url,
      notifyUrl: row.notify_url,
      returnUrl: row.return_url,
      isActive: Boolean(row.is_active),
      paymentMode: row.payment_mode,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  // 查找所有支付配置
  static async findAll(): Promise<PaymentConfig[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM payment_configs ORDER BY id ASC'
    );
    
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      code: row.code,
      type: row.type,
      appId: row.app_id,
      merchantId: row.merchant_id,
      apiKey: row.api_key,
      appSecret: row.app_secret,
      apiUrl: row.api_url,
      notifyUrl: row.notify_url,
      returnUrl: row.return_url,
      isActive: Boolean(row.is_active),
      paymentMode: row.payment_mode,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  // 根据ID查找支付配置
  static async findById(id: number): Promise<PaymentConfig | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM payment_configs WHERE id = ?',
      [id]
    );
    
    if (rows.length === 0) {
      return null;
    }
    
    const row = rows[0];
    return {
      id: row.id,
      name: row.name,
      code: row.code,
      type: row.type,
      appId: row.app_id,
      merchantId: row.merchant_id,
      apiKey: row.api_key,
      appSecret: row.app_secret,
      apiUrl: row.api_url,
      notifyUrl: row.notify_url,
      returnUrl: row.return_url,
      isActive: Boolean(row.is_active),
      paymentMode: row.payment_mode,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  // 根据代码查找支付配置
  static async findByCode(code: string): Promise<PaymentConfig | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM payment_configs WHERE code = ?',
      [code]
    );
    
    if (rows.length === 0) {
      return null;
    }
    
    const row = rows[0];
    return {
      id: row.id,
      name: row.name,
      code: row.code,
      type: row.type,
      appId: row.app_id,
      merchantId: row.merchant_id,
      apiKey: row.api_key,
      appSecret: row.app_secret,
      apiUrl: row.api_url,
      notifyUrl: row.notify_url,
      returnUrl: row.return_url,
      isActive: Boolean(row.is_active),
      paymentMode: row.payment_mode,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  // 创建支付配置
  static async create(config: Omit<PaymentConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO payment_configs 
       (name, code, type, app_id, merchant_id, api_key, app_secret, api_url, notify_url, return_url, is_active, payment_mode) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        config.name,
        config.code,
        config.type,
        config.appId || null,
        config.merchantId || null,
        config.apiKey || null,
        config.appSecret || null,
        config.apiUrl || null,
        config.notifyUrl || null,
        config.returnUrl || null,
        config.isActive,
        config.paymentMode || 'redirect'
      ]
    );
    
    return result.insertId;
  }

  // 更新支付配置
  static async update(id: number, config: Partial<Omit<PaymentConfig, 'id' | 'createdAt' | 'updatedAt'>>): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];
    
    if (config.name !== undefined) {
      fields.push('name = ?');
      values.push(config.name);
    }
    if (config.code !== undefined) {
      fields.push('code = ?');
      values.push(config.code);
    }
    if (config.type !== undefined) {
      fields.push('type = ?');
      values.push(config.type);
    }
    if (config.appId !== undefined) {
      fields.push('app_id = ?');
      values.push(config.appId);
    }
    if (config.merchantId !== undefined) {
      fields.push('merchant_id = ?');
      values.push(config.merchantId);
    }
    if (config.apiKey !== undefined) {
      fields.push('api_key = ?');
      values.push(config.apiKey);
    }
    if (config.appSecret !== undefined) {
      fields.push('app_secret = ?');
      values.push(config.appSecret);
    }
    if (config.apiUrl !== undefined) {
      fields.push('api_url = ?');
      values.push(config.apiUrl);
    }
    if (config.notifyUrl !== undefined) {
      fields.push('notify_url = ?');
      values.push(config.notifyUrl);
    }
    if (config.returnUrl !== undefined) {
      fields.push('return_url = ?');
      values.push(config.returnUrl);
    }
    if (config.isActive !== undefined) {
      fields.push('is_active = ?');
      values.push(config.isActive);
    }
    if (config.paymentMode !== undefined) {
      fields.push('payment_mode = ?');
      values.push(config.paymentMode);
    }
    
    if (fields.length === 0) {
      return false;
    }
    
    fields.push('updated_at = NOW()');
    values.push(id);
    
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE payment_configs SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    return result.affectedRows > 0;
  }

  // 删除支付配置
  static async delete(id: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM payment_configs WHERE id = ?',
      [id]
    );
    
    return result.affectedRows > 0;
  }

  // 切换激活状态
  static async toggleActive(id: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE payment_configs SET is_active = NOT is_active, updated_at = NOW() WHERE id = ?',
      [id]
    );
    
    return result.affectedRows > 0;
  }
}