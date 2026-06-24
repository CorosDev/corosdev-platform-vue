// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2026-06-15',

  // Forzar la estructura moderna de Nuxt 4 (asume carpetas dentro de /app)
  future: {
    compatibilityVersion: 4,
  },

  // Quitamos @nuxtjs/tailwindcss de aquí para evitar el conflicto de PostCSS
  modules: ['@pinia/nuxt'],

  imports: {
    dirs: ['~~/stores'] 
  },

  // Levantamos Tailwind v4 directamente como un motor nativo ultra-veloz de Vite
  vite: {
    plugins: [
      tailwindcss()
    ]
  },

  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap' }
      ]
    }
  },

  devtools: { enabled: true },
  css: ['~/assets/css/main.css']
})