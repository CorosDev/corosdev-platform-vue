<script setup lang="ts">
const { t } = useI18n()
const { open: openCtaDrawer } = useCtaDrawer()

interface Venture {
  id: 'trd' | 'snapay' | 'vorzana'
  name: string
  logo: string
  logoWidth: number
  logoHeight: number
}

const ventureMeta: Venture[] = [
  { id: 'trd', name: 'Accesorios TRD', logo: '/logos/trd.svg', logoWidth: 829, logoHeight: 367 },
  { id: 'snapay', name: 'Snapay', logo: '/logos/snapay.svg', logoWidth: 420, logoHeight: 432 },
  { id: 'vorzana', name: 'Vorzana', logo: '/logos/vorzana.svg', logoWidth: 829, logoHeight: 367 },
]

const ventures = computed(() =>
  ventureMeta.map((venture) => ({
    ...venture,
    description: t(`home.ecosystem.${venture.id}_desc`),
    sector: t(`home.ecosystem.${venture.id}_sector`),
  })),
)
</script>

<template>
  <section id="ecosystem" class="relative overflow-hidden py-12 md:py-24">
    <div class="mx-auto max-w-7xl px-6">
      <div class="mb-8 md:mb-16">
        <p class="mb-4 text-[11px] font-bold uppercase tracking-[0.35em] text-accent-text">
          {{ t('home.ecosystem.label') }}
        </p>
        <h2 class="text-4xl font-black text-ink md:text-6xl">
          {{ t('home.ecosystem.title_1') }} <span class="gradient-text">{{ t('home.ecosystem.title_span') }}</span>
        </h2>
        <p class="mt-4 max-w-2xl text-lg text-ink-muted">
          {{ t('home.ecosystem.subtitle') }}
        </p>
      </div>

      <div class="grid gap-8 md:grid-cols-3">
        <div
          v-for="venture in ventures"
          :key="venture.id"
          v-tilt
          class="group glass relative flex flex-col gap-6 rounded-3xl border border-hairline p-8 transition-all duration-400 hover:-translate-y-1.5 hover:shadow-[0_30px_80px_rgba(31,127,255,0.18)]"
        >
          <div class="flex items-start justify-between">
            <div class="flex h-16 w-32 items-center justify-start">
              <NuxtImg
                :src="venture.logo"
                :alt="`${venture.name} logo`"
                :width="venture.logoWidth"
                :height="venture.logoHeight"
                loading="lazy"
                class="h-16 w-auto max-w-full object-contain"
              />
            </div>
            <span
              class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-neon-500/35 bg-neon-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-neon-300"
            >
              <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-neon-500" aria-hidden="true" />
              {{ t('home.ecosystem.badge') }}
            </span>
          </div>
          <div class="flex-1">
            <h3 class="mb-3 text-2xl font-black text-ink">{{ venture.name }}</h3>
            <p class="text-sm leading-relaxed text-ink-muted">{{ venture.description }}</p>
          </div>
          <div class="flex items-center gap-3 border-t border-hairline pt-2">
            <span class="text-[11px] font-semibold uppercase tracking-widest text-ink-muted">{{ t('home.ecosystem.sectorLabel') }}</span>
            <span class="text-[11px] font-bold uppercase tracking-widest text-neon-300">{{ venture.sector }}</span>
          </div>
        </div>
      </div>

      <div class="mt-8 flex items-center gap-4 md:mt-14">
        <div class="h-px flex-1 bg-gradient-to-r from-transparent via-hairline to-transparent" />
        <p class="px-4 text-xs font-semibold uppercase tracking-widest text-ink-muted">
          {{ t('home.ecosystem.ctaText') }}
          <button
            type="button"
            class="ml-1 rounded text-accent-text underline underline-offset-2 transition-colors hover:text-neon-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-300"
            @click="openCtaDrawer('ecosystem')"
          >
            {{ t('home.ecosystem.ctaLink') }}
          </button>
        </p>
        <div class="h-px flex-1 bg-gradient-to-r from-transparent via-hairline to-transparent" />
      </div>

      <div class="mt-6 text-center md:mt-12">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg bg-neon-500 px-8 py-4 text-base font-bold uppercase tracking-wider text-brand-900 transition-all duration-300 ease-out-expo hover:-translate-y-0.5 hover:bg-neon-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-300 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-900"
          @click="openCtaDrawer('ecosystem')"
        >
          {{ t('home.ecosystem.earlyTester') }}
        </button>
      </div>
    </div>
  </section>
</template>
