/**
 * Fase 4 — captación de leads del modal global (`useContactModal` /
 * `ContactModal.vue`, que hace `$fetch('/api/lead')`).
 *
 * Contrato:
 *  - Body válido  → `{ success: true, message: 'Lead captured successfully' }`
 *    tras disparar el gancho a CRM/Webhook (`dispatchLead`, best-effort).
 *  - Body inválido → 400 con `data: { success: false, message, errors }`,
 *    donde `errors` es `{ campo: string[] }` (para pintar por campo en la UI).
 *
 * Dos defensas anti-bot, igual que `server/api/contact.post.ts` (CLAUDE.md,
 * "Validación obligatoria de tokens Cloudflare Turnstile / Honeypot antes de
 * procesar envíos"): honeypot (campo oculto) + token de Cloudflare Turnstile
 * verificado con `assertTurnstileToken()` — ver `server/utils/turnstile.ts`
 * para su comportamiento cuando Turnstile no está configurado.
 */
import { z } from 'zod'
import { leadSchema } from '~/utils/leadSchema'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Los bots que rellenan la trampa "tienen éxito" sin ser procesados — antes
  // incluso de Turnstile, no gastamos una verificación en algo que ya se
  // descarta.
  if (typeof body?.honeypot === 'string' && body.honeypot.trim() !== '') {
    return { success: true, message: 'Lead captured successfully' }
  }

  const parsed = leadSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid lead payload',
      data: {
        success: false,
        message: 'Validation failed',
        errors: z.flattenError(parsed.error).fieldErrors,
      },
    })
  }

  // Puerta de seguridad, no dato del lead: se lee del body crudo (safeParse
  // no lo tocó). No-op si Turnstile no está configurado.
  await assertTurnstileToken(body?.turnstileToken)

  // Gancho CRM/Webhook — best-effort: un fallo downstream NO invalida un
  // envío correcto. El lead queda al menos logueado en `dispatchLead`.
  try {
    await dispatchLead(parsed.data)
  }
  catch (err) {
    console.error('[lead.post] fallo al entregar el lead al CRM/webhook (se acepta igual):', err)
  }

  return { success: true, message: 'Lead captured successfully' }
})
