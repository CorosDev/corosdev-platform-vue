import { defineNuxtConfig } from 'nuxt/config'
import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Nuxt 4 architecture: app code lives in /app, server code in /server.
  future: {
    compatibilityVersion: 4,
  },

  devtools: { enabled: true },

  modules: ['nuxt-security'],

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  // OWASP-strict headers via nuxt-security (see CLAUDE.md, Protocolo de Seguridad Enterprise).
  security: {
    headers: {
      crossOriginEmbedderPolicy: 'require-corp',
      contentSecurityPolicy: {
        'default-src': ["'self'"],
        'img-src': ["'self'", 'data:'],
        'script-src': ["'self'", "'nonce-{{nonce}}'"],
        'style-src': ["'self'", "'nonce-{{nonce}}'"],
      },
    },
  },

  compatibilityDate: '2026-08-22',
})
