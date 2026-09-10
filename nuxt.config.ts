import { defineNuxtConfig } from 'nuxt/config'
import tailwindcss from '@tailwindcss/vite'

// nuxt.config.ts is evaluated in Node (dev server / build). Reaching the env
// off globalThis keeps this typed without pulling in @types/node, which this
// project deliberately ships without (see .nuxt/tsconfig.node.json `types: []`).
const nodeEnv
  = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {}

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

  modules: [
    'nuxt-security',
    '@nuxtjs/i18n',
    '@nuxt/image',
    '@nuxt/fonts',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
    '@nuxtjs/turnstile',
    '@nuxtjs/sanity',
  ],

  // Shared by the whole Nuxt SEO module family (sitemap, robots) via
  // nuxt-site-config — this would already be auto-detected from i18n.baseUrl
  // below (nuxt-site-config reads it automatically whenever @nuxtjs/i18n is
  // present), but declaring it explicitly here removes any ambiguity for a
  // production-critical, load-bearing SEO setting.
  site: {
    url: 'https://corosdev.com',
  },

  // Public site key (NOT secret — it's meant to ship to the client, unlike
  // the server-only secretKey in runtimeConfig below). Empty by default,
  // overridden via NUXT_PUBLIC_TURNSTILE_SITE_KEY. When Nuxt itself runs in
  // dev mode (`npm run dev`) and nothing is configured, @nuxtjs/turnstile
  // automatically substitutes Cloudflare's own published "always passes"
  // test keypair here and for the server secretKey — so the whole widget +
  // server-verification round-trip genuinely works out of the box locally,
  // with zero real Cloudflare account needed. That auto-substitution does
  // NOT happen for a `nuxt build` (production build, e.g. what
  // `npm run build` + `node .output/server/index.mjs` runs), which is
  // exactly why server/utils/turnstile.ts's own bypass exists — see there.
  turnstile: {
    siteKey: '',
  },

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

  // @nuxtjs/sitemap needs zero i18n-specific config: it auto-detects
  // @nuxtjs/i18n's locales + defaultLocale + strategy (prefix_except_default,
  // see the i18n block above) and emits the correct <xhtml:link
  // rel="alternate" hreflang="..."> entries plus locale-prefixed <loc> URLs
  // (/, /en/, /about, /en/about...) for every route on its own.
  sitemap: {},

  // robots.txt: `sitemap` is resolved to an absolute URL automatically via
  // the shared `site.url` above — no need to hardcode the full
  // https://corosdev.com/sitemap.xml here. Full indexing is already this
  // module's default IN PRODUCTION (it only emits a blanket Disallow when
  // NOT running with NODE_ENV=production — a deliberate guard against
  // accidentally indexing a preview/staging deploy) — `allow: ['/']` is
  // added anyway so the directive is always literally present in the file,
  // not just implied by the absence of a Disallow rule.
  robots: {
    sitemap: '/sitemap.xml',
    allow: ['/'],
  },

  // "Enterprise Insights Engine" — headless blog/CMS on Sanity.io, scoped to
  // the /blog and /blog/[slug] routes only. projectId + dataset come from the
  // environment (SANITY_PROJECT_ID / SANITY_DATASET) so nothing account-
  // specific is committed; the matching entries live in .env.example.
  //
  // These are NOT secrets — a Sanity projectId/dataset are public identifiers
  // that ship to the browser in every query URL (same category as the
  // Turnstile site key above), so they belong here rather than in the
  // server-only runtimeConfig block. Any write token would be server-only and
  // is deliberately not wired up: Phase 1 is read-only content delivery.
  //
  // When SANITY_PROJECT_ID is unset (e.g. a fresh clone with no .env),
  // @nuxtjs/sanity logs a warning and the client simply has no project to hit
  // — queries then reject at request time, which the /blog data layer is
  // expected to catch and degrade to empty results rather than a 500.
  sanity: {
    projectId: nodeEnv.SANITY_PROJECT_ID || '',
    dataset: nodeEnv.SANITY_DATASET || 'production',
    // Pinned so query results are reproducible across deploys (Sanity's API is
    // date-versioned; omitting this floats to "latest" and can shift shapes).
    apiVersion: '2024-03-01',
    // Public read traffic goes through Sanity's CDN (cached, cheaper, faster);
    // fine for published blog content where a few minutes' staleness is OK.
    useCdn: true,
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
    '/images/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/favicon.ico': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/favicon.svg': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/coros.png': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/_ipx/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
  },

  // Server-only (no `public.` prefix, so none of these reach the client
  // bundle — CLAUDE.md's "Cero API Keys en el cliente"). Both
  // server/api/contact.post.ts and server/api/subscribe.post.ts (the
  // FloatingCtaDrawer) go through server/utils/brevo.ts's official Brevo
  // Contacts API client — the earlier `brevoFormUrl` (proxying a public
  // sibforms form-embed URL) has been fully replaced by this and is gone.
  // Real values must come from the environment — see the matching
  // NUXT_BREVO_* vars below; a blank/zero default fails loudly in
  // server/utils/brevo.ts rather than silently posting to nowhere.
  runtimeConfig: {
    // NUXT_BREVO_API_KEY
    brevoApiKey: '',
    // NUXT_BREVO_CONTACT_LIST_ID — the full Contact-section form (name/email/company/interest/message)
    brevoContactListId: 0,
    // NUXT_BREVO_CTA_LIST_ID — the lighter-weight FloatingCtaDrawer widget
    brevoCtaListId: 0,
    // Empty here on purpose (never set a real secret in this file) —
    // overridden via NUXT_TURNSTILE_SECRET_KEY. server/utils/turnstile.ts
    // treats "not configured" as a deliberate local-dev bypass rather than a
    // hard failure; see that file for the full reasoning.
    turnstile: {
      secretKey: '',
    },
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
  // GlobalGlobe.vue import()s globe.gl only when the visitor actually asks for
  // the 3D globe — but Nuxt still emitted <link rel="prefetch"> for that chunk
  // on every page load, so mobile downloaded ~1.9MB in the background even
  // though it renders GlobeStaticPoster.vue and never boots WebGL unless the
  // poster is tapped. The prefetch never hurt CPU/TBT (it does not execute),
  // it just burned mobile data for nothing.
  //
  // Flipping the manifest entry off stops the link tag; the dynamic import()
  // itself is untouched, so tapping the poster still loads the chunk on
  // demand. Desktop loses a small head start (it auto-loads the globe on idle
  // anyway, so the prefetch was only ever marginally ahead of the import).
  hooks: {
    'build:manifest'(manifest) {
      for (const [key, entry] of Object.entries(manifest)) {
        if (key.includes('globe.gl')) {
          entry.prefetch = false
          entry.preload = false
        }
      }
    },
  },

  // Deliberately NOT setting `preset: 'vercel'` here. Nitro already detects
  // Vercel on its own (std-env reads the VERCEL env var that the platform
  // injects) and switches presets automatically — verified locally by running
  // the build with VERCEL=1, which emitted .vercel/output/ instead of
  // .output/server/. Hardcoding the preset therefore adds nothing on Vercel,
  // but it WOULD break local verification: `npm run build` would stop
  // producing .output/server/index.mjs, so `npm run preview` and the
  // build+curl loop this project relies on would have nothing to run.
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
  // frame-src and connect-src are overridden below — nuxt-security deep-merges
  // per directive, so every other default directive (including script-src,
  // still 'strict-dynamic'+nonce'd) is kept as-is. frame-src already allowed
  // the YouTube embed in HomePresentationVideoSection.vue;
  // https://challenges.cloudflare.com is added for Cloudflare Turnstile
  // (@nuxtjs/turnstile) — its widget renders inside an <iframe> from that
  // origin (needs frame-src) and its client script calls back to it directly
  // for the actual challenge/verification exchange (needs connect-src,
  // default 'self'-only). Its script tag itself needs no script-src change:
  // @nuxt/scripts (which @nuxtjs/turnstile depends on) inserts it dynamically
  // from already-trusted, nonce'd first-party JS, which 'strict-dynamic'
  // trusts regardless of the child script's own src host — same mechanism
  // already verified for the deferred GA4 script in analytics.client.ts.
  security: {
    headers: {
      // nuxt-security defaults to 15552000s (180 days). Chrome's HSTS preload
      // list requires at least 31536000s (1 year) plus includeSubDomains, so
      // this is the value to run if corosdev.com is ever submitted there.
      // preload:true is deliberately NOT set: it is a one-way door (removal
      // from the list takes months and needs a separate request), so it should
      // only be turned on together with an actual preload submission.
      strictTransportSecurity: {
        maxAge: 31536000,
        includeSubdomains: true,
      },
      contentSecurityPolicy: {
        'frame-src': ["'self'", 'https://www.youtube.com', 'https://challenges.cloudflare.com'],
        // 'self' for same-origin XHR, Cloudflare for Turnstile, and Sanity's
        // query API for the /blog GROQ requests fired from the browser on
        // client-side navigation. With `useCdn: true` (nuxt.config `sanity`
        // block) the endpoint is https://<projectId>.apicdn.sanity.io; the
        // non-CDN api.sanity.io host is kept for cache-busting fallbacks.
        'connect-src': [
          "'self'",
          'https://challenges.cloudflare.com',
          'https://*.apicdn.sanity.io',
          'https://*.api.sanity.io',
        ],
        // nuxt-security's default is `'self' data:` — Sanity's asset CDN is
        // added so <SanityImage> (body images) and the plain <img> cover /
        // OG thumbnails served from cdn.sanity.io/images/... can load.
        'img-src': ["'self'", 'data:', 'https://cdn.sanity.io'],
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
