import { z } from 'zod'

/**
 * Server-side proxy for FloatingCtaDrawer.vue — ported from the legacy
 * floating CTA widget (_legacy_html/cta-modal.js), which called Brevo's form
 * endpoint directly from the browser. That endpoint URL now lives in
 * runtimeConfig (nuxt.config.ts) instead of the client bundle, per
 * CLAUDE.md's "Cero API Keys en el cliente" — this is a separate lead-capture
 * flow from server/api/contact.post.ts's Contact section.
 *
 * `role` reuses the exact same three canonical values as contact.post.ts's
 * `interest` enum (one shared vocabulary across both lead forms) — the
 * legacy cta-modal.js had a typo on the tester option value
 * ("Testes de Accesso..."), fixed here rather than carried over.
 */
const subscribeSchema = z.object({
  name: z.string().trim().min(2, 'El nombre es demasiado corto.').max(120),
  email: z.email('Correo electrónico inválido.').max(180),
  role: z.enum(['Inversor de Capital', 'Socio Estratégico / Cliente', 'Tester de Acceso Anticipado / Usuario']),
  message: z.string().trim().max(2000).optional().default(''),
  context: z.enum(['general', 'ecosystem', 'services', 'partners']).optional().default('general'),
  // No length constraint here on purpose — see contact.post.ts's honeypot for why.
  honeypot: z.string().max(500).optional().default(''),
})

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

  const { brevoFormUrl } = useRuntimeConfig()

  try {
    // Brevo's sibforms endpoint expects multipart/form-data with its own
    // field names (NOMBRE/EMAIL/MULT_SLCT[]/MESSAGE) — kept as-is from the
    // legacy form markup so nothing needs to change on Brevo's side. The
    // legacy browser call used `mode: 'no-cors'` purely because it was
    // cross-origin from the client; that's not a concept that applies to a
    // server-to-server call, so it's dropped here.
    const formData = new FormData()
    formData.set('NOMBRE', name)
    formData.set('EMAIL', email)
    formData.append('MULT_SLCT[]', role)
    formData.set('MESSAGE', message)
    formData.set('context', context)
    formData.set('email_address_check', '') // Brevo's own honeypot field — always blank from this server-side call
    formData.set('locale', 'es')
    formData.set('html_type', 'simple')

    await $fetch(brevoFormUrl, {
      method: 'POST',
      body: formData,
    })

    return { success: true }
  } catch {
    // Never expose raw server/provider errors to the client.
    throw createError({
      statusCode: 502,
      message: 'No se pudo procesar la solicitud. Intenta de nuevo más tarde.',
    })
  }
})
