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

export type BrevoDeliveryReason = 'not_configured' | 'provider_error'

export interface BrevoDeliveryResult {
  delivered: boolean
  reason?: BrevoDeliveryReason
}

/**
 * Deja el contacto en el log en formato recuperable a mano.
 *
 * Es la contrapartida imprescindible de aceptar el envío cuando Brevo falla:
 * sin esta línea, "no bloquear al visitante" significaría sencillamente
 * perder el lead en silencio, que es peor que devolverle un error. Mismo
 * patrón que `[lead] captured` en server/utils/lead.ts.
 *
 * Contiene datos personales del visitante (nombre, email, mensaje): vive en
 * el log de Vercel y le aplica su política de retención.
 */
function logRecoverableContact(reason: BrevoDeliveryReason, input: UpsertBrevoContactInput) {
  console.error(
    `[brevo] CONTACTO NO ENTREGADO (${reason}) — recuperar a mano: ${JSON.stringify(input)}`,
  )
}

/**
 * Entrega best-effort a Brevo: **nunca lanza**.
 *
 * Un fallo del proveedor (401 por IP no autorizada, caída, timeout) o una
 * variable sin configurar ya no tumban el endpoint con un 502. El visitante
 * ve éxito —su solicitud sí llegó, está en el log— y el fallo queda ruidoso
 * en el servidor para quien opera.
 */
export async function deliverBrevoContact(
  input: UpsertBrevoContactInput,
  listEnvVar: string,
): Promise<BrevoDeliveryResult> {
  const { brevoApiKey } = useRuntimeConfig()

  const missing = [
    !brevoApiKey && 'NUXT_BREVO_API_KEY',
    !input.listId && listEnvVar,
  ].filter(Boolean)

  if (missing.length > 0) {
    console.error(`[brevo] configuración incompleta — faltan variables: ${missing.join(', ')}`)
    logRecoverableContact('not_configured', input)
    return { delivered: false, reason: 'not_configured' }
  }

  try {
    await upsertBrevoContact(input)
    return { delivered: true }
  }
  catch {
    // El status y el cuerpo de la respuesta de Brevo ya se registraron dentro
    // de `upsertBrevoContact`; aquí sólo se añade el contacto recuperable.
    logRecoverableContact('provider_error', input)
    return { delivered: false, reason: 'provider_error' }
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
