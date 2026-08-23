<script setup lang="ts">
interface Partner {
  name: string
  url: string
  sector: string
  description: string
  logo: string
  /** Logos designed for light backgrounds get a white chip; dark-ready marks sit on a neon-tinted chip. */
  lightBg: boolean
}

const partners: Partner[] = [
  {
    name: 'EncryptedInfoWeb',
    url: 'https://encryptedinfoweb.com/',
    sector: 'IT Solutions & Software Development',
    description:
      'Custom web development, mobile apps, and enterprise ERP/CRM software — delivering data-driven solutions across real estate, healthcare, finance, and e-commerce.',
    logo: '/logos/partners/encryptedinfoweb.webp',
    lightBg: true,
  },
  {
    name: 'SBC Capital',
    url: 'https://www.sbc.capital/',
    sector: 'Private Equity & Acquisitions',
    description:
      'A private acquisition firm investing in lower middle-market businesses across the U.S. and Europe, acting as permanent, long-term owners.',
    logo: '/logos/partners/sbc-capital.png',
    lightBg: true,
  },
  {
    name: 'AUDELA Control Tower',
    url: 'https://audeladedonnees.fr/',
    sector: 'Business Intelligence & LegalTech',
    description:
      'A French software company delivering Business Intelligence, ERP, and LegalTech solutions through its unified Control Tower platform.',
    logo: '/logos/partners/audela.svg',
    lightBg: false,
  },
  {
    name: 'Nolim Studios',
    url: 'https://www.nolimstudios.com/es',
    sector: 'Software, AI & AR/VR',
    description:
      'A software development studio building custom software, AI systems, AR/VR experiences, SaaS platforms, and games — from air traffic systems to judicial education platforms.',
    logo: '/logos/partners/nolim-studios.png',
    lightBg: true,
  },
  {
    name: 'The Intellify',
    url: 'https://theintellify.com/',
    sector: 'AI & Digital Product Engineering',
    description:
      'An AI and digital product engineering company building intelligent automation, AI agents, and modernized platforms for enterprises across regulated industries.',
    logo: '/logos/partners/the-intellify.svg',
    lightBg: false,
  },
]
</script>

<template>
  <section id="partners" class="relative z-10 py-16 md:py-32">
    <div class="mx-auto max-w-7xl px-6">
      <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <a
          v-for="partner in partners"
          :key="partner.name"
          :href="partner.url"
          target="_blank"
          rel="noopener noreferrer"
          class="group glass flex flex-col rounded-[2rem] border border-white/5 bg-white/[0.02] p-8 transition-all duration-400 hover:-translate-y-1.5 hover:border-neon-500/30 hover:shadow-[0_30px_80px_rgba(31,127,255,0.16)]"
        >
          <div
            class="flex h-16 w-16 items-center justify-center rounded-2xl border p-2.5"
            :class="partner.lightBg ? 'border-white/10 bg-white' : 'border-neon-500/20 bg-neon-500/10'"
          >
            <img :src="partner.logo" :alt="`${partner.name} logo`" width="64" height="64" class="h-full w-full object-contain" loading="lazy" decoding="async" />
          </div>
          <h2 class="mt-6 text-2xl font-black text-white">{{ partner.name }}</h2>
          <span
            class="mt-2 inline-block w-fit rounded-lg border border-neon-500/20 bg-neon-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-neon-300"
          >
            {{ partner.sector }}
          </span>
          <p class="mt-4 flex-1 text-sm leading-relaxed text-white/60">{{ partner.description }}</p>
          <span class="mt-6 inline-flex items-center gap-2 text-sm font-bold text-neon-300 transition-colors group-hover:text-neon-500">
            Visit site &rarr;
          </span>
        </a>
      </div>
    </div>
  </section>
</template>
