/**
 * Wraps @nuxtjs/turnstile's own `verifyTurnstileToken` (auto-imported by
 * that module, calls Cloudflare's real /siteverify endpoint) with this
 * project's dev/production split, per CLAUDE.md: "Validación obligatoria de
 * tokens Cloudflare Turnstile / Honeypot antes de procesar envíos."
 *
 * - `runtimeConfig.turnstile.secretKey` unset (NUXT_TURNSTILE_SECRET_KEY not
 *   provided) → verification is silently skipped. This covers a `nuxt build`
 *   run without real Cloudflare credentials configured (e.g. a fresh clone,
 *   or this project's own build+preview verification loop) — the form still
 *   works instead of hard-failing every submission.
 *   (Note this is distinct from `nuxt dev`: there, @nuxtjs/turnstile itself
 *   auto-substitutes Cloudflare's published "always passes" test keypair for
 *   both site and secret key when nothing is configured — see nuxt.config.ts
 *   — so `npm run dev` already exercises the real widget + verification
 *   round-trip without ever reaching this bypass branch.)
 * - `secretKey` set (staging/production with real keys provisioned) → a
 *   missing or Cloudflare-rejected token throws a 422, before the caller
 *   ever reaches Brevo.
 *
 * Toda la verificación va acotada en tiempo y envuelta, de modo que
 * Cloudflare caído o lento no pueda tumbar el endpoint que la llama.
 *
 * ESTADO ACTUAL: la exigencia del token está APAGADA vía
 * `NUXT_TURNSTILE_ENFORCE` (ver nuxt.config.ts) mientras se investiga el 401
 * del widget cliente contra challenges.cloudflare.com. Además, un fallo de
 * la propia verificación ahora falla ABIERTO en vez de cerrado. Ambas cosas
 * son decisiones explícitas de negocio: priorizan no perder leads sobre el
 * filtrado antibot, y dejan el honeypot como única defensa real.
 */

/**
 * Tope de tiempo para /siteverify. Cloudflare responde en cientos de ms; sin
 * tope, un cuelgue suyo mantiene abierta la función serverless hasta que la
 * plataforma la corta, y eso sí es un 502/504 real de pasarela.
 */
const VERIFY_TIMEOUT_MS = 5000

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>

  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Turnstile no respondió en ${ms}ms`)), ms)
  })

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}

export async function assertTurnstileToken(token: string | undefined) {
  const { turnstile, turnstileEnforce } = useRuntimeConfig()
  if (!turnstile.secretKey) return

  // Interruptor NUXT_TURNSTILE_ENFORCE (ver nuxt.config.ts). Apagado = ningún
  // envío se bloquea por Turnstile; queda el honeypot como única defensa.
  // Se registra en CADA petición a propósito: un bypass silencioso se olvida,
  // y éste tiene que doler un poco en el log hasta que se revierta.
  if (!turnstileEnforce) {
    console.warn('[turnstile] BYPASS ACTIVO (NUXT_TURNSTILE_ENFORCE distinto de "true") — envío aceptado sin verificar; sólo protege el honeypot')
    return
  }

  if (!token) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Verificación de seguridad requerida.',
      data: { success: false, message: 'Verificación de seguridad requerida.' },
    })
  }

  let result: { success: boolean }
  try {
    result = await withTimeout(verifyTurnstileToken(token), VERIFY_TIMEOUT_MS)
  }
  catch (error) {
    // Antes fallaba CERRADO (503). Ahora falla ABIERTO: si Cloudflare no
    // responde, perder el lead cuesta más que aceptar un envío sin verificar.
    // La decisión es deliberada; el honeypot sigue filtrando los bots tontos.
    console.error('[turnstile] /siteverify no disponible — se acepta el envío sin verificar:', error)
    return
  }

  if (!result.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'La verificación de seguridad falló. Intenta de nuevo.',
      data: { success: false, message: 'La verificación de seguridad falló. Intenta de nuevo.' },
    })
  }
}
