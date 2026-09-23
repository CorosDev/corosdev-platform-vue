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
  // try/catch global — mismo blindaje que subscribe/contact/qualify: nada
  // escapa sin convertirse en una respuesta JSON con forma conocida.
  try {
    const body = await readBody(event)

    // Los bots que rellenan la trampa "tienen éxito" sin ser procesados —
    // antes incluso de Turnstile, no gastamos una verificación en algo que ya
    // se descarta.
    if (typeof body?.honeypot === 'string' && body.honeypot.trim() !== '') {
      return { success: true, message: 'Lead captured successfully' }
    }

    const parsed = leadSchema.safeParse(body)
    if (!parsed.success) {
      const errors = z.flattenError(parsed.error).fieldErrors

      // Sin esto, un 400 en producción no dejaba ni una línea en el log: sólo
      // se veía desde el navegador de quien lo sufría. Se registran los
      // NOMBRES de los campos que fallan, nunca sus valores (son datos
      // personales del visitante).
      console.warn(`[lead.post] payload rechazado — campos inválidos: ${Object.keys(errors).join(', ') || 'ninguno identificado'}`)

      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid lead payload',
        data: {
          success: false,
          message: 'Validation failed',
          errors,
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
  }
  catch (error) {
    if (isError(error)) throw error

    console.error('[lead.post] fallo no controlado:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error inesperado al procesar la solicitud.',
      data: { success: false, message: 'Error inesperado al procesar la solicitud. Intenta de nuevo más tarde.' },
    })
  }
})
