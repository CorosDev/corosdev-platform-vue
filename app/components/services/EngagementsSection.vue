<script setup lang="ts">
/**
 * Modelos de contratación, en bento asimétrico.
 *
 * Los seis modelos no pesan lo mismo en la decisión de compra, y una rejilla
 * de 3×2 idénticas decía lo contrario. Sobre 12 columnas: la primera fila
 * reparte 3+3+6 (el modelo destacado ocupa media fila y despliega sus
 * características a dos columnas), la segunda 4+4+4. Suma exacta en ambas,
 * así que el bento no deja huecos ni obliga a reordenar el DOM respecto al
 * orden de lectura.
 *
 * Los CTA abren el drawer con contexto 'services' en vez de mandar al
 * visitante al formulario del home: quien está comparando modelos de
 * contratación no debería perder la página para pedir una propuesta.
 */
const { t } = useI18n()
const { open: openCtaDrawer } = useCtaDrawer()

const itemIds = ['item1', 'item2', 'item3', 'item4', 'item5', 'item6'] as const

type ItemId = (typeof itemIds)[number]

/** Ancho en la rejilla de 12; item3 es el modelo destacado. */
const spans: Record<ItemId, string> = {
  item1: 'lg:col-span-3',
  item2: 'lg:col-span-3',
  item3: 'lg:col-span-6',
  item4: 'lg:col-span-4',
  item5: 'lg:col-span-4',
  item6: 'lg:col-span-4',
}

const engagements = computed(() =>
  itemIds.map((id) => ({
    id,
    tag: t(`services.engagements.${id}_tag`),
    title: t(`services.engagements.${id}_title`),
    description: t(`services.engagements.${id}_desc`),
    features: [
      t(`services.engagements.${id}_f1`),
      t(`services.engagements.${id}_f2`),
      t(`services.engagements.${id}_f3`),
    ],
    span: spans[id],
    featured: id === 'item3',
  })),
)
</script>

<template>
  <section id="services" class="relative z-10 overflow-hidden py-16 md:py-28">
    <div class="mx-auto max-w-7xl px-6">
      <div v-reveal class="mb-10 flex flex-col gap-6 md:mb-14 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="mb-4 text-[11px] font-bold uppercase tracking-[0.35em] text-neon-500">
            {{ t('services.engagements.label') }}
          </p>
          <h2 class="max-w-2xl text-3xl font-black leading-[1.1] tracking-tight text-white md:text-5xl">
            {{ t('services.engagements.h2_1') }}
            <span class="gradient-text">{{ t('services.engagements.h2_span') }}</span>
          </h2>
        </div>
        <p class="max-w-md text-base leading-relaxed text-white/55">
          {{ t('services.engagements.sub') }}
        </p>
      </div>

      <div v-reveal="100" class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-12">
        <UiSpotlightCard
          v-for="engagement in engagements"
          :key="engagement.id"
          as="article"
          :size="engagement.featured ? 560 : 360"
          class="flex flex-col rounded-xl p-6 md:p-7"
          :class="[engagement.span, engagement.featured ? 'border-neon-500/25' : '']"
        >
          <div class="flex items-center gap-3">
            <span class="text-[10px] font-bold uppercase tracking-[0.16em] text-neon-500">{{ engagement.tag }}</span>
            <span
              v-if="engagement.featured"
              class="rounded-md border border-neon-500/30 bg-neon-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-neon-300"
            >
              {{ t('services.engagements.featuredTag') }}
            </span>
          </div>

          <h3 class="mt-4 text-xl font-black leading-snug tracking-tight text-white md:text-2xl">
            {{ engagement.title }}
          </h3>
          <p class="mt-3 text-sm leading-relaxed text-white/50">{{ engagement.description }}</p>

          <ul
            class="mt-6 grid gap-2.5"
            :class="engagement.featured ? 'sm:grid-cols-2' : ''"
          >
            <li v-for="feature in engagement.features" :key="feature" class="flex items-start gap-2.5">
              <svg
                class="mt-0.5 h-4 w-4 shrink-0 text-neon-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2.2"
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span class="text-sm leading-relaxed text-white/60">{{ feature }}</span>
            </li>
          </ul>

          <div class="mt-auto pt-7">
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 ease-out-expo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-300"
              :class="
                engagement.featured
                  ? 'bg-neon-500 text-brand-900 hover:-translate-y-0.5 hover:bg-neon-300'
                  : 'border border-white/15 text-white hover:border-neon-500/40 hover:bg-white/[0.06]'
              "
              @click="openCtaDrawer('services')"
            >
              {{ t('services.engagements.getStarted') }}
              <svg
                class="h-3.5 w-3.5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2.5"
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </UiSpotlightCard>
      </div>

      <p v-reveal class="mt-12 text-center text-sm text-white/50">
        {{ t('services.engagements.custom') }}
      </p>
    </div>
  </section>
</template>
