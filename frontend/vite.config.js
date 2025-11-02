import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // For SPA routing - all routes should serve index.html
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})






