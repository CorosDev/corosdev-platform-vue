<script setup lang="ts">
/**
 * Hero de /services, realineado a la izquierda.
 *
 * El centrado anterior con `max-w-5xl` y `text-8xl` es la composición por
 * defecto de cualquier plantilla: obliga a leer en zigzag y deja el bloque
 * flotando sin eje. Alineado a la izquierda, el titular, el párrafo y los
 * CTA comparten un único borde vertical con el resto de la página.
 *
 * El CTA primario abre el drawer con contexto 'services' en lugar de mandar
 * al visitante al formulario del home: la captura ocurre sin abandonar la
 * página en la que se acaba de convencer.
 *
 * Sin `v-reveal` aquí a propósito — este bloque es el elemento LCP de la
 * ruta y su estado inicial no puede ser `opacity: 0` (ver app/plugins/reveal.ts).
 */
const { t } = useI18n()
const { open: openCtaDrawer } = useCtaDrawer()
</script>

<template>
  <section class="relative z-10 mx-auto max-w-7xl px-6 pb-16 pt-36 sm:pb-24 md:pt-44">
    <p
      class="inline-flex items-center gap-2 rounded-md border border-neon-500/25 bg-neon-500/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-neon-300"
    >
      <span class="h-1.5 w-1.5 rounded-full bg-neon-500" aria-hidden="true" />
      {{ t('services.hero.tag') }}
    </p>

    <div class="mt-8 grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12">
      <h1 class="text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl lg:col-span-7 lg:text-7xl">
        {{ t('services.hero.h1_1') }}
        <span class="gradient-text">{{ t('services.hero.h1_span') }}</span>
      </h1>
      <p class="text-base leading-relaxed text-white/55 lg:col-span-5 lg:text-lg">
        {{ t('services.hero.sub') }}
      </p>
    </div>

    <div class="mt-10 flex flex-col gap-3 sm:flex-row">
      <button
        type="button"
        class="inline-flex items-center justify-center gap-2 rounded-lg bg-neon-500 px-6 py-3.5 text-sm font-bold text-brand-900 transition-all duration-300 ease-out-expo hover:-translate-y-0.5 hover:bg-neon-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-300 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-900"
        @click="openCtaDrawer('services')"
      >
        {{ t('services.hero.cta1') }}
        <svg
          class="h-4 w-4 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2.5"
          aria-hidden="true"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </button>
      <a
        href="#methodology"
        class="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/[0.03] px-6 py-3.5 text-sm font-bold text-white transition-colors duration-300 ease-out-expo hover:border-white/30 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-300"
      >
        {{ t('services.hero.cta2') }}
      </a>
    </div>
  </section>
</template>
