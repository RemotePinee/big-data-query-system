import * as crypto from 'crypto';

export interface EncryptionConfig {
  algorithm: string;
  key: string;
  mode: 'cbc' | 'ecb' | 'cfb' | 'ofb';
  padding: 'pkcs7' | 'pkcs5' | 'none';
  encoding: 'base64' | 'hex';
}

export class EncryptionUtil {
  /**
   * AES加密
   * @param data 要加密的数据
   * @param config 加密配置
   * @returns 加密后的字符串
   */
  static aesEncrypt(data: string, config: EncryptionConfig): string {
    try {
      // 确保密钥长度正确（AES-128需要16字节）
      let keyBuffer: Buffer;
      
      // 检查密钥是否为16进制格式
      if (/^[0-9a-fA-F]+$/.test(config.key) && config.key.length >= 32) {
        // 16进制密钥，转换为Buffer
        keyBuffer = Buffer.from(config.key.slice(0, 32), 'hex');
      } else {
        // 普通字符串密钥，使用固定长度
        keyBuffer = Buffer.alloc(16);
        Buffer.from(config.key).copy(keyBuffer, 0, 0, Math.min(config.key.length, 16));
      }
      
      // 生成随机IV（16字节）
      const iv = crypto.randomBytes(16);
      
      // 构建算法名称（使用密钥长度确定算法）
      const algorithm = `aes-${keyBuffer.length * 8}-${config.mode}`;
      
      // 对于CBC模式，需要设置IV
      if (config.mode === 'cbc') {
        const cipher = crypto.createCipheriv(algorithm, keyBuffer, iv);
        cipher.setAutoPadding(config.padding !== 'none');
        
        let encrypted = cipher.update(data, 'utf8', 'binary');
        encrypted += cipher.final('binary');
        
        // 将IV和密文拼接
        const combined = Buffer.concat([iv, Buffer.from(encrypted, 'binary')]);
        
        // 根据编码格式返回
        return config.encoding === 'base64' 
          ? combined.toString('base64')
          : combined.toString('hex');
      } else {
        // 其他模式
        let ivBuffer = null;
        if (config.mode !== 'ecb') {
          ivBuffer = iv;
        }
        
        const cipher = crypto.createCipheriv(algorithm, keyBuffer, ivBuffer);
        cipher.setAutoPadding(config.padding !== 'none');
        
        let encrypted = cipher.update(data, 'utf8', config.encoding as BufferEncoding);
        encrypted += cipher.final(config.encoding as BufferEncoding);
        return encrypted;
      }
    } catch (error) {
      console.error('AES加密失败:', error);
      throw new Error('数据加密失败');
    }
  }

  /**
   * AES解密
   * @param encryptedData 加密的数据
   * @param config 解密配置
   * @returns 解密后的字符串
   */
  static aesDecrypt(encryptedData: string, config: EncryptionConfig): string {
    try {
      // 确保密钥长度正确（AES-128需要16字节）
      let keyBuffer: Buffer;
      
      // 检查密钥是否为16进制格式
      if (/^[0-9a-fA-F]+$/.test(config.key) && config.key.length >= 32) {
        // 16进制密钥，转换为Buffer
        keyBuffer = Buffer.from(config.key.slice(0, 32), 'hex');
      } else {
        // 普通字符串密钥，使用固定长度
        keyBuffer = Buffer.alloc(16);
        Buffer.from(config.key).copy(keyBuffer, 0, 0, Math.min(config.key.length, 16));
      }
      
      // 构建算法名称（使用密钥长度确定算法）
      const algorithm = `aes-${keyBuffer.length * 8}-${config.mode}`;
      
      if (config.mode === 'cbc') {
        // 解码数据
        const combined = config.encoding === 'base64'
          ? Buffer.from(encryptedData, 'base64')
          : Buffer.from(encryptedData, 'hex');
        
        // 提取IV（前16字节）
        const iv = combined.slice(0, 16);
        const encrypted = combined.slice(16);
        
        // 创建解密器
        const decipher = crypto.createDecipheriv(algorithm, keyBuffer, iv);
        decipher.setAutoPadding(config.padding !== 'none');
        
        let decrypted = decipher.update(encrypted, undefined, 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
      } else {
        // 其他模式
        let ivBuffer = null;
        if (config.mode !== 'ecb') {
          // 对于非ECB模式，需要从加密数据中提取IV或使用固定IV
          ivBuffer = crypto.randomBytes(16); // 这里应该使用加密时的IV
        }
        
        const decipher = crypto.createDecipheriv(algorithm, keyBuffer, ivBuffer);
        decipher.setAutoPadding(config.padding !== 'none');
        
        let decrypted = decipher.update(encryptedData, config.encoding as BufferEncoding, 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
      }
    } catch (error) {
      console.error('AES解密失败:', error);
      throw new Error('数据解密失败');
    }
  }

  /**
   * 生成动态参数
   * @param dynamicConfig 动态参数配置
   * @returns 生成的参数对象
   */
  static generateDynamicParams(dynamicConfig: string): Record<string, any> {
    try {
      const config = JSON.parse(dynamicConfig);
      const params: Record<string, any> = {};
      
      for (const [key, value] of Object.entries(config)) {
        if (value === 'timestamp') {
          params[key] = Date.now().toString();
        } else if (value === 'timestamp13') {
          params[key] = Date.now().toString();
        } else if (value === 'uuid') {
          params[key] = crypto.randomUUID();
        } else if (typeof value === 'string' && value.startsWith('random:')) {
          const length = parseInt(value.split(':')[1]) || 8;
          params[key] = crypto.randomBytes(length).toString('hex');
        } else {
          params[key] = value;
        }
      }
      
      return params;
    } catch (error) {
      console.error('生成动态参数失败:', error);
      return {};
    }
  }
}