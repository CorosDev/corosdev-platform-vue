<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <section class="relative overflow-hidden py-12 md:py-24">
    <div class="glass mx-auto max-w-4xl rounded-[32px] border border-white/10 px-6 py-12 text-center">
      <h2 class="mb-6 text-3xl font-extrabold md:text-5xl">
        {{ t('about.cta.h2_1') }} <span class="gradient-text">{{ t('about.cta.h2_span') }}</span>
      </h2>
      <p class="mb-10 text-lg text-white/60">{{ t('about.cta.p') }}</p>
      <NuxtLink
        :to="`${localePath('/')}#contact`"
        class="inline-block rounded-xl bg-cobalt-500 px-10 py-4 font-bold uppercase text-brand-900 drop-shadow-glow transition-transform hover:scale-105"
      >
        {{ t('about.cta.btn') }}
      </NuxtLink>
    </div>
  </section>
</template>
