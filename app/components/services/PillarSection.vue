<script setup lang="ts">
/**
 * Un pilar de /services: Problema → Solución → Por qué CorosDev → Entregables
 * → CTA, siempre en ese orden. Antes había un bento de 6 tarjetas de
 * "servicios" (item1..item6, ver historial de services.engagements) que
 * mezclaba capacidades (IA, Full-Stack, Marketing, SEO, Cloud, Elite Squad)
 * sin conectarlas a un dolor de negocio concreto. Ese contenido no
 * desaparece: item1/item2 alimentan el "por qué" de #custom-software,
 * item5/item6 el de #tech-partnership. item3/item4 (Marketing, SEO) no
 * encajan en ninguno de los 3 pilares del negocio (Build/Scale/Transform,
 * ver home.services y la pág. 5 del deck comercial) y se quedan fuera de
 * esta página a propósito.
 *
 * Componente único invocado 3 veces desde services.vue en vez de 3
 * componentes casi idénticos: la estructura narrativa es un contrato (nadie
 * puede "saltarse" el Por qué o los KPIs) y el contenido vive 100% en
 * i18n bajo `services.pillars.${pillarKey}_*`, igual que el patrón ya usado
 * por MethodologySection/EngagementsSection (loop sobre ids).
 *
 * `scroll-mt-*` compensa el navbar fijo (AppNavbar, ~72px/~90px alto) más
 * PillarNav.vue sticky debajo de él (~48px) para que el anchor #id no quede
 * tapado al hacer scroll-to. Si cambia la altura de cualquiera de los dos,
 * este valor hay que revisarlo a mano (no hay una sola fuente de verdad para
 * "alto del header" todavía).
 */
const props = defineProps<{
  anchorId: string
  pillarKey: 'customSoftware' | 'scalingTalent' | 'techPartnership'
  icon: string
  reverse?: boolean
}>()

const { t } = useI18n()
const { open: openCtaDrawer } = useCtaDrawer()

const key = (suffix: string) => `services.pillars.${props.pillarKey}_${suffix}`

const badge = computed(() => t(key('badge')))
const navLabel = computed(() => t(key('nav')))
const title = computed(() => t(key('title')))
const pain = computed(() => t(key('pain')))
const solution = computed(() => t(key('solution')))
const whys = computed(() => [t(key('why1')), t(key('why2')), t(key('why3'))])
const kpis = computed(() => [t(key('kpi1')), t(key('kpi2')), t(key('kpi3')), t(key('kpi4'))])
const cta = computed(() => t(key('cta')))
</script>

<template>
  <section
    :id="anchorId"
    class="relative z-10 scroll-mt-32 overflow-hidden py-16 md:scroll-mt-36 md:py-24"
    :class="reverse ? 'bg-surface-muted/40' : ''"
  >
    <div class="mx-auto max-w-7xl px-6">
      <div v-reveal class="grid gap-10 lg:grid-cols-12 lg:gap-16" :class="reverse ? 'lg:[direction:rtl]' : ''">
        <!-- Columna narrativa: dolor + solución -->
        <div class="lg:col-span-7" :class="reverse ? 'lg:[direction:ltr]' : ''">
          <div
            class="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-neon-500/30 bg-neon-500/10 text-neon-300"
            aria-hidden="true"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6">
              <path stroke-linecap="round" stroke-linejoin="round" :d="icon" />
            </svg>
          </div>

          <p class="mb-3 text-[11px] font-bold uppercase tracking-[0.3em] text-accent-text">
            {{ badge }} · {{ navLabel }}
          </p>
          <h2 class="text-3xl font-black leading-[1.1] tracking-tight text-ink md:text-5xl">
            {{ title }}
          </h2>

          <div class="mt-8 space-y-6">
            <div class="rounded-xl border border-hairline bg-surface-strong/50 p-6">
              <p class="text-[11px] font-bold uppercase tracking-widest text-ink-muted">
                {{ t('services.pillars.painLabel') }}
              </p>
              <p class="mt-2 leading-relaxed text-ink">{{ pain }}</p>
            </div>

            <div>
              <p class="text-[11px] font-bold uppercase tracking-widest text-accent-text">
                {{ t('services.pillars.solutionLabel') }}
              </p>
              <p class="mt-2 leading-relaxed text-ink-muted">{{ solution }}</p>
            </div>
          </div>

          <button
            type="button"
            class="mt-9 inline-flex items-center gap-2 rounded-lg bg-neon-500 px-6 py-3.5 text-sm font-bold text-brand-900 transition-all duration-300 ease-out-expo hover:-translate-y-0.5 hover:bg-neon-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-300 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-900"
            @click="openCtaDrawer('services')"
          >
            {{ cta }}
            <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>

        <!-- Columna de confianza: por qué CorosDev + entregables/KPIs -->
        <div class="lg:col-span-5" :class="reverse ? 'lg:[direction:ltr]' : ''">
          <UiSpotlightCard as="div" :size="420" class="flex h-full flex-col gap-8 rounded-xl p-7">
            <div>
              <p class="mb-4 text-[11px] font-bold uppercase tracking-widest text-ink-muted">
                {{ t('services.pillars.whyLabel') }}
              </p>
              <ul class="space-y-3">
                <li v-for="why in whys" :key="why" class="flex items-start gap-2.5">
                  <svg class="mt-0.5 h-4 w-4 shrink-0 text-accent-text" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span class="text-sm leading-relaxed text-ink">{{ why }}</span>
                </li>
              </ul>
            </div>

            <div class="border-t border-hairline pt-6">
              <p class="mb-4 text-[11px] font-bold uppercase tracking-widest text-ink-muted">
                {{ t('services.pillars.kpiLabel') }}
              </p>
              <ul class="grid gap-2.5 sm:grid-cols-2">
                <li
                  v-for="kpi in kpis"
                  :key="kpi"
                  class="rounded-lg border border-hairline bg-surface/60 px-3 py-2.5 text-xs font-semibold leading-snug text-ink-muted"
                >
                  {{ kpi }}
                </li>
              </ul>
            </div>
          </UiSpotlightCard>
        </div>
      </div>
    </div>
  </section>
</template>
