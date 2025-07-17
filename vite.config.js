import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: ['tutoweb.icu','https://tutoweb-frontend.vercel.app'],
    cors: true,
    proxy: {
      '/api': {
        target: 'http://192.168.0.38:7000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})