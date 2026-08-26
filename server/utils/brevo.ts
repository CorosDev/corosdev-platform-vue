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
 */
interface UpsertBrevoContactInput {
  email: string
  listId: number
  attributes?: Record<string, string>
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
  await $fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
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
