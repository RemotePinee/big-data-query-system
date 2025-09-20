import { Request, Response, NextFunction } from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { logger } from '../utils/logger';

// IP白名单中间件
export const ipWhitelist = (allowedIPs: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (allowedIPs.length === 0) {
      return next();
    }

    const clientIP = req.ip || req.connection.remoteAddress || '';
    
    if (!allowedIPs.includes(clientIP)) {
      logger.warn('IP not in whitelist', { ip: clientIP, url: req.url });
      return res.status(403).json({
        code: 403,
        message: 'Access denied: IP not authorized'
      });
    }

    next();
  };
};

// 管理员操作限流
export const adminRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 50, // 限制管理员操作
  message: {
    code: 429,
    message: '管理员操作过于频繁，请稍后再试'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    // 跳过健康检查等路由
    return req.url.includes('/health') || req.url.includes('/ping');
  },
  handler: (req: Request, res: Response) => {
    logger.warn('Admin rate limit exceeded', {
      ip: req.ip,
      url: req.url,
      userAgent: req.get('User-Agent')
    });
    res.status(429).json({
      code: 429,
      message: '管理员操作过于频繁，请稍后再试'
    });
  }
});

// 支付操作限流
export const paymentRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1分钟
  max: 5, // 每分钟最多5次支付请求
  message: {
    code: 429,
    message: '支付请求过于频繁，请稍后再试'
  },
  // 使用默认的IP-based限流，正确处理IPv6
  handler: (req: Request, res: Response) => {
    logger.warn('Payment rate limit exceeded', {
      userId: (req as any).user?.id,
      ip: req.ip,
      url: req.url
    });
    res.status(429).json({
      code: 429,
      message: '支付请求过于频繁，请稍后再试'
    });
  }
});

// 登录尝试限流
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 5, // 每15分钟最多5次登录尝试
  message: {
    code: 429,
    message: '登录尝试过于频繁，请15分钟后再试'
  },
  skipSuccessfulRequests: true, // 成功的请求不计入限制
  handler: (req: Request, res: Response) => {
    logger.warn('Login rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      body: { username: req.body?.username }
    });
    res.status(429).json({
      code: 429,
      message: '登录尝试过于频繁，请15分钟后再试'
    });
  }
});

// 请求大小限制中间件
export const requestSizeLimit = (maxSize: string = '10mb') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = req.get('Content-Length');
    
    if (contentLength) {
      const size = parseInt(contentLength);
      const maxBytes = parseSize(maxSize);
      
      if (size > maxBytes) {
        logger.warn('Request size exceeded', {
          size,
          maxSize,
          ip: req.ip,
          url: req.url
        });
        
        return res.status(413).json({
          code: 413,
          message: `请求大小超出限制 (最大 ${maxSize})`
        });
      }
    }
    
    next();
  };
};

// 解析大小字符串（如 "10mb" -> 字节数）
function parseSize(size: string): number {
  const units: Record<string, number> = {
    b: 1,
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024
  };

  const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*([a-z]+)?$/);
  if (!match) return 0;

  const [, num, unit = 'b'] = match;
  return parseFloat(num) * (units[unit] || 1);
}

// SQL注入防护中间件
export const sqlInjectionProtection = (req: Request, res: Response, next: NextFunction) => {
  const suspiciousPatterns = [
    /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/gi,
    /(--|\/\*|\*\/|;|'|"|`)/g,
    /(\bor\b|\band\b).*?[=<>]/gi
  ];

  const checkValue = (value: any): boolean => {
    if (typeof value === 'string') {
      return suspiciousPatterns.some(pattern => pattern.test(value));
    }
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(checkValue);
    }
    return false;
  };

  // 检查查询参数、请求体和路径参数
  const suspicious = 
    checkValue(req.query) || 
    checkValue(req.body) || 
    checkValue(req.params);

  if (suspicious) {
    logger.warn('Potential SQL injection attempt', {
      ip: req.ip,
      url: req.url,
      query: req.query,
      body: req.body,
      params: req.params,
      userAgent: req.get('User-Agent')
    });

    return res.status(400).json({
      code: 400,
      message: '请求包含非法字符'
    });
  }

  next();
};

// XSS防护中间件
export const xssProtection = (req: Request, res: Response, next: NextFunction) => {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi
  ];

  const sanitizeValue = (value: any): any => {
    if (typeof value === 'string') {
      let sanitized = value;
      xssPatterns.forEach(pattern => {
        sanitized = sanitized.replace(pattern, '');
      });
      return sanitized;
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: any = Array.isArray(value) ? [] : {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  };

  // 清理输入数据
  req.query = sanitizeValue(req.query);
  req.body = sanitizeValue(req.body);
  req.params = sanitizeValue(req.params);

  next();
};

// 请求头验证中间件
export const validateHeaders = (req: Request, res: Response, next: NextFunction) => {
  const userAgent = req.get('User-Agent');
  
  // 检查是否有User-Agent（防止简单的脚本攻击）
  if (!userAgent || userAgent.length < 10) {
    logger.warn('Suspicious request without proper User-Agent', {
      ip: req.ip,
      url: req.url,
      userAgent
    });
  }

  // 检查Content-Type（对于POST/PUT请求）
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.get('Content-Type');
    if (!contentType || (!contentType.includes('application/json') && !contentType.includes('multipart/form-data'))) {
      return res.status(400).json({
        code: 400,
        message: '不支持的Content-Type'
      });
    }
  }

  next();
};

