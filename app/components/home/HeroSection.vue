<script setup lang="ts">
const { t } = useI18n()

interface LocationChip {
  code: string
  labelKey: 'honduras' | 'miami' | 'wyoming' | 'prague'
}

const locationChips: LocationChip[] = [
  { code: 'HN', labelKey: 'honduras' },
  { code: 'US', labelKey: 'miami' },
  { code: 'US', labelKey: 'wyoming' },
  { code: 'CZ', labelKey: 'prague' },
]

const bookingUrl = 'https://calendly.com/corosdev-info/30min'
</script>

<template>
  <section v-vanish class="relative pb-12 pt-44 sm:pb-20 sm:pt-36">
    <div class="mx-auto max-w-7xl px-6">
      <div class="grid items-center gap-12 md:grid-cols-2">
        <!-- Copy — tilt magnético aislado a esta columna: el globo WebGL de la
             derecha ya es un objeto 3D interactivo y no debe inclinarse. -->
        <div v-tilt="5">
          <p class="text-sm font-medium uppercase tracking-wide text-white opacity-90">
            {{ t('home.hero.tag') }}
          </p>
          <h1 class="mt-4 text-5xl font-extrabold leading-[1.1] md:text-7xl">
            {{ t('home.hero.h1_1') }} <span class="gradient-text">{{ t('home.hero.h1_span') }}</span>
            {{ t('home.hero.h1_2') }}
          </h1>
          <p class="mt-5 max-w-xl text-lg text-white/80">
            {{ t('home.hero.sub') }}
          </p>
          <div class="mt-8 flex items-center gap-3">
            <a
              :href="bookingUrl"
              target="_blank"
              rel="noopener"
              class="rounded-lg bg-neon-500 px-6 py-3 font-semibold text-brand-900 transition-all duration-300 ease-out-expo hover:-translate-y-0.5 hover:bg-neon-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-300 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-900"
            >
              {{ t('home.hero.cta1') }}
            </a>
            <a
              href="#ecosystem"
              class="rounded-xl border border-white/18 px-6 py-3 transition-colors hover:border-neon-500 hover:text-neon-500"
            >
              {{ t('home.hero.cta2') }}
            </a>
          </div>
          <div class="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/60">
            <span>{{ t('home.hero.pill1') }}</span>
            <span class="opacity-60" aria-hidden="true">&bull;</span>
            <span>{{ t('home.hero.pill2') }}</span>
            <span class="opacity-60" aria-hidden="true">&bull;</span>
            <span>{{ t('home.hero.pill3') }}</span>
          </div>
        </div>

        <!-- Interactive 3D globe (WebGL, client-only). The fallback below covers
             SSR, hydration, and no-JS/no-WebGL visitors with the same footprint
             so there's no layout jump when the real globe takes over. -->
        <ClientOnly>
          <HomeGlobalGlobe />
          <template #fallback>
            <div class="relative mx-auto w-full max-w-2xl">
              <div
                class="absolute inset-[10%] -z-10 rounded-full opacity-70 blur-3xl"
                style="background: radial-gradient(circle at 50% 50%, rgb(31 127 255 / 0.35), transparent 65%)"
                aria-hidden="true"
              />

              <p class="text-center text-[11px] font-bold uppercase tracking-[0.5em] text-white/70 sm:text-[12px]">
                {{ t('home.hero.globeLabel') }}
              </p>

              <div class="glass mt-6 flex flex-col items-center rounded-3xl p-8 text-center sm:p-12">
                <div
                  class="animate-float flex h-24 w-24 items-center justify-center rounded-full border border-neon-500/30 bg-neon-500/10 text-3xl font-black text-neon-300"
                  aria-hidden="true"
                >
                  CD
                </div>
                <p class="mt-6 max-w-xs text-sm text-white/60">
                  {{ t('home.hero.fallbackDesc') }}
                </p>

                <div class="mt-8 flex flex-wrap justify-center gap-2" aria-label="CorosDev locations">
                  <span
                    v-for="loc in locationChips"
                    :key="loc.labelKey"
                    class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70"
                  >
                    <span class="text-[10px] font-bold uppercase text-neon-300">{{ loc.code }}</span>
                    {{ t(`home.hero.locations.${loc.labelKey}`) }}
                  </span>
                </div>
              </div>
            </div>
          </template>
        </ClientOnly>
      </div>
    </div>
  </section>
</template>
