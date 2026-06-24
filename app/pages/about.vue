<template>
  <div class="min-h-screen bg-[#030014] text-white flex flex-col items-center justify-center font-sans">
    <h1 class="text-3xl font-bold tracking-wider mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
      SECCIÓN EN MIGRACIÓN
    </h1>
    <p class="text-gray-400 mb-8 text-center max-w-md px-4">
      Estamos transfiriendo esta sección al motor optimizado de Nuxt 4.
    </p>
    <NuxtLink to="/" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-full transition-all text-sm font-semibold shadow-lg shadow-blue-500/20">
      Volver al Inicio
    </NuxtLink>
  </div>
</template>

<script setup>
definePageMeta({
  layout: false
})
</script>