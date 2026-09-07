<script setup lang="ts">
const { t } = useI18n()

usePageSeo({
  title: () => t('home.seo.title'),
  description: () => t('home.seo.description'),
})

// SoftwareApplication JSON-LD (CLAUDE.md §3, Schema.org) — the Organization
// schema lives in app/layouts/default.vue since it's site-wide; this one
// describes the CorosDev platform itself, so it belongs on the homepage
// where that platform is actually presented.
useHead(() => ({
  script: [
    {
      key: 'ld-software-application',
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'CorosDev',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        description: t('home.seo.description'),
        url: 'https://corosdev.com',
      }),
    },
  ],
}))
</script>

<template>
  <div>
    <HomeHeroSection />
    <HomePresentationVideoSection />
    <HomeMissionSection />
    <HomeEcosystemSection />
    <HomeSnapaySpotlightSection />
    <HomeSolutionsSection />
    <HomeTestimonialsSection />
    <HomeRecognitionSection />
    <HomeContactSection />
  </div>
</template>
