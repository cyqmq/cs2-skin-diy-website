import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 3001,
    proxy: {
      "/steamimg": {
        target: "https://steamcommunity-a.akamaihd.net",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/steamimg/, ""),
        secure: false,
      },
    },
  },
})
