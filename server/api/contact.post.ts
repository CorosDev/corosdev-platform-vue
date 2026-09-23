/**
 * Mirrors ContactSection.vue's form. `contactSchema` lives in
 * shared/utils/leadSchemas.ts (auto-imported here and in the component) so
 * both sides validate against the exact same rules instead of two hand-kept
 * copies drifting apart.
 *
 * Two bot defenses, both required per CLAUDE.md ("Validación obligatoria de
 * tokens Cloudflare Turnstile / Honeypot antes de procesar envíos"):
 * `honeypot` (a hidden input real visitors never fill in) and a Cloudflare
 * Turnstile token, checked via assertTurnstileToken() (server/utils/turnstile.ts)
 * — see that file for how it behaves when Turnstile isn't configured.
 */
export default defineEventHandler(async (event) => {
  // try/catch global — mismo blindaje que subscribe.post.ts.
  try {
    const body = await readBody(event)
    const parsed = contactSchema.safeParse(body)

    if (!parsed.success) {
      // Never leak zod's internal issue tree to the client — just a generic 422.
      throw createError({
        statusCode: 422,
        statusMessage: 'Datos de formulario inválidos.',
        data: { success: false, message: 'Datos de formulario inválidos.' },
      })
    }

    const { name, email, company, interest, message, honeypot } = parsed.data

    // Bots that fill the trap field silently succeed without being processed
    // — skipped before Turnstile too, no point burning a verification call on
    // a submission we're already discarding.
    if (honeypot) {
      return { success: true }
    }

    // `turnstileToken` isn't part of contactSchema (it's a security gate, not
    // lead data) — read straight off the raw body, which zod's `safeParse`
    // above left untouched.
    await assertTurnstileToken(body?.turnstileToken)

    const { brevoContactListId } = useRuntimeConfig()

    // Best-effort: un fallo de Brevo NO invalida una solicitud correcta. El
    // contacto queda registrado de forma recuperable en el log del servidor
    // (ver server/utils/brevo.ts) y el visitante no paga el precio de una
    // avería nuestra.
    await deliverBrevoContact(
      {
        email,
        listId: brevoContactListId,
        attributes: {
          NOMBRE: name,
          COMPANY: company,
          INTEREST: interest,
          MESSAGE: message,
          SOURCE: 'contact_section',
        },
      },
      'NUXT_BREVO_CONTACT_LIST_ID',
    )

    return { success: true }
  }
  catch (error) {
    if (isError(error)) throw error

    console.error('[contact.post] fallo no controlado:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error inesperado al procesar la solicitud.',
      data: { success: false, message: 'Error inesperado al procesar la solicitud. Intenta de nuevo más tarde.' },
    })
  }
})
