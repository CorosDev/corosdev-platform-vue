/**
 * Health check enterprise: siempre responde 200 mientras el proceso Nitro
 * esté vivo (si no lo estuviera, no habría respuesta HTTP en absoluto — un
 * healthcheck que devuelve 5xx cuando su propia dependencia externa está
 * caída deja de servir para diferenciar "el servidor no responde" de "el
 * servidor está bien pero Sanity no").
 *
 * `checks.sanity` reporta la conectividad con el dataset por separado: una
 * consulta mínima (`count(*[0...1])`) con techo de 5 s, igual de defensiva
 * que `useBlog.ts` / `useCaseStudies.ts` — nunca lanza, sólo apaga `ok` y
 * anota el motivo. Así un monitor externo (UptimeRobot, Vercel, un panel
 * interno) puede alertar sobre Sanity sin que la ruta entera devuelva un
 * error HTTP.
 */
import type { H3Event } from 'h3'

const SANITY_PING_TIMEOUT_MS = 5000
const PING_QUERY = /* groq */ `count(*[0...1])`

interface SanityCheckResult {
  ok: boolean
  latencyMs: number | null
  error?: string
}

async function pingSanity(event: H3Event): Promise<SanityCheckResult> {
  const projectId = (
    useRuntimeConfig(event).public.sanity as { projectId?: string } | undefined
  )?.projectId

  if (!projectId) {
    return { ok: false, latencyMs: null, error: 'not_configured' }
  }

  const startedAt = Date.now()
  try {
    await useSanity(event).fetch(PING_QUERY, {}, { signal: AbortSignal.timeout(SANITY_PING_TIMEOUT_MS) })
    return { ok: true, latencyMs: Date.now() - startedAt }
  }
  catch (err) {
    return {
      ok: false,
      latencyMs: Date.now() - startedAt,
      error: err instanceof Error ? err.message : 'unknown_error',
    }
  }
}

export default defineEventHandler(async (event) => {
  const sanity = await pingSanity(event)

  setResponseStatus(event, 200)
  return {
    status: 'ok' as const,
    timestamp: new Date().toISOString(),
    checks: {
      sanity,
    },
  }
})
