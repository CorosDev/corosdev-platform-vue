<script setup lang="ts">
/**
 * Un único video de presentación para español e inglés — antes había una toma
 * por idioma, ahora el embed es el mismo sin importar el locale activo.
 *
 * `rel=0` limita los videos relacionados al final al canal de CorosDev;
 * `playsinline=1` evita que iOS abra el reproductor a pantalla completa.
 */
const { t } = useI18n()

// ID literal de YouTube (el slug que sigue a youtu.be/ o al `v=` de la URL
// larga), no la URL completa.
const VIDEO_ID = 'ipQGuaae-LM'
const embedSrc = `https://www.youtube.com/embed/${VIDEO_ID}?rel=0&playsinline=1`
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
