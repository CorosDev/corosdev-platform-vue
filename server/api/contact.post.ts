import { z } from 'zod'

/**
 * Mirrors the ContactSection.vue form fields.
 * `honeypot` is a hidden input real visitors never fill in — bot traffic protection
 * per CLAUDE.md ("Validación obligatoria de tokens Cloudflare Turnstile / Honeypot
 * antes de procesar envíos"). Swap/extend with Cloudflare Turnstile verification
 * once a site key + secret are provisioned.
 */
const contactSchema = z.object({
  name: z.string().trim().min(2, 'El nombre es demasiado corto.').max(120),
  email: z.email('Correo electrónico inválido.').max(180),
  interest: z.enum([
    'Inversor de Capital',
    'Socio Estratégico / Cliente',
    'Tester de Acceso Anticipado / Usuario',
  ]),
  message: z.string().trim().max(2000).optional().default(''),
  // No length constraint here on purpose: a filled-in value must still pass
  // validation so the bot-trap check below can run and respond as if nothing
  // happened, instead of leaking a 422 that would tip the bot off.
  honeypot: z.string().max(500).optional().default(''),
})

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

  const { name, email, interest, message, honeypot } = parsed.data

  // Bots that fill the trap field silently succeed without being processed.
  if (honeypot) {
    return { success: true }
  }

  try {
    // TODO: forward the lead to the CRM/email provider (e.g. Brevo) here.
    // Any third-party API key must stay server-side (runtimeConfig), never in the client bundle.
    // await sendToBrevo({ name, email, interest, message })

    return { success: true }
  } catch {
    // Never expose raw server/provider errors to the client.
    throw createError({
      statusCode: 502,
      message: 'No se pudo procesar la solicitud. Intenta de nuevo más tarde.',
    })
  }
})
