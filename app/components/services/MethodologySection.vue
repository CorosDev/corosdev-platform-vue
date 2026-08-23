<script setup lang="ts">
const { t } = useI18n()

const stepIds = ['step1', 'step2', 'step3', 'step4'] as const
const stepNumbers: Record<(typeof stepIds)[number], string> = {
  step1: '01',
  step2: '02',
  step3: '03',
  step4: '04',
}

const steps = computed(() =>
  stepIds.map((id) => ({
    id,
    number: stepNumbers[id],
    title: t(`services.methodology.${id}_title`),
    description: t(`services.methodology.${id}_desc`),
  })),
)
</script>

<template>
  <section id="methodology" class="relative z-10 py-16 md:py-32">
    <div class="mx-auto max-w-7xl px-6">
      <div class="mb-12 text-center md:mb-24">
        <span class="text-xs font-bold uppercase tracking-widest text-neon-500">{{ t('services.methodology.label') }}</span>
        <h2 class="mt-4 text-4xl font-black text-white md:text-6xl">
          {{ t('services.methodology.h2_1') }} <span class="gradient-text drop-shadow-glow">{{ t('services.methodology.h2_span') }}</span>
        </h2>
        <p class="mx-auto mt-6 max-w-2xl text-xl text-white/50">
          {{ t('services.methodology.sub') }}
        </p>
      </div>

      <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
        <div v-for="step in steps" :key="step.id" class="group relative">
          <div
            class="glass relative flex h-full flex-col rounded-3xl border border-white/5 p-8 transition-all duration-500 group-hover:border-neon-500/40"
          >
            <div
              class="drop-shadow-glow absolute -top-6 left-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-neon-500 text-xl font-bold text-brand-900"
            >
              {{ step.number }}
            </div>
            <h3
              class="mb-4 mt-6 flex min-h-[4rem] items-center text-2xl font-black text-white transition-colors group-hover:text-neon-300"
            >
              {{ step.title }}
            </h3>
            <p class="text-sm leading-relaxed text-white/60">{{ step.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
