<script setup lang="ts">
/**
 * Reconocimientos — bloque de autoridad B2B (modelo BairesDev).
 *
 * Cada sello declara su archivo bajo /public/logos/, que es donde aterrizaron
 * los assets y donde ya aplica la cabecera de caché inmutable del routeRule
 * /logos/**. Los sellos van forzados a monocromo blanco (`brightness-0
 * invert`) independientemente de los colores del archivo de origen: es lo que
 * mantiene la fila homogénea sin depender de cómo venga cada uno.
 *
 * Transparencia por diseño, que es lo que separa esta sección de un muro de
 * logos decorativo:
 *
 * - `url` sólo se rellena cuando existe una fuente pública verificable. La
 *   tarjeta se convierte entonces en enlace y lo anuncia; sin fuente, se
 *   queda estática y no finge que la hay.
 * - `kind` describe la RELACIÓN real (mención editorial, expositor, red
 *   institucional...) en lugar del "Verificado" genérico que había antes.
 *   Una insignia de verificación sobre una afirmación sin fuente enlazable
 *   es exactamente el sello vacío que esta sección debe evitar.
 * - `placeholder` es opcional y hoy nadie lo declara: los cinco sellos tienen
 *   archivo. La rama se conserva para el próximo reconocimiento que llegue
 *   antes que su logo — dibuja una marca geométrica neutra, NUNCA una
 *   aproximación a mano del logotipo real.
 */
const { t } = useI18n()

type RecognitionId = 'forbes' | 'truesdays' | 'startupkitchen' | 'czechinvest' | 'businessshow'

interface Recognition {
  id: RecognitionId
  /** Sello bajo /public/logos/. `null` ⇒ glyph de reserva. */
  logo: string | null
  /** Dimensiones intrínsecas reales del archivo (obligatorias: cero CLS). */
  width: number
  height: number
  /** Fuente pública que respalda el sello. `null` ⇒ tarjeta no enlazada. */
  url: string | null
  /** Ancho en la rejilla de 12: 4+4+4 en la primera fila, 6+6 en la segunda. */
  span: string
  /** Glyph de reserva en currentColor (viewBox 24) para un sello sin archivo. */
  placeholder?: string
}

const recognitionMeta: Recognition[] = [
  {
    id: 'forbes',
    logo: '/logos/ForbesCentroamerica_logo.svg',
    width: 319,
    height: 80,
    // Fragmento de texto (#:~:text=) para que el navegador salte y resalte la
    // mención concreta dentro de un artículo largo, en vez de dejar al
    // visitante buscándola. Degrada solo: un navegador que no lo soporte
    // simplemente abre el artículo por arriba.
    url: 'https://forbescentroamerica.com/2026/07/07/estos-son-los-30-under-30-forbes-centroamerica-2026/#:~:text=Carlos%20Daniel%20Hernandez%20Zuniga',
    span: 'lg:col-span-4',
  },
  {
    id: 'truesdays',
    logo: '/logos/TRUESDAYS_logo.webp',
    width: 600,
    height: 300,
    url: 'https://www.linkedin.com/posts/truesdays_truesdays-startupcommunity-openmic-activity-7394366760600117248-x98x',
    span: 'lg:col-span-4',
  },
  {
    id: 'startupkitchen',
    logo: '/logos/startupkitchen_logo.webp',
    width: 1080,
    height: 1080,
    url: null,
    span: 'lg:col-span-4',
  },
  {
    id: 'czechinvest',
    logo: '/logos/CzechInvest_logo.svg',
    width: 480,
    height: 58,
    url: null,
    span: 'lg:col-span-6',
  },
  {
    id: 'businessshow',
    logo: '/logos/MiamiBusinessShow_logo.webp',
    width: 4320,
    height: 4320,
    url: null,
    span: 'lg:col-span-6',
  },
]

/**
 * Normalización óptica de los sellos.
 *
 * Igualar la ALTURA no iguala la presencia: estos cinco archivos van de 1:1
 * (Startup Kitchen, The Business Show) a 8.26:1 (CzechInvest), así que a la
 * misma altura el wordmark más apaisado ocupa ocho veces más masa visual que
 * la marca cuadrada — que es exactamente el desequilibrio que se veía.
 * Ninguno tiene margen transparente que recortar (los cinco miden 100% de
 * contenido útil), de modo que no es un problema de assets.
 *
 * Se iguala el ÁREA en su lugar: para una relación de aspecto r y un área
 * objetivo A, la altura es sqrt(A / r). El área objetivo está calibrada
 * sobre cómo se veía el wordmark de Forbes, que es la referencia pedida.
 *
 * Los topes evitan los dos extremos degenerados: un wordmark muy alargado
 * quedaría demasiado fino para leerse, y una marca cuadrada crecería hasta
 * dominar la tarjeta.
 */
const TARGET_LOGO_AREA = 4600
const MIN_LOGO_HEIGHT = 24
const MAX_LOGO_HEIGHT = 60

const recognitions = computed(() =>
  recognitionMeta.map((recognition) => {
    const aspect = recognition.width / recognition.height
    const displayHeight = Math.min(
      MAX_LOGO_HEIGHT,
      Math.max(MIN_LOGO_HEIGHT, Math.round(Math.sqrt(TARGET_LOGO_AREA / aspect))),
    )

    return {
      ...recognition,
      name: t(`home.recognition.${recognition.id}_name`),
      description: t(`home.recognition.${recognition.id}_desc`),
      kind: t(`home.recognition.${recognition.id}_kind`),
      // Nombre distinto de `height` a propósito: ese campo es la dimensión
      // INTRÍNSECA del archivo y NuxtImg la necesita intacta para deducir la
      // relación de aspecto y pedirle a IPX el reescalado correcto.
      displayHeight,
    }
  }),
)
</script>

<template>
  <section id="recognition" class="relative overflow-hidden py-16 md:py-24">
    <div
      class="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2"
      style="background: linear-gradient(90deg, transparent, rgb(255 255 255 / 0.12), transparent)"
      aria-hidden="true"
    />

    <div class="relative mx-auto max-w-7xl px-6">
      <div v-reveal class="mb-10 flex flex-col gap-6 md:mb-14 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="mb-4 text-[11px] font-bold uppercase tracking-[0.35em] text-neon-500">
            {{ t('home.recognition.label') }}
          </p>
          <h2 class="max-w-2xl text-3xl font-black leading-[1.1] tracking-tight text-white md:text-5xl">
            {{ t('home.recognition.title_1') }}
            <span class="gradient-text">{{ t('home.recognition.title_span') }}</span>
          </h2>
        </div>
        <p class="max-w-md text-base leading-relaxed text-white/55">
          {{ t('home.recognition.subtitle') }}
        </p>
      </div>

      <div v-reveal="120" class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-12">
        <UiSpotlightCard
          v-for="recognition in recognitions"
          :key="recognition.id"
          :as="recognition.url ? 'a' : 'article'"
          :href="recognition.url ?? undefined"
          :target="recognition.url ? '_blank' : undefined"
          :rel="recognition.url ? 'noopener noreferrer' : undefined"
          :size="360"
          class="flex flex-col rounded-xl p-6 md:p-7"
          :class="[
            recognition.span,
            recognition.url ? 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-300' : '',
          ]"
        >
          <!-- Alto fijo del contenedor: reserva la caja pase lo que pase con
               el sello, así que la altura calculada de cada logo no puede
               introducir CLS. -->
          <div class="flex h-16 items-center">
            <NuxtImg
              v-if="recognition.logo"
              :src="recognition.logo"
              alt=""
              aria-hidden="true"
              :width="recognition.width"
              :height="recognition.height"
              loading="lazy"
              :style="{ height: `${recognition.displayHeight}px` }"
              class="w-auto max-w-full object-contain opacity-70 brightness-0 invert transition-opacity duration-500 ease-out-expo group-hover/spot:opacity-100"
            />
            <svg
              v-else-if="recognition.placeholder"
              class="h-10 w-10 text-white/45 transition-colors duration-500 ease-out-expo group-hover/spot:text-white/80"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="1.4"
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" :d="recognition.placeholder" />
            </svg>
          </div>

          <h3 class="mt-6 text-lg font-bold tracking-tight text-white">{{ recognition.name }}</h3>
          <p class="mt-2 flex-1 text-sm leading-relaxed text-white/50">{{ recognition.description }}</p>

          <div class="mt-6 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
            <span class="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
              {{ recognition.kind }}
            </span>
            <span
              v-if="recognition.url"
              class="inline-flex shrink-0 items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-cobalt-300 transition-colors duration-300 ease-out-expo group-hover/spot:text-neon-300"
            >
              {{ t('home.recognition.source') }}
              <svg
                class="h-3 w-3 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2.2"
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M14 5h5v5M19 5l-8 8M18 14v5H5V6h5" />
              </svg>
            </span>
          </div>
        </UiSpotlightCard>
      </div>
    </div>
  </section>
</template>
