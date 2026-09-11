<script setup lang="ts">
/**
 * Social proof / logo cloud, justo debajo del Hero.
 *
 * Dos tickers separados, con copy honesto en cada uno (decisión explícita
 * del usuario tras señalar la tensión de marca registrada / falso respaldo
 * que ya resuelve `RecognitionSection.vue` más abajo en esta misma página):
 *
 *  - "Mencionado en & Ecosistema": los MISMOS 5 sellos de prensa que
 *    `RecognitionSection.vue` (mismos archivos, mismas dimensiones) — nunca
 *    una afirmación de patrocinio, sólo menciones/vínculos ya verificados
 *    y enlazados con fuente pública en esa sección.
 *  - "Construido con tecnología de vanguardia": atribución técnica estándar
 *    de stack — Nuxt, Sanity.io, Cloudflare y Vercel son, literalmente,
 *    lo que corre este sitio (ver nuxt.config.ts / server/utils); OpenAI y
 *    Anthropic (Claude) se listan como la tecnología de IA con la que este
 *    equipo construye, no como un partnership formal.
 *
 * NINGÚN logo aquí implica "nos respaldan" — ver el comentario de
 * `clients_name` en RecognitionSection.vue para el caso (Dell/Beehiiv) donde
 * esa distinción sí importó y se resolvió sin reproducir el logotipo.
 */
interface LogoItem {
  id: string
  /** Nombre real de la marca — es el `alt` del logo, no pasa por i18n (nombre propio). */
  name: string
  /** Ruta bajo /public. SVG o webp, ambos ya en monocromo vía `brightness-0 invert`. */
  src: string
  /** Dimensiones intrínsecas reales del archivo (o del viewBox si es un SVG sin size) — cero CLS. */
  width: number
  height: number
}

const { t } = useI18n()

// Mismos 5 archivos y dimensiones que RecognitionSection.vue — un solo lugar
// donde cambiar el asset si el archivo de origen cambia algún día.
const pressLogos: LogoItem[] = [
  { id: 'forbes', name: 'Forbes Centroamérica', src: '/logos/ForbesCentroamerica_logo.svg', width: 319, height: 80 },
  { id: 'czechinvest', name: 'CzechInvest', src: '/logos/CzechInvest_logo.svg', width: 480, height: 58 },
  { id: 'truesdays', name: 'Truesdays', src: '/logos/TRUESDAYS_logo.webp', width: 577, height: 167 },
  { id: 'businessshow', name: 'The Business Show Miami', src: '/logos/MiamiBusinessShow_logo.svg', width: 1095, height: 1095 },
  { id: 'startupkitchen', name: 'Startup Kitchen', src: '/logos/startupkitchen_logo.webp', width: 1080, height: 1080 },
]

// Marcas oficiales vía Simple Icons (simpleicons.org, CC0 1.0) para
// Nuxt/Sanity/Cloudflare/Vercel — ver public/logos/tech/*.svg. OpenAI y
// Claude usan los archivos de marca ya provistos en /public/logos.
const techLogos: LogoItem[] = [
  { id: 'nuxt', name: 'Nuxt', src: '/logos/tech/nuxt.svg', width: 24, height: 24 },
  { id: 'sanity', name: 'Sanity.io', src: '/logos/tech/sanity.svg', width: 24, height: 24 },
  { id: 'cloudflare', name: 'Cloudflare', src: '/logos/tech/cloudflare.svg', width: 24, height: 24 },
  { id: 'vercel', name: 'Vercel', src: '/logos/tech/vercel.svg', width: 24, height: 24 },
  { id: 'openai', name: 'OpenAI', src: '/logos/OpenAI_logo_2025.webp', width: 1280, height: 1269 },
  { id: 'anthropic', name: 'Anthropic (Claude)', src: '/logos/Claude_logo.svg', width: 100, height: 100 },
]

// Normalización óptica por ÁREA (misma técnica que RecognitionSection.vue,
// constantes propias porque este ticker es un elemento mucho más discreto
// que las tarjetas de esa sección): iguala la masa visual entre un wordmark
// apaisado (CzechInvest, 8.3:1) y una marca cuadrada (Vercel, Startup
// Kitchen, 1:1) en vez de igualar sólo la altura, que dejaría al wordmark
// más ancho dominando la fila.
const TARGET_LOGO_AREA = 900
const MIN_LOGO_HEIGHT = 22
const MAX_LOGO_HEIGHT = 34

function sizeLogos(items: LogoItem[]) {
  return items.map((item) => {
    const aspect = item.width / item.height
    const displayHeight = Math.min(
      MAX_LOGO_HEIGHT,
      Math.max(MIN_LOGO_HEIGHT, Math.round(Math.sqrt(TARGET_LOGO_AREA / aspect))),
    )
    return { ...item, displayHeight, displayWidth: Math.round(displayHeight * aspect) }
  })
}

const pressLogosSized = computed(() => sizeLogos(pressLogos))
const techLogosSized = computed(() => sizeLogos(techLogos))
</script>

<template>
  <section v-vanish class="relative overflow-hidden py-10 md:py-14">
    <div class="mx-auto max-w-7xl px-6">
      <div v-reveal class="mb-6 text-center">
        <p class="text-[11px] font-bold uppercase tracking-[0.3em] text-white/40">
          {{ t('home.logoCloud.row1Label') }}
        </p>
      </div>

      <div class="marquee-mask overflow-hidden">
        <div class="animate-marquee flex w-max items-center gap-12 hover:[animation-play-state:paused] sm:gap-16">
          <NuxtImg
            v-for="logo in pressLogosSized"
            :key="logo.id"
            :src="logo.src"
            :alt="logo.name"
            :width="logo.displayWidth"
            :height="logo.displayHeight"
            loading="lazy"
            :style="{ width: `${logo.displayWidth}px`, height: `${logo.displayHeight}px` }"
            class="max-w-none shrink-0 object-contain opacity-60 brightness-0 invert transition-opacity duration-500 ease-out-expo hover:opacity-100"
          />
          <!-- Segunda mitad idéntica sólo para el loop visual continuo — oculta
               a lectores de pantalla para no anunciar cada nombre dos veces. -->
          <NuxtImg
            v-for="logo in pressLogosSized"
            :key="`${logo.id}-dup`"
            :src="logo.src"
            alt=""
            aria-hidden="true"
            :width="logo.displayWidth"
            :height="logo.displayHeight"
            loading="lazy"
            :style="{ width: `${logo.displayWidth}px`, height: `${logo.displayHeight}px` }"
            class="max-w-none shrink-0 object-contain opacity-60 brightness-0 invert transition-opacity duration-500 ease-out-expo hover:opacity-100"
          />
        </div>
      </div>

      <div v-reveal="120" class="mb-6 mt-12 text-center md:mt-16">
        <p class="text-[11px] font-bold uppercase tracking-[0.3em] text-white/40">
          {{ t('home.logoCloud.row2Label') }}
        </p>
      </div>

      <div class="marquee-mask overflow-hidden">
        <div
          class="animate-marquee flex w-max items-center gap-12 hover:[animation-play-state:paused] sm:gap-16"
          style="animation-direction: reverse"
        >
          <NuxtImg
            v-for="logo in techLogosSized"
            :key="logo.id"
            :src="logo.src"
            :alt="logo.name"
            :width="logo.displayWidth"
            :height="logo.displayHeight"
            loading="lazy"
            :style="{ width: `${logo.displayWidth}px`, height: `${logo.displayHeight}px` }"
            class="max-w-none shrink-0 object-contain opacity-60 brightness-0 invert transition-opacity duration-500 ease-out-expo hover:opacity-100"
          />
          <NuxtImg
            v-for="logo in techLogosSized"
            :key="`${logo.id}-dup`"
            :src="logo.src"
            alt=""
            aria-hidden="true"
            :width="logo.displayWidth"
            :height="logo.displayHeight"
            loading="lazy"
            :style="{ width: `${logo.displayWidth}px`, height: `${logo.displayHeight}px` }"
            class="max-w-none shrink-0 object-contain opacity-60 brightness-0 invert transition-opacity duration-500 ease-out-expo hover:opacity-100"
          />
        </div>
      </div>
    </div>
  </section>
</template>
