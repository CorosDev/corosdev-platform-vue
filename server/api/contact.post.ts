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
  const body = await readBody(event)
  const parsed = contactSchema.safeParse(body)

  if (!parsed.success) {
    // Never leak zod's internal issue tree to the client — just a generic 422.
    throw createError({
      statusCode: 422,
      message: 'Datos de formulario inválidos.',
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

  try {
    const { brevoContactListId } = useRuntimeConfig()

    await upsertBrevoContact({
      email,
      listId: brevoContactListId,
      attributes: {
        NOMBRE: name,
        COMPANY: company,
        INTEREST: interest,
        MESSAGE: message,
        SOURCE: 'contact_section',
      },
    })

    return { success: true }
  } catch (error) {
    // Never expose raw server/provider errors to the client — but do log
    // server-side so a misconfigured list id / API key / missing Brevo
    // attribute (see server/utils/brevo.ts) is actually diagnosable.
    console.error('[contact.post] Brevo upsert failed:', error)
    throw createError({
      statusCode: 502,
      message: 'No se pudo procesar la solicitud. Intenta de nuevo más tarde.',
    })
  }
})
