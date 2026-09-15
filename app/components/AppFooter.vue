<script setup lang="ts">
/**
 * El footer era una sola línea de copyright: ningún enlace, ninguna salida.
 * En una web B2B eso desperdicia el punto donde más gente llega tras leer
 * una página entera, y deja al visitante sin ruta que no sea volver arriba.
 *
 * Los enlaces salen de useSiteNav(), la misma fuente que alimenta al navbar,
 * para que no puedan divergir.
 *
 * Las 4 oficinas (pedido explícito: "recuerda que son 4 direcciones...
 * me gustaría que las pusieras todas") reutilizan el MISMO texto que ya
 * existe para las tarjetas del globo en el Hero (`home.hero.globeLocations.*`
 * — ver GlobalGlobe.vue) en vez de escribir la dirección de cada oficina por
 * segunda vez en los locales: una sola fuente de verdad, así una dirección
 * que cambie no puede desincronizarse entre el Hero y el footer. El array
 * `officeMeta` (id + countryCode) es la misma idea que ya usa
 * HeroSection.vue para sus `locationChips` de respaldo — un mapeo local
 * chiquito en vez de un composable compartido para 4 entradas estáticas.
 *
 * La línea corta que antes vivía aquí (`home.contact.location`, sólo
 * Honduras + Praga) se quitó: quedaba redundante e incompleta ahora que las
 * 4 oficinas están abajo con su dirección completa. Esa clave i18n sigue
 * viva y en uso en ContactSection.vue, sólo se dejó de repetir aquí.
 */
const { t } = useI18n()
// `footerLinks` es la lista aplanada: el footer muestra todos los destinos
// sin la jerarquía de desplegables que usa el navbar.
const { footerLinks } = useSiteNav()
const localePath = useLocalePath()

const year = new Date().getFullYear()

interface OfficeMeta {
  id: 'honduras' | 'miami' | 'wyoming' | 'prague'
  countryCode: 'HN' | 'US' | 'CZ'
}

const officeMeta: OfficeMeta[] = [
  { id: 'honduras', countryCode: 'HN' },
  { id: 'miami', countryCode: 'US' },
  { id: 'wyoming', countryCode: 'US' },
  { id: 'prague', countryCode: 'CZ' },
]

const offices = computed(() =>
  officeMeta.map((office) => {
    const base = `home.hero.globeLocations.${office.id}`
    return {
      ...office,
      type: t(`${base}.type`),
      title: t(`${base}.title`),
      company: t(`${base}.company`),
      // `address4` viene vacío para Wyoming/Praga (3 líneas, no 4) — se
      // filtra en vez de dejar una línea en blanco en la tarjeta.
      addressLines: [
        t(`${base}.address1`),
        t(`${base}.address2`),
        t(`${base}.address3`),
        t(`${base}.address4`),
      ].filter(Boolean),
    }
  }),
)
</script>

<template>
  <footer class="mt-8 border-t border-hairline">
    <div class="mx-auto max-w-7xl px-6 py-12">
      <div class="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
        <!-- Misma pareja dark:/light: que AppNavbar.vue — ver el comentario
             de ese archivo para por qué son dos PNG y no un filtro. -->
        <NuxtLink :to="localePath('/')" class="inline-flex items-center gap-3">
          <NuxtPicture
            src="/coros-light.png"
            alt="CorosDev"
            width="361"
            height="220"
            sizes="70px"
            loading="lazy"
            class="dark:hidden"
            :img-attrs="{ class: 'h-10 w-auto dark:hidden' }"
          />
          <NuxtPicture
            src="/coros.png"
            alt="CorosDev"
            width="361"
            height="220"
            sizes="70px"
            loading="lazy"
            class="hidden dark:block"
            :img-attrs="{ class: 'hidden h-10 w-auto dark:block' }"
          />
        </NuxtLink>

        <nav :aria-label="t('footer.navLabel')" class="grid grid-cols-2 gap-x-10 gap-y-3 sm:grid-cols-3 lg:gap-x-16">
          <NuxtLink
            v-for="link in footerLinks"
            :key="link.key"
            :to="link.to"
            class="rounded text-sm font-semibold text-ink-muted transition-colors duration-300 ease-out-expo hover:text-neon-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-300"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>
      </div>

      <!-- Las 4 oficinas — ver el docstring de arriba. -->
      <div class="mt-10 border-t border-hairline pt-10">
        <p class="mb-6 text-[11px] font-bold uppercase tracking-[0.3em] text-ink-muted">
          {{ t('footer.officesLabel') }}
        </p>
        <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div v-for="office in offices" :key="office.id" class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
              <UiFlagIcon :code="office.countryCode" />
              <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-muted">
                {{ office.type }}
              </p>
            </div>
            <p class="text-sm font-bold text-ink">{{ office.title }}</p>
            <address class="not-italic text-xs leading-relaxed text-ink-muted">
              <span class="block">{{ office.company }}</span>
              <span v-for="(line, i) in office.addressLines" :key="i" class="block">{{ line }}</span>
            </address>
          </div>
        </div>
      </div>

      <div class="mt-10 border-t border-hairline pt-6">
        <p class="text-xs text-ink-muted">&copy; {{ year }} {{ t('footer.rights') }}</p>
      </div>
    </div>
  </footer>
</template>
