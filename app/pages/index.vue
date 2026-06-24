<template>
  <div>
    <ClientOnly>
      <HeroSection />
      <MissionSection />
      <SolutionsSection />
      <TestimonialsSection />
      <EcosystemSection />
      
      <div id="contact">
        <ContactFormSection />
      </div>
      
      <FooterSection />
    </ClientOnly>
  </div>
</template>

<script setup>
// useLocaleStore se auto-importa globalmente en Nuxt 4.
const localeStore = useLocaleStore()

// SEO Dinámico y Reactivo usando funciones flecha para que cambie de idioma al vuelo
useSeoMeta({
  title: () => localeStore.t('meta_title') || 'CorosDev - AI Driven Company',
  description: () => localeStore.t('meta_description') || 'Construyendo el Software del Mañana, Hoy.'
})
</script>