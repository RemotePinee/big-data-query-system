#!/usr/bin/env node

/**
 * 独立的清理任务脚本
 * 用于宝塔面板计划任务调用
 * 
 * 使用方法：
 * 1. 清理过期查询结果：node cleanup-task.js cleanup
 * 2. 获取过期统计信息：node cleanup-task.js stats
 */

const { CleanupService } = require('./dist/services/cleanup.service.js');
const { pool } = require('./dist/config/database.js');

async function main() {
  const command = process.argv[2];
  
  try {
    console.log(`[${new Date().toISOString()}] 开始执行清理任务: ${command}`);
    
    switch (command) {
      case 'cleanup':
        console.log('执行清理过期查询结果...');
        await CleanupService.cleanupExpiredQueryResults();
        console.log('✅ 清理任务执行完成');
        break;
        
      case 'stats':
        console.log('获取过期统计信息...');
        const stats = await CleanupService.getExpiringResultsStats();
        console.log('📊 统计结果:', JSON.stringify(stats, null, 2));
        if (stats.expiring24h > 0) {
          console.log(`⚠️  提醒: 有 ${stats.expiring24h} 个查询结果将在24小时内过期`);
        }
        break;
        
      default:
        console.log('使用方法:');
        console.log('  node cleanup-task.js cleanup  # 清理过期查询结果');
        console.log('  node cleanup-task.js stats    # 获取过期统计信息');
        process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ 任务执行失败:', error);
    process.exit(1);
  } finally {
    console.log(`[${new Date().toISOString()}] 任务执行结束`);
    // 强制退出进程，避免连接池导致的挂起
    process.exit(0);
  }
}

// 处理未捕获的异常
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  process.exit(1);
});

main();