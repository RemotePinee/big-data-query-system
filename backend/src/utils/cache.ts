import { createClient, RedisClientType } from 'redis';
import { logger } from './logger';

class CacheService {
  private client: RedisClientType | null = null;
  private isConnected: boolean = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      if (!process.env.REDIS_HOST) {
        logger.warn('Redis not configured, caching disabled');
        return;
      }

      this.client = createClient({
        socket: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
        },
        password: process.env.REDIS_PASSWORD || undefined,
        database: parseInt(process.env.REDIS_DB || '0'),
      });

      this.client.on('error', (err) => {
        logger.error('Redis Client Error', { error: err.message });
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        logger.info('Connected to Redis');
        this.isConnected = true;
      });

      this.client.on('disconnect', () => {
        logger.warn('Disconnected from Redis');
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      logger.error('Failed to initialize Redis', { 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    if (!this.isConnected || !this.client) {
      return null;
    }

    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Cache get error', { 
        key, 
        error: error instanceof Error ? error.message : String(error) 
      });
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      await this.client.setEx(key, ttlSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error('Cache set error', { 
        key, 
        ttlSeconds, 
        error: error instanceof Error ? error.message : String(error) 
      });
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error('Cache delete error', { 
        key, 
        error: error instanceof Error ? error.message : String(error) 
      });
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Cache exists error', { 
        key, 
        error: error instanceof Error ? error.message : String(error) 
      });
      return false;
    }
  }

  async flush(): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      await this.client.flushDb();
      logger.info('Cache flushed');
      return true;
    } catch (error) {
      logger.error('Cache flush error', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      return false;
    }
  }

  // 缓存装饰器
  cache(ttl: number = 3600) {
    return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
      const method = descriptor.value;
      
      descriptor.value = async function (...args: any[]) {
        const cacheKey = `${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`;
        
        // 尝试从缓存获取
        const cached = await cacheService.get(cacheKey);
        if (cached !== null) {
          logger.debug('Cache hit', { key: cacheKey });
          return cached;
        }

        // 执行原方法
        const result = await method.apply(this, args);
        
        // 缓存结果
        await cacheService.set(cacheKey, result, ttl);
        logger.debug('Cache set', { key: cacheKey, ttl });
        
        return result;
      };
    };
  }

  // 生成缓存键
  generateKey(prefix: string, ...parts: any[]): string {
    return `${prefix}:${parts.map(p => String(p)).join(':')}`;
  }

  // 批量操作
  async mget(keys: string[]): Promise<(any | null)[]> {
    if (!this.isConnected || !this.client || keys.length === 0) {
      return keys.map(() => null);
    }

    try {
      const values = await this.client.mGet(keys);
      return values.map(value => value ? JSON.parse(value) : null);
    } catch (error) {
      logger.error('Cache mget error', { 
        keys, 
        error: error instanceof Error ? error.message : String(error) 
      });
      return keys.map(() => null);
    }
  }

  async mset(keyValues: Record<string, any>, ttl: number = 3600): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      const pipeline = this.client.multi();
      
      Object.entries(keyValues).forEach(([key, value]) => {
        pipeline.setEx(key, ttl, JSON.stringify(value));
      });
      
      await pipeline.exec();
      return true;
    } catch (error) {
      logger.error('Cache mset error', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      return false;
    }
  }

  // 关闭连接
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.disconnect();
      this.isConnected = false;
    }
  }
}

// 导出单例
export const cacheService = new CacheService();

// 缓存中间件
export const cacheMiddleware = (ttl: number = 300) => {
  return async (req: any, res: any, next: any) => {
    // 只缓存GET请求
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = `http:${req.originalUrl}`;
    const cached = await cacheService.get(cacheKey);

    if (cached) {
      logger.debug('HTTP Cache hit', { url: req.originalUrl });
      return res.json(cached);
    }

    // 重写res.json以缓存响应
    const originalJson = res.json;
    res.json = function(data: any) {
      // 只缓存成功响应
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cacheService.set(cacheKey, data, ttl);
        logger.debug('HTTP Cache set', { url: req.originalUrl, ttl });
      }
      return originalJson.call(this, data);
    };

    next();
  };
};

