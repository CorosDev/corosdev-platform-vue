<script setup lang="ts">
const { t, locale, setLocale } = useI18n()
const localePath = useLocalePath()

const navLinks = computed(() => [
  { key: 'home', label: t('nav.home'), to: localePath('/') },
  { key: 'ecosystem', label: t('nav.ecosystem'), to: localePath('/ecosystem') },
  { key: 'partners', label: t('nav.partners'), to: localePath('/partners') },
  { key: 'services', label: t('nav.services'), to: localePath('/services') },
  { key: 'about', label: t('nav.about'), to: localePath('/about') },
  { key: 'contact', label: t('nav.contact'), to: `${localePath('/')}#contact` },
])

const bookingUrl = 'https://calendly.com/corosdev-info/30min'

const mobileMenuOpen = ref(false)
const scrolled = ref(false)

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

function closeMobileMenu() {
  mobileMenuOpen.value = false
}

// Toggles between the two configured locales — shows the language you'd
// switch TO (e.g. while browsing in Spanish, the button reads "EN").
function toggleLocale() {
  setLocale(locale.value === 'es' ? 'en' : 'es')
}

function handleScroll() {
  scrolled.value = window.scrollY > 8
}

onMounted(() => {
  handleScroll()
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <header class="fixed top-0 left-0 right-0 z-50">
    <div
      class="glass mx-auto max-w-7xl rounded-b-2xl px-6 py-3 shadow-2xl transition-colors duration-300"
      :class="scrolled ? 'bg-brand-900/85' : 'bg-brand-900/60'"
    >
      <div class="flex items-center justify-between">
        <!-- Hamburger (mobile only) -->
        <button
          type="button"
          class="flex h-8 w-8 flex-col justify-center gap-1.5 md:hidden"
          aria-label="Toggle menu"
          :aria-expanded="mobileMenuOpen"
          @click="toggleMobileMenu"
        >
          <span
            class="block h-0.5 w-full rounded-full bg-white/85 transition-transform duration-300"
            :class="mobileMenuOpen ? 'translate-y-2 rotate-45' : ''"
          />
          <span
            class="block h-0.5 w-full rounded-full bg-white/85 transition-opacity duration-300"
            :class="mobileMenuOpen ? 'opacity-0' : 'opacity-100'"
          />
          <span
            class="block h-0.5 w-full rounded-full bg-white/85 transition-transform duration-300"
            :class="mobileMenuOpen ? '-translate-y-2 -rotate-45' : ''"
          />
        </button>

        <!-- Logo -->
        <NuxtLink :to="localePath('/')" class="flex items-center gap-3" @click="closeMobileMenu">
          <NuxtPicture
            src="/coros.png"
            alt="CorosDev"
            width="361"
            height="220"
            loading="eager"
            class="h-12 w-auto md:h-16"
            :img-attrs="{ class: 'h-12 w-auto md:h-16' }"
          />
          <div class="mx-2 hidden h-6 w-px bg-white/10 sm:block" />
          <span class="hidden text-[10px] font-bold uppercase tracking-widest text-white opacity-80 sm:block">
            {{ t('nav.aiDrivenCompany') }}
          </span>
        </NuxtLink>

        <!-- Desktop nav -->
        <nav class="hidden items-center gap-8 text-sm font-semibold uppercase tracking-widest text-white/80 md:flex">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.key"
            :to="link.to"
            class="transition-colors hover:text-neon-500"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>

        <!-- Right side: lang toggle + CTA -->
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-white/70 transition-colors hover:border-neon-500 hover:bg-neon-500/10 hover:text-neon-300"
            :aria-label="t('nav.langToggleTo', { code: locale === 'es' ? 'EN' : 'ES' })"
            @click="toggleLocale"
          >
            {{ locale === 'es' ? 'EN' : 'ES' }}
          </button>
          <a
            :href="bookingUrl"
            target="_blank"
            rel="noopener"
            class="drop-shadow-glow inline-block rounded-xl bg-cobalt-500 px-2.5 py-1.5 text-xs font-semibold text-brand-900 transition-transform hover:scale-105 sm:px-4 sm:py-2 sm:text-sm"
          >
            {{ t('nav.cta') }}
          </a>
        </div>
      </div>

      <!-- Mobile dropdown menu -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="max-h-0 opacity-0"
        enter-to-class="max-h-96 opacity-100"
        leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="max-h-96 opacity-100"
        leave-to-class="max-h-0 opacity-0"
      >
        <nav v-if="mobileMenuOpen" class="overflow-hidden px-2 pb-2 md:hidden">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.key"
            :to="link.to"
            class="block border-b border-white/5 py-3 text-sm font-semibold uppercase tracking-widest text-white/70 transition-colors last:border-b-0 hover:text-neon-500"
            @click="closeMobileMenu"
          >
            {{ link.label }}
          </NuxtLink>
          <a
            :href="bookingUrl"
            target="_blank"
            rel="noopener"
            class="block py-3 text-sm font-bold uppercase tracking-widest text-neon-500"
            @click="closeMobileMenu"
          >
            {{ t('nav.cta') }}
          </a>
        </nav>
      </Transition>
    </div>
  </header>
</template>
