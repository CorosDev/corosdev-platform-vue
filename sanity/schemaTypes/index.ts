/**
 * Sanity schema registry.
 *
 * Consumed as `schema.types` by the Studio's `sanity.config.ts`. Definitions
 * are kept as plain objects so they carry zero dependency on the `sanity`
 * toolkit outside the Studio.
 *
 * - "Enterprise Insights Engine" (blog): post, author, category, blockContent
 * - "Portfolio & Case Studies Engine": caseStudy
 * - Shared: blockContent (Portable Text), seo
 */
import post from './post'
import author from './author'
import category from './category'
import caseStudy from './caseStudy'
import blockContent from './blockContent'
import seo from './seo'

export const schemaTypes = [
  // Documents
  post,
  author,
  category,
  caseStudy,
  // Objects
  blockContent,
  seo,
]

export default schemaTypes
