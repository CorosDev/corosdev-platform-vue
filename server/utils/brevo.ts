/**
 * Shared Brevo Contacts API client for every server-side lead-capture
 * endpoint (contact.post.ts, subscribe.post.ts) — replaces the previous
 * per-endpoint approach of proxying a public `sibforms` form-embed URL with
 * Brevo's official REST API (https://developers.brevo.com/reference/createcontact),
 * authenticated with a server-only API key (CLAUDE.md: "Cero API Keys en el
 * cliente" — `brevoApiKey` has no `public.` prefix in runtimeConfig, so it
 * never reaches the client bundle).
 *
 * Requires these custom contact attributes to already exist in the Brevo
 * dashboard (Contacts → Settings → Contact Attributes) *before* this goes to
 * production — the API returns a 400 for any attribute name it doesn't
 * recognize:
 *   - NOMBRE (text)   — this Brevo account renamed the built-in
 *                      first-name attribute, so the payload must send
 *                      NOMBRE, never FIRSTNAME
 *   - COMPANY (text)
 *   - INTEREST (text)
 *   - MESSAGE (text)
 *   - SOURCE (text)
 *   - BUDGET (text)  — los envía qualify.post.ts (paso 2 del formulario);
 *   - PROFILE (text)   faltaban en esta lista y un atributo inexistente es
 *                      exactamente lo que Brevo responde con un 400.
 */
interface UpsertBrevoContactInput {
  email: string
  listId: number
  attributes?: Record<string, string>
}

/**
 * Comprueba la configuración ANTES de tocar la red, para que un deploy sin
 * variables devuelva un 500 honesto ("esto no está configurado") en vez del
 * 502 genérico, que significa "el proveedor falló" y manda a diagnosticar al
 * sitio equivocado. El nombre exacto de la variable que falta va al log del
 * servidor, nunca al cliente.
 */
export function assertBrevoConfigured(listId: number, listEnvVar: string) {
  const { brevoApiKey } = useRuntimeConfig()

  const missing = [
    !brevoApiKey && 'NUXT_BREVO_API_KEY',
    !listId && listEnvVar,
  ].filter(Boolean)

  if (missing.length > 0) {
    console.error(`[brevo] configuración incompleta — faltan variables: ${missing.join(', ')}`)
    throw createError({
      statusCode: 500,
      statusMessage: 'Servicio de contacto no configurado.',
      data: {
        success: false,
        message: 'El servicio de contacto no está disponible ahora mismo. Escríbenos por email mientras lo resolvemos.',
      },
    })
  }
}

export async function upsertBrevoContact({ email, listId, attributes }: UpsertBrevoContactInput) {
  const { brevoApiKey } = useRuntimeConfig()

  if (!brevoApiKey) {
    // A misconfigured deployment (missing NUXT_BREVO_API_KEY), not a user
    // input problem — surfaced to the caller as a thrown error so it maps to
    // the endpoint's generic 502, never to a 4xx that implies the visitor
    // did something wrong.
    throw new Error('Brevo API key is not configured (NUXT_BREVO_API_KEY).')
  }
  if (!listId) {
    throw new Error('Brevo list id is not configured.')
  }

  // `updateEnabled: true` is what makes this idempotent per email address —
  // without it, Brevo responds 400 ("Contact already exist") the second time
  // the same visitor submits, e.g. editing and resending an inquiry.
  // Sin `timeout` este fetch no tiene tope: si Brevo se cuelga, la petición
  // del visitante queda abierta hasta que la corte la plataforma y el
  // spinner del formulario gira indefinidamente. 8s cubre de sobra la
  // latencia real de la API (cientos de ms) y convierte una caída del
  // proveedor en un error rápido y honesto en vez de en una interfaz
  // aparentemente colgada.
  //
  // `retry: 1` cubre el fallo transitorio de red o el 502/503 puntual —
  // ofetch reintenta por defecto sobre 408/409/425/429/500/502/503/504, y la
  // llamada es idempotente gracias a `updateEnabled`, así que un reintento
  // nunca duplica el contacto. Se deja en un solo reintento a propósito: más
  // reintentos alargan justo lo que se intenta acotar.
  try {
    await $fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      timeout: 8000,
      retry: 1,
      retryDelay: 300,
      headers: {
        'api-key': brevoApiKey,
        accept: 'application/json',
      },
      body: {
        email,
        attributes,
        listIds: [listId],
        updateEnabled: true,
      },
    })
  }
  catch (error) {
    // El objeto de ofetch impreso "en crudo" no muestra el cuerpo de la
    // respuesta, que es justo donde Brevo dice QUÉ rechazó (401 clave
    // inválida vs 400 por un atributo que no existe en la cuenta). Sin esto,
    // el log de Vercel no permite distinguirlos.
    const status = (error as { status?: number })?.status
    const detail = (error as { data?: unknown })?.data
    console.error(
      `[brevo] contacts upsert falló (status=${status ?? 'sin respuesta'}, list=${listId}):`,
      detail ?? (error as Error)?.message ?? error,
    )
    throw error
  }
}
