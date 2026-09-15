<script setup lang="ts">
/**
 * Misión/Visión — Paso 4 del rediseño B2B.
 *
 * Reemplaza la versión anterior (3 bloques de párrafos largos "Build
 * Technology That Scales" / "Create Intelligent Growth Systems" / "Deliver
 * Measurable & Sustainable Impact") por dos bloques directos de una sola
 * frase cada uno — el "texto genérico de IA" que señaló el usuario venía de
 * esos tres párrafos largos, no del mensaje en sí.
 *
 * El CTA de conversión ("Ready to Scale?") que vivía al cierre de esta
 * sección ahora es su propio componente (HomeCtaSection.vue), colocado justo
 * antes de ContactSection al final de la página — ver ese archivo.
 */
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
    </div>
  </section>
</template>
