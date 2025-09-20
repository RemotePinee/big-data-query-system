import request from 'supertest';
import express from 'express';
import healthRoutes from '../../src/routes/health.routes';
import { pool } from '../../src/config/database';

// Mock the database pool
jest.mock('../../src/config/database', () => ({
  pool: {
    getConnection: jest.fn()
  }
}));

const mockPool = pool as jest.Mocked<typeof pool>;

describe('Health Routes', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use('/api', healthRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/health', () => {
    it('should return health status OK when database is healthy', async () => {
      const mockConnection = {
        ping: jest.fn().mockResolvedValue(undefined),
        release: jest.fn()
      };

      mockPool.getConnection.mockResolvedValueOnce(mockConnection as any);

      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        status: 'OK',
        services: {
          database: 'OK',
          memory: expect.any(Object),
          cpu: expect.any(Object)
        }
      });
      expect(response.body.uptime).toBeGreaterThanOrEqual(0);
      expect(response.body.timestamp).toBeGreaterThan(0);
      expect(mockConnection.ping).toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalled();
    });

    it('should return DEGRADED status when database is unhealthy', async () => {
      const mockConnection = {
        ping: jest.fn().mockRejectedValue(new Error('Database error')),
        release: jest.fn()
      };

      mockPool.getConnection.mockResolvedValueOnce(mockConnection as any);

      const response = await request(app).get('/api/health');

      expect(response.status).toBe(503);
      expect(response.body).toMatchObject({
        status: 'DEGRADED',
        services: {
          database: 'ERROR'
        }
      });
    });

    it('should return DEGRADED status when cannot get database connection', async () => {
      mockPool.getConnection.mockRejectedValueOnce(new Error('Connection failed'));

      const response = await request(app).get('/api/health');

      expect(response.status).toBe(503);
      expect(response.body).toMatchObject({
        status: 'DEGRADED',
        services: {
          database: 'ERROR'
        }
      });
    });

    it('should return ERROR status when health check fails completely', async () => {
      // Mock process.uptime to throw an error (simulating complete failure)
      const originalUptime = process.uptime;
      process.uptime = jest.fn().mockImplementation(() => {
        throw new Error('Process error');
      });

      const response = await request(app).get('/api/health');

      expect(response.status).toBe(503);
      expect(response.body).toMatchObject({
        status: 'ERROR',
        error: 'Health check failed'
      });
      expect(response.body.timestamp).toBeGreaterThan(0);

      // Restore original function
      process.uptime = originalUptime;
    });

    it('should include memory and CPU usage information', async () => {
      const mockConnection = {
        ping: jest.fn().mockResolvedValue(undefined),
        release: jest.fn()
      };

      mockPool.getConnection.mockResolvedValueOnce(mockConnection as any);

      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body.services.memory).toHaveProperty('used');
      expect(response.body.services.memory).toHaveProperty('percentage');
      expect(response.body.services.cpu).toHaveProperty('usage');
      expect(typeof response.body.services.memory.percentage).toBe('number');
    });
  });

  describe('GET /api/ping', () => {
    it('should return pong message', async () => {
      const response = await request(app).get('/api/ping');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        message: 'pong'
      });
      expect(response.body.timestamp).toBeGreaterThan(0);
    });

    it('should always return 200 status', async () => {
      // Even if database is down, ping should work
      mockPool.getConnection.mockRejectedValue(new Error('Database down'));

      const response = await request(app).get('/api/ping');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('pong');
    });
  });

  describe('GET /api/ready', () => {
    it('should return ready status when database is accessible', async () => {
      const mockConnection = {
        ping: jest.fn().mockResolvedValue(undefined),
        release: jest.fn()
      };

      mockPool.getConnection.mockResolvedValueOnce(mockConnection as any);

      const response = await request(app).get('/api/ready');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        status: 'ready'
      });
      expect(response.body.timestamp).toBeGreaterThan(0);
      expect(mockConnection.ping).toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalled();
    });

    it('should return not ready status when database is inaccessible', async () => {
      const mockConnection = {
        ping: jest.fn().mockRejectedValue(new Error('Database error')),
        release: jest.fn()
      };

      mockPool.getConnection.mockResolvedValueOnce(mockConnection as any);

      const response = await request(app).get('/api/ready');

      expect(response.status).toBe(503);
      expect(response.body).toMatchObject({
        status: 'not ready'
      });
      expect(response.body.timestamp).toBeGreaterThan(0);
    });

    it('should return not ready when cannot get database connection', async () => {
      mockPool.getConnection.mockRejectedValueOnce(new Error('Connection failed'));

      const response = await request(app).get('/api/ready');

      expect(response.status).toBe(503);
      expect(response.body).toMatchObject({
        status: 'not ready'
      });
    });
  });

  describe('Route validation', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/api/nonexistent');

      expect(response.status).toBe(404);
    });

    it('should handle POST requests to health endpoints gracefully', async () => {
      const response = await request(app).post('/api/health');

      expect(response.status).toBe(404);
    });
  });
});
