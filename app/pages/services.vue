<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => t('services.seo.title'),
  description: () => t('services.seo.description'),
})
</script>

<template>
  <div>
    <ServicesHeroSection />
    <ServicesMethodologySection />
    <ServicesEngagementsSection />
  </div>
</template>
