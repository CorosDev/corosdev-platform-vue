<script setup lang="ts">
/**
 * /blog — índice del "Enterprise Insights Engine".
 *
 * `useBlogIndex` hace UNA lectura (todos los posts + destacado + categorías)
 * y nunca lanza: si Sanity no responde, `data.error` es `true` y se pinta el
 * panel de Modo Mantenimiento. El filtro por categoría, la búsqueda y la
 * paginación se resuelven aquí en memoria con `computed()` — cero roundtrips
 * a Sanity al filtrar.
 */
const { t, locale } = useI18n()
const localePath = useLocalePath()

const PAGE_SIZE = 9

const activeCategory = ref<string | null>(null)
const search = ref('')
const page = ref(1)

const { data } = await useBlogIndex()

usePageSeo({
  title: () => t('blog.seo.title'),
  description: () => t('blog.seo.description'),
})

const isMaintenance = computed(() => data.value.error)

// Núcleo del arreglo: filtrado por categoría + búsqueda 100% en memoria.
const filteredPosts = computed(() => {
  let list = data.value.posts

  if (activeCategory.value) {
    list = list.filter(p => p.category?.slug === activeCategory.value)
  }

  const q = search.value.trim().toLowerCase()
  if (q) {
    list = list.filter(p =>
      p.title.toLowerCase().includes(q)
      || (p.excerpt?.toLowerCase().includes(q) ?? false)
      || (p.category?.title.toLowerCase().includes(q) ?? false),
    )
  }
  return list
})

// Cualquier cambio de filtro vuelve a la primera página.
watch([activeCategory, search], () => {
  page.value = 1
})

// El destacado sólo en la vista "limpia": sin categoría, sin búsqueda, página 1.
const featured = computed(() => {
  if (activeCategory.value || search.value.trim() || page.value > 1) return null
  return data.value.featuredPost
})

// Pool visible = filtrados menos el destacado (si se está mostrando).
const visiblePool = computed(() =>
  featured.value
    ? filteredPosts.value.filter(p => p._id !== featured.value!._id)
    : filteredPosts.value,
)

const totalPages = computed(() => Math.max(1, Math.ceil(visiblePool.value.length / PAGE_SIZE)))

const gridPosts = computed(() =>
  visiblePool.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE),
)

const isEmpty = computed(
  () => !isMaintenance.value && !featured.value && visiblePool.value.length === 0,
)

function selectCategory(slug: string | null) {
  activeCategory.value = slug
}

function clearFilters() {
  search.value = ''
  activeCategory.value = null
}

function goToPage(next: number) {
  page.value = Math.min(totalPages.value, Math.max(1, next))
  if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
}

function featuredCover(url?: string | null) {
  return url ? `${url}?w=1200&h=720&fit=crop&auto=format` : null
}

function featuredDate(iso?: string | null) {
  return iso
    ? new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium' }).format(new Date(iso))
    : ''
}
</script>

<template>
  <div class="mx-auto max-w-7xl px-6 pb-24 pt-36 md:pt-44">
    <!-- Cabecera -->
    <header class="max-w-2xl">
      <p class="inline-flex items-center gap-2 rounded-md border border-neon-500/25 bg-neon-500/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-neon-300">
        <span class="h-1.5 w-1.5 rounded-full bg-neon-500" aria-hidden="true" />
        {{ t('blog.hero.tag') }}
      </p>
      <h1 class="mt-6 text-4xl font-black leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl">
        {{ t('blog.hero.title_1') }} <span class="gradient-text">{{ t('blog.hero.title_span') }}</span>
      </h1>
      <p class="mt-5 text-base leading-relaxed text-ink-muted lg:text-lg">
        {{ t('blog.hero.subtitle') }}
      </p>
    </header>

    <!-- Controles: búsqueda + filtro por categoría -->
    <div v-if="!isMaintenance" class="mt-12 flex flex-col gap-5 border-b border-hairline pb-6 lg:flex-row lg:items-center lg:justify-between">
      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          class="rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.12em] transition-colors duration-300 ease-out-expo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-300"
          :class="activeCategory === null ? 'bg-neon-500 text-brand-900' : 'border border-hairline bg-surface-strong/50 text-ink-muted hover:border-neon-500/30 hover:text-ink'"
          @click="selectCategory(null)"
        >
          {{ t('blog.categories.all') }}
        </button>
        <button
          v-for="cat in data.categories"
          :key="cat.slug"
          type="button"
          class="rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.12em] transition-colors duration-300 ease-out-expo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-300"
          :class="activeCategory === cat.slug ? 'bg-neon-500 text-brand-900' : 'border border-hairline bg-surface-strong/50 text-ink-muted hover:border-neon-500/30 hover:text-ink'"
          @click="selectCategory(cat.slug)"
        >
          {{ cat.title }}
        </button>
      </div>

      <label class="relative block w-full lg:w-72">
        <span class="sr-only">{{ t('blog.search.label') }}</span>
        <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
        </svg>
        <input
          v-model="search"
          type="search"
          :placeholder="t('blog.search.placeholder')"
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
      <h2 class="text-xl font-black tracking-tight text-ink md:text-2xl">{{ t('blog.states.maintenanceTitle') }}</h2>
      <p class="max-w-md text-sm leading-relaxed text-ink-muted">{{ t('blog.states.maintenanceBody') }}</p>
      <NuxtLink :to="localePath('/')" class="mt-2 inline-flex items-center gap-2 text-sm font-bold text-neon-300 hover:text-neon-100">
        {{ t('blog.states.backHome') }}
      </NuxtLink>
    </UiSpotlightCard>

    <template v-else>
      <!-- Tarjeta destacada -->
      <NuxtLink v-if="featured" :to="localePath(`/blog/${featured.slug}`)" class="mt-12 block focus-visible:outline-none">
        <UiSpotlightCard v-tilt="5" as="article" :size="720" class="group grid gap-0 overflow-hidden rounded-3xl md:grid-cols-2">
          <div class="relative aspect-[16/10] overflow-hidden bg-surface-strong/50 md:aspect-auto md:h-full">
            <img
              v-if="featuredCover(featured.cover?.url)"
              :src="featuredCover(featured.cover?.url)!"
              :alt="featured.cover?.alt || featured.title"
              width="1200"
              height="720"
              loading="eager"
              class="h-full w-full object-cover"
            >
            <div v-else class="h-full w-full bg-gradient-to-br from-brand-700 to-brand-900" aria-hidden="true" />
          </div>
          <div class="flex flex-col justify-center gap-4 p-8 md:p-10">
            <div class="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.14em]">
              <span class="rounded-full bg-neon-500/15 px-2.5 py-1 text-neon-300">{{ t('blog.featured.badge') }}</span>
              <span v-if="featured.category" class="text-ink-muted">{{ featured.category.title }}</span>
            </div>
            <h2 class="text-2xl font-black leading-[1.15] tracking-tight text-ink md:text-3xl">{{ featured.title }}</h2>
            <p v-if="featured.excerpt" class="line-clamp-3 text-sm leading-relaxed text-ink-muted md:text-base">{{ featured.excerpt }}</p>
            <div class="mt-2 flex items-center gap-3 text-xs text-ink-muted">
              <span v-if="featured.author">{{ t('blog.card.by', { name: featured.author.name }) }}</span>
              <span v-if="featured.author && featuredDate(featured.publishedAt)" class="h-1 w-1 rounded-full bg-surface-strong/50" aria-hidden="true" />
              <time v-if="featuredDate(featured.publishedAt)" :datetime="featured.publishedAt || undefined">{{ featuredDate(featured.publishedAt) }}</time>
            </div>
          </div>
        </UiSpotlightCard>
      </NuxtLink>

      <!-- Rejilla secundaria -->
      <div v-if="gridPosts.length" class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <BlogPostCard v-for="post in gridPosts" :key="post._id" v-vanish :post="post" />
      </div>

      <!-- Empty State -->
      <UiSpotlightCard v-if="isEmpty" :size="520" class="mt-12 flex flex-col items-start gap-4 rounded-2xl p-8 md:p-12">
        <h2 class="text-xl font-black tracking-tight text-ink md:text-2xl">{{ t('blog.states.emptyTitle') }}</h2>
        <p class="max-w-md text-sm leading-relaxed text-ink-muted">
          {{ search.trim() || activeCategory ? t('blog.states.emptyFiltered') : t('blog.states.emptyBody') }}
        </p>
        <button
          v-if="search.trim() || activeCategory"
          type="button"
          class="mt-1 inline-flex items-center gap-2 text-sm font-bold text-neon-300 hover:text-neon-100"
          @click="clearFilters"
        >
          {{ t('blog.states.clearFilters') }}
        </button>
      </UiSpotlightCard>

      <!-- Paginación (100% en cliente sobre la lista filtrada) -->
      <nav v-if="totalPages > 1" class="mt-14 flex items-center justify-center gap-4" :aria-label="t('blog.pager.label')">
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-surface-strong/50 px-4 py-2 text-sm font-bold text-ink transition-colors duration-300 ease-out-expo hover:border-neon-500/30 disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="page <= 1"
          @click="goToPage(page - 1)"
        >
          {{ t('blog.pager.prev') }}
        </button>
        <span class="text-xs font-bold uppercase tracking-[0.14em] text-ink-muted">
          {{ t('blog.pager.status', { current: page, total: totalPages }) }}
        </span>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-surface-strong/50 px-4 py-2 text-sm font-bold text-ink transition-colors duration-300 ease-out-expo hover:border-neon-500/30 disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="page >= totalPages"
          @click="goToPage(page + 1)"
        >
          {{ t('blog.pager.next') }}
        </button>
      </nav>
    </template>
  </div>
</template>
