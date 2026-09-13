<script setup lang="ts">
/**
 * Tarjeta de caso de éxito para la rejilla de `/portfolio`. Hermana de
 * `blog/PostCard.vue`: envuelve `UiSpotlightCard` y enlaza al detalle con la
 * ruta ya prefijada por idioma. La meta-línea muestra cliente · industria en
 * lugar de categoría · fecha.
 */
import type { CaseStudyCard } from '~/composables/useCaseStudies'

const props = defineProps<{ caseStudy: CaseStudyCard }>()

const { t } = useI18n()
const localePath = useLocalePath()

const to = computed(() => localePath(`/portfolio/${props.caseStudy.slug}`))

// Miniatura recortada + `auto=format` (WebP/AVIF si el navegador lo admite).
// `width`/`height` explícitos reservan el hueco y evitan CLS.
const heroSrc = computed(() =>
  props.caseStudy.hero?.url
    ? `${props.caseStudy.hero.url}?w=800&h=480&fit=crop&auto=format`
    : null,
)
</script>

<template>
  <UiSpotlightCard as="article" class="group flex h-full flex-col overflow-hidden rounded-2xl">
    <NuxtLink :to="to" class="flex h-full flex-col focus-visible:outline-none">
      <div class="relative aspect-[5/3] overflow-hidden bg-surface-strong/50">
        <img
          v-if="heroSrc"
          :src="heroSrc"
          :alt="caseStudy.hero?.alt || caseStudy.title"
          width="800"
          height="480"
          loading="lazy"
          decoding="async"
          class="h-full w-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.03]"
        >
        <div v-else class="h-full w-full bg-gradient-to-br from-brand-700 to-brand-900" aria-hidden="true" />
      </div>

      <div class="flex flex-1 flex-col gap-3 p-6">
        <div class="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.14em]">
          <span class="text-neon-300">{{ caseStudy.client }}</span>
          <span v-if="caseStudy.industry" class="h-1 w-1 rounded-full bg-surface-strong/50" aria-hidden="true" />
          <span v-if="caseStudy.industry" class="text-ink-muted">{{ caseStudy.industry }}</span>
        </div>

        <h3 class="text-lg font-black leading-snug tracking-tight text-ink transition-colors duration-300 ease-out-expo group-hover:text-neon-100">
          {{ caseStudy.title }}
        </h3>

        <p v-if="caseStudy.summary" class="line-clamp-3 text-sm leading-relaxed text-ink-muted">
          {{ caseStudy.summary }}
        </p>

        <div class="mt-auto flex items-center justify-end pt-2 text-xs">
          <span class="inline-flex items-center gap-1 font-bold text-neon-300">
            {{ t('portfolio.card.viewCase') }}
            <svg class="h-3.5 w-3.5 transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </span>
        </div>
      </div>
    </NuxtLink>
  </UiSpotlightCard>
</template>
