<script setup lang="ts">
/**
 * Framework de entrega en cuatro fases.
 *
 * El número de fase deja de ser una pastilla flotante sobre el borde de la
 * tarjeta (que obligaba a `-top-6` y a un `mt-6` compensatorio dentro) y pasa
 * a ser un dato tipográfico dentro del flujo, junto a un hairline de
 * progreso. Menos ornamento y, sobre todo, sin cajas que se salen de su
 * propia tarjeta.
 *
 * También desaparece el `min-h-[4rem]` que igualaba la altura de los títulos
 * a ojo: el grid ya estira las tarjetas a la misma altura y el `mt-auto` del
 * párrafo hace el resto sin números mágicos que se rompen al traducir.
 */
const { t } = useI18n()

const stepIds = ['step1', 'step2', 'step3', 'step4'] as const

const steps = computed(() =>
  stepIds.map((id, index) => ({
    id,
    number: String(index + 1).padStart(2, '0'),
    title: t(`services.methodology.${id}_title`),
    description: t(`services.methodology.${id}_desc`),
  })),
)
</script>

<template>
  <section id="methodology" class="relative z-10 py-16 md:py-28">
    <div class="mx-auto max-w-7xl px-6">
      <div v-reveal class="mb-10 flex flex-col gap-6 md:mb-14 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="mb-4 text-[11px] font-bold uppercase tracking-[0.35em] text-neon-500">
            {{ t('services.methodology.label') }}
          </p>
          <h2 class="max-w-2xl text-3xl font-black leading-[1.1] tracking-tight text-white md:text-5xl">
            {{ t('services.methodology.h2_1') }}
            <span class="gradient-text">{{ t('services.methodology.h2_span') }}</span>
          </h2>
        </div>
        <p class="max-w-md text-base leading-relaxed text-white/55">
          {{ t('services.methodology.sub') }}
        </p>
      </div>

      <div v-reveal="100" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <UiSpotlightCard
          v-for="step in steps"
          :key="step.id"
          as="article"
          :size="340"
          class="flex flex-col rounded-xl p-6"
        >
          <div class="flex items-center gap-3">
            <span class="text-sm font-black tabular-nums text-neon-500">{{ step.number }}</span>
            <span class="h-px flex-1 bg-gradient-to-r from-neon-500/40 to-transparent" aria-hidden="true" />
          </div>
          <h3 class="mt-5 text-lg font-bold leading-snug tracking-tight text-white">{{ step.title }}</h3>
          <p class="mt-3 text-sm leading-relaxed text-white/50">{{ step.description }}</p>
        </UiSpotlightCard>
      </div>
    </div>
  </section>
</template>
