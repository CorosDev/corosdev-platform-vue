<script setup lang="ts">
/**
 * CTA de cierre de artículo. Abre el `FloatingCtaDrawer` existente con
 * contexto `general` (quien termina de leer un insight aún está arriba del
 * embudo, no pidiendo una cotización concreta) en vez de mandar al
 * formulario del home.
 */
const { t } = useI18n()
const { open: openCtaDrawer } = useCtaDrawer()
</script>

<template>
  <section class="relative overflow-hidden py-12 md:py-20">
    <div class="mx-auto max-w-3xl px-6">
      <UiSpotlightCard
        v-reveal
        :size="560"
        class="flex flex-col items-start gap-6 rounded-2xl p-8 md:p-10"
      >
        <h2 class="text-2xl font-black leading-[1.15] tracking-tight text-ink md:text-3xl">
          {{ t('blog.cta.title_1') }} <span class="gradient-text">{{ t('blog.cta.title_span') }}</span>
        </h2>
        <p class="max-w-lg text-base leading-relaxed text-ink-muted">{{ t('blog.cta.body') }}</p>

        <button
          type="button"
          class="inline-flex shrink-0 items-center gap-2 rounded-lg bg-neon-500 px-6 py-3.5 text-sm font-bold text-brand-900 transition-all duration-300 ease-out-expo hover:-translate-y-0.5 hover:bg-neon-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-300 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-900"
          @click="openCtaDrawer('general')"
        >
          {{ t('blog.cta.button') }}
          <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </UiSpotlightCard>
    </div>
  </section>
</template>
