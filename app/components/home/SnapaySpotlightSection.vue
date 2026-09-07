<script setup lang="ts">
/**
 * Snapay — vitrina del venture insignia, reconstruida como Bento Grid.
 *
 * Qué cambia respecto de la versión anterior y por qué:
 * - Las tres métricas (`10K+ pymes`, `12+ monedas`, `IA`) eran cifras sin
 *   respaldo verificable. Se sustituyen por CAPACIDADES del producto, que
 *   sí son comprobables contra el propio producto.
 * - El mockup es DOM puro, no una captura: cero bytes de imagen, cero CLS
 *   (no hay medio que cargue de forma asíncrona) y el texto queda indexable.
 *   Sus datos son de ejemplo y el propio panel lo declara en pantalla
 *   (`mockup.demoNote`) — nada aquí debe leerse como un dato real de Snapay.
 * - La interacción (cambiar de corredor) es la única animación de la sección
 *   junto al reveal de entrada: sin autoplay, sin timers, sin trabajo en el
 *   hilo principal mientras nadie interactúa.
 */
const { t, locale } = useI18n()

type CorridorId = 'usd' | 'eur' | 'hnl'

interface Corridor {
  id: CorridorId
  /** Código ISO 4217, renderizado como texto junto al monto. */
  code: string
  /** Monto de ejemplo. NO es un dato de negocio — ver `demoNote`. */
  amount: number
  reference: string
}

const corridors: Corridor[] = [
  { id: 'usd', code: 'USD', amount: 1250, reference: 'TX-4F81-US' },
  { id: 'eur', code: 'EUR', amount: 3480, reference: 'TX-9C20-EU' },
  { id: 'hnl', code: 'HNL', amount: 86400, reference: 'TX-2B77-HN' },
]

const activeId = ref<CorridorId>('usd')
const active = computed(() => corridors.find((corridor) => corridor.id === activeId.value) ?? corridors[0]!)

/**
 * Intl formatea únicamente el número, nunca el símbolo de moneda: con
 * `style: 'currency'` la posición del símbolo y el espacio duro que Intl
 * inserta pueden diferir entre el ICU de Node y el del navegador, lo que
 * produciría un mismatch de hidratación sobre una cifra visible. El código
 * ISO se renderiza aparte, como texto plano.
 */
const formattedAmount = computed(() =>
  new Intl.NumberFormat(locale.value, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
    active.value.amount,
  ),
)

/**
 * Se incrementa en cada cambio de corredor y alimenta el `:key` del
 * pipeline: fuerza el remontaje de la lista para reiniciar su animación de
 * entrada. Alternar una clase no serviría — el navegador no reinicia una
 * animación CSS ya terminada sin un reflow forzado.
 */
const runId = ref(0)

function selectCorridor(id: CorridorId) {
  if (id === activeId.value) return
  activeId.value = id
  runId.value += 1
}

const steps = computed(() => [
  t('home.snapay.mockup.stepAuthorized'),
  t('home.snapay.mockup.stepScreened'),
  t('home.snapay.mockup.stepSettled'),
])

interface Capability {
  id: 'settlement' | 'currency' | 'api' | 'pci'
  icon: string
}

const capabilityMeta: Capability[] = [
  { id: 'settlement', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { id: 'currency', icon: 'M12 21a9 9 0 100-18 9 9 0 000 18zM3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 010 18 15 15 0 010-18z' },
  { id: 'api', icon: 'M10 20l4-16M18 8l4 4-4 4M6 16l-4-4 4-4' },
  { id: 'pci', icon: 'M9 12.5l2 2 4.5-4.5M12 3l7.5 2.8V12c0 4.6-3.2 8.4-7.5 9.4C7.7 20.4 4.5 16.6 4.5 12V5.8L12 3z' },
]

const capabilities = computed(() =>
  capabilityMeta.map((capability) => ({
    ...capability,
    title: t(`home.snapay.capabilities.${capability.id}_title`),
    description: t(`home.snapay.capabilities.${capability.id}_desc`),
  })),
)
</script>

<template>
  <section id="snapay-spotlight" class="relative overflow-hidden py-16 md:py-28">
    <div
      class="pointer-events-none absolute inset-0"
      style="background: radial-gradient(ellipse 70% 55% at 50% 35%, rgb(31 127 255 / 0.06), transparent)"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2"
      style="background: linear-gradient(90deg, transparent, rgb(31 127 255 / 0.35), transparent)"
      aria-hidden="true"
    />

    <div class="relative mx-auto max-w-7xl px-6">
      <div v-reveal class="mb-10 flex flex-col gap-6 md:mb-14 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="mb-5 inline-flex items-center gap-2 rounded-md border border-neon-500/25 bg-neon-500/10 px-3 py-1.5">
            <span class="h-1.5 w-1.5 rounded-full bg-neon-500" aria-hidden="true" />
            <span class="text-[11px] font-bold uppercase tracking-[0.16em] text-neon-300">
              {{ t('home.snapay.badge') }}
            </span>
          </p>
          <h2 class="max-w-2xl text-4xl font-black leading-[1.05] tracking-tight text-white md:text-5xl">
            {{ t('home.snapay.title_1') }}<br />
            <span class="gradient-text">{{ t('home.snapay.title_span') }}</span>
          </h2>
        </div>
        <p class="max-w-md text-base leading-relaxed text-white/55">
          {{ t('home.snapay.desc') }}
        </p>
      </div>

      <div class="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <!-- Celda mayor: mockup de producto en DOM puro. -->
        <div v-reveal class="lg:col-span-7">
          <UiSpotlightCard :size="520" class="flex h-full flex-col rounded-2xl p-5 md:p-7">
            <div class="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div class="flex items-center gap-3">
                <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                  <NuxtImg
                    src="/logos/snapay.svg"
                    alt=""
                    width="420"
                    height="432"
                    loading="lazy"
                    aria-hidden="true"
                    class="h-5 w-auto"
                  />
                </span>
                <span class="block">
                  <span class="block text-sm font-bold text-white">Snapay</span>
                  <span class="block text-xs text-white/45">{{ t('home.snapay.mockup.product') }}</span>
                </span>
              </div>
              <span
                class="inline-flex shrink-0 items-center gap-2 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/60"
              >
                <span class="h-1.5 w-1.5 rounded-full bg-neon-500" aria-hidden="true" />
                {{ t('home.snapay.mockup.demo') }}
              </span>
            </div>

            <div class="mt-5">
              <p id="snapay-corridor-label" class="mb-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
                {{ t('home.snapay.mockup.corridorLabel') }}
              </p>
              <div role="group" aria-labelledby="snapay-corridor-label" class="flex flex-wrap gap-2">
                <button
                  v-for="corridor in corridors"
                  :key="corridor.id"
                  type="button"
                  :aria-pressed="corridor.id === activeId"
                  class="rounded-md border px-3 py-1.5 text-xs font-bold tracking-wide transition-colors duration-300 ease-out-expo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-300"
                  :class="
                    corridor.id === activeId
                      ? 'border-neon-500/50 bg-neon-500/15 text-neon-100'
                      : 'border-white/10 bg-white/[0.02] text-white/55 hover:border-white/25 hover:text-white'
                  "
                  @click="selectCorridor(corridor.id)"
                >
                  {{ corridor.code }}
                </button>
              </div>
            </div>

            <div class="mt-5 rounded-xl border border-white/10 bg-brand-900/60 p-5" aria-live="polite">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
                    {{ t('home.snapay.mockup.merchantLabel') }}
                  </p>
                  <p class="mt-1 text-sm font-semibold text-white">{{ t('home.snapay.mockup.merchantValue') }}</p>
                </div>
                <div class="text-right">
                  <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
                    {{ t('home.snapay.mockup.referenceLabel') }}
                  </p>
                  <p class="mt-1 font-mono text-xs text-white/60">{{ active.reference }}</p>
                </div>
              </div>

              <div class="mt-5 flex flex-wrap items-end justify-between gap-4 border-t border-white/10 pt-5">
                <div>
                  <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
                    {{ t('home.snapay.mockup.amountLabel') }}
                  </p>
                  <p class="mt-1.5 flex items-baseline gap-2">
                    <span class="text-3xl font-black tabular-nums tracking-tight text-white md:text-4xl">
                      {{ formattedAmount }}
                    </span>
                    <span class="text-sm font-bold text-white/45">{{ active.code }}</span>
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
                    {{ t('home.snapay.mockup.routeLabel') }}
                  </p>
                  <p class="mt-1.5 text-xs font-bold text-cobalt-300">
                    {{ t(`home.snapay.corridors.${active.id}_route`) }}
                  </p>
                </div>
              </div>

              <ol :key="runId" class="mt-5 grid gap-2.5 border-t border-white/10 pt-5 sm:grid-cols-3">
                <li
                  v-for="(step, index) in steps"
                  :key="step"
                  class="pipeline-step flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5"
                  :style="{ animationDelay: `${index * 110}ms` }"
                >
                  <span
                    class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-neon-500/40 bg-neon-500/15 text-neon-300"
                    aria-hidden="true"
                  >
                    <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span class="text-xs font-semibold text-white/75">{{ step }}</span>
                </li>
              </ol>
            </div>

            <p class="mt-3 text-[11px] text-white/40">{{ t('home.snapay.mockup.demoNote') }}</p>

            <div class="mt-auto flex flex-wrap items-center justify-between gap-3 pt-6">
              <p class="flex items-center gap-2 text-xs text-white/45">
                <svg
                  class="h-4 w-4 shrink-0 text-neon-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="1.8"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9 12.5l2 2 4.5-4.5M12 3l7.5 2.8V12c0 4.6-3.2 8.4-7.5 9.4C7.7 20.4 4.5 16.6 4.5 12V5.8L12 3z"
                  />
                </svg>
                {{ t('home.snapay.mockup.footerNote') }}
              </p>
              <a
                href="https://snapay.ai"
                target="_blank"
                rel="noopener"
                class="group/link inline-flex items-center gap-1.5 rounded text-xs font-bold text-cobalt-300 transition-colors duration-300 ease-out-expo hover:text-neon-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-300"
              >
                {{ t('home.snapay.mockup.openPlatform') }}
                <svg
                  class="h-3.5 w-3.5 transition-transform duration-300 ease-out-expo group-hover/link:translate-x-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2.5"
                  aria-hidden="true"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </UiSpotlightCard>
        </div>

        <!-- Columna de capacidades: afirmaciones verificables, sin cifras. -->
        <div v-reveal="120" class="flex flex-col gap-5 lg:col-span-5">
          <div class="grid flex-1 grid-cols-1 gap-5 sm:grid-cols-2">
            <UiSpotlightCard
              v-for="capability in capabilities"
              :key="capability.id"
              as="article"
              :size="320"
              class="rounded-xl p-5"
            >
              <span
                class="mb-4 flex h-9 w-9 items-center justify-center rounded-lg border border-neon-500/20 bg-neon-500/10 text-neon-300"
                aria-hidden="true"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round" :d="capability.icon" />
                </svg>
              </span>
              <h3 class="text-sm font-bold text-white">{{ capability.title }}</h3>
              <p class="mt-2 text-xs leading-relaxed text-white/50">{{ capability.description }}</p>
            </UiSpotlightCard>
          </div>

          <UiSpotlightCard
            :size="420"
            class="flex flex-col items-start gap-4 rounded-xl p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p class="text-sm font-bold text-white">{{ t('home.snapay.ctaCard.title') }}</p>
              <p class="mt-1 text-xs text-white/50">{{ t('home.snapay.ctaCard.desc') }}</p>
            </div>
            <a
              href="https://snapay.ai"
              target="_blank"
              rel="noopener"
              class="inline-flex shrink-0 items-center gap-2 rounded-lg bg-neon-500 px-5 py-2.5 text-sm font-bold text-brand-900 transition-all duration-300 ease-out-expo hover:-translate-y-0.5 hover:bg-neon-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-300 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-900"
            >
              {{ t('home.snapay.cta') }}
              <svg
                class="h-4 w-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2.5"
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </UiSpotlightCard>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Sólo se ejecuta al montar la lista, es decir al cambiar de corredor
   (`:key="runId"`). `backwards` mantiene el estado inicial durante el
   retardo escalonado, y anima únicamente `opacity`/`transform` — nada que
   dispare layout. */
.pipeline-step {
  animation: pipeline-step 0.55s var(--ease-out-expo) backwards;
}

@keyframes pipeline-step {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .pipeline-step {
    animation: none;
  }
}
</style>
