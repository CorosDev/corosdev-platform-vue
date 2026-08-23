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
  // Deliberately NOT using `strict: true` here: that preset's style-src is
  // `'self' 'nonce-{{nonce}}'` with no 'unsafe-inline' fallback, and per the CSP spec a
  // present nonce makes browsers ignore 'unsafe-inline' entirely — so it can't be patched
  // back in. Vite's dev server injects component CSS via un-nonced <style> tags on every
  // page load (not just HMR updates), so that preset blocks ALL styling in `npm run dev`
  // (the page still loads, just fully unstyled). The module's plain default CSP keeps
  // style-src as `'self' https: 'unsafe-inline'` (no nonce there), which is what actually
  // stays dev-safe while still shipping solid OWASP headers (CSP, HSTS, COOP/CORP,
  // X-Frame-Options, Permissions-Policy, nonce'd script-src, SRI, hidden X-Powered-By...).
  // Only frame-src is overridden below, to allow the YouTube embed in
  // HomePresentationVideoSection.vue — nuxt-security deep-merges per directive, so every
  // other default directive is kept as-is.
  security: {
    headers: {
      contentSecurityPolicy: {
        'frame-src': ["'self'", 'https://www.youtube.com'],
      },
    },
  },

  compatibilityDate: '2026-08-22',
})
