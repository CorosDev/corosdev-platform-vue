<script setup lang="ts">
const { t, locale, setLocale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

// Enlaces y agenda salen de useSiteNav(), compartido con AppFooter. Cada
// item es un enlace, un grupo con desplegable (`'children' in item`) o un
// enlace marcado `openModal` que dispara el modal de contacto.
const { navLinks } = useSiteNav()

// CTA "Book a demo" + item "Contact" abren el modal global de captación.
const { open: openContactModal } = useContactModal()

function openContactFromMobile() {
  closeMobileMenu()
  openContactModal()
}

const mobileMenuOpen = ref(false)
const scrolled = ref(false)

// Desplegable de escritorio: guarda la `key` del grupo abierto (uno a la vez).
const openDropdownKey = ref<string | null>(null)
// Acordeón del menú móvil: misma idea, estado independiente.
const openMobileGroup = ref<string | null>(null)

const header = ref<HTMLElement | null>(null)

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value
  if (!mobileMenuOpen.value) openMobileGroup.value = null
}

function closeMobileMenu() {
  mobileMenuOpen.value = false
  openMobileGroup.value = null
}

function toggleMobileGroup(key: string) {
  openMobileGroup.value = openMobileGroup.value === key ? null : key
}

function openDropdown(key: string) {
  openDropdownKey.value = key
}

function closeDropdown() {
  openDropdownKey.value = null
}

function toggleDropdown(key: string) {
  openDropdownKey.value = openDropdownKey.value === key ? null : key
}

// Esc dentro del grupo: cierra y devuelve el foco a su botón disparador
// (patrón "Disclosure Navigation Menu" de la WAI-ARIA APG).
function onGroupEscape(event: KeyboardEvent) {
  if (!openDropdownKey.value) return
  closeDropdown()
  const wrapper = event.currentTarget as HTMLElement | null
  wrapper?.querySelector<HTMLButtonElement>('button')?.focus()
}

// El foco salió del grupo (Tab hacia fuera): ciérralo.
function onGroupFocusout(event: FocusEvent, key: string) {
  const wrapper = event.currentTarget as HTMLElement | null
  const next = event.relatedTarget as Node | null
  if (openDropdownKey.value === key && wrapper && !wrapper.contains(next)) {
    closeDropdown()
  }
}

// Toggles between the two configured locales — shows the language you'd
// switch TO (e.g. while browsing in Spanish, the button reads "EN").
function toggleLocale() {
  setLocale(locale.value === 'es' ? 'en' : 'es')
}

function handleScroll() {
  scrolled.value = window.scrollY > 8
}

// Click fuera del header: cierra cualquier desplegable abierto.
function onDocumentClick(event: MouseEvent) {
  if (openDropdownKey.value && header.value && !header.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

// Cambiar de ruta cierra todo lo que estuviera abierto.
watch(() => route.fullPath, () => {
  closeDropdown()
  closeMobileMenu()
})

onMounted(() => {
  handleScroll()
  window.addEventListener('scroll', handleScroll, { passive: true })
  document.addEventListener('click', onDocumentClick)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', onDocumentClick)
})
</script>

<template>
  <header ref="header" class="fixed top-0 left-0 right-0 z-50">
    <!-- `glass` (main.css) bakes in its own `border-hairline` — dropped here
         rather than layered under `border-hairline`, since two utilities
         touching the same property (border-color) would leave which one wins
         to CSS layer-ordering, not something to depend on. `backdrop-blur-md`
         (Tailwind core, 12px) reproduces the same effect `glass` used
         `backdrop-filter: blur(8px)` for. `scrolled` still deepens the panel
         slightly on scroll, now expressed as `--surface`'s own opacity
         instead of the old fixed `brand-900`. -->
    <div
      class="mx-auto max-w-7xl rounded-b-2xl border border-hairline px-6 py-3 shadow-2xl backdrop-blur-md transition-colors duration-300"
      :class="scrolled ? 'bg-surface/90' : 'bg-surface/80'"
    >
      <div class="flex items-center justify-between">
        <!-- Hamburger (mobile only) -->
        <button
          type="button"
          class="flex h-8 w-8 flex-col justify-center gap-1.5 md:hidden"
          :aria-label="t('nav.menuToggle')"
          :aria-expanded="mobileMenuOpen"
          aria-controls="mobile-nav"
          @click="toggleMobileMenu"
        >
          <span
            class="block h-0.5 w-full rounded-full bg-surface-strong/50 transition-transform duration-300"
            :class="mobileMenuOpen ? 'translate-y-2 rotate-45' : ''"
          />
          <span
            class="block h-0.5 w-full rounded-full bg-surface-strong/50 transition-opacity duration-300"
            :class="mobileMenuOpen ? 'opacity-0' : 'opacity-100'"
          />
          <span
            class="block h-0.5 w-full rounded-full bg-surface-strong/50 transition-transform duration-300"
            :class="mobileMenuOpen ? '-translate-y-2 -rotate-45' : ''"
          />
        </button>

        <!-- Logo — dos variantes, no una sola con filtro condicional: el
             isotipo (el circuito) ya es azul de marca en ambos temas, pero el
             wordmark "COROS Dev" viene horneado en el PNG en blanco casi puro.
             Un `dark:invert` sobre TODA la imagen invertiría también el
             circuito azul a su complementario (naranja), así que en su lugar
             `coros-light.png` es una segunda exportación con sólo el wordmark
             recoloreado a `--ink` (navy) — el circuito es el mismo azul en
             los dos archivos. `dark:hidden` / `hidden dark:block` conmutan
             cuál se pinta; ambos son ~20-30KB así que precargar los dos no
             pesa, y evita cualquier parpadeo o mismatch de hidratación que
             tendría resolver esto por JS. -->
        <NuxtLink :to="localePath('/')" class="flex items-center gap-3" @click="closeMobileMenu">
          <NuxtPicture
            src="/coros-light.png"
            alt="CorosDev"
            width="361"
            height="220"
            sizes="80px md:110px"
            loading="eager"
            preload
            fetchpriority="high"
            class="h-12 w-auto dark:hidden md:h-16"
            :img-attrs="{ class: 'h-12 w-auto dark:hidden md:h-16', fetchpriority: 'high' }"
          />
          <NuxtPicture
            src="/coros.png"
            alt="CorosDev"
            width="361"
            height="220"
            sizes="80px md:110px"
            loading="eager"
            preload
            fetchpriority="high"
            class="hidden h-12 w-auto dark:block md:h-16"
            :img-attrs="{ class: 'hidden h-12 w-auto dark:block md:h-16', fetchpriority: 'high' }"
          />
          <div class="mx-2 hidden h-6 w-px bg-surface-strong/50 sm:block" />
          <span class="hidden text-[10px] font-bold uppercase tracking-widest text-ink opacity-80 sm:block">
            {{ t('nav.aiDrivenCompany') }}
          </span>
        </NuxtLink>

        <!-- Desktop nav -->
        <nav class="hidden items-center gap-8 text-sm font-semibold tracking-tight text-ink-muted md:flex">
          <template v-for="item in navLinks" :key="item.key">
            <!-- Grupo con desplegable -->
            <div
              v-if="'children' in item"
              class="relative"
              @mouseenter="openDropdown(item.key)"
              @mouseleave="closeDropdown()"
              @focusout="onGroupFocusout($event, item.key)"
              @keydown.escape="onGroupEscape"
            >
              <button
                type="button"
                class="flex items-center gap-1 text-sm font-semibold tracking-tight transition-colors hover:text-accent-text"
                :class="openDropdownKey === item.key ? 'text-accent-text' : 'text-ink-muted'"
                :aria-expanded="openDropdownKey === item.key"
                aria-haspopup="true"
                :aria-controls="`nav-dd-${item.key}`"
                @click="toggleDropdown(item.key)"
              >
                {{ item.label }}
                <svg
                  class="h-3 w-3 transition-transform duration-200"
                  :class="openDropdownKey === item.key ? 'rotate-180' : ''"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="3"
                  aria-hidden="true"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <Transition
                enter-active-class="transition duration-150 ease-out"
                enter-from-class="opacity-0 -translate-y-1"
                enter-to-class="opacity-100 translate-y-0"
                leave-active-class="transition duration-100 ease-in"
                leave-from-class="opacity-100 translate-y-0"
                leave-to-class="opacity-0 -translate-y-1"
              >
                <!-- `v-show` (no `v-if`) para que el `<ul>` referido por
                     `aria-controls` exista siempre en el DOM. El `pt-3` es un
                     puente invisible: al ser descendiente del wrapper, cruzar
                     el hueco botón→panel con el ratón no dispara `mouseleave`
                     y el panel no parpadea. -->
                <div v-show="openDropdownKey === item.key" class="absolute left-0 top-full z-50 pt-3">
                  <ul
                    :id="`nav-dd-${item.key}`"
                    class="min-w-[12rem] rounded-xl border border-hairline bg-surface p-2 text-ink shadow-xl backdrop-blur-md"
                  >
                    <li v-for="child in item.children" :key="child.key">
                      <NuxtLink
                        :to="child.to"
                        class="block rounded-lg px-3 py-2 text-xs font-semibold tracking-tight text-ink-muted transition-colors hover:bg-surface-strong hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-300"
                        @click="closeDropdown"
                      >
                        {{ child.label }}
                      </NuxtLink>
                    </li>
                  </ul>
                </div>
              </Transition>
            </div>

            <!-- Enlace que abre el modal de contacto -->
            <button
              v-else-if="item.openModal"
              type="button"
              class="text-sm font-semibold tracking-tight text-ink-muted transition-colors hover:text-accent-text"
              @click="openContactModal()"
            >
              {{ item.label }}
            </button>

            <!-- Enlace simple -->
            <NuxtLink
              v-else
              :to="item.to"
              class="transition-colors hover:text-accent-text"
            >
              {{ item.label }}
            </NuxtLink>
          </template>
        </nav>

        <!-- Right side: theme toggle + lang toggle + CTA -->
        <div class="flex items-center gap-3">
          <UiColorModeToggle />
          <button
            type="button"
            class="rounded-lg border border-hairline bg-surface-strong/50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-ink-muted transition-colors duration-300 ease-out-expo hover:border-neon-500 hover:bg-neon-500/10 hover:text-neon-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-300"
            :aria-label="t('nav.langToggleTo', { code: locale === 'es' ? 'EN' : 'ES' })"
            @click="toggleLocale"
          >
            {{ locale === 'es' ? 'EN' : 'ES' }}
          </button>
          <button
            type="button"
            class="inline-block rounded-lg bg-cobalt-500 px-2.5 py-1.5 text-xs font-semibold text-brand-900 transition-all duration-300 ease-out-expo hover:-translate-y-0.5 hover:bg-neon-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-300 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-900 sm:px-4 sm:py-2 sm:text-sm"
            @click="openContactModal()"
          >
            {{ t('nav.cta') }}
          </button>
        </div>
      </div>

      <!-- Mobile dropdown menu -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="max-h-0 opacity-0"
        enter-to-class="max-h-[40rem] opacity-100"
        leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="max-h-[40rem] opacity-100"
        leave-to-class="max-h-0 opacity-0"
      >
        <nav v-if="mobileMenuOpen" id="mobile-nav" class="overflow-hidden px-2 pb-2 md:hidden">
          <template v-for="item in navLinks" :key="item.key">
            <!-- Grupo: acordeón -->
            <div v-if="'children' in item" class="border-b border-hairline">
              <button
                type="button"
                class="flex w-full items-center justify-between py-3 text-sm font-semibold tracking-tight text-ink-muted transition-colors hover:text-accent-text"
                :aria-expanded="openMobileGroup === item.key"
                :aria-controls="`m-dd-${item.key}`"
                @click="toggleMobileGroup(item.key)"
              >
                {{ item.label }}
                <svg
                  class="h-3.5 w-3.5 transition-transform duration-200"
                  :class="openMobileGroup === item.key ? 'rotate-180' : ''"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="3"
                  aria-hidden="true"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div v-show="openMobileGroup === item.key" :id="`m-dd-${item.key}`" class="pb-2">
                <NuxtLink
                  v-for="child in item.children"
                  :key="child.key"
                  :to="child.to"
                  class="block py-2 pl-4 text-xs font-semibold tracking-tight text-ink-muted transition-colors hover:text-accent-text"
                  @click="closeMobileMenu"
                >
                  {{ child.label }}
                </NuxtLink>
              </div>
            </div>

            <!-- Enlace que abre el modal de contacto -->
            <button
              v-else-if="item.openModal"
              type="button"
              class="block w-full border-b border-hairline py-3 text-left text-sm font-semibold tracking-tight text-ink-muted transition-colors last:border-b-0 hover:text-accent-text"
              @click="openContactFromMobile"
            >
              {{ item.label }}
            </button>

            <!-- Enlace simple -->
            <NuxtLink
              v-else
              :to="item.to"
              class="block border-b border-hairline py-3 text-sm font-semibold tracking-tight text-ink-muted transition-colors last:border-b-0 hover:text-accent-text"
              @click="closeMobileMenu"
            >
              {{ item.label }}
            </NuxtLink>
          </template>

          <button
            type="button"
            class="block w-full py-3 text-left text-sm font-bold tracking-tight text-accent-text"
            @click="openContactFromMobile"
          >
            {{ t('nav.cta') }}
          </button>
        </nav>
      </Transition>
    </div>
  </header>
</template>
