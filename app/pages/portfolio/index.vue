<script setup lang="ts">
/**
 * /portfolio — índice del "Portfolio & Case Studies Engine".
 *
 * Toda la data entra por `useCaseStudiesIndex`, que nunca lanza: si Sanity no
 * responde, `data.error` es `true` y se pinta el panel de Modo Mantenimiento
 * en lugar de un 500. Filtro por industria y paginación van server-side
 * (GROQ); la búsqueda rápida filtra en cliente sobre la página cargada.
 */
const { t } = useI18n()
const localePath = useLocalePath()

const activeIndustry = ref<string | null>(null)
const page = ref(1)
const search = ref('')

const { data, pending } = await useCaseStudiesIndex({
  industry: activeIndustry,
  page,
  pageSize: 9,
})

usePageSeo({
  title: () => t('portfolio.seo.title'),
  description: () => t('portfolio.seo.description'),
})

const isMaintenance = computed(() => data.value.error)

// El destacado sólo tiene sentido en la vista "limpia": primera página, sin
// industria y sin búsqueda activa.
const featured = computed(() => {
  if (activeIndustry.value || page.value > 1 || search.value.trim()) return null
  return data.value.featured
})

const gridCaseStudies = computed(() => {
  let list = data.value.caseStudies
  if (featured.value) list = list.filter(cs => cs._id !== featured.value!._id)

  const q = search.value.trim().toLowerCase()
  if (q) {
    list = list.filter(cs =>
      cs.title.toLowerCase().includes(q)
      || cs.client.toLowerCase().includes(q)
      || (cs.summary?.toLowerCase().includes(q) ?? false)
      || (cs.industry?.toLowerCase().includes(q) ?? false),
    )
  }
  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(data.value.total / 9)))
const isEmpty = computed(
  () => !isMaintenance.value && !featured.value && gridCaseStudies.value.length === 0,
)

function selectIndustry(value: string | null) {
  activeIndustry.value = value
  page.value = 1
}

function clearFilters() {
  search.value = ''
  selectIndustry(null)
}

function goToPage(next: number) {
  page.value = Math.min(totalPages.value, Math.max(1, next))
  if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
}

function featuredHero(url?: string | null) {
  return url ? `${url}?w=1200&h=720&fit=crop&auto=format` : null
}
</script>

<template>
  <div class="mx-auto max-w-7xl px-6 pb-24 pt-36 md:pt-44">
    <!-- Cabecera -->
    <header class="max-w-2xl">
      <p class="inline-flex items-center gap-2 rounded-md border border-neon-500/25 bg-neon-500/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-neon-300">
        <span class="h-1.5 w-1.5 rounded-full bg-neon-500" aria-hidden="true" />
        {{ t('portfolio.hero.tag') }}
      </p>
      <h1 class="mt-6 text-4xl font-black leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl">
        {{ t('portfolio.hero.title_1') }} <span class="gradient-text">{{ t('portfolio.hero.title_span') }}</span>
      </h1>
      <p class="mt-5 text-base leading-relaxed text-ink-muted lg:text-lg">
        {{ t('portfolio.hero.subtitle') }}
      </p>
    </header>

    <!-- Controles: búsqueda + filtro por industria -->
    <div v-if="!isMaintenance" class="mt-12 flex flex-col gap-5 border-b border-hairline pb-6 lg:flex-row lg:items-center lg:justify-between">
      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          class="rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.12em] transition-colors duration-300 ease-out-expo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-300"
          :class="activeIndustry === null ? 'bg-neon-500 text-brand-900' : 'border border-hairline bg-surface-strong/50 text-ink-muted hover:border-neon-500/30 hover:text-ink'"
          @click="selectIndustry(null)"
        >
          {{ t('portfolio.filters.all') }}
        </button>
        <button
          v-for="ind in data.industries"
          :key="ind.value"
          type="button"
          class="rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.12em] transition-colors duration-300 ease-out-expo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-300"
          :class="activeIndustry === ind.value ? 'bg-neon-500 text-brand-900' : 'border border-hairline bg-surface-strong/50 text-ink-muted hover:border-neon-500/30 hover:text-ink'"
          @click="selectIndustry(ind.value)"
        >
          {{ ind.value }}
        </button>
      </div>

      <label class="relative block w-full lg:w-72">
        <span class="sr-only">{{ t('portfolio.search.label') }}</span>
        <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
        </svg>
        <input
          v-model="search"
          type="search"
          :placeholder="t('portfolio.search.placeholder')"
          class="w-full rounded-lg border border-hairline bg-surface-strong/50 py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted focus-visible:border-neon-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-300/40"
        >
      </label>
    </div>

    <!-- Modo Mantenimiento -->
    <UiSpotlightCard v-if="isMaintenance" :size="620" class="mt-12 flex flex-col items-start gap-4 rounded-2xl p-8 md:p-12">
      <span class="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-hairline bg-surface-strong/50" aria-hidden="true">
        <svg class="h-5 w-5 text-neon-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </span>
      <h2 class="text-xl font-black tracking-tight text-ink md:text-2xl">{{ t('portfolio.states.maintenanceTitle') }}</h2>
      <p class="max-w-md text-sm leading-relaxed text-ink-muted">{{ t('portfolio.states.maintenanceBody') }}</p>
      <NuxtLink :to="localePath('/')" class="mt-2 inline-flex items-center gap-2 text-sm font-bold text-neon-300 hover:text-neon-100">
        {{ t('portfolio.states.backHome') }}
      </NuxtLink>
    </UiSpotlightCard>

    <template v-else>
      <!-- Caso destacado -->
      <NuxtLink v-if="featured" :to="localePath(`/portfolio/${featured.slug}`)" class="mt-12 block focus-visible:outline-none">
        <UiSpotlightCard v-tilt="5" as="article" :size="720" class="group grid gap-0 overflow-hidden rounded-3xl md:grid-cols-2">
          <div class="relative aspect-[16/10] overflow-hidden bg-surface-strong/50 md:aspect-auto md:h-full">
            <img
              v-if="featuredHero(featured.hero?.url)"
              :src="featuredHero(featured.hero?.url)!"
              :alt="featured.hero?.alt || featured.title"
              width="1200"
              height="720"
              loading="eager"
              class="h-full w-full object-cover"
            >
            <div v-else class="h-full w-full bg-gradient-to-br from-brand-700 to-brand-900" aria-hidden="true" />
          </div>
          <div class="flex flex-col justify-center gap-4 p-8 md:p-10">
            <div class="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.14em]">
              <span class="rounded-full bg-neon-500/15 px-2.5 py-1 text-neon-300">{{ t('portfolio.featured.badge') }}</span>
              <span class="text-ink-muted">{{ featured.client }}</span>
              <span v-if="featured.industry" class="h-1 w-1 rounded-full bg-surface-strong/50" aria-hidden="true" />
              <span v-if="featured.industry" class="text-ink-muted">{{ featured.industry }}</span>
            </div>
            <h2 class="text-2xl font-black leading-[1.15] tracking-tight text-ink md:text-3xl">{{ featured.title }}</h2>
            <p v-if="featured.summary" class="line-clamp-3 text-sm leading-relaxed text-ink-muted md:text-base">{{ featured.summary }}</p>
          </div>
        </UiSpotlightCard>
      </NuxtLink>

      <!-- Rejilla -->
      <div v-if="gridCaseStudies.length" class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <PortfolioCaseStudyCard
          v-for="caseStudy in gridCaseStudies"
          :key="caseStudy._id"
          v-vanish
          :case-study="caseStudy"
        />
      </div>

      <!-- Empty State -->
      <UiSpotlightCard v-if="isEmpty" :size="520" class="mt-12 flex flex-col items-start gap-4 rounded-2xl p-8 md:p-12">
        <h2 class="text-xl font-black tracking-tight text-ink md:text-2xl">{{ t('portfolio.states.emptyTitle') }}</h2>
        <p class="max-w-md text-sm leading-relaxed text-ink-muted">
          {{ search.trim() || activeIndustry ? t('portfolio.states.emptyFiltered') : t('portfolio.states.emptyBody') }}
        </p>
        <button
          v-if="search.trim() || activeIndustry"
          type="button"
          class="mt-1 inline-flex items-center gap-2 text-sm font-bold text-neon-300 hover:text-neon-100"
          @click="clearFilters"
        >
          {{ t('portfolio.states.clearFilters') }}
        </button>
      </UiSpotlightCard>

      <!-- Paginación -->
      <nav v-if="totalPages > 1 && !search.trim()" class="mt-14 flex items-center justify-center gap-4" :aria-label="t('portfolio.pager.label')">
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-surface-strong/50 px-4 py-2 text-sm font-bold text-ink transition-colors duration-300 ease-out-expo hover:border-neon-500/30 disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="page <= 1 || pending"
          @click="goToPage(page - 1)"
        >
          {{ t('portfolio.pager.prev') }}
        </button>
        <span class="text-xs font-bold uppercase tracking-[0.14em] text-ink-muted">
          {{ t('portfolio.pager.status', { current: page, total: totalPages }) }}
        </span>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-surface-strong/50 px-4 py-2 text-sm font-bold text-ink transition-colors duration-300 ease-out-expo hover:border-neon-500/30 disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="page >= totalPages || pending"
          @click="goToPage(page + 1)"
        >
          {{ t('portfolio.pager.next') }}
        </button>
      </nav>
    </template>
  </div>
</template>
