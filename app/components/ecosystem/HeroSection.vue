<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <section class="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-6 pb-32 pt-44 text-center">
    <span
      class="inline-flex items-center gap-2 rounded-md border border-neon-500/25 bg-neon-500/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-neon-300"
    >
      {{ t('ecosystem.hero.label') }}
    </span>
    <h1 class="mx-auto mt-8 max-w-5xl text-5xl font-black leading-tight tracking-tight text-white md:text-8xl">
      {{ t('ecosystem.hero.h1_1') }} <span class="gradient-text">{{ t('ecosystem.hero.h1_span') }}</span>
    </h1>
    <p class="mx-auto mt-8 max-w-3xl text-lg leading-relaxed text-white/60 md:text-2xl">
      {{ t('ecosystem.hero.sub') }}
    </p>
  </section>
</template>
