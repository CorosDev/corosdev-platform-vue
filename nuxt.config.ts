import { defineNuxtConfig } from 'nuxt/config'
import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Nuxt 4 architecture: app code lives in /app, server code in /server.
  future: {
    compatibilityVersion: 4,
  },

  devtools: { enabled: true },

  // Explicit favicon links — without these the browser falls back to a bare
  // GET /favicon.ico request that Nitro has no route for, surfacing as
  // net::ERR_CONNECTION_REFUSED in devtools. Both files live in /public.
  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'shortcut icon', href: '/favicon.ico' },
      ],
    },
  },

  modules: ['nuxt-security', '@nuxtjs/i18n'],

  i18n: {
    locales: [
      { code: 'es', language: 'es-ES', name: 'Español', file: 'es.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
    ],
    defaultLocale: 'es',
    strategy: 'prefix_except_default', // es lives at '/', en at '/en/...'
    // Production domain, from _legacy_html/CNAME — needed for useLocaleHead()'s
    // hreflang alternate <link> tags in app/layouts/default.vue to be fully-qualified.
    baseUrl: 'https://corosdev.com',
    // Locale is decided by the URL prefix + the Navbar's explicit toggle
    // (see AppNavbar.vue's setLocale() call) — no surprise auto-redirects
    // based on the visitor's browser/Accept-Language.
    detectBrowserLanguage: false,
  },

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
