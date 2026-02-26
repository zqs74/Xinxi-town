import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'build',
    chunkSizeWarningLimit: 2000, // 进一步调整 chunk size 警告阈值
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'charts': ['chart.js', 'recharts'],
          'motion': ['framer-motion'],
          'pdf': ['jspdf', 'html2canvas']
        }
      }
    }
  }
})
