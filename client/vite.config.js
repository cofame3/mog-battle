import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), basicSsl()],
  server: {
    host: true
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        'index-ru': resolve(__dirname, 'index-ru.html'),
        faq: resolve(__dirname, 'faq.html'),
        'faq-ru': resolve(__dirname, 'faq-ru.html'),
        guide: resolve(__dirname, 'guide.html'),
        'guide-ru': resolve(__dirname, 'guide-ru.html'),
        about: resolve(__dirname, 'about.html'),
        'about-ru': resolve(__dirname, 'about-ru.html'),
        terms: resolve(__dirname, 'terms.html'),
        'terms-ru': resolve(__dirname, 'terms-ru.html'),
        privacy: resolve(__dirname, 'privacy.html'),
        'privacy-ru': resolve(__dirname, 'privacy-ru.html'),
      }
    }
  }
})
