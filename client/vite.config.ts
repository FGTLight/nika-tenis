import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Em dev, /api vai para o Express — sem dor de cabeça com CORS.
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Separa as libs de animação em chunks próprios (melhor cache no navegador)
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion'],
          gsap: ['gsap', '@gsap/react', 'lenis'],
        },
      },
    },
  },
});
