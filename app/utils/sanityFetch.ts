/**
 * Helpers compartidos por la capa de datos de Sanity (`useBlog.ts`,
 * `useCaseStudies.ts`) para hacerla instantánea y tolerante a fallos.
 */
import type { NuxtApp } from '#app'

/**
 * Techo defensivo por consulta a Sanity. Con SWR activo (routeRules en
 * `nuxt.config.ts`), esto sólo puede pegar en el primer render tras expirar
 * la caché; si Sanity no responde en este margen la petición se aborta y la
 * vista degrada a Modo Mantenimiento, en vez de colgarse hasta el límite de
 * la función serverless (que devolvería un 504 feo). 8 s da holgura para los
 * reintentos internos de `@sanity/client` sin dejar al visitante esperando.
 */
export const SANITY_TIMEOUT_MS = 8000

/** Opciones de `client.fetch` con el `AbortSignal` de corte a 8 s. */
export function sanityFetchOpts() {
  return { signal: AbortSignal.timeout(SANITY_TIMEOUT_MS) }
}

/**
 * `getCachedData` para `useAsyncData`: reutiliza lo que ya está en memoria
 * —el payload de la SSR al hidratar, o una navegación previa dentro de la
 * misma sesión— en lugar de re-consultar Sanity. El default de Nuxt sólo
 * mira `nuxtApp.static.data` (vacío en una app SSR), así que sin esto cada
 * ida y vuelta entre un listado y un detalle dispara la query otra vez.
 *
 * Excepción: NUNCA se reutiliza un estado de error cacheado — así una
 * consulta que falló (timeout, Sanity caído) se reintenta en la siguiente
 * navegación en vez de dejar la sesión clavada en Modo Mantenimiento.
 */
export function cachedSanityData<T extends { error: boolean }>(
  key: string,
  nuxtApp: NuxtApp,
): T | undefined {
  const cached = (nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]) as T | undefined
  return cached && !cached.error ? cached : undefined
}
