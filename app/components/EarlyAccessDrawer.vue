<template>
  <Teleport to="body">
    <Transition name="drawer-fade">
      <div 
        v-if="isEarlyAccessOpen" 
        class="fixed inset-0 z-[100] flex justify-end"
      >
        <!-- Backdrop -->
        <div 
          class="absolute inset-0 bg-black/60 backdrop-blur-md z-0"
          @click="uiStore.closeEarlyAccess"
        ></div>

        <!-- Panel del Drawer -->
        <div 
          class="relative w-full max-w-[480px] h-full bg-[#0a0a16] border-l border-white/10 p-8 md:p-10 flex flex-col shadow-[-10px_0_50px_rgba(0,0,0,0.6)] z-10 overflow-y-auto select-none pointer-events-auto"
        >
          <!-- BOTÓN DE CERRAR (X) -->
          <button 
            type="button"
            @click.stop="uiStore.closeEarlyAccess" 
            class="absolute top-6 right-6 z-50 w-10 h-10 rounded-full border border-white/10 hover:border-blue-500 bg-[#0c0c1e] hover:bg-blue-600/10 flex items-center justify-center text-white/50 hover:text-blue-400 transition-all duration-300 transform hover:rotate-90 cursor-pointer"
          >
            <svg class="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Encabezado -->
          <div class="mb-10 pr-12 pt-4">
            <h3 
              class="text-3xl font-black text-white tracking-tight leading-tight mb-3"
              v-html="drawerTitle"
            ></h3>
            <p class="text-base text-[#8aa4b7] leading-relaxed">
              {{ localeStore.t('forms').contact_sub }}
            </p>
          </div>

          <!-- Formulario -->
          <form @submit.prevent="handleSubmitEarlyAccess" class="space-y-5 relative z-10">
            
            <!-- DROPDOWN: APLICACIÓN DE INTERÉS (Preselección Inteligente) -->
            <div class="space-y-2 relative">
              <label class="text-[11px] font-bold text-white/40 uppercase tracking-widest block ml-1">
                Aplicación de Interés
              </label>
              <div class="relative">
                <button
                  type="button"
                  @click.stop="toggleDropdown('product')"
                  class="w-full bg-[#0d0d1f] border text-left border-white/10 rounded-xl px-5 py-4 text-white/90 focus:outline-none focus:border-blue-500 text-sm flex justify-between items-center transition-all"
                >
                  <span class="font-medium">{{ currentProductName }}</span>
                  <svg class="w-4 h-4 text-white/30 transition-transform" :class="{ 'rotate-180': activeDropdown === 'product' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <Transition name="dropdown-slide">
                  <ul v-if="activeDropdown === 'product'" class="absolute top-[110%] left-0 w-full bg-[#0d0d1f] border border-white/10 rounded-xl py-2 z-50 shadow-2xl backdrop-blur-md">
                    <li 
                      v-for="prod in productOptions" :key="prod.id"
                      @click.stop="selectProduct(prod.id)"
                      class="px-5 py-3 text-sm text-white/70 hover:text-white hover:bg-blue-600/20 cursor-pointer transition-colors"
                      :class="{ 'text-blue-400 font-bold': selectedProduct === prod.id }"
                    >
                      {{ prod.name }}
                    </li>
                  </ul>
                </Transition>
              </div>
            </div>

            <!-- INPUTS LIMPIOS -->
            <div class="space-y-5">
              <div class="space-y-2">
                <label class="text-[11px] font-bold text-white/40 uppercase tracking-widest block ml-1">
                  {{ localeStore.t('form_name') }}
                </label>
                <input 
                  v-model="form.name" 
                  type="text" 
                  required 
                  class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-500 focus:bg-white/[0.06] transition-all text-sm"
                  :placeholder="localeStore.t('forms').form_name_placeholder"
                >
              </div>

              <div class="space-y-2">
                <label class="text-[11px] font-bold text-white/40 uppercase tracking-widest block ml-1">
                  {{ localeStore.t('form_email') }}
                </label>
                <input 
                  v-model="form.email" 
                  type="email" 
                  required 
                  class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-500 focus:bg-white/[0.06] transition-all text-sm"
                  :placeholder="localeStore.t('forms').form_email_placeholder"
                >
              </div>
            </div>

            <!-- DROPDOWN: ME INTERESA COMO... -->
            <div class="space-y-2 relative">
              <label class="text-[11px] font-bold text-white/40 uppercase tracking-widest block ml-1">
                Me Interesa Como...
              </label>
              <div class="relative">
                <button
                  type="button"
                  @click.stop="toggleDropdown('role')"
                  class="w-full bg-[#0d0d1f] border text-left border-white/10 rounded-xl px-5 py-4 text-white/90 focus:outline-none focus:border-blue-500 text-sm flex justify-between items-center transition-all"
                >
                  <span class="font-medium">{{ currentRoleName }}</span>
                  <svg class="w-4 h-4 text-white/30 transition-transform" :class="{ 'rotate-180': activeDropdown === 'role' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <Transition name="dropdown-slide">
                  <ul v-if="activeDropdown === 'role'" class="absolute top-[110%] left-0 w-full bg-[#0d0d1f] border border-white/10 rounded-xl py-2 z-50 shadow-2xl backdrop-blur-md">
                    <li 
                      v-for="role in roleOptions" :key="role.id"
                      @click.stop="selectRole(role.id)"
                      class="px-5 py-3 text-sm text-white/70 hover:text-white hover:bg-blue-600/20 cursor-pointer transition-colors"
                      :class="{ 'text-blue-400 font-bold': form.role === role.id }"
                    >
                      {{ role.name }}
                    </li>
                  </ul>
                </Transition>
              </div>
            </div>

            <!-- TEXTAREA -->
            <div class="space-y-2">
              <label class="text-[11px] font-bold text-white/40 uppercase tracking-widest block ml-1">
                {{ localeStore.t('form_msg') }}
              </label>
              <textarea 
                v-model="form.message" 
                rows="3"
                class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-500 focus:bg-white/[0.06] transition-all text-sm resize-none" 
                :placeholder="localeStore.t('forms').form_message_placeholder"
              ></textarea>
            </div>

            <!-- BOTÓN DE ENVÍO -->
            <div class="pt-2">
              <button 
                type="submit" 
                :disabled="isSubmitting" 
                class="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl transition-all shadow-[0_4px_25px_rgba(37,99,235,0.3)] hover:shadow-[0_4px_30px_rgba(37,99,235,0.5)] disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center group"
              >
                <div v-if="!isSubmitting" class="flex items-center gap-2">
                  <span>{{ localeStore.t('forms').cta_submit }}</span>
                  <span class="group-hover:translate-x-1 transition-transform font-normal">→</span>
                </div>
                <div v-else class="flex items-center justify-center gap-3">
                  <span class="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-white/30 border-t-white" aria-hidden="true"></span>
                  <span>{{ localeStore.t('forms').cta_processing }}</span>
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const uiStore = useUiStore()
const localeStore = useLocaleStore()
const { isEarlyAccessOpen, selectedProduct } = storeToRefs(uiStore)

// Add a watch to see when isEarlyAccessOpen changes
watch(isEarlyAccessOpen, (newValue) => {
  console.log('EarlyAccessDrawer: isEarlyAccessOpen changed to:', newValue);
});

const isSubmitting = ref(false)
const activeDropdown = ref(null)

const productOptions = [
  { id: 'snapay', name: 'Snapay' },
  { id: 'vorzana', name: 'Vorzana' },
  { id: 'trd', name: 'TRD' },
  { id: 'general', name: 'New App / Other' }
]

const roleOptions = [
  { id: 'tester', name: 'Tester de Acceso Anticipado / Usuario' },
  { id: 'investor', name: 'Inversor de Capital' },
  { id: 'partner', name: 'Socio Estratégico / Cliente' }
]

const form = ref({
  name: '',
  email: '',
  phone: '',
  role: 'tester',
  message: ''
})

// Lógica para inyectar el span de degradado en la frase clave del título (coherencia con ContactForm)
const drawerTitle = computed(() => {
  const raw = localeStore.t('forms').contact_h2
  const highlight = localeStore.currentLang === 'en' ? "you're building" : "qué estás construyendo"
  const span = `<span class="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">${highlight}</span>`
  return raw.replace(highlight, span)
})

// Reactividad para los nombres seleccionados en el dropdown
const currentProductName = computed(() => {
  return productOptions.find(p => p.id === selectedProduct.value)?.name || 'Selecciona una app'
})

const currentRoleName = computed(() => {
  return roleOptions.find(r => r.id === form.value.role)?.name || 'Selecciona tu rol'
})

const toggleDropdown = (type) => {
  activeDropdown.value = activeDropdown.value === type ? null : type
}

const selectProduct = (id) => {
  selectedProduct.value = id
  activeDropdown.value = null
}

const selectRole = (id) => {
  form.value.role = id
  activeDropdown.value = null
}

const handleSubmitEarlyAccess = async () => {
  if (!form.value.email) return;
  isSubmitting.value = true;
  try {
    const response = await fetch('/api/crm/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.value.email,
        name: form.value.name,
        phone: form.value.phone || '',
        formType: 'early-access', // Identificador para la lista de alta intención de Brevo
        product: selectedProduct.value // Mandamos el contexto de qué app (snapay, trd, vorzana) le interesa
      })
    });
    
    const data = await response.json();
    if (response.ok) {
      // Resetea los campos tras el éxito
      form.value.name = '';
      form.value.email = '';
      form.value.phone = '';
      form.value.message = '';
      form.value.role = 'tester';
      
      alert(localeStore.currentLang === 'es' ? '¡Tu solicitud de acceso anticipado fue enviada!' : 'Early access request sent successfully!');
      uiStore.closeEarlyAccess(); // Cierra el drawer automáticamente al terminar
    } else {
      throw new Error(data.error || 'Error en el registro');
    }
  } catch (error) {
    console.error('Error al enviar el lead de acceso anticipado:', error);
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.drawer-fade-enter-active > div:last-child,
.drawer-fade-leave-active > div:last-child {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}
.drawer-fade-enter-from > div:last-child,
.drawer-fade-leave-to > div:last-child {
  transform: translateX(100%);
}

.dropdown-slide-enter-active,
.dropdown-slide-leave-active {
  transition: all 0.2s ease-out;
}
.dropdown-slide-enter-from,
.dropdown-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>