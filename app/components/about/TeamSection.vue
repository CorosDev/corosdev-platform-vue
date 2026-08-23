<script setup lang="ts">
interface Member {
  name: string
  role: string
  description: string
}

const team: Member[] = [
  {
    name: 'Carlos Hernandez',
    role: 'CEO',
    description: 'Visionary leader driving the strategic direction and growth of CorosDev worldwide.',
  },
  {
    name: 'Kriscia Cornejo',
    role: 'CFO',
    description: 'Strategic financial leader managing capital and performance for sustainable innovation.',
  },
  {
    name: 'Arturo Guzman',
    role: 'COO',
    description: 'Architect of operational excellence, ensuring seamless delivery across all global projects.',
  },
  {
    name: 'Jafet Mourra',
    role: 'CPO',
    description: 'Directing product innovation and user-centric architectures for high-impact software.',
  },
  {
    name: 'Salvador Reynaud',
    role: 'CMO',
    description:
      'Expert in strategic management focused on scaling businesses and positioning brands through high-impact market analysis.',
  },
  {
    name: 'Jeremy Rápalo',
    role: 'CCO',
    description: 'Managing internal and external flows to ensure clarity and impact across all channels.',
  },
  {
    name: 'John Vanegas',
    role: 'CIO',
    description: 'Leading data strategy and technological integration to drive intelligent business insights.',
  },
  {
    name: 'Emerson Medina',
    role: 'CTO',
    description: 'Technical mastermind engineering high-performance systems and AI-driven solutions.',
  },
]
</script>

<template>
  <section class="relative py-12 md:py-24">
    <div class="mx-auto max-w-7xl px-6">
      <div class="mb-16 text-center">
        <h2 class="text-3xl font-extrabold text-white md:text-5xl">
          Our <span class="gradient-text">Leadership</span> Team
        </h2>
        <div class="mx-auto mt-6 h-1 w-24 rounded-full bg-neon-500 opacity-50" />
      </div>

      <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="member in team"
          :key="member.name"
          class="group glass flex h-full flex-col items-center rounded-3xl border border-white/5 p-8 text-center transition-all duration-500 hover:border-neon-500/30"
        >
          <h3 class="mb-1 text-2xl font-bold text-white">{{ member.name }}</h3>
          <p class="mb-4 text-xs font-semibold uppercase tracking-widest text-neon-500">{{ member.role }}</p>
          <p class="text-sm leading-relaxed text-white/50">{{ member.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
