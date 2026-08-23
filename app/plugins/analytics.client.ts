/**
 * GA4 (gtag.js), loaded client-only and deliberately deferred — legacy
 * (_legacy_html/index.html) loaded the same Measurement ID as a bare
 * render-blocking-adjacent <script> in <head>, executed on every page load
 * regardless of whether the browser was even idle yet. Here it only starts
 * once the browser is idle after `load`, same deferral pattern used for the
 * globe.gl init in HomeGlobalGlobe.vue, so analytics never competes with the
 * hero paint / TBT budget.
 *
 * CSP note: nuxt-security's default script-src is
 * `'self' https: 'unsafe-inline' 'strict-dynamic' 'nonce-...'` (see
 * nuxt.config.ts) — `strict-dynamic` means a <script> created and appended
 * by this already-nonce-trusted plugin bundle is trusted transitively
 * regardless of its own src host, so no CSP change was needed for the
 * dynamically-injected gtag.js tag itself. No connect-src/default-src is set
 * in the current preset, so gtag's own analytics beacons aren't restricted
 * either.
 */

declare global {
  interface Window {
    dataLayer: unknown[][]
    gtag?: (...args: unknown[]) => void
  }
}

const GA_MEASUREMENT_ID = 'G-0BBYWL11BW'

export default defineNuxtPlugin(() => {
  const load = () => {
    window.dataLayer = window.dataLayer || []
    function gtag(...args: unknown[]) {
      window.dataLayer.push(args)
    }
    window.gtag = gtag
    gtag('js', new Date())
    gtag('config', GA_MEASUREMENT_ID)

    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
    document.head.appendChild(script)
  }

  const ric =
    window.requestIdleCallback ?? ((cb: IdleRequestCallback) => setTimeout(() => cb({} as IdleDeadline), 1))
  const kickoff = () => ric(load, { timeout: 4000 })

  if (document.readyState === 'complete') kickoff()
  else window.addEventListener('load', kickoff, { once: true })
})
