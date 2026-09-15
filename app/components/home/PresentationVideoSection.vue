<script setup lang="ts">
/**
 * Dos grabaciones separadas del mismo video de presentación — una en
 * español, otra en inglés (sin subtítulos/doblaje, son tomas distintas) —
 * así que el embed tiene que seguir el idioma ACTIVO del sitio en vez de
 * mostrar siempre el mismo id. Pedido explícito del usuario tras notar que
 * el sitio en inglés seguía mostrando la versión en español.
 *
 * `:key="videoId"` en el `<iframe>` de abajo fuerza a Vue a remontarlo (no
 * sólo mutar el atributo `src`) al cambiar de idioma — con un simple cambio
 * de `src` el navegador SÍ navega el iframe al nuevo video, pero forzar el
 * remount es más robusto ante cualquier estado interno que el reproductor
 * de YouTube pudiera retener entre navegaciones.
 */
const { t, locale } = useI18n()

// IDs literales de YouTube (el slug que sigue a youtu.be/ o al `v=` de la
// URL larga), no la URL completa.
const VIDEO_IDS: Record<string, string> = {
  es: 'haRpSox-c1Q',
  en: 'zK5vJHY2xec',
}

const videoId = computed(() => VIDEO_IDS[locale.value] ?? VIDEO_IDS.es)
const embedSrc = computed(() => `https://www.youtube.com/embed/${videoId.value}`)
</script>

<template>
  <section id="presentation" class="relative overflow-hidden py-12 md:py-20">
    <div class="mx-auto max-w-5xl px-6">
      <div class="mb-8 text-center md:mb-12">
        <h2 class="text-3xl font-black text-ink md:text-5xl">
          {{ t('home.presentation.title_1') }}
          <span class="gradient-text">{{ t('home.presentation.title_span') }}</span>
        </h2>
        <p class="mx-auto mt-4 max-w-2xl text-base text-ink-muted md:text-lg">
          {{ t('home.presentation.desc') }}
        </p>
      </div>

      <div
        class="glass group relative mx-auto max-w-3xl rounded-[2rem] border border-hairline p-3 shadow-[0_0_50px_rgba(31,127,255,0.15)] transition-all duration-700 ease-out hover:-translate-y-1 hover:border-neon-500/30 hover:shadow-[0_0_60px_rgba(31,127,255,0.25)]"
      >
        <div class="relative aspect-video w-full overflow-hidden rounded-[1.5rem] border border-hairline bg-brand-900">
          <iframe
            :key="videoId"
            class="absolute inset-0 h-full w-full"
            :src="embedSrc"
            title="CorosDev Presentation Video"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen
          />
        </div>
      </div>
    </div>
  </section>
</template>
