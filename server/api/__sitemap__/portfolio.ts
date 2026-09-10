/**
 * Fuente dinámica del sitemap para el portafolio.
 *
 * `@nuxtjs/sitemap` ya descubre la ruta estática `/portfolio` (de
 * `app/pages/portfolio/index.vue`) al escanear el router de Nuxt; las rutas
 * dinámicas `/portfolio/[slug]` no, así que este endpoint las aporta
 * consultando los slugs de casos de éxito publicados en Sanity. Se registra
 * vía `sitemap.sources` en `nuxt.config.ts`.
 *
 * Defensivo, igual que `app/composables/useCaseStudies.ts`: sin `projectId`,
 * o si la consulta a Sanity falla, devuelve `[]` y el sitemap se genera con
 * el resto del sitio intacto — nunca rompe la build ni la respuesta de
 * `/sitemap.xml`.
 */
interface CaseStudySlugRow {
  slug: string
  _updatedAt?: string
  publishedAt?: string
}

// `groq` no está auto-importado en el contexto de Nitro; la query va como
// string plano (no necesita el tag para nada más que resaltado).
const SLUGS_QUERY = /* groq */ `*[_type == "caseStudy" && defined(slug.current)]
  | order(publishedAt desc) {
    "slug": slug.current,
    _updatedAt,
    publishedAt
  }`

export default defineSitemapEventHandler(async (event) => {
  const projectId = (
    useRuntimeConfig(event).public.sanity as { projectId?: string } | undefined
  )?.projectId
  if (!projectId) return []

  try {
    const rows = await useSanity(event).fetch<CaseStudySlugRow[]>(SLUGS_QUERY)
    return (rows ?? [])
      .filter(row => Boolean(row.slug))
      .map((row) => {
        const lastmod = row._updatedAt || row.publishedAt
        return {
          loc: `/portfolio/${row.slug}`,
          ...(lastmod ? { lastmod } : {}),
          // Expande la URL a cada locale con sus <xhtml:link rel="alternate">.
          _i18nTransform: true,
        }
      })
  }
  catch (err) {
    console.error('[sitemap] fuente del portafolio falló — se omiten las URLs de casos:', err)
    return []
  }
})
