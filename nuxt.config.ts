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

  modules: ['nuxt-security', '@nuxtjs/i18n', '@nuxt/image', '@nuxt/fonts'],

  // CLAUDE.md §4 mandates local serving of Plus Jakarta Sans via @nuxt/fonts
  // (never actually implemented in prior migration passes — confirmed zero
  // @font-face/Google Fonts links existed anywhere in /app before this).
  // Declared explicitly here (rather than relying solely on @nuxt/fonts'
  // Tailwind v4 `@theme` scanning) so the family is guaranteed to be
  // downloaded, self-hosted under /_fonts, and preloaded regardless of CSS
  // scan heuristics. `font-display: swap` is @nuxt/fonts' default — this is
  // also the fix for the Lighthouse "Font Display" finding, since the app
  // previously shipped zero custom fonts (nothing to have a display strategy
  // for) and any future font addition without this module would regress it.
  fonts: {
    families: [{ name: 'Plus Jakarta Sans', provider: 'google', weights: [400, 500, 600, 700, 800], global: true }],
  },

  // All images ship from /public, so the built-in `ipx` provider (backed by
  // `sharp`, no external service/account needed) is what actually does the
  // resizing + WebP/AVIF re-encoding on request, cached by Nitro afterwards.
  image: {
    format: ['avif', 'webp'],
    quality: 80,
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
    // The local `ipx` provider's file-storage layer sets its own
    // `cache-control: max-age=60` on every transformed response — confirmed
    // via a real Lighthouse report and by curling a built `/_ipx/...` URL
    // directly, where it overrides whatever the `/_ipx/**` routeRule below
    // sets (that route rule is kept as defense-in-depth, but this is the
    // setting IPX actually reads). Source images are static and content
    // changes should ship under a new filename, same reasoning as the
    // routeRules above.
    ipx: {
      fs: {
        maxAge: 31536000,
      },
    },
  },

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

  // Static brand/city assets in /public are served by Nitro with only
  // ETag/Last-Modified by default (verified via `curl -D-` against a real
  // `npm run build` + `node .output/server/index.mjs`) — that's the exact
  // cause of Lighthouse's "Uses efficient cache policy" / Cache Lifetimes
  // finding. These filenames aren't content-hashed (unlike /_nuxt/*), so a
  // long immutable cache trades off against "rename the file if you ever
  // replace its content" — acceptable here since these are static brand/city
  // assets that change rarely and deliberately (a real content change should
  // ship under a new filename anyway, e.g. `cities/miami-2027.jpg`).
  // `/_ipx/**` is the separate route @nuxt/image's runtime transform proxy
  // actually serves resized/re-encoded (AVIF/WebP) images through — it isn't
  // covered by the raw `/public` paths above, so it was still falling back to
  // IPX's own short-lived default cache (60s), confirmed via a real Lighthouse
  // report flagging the transformed `coros.png` variant specifically. Same
  // immutable-for-a-year trade-off as the raw paths: a genuine content change
  // should ship as a new source filename, which naturally produces a new
  // `/_ipx/<params>/<newfile>` URL anyway.
  routeRules: {
    '/cities/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/globe/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/logos/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/favicon.ico': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/favicon.svg': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/coros.png': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/_ipx/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
  },

  // Server-only (no `public` key here, so it never reaches the client bundle
  // — CLAUDE.md's "Cero API Keys en el cliente"). This is the Brevo form
  // endpoint the legacy floating CTA drawer (_legacy_html/cta-modal.js) used
  // to call directly from the browser; server/api/subscribe.post.ts now
  // proxies it server-side instead. Overridable via NUXT_BREVO_FORM_URL.
  runtimeConfig: {
    brevoFormUrl:
      'https://8756b6e9.sibforms.com/serve/MUIFAKSh8xNxNu1k68CAUrSU-1pe6vuWPW7xwKd7CGDHHotwq4IrmYi4rmHXxIdPaUK9KrS9GkA8byZFdcgEXVmcuvpknY91tw4rl1QFgz2m2Dnkli1ietzEY80T98-1orF65YgnA86SG1HqVEkdqGQrDv6O6dj6R-uaW4-qJ5a_5pFTBIIDTFQm7_qVBIlphY3l7SZNkk3Brz5qlg==',
  },

  css: ['~/assets/css/main.css'],

  // Pre-compresses every built static asset (hashed `_nuxt/*` chunks, images,
  // fonts) to `.gz`+`.br` at build time; Nitro's static handler negotiates
  // `Content-Encoding` against the request's `Accept-Encoding` automatically
  // — no runtime compression CPU cost per request. Confirmed via a real
  // Lighthouse report flagging zero compression on `npm run preview`'s
  // responses (~39KB estimated savings) — this is also the main lever on the
  // render-blocking `entry.*.css` finding: that file alone drops from 58.3KB
  // to ~7.5KB over the wire with Brotli. Doesn't cover the SSR'd HTML
  // document itself (that's rendered dynamically per request, not a static
  // asset) — in a real deployment that's normally handled by the
  // platform/reverse-proxy in front of Nitro (Vercel, Netlify, Cloudflare,
  // nginx), which is also why this specific gap only shows up testing
  // directly against the bare `npm run preview` server.
  nitro: {
    compressPublicAssets: {
      gzip: true,
      brotli: true,
    },
  },

  vite: {
    plugins: [tailwindcss()],
    build: {
      // Silences Vite's >500kB chunk warning for one specific, expected chunk:
      // globe.gl + three.js + three-globe, dynamically `import()`-ed only when
      // HomeGlobalGlobe.vue actually mounts (see its buildGlobe()) — verified
      // in the built output that it's a true async chunk, not part of the
      // initial/blocking bundle. A 3D WebGL engine is inherently this size;
      // raising the threshold (~2MB) accepts that instead of chasing it.
      chunkSizeWarningLimit: 2000,
    },
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
    // Default `removeLoggers: true` makes nuxt-security set `vite.esbuild.drop`
    // to strip console/debugger in production — but Vite 8's default minifier
    // here is `oxc`, not esbuild, and there's no oxc-native equivalent option
    // yet, so that setting is silently ignored and `npm run build` warns
    // "Both esbuild and oxc options were set. oxc options will be used...".
    // Turned off rather than left in place producing a no-op warning: we ship
    // zero first-party `console.*`/`debugger` statements (verified against the
    // built bundle — the only console call left is inside three.js itself), so
    // there's nothing this was actually stripping. Revisit if nuxt-security
    // adds oxc support, or if console statements are ever added to app/server.
    removeLoggers: false,
  },

  compatibilityDate: '2026-08-22',
})
