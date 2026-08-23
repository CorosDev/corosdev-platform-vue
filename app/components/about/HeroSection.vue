<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <section class="relative pb-20 pt-48">
    <div class="mx-auto max-w-5xl px-6 text-center">
      <h1 class="text-5xl font-extrabold leading-tight md:text-7xl">
        {{ t('about.hero.h1_1') }} <br />
        <span class="gradient-text drop-shadow-glow">{{ t('about.hero.h1_span') }}</span>
      </h1>
      <p class="mx-auto mt-8 max-w-3xl text-lg leading-relaxed text-white/60 md:text-xl">
        {{ t('about.hero.p') }}
      </p>
    </div>
  </section>
</template>
