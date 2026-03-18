import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_USE_HASH === 'true' ? '/qwerty-japanese/' : '/',
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    allowedHosts: [
      'mac',
      '.ts.net',
    ],
    https: {
      key: fs.readFileSync('./mac.tail1ddca4.ts.net-key.pem'),
      cert: fs.readFileSync('./mac.tail1ddca4.ts.net.pem'),
    },
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
