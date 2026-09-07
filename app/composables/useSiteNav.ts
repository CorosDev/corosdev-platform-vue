/**
 * Fuente única de la navegación global.
 *
 * AppNavbar y AppFooter pintaban (o dejaban de pintar) sus propios enlaces
 * por separado: el navbar tenía los seis y el footer ninguno. Con dos listas
 * a mano, añadir una ruta significaba acordarse de tocar dos archivos, y es
 * exactamente el tipo de duda que termina en un footer desactualizado.
 *
 * `useLocalePath()` se resuelve aquí dentro, así que cada consumidor recibe
 * las rutas ya prefijadas para el idioma activo (`/services` en español,
 * `/en/services` en inglés) sin repetir esa lógica.
 */
export function useSiteNav() {
  const { t } = useI18n()
  const localePath = useLocalePath()

  const navLinks = computed(() => [
    { key: 'home', label: t('nav.home'), to: localePath('/') },
    { key: 'ecosystem', label: t('nav.ecosystem'), to: localePath('/ecosystem') },
    { key: 'partners', label: t('nav.partners'), to: localePath('/partners') },
    { key: 'services', label: t('nav.services'), to: localePath('/services') },
    { key: 'about', label: t('nav.about'), to: localePath('/about') },
    { key: 'contact', label: t('nav.contact'), to: `${localePath('/')}#contact` },
  ])

  /** Agenda pública de descubrimiento, enlazada desde el CTA del navbar. */
  const bookingUrl = 'https://calendly.com/corosdev-info/30min'

  return { navLinks, bookingUrl }
}
