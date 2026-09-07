<script setup lang="ts">
/**
 * Proceso de discovery + FAQ, justo antes del formulario de contacto.
 *
 * Responde la objeción real de quien está a punto de escribir ("¿esto acaba
 * en un vendedor persiguiéndome?") ANTES del formulario, no escondida tras
 * un clic. Por eso vive aquí y no dentro del drawer: un drawer es superficie
 * de captura, y meterle texto para leer hace que el visitante lo cierre
 * justamente para poder leerlo.
 *
 * El acordeón es `<details>/<summary>` nativo: cero JavaScript, cero peso de
 * hidratación, y el comportamiento de teclado y de lector de pantalla ya
 * viene resuelto por el navegador. Además el contenido está siempre en el
 * DOM aunque el panel esté plegado, que es la condición que Google exige
 * para indexar respuestas colapsadas.
 *
 * El JSON-LD de FAQPage se genera desde las MISMAS cadenas que se pintan en
 * pantalla (CLAUDE.md §3, AEO). Esto no es un detalle de estilo: Google
 * penaliza el structured data que no corresponde con el contenido visible,
 * así que duplicar el copy en un objeto aparte sería una regresión esperando
 * a que alguien edite un lado y no el otro.
 */
const { t } = useI18n()

const stepIds = ['triage', 'call', 'packet'] as const
const faqIds = ['ip', 'response', 'engagement', 'nearshore'] as const

const steps = computed(() =>
  stepIds.map((id, index) => ({
    id,
    number: String(index + 1).padStart(2, '0'),
    title: t(`home.process.steps.${id}_title`),
    description: t(`home.process.steps.${id}_desc`),
  })),
)

const faqs = computed(() =>
  faqIds.map((id) => ({
    id,
    question: t(`home.process.faq.${id}_q`),
    answer: t(`home.process.faq.${id}_a`),
  })),
)

useHead(() => ({
  script: [
    {
      key: 'ld-faq-page',
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.value.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      }),
    },
  ],
}))
</script>

<template>
  <section id="process" class="relative overflow-hidden py-16 md:py-24">
    <div
      class="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2"
      style="background: linear-gradient(90deg, transparent, rgb(255 255 255 / 0.12), transparent)"
      aria-hidden="true"
    />

    <div class="relative mx-auto max-w-7xl px-6">
      <div v-reveal class="mb-10 flex flex-col gap-6 md:mb-14 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="mb-4 text-[11px] font-bold uppercase tracking-[0.35em] text-neon-500">
            {{ t('home.process.label') }}
          </p>
          <h2 class="max-w-2xl text-3xl font-black leading-[1.1] tracking-tight text-white md:text-5xl">
            {{ t('home.process.title_1') }}
            <span class="gradient-text">{{ t('home.process.title_span') }}</span>
          </h2>
        </div>
        <p class="max-w-md text-base leading-relaxed text-white/55">
          {{ t('home.process.subtitle') }}
        </p>
      </div>

      <div v-reveal="100" class="grid gap-5 md:grid-cols-3">
        <UiSpotlightCard
          v-for="step in steps"
          :key="step.id"
          as="article"
          :size="360"
          class="flex flex-col rounded-xl p-6"
        >
          <div class="flex items-center gap-3">
            <span class="text-sm font-black tabular-nums text-neon-500">{{ step.number }}</span>
            <span class="h-px flex-1 bg-gradient-to-r from-neon-500/40 to-transparent" aria-hidden="true" />
          </div>
          <h3 class="mt-5 text-lg font-bold leading-snug tracking-tight text-white">{{ step.title }}</h3>
          <p class="mt-3 text-sm leading-relaxed text-white/50">{{ step.description }}</p>
        </UiSpotlightCard>
      </div>

      <div v-reveal="160" class="mx-auto mt-12 max-w-3xl md:mt-16">
        <h3 class="mb-5 text-[11px] font-bold uppercase tracking-[0.35em] text-white/40">
          {{ t('home.process.faq.label') }}
        </h3>
        <div class="flex flex-col gap-2.5">
          <details
            v-for="faq in faqs"
            :key="faq.id"
            class="group rounded-xl border border-white/10 bg-white/[0.02] transition-colors duration-300 ease-out-expo open:border-neon-500/25 hover:border-white/20"
          >
            <summary
              class="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-300 [&::-webkit-details-marker]:hidden"
            >
              {{ faq.question }}
              <svg
                class="h-4 w-4 shrink-0 text-neon-500 transition-transform duration-300 ease-out-expo group-open:rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2.2"
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6" />
              </svg>
            </summary>
            <p class="border-t border-white/10 px-5 pb-5 pt-4 text-sm leading-relaxed text-white/55">
              {{ faq.answer }}
            </p>
          </details>
        </div>
      </div>
    </div>
  </section>
</template>
