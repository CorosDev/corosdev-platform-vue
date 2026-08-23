<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => t('home.seo.title'),
  description: () => t('home.seo.description'),
})
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
    <HomeContactSection />
  </div>
</template>
