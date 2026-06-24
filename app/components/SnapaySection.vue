<script setup>
const localeStore = useLocaleStore();
const uiStore = useUiStore();
</script>

<template>
  <!-- Reducido el padding vertical (py-4 md:py-6) para ceder el control al contenedor padre -->
  <section id="snapay-venture" class="py-4 md:py-6 relative">
    
    <!-- Envoltura de tarjeta sólida (Bento structure) para evitar que flote -->
    <div class="w-full max-w-[80rem] mx-auto px-6 relative">
      <div class="grid lg:grid-cols-12 gap-8 md:gap-12 items-center p-8 md:p-12 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-md">
        
        <!-- Visual Column: Left on Desktop (Zigzag) -->
        <!-- Cambiado order-1 a order-2 md:order-1 para que en móvil el texto vaya primero y en web haga zigzag -->
        <div class="lg:col-span-5 order-2 md:order-1 flex justify-center w-full">
          <div class="relative group w-full max-w-md">
            <div class="absolute -inset-4 bg-neon-500/10 rounded-full blur-3xl opacity-40 group-hover:opacity-100 transition-opacity duration-700"></div> 
            
            <!-- Contenedor interno del Logo oscurecido para resaltar la marca -->
            <div class="bg-black/40 p-8 rounded-2xl flex items-center justify-center relative overflow-hidden h-52 md:h-64 border border-white/5">
              <img 
                src="~/assets/snapay-logo.svg" 
                class="h-20 md:h-24 w-auto object-contain drop-shadow-glow" 
                :alt="localeStore.t('eco_snapay_name')" 
                loading="lazy" 
              />
            </div>
          </div>
        </div>

        <!-- Content Column: Right on Desktop -->
        <!-- Cambiado order-2 a order-1 md:order-2 -->
        <div class="lg:col-span-7 order-1 md:order-2">
          <span class="inline-block px-4 py-1.5 rounded-full bg-neon-500/10 border border-neon-500/20 text-neon-500 text-xs font-bold tracking-widest uppercase mb-4 md:mb-6">
            {{ localeStore.t('eco_badge') }}
          </span>
          
          <h3 class="text-3xl md:text-5xl font-black text-white mb-4 md:mb-6 leading-tight">
            {{ localeStore.t('eco_snapay_name') }}
          </h3>
          
          <p class="text-[#8aa4b7] text-lg leading-relaxed mb-6 max-w-2xl">
            {{ localeStore.t('eco_snapay_desc') }}
          </p>

          <div class="flex items-center gap-4 pt-4 border-t border-white/5">
            <div class="flex flex-col">
              <span class="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-1">
                {{ localeStore.t('eco_sector') }}
              </span>
              <span class="text-sm text-neon-500 font-black uppercase tracking-wider">
                {{ localeStore.t('eco_snapay_sector') }}
              </span>
            </div>
          </div>

          <div class="mt-8">
            <button
              type="button"
              @click="() => {
                console.log('SnapaySection: Button clicked. Calling openEarlyAccess(\'snapay\')');
                uiStore.openEarlyAccess('snapay');
              }"
              class="inline-flex items-center gap-2 text-white font-bold hover:text-neon-500 transition-colors group"
            >
              <span>{{ localeStore.t('eco_early_tester_btn') }}</span>
              <span class="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>