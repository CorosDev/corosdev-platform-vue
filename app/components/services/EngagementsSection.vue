<script setup lang="ts">
interface Engagement {
  tag: string
  title: string
  description: string
  features: string[]
  /** Solid CTA button instead of the outlined default. */
  featured?: boolean
}

const engagements: Engagement[] = [
  {
    tag: '01 / Innovation',
    title: 'AI & Workflow Automation',
    description:
      'Boost operational efficiency by 40% with intelligent agents and custom GPT integrations tailored to your data.',
    features: ['Custom AI Agents', 'Workflow Optimization', 'LLM Training & Fine-tune'],
  },
  {
    tag: '02 / Engineering',
    title: 'Full-Stack Development',
    description:
      'End-to-end product creation from MVP to enterprise scale. We build software that feels like the future.',
    features: ['Web & Mobile Apps', 'Dedicated PM & QA', 'React / Node / Python'],
  },
  {
    tag: '03 / Marketing Tech',
    title: 'Marketing & Conversion',
    description:
      'Dominate the market with high-converting landing pages and automated multi-channel marketing systems.',
    features: ['High-Conversion UI/UX', 'Ad-Tech Integrations', 'Performance Analytics'],
    featured: true,
  },
  {
    tag: '04 / Authority',
    title: 'SEO & Digital Authority',
    description:
      'Turn search engines into your biggest revenue source with aggressive technical SEO and content strategy.',
    features: ['Technical SEO Audits', 'Keyword Dominance', 'Backlink Architecture'],
  },
  {
    tag: '05 / Infrastructure',
    title: 'Cloud & Scalability',
    description:
      'Scale to millions of users with zero downtime. We optimize your cloud for speed, security, and cost.',
    features: ['AWS / Azure / GCP', 'DevOps Automation', 'Cybersecurity Hardening'],
  },
  {
    tag: '06 / Total Innovation',
    title: 'Elite Innovation Squad',
    description:
      'A dedicated high-performance team covering all fronts: AI, Dev, Growth, and Infrastructure. Your tech partner for global dominance.',
    features: ['Dedicated C-Level Devs', '24/7 Priority Support', 'Unlimited Scalability'],
  },
]
</script>

<template>
  <section id="services" class="relative z-10 overflow-hidden py-16 md:py-32">
    <div class="mx-auto max-w-7xl px-6">
      <div class="mb-12 text-center md:mb-24">
        <span class="text-xs font-bold uppercase tracking-widest text-neon-500">Our Engagements</span>
        <h2 class="mt-4 text-4xl font-black text-white md:text-7xl">
          Engagements <span class="gradient-text drop-shadow-glow">that scale</span>
        </h2>
        <p class="mx-auto mt-6 max-w-2xl text-xl text-white/50">
          Elite technology solutions designed to fit your unique business stage. Choose your impact level.
        </p>
      </div>

      <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="engagement in engagements"
          :key="engagement.title"
          class="group relative"
        >
          <div
            class="glass flex h-full flex-col rounded-3xl border border-white/5 p-8 transition-all duration-500 group-hover:border-neon-500/50"
          >
            <div class="mb-4 text-[12px] font-bold uppercase tracking-widest text-neon-500">
              {{ engagement.tag }}
            </div>
            <h3 class="mb-6 text-3xl font-black text-white transition-colors group-hover:text-neon-300">
              {{ engagement.title }}
            </h3>
            <p class="mb-8 flex-grow text-sm leading-relaxed text-white/60">{{ engagement.description }}</p>
            <ul class="mb-10 space-y-3 text-sm text-white/80">
              <li v-for="feature in engagement.features" :key="feature" class="flex items-center gap-3">
                <span class="h-1.5 w-1.5 rounded-full bg-neon-500" />
                <span>{{ feature }}</span>
              </li>
            </ul>
            <a
              href="/#contact"
              class="w-full rounded-xl py-4 text-center text-xs font-black uppercase tracking-widest transition-all"
              :class="
                engagement.featured
                  ? 'bg-neon-500 text-brand-900 drop-shadow-glow hover:scale-105'
                  : 'border border-white/10 hover:bg-neon-500 hover:text-brand-900'
              "
            >
              Get Started
            </a>
          </div>
        </div>
      </div>

      <p class="mt-20 text-center text-sm italic text-white/40 underline decoration-neon-500/30 underline-offset-4">
        Looking for something custom? All plans can be tailored to your specific requirements.
      </p>
    </div>
  </section>
</template>
