<script setup>
const localeStore = useLocaleStore();

const isVideoLoaded = ref(false);

// ID rescatado de los archivos antiguos: TU_ID_DE_VIDEO 
// (Nota: Asegúrate de reemplazar 'TU_ID_DE_VIDEO' por el ID real de YouTube de CorosDev)
const loadVideo = () => {
  isVideoLoaded.value = true;
};
</script>

<template>
  <section id="methodology-video" class="py-12 md:py-24 relative overflow-hidden">
    <!-- Contenedor Estándar Pixel-Perfect Obligatorio -->
    <div class="w-full max-w-[80rem] mx-auto px-6 relative flex flex-col items-center text-center">
      
      <div class="mb-10 md:mb-14">
        <h2 class="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight mb-4" 
            v-html="localeStore.t('video_title')"> 
        </h2>
        <p class="text-white/50 text-base md:text-lg max-w-2xl leading-relaxed mx-auto"> 
          {{ localeStore.t('video_desc') }} 
        </p>
      </div>

      <!-- Contenedor del Iframe con Lazy Loading / Facade -->
      <div class="w-full max-w-[64rem] aspect-video glass border border-white/10 rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(31,127,255,0.15)] bg-black/60 relative group">
        
        <!-- Fachada Estática: Se muestra antes de cargar el video -->
        <button 
            v-if="!isVideoLoaded" 
            @click="loadVideo"
            class="absolute inset-0 w-full h-full block focus:outline-none overflow-hidden group/btn"
            aria-label="Reproducir video de metodología"
        >
          <!-- Imagen de Poster (YouTube) -->
          <img 
            src="https://img.youtube.com/vi/haRpSox-c1Q/maxresdefault.jpg" 
            alt="Conoce CorosDev" 
            loading="lazy"
            class="w-full h-full object-cover opacity-60 group-hover/btn:scale-105 transition-transform duration-700 ease-out"
          />
          
          <!-- Overlay de gradiente -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

          <!-- Botón de Play Central -->
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="w-20 h-20 md:w-24 md:h-24 rounded-full bg-neon-500 text-black flex items-center justify-center shadow-[0_0_30px_rgba(31,127,255,0.4)] transition-all duration-500 group-hover/btn:scale-110 group-hover/btn:shadow-[0_0_50px_rgba(31,127,255,0.6)]">
              <svg class="w-8 h-8 md:w-10 md:h-10 fill-current translate-x-0.5" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </button>
        
        <!-- Iframe optimizado sin atributos duplicados -->
        <iframe
          v-else
          src="https://www.youtube.com/embed/haRpSox-c1Q?autoplay=1&rel=0&modestbranding=1" 
          title="Conoce CorosDev | Software, Marketing Digital y Soluciones"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
          class="w-full h-full"
        ></iframe> 

      </div>

    </div>
  </section>
</template>

<style scoped>
/* Animación nativa simple sin prefijos redundantes */
iframe { 
  animation: videoFadeIn 0.6s ease-out forwards; 
} 

@keyframes videoFadeIn { 
  from { opacity: 0; transform: scale(0.98); } 
  to { opacity: 1; } 
} 
</style>