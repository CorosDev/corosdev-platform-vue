<script setup lang="ts">
const { t } = useI18n()

interface MemberMeta {
  id: string
  name: string
  role: string
  /**
   * Placeholder ("#") until real profile URLs are provided — every card
   * still renders as a clickable link so swapping these in later is a
   * one-line data change, not a template change.
   */
  linkedinUrl: string
}

// Names and C-level role abbreviations aren't translated — only each
// member's description is (see i18n/locales/*.json under about.team.*_desc).
//
// NOTE: Emerson Medina moved CTO → CIO and Douglas Pineda joins as the new
// CTO, which leaves two members both titled CIO (John Vanegas + Emerson)
// for now — left as-is on purpose per the request that a full profile
// cleanup pass comes later; flagging here so it isn't mistaken for an
// oversight.
const teamMeta: MemberMeta[] = [
  { id: 'carlos', name: 'Carlos Hernandez', role: 'CEO', linkedinUrl: '#' },
  { id: 'kriscia', name: 'Kriscia Cornejo', role: 'CFO', linkedinUrl: '#' },
  { id: 'arturo', name: 'Arturo Guzman', role: 'COO', linkedinUrl: '#' },
  { id: 'jafet', name: 'Jafet Mourra', role: 'CPO', linkedinUrl: '#' },
  { id: 'salvador', name: 'Salvador Reynaud', role: 'CMO', linkedinUrl: '#' },
  { id: 'jeremy', name: 'Jeremy Rápalo', role: 'CCO', linkedinUrl: '#' },
  { id: 'john', name: 'John Vanegas', role: 'CIO', linkedinUrl: '#' },
  { id: 'emerson', name: 'Emerson Medina', role: 'CIO', linkedinUrl: '#' },
  { id: 'douglas', name: 'Douglas Pineda', role: 'CTO', linkedinUrl: '#' },
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

      <!-- flex+wrap+center instead of a strict grid: the team roster's size
           keeps changing (see the profile-cleanup note above), and an odd
           member count always leaves an incomplete last row — flex centers
           that leftover row instead of stranding it against the left edge
           the way `grid-cols-N` would. Card widths below match what
           `grid-cols-4`/`grid-cols-2` + `gap-8` would have produced at each
           breakpoint, so this is a drop-in visual replacement, not a resize. -->
      <div class="flex flex-wrap justify-center gap-8">
        <a
          v-for="member in team"
          :key="member.id"
          :href="member.linkedinUrl"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="t('about.team.linkedinAria', { name: member.name })"
          class="group glass relative flex h-full w-full flex-col items-center rounded-3xl border border-white/5 p-8 text-center transition-all duration-500 hover:border-neon-500/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neon-500 sm:w-[calc(50%-1rem)] lg:w-[calc(25%-1.5rem)]"
        >
          <span
            class="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/40 transition-colors duration-300 group-hover:border-neon-500/40 group-hover:text-neon-300"
            aria-hidden="true"
          >
            <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M4.98 3.5a2.5 2.5 0 1 1-.02 5 2.5 2.5 0 0 1 .02-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05c.53-.98 1.83-2 3.77-2 4.03 0 4.78 2.5 4.78 5.75V21h-4v-5.7c0-1.36-.02-3.1-1.9-3.1-1.9 0-2.2 1.48-2.2 3v5.8h-4V9Z"
              />
            </svg>
          </span>

          <h3 class="mb-1 text-2xl font-bold text-white">{{ member.name }}</h3>
          <p class="mb-4 text-xs font-semibold uppercase tracking-widest text-neon-500">{{ member.role }}</p>
          <p class="text-sm leading-relaxed text-white/50">{{ member.description }}</p>
        </a>
      </div>
    </div>
  </section>
</template>
