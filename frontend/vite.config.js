// vite.config.js - ENHANCED (Preserving your proxy & optimizations)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@services": path.resolve(__dirname, "./src/services"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@context": path.resolve(__dirname, "./src/context"),
      "@data": path.resolve(__dirname, "./src/data"),
      // Added new aliases for Shadcn/UI compatibility
      "@lib": path.resolve(__dirname, "./src/lib"),
      "@router": path.resolve(__dirname, "./src/router"),
      "@styles": path.resolve(__dirname, "./src/styles")
    },
  },
  server: {
    port: 3000,
    host: true,
    // Your existing proxy configuration preserved
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Your preference preserved
    minify: 'esbuild', // Your preference preserved
    rollupOptions: {
      output: {
        // Your existing chunk optimization preserved + enhanced
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react', 'framer-motion'],
          charts: ['recharts'],
          // Added new chunks for better performance
          radix: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          i18n: ['react-i18next', 'i18next'],
          forms: ['react-hook-form'],
          state: ['zustand']
        }
      }
    }
  },
  define: {
    'process.env': process.env // Your existing define preserved
  },
  // Added optimizeDeps for better development experience
  optimizeDeps: {
    include: [
      'react',
      'react-dom', 
      'react-router-dom',
      'axios',
      'lucide-react',
      'framer-motion',
      'recharts',
      'react-i18next',
      'zustand'
    ]
  }
})
