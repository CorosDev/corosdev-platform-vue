<script setup lang="ts">
// Sets <html lang>/dir> and the hreflang alternate <link> tags for the
// current locale — @nuxtjs/i18n doesn't apply these on its own, it just
// exposes the composable and expects the app to feed it into useHead().
const i18nHead = useLocaleHead()
const { t } = useI18n()

// Organization JSON-LD (CLAUDE.md §3, Schema.org). Site-wide identity, so it
// lives in the layout rather than a single page — SoftwareApplication (the
// other schema CLAUDE.md calls out) is more specific to what's being
// described on a given page and is added per-page instead (see index.vue).
useHead(() => ({
  htmlAttrs: i18nHead.value.htmlAttrs,
  link: i18nHead.value.link,
  meta: i18nHead.value.meta,
  script: [
    {
      key: 'ld-organization',
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'CorosDev',
        url: 'https://corosdev.com',
        logo: 'https://corosdev.com/coros.png',
        description: t('home.seo.description'),
      }),
    },
  ],
}))
</script>

<template>
  <!-- `text-ink` es la base heredada por TODO el árbol (h1/p sin color propio
       en HeroSection.vue, por ejemplo) — sin este cambio, los tokens
       `text-ink`/`text-ink-muted` añadidos en componentes puntuales no
       bastan: cualquier elemento que dependiera del `text-ink` heredado de
       aquí seguiría blanco puro en modo claro. -->
  <div
    class="flex min-h-screen flex-col overflow-x-hidden bg-transparent text-ink antialiased selection:bg-neon-500 selection:text-brand-900"
  >
    <BackgroundStars />

    <AppNavbar />

    <main class="flex-1">
      <slot />
    </main>

    <AppFooter />

    <FloatingCtaDrawer />
    <ContactModal />
  </div>
</template>
