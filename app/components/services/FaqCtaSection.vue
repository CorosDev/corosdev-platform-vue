<script setup lang="ts">
/**
 * Cierre global de /services: objeciones B2B (FAQ) + CTA final a la
 * Discovery Call. Vive después de MethodologySection a propósito — el
 * visitante ya vio los 3 pilares y el "cómo ejecutamos", así que el cierre
 * resuelve las últimas dudas de riesgo/onboarding antes de pedirle la
 * llamada, en vez de pedírsela en frío.
 *
 * El acordeón usa `<details>/<summary>` nativos en lugar de un componente de
 * acordeón con JS: foco, teclado y lectores de pantalla funcionan gratis, y
 * la página ya está en a11y 100 (ver memoria de sprint UI/UX) — no hay razón
 * para introducir un patrón ARIA a mano donde el elemento nativo alcanza.
 */
const { t } = useI18n()
const { open: openCtaDrawer } = useCtaDrawer()

const questionIds = ['q1', 'q2', 'q3', 'q4', 'q5'] as const

const questions = computed(() =>
  questionIds.map((id) => ({
    id,
    q: t(`services.faq.${id}_q`),
    a: t(`services.faq.${id}_a`),
  })),
)
</script>

<template>
  <section class="relative z-10 py-16 md:py-28">
    <div class="mx-auto max-w-4xl px-6">
      <div v-reveal class="mb-10 text-center md:mb-14">
        <p class="mb-4 text-[11px] font-bold uppercase tracking-[0.35em] text-accent-text">
          {{ t('services.faq.label') }}
        </p>
        <h2 class="text-3xl font-black leading-[1.1] tracking-tight text-ink md:text-5xl">
          {{ t('services.faq.h2_1') }}
          <span class="gradient-text">{{ t('services.faq.h2_span') }}</span>
        </h2>
      </div>

      <div v-reveal="100" class="space-y-3">
        <details
          v-for="item in questions"
          :key="item.id"
          class="group rounded-xl border border-hairline bg-surface-strong/50 px-6 py-4 open:pb-5"
        >
          <summary class="flex cursor-pointer list-none items-center justify-between gap-4 py-1 text-left font-bold text-ink marker:content-none">
            {{ item.q }}
            <svg
              class="h-4 w-4 shrink-0 text-accent-text transition-transform duration-300 ease-out-expo group-open:rotate-45"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2.2"
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </summary>
          <p class="mt-3 text-sm leading-relaxed text-ink-muted">{{ item.a }}</p>
        </details>
      </div>

      <div v-reveal="150" class="mt-16 rounded-2xl border border-neon-500/25 bg-neon-500/10 p-8 text-center md:p-12">
        <p class="text-[11px] font-bold uppercase tracking-[0.3em] text-accent-text">
          {{ t('services.closing.eyebrow') }}
        </p>
        <h3 class="mt-4 text-2xl font-black tracking-tight text-ink md:text-4xl">
          {{ t('services.closing.title') }}
        </h3>
        <p class="mx-auto mt-3 max-w-md text-base leading-relaxed text-ink-muted">
          {{ t('services.closing.sub') }}
        </p>
        <button
          type="button"
          class="mt-8 inline-flex items-center gap-2 rounded-lg bg-neon-500 px-7 py-3.5 text-sm font-bold text-brand-900 transition-all duration-300 ease-out-expo hover:-translate-y-0.5 hover:bg-neon-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-300 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-900"
          @click="openCtaDrawer('services')"
        >
          {{ t('services.closing.cta') }}
          <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>
    </div>
  </section>
</template>
