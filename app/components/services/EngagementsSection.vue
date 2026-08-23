<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

const itemIds = ['item1', 'item2', 'item3', 'item4', 'item5', 'item6'] as const
/** Solid CTA button instead of the outlined default. */
const featured: Record<(typeof itemIds)[number], boolean> = {
  item1: false,
  item2: false,
  item3: true,
  item4: false,
  item5: false,
  item6: false,
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
    featured: featured[id],
  })),
)
</script>

<template>
  <section id="services" class="relative z-10 overflow-hidden py-16 md:py-32">
    <div class="mx-auto max-w-7xl px-6">
      <div class="mb-12 text-center md:mb-24">
        <span class="text-xs font-bold uppercase tracking-widest text-neon-500">{{ t('services.engagements.label') }}</span>
        <h2 class="mt-4 text-4xl font-black text-white md:text-7xl">
          {{ t('services.engagements.h2_1') }} <span class="gradient-text drop-shadow-glow">{{ t('services.engagements.h2_span') }}</span>
        </h2>
        <p class="mx-auto mt-6 max-w-2xl text-xl text-white/50">
          {{ t('services.engagements.sub') }}
        </p>
      </div>

      <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="engagement in engagements"
          :key="engagement.id"
          class="group relative"
        >
          <div
            class="glass flex h-full flex-col rounded-3xl border border-white/5 p-8 transition-all duration-500 group-hover:border-neon-500/50"
          >
            <div class="mb-4 text-[12px] font-bold uppercase tracking-widest text-neon-500">
              {{ engagement.tag }}
            </div>
            <h3 class="mb-6 text-3xl font-black text-white transition-colors group-hover:text-neon-300">
              {{ engagement.title }}
            </h3>
            <p class="mb-8 flex-grow text-sm leading-relaxed text-white/60">{{ engagement.description }}</p>
            <ul class="mb-10 space-y-3 text-sm text-white/80">
              <li v-for="feature in engagement.features" :key="feature" class="flex items-center gap-3">
                <span class="h-1.5 w-1.5 rounded-full bg-neon-500" />
                <span>{{ feature }}</span>
              </li>
            </ul>
            <a
              :href="`${localePath('/')}#contact`"
              class="w-full rounded-xl py-4 text-center text-xs font-black uppercase tracking-widest transition-all"
              :class="
                engagement.featured
                  ? 'bg-neon-500 text-brand-900 drop-shadow-glow hover:scale-105'
                  : 'border border-white/10 hover:bg-neon-500 hover:text-brand-900'
              "
            >
              {{ t('services.engagements.getStarted') }}
            </a>
          </div>
        </div>
      </div>

      <p class="mt-20 text-center text-sm italic text-white/40 underline decoration-neon-500/30 underline-offset-4">
        {{ t('services.engagements.custom') }}
      </p>
    </div>
  </section>
</template>
