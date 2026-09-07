<script setup lang="ts">
const { t } = useI18n()

usePageSeo({
  title: () => t('about.seo.title'),
  description: () => t('about.seo.description'),
})
</script>

<template>
  <div>
    <AboutHeroSection />
    <AboutTeamSection />
    <!-- Misma sección que cierra el argumento de autoridad en el home. Es
         autocontenida y sin estado, así que montarla en las dos vistas no
         duplica lógica: aquí acompaña al bloque de liderazgo, allí actúa
         como prueba social justo antes del CTA. -->
    <HomeRecognitionSection />
    <AboutCtaSection />
  </div>
</template>
