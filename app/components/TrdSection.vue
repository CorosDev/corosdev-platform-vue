<script setup>
const localeStore = useLocaleStore();
const uiStore = useUiStore();
</script>

<template>
  <section id="trd-venture" class="py-4 md:py-6 relative">
    <div class="w-full max-w-[80rem] mx-auto px-6 relative">
      <div class="grid lg:grid-cols-12 gap-8 md:gap-12 items-center p-8 md:p-12 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-md">
        
        <!-- Content Column: Left on Desktop (Mobile: 1st) -->
        <div class="lg:col-span-7 order-1">
          <span class="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-widest uppercase mb-6">
            {{ localeStore.t('eco_badge') }}
          </span>
          
          <h3 class="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
            {{ localeStore.t('eco_trd_name') }}
          </h3>
          
          <p class="text-[#8aa4b7] text-lg leading-relaxed mb-8 max-w-2xl">
            {{ localeStore.t('eco_trd_desc') }}
          </p>

          <div class="flex items-center gap-4 pt-6 border-t border-white/5">
            <div class="flex flex-col">
              <span class="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-1">
                {{ localeStore.t('eco_sector') }}
              </span>
              <span class="text-sm text-blue-400 font-black uppercase tracking-wider">
                {{ localeStore.t('eco_trd_sector') }}
              </span>
            </div>
          </div>

          <div class="mt-10">
            <button 
              type="button"
              @click="() => {
                console.log('TrdSection: Button clicked. Calling openEarlyAccess(\'trd\')');
                uiStore.openEarlyAccess('trd');
              }"
              class="inline-flex items-center gap-2 text-white font-bold hover:text-blue-400 transition-colors group"
            >
              <span>{{ localeStore.t('eco_early_tester_btn') }}</span>
              <span class="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </div>

        <!-- Visual Column: Right on Desktop (Mobile: 2nd) -->
        <div class="lg:col-span-5 order-2 flex justify-center w-full">
          <div class="relative group w-full max-w-md">
            <div class="absolute -inset-4 bg-blue-500/10 rounded-full blur-3xl opacity-40 group-hover:opacity-100 transition-opacity duration-700"></div> 
            
            <!-- Contenedor interno del Logo oscurecido -->
            <div class="bg-black/40 p-8 rounded-2xl flex items-center justify-center relative overflow-hidden h-52 md:h-64 border border-white/5">
              <img 
                src="~/assets/logo-trd.svg" 
                class="max-h-20 object-contain drop-shadow-glow" 
                :alt="localeStore.t('eco_trd_name')" 
                loading="lazy" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>