// GA4 (gtag.js): Consent Mode v2, carga diferida y pageviews de navegación SPA.
// Contexto, decisiones y operativa: docs/GA4_CSP_FIX.md

declare global {
  interface Window {
    dataLayer: unknown[][]
    gtag?: (...args: unknown[]) => void
  }
}

type ConsentValue = 'granted' | 'denied'

export interface ConsentState {
  ad_storage: ConsentValue
  ad_user_data: ConsentValue
  ad_personalization: ConsentValue
  analytics_storage: ConsentValue
}

export interface Gtag {
  (...args: unknown[]): void
  /** `$gtag.event('generate_lead', { service_requested: 'ai' })` */
  event: (name: string, params?: Record<string, unknown>) => void
  /** Banner de cookies: actualiza (y persiste) el consentimiento del visitante. */
  consent: (state: Partial<ConsentState>) => void
  grantAll: () => void
  denyAll: () => void
}

const CONSENT_STORAGE_KEY = 'corosdev-consent'
const SCRIPT_IDLE_TIMEOUT = 1800

const DENIED_ALL: ConsentState = {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
}

const GRANTED_ALL: ConsentState = {
  ad_storage: 'granted',
  ad_user_data: 'granted',
  ad_personalization: 'granted',
  analytics_storage: 'granted',
}

function readStoredConsent(): Partial<ConsentState> | null {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    return parsed && typeof parsed === 'object' ? (parsed as Partial<ConsentState>) : null
  }
  catch {
    return null
  }
}

function persistConsent(state: ConsentState) {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state))
  }
  catch {
    // Safari en modo privado / storage bloqueado: el consentimiento sigue
    // aplicándose en esta sesión, sólo no sobrevive a la recarga.
  }
}

/** Sin Measurement ID no hay red ni cola: los componentes llaman al vacío. */
function createNoopGtag(): Gtag {
  const noop = (() => {}) as Gtag
  noop.event = () => {}
  noop.consent = () => {}
  noop.grantAll = () => {}
  noop.denyAll = () => {}
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

  const stored = readStoredConsent()
  if (stored) gtag('consent', 'update', stored)

  gtag('js', new Date())
  gtag('config', measurementId, { send_page_view: false })

  gtag.event = (name, params = {}) => gtag('event', name, params)

  gtag.consent = (state) => {
    const next: ConsentState = { ...DENIED_ALL, ...readStoredConsent(), ...state }
    gtag('consent', 'update', next)
    persistConsent(next)
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
