<template>
  <footer class="bg-black/20 py-8 px-6 border-t border-white/5 relative z-10">
    <div class="max-w-[80rem] mx-auto text-center text-sm text-white/50">
      <p>
        {{ localeStore.t('footer_copy') }}
      </p>
      <!-- 
        Aquí podrías añadir enlaces a políticas de privacidad, términos de servicio, etc.
        Ejemplo:
        <div class="mt-4 flex justify-center gap-4">
          <NuxtLink to="/privacy" class="hover:text-white/70 transition-colors">Privacy Policy</NuxtLink>
          <NuxtLink to="/terms" class="hover:text-white/70 transition-colors">Terms of Service</NuxtLink>
        </div>
      -->
    </div>
  </footer>
</template>

<script setup>
// Nuxt 4 auto-importa useLocaleStore globalmente.
const localeStore = useLocaleStore()
</script>

<style scoped>
/* Puedes añadir estilos específicos del footer aquí si es necesario */
</style>