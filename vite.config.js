import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: ['warm-poems-invite.loca.lt'],
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