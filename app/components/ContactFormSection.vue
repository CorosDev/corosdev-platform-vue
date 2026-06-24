<template>
  <section id="contact" class="py-20 relative overflow-hidden">
    <div class="max-w-[80rem] mx-auto px-6 relative z-10">
      <div class="grid lg:grid-cols-2 gap-16 items-center">
        
        <!-- Columna Izquierda: Información Corporativa Directa -->
        <div class="space-y-8">
          <div>
            <h2 
              class="text-4.5xl md:text-6xl font-black text-white tracking-tight leading-tight mb-4"
              v-html="contactTitle"
            ></h2>
            <p class="text-lg text-[#8aa4b7] leading-relaxed max-w-sm">
              {{ localeStore.t('forms').contact_sub }}
            </p>
          </div>

          <!-- Datos de Contacto Estilo Lista Limpia (Expectativa.png) -->
          <ul class="space-y-4 text-base text-white/90 font-medium">
            <li class="flex items-center gap-2">
              <span class="text-white/40">•</span>
              <span>Email:</span>
              <a href="mailto:info@corosdev.com" class="text-cobalt-400 hover:underline">info@corosdev.com</a>
            </li>
            <li class="flex items-center gap-2">
              <span class="text-white/40">•</span>
              <span>WhatsApp:</span>
              <a href="https://wa.me/50431750453" target="_blank" class="text-cobalt-400 hover:underline">+504 3175-0453</a>
            </li>
            <li class="flex items-center gap-2">
              <span class="text-white/40">•</span>
              <span class="text-white/60">San Pedro Sula, Honduras • Prague, Czech Republic</span>
            </li>
            <li class="flex items-center gap-2">
              <span class="text-white/40">•</span>
              <span class="text-white/60">Remote / Nearshore • Global Engineering</span>
            </li>
          </ul>

          <!-- Redes Sociales Integradas Sutilmente -->
          <div class="flex gap-4 pt-2">
            <a href="#" class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all">
              <span class="sr-only">LinkedIn</span>
              <svg class="w-5 h-5 text-white/70" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 .01h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
          </div>
        </div>

        <!-- Columna Derecha: Tarjeta Bento con Formulario Estilo Esmerilado -->
        <div class="glass p-8 md:p-10 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl relative shadow-[0_0_50px_rgba(0,0,0,0.3)]">
          <form @submit.prevent="handleSubmit" class="space-y-5">
            
            <!-- Inputs sin labels ruidosos, usando placeholders corporativos -->
            <div>
              <input 
                v-model="form.name" 
                type="text" 
                required 
                class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-cobalt-500 focus:bg-white/[0.06] transition-all"
                :placeholder="localeStore.t('forms').form_name_placeholder"
              >
            </div>

            <div>
              <input 
                v-model="form.email" 
                type="email" 
                required 
                class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-cobalt-500 focus:bg-white/[0.06] transition-all"
                :placeholder="localeStore.t('forms').form_email_placeholder"
              >
            </div>

            <div class="relative">
              <select 
                v-model="form.role" 
                class="w-full bg-[#111322] border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-cobalt-500 transition-all appearance-none cursor-pointer"
              >
                <option value="tester">Tester de Acceso Anticipado / Usuario</option>
                <option value="partner">Socio de Negocio (Partner)</option>
                <option value="investor">Inversionista</option>
              </select>
              <!-- Flecha personalizada para el select -->
              <div class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-white/40">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <div>
              <textarea 
                v-model="form.message" 
                rows="4" 
                required 
                class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-cobalt-500 focus:bg-white/[0.06] transition-all resize-none" 
                :placeholder="localeStore.t('forms').form_message_placeholder"
              ></textarea>
            </div>

            <!-- Botón Premium Sólido con Efecto Glow en Hover -->
            <button 
              type="submit" 
              :disabled="isSubmitting" 
              class="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-[0_4px_20px_rgba(37,99,235,0.3)] hover:shadow-[0_4px_25px_rgba(37,99,235,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="!isSubmitting">{{ localeStore.t('forms').cta_submit }}</span>
              <span v-else class="flex items-center justify-center gap-2">
                <span class="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true"></span>
                {{ localeStore.t('forms').cta_processing }}
              </span>
            </button>

          </form>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup>
const localeStore = useLocaleStore()
const isSubmitting = ref(false)

const form = ref({
  name: '',
  email: '',
  phone: '',
  role: 'tester',
  message: ''
})

// Lógica para inyectar el span de degradado en la frase clave del título
const contactTitle = computed(() => {
  const raw = localeStore.t('forms').contact_h2
  const highlight = localeStore.currentLang === 'en' ? "you're building" : "qué estás construyendo"
  const span = `<span class="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">${highlight}</span>`
  return raw.replace(highlight, span)
})

const handleSubmit = async () => {
  if (!form.value.email) return;
  isSubmitting.value = true;
  try {
    // Petición hacia nuestro endpoint seguro de backend intermediario
    const response = await fetch('/api/crm/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.value.email,
        name: form.value.name,
        phone: form.value.phone || '',
        formType: 'footer-newsletter' // Identificador clave para el enrutamiento de listas en el servidor
      })
    });
    
    const data = await response.json();
    if (response.ok) {
      // Resetea el formulario tras el éxito
      form.value.name = '';
      form.value.email = '';
      form.value.phone = '';
      form.value.message = '';
      form.value.role = 'tester';
      alert(localeStore.currentLang === 'es' ? '¡Registro exitoso!' : 'Registration successful!');
    } else {
      throw new Error(data.error || 'Error al suscribirse');
    }
  } catch (error) {
    console.error('Error enviando el lead:', error);
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.glass {
  will-change: transform, border-color;
  contain: content;
}
</style>