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
  // try/catch global: cualquier fallo no previsto (body ilegible, un throw
  // inesperado de una dependencia) sale como 500 con cuerpo JSON en vez de
  // escaparse y que la plataforma responda algo opaco.
  try {
    const body = await readBody(event)
    const parsed = subscribeSchema.safeParse(body)

    if (!parsed.success) {
      throw createError({
        statusCode: 422,
        statusMessage: 'Datos de formulario inválidos.',
        data: { success: false, message: 'Datos de formulario inválidos.' },
      })
    }

    const { name, email, role, message, context, honeypot } = parsed.data

    if (honeypot) {
      return { success: true }
    }

    // Same Turnstile gate as contact.post.ts — see server/utils/turnstile.ts.
    await assertTurnstileToken(body?.turnstileToken)

    const { brevoCtaListId } = useRuntimeConfig()
    assertBrevoConfigured(brevoCtaListId, 'NUXT_BREVO_CTA_LIST_ID')

    try {
      await upsertBrevoContact({
        email,
        listId: brevoCtaListId,
        attributes: {
          NOMBRE: name,
          INTEREST: role,
          MESSAGE: message,
          SOURCE: `cta_drawer_${context}`,
        },
      })
    }
    catch {
      // El detalle ya se registró en server/utils/brevo.ts con el cuerpo de
      // la respuesta; aquí sólo se traduce a una respuesta para el visitante.
      throw createError({
        statusCode: 502,
        statusMessage: 'No se pudo procesar la solicitud.',
        data: { success: false, message: 'No se pudo procesar la solicitud. Intenta de nuevo más tarde.' },
      })
    }

    return { success: true }
  }
  catch (error) {
    if (isError(error)) throw error

    console.error('[subscribe.post] fallo no controlado:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error inesperado al procesar la solicitud.',
      data: { success: false, message: 'Error inesperado al procesar la solicitud. Intenta de nuevo más tarde.' },
    })
  }
})
