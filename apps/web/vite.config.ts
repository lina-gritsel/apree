import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:3001' } },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          ui: ['@mui/material', '@emotion/react', '@emotion/styled'],
        },
      },
    },
  },
  test: { environment: 'jsdom', clearMocks: true },
});
