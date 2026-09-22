// GA4 (gtag.js) diferido + pageviews de navegación SPA.
// Contexto, decisiones y operativa: docs/GA4_CSP_FIX.md

declare global {
  interface Window {
    dataLayer: unknown[][]
    gtag?: (...args: unknown[]) => void
  }
}

export default defineNuxtPlugin(() => {
  const measurementId = useRuntimeConfig().public.gaMeasurementId

  if (!measurementId) return

  window.dataLayer = window.dataLayer || []
  function gtag(...args: unknown[]) {
    window.dataLayer.push(args)
  }
  window.gtag = gtag

  gtag('js', new Date())
  gtag('config', measurementId, { send_page_view: false })

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

  const load = () => {
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
    document.head.appendChild(script)
  }

  const ric
    = window.requestIdleCallback ?? ((cb: IdleRequestCallback) => setTimeout(() => cb({} as IdleDeadline), 1))
  const kickoff = () => ric(load, { timeout: 4000 })

  if (document.readyState === 'complete') kickoff()
  else window.addEventListener('load', kickoff, { once: true })
})
