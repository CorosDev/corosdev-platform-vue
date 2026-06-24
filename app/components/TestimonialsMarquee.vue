<template>
  <section id="testimonials" class="py-12 md:py-24 relative overflow-hidden">
    <div class="mx-auto max-w-7xl px-6 relative mb-8 md:mb-16">
      <h2 class="text-4xl md:text-6xl font-black text-white" v-html="localeStore.t('testi_h2')"></h2>
      <p class="mt-4 text-white/50 text-lg max-w-2xl" v-html="localeStore.t('testi_sub')"></p>
    </div>

    <div class="marquee-mask flex overflow-hidden w-full">
      
      <div class="flex w-max animate-marquee hover:[animation-play-state:paused]">
        
        <div v-for="i in 2" :key="i" class="flex gap-8 px-4">
          
          <div v-for="(testi, index) in testimonials" :key="index" 
               class="w-[350px] shrink-0 group relative">
            
            <div class="glass p-8 rounded-3xl h-full flex flex-col justify-between border border-white/5 group-hover:border-cobalt-500/50 transition-all duration-500">
              <div>
                <svg class="w-8 h-8 text-cobalt-500 mb-6 opacity-40" fill="currentColor" viewBox="0 0 32 32">
                  <path d="M10 8.01c-3.3 0-6 2.7-6 6v10h10V14H6.3c.5-1.7 2-3 3.7-3V8zm12 0c-3.3 0-6 2.7-6 6v10h10V14h-7.7c.5-1.7 2-3 3.7-3V8z" />
                </svg>
                <p class="text-white/90 italic leading-relaxed">{{ localeStore.t(testi.key) }}</p>
              </div>
              
              <div class="mt-8 flex items-center gap-4">
                <div class="h-8 w-1 bg-cobalt-500 rounded-full"></div>
                <div>
                  <p class="font-bold text-white text-sm">{{ testi.author }}</p>
                  <p class="text-white/40 text-xs">{{ testi.role }}</p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup>
const localeStore = useLocaleStore()

const testimonials = [
  { key: 'testi_card1', author: 'Cliente Ecosistema', role: 'MVP / Ecosistema' },
  { key: 'testi_card2', author: 'Cliente Ops', role: 'Automatización / Ops' },
  { key: 'testi_card3', author: 'Beehiiv', role: 'Engineering' },
  { key: 'testi_card4', author: 'Luxury Brand', role: 'Commerce' },
  { key: 'testi_card5', author: 'Fintech Global', role: 'Product' },
  { key: 'testi_card6', author: 'Velocity VC', role: 'Portfolio' }
]
</script>

<style scoped>
/* Mantenemos únicamente la máscara visual aquí para no saturar el marcado HTML 
  con strings arbitrarios complejos. El resto del diseño corre por cuenta de Tailwind v4.
*/
.marquee-mask {
  mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
  -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
}
</style>