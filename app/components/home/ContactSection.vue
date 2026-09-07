<script setup lang="ts">
/**
 * Validates against the exact same `contactSchema` server/api/contact.post.ts
 * uses (shared/utils/leadSchemas.ts, auto-imported on both sides) — this is
 * a UX nicety (surface errors before a round-trip), the server's own
 * `safeParse` on the same schema is what's actually authoritative.
 *
 * The `interest` option VALUES stay pinned to their canonical Spanish string
 * (CONTACT_SERVICE_OPTIONS, matching the server's zod enum) regardless of the
 * active UI locale — only the displayed <option> label is translated. This
 * form is the B2B services funnel; FloatingCtaDrawer.vue is the separate
 * ecosystem/investor funnel with its own option set.
 *
 * Success/error UI mirrors FloatingCtaDrawer.vue's pattern (full-form swap
 * on success, not just an inline line of text) for consistency between the
 * two lead-capture surfaces in the app.
 */
type ContactField = 'name' | 'email' | 'company' | 'interest' | 'message'

interface ContactForm {
  name: string
  email: string
  company: string
  /** '' while the select still sits on its placeholder option. */
  interest: ContactService | ''
  message: string
  /** Hidden bot trap — must stay empty for real submissions. */
  honeypot: string
  /** Set by the <NuxtTurnstile> widget's v-model; verified server-side. */
  turnstileToken: string
}

interface ContactResponse {
  success: boolean
}

const { t } = useI18n()

// Values stay pinned to CONTACT_SERVICE_OPTIONS (the server's zod enum);
// only the displayed label is translated.
const serviceLabelKeys: Record<ContactService, string> = {
  'Desarrollo de Software a Medida': 'home.contact.form.serviceSoftware',
  'Soluciones de IA e Integración': 'home.contact.form.serviceAi',
  'Aplicaciones Web y Móviles': 'home.contact.form.serviceApps',
  Consultoría: 'home.contact.form.serviceAdvisory',
}

const interestOptions = computed(() =>
  CONTACT_SERVICE_OPTIONS.map((value) => ({ value, label: t(serviceLabelKeys[value]) })),
)

const { open: openCtaDrawer } = useCtaDrawer()

/**
 * Canales directos de la columna lateral. Sólo se listan vías que existen y
 * están atendidas — un canal decorativo (una dirección genérica que nadie
 * lee) es peor que un canal menos.
 *
 * El tercero no es un enlace: abre el drawer de ecosistema, que ya está
 * conectado a Brevo con su propia lista. Es el embudo de inversores y
 * partners, distinto del formulario de servicios que vive a la derecha.
 */
interface Channel {
  id: 'whatsapp' | 'email' | 'ecosystem'
  /** `null` ⇒ no navega: dispara el drawer. */
  href: string | null
  external: boolean
  icon: string
  /**
   * Valor mostrado, literal cuando es un dato de contacto. Un correo o un
   * teléfono no son texto traducible, y además vue-i18n lee la `@` de un
   * email como sintaxis de mensaje enlazado (`@:clave`): meterlo en el JSON
   * de locales rompe la compilación del idioma entero con un 500 en SSR.
   * `null` ⇒ el valor sí sale de i18n.
   */
  value: string | null
}

const channelMeta: Channel[] = [
  {
    id: 'whatsapp',
    href: 'https://wa.me/50431750453',
    external: true,
    value: '+504 3175-0453',
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
  },
  {
    id: 'email',
    href: 'mailto:info@corosdev.com',
    external: false,
    value: 'info@corosdev.com',
    icon: 'M3 6.75l9 6 9-6M4.5 5.25h15a1.5 1.5 0 011.5 1.5v10.5a1.5 1.5 0 01-1.5 1.5h-15a1.5 1.5 0 01-1.5-1.5V6.75a1.5 1.5 0 011.5-1.5z',
  },
  {
    id: 'ecosystem',
    href: null,
    external: false,
    value: null,
    icon: 'M17.5 6.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM7 12a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm10.5 5.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM7.2 10.9l5.2-3.1m0 8.4l-5.2-3.1',
  },
]

const channels = computed(() =>
  channelMeta.map((channel) => ({
    ...channel,
    title: t(`home.contact.channels.${channel.id}_title`),
    value: channel.value ?? t(`home.contact.channels.${channel.id}_value`),
  })),
)

function activateChannel(channel: Channel) {
  // Los canales con href navegan solos; este handler existe sólo para el
  // que no lo tiene.
  if (channel.href) return
  openCtaDrawer('ecosystem')
}

const commitments = computed(() => [
  t('home.contact.commitments.item1'),
  t('home.contact.commitments.item2'),
  t('home.contact.commitments.item3'),
])

function emptyForm(): ContactForm {
  return {
    name: '',
    email: '',
    company: '',
    // Deliberately empty: the placeholder option below is not submittable,
    // so an untouched select fails validation instead of silently tagging
    // every lead with whichever service happens to be listed first.
    interest: '',
    message: '',
    honeypot: '',
    turnstileToken: '',
  }
}

const form = reactive<ContactForm>(emptyForm())

// Only fields a visitor has blurred (or tried to submit) show an error —
// nothing appears red before they've interacted with the form.
const fieldErrors = reactive<Partial<Record<ContactField, string>>>({})

const errorMessageKeys: Record<ContactField, string> = {
  name: 'home.contact.form.errors.name',
  email: 'home.contact.form.errors.email',
  company: 'home.contact.form.errors.company',
  interest: 'home.contact.form.errors.interest',
  message: 'home.contact.form.errors.message',
}

function validateField(field: ContactField) {
  const result = contactSchema.safeParse(form)
  if (result.success) {
    delete fieldErrors[field]
    return
  }
  const hasIssue = result.error.issues.some((issue) => issue.path[0] === field)
  if (hasIssue) {
    fieldErrors[field] = t(errorMessageKeys[field])
  } else {
    delete fieldErrors[field]
  }
}

// Border colour is applied separately from FORM_FIELD_CLASS so the invalid
// state can swap it cleanly — two competing `border-*` utilities on one
// element resolve by CSS source order, not by class attribute order.
function fieldClass(field: ContactField) {
  return [FORM_FIELD_CLASS, fieldErrors[field] ? FORM_FIELD_ERROR_CLASS : FORM_FIELD_IDLE_CLASS]
}

const hasVisibleErrors = computed(() => Object.keys(fieldErrors).length > 0)

type Status = 'idle' | 'submitting' | 'success' | 'error'
const status = ref<Status>('idle')

// Cloudflare invalidates a Turnstile token the moment it's checked server-side
// — win or lose — so both a failed submission (retry) and a fresh one after
// success need a new token, not the same consumed one still sitting in `form`.
const turnstileWidget = ref<{ reset: () => void } | null>(null)

// Turnstile is wired up end-to-end but intentionally dormant: CorosDev opted
// for the invisible honeypot instead of a visible captcha. With no
// NUXT_PUBLIC_TURNSTILE_SITE_KEY configured the widget is not rendered at
// all, so no Cloudflare script or iframe is requested — the integration only
// wakes up if the key is ever set (server/utils/turnstile.ts mirrors this,
// skipping verification while NUXT_TURNSTILE_SECRET_KEY is unset).
const turnstileEnabled = computed(() => !!useRuntimeConfig().public.turnstile?.siteKey)

async function handleSubmit() {
  if (status.value === 'submitting') return

  ;(Object.keys(errorMessageKeys) as ContactField[]).forEach(validateField)
  if (hasVisibleErrors.value) return

  status.value = 'submitting'

  try {
    await $fetch<ContactResponse>('/api/contact', {
      method: 'POST',
      body: form,
    })
    // Se captura antes de cualquier reset para que el paso 2 sepa a qué
    // contacto de Brevo se está añadiendo el contexto.
    qualifyEmail.value = form.email
    status.value = 'success'
  } catch {
    status.value = 'error'
    turnstileWidget.value?.reset()
  }
}

/**
 * Paso 2: cualificación opcional, ofrecida SÓLO tras un envío correcto.
 *
 * El correo se guarda aparte y no se lee de `form` porque `resetForm()` lo
 * vacía — y este paso tiene que seguir sabiendo a qué contacto de Brevo
 * pertenece incluso si el visitante abre otro formulario.
 */
const qualifyEmail = ref('')
const qualifyForm = reactive({ budget: '' as BudgetRange | '', profile: '' as CompanyProfile | '', honeypot: '' })
const qualifyStatus = ref<Status>('idle')
const qualifyDismissed = ref(false)

const profileLabelKeys: Record<CompanyProfile, string> = {
  'Startup en fase temprana': 'home.contact.form.qualify.profileStartup',
  'Scale-up en crecimiento': 'home.contact.form.qualify.profileScaleup',
  'Empresa consolidada': 'home.contact.form.qualify.profileEnterprise',
  'Agencia o consultora': 'home.contact.form.qualify.profileAgency',
}

const profileOptions = computed(() =>
  COMPANY_PROFILE_OPTIONS.map((value) => ({ value, label: t(profileLabelKeys[value]) })),
)

/** El paso 2 sólo tiene sentido con ambos datos elegidos. */
const canSubmitQualify = computed(() => !!qualifyForm.budget && !!qualifyForm.profile)

async function submitQualify() {
  if (!canSubmitQualify.value || qualifyStatus.value === 'submitting') return

  qualifyStatus.value = 'submitting'

  try {
    await $fetch('/api/qualify', {
      method: 'POST',
      body: { ...qualifyForm, email: qualifyEmail.value },
    })
    qualifyStatus.value = 'success'
  } catch {
    // Un fallo aquí no es un lead perdido: el del paso 1 ya está guardado,
    // y el copy del error lo dice explícitamente para que nadie reintente
    // creyendo que su solicitud no llegó.
    qualifyStatus.value = 'error'
  }
}

function resetForm() {
  Object.assign(form, emptyForm())
  Object.keys(fieldErrors).forEach((key) => delete fieldErrors[key as ContactField])
  status.value = 'idle'
  Object.assign(qualifyForm, { budget: '', profile: '', honeypot: '' })
  qualifyStatus.value = 'idle'
  qualifyDismissed.value = false
  turnstileWidget.value?.reset()
}
</script>
<template>
  <section id="contact" class="py-10 md:py-20">
    <div class="mx-auto max-w-7xl px-6">
      <div class="grid items-start gap-10 md:grid-cols-2 lg:gap-14">
        <div v-reveal>
          <h2 class="text-3xl font-black leading-[1.1] tracking-tight text-white md:text-5xl">
            {{ t('home.contact.h2') }}
          </h2>
          <p class="mt-4 max-w-md text-base leading-relaxed text-white/55">{{ t('home.contact.sub') }}</p>

          <p class="mb-3 mt-10 text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
            {{ t('home.contact.channels.label') }}
          </p>
          <div class="flex flex-col gap-3">
            <UiSpotlightCard
              v-for="channel in channels"
              :key="channel.id"
              :as="channel.href ? 'a' : 'button'"
              :href="channel.href ?? undefined"
              :type="channel.href ? undefined : 'button'"
              :target="channel.external ? '_blank' : undefined"
              :rel="channel.external ? 'noopener' : undefined"
              :size="300"
              class="group/channel flex w-full items-center gap-4 rounded-lg p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-300"
              @click="activateChannel(channel)"
            >
              <span
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-neon-500/20 bg-neon-500/10 text-neon-300"
                aria-hidden="true"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round" :d="channel.icon" />
                </svg>
              </span>
              <span class="min-w-0 flex-1">
                <span class="block text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
                  {{ channel.title }}
                </span>
                <span class="mt-0.5 block truncate text-sm font-semibold text-white">{{ channel.value }}</span>
              </span>
              <svg
                class="h-4 w-4 shrink-0 text-white/30 transition-transform duration-300 ease-out-expo group-hover/channel:translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </UiSpotlightCard>
          </div>

          <p class="mb-3 mt-10 text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
            {{ t('home.contact.commitments.label') }}
          </p>
          <ul class="flex flex-col gap-2.5">
            <li v-for="commitment in commitments" :key="commitment" class="flex items-start gap-2.5">
              <svg
                class="mt-0.5 h-4 w-4 shrink-0 text-neon-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2.2"
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span class="text-sm leading-relaxed text-white/60">{{ commitment }}</span>
            </li>
          </ul>

          <p class="mt-10 border-t border-white/10 pt-5 text-xs text-white/35">
            {{ t('home.contact.location') }} &middot; {{ t('home.contact.remote') }}
          </p>
        </div>

        <UiSpotlightCard v-reveal="120" :size="560" class="rounded-2xl p-6 sm:p-8">
          <form v-if="status !== 'success'" novalidate @submit.prevent="handleSubmit">
            <div class="sm:grid sm:grid-cols-2 sm:gap-x-4">
              <div class="mb-5">
                <label for="contact-name" :class="FORM_LABEL_CLASS">
                  {{ t('home.contact.form.nameLabel') }}
                </label>
                <input
                  id="contact-name"
                  v-model="form.name"
                  type="text"
                  name="name"
                  :placeholder="t('home.contact.form.namePlaceholder')"
                  autocomplete="name"
                  required
                  :aria-invalid="!!fieldErrors.name"
                  :aria-describedby="fieldErrors.name ? 'contact-name-error' : undefined"
                  :class="fieldClass('name')"
                  @blur="validateField('name')"
                />
                <p v-if="fieldErrors.name" id="contact-name-error" :class="FORM_ERROR_TEXT_CLASS">
                  {{ fieldErrors.name }}
                </p>
              </div>

              <div class="mb-5">
                <label for="contact-email" :class="FORM_LABEL_CLASS">
                  {{ t('home.contact.form.emailLabel') }}
                </label>
                <input
                  id="contact-email"
                  v-model="form.email"
                  type="email"
                  name="email"
                  :placeholder="t('home.contact.form.emailPlaceholder')"
                  autocomplete="email"
                  required
                  :aria-invalid="!!fieldErrors.email"
                  :aria-describedby="fieldErrors.email ? 'contact-email-error' : undefined"
                  :class="fieldClass('email')"
                  @blur="validateField('email')"
                />
                <p v-if="fieldErrors.email" id="contact-email-error" :class="FORM_ERROR_TEXT_CLASS">
                  {{ fieldErrors.email }}
                </p>
              </div>
            </div>

            <div>
              <div class="mb-5">
                <label for="contact-company" :class="FORM_LABEL_CLASS">
                  {{ t('home.contact.form.companyLabel') }}
                  <span :class="FORM_LABEL_HINT_CLASS">{{ t('home.contact.form.optional') }}</span>
                </label>
                <input
                  id="contact-company"
                  v-model="form.company"
                  type="text"
                  name="company"
                  :placeholder="t('home.contact.form.companyPlaceholder')"
                  autocomplete="organization"
                  :aria-invalid="!!fieldErrors.company"
                  :aria-describedby="fieldErrors.company ? 'contact-company-error' : undefined"
                  :class="fieldClass('company')"
                  @blur="validateField('company')"
                />
                <p v-if="fieldErrors.company" id="contact-company-error" :class="FORM_ERROR_TEXT_CLASS">
                  {{ fieldErrors.company }}
                </p>
              </div>

              <div class="mb-5">
                <label for="contact-interest" :class="FORM_LABEL_CLASS">
                  {{ t('home.contact.form.interestLabel') }}
                </label>
                <!-- The relative wrapper hosts the custom chevron; the native arrow
                     is removed via appearance-none so it cannot render as a
                     dark-on-dark glyph depending on the OS/browser theme. -->
                <div class="relative">
                  <select
                    id="contact-interest"
                    v-model="form.interest"
                    name="interest"
                    :aria-invalid="!!fieldErrors.interest"
                    :aria-describedby="fieldErrors.interest ? 'contact-interest-error' : undefined"
                    :class="[
                      fieldClass('interest'),
                      FORM_SELECT_EXTRA_CLASS,
                      { 'is-placeholder': !form.interest },
                    ]"
                    @change="validateField('interest')"
                  >
                    <!-- Not submittable: zod rejects '' so an untouched select
                         surfaces the "pick a service" error rather than
                         defaulting the lead to an arbitrary service. -->
                    <option value="" disabled :class="FORM_OPTION_CLASS">
                      {{ t('home.contact.form.servicePlaceholder') }}
                    </option>
                    <option
                      v-for="option in interestOptions"
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
                <p v-if="fieldErrors.interest" id="contact-interest-error" :class="FORM_ERROR_TEXT_CLASS">
                  {{ fieldErrors.interest }}
                </p>
              </div>
            </div>

            <div class="mb-5">
              <label for="contact-message" :class="FORM_LABEL_CLASS">
                {{ t('home.contact.form.messageLabel') }}
                <span :class="FORM_LABEL_HINT_CLASS">{{ t('home.contact.form.optional') }}</span>
              </label>
              <textarea
                id="contact-message"
                v-model="form.message"
                name="message"
                rows="4"
                :placeholder="t('home.contact.form.messagePlaceholder')"
                :aria-invalid="!!fieldErrors.message"
                :aria-describedby="fieldErrors.message ? 'contact-message-error' : undefined"
                :class="[fieldClass('message'), 'resize-y']"
                @blur="validateField('message')"
              />
              <p v-if="fieldErrors.message" id="contact-message-error" :class="FORM_ERROR_TEXT_CLASS">
                {{ fieldErrors.message }}
              </p>
            </div>

            <!-- Honeypot: hidden from real visitors, validated server-side in contact.post.ts. -->
            <div class="absolute left-[-9999px] opacity-0" aria-hidden="true">
              <label for="website">Leave this field empty</label>
              <input
                id="website"
                v-model="form.honeypot"
                type="text"
                name="website"
                tabindex="-1"
                autocomplete="off"
              />
            </div>

            <!-- Cloudflare Turnstile: token verified server-side in
                 contact.post.ts via assertTurnstileToken(). Renders as an
                 empty/invisible box when no site key is configured (e.g. a
                 build without NUXT_PUBLIC_TURNSTILE_SITE_KEY set); harmless,
                 since the server-side check bypasses verification in that
                 same "not configured" case. -->
            <div v-if="turnstileEnabled" class="mb-5 flex justify-center">
              <NuxtTurnstile ref="turnstileWidget" v-model="form.turnstileToken" />
            </div>

            <button type="submit" :disabled="status === 'submitting' || hasVisibleErrors" :class="FORM_SUBMIT_CLASS">
              <span v-if="status === 'submitting'" class="contact-spinner" aria-hidden="true" />
              {{ status === 'submitting' ? t('home.contact.form.submitting') : t('home.contact.form.submit') }}
            </button>

            <p v-if="status === 'error'" role="alert" class="mt-3 text-center text-xs text-red-400">
              {{ t('home.contact.form.error') }}
            </p>
          </form>

          <div v-else class="flex flex-col items-center py-10 text-center">
            <div class="flex h-16 w-16 items-center justify-center rounded-full bg-neon-500/15 text-neon-300">
              <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h4 class="mt-5 text-xl font-bold text-white">{{ t('home.contact.form.successTitle') }}</h4>
            <p class="mt-2 max-w-xs text-sm leading-relaxed text-white/60">{{ t('home.contact.form.successDesc') }}</p>

            <!-- Paso 2: cualificación opcional. El lead del paso 1 ya está
                 guardado, así que abandonar aquí no cuesta nada. -->
            <form
              v-if="qualifyStatus !== 'success' && !qualifyDismissed"
              class="mt-8 w-full border-t border-white/10 pt-8 text-left"
              novalidate
              @submit.prevent="submitQualify"
            >
              <p class="text-sm font-bold text-white">{{ t('home.contact.form.qualify.title') }}</p>
              <p class="mt-1.5 text-xs leading-relaxed text-white/50">{{ t('home.contact.form.qualify.desc') }}</p>

              <fieldset class="mt-6">
                <legend :class="FORM_LABEL_CLASS">{{ t('home.contact.form.qualify.budgetLabel') }}</legend>
                <div class="mt-1 grid grid-cols-2 gap-2">
                  <button
                    v-for="range in BUDGET_RANGE_OPTIONS"
                    :key="range"
                    type="button"
                    :aria-pressed="qualifyForm.budget === range"
                    class="rounded-lg border px-3 py-2.5 text-xs font-bold tabular-nums transition-colors duration-300 ease-out-expo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-300"
                    :class="
                      qualifyForm.budget === range
                        ? 'border-neon-500/50 bg-neon-500/15 text-neon-100'
                        : 'border-white/10 bg-white/[0.02] text-white/55 hover:border-white/25 hover:text-white'
                    "
                    @click="qualifyForm.budget = range"
                  >
                    {{ range }}
                  </button>
                </div>
              </fieldset>

              <div class="mt-5">
                <label for="qualify-profile" :class="FORM_LABEL_CLASS">
                  {{ t('home.contact.form.qualify.profileLabel') }}
                </label>
                <div class="relative">
                  <select
                    id="qualify-profile"
                    v-model="qualifyForm.profile"
                    name="profile"
                    :class="[
                      FORM_FIELD_CLASS,
                      FORM_FIELD_IDLE_CLASS,
                      FORM_SELECT_EXTRA_CLASS,
                      { 'is-placeholder': !qualifyForm.profile },
                    ]"
                  >
                    <option value="" disabled :class="FORM_OPTION_CLASS">
                      {{ t('home.contact.form.servicePlaceholder') }}
                    </option>
                    <option
                      v-for="option in profileOptions"
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

              <!-- Honeypot: mismo patrón que el paso 1, validado en qualify.post.ts. -->
              <div class="absolute left-[-9999px] opacity-0" aria-hidden="true">
                <label for="qualify-website">Leave this field empty</label>
                <input
                  id="qualify-website"
                  v-model="qualifyForm.honeypot"
                  type="text"
                  name="website"
                  tabindex="-1"
                  autocomplete="off"
                />
              </div>

              <div class="mt-6 flex items-center gap-4">
                <button
                  type="submit"
                  :disabled="!canSubmitQualify || qualifyStatus === 'submitting'"
                  class="inline-flex items-center justify-center gap-2 rounded-lg bg-neon-500 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-brand-900 transition-all duration-300 ease-out-expo hover:bg-neon-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span v-if="qualifyStatus === 'submitting'" class="contact-spinner" aria-hidden="true" />
                  {{
                    qualifyStatus === 'submitting'
                      ? t('home.contact.form.qualify.submitting')
                      : t('home.contact.form.qualify.submit')
                  }}
                </button>
                <button
                  type="button"
                  class="text-xs font-semibold text-white/45 transition-colors hover:text-white/70"
                  @click="qualifyDismissed = true"
                >
                  {{ t('home.contact.form.qualify.skip') }}
                </button>
              </div>

              <p v-if="qualifyStatus === 'error'" role="alert" class="mt-3 text-xs text-red-400">
                {{ t('home.contact.form.qualify.error') }}
              </p>
            </form>

            <div v-else-if="qualifyStatus === 'success'" class="mt-8 w-full border-t border-white/10 pt-8">
              <p class="text-sm font-bold text-white">{{ t('home.contact.form.qualify.successTitle') }}</p>
              <p class="mt-1.5 text-xs leading-relaxed text-white/50">
                {{ t('home.contact.form.qualify.successDesc') }}
              </p>
            </div>

            <button type="button" class="mt-8 text-xs font-semibold text-neon-300 hover:underline" @click="resetForm">
              {{ t('home.contact.form.sendAnother') }}
            </button>
          </div>
        </UiSpotlightCard>
      </div>
    </div>
  </section>
</template>


<style scoped>
/* Dims the select while it still shows its non-submittable placeholder, so it
   reads like the placeholder text in the other fields. Scoped (not a utility)
   on purpose — see the note in the template. */
.is-placeholder {
  color: rgb(255 255 255 / 0.5);
}

.contact-spinner {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  border: 2px solid rgb(7 11 26 / 0.25);
  border-top-color: rgb(7 11 26 / 0.85);
  animation: contact-spin 0.8s linear infinite;
}

@keyframes contact-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .contact-spinner {
    animation-duration: 1.6s;
  }
}
</style>
