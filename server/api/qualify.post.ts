/**
 * Paso 2, opcional, del formulario de contacto: el visitante ya envió su
 * solicitud (contact.post.ts creó el contacto en Brevo) y desde la pantalla
 * de éxito añade presupuesto y perfil de empresa.
 *
 * No crea leads, sólo enriquece uno existente. `updateEnabled: true` en
 * server/utils/brevo.ts hace que esto FUSIONE los dos atributos sobre el
 * contacto ya creado en lugar de duplicarlo o de borrar lo que contact.post
 * escribió (NOMBRE, COMPANY, INTEREST, MESSAGE, SOURCE siguen intactos).
 *
 * Superficie de ataque deliberadamente mínima: los dos campos son enums
 * cerrados, no texto libre, así que lo peor que puede hacer alguien que
 * llame a este endpoint a mano es fijar uno de cuatro valores fijos en un
 * correo que ya conoce. Aun así pasa por el mismo honeypot y la misma
 * verificación de Turnstile que los otros dos endpoints (CLAUDE.md,
 * Protocolo de Seguridad).
 *
 * Requiere estos atributos personalizados en el panel de Brevo antes de
 * producción — la API responde 400 ante cualquier atributo que no reconozca
 * (misma advertencia que en server/utils/brevo.ts):
 *   - BUDGET (text)
 *   - PROFILE (text)
 */
export default defineEventHandler(async (event) => {
  // try/catch global — mismo blindaje que subscribe.post.ts.
  try {
    const body = await readBody(event)
    const parsed = qualifySchema.safeParse(body)

    if (!parsed.success) {
      throw createError({
        statusCode: 422,
        statusMessage: 'Datos de formulario inválidos.',
        data: { success: false, message: 'Datos de formulario inválidos.' },
      })
    }

    const { email, budget, profile, honeypot } = parsed.data

    if (honeypot) {
      return { success: true }
    }

    await assertTurnstileToken(body?.turnstileToken)

    const { brevoContactListId } = useRuntimeConfig()
    assertBrevoConfigured(brevoContactListId, 'NUXT_BREVO_CONTACT_LIST_ID')

    try {
      await upsertBrevoContact({
        // La misma lista del paso 1: el contacto ya es miembro, así que
        // reenviarla es inocuo y evita tener que exponer una variante del
        // cliente de Brevo que no toque listas.
        email,
        listId: brevoContactListId,
        attributes: {
          BUDGET: budget,
          PROFILE: profile,
        },
      })
    }
    catch {
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

    console.error('[qualify.post] fallo no controlado:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error inesperado al procesar la solicitud.',
      data: { success: false, message: 'Error inesperado al procesar la solicitud. Intenta de nuevo más tarde.' },
    })
  }
})
