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

type Context = 'general' | 'ecosystem' | 'services' | 'partners'

interface CtaForm {
  name: string
  email: string
  role: EcosystemRole
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
const DEFAULT_ROLE: EcosystemRole = 'Tester de Acceso Anticipado'

const { t } = useI18n()

const roleLabelKeys: Record<EcosystemRole, string> = {
  'Tester de Acceso Anticipado': 'ctaDrawer.form.roleTester',
  'Inversor Ángel / VC': 'ctaDrawer.form.roleInvestor',
  'Socio Estratégico': 'ctaDrawer.form.rolePartner',
}

const roleOptions = computed(() =>
  ECOSYSTEM_ROLE_OPTIONS.map((value) => ({ value, label: t(roleLabelKeys[value]) })),
)

function emptyForm(): CtaForm {
  return { name: '', email: '', role: DEFAULT_ROLE, message: '', honeypot: '', turnstileToken: '' }
}

const isOpen = ref(false)
const isButtonVisible = ref(false)
const context = ref<Context>('general')
const form = reactive<CtaForm>(emptyForm())

type Status = 'idle' | 'submitting' | 'success' | 'error'
const status = ref<Status>('idle')

// Only needed for a retry within the same open drawer (the widget itself
// gets destroyed/recreated with a fresh token whenever the drawer closes and
// reopens, via the v-if below) — see ContactSection.vue for the fuller
// explanation of why a consumed token needs an explicit reset.
const turnstileWidget = ref<{ reset: () => void } | null>(null)

const title = computed(() => t(`ctaDrawer.title.${context.value}`))
const subtitle = computed(() => t(`ctaDrawer.subtitle.${context.value}`))

function open(ctx: Context = 'general') {
  context.value = ctx
  status.value = 'idle'
  Object.assign(form, emptyForm())
  isOpen.value = true
}

function close() {
  isOpen.value = false
}

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
  handleScroll()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
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
      <div v-if="isOpen" class="cta-drawer" role="dialog" aria-modal="true" :aria-label="title">
        <div class="flex items-start justify-between gap-4 border-b border-white/10 p-6">
          <div>
            <h3 class="text-xl font-bold tracking-tight text-white">{{ title }}</h3>
            <p class="mt-1 text-xs text-white/50">{{ subtitle }}</p>
          </div>
          <button
            type="button"
            class="rounded-full border border-white/10 p-2 text-white/70 transition-colors hover:border-neon-500 hover:text-neon-300"
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
              <label for="cta-drawer-role" :class="FORM_LABEL_CLASS">{{ t('ctaDrawer.form.role') }}</label>
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
            <div class="mb-5 flex justify-center">
              <NuxtTurnstile ref="turnstileWidget" v-model="form.turnstileToken" />
            </div>

            <button type="submit" :disabled="status === 'submitting'" :class="FORM_SUBMIT_CLASS">
              <span v-if="status === 'submitting'" class="cta-spinner" aria-hidden="true" />
              {{ status === 'submitting' ? t('ctaDrawer.form.submitting') : t('ctaDrawer.form.submit') }}
            </button>

            <p v-if="status === 'error'" role="alert" class="mt-3 text-center text-xs text-red-400">
              {{ t('ctaDrawer.form.error') }}
            </p>
          </form>

          <div v-else class="flex flex-col items-center py-10 text-center">
            <div class="flex h-16 w-16 items-center justify-center rounded-full bg-neon-500/15 text-neon-300">
              <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h4 class="mt-5 text-xl font-bold text-white">{{ t('ctaDrawer.form.successTitle') }}</h4>
            <p class="mt-2 max-w-xs text-sm leading-relaxed text-white/60">{{ t('ctaDrawer.form.successDesc') }}</p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Loading indicator inside the submit button (matches ContactSection.vue). */
.cta-spinner {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  border: 2px solid rgb(7 11 26 / 0.25);
  border-top-color: rgb(7 11 26 / 0.85);
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
  border-radius: 999px;
  color: #ffffff;
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
  background: linear-gradient(135deg, rgb(11 18 38 / 0.97) 0%, rgb(7 11 26 / 0.99) 100%);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border-left: 1px solid rgb(31 127 255 / 0.15);
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
    border-top: 1px solid rgb(31 127 255 / 0.15);
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
