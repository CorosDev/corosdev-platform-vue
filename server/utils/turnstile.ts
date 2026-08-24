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
 */
export async function assertTurnstileToken(token: string | undefined) {
  const { turnstile } = useRuntimeConfig()
  if (!turnstile.secretKey) return

  if (!token) {
    throw createError({
      statusCode: 422,
      message: 'Verificación de seguridad requerida.',
    })
  }

  const result = await verifyTurnstileToken(token)
  if (!result.success) {
    throw createError({
      statusCode: 422,
      message: 'La verificación de seguridad falló. Intenta de nuevo.',
    })
  }
}
