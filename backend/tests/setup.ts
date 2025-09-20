import dotenv from 'dotenv';

// 设置测试环境变量
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_key_for_testing_only';
process.env.DB_NAME = 'test_dashuju';
// 默认测试时只显示错误日志，可以通过环境变量覆盖
process.env.LOG_LEVEL = process.env.TEST_LOG_LEVEL || 'error';

// 加载环境变量
dotenv.config();

// 全局测试配置
beforeAll(async () => {
  // 测试前的全局设置
  // 静默模式，不输出日志
});

afterAll(async () => {
  // 测试后的清理工作
  // 静默模式，不输出日志
});

// 全局错误处理
process.on('unhandledRejection', (reason, promise) => {
  // 静默模式，不输出错误日志
  // 在生产环境中应该使用 logger.error
});

