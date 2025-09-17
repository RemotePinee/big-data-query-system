import axios, { AxiosInstance } from 'axios';
import { ApiConfigModel } from '../models/api-config.model';
import { QueryItemModel } from '../models/query-item.model';
import { OrderModel } from '../models/order.model';

export interface QueryParams {
  [key: string]: any;
}

export interface QueryResult {
  success: boolean;
  data?: any;
  error?: string;
  errorType?: string;
  details?: string[] | any;
  apiResponse?: any;
}

export class QueryService {
  // 执行查询
  static async executeQuery(
    queryItemId: number, 
    params: QueryParams, 
    userId: number
  ): Promise<QueryResult> {
    try {
      console.log('=== QueryService.executeQuery 开始 ===');
      console.log('输入参数:');
      console.log('- queryItemId:', queryItemId);
      console.log('- params:', params);
      console.log('- userId:', userId);

      // 获取查询项目配置
      const queryItem = await QueryItemModel.findById(queryItemId);
      if (!queryItem) {
        return { success: false, error: '查询项目不存在' };
      }
      
      console.log('查询项目配置:', {
        id: queryItem.id,
        name: queryItem.name,
        paramsSchema: queryItem.paramsSchema,
        apiConfigId: queryItem.apiConfigId
      });

      // 验证查询参数
      const validation = this.validateParams(params, queryItem.paramsSchema);
      console.log('参数验证结果:', validation);
      
      if (!validation.valid) {
        return { success: false, error: '查询参数不符合要求', details: validation.errors };
      }

      // 获取API配置
      const apiConfig = await ApiConfigModel.findById(queryItem.apiConfigId);
      if (!apiConfig) {
        return { success: false, error: 'API配置不存在' };
      }
      
      // 验证API配置的完整性
      if (!apiConfig.baseUrl || !apiConfig.apiPath) {
        return { 
          success: false, 
          error: 'API配置不完整：缺少必要的baseUrl或apiPath配置',
          errorType: 'config_invalid'
        };
      }
      
      console.log('API配置:', {
        id: apiConfig.id,
        name: apiConfig.name,
        baseUrl: apiConfig.baseUrl,
        apiPath: apiConfig.apiPath,
        requestMethod: apiConfig.requestMethod
      });

      // 创建API实例
      const apiInstance = this.createApiInstance(apiConfig);

      // 构建请求参数
      const requestParams = this.buildRequestParams(params, queryItem.paramsSchema, apiConfig);
      console.log('构建的请求参数:', requestParams);

      // 调用第三方API
      console.log('调用第三方API...');
      const apiPath = apiConfig.apiPath || '';
      const apiResponse = await this.callThirdPartyApi(
        apiInstance, 
        apiPath, 
        requestParams,
        apiConfig
      );
      
      console.log('API响应:', apiResponse.data);

      // 处理API响应
      const processedData = this.processApiResponse(apiResponse.data, queryItem);

      return {
        success: true,
        data: processedData,
        apiResponse: apiResponse.data
      };

    } catch (error) {
      console.error('查询执行失败:', error);
      
      // 详细的错误分类和提示
      let errorMessage = '查询执行失败';
      let errorType = 'unknown';
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
          errorMessage = 'API服务器连接失败，请检查API配置中的服务器地址是否正确';
          errorType = 'connection_error';
        } else if (error.code === 'ETIMEDOUT') {
          errorMessage = 'API请求超时，服务器响应时间过长';
          errorType = 'timeout_error';
        } else if (error.response) {
          const status = error.response.status;
          if (status === 401) {
            errorMessage = 'API认证失败，请检查API密钥或访问令牌是否正确';
            errorType = 'auth_error';
          } else if (status === 403) {
            errorMessage = 'API访问被拒绝，请检查账户权限或API配置';
            errorType = 'permission_error';
          } else if (status === 404) {
            errorMessage = 'API接口不存在，请检查API路径配置是否正确';
            errorType = 'api_not_found';
          } else if (status >= 500) {
            errorMessage = 'API服务器内部错误，请稍后重试或联系API服务提供商';
            errorType = 'server_error';
          } else {
            const responseError = error.response.data?.message || error.response.data?.error || error.response.statusText;
            errorMessage = `API返回错误 (${status}): ${responseError}`;
            errorType = 'api_error';
          }
        } else {
          errorMessage = `网络请求失败: ${error.message}`;
          errorType = 'network_error';
        }
      } else if (error instanceof Error) {
        if (error.message.includes('API配置不存在')) {
          errorMessage = 'API配置不存在，请联系管理员检查查询项目的API配置';
          errorType = 'config_missing';
        } else {
          errorMessage = error.message;
          errorType = 'general_error';
        }
      }
      
      return { 
        success: false, 
        error: errorMessage,
        errorType: errorType
      };
    }
  }

  // 创建API实例
  private static createApiInstance(apiConfig: any): AxiosInstance {
    const instance = axios.create({
      baseURL: apiConfig.baseUrl,
      timeout: 60000, // 增加到60秒，提高查询成功率
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'DataQuery-System/1.0'
      }
    });

    // 先处理配置的认证字段（优先级较低）
    const authHeaders: { [key: string]: string } = {};
    
    if (apiConfig.apiKey) {
      const keyName = apiConfig.apiKeyName || 'X-API-KEY';
      authHeaders[keyName] = apiConfig.apiKey;
    }

    if (apiConfig.apiSecret) {
      // 对于阿里云市场API，使用APPCODE格式
      if (apiConfig.baseUrl && apiConfig.baseUrl.includes('alicloudapi.com')) {
        authHeaders['Authorization'] = `APPCODE ${apiConfig.apiSecret}`;
      } else {
        authHeaders['X-API-SECRET'] = apiConfig.apiSecret;
      }
    }

    if (apiConfig.token) {
      authHeaders['Authorization'] = `Bearer ${apiConfig.token}`;
    }

    if (apiConfig.accessId) {
      authHeaders['Access-Id'] = apiConfig.accessId;
    }

    // 应用配置的认证字段
    Object.assign(instance.defaults.headers, authHeaders);

    // 处理自定义headers（优先级更高，会覆盖同名的认证字段）
    if (apiConfig.headers) {
      try {
        const customHeaders = typeof apiConfig.headers === 'string' 
          ? JSON.parse(apiConfig.headers) 
          : apiConfig.headers;
        
        // 如果是数组格式（前端表单格式），转换为对象
        if (Array.isArray(customHeaders)) {
          for (const header of customHeaders) {
            if (header.name && header.value) {
              // 自定义headers优先级更高，直接覆盖
              instance.defaults.headers[header.name] = header.value;
              console.log(`应用自定义请求头: ${header.name} = ${header.value}`);
            }
          }
        } else if (typeof customHeaders === 'object' && customHeaders !== null) {
          // 如果是对象格式，直接合并（覆盖同名字段）
          Object.assign(instance.defaults.headers, customHeaders);
          console.log('应用自定义请求头对象:', customHeaders);
        }
      } catch (error) {
        console.warn('解析自定义headers失败:', error);
      }
    }

    // 输出最终的认证信息用于调试
    const finalAuthHeaders = Object.keys(instance.defaults.headers)
      .filter(key => key.toLowerCase().includes('auth') || key.toLowerCase().includes('key') || key.toLowerCase().includes('token') || key.toLowerCase().includes('secret'))
      .reduce((obj: any, key) => {
        obj[key] = instance.defaults.headers[key];
        return obj;
      }, {});
    
    if (Object.keys(finalAuthHeaders).length > 0) {
      console.log('最终认证请求头:', finalAuthHeaders);
    }

    // 请求拦截器
    instance.interceptors.request.use(
      (config) => {
        console.log(`API请求: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('API请求错误:', error);
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    instance.interceptors.response.use(
      (response) => {
        console.log(`API响应: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('API响应错误:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );

    return instance;
  }

  // 验证查询参数
  static validateParams(params: QueryParams, schema: any): { valid: boolean; errors?: string[] } {
    if (!schema) return { valid: true };
    
    try {
      const parsedSchema = typeof schema === 'string' ? JSON.parse(schema) : schema;
      
      if (!Array.isArray(parsedSchema)) return { valid: true };

      const errors: string[] = [];

      // 验证必填参数
      for (const field of parsedSchema) {
        if (field.required && (!params[field.name] || params[field.name] === '')) {
          errors.push(`${field.label || field.name}为必填项`);
        }

        // 验证参数类型
        if (params[field.name] && field.type) {
          if (!this.validateParamType(params[field.name], field.type)) {
            errors.push(`${field.label || field.name}类型错误，期望: ${field.type}`);
          }
        }

        // 验证字段长度
        if (params[field.name] && field.minLength && String(params[field.name]).length < field.minLength) {
          errors.push(`${field.label || field.name}长度不能小于${field.minLength}`);
        }

        if (params[field.name] && field.maxLength && String(params[field.name]).length > field.maxLength) {
          errors.push(`${field.label || field.name}长度不能大于${field.maxLength}`);
        }

        // 验证正则表达式
        if (params[field.name] && field.pattern && !new RegExp(field.pattern).test(String(params[field.name]))) {
          errors.push(`${field.label || field.name}格式不正确`);
        }
      }

      return {
        valid: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (error) {
      console.error('参数验证失败:', error);
      return {
        valid: false,
        errors: ['参数验证失败']
      };
    }
  }

  // 验证参数类型
  private static validateParamType(value: any, expectedType: string): boolean {
    switch (expectedType.toLowerCase()) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' || !isNaN(Number(value));
      case 'boolean':
        return typeof value === 'boolean';
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'phone':
        return /^1[3-9]\d{9}$/.test(value);
      case 'idcard':
        return /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(value);
      default:
        return true;
    }
  }

  // 构建请求参数
  private static buildRequestParams(params: QueryParams, schema: any, apiConfig?: any): any {
    try {
      const parsedSchema = typeof schema === 'string' ? JSON.parse(schema) : schema;
      const requestParams: any = {};

      // 首先添加API配置中的固定参数
      if (apiConfig && apiConfig.requestParams) {
        try {
          const apiRequestParams = typeof apiConfig.requestParams === 'string' 
            ? JSON.parse(apiConfig.requestParams) 
            : apiConfig.requestParams;
          
          if (Array.isArray(apiRequestParams)) {
            // 如果API配置的参数是数组格式，需要转换为键值对
            for (const param of apiRequestParams) {
              if (param.name && param.testValue !== undefined) {
                requestParams[param.name] = param.testValue;
              }
            }
            console.log('已添加API配置中的固定参数:', apiRequestParams);
          } else if (typeof apiRequestParams === 'object' && apiRequestParams !== null) {
            Object.assign(requestParams, apiRequestParams);
            console.log('已添加API配置中的固定参数:', apiRequestParams);
          }
        } catch (error) {
          console.error('解析API配置requestParams失败:', error);
        }
      }

      // 然后根据查询项目的参数模式添加用户输入的参数
      if (Array.isArray(parsedSchema)) {
        for (const field of parsedSchema) {
          if (params[field.name] !== undefined) {
            // 根据字段配置转换参数
            const paramName = field.apiName || field.name;
            const paramValue = this.transformParamValue(
              params[field.name], 
              field.transform
            );
            
            // 用户输入的参数会覆盖API配置中的同名参数
            requestParams[paramName] = paramValue;
          }
        }
      } else {
        // 如果schema不是数组，直接合并用户参数
        Object.assign(requestParams, params);
      }

      console.log('最终构建的请求参数:', requestParams);
      return requestParams;
    } catch (error) {
      console.error('构建请求参数失败:', error);
      return params;
    }
  }

  // 转换参数值
  private static transformParamValue(value: any, transform?: string): any {
    if (!transform) return value;

    switch (transform) {
      case 'uppercase':
        return String(value).toUpperCase();
      case 'lowercase':
        return String(value).toLowerCase();
      case 'trim':
        return String(value).trim();
      case 'number':
        return Number(value);
      default:
        return value;
    }
  }

  // 调用第三方API
  private static async callThirdPartyApi(
    apiInstance: AxiosInstance, 
    path: string, 
    params: any,
    apiConfig?: any
  ): Promise<any> {
    try {
      console.log('调用第三方API:', {
        path: path,
        params: params,
        method: apiConfig?.requestMethod || 'POST',
        format: apiConfig?.requestFormat || 'json'
      });

      // 根据API配置决定请求方法和格式
      const method = (apiConfig?.requestMethod || 'POST').toLowerCase();
      const format = apiConfig?.requestFormat || 'json';
      
      let response;
      
      switch (method) {
        case 'get':
          // GET请求，参数放在query string中
          response = await apiInstance.get(path, { params });
          break;
          
        case 'post':
          if (format === 'form') {
            // 表单格式
            const formData = new URLSearchParams();
            Object.keys(params).forEach(key => {
              formData.append(key, params[key]);
            });
            response = await apiInstance.post(path, formData, {
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
          } else if (format === 'query') {
            // 查询字符串格式（POST但参数在URL中）
            response = await apiInstance.post(path, null, { params });
          } else {
            // 默认JSON格式
            response = await apiInstance.post(path, params);
          }
          break;
          
        case 'put':
          response = await apiInstance.put(path, params);
          break;
          
        case 'delete':
          response = await apiInstance.delete(path, { params });
          break;
          
        default:
          response = await apiInstance.post(path, params);
      }
      
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMsg = error.response?.data?.message || error.response?.statusText || error.message;
        throw new Error(`API调用失败: ${error.response?.status} ${errorMsg}`);
      }
      throw error;
    }
  }

  // 处理API响应
  private static processApiResponse(apiData: any, queryItem: any): any {
    try {
      // 如果有结果模板，使用模板处理数据
      if (queryItem.result_template) {
        const template = typeof queryItem.result_template === 'string' 
          ? JSON.parse(queryItem.result_template) 
          : queryItem.result_template;
        
        return this.applyResultTemplate(apiData, template);
      }

      // 智能提取有用数据
      let extractedData = apiData;
      
      // 如果响应格式是 {code: 0, data: {...}}
      if (apiData && typeof apiData === 'object' && apiData.data) {
        extractedData = apiData.data;
        
        // 如果还有嵌套的data字段
        if (extractedData && typeof extractedData === 'object' && extractedData.data) {
          extractedData = extractedData.data;
          
          // 如果还有更深层的data字段
          if (extractedData && typeof extractedData === 'object' && extractedData.data) {
            extractedData = extractedData.data;
          }
        }
      }
      
      console.log('提取的数据:', extractedData);
      return extractedData;
    } catch (error) {
      console.error('处理API响应失败:', error);
      return apiData;
    }
  }

  // 应用结果模板
  private static applyResultTemplate(data: any, template: any): any {
    if (!template || !template.fields) return data;

    const result: any = {};

    for (const field of template.fields) {
      const value = this.extractFieldValue(data, field.path);
      result[field.name] = this.formatFieldValue(value, field.format);
    }

    return result;
  }

  // 提取字段值
  private static extractFieldValue(data: any, path: string): any {
    if (!path) return null;

    const keys = path.split('.');
    let value = data;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return null;
      }
    }

    return value;
  }

  // 格式化字段值
  private static formatFieldValue(value: any, format?: string): any {
    if (value === null || value === undefined) return null;

    if (!format) return value;

    switch (format) {
      case 'date': {
        const date = new Date(value);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
      case 'datetime': {
        const date = new Date(value);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      }
      case 'currency':
        return `¥${Number(value).toFixed(2)}`;
      case 'percentage':
        return `${(Number(value) * 100).toFixed(2)}%`;
      default:
        return value;
    }
  }

  // 测试API连接
  static async testApiConnection(apiConfig: any): Promise<QueryResult> {
    try {
      const apiInstance = this.createApiInstance(apiConfig);
      
      // 发送测试请求
      const response = await apiInstance.get('/health', {
        timeout: 10000
      });

      return {
        success: true,
        data: {
          status: 'connected',
          responseTime: Date.now(),
          statusCode: response.status
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'API连接测试失败'
      };
    }
  }

  // 获取查询历史
  static async getQueryHistory(userId: number, limit: number = 10): Promise<any[]> {
    try {
      const result = await OrderModel.findByUserId(userId);
      return result.map((order: any) => ({
        id: order.id,
        queryItemName: order.query_item_name,
        queryParams: order.queryParams,
        resultData: order.queryResult,
        status: order.status,
        createdAt: order.createdAt
      }));
    } catch (error) {
      console.error('获取查询历史失败:', error);
      return [];
    }
  }
}