<script setup lang="ts">
/**
 * Tarjeta de artículo para la rejilla de `/blog`. Envuelve `UiSpotlightCard`
 * (el primitivo de panel de cristal del rediseño B2B) y enlaza al detalle
 * con la ruta ya prefijada por idioma.
 */
import type { BlogPostCard } from '~/composables/useBlog'

const props = defineProps<{ post: BlogPostCard }>()

const { locale, t } = useI18n()
const localePath = useLocalePath()

const to = computed(() => localePath(`/blog/${props.post.slug}`))

const dateLabel = computed(() => {
  if (!props.post.publishedAt) return ''
  return new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium' }).format(
    new Date(props.post.publishedAt),
  )
})

// Miniatura recortada + `auto=format` (WebP/AVIF si el navegador lo admite).
// `width`/`height` explícitos en el <img> reservan el hueco y evitan CLS.
const coverSrc = computed(() =>
  props.post.cover?.url ? `${props.post.cover.url}?w=800&h=480&fit=crop&auto=format` : null,
)
</script>

<template>
  <UiSpotlightCard as="article" class="group flex h-full flex-col overflow-hidden rounded-2xl">
    <NuxtLink :to="to" class="flex h-full flex-col focus-visible:outline-none">
      <div class="relative aspect-[5/3] overflow-hidden bg-white/[0.03]">
        <img
          v-if="coverSrc"
          :src="coverSrc"
          :alt="post.cover?.alt || post.title"
          width="800"
          height="480"
          loading="lazy"
          decoding="async"
          class="h-full w-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.03]"
        >
        <div v-else class="h-full w-full bg-gradient-to-br from-brand-700 to-brand-900" aria-hidden="true" />
      </div>

      <div class="flex flex-1 flex-col gap-3 p-6">
        <div class="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.14em]">
          <span v-if="post.category" class="text-neon-300">{{ post.category.title }}</span>
          <span v-if="post.category && dateLabel" class="h-1 w-1 rounded-full bg-white/25" aria-hidden="true" />
          <time v-if="dateLabel" :datetime="post.publishedAt || undefined" class="text-white/40">{{ dateLabel }}</time>
        </div>

        <h3 class="text-lg font-black leading-snug tracking-tight text-white transition-colors duration-300 ease-out-expo group-hover:text-neon-100">
          {{ post.title }}
        </h3>

        <p v-if="post.excerpt" class="line-clamp-3 text-sm leading-relaxed text-white/55">
          {{ post.excerpt }}
        </p>

        <div class="mt-auto flex items-center gap-2 pt-2 text-xs text-white/45">
          <span v-if="post.author">{{ t('blog.card.by', { name: post.author.name }) }}</span>
          <span class="ml-auto inline-flex items-center gap-1 font-bold text-neon-300">
            {{ t('blog.card.readMore') }}
            <svg class="h-3.5 w-3.5 transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </span>
        </div>
      </div>
    </NuxtLink>
  </UiSpotlightCard>
</template>
