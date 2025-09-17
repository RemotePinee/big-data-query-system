import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // 优化依赖预构建
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'axios'],
    exclude: ['@fortawesome/fontawesome-free']
  },
  build: {
    // 设置合理的 chunk 大小警告限制 (700KB) - 考虑到已优化的情况
    chunkSizeWarningLimit: 700,
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 构建目标
    target: 'es2015',
    // 压缩配置 - 使用 esbuild（默认，更快）
    minify: 'esbuild',
    // 启用源码映射（可选，生产环境可关闭）
     sourcemap: false,
     // 报告压缩详情
     reportCompressedSize: false,
     // 构建时的并行处理
     rollupOptions: {
      // 外部化依赖 - 将大型库标记为外部依赖（如果使用CDN）
      external: [
        // 可以通过 CDN 加载的大型库（生产环境可启用）
        // 'vue',
        // 'vue-router', 
        // 'element-plus'
      ],
      // 禁用treeshaking以避免代码被错误移除
      treeshake: false,
      output: {
        // 使用默认的代码分割策略
        manualChunks: undefined,
        // 文件命名策略
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop().replace(/\.\w+$/, '')
            : 'chunk';
          return `js/[name]-[hash].js`;
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name)) {
            return `media/[name]-[hash].${ext}`;
          }
          if (/\.(png|jpe?g|gif|svg)(\?.*)?$/.test(assetInfo.name)) {
            return `img/[name]-[hash].${ext}`;
          }
          if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name)) {
            return `fonts/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        },
      },
    },
  },
  server: {
    port: 5176,
    host: true,
    strictPort: false, // 如果端口被占用，自动尝试下一个端口
    allowedHosts: [
      '661dc474.r24.cpolar.top',
      '.cpolar.top', // 允许所有cpolar子域名
      'sad-carrots-kick.loca.lt',
      '.loca.lt', // 允许所有localtunnel子域名
      'webui.asia',
      'localhost',
      '127.0.0.1'
    ],

    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});