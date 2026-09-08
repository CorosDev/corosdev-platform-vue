/**
 * Directiva `v-vanish`: fade/blur bidireccional ligado al viewport.
 *
 *   <section v-vanish>…</section>
 *
 * A diferencia de `v-reveal` (aparición de una sola dirección, `unobserve` en
 * cuanto entra), este efecto es REVERSIBLE: el bloque se atenúa al salir del
 * viewport —por arriba o por abajo— y se recompone al volver a entrar, así que
 * el elemento se mantiene observado toda su vida.
 *
 * Un único IntersectionObserver compartido por toda la app y cero listeners de
 * `scroll`: no hay trabajo en el hilo principal durante el scroll, el LCP/TBT
 * no se ve afectado.
 *
 * Apto ABOVE THE FOLD, hero incluido: `getSSRProps` emite el estado VISIBLE
 * (`in`) en el HTML del servidor, de modo que el primer pintado ya es el
 * definitivo; el observer sólo puede atenuar DESPUÉS de la hidratación, nunca
 * retrasar el LCP. Es la diferencia de contrato con `v-reveal`, que emite
 * `opacity: 0` y por eso tiene prohibido el hero.
 *
 * El plugin corre en servidor Y cliente a propósito (no es `.client.ts`):
 * `getSSRProps` necesita existir durante el render de Nitro. `mounted` sólo se
 * ejecuta en cliente por definición, así que el resto nunca toca `window`.
 */
export default defineNuxtPlugin((nuxtApp) => {
  let observer: IntersectionObserver | null = null

  function setState(el: HTMLElement, state: 'in' | 'out') {
    if (el.dataset.vanish === state) return
    el.dataset.vanish = state
    // `will-change` sólo mientras dura la transición; se libera en
    // `releaseLayer` al terminar. Así no se dejan capas del compositor fijas
    // en reposo (lo que Lighthouse penaliza en 4 bloques a pantalla completa).
    el.style.willChange = 'opacity, filter, transform'
  }

  /**
   * Filtra por `opacity` para correr UNA sola vez por transición, no tres
   * (opacity + filter + transform terminan por separado).
   */
  function releaseLayer(event: Event) {
    const te = event as TransitionEvent
    if (te.propertyName !== 'opacity') return
    ;(te.currentTarget as HTMLElement).style.willChange = ''
  }

  function getObserver() {
    if (observer) return observer
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement
          if (entry.isIntersecting) {
            setState(el, 'in')
            continue
          }
          // Deriva direccional: si el bloque queda por encima del viewport se
          // va hacia arriba, si queda por debajo se va hacia abajo. Sólo
          // `translateY`, y sólo mientras está fuera de pantalla, así que
          // nunca introduce un salto visible ni CLS.
          const rootTop = entry.rootBounds?.top ?? 0
          const leftViaTop = entry.boundingClientRect.top < rootTop
          el.style.setProperty('--vanish-shift', leftViaTop ? '-24px' : '24px')
          setState(el, 'out')
        }
      },
      // Se atenúa cuando el bloque se aleja ~12% del borde del viewport, no al
      // rozarlo: la transición termina fuera de la vista del visitante.
      { threshold: 0, rootMargin: '-12% 0px -12% 0px' },
    )
    return observer
  }

  nuxtApp.vueApp.directive<HTMLElement>('vanish', {
    getSSRProps: () => ({ 'data-vanish': 'in' }),

    mounted(el) {
      // Motion reducida o navegador sin IntersectionObserver: el bloque se
      // queda visible y sin observar. El fallback siempre es "visible".
      if (
        !('IntersectionObserver' in window) ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        el.dataset.vanish = 'in'
        return
      }
      el.dataset.vanish = 'in'
      el.addEventListener('transitionend', releaseLayer)
      getObserver().observe(el)
    },

    unmounted(el) {
      observer?.unobserve(el)
      el.removeEventListener('transitionend', releaseLayer)
    },
  })
})
