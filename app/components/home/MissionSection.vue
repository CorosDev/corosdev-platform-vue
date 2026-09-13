<script setup lang="ts">
/**
 * Misión/Visión + CTA de conversión — Paso 4 del rediseño B2B.
 *
 * Reemplaza la versión anterior (3 bloques de párrafos largos "Build
 * Technology That Scales" / "Create Intelligent Growth Systems" / "Deliver
 * Measurable & Sustainable Impact") por dos bloques directos de una sola
 * frase cada uno y un CTA integrado al cierre — el "texto genérico de IA"
 * que señaló el usuario venía de esos tres párrafos largos, no del mensaje
 * en sí.
 *
 * El CTA primario reutiliza el modal global de leads (Fase 4, el mismo que
 * abren "Book a demo"/"Contact" del navbar) en vez de un link a Calendly o
 * a una página `/contact` que no existe — cero rutas nuevas. El secundario
 * es un ancla simple a `#what-we-solve` (ServicesSection.vue), donde viven
 * las garantías reales (30-Day Risk-Free Trial, 6-Month Placement
 * Protection) — no hay una sección de "garantías" separada que crear.
 */
const { open: openContactModal } = useContactModal()
const { t } = useI18n()
</script>

<template>
  <section id="mission" v-vanish class="relative overflow-hidden py-12 md:py-24">
    <div class="mx-auto max-w-7xl px-6">
      <div v-reveal class="mx-auto mb-10 max-w-3xl text-center md:mb-16">
        <h2 class="text-4xl font-black text-ink md:text-6xl">
          {{ t('home.mission.headline') }}
        </h2>
      </div>

      <div v-reveal="100" class="grid gap-5 md:grid-cols-2 md:gap-8">
        <UiSpotlightCard v-tilt as="article" class="rounded-3xl p-10">
          <p class="mb-4 text-[11px] font-bold uppercase tracking-[0.35em] text-accent-text">
            {{ t('home.mission.missionLabel') }}
          </p>
          <p class="text-xl font-medium leading-relaxed text-ink-muted md:text-2xl">
            {{ t('home.mission.missionText') }}
          </p>
        </UiSpotlightCard>
        <UiSpotlightCard v-tilt as="article" class="rounded-3xl p-10">
          <p class="mb-4 text-[11px] font-bold uppercase tracking-[0.35em] text-accent-text">
            {{ t('home.mission.visionLabel') }}
          </p>
          <p class="text-xl font-medium leading-relaxed text-ink-muted md:text-2xl">
            {{ t('home.mission.visionText') }}
          </p>
        </UiSpotlightCard>
      </div>

      <div
        v-reveal="150"
        class="mt-10 rounded-3xl border border-hairline bg-surface-strong/50 px-8 py-12 text-center md:mt-16 md:px-16 md:py-16"
      >
        <p class="mb-4 text-[11px] font-bold uppercase tracking-[0.35em] text-accent-text">
          {{ t('home.mission.ctaEyebrow') }}
        </p>
        <h3 class="text-3xl font-black text-ink md:text-5xl">
          {{ t('home.mission.ctaTitle') }}
        </h3>
        <p class="mx-auto mt-4 max-w-xl text-lg text-ink-muted">
          {{ t('home.mission.ctaSubtitle') }}
        </p>

        <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg bg-neon-500 px-8 py-4 text-base font-bold uppercase tracking-wider text-brand-900 transition-all duration-300 ease-out-expo hover:-translate-y-0.5 hover:bg-neon-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-300 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-900"
            @click="openContactModal()"
          >
            {{ t('home.mission.ctaPrimary') }}
            <svg class="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <a
            href="#what-we-solve"
            class="inline-flex items-center gap-2 rounded-lg border border-hairline px-8 py-4 text-base font-bold uppercase tracking-wider text-ink transition-all duration-300 hover:border-neon-500/40 hover:bg-surface-strong/50"
          >
            {{ t('home.mission.ctaSecondary') }}
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
