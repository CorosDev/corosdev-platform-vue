<script setup>
const localeStore = useLocaleStore();

// Métricas alineadas al diseño original usando el store reactivo
const metrics = [
  { valKey: 'snapay_stat1_val', lblKey: 'snapay_stat1_lbl' },
  { valKey: 'snapay_stat2_val', lblKey: 'snapay_stat2_lbl' },
  { valKey: 'snapay_stat3_val', lblKey: 'snapay_stat3_lbl' }
];
</script>

<template>
  <section id="snapay-showcase" class="py-12 md:py-24 relative overflow-hidden">
    <!-- Contenedor Estándar Pixel-Perfect -->
    <div class="w-full max-w-[80rem] mx-auto px-6 relative flex flex-col items-center text-center">
      
      <!-- 1. Badge Superior Centrado -->
      <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neon-500/10 border border-neon-500/20 mb-8 backdrop-blur-md">
        <span class="w-1.5 h-1.5 rounded-full bg-neon-500 animate-pulse"></span>
        <span class="text-[10px] md:text-xs font-bold uppercase tracking-widest text-neon-500">
          {{ localeStore.t('snapay_badge') }}
        </span>
      </div>

      <!-- 2. Contenedor del Logo de Snapay con Brillo Neon -->
      <div class="relative w-24 h-24 md:w-28 md:h-28 mb-8 flex items-center justify-center group">
        <!-- Efecto de Brillo de Fondo Proyectado (Glow) -->
        <div class="absolute inset-0 bg-neon-500/20 rounded-3xl blur-xl group-hover:bg-neon-500/30 transition-all duration-500"></div>
        
        <!-- Caja del Logo Esmerilada -->
        <div class="relative w-full h-full glass border border-white/10 rounded-3xl flex items-center justify-center p-5 shadow-[0_0_30px_rgba(31,127,255,0.15)] bg-black/40">
          <img 
            src="~/assets/snapay-logo.svg" 
            alt="Snapay Logo" 
            class="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]"
            loading="lazy"
          />
        </div>
      </div>

      <!-- 3. Título Principal Centrado con gradiente inyectado -->
      <h2 
        class="text-4xl md:text-6xl font-black text-white max-w-4xl tracking-tight leading-tight mb-6"
        v-html="localeStore.t('snapay_title')"
      ></h2>

      <!-- 4. Descripción Corta Central -->
      <p class="text-white/50 text-base md:text-lg max-w-2xl leading-relaxed mb-12">
        {{ localeStore.t('snapay_desc') }}
      </p>

      <!-- 5. Grid Horizontal de Métricas (Centrado abajo) -->
      <div class="grid grid-cols-3 gap-4 md:gap-6 w-full max-w-2xl mb-12">
        <div 
          v-for="(metric, index) in metrics" 
          :key="index"
          class="glass border border-white/5 bg-white/[0.02] p-5 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 hover:border-neon-500/30 hover:bg-white/[0.04]"
        >
          <span class="text-2xl md:text-3xl font-black text-neon-500 mb-1 drop-shadow-glow">
            {{ localeStore.t(metric.valKey) }}
          </span>
          <span class="text-[9px] md:text-[11px] font-bold text-white/40 uppercase tracking-wider text-center">
            {{ localeStore.t(metric.lblKey) }}
          </span>
        </div>
      </div>

      <!-- 6. Botón de Acción Principal -->
      <a 
        href="https://snapay.ai" 
        target="_blank" 
        class="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-neon-500 hover:bg-neon-400 text-black font-bold text-sm tracking-wide shadow-[0_4px_20px_rgba(31,127,255,0.3)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 uppercase"
      >
        <span>{{ localeStore.t('snapay_cta') }}</span>
        <span class="text-base">&rarr;</span>
      </a>

    </div>
  </section>
</template>