<script setup lang="ts">
interface Solution {
  badge: string
  title: string
  description: string
  cta: string
  icon: string
}

const solutions: Solution[] = [
  {
    badge: 'Go-to-Market',
    title: 'MVP in 6—8 Weeks',
    description:
      'From prototype to a production-ready engine. We engineer scalable MVPs designed to validate your business model and lead the market from day one.',
    cta: 'Get timeline',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
  },
  {
    badge: 'Scaling',
    title: 'Hyper-Growth Blueprint',
    description:
      'Strategic acquisition systems engineered for global expansion. We turn traffic into predictable revenue through intelligent marketing and authority-driven positioning.',
    cta: 'Get growth plan',
    icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
  },
  {
    badge: 'Ops',
    title: 'Workflow Automation',
    description:
      'Automating complexities into seamless operational flow. We replace spreadsheet friction with intelligent systems to ensure sustainable growth and measurable ROI.',
    cta: 'See examples',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  },
]
</script>

<template>
  <section id="solutions" class="relative overflow-hidden py-12 md:py-24">
    <div class="mx-auto max-w-7xl px-6">
      <div class="mb-8 md:mb-16">
        <h2 class="text-4xl font-black text-white md:text-6xl">
          Solutions that <span class="gradient-text drop-shadow-glow">move the needle</span>
        </h2>
        <p class="mt-4 text-lg text-white/50">
          Start small or go big - each can ship as a sprint or part of a program.
        </p>
      </div>

      <div class="mt-6 grid gap-5 md:mt-10 md:grid-cols-3 md:gap-8">
        <div
          v-for="solution in solutions"
          :key="solution.title"
          class="group glass soft relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/5 p-8 transition-all duration-500 hover:border-neon-500/50"
        >
          <div class="pointer-events-none absolute bottom-0 right-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
            <svg class="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="0.5">
              <path :d="solution.icon" />
            </svg>
          </div>
          <div class="mb-4 text-[10px] font-bold uppercase tracking-widest text-neon-500 opacity-60">
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
