<script setup lang="ts">
/**
 * /portfolio/[slug] — detalle de caso de éxito.
 *
 * Tres desenlaces posibles, ninguno de ellos un 500:
 *  - caso encontrado     → se renderiza.
 *  - slug inexistente     → `createError` 404 (página de error de Nuxt).
 *  - Sanity no responde   → `data.error` y panel de Modo Mantenimiento inline.
 */
const route = useRoute()
const { t } = useI18n()
const localePath = useLocalePath()
const { open: openCtaDrawer } = useCtaDrawer()

const slug = computed(() => String(route.params.slug))

const { data } = await useCaseStudy(slug)

// "No existe" (y no es una caída del backend) ⇒ 404 real, no 500.
if (!data.value.caseStudy && !data.value.error) {
  throw createError({ statusCode: 404, statusMessage: 'Case study not found', fatal: true })
}

const caseStudy = computed(() => data.value.caseStudy)
const isMaintenance = computed(() => data.value.error)

const heroImage = computed(() =>
  caseStudy.value?.hero?.url ? `${caseStudy.value.hero.url}?w=1600&h=900&fit=crop&auto=format` : null,
)

// --- SEO: lee del objeto `seo` de Sanity y cae a los campos del caso ---
const siteUrl = useSiteConfig().url.replace(/\/$/, '')
const metaTitle = computed(
  () => caseStudy.value?.seo?.metaTitle || caseStudy.value?.title || t('portfolio.seo.title'),
)
const metaDescription = computed(
  () => caseStudy.value?.seo?.metaDescription || caseStudy.value?.summary || t('portfolio.seo.description'),
)
const ogImage = computed(() => {
  const src = caseStudy.value?.seo?.ogImage || caseStudy.value?.hero?.url
  return src ? `${src}?w=1200&h=630&fit=crop&auto=format` : `${siteUrl}/og-image.png`
})
const canonical = computed(() => `${siteUrl}${localePath(`/portfolio/${slug.value}`)}`)

useSeoMeta({
  title: () => metaTitle.value,
  description: () => metaDescription.value,
  ogTitle: () => metaTitle.value,
  ogDescription: () => metaDescription.value,
  ogType: 'article',
  ogSiteName: 'CorosDev',
  ogImage: () => ogImage.value,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogUrl: () => canonical.value,
  articlePublishedTime: () => caseStudy.value?.publishedAt || undefined,
  articleSection: () => caseStudy.value?.industry || undefined,
  twitterCard: 'summary_large_image',
  twitterTitle: () => metaTitle.value,
  twitterDescription: () => metaDescription.value,
  twitterImage: () => ogImage.value,
})

useHead(() => ({
  link: [{ rel: 'canonical', href: canonical.value }],
  meta: caseStudy.value?.seo?.noIndex ? [{ name: 'robots', content: 'noindex, follow' }] : [],
  script: caseStudy.value
    ? [
        {
          key: 'ld-casestudy',
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: caseStudy.value.title,
            description: metaDescription.value,
            image: ogImage.value,
            datePublished: caseStudy.value.publishedAt || undefined,
            articleSection: caseStudy.value.industry || undefined,
            about: caseStudy.value.client
              ? { '@type': 'Organization', name: caseStudy.value.client }
              : undefined,
            author: { '@type': 'Organization', name: 'CorosDev' },
            publisher: {
              '@type': 'Organization',
              name: 'CorosDev',
              logo: { '@type': 'ImageObject', url: `${siteUrl}/coros.png` },
            },
            mainEntityOfPage: canonical.value,
          }),
        },
      ]
    : [],
}))
</script>

<template>
  <div>
    <!-- Modo Mantenimiento (Sanity caído / mal configurado) -->
    <div v-if="isMaintenance" class="mx-auto max-w-3xl px-6 pb-24 pt-36 md:pt-44">
      <UiSpotlightCard :size="560" class="flex flex-col items-start gap-4 rounded-2xl p-8 md:p-12">
        <h1 class="text-xl font-black tracking-tight text-white md:text-2xl">{{ t('portfolio.states.maintenanceTitle') }}</h1>
        <p class="max-w-md text-sm leading-relaxed text-white/55">{{ t('portfolio.states.maintenanceBody') }}</p>
        <NuxtLink :to="localePath('/portfolio')" class="mt-2 inline-flex items-center gap-2 text-sm font-bold text-neon-300 hover:text-neon-100">
          {{ t('portfolio.detail.backToPortfolio') }}
        </NuxtLink>
      </UiSpotlightCard>
    </div>

    <article v-else-if="caseStudy">
      <div class="mx-auto max-w-3xl px-6 pb-8 pt-36 md:pt-44">
        <!-- Cabecera -->
        <header>
          <NuxtLink :to="localePath('/portfolio')" class="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-white/45 transition-colors duration-300 ease-out-expo hover:text-neon-300">
            <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
            {{ t('portfolio.detail.backToPortfolio') }}
          </NuxtLink>

          <div class="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] font-bold uppercase tracking-[0.16em]">
            <span class="text-neon-300">{{ caseStudy.client }}</span>
            <span v-if="caseStudy.industry" class="h-1 w-1 rounded-full bg-white/25" aria-hidden="true" />
            <span v-if="caseStudy.industry" class="text-white/45">{{ caseStudy.industry }}</span>
          </div>

          <h1 class="mt-3 text-3xl font-black leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-5xl">
            {{ caseStudy.title }}
          </h1>
          <p v-if="caseStudy.summary" class="mt-5 text-lg leading-relaxed text-white/55">{{ caseStudy.summary }}</p>
        </header>

        <!-- Portada -->
        <img
          v-if="heroImage"
          :src="heroImage"
          :alt="caseStudy.hero?.alt || caseStudy.title"
          width="1600"
          height="900"
          loading="eager"
          class="mt-10 aspect-[16/9] w-full rounded-2xl border border-white/10 object-cover"
        >

        <!-- Métricas clave -->
        <section v-if="caseStudy.keyMetrics && caseStudy.keyMetrics.length" class="mt-12">
          <h2 class="mb-5 text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">
            {{ t('portfolio.detail.metricsTitle') }}
          </h2>
          <PortfolioMetricsGrid :metrics="caseStudy.keyMetrics" />
        </section>

        <!-- Cuerpo -->
        <BlogPortableTextRenderer :value="caseStudy.body || []" class="mt-12" />

        <!-- Tecnologías -->
        <section v-if="caseStudy.technologies && caseStudy.technologies.length" class="mt-12 border-t border-white/10 pt-8">
          <h2 class="mb-4 text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">
            {{ t('portfolio.detail.technologiesTitle') }}
          </h2>
          <ul class="flex flex-wrap gap-2">
            <li
              v-for="(tech, i) in caseStudy.technologies"
              :key="`${tech.label}-${i}`"
              class="rounded-full border border-white/15 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-white/70"
            >
              {{ tech.label }}
            </li>
          </ul>
        </section>
      </div>

      <!-- CTA de cierre → drawer con contexto 'services' -->
      <section class="relative overflow-hidden py-12 md:py-20">
        <div class="mx-auto max-w-3xl px-6">
          <UiSpotlightCard v-reveal :size="560" class="flex flex-col items-start gap-6 rounded-2xl p-8 md:p-10">
            <h2 class="text-2xl font-black leading-[1.15] tracking-tight text-white md:text-3xl">
              {{ t('portfolio.cta.title_1') }} <span class="gradient-text">{{ t('portfolio.cta.title_span') }}</span>
            </h2>
            <p class="max-w-lg text-base leading-relaxed text-white/55">{{ t('portfolio.cta.body') }}</p>
            <button
              type="button"
              class="inline-flex shrink-0 items-center gap-2 rounded-lg bg-neon-500 px-6 py-3.5 text-sm font-bold text-brand-900 transition-all duration-300 ease-out-expo hover:-translate-y-0.5 hover:bg-neon-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-300 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-900"
              @click="openCtaDrawer('services')"
            >
              {{ t('portfolio.cta.button') }}
              <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </UiSpotlightCard>
        </div>
      </section>
    </article>
  </div>
</template>
