<template>
  <section class="relative pt-6 md:pt-12 pb-12 md:pb-20 overflow-hidden z-10">
    <div class="w-full max-w-[80rem] mx-auto px-6 relative">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        <div class="tilt transition-transform duration-100 ease-out" ref="tiltRef" style="transform-style: preserve-3d;">
          <p class="text-sm font-medium tracking-wide uppercase opacity-90 text-[#8aa4b7] mb-4" v-html="localeStore.t('hero_tag')"></p>
          <h1 class="text-4xl md:text-7xl font-black leading-[1.1] text-white mb-6" v-html="localeStore.t('hero_h1')"></h1>
          <p class="text-lg text-[#8aa4b7] max-w-xl mb-8 leading-relaxed">{{ localeStore.t('hero_sub') }}</p>
          
          <div class="flex flex-wrap gap-3">
            <a href="https://calendly.com/corosdev-info/30min" target="_blank" class="px-8 py-3 rounded-xl bg-cobalt-500 text-white font-bold drop-shadow-glow hover:scale-105 transition-transform">
              {{ localeStore.t('hero_cta1') }}
            </a>
            <NuxtLink to="/services" class="px-8 py-3 rounded-xl border border-white/10 bg-white/5 text-white font-bold hover:border-cobalt-500 hover:text-cobalt-500 transition-all">
              {{ localeStore.t('hero_cta2') }}
            </NuxtLink>
          </div>
        </div>

        <div class="flex flex-col items-center justify-center text-center relative mt-8 md:mt-0">
          <p class="tracking-[0.6em] font-black uppercase text-sm text-white opacity-80 translate-y-6 md:translate-y-12 relative z-20">
            {{ localeStore.t('hero_map') }}
          </p>
          
          <div class="w-full h-auto flex items-center justify-center relative overflow-visible mt-[-10px] md:mt-[-20px]">
            <svg viewBox="0 0 2018 2018" class="world-map-svg">
              <image :href="mapUrl" x="0" y="0" width="2018" height="2018" opacity="0.4"
                style="filter: brightness(1.2); will-change: transform, opacity;" />

              <path d="M400 840 Q 730 600 1060 820" stroke="white" stroke-width="10" fill="none" class="map-line map-line-opacity-70" />
              <path d="M350 1080 Q 370 960 400 840" stroke="white" stroke-width="8" fill="none" class="map-line map-line-opacity-50" />
              <path d="M350 1080 Q 700 950 1060 820" stroke="white" stroke-width="10" fill="none" class="map-line map-line-opacity-70" />

              <g transform="translate(400, 840)">
                <circle cx="0" cy="0" r="23" fill="white" class="drop-shadow-glow" />
                <circle cx="0" cy="0" r="23" fill="none" stroke="white" stroke-width="3" class="map-ping" />
                <text x="35" y="-15" fill="white" font-size="45" font-weight="black" opacity="0.9">{{ localeStore.t('hero_map_node_usa') }}</text>
              </g>

              <g transform="translate(350, 1080)">
                <circle cx="0" cy="0" r="23" fill="white" class="drop-shadow-glow" />
                <circle cx="0" cy="0" r="23" fill="none" stroke="white" stroke-width="3" class="map-ping" />
                <text x="45" y="10" fill="white" font-size="45" font-weight="black" opacity="0.9">{{ localeStore.t('hero_map_node_latam') }}</text>
              </g>

              <g transform="translate(1060, 820)">
                <circle cx="0" cy="0" r="23" fill="white" class="drop-shadow-glow" />
                <circle cx="0" cy="0" r="23" fill="none" stroke="white" stroke-width="3" class="map-ping" />
                <text x="35" y="-15" fill="white" font-size="45" font-weight="black" opacity="0.9">{{ localeStore.t('hero_map_node_europe') }}</text>
              </g>
            </svg>
          </div>
        </div>
        
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import mapUrl from '~/assets/mapa mundi.svg'

const localeStore = useLocaleStore();

const tiltRef = ref(null)
let isTicking = false
let rect = null

const handleMouseEnter = () => {
  if (tiltRef.value) {
    rect = tiltRef.value.getBoundingClientRect();
  }
}

const handleMouseMove = (e) => {
  const tiltElement = tiltRef.value
  if (!tiltElement || !rect) return

  const { clientX, clientY } = e
  const { left, top, width, height } = rect
  
  const x = (clientX - left) / width - 0.5
  const y = (clientY - top) / height - 0.5
  
  if (isTicking) return
  
  isTicking = true
  requestAnimationFrame(() => {
    tiltElement.style.transform = `perspective(1000px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`
    isTicking = false
  })
}

const handleMouseLeave = () => {
  const tiltElement = tiltRef.value
  if (!tiltElement) return

  rect = null;
  requestAnimationFrame(() => {
    tiltElement.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)'
  })
}

onMounted(() => {
  if (tiltRef.value) {
    tiltRef.value.addEventListener('mouseenter', handleMouseEnter)
    tiltRef.value.addEventListener('mousemove', handleMouseMove)
    tiltRef.value.addEventListener('mouseleave', handleMouseLeave)
  }
})

onUnmounted(() => {
  if (tiltRef.value) {
    tiltRef.value.removeEventListener('mouseenter', handleMouseEnter)
    tiltRef.value.removeEventListener('mousemove', handleMouseMove)
    tiltRef.value.removeEventListener('mouseleave', handleMouseLeave)
  }
})
</script>

<style scoped>
.world-map-svg {
  width: 100%;
  height: 100%;
}

.map-line {
  stroke-dasharray: 8;
  stroke-dashoffset: 100;
  animation: dash 3s linear infinite;
}

/* Solución del sandbox SVG: Forzar el cálculo del origen sobre la caja del elemento */
.map-ping {
  transform-box: fill-box;
  transform-origin: center;
  animation: spatial-pulse 2s cubic-bezier(0.25, 0, 0, 1) infinite;
}

@keyframes dash {
  to { stroke-dashoffset: 0; }
}

/* Evolución Técnica: Animamos la matriz de transformación física en lugar de la geometría.
  Un scale(2.6) sobre el radio original de 23px nos da exactamente los 60px que buscabas,
  pero procesados limpiamente por la GPU.
*/
@keyframes spatial-pulse {
  0% { 
    transform: scale(1);
    opacity: 1; 
    stroke-width: 3;
  }
  100% { 
    transform: scale(2.6);
    opacity: 0; 
    stroke-width: 0.5;
  }
}
</style>