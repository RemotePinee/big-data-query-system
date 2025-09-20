import { Router, Request, Response } from 'express';
import { pool } from '../config/database';

const router = Router();

// 健康检查端点
router.get('/health', async (req: Request, res: Response) => {
  try {
    const healthCheck = {
      uptime: process.uptime(),
      timestamp: Date.now(),
      status: 'OK',
      services: {
        database: 'checking...',
        memory: {
          used: process.memoryUsage(),
          percentage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100)
        },
        cpu: {
          usage: process.cpuUsage()
        }
      }
    };

    // 检查数据库连接
    try {
      const connection = await pool.getConnection();
      await connection.ping();
      connection.release();
      healthCheck.services.database = 'OK';
    } catch (error) {
      healthCheck.services.database = 'ERROR';
      healthCheck.status = 'DEGRADED';
    }

    // 根据健康状态设置HTTP状态码
    const statusCode = healthCheck.status === 'OK' ? 200 : 503;
    
    res.status(statusCode).json(healthCheck);
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: Date.now(),
      error: 'Health check failed'
    });
  }
});

// 简单的ping端点
router.get('/ping', (req: Request, res: Response) => {
  res.json({ message: 'pong', timestamp: Date.now() });
});

// 就绪检查端点（用于Kubernetes等）
router.get('/ready', async (req: Request, res: Response) => {
  try {
    // 检查关键服务是否就绪
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    
    res.json({ status: 'ready', timestamp: Date.now() });
  } catch (error) {
    res.status(503).json({ status: 'not ready', timestamp: Date.now() });
  }
});

export default router;

