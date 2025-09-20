import fs from 'fs';
import path from 'path';

export enum LogLevel {
  SILENT = -1,
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  meta?: any;
  requestId?: string;
  userId?: string;
}

class Logger {
  private logLevel: LogLevel;
  private logDir: string;
  private logFile: string;

  constructor() {
    this.logLevel = this.getLogLevel();
    this.logDir = process.env.LOG_DIR || path.join(__dirname, '../../logs');
    this.logFile = process.env.LOG_FILE || 'app.log';
    
    // 确保日志目录存在
    this.ensureLogDir();
  }

  private getLogLevel(): LogLevel {
    const level = process.env.LOG_LEVEL?.toLowerCase() || 'info';
    switch (level) {
      case 'silent': return LogLevel.SILENT;
      case 'error': return LogLevel.ERROR;
      case 'warn': return LogLevel.WARN;
      case 'info': return LogLevel.INFO;
      case 'debug': return LogLevel.DEBUG;
      default: return LogLevel.INFO;
    }
  }

  private ensureLogDir(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private formatLogEntry(level: string, message: string, meta?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      meta,
    };
  }

  private writeToFile(logEntry: LogEntry): void {
    const logPath = path.join(this.logDir, this.logFile);
    const logLine = JSON.stringify(logEntry) + '\n';
    
    try {
      fs.appendFileSync(logPath, logLine);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  private shouldLog(level: LogLevel): boolean {
    // 如果是 SILENT 模式，不输出任何日志
    if (this.logLevel === LogLevel.SILENT) {
      return false;
    }
    return level <= this.logLevel;
  }

  private log(level: LogLevel, levelName: string, message: string, meta?: any): void {
    if (!this.shouldLog(level)) return;

    const logEntry = this.formatLogEntry(levelName, message, meta);
    
    // 控制台输出（开发环境，但不在SILENT模式下）
    if (process.env.NODE_ENV !== 'production' && this.logLevel !== LogLevel.SILENT) {
      const consoleMessage = `[${logEntry.timestamp}] ${logEntry.level}: ${logEntry.message}`;
      switch (level) {
        case LogLevel.ERROR:
          console.error(consoleMessage, meta || '');
          break;
        case LogLevel.WARN:
          console.warn(consoleMessage, meta || '');
          break;
        case LogLevel.INFO:
          console.info(consoleMessage, meta || '');
          break;
        case LogLevel.DEBUG:
          console.debug(consoleMessage, meta || '');
          break;
      }
    }

    // 文件输出
    this.writeToFile(logEntry);
  }

  error(message: string, meta?: any): void {
    this.log(LogLevel.ERROR, 'error', message, meta);
  }

  warn(message: string, meta?: any): void {
    this.log(LogLevel.WARN, 'warn', message, meta);
  }

  info(message: string, meta?: any): void {
    this.log(LogLevel.INFO, 'info', message, meta);
  }

  debug(message: string, meta?: any): void {
    this.log(LogLevel.DEBUG, 'debug', message, meta);
  }

  // HTTP请求日志
  logRequest(req: any, res: any, responseTime: number): void {
    const logEntry = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      userId: req.user?.id,
    };

    this.info('HTTP Request', logEntry);
  }

  // 数据库操作日志
  logDatabase(operation: string, table: string, duration: number, error?: any): void {
    const logEntry = {
      operation,
      table,
      duration: `${duration}ms`,
      error: error?.message,
    };

    if (error) {
      this.error('Database Error', logEntry);
    } else {
      this.debug('Database Operation', logEntry);
    }
  }

  // 支付操作日志
  logPayment(action: string, orderId: string, amount?: number, error?: any): void {
    const logEntry = {
      action,
      orderId,
      amount,
      error: error?.message,
    };

    if (error) {
      this.error('Payment Error', logEntry);
    } else {
      this.info('Payment Action', logEntry);
    }
  }

  // 清理旧日志文件
  cleanupLogs(daysToKeep: number = 30): void {
    try {
      const files = fs.readdirSync(this.logDir);
      const now = Date.now();
      const maxAge = daysToKeep * 24 * 60 * 60 * 1000;

      files.forEach(file => {
        const filePath = path.join(this.logDir, file);
        const stats = fs.statSync(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlinkSync(filePath);
          this.info(`Deleted old log file: ${file}`);
        }
      });
    } catch (error) {
      this.error('Failed to cleanup logs', { 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  }
}

// 导出单例实例
export const logger = new Logger();

// 导出类以供测试使用
export { Logger };

// 中间件：请求日志记录
export const requestLogger = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.logRequest(req, res, duration);
  });
  
  next();
};

