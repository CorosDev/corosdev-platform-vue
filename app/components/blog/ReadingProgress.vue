<script setup lang="ts">
/**
 * Barra fina de progreso de lectura fijada al borde superior del viewport.
 *
 * Es la única parte del blog que escucha `scroll` — justificado porque el
 * dato que necesita ES la posición de scroll y no hay forma de derivarlo de
 * un IntersectionObserver. El coste se acota igual que el resto del motor de
 * animación del sitio: listener `passive`, y toda lectura/escritura de layout
 * ocurre una vez por frame dentro de un `requestAnimationFrame`, nunca por
 * evento. Con `prefers-reduced-motion: reduce` no se registra el listener y
 * la barra se queda en 0 (invisible).
 */
defineProps<{ label: string }>()

const progress = ref(0)
let frame = 0

function measure() {
  frame = 0
  const el = document.documentElement
  const max = el.scrollHeight - el.clientHeight
  progress.value = max > 0 ? Math.min(100, Math.max(0, (el.scrollTop / max) * 100)) : 0
}

function onScroll() {
  if (!frame) frame = requestAnimationFrame(measure)
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  measure()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  if (frame) cancelAnimationFrame(frame)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
})
</script>

<template>
  <div
    class="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 bg-surface-strong/50"
    role="progressbar"
    :aria-label="label"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-valuenow="Math.round(progress)"
  >
    <div
      class="h-full origin-left bg-neon-500"
      :style="{ transform: `scaleX(${progress / 100})` }"
    />
  </div>
</template>
