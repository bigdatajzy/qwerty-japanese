/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_URL || '/',
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    allowedHosts: [
      'mac',
      '.ts.net',
    ],
    https:
      process.env.VITE_USE_HTTPS === 'true'
        ? {
            key: fs.readFileSync('./mac.tail1ddca4.ts.net-key.pem'),
            cert: fs.readFileSync('./mac.tail1ddca4.ts.net.pem'),
          }
        : undefined,
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
  },
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.test.ts'],
  },
})
