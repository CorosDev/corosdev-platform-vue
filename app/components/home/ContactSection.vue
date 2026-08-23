<script setup lang="ts">
/**
 * Mirrors the zod schema in server/api/contact.post.ts. Keeping the two in sync
 * by hand is intentional here (no shared schema package yet) — if the endpoint's
 * contactSchema changes, update this shape and the `interestOptions` list too.
 *
 * The `interest` option VALUES stay pinned to their canonical Spanish string
 * (matching the server's zod enum) regardless of the active UI locale — only
 * the displayed <option> label is translated. Changing the submitted value
 * per-locale would require updating the server's enum too.
 */
interface ContactForm {
  name: string
  email: string
  interest: string
  message: string
  /** Hidden bot trap — must stay empty for real submissions. */
  honeypot: string
}

interface ContactResponse {
  success: boolean
}

const DEFAULT_INTEREST = 'Tester de Acceso Anticipado / Usuario'

const { t } = useI18n()

const interestOptions = computed(() => [
  { value: 'Inversor de Capital', label: t('home.contact.form.interestInvestor') },
  { value: 'Socio Estratégico / Cliente', label: t('home.contact.form.interestPartner') },
  { value: DEFAULT_INTEREST, label: t('home.contact.form.interestTester') },
])

function emptyForm(): ContactForm {
  return {
    name: '',
    email: '',
    interest: DEFAULT_INTEREST,
    message: '',
    honeypot: '',
  }
}

const form = reactive<ContactForm>(emptyForm())

type Status = 'idle' | 'submitting' | 'success' | 'error'
const status = ref<Status>('idle')

async function handleSubmit() {
  if (status.value === 'submitting') return

  status.value = 'submitting'

  try {
    await $fetch<ContactResponse>('/api/contact', {
      method: 'POST',
      body: form,
    })
    status.value = 'success'
    Object.assign(form, emptyForm())
  } catch {
    status.value = 'error'
  }
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

        <form class="glass rounded-2xl p-6" novalidate @submit.prevent="handleSubmit">
          <div class="grid gap-4">
            <input
              v-model="form.name"
              type="text"
              name="name"
              :placeholder="t('home.contact.form.namePlaceholder')"
              autocomplete="name"
              required
              class="w-full rounded-md border border-white/10 bg-white/5 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neon-500"
            />
            <input
              v-model="form.email"
              type="email"
              name="email"
              :placeholder="t('home.contact.form.emailPlaceholder')"
              autocomplete="email"
              required
              class="w-full rounded-md border border-white/10 bg-white/5 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neon-500"
            />

            <select
              v-model="form.interest"
              name="interest"
              class="w-full rounded-md border border-white/10 bg-brand-800 px-4 py-3 text-white/70 focus:outline-none focus:ring-2 focus:ring-neon-500"
            >
              <option v-for="option in interestOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>

            <textarea
              v-model="form.message"
              name="message"
              rows="4"
              :placeholder="t('home.contact.form.messagePlaceholder')"
              class="w-full rounded-md border border-white/10 bg-white/5 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neon-500"
            />

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

            <button
              type="submit"
              :disabled="status === 'submitting'"
              class="mt-2 flex w-full items-center justify-center rounded-xl bg-neon-500 px-5 py-3 font-semibold text-brand-900 drop-shadow-glow transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
            >
              {{ status === 'submitting' ? t('home.contact.form.submitting') : t('home.contact.form.submit') }}
            </button>

            <p
              v-if="status === 'success'"
              class="mt-2 text-center text-xs text-green-400"
            >
              {{ t('home.contact.form.success') }}
            </p>
            <p
              v-else-if="status === 'error'"
              class="mt-2 text-center text-xs text-red-400"
            >
              {{ t('home.contact.form.error') }}
            </p>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>
