<script setup lang="ts">
interface Step {
  number: string
  title: string
  description: string
}

const steps: Step[] = [
  {
    number: '01',
    title: 'Diagnose',
    description:
      'We begin with a deep technical and business audit. We identify bottlenecks, opportunities, and your competitive moat before writing a single line of code.',
  },
  {
    number: '02',
    title: 'Architect',
    description:
      'We design scalable systems with future growth in mind. Architecture decisions are driven by data, not trends — ensuring your tech stack remains an asset, not a liability.',
  },
  {
    number: '03',
    title: 'Execute',
    description:
      'Agile sprints. Dedicated teams. Transparent communication. We ship fast without sacrificing quality, giving you a competitive edge in days, not months.',
  },
  {
    number: '04',
    title: 'Scale',
    description:
      'Post-launch is where we differentiate. Continuous optimization, performance monitoring, and strategic growth ensure your platform evolves ahead of the market.',
  },
]
</script>

<template>
  <section id="methodology" class="relative z-10 py-16 md:py-32">
    <div class="mx-auto max-w-7xl px-6">
      <div class="mb-12 text-center md:mb-24">
        <span class="text-xs font-bold uppercase tracking-widest text-neon-500">How We Operate</span>
        <h2 class="mt-4 text-4xl font-black text-white md:text-6xl">
          The CorosDev <span class="gradient-text drop-shadow-glow">Framework</span>
        </h2>
        <p class="mx-auto mt-6 max-w-2xl text-xl text-white/50">
          Our methodology is what separates us from a typical software agency. We operate as a strategic
          partner, not a vendor.
        </p>
      </div>

      <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
        <div v-for="step in steps" :key="step.number" class="group relative">
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
