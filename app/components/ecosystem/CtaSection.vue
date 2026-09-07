<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <section class="relative z-10">
    <div class="mx-auto max-w-7xl px-6 pb-16 md:pb-32">
      <div class="glass soft mx-auto max-w-4xl rounded-[2.5rem] border border-white/10 p-12 text-center">
        <h3 class="text-2xl font-black text-white md:text-4xl">{{ t('ecosystem.cta.h3') }}</h3>
        <p class="mx-auto mt-4 max-w-2xl text-sm text-white/60 md:text-base">
          {{ t('ecosystem.cta.p') }}
        </p>
        <div class="mt-8">
          <a
            :href="`${localePath('/')}#contact`"
            class="inline-flex items-center gap-2 rounded-lg bg-neon-500 px-8 py-4 text-base font-bold uppercase tracking-wider text-brand-900 transition-all duration-300 ease-out-expo hover:-translate-y-0.5 hover:bg-neon-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-300 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-900"
          >
            {{ t('ecosystem.cta.link') }}
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
