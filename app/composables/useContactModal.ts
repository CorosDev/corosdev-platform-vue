/**
 * Estado y envío del modal global de contacto (Fase 4 — Lead Generation).
 *
 * Lo abren los CTA "Book a demo" y "Contact" del navbar; lo renderiza
 * `app/components/ContactModal.vue`, montado una vez en el layout.
 *
 * `useState` (no una variable de módulo) para que el estado esté aislado por
 * petición en SSR y se serialice a la hidratación — CLAUDE.md §1: estado
 * global vía useState/Pinia, cero variables en `window`.
 */
import type { LeadInput } from '~/utils/leadSchema'

export type ContactModalStatus = 'idle' | 'loading' | 'success' | 'error'

interface LeadResponse {
  success: boolean
  message: string
}

/** Payload extra que acompaña al lead pero no forma parte del schema. */
interface LeadExtras {
  honeypot?: string
  turnstileToken?: string
}

export function useContactModal() {
  const isOpen = useState('contact-modal-open', () => false)
  const status = useState<ContactModalStatus>('contact-modal-status', () => 'idle')
  /** Errores por campo devueltos por el 400 estructurado de `/api/lead`. */
  const fieldErrors = useState<Record<string, string[]>>('contact-modal-errors', () => ({}))

  function open() {
    // Reabrir tras un envío correcto empieza de cero.
    if (status.value === 'success') reset()
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  function reset() {
    status.value = 'idle'
    fieldErrors.value = {}
  }

  async function submit(payload: LeadInput & LeadExtras): Promise<LeadResponse | null> {
    status.value = 'loading'
    fieldErrors.value = {}
    try {
      const res = await $fetch<LeadResponse>('/api/lead', { method: 'POST', body: payload })
      status.value = res?.success ? 'success' : 'error'
      return res
    }
    catch (err) {
      const data = (err as { data?: { errors?: Record<string, string[]> } }).data
      fieldErrors.value = data?.errors ?? {}
      status.value = 'error'
      return null
    }
  }

  return { isOpen, status, fieldErrors, open, close, reset, submit }
}
