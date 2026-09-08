import { z } from 'zod'

/**
 * Lead-capture schemas shared between each form component (client-side,
 * real-time validation) and its Nitro endpoint (authoritative validation).
 *
 * Lives under `shared/` (Nuxt 4's app+server auto-import directory, see
 * https://nuxt.com/docs/guide/directory-structure/shared) so both
 * `app/components/home/ContactSection.vue` and `server/api/contact.post.ts`
 * validate against the exact same rules — the client check is a UX nicety,
 * the server check (safeParse on the same schema) is what's actually
 * authoritative and security-relevant.
 *
 * The two forms deliberately have DIFFERENT option sets: the Contact section
 * is the B2B sales funnel (which service do you need) and the floating
 * drawer is the ecosystem funnel (how do you want to join). They shared one
 * enum until this pass, which made them read as the same form twice.
 *
 * Option VALUES stay pinned to their canonical Spanish string regardless of
 * the active UI locale — only the displayed <option> label is translated
 * (see each component's label-key map). They are what lands in Brevo's
 * INTEREST contact attribute, so they are kept human-readable for whoever
 * reads the list there rather than being opaque slugs. Changing one of these
 * strings changes what new leads are tagged with, so old and new values will
 * coexist in Brevo — rename deliberately.
 */

/** Contact section — the B2B "what do you need built" sales funnel. */
export const CONTACT_SERVICE_OPTIONS = [
  'Desarrollo de Software a Medida',
  'Soluciones de IA e Integración',
  'Aplicaciones Web y Móviles',
  'Consultoría',
] as const

export type ContactService = (typeof CONTACT_SERVICE_OPTIONS)[number]

/** Floating CTA drawer — the ecosystem/investor/tester application funnel. */
export const ECOSYSTEM_ROLE_OPTIONS = [
  'Tester de Acceso Anticipado',
  'Inversor Ángel / VC',
  'Socio Estratégico',
] as const

export type EcosystemRole = (typeof ECOSYSTEM_ROLE_OPTIONS)[number]

/**
 * El drawer flotante sirve a dos embudos distintos según el contexto con el
 * que se abra, así que su campo `role` acepta ambos juegos de opciones: los
 * roles de ecosistema cuando entra por el botón flotante o desde /ecosystem,
 * y los servicios cuando lo abre un CTA de /services. Preguntarle a un CTO
 * que pide una propuesta si es "Inversor Ángel / VC" rompe la conversación
 * en la primera pregunta.
 *
 * Los dos juegos siguen siendo listas separadas y con significado propio;
 * esta unión existe sólo para el endpoint, que recibe cualquiera de las dos
 * y las distingue por el `context` que ya venía enviando en `SOURCE`.
 */
export const DRAWER_ROLE_OPTIONS = [...ECOSYSTEM_ROLE_OPTIONS, ...CONTACT_SERVICE_OPTIONS] as const

export type DrawerRole = (typeof DRAWER_ROLE_OPTIONS)[number]

// No `.min()`/`.email()` custom messages here on purpose — user-facing copy
// belongs in i18n/locales/*.json, not baked into the schema in one language.
// Both contact.post.ts and ContactSection.vue map a failing field to its own
// translated message instead of reading zod's issue text.
export const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().max(180),
  // Optional — forcing it would lose the solo founder with no registered
  // company to declare yet.
  company: z.string().trim().max(160).optional().default(''),
  // No default: the select starts on a non-submittable placeholder so the
  // visitor has to pick a service, rather than silently tagging every
  // untouched lead with whichever option happens to be listed first.
  interest: z.enum(CONTACT_SERVICE_OPTIONS),
  message: z.string().trim().max(2000).optional().default(''),
  // No length constraint here on purpose: a filled-in value must still pass
  // validation so the bot-trap check can run and respond as if nothing
  // happened, instead of leaking a 422 that would tip the bot off.
  honeypot: z.string().max(500).optional().default(''),
})

export type ContactInput = z.infer<typeof contactSchema>

/**
 * Paso 2 del formulario de contacto: cualificación OPCIONAL que se ofrece en
 * la pantalla de éxito, con el lead ya guardado en Brevo. Va aparte de
 * `contactSchema` a propósito — si estos campos vivieran en el formulario
 * visible serían dos preguntas más antes de capturar nada, y cada campo
 * extra cuesta conversión. Aquí, si el visitante lo abandona, no se pierde
 * nada: el lead ya entró.
 *
 * Los valores quedan fijados a su cadena canónica (misma convención que
 * CONTACT_SERVICE_OPTIONS): son lo que aterriza en los atributos de Brevo,
 * así que se mantienen legibles para quien lea la lista allí. Los rangos de
 * presupuesto no se traducen porque son idénticos en ambos idiomas.
 */
export const BUDGET_RANGE_OPTIONS = ['< $25k', '$25k – $50k', '$50k – $100k', '$100k+'] as const

export type BudgetRange = (typeof BUDGET_RANGE_OPTIONS)[number]

export const COMPANY_PROFILE_OPTIONS = [
  'Startup en fase temprana',
  'Scale-up en crecimiento',
  'Empresa consolidada',
  'Agencia o consultora',
] as const

export type CompanyProfile = (typeof COMPANY_PROFILE_OPTIONS)[number]

export const qualifySchema = z.object({
  // Identifica al contacto ya creado en el paso 1; `updateEnabled` en Brevo
  // hace que esto fusione atributos en lugar de duplicar el contacto.
  email: z.email().max(180),
  budget: z.enum(BUDGET_RANGE_OPTIONS),
  profile: z.enum(COMPANY_PROFILE_OPTIONS),
  honeypot: z.string().max(500).optional().default(''),
})

export type QualifyInput = z.infer<typeof qualifySchema>

// FloatingCtaDrawer.vue's lighter-weight quick-capture widget — same honeypot
// convention, no `company` (it's a tap-to-open drawer, not the qualifying B2B
// form), plus `context` for which page section it was opened from.
export const subscribeSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().max(180),
  role: z.enum(DRAWER_ROLE_OPTIONS),
  message: z.string().trim().max(2000).optional().default(''),
  context: z.enum(['general', 'ecosystem', 'services', 'partners']).optional().default('general'),
  honeypot: z.string().max(500).optional().default(''),
})

export type SubscribeInput = z.infer<typeof subscribeSchema>
