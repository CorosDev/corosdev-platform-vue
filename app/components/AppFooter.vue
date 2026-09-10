<script setup lang="ts">
/**
 * El footer era una sola línea de copyright: ningún enlace, ninguna salida.
 * En una web B2B eso desperdicia el punto donde más gente llega tras leer
 * una página entera, y deja al visitante sin ruta que no sea volver arriba.
 *
 * Los enlaces salen de useSiteNav(), la misma fuente que alimenta al navbar,
 * para que no puedan divergir.
 */
const { t } = useI18n()
// `footerLinks` es la lista aplanada: el footer muestra todos los destinos
// sin la jerarquía de desplegables que usa el navbar.
const { footerLinks } = useSiteNav()
const localePath = useLocalePath()

const year = new Date().getFullYear()
</script>

<template>
  <footer class="mt-8 border-t border-white/10">
    <div class="mx-auto max-w-7xl px-6 py-12">
      <div class="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <NuxtLink :to="localePath('/')" class="inline-flex items-center gap-3">
            <NuxtPicture
              src="/coros.png"
              alt="CorosDev"
              width="361"
              height="220"
              sizes="70px"
              loading="lazy"
              :img-attrs="{ class: 'h-10 w-auto' }"
            />
          </NuxtLink>
          <p class="mt-4 max-w-xs text-sm leading-relaxed text-white/55">
            {{ t('home.contact.location') }}
          </p>
        </div>

        <nav :aria-label="t('footer.navLabel')" class="grid grid-cols-2 gap-x-10 gap-y-3 sm:grid-cols-3 lg:gap-x-16">
          <NuxtLink
            v-for="link in footerLinks"
            :key="link.key"
            :to="link.to"
            class="rounded text-sm font-semibold text-white/55 transition-colors duration-300 ease-out-expo hover:text-neon-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-300"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>
      </div>

      <div class="mt-10 border-t border-white/10 pt-6">
        <p class="text-xs text-white/50">&copy; {{ year }} {{ t('footer.rights') }}</p>
      </div>
    </div>
  </footer>
</template>
