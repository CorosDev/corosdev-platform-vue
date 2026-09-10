<script setup lang="ts">
/**
 * Rejilla de KPIs / métricas clave de un caso de éxito (`caseStudy.keyMetrics`).
 *
 * Cada celda es una `UiSpotlightCard` con el valor en grande, la etiqueta
 * debajo y el `impact` (cambio / contexto) como línea de acento. El grid se
 * adapta al número de métricas: 2 columnas en móvil, hasta 4 en escritorio.
 * Si no hay métricas, no renderiza nada.
 */
import type { CaseStudyMetric } from '~/composables/useCaseStudies'

const props = defineProps<{
  metrics?: CaseStudyMetric[] | null
}>()

const items = computed(() => (props.metrics ?? []).filter(m => m.label && m.value))
</script>

<template>
  <ul
    v-if="items.length"
    class="grid grid-cols-2 gap-4"
    :class="items.length >= 4 ? 'lg:grid-cols-4' : items.length === 3 ? 'lg:grid-cols-3' : 'sm:grid-cols-2'"
  >
    <li v-for="(metric, i) in items" :key="`${metric.label}-${i}`">
      <UiSpotlightCard :size="320" class="flex h-full flex-col gap-1.5 rounded-2xl p-5 md:p-6">
        <p class="text-3xl font-black leading-none tracking-tight text-white md:text-4xl">
          {{ metric.value }}
        </p>
        <p class="text-xs font-bold uppercase tracking-[0.12em] text-white/55">
          {{ metric.label }}
        </p>
        <p v-if="metric.impact" class="mt-1 text-xs font-semibold text-neon-300">
          {{ metric.impact }}
        </p>
      </UiSpotlightCard>
    </li>
  </ul>
</template>
