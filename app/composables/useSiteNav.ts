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
  /**
   * Cuando es `true`, el navbar pinta este item como botón que abre el modal
   * de contacto (`useContactModal`) en vez de un enlace. El footer lo ignora
   * y sigue usando `to` (que apunta a la sección de contacto del home).
   */
  openModal?: boolean
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
    {
      // Mismo patrón que "company": los 3 pilares de /services (ya eran las
      // pestañas de scroll-spy de ServicesPillarNav, mismas claves i18n
      // `services.pillars.*_nav`) cuelgan de un desplegable en vez de un
      // enlace plano, para poder saltar a cada sección desde cualquier
      // página con un solo clic.
      key: 'services',
      label: t('nav.services'),
      children: [
        { key: 'customSoftware', label: t('services.pillars.customSoftware_nav'), to: `${localePath('/services')}#custom-software` },
        { key: 'scalingTalent', label: t('services.pillars.scalingTalent_nav'), to: `${localePath('/services')}#scaling-talent` },
        { key: 'techPartnership', label: t('services.pillars.techPartnership_nav'), to: `${localePath('/services')}#tech-partnership` },
      ],
    },
    { key: 'portfolio', label: t('nav.portfolio'), to: localePath('/portfolio') },
    { key: 'insights', label: t('nav.insights'), to: localePath('/blog') },
    { key: 'contact', label: t('nav.contact'), to: `${localePath('/')}#contact`, openModal: true },
  ])

  /** Lista plana de todos los destinos, para el footer (sin desplegables). */
  const footerLinks = computed<NavLink[]>(() =>
    navLinks.value.flatMap(item => (isNavGroup(item) ? item.children : [item])),
  )

  /** Agenda pública de descubrimiento, enlazada desde el CTA del navbar. */
  const bookingUrl = 'https://calendly.com/corosdev-info/30min'

  return { navLinks, footerLinks, bookingUrl }
}
