// Contrato de almacenamiento del consentimiento: única fuente de verdad
// compartida por app/plugins/analytics.client.ts y common/CookieBanner.vue.
// Razonamiento: docs/GA4_CSP_FIX.md §8

export type ConsentDecision = 'granted' | 'denied'

export interface ConsentState {
  ad_storage: ConsentDecision
  ad_user_data: ConsentDecision
  ad_personalization: ConsentDecision
  analytics_storage: ConsentDecision
}

export const CONSENT_STORAGE_KEY = 'corosdev-consent'

export const DENIED_ALL: ConsentState = {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
}

export const GRANTED_ALL: ConsentState = {
  ad_storage: 'granted',
  ad_user_data: 'granted',
  ad_personalization: 'granted',
  analytics_storage: 'granted',
}

/** `null` = el visitante todavía no ha decidido → hay que mostrar el banner. */
export function readConsentDecision(): ConsentDecision | null {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY)
    return raw === 'granted' || raw === 'denied' ? raw : null
  }
  catch {
    return null
  }
}

export function writeConsentDecision(decision: ConsentDecision) {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, decision)
  }
  catch {
    // Safari en modo privado / almacenamiento bloqueado: la decisión sigue
    // aplicándose en esta sesión, sólo no sobrevive a la recarga.
  }
}

/** El formato persistido es todo-o-nada; sólo `granted` si lo están las cuatro. */
export function summariseConsent(state: ConsentState): ConsentDecision {
  return Object.values(state).every(value => value === 'granted') ? 'granted' : 'denied'
}
