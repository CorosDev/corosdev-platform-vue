<script setup lang="ts">
// Toggle binario Light/Dark (nunca expone 'system' — ver
// dark-light-mode-toggle-scope en memoria: el sitio nace 100% oscuro y el
// cambio de tema es una elección explícita del visitante, no un espejo del SO).
// `useColorMode()` lo expone @nuxtjs/color-mode (nuxt.config.ts) sin import —
// `.value` es el modo YA resuelto (nunca 'system'), `.preference` es lo que
// escribimos para cambiarlo y lo que persiste en localStorage.
const { t } = useI18n()
const colorMode = useColorMode()

const isLight = computed(() => colorMode.value === 'light')

// Ver los comentarios en main.css junto a `.theme-transition` y
// `::view-transition-old(root)` — este es el único punto de la app que
// dispara el cambio de tema, así que es el único sitio que necesita saber
// cuál de los dos mecanismos usar.
function toggleTheme() {
  const next = isLight.value ? 'dark' : 'light'

  // TS 5.9's lib.dom.d.ts already declares `startViewTransition` as a
  // required member of `Document` — real-world support (missing in Firefox
  // and older Safari) lags behind the type, so the type is widened locally
  // to an optional member instead of trusting it: a plain
  // `'startViewTransition' in document` check would let TS prove the
  // condition always true and collapse the fallback branch below to `never`.
  const doc = document as Document & { startViewTransition?: (callback: () => void) => unknown }

  if (typeof doc.startViewTransition === 'function') {
    doc.startViewTransition(() => {
      colorMode.preference = next
    })
    return
  }

  const root = doc.documentElement
  root.classList.add('theme-transition')
  colorMode.preference = next
  window.setTimeout(() => root.classList.remove('theme-transition'), 450)
}
</script>

<template>
  <button
    type="button"
    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-hairline bg-surface-muted/50 text-ink/70 transition-colors duration-300 ease-out-expo hover:border-accent hover:bg-accent/10 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    :aria-label="isLight ? t('nav.themeToggleToDark') : t('nav.themeToggleToLight')"
    @click="toggleTheme"
  >
    <!-- Modo claro activo → ofrece pasar a oscuro: ícono de luna. -->
    <svg v-if="isLight" class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 1020.354 15.354z" />
    </svg>
    <!-- Modo oscuro activo → ofrece pasar a claro: ícono de sol. -->
    <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path
        stroke-linecap="round"
        d="M12 2.5v2M12 19.5v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2.5 12h2M19.5 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
      />
    </svg>
  </button>
</template>
