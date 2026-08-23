<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <section class="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-6 pb-16 pt-44 text-center sm:pb-32">
    <span
      class="glass rounded-full border border-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-neon-300 drop-shadow-glow"
    >
      {{ t('services.hero.tag') }}
    </span>
    <h1 class="mx-auto mt-8 max-w-5xl text-5xl font-black leading-tight tracking-tight text-white md:text-8xl">
      {{ t('services.hero.h1_1') }} <span class="gradient-text drop-shadow-glow">{{ t('services.hero.h1_span') }}</span>
    </h1>
    <p class="mx-auto mt-8 max-w-3xl text-lg leading-relaxed text-white/60 md:text-2xl">
      {{ t('services.hero.sub') }}
    </p>
    <div class="mt-12 flex flex-col justify-center gap-5 sm:flex-row">
      <a
        :href="`${localePath('/')}#contact`"
        class="rounded-2xl bg-neon-500 px-8 py-4 text-base font-bold uppercase tracking-wider text-brand-900 drop-shadow-glow transition-all hover:scale-105"
      >
        {{ t('services.hero.cta1') }}
      </a>
      <a
        href="#methodology"
        class="glass rounded-2xl border border-white/10 px-8 py-4 text-base font-bold uppercase tracking-wider transition-all hover:border-white/20 hover:bg-white/5"
      >
        {{ t('services.hero.cta2') }}
      </a>
    </div>
  </section>
</template>
