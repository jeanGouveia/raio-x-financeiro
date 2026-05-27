import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main:        resolve(__dirname, 'index.html'),
        raiox:       resolve(__dirname, 'raio-x/index.html'),
        privacidade: resolve(__dirname, 'privacidade.html'),
      },
    },
  },
  server: {
    proxy: { '/api': { target: 'http://localhost:3001', changeOrigin: true } }
  }
})
