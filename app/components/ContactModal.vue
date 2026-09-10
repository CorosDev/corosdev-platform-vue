<script setup lang="ts">
/**
 * Modal global de contacto (Fase 4 — Lead Generation). Se monta una vez en
 * `app/layouts/default.vue`; lo abren `useContactModal().open()` desde los
 * CTA "Book a demo" y "Contact" del navbar.
 *
 * Valida en cliente con `leadSchema` (UX) y envía a `/api/lead`, que vuelve a
 * validar de forma autoritativa. Estados visuales: loading / success / error,
 * con errores por campo tanto del parse local como del 400 del servidor.
 *
 * Defensa anti-bot: honeypot oculto (el proyecto se apoya en el honeypot, no
 * en un captcha visible — ver `.env.example`). El servidor además exige
 * Turnstile si algún día se configura.
 */
import type { Budget, ProjectType } from '~/utils/leadSchema'

// `leadSchema`, `PROJECT_TYPE_OPTIONS`, `BUDGET_OPTIONS` y las constantes
// `FORM_*` se auto-importan desde `app/utils/`.

const { t } = useI18n()
const { isOpen, status, fieldErrors, close, submit, reset } = useContactModal()

interface ModalForm {
  name: string
  email: string
  company: string
  projectType: ProjectType | ''
  budget: Budget | ''
  message: string
  honeypot: string
}

function blankForm(): ModalForm {
  return { name: '', email: '', company: '', projectType: '', budget: '', message: '', honeypot: '' }
}

const form = reactive<ModalForm>(blankForm())

/** Errores de la validación en cliente (se fusionan con los del servidor). */
const clientErrors = ref<Record<string, string>>({})

// Etiqueta traducida por valor de enum (los valores quedan estables/máquina).
const PROJECT_TYPE_LABEL: Record<ProjectType, string> = {
  web: 'contactModal.projectTypes.web',
  mobile: 'contactModal.projectTypes.mobile',
  ai: 'contactModal.projectTypes.ai',
  audit: 'contactModal.projectTypes.audit',
  other: 'contactModal.projectTypes.other',
}
const BUDGET_LABEL: Record<Budget, string> = {
  '<10k': 'contactModal.budgets.lt10k',
  '10k-25k': 'contactModal.budgets.r10_25k',
  '25k-50k': 'contactModal.budgets.r25_50k',
  '50k-100k': 'contactModal.budgets.r50_100k',
  '100k+': 'contactModal.budgets.gt100k',
}

/** Mensaje visible para un campo: primero el del servidor, luego el del cliente. */
function errorFor(field: keyof ModalForm): string {
  const server = fieldErrors.value?.[field]?.[0]
  return server || clientErrors.value[field] || ''
}

const isLoading = computed(() => status.value === 'loading')

function onOverlayClick() {
  if (!isLoading.value) close()
}

function resetAndClose() {
  reset()
  clientErrors.value = {}
  Object.assign(form, blankForm())
  close()
}

async function onSubmit() {
  clientErrors.value = {}

  const parsed = leadSchema.safeParse({
    name: form.name,
    email: form.email,
    company: form.company,
    projectType: form.projectType,
    budget: form.budget,
    message: form.message,
  })

  if (!parsed.success) {
    // Mapea cada campo que falla a su copy traducido (no el texto de zod).
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? '')
      if (field && !clientErrors.value[field]) {
        clientErrors.value[field] = t(`contactModal.errors.${field}`)
      }
    }
    return
  }

  await submit({ ...parsed.data, honeypot: form.honeypot })
}

// Escape para cerrar + bloqueo de scroll del body mientras está abierto.
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isOpen.value && !isLoading.value) close()
}

watch(isOpen, (openNow) => {
  if (!import.meta.client) return
  document.documentElement.style.overflow = openNow ? 'hidden' : ''
  if (openNow) window.addEventListener('keydown', onKeydown)
  else window.removeEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  if (import.meta.client) {
    document.documentElement.style.overflow = ''
    window.removeEventListener('keydown', onKeydown)
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-150 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[100] flex items-end justify-center bg-brand-900/80 p-0 backdrop-blur-sm sm:items-center sm:p-6"
        @click.self="onOverlayClick"
      >
        <div
          class="glass relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-y-auto rounded-t-2xl bg-brand-900/95 shadow-2xl sm:rounded-2xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-modal-title"
        >
          <button
            type="button"
            class="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg text-white/50 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-300"
            :aria-label="t('contactModal.close')"
            @click="close"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Éxito -->
          <div v-if="status === 'success'" class="flex flex-col items-start gap-4 p-8 md:p-10">
            <span class="grid h-12 w-12 place-items-center rounded-xl bg-neon-500/15 text-neon-300" aria-hidden="true">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <h2 id="contact-modal-title" class="text-xl font-black tracking-tight text-white">
              {{ t('contactModal.successTitle') }}
            </h2>
            <p class="text-sm leading-relaxed text-white/60">{{ t('contactModal.successBody') }}</p>
            <button
              type="button"
              class="mt-2 inline-flex items-center gap-2 rounded-lg bg-neon-500 px-5 py-3 text-sm font-bold text-brand-900 transition-colors hover:bg-neon-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-300"
              @click="resetAndClose"
            >
              {{ t('contactModal.done') }}
            </button>
          </div>

          <!-- Formulario -->
          <form v-else class="flex flex-col gap-5 p-8 md:p-10" novalidate @submit.prevent="onSubmit">
            <div>
              <h2 id="contact-modal-title" class="text-xl font-black leading-tight tracking-tight text-white md:text-2xl">
                {{ t('contactModal.title') }}
              </h2>
              <p class="mt-2 text-sm leading-relaxed text-white/55">{{ t('contactModal.subtitle') }}</p>
            </div>

            <p
              v-if="status === 'error' && !Object.keys(fieldErrors).length"
              class="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300"
              role="alert"
            >
              {{ t('contactModal.errorBanner') }}
            </p>

            <!-- Trampa anti-bot: invisible para humanos -->
            <div class="absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden" aria-hidden="true">
              <label>Do not fill this field<input v-model="form.honeypot" type="text" tabindex="-1" autocomplete="off"></label>
            </div>

            <div class="grid gap-5 sm:grid-cols-2">
              <div>
                <label for="lead-name" :class="FORM_LABEL_CLASS">{{ t('contactModal.fields.name') }}</label>
                <input
                  id="lead-name"
                  v-model="form.name"
                  type="text"
                  autocomplete="name"
                  :placeholder="t('contactModal.placeholders.name')"
                  :class="[FORM_FIELD_CLASS, errorFor('name') ? FORM_FIELD_ERROR_CLASS : FORM_FIELD_IDLE_CLASS]"
                  :aria-invalid="Boolean(errorFor('name'))"
                >
                <p v-if="errorFor('name')" :class="FORM_ERROR_TEXT_CLASS">{{ errorFor('name') }}</p>
              </div>

              <div>
                <label for="lead-email" :class="FORM_LABEL_CLASS">{{ t('contactModal.fields.email') }}</label>
                <input
                  id="lead-email"
                  v-model="form.email"
                  type="email"
                  autocomplete="email"
                  :placeholder="t('contactModal.placeholders.email')"
                  :class="[FORM_FIELD_CLASS, errorFor('email') ? FORM_FIELD_ERROR_CLASS : FORM_FIELD_IDLE_CLASS]"
                  :aria-invalid="Boolean(errorFor('email'))"
                >
                <p v-if="errorFor('email')" :class="FORM_ERROR_TEXT_CLASS">{{ errorFor('email') }}</p>
              </div>
            </div>

            <div>
              <label for="lead-company" :class="FORM_LABEL_CLASS">
                {{ t('contactModal.fields.company') }}
                <span :class="FORM_LABEL_HINT_CLASS">{{ t('contactModal.optional') }}</span>
              </label>
              <input
                id="lead-company"
                v-model="form.company"
                type="text"
                autocomplete="organization"
                :placeholder="t('contactModal.placeholders.company')"
                :class="[FORM_FIELD_CLASS, errorFor('company') ? FORM_FIELD_ERROR_CLASS : FORM_FIELD_IDLE_CLASS]"
              >
              <p v-if="errorFor('company')" :class="FORM_ERROR_TEXT_CLASS">{{ errorFor('company') }}</p>
            </div>

            <div class="grid gap-5 sm:grid-cols-2">
              <div>
                <label for="lead-project-type" :class="FORM_LABEL_CLASS">{{ t('contactModal.fields.projectType') }}</label>
                <div class="relative">
                  <select
                    id="lead-project-type"
                    v-model="form.projectType"
                    :class="[FORM_FIELD_CLASS, FORM_SELECT_EXTRA_CLASS, errorFor('projectType') ? FORM_FIELD_ERROR_CLASS : FORM_FIELD_IDLE_CLASS]"
                    :aria-invalid="Boolean(errorFor('projectType'))"
                  >
                    <option value="" disabled :class="FORM_OPTION_CLASS">{{ t('contactModal.selectPlaceholder') }}</option>
                    <option v-for="opt in PROJECT_TYPE_OPTIONS" :key="opt" :value="opt" :class="FORM_OPTION_CLASS">
                      {{ t(PROJECT_TYPE_LABEL[opt]) }}
                    </option>
                  </select>
                  <svg :class="FORM_SELECT_CHEVRON_CLASS" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <p v-if="errorFor('projectType')" :class="FORM_ERROR_TEXT_CLASS">{{ errorFor('projectType') }}</p>
              </div>

              <div>
                <label for="lead-budget" :class="FORM_LABEL_CLASS">{{ t('contactModal.fields.budget') }}</label>
                <div class="relative">
                  <select
                    id="lead-budget"
                    v-model="form.budget"
                    :class="[FORM_FIELD_CLASS, FORM_SELECT_EXTRA_CLASS, errorFor('budget') ? FORM_FIELD_ERROR_CLASS : FORM_FIELD_IDLE_CLASS]"
                    :aria-invalid="Boolean(errorFor('budget'))"
                  >
                    <option value="" disabled :class="FORM_OPTION_CLASS">{{ t('contactModal.selectPlaceholder') }}</option>
                    <option v-for="opt in BUDGET_OPTIONS" :key="opt" :value="opt" :class="FORM_OPTION_CLASS">
                      {{ t(BUDGET_LABEL[opt]) }}
                    </option>
                  </select>
                  <svg :class="FORM_SELECT_CHEVRON_CLASS" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <p v-if="errorFor('budget')" :class="FORM_ERROR_TEXT_CLASS">{{ errorFor('budget') }}</p>
              </div>
            </div>

            <div>
              <label for="lead-message" :class="FORM_LABEL_CLASS">{{ t('contactModal.fields.message') }}</label>
              <textarea
                id="lead-message"
                v-model="form.message"
                rows="4"
                :placeholder="t('contactModal.placeholders.message')"
                :class="[FORM_FIELD_CLASS, errorFor('message') ? FORM_FIELD_ERROR_CLASS : FORM_FIELD_IDLE_CLASS]"
                :aria-invalid="Boolean(errorFor('message'))"
              />
              <p v-if="errorFor('message')" :class="FORM_ERROR_TEXT_CLASS">{{ errorFor('message') }}</p>
            </div>

            <button type="submit" :class="FORM_SUBMIT_CLASS" :disabled="isLoading">
              <svg v-if="isLoading" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              {{ isLoading ? t('contactModal.submitting') : t('contactModal.submit') }}
            </button>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
