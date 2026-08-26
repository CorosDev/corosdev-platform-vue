<script setup lang="ts">
const { t } = useI18n()

usePageSeo({
  title: () => t('partners.seo.title'),
  description: () => t('partners.seo.description'),
})
</script>

<template>
  <div>
    <PartnersHeroSection />
    <PartnersGridSection />
    <PartnersCtaSection />
  </div>
</template>
