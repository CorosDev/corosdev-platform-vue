<script setup lang="ts">
const { t } = useI18n()

interface LocationChip {
  code: 'HN' | 'US' | 'CZ'
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
          <p class="text-sm font-medium uppercase tracking-wide text-ink opacity-90">
            {{ t('home.hero.tag') }}
          </p>
          <h1 class="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight lg:text-5xl xl:text-6xl">
            {{ t('home.hero.h1_1') }} <span class="gradient-text">{{ t('home.hero.h1_span') }}</span>
            {{ t('home.hero.h1_2') }}
          </h1>
          <p class="mt-5 max-w-lg text-lg text-ink-muted">
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
              href="#what-we-solve"
              class="rounded-xl border border-hairline bg-surface/50 px-6 py-3 text-ink transition-colors hover:border-neon-500 hover:bg-surface-strong hover:text-accent-text"
            >
              {{ t('home.hero.cta2') }}
            </a>
          </div>
          <div class="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-muted">
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

              <p class="text-center text-[11px] font-bold uppercase tracking-[0.5em] text-ink-muted sm:text-[12px]">
                {{ t('home.hero.globeLabel') }}
              </p>

              <div class="glass mt-6 flex flex-col items-center rounded-3xl p-8 text-center sm:p-12">
                <div
                  class="animate-float flex h-24 w-24 items-center justify-center rounded-full border border-neon-500/30 bg-neon-500/10 text-3xl font-black text-neon-300"
                  aria-hidden="true"
                >
                  CD
                </div>
                <p class="mt-6 max-w-xs text-sm text-ink-muted">
                  {{ t('home.hero.fallbackDesc') }}
                </p>

                <div class="mt-8 flex flex-wrap justify-center gap-2" aria-label="CorosDev locations">
                  <span
                    v-for="loc in locationChips"
                    :key="loc.labelKey"
                    class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-hairline bg-surface/50 px-3 py-1.5 text-xs font-medium text-ink backdrop-blur-sm hover:bg-surface-strong"
                  >
                    <span class="relative flex h-1.5 w-1.5" aria-hidden="true">
                      <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
                      <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    </span>
                    <UiFlagIcon :code="loc.code" />
                    <svg class="h-3 w-3 shrink-0 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.5-7.5 11.25-7.5 11.25S4.5 18 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    <span>{{ t(`home.hero.locations.${loc.labelKey}`) }}</span>
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
