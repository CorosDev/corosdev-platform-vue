<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => t('about.seo.title'),
  description: () => t('about.seo.description'),
})
</script>

<template>
  <div>
    <AboutHeroSection />
    <AboutTeamSection />
    <AboutCtaSection />
  </div>
</template>
