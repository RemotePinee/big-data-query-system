import * as crypto from 'crypto';

export class EpayHelper {
  /**
   * 生成彩虹易支付MD5签名 - 官方标准算法
   * 根据彩虹易支付官方文档的MD5签名算法
   * @param params 参数对象
   * @param apiKey 商户密钥
   * @returns 签名结果对象 {signature: string, signType: string}
   */
  static generateEpaySign(params: any, apiKey: string): {signature: string, signType: string} {
    console.log('=== 彩虹易支付MD5签名算法 (官方标准) ===');
    console.log('原始参数:', params);
    console.log('商户密钥长度:', apiKey ? apiKey.length : 0);
    
    // 1. 过滤参数：去除空值、sign、sign_type参数
    const filteredParams: any = {};
    Object.keys(params).forEach(key => {
      const value = params[key];
      // 只保留非空值且不是签名相关的参数
      if (value !== '' && value !== null && value !== undefined && 
          key !== 'sign' && key !== 'sign_type') {
        filteredParams[key] = String(value);
      }
    });
    
    console.log('过滤后参数:', filteredParams);
    
    // 2. 按参数名ASCII码从小到大排序（a-z）
    const sortedKeys = Object.keys(filteredParams).sort();
    console.log('排序后的键:', sortedKeys);
    
    // 3. 拼接成URL键值对格式：a=b&c=d&e=f（参数值不进行url编码）
    const pairs: string[] = [];
    sortedKeys.forEach(key => {
      pairs.push(`${key}=${filteredParams[key]}`);
    });
    const stringA = pairs.join('&');
    
    console.log('拼接后的字符串:', stringA);
    
    // 4. 与商户密钥KEY进行拼接：sign = md5(a=b&c=d&e=f + KEY)
    const stringSignTemp = stringA + apiKey;
    console.log('拼接密钥后:', `${stringA} + ${apiKey.substring(0, 8)}****`);
    
    // 5. MD5加密，结果为小写
    const sign = crypto.createHash('md5').update(stringSignTemp, 'utf8').digest('hex').toLowerCase();
    console.log('生成的MD5签名:', sign);
    
    return {
      signature: sign,
      signType: 'MD5'
    };
  }

  /**
   * 验证易支付签名
   * @param params 参数对象
   * @param apiKey API密钥
   * @param receivedSign 接收到的签名
   * @returns 验证结果
   */
  static verifyEpaySign(params: any, apiKey: string, receivedSign: string): boolean {
    const { signature: calculatedSign } = this.generateEpaySign(params, apiKey);
    const result = calculatedSign === receivedSign.toLowerCase();
    console.log('签名验证:', {
      calculated: calculatedSign,
      received: receivedSign.toLowerCase(),
      match: result
    });
    return result;
  }

  /**
   * 构建易支付请求URL
   * @param baseUrl 基础URL
   * @param params 参数对象
   * @returns 完整的请求URL
   */
  static buildEpayUrl(baseUrl: string, params: any): string {
    const queryString = Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');
    
    return `${baseUrl}?${queryString}`;
  }
}
