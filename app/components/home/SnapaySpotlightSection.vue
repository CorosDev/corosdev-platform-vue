<script setup lang="ts">
/**
 * Snapay — vitrina del venture insignia.
 *
 * Layout 50/50: a la izquierda el producto dentro de un marco de dispositivo,
 * a la derecha sus cuatro capacidades apiladas en una sola columna, y un
 * único CTA cerrando el bloque.
 *
 * Sobre el color: la pantalla del móvil usa la paleta NATIVA de la app
 * (indigo #4F46E5, verde de confirmación) y no la del sitio. Es una excepción
 * deliberada a la directiva Anti-Slop, no un descuido: el marco delimita
 * dónde termina el sitio y empieza el producto, y repintar una captura de
 * producto con los colores de la web la volvería una ilustración inventada en
 * lugar de una muestra fiel. Fuera del marco no entra ni un morado.
 *
 * Todo es DOM: cero bytes de imagen, cero CLS y texto indexable. Los datos
 * son de ejemplo y el bloque lo declara en pantalla.
 *
 * Los totales se DERIVAN de las líneas de la comanda en vez de estar escritos
 * a mano. En las capturas de referencia la aritmética no cerraba (las líneas
 * sumaban L860 pero el subtotal decía L1,030), y un mockup con cuentas rotas
 * es lo primero que detecta un CTO. Calculándolos aquí no pueden divergir.
 */
const { t, locale } = useI18n()

interface LineItem {
  /** Nombre de plato: dato de demostración, no se traduce. */
  name: string
  quantity: number
  unitPrice: number
}

const items: LineItem[] = [
  { name: 'Margherita Pizza', quantity: 2, unitPrice: 150 },
  { name: 'Diet Coke', quantity: 2, unitPrice: 50 },
  { name: 'Vegetarian Pizza', quantity: 1, unitPrice: 320 },
  { name: 'Chocolate Cake', quantity: 1, unitPrice: 140 },
]

const TAX_RATE = 0.15
const TIP_RATE = 0.03

const subtotal = computed(() => items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0))
const taxes = computed(() => subtotal.value * TAX_RATE)
const total = computed(() => subtotal.value + taxes.value)
const tip = computed(() => subtotal.value * TIP_RATE)
const totalPaid = computed(() => total.value + tip.value)

/**
 * Intl formatea sólo el número; la "L" del lempira se antepone como texto.
 * Con `style: 'currency'` la posición del símbolo y el espacio duro que Intl
 * inserta difieren entre el ICU de Node y el del navegador, lo que daría un
 * mismatch de hidratación sobre cifras visibles.
 */
const amountFormatter = computed(
  () => new Intl.NumberFormat(locale.value, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
)

function money(value: number) {
  return `L${amountFormatter.value.format(value)}`
}

type Step = 'invoice' | 'method' | 'paid'

const step = ref<Step>('invoice')

type MethodId = 'full' | 'split' | 'items' | 'custom'

interface PaymentMethod {
  id: MethodId
  icon: string
  /** Color del chip, tomado de la propia app. */
  tint: string
  tintBg: string
}

const methodMeta: PaymentMethod[] = [
  {
    id: 'full',
    icon: 'M3 7.5h18v10.5a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 18V7.5zm0-1.5h18M7 15h4',
    tint: '#4F46E5',
    tintBg: '#EEF2FF',
  },
  {
    id: 'split',
    icon: 'M8.5 9.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm7 0a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM3 19.5a5.5 5.5 0 0111 0M14 19.5a5.5 5.5 0 017-5.3',
    tint: '#0D9488',
    tintBg: '#CCFBF1',
  },
  {
    id: 'items',
    icon: 'M9 5h9M9 12h9M9 19h9M4.5 5l1 1 2-2M4.5 12l1 1 2-2M4.5 19l1 1 2-2',
    tint: '#7C3AED',
    tintBg: '#F3E8FF',
  },
  {
    id: 'custom',
    icon: 'M12 6v12M9 9.5a2 2 0 012-2h2.5a2 2 0 010 4h-3a2 2 0 000 4H15',
    tint: '#B45309',
    tintBg: '#FEF3C7',
  },
]

const selectedMethod = ref<MethodId>('full')

const methods = computed(() =>
  methodMeta.map((method) => ({
    ...method,
    title: t(`home.snapay.mockup.method_${method.id}_title`),
    description: t(`home.snapay.mockup.method_${method.id}_desc`),
  })),
)

function goTo(next: Step) {
  step.value = next
}

function restart() {
  selectedMethod.value = 'full'
  step.value = 'invoice'
}

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
  <section id="snapay-spotlight" v-vanish class="relative overflow-hidden py-16 md:py-28">
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
      <h2
        v-reveal
        class="max-w-3xl text-3xl font-black leading-[1.1] tracking-tight text-white md:text-5xl"
      >
        {{ t('home.snapay.title_1') }}
        <span class="text-white/25" aria-hidden="true">—</span>
        <span class="gradient-text">{{ t('home.snapay.title_span') }}</span>
      </h2>

      <div class="mt-10 grid items-center gap-10 md:mt-16 lg:grid-cols-2 lg:gap-14">
        <!-- Izquierda: el producto dentro del marco del dispositivo. -->
        <div v-reveal class="flex flex-col items-center">
          <div class="w-full max-w-[320px]">
            <!-- Marco. El borde y el relleno son la carcasa; el radio interior
                 es menor que el exterior por el grosor del marco, que es lo
                 que hace que las esquinas se lean concéntricas. -->
            <div
              class="relative rounded-[36px] border border-[#30363d] bg-[#0d1117] p-3 shadow-[0_30px_80px_-25px_rgb(0_0_0/0.9)]"
            >
              <div class="relative overflow-hidden rounded-[26px] bg-white">
                <!-- Módulo de cámara -->
                <div
                  class="absolute left-1/2 top-2.5 z-20 flex h-6 w-24 -translate-x-1/2 items-center justify-end rounded-full bg-[#0d1117] pr-2"
                  aria-hidden="true"
                >
                  <span class="h-2.5 w-2.5 rounded-full bg-[#30363d]" />
                </div>

                <!-- Cabecera de la app -->
                <div class="bg-[#4F46E5] px-5 pb-8 pt-11">
                  <div class="flex items-center justify-between gap-3">
                    <p class="truncate text-sm font-bold text-white">{{ t('home.snapay.mockup.venue') }}</p>
                    <span class="flex shrink-0 flex-col gap-[3px]" aria-hidden="true">
                      <span class="h-[3px] w-[3px] rounded-full bg-white/70" />
                      <span class="h-[3px] w-[3px] rounded-full bg-white/70" />
                      <span class="h-[3px] w-[3px] rounded-full bg-white/70" />
                    </span>
                  </div>
                </div>

                <!-- Lámina de contenido -->
                <div class="relative -mt-5 min-h-[452px] rounded-t-[22px] bg-white px-5 pb-6 pt-5">
                  <div :key="step" class="screen">
                    <!-- 1 · Factura -->
                    <template v-if="step === 'invoice'">
                      <p class="text-center text-base font-bold text-[#111827]">
                        {{ t('home.snapay.mockup.invoiceTitle') }}
                        <span class="text-[#6B7280]">—</span>
                        {{ t('home.snapay.mockup.table') }}
                      </p>

                      <div class="mt-4 flex rounded-full bg-[#F3F4F6] p-1">
                        <span class="flex-1 rounded-full bg-[#111827] px-3 py-1.5 text-center text-[11px] font-bold text-white">
                          {{ t('home.snapay.mockup.tabPending') }}
                        </span>
                        <span class="flex-1 px-3 py-1.5 text-center text-[11px] font-bold text-[#6B7280]">
                          {{ t('home.snapay.mockup.tabPaid') }}
                        </span>
                      </div>

                      <ul class="mt-4 flex flex-col divide-y divide-[#E5E7EB]">
                        <li
                          v-for="item in items"
                          :key="item.name"
                          class="flex items-start justify-between gap-3 py-2.5 first:pt-0"
                        >
                          <span class="min-w-0">
                            <span class="flex items-center gap-1.5">
                              <span class="truncate text-[13px] font-semibold text-[#111827]">{{ item.name }}</span>
                              <span class="shrink-0 rounded bg-[#F3F4F6] px-1.5 py-px text-[10px] font-bold tabular-nums text-[#6B7280]">
                                x{{ item.quantity }}
                              </span>
                            </span>
                            <span class="mt-0.5 block text-[11px] tabular-nums text-[#6B7280]">
                              {{ money(item.unitPrice) }} {{ t('home.snapay.mockup.each') }}
                            </span>
                          </span>
                          <span class="shrink-0 text-[13px] font-bold tabular-nums text-[#111827]">
                            {{ money(item.quantity * item.unitPrice) }}
                          </span>
                        </li>
                      </ul>

                      <dl class="mt-4 space-y-1.5 border-t border-dashed border-[#E5E7EB] pt-3">
                        <div class="flex items-center justify-between">
                          <dt class="text-[11px] text-[#6B7280]">{{ t('home.snapay.mockup.subtotal') }}</dt>
                          <dd class="text-[11px] tabular-nums text-[#374151]">{{ money(subtotal) }}</dd>
                        </div>
                        <div class="flex items-center justify-between">
                          <dt class="text-[11px] text-[#6B7280]">{{ t('home.snapay.mockup.taxes') }}</dt>
                          <dd class="text-[11px] tabular-nums text-[#374151]">{{ money(taxes) }}</dd>
                        </div>
                        <div class="flex items-center justify-between pt-1.5">
                          <dt class="text-sm font-bold text-[#111827]">{{ t('home.snapay.mockup.total') }}</dt>
                          <dd class="text-base font-black tabular-nums text-[#111827]">{{ money(total) }}</dd>
                        </div>
                      </dl>

                      <button type="button" class="app-cta app-cta--indigo" @click="goTo('method')">
                        {{ t('home.snapay.mockup.ctaMethod') }}
                      </button>
                    </template>

                    <!-- 2 · Método de pago -->
                    <template v-else-if="step === 'method'">
                      <div role="group" :aria-label="t('home.snapay.mockup.methodGroup')" class="flex flex-col gap-2.5">
                        <button
                          v-for="method in methods"
                          :key="method.id"
                          type="button"
                          :aria-pressed="selectedMethod === method.id"
                          class="flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors duration-200"
                          :class="
                            selectedMethod === method.id
                              ? 'border-[#4F46E5] bg-[#EEF2FF]'
                              : 'border-[#E5E7EB] bg-white'
                          "
                          @click="selectedMethod = method.id"
                        >
                          <span
                            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                            :style="{ backgroundColor: method.tintBg, color: method.tint }"
                            aria-hidden="true"
                          >
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                              <path stroke-linecap="round" stroke-linejoin="round" :d="method.icon" />
                            </svg>
                          </span>
                          <span class="min-w-0">
                            <span class="block text-[13px] font-bold text-[#111827]">{{ method.title }}</span>
                            <span class="mt-0.5 block text-[11px] text-[#6B7280]">{{ method.description }}</span>
                          </span>
                        </button>
                      </div>

                      <button type="button" class="app-cta app-cta--indigo" @click="goTo('paid')">
                        {{ t('home.snapay.mockup.ctaComplete') }}
                      </button>
                      <button
                        type="button"
                        class="mt-2.5 w-full rounded py-1 text-center text-[11px] font-semibold text-[#6B7280] transition-colors hover:text-[#111827]"
                        @click="goTo('invoice')"
                      >
                        {{ t('home.snapay.mockup.back') }}
                      </button>
                    </template>

                    <!-- 3 · Confirmación -->
                    <template v-else>
                      <div class="flex flex-col items-center pt-4 text-center">
                        <span
                          class="flex h-14 w-14 items-center justify-center rounded-full bg-[#DCFCE7] text-[#15803D]"
                          aria-hidden="true"
                        >
                          <svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        <p class="mt-4 text-lg font-black text-[#15803D]">{{ t('home.snapay.mockup.paidTitle') }}</p>
                        <p class="mt-1 text-[11px] text-[#6B7280]">{{ t('home.snapay.mockup.paidSubtitle') }}</p>
                      </div>

                      <dl class="mt-6 space-y-2 border-t border-dashed border-[#E5E7EB] pt-4">
                        <div class="flex items-center justify-between">
                          <dt class="text-[11px] text-[#6B7280]">{{ t('home.snapay.mockup.subtotal') }}</dt>
                          <dd class="text-[11px] tabular-nums text-[#374151]">{{ money(subtotal) }}</dd>
                        </div>
                        <div class="flex items-center justify-between">
                          <dt class="text-[11px] text-[#6B7280]">{{ t('home.snapay.mockup.taxes') }}</dt>
                          <dd class="text-[11px] tabular-nums text-[#374151]">{{ money(taxes) }}</dd>
                        </div>
                        <div class="flex items-center justify-between">
                          <dt class="text-[11px] text-[#6B7280]">{{ t('home.snapay.mockup.tip') }}</dt>
                          <dd class="text-[11px] font-semibold tabular-nums text-[#15803D]">{{ money(tip) }}</dd>
                        </div>
                        <div class="flex items-center justify-between border-t border-[#E5E7EB] pt-3">
                          <dt class="text-sm font-bold text-[#111827]">{{ t('home.snapay.mockup.totalPaid') }}</dt>
                          <dd class="text-base font-black tabular-nums text-[#111827]">{{ money(totalPaid) }}</dd>
                        </div>
                      </dl>

                      <!-- Elemento de la interfaz simulada, NO un control: no
                           existe recibo que descargar en una demo, y un botón
                           que no hace lo que dice es peor que uno que no está.
                           El control real ("reiniciar") vive fuera del marco,
                           donde ya es cromo del sitio y no del producto. -->
                      <p class="app-cta app-cta--green" aria-hidden="true">
                        {{ t('home.snapay.mockup.receipt') }}
                      </p>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-5 flex flex-col items-center gap-2">
            <p class="text-[11px] text-white/50">{{ t('home.snapay.mockup.demoNote') }}</p>
            <button
              v-if="step !== 'invoice'"
              type="button"
              class="rounded text-[11px] font-bold uppercase tracking-[0.14em] text-cobalt-300 transition-colors duration-300 ease-out-expo hover:text-neon-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-300"
              @click="restart()"
            >
              {{ t('home.snapay.mockup.restart') }}
            </button>
          </div>
        </div>

        <!-- Derecha: capacidades, una sola columna. -->
        <div v-reveal="120" class="flex flex-col gap-4">
          <UiSpotlightCard
            v-for="capability in capabilities"
            :key="capability.id"
            as="article"
            :size="420"
            class="flex items-start gap-4 rounded-xl p-5 md:p-6"
          >
            <span
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-neon-500/20 bg-neon-500/10 text-neon-300"
              aria-hidden="true"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" :d="capability.icon" />
              </svg>
            </span>
            <span class="min-w-0">
              <span class="block text-base font-bold tracking-tight text-white">{{ capability.title }}</span>
              <span class="mt-1.5 block text-sm leading-relaxed text-white/50">{{ capability.description }}</span>
            </span>
          </UiSpotlightCard>
        </div>
      </div>

      <div v-reveal class="mt-12 flex justify-center md:mt-16">
        <a
          href="https://snapay.ai"
          target="_blank"
          rel="noopener"
          class="inline-flex items-center gap-2 rounded-lg bg-neon-500 px-7 py-3.5 text-sm font-bold text-brand-900 transition-all duration-300 ease-out-expo hover:-translate-y-0.5 hover:bg-neon-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-300 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-900"
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
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Botón primario dentro de la pantalla simulada. Vive aquí y no como
   utilidad global porque pertenece al lenguaje visual de la app, no al del
   sitio: es la única zona del proyecto donde el indigo está permitido. */
.app-cta {
  margin-top: 1.25rem;
  display: block;
  width: 100%;
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  text-align: center;
  font-size: 0.8125rem;
  font-weight: 700;
  color: #ffffff;
  transition: background-color 0.2s ease;
}

.app-cta--indigo {
  background-color: #4f46e5;
}

.app-cta--indigo:hover {
  background-color: #4338ca;
}

.app-cta--indigo:focus-visible {
  outline: 2px solid #4f46e5;
  outline-offset: 2px;
}

/* #15803D y no el verde más claro de la captura: sobre blanco, el original
   se queda en 3.3:1 y no alcanza el 4.5:1 de AA para texto de este tamaño. */
.app-cta--green {
  background-color: #15803d;
}

/* Sólo se ejecuta al cambiar de paso (`:key="step"` remonta el bloque).
   Anima únicamente opacity/transform: nada que dispare layout. */
.screen {
  animation: screen-in 0.4s var(--ease-out-expo);
}

@keyframes screen-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .screen {
    animation: none;
  }
}
</style>
