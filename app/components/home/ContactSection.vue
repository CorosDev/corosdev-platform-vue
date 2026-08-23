<script setup lang="ts">
/**
 * Mirrors the zod schema in server/api/contact.post.ts. Keeping the two in sync
 * by hand is intentional here (no shared schema package yet) — if the endpoint's
 * contactSchema changes, update this shape and the `interestOptions` list too.
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

const interestOptions = [
  'Inversor de Capital',
  'Socio Estratégico / Cliente',
  'Tester de Acceso Anticipado / Usuario',
] as const

function emptyForm(): ContactForm {
  return {
    name: '',
    email: '',
    interest: 'Tester de Acceso Anticipado / Usuario',
    message: '',
    honeypot: '',
  }
}

const form = reactive<ContactForm>(emptyForm())

type Status = 'idle' | 'submitting' | 'success' | 'error'
const status = ref<Status>('idle')
const errorMessage = ref('')

async function handleSubmit() {
  if (status.value === 'submitting') return

  status.value = 'submitting'
  errorMessage.value = ''

  try {
    await $fetch<ContactResponse>('/api/contact', {
      method: 'POST',
      body: form,
    })
    status.value = 'success'
    Object.assign(form, emptyForm())
  } catch {
    status.value = 'error'
    errorMessage.value = 'Hubo un problema. Por favor intenta de nuevo.'
  }
}
</script>

<template>
  <section id="contact" class="py-10 md:py-20">
    <div class="mx-auto max-w-7xl px-6">
      <div class="grid items-center gap-10 md:grid-cols-2">
        <div>
          <h2 class="text-3xl font-bold md:text-5xl">Tell us what you're building</h2>
          <p class="mt-3 text-white/70">Get a roadmap, estimate, and risk assessment in 72 hours.</p>
          <ul class="mt-6 space-y-3 text-white/80">
            <li>
              &bull; Email:
              <a class="text-neon-500 hover:underline" href="mailto:info@corosdev.com">info@corosdev.com</a>
            </li>
            <li>
              &bull; WhatsApp:
              <a class="text-neon-500 hover:underline" href="https://wa.me/50431750453">+504 3175-0453</a>
            </li>
            <li>&bull; San Pedro Sula, Honduras &middot; Prague, Czech Republic</li>
            <li>&bull; Remote / Nearshore &middot; Global Engineering</li>
          </ul>
        </div>

        <form class="glass rounded-2xl p-6" novalidate @submit.prevent="handleSubmit">
          <div class="grid gap-4">
            <input
              v-model="form.name"
              type="text"
              name="name"
              placeholder="Tu nombre completo"
              autocomplete="name"
              required
              class="w-full rounded-md border border-white/10 bg-white/5 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neon-500"
            />
            <input
              v-model="form.email"
              type="email"
              name="email"
              placeholder="Tu correo corporativo"
              autocomplete="email"
              required
              class="w-full rounded-md border border-white/10 bg-white/5 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neon-500"
            />

            <select
              v-model="form.interest"
              name="interest"
              class="w-full rounded-md border border-white/10 bg-brand-800 px-4 py-3 text-white/70 focus:outline-none focus:ring-2 focus:ring-neon-500"
            >
              <option v-for="option in interestOptions" :key="option" :value="option">
                {{ option }}
              </option>
            </select>

            <textarea
              v-model="form.message"
              name="message"
              rows="4"
              placeholder="Cuéntanos un poco sobre tus objetivos..."
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
              {{ status === 'submitting' ? 'Enviando...' : 'Enviar Solicitud' }}
            </button>

            <p
              v-if="status === 'success'"
              class="mt-2 text-center text-xs text-green-400"
            >
              ¡Solicitud enviada con éxito! Te contactaremos pronto.
            </p>
            <p
              v-else-if="status === 'error'"
              class="mt-2 text-center text-xs text-red-400"
            >
              {{ errorMessage }}
            </p>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>
