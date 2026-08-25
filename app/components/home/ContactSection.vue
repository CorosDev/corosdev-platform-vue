<script setup lang="ts">
/**
 * Validates against the exact same `contactSchema` server/api/contact.post.ts
 * uses (shared/utils/leadSchemas.ts, auto-imported on both sides) — this is
 * a UX nicety (surface errors before a round-trip), the server's own
 * `safeParse` on the same schema is what's actually authoritative.
 *
 * The `interest` option VALUES stay pinned to their canonical Spanish string
 * (LEAD_INTEREST_OPTIONS, matching the server's zod enum) regardless of the
 * active UI locale — only the displayed <option> label is translated.
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
  interest: LeadInterest
  message: string
  /** Hidden bot trap — must stay empty for real submissions. */
  honeypot: string
  /** Set by the <NuxtTurnstile> widget's v-model; verified server-side. */
  turnstileToken: string
}

interface ContactResponse {
  success: boolean
}

const DEFAULT_INTEREST: LeadInterest = 'Tester de Acceso Anticipado / Usuario'

const { t } = useI18n()

const interestLabelKeys: Record<LeadInterest, string> = {
  'Inversor de Capital': 'home.contact.form.interestInvestor',
  'Socio Estratégico / Cliente': 'home.contact.form.interestPartner',
  'Tester de Acceso Anticipado / Usuario': 'home.contact.form.interestTester',
}

const interestOptions = computed(() =>
  LEAD_INTEREST_OPTIONS.map((value) => ({ value, label: t(interestLabelKeys[value]) })),
)

function emptyForm(): ContactForm {
  return {
    name: '',
    email: '',
    company: '',
    interest: DEFAULT_INTEREST,
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
    status.value = 'success'
  } catch {
    status.value = 'error'
    turnstileWidget.value?.reset()
  }
}

function resetForm() {
  Object.assign(form, emptyForm())
  Object.keys(fieldErrors).forEach((key) => delete fieldErrors[key as ContactField])
  status.value = 'idle'
  turnstileWidget.value?.reset()
}
</script>
<template>
  <section id="contact" class="py-10 md:py-20">
    <div class="mx-auto max-w-7xl px-6">
      <div class="grid items-center gap-10 md:grid-cols-2">
        <div>
          <h2 class="text-3xl font-bold md:text-5xl">{{ t('home.contact.h2') }}</h2>
          <p class="mt-3 text-white/70">{{ t('home.contact.sub') }}</p>
          <ul class="mt-6 space-y-3 text-white/80">
            <li>
              &bull; {{ t('home.contact.emailLabel') }}:
              <a class="text-neon-500 hover:underline" href="mailto:info@corosdev.com">info@corosdev.com</a>
            </li>
            <li>
              &bull; {{ t('home.contact.whatsappLabel') }}:
              <a class="text-neon-500 hover:underline" href="https://wa.me/50431750453">+504 3175-0453</a>
            </li>
            <li>&bull; {{ t('home.contact.location') }}</li>
            <li>&bull; {{ t('home.contact.remote') }}</li>
          </ul>
        </div>

        <div class="glass rounded-2xl p-6 sm:p-8">
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
                    :class="[fieldClass('interest'), FORM_SELECT_EXTRA_CLASS]"
                    @change="validateField('interest')"
                  >
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
            <div class="mb-5 flex justify-center">
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
            <button type="button" class="mt-6 text-xs font-semibold text-neon-300 hover:underline" @click="resetForm">
              {{ t('home.contact.form.sendAnother') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>


<style scoped>
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
