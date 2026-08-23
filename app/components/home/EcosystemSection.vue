<script setup lang="ts">
interface Venture {
  name: string
  logo: string
  logoWidth: number
  logoHeight: number
  description: string
  sector: string
}

const ventures: Venture[] = [
  {
    name: 'Accesorios TRD',
    logo: '/logos/trd.svg',
    logoWidth: 829,
    logoHeight: 367,
    description:
      'Premium automotive accessories e-commerce platform built for performance enthusiasts across LATAM and North America. Curated catalog, fast logistics, and a seamless buying experience.',
    sector: 'E-Commerce · Auto',
  },
  {
    name: 'Snapay',
    logo: '/logos/snapay.svg',
    logoWidth: 420,
    logoHeight: 432,
    description:
      'A next-generation payment infrastructure for SMEs in emerging markets. Instant settlements, multi-currency support, and AI-powered fraud prevention - built to democratize fintech.',
    sector: 'Fintech · Payments',
  },
  {
    name: 'Vorzana',
    logo: '/logos/vorzana.svg',
    logoWidth: 829,
    logoHeight: 367,
    description:
      'An AI-powered business intelligence platform that transforms raw operational data into strategic insights. Custom dashboards, predictive analytics, and automated reporting at enterprise grade.',
    sector: 'AI · Analytics',
  },
]
</script>

<template>
  <section id="ecosystem" class="relative overflow-hidden py-12 md:py-24">
    <div class="mx-auto max-w-7xl px-6">
      <div class="mb-8 md:mb-16">
        <p class="mb-4 text-[11px] font-bold uppercase tracking-[0.35em] text-neon-500 opacity-70">
          Internal Ventures
        </p>
        <h2 class="text-4xl font-black text-white md:text-6xl">
          Our <span class="gradient-text drop-shadow-glow">Ecosystem</span>
        </h2>
        <p class="mt-4 max-w-2xl text-lg text-white/50">
          Beyond client work&mdash;we build our own products. These are the ventures born inside CorosDev,
          each solving a real problem at scale.
        </p>
      </div>

      <div class="grid gap-8 md:grid-cols-3">
        <div
          v-for="venture in ventures"
          :key="venture.name"
          class="group glass relative flex flex-col gap-6 rounded-3xl border border-white/5 p-8 transition-all duration-400 hover:-translate-y-1.5 hover:shadow-[0_30px_80px_rgba(31,127,255,0.18)]"
        >
          <div class="flex items-start justify-between">
            <div class="animate-float flex h-16 w-32 items-center justify-start">
              <img
                :src="venture.logo"
                :alt="`${venture.name} logo`"
                :width="venture.logoWidth"
                :height="venture.logoHeight"
                class="drop-shadow-glow h-16 w-auto max-w-full object-contain"
              />
            </div>
            <span
              class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-neon-500/35 bg-neon-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-neon-300"
            >
              <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-neon-500" aria-hidden="true" />
              Early Access
            </span>
          </div>
          <div class="flex-1">
            <h3 class="mb-3 text-2xl font-black text-white">{{ venture.name }}</h3>
            <p class="text-sm leading-relaxed text-white/55">{{ venture.description }}</p>
          </div>
          <div class="flex items-center gap-3 border-t border-white/5 pt-2">
            <span class="text-[11px] font-semibold uppercase tracking-widest text-white/30">Sector</span>
            <span class="text-[11px] font-bold uppercase tracking-widest text-neon-300">{{ venture.sector }}</span>
          </div>
        </div>
      </div>

      <div class="mt-8 flex items-center gap-4 md:mt-14">
        <div class="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <p class="px-4 text-xs font-semibold uppercase tracking-widest text-white/30">
          Interested in partnering or investing?
          <a href="#contact" class="ml-1 text-neon-500 hover:underline">Let's talk &rarr;</a>
        </p>
        <div class="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <div class="mt-6 text-center md:mt-12">
        <a
          href="#contact"
          class="animate-pulse inline-flex items-center gap-2 rounded-2xl bg-neon-500 px-8 py-4 text-base font-bold uppercase tracking-wider text-brand-900 shadow-[0_0_25px_rgba(31,127,255,0.35)] transition-all hover:scale-105"
        >
          Want to be an early Tester? &rarr;
        </a>
      </div>
    </div>
  </section>
</template>
