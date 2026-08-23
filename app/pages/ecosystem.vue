<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => t('ecosystem.seo.title'),
  description: () => t('ecosystem.seo.description'),
})
</script>

<template>
  <div>
    <EcosystemHeroSection />
    <EcosystemVenturesSection />
    <EcosystemCtaSection />
  </div>
</template>
