import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/tests/setup.js'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/tests/',
        '**/*.config.js',
        '**/dist/',
        '**/coverage/',
        'src/main.jsx',
        'src/App.jsx'
      ],
      all: true,
      lines: 70,
      functions: 70,
      branches: 70,
      statements: 70
    },
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules/', 'dist/', '.idea/', '.git/', '.cache/']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});