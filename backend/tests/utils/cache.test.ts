import { cacheService, cacheMiddleware } from '../../src/utils/cache';
import { createClient } from 'redis';
import { logger } from '../../src/utils/logger';

// Mock Redis client
jest.mock('redis', () => ({
  createClient: jest.fn()
}));

// Mock logger
jest.mock('../../src/utils/logger', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
  }
}));

describe('CacheService', () => {
  let mockClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mock Redis client
    mockClient = {
      on: jest.fn(),
      connect: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn().mockResolvedValue(undefined),
      setEx: jest.fn().mockResolvedValue('OK'),
      get: jest.fn().mockResolvedValue(null),
      del: jest.fn().mockResolvedValue(1),
      exists: jest.fn().mockResolvedValue(1),
      flushDb: jest.fn().mockResolvedValue('OK'),
      mGet: jest.fn().mockResolvedValue([]),
      multi: jest.fn().mockReturnValue({
        setEx: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([])
      })
    };

    (createClient as jest.Mock).mockReturnValue(mockClient);
  });

  // Skip initialization tests since cacheService is a singleton that's already initialized
  // Focus on testing the actual functionality

  describe('get method', () => {
    beforeEach(() => {
      process.env.REDIS_HOST = 'localhost';
      // Mock isConnected to true for these tests
      (cacheService as any).isConnected = true;
      (cacheService as any).client = mockClient;
    });

    it('should get cache value', async () => {
      mockClient.get.mockResolvedValueOnce('"test-value"');

      const result = await cacheService.get('test-key');

      expect(mockClient.get).toHaveBeenCalledWith('test-key');
      expect(result).toBe('test-value');
    });

    it('should return null for non-existent key', async () => {
      mockClient.get.mockResolvedValueOnce(null);

      const result = await cacheService.get('non-existent');

      expect(result).toBeNull();
    });

    it('should handle complex objects', async () => {
      const complexObject = { id: 1, name: 'test', nested: { value: 'nested' } };
      mockClient.get.mockResolvedValueOnce(JSON.stringify(complexObject));

      const result = await cacheService.get('complex-key');

      expect(result).toEqual(complexObject);
    });

    it('should return null when Redis is not connected', async () => {
      (cacheService as any).isConnected = false;

      const result = await cacheService.get('test-key');

      expect(result).toBeNull();
      expect(mockClient.get).not.toHaveBeenCalled();
    });

    it('should handle Redis get error', async () => {
      mockClient.get.mockRejectedValueOnce(new Error('Redis error'));

      const result = await cacheService.get('test-key');

      expect(logger.error).toHaveBeenCalledWith('Cache get error', { 
        key: 'test-key',
        error: 'Redis error'
      });
      expect(result).toBeNull();
    });

    it('should handle JSON parse error', async () => {
      mockClient.get.mockResolvedValueOnce('invalid-json');

      const result = await cacheService.get('test-key');

      expect(logger.error).toHaveBeenCalledWith('Cache get error', { 
        key: 'test-key',
        error: expect.any(String)
      });
      expect(result).toBeNull();
    });
  });

  describe('set method', () => {
    beforeEach(() => {
      process.env.REDIS_HOST = 'localhost';
      (cacheService as any).isConnected = true;
      (cacheService as any).client = mockClient;
    });

    it('should set cache value with default TTL', async () => {
      const result = await cacheService.set('test-key', 'test-value');

      expect(mockClient.setEx).toHaveBeenCalledWith('test-key', 3600, '"test-value"');
      expect(result).toBe(true);
    });

    it('should set cache value with custom TTL', async () => {
      const result = await cacheService.set('test-key', 'test-value', 1800);

      expect(mockClient.setEx).toHaveBeenCalledWith('test-key', 1800, '"test-value"');
      expect(result).toBe(true);
    });

    it('should handle complex objects', async () => {
      const complexObject = { id: 1, name: 'test', nested: { value: 'nested' } };
      
      const result = await cacheService.set('complex-key', complexObject);

      expect(mockClient.setEx).toHaveBeenCalledWith('complex-key', 3600, JSON.stringify(complexObject));
      expect(result).toBe(true);
    });

    it('should return false when Redis is not connected', async () => {
      (cacheService as any).isConnected = false;

      const result = await cacheService.set('test-key', 'test-value');

      expect(result).toBe(false);
      expect(mockClient.setEx).not.toHaveBeenCalled();
    });

    it('should handle Redis set error', async () => {
      mockClient.setEx.mockRejectedValueOnce(new Error('Redis error'));

      const result = await cacheService.set('test-key', 'test-value');

      expect(logger.error).toHaveBeenCalledWith('Cache set error', { 
        key: 'test-key',
        ttlSeconds: 3600,
        error: 'Redis error'
      });
      expect(result).toBe(false);
    });
  });

  describe('del method', () => {
    beforeEach(() => {
      process.env.REDIS_HOST = 'localhost';
      (cacheService as any).isConnected = true;
      (cacheService as any).client = mockClient;
    });

    it('should delete cache key', async () => {
      const result = await cacheService.del('test-key');

      expect(mockClient.del).toHaveBeenCalledWith('test-key');
      expect(result).toBe(true);
    });

    it('should return false when Redis is not connected', async () => {
      (cacheService as any).isConnected = false;

      const result = await cacheService.del('test-key');

      expect(result).toBe(false);
      expect(mockClient.del).not.toHaveBeenCalled();
    });

    it('should handle Redis delete error', async () => {
      mockClient.del.mockRejectedValueOnce(new Error('Redis error'));

      const result = await cacheService.del('test-key');

      expect(logger.error).toHaveBeenCalledWith('Cache delete error', { 
        key: 'test-key',
        error: 'Redis error'
      });
      expect(result).toBe(false);
    });
  });

  describe('exists method', () => {
    beforeEach(() => {
      process.env.REDIS_HOST = 'localhost';
      (cacheService as any).isConnected = true;
      (cacheService as any).client = mockClient;
    });

    it('should check if key exists', async () => {
      mockClient.exists.mockResolvedValueOnce(1);

      const result = await cacheService.exists('test-key');

      expect(mockClient.exists).toHaveBeenCalledWith('test-key');
      expect(result).toBe(true);
    });

    it('should return false for non-existent key', async () => {
      mockClient.exists.mockResolvedValueOnce(0);

      const result = await cacheService.exists('non-existent');

      expect(result).toBe(false);
    });

    it('should return false when Redis is not connected', async () => {
      (cacheService as any).isConnected = false;

      const result = await cacheService.exists('test-key');

      expect(result).toBe(false);
      expect(mockClient.exists).not.toHaveBeenCalled();
    });

    it('should handle Redis exists error', async () => {
      mockClient.exists.mockRejectedValueOnce(new Error('Redis error'));

      const result = await cacheService.exists('test-key');

      expect(logger.error).toHaveBeenCalledWith('Cache exists error', { 
        key: 'test-key',
        error: 'Redis error'
      });
      expect(result).toBe(false);
    });
  });

  describe('flush method', () => {
    beforeEach(() => {
      process.env.REDIS_HOST = 'localhost';
      (cacheService as any).isConnected = true;
      (cacheService as any).client = mockClient;
    });

    it('should flush database', async () => {
      const result = await cacheService.flush();

      expect(mockClient.flushDb).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('Cache flushed');
      expect(result).toBe(true);
    });

    it('should return false when Redis is not connected', async () => {
      (cacheService as any).isConnected = false;

      const result = await cacheService.flush();

      expect(result).toBe(false);
      expect(mockClient.flushDb).not.toHaveBeenCalled();
    });

    it('should handle Redis flush error', async () => {
      mockClient.flushDb.mockRejectedValueOnce(new Error('Redis error'));

      const result = await cacheService.flush();

      expect(logger.error).toHaveBeenCalledWith('Cache flush error', { 
        error: 'Redis error'
      });
      expect(result).toBe(false);
    });
  });

  describe('generateKey method', () => {
    it('should generate cache key from prefix and parts', () => {
      const key = cacheService.generateKey('user', 123, 'profile');
      expect(key).toBe('user:123:profile');
    });

    it('should handle empty parts', () => {
      const key = cacheService.generateKey('test');
      expect(key).toBe('test:');
    });

    it('should convert all parts to strings', () => {
      const key = cacheService.generateKey('data', 123, true, null, undefined);
      expect(key).toBe('data:123:true:null:undefined');
    });
  });

  describe('mget method', () => {
    beforeEach(() => {
      process.env.REDIS_HOST = 'localhost';
      (cacheService as any).isConnected = true;
      (cacheService as any).client = mockClient;
    });

    it('should get multiple keys', async () => {
      const mockValues = ['"value1"', '"value2"', null];
      mockClient.mGet.mockResolvedValueOnce(mockValues);

      const result = await cacheService.mget(['key1', 'key2', 'key3']);

      expect(mockClient.mGet).toHaveBeenCalledWith(['key1', 'key2', 'key3']);
      expect(result).toEqual(['value1', 'value2', null]);
    });

    it('should return empty array for empty keys', async () => {
      const result = await cacheService.mget([]);

      expect(result).toEqual([]);
      expect(mockClient.mGet).not.toHaveBeenCalled();
    });

    it('should return null array when Redis is not connected', async () => {
      (cacheService as any).isConnected = false;

      const result = await cacheService.mget(['key1', 'key2']);

      expect(result).toEqual([null, null]);
      expect(mockClient.mGet).not.toHaveBeenCalled();
    });

    it('should handle Redis mget error', async () => {
      mockClient.mGet.mockRejectedValueOnce(new Error('Redis error'));

      const result = await cacheService.mget(['key1', 'key2']);

      expect(logger.error).toHaveBeenCalledWith('Cache mget error', { 
        keys: ['key1', 'key2'],
        error: 'Redis error'
      });
      expect(result).toEqual([null, null]);
    });
  });

  describe('mset method', () => {
    beforeEach(() => {
      process.env.REDIS_HOST = 'localhost';
      (cacheService as any).isConnected = true;
      (cacheService as any).client = mockClient;
    });

    it('should set multiple keys', async () => {
      const keyValues = { key1: 'value1', key2: 'value2' };
      const mockPipeline = mockClient.multi();

      const result = await cacheService.mset(keyValues, 1800);

      expect(mockClient.multi).toHaveBeenCalled();
      expect(mockPipeline.setEx).toHaveBeenCalledWith('key1', 1800, '"value1"');
      expect(mockPipeline.setEx).toHaveBeenCalledWith('key2', 1800, '"value2"');
      expect(mockPipeline.exec).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should use default TTL', async () => {
      const keyValues = { key1: 'value1' };
      const mockPipeline = mockClient.multi();

      await cacheService.mset(keyValues);

      expect(mockPipeline.setEx).toHaveBeenCalledWith('key1', 3600, '"value1"');
    });

    it('should return false when Redis is not connected', async () => {
      (cacheService as any).isConnected = false;

      const result = await cacheService.mset({ key1: 'value1' });

      expect(result).toBe(false);
      expect(mockClient.multi).not.toHaveBeenCalled();
    });

    it('should handle Redis mset error', async () => {
      const mockPipeline = mockClient.multi();
      mockPipeline.exec.mockRejectedValueOnce(new Error('Redis error'));

      const result = await cacheService.mset({ key1: 'value1' });

      expect(logger.error).toHaveBeenCalledWith('Cache mset error', { 
        error: 'Redis error'
      });
      expect(result).toBe(false);
    });
  });

  describe('disconnect method', () => {
    beforeEach(() => {
      process.env.REDIS_HOST = 'localhost';
      (cacheService as any).client = mockClient;
    });

    it('should disconnect from Redis', async () => {
      await cacheService.disconnect();

      expect(mockClient.disconnect).toHaveBeenCalled();
    });

    it('should handle disconnect when client is null', async () => {
      (cacheService as any).client = null;

      await cacheService.disconnect();

      expect(mockClient.disconnect).not.toHaveBeenCalled();
    });
  });
});

describe('cacheMiddleware', () => {
  let req: any;
  let res: any;
  let next: any;
  let middleware: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    req = {
      method: 'GET',
      originalUrl: '/api/test'
    };
    
    res = {
      statusCode: 200,
      json: jest.fn()
    };
    
    next = jest.fn();
    middleware = cacheMiddleware(300);

    // Mock cacheService methods
    (cacheService as any).get = jest.fn().mockResolvedValue(null);
    (cacheService as any).set = jest.fn().mockResolvedValue(true);
  });

  it('should skip caching for non-GET requests', async () => {
    req.method = 'POST';

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect((cacheService as any).get).not.toHaveBeenCalled();
  });

  it('should return cached response if available', async () => {
    const cachedData = { message: 'cached response' };
    (cacheService as any).get = jest.fn().mockResolvedValue(cachedData);

    await middleware(req, res, next);

    expect((cacheService as any).get).toHaveBeenCalledWith('http:/api/test');
    expect(res.json).toHaveBeenCalledWith(cachedData);
    expect(logger.debug).toHaveBeenCalledWith('HTTP Cache hit', { url: '/api/test' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should cache successful responses', async () => {
    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();

    // Simulate response
    const responseData = { message: 'success' };
    res.statusCode = 200;
    res.json(responseData);

    expect((cacheService as any).set).toHaveBeenCalledWith('http:/api/test', responseData, 300);
    expect(logger.debug).toHaveBeenCalledWith('HTTP Cache set', { url: '/api/test', ttl: 300 });
  });

  it('should not cache error responses', async () => {
    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();

    // Simulate error response
    const responseData = { error: 'Not found' };
    res.statusCode = 404;
    res.json(responseData);

    expect((cacheService as any).set).not.toHaveBeenCalled();
  });

  it('should use custom TTL', async () => {
    const customMiddleware = cacheMiddleware(600);
    
    await customMiddleware(req, res, next);

    // Simulate response
    const responseData = { message: 'success' };
    res.statusCode = 200;
    res.json(responseData);

    expect((cacheService as any).set).toHaveBeenCalledWith('http:/api/test', responseData, 600);
  });
});