<script setup lang="ts">
/**
 * Banner de consentimiento (Consent Mode v2). Montado una vez en
 * app/layouts/default.vue, se auto-importa como `<CommonCookieBanner />`.
 *
 * No escribe `localStorage` por su cuenta: delega en `$gtag.grantAll()` /
 * `$gtag.essentialOnly()`, que actualizan el consentimiento Y lo persisten bajo
 * la misma clave que el plugin relee al arrancar. Arquitectura y porqués:
 * docs/GA4_CSP_FIX.md §8
 */
import type { ConsentDecision } from '~/utils/consent'

const { t } = useI18n()
const { $gtag } = useNuxtApp()

// Arranca oculto para que el HTML servido por SSR y la primera pasada de
// hidratación coincidan: `localStorage` no existe en el servidor.
const isVisible = ref(false)

onMounted(() => {
  isVisible.value = readConsentDecision() === null
})

function decide(decision: ConsentDecision) {
  if (decision === 'granted') $gtag.grantAll()
  else $gtag.essentialOnly()

  isVisible.value = false
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="cookie-banner-transition"
      leave-active-class="cookie-banner-transition"
      enter-from-class="cookie-banner--hidden"
      leave-to-class="cookie-banner--hidden"
    >
      <section
        v-if="isVisible"
        class="cookie-banner border border-hairline bg-surface p-5 sm:p-6"
        role="region"
        :aria-label="t('cookieBanner.aria')"
      >
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div class="min-w-0">
            <h2 class="text-sm font-bold tracking-tight text-ink">{{ t('cookieBanner.title') }}</h2>
            <p class="mt-1 text-xs leading-relaxed text-ink-muted">{{ t('cookieBanner.message') }}</p>
          </div>

          <div class="flex shrink-0 flex-col gap-2 sm:ml-auto sm:flex-row">
            <button
              type="button"
              class="rounded-lg border border-hairline px-4 py-2.5 text-xs font-semibold text-ink transition-colors hover:border-neon-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-300"
              @click="decide('denied')"
            >
              {{ t('cookieBanner.reject') }}
            </button>
            <button
              type="button"
              class="rounded-lg bg-neon-500 px-4 py-2.5 text-xs font-bold text-brand-900 transition-colors hover:bg-neon-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-300"
              @click="decide('granted')"
            >
              {{ t('cookieBanner.accept') }}
            </button>
          </div>
        </div>
      </section>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* z-index 95: por encima del botón flotante de captación (90, ver
   FloatingCtaDrawer.vue) y por debajo del drawer y del ContactModal
   (100/101), que deben poder abrirse sobre el banner. */
.cookie-banner {
  position: fixed;
  bottom: 1.25rem;
  left: 50%;
  z-index: 95;
  width: calc(100% - 2rem);
  max-width: 44rem;
  border-radius: 1rem;
  box-shadow: 0 18px 48px rgb(0 0 0 / 0.35);
  transform: translateX(-50%);
}

.cookie-banner-transition {
  transition: opacity 0.35s ease, transform 0.35s ease;
}

.cookie-banner--hidden {
  opacity: 0;
  transform: translate(-50%, 1rem);
}

@media (prefers-reduced-motion: reduce) {
  .cookie-banner-transition {
    transition: none;
  }

  .cookie-banner--hidden {
    transform: translateX(-50%);
  }
}
</style>
