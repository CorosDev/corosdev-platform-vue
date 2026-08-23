<script setup lang="ts">
// Sets <html lang>/dir> and the hreflang alternate <link> tags for the
// current locale — @nuxtjs/i18n doesn't apply these on its own, it just
// exposes the composable and expects the app to feed it into useHead().
const i18nHead = useLocaleHead()
useHead(() => ({
  htmlAttrs: i18nHead.value.htmlAttrs,
  link: i18nHead.value.link,
  meta: i18nHead.value.meta,
}))
</script>

<template>
  <div
    class="flex min-h-screen flex-col overflow-x-hidden bg-transparent text-white antialiased selection:bg-neon-500 selection:text-brand-900"
  >
    <BackgroundStars />

    <AppNavbar />

    <main class="flex-1">
      <slot />
    </main>

    <AppFooter />
  </div>
</template>
