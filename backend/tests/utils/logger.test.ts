import { logger } from '../../src/utils/logger';
import fs from 'fs';
import path from 'path';

// Mock fs module
jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('Logger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock existsSync to return true (directory exists)
    mockedFs.existsSync.mockReturnValue(true);
  });

  describe('info', () => {
    it('should log info messages', () => {
      // 设置测试环境变量以启用info级别日志
      const originalEnv = process.env.NODE_ENV;
      const originalLogLevel = process.env.LOG_LEVEL;
      process.env.NODE_ENV = 'development';
      process.env.LOG_LEVEL = 'info';
      
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation();
      
      // 创建新的logger实例以应用新的环境变量
      const { Logger } = require('../../src/utils/logger');
      const testLogger = new Logger();
      
      testLogger.info('Test info message');
      
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
      process.env.LOG_LEVEL = originalLogLevel;
    });
  });

  describe('error', () => {
    it('should log error messages', () => {
      // 临时设置非 SILENT 级别以便测试
      const originalLogLevel = process.env.LOG_LEVEL;
      process.env.LOG_LEVEL = 'error';
      
      const { Logger } = require('../../src/utils/logger');
      const testLogger = new Logger();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      testLogger.error('Test error message');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('ERROR: Test error message'),
        ''
      );

      consoleSpy.mockRestore();
      process.env.LOG_LEVEL = originalLogLevel;
    });

    it('should log error messages with metadata', () => {
      // 临时设置非 SILENT 级别以便测试
      const originalLogLevel = process.env.LOG_LEVEL;
      process.env.LOG_LEVEL = 'error';
      
      const { Logger } = require('../../src/utils/logger');
      const testLogger = new Logger();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      testLogger.error('Test error', { userId: 123, action: 'login' });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('ERROR: Test error'),
        { userId: 123, action: 'login' }
      );

      consoleSpy.mockRestore();
      process.env.LOG_LEVEL = originalLogLevel;
    });
  });

  describe('warn', () => {
    it('should log warning messages', () => {
      // 设置测试环境变量以启用warn级别日志
      const originalEnv = process.env.NODE_ENV;
      const originalLogLevel = process.env.LOG_LEVEL;
      process.env.NODE_ENV = 'development';
      process.env.LOG_LEVEL = 'warn';
      
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      // 创建新的logger实例以应用新的环境变量
      const { Logger } = require('../../src/utils/logger');
      const testLogger = new Logger();
      
      testLogger.warn('Test warning message');
      
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
      process.env.LOG_LEVEL = originalLogLevel;
    });
  });

  describe('logRequest', () => {
    it('should log HTTP requests', () => {
      const infoSpy = jest.spyOn(logger, 'info').mockImplementation();
      
      const mockReq = {
        method: 'GET',
        url: '/api/users',
        get: jest.fn().mockReturnValue('Mozilla/5.0'),
        ip: '127.0.0.1',
        user: { id: 123 }
      };
      
      const mockRes = {
        statusCode: 200
      };
      
      logger.logRequest(mockReq, mockRes, 150);
      
      expect(infoSpy).toHaveBeenCalledWith('HTTP Request', {
        method: 'GET',
        url: '/api/users',
        statusCode: 200,
        responseTime: '150ms',
        userAgent: 'Mozilla/5.0',
        ip: '127.0.0.1',
        userId: 123
      });
      
      infoSpy.mockRestore();
    });
  });

  describe('logPayment', () => {
    it('should log successful payment actions', () => {
      const infoSpy = jest.spyOn(logger, 'info').mockImplementation();
      
      logger.logPayment('create', 'ORDER_123', 99.99);
      
      expect(infoSpy).toHaveBeenCalledWith('Payment Action', {
        action: 'create',
        orderId: 'ORDER_123',
        amount: 99.99,
        error: undefined
      });
      
      infoSpy.mockRestore();
    });

    it('should log payment errors', () => {
      const errorSpy = jest.spyOn(logger, 'error').mockImplementation();
      const error = new Error('Payment failed');
      
      logger.logPayment('process', 'ORDER_123', 99.99, error);
      
      expect(errorSpy).toHaveBeenCalledWith('Payment Error', {
        action: 'process',
        orderId: 'ORDER_123',
        amount: 99.99,
        error: 'Payment failed'
      });
      
      errorSpy.mockRestore();
    });
  });
});
