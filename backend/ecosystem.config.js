module.exports = {
  apps: [{
    name: 'big-data-query-api',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    // 自动重启配置
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    
    // 日志配置
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    time: true,
    
    // 进程管理
    min_uptime: '10s',
    max_restarts: 10,
    
    // 优雅关闭
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000,
    
    // 健康检查
    health_check_grace_period: 3000
  }]
};

