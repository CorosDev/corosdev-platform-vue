<template>
  <section class="mission-section py-20 px-6">
    <div class="max-w-7xl mx-auto">
      <h2 class="text-4xl font-bold mb-8" v-html="localeStore.t('mission_h2')"></h2>
      <p class="text-xl text-gray-300 mb-12 max-w-3xl">
        {{ localeStore.t('mission_p') }}
      </p>

      <div class="grid md:grid-cols-3 gap-8">
        <!-- Bloque 1 -->
        <div class="mission-card glass p-8 rounded-2xl">
          <h3 class="text-2xl font-semibold mb-4">{{ localeStore.t('mission_b1_h') }}</h3>
          <p class="text-gray-400">{{ localeStore.t('mission_b1_p') }}</p>
        </div>
        
        <!-- Bloque 2 -->
        <div class="mission-card glass p-8 rounded-2xl">
          <h3 class="text-2xl font-semibold mb-4">{{ localeStore.t('mission_b2_h') }}</h3>
          <p class="text-gray-400">{{ localeStore.t('mission_b2_p') }}</p>
        </div>

        <!-- Bloque 3 -->
        <div class="mission-card glass p-8 rounded-2xl">
          <h3 class="text-2xl font-semibold mb-4">{{ localeStore.t('mission_b3_h') }}</h3>
          <p class="text-gray-400">{{ localeStore.t('mission_b3_p') }}</p>
        </div>
      </div>

      <div class="mt-12">
        <NuxtLink to="/about" class="btn-primary">
          {{ localeStore.t('mission_btn') }}
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup>
// Auto-importado por Nuxt 4 desde /stores/localeStore.js
const localeStore = useLocaleStore()
</script>