/**
 * Server-side handler for FloatingCtaDrawer.vue's lighter-weight quick-
 * capture widget. `subscribeSchema` lives in shared/utils/leadSchemas.ts
 * (its `role` enum is ECOSYSTEM_ROLE_OPTIONS — deliberately a different
 * set from contact.post.ts's CONTACT_SERVICE_OPTIONS, since this drawer is
 * the ecosystem/investor/tester funnel, not the B2B services one).
 *
 * Originally proxied a public Brevo `sibforms` form-embed URL (matching what
 * the legacy _legacy_html/cta-modal.js called directly from the browser);
 * now goes through the same server/utils/brevo.ts Contacts API client as
 * contact.post.ts, posting to its own list (`brevoCtaListId`) so this
 * lighter funnel entry point stays reportable separately from the full
 * Contact-section form in Brevo. Same honeypot + Turnstile bot defenses as
 * contact.post.ts too — see server/utils/turnstile.ts.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = subscribeSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      message: 'Datos de formulario inválidos.',
    })
  }

  const { name, email, role, message, context, honeypot } = parsed.data

  if (honeypot) {
    return { success: true }
  }

  // Same Turnstile gate as contact.post.ts — see server/utils/turnstile.ts.
  await assertTurnstileToken(body?.turnstileToken)

  try {
    const { brevoCtaListId } = useRuntimeConfig()

    await upsertBrevoContact({
      email,
      listId: brevoCtaListId,
      attributes: {
        FIRSTNAME: name,
        INTEREST: role,
        MESSAGE: message,
        SOURCE: `cta_drawer_${context}`,
      },
    })

    return { success: true }
  } catch (error) {
    console.error('[subscribe.post] Brevo upsert failed:', error)
    throw createError({
      statusCode: 502,
      message: 'No se pudo procesar la solicitud. Intenta de nuevo más tarde.',
    })
  }
})
