import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path";


// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve:{
    alias:{
        "@":path.resolve(__dirname,"./src")
    }
},
  server: {
    proxy: {
      '/subscription-api': {
        target: 'https://subscriptions.sands.com.ng',
        changeOrigin: true,
        rewrite: (requestPath) => requestPath.replace(/^\/subscription-api/, '/api/v1'),
      },
    },
    allowedHosts: [
      'cube-refute-spray.ngrok-free.dev',
      'pro-master-jennet.ngrok-free.app'
    ]
  }
})
