import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true,   // <- key line for Windows/WSL/docker
    },
    // optional: tune interval if CPU is high
    // watch: { usePolling: true, interval: 100 },
  },
  proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
  },
})
