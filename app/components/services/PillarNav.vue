<script setup lang="ts">
/**
 * Tab bar flotante para saltar entre los 3 pilares (#custom-software,
 * #scaling-talent, #tech-partnership) mientras se hace scroll por /services.
 *
 * Es `fixed`, no `sticky`. `sticky` era la primera versión, pero
 * `app/layouts/default.vue` envuelve TODA la página en un div con
 * `overflow-x-hidden` — y por la regla de "pairing" del spec de overflow
 * (CSS Overflow Module §3), un `overflow-x` distinto de `visible` fuerza el
 * `overflow-y` de ese mismo elemento a computar como `auto`, así que ese div
 * se vuelve "scroll container" y pasa a ser el contenedor de referencia de
 * cualquier `position: sticky` descendiente — pero como ese div nunca
 * desplaza su propio `scrollTop` (es la ventana la que hace scroll, no él),
 * el resultado observado es que el elemento "sticky" simplemente se desplaza
 * con la página como si fuera estático. Confirmado en Playwright: con
 * `sticky`, `getBoundingClientRect().top` seguía cayendo 1:1 con el scroll en
 * vez de clavarse en `top`. `AppNavbar.vue` no sufre esto porque ya usa
 * `fixed` — un elemento `fixed` se posiciona contra el viewport salvo que
 * algún ancestro tenga `transform`/`filter`/`contain`, y ninguno lo tiene
 * aquí (confirmado igual). Mismo patrón, misma solución.
 *
 * Al ser `fixed` no reserva espacio en el flujo, así que aparece recién
 * cuando el scroll deja atrás el Hero (`visible`, umbral en píxeles como ya
 * hace `AppNavbar` con su propio `scrolled`, ver ese componente) — si
 * apareciera desde el primer pintado taparía el badge/H1 del Hero, que no
 * reserva espacio extra para una segunda barra fija.
 *
 * `top-[82px] md:top-[98px]` = alto real de `AppNavbar` (74px móvil / 90px
 * desktop, medido en Playwright) + ~8px de aire. Si esa altura cambia, este
 * valor y el `scroll-mt-*` de PillarSection.vue hay que revisarlos juntos —
 * no hay hoy una sola fuente de verdad para "alto del header".
 *
 * El resaltado de la pestaña activa usa IntersectionObserver en vez de
 * `scroll` + cálculos de posición: más barato (no corre en cada frame de
 * scroll) y no requiere leer `getBoundingClientRect` a mano. El
 * `rootMargin` negativo arriba y abajo reduce el viewport observado a una
 * franja delgada cerca del centro, así que la sección "activa" es la que
 * cruza esa franja, no la que apenas asoma por el borde inferior.
 *
 * Todo esto corre solo en cliente (onMounted): en SSR no hay
 * `IntersectionObserver` ni `window`, ni sentido en decidir visibilidad antes
 * de que exista scroll.
 */
const { t } = useI18n()

const pillars = [
  { id: 'custom-software', key: 'customSoftware' },
  { id: 'scaling-talent', key: 'scalingTalent' },
  { id: 'tech-partnership', key: 'techPartnership' },
] as const

const tabs = computed(() =>
  pillars.map((pillar) => ({
    id: pillar.id,
    label: t(`services.pillars.${pillar.key}_nav`),
  })),
)

const activeId = ref<string>(pillars[0].id)
const visible = ref(false)
let observer: IntersectionObserver | null = null

function handleScroll() {
  visible.value = window.scrollY > 320
}

onMounted(() => {
  handleScroll()
  window.addEventListener('scroll', handleScroll, { passive: true })

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          activeId.value = entry.target.id
        }
      }
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
  )

  for (const pillar of pillars) {
    const el = document.getElementById(pillar.id)
    if (el) observer.observe(el)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  observer?.disconnect()
})
</script>

<template>
  <nav
    class="fixed inset-x-0 top-[82px] z-40 px-6 transition-all duration-300 ease-out-expo md:top-[98px]"
    :class="visible ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'"
    :aria-label="t('services.pillars.navLabel')"
  >
    <div class="mx-auto flex max-w-7xl justify-center overflow-x-auto rounded-full border border-hairline bg-surface/85 p-1.5 shadow-2xl backdrop-blur-md">
      <a
        v-for="tab in tabs"
        :key="tab.id"
        :href="`#${tab.id}`"
        class="shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors duration-300 ease-out-expo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-300"
        :aria-current="activeId === tab.id ? 'true' : undefined"
        :class="
          activeId === tab.id
            ? 'bg-neon-500 text-brand-900'
            : 'text-ink-muted hover:bg-surface-strong/60 hover:text-ink'
        "
      >
        {{ tab.label }}
      </a>
    </div>
  </nav>
</template>
