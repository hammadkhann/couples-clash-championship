import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true,
      },
      '/state': 'http://localhost:8000',
      '/start-match': 'http://localhost:8000',
      '/theme': 'http://localhost:8000',
      '/submit-challenge': 'http://localhost:8000',
      '/advance': 'http://localhost:8000',
      '/sfx': 'http://localhost:8000',
      '/override-score': 'http://localhost:8000',
      '/submit-round': 'http://localhost:8000',
      '/reset-match': 'http://localhost:8000',
      '/reset-round': 'http://localhost:8000',
      '/next-challenge': 'http://localhost:8000',
      '/reset': 'http://localhost:8000',
      '/health': 'http://localhost:8000',
    },
  },
});
