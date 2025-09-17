import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// 数据库连接配置
const dbConfig = {
  host: (process.env.DB_HOST || 'localhost').split(':')[0],
  port: parseInt((process.env.DB_HOST || 'localhost:3306').split(':')[1] || '3306'),
  user: process.env.DB_USER || 'dashuju',
  password: process.env.DB_PASSWORD || 'dashuju',
  database: process.env.DB_NAME || 'dashuju',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// 创建连接池
const pool = mysql.createPool(dbConfig);

// 测试数据库连接
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    // 数据库连接成功
    connection.release();
    return true;
  } catch (error) {
    console.error('数据库连接失败:', error);
    return false;
  }
};

export { pool, testConnection };