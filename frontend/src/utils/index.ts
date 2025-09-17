/**
 * 格式化日期
 * @param date 日期对象或时间戳
 * @param format 格式化模板，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | number | string, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  const d = new Date(date);
  
  const year = d.getFullYear().toString();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  const hour = d.getHours().toString().padStart(2, '0');
  const minute = d.getMinutes().toString().padStart(2, '0');
  const second = d.getSeconds().toString().padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second);
}

/**
 * 格式化金额
 * @param amount 金额，可以是数字或字符串，单位：元
 * @returns 格式化后的金额字符串，单位：元
 */
export function formatAmount(amount: number | string): string {
  if (amount === null || amount === undefined || amount === '') {
    return '0.00';
  }
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return '0.00';
  }
  
  return numAmount.toFixed(2);
}

/**
 * 格式化订单状态
 * @param status 订单状态
 * @returns 格式化后的状态文本
 */
export function formatOrderStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'pending': '待支付',
    'paid': '已支付',
    'processing': '处理中',
    'completed': '已完成',
    'failed': '查询失败',
    'cancelled': '已取消'
  };
  
  return statusMap[status] || status;
}

/**
 * 保存用户信息到本地存储
 * @param userInfo 用户信息
 */
export function saveUserInfo(userInfo: any): void {
  try {
    // 直接从localStorage获取现有数据，避免调用getUserInfo可能清除数据
    let existingUserInfo: any = {};
    try {
      const existingData = localStorage.getItem('userInfo');
      if (existingData && existingData !== 'null' && existingData !== 'undefined') {
        existingUserInfo = JSON.parse(existingData);
      }
    } catch (e) {
      // 如果解析失败，使用空对象
      existingUserInfo = {};
    }
    
    const mergedUserInfo = {
      ...userInfo,
      // 如果本地有头像信息，保留它
      avatar: existingUserInfo.avatar || userInfo.avatar
    };
    localStorage.setItem('userInfo', JSON.stringify(mergedUserInfo));
  } catch (error) {
    // 如果出现错误，直接保存新的用户信息
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
  }
}

/**
 * 从本地存储获取用户信息
 * @returns 用户信息对象
 */
export function getUserInfo(): any {
  try {
    const userInfo = localStorage.getItem('userInfo');
    
    // 检查各种无效值
    if (!userInfo || 
        userInfo === 'undefined' || 
        userInfo === 'null' || 
        userInfo === '' || 
        userInfo.trim() === '') {
      return null;
    }
    
    // 尝试解析JSON
    const parsed = JSON.parse(userInfo);
    
    // 确保解析结果是有效对象
    if (parsed === null || parsed === undefined) {
      localStorage.removeItem('userInfo');
      return null;
    }
    
    return parsed;
  } catch (error) {
    console.warn('解析用户信息失败:', error);
    // 清理所有可能的无效数据
    localStorage.removeItem('userInfo');
    localStorage.removeItem('token');
    return null;
  }
}

/**
 * 清除用户登录信息
 */
export function clearUserInfo(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('userInfo');
}

/**
 * 检查用户是否已登录
 * @returns 是否已登录
 */
export function isLoggedIn(): boolean {
  return !!localStorage.getItem('token');
}

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 * @returns Promise
 */
export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

/**
 * 生成随机字符串
 * @param length 字符串长度
 * @returns 随机字符串
 */
export function randomString(length: number = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * 初始化本地存储，清理无效数据
 */
export function initializeLocalStorage(): void {
  try {
    // 检查并清理userInfo
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo && (userInfo === 'undefined' || userInfo === 'null' || userInfo.trim() === '')) {
      localStorage.removeItem('userInfo');
    }
    
    // 检查并清理token
    const token = localStorage.getItem('token');
    if (token && (token === 'undefined' || token === 'null' || token.trim() === '')) {
      localStorage.removeItem('token');
    }
    
    console.log('本地存储初始化完成');
  } catch (error) {
    console.warn('初始化本地存储时出错:', error);
  }
}
