/**
 * Gancho de entrega de leads a CRM / Webhook (Fase 4).
 *
 * `server/api/lead.post.ts` llama a `dispatchLead()` tras validar el body.
 * Es best-effort a propósito: un fallo aquí NO debe tumbar un envío válido
 * (el endpoint lo captura, lo loguea y responde éxito igual).
 *
 * - Si `NUXT_CRM_WEBHOOK_URL` está configurada, hace POST del lead ahí
 *   (catch-hook de Zapier / Make / n8n / HubSpot Forms API, etc.).
 * - Si no, deja el lead estructurado en el log del servidor para que no se
 *   pierda nada hasta cablear el CRM real.
 */
import type { LeadInput } from '~/utils/leadSchema'

export interface DispatchedLead extends LeadInput {
  source: string
  receivedAt: string
}

export async function dispatchLead(lead: LeadInput): Promise<void> {
  const payload: DispatchedLead = {
    ...lead,
    source: 'contact_modal',
    receivedAt: new Date().toISOString(),
  }

  const { crmWebhookUrl } = useRuntimeConfig()

  if (crmWebhookUrl) {
    await $fetch(crmWebhookUrl, {
      method: 'POST',
      body: payload,
      // No dejamos que un CRM lento cuelgue la respuesta al visitante.
      timeout: 6000,
    })
    return
  }

  console.info('[lead] captured (no NUXT_CRM_WEBHOOK_URL configured):', JSON.stringify(payload))
}
