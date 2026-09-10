/**
 * Esquema del formulario de captación de leads (Fase 4 — Lead Generation &
 * CRM Automation). Lo consume el modal global (`useContactModal` /
 * `ContactModal.vue`) para validar en cliente y `server/api/lead.post.ts`
 * para la validación autoritativa antes de disparar el gancho a CRM/Webhook.
 *
 * Vive en `app/utils/` (auto-importado en el contexto de la app); el endpoint
 * Nitro lo importa con `~/utils/leadSchema` (el alias `~` resuelve a `app/`
 * también en el tsconfig de servidor).
 *
 * Sin mensajes de error personalizados en el schema a propósito: el copy
 * de cara al usuario vive en `i18n/locales/*.json`. Tanto el endpoint como
 * el componente mapean un campo que falla a su mensaje traducido.
 */
import { z } from 'zod'

/** Tipo de proyecto — valores estables (máquina); la etiqueta se traduce en la UI. */
export const PROJECT_TYPE_OPTIONS = ['web', 'mobile', 'ai', 'audit', 'other'] as const
export type ProjectType = (typeof PROJECT_TYPE_OPTIONS)[number]

/** Rango de presupuesto estimado en USD — mismos valores en ambos idiomas. */
export const BUDGET_OPTIONS = ['<10k', '10k-25k', '25k-50k', '50k-100k', '100k+'] as const
export type Budget = (typeof BUDGET_OPTIONS)[number]

export const leadSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().max(180),
  // Opcional — no todo fundador tiene una empresa registrada que declarar.
  company: z.string().trim().max(160).optional().default(''),
  projectType: z.enum(PROJECT_TYPE_OPTIONS),
  budget: z.enum(BUDGET_OPTIONS),
  message: z.string().trim().min(10).max(4000),
})

export type LeadInput = z.infer<typeof leadSchema>
