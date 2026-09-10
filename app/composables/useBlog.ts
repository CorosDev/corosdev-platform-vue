/**
 * Capa de datos del blog ("Enterprise Insights Engine").
 *
 * TODA lectura de Sanity pasa por aquí y NUNCA propaga un throw: si el
 * proyecto no está configurado (sin `SANITY_PROJECT_ID`), si la red falla o
 * si GROQ devuelve un error, el composable resuelve en silencio a un estado
 * vacío con `error: true`. Las vistas leen ese flag para pintar un "Modo
 * Mantenimiento" o un "Empty State" elegante — jamás un 500.
 *
 * Por qué el `try/catch` va DENTRO del handler de `useAsyncData` y no fuera:
 * si el handler lanzara, Nuxt marcaría la petición SSR como fallida y
 * respondería 500 con la página de error. Al capturar dentro y devolver el
 * shape de fallback, `useAsyncData.error` se queda en `null` y el render
 * continúa con datos vacíos.
 */
import type { MaybeRefOrGetter, Ref } from 'vue'

/**
 * Forma estructural mínima de un bloque de Portable Text — lo justo para
 * contar palabras y pasarlo a `<PortableText>`. Evita acoplar la capa de
 * datos al `.d.ts` de `@portabletext/vue` (que no re-exporta este tipo).
 */
export interface PortableTextBlockLike {
  _type: string
  _key?: string
  style?: string
  children?: Array<{ _type?: string, text?: string, marks?: string[] }>
  [key: string]: unknown
}

export interface BlogImage {
  url: string | null
  lqip?: string | null
  alt?: string | null
}

export interface BlogAuthor {
  name: string
  role?: string | null
  bio?: string | null
  image?: string | null
}

export interface BlogCategory {
  _id?: string
  title: string
  slug: string
  count?: number
}

export interface BlogPostCard {
  _id: string
  title: string
  slug: string
  excerpt?: string | null
  publishedAt?: string | null
  cover?: BlogImage | null
  author?: BlogAuthor | null
  category?: BlogCategory | null
}

export interface BlogSeo {
  metaTitle?: string | null
  metaDescription?: string | null
  keywords?: string[] | null
  noIndex?: boolean | null
  ogImage?: string | null
}

export interface BlogPost extends BlogPostCard {
  body?: PortableTextBlockLike[] | null
  seo?: BlogSeo | null
}

interface BlogIndexData {
  posts: BlogPostCard[]
  featuredPost: BlogPostCard | null
  categories: BlogCategory[]
  total: number
  error: boolean
}

interface BlogPostData {
  post: BlogPost | null
  /** `true` sólo cuando la lectura falló (backend caído / mal configurado). */
  error: boolean
}

function emptyIndex(): BlogIndexData {
  return { posts: [], featuredPost: null, categories: [], total: 0, error: true }
}

// `SANITY_TIMEOUT_MS`, `sanityFetchOpts()` y `cachedSanityData()` viven en
// `app/utils/sanityFetch.ts` (auto-importados) — compartidos con useCaseStudies.

// Proyección compartida por el listado, el destacado y el detalle, para que
// una tarjeta y su artículo nunca diverjan en forma. Incluye `author.bio`
// aunque las tarjetas no lo pinten: así el detalle NO necesita volver a
// declarar `"author"` (una clave repetida en la proyección es un error de
// parseo de GROQ — la petición lanza y la vista cae en Modo Mantenimiento).
const CARD_PROJECTION = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  "cover": mainImage{ "url": asset->url, "lqip": asset->metadata.lqip, alt },
  "author": author->{ name, role, bio, "image": image.asset->url },
  "category": category->{ title, "slug": slug.current }
`

// `$category` opcional: si llega `null` el filtro se desactiva por completo
// (`!defined($category)`), sin interpolar strings dentro de la query.
const POSTS_QUERY = groq`*[
  _type == "post" && defined(slug.current) &&
  (!defined($category) || category->slug.current == $category)
] | order(publishedAt desc) [$start...$end] {${CARD_PROJECTION}}`

const POSTS_COUNT_QUERY = groq`count(*[
  _type == "post" && defined(slug.current) &&
  (!defined($category) || category->slug.current == $category)
])`

const FEATURED_QUERY = groq`*[
  _type == "post" && defined(slug.current)
] | order(publishedAt desc) [0] {${CARD_PROJECTION}}`

const CATEGORIES_QUERY = groq`*[_type == "category" && defined(slug.current)] | order(title asc) {
  _id,
  title,
  "slug": slug.current,
  "count": count(*[_type == "post" && references(^._id) && defined(slug.current)])
}`

// Detalle: la MISMA proyección de tarjeta (que ya trae `author.bio`) más el
// cuerpo y el bloque SEO. Sin re-declarar `"author"` — ver la nota en
// `CARD_PROJECTION`. El filtro es por el slug tal cual llega de la ruta
// (`slug.current == $slug`): el `post` no es un documento localizado, así
// que `/blog/x` y `/en/blog/x` resuelven el mismo doc, sin fallback de idioma.
const POST_QUERY = groq`*[_type == "post" && slug.current == $slug] [0] {
  ${CARD_PROJECTION},
  body,
  seo{
    metaTitle,
    metaDescription,
    keywords,
    noIndex,
    "ogImage": ogImage.asset->url
  }
}`

/**
 * Minutos de lectura estimados a 200 ppm sobre el texto plano del Portable
 * Text. Cuenta sólo los spans de los bloques de texto; ignora imágenes y
 * objetos embebidos. Mínimo 1.
 */
export function estimateReadingTime(blocks?: PortableTextBlockLike[] | null): number {
  if (!blocks?.length) return 1
  let words = 0
  for (const block of blocks) {
    if (block._type !== 'block' || !Array.isArray(block.children)) continue
    for (const child of block.children) {
      if (typeof child.text === 'string' && child.text.trim()) {
        words += child.text.trim().split(/\s+/).length
      }
    }
  }
  return Math.max(1, Math.round(words / 200))
}

/**
 * Listado del blog con filtro por categoría y paginación (server-side vía
 * GROQ). La búsqueda rápida se resuelve en cliente sobre la página ya
 * cargada — ver `/blog/index.vue`.
 */
export async function useBlogIndex(options: {
  category?: Ref<string | null>
  page?: Ref<number>
  pageSize?: number
} = {}) {
  const pageSize = options.pageSize ?? 9
  const category = options.category ?? ref<string | null>(null)
  const page = options.page ?? ref(1)

  const { projectId } = useSanityConfig()
  const sanity = projectId ? useSanity() : null

  const query = await useAsyncData<BlogIndexData>(
    // Clave por combinación de filtro+página: cada vista se cachea por
    // separado, así volver a un filtro ya visto es instantáneo vía
    // `getCachedData` en vez de re-consultar.
    () => `blog:index:${unref(category) ?? 'all'}:${unref(page)}`,
    async () => {
      if (!sanity) return emptyIndex()

      const current = Math.max(1, Math.floor(unref(page)))
      const start = (current - 1) * pageSize
      const end = start + pageSize
      const cat = unref(category) || null

      try {
        const [posts, featuredPost, categories, total] = await Promise.all([
          sanity.fetch<BlogPostCard[]>(POSTS_QUERY, { category: cat, start, end }, sanityFetchOpts()),
          sanity.fetch<BlogPostCard | null>(FEATURED_QUERY, {}, sanityFetchOpts()),
          sanity.fetch<BlogCategory[]>(CATEGORIES_QUERY, {}, sanityFetchOpts()),
          sanity.fetch<number>(POSTS_COUNT_QUERY, { category: cat }, sanityFetchOpts()),
        ])
        return {
          posts: posts ?? [],
          featuredPost: featuredPost ?? null,
          categories: categories ?? [],
          total: total ?? 0,
          error: false,
        }
      }
      catch (err) {
        console.error('[useBlog] listado falló — degradando a Modo Mantenimiento:', err)
        return emptyIndex()
      }
    },
    {
      default: emptyIndex,
      getCachedData: (key, nuxtApp) => cachedSanityData<BlogIndexData>(key, nuxtApp),
      watch: [category, page],
    },
  )

  return { ...query, pageSize, page, category }
}

/**
 * Artículo individual por slug. `post: null` + `error: false` significa
 * "no existe" (la vista debe lanzar un 404); `error: true` significa "no se
 * pudo leer" (la vista pinta Modo Mantenimiento, sin 404 ni 500).
 */
export async function useBlogPost(slug: MaybeRefOrGetter<string>) {
  const slugRef = toRef(slug)
  const { projectId } = useSanityConfig()
  const sanity = projectId ? useSanity() : null

  return await useAsyncData<BlogPostData>(
    () => `blog:post:${slugRef.value}`,
    async () => {
      if (!sanity) return { post: null, error: true }
      if (!slugRef.value) return { post: null, error: false }

      try {
        const post = await sanity.fetch<BlogPost | null>(
          POST_QUERY,
          { slug: slugRef.value },
          sanityFetchOpts(),
        )
        // Log defensivo, sólo en dev: distingue "no existe" de "falló la
        // query" sin tener que abrir la pestaña de red.
        if (import.meta.dev && !post) {
          console.warn(`[useBlog] sin resultado para slug="${slugRef.value}" — el post no existe o el slug no coincide con slug.current`)
        }
        return { post: post ?? null, error: false }
      }
      catch (err) {
        console.error(`[useBlog] la query del artículo (slug="${slugRef.value}") lanzó — Modo Mantenimiento:`, err)
        return { post: null, error: true }
      }
    },
    {
      default: () => ({ post: null, error: false }),
      getCachedData: (key, nuxtApp) => cachedSanityData<BlogPostData>(key, nuxtApp),
      watch: [slugRef],
    },
  )
}
