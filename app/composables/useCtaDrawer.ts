/**
 * Estado compartido del drawer de captación (FloatingCtaDrawer.vue).
 *
 * Existe porque el drawer soportaba desde su port cuatro contextos de copy
 * (`general`, `ecosystem`, `services`, `partners`) pero sólo podía abrirse
 * desde su propio botón flotante, que siempre pasaba `general` — los otros
 * tres eran código muerto. Cualquier sección puede ahora abrirlo con su
 * contexto: `useCtaDrawer().open('ecosystem')`.
 *
 * Sobre `useState` y no una variable de módulo: en SSR un módulo se comparte
 * entre todas las peticiones del servidor, así que el estado de un visitante
 * se filtraría al siguiente. `useState` está aislado por petición y además
 * se serializa hacia el cliente para la hidratación (CLAUDE.md §1: estado
 * global vía useState/Pinia, cero variables en `window` — el legacy hacía
 * exactamente eso con `window.openCtaModal()`).
 */
export type CtaDrawerContext = 'general' | 'ecosystem' | 'services' | 'partners'

export function useCtaDrawer() {
  const isOpen = useState('cta-drawer-open', () => false)
  const context = useState<CtaDrawerContext>('cta-drawer-context', () => 'general')

  function open(next: CtaDrawerContext = 'general') {
    context.value = next
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  return { isOpen, context, open, close }
}
