<script setup lang="ts">
/**
 * Hero de liderazgo. Mismo criterio que el de /services: alineado a la
 * izquierda sobre 12 columnas en vez de centrado, para que el titular y el
 * párrafo compartan eje con el resto de la página.
 *
 * Sin `v-reveal`: es el elemento LCP de la ruta (ver app/plugins/reveal.ts).
 */
const { t } = useI18n()
</script>

<template>
  <section class="relative mx-auto max-w-7xl px-6 pb-12 pt-36 md:pb-20 md:pt-44">
    <p
      class="inline-flex items-center gap-2 rounded-md border border-neon-500/25 bg-neon-500/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-neon-300"
    >
      <span class="h-1.5 w-1.5 rounded-full bg-neon-500" aria-hidden="true" />
      {{ t('about.hero.label') }}
    </p>

    <div class="mt-8 grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12">
      <h1 class="text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl lg:col-span-7 lg:text-7xl">
        {{ t('about.hero.h1_1') }}
        <span class="gradient-text">{{ t('about.hero.h1_span') }}</span>
      </h1>
      <p class="text-base leading-relaxed text-white/55 lg:col-span-5 lg:text-lg">
        {{ t('about.hero.p') }}
      </p>
    </div>
  </section>
</template>
