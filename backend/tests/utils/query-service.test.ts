import { QueryService } from '../../src/utils/query-service';
import { ApiConfigModel } from '../../src/models/api-config.model';
import { QueryItemModel } from '../../src/models/query-item.model';
import { OrderModel } from '../../src/models/order.model';

// Mock models
jest.mock('../../src/models/api-config.model');
jest.mock('../../src/models/query-item.model');
jest.mock('../../src/models/order.model');

// Mock console methods
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

describe('QueryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock console methods
    console.log = jest.fn();
    console.error = jest.fn();
  });

  afterAll(() => {
    // Restore original console methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  describe('validateParams', () => {
    it('should validate parameters against array schema successfully', () => {
      const params = {
        name: 'John Doe',
        age: 30,
        email: 'john@example.com'
      };

      const schema = [
        { name: 'name', required: true, type: 'string' },
        { name: 'age', required: true, type: 'number' },
        { name: 'email', required: false, type: 'string' }
      ];

      const result = QueryService.validateParams(params, JSON.stringify(schema));

      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should detect missing required parameters', () => {
      const params = {
        name: 'John Doe'
      };

      const schema = [
        { name: 'name', required: true, type: 'string' },
        { name: 'age', required: true, type: 'number', label: 'Age' }
      ];

      const result = QueryService.validateParams(params, JSON.stringify(schema));

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
      expect(result.errors).toContain('Age为必填项');
    });

    it('should detect incorrect parameter types', () => {
      const params = {
        name: 123,
        age: 'thirty'
      };

      const schema = [
        { name: 'name', required: true, type: 'string', label: 'Name' },
        { name: 'age', required: true, type: 'number', label: 'Age' }
      ];

      const result = QueryService.validateParams(params, JSON.stringify(schema));

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.some(error => error.includes('Name类型错误'))).toBe(true);
      expect(result.errors!.some(error => error.includes('Age类型错误'))).toBe(true);
    });

    it('should handle invalid JSON schema', () => {
      const params = { name: 'John' };
      const invalidSchema = 'invalid json';

      const result = QueryService.validateParams(params, invalidSchema);

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!).toContain('参数验证失败');
    });

    it('should handle empty schema', () => {
      const params = { name: 'John' };
      const emptySchema = null;

      const result = QueryService.validateParams(params, emptySchema);

      expect(result.valid).toBe(true);
    });

    it('should handle non-array schema', () => {
      const params = { name: 'John' };
      const objectSchema = { name: { required: true, type: 'string' } };

      const result = QueryService.validateParams(params, JSON.stringify(objectSchema));

      expect(result.valid).toBe(true);
    });

    it('should validate field length constraints', () => {
      const params = {
        name: 'Jo', // Too short
        description: 'This is a very long description that exceeds the maximum length limit'
      };

      const schema = [
        { name: 'name', required: true, type: 'string', minLength: 3, label: 'Name' },
        { name: 'description', required: false, type: 'string', maxLength: 50, label: 'Description' }
      ];

      const result = QueryService.validateParams(params, JSON.stringify(schema));

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.some(error => error.includes('Name长度不能小于3'))).toBe(true);
      expect(result.errors!.some(error => error.includes('Description长度不能大于50'))).toBe(true);
    });

    it('should validate pattern constraints', () => {
      const params = {
        email: 'invalid-email',
        phone: '123'
      };

      const schema = [
        { name: 'email', required: true, type: 'string', pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$', label: 'Email' },
        { name: 'phone', required: false, type: 'string', pattern: '^\\d{10,11}$', label: 'Phone' }
      ];

      const result = QueryService.validateParams(params, JSON.stringify(schema));

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.some(error => error.includes('Email格式不正确'))).toBe(true);
      expect(result.errors!.some(error => error.includes('Phone格式不正确'))).toBe(true);
    });
  });

  describe('executeQuery', () => {
    const mockQueryItem = {
      id: 1,
      name: 'Test Query',
      paramsSchema: JSON.stringify([
        { name: 'userId', required: true, type: 'number' }
      ]),
      apiConfigId: 1,
      requestMethod: 'GET',
      requestPath: '/users/{userId}',
      requestHeaders: JSON.stringify({ 'Content-Type': 'application/json' }),
      responseFormat: 'json',
      isActive: true
    };

    const mockApiConfig = {
      id: 1,
      name: 'Test API',
      baseUrl: 'https://api.example.com',
      apiPath: '/v1',
      authType: 'none',
      headers: JSON.stringify({ 'User-Agent': 'TestAgent' }),
      timeout: 5000,
      isActive: true
    };

    beforeEach(() => {
      (QueryItemModel.findById as jest.Mock).mockResolvedValue(mockQueryItem);
      (ApiConfigModel.findById as jest.Mock).mockResolvedValue(mockApiConfig);
    });

    it('should handle query item not found', async () => {
      (QueryItemModel.findById as jest.Mock).mockResolvedValue(null);

      const result = await QueryService.executeQuery(1, { userId: 123 }, 1);

      expect(result.success).toBe(false);
      expect(result.error).toBe('查询项目不存在');
    });

    it('should handle API config not found', async () => {
      (ApiConfigModel.findById as jest.Mock).mockResolvedValue(null);

      const result = await QueryService.executeQuery(1, { userId: 123 }, 1);

      expect(result.success).toBe(false);
      expect(result.error).toBe('API配置不存在');
    });

    it('should handle parameter validation failure', async () => {
      const result = await QueryService.executeQuery(
        1,
        { invalidParam: 'test' }, // Missing required userId
        1
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('查询参数不符合要求');
      expect(result.details).toContain('userId为必填项');
    });

    it('should handle incomplete API configuration', async () => {
      const incompleteConfig = {
        id: 1,
        name: 'Test API',
        authType: 'none',
        headers: '{}',
        timeout: 5000,
        isActive: true
        // Missing baseUrl and apiPath
      };
      
      (ApiConfigModel.findById as jest.Mock).mockResolvedValue(incompleteConfig);

      const result = await QueryService.executeQuery(
        1,
        { userId: 123 },
        1
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('API配置不完整：缺少必要的baseUrl或apiPath配置');
    });

    it('should handle database connection errors', async () => {
      (QueryItemModel.findById as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

      const result = await QueryService.executeQuery(1, { userId: 123 }, 1);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection failed');
    });
  });

  describe('testApiConnection', () => {
    const mockApiConfig = {
      id: 1,
      name: 'Test API',
      baseUrl: 'https://api.example.com',
      apiPath: '/v1',
      authType: 'none',
      headers: '{}',
      timeout: 5000,
      testEndpoint: '/health'
    };

    it('should handle incomplete API configuration', async () => {
      const incompleteConfig = {
        id: 1,
        name: 'Test API',
        authType: 'none',
        headers: '{}',
        timeout: 5000
        // Missing baseUrl, apiPath, testEndpoint
      };

      const result = await QueryService.testApiConnection(incompleteConfig);

      expect(result.success).toBe(false);
      expect(result.error).toBe('API连接测试失败');
    });
  });

  describe('getQueryHistory', () => {
    beforeEach(() => {
      (OrderModel.findByUserId as jest.Mock).mockResolvedValue([
        { id: 1, queryItemId: 1, status: 'completed', createdAt: new Date() },
        { id: 2, queryItemId: 2, status: 'failed', createdAt: new Date() }
      ]);
    });

    it('should get query history successfully', async () => {
      const result = await QueryService.getQueryHistory(1, 10);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(OrderModel.findByUserId).toHaveBeenCalledWith(1);
    });

    it('should handle database errors when getting history', async () => {
      (OrderModel.findByUserId as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await QueryService.getQueryHistory(1, 10);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should use default limit when not specified', async () => {
      await QueryService.getQueryHistory(1);

      expect(OrderModel.findByUserId).toHaveBeenCalledWith(1);
    });

    it('should handle custom limit parameter', async () => {
      await QueryService.getQueryHistory(1, 5);

      expect(OrderModel.findByUserId).toHaveBeenCalledWith(1);
    });

    it('should return empty array when no history found', async () => {
      (OrderModel.findByUserId as jest.Mock).mockResolvedValue([]);

      const result = await QueryService.getQueryHistory(1);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle malformed schema gracefully', () => {
      const params = { name: 'John' };
      const malformedSchema = '{"name": {"required": true, "type": "string"'; // Missing closing brace

      const result = QueryService.validateParams(params, malformedSchema);

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!).toContain('参数验证失败');
    });

    it('should handle empty parameter validation', () => {
      const params = {};
      const schema = [
        { name: 'name', required: false, type: 'string' },
        { name: 'age', required: false, type: 'number' }
      ];

      const result = QueryService.validateParams(params, JSON.stringify(schema));

      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should handle null and undefined parameter values', () => {
      const params = {
        name: null,
        age: undefined,
        active: true
      };

      const schema = [
        { name: 'name', required: false, type: 'string' },
        { name: 'age', required: false, type: 'number' },
        { name: 'active', required: true, type: 'boolean' }
      ];

      const result = QueryService.validateParams(params, JSON.stringify(schema));

      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });
  });
});