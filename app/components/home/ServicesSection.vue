<script setup lang="ts">
/**
 * "Qué resolvemos" — puente entre el logo cloud y el resto del home.
 *
 * Tres motivos por los que una empresa nos contrata (Business Deck): build
 * a medida, escalar con staff augmentation, o convertirnos en su partner
 * tecnológico de largo plazo. `SolutionsSection.vue` (más abajo en la
 * página) vende entregables concretos (MVP, growth, automatización); esta
 * sección vende el *modelo de compromiso* — por eso son secciones distintas
 * y no una redundancia.
 *
 * Reutiliza `UiSpotlightCard` (mismo primitivo de EcosystemSection /
 * services/EngagementsSection) en vez de repetir a mano
 * `border border-hairline bg-surface-strong/50` + hover — ver el docstring de ese
 * componente.
 */
const { t } = useI18n()

interface ServiceMeta {
  id: 'build' | 'scale' | 'transform'
  icon: string
}

const serviceMeta: ServiceMeta[] = [
  // Code / app brackets — "Build Custom Software & AI"
  { id: 'build', icon: 'M17.25 6.75 22.5 12l-5.25 5.25M6.75 6.75 1.5 12l5.25 5.25m7.5-13.5-4.5 15' },
  // User group — "Scale with Specialized Talent"
  {
    id: 'scale',
    icon: 'M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z',
  },
  // Share / network nodes — "Strategic Tech Partnership"
  {
    id: 'transform',
    icon: 'M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z',
  },
]

const services = computed(() =>
  serviceMeta.map((service) => ({
    ...service,
    badge: t(`home.services.${service.id}_badge`),
    title: t(`home.services.${service.id}_title`),
    description: t(`home.services.${service.id}_desc`),
    highlights: [
      t(`home.services.${service.id}_f1`),
      t(`home.services.${service.id}_f2`),
      t(`home.services.${service.id}_f3`),
    ],
  })),
)
</script>

<template>
  <section id="what-we-solve" v-vanish class="relative overflow-hidden py-12 md:py-24">
    <div class="mx-auto max-w-7xl px-6">
      <div v-reveal class="mx-auto mb-10 max-w-2xl text-center md:mb-16">
        <p class="mb-4 text-[11px] font-bold uppercase tracking-[0.35em] text-accent-text">
          {{ t('home.services.label') }}
        </p>
        <h2 class="text-4xl font-black text-ink md:text-6xl">
          {{ t('home.services.h2_1') }} <span class="gradient-text">{{ t('home.services.h2_span') }}</span>
        </h2>
        <p class="mt-4 text-lg text-ink-muted">
          {{ t('home.services.subtitle') }}
        </p>
      </div>

      <div v-reveal="100" class="grid gap-5 md:grid-cols-3 md:gap-8">
        <UiSpotlightCard
          v-for="service in services"
          :key="service.id"
          as="article"
          class="flex flex-col rounded-3xl p-8"
        >
          <div
            class="flex h-12 w-12 items-center justify-center rounded-2xl border border-neon-500/30 bg-neon-500/10 text-neon-300"
            aria-hidden="true"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6">
              <path stroke-linecap="round" stroke-linejoin="round" :d="service.icon" />
            </svg>
          </div>

          <p class="mb-2 mt-6 text-[10px] font-bold uppercase tracking-widest text-accent-text">
            {{ service.badge }}
          </p>
          <h3 class="mb-3 text-2xl font-black text-ink">{{ service.title }}</h3>
          <p class="mb-6 leading-relaxed text-ink-muted">{{ service.description }}</p>

          <ul class="mt-auto flex flex-col gap-2.5 border-t border-hairline pt-6">
            <li v-for="highlight in service.highlights" :key="highlight" class="flex items-start gap-2.5">
              <svg
                class="mt-0.5 h-4 w-4 shrink-0 text-accent-text"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2.2"
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span class="text-sm leading-relaxed text-ink-muted">{{ highlight }}</span>
            </li>
          </ul>
        </UiSpotlightCard>
      </div>
    </div>
  </section>
</template>
