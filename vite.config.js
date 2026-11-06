import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Ishlab chiqishda /admin manzili ham admin.html ni ochadi (serverda bu ishni server/index.js qiladi).
const adminRoute = {
  name: 'admin-route',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (req.url === '/admin' || req.url.startsWith('/admin/')) req.url = '/admin.html'
      next()
    })
  },
}

export default defineConfig({
  plugins: [react(), adminRoute],
  server: {
    // Host o'zgarmasin: server boshqa saytdan kelgan so'rovlarni shu orqali rad etadi.
    proxy: { '/api': { target: 'http://localhost:8787', changeOrigin: false } },
  },
  build: {
    rollupOptions: {
      input: { main: resolve(import.meta.dirname, 'index.html'), admin: resolve(import.meta.dirname, 'admin.html') },
    },
  },
})
