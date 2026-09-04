import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        raiox: resolve(__dirname, 'raio-x/index.html'),
      },
    },
  },
  server: {
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
      '/conteudos': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        bypass: (req, res, options) => {
          // Bypass proxy (servir do Vite) para /conteudos/ ou /conteudos (índice)
          if (req.url === '/conteudos/' || req.url === '/conteudos') {
            return '/conteudos/index.html'
          }
        }
      }
    }
  }
})
