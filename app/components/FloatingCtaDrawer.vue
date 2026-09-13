<script setup lang="ts">
/**
 * Floating "Partner / Invest" widget + slide-in lead-capture drawer — ported
 * from the legacy _legacy_html/cta-modal.js + cta-modal.css (present on
 * every legacy page, entirely missing from the app until now). Rebuilt as a
 * single Composition API component instead of imperative DOM injection +
 * `window.openCtaModal()` globals, and posts to server/api/subscribe.post.ts
 * (a Nitro proxy) instead of hitting Brevo directly from the browser.
 *
 * Mounted once, globally, in app/layouts/default.vue (matching the legacy
 * widget's presence on every page).
 */

interface CtaForm {
  name: string
  email: string
  role: DrawerRole
  message: string
  /** Hidden bot trap — must stay empty for real submissions. */
  honeypot: string
  /** Set by the <NuxtTurnstile> widget's v-model; verified server-side. */
  turnstileToken: string
}

interface SubscribeResponse {
  success: boolean
}

// Role values stay pinned to their canonical Spanish string (matching
// server/api/subscribe.post.ts's zod enum) regardless of the active UI
// locale — same convention as ContactSection.vue's service select. Only the
// displayed <option> label is translated.
//
// This drawer is the ecosystem funnel (tester / investor / venture partner),
// deliberately a different option set from the Contact section's B2B service
// list — see ECOSYSTEM_ROLE_OPTIONS in shared/utils/leadSchemas.ts.
const { t } = useI18n()

const roleLabelKeys: Record<EcosystemRole, string> = {
  'Tester de Acceso Anticipado': 'ctaDrawer.form.roleTester',
  'Inversor Ángel / VC': 'ctaDrawer.form.roleInvestor',
  'Socio Estratégico': 'ctaDrawer.form.rolePartner',
}

// Mismas etiquetas que usa ContactSection.vue para su select de servicios:
// es literalmente la misma pregunta, y duplicar las claves haría que las dos
// superficies divergieran en cuanto alguien editara una.
const serviceLabelKeys: Record<ContactService, string> = {
  'Desarrollo de Software a Medida': 'home.contact.form.serviceSoftware',
  'Soluciones de IA e Integración': 'home.contact.form.serviceAi',
  'Aplicaciones Web y Móviles': 'home.contact.form.serviceApps',
  Consultoría: 'home.contact.form.serviceAdvisory',
}

// Abierto/cerrado y contexto viven en useCtaDrawer() para que cualquier
// sección pueda invocar el drawer con su propio copy — ver el composable.
const { isOpen, context, open, close } = useCtaDrawer()

/**
 * Abierto desde /services, el drawer deja de ser el embudo de ecosistema:
 * cambian las opciones del select, la etiqueta del campo, el botón de envío
 * y el mensaje de éxito. El título y el subtítulo ya cambiaban por contexto
 * desde el port original — era el resto del formulario el que se quedaba
 * hablando de testers e inversores.
 */
const isServicesFunnel = computed(() => context.value === 'services')

const roleOptions = computed(() =>
  isServicesFunnel.value
    ? CONTACT_SERVICE_OPTIONS.map((value) => ({ value, label: t(serviceLabelKeys[value]) }))
    : ECOSYSTEM_ROLE_OPTIONS.map((value) => ({ value, label: t(roleLabelKeys[value]) })),
)

function defaultRole(): DrawerRole {
  return context.value === 'services' ? CONTACT_SERVICE_OPTIONS[0] : 'Tester de Acceso Anticipado'
}

function emptyForm(): CtaForm {
  return { name: '', email: '', role: defaultRole(), message: '', honeypot: '', turnstileToken: '' }
}

const isButtonVisible = ref(false)
const form = reactive<CtaForm>(emptyForm())

/** Raíz del diálogo: la necesitan el foco inicial y el ciclo de tabulación. */
const drawerEl = ref<HTMLElement | null>(null)

/** Elemento que tenía el foco antes de abrir, para devolvérselo al cerrar. */
let lastFocused: HTMLElement | null = null

type Status = 'idle' | 'submitting' | 'success' | 'error'
const status = ref<Status>('idle')

// Only needed for a retry within the same open drawer (the widget itself
// gets destroyed/recreated with a fresh token whenever the drawer closes and
// reopens, via the v-if below) — see ContactSection.vue for the fuller
// explanation of why a consumed token needs an explicit reset.
const turnstileWidget = ref<{ reset: () => void } | null>(null)

// Turnstile is wired up end-to-end but intentionally dormant: CorosDev opted
// for the invisible honeypot instead of a visible captcha. With no
// NUXT_PUBLIC_TURNSTILE_SITE_KEY configured the widget is not rendered at
// all, so no Cloudflare script or iframe is requested — the integration only
// wakes up if the key is ever set (server/utils/turnstile.ts mirrors this,
// skipping verification while NUXT_TURNSTILE_SECRET_KEY is unset).
const turnstileEnabled = computed(() => !!useRuntimeConfig().public.turnstile?.siteKey)

const title = computed(() => t(`ctaDrawer.title.${context.value}`))
const subtitle = computed(() => t(`ctaDrawer.subtitle.${context.value}`))

async function handleSubmit() {
  if (status.value === 'submitting') return
  status.value = 'submitting'

  try {
    await $fetch<SubscribeResponse>('/api/subscribe', {
      method: 'POST',
      body: { ...form, context: context.value },
    })
    status.value = 'success'
  } catch {
    status.value = 'error'
    turnstileWidget.value?.reset()
  }
}

/**
 * El reset del formulario cuelga de `isOpen` y no de un `open()` local
 * porque el drawer ya no se abre sólo desde su botón: cualquier sección
 * puede hacerlo vía useCtaDrawer(), y todas esas rutas deben encontrar el
 * formulario limpio.
 *
 * Aquí vive también lo que le faltaba a un `role="dialog" aria-modal="true"`
 * para comportarse como tal: mover el foco dentro al abrir, devolverlo al
 * disparador al cerrar y bloquear el scroll del documento detrás.
 */
watch(isOpen, async (value) => {
  if (!import.meta.client) return

  if (value) {
    lastFocused = document.activeElement as HTMLElement | null
    status.value = 'idle'
    Object.assign(form, emptyForm())
    document.body.style.overflow = 'hidden'
    await nextTick()
    // Se enfoca el contenedor (tabindex="-1"), no el primer campo: enfocar
    // un input abre el teclado del móvil de golpe sobre un panel que el
    // visitante todavía no ha leído.
    drawerEl.value?.focus()
    return
  }

  document.body.style.overflow = ''
  lastFocused?.focus()
  lastFocused = null
})

/**
 * Escape cierra, y Tab queda confinado dentro del diálogo. Sin este ciclo el
 * foco se escapa al contenido de la página que hay detrás del overlay, que
 * es justo lo que `aria-modal` promete al lector de pantalla que no ocurre.
 */
function handleKeydown(event: KeyboardEvent) {
  if (!isOpen.value) return

  if (event.key === 'Escape') {
    close()
    return
  }

  if (event.key !== 'Tab' || !drawerEl.value) return

  const focusables = Array.from(
    drawerEl.value.querySelectorAll<HTMLElement>('a[href], button, input, select, textarea, [tabindex]'),
  ).filter((el) => !el.hasAttribute('disabled') && el.tabIndex !== -1)

  // `tabIndex !== -1` deja fuera el honeypot, que es un input real y
  // enfocable por API aunque ningún visitante deba llegar a él tabulando.
  const first = focusables[0]
  const last = focusables[focusables.length - 1]
  if (!first || !last) return

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

// Reveals the floating trigger once the visitor scrolls past the hero.
// `scrollY` is a cheap read (no forced reflow) — rAF-throttled so a burst of
// scroll events only ever queues one pending update.
let ticking = false
function handleScroll() {
  if (ticking) return
  ticking = true
  requestAnimationFrame(() => {
    isButtonVisible.value = window.scrollY > 300
    ticking = false
  })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('keydown', handleKeydown)
  handleScroll()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('keydown', handleKeydown)
  // Si el componente se desmonta con el drawer abierto, el documento se
  // quedaría bloqueado sin nadie que lo libere.
  if (import.meta.client) document.body.style.overflow = ''
})
</script>

<template>
  <button
    type="button"
    class="cta-floating-btn glass"
    :class="{ 'cta-floating-btn--visible': isButtonVisible }"
    :aria-label="t('ctaDrawer.title.general')"
    @click="open('general')"
  >
    <span class="cta-floating-label">{{ t('ctaDrawer.floatingLabel') }}</span>
    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  </button>

  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="isOpen" class="cta-overlay" @click="close" />
    </Transition>

    <Transition
      enter-active-class="cta-drawer-transition"
      leave-active-class="cta-drawer-transition"
      enter-from-class="cta-drawer--hidden"
      leave-to-class="cta-drawer--hidden"
    >
      <div
        v-if="isOpen"
        ref="drawerEl"
        class="cta-drawer"
        role="dialog"
        aria-modal="true"
        tabindex="-1"
        :aria-label="title"
      >
        <div class="flex items-start justify-between gap-4 border-b border-hairline p-6">
          <div>
            <h3 class="text-xl font-bold tracking-tight text-ink">{{ title }}</h3>
            <p class="mt-1 text-xs text-ink-muted">{{ subtitle }}</p>
          </div>
          <button
            type="button"
            class="rounded-lg border border-hairline p-2 text-ink-muted transition-colors hover:border-neon-500 hover:text-neon-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-300"
            :aria-label="t('ctaDrawer.close')"
            @click="close"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-6">
          <form v-if="status !== 'success'" novalidate @submit.prevent="handleSubmit">
            <div class="mb-5">
              <label for="cta-drawer-name" :class="FORM_LABEL_CLASS">{{ t('ctaDrawer.form.name') }}</label>
              <input
                id="cta-drawer-name"
                v-model="form.name"
                type="text"
                name="name"
                :placeholder="t('ctaDrawer.form.namePlaceholder')"
                autocomplete="name"
                required
                :class="[FORM_FIELD_CLASS, FORM_FIELD_IDLE_CLASS]"
              />
            </div>

            <div class="mb-5">
              <label for="cta-drawer-email" :class="FORM_LABEL_CLASS">{{ t('ctaDrawer.form.email') }}</label>
              <input
                id="cta-drawer-email"
                v-model="form.email"
                type="email"
                name="email"
                :placeholder="t('ctaDrawer.form.emailPlaceholder')"
                autocomplete="email"
                required
                :class="[FORM_FIELD_CLASS, FORM_FIELD_IDLE_CLASS]"
              />
            </div>

            <div class="mb-5">
              <label for="cta-drawer-role" :class="FORM_LABEL_CLASS">
                {{ isServicesFunnel ? t('ctaDrawer.form.roleServices') : t('ctaDrawer.form.role') }}
              </label>
              <!-- The relative wrapper hosts the custom chevron; the native arrow
                   is removed via appearance-none so it cannot render as a
                   dark-on-dark glyph depending on the OS/browser theme. -->
              <div class="relative">
                <select
                  id="cta-drawer-role"
                  v-model="form.role"
                  name="role"
                  :class="[FORM_FIELD_CLASS, FORM_FIELD_IDLE_CLASS, FORM_SELECT_EXTRA_CLASS]"
                >
                  <option
                    v-for="option in roleOptions"
                    :key="option.value"
                    :value="option.value"
                    :class="FORM_OPTION_CLASS"
                  >
                    {{ option.label }}
                  </option>
                </select>
                <svg
                  :class="FORM_SELECT_CHEVRON_CLASS"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2.5"
                  aria-hidden="true"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </div>

            <div class="mb-5">
              <label for="cta-drawer-message" :class="FORM_LABEL_CLASS">
                {{ t('ctaDrawer.form.message') }}
                <span :class="FORM_LABEL_HINT_CLASS">{{ t('ctaDrawer.form.optional') }}</span>
              </label>
              <textarea
                id="cta-drawer-message"
                v-model="form.message"
                name="message"
                rows="3"
                :placeholder="t('ctaDrawer.form.messagePlaceholder')"
                :class="[FORM_FIELD_CLASS, FORM_FIELD_IDLE_CLASS, 'resize-y']"
              />
            </div>

            <!-- Honeypot: hidden from real visitors, validated server-side in subscribe.post.ts. -->
            <div class="absolute left-[-9999px] opacity-0" aria-hidden="true">
              <label for="cta-website">Leave this field empty</label>
              <input
                id="cta-website"
                v-model="form.honeypot"
                type="text"
                name="website"
                tabindex="-1"
                autocomplete="off"
              />
            </div>

            <!-- Cloudflare Turnstile: token verified server-side in
                 subscribe.post.ts via assertTurnstileToken(). -->
            <div v-if="turnstileEnabled" class="mb-5 flex justify-center">
              <NuxtTurnstile ref="turnstileWidget" v-model="form.turnstileToken" />
            </div>

            <button type="submit" :disabled="status === 'submitting'" :class="FORM_SUBMIT_CLASS">
              <span v-if="status === 'submitting'" class="cta-spinner" aria-hidden="true" />
              {{
                status === 'submitting'
                  ? t('ctaDrawer.form.submitting')
                  : isServicesFunnel
                    ? t('ctaDrawer.form.submitServices')
                    : t('ctaDrawer.form.submit')
              }}
            </button>

            <p v-if="status === 'error'" role="alert" class="mt-3 text-center text-xs text-red-600 dark:text-red-400">
              {{ t('ctaDrawer.form.error') }}
            </p>
          </form>

          <div v-else class="flex flex-col items-center py-10 text-center">
            <div class="flex h-16 w-16 items-center justify-center rounded-full bg-neon-500/15 text-neon-300">
              <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h4 class="mt-5 text-xl font-bold text-ink">{{ t('ctaDrawer.form.successTitle') }}</h4>
            <p class="mt-2 max-w-xs text-sm leading-relaxed text-ink-muted">
              {{ isServicesFunnel ? t('ctaDrawer.form.successDescServices') : t('ctaDrawer.form.successDesc') }}
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Loading indicator inside the submit button (matches ContactSection.vue).
   Tracks `--accent-ink` (the button's own text colour) instead of a fixed
   near-black — that text is dark in dark mode but white in light mode
   (`bg-accent`'s button is dark-on-blue vs. white-on-blue), so a hardcoded
   dark ring read fine on dark and went muddy/mismatched on light. */
.cta-spinner {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  border: 2px solid color-mix(in srgb, var(--accent-ink) 25%, transparent);
  border-top-color: color-mix(in srgb, var(--accent-ink) 85%, transparent);
  animation: cta-spin 0.8s linear infinite;
}

@keyframes cta-spin {
  to {
    transform: rotate(360deg);
  }
}

/* ── Floating trigger (bottom-right) ── */
.cta-floating-btn {
  position: fixed;
  right: 1.25rem;
  bottom: 1.25rem;
  z-index: 90;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 0.625rem;
  color: var(--ink);
  cursor: pointer;
  opacity: 0;
  transform: translateY(12px);
  pointer-events: none;
  transition: opacity 0.35s ease, transform 0.35s ease, border-color 0.25s ease;
}

.cta-floating-btn--visible {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.cta-floating-btn:hover {
  border-color: rgb(31 127 255 / 0.5);
}

.cta-floating-label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  white-space: nowrap;
}

@media (max-width: 640px) {
  .cta-floating-label {
    display: none;
  }
}

/* ── Overlay ── */
.cta-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgb(3 5 12 / 0.5);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

/* ── Drawer: slides from the right on desktop, from the bottom on mobile ── */
.cta-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 101;
  display: flex;
  width: 100%;
  max-width: 480px;
  flex-direction: column;
  overflow: hidden;
  /* Bug real reportado: esto era un gradiente fijo (brand-800/900 casi
     opacos) que nunca leía el tema — los labels de arriba (`text-ink` vía
     Tailwind) ya sí lo hacían, y los inputs (`bg-surface-strong/50`, también
     Tailwind) quedaban mezclando su tinte claro CONTRA este fondo oscuro fijo
     de por debajo, el mismo "gris sucio" que ya se vio en ContactModal.vue.
     `color-mix` reproduce la misma alfa casi-opaca (97%/99%) que tenía el
     original, ahora sobre `--surface`/`--surface-strong` — sigue leyendo el
     tema, y el `backdrop-filter` de abajo conserva su efecto "cristal
     esmerilado" en los dos modos en vez de sólo en oscuro. */
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--surface) 97%, transparent) 0%,
    color-mix(in srgb, var(--surface-strong) 99%, transparent) 100%
  );
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border-left: 1px solid var(--hairline);
  box-shadow: -15px 0 50px rgb(0 0 0 / 0.5);
}

.cta-drawer-transition {
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.cta-drawer--hidden {
  transform: translateX(100%);
}

@media (max-width: 640px) {
  .cta-drawer {
    top: auto;
    left: 0;
    max-width: 100%;
    height: 85vh;
    max-height: 720px;
    border-left: none;
    border-top: 1px solid var(--hairline);
    border-radius: 1.5rem 1.5rem 0 0;
  }

  .cta-drawer--hidden {
    transform: translateY(100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .cta-floating-btn,
  .cta-drawer-transition {
    transition: none;
  }

  .cta-spinner {
    animation-duration: 1.6s;
  }
}
</style>
