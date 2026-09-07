<script setup lang="ts">
/**
 * Reconocimientos — bloque de autoridad B2B (modelo BairesDev).
 *
 * Preparada para recibir los sellos monocromáticos definitivos: cada
 * reconocimiento declara su `logo` en /public/images/logos/. Mientras ese
 * campo sea `null` se dibuja un glyph vectorial de reserva en currentColor
 * — deliberadamente geométrico y neutro, NUNCA una aproximación dibujada a
 * mano del logotipo real: un wordmark falso de una marca ajena es peor que
 * no tener logo. El nombre del reconocimiento siempre se renderiza como
 * texto, así que la tarjeta se lee igual de bien con o sin asset.
 *
 * Para activar un sello definitivo basta con poner su ruta en `logo` y sus
 * dimensiones intrínsecas en `width`/`height` — obligatorias para reservar
 * la caja del elemento y no introducir CLS.
 *
 * Los sellos van forzados a monocromo blanco (`brightness-0 invert`)
 * independientemente de los colores del SVG de origen, que es lo que
 * mantiene la fila homogénea sin depender de cómo venga cada archivo.
 */
const { t } = useI18n()

type RecognitionId = 'forbes' | 'czechinvest' | 'startupkitchen'

interface Recognition {
  id: RecognitionId
  /** Sello definitivo en /public/images/logos/. `null` ⇒ glyph de reserva. */
  logo: string | null
  /** Dimensiones intrínsecas del SVG definitivo (obligatorias: cero CLS). */
  width: number
  height: number
  /** Glyph de reserva, trazado en currentColor sobre un viewBox de 24. */
  placeholder: string
}

const recognitionMeta: Recognition[] = [
  {
    id: 'forbes',
    logo: null,
    width: 320,
    height: 80,
    // Medalla con cinta.
    placeholder: 'M12 3a5.25 5.25 0 100 10.5A5.25 5.25 0 0012 3zM8.6 12.9L7.2 21l4.8-2.4 4.8 2.4-1.4-8.1',
  },
  {
    id: 'czechinvest',
    logo: null,
    width: 320,
    height: 80,
    // Nodo hexagonal (red de inversión).
    placeholder: 'M12 2.8l7.5 4.4v9.6L12 21.2l-7.5-4.4V7.2L12 2.8zm0 5.6a3.6 3.6 0 100 7.2 3.6 3.6 0 000-7.2z',
  },
  {
    id: 'startupkitchen',
    logo: null,
    width: 320,
    height: 80,
    // Módulo de lanzamiento.
    placeholder: 'M12 2.8c3.4 2.6 5.2 6.1 5.2 10l-2.4 2.6H9.2L6.8 12.8c0-3.9 1.8-7.4 5.2-10zm0 6.4a1.9 1.9 0 100 3.8 1.9 1.9 0 000-3.8zM9.6 18.2L8 21.2m6.4-3l1.6 3',
  },
]

const recognitions = computed(() =>
  recognitionMeta.map((recognition) => ({
    ...recognition,
    name: t(`home.recognition.${recognition.id}_name`),
    description: t(`home.recognition.${recognition.id}_desc`),
  })),
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

      <div v-reveal="120" class="grid grid-cols-1 gap-5 md:grid-cols-3">
        <UiSpotlightCard
          v-for="recognition in recognitions"
          :key="recognition.id"
          as="article"
          :size="360"
          class="flex flex-col rounded-xl p-6 md:p-7"
        >
          <div class="flex h-12 items-center">
            <NuxtImg
              v-if="recognition.logo"
              :src="recognition.logo"
              alt=""
              aria-hidden="true"
              :width="recognition.width"
              :height="recognition.height"
              loading="lazy"
              class="h-10 w-auto opacity-70 brightness-0 invert transition-opacity duration-500 ease-out-expo group-hover/spot:opacity-100"
            />
            <svg
              v-else
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
          <p class="mt-2 text-sm leading-relaxed text-white/50">{{ recognition.description }}</p>

          <div class="mt-6 flex items-center gap-2 border-t border-white/10 pt-4">
            <svg
              class="h-3.5 w-3.5 shrink-0 text-neon-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2.2"
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span class="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
              {{ t('home.recognition.verified') }}
            </span>
          </div>
        </UiSpotlightCard>
      </div>
    </div>
  </section>
</template>
