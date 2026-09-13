<script setup lang="ts">
/**
 * /blog/[slug] — detalle de artículo.
 *
 * Tres desenlaces posibles, ninguno de ellos un 500:
 *  - artículo encontrado  → se renderiza.
 *  - slug inexistente      → `createError` 404 (página de error de Nuxt).
 *  - Sanity no responde    → `data.error` y panel de Modo Mantenimiento inline.
 */
import { estimateReadingTime } from '~/composables/useBlog'

const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()

const slug = computed(() => String(route.params.slug))

const { data } = await useBlogPost(slug)

// "No existe" (y no es una caída del backend) ⇒ 404 real, no 500.
if (!data.value.post && !data.value.error) {
  throw createError({ statusCode: 404, statusMessage: 'Article not found', fatal: true })
}

const post = computed(() => data.value.post)
const isMaintenance = computed(() => data.value.error)

const readingMinutes = computed(() => estimateReadingTime(post.value?.body))

const publishedLabel = computed(() =>
  post.value?.publishedAt
    ? new Intl.DateTimeFormat(locale.value, { dateStyle: 'long' }).format(new Date(post.value.publishedAt))
    : '',
)

const heroCover = computed(() =>
  post.value?.cover?.url ? `${post.value.cover.url}?w=1600&h=900&fit=crop&auto=format` : null,
)
const authorAvatar = computed(() =>
  post.value?.author?.image ? `${post.value.author.image}?w=96&h=96&fit=crop&auto=format` : null,
)

// --- SEO: lee del objeto `seo` de Sanity y cae a los campos del post ---
const siteUrl = useSiteConfig().url.replace(/\/$/, '')
const metaTitle = computed(() => post.value?.seo?.metaTitle || post.value?.title || t('blog.seo.title'))
const metaDescription = computed(
  () => post.value?.seo?.metaDescription || post.value?.excerpt || t('blog.seo.description'),
)
const ogImage = computed(() => {
  const src = post.value?.seo?.ogImage || post.value?.cover?.url
  return src ? `${src}?w=1200&h=630&fit=crop&auto=format` : `${siteUrl}/og-image.png`
})
const canonical = computed(() => `${siteUrl}${localePath(`/blog/${slug.value}`)}`)

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
  articlePublishedTime: () => post.value?.publishedAt || undefined,
  articleSection: () => post.value?.category?.title || undefined,
  twitterCard: 'summary_large_image',
  twitterTitle: () => metaTitle.value,
  twitterDescription: () => metaDescription.value,
  twitterImage: () => ogImage.value,
})

useHead(() => ({
  link: [{ rel: 'canonical', href: canonical.value }],
  meta: post.value?.seo?.noIndex ? [{ name: 'robots', content: 'noindex, follow' }] : [],
  script: post.value
    ? [
        {
          key: 'ld-blogposting',
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.value.title,
            description: metaDescription.value,
            image: ogImage.value,
            datePublished: post.value.publishedAt || undefined,
            dateModified: post.value.updatedAt || post.value.publishedAt || undefined,
            author: post.value.author?.name
              ? { '@type': 'Person', name: post.value.author.name }
              : undefined,
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
        <h1 class="text-xl font-black tracking-tight text-ink md:text-2xl">{{ t('blog.states.maintenanceTitle') }}</h1>
        <p class="max-w-md text-sm leading-relaxed text-ink-muted">{{ t('blog.states.maintenanceBody') }}</p>
        <NuxtLink :to="localePath('/blog')" class="mt-2 inline-flex items-center gap-2 text-sm font-bold text-neon-300 hover:text-neon-100">
          {{ t('blog.article.backToBlog') }}
        </NuxtLink>
      </UiSpotlightCard>
    </div>

    <article v-else-if="post">
      <BlogReadingProgress :label="t('blog.progress.label')" />

      <div class="mx-auto max-w-3xl px-6 pb-8 pt-36 md:pt-44">
        <!-- Cabecera -->
        <header>
          <NuxtLink :to="localePath('/blog')" class="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-ink-muted transition-colors duration-300 ease-out-expo hover:text-neon-300">
            <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
            {{ t('blog.article.backToBlog') }}
          </NuxtLink>

          <p v-if="post.category" class="mt-8 text-[11px] font-bold uppercase tracking-[0.16em] text-neon-300">
            {{ post.category.title }}
          </p>
          <h1 class="mt-3 text-3xl font-black leading-[1.1] tracking-tight text-ink sm:text-4xl lg:text-5xl">
            {{ post.title }}
          </h1>
          <p v-if="post.excerpt" class="mt-5 text-lg leading-relaxed text-ink-muted">{{ post.excerpt }}</p>

          <div class="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3 border-y border-hairline py-5 text-sm">
            <div v-if="post.author" class="flex items-center gap-3">
              <img
                v-if="authorAvatar"
                :src="authorAvatar"
                :alt="post.author.name"
                width="40"
                height="40"
                loading="lazy"
                class="h-10 w-10 rounded-full object-cover"
              >
              <span v-else class="grid h-10 w-10 place-items-center rounded-full bg-neon-500/15 text-sm font-black text-neon-300" aria-hidden="true">
                {{ post.author.name.charAt(0) }}
              </span>
              <span class="font-bold text-ink">{{ post.author.name }}</span>
              <span v-if="post.author.role" class="text-ink-muted">· {{ post.author.role }}</span>
            </div>
            <span class="ml-auto flex items-center gap-3 text-ink-muted">
              <time v-if="publishedLabel" :datetime="post.publishedAt || undefined">{{ publishedLabel }}</time>
              <span class="h-1 w-1 rounded-full bg-surface-strong/50" aria-hidden="true" />
              <span>{{ t('blog.article.readingTime', { minutes: readingMinutes }) }}</span>
            </span>
          </div>
        </header>

        <!-- Portada -->
        <img
          v-if="heroCover"
          :src="heroCover"
          :alt="post.cover?.alt || post.title"
          width="1600"
          height="900"
          loading="eager"
          class="mt-10 aspect-[16/9] w-full rounded-2xl border border-hairline object-cover"
        >

        <!-- Cuerpo -->
        <BlogPortableTextRenderer :value="post.body || []" class="mt-12" />
      </div>

      <BlogCtaSection />
    </article>
  </div>
</template>
