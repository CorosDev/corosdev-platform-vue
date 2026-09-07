/**
 * Directiva `v-reveal`: aparición suave al entrar en viewport.
 *
 *   <div v-reveal>…</div>        // sin retardo
 *   <div v-reveal="120">…</div>  // 120ms de stagger
 *
 * Un único IntersectionObserver compartido por toda la app (no uno por
 * elemento) y `unobserve` en cuanto el elemento se revela: la animación es
 * de una sola dirección, nunca se vuelve a ocultar al hacer scroll hacia
 * arriba. Cero listeners de `scroll`, así que no hay trabajo en el hilo
 * principal durante el scroll — el LCP/TBT no se ve afectado.
 *
 * El plugin corre en servidor Y cliente a propósito (no es `.client.ts`):
 * `getSSRProps` necesita existir durante el render del servidor para emitir
 * el estado inicial en el HTML. `mounted` sólo se ejecuta en el cliente por
 * definición, así que el resto del código nunca toca `window` en Nitro.
 *
 * Restricción de uso: sólo para contenido below the fold. El estado inicial
 * es `opacity: 0`, de modo que aplicarlo al hero retrasaría el pintado del
 * elemento LCP hasta después de la hidratación.
 */
export default defineNuxtPlugin((nuxtApp) => {
  let observer: IntersectionObserver | null = null

  function reveal(el: HTMLElement) {
    el.dataset.reveal = 'in'
  }

  function getObserver() {
    if (observer) return observer
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          reveal(entry.target as HTMLElement)
          observer?.unobserve(entry.target)
        }
      },
      // Se dispara con el elemento ya claramente dentro de pantalla, no al
      // rozar el borde inferior: evita que la animación termine fuera de la
      // vista del visitante.
      { threshold: 0.08, rootMargin: '0px 0px -8% 0px' },
    )
    return observer
  }

  nuxtApp.vueApp.directive<HTMLElement, number | undefined>('reveal', {
    getSSRProps: () => ({ 'data-reveal': 'out' }),

    mounted(el, binding) {
      if (binding.value) {
        el.style.setProperty('--reveal-delay', `${binding.value}ms`)
      }
      // Motion reducida: el CSS ya neutraliza `[data-reveal]` por completo,
      // pero se marca `in` igualmente para no dejar el elemento observado.
      // Sin IntersectionObserver (navegador antiguo), se revela de entrada:
      // el fallback siempre es "visible", nunca "oculto".
      if (
        !('IntersectionObserver' in window) ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        reveal(el)
        return
      }
      el.dataset.reveal = 'out'
      getObserver().observe(el)
    },

    unmounted(el) {
      observer?.unobserve(el)
    },
  })
})
