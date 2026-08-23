<script setup lang="ts">
interface MissionBlock {
  title: string
  description: string
  icon: string
}

const blocks: MissionBlock[] = [
  {
    title: 'Build Technology That Scales',
    description:
      "We design and develop high-performance digital solutions engineered for global growth. We don't just build products that work today. We build platforms prepared to lead tomorrow.",
    icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
  },
  {
    title: 'Create Intelligent Growth Systems',
    description:
      'We integrate software development, digital marketing, SEO, strategic content, automation, and performance analytics to turn traffic into customers, and customers into predictable revenue.',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  },
  {
    title: 'Deliver Measurable & Sustainable Impact',
    description:
      'We operate with clear KPIs, data-driven optimization, and ROI-focused execution to ensure consistent growth, competitive advantage, and long-term success.',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
]
</script>

<template>
  <section id="mission" class="relative overflow-hidden py-12 md:py-24">
    <div class="mx-auto max-w-7xl px-6 text-center">
      <h2 class="mb-6 text-4xl font-black text-white md:mb-8 md:text-6xl">
        Our <span class="gradient-text drop-shadow-glow">Mission</span>
      </h2>
      <p class="mx-auto max-w-4xl text-xl font-medium leading-relaxed text-white/80 md:text-2xl">
        At CorosDev, we empower innovative companies worldwide through world-class technology and
        intelligent growth systems&mdash;transforming ideas into scalable, profitable, and future-ready
        businesses.
      </p>

      <p class="mt-8 text-sm font-bold uppercase tracking-[0.3em] text-cobalt-500 opacity-80 md:mt-16">
        To accomplish this, we:
      </p>

      <div class="mt-6 grid gap-5 md:mt-10 md:grid-cols-3 md:gap-8">
        <div
          v-for="block in blocks"
          :key="block.title"
          class="group glass soft flex h-full flex-col items-center rounded-3xl border border-white/5 p-10 transition-all duration-500 hover:border-neon-500/30"
        >
          <div
            class="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-neon-500/10 text-neon-500 transition-transform duration-500 group-hover:scale-110"
          >
            <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="block.icon" />
            </svg>
          </div>
          <h3 class="mb-4 text-xl font-bold text-white">{{ block.title }}</h3>
          <p class="text-sm leading-relaxed text-white/50">{{ block.description }}</p>
        </div>
      </div>

      <div class="mt-10 md:mt-20">
        <NuxtLink
          to="/about"
          class="rounded-xl border border-white/10 bg-white/5 px-10 py-4 font-bold text-white shadow-[0_0_30px_rgba(31,127,255,0.05)] transition-all duration-300 hover:border-neon-500 hover:bg-white/10"
        >
          READ ABOUT US
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
