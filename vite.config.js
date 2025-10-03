import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'


const proxyConfig = () => {
  return {
    '/api': {
      target: 'http://localhost:3001', // 后端服务器地址
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''), // 重写路径，去除 /api 前缀
      // 添加日志，确认代理是否生效
      configure: (proxy, options) => {
        proxy.on('proxyReq', (proxyReq, req, res) => {
          console.log(`[Proxy] Forwarding request to: ${options.target}${req.url}`);
        });
      }

    }
  };
};


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: proxyConfig()
  },
  assetsInclude: ['**/*.jpg', '**/*.png', '**/*.svg'] // 添加需要处理的静态资源文件类型
})
