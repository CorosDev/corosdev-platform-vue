<script setup lang="ts">
/**
 * Cierre de /about. El CTA abre el drawer con contexto 'partners' en lugar
 * de mandar al formulario de servicios del home: quien llega al final de la
 * página de equipo viene por colaboración o talento, no a pedir una
 * cotización de desarrollo — y ese contexto ya tenía copy propio esperando
 * a que alguien lo invocara.
 */
const { t } = useI18n()
const { open: openCtaDrawer } = useCtaDrawer()
</script>

<template>
  <section class="relative overflow-hidden py-12 md:py-24">
    <div class="mx-auto max-w-7xl px-6">
      <UiSpotlightCard
        v-reveal
        :size="620"
        class="flex flex-col items-start gap-8 rounded-2xl p-8 md:p-12 lg:flex-row lg:items-center lg:justify-between"
      >
        <div>
          <h2 class="max-w-xl text-2xl font-black leading-[1.15] tracking-tight text-ink md:text-4xl">
            {{ t('about.cta.h2_1') }} <span class="gradient-text">{{ t('about.cta.h2_span') }}</span>
          </h2>
          <p class="mt-4 max-w-md text-base leading-relaxed text-ink-muted">{{ t('about.cta.p') }}</p>
        </div>

        <button
          type="button"
          class="inline-flex shrink-0 items-center gap-2 rounded-lg bg-neon-500 px-6 py-3.5 text-sm font-bold text-brand-900 transition-all duration-300 ease-out-expo hover:-translate-y-0.5 hover:bg-neon-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-300 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-900"
          @click="openCtaDrawer('partners')"
        >
          {{ t('about.cta.btn') }}
          <svg
            class="h-4 w-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2.5"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </UiSpotlightCard>
    </div>
  </section>
</template>
