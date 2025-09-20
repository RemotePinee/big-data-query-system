import { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import express from 'express';
import { 
  ipWhitelist, 
  adminRateLimit, 
  requestSizeLimit,
  sqlInjectionProtection,
  xssProtection
} from '../../src/middlewares/security.middleware';
import { logger } from '../../src/utils/logger';

// Mock logger
jest.mock('../../src/utils/logger', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn()
  }
}));

const mockLogger = logger as jest.Mocked<typeof logger>;

describe('Security Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ipWhitelist', () => {
    let app: express.Application;
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
      app = express();
      mockReq = {
        ip: '192.168.1.1',
        url: '/test',
        connection: { remoteAddress: '192.168.1.1' } as any
      };
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      mockNext = jest.fn();
    });

    it('should allow all IPs when whitelist is empty', () => {
      const middleware = ipWhitelist([]);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should allow whitelisted IPs', () => {
      const middleware = ipWhitelist(['192.168.1.1', '127.0.0.1']);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should block non-whitelisted IPs', () => {
      const middleware = ipWhitelist(['127.0.0.1']);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        code: 403,
        message: 'Access denied: IP not authorized'
      });
      expect(mockLogger.warn).toHaveBeenCalledWith('IP not in whitelist', {
        ip: '192.168.1.1',
        url: '/test'
      });
    });

    it('should handle missing IP gracefully', () => {
      const testReq = {
        ...mockReq,
        ip: undefined,
        connection: { remoteAddress: undefined } as any
      };
      
      const middleware = ipWhitelist(['127.0.0.1']);
      middleware(testReq as Request, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });

    it('should use connection.remoteAddress when req.ip is not available', () => {
      const testReq = {
        ...mockReq,
        ip: undefined,
        connection: { remoteAddress: '127.0.0.1' } as any
      };
      
      const middleware = ipWhitelist(['127.0.0.1']);
      middleware(testReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('requestSizeLimit', () => {
    let app: express.Application;

    beforeEach(() => {
      app = express();
      app.use(requestSizeLimit('1mb'));
      app.post('/test', (req, res) => res.json({ success: true }));
    });

    it('should accept requests within size limit', async () => {
      const smallPayload = { data: 'small data' };
      
      const response = await request(app)
        .post('/test')
        .send(smallPayload);

      expect(response.status).toBe(200);
    });

    it('should call next for requests without content-length', async () => {
      const response = await request(app)
        .post('/test')
        .send({ data: 'test' });

      expect(response.status).toBe(200);
    });
  });

  describe('sqlInjectionProtection', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
      mockReq = {
        body: {},
        query: {},
        params: {}
      };
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      mockNext = jest.fn();
    });

    it('should allow safe requests', () => {
      mockReq.body = { username: 'testuser', email: 'test@example.com' };
      
      sqlInjectionProtection(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should block requests with SQL injection patterns', () => {
      const testReq = {
        body: { username: "'; DROP TABLE users; --" },
        query: {},
        params: {},
        get: jest.fn().mockReturnValue('test-agent'),
        ip: '127.0.0.1',
        url: '/test'
      };
      
      sqlInjectionProtection(testReq as any, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        code: 400,
        message: '请求包含非法字符'
      });
    });

    it('should check query parameters', () => {
      const testReq = {
        body: {},
        query: { search: 'UNION SELECT * FROM users' },
        params: {},
        get: jest.fn().mockReturnValue('test-agent'),
        ip: '127.0.0.1',
        url: '/test'
      };
      
      sqlInjectionProtection(testReq as any, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe('Rate Limiting Integration', () => {
    let app: express.Application;

    beforeEach(() => {
      app = express();
      app.use('/admin', adminRateLimit);
      
      app.get('/admin/test', (req, res) => res.json({ admin: true }));
      app.get('/health', (req, res) => res.json({ health: 'ok' }));
    });

    it('should allow normal requests within rate limit', async () => {
      const response = await request(app).get('/admin/test');
      expect(response.status).toBe(200);
    });

    it('should skip rate limiting for health check endpoints', async () => {
      // This test verifies that health endpoints are skipped
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
    });

    it('should add rate limit headers', async () => {
      const response = await request(app).get('/admin/test');
      
      // express-rate-limit uses different header names in newer versions
      expect(response.headers).toHaveProperty('ratelimit-limit');
      expect(response.headers).toHaveProperty('ratelimit-remaining');
      expect(response.headers).toHaveProperty('ratelimit-reset');
    });
  });

  describe('Error Handling', () => {
    it('should handle middleware errors gracefully', () => {
      const mockReq = {
        ip: undefined,
        url: '/test',
        connection: { remoteAddress: undefined }
      } as any;
      
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      const mockNext = jest.fn();

      const middleware = ipWhitelist(['127.0.0.1']);
      
      expect(() => {
        middleware(mockReq, mockRes, mockNext);
      }).not.toThrow();
      
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });
  });

  describe('Security Configuration', () => {
    it('should have proper default configurations', () => {
      // Test that security middleware has sensible defaults
      const app = express();
      app.use(sqlInjectionProtection);
      app.get('/test', (req, res) => res.json({}));

      return request(app)
        .get('/test')
        .expect(200)
        .then(response => {
          // Verify the response is successful
          expect(response.body).toEqual({});
        });
    });

    it('should handle XSS protection', () => {
      const mockReq = {
        body: { content: '<script>alert("xss")</script>' },
        query: { search: '<iframe src="evil.com"></iframe>' },
        params: {},
        get: jest.fn().mockReturnValue('test-agent'),
        ip: '127.0.0.1',
        url: '/test'
      } as any;
      
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      const mockNext = jest.fn();

      xssProtection(mockReq, mockRes, mockNext);

      // XSS protection sanitizes the input instead of blocking
      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.body.content).toBe(''); // Script tag should be removed
      expect(mockReq.query.search).toBe(''); // Iframe tag should be removed
    });
  });
});
