/**
 * Idioma inicial por geolocalización — pedido explícito del usuario:
 * visitantes desde Honduras entran en español; todo el resto del mundo, en
 * inglés (el idioma por defecto/sin prefijo desde ahora — ver `defaultLocale`
 * en nuxt.config.ts). "El resto del mundo en inglés" ya es lo que pasa sin
 * hacer nada (es el default de i18n); lo único que este middleware decide
 * activamente es CUÁNDO mandar a un visitante de Honduras a `/es` en su
 * lugar.
 *
 * La geolocalización viene de `x-vercel-ip-country`, un header que Vercel
 * inyecta gratis en cada request en el edge — cero lookup de IP propio que
 * mantener. En local (`npm run dev`) o si el proyecto se despliega fuera de
 * Vercel, el header simplemente no existe y el visitante ve inglés, que de
 * todos modos es el comportamiento por defecto correcto ahí.
 *
 * SOLO reacciona en una dirección (HN → /es) y solo en el primer request sin
 * preferencia guardada — nunca al revés. Un visitante que llega directo a
 * una URL `/es` (un enlace compartido, un resultado de búsqueda) se queda
 * ahí tal cual; "por defecto" en el pedido del usuario describe la entrada
 * ambigua (la raíz o cualquier ruta sin prefijo de idioma), no una regla que
 * deba pisar una navegación explícita. Una vez decidido — por geo, o porque
 * el visitante ya trae la cookie de una visita anterior — este middleware no
 * vuelve a intervenir en esa sesión; el toggle manual del navbar
 * (AppNavbar.vue) sigue funcionando exactamente igual por encima de esto,
 * sin que haga falta tocarlo: una vez existe la cookie, este archivo no
 * vuelve a redirigir nada, así que un cambio de idioma manual nunca se
 * revierte solo.
 *
 * Bots/crawlers NUNCA se redirigen: Google ya indexa ambas versiones via los
 * `<link rel="alternate" hreflang>` que emite nuxt-sitemap/useLocaleHead(), y
 * un redirect geo-dependiente podría confundir el rastreo si Googlebot
 * alguna vez sale de una IP que geolocaliza a Honduras.
 */
const LOCALE_COOKIE = 'corosdev_locale_pref'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 año

const BOT_UA_PATTERN =
  /bot|crawl|spider|slurp|googlebot|bingbot|yandex|duckduckbot|baiduspider|facebookexternalhit|twitterbot|slackbot|linkedinbot|whatsapp|telegrambot|applebot|semrushbot|ahrefsbot|mj12bot|petalbot|bytespider|lighthouse|pagespeed/i

export default defineEventHandler((event) => {
  if (event.node.req.method !== 'GET') return

  const url = getRequestURL(event)
  const path = url.pathname

  // Sólo navegaciones de página completas — nunca intervenir en /api,
  // assets con extensión, _nuxt/_ipx, sitemap/robots: redirigir cualquiera
  // de esos rompe la petición que lo pidió (un <script src> redirigido no
  // sirve de nada, y peor aún si es la respuesta del propio sitemap que
  // Google está leyendo).
  if (
    path.startsWith('/api/') ||
    path.startsWith('/_nuxt/') ||
    path.startsWith('/_ipx/') ||
    path === '/robots.txt' ||
    path === '/sitemap_index.xml' ||
    path.startsWith('/__sitemap__') ||
    /\.[a-z0-9]+$/i.test(path)
  ) {
    return
  }

  if (BOT_UA_PATTERN.test(getRequestHeader(event, 'user-agent') ?? '')) return

  // Ya hay preferencia guardada (geo previa, o el visitante ya trae cookie
  // de una sesión anterior) — no re-evaluar nada.
  if (getCookie(event, LOCALE_COOKIE)) return

  const isHonduras = getRequestHeader(event, 'x-vercel-ip-country') === 'HN'
  const isAlreadyOnSpanishPath = path === '/es' || path.startsWith('/es/')

  // Guarda la preferencia en cualquier caso — evita re-leer el header de geo
  // en cada request de la misma sesión, y es lo que hace que el toggle
  // manual del navbar, una vez usado, nunca vuelva a pisarse solo.
  setCookie(event, LOCALE_COOKIE, isHonduras ? 'es' : 'en', {
    path: '/',
    maxAge: COOKIE_MAX_AGE,
    sameSite: 'lax',
  })

  if (isHonduras && !isAlreadyOnSpanishPath) {
    const target = (path === '/' ? '/es' : `/es${path}`) + url.search
    return sendRedirect(event, target, 302)
  }
})
