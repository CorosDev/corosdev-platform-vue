<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <section class="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-6 pb-32 pt-44 text-center">
    <span
      class="glass rounded-full border border-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-neon-300 drop-shadow-glow"
    >
      {{ t('ecosystem.hero.label') }}
    </span>
    <h1 class="mx-auto mt-8 max-w-5xl text-5xl font-black leading-tight tracking-tight text-white md:text-8xl">
      {{ t('ecosystem.hero.h1_1') }} <span class="gradient-text drop-shadow-glow">{{ t('ecosystem.hero.h1_span') }}</span>
    </h1>
    <p class="mx-auto mt-8 max-w-3xl text-lg leading-relaxed text-white/60 md:text-2xl">
      {{ t('ecosystem.hero.sub') }}
    </p>
  </section>
</template>
