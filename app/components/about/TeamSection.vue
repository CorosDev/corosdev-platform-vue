<script setup lang="ts">
const { t } = useI18n()

interface MemberMeta {
  id: string
  name: string
  role: string
}

// Names and C-level role abbreviations aren't translated — only each
// member's description is (see i18n/locales/*.json under about.team.*_desc).
const teamMeta: MemberMeta[] = [
  { id: 'carlos', name: 'Carlos Hernandez', role: 'CEO' },
  { id: 'kriscia', name: 'Kriscia Cornejo', role: 'CFO' },
  { id: 'arturo', name: 'Arturo Guzman', role: 'COO' },
  { id: 'jafet', name: 'Jafet Mourra', role: 'CPO' },
  { id: 'salvador', name: 'Salvador Reynaud', role: 'CMO' },
  { id: 'jeremy', name: 'Jeremy Rápalo', role: 'CCO' },
  { id: 'john', name: 'John Vanegas', role: 'CIO' },
  { id: 'emerson', name: 'Emerson Medina', role: 'CTO' },
]

const team = computed(() =>
  teamMeta.map((member) => ({
    ...member,
    description: t(`about.team.${member.id}_desc`),
  })),
)
</script>

<template>
  <section class="relative py-12 md:py-24">
    <div class="mx-auto max-w-7xl px-6">
      <div class="mb-16 text-center">
        <h2 class="text-3xl font-extrabold text-white md:text-5xl">
          {{ t('about.team.h2_1') }} <span class="gradient-text">{{ t('about.team.h2_span') }}</span> {{ t('about.team.h2_2') }}
        </h2>
        <div class="mx-auto mt-6 h-1 w-24 rounded-full bg-neon-500 opacity-50" />
      </div>

      <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="member in team"
          :key="member.id"
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
