import { z } from 'zod'

/**
 * Canonical "how can we help" options — shared verbatim between the Contact
 * section form (`interest`) and the FloatingCtaDrawer (`role`), and between
 * their client-side (real-time) and server-side (authoritative) validation.
 * Single source of truth so the two never drift apart — the legacy
 * vanilla-JS version had a typo on this exact enum ("Testes de Accesso...")
 * from having it duplicated by hand in more than one place.
 *
 * Lives under `shared/` (Nuxt 4's app+server auto-import directory, see
 * https://nuxt.com/docs/guide/directory-structure/shared) so both
 * `app/components/home/ContactSection.vue` and
 * `server/api/contact.post.ts` validate against the exact same rules —
 * that's the whole point of "real-time validation with Zod/Vue": the client
 * check is a UX nicety, the server check (safeParse on the same schema) is
 * what's actually authoritative and security-relevant.
 */
export const LEAD_INTEREST_OPTIONS = [
  'Inversor de Capital',
  'Socio Estratégico / Cliente',
  'Tester de Acceso Anticipado / Usuario',
] as const

export type LeadInterest = (typeof LEAD_INTEREST_OPTIONS)[number]

// No `.min()`/`.email()` custom messages here on purpose — user-facing copy
// belongs in i18n/locales/*.json, not baked into the schema in one language.
// Both contact.post.ts and ContactSection.vue map a failing field to its own
// translated message instead of reading zod's issue text.
export const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().max(180),
  // Optional — see the perf/legacy conversation: forcing it would lose the
  // individual "Tester" applicant who has no organization to declare.
  company: z.string().trim().max(160).optional().default(''),
  interest: z.enum(LEAD_INTEREST_OPTIONS),
  message: z.string().trim().max(2000).optional().default(''),
  // No length constraint here on purpose: a filled-in value must still pass
  // validation so the bot-trap check can run and respond as if nothing
  // happened, instead of leaking a 422 that would tip the bot off.
  honeypot: z.string().max(500).optional().default(''),
})

export type ContactInput = z.infer<typeof contactSchema>

// FloatingCtaDrawer.vue's lighter-weight quick-capture widget — same
// interest enum (as `role`) and honeypot convention, no `company` (it's a
// tap-to-open drawer, not the qualifying B2B form) plus `context` for which
// page section it was opened from.
export const subscribeSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().max(180),
  role: z.enum(LEAD_INTEREST_OPTIONS),
  message: z.string().trim().max(2000).optional().default(''),
  context: z.enum(['general', 'ecosystem', 'services', 'partners']).optional().default('general'),
  honeypot: z.string().max(500).optional().default(''),
})

export type SubscribeInput = z.infer<typeof subscribeSchema>
