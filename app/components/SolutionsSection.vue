<template>
  <section class="solutions-section py-20 px-6 relative overflow-hidden">
    <div class="max-w-[80rem] mx-auto relative z-10">
      
      <!-- Cabecera de la Sección -->
      <div class="text-center mb-16">
        <h2 
          class="text-4xl md:text-6xl font-black text-white mb-6 leading-tight" 
          v-html="localeStore.t('sol_title')"
        ></h2>
        <p class="text-xl text-[#8aa4b7] max-w-2xl mx-auto">
          {{ localeStore.t('sol_subtitle') }}
        </p>
      </div>

      <!-- Grid de Soluciones -->
      <div class="grid md:grid-cols-3 gap-8">
        
        <!-- Card 1: MVP -->
        <div class="glass p-8 rounded-[2rem] border border-white/10 flex flex-col h-full transition-all hover:border-cobalt-500/50 group/card">
          <span class="inline-block px-3 py-1 rounded-full bg-cobalt-500/10 border border-cobalt-500/20 text-cobalt-500 text-[10px] font-bold uppercase tracking-widest mb-6 w-fit">
            {{ localeStore.t('sol_badge_gtm') }}
          </span>
          <h3 class="text-2xl font-bold text-white mb-4">
            {{ localeStore.t('sol_card1_title') }}
          </h3>
          <p class="text-[#8aa4b7] leading-relaxed mb-8 flex-grow">
            {{ localeStore.t('sol_card1_desc') }}
          </p>
          <button class="text-white font-bold hover:text-cobalt-500 transition-colors flex items-center gap-2 group/btn w-fit">
            <span>{{ localeStore.t('sol_card1_cta') }}</span>
            <span class="group-hover/btn:translate-x-1 transition-transform">→</span>
          </button>
        </div>

        <!-- Card 2: Growth -->
        <div class="glass p-8 rounded-[2rem] border border-white/10 flex flex-col h-full transition-all hover:border-cobalt-500/50 group/card">
          <span class="inline-block px-3 py-1 rounded-full bg-cobalt-500/10 border border-cobalt-500/20 text-cobalt-500 text-[10px] font-bold uppercase tracking-widest mb-6 w-fit">
            {{ localeStore.t('sol_badge_scale') }}
          </span>
          <h3 class="text-2xl font-bold text-white mb-4">
            {{ localeStore.t('sol_card2_title') }}
          </h3>
          <p class="text-[#8aa4b7] leading-relaxed mb-8 flex-grow">
            {{ localeStore.t('sol_card2_desc') }}
          </p>
          <button class="text-white font-bold hover:text-cobalt-500 transition-colors flex items-center gap-2 group/btn w-fit">
            <span>{{ localeStore.t('sol_card2_cta') }}</span>
            <span class="group-hover/btn:translate-x-1 transition-transform">→</span>
          </button>
        </div>

        <!-- Card 3: Automation -->
        <div class="glass p-8 rounded-[2rem] border border-white/10 flex flex-col h-full transition-all hover:border-cobalt-500/50 group/card">
          <span class="inline-block px-3 py-1 rounded-full bg-cobalt-500/10 border border-cobalt-500/20 text-cobalt-500 text-[10px] font-bold uppercase tracking-widest mb-6 w-fit">
            {{ localeStore.t('sol_badge_ops') }}
          </span>
          <h3 class="text-2xl font-bold text-white mb-4">
            {{ localeStore.t('sol_card3_title') }}
          </h3>
          <p class="text-[#8aa4b7] leading-relaxed mb-8 flex-grow">
            {{ localeStore.t('sol_card3_desc') }}
          </p>
          <button class="text-white font-bold hover:text-cobalt-500 transition-colors flex items-center gap-2 group/btn w-fit">
            <span>{{ localeStore.t('sol_card3_cta') }}</span>
            <span class="group-hover/btn:translate-x-1 transition-transform">→</span>
          </button>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup>
// Gracias a la configuración de Nuxt 4, useLocaleStore se auto-importa globalmente.
const localeStore = useLocaleStore()
</script>