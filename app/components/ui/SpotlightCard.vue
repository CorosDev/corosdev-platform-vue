<script setup lang="ts">
/**
 * Spotlight Card — panel de cristal con un realce radial que sigue al cursor.
 *
 * Primitivo compartido del rediseño B2B: reemplaza el patrón repetido
 * `glass rounded-3xl border border-hairline hover:...` que cada sección venía
 * redeclarando a mano (EcosystemSection, SolutionsSection, la vieja
 * SnapaySpotlightSection...) y que derivaba cada vez que se tocaba una.
 *
 * Coste de runtime, por diseño, cercano a cero:
 * - El seguimiento sólo se activa en punteros finos con hover real
 *   (`(hover: hover) and (pointer: fine)`), así que en móvil/tablet no se
 *   registra ningún listener ni se renderiza la capa de brillo.
 * - `pointermove` sólo guarda coordenadas; la lectura de layout
 *   (`getBoundingClientRect`) y la escritura de las CSS vars ocurren una
 *   sola vez por frame dentro de un `requestAnimationFrame`, nunca por
 *   evento — no hay layout thrashing.
 * - Lo animado es un `radial-gradient` sobre una capa dedicada (`opacity` +
 *   `background-position`); el contenido del slot nunca se repinta ni se
 *   promueve a capa propia. Cero impacto en CLS/TBT.
 *
 * La capa de brillo se pinta con z-index negativo dentro del stacking
 * context propio de la tarjeta (`isolate`): queda por encima del fondo del
 * panel pero siempre por debajo del contenido, sin necesidad de envolver el
 * slot en un div extra que rompería los layouts flex/grid de quien la usa.
 */
const props = withDefaults(
  defineProps<{
    /** Etiqueta del elemento raíz (`article`, `li`, `a`... según el contexto). */
    as?: string
    /** Diámetro del realce, en px. */
    size?: number
  }>(),
  { as: 'div', size: 420 },
)

const root = ref<HTMLElement | null>(null)

/** Falso hasta que se confirma un puntero fino: gobierna listener + capa de brillo. */
const tracking = ref(false)

let frame = 0
let pointerX = 0
let pointerY = 0

function paint() {
  frame = 0
  const el = root.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  el.style.setProperty('--spot-x', `${pointerX - rect.left}px`)
  el.style.setProperty('--spot-y', `${pointerY - rect.top}px`)
}

function onPointerMove(event: PointerEvent) {
  if (!tracking.value) return
  pointerX = event.clientX
  pointerY = event.clientY
  if (frame) return
  frame = requestAnimationFrame(paint)
}

onMounted(() => {
  // Se evalúa tras el montaje (no en setup) para no tocar `window` en SSR.
  // El primer render del cliente coincide con el del servidor —
  // `tracking` arranca en false en ambos — así que esto no provoca ningún
  // mismatch de hidratación, sólo un patch posterior.
  tracking.value = window.matchMedia('(hover: hover) and (pointer: fine)').matches
})

onBeforeUnmount(() => {
  if (frame) cancelAnimationFrame(frame)
})
</script>

<template>
  <component
    :is="props.as"
    ref="root"
    class="group/spot isolate relative overflow-hidden border border-hairline bg-surface-strong/50 backdrop-blur-[8px] transition-colors duration-500 ease-out-expo hover:border-neon-500/30"
    :style="{ '--spot-size': `${props.size}px` }"
    @pointermove="onPointerMove"
  >
    <span
      v-if="tracking"
      class="spot-glow pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 ease-out-expo group-hover/spot:opacity-100"
      aria-hidden="true"
    />
    <!-- Hairline superior: define el borde de la superficie sin recurrir a
         una sombra pesada (sistema de elevación por luz, no por sombra). -->
    <span
      class="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-hairline to-transparent"
      aria-hidden="true"
    />
    <slot />
  </component>
</template>

<style scoped>
.spot-glow {
  background: radial-gradient(
    var(--spot-size, 420px) circle at var(--spot-x, 50%) var(--spot-y, 0px),
    rgb(31 127 255 / 0.12),
    transparent 72%
  );
}
</style>
