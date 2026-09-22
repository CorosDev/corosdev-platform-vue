// GA4 (gtag.js): Consent Mode v2, carga diferida y pageviews de navegación SPA.
// Contexto, decisiones y operativa: docs/GA4_CSP_FIX.md

import type { ConsentState } from '~/utils/consent'

declare global {
  interface Window {
    dataLayer: unknown[][]
    gtag?: (...args: unknown[]) => void
  }
}

export interface Gtag {
  (...args: unknown[]): void
  /** `$gtag.event('generate_lead', { service_requested: 'web' })` */
  event: (name: string, params?: Record<string, unknown>) => void
  /** Actualiza y persiste el consentimiento. Lo usa CookieBanner.vue. */
  consent: (state: Partial<ConsentState>) => void
  grantAll: () => void
  denyAll: () => void
}

const SCRIPT_IDLE_TIMEOUT = 1800

function baseConsent(): ConsentState {
  return readConsentDecision() === 'granted' ? GRANTED_ALL : DENIED_ALL
}

/**
 * Sin Measurement ID no hay red ni cola, pero la decisión del visitante SÍ se
 * persiste: si no, el banner reaparecería en cada recarga en Preview y local.
 */
function createNoopGtag(): Gtag {
  const noop = (() => {}) as Gtag
  noop.event = () => {}
  noop.consent = state => writeConsentDecision(summariseConsent({ ...baseConsent(), ...state }))
  noop.grantAll = () => noop.consent(GRANTED_ALL)
  noop.denyAll = () => noop.consent(DENIED_ALL)
  return noop
}

export default defineNuxtPlugin(() => {
  const measurementId = useRuntimeConfig().public.gaMeasurementId

  if (!measurementId) {
    return { provide: { gtag: createNoopGtag() } }
  }

  window.dataLayer = window.dataLayer || []

  const gtag = ((...args: unknown[]) => {
    window.dataLayer.push(args)
  }) as Gtag
  window.gtag = gtag

  gtag('consent', 'default', { ...DENIED_ALL, wait_for_update: 500 })

  if (readConsentDecision() === 'granted') {
    gtag('consent', 'update', GRANTED_ALL)
  }

  gtag('js', new Date())
  gtag('config', measurementId, { send_page_view: false })

  gtag.event = (name, params = {}) => gtag('event', name, params)

  gtag.consent = (state) => {
    const next: ConsentState = { ...baseConsent(), ...state }
    gtag('consent', 'update', next)
    writeConsentDecision(summariseConsent(next))
  }

  gtag.grantAll = () => gtag.consent(GRANTED_ALL)
  gtag.denyAll = () => gtag.consent(DENIED_ALL)

  const router = useRouter()
  let lastTrackedPath = ''

  function trackPageView(fullPath: string) {
    if (fullPath === lastTrackedPath) return
    lastTrackedPath = fullPath

    gtag('event', 'page_view', {
      page_path: fullPath,
      page_location: window.location.href,
      page_title: document.title,
    })
  }

  trackPageView(router.currentRoute.value.fullPath)

  router.afterEach((to) => {
    nextTick(() => trackPageView(to.fullPath))
  })

  let injected = false
  function injectTag() {
    if (injected) return
    injected = true

    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
    document.head.appendChild(script)
  }

  window.requestIdleCallback?.(injectTag, { timeout: SCRIPT_IDLE_TIMEOUT })
  setTimeout(injectTag, SCRIPT_IDLE_TIMEOUT)

  return { provide: { gtag } }
})
