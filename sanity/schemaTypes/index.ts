/**
 * Sanity schema registry for the "Enterprise Insights Engine" blog.
 *
 * Phase 1 delivers the schema definitions only. When the Studio is scaffolded
 * (Phase 2) its `sanity.config.ts` consumes this array as `schema.types`.
 * Definitions are kept as plain objects so they carry zero dependency on the
 * `sanity` toolkit until the Studio itself is added.
 */
import post from './post'
import author from './author'
import category from './category'
import blockContent from './blockContent'
import seo from './seo'

export const schemaTypes = [
  // Documents
  post,
  author,
  category,
  // Objects
  blockContent,
  seo,
]

export default schemaTypes
