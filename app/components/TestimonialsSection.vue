<template>
  <section class="testimonials-section py-20 px-6 relative overflow-hidden">
    <div class="max-w-[80rem] mx-auto relative z-10">
      
      <!-- Cabecera de la Sección -->
      <div class="text-center mb-16">
        <h2 
          class="text-4xl md:text-6xl font-black text-white mb-6 leading-tight" 
          v-html="localeStore.t('testi_h2')"
        ></h2>
        <p class="text-xl text-[#8aa4b7] max-w-3xl mx-auto">
          {{ localeStore.t('testi_sub') }}
        </p>
      </div>

      <!-- Grid de Testimonios -->
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <!-- Iteramos sobre los 6 testimonios definidos en el store -->
        <div 
          v-for="i in 6" 
          :key="i" 
          class="glass p-8 rounded-[2rem] border border-white/10 flex flex-col h-full transition-all hover:border-cobalt-500/50 group/card"
        >
          <!-- Icono de comillas decorativo -->
          <div class="mb-6 text-cobalt-500/30">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H16.017C15.4647 8 15.017 8.44772 15.017 9V12C15.017 12.5523 14.5693 13 14.017 13H11.017V21H14.017ZM5.017 21L5.017 18C5.017 16.8954 5.91243 16 7.017 16H10.017C10.5693 16 11.017 15.5523 11.017 15V9C11.017 8.44772 10.5693 8 10.017 8H7.017C6.46472 8 6.017 8.44772 6.017 9V12C6.017 12.5523 5.5693 13 5.017 13H2.017V21H5.017Z" />
            </svg>
          </div>

          <p class="text-[#8aa4b7] leading-relaxed italic flex-grow">
            "{{ localeStore.t(`testi_card${i}`) }}"
          </p>
          
          <!-- Separador sutil -->
          <div class="mt-8 pt-6 border-t border-white/5 text-right">
            <span class="text-xs font-bold uppercase tracking-widest text-white/20">Verified Client</span>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup>
// Gracias a la configuración de Nuxt 4, useLocaleStore se auto-importa globalmente.
const localeStore = useLocaleStore()
</script>