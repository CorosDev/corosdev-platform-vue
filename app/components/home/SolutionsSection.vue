<script setup lang="ts">
const { t } = useI18n()

interface Solution {
  id: 'card1' | 'card2' | 'card3'
  icon: string
}

const solutionMeta: Solution[] = [
  { id: 'card1', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { id: 'card2', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
  { id: 'card3', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
]

const solutions = computed(() =>
  solutionMeta.map((solution) => ({
    ...solution,
    badge: t(`home.solutions.${solution.id}_badge`),
    title: t(`home.solutions.${solution.id}_title`),
    description: t(`home.solutions.${solution.id}_desc`),
    cta: t(`home.solutions.${solution.id}_cta`),
  })),
)
</script>

<template>
  <section id="solutions" v-vanish class="relative overflow-hidden py-12 md:py-24">
    <div class="mx-auto max-w-7xl px-6">
      <div class="mb-8 md:mb-16">
        <h2 class="text-4xl font-black text-white md:text-6xl">
          {{ t('home.solutions.title_1') }} <span class="gradient-text">{{ t('home.solutions.title_span') }}</span>
        </h2>
        <p class="mt-4 text-lg text-white/50">
          {{ t('home.solutions.subtitle') }}
        </p>
      </div>

      <div class="mt-6 grid gap-5 md:mt-10 md:grid-cols-3 md:gap-8">
        <div
          v-for="solution in solutions"
          :key="solution.id"
          v-tilt
          class="group glass soft relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/5 p-8 transition-all duration-500 hover:border-neon-500/50"
        >
          <div class="pointer-events-none absolute bottom-0 right-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
            <svg class="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="0.5">
              <path :d="solution.icon" />
            </svg>
          </div>
          <div class="mb-4 text-[10px] font-bold uppercase tracking-widest text-neon-500">
            {{ solution.badge }}
          </div>
          <h3 class="mb-4 flex min-h-[80px] items-center text-3xl font-black text-white transition-colors group-hover:gradient-text">
            {{ solution.title }}
          </h3>
          <p class="mb-8 min-h-[120px] leading-relaxed text-white/60">{{ solution.description }}</p>
          <div class="mt-auto">
            <a
              href="#contact"
              class="inline-flex items-center gap-2 font-bold text-cobalt-300 transition-colors group-hover:text-neon-500"
            >
              <span>{{ solution.cta }}</span>
              <span class="transition-transform group-hover:translate-x-1">&rarr;</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
