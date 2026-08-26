<script setup lang="ts">
const { t } = useI18n()

interface MemberMeta {
  id: string
  name: string
  role: string
  /**
   * Public LinkedIn profile. Emerson has no personal profile on file yet, so
   * his points at linkedin.com itself — swap it in here when it exists.
   */
  linkedinUrl: string
}

// Names and C-level role abbreviations aren't translated — only each
// member's description is (see i18n/locales/*.json under about.team.*_desc).
//
// CEO + CTO lead the array on purpose (per the profile-cleanup request) so
// they read as the section's headline pair, with the rest of the leadership
// team following. John Vanegas (formerly CIO) was removed — Emerson Medina
// is now the sole CIO.
const teamMeta: MemberMeta[] = [
  { id: 'carlos', name: 'Carlos Hernandez', role: 'CEO', linkedinUrl: 'https://www.linkedin.com/in/carlos-hernandez-zuniga-b030731a5/' },
  { id: 'douglas', name: 'Douglas Pineda', role: 'CTO', linkedinUrl: 'https://www.linkedin.com/in/douglaspinedarojas/' },
  { id: 'kriscia', name: 'Kriscia Cornejo', role: 'CFO', linkedinUrl: 'https://www.linkedin.com/in/kriscia-cornejo-616454395/' },
  { id: 'arturo', name: 'Arturo Guzman', role: 'COO', linkedinUrl: 'https://www.linkedin.com/in/arturoguzmanpaz/' },
  { id: 'jafet', name: 'Jafet Mourra', role: 'CPO', linkedinUrl: 'https://www.linkedin.com/in/jafet-mourra-3b128a2b1/' },
  { id: 'salvador', name: 'Salvador Reynaud', role: 'CMO', linkedinUrl: 'https://www.linkedin.com/in/salvadorreynaud/' },
  { id: 'jeremy', name: 'Jeremy Rápalo', role: 'CCO', linkedinUrl: 'https://www.linkedin.com/in/jeremy-r%C3%A1palo-394949283/' },
  { id: 'emerson', name: 'Emerson Medina', role: 'CIO', linkedinUrl: 'https://www.linkedin.com' },
]

/**
 * A usable profile is a linkedin.com/in/<slug> URL. A bare
 * "https://www.linkedin.com" (or an empty/partial value) means "not published
 * yet": that card renders as a plain, non-interactive tile instead of a link
 * that dumps the visitor on LinkedIn's homepage while looking like it leads
 * somewhere. These URLs are hand-maintained above, never user input, so a
 * substring check is enough.
 */
function hasLinkedInProfile(url: string) {
  const marker = 'linkedin.com/in/'
  const at = url.indexOf(marker)
  return at !== -1 && url.length > at + marker.length
}

const team = computed(() =>
  teamMeta.map((member) => ({
    ...member,
    description: t(`about.team.${member.id}_desc`),
    hasProfile: hasLinkedInProfile(member.linkedinUrl),
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
        <component
          :is="member.hasProfile ? 'a' : 'div'"
          v-for="member in team"
          :key="member.id"
          :href="member.hasProfile ? member.linkedinUrl : undefined"
          :target="member.hasProfile ? '_blank' : undefined"
          :rel="member.hasProfile ? 'noopener noreferrer' : undefined"
          :aria-label="member.hasProfile ? t('about.team.linkedinAria', { name: member.name }) : undefined"
          class="group glass relative flex w-full flex-col items-center rounded-3xl border border-white/5 p-8 text-center transition-all duration-300 sm:w-[calc(50%-1rem)] lg:w-[calc(25%-1.5rem)]"
          :class="
            member.hasProfile
              ? 'cursor-pointer hover:-translate-y-1 hover:border-neon-500/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neon-500'
              : ''
          "
        >
          <!-- Corner badge, not inline with the name: the previous inline
               placement (icon in a flex row next to <h3>) was eating into the
               name's available width, which is exactly what made longer
               names ("Carlos Hernandez", "Salvador Reynaud") wrap to a
               second line and knock every other card's role/description out
               of alignment with it. -->
          <svg
            v-if="member.hasProfile"
            class="absolute right-4 top-4 h-4 w-4 text-white/30 transition-colors duration-300 group-hover:text-neon-300"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="M4.98 3.5a2.5 2.5 0 1 1-.02 5 2.5 2.5 0 0 1 .02-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05c.53-.98 1.83-2 3.77-2 4.03 0 4.78 2.5 4.78 5.75V21h-4v-5.7c0-1.36-.02-3.1-1.9-3.1-1.9 0-2.2 1.48-2.2 3v5.8h-4V9Z"
            />
          </svg>

          <h3 class="mb-1 text-xl font-bold text-white">{{ member.name }}</h3>
          <p class="mb-4 text-xs font-semibold uppercase tracking-widest text-neon-500">{{ member.role }}</p>
          <p class="text-sm leading-relaxed text-white/50">{{ member.description }}</p>
        </component>
      </div>
    </div>
  </section>
</template>
