import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 3001,
    proxy: {
      "/csgoapi": {
        target: "https://raw.githubusercontent.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/csgoapi/, "/ByMykel/CSGO-API/main/public/api/en"),
        secure: false,
      },
      "/steamimg": {
        target: "https://community.akamai.steamstatic.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/steamimg/, ""),
        secure: false,
      },
    },
  },
})
