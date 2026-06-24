<template>
  <section class="ecosystem-section py-20 px-6 relative overflow-hidden">
    <div class="max-w-[80rem] mx-auto relative z-10">
      
      <!-- Cabecera de la Sección -->
      <div class="text-center mb-16">
        <span class="inline-block px-4 py-1.5 rounded-full bg-cobalt-500/10 border border-cobalt-500/20 text-cobalt-500 text-xs font-bold tracking-widest uppercase mb-4 md:mb-6">
          {{ localeStore.t('eco_label') }}
        </span>
        <h2 
          class="text-4xl md:text-6xl font-black text-white mb-6 leading-tight" 
          v-html="localeStore.t('eco_title')"
        ></h2>
        <p class="text-xl text-[#8aa4b7] max-w-3xl mx-auto">
          {{ localeStore.t('eco_subtitle') }}
        </p>
      </div>

      <!-- Grid de Ventures (TRD, Snapay, Vorzana) -->
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        
        <!-- Card 1: Accesorios TRD -->
        <div class="glass p-8 rounded-[2rem] border border-white/10 flex flex-col h-full transition-all hover:border-cobalt-500/50 group/card">
          <div class="flex items-center gap-4 mb-6">
            <img 
              src="~/assets/logo-trd.svg" 
              :alt="localeStore.t('eco_trd_name')" 
              class="h-12 w-auto object-contain" 
              loading="lazy"
            />
            <h3 class="text-2xl font-bold text-white">{{ localeStore.t('eco_trd_name') }}</h3>
          </div>
          <p class="text-[#8aa4b7] leading-relaxed mb-8 flex-grow">
            {{ localeStore.t('eco_trd_desc') }}
          </p>
          <div class="pt-6 border-t border-white/5">
            <span class="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-1 block">
              {{ localeStore.t('eco_sector') }}
            </span>
            <span class="text-sm text-cobalt-500 font-black uppercase tracking-wider">
              {{ localeStore.t('eco_trd_sector') }}
            </span>
          </div>
        </div>

        <!-- Card 2: Snapay (Componente ya existente) -->
        <SnapayShowcaseSection />

        <!-- Card 3: Vorzana (Componente ya existente) -->
        <VorzanaSection />

      </div>

      <!-- Call to Action Inferior -->
      <div class="text-center">
        <p class="text-xl text-[#8aa4b7] max-w-3xl mx-auto mb-8">
          {{ localeStore.t('eco_cta') }}
        </p>
        <div class="flex flex-wrap justify-center gap-4">
          <a 
            href="https://calendly.com/corosdev-info/30min" 
            target="_blank" 
            class="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-cobalt-500 text-white font-bold drop-shadow-glow hover:scale-105 transition-transform"
          >
            <span>{{ localeStore.t('eco_cta_link') }}</span>
            <span class="text-base">&rarr;</span>
          </a>
          <button 
            type="button"
            @click="localeStore.t('eco_early_tester_btn')"
            class="inline-flex items-center gap-2 px-8 py-3 rounded-xl border border-white/10 bg-white/5 text-white font-bold hover:border-cobalt-500 hover:text-cobalt-500 transition-all"
          >
            <span>{{ localeStore.t('eco_early_tester_btn') }}</span>
            <span class="text-base">&rarr;</span>
          </button>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup>
// No se requieren imports manuales. Nuxt 4 resuelve useLocaleStore desde '~~/stores'.
const localeStore = useLocaleStore()
</script>