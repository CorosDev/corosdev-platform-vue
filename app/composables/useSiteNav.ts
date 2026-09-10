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
 *
 * La estructura es un árbol de un nivel: un item o es un enlace (`NavLink`) o
 * es un grupo con desplegable (`NavGroup`). El navbar pinta el grupo como
 * dropdown accesible; el footer aplana todo con `footerLinks` — allí no hay
 * jerarquía, se listan todos los destinos.
 */
export interface NavLink {
  key: string
  label: string
  to: string
}

export interface NavGroup {
  key: string
  label: string
  children: NavLink[]
}

export type NavItem = NavLink | NavGroup

/** Type guard para separar grupos de enlaces en plantillas y lógica. */
export function isNavGroup(item: NavItem): item is NavGroup {
  return 'children' in item
}

export function useSiteNav() {
  const { t } = useI18n()
  const localePath = useLocalePath()

  const navLinks = computed<NavItem[]>(() => [
    { key: 'home', label: t('nav.home'), to: localePath('/') },
    {
      // "Ecosistema", "Aliados" y "Nosotros" viven bajo un único desplegable
      // para descargar la barra principal — todos hablan de quiénes somos.
      key: 'company',
      label: t('nav.company'),
      children: [
        { key: 'ecosystem', label: t('nav.ecosystem'), to: localePath('/ecosystem') },
        { key: 'partners', label: t('nav.partners'), to: localePath('/partners') },
        { key: 'about', label: t('nav.about'), to: localePath('/about') },
      ],
    },
    { key: 'services', label: t('nav.services'), to: localePath('/services') },
    { key: 'portfolio', label: t('nav.portfolio'), to: localePath('/portfolio') },
    { key: 'insights', label: t('nav.insights'), to: localePath('/blog') },
    { key: 'contact', label: t('nav.contact'), to: `${localePath('/')}#contact` },
  ])

  /** Lista plana de todos los destinos, para el footer (sin desplegables). */
  const footerLinks = computed<NavLink[]>(() =>
    navLinks.value.flatMap(item => (isNavGroup(item) ? item.children : [item])),
  )

  /** Agenda pública de descubrimiento, enlazada desde el CTA del navbar. */
  const bookingUrl = 'https://calendly.com/corosdev-info/30min'

  return { navLinks, footerLinks, bookingUrl }
}
