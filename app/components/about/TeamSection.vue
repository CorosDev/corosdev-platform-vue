<script setup lang="ts">
/**
 * Liderazgo, en bento asimétrico.
 *
 * CEO y CTO abren la sección ocupando media fila cada uno; el resto del
 * equipo va a un tercio. Sobre 12 columnas: 6+6 en la primera fila, 4+4+4 en
 * las siguientes. La asignación es por índice, no por id, así que añadir o
 * quitar a alguien no rompe nada — como mucho, la última fila queda
 * incompleta y alineada a la izquierda (el patrón anterior era flex+wrap
 * centrado justamente por eso; con bento se gana jerarquía y se acepta esa
 * fila incompleta, que es lo que hacen Stripe y Linear en sus propias
 * rejillas de equipo).
 *
 * Sin fotos en el repositorio, cada tarjeta se ancla con un monograma
 * generado de las iniciales: da ritmo visual a la rejilla sin pedir un
 * asset que no existe y sin recurrir a un avatar genérico de stock.
 */
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

/** Iniciales de nombre y primer apellido, en mayúsculas. */
function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
}

const team = computed(() =>
  teamMeta.map((member, index) => ({
    ...member,
    description: t(`about.team.${member.id}_desc`),
    hasProfile: hasLinkedInProfile(member.linkedinUrl),
    initials: initials(member.name),
    featured: index < 2,
    span: index < 2 ? 'lg:col-span-6' : 'lg:col-span-4',
  })),
)
</script>

<template>
  <section class="relative py-12 md:py-20">
    <div class="mx-auto max-w-7xl px-6">
      <div v-reveal class="mb-10 md:mb-14">
        <p class="mb-4 text-[11px] font-bold uppercase tracking-[0.35em] text-neon-500">
          {{ t('about.team.label') }}
        </p>
        <h2 class="max-w-3xl text-3xl font-black leading-[1.1] tracking-tight text-white md:text-5xl">
          {{ t('about.team.h2_1') }} <span class="gradient-text">{{ t('about.team.h2_span') }}</span>
          {{ t('about.team.h2_2') }}
        </h2>
      </div>

      <div v-reveal="100" class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-12">
        <UiSpotlightCard
          v-for="member in team"
          :key="member.id"
          :as="member.hasProfile ? 'a' : 'article'"
          :href="member.hasProfile ? member.linkedinUrl : undefined"
          :target="member.hasProfile ? '_blank' : undefined"
          :rel="member.hasProfile ? 'noopener noreferrer' : undefined"
          :aria-label="member.hasProfile ? t('about.team.linkedinAria', { name: member.name }) : undefined"
          :size="member.featured ? 520 : 340"
          class="flex flex-col rounded-xl p-6 md:p-7"
          :class="[
            member.span,
            member.hasProfile
              ? 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-300'
              : '',
          ]"
        >
          <div class="flex items-start justify-between gap-4">
            <span
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-neon-500/20 bg-neon-500/10 text-sm font-black tracking-wide text-neon-300"
              aria-hidden="true"
            >
              {{ member.initials }}
            </span>
            <svg
              v-if="member.hasProfile"
              class="h-4 w-4 shrink-0 text-white/25 transition-colors duration-300 ease-out-expo group-hover/spot:text-neon-300"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M4.98 3.5a2.5 2.5 0 1 1-.02 5 2.5 2.5 0 0 1 .02-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05c.53-.98 1.83-2 3.77-2 4.03 0 4.78 2.5 4.78 5.75V21h-4v-5.7c0-1.36-.02-3.1-1.9-3.1-1.9 0-2.2 1.48-2.2 3v5.8h-4V9Z"
              />
            </svg>
          </div>

          <h3
            class="mt-5 font-black tracking-tight text-white"
            :class="member.featured ? 'text-2xl' : 'text-lg'"
          >
            {{ member.name }}
          </h3>
          <p class="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-neon-500">{{ member.role }}</p>
          <p
            class="mt-3 leading-relaxed text-white/50"
            :class="member.featured ? 'text-sm md:max-w-md' : 'text-sm'"
          >
            {{ member.description }}
          </p>
        </UiSpotlightCard>
      </div>
    </div>
  </section>
</template>
