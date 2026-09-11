/**
 * Lectura server-only de un artículo por slug.
 *
 * Existe para que `useBlogPost()` (app/composables/useBlog.ts) NUNCA hable
 * con Sanity directo desde el navegador. Antes de esto, el `useAsyncData`
 * de esa composable llamaba a `useSanity().fetch(...)` en el propio cuerpo
 * del handler — en SSR eso corre en el servidor sin problema, pero en
 * NAVEGACIÓN CLIENTE (click en una tarjeta del índice hacia un slug nuevo,
 * sin caché) el mismo handler se re-ejecuta en el NAVEGADOR, que entonces
 * sale directo a `*.apicdn.sanity.io` — una petición cross-origin sujeta a
 * la lista de orígenes CORS del proyecto de Sanity (configurada en
 * sanity.io/manage, fuera de este repo). Si ese origen no está en la lista
 * (cualquier puerto de desarrollo nuevo, un preview de Vercel, etc.), Sanity
 * responde sin cabecera `Access-Control-Allow-Origin` y el navegador lo
 * reporta como "bloqueado por CORS" — el bug reportado.
 *
 * Con esta ruta, `useBlogPost()` SIEMPRE pasa por aquí (mismo origen, nunca
 * CORS) — ver el comentario ahí para el porqué de $fetch en vez de
 * `useSanity()` directo. Este handler es el único lugar que efectivamente
 * llama a Sanity, siempre servidor-a-servidor.
 *
 * La proyección GROQ Y los tipos de abajo están DUPLICADOS a propósito
 * respecto a `POST_QUERY`/`CARD_PROJECTION`/`BlogPost` en useBlog.ts: ese
 * archivo construye la query con el tag `groq` (no auto-importado en el
 * contexto de Nitro — mismo motivo por el que server/api/__sitemap__/*.ts ya
 * duplican su propia query local en vez de importar de ahí) y sus funciones
 * usan auto-imports de la app (`useAsyncData`, `toRef`...) que no existen
 * bajo el tsconfig de `server/`. Incluso un `import type` de ese archivo
 * arrastra sus auto-imports al grafo de tipos del lado servidor y rompe el
 * typecheck — probado. Si cambia una proyección o forma, cambian ambas.
 */
interface BlogAuthorRow {
  name: string
  role?: string | null
  bio?: string | null
  image?: string | null
}

interface BlogCategoryRow {
  title: string
  slug: string
}

interface BlogImageRow {
  url: string | null
  lqip?: string | null
  alt?: string | null
}

interface BlogSeoRow {
  metaTitle?: string | null
  metaDescription?: string | null
  keywords?: string[] | null
  noIndex?: boolean | null
  ogImage?: string | null
}

interface BlogPostRow {
  _id: string
  title: string
  slug: string
  excerpt?: string | null
  publishedAt?: string | null
  updatedAt?: string | null
  cover?: BlogImageRow | null
  author?: BlogAuthorRow | null
  category?: BlogCategoryRow | null
  body?: unknown
  seo?: BlogSeoRow | null
}

interface BlogPostResponse {
  post: BlogPostRow | null
  error: boolean
}

const POST_QUERY = /* groq */ `*[_type == "post" && slug.current == $slug] [0] {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  "updatedAt": _updatedAt,
  "cover": mainImage{ "url": asset->url, "lqip": asset->metadata.lqip, alt },
  "author": author->{ name, role, bio, "image": image.asset->url },
  "category": category->{ title, "slug": slug.current },
  body,
  seo{
    metaTitle,
    metaDescription,
    keywords,
    noIndex,
    "ogImage": ogImage.asset->url
  }
}`

const SANITY_TIMEOUT_MS = 8000

export default defineEventHandler(async (event): Promise<BlogPostResponse> => {
  const slug = getRouterParam(event, 'slug')
  const projectId = (
    useRuntimeConfig(event).public.sanity as { projectId?: string } | undefined
  )?.projectId

  // Sin proyecto configurado ⇒ Modo Mantenimiento, igual que el resto de la
  // capa de datos del blog. Sin slug (no debería pasar, la ruta lo exige) ⇒
  // "no existe", no un fallo de backend.
  if (!projectId) return { post: null, error: true }
  if (!slug) return { post: null, error: false }

  try {
    const post = await useSanity(event).fetch<BlogPostRow | null>(
      POST_QUERY,
      { slug },
      { signal: AbortSignal.timeout(SANITY_TIMEOUT_MS) },
    )
    return { post: post ?? null, error: false }
  }
  catch (err) {
    console.error(`[api/blog/:slug] la query del artículo (slug="${slug}") lanzó:`, err)
    return { post: null, error: true }
  }
})
