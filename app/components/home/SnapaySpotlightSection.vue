<script setup lang="ts">
const { t } = useI18n()

const stats = computed(() => [
  { key: 'stat1', value: t('home.snapay.stat1_value'), label: t('home.snapay.stat1_label') },
  { key: 'stat2', value: t('home.snapay.stat2_value'), label: t('home.snapay.stat2_label') },
  { key: 'stat3', value: t('home.snapay.stat3_value'), label: t('home.snapay.stat3_label') },
])
</script>

<template>
  <section id="snapay-spotlight" class="relative overflow-hidden py-16 md:py-28">
    <div
      class="pointer-events-none absolute inset-0"
      style="background: radial-gradient(ellipse 80% 60% at 50% 50%, rgb(31 127 255 / 0.07), transparent)"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2"
      style="background: linear-gradient(90deg, transparent, rgb(31 127 255 / 0.45), transparent)"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute bottom-0 left-1/2 h-px w-2/3 -translate-x-1/2"
      style="background: linear-gradient(90deg, transparent, rgb(31 127 255 / 0.2), transparent)"
      aria-hidden="true"
    />

    <div class="relative mx-auto max-w-5xl px-6 text-center">
      <div class="mb-10 inline-flex items-center gap-2 rounded-full border border-neon-500/30 bg-neon-500/10 px-4 py-2">
        <span class="h-2 w-2 animate-ping rounded-full bg-neon-500" aria-hidden="true" />
        <span class="text-xs font-bold uppercase tracking-widest text-neon-300">{{ t('home.snapay.badge') }}</span>
      </div>

      <div class="mb-8 flex justify-center md:mb-10">
        <NuxtImg
          src="/logos/snapay.svg"
          alt="Snapay logo"
          width="420"
          height="432"
          loading="lazy"
          class="animate-float drop-shadow-glow h-20 w-auto md:h-28"
        />
      </div>

      <h2 class="mb-6 text-4xl font-black leading-tight text-white md:text-6xl">
        {{ t('home.snapay.title_1') }}<br />
        <span class="gradient-text drop-shadow-glow">{{ t('home.snapay.title_span') }}</span>
      </h2>

      <p class="mx-auto mb-12 max-w-2xl text-base leading-relaxed text-white/55 md:mb-16 md:text-xl">
        {{ t('home.snapay.desc') }}
      </p>

      <div class="mx-auto mb-12 grid max-w-xl grid-cols-3 gap-4 md:mb-16 md:gap-8">
        <div
          v-for="stat in stats"
          :key="stat.key"
          class="glass rounded-2xl border border-white/5 p-4 transition-colors duration-300 hover:border-neon-500/20 md:p-6"
        >
          <div class="gradient-text drop-shadow-glow text-3xl font-black md:text-4xl">{{ stat.value }}</div>
          <div class="mt-1 text-xs font-semibold uppercase tracking-wider text-white/50 md:text-sm">
            {{ stat.label }}
          </div>
        </div>
      </div>

      <a
        href="https://snapay.ai"
        target="_blank"
        rel="noopener"
        class="inline-flex items-center gap-3 rounded-2xl bg-neon-500 px-10 py-4 text-base font-bold uppercase tracking-wide text-brand-900 shadow-[0_0_25px_rgba(31,127,255,0.35)] transition-all duration-300 hover:scale-105 hover:brightness-110 md:text-lg"
      >
        <span>{{ t('home.snapay.cta') }}</span>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </a>
    </div>
  </section>
</template>
