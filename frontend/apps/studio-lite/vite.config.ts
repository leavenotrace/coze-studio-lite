import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      // 前端直接请求 /api，会被代理到后端
      '/api': { target: 'http://127.0.0.1:8099', changeOrigin: true }
    }
  }
})