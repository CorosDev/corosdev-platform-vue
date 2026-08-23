<script setup lang="ts">
interface Venture {
  name: string
  sector: string
  description: string
  detail: string
  stage: string
  sectorValue: string
  logo: string
  logoAlt: string
  logoClass: string
  /** Show the logo before the copy on large screens (alternating layout). */
  logoFirst?: boolean
}

const ventures: Venture[] = [
  {
    name: 'Accesorios TRD',
    sector: 'E-Commerce · Auto',
    description:
      'Premium automotive accessories e-commerce platform built for performance enthusiasts across LATAM and North America. Curated catalog, fast logistics, and a seamless buying experience.',
    detail:
      'Accesorios TRD was born from a real gap in the LATAM market: premium automotive parts with no trustworthy online destination. We built the entire platform — storefront, logistics integrations, and inventory management — in-house.',
    stage: 'Growth & Scale',
    sectorValue: 'E-Commerce',
    logo: '/logos/trd.svg',
    logoAlt: 'Accesorios TRD logo',
    logoClass: 'h-48',
  },
  {
    name: 'Snapay',
    sector: 'Fintech · Payments',
    description:
      'A next-generation payment infrastructure for SMEs in emerging markets. Instant settlements, multi-currency support, and AI-powered fraud prevention - built to democratize fintech.',
    detail:
      'Snapay addresses the fragmented payment landscape in LATAM where 60% of SMEs remain underserved by traditional banking. Our API-first architecture enables any merchant to accept payments in under 10 minutes.',
    stage: 'Beta Validation',
    sectorValue: 'Fintech',
    logo: '/logos/snapay.svg',
    logoAlt: 'Snapay logo',
    logoClass: 'h-48',
    logoFirst: true,
  },
  {
    name: 'Vorzana',
    sector: 'AI · Analytics',
    description:
      'An AI-powered business intelligence platform that transforms raw operational data into strategic insights. Custom dashboards, predictive analytics, and automated reporting at enterprise grade.',
    detail:
      'Vorzana emerged from the operational pain our own clients faced: drowning in data but starving for insight. We built an AI layer that speaks your business language, not technical jargon.',
    stage: 'MVP Phase',
    sectorValue: 'AI / Analytics',
    logo: '/logos/vorzana.svg',
    logoAlt: 'Vorzana logo',
    logoClass: 'h-60',
  },
]
</script>

<template>
  <section id="ventures" class="relative z-10 py-16 md:py-32">
    <div class="mx-auto max-w-7xl px-6">
      <div class="space-y-24">
        <div
          v-for="venture in ventures"
          :key="venture.name"
          class="group glass relative rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-8 transition-all duration-700 hover:border-neon-500/30 md:p-12"
        >
          <div class="grid items-center gap-10 lg:grid-cols-12">
            <div
              class="flex justify-center lg:col-span-5"
              :class="venture.logoFirst ? 'order-first' : 'lg:order-last'"
            >
              <div class="animate-float flex h-72 w-72 items-center justify-center">
                <img
                  :src="venture.logo"
                  :alt="venture.logoAlt"
                  class="drop-shadow-glow w-auto max-w-full object-contain"
                  :class="venture.logoClass"
                />
              </div>
            </div>

            <div class="space-y-6 lg:col-span-7">
              <div class="flex flex-wrap items-center gap-4">
                <span
                  class="rounded-xl border border-neon-500/20 bg-neon-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-neon-300"
                >
                  {{ venture.sector }}
                </span>
                <span
                  class="animate-pulse rounded-lg bg-neon-500 px-3 py-1 text-xs font-bold uppercase tracking-widest text-brand-900 drop-shadow-glow"
                >
                  Early Access
                </span>
              </div>

              <h2 class="text-4xl font-black text-white md:text-6xl">{{ venture.name }}</h2>

              <p class="text-base font-semibold leading-relaxed text-white/80 md:text-lg">
                {{ venture.description }}
              </p>

              <div class="space-y-3 rounded-2xl border border-white/5 bg-white/[0.02] p-6">
                <h4 class="text-xs font-bold uppercase tracking-widest text-neon-300">Why &amp; How</h4>
                <p class="text-sm leading-relaxed text-white/60">{{ venture.detail }}</p>
              </div>

              <div class="grid grid-cols-2 gap-6 border-t border-white/5 pt-4 sm:grid-cols-3">
                <div>
                  <span class="block text-xs uppercase tracking-widest text-white/40">Status</span>
                  <span class="mt-1 block text-sm font-bold text-white">Early Access</span>
                </div>
                <div>
                  <span class="block text-xs uppercase tracking-widest text-white/40">Stage</span>
                  <span class="mt-1 block text-sm font-bold text-white">{{ venture.stage }}</span>
                </div>
                <div>
                  <span class="block text-xs uppercase tracking-widest text-white/40">Sector</span>
                  <span class="mt-1 block text-sm font-bold text-white">{{ venture.sectorValue }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
