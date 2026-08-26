<script setup lang="ts">
const { t } = useI18n()

interface PartnerMeta {
  id: 'eiw' | 'sbc' | 'audela' | 'nolim' | 'intellify'
  url: string
  logo: string
  /** Logos designed for light backgrounds get a white chip; dark-ready marks sit on a neon-tinted chip. */
  lightBg: boolean
}

const partnerMeta: PartnerMeta[] = [
  { id: 'eiw', url: 'https://encryptedinfoweb.com/', logo: '/logos/partners/encryptedinfoweb.webp', lightBg: true },
  { id: 'sbc', url: 'https://www.sbc.capital/', logo: '/logos/partners/sbc-capital-square.png', lightBg: true },
  { id: 'audela', url: 'https://audeladedonnees.fr/', logo: '/logos/partners/audela.svg', lightBg: false },
  { id: 'nolim', url: 'https://www.nolimstudios.com/es', logo: '/logos/partners/nolim-studios.png', lightBg: true },
  { id: 'intellify', url: 'https://theintellify.com/', logo: '/logos/partners/the-intellify.svg', lightBg: false },
]

const partners = computed(() =>
  partnerMeta.map((partner) => ({
    ...partner,
    name: t(`partners.grid.${partner.id}_name`),
    sector: t(`partners.grid.${partner.id}_sector`),
    description: t(`partners.grid.${partner.id}_desc`),
  })),
)
</script>

<template>
  <section id="partners" class="relative z-10 py-16 md:py-32">
    <div class="mx-auto max-w-7xl px-6">
      <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <a
          v-for="partner in partners"
          :key="partner.id"
          :href="partner.url"
          target="_blank"
          rel="noopener noreferrer"
          class="group glass flex flex-col rounded-[2rem] border border-white/5 bg-white/[0.02] p-8 transition-all duration-400 hover:-translate-y-1.5 hover:border-neon-500/30 hover:shadow-[0_30px_80px_rgba(31,127,255,0.16)]"
        >
          <div
            class="flex h-16 w-16 items-center justify-center rounded-2xl border p-2.5"
            :class="partner.lightBg ? 'border-white/10 bg-white' : 'border-neon-500/20 bg-neon-500/10'"
          >
            <NuxtPicture
              :src="partner.logo"
              :alt="`${partner.name} logo`"
              width="64"
              height="64"
              loading="lazy"
              decoding="async"
              class="block h-full w-full"
              :img-attrs="{ class: 'h-full w-full object-contain' }"
            />
          </div>
          <h2 class="mt-6 text-2xl font-black text-white">{{ partner.name }}</h2>
          <span
            class="mt-2 inline-block w-fit rounded-lg border border-neon-500/20 bg-neon-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-neon-300"
          >
            {{ partner.sector }}
          </span>
          <p class="mt-4 flex-1 text-sm leading-relaxed text-white/60">{{ partner.description }}</p>
          <span class="mt-6 inline-flex items-center gap-2 text-sm font-bold text-neon-300 transition-colors group-hover:text-neon-500">
            {{ t('partners.grid.visit') }}
          </span>
        </a>
      </div>
    </div>
  </section>
</template>
