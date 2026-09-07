<script setup lang="ts">
/**
 * Snapay — vitrina del venture insignia, reconstruida como Bento Grid.
 *
 * El mockup modela el flujo real del producto (factura de mesa → método de
 * pago → confirmación) en DOM puro, no como captura: cero bytes de imagen,
 * cero CLS y texto indexable. Sus datos son de ejemplo y el propio panel lo
 * declara en pantalla — nada aquí debe leerse como un dato real de Snapay.
 *
 * Traducido a la paleta del sitio: superficie #0d1117, bordes #30363d y
 * acento cobalto #1f7fff (neon-500). Los morados y verdes de las capturas
 * originales quedan fuera por la directiva Anti-Slop.
 *
 * Los totales se DERIVAN de las líneas de la comanda en vez de estar
 * escritos a mano. En las capturas de referencia los números no cuadraban
 * (las líneas sumaban L860 pero el subtotal decía L1,030, y un "x4" a L140
 * c/u totalizaba L140); un mockup con aritmética rota es exactamente lo que
 * un CTO detecta en tres segundos. Calculándolos aquí no pueden divergir.
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

const subtotal = computed(() => items.reduce((total, item) => total + item.quantity * item.unitPrice, 0))
const taxes = computed(() => subtotal.value * TAX_RATE)
const total = computed(() => subtotal.value + taxes.value)
const tip = computed(() => subtotal.value * TIP_RATE)
const totalPaid = computed(() => total.value + tip.value)

/**
 * Intl formatea sólo el número; el símbolo "L" del lempira se antepone como
 * texto. Con `style: 'currency'` la posición del símbolo y el espacio duro
 * que Intl inserta difieren entre el ICU de Node y el del navegador, lo que
 * daría un mismatch de hidratación sobre cifras visibles.
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
}

const methodMeta: PaymentMethod[] = [
  { id: 'full', icon: 'M3 7.5h18v10.5a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 18V7.5zm0-1.5h18M7 15h4' },
  { id: 'split', icon: 'M8.5 9.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm7 0a2.5 2.5 0 100-5 2.5 2.5 0 000-5zM3 19.5a5.5 5.5 0 0111 0M14 19.5a5.5 5.5 0 017-5.3' },
  { id: 'items', icon: 'M9 5h9M9 12h9M9 19h9M4.5 5l1 1 2-2M4.5 12l1 1 2-2M4.5 19l1 1 2-2' },
  { id: 'custom', icon: 'M12 6v12M9 9.5a2 2 0 012-2h2.5a2 2 0 010 4h-3a2 2 0 000 4H15' },
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
        <!-- Celda mayor: flujo de producto en DOM puro. -->
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

            <!-- Pantalla del producto -->
            <div class="mt-5 overflow-hidden rounded-xl border border-[#30363d] bg-[#0d1117]">
              <div class="flex items-center justify-between gap-3 border-b border-[#30363d] px-5 py-4">
                <p class="text-sm font-bold text-white">
                  {{ t('home.snapay.mockup.venue') }}
                  <span class="text-white/40">·</span>
                  {{ t('home.snapay.mockup.table') }}
                </p>
                <span
                  class="rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]"
                  :class="
                    step === 'paid'
                      ? 'bg-neon-500/15 text-neon-300'
                      : 'bg-white/[0.06] text-white/50'
                  "
                >
                  {{ step === 'paid' ? t('home.snapay.mockup.tabPaid') : t('home.snapay.mockup.tabPending') }}
                </span>
              </div>

              <div :key="step" class="screen p-5">
                <!-- 1 · Factura -->
                <template v-if="step === 'invoice'">
                  <ul class="flex flex-col divide-y divide-[#30363d]">
                    <li v-for="item in items" :key="item.name" class="flex items-start justify-between gap-4 py-3 first:pt-0">
                      <span class="min-w-0">
                        <span class="flex items-center gap-2">
                          <span class="truncate text-sm font-semibold text-white">{{ item.name }}</span>
                          <span class="shrink-0 rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-white/50">
                            x{{ item.quantity }}
                          </span>
                        </span>
                        <span class="mt-0.5 block text-xs tabular-nums text-white/35">
                          {{ money(item.unitPrice) }} {{ t('home.snapay.mockup.each') }}
                        </span>
                      </span>
                      <span class="shrink-0 text-sm font-bold tabular-nums text-white">
                        {{ money(item.quantity * item.unitPrice) }}
                      </span>
                    </li>
                  </ul>

                  <dl class="mt-5 space-y-2 border-t border-[#30363d] pt-4">
                    <div class="flex items-center justify-between">
                      <dt class="text-xs text-white/45">{{ t('home.snapay.mockup.subtotal') }}</dt>
                      <dd class="text-xs tabular-nums text-white/70">{{ money(subtotal) }}</dd>
                    </div>
                    <div class="flex items-center justify-between">
                      <dt class="text-xs text-white/45">{{ t('home.snapay.mockup.taxes') }}</dt>
                      <dd class="text-xs tabular-nums text-white/70">{{ money(taxes) }}</dd>
                    </div>
                    <div class="flex items-center justify-between border-t border-[#30363d] pt-3">
                      <dt class="text-sm font-bold text-white">{{ t('home.snapay.mockup.total') }}</dt>
                      <dd class="text-lg font-black tabular-nums text-white">{{ money(total) }}</dd>
                    </div>
                  </dl>

                  <button type="button" class="mockup-cta" @click="goTo('method')">
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
                      class="flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors duration-300 ease-out-expo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-300"
                      :class="
                        selectedMethod === method.id
                          ? 'border-neon-500/50 bg-neon-500/10'
                          : 'border-[#30363d] bg-white/[0.02] hover:border-white/25'
                      "
                      @click="selectedMethod = method.id"
                    >
                      <span
                        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border"
                        :class="
                          selectedMethod === method.id
                            ? 'border-neon-500/30 bg-neon-500/15 text-neon-300'
                            : 'border-[#30363d] bg-white/[0.03] text-white/45'
                        "
                        aria-hidden="true"
                      >
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                          <path stroke-linecap="round" stroke-linejoin="round" :d="method.icon" />
                        </svg>
                      </span>
                      <span class="min-w-0">
                        <span class="block text-sm font-semibold text-white">{{ method.title }}</span>
                        <span class="mt-0.5 block text-xs text-white/40">{{ method.description }}</span>
                      </span>
                    </button>
                  </div>

                  <button type="button" class="mockup-cta" @click="goTo('paid')">
                    {{ t('home.snapay.mockup.ctaComplete') }}
                  </button>
                  <button
                    type="button"
                    class="mt-3 w-full text-center text-xs font-semibold text-white/40 transition-colors hover:text-white/70"
                    @click="goTo('invoice')"
                  >
                    {{ t('home.snapay.mockup.back') }}
                  </button>
                </template>

                <!-- 3 · Confirmación -->
                <template v-else>
                  <div class="flex flex-col items-center text-center">
                    <span
                      class="flex h-14 w-14 items-center justify-center rounded-full border border-neon-500/30 bg-neon-500/15 text-neon-300"
                      aria-hidden="true"
                    >
                      <svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <p class="mt-4 text-lg font-black text-white">{{ t('home.snapay.mockup.paidTitle') }}</p>
                    <p class="mt-1 text-xs text-white/45">{{ t('home.snapay.mockup.paidSubtitle') }}</p>
                  </div>

                  <dl class="mt-6 space-y-2 border-t border-[#30363d] pt-4">
                    <div class="flex items-center justify-between">
                      <dt class="text-xs text-white/45">{{ t('home.snapay.mockup.subtotal') }}</dt>
                      <dd class="text-xs tabular-nums text-white/70">{{ money(subtotal) }}</dd>
                    </div>
                    <div class="flex items-center justify-between">
                      <dt class="text-xs text-white/45">{{ t('home.snapay.mockup.taxes') }}</dt>
                      <dd class="text-xs tabular-nums text-white/70">{{ money(taxes) }}</dd>
                    </div>
                    <div class="flex items-center justify-between">
                      <dt class="text-xs text-white/45">{{ t('home.snapay.mockup.tip') }}</dt>
                      <dd class="text-xs tabular-nums text-neon-300">{{ money(tip) }}</dd>
                    </div>
                    <div class="flex items-center justify-between border-t border-[#30363d] pt-3">
                      <dt class="text-sm font-bold text-white">{{ t('home.snapay.mockup.totalPaid') }}</dt>
                      <dd class="text-lg font-black tabular-nums text-white">{{ money(totalPaid) }}</dd>
                    </div>
                  </dl>

                  <button type="button" class="mockup-cta" @click="restart()">
                    {{ t('home.snapay.mockup.restart') }}
                  </button>
                </template>
              </div>
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
/* Botón primario de la pantalla del mockup: se repite en los tres pasos y
   vive aquí, no como utilidad global, porque pertenece al lenguaje visual
   del dispositivo simulado, no al del sitio. */
.mockup-cta {
  margin-top: 1.25rem;
  width: 100%;
  border-radius: 0.5rem;
  background-color: var(--color-neon-500);
  padding: 0.75rem 1rem;
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--color-brand-900);
  transition: background-color 0.3s var(--ease-out-expo);
}

.mockup-cta:hover {
  background-color: var(--color-neon-300);
}

.mockup-cta:focus-visible {
  outline: 2px solid var(--color-neon-300);
  outline-offset: 2px;
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
