import { Request, Response } from 'express';
import { ApiConfigModel, ApiConfig } from '../models/api-config.model';
import axios, { AxiosRequestConfig } from 'axios';
import { EncryptionUtil } from '../utils/encryption.util';

export class ApiConfigController {
  // 获取所有API配置
  static async getApiConfigs(req: Request, res: Response) {
    try {
      const apiConfigs = await ApiConfigModel.findAll();
      
      // 安全解析JSON字段的辅助函数
      const safeJsonParse = (jsonData: any, defaultValue: any = null) => {
        if (!jsonData) return defaultValue;
        
        // 如果已经是对象，直接返回
        if (typeof jsonData === 'object') {
          return jsonData;
        }
        
        // 如果是字符串，尝试解析
        if (typeof jsonData === 'string') {
          try {
            return JSON.parse(jsonData);
          } catch (error) {
            console.warn(`JSON解析失败: ${jsonData}`, error);
            return defaultValue;
          }
        }
        
        return defaultValue;
      };

      // ApiConfigModel.findAll()已经返回驼峰格式的字段，直接使用
      const formattedApiConfigs = apiConfigs.map((config: any) => ({
        id: config.id,
        name: config.name,
        provider: config.provider,
        type: config.type,
        baseUrl: config.baseUrl,
        apiPath: config.apiPath,
        apiKey: config.apiKey,
        apiKeyName: config.apiKeyName,
        apiKeyLocation: config.apiKeyLocation,
        apiSecret: config.apiSecret,
        token: config.token,
        accessId: config.accessId,
        headers: safeJsonParse(config.headers, []),
        requestParams: safeJsonParse(config.requestParams, []),
        requestMethod: config.requestMethod,
        requestFormat: config.requestFormat,
        responseFormat: config.responseFormat,
        encryptionEnabled: config.encryptionEnabled,
        encryptionType: config.encryptionType,
        encryptionKey: config.encryptionKey,
        encryptionMode: config.encryptionMode,
        encryptionPadding: config.encryptionPadding,
        encryptionEncoding: config.encryptionEncoding,
        dynamicParams: safeJsonParse(config.dynamicParams, null),
        isActive: config.isActive,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt
      }));
      
      res.status(200).json({
        success: true,
        code: 200,
        message: '获取API配置列表成功',
        data: formattedApiConfigs
      });
    } catch (error) {
      console.error('获取API配置列表失败:', error);
      res.status(500).json({
        success: false,
        code: 500,
        message: '服务器错误，获取API配置列表失败'
      });
    }
  }
  
  // 获取单个API配置
  static async getApiConfigById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const apiConfig = await ApiConfigModel.findById(parseInt(id));
      
      if (!apiConfig) {
        return res.status(404).json({
          code: 404,
          message: 'API配置不存在'
        });
      }
      
      // 安全解析JSON字段的辅助函数
      const safeJsonParse = (jsonString: string | null, defaultValue: any = null) => {
        if (!jsonString) return defaultValue;
        try {
          return JSON.parse(jsonString);
        } catch (error) {
          console.warn(`JSON解析失败: ${jsonString}`, error);
          return defaultValue;
        }
      };

      // ApiConfigModel.findById()已经返回驼峰格式的字段，直接使用
      const formattedApiConfig = {
        id: (apiConfig as any).id,
        name: (apiConfig as any).name,
        provider: (apiConfig as any).provider,
        type: (apiConfig as any).type,
        baseUrl: (apiConfig as any).baseUrl,
        apiPath: (apiConfig as any).apiPath,
        apiKey: (apiConfig as any).apiKey,
        apiKeyName: (apiConfig as any).apiKeyName,
        apiKeyLocation: (apiConfig as any).apiKeyLocation,
        apiSecret: (apiConfig as any).apiSecret,
        token: (apiConfig as any).token,
        accessId: (apiConfig as any).accessId,
        headers: safeJsonParse((apiConfig as any).headers, []),
        requestParams: safeJsonParse((apiConfig as any).requestParams, []),
        requestMethod: (apiConfig as any).requestMethod,
        requestFormat: (apiConfig as any).requestFormat,
        responseFormat: (apiConfig as any).responseFormat,
        encryptionEnabled: (apiConfig as any).encryptionEnabled,
        encryptionType: (apiConfig as any).encryptionType,
        encryptionKey: (apiConfig as any).encryptionKey,
        encryptionMode: (apiConfig as any).encryptionMode,
        encryptionPadding: (apiConfig as any).encryptionPadding,
        encryptionEncoding: (apiConfig as any).encryptionEncoding,
        dynamicParams: safeJsonParse((apiConfig as any).dynamicParams, null),
        isActive: (apiConfig as any).isActive,
        createdAt: (apiConfig as any).createdAt,
        updatedAt: (apiConfig as any).updatedAt
      };
      
      res.status(200).json({
        code: 200,
        message: '获取API配置成功',
        data: formattedApiConfig
      });
    } catch (error) {
      console.error('获取API配置失败:', error);
      res.status(500).json({
        code: 500,
        message: '服务器错误，获取API配置失败'
      });
    }
  }
  
  // 创建API配置
  static async createApiConfig(req: Request, res: Response) {
    try {
      console.log('收到创建API配置请求，请求体:', JSON.stringify(req.body, null, 2));
      
      const { 
        name, provider, type, baseUrl, apiPath, apiKey, apiKeyName, apiKeyLocation, apiSecret, token, accessId, headers, requestParams, 
        requestMethod, requestFormat, responseFormat, isActive,
        encryptionEnabled, encryptionType, encryptionKey, encryptionMode, encryptionPadding, encryptionEncoding,
        dynamicParams
      } = req.body;
      
      // 只验证必填字段
      if (!name || !provider || !baseUrl || !requestMethod) {
        console.log('必填字段验证失败:', { name, provider, baseUrl, requestMethod });
        return res.status(400).json({
          success: false,
          code: 400,
          message: '必填字段不能为空：name, provider, baseUrl, requestMethod'
        });
      }
      
      const apiConfig: ApiConfig = {
        name,
        provider,
        type: type || 'other',
        baseUrl,
        apiPath: apiPath || null,
        apiKey: apiKey || null,
        apiKeyName: apiKeyName || 'X-API-KEY',
        apiKeyLocation: apiKeyLocation || 'header',
        apiSecret: apiSecret || null,
        token: token || null,
        accessId: accessId || null,
        headers: headers ? JSON.stringify(headers) : null,
        requestParams: requestParams ? JSON.stringify(requestParams) : null,
        requestMethod: requestMethod || 'GET',
        requestFormat: requestFormat || 'json',
        responseFormat: responseFormat || '',
        isActive: isActive !== undefined ? isActive : true,
        // 加密相关字段
        encryptionEnabled: encryptionEnabled || false,
        encryptionType: encryptionType || 'none',
        encryptionKey: encryptionKey || null,
        encryptionMode: encryptionMode || null,
        encryptionPadding: encryptionPadding || null,
        encryptionEncoding: encryptionEncoding || null,
        // 动态参数
        dynamicParams: dynamicParams || null
      };
      
      console.log('准备创建的API配置数据:', JSON.stringify(apiConfig, null, 2));
      
      const apiConfigId = await ApiConfigModel.create(apiConfig);
      
      console.log('API配置创建成功，ID:', apiConfigId);
      
      res.status(201).json({
        success: true,
        code: 201,
        message: '创建API配置成功',
        data: {
          id: apiConfigId,
          ...apiConfig
        }
      });
    } catch (error) {
      console.error('创建API配置失败，详细错误:', error);
      console.error('错误堆栈:', error instanceof Error ? error.stack : '无堆栈信息');
      res.status(500).json({
        success: false,
        code: 500,
        message: '服务器错误，创建API配置失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }
  
  // 更新API配置
  static async updateApiConfig(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { 
        name, provider, type, baseUrl, apiPath, apiKey, apiKeyName, apiKeyLocation, apiSecret, token, accessId, headers, requestParams, 
        requestMethod, requestFormat, responseFormat, isActive,
        encryptionEnabled, encryptionType, encryptionKey, encryptionMode, encryptionPadding, encryptionEncoding,
        dynamicParams
      } = req.body;
      
      // 查找API配置
      const apiConfig = await ApiConfigModel.findById(parseInt(id));
      
      if (!apiConfig) {
        return res.status(404).json({
          success: false,
          code: 404,
          message: 'API配置不存在'
        });
      }
      
      // 更新API配置
      const apiConfigData: Partial<ApiConfig> = {};
      
      if (name !== undefined) apiConfigData.name = name;
      if (provider !== undefined) apiConfigData.provider = provider;
      if (type !== undefined) apiConfigData.type = type;
      if (baseUrl !== undefined) apiConfigData.baseUrl = baseUrl;
      if (apiPath !== undefined) apiConfigData.apiPath = apiPath;
      if (apiKey !== undefined) apiConfigData.apiKey = apiKey;
      if (apiKeyName !== undefined) apiConfigData.apiKeyName = apiKeyName;
      if (apiKeyLocation !== undefined) apiConfigData.apiKeyLocation = apiKeyLocation;
      if (apiSecret !== undefined) apiConfigData.apiSecret = apiSecret;
      if (token !== undefined) apiConfigData.token = token;
      if (accessId !== undefined) apiConfigData.accessId = accessId;
      if (headers !== undefined) apiConfigData.headers = headers ? JSON.stringify(headers) : null;
      if (requestParams !== undefined) apiConfigData.requestParams = requestParams ? JSON.stringify(requestParams) : null;
      if (requestMethod !== undefined) apiConfigData.requestMethod = requestMethod;
      if (requestFormat !== undefined) apiConfigData.requestFormat = requestFormat;
      if (responseFormat !== undefined) apiConfigData.responseFormat = responseFormat;
      if (isActive !== undefined) apiConfigData.isActive = isActive;
      // 加密相关字段
      if (encryptionEnabled !== undefined) apiConfigData.encryptionEnabled = encryptionEnabled;
      if (encryptionType !== undefined) apiConfigData.encryptionType = encryptionType;
      if (encryptionKey !== undefined) apiConfigData.encryptionKey = encryptionKey;
      if (encryptionMode !== undefined) apiConfigData.encryptionMode = encryptionMode;
      if (encryptionPadding !== undefined) apiConfigData.encryptionPadding = encryptionPadding;
      if (encryptionEncoding !== undefined) apiConfigData.encryptionEncoding = encryptionEncoding;
      // 动态参数
      if (dynamicParams !== undefined) apiConfigData.dynamicParams = dynamicParams;
      
      await ApiConfigModel.update(parseInt(id), apiConfigData);
      
      res.status(200).json({
        success: true,
        code: 200,
        message: '更新API配置成功',
        data: {
          id: parseInt(id),
          ...apiConfig,
          ...apiConfigData
        }
      });
    } catch (error) {
      console.error('更新API配置失败:', error);
      res.status(500).json({
        success: false,
        code: 500,
        message: '服务器错误，更新API配置失败'
      });
    }
  }

  // 删除API配置
  static async deleteApiConfig(req: Request, res: Response) {
    try {
      const { id } = req.params;
      console.log('删除API配置请求 - ID:', id);
      
      // 验证ID是否为有效数字
      const configId = parseInt(id);
      if (isNaN(configId)) {
        console.log('无效的API配置ID:', id);
        return res.status(400).json({
          success: false,
          code: 400,
          message: '无效的API配置ID'
        });
      }
      
      // 查找API配置
      console.log('查找API配置 - ID:', configId);
      const apiConfig = await ApiConfigModel.findById(configId);
      console.log('查找结果:', apiConfig ? '找到配置' : '配置不存在');
      
      if (!apiConfig) {
        return res.status(404).json({
          success: false,
          code: 404,
          message: 'API配置不存在'
        });
      }
      
      // 检查是否有查询项目引用此API配置
      console.log('检查关联的查询项目 - API配置ID:', configId);
      const relatedQueryItems = await ApiConfigModel.findRelatedQueryItems(configId);
      console.log('关联的查询项目数量:', relatedQueryItems.length);
      
      if (relatedQueryItems.length > 0) {
        const queryItemNames = relatedQueryItems.map(item => item.name).join(', ');
        return res.status(400).json({
          success: false,
          code: 400,
          message: `无法删除API配置，以下查询项目正在使用此配置：${queryItemNames}。请先删除或修改这些查询项目。`,
          relatedItems: relatedQueryItems
        });
      }
      
      // 删除API配置（硬删除）
      console.log('开始删除API配置 - ID:', configId);
      const deleteResult = await ApiConfigModel.delete(configId);
      console.log('删除结果:', deleteResult ? '删除成功' : '删除失败');
      
      if (!deleteResult) {
        return res.status(500).json({
          success: false,
          code: 500,
          message: '删除API配置失败'
        });
      }
      
      res.status(200).json({
        success: true,
        code: 200,
        message: '删除API配置成功'
      });
    } catch (error) {
      console.error('删除API配置失败 - 详细错误:', error);
      
      // 检查是否是外键约束错误
      if (error instanceof Error && error.message.includes('foreign key constraint fails')) {
        return res.status(400).json({
          success: false,
          code: 400,
          message: '无法删除API配置，该配置正在被查询项目使用。请先删除或修改相关的查询项目。'
        });
      }
      
      res.status(500).json({
        success: false,
        code: 500,
        message: '服务器错误，删除API配置失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  // 测试API配置
  static async testApiConfig(req: Request, res: Response) {
    try {
      const { 
        url, 
        method, 
        headers, 
        params, 
        auth, 
        encryption,
        dynamicParams 
      } = req.body;
      
      if (!url || !method) {
        return res.status(400).json({
          success: false,
          code: 400,
          message: 'URL和请求方法不能为空'
        });
      }

      let finalUrl = url;
      let requestData = params;

      // 处理动态参数
      if (dynamicParams) {
        const dynamicValues = EncryptionUtil.generateDynamicParams(dynamicParams);
        
        // 将动态参数添加到URL查询参数中
        const urlObj = new URL(finalUrl);
        Object.entries(dynamicValues).forEach(([key, value]) => {
          urlObj.searchParams.set(key, value as string);
        });
        finalUrl = urlObj.toString();
      }

      // 处理数据加密
      if (encryption && encryption.enabled && requestData) {
        try {
          const encryptionConfig = {
            algorithm: 'aes-128-cbc',
            key: encryption.key,
            mode: encryption.mode || 'cbc',
            padding: encryption.padding || 'pkcs7',
            encoding: encryption.encoding || 'base64'
          };

          // 加密请求数据
          const dataToEncrypt = JSON.stringify(requestData);
          const encryptedData = EncryptionUtil.aesEncrypt(dataToEncrypt, encryptionConfig);
          
          // 将加密数据包装在data字段中
          requestData = { data: encryptedData };
        } catch (encryptError) {
          console.error('数据加密失败:', encryptError);
          return res.status(400).json({
            success: false,
            code: 400,
            message: '数据加密失败',
            error: encryptError instanceof Error ? encryptError.message : '加密错误'
          });
        }
      }

      // 构建请求配置
      const config: AxiosRequestConfig = {
        url: finalUrl,
        method: method.toLowerCase(),
        timeout: 10000, // 10秒超时
        validateStatus: () => true, // 接受所有状态码
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      };

      // 添加认证信息
      console.log('认证信息:', auth);
      if (auth) {
        if (auth.apiKey) {
          const apiKeyName = auth.apiKeyName || 'X-API-Key';
          const apiKeyLocation = auth.apiKeyLocation || 'header';
          
          if (apiKeyLocation === 'header') {
            // 特殊处理Authorization Bearer格式
            if (apiKeyName === 'Authorization') {
              config.headers = { ...config.headers, [apiKeyName]: `Bearer ${auth.apiKey}` };
              console.log(`添加Authorization Bearer认证`);
            } else {
              config.headers = { ...config.headers, [apiKeyName]: auth.apiKey };
              console.log(`添加API Key认证到请求头: ${apiKeyName}`);
            }
          } else if (apiKeyLocation === 'query') {
            if (!config.params) config.params = {};
            config.params[apiKeyName] = auth.apiKey;
            console.log(`添加API Key认证到查询参数: ${apiKeyName}`);
          }
        }
        if (auth.token) {
          config.headers = { ...config.headers, 'Authorization': `Bearer ${auth.token}` };
          console.log('添加Bearer Token认证');
        }
        if (auth.apiSecret) {
          config.headers = { ...config.headers, 'X-API-Secret': auth.apiSecret };
          console.log('添加API Secret认证');
        }
        if (auth.accessId) {
          config.headers = { ...config.headers, 'Access-Id': auth.accessId };
          console.log('添加Access-Id认证:', auth.accessId);
        }
      }

      // 添加自定义请求头
      console.log('自定义请求头:', headers);
      if (headers && typeof headers === 'object') {
        config.headers = { ...config.headers, ...headers };
        console.log('已添加自定义请求头');
      }

      // 添加请求参数
      if (requestData && typeof requestData === 'object') {
        if (method.toUpperCase() === 'GET') {
          config.params = requestData;
        } else {
          // 对于POST请求，将数据转换为URL编码格式
          const urlSearchParams = new URLSearchParams();
          Object.entries(requestData).forEach(([key, value]) => {
            urlSearchParams.append(key, String(value));
          });
          config.data = urlSearchParams.toString();
        }
      }

      // 发送API请求

      // 发送请求
      const startTime = Date.now();
      const response = await axios(config);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      let responseData = response.data;

      // 处理响应解密
      if (encryption && encryption.enabled && response.data && response.data.data) {
        try {
          const encryptionConfig = {
            algorithm: 'aes-128-cbc',
            key: encryption.key,
            mode: encryption.mode || 'cbc',
            padding: encryption.padding || 'pkcs7',
            encoding: encryption.encoding || 'base64'
          };

          // 解密响应数据
          const decryptedData = EncryptionUtil.aesDecrypt(response.data.data, encryptionConfig);
          responseData = {
            ...response.data,
            data: JSON.parse(decryptedData),
            _decrypted: true
          };
        } catch (decryptError) {
          console.error('响应解密失败:', decryptError);
          responseData = {
            ...response.data,
            _decryptError: decryptError instanceof Error ? decryptError.message : '解密失败'
          };
        }
      }

      // 返回测试结果
      res.status(200).json({
        success: true,
        code: 200,
        message: 'API测试完成',
        data: {
          success: response.status >= 200 && response.status < 300,
          status: response.status,
          statusText: response.statusText,
          responseTime: `${responseTime}ms`,
          headers: response.headers,
          data: responseData,
          config: {
            url: config.url,
            method: config.method,
            headers: config.headers
          }
        }
      });
    } catch (error) {
      console.error('API测试失败:', error);
      
      let errorMessage = '未知错误';
      let errorDetails: any = {};

      if (axios.isAxiosError(error)) {
        if (error.response) {
          // 服务器响应了错误状态码
          errorMessage = `请求失败，状态码: ${error.response.status}`;
          errorDetails = {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
            headers: error.response.headers
          };
        } else if (error.request) {
          // 请求已发出但没有收到响应
          errorMessage = '请求超时或网络错误';
          errorDetails = {
            code: error.code,
            message: error.message
          };
        } else {
          // 请求配置错误
          errorMessage = '请求配置错误';
          errorDetails = {
            message: error.message
          };
        }
      } else {
        errorMessage = error instanceof Error ? error.message : '未知错误';
      }

      res.status(200).json({
        success: true,
        code: 200,
        message: 'API测试完成',
        data: {
          success: false,
          error: errorMessage,
          details: errorDetails
        }
      });
    }
  }
}