<template>
  <!-- 1. El motor de estrellas y la Navbar se ejecutan solo en el cliente para evitar errores de window/localStorage -->
  <ClientOnly>
    <BackgroundStars />
  </ClientOnly>

  <ClientOnly>
    <Navbar class="relative z-50" />
  </ClientOnly>

  <!-- 2. Contenedor con overflow controlado para no tapar las estrellas -->
  <main class="app-main relative z-10">
    <NuxtPage />
  </main>
</template>

<script setup>
// En Nuxt 4, computed y useLocaleStore se auto-importan globalmente.
// Al remover las importaciones manuales evitamos colisiones en el empaquetador.

const localeStore = useLocaleStore()

useHead({
  htmlAttrs: {
    lang: computed(() => localeStore.currentLang)
  }
})
</script>

<style>
/* Estilos globales y reset del Critical Rendering Path */
html, body {
  scroll-behavior: smooth;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  background-color: transparent; /* Permitimos que el canvas de fondo sea visible */
  color: #ffffff;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow-x: hidden; /* Evita scrolls horizontales indeseados */
}

/* Aseguramos que el contenido no colapse y permita ver el fondo */
.app-main {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>