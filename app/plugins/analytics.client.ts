/**
 * GA4 (gtag.js), client-only y deliberadamente diferido — el legacy
 * (_legacy_html/index.html) cargaba el mismo Measurement ID como un <script>
 * casi bloqueante en <head>, ejecutado en cada carga aunque el navegador ni
 * siquiera estuviera ocioso. Aquí la DESCARGA del script sólo arranca cuando
 * el navegador está idle tras `load`, el mismo patrón de diferido que usa
 * HomeGlobalGlobe.vue para globe.gl, así que analytics nunca compite con el
 * pintado del hero ni con el presupuesto de TBT.
 *
 * Nota CSP: el script-src de nuxt-security incluye 'strict-dynamic', así que
 * un <script> creado y añadido por este bundle (ya nonce-ado) se confía
 * transitivamente sin importar su host — por eso el tag de gtag.js nunca
 * necesitó tocar script-src. Lo que SÍ hizo falta, y durante un mes faltó,
 * fueron los hosts de Google en `connect-src`/`img-src`: ahí es donde morían
 * los hits. Ver el bloque `security` de nuxt.config.ts para la cronología.
 */

declare global {
  interface Window {
    dataLayer: unknown[][]
    gtag?: (...args: unknown[]) => void
  }
}

export default defineNuxtPlugin(() => {
  const measurementId = useRuntimeConfig().public.gaMeasurementId

  // Sin ID configurado no se monta NADA: ni dataLayer, ni listener de router,
  // ni petición de red. Es el interruptor que apaga el rastreo en Preview y en
  // local (ver cómo se resuelve el valor en nuxt.config.ts) y sigue el mismo
  // criterio de "no configurado = desactivado" que ya usan Turnstile y Brevo.
  if (!measurementId) return

  // La cola se crea de forma SÍNCRONA, no dentro del idle callback. Es sólo un
  // array y una función (coste irrelevante para el LCP), y a cambio cualquier
  // evento emitido antes de que gtag.js termine de bajar queda encolado en
  // `dataLayer` en vez de perderse: gtag.js procesa lo acumulado al arrancar.
  // Si esto viviera dentro del idle callback, una navegación rápida en los
  // primeros segundos no se registraría.
  window.dataLayer = window.dataLayer || []
  function gtag(...args: unknown[]) {
    window.dataLayer.push(args)
  }
  window.gtag = gtag

  gtag('js', new Date())
  // `send_page_view: false` es la pieza clave del rastreo SPA. Por defecto,
  // `config` dispara UN page_view en la carga inicial y nunca más: en una SPA
  // de Nuxt casi toda la navegación es cliente, así que el recorrido interno
  // del visitante era invisible. Desactivándolo, TODAS las vistas —incluida la
  // primera— pasan por `trackPageView()`, un solo camino en vez de dos con
  // reglas distintas.
  gtag('config', measurementId, { send_page_view: false })

  const router = useRouter()

  // Guarda contra doble conteo: `router.afterEach` también se dispara en la
  // navegación inicial de la hidratación, que es la misma ruta que acabamos de
  // registrar a mano. Comparar el fullPath es más fiable que un booleano
  // "primera vez", porque no asume en qué orden ocurren hidratación y plugin.
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
    // `nextTick` antes de leer `document.title`: unhead aplica el <title> de la
    // nueva página en el ciclo de actualización del DOM, así que leerlo dentro
    // del propio afterEach devolvería todavía el título de la página ANTERIOR.
    // page_path y page_location no dependen de esto; el título es el único dato
    // que necesita esperar.
    nextTick(() => trackPageView(to.fullPath))
  })

  // Sólo la descarga del script se difiere. Para entonces la cola de arriba ya
  // puede tener el primer page_view esperando.
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
