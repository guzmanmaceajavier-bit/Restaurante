import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  server: {
    port: 5173,
    host: true,
    hmr: { overlay: false },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), 
    },
  },
})
