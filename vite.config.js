import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173, // or any other port you prefer
    allowedHosts:["warrentymefront.onrender.com", "https://warrenty-me-front.vercel.app/"]
  }
});