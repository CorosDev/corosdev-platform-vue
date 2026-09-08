/**
 * Directiva `v-tilt`: inclinación 3D magnética + spotlight de borde cobalto.
 *
 *   <div v-tilt>…</div>      // inclinación máxima por defecto (6deg)
 *   <div v-tilt="5">…</div>  // inclinación máxima 5deg
 *
 * Hermana de `v-reveal` / `v-vanish`: plugin de Nuxt (no `.client.ts`) + CSS
 * pareada en `app/assets/css/main.css`. Aquí NO hay `getSSRProps` — el estado
 * en reposo es "sin transform", que ya es el default del DOM, así que el
 * atributo `data-tilt` sólo lo añade el cliente y sólo si el dispositivo
 * cualifica; en SSR y en táctil este contrato no toca el árbol.
 *
 * Coste de runtime acotado, mismo criterio que `UiSpotlightCard`:
 * - Sólo se arma en punteros finos con hover real
 *   (`(hover: hover) and (pointer: fine)`): en móvil/táctil no se registra ni
 *   un listener.
 * - `prefers-reduced-motion: reduce` ⇒ no-op absoluto.
 * - `pointermove` sólo guarda coordenadas; el `getBoundingClientRect` y la
 *   escritura de las CSS vars ocurren UNA vez por frame dentro de un
 *   `requestAnimationFrame`, nunca por evento — sin layout thrashing.
 * - `will-change: transform` sólo mientras el cursor está dentro; se libera
 *   ~550ms después de salir, una vez consumido el retorno amortiguado.
 * - Lo animado es `transform` (rotate/translate en el compositor) y la
 *   `opacity` de dos capas de gradiente. Nada dispara layout ni repinta el
 *   contenido. Cero impacto en CLS/TBT.
 */
const MAX_TILT_DEFAULT = 6

/** Cleanups por elemento — la directiva no guarda estado propio de instancia. */
const cleanups = new WeakMap<HTMLElement, () => void>()

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive<HTMLElement, number | undefined>('tilt', {
    mounted(el, binding) {
      // Se evalúa tras el montaje (no en setup) para no tocar `window` en SSR.
      if (
        !window.matchMedia('(hover: hover) and (pointer: fine)').matches ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        return
      }

      const max = binding.value || MAX_TILT_DEFAULT
      let frame = 0
      let releaseTimer = 0
      let pointerX = 0
      let pointerY = 0
      let inside = false

      function paint() {
        frame = 0
        const rect = el.getBoundingClientRect()
        if (!rect.width || !rect.height) return
        const localX = pointerX - rect.left
        const localY = pointerY - rect.top
        // Desplazamiento del cursor respecto al centro, normalizado a [-1, 1].
        const nx = (localX / rect.width - 0.5) * 2
        const ny = (localY / rect.height - 0.5) * 2
        // rotateX se invierte: cursor arriba ⇒ el borde superior se aleja.
        el.style.setProperty('--tilt-rx', `${(-ny * max).toFixed(2)}deg`)
        el.style.setProperty('--tilt-ry', `${(nx * max).toFixed(2)}deg`)
        el.style.setProperty('--tilt-spot-x', `${localX.toFixed(1)}px`)
        el.style.setProperty('--tilt-spot-y', `${localY.toFixed(1)}px`)
      }

      function onMove(event: PointerEvent) {
        pointerX = event.clientX
        pointerY = event.clientY
        if (!inside) {
          inside = true
          window.clearTimeout(releaseTimer)
          el.style.willChange = 'transform'
          el.dataset.tilt = 'active'
        }
        if (!frame) frame = requestAnimationFrame(paint)
      }

      function onLeave() {
        inside = false
        if (frame) {
          cancelAnimationFrame(frame)
          frame = 0
        }
        // `idle` conserva el atributo (las capas de spotlight se desvanecen
        // por transición) y devuelve la inclinación a 0 con la curva larga.
        el.dataset.tilt = 'idle'
        el.style.setProperty('--tilt-rx', '0deg')
        el.style.setProperty('--tilt-ry', '0deg')
        window.clearTimeout(releaseTimer)
        releaseTimer = window.setTimeout(() => {
          if (!inside) el.style.willChange = ''
        }, 550)
      }

      el.addEventListener('pointermove', onMove)
      el.addEventListener('pointerleave', onLeave)
      el.addEventListener('pointercancel', onLeave)

      cleanups.set(el, () => {
        if (frame) cancelAnimationFrame(frame)
        window.clearTimeout(releaseTimer)
        el.removeEventListener('pointermove', onMove)
        el.removeEventListener('pointerleave', onLeave)
        el.removeEventListener('pointercancel', onLeave)
      })
    },

    unmounted(el) {
      cleanups.get(el)?.()
      cleanups.delete(el)
    },
  })
})
