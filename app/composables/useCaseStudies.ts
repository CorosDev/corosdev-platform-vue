/**
 * Capa de datos del portafolio ("Portfolio & Case Studies Engine").
 *
 * Mismo contrato defensivo que `useBlog.ts`: TODA lectura de Sanity pasa por
 * aquí y NUNCA propaga un throw. Sin `SANITY_PROJECT_ID`, con la red caída o
 * con un error de GROQ, el composable resuelve en silencio a un estado vacío
 * con `error: true` para que la vista pinte un "Modo Mantenimiento" o un
 * "Empty State" elegante — jamás un 500.
 *
 * El `try/catch` va DENTRO del handler de `useAsyncData` a propósito: si el
 * handler lanzara, Nuxt marcaría la SSR como fallida y respondería 500.
 * Capturando dentro y devolviendo el shape de fallback, `useAsyncData.error`
 * se queda en `null` y el render continúa con datos vacíos.
 */
import type { MaybeRefOrGetter, Ref } from 'vue'
// El bloque de Portable Text tiene la misma forma en todo el proyecto; se
// reutiliza el tipo ya definido (import type, sin re-exportar, para no chocar
// con el auto-import de Nuxt).
import type { PortableTextBlockLike } from './useBlog'

export interface CaseStudyImage {
  url: string | null
  lqip?: string | null
  alt?: string | null
}

export interface CaseStudyMetric {
  label: string
  value: string
  impact?: string | null
}

export interface CaseStudySeo {
  metaTitle?: string | null
  metaDescription?: string | null
  keywords?: string[] | null
  noIndex?: boolean | null
  ogImage?: string | null
}

export interface CaseStudyCard {
  _id: string
  title: string
  slug: string
  client: string
  industry?: string | null
  summary?: string | null
  publishedAt?: string | null
  featured?: boolean | null
  hero?: CaseStudyImage | null
}

export interface CaseStudy extends CaseStudyCard {
  body?: PortableTextBlockLike[] | null
  keyMetrics?: CaseStudyMetric[] | null
  technologies?: string[] | null
  seo?: CaseStudySeo | null
}

export interface CaseStudyIndustry {
  value: string
  count: number
}

interface CaseStudiesIndexData {
  caseStudies: CaseStudyCard[]
  featured: CaseStudyCard | null
  industries: CaseStudyIndustry[]
  total: number
  error: boolean
}

interface CaseStudyData {
  caseStudy: CaseStudy | null
  /** `true` sólo cuando la lectura falló (backend caído / mal configurado). */
  error: boolean
}

function emptyIndex(): CaseStudiesIndexData {
  return { caseStudies: [], featured: null, industries: [], total: 0, error: true }
}

/**
 * Reduce las filas planas de `INDUSTRIES_QUERY` a facetas únicas con su
 * conteo, ordenadas alfabéticamente. Se hace en cliente porque `industry` es
 * un string libre en el esquema (no una referencia con documento propio).
 */
function tallyIndustries(rows: Array<{ value?: string | null }> | null): CaseStudyIndustry[] {
  const counts = new Map<string, number>()
  for (const row of rows ?? []) {
    const value = (row.value ?? '').trim()
    if (!value) continue
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => a.value.localeCompare(b.value))
}

// Proyección compartida por el listado, el destacado y el detalle, para que
// una tarjeta y su caso nunca diverjan en forma.
const CARD_PROJECTION = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  client,
  industry,
  summary,
  publishedAt,
  featured,
  "hero": heroImage{ "url": asset->url, "lqip": asset->metadata.lqip, alt }
`

// `$industry` opcional: si llega `null` el filtro se desactiva por completo
// (`!defined($industry)`), sin interpolar strings dentro de la query.
const CASE_STUDIES_QUERY = groq`*[
  _type == "caseStudy" && defined(slug.current) &&
  (!defined($industry) || industry == $industry)
] | order(publishedAt desc) [$start...$end] {${CARD_PROJECTION}}`

const CASE_STUDIES_COUNT_QUERY = groq`count(*[
  _type == "caseStudy" && defined(slug.current) &&
  (!defined($industry) || industry == $industry)
])`

const FEATURED_CASE_STUDY_QUERY = groq`*[
  _type == "caseStudy" && defined(slug.current) && featured == true
] | order(publishedAt desc) [0] {${CARD_PROJECTION}}`

const INDUSTRIES_QUERY = groq`*[
  _type == "caseStudy" && defined(slug.current) && defined(industry)
] { "value": industry }`

const CASE_STUDY_QUERY = groq`*[_type == "caseStudy" && slug.current == $slug] [0] {
  ${CARD_PROJECTION},
  body,
  keyMetrics[]{ label, value, impact },
  technologies,
  seo{
    metaTitle,
    metaDescription,
    keywords,
    noIndex,
    "ogImage": ogImage.asset->url
  }
}`

/**
 * Listado del portafolio con filtro por industria y paginación (server-side
 * vía GROQ). Una búsqueda rápida en texto, si se añade, se resuelve en
 * cliente sobre la página ya cargada — mismo patrón que `/blog`.
 */
export async function useCaseStudiesIndex(options: {
  industry?: Ref<string | null>
  page?: Ref<number>
  pageSize?: number
} = {}) {
  const pageSize = options.pageSize ?? 9
  const industry = options.industry ?? ref<string | null>(null)
  const page = options.page ?? ref(1)

  const { projectId } = useSanityConfig()
  const sanity = projectId ? useSanity() : null

  const query = await useAsyncData<CaseStudiesIndexData>(
    'case-studies:index',
    async () => {
      if (!sanity) return emptyIndex()

      const current = Math.max(1, Math.floor(unref(page)))
      const start = (current - 1) * pageSize
      const end = start + pageSize
      const sector = unref(industry) || null

      try {
        const [caseStudies, featured, industryRows, total] = await Promise.all([
          sanity.fetch<CaseStudyCard[]>(CASE_STUDIES_QUERY, { industry: sector, start, end }),
          sanity.fetch<CaseStudyCard | null>(FEATURED_CASE_STUDY_QUERY),
          sanity.fetch<Array<{ value?: string | null }>>(INDUSTRIES_QUERY),
          sanity.fetch<number>(CASE_STUDIES_COUNT_QUERY, { industry: sector }),
        ])
        return {
          caseStudies: caseStudies ?? [],
          featured: featured ?? null,
          industries: tallyIndustries(industryRows),
          total: total ?? 0,
          error: false,
        }
      }
      catch (err) {
        console.error('[useCaseStudies] listado falló — degradando a Modo Mantenimiento:', err)
        return emptyIndex()
      }
    },
    {
      default: emptyIndex,
      watch: [industry, page],
    },
  )

  return { ...query, pageSize, page, industry }
}

/**
 * Caso individual por slug. `caseStudy: null` + `error: false` significa
 * "no existe" (la vista debe lanzar un 404); `error: true` significa "no se
 * pudo leer" (la vista pinta Modo Mantenimiento, sin 404 ni 500).
 */
export async function useCaseStudy(slug: MaybeRefOrGetter<string>) {
  const slugRef = toRef(slug)
  const { projectId } = useSanityConfig()
  const sanity = projectId ? useSanity() : null

  return await useAsyncData<CaseStudyData>(
    () => `case-study:${slugRef.value}`,
    async () => {
      if (!sanity) return { caseStudy: null, error: true }
      if (!slugRef.value) return { caseStudy: null, error: false }

      try {
        const caseStudy = await sanity.fetch<CaseStudy | null>(CASE_STUDY_QUERY, {
          slug: slugRef.value,
        })
        return { caseStudy: caseStudy ?? null, error: false }
      }
      catch (err) {
        console.error('[useCaseStudies] caso falló — degradando a Modo Mantenimiento:', err)
        return { caseStudy: null, error: true }
      }
    },
    {
      default: () => ({ caseStudy: null, error: false }),
      watch: [slugRef],
    },
  )
}
