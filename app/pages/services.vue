<script setup lang="ts">
const { t } = useI18n()

usePageSeo({
  title: () => t('services.seo.title'),
  description: () => t('services.seo.description'),
})

/**
 * Metadata de los 3 pilares (Build/Scale/Transform, mismo vocabulario que
 * home.services). Vive aquí y no dentro de PillarSection.vue porque el
 * orden/alternancia (`reverse`) y los íconos son propios de esta página, no
 * del componente reutilizable.
 */
const pillars = [
  {
    anchorId: 'custom-software',
    pillarKey: 'customSoftware' as const,
    icon: 'M17.25 6.75 22.5 12l-5.25 5.25M6.75 6.75 1.5 12l5.25 5.25m7.5-13.5-4.5 15',
    reverse: false,
  },
  {
    anchorId: 'scaling-talent',
    pillarKey: 'scalingTalent' as const,
    icon: 'M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z',
    reverse: true,
  },
  {
    anchorId: 'tech-partnership',
    pillarKey: 'techPartnership' as const,
    icon: 'M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z',
    reverse: false,
  },
]
</script>

<template>
  <div>
    <ServicesHeroSection />
    <ServicesPillarNav />
    <ServicesPillarSection
      v-for="pillar in pillars"
      :key="pillar.anchorId"
      :anchor-id="pillar.anchorId"
      :pillar-key="pillar.pillarKey"
      :icon="pillar.icon"
      :reverse="pillar.reverse"
    />
    <ServicesMethodologySection />
    <ServicesFaqCtaSection />
  </div>
</template>
