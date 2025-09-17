import { pool } from '../config/database';

export interface ApiConfig {
  id?: number;
  name: string;
  provider: string;
  type?: string;
  baseUrl: string;
  apiPath?: string; // API调用路径，如/query、/search等
  apiKey?: string;
  apiKeyName?: string;
  apiKeyLocation?: 'header' | 'query';
  apiSecret?: string;
  token?: string;
  accessId?: string;
  headers?: string | null;
  requestParams?: string | null;
  requestMethod: 'GET' | 'POST' | 'PUT' | 'DELETE';
  requestFormat: 'json' | 'form' | 'query';
  responseFormat?: string;
  // 新增加密相关字段
  encryptionEnabled?: boolean;
  encryptionType?: 'aes' | 'rsa' | 'none';
  encryptionKey?: string;
  encryptionMode?: 'cbc' | 'ecb' | 'cfb' | 'ofb';
  encryptionPadding?: 'pkcs7' | 'pkcs5' | 'none';
  encryptionEncoding?: 'base64' | 'hex';
  // 动态参数支持
  dynamicParams?: string; // JSON格式存储动态参数配置
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ApiConfigModel {
  // 创建API配置
  static async create(apiConfig: ApiConfig): Promise<number> {
    try {
      const [result]: any = await pool.execute(
        `INSERT INTO api_configs (name, provider, type, base_url, api_path, api_key, api_key_name, api_key_location, api_secret, token, access_id, headers, request_params, request_method, request_format, response_format, encryption_enabled, encryption_type, encryption_key, encryption_mode, encryption_padding, encryption_encoding, dynamic_params, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          apiConfig.name,
          apiConfig.provider,
          apiConfig.type || 'other',
          apiConfig.baseUrl,
          apiConfig.apiPath || null,
          apiConfig.apiKey,
          apiConfig.apiKeyName || 'X-API-KEY',
          apiConfig.apiKeyLocation || 'header',
          apiConfig.apiSecret || null,
          apiConfig.token || null,
          apiConfig.accessId || null,
          apiConfig.headers || null,
          apiConfig.requestParams || null,
          apiConfig.requestMethod,
          apiConfig.requestFormat,
          apiConfig.responseFormat,
          apiConfig.encryptionEnabled || false,
          apiConfig.encryptionType || 'none',
          apiConfig.encryptionKey || null,
          apiConfig.encryptionMode || null,
          apiConfig.encryptionPadding || null,
          apiConfig.encryptionEncoding || null,
          apiConfig.dynamicParams || null,
          apiConfig.isActive !== undefined ? apiConfig.isActive : true
        ]
      );
      
      return result.insertId;
    } catch (error) {
      console.error('创建API配置失败:', error);
      throw error;
    }
  }
  
  // 获取所有API配置
  static async findAll(): Promise<ApiConfig[]> {
    try {
      const [rows]: any = await pool.execute(
        `SELECT id, name, provider, type, base_url as baseUrl, api_path as apiPath,
               api_key as apiKey, api_key_name as apiKeyName, 
               api_key_location as apiKeyLocation, api_secret as apiSecret,
               token, access_id as accessId, headers, request_params as requestParams,
               request_method as requestMethod, request_format as requestFormat,
               response_format as responseFormat, 
               encryption_enabled as encryptionEnabled, encryption_type as encryptionType,
               encryption_key as encryptionKey, encryption_mode as encryptionMode,
               encryption_padding as encryptionPadding, encryption_encoding as encryptionEncoding,
               dynamic_params as dynamicParams,
               is_active as isActive, created_at as createdAt, 
               updated_at as updatedAt
        FROM api_configs 
        ORDER BY created_at DESC`
      );
      return rows;
    } catch (error) {
      console.error('获取API配置失败:', error);
      throw error;
    }
  }
  
  // 通过ID查找API配置
  static async findById(id: number): Promise<ApiConfig | null> {
    try {
      const [rows]: any = await pool.execute(
        `SELECT id, name, provider, type, base_url as baseUrl, api_path as apiPath,
             api_key as apiKey, api_key_name as apiKeyName, 
             api_key_location as apiKeyLocation, api_secret as apiSecret,
             token, access_id as accessId, headers, request_params as requestParams,
             request_method as requestMethod, request_format as requestFormat,
             response_format as responseFormat,
             encryption_enabled as encryptionEnabled, encryption_type as encryptionType,
             encryption_key as encryptionKey, encryption_mode as encryptionMode,
             encryption_padding as encryptionPadding, encryption_encoding as encryptionEncoding,
             dynamic_params as dynamicParams,
             is_active as isActive, created_at as createdAt, 
             updated_at as updatedAt
        FROM api_configs 
        WHERE id = ?`,
        [id]
      );
      
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('查找API配置失败:', error);
      throw error;
    }
  }
  
  // 更新API配置
  static async update(id: number, apiConfigData: Partial<ApiConfig>): Promise<boolean> {
    try {
      // 字段名映射
      const fieldMap: Record<string, string> = {
        'name': 'name',
        'provider': 'provider',
        'type': 'type',
        'baseUrl': 'base_url',
        'apiPath': 'api_path',
        'apiKey': 'api_key',
        'apiKeyName': 'api_key_name',
        'apiKeyLocation': 'api_key_location',
        'apiSecret': 'api_secret',
        'token': 'token',
        'accessId': 'access_id',
        'headers': 'headers',
        'requestParams': 'request_params',
        'requestMethod': 'request_method',
        'requestFormat': 'request_format',
        'responseFormat': 'response_format',
        'encryptionEnabled': 'encryption_enabled',
        'encryptionType': 'encryption_type',
        'encryptionKey': 'encryption_key',
        'encryptionMode': 'encryption_mode',
        'encryptionPadding': 'encryption_padding',
        'encryptionEncoding': 'encryption_encoding',
        'dynamicParams': 'dynamic_params',
        'isActive': 'is_active'
      };
      
      // 构建更新语句
      const updateFields: string[] = [];
      const values: any[] = [];
      
      Object.keys(apiConfigData).forEach(key => {
        const dbField = fieldMap[key];
        if (dbField) {
          updateFields.push(`${dbField} = ?`);
          values.push((apiConfigData as any)[key]);
        }
      });
      
      if (updateFields.length === 0) {
        return false; // 没有字段需要更新
      }
      
      values.push(id); // 添加WHERE条件的值
      
      const [result]: any = await pool.execute(
        `UPDATE api_configs SET ${updateFields.join(', ')} WHERE id = ?`,
        values
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('更新API配置失败:', error);
      throw error;
    }
  }
  
  // 查找使用此API配置的查询项目
  static async findRelatedQueryItems(apiConfigId: number): Promise<any[]> {
    try {
      const [rows]: any = await pool.execute(
        `SELECT id, name, code, category FROM query_items WHERE api_config_id = ? AND is_active = 1`,
        [apiConfigId]
      );
      
      return rows;
    } catch (error) {
      console.error('查找相关查询项目失败:', error);
      throw error;
    }
  }

  // 删除API配置（硬删除）
  static async delete(id: number): Promise<boolean> {
    try {
      console.log('执行删除SQL - ID:', id);
      const [result]: any = await pool.execute(
        `DELETE FROM api_configs WHERE id = ?`,
        [id]
      );
      
      console.log('删除SQL执行结果:', {
        affectedRows: result.affectedRows,
        insertId: result.insertId,
        info: result.info,
        serverStatus: result.serverStatus,
        warningStatus: result.warningStatus
      });
      
      const success = result.affectedRows > 0;
      console.log('删除操作结果:', success ? '成功' : '失败 - 没有行被影响');
      
      return success;
    } catch (error) {
      console.error('删除API配置失败 - 数据库错误:', error);
      throw error;
    }
  }
}