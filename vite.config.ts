import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Saviso Bodega 5',
        short_name: 'Saviso',
        description: 'Tracker de Armado para Bicicletas y Muebles',
        theme_color: '#0f172a'
      }
    })
  ],
})
