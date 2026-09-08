<script setup lang="ts">
const { t } = useI18n()

interface VentureMeta {
  id: 'trd' | 'snapay' | 'vorzana'
  logo: string
  logoWidth: number
  logoHeight: number
  logoAlt: string
  logoClass: string
  /** Show the logo before the copy on large screens (alternating layout). */
  logoFirst?: boolean
}

const ventureMeta: VentureMeta[] = [
  { id: 'trd', logo: '/logos/trd.svg', logoWidth: 829, logoHeight: 367, logoAlt: 'Accesorios TRD logo', logoClass: 'h-48' },
  { id: 'snapay', logo: '/logos/snapay.svg', logoWidth: 420, logoHeight: 432, logoAlt: 'Snapay logo', logoClass: 'h-48', logoFirst: true },
  { id: 'vorzana', logo: '/logos/vorzana.svg', logoWidth: 829, logoHeight: 367, logoAlt: 'Vorzana logo', logoClass: 'h-60' },
]

const ventures = computed(() =>
  ventureMeta.map((venture) => ({
    ...venture,
    name: t(`ecosystem.ventures.${venture.id}_name`),
    sector: t(`ecosystem.ventures.${venture.id}_sector`),
    description: t(`ecosystem.ventures.${venture.id}_desc`),
    detail: t(`ecosystem.ventures.${venture.id}_detail`),
    stage: t(`ecosystem.ventures.${venture.id}_stage`),
    sectorValue: t(`ecosystem.ventures.${venture.id}_sectorValue`),
  })),
)
</script>

<template>
  <section id="ventures" class="relative z-10 py-16 md:py-32">
    <div class="mx-auto max-w-7xl px-6">
      <div class="space-y-24">
        <div
          v-for="venture in ventures"
          :key="venture.id"
          class="group glass relative rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-8 transition-all duration-700 hover:border-neon-500/30 md:p-12"
        >
          <div class="grid items-center gap-10 lg:grid-cols-12">
            <div
              class="flex justify-center lg:col-span-5"
              :class="venture.logoFirst ? 'order-first' : 'lg:order-last'"
            >
              <div class="animate-float flex h-72 w-72 items-center justify-center">
                <NuxtImg
                  :src="venture.logo"
                  :alt="venture.logoAlt"
                  :width="venture.logoWidth"
                  :height="venture.logoHeight"
                  loading="lazy"
                  class="w-auto max-w-full object-contain"
                  :class="venture.logoClass"
                />
              </div>
            </div>

            <div class="space-y-6 lg:col-span-7">
              <div class="flex flex-wrap items-center gap-4">
                <span
                  class="rounded-xl border border-neon-500/20 bg-neon-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-neon-300"
                >
                  {{ venture.sector }}
                </span>
                <span
                  class="rounded-md bg-neon-500 px-3 py-1 text-xs font-bold uppercase tracking-widest text-brand-900"
                >
                  {{ t('ecosystem.ventures.badge') }}
                </span>
              </div>

              <h2 class="text-4xl font-black text-white md:text-6xl">{{ venture.name }}</h2>

              <p class="text-base font-semibold leading-relaxed text-white/80 md:text-lg">
                {{ venture.description }}
              </p>

              <div class="space-y-3 rounded-2xl border border-white/5 bg-white/[0.02] p-6">
                <h4 class="text-xs font-bold uppercase tracking-widest text-neon-300">{{ t('ecosystem.ventures.whyHow') }}</h4>
                <p class="text-sm leading-relaxed text-white/60">{{ venture.detail }}</p>
              </div>

              <div class="grid grid-cols-2 gap-6 border-t border-white/5 pt-4 sm:grid-cols-3">
                <div>
                  <span class="block text-xs uppercase tracking-widest text-white/50">{{ t('ecosystem.ventures.statusLabel') }}</span>
                  <span class="mt-1 block text-sm font-bold text-white">{{ t('ecosystem.ventures.statusValue') }}</span>
                </div>
                <div>
                  <span class="block text-xs uppercase tracking-widest text-white/50">{{ t('ecosystem.ventures.stageLabel') }}</span>
                  <span class="mt-1 block text-sm font-bold text-white">{{ venture.stage }}</span>
                </div>
                <div>
                  <span class="block text-xs uppercase tracking-widest text-white/50">{{ t('ecosystem.ventures.sectorLabel') }}</span>
                  <span class="mt-1 block text-sm font-bold text-white">{{ venture.sectorValue }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
