<template>
  <section id="solutions" class="py-12 md:py-24 relative overflow-hidden">
    <div class="mx-auto max-w-7xl px-6 relative">
      <div class="mb-8 md:mb-16">
        <h2 class="text-4xl md:text-6xl font-black text-white" v-html="localeStore.t('sol_title')"></h2>
        <p class="mt-4 text-white/50 text-lg" v-html="localeStore.t('sol_subtitle')"></p>
      </div>

      <div class="mt-6 md:mt-10 grid md:grid-cols-3 gap-5 md:gap-8">
        <div v-for="(card, index) in solutionCards" :key="index" class="group relative">
          <div class="glass p-8 rounded-3xl soft relative h-full border border-white/5 hover:border-neon-500/50 transition-all duration-500 overflow-hidden flex flex-col">
            
            <div class="absolute bottom-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
              <svg class="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="0.5">
                <path :d="card.iconPath" />
              </svg>
            </div>

            <div class="text-[10px] tracking-widest text-neon-500 font-bold uppercase mb-4 opacity-60">
              {{ localeStore.t(card.badgeKey) }}
            </div>
            
            <h3 class="text-3xl font-black text-white mb-4 group-hover:gradient-text transition-colors min-h-[80px] flex items-center">
              {{ localeStore.t(card.titleKey) }}
            </h3>
            
            <p class="text-white/60 leading-relaxed mb-8 min-h-[120px]">
              {{ localeStore.t(card.descKey) }}
            </p>

            <div class="mt-auto">
              <button 
                @click.prevent="handleCardClick(card.id)" 
                class="inline-flex items-center gap-2 text-cobalt-300 font-bold group-hover:text-neon-500 transition-colors cursor-pointer"
              >
                <span>{{ localeStore.t(card.ctaKey) }}</span>
                <span class="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
// En Nuxt 4, useLocaleStore y useUiStore se auto-importan globalmente desde /stores. 
// Eliminamos las importaciones manuales para evitar colisiones en el motor de Vite.

const localeStore = useLocaleStore()
const uiStore = useUiStore()

const handleCardClick = (productId) => {
  // Setea el producto para el formulario del pie
  uiStore.selectedProduct = productId;
  
  // Ejecuta el scroll suave hacia la sección de contacto de forma segura en el cliente
  if (import.meta.client) {
    const target = document.getElementById('contact');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
};

const solutionCards = [
  {
    badgeKey: 'sol_badge_gtm',
    titleKey: 'sol_card1_title',
    descKey: 'sol_card1_desc',
    ctaKey: 'sol_card1_cta',
    id: 'mvp',
    iconPath: 'M13 10V3L4 14h7v7l9-11h-7z'
  },
  {
    badgeKey: 'sol_badge_scale',
    titleKey: 'sol_card2_title',
    descKey: 'sol_card2_desc',
    ctaKey: 'sol_card2_cta',
    id: 'scaling',
    iconPath: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
  },
  {
    badgeKey: 'sol_badge_ops',
    titleKey: 'sol_card3_title',
    descKey: 'sol_card3_desc',
    ctaKey: 'sol_card3_cta',
    id: 'ops',
    iconPath: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
  }
]
</script>

<style scoped>
/* Optimizaciones para asegurar un renderizado fluido a 60fps sin tirones (janks) */
.glass {
  will-change: transform, border-color, box-shadow;
  backface-visibility: hidden;
  transform: translateZ(0);
}
</style>