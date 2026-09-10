/**
 * Sanity Studio — configuración (SCAFFOLD, Fase 2).
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Este archivo NO se carga desde la app Nuxt. El Studio corre como
 * aplicación aparte para no arrastrar el toolkit `sanity` (~cientos de
 * dependencias) al bundle del sitio ni tener que abrir la CSP estricta de
 * `nuxt-security` (el Studio necesita `unsafe-eval`, `blob:` workers,
 * `style-src 'unsafe-inline'` y un `connect-src` amplio). Embeberlo bajo
 * `/admin` queda como decisión posterior, con sus excepciones de CSP
 * acotadas a esa ruta.
 *
 * Para levantarlo (una sola vez):
 *   npm i -D sanity @sanity/vision
 *   npx sanity dev            # http://localhost:3333
 *   npx sanity deploy         # publica en https://<slug>.sanity.studio
 *
 * Lee el projectId/dataset del entorno — primero las vars `SANITY_STUDIO_*`
 * (las únicas que la CLI de Sanity inyecta en el bundle del Studio), luego
 * las `SANITY_*` que comparte con `nuxt.config.ts`, y como último recurso un
 * fallback ESTÁTICO al proyecto real. Ese fallback existe porque el Studio
 * desplegado en la nube no siempre recibe el entorno, y sin projectId
 * `defineConfig` aborta el arranque con "projectId is required".
 * ─────────────────────────────────────────────────────────────────────────
 */
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'

import { schemaTypes } from './sanity/schemaTypes'

const projectId
  = process.env.SANITY_STUDIO_PROJECT_ID || process.env.SANITY_PROJECT_ID || 'g3zssgrv'
const dataset
  = process.env.SANITY_STUDIO_DATASET || process.env.SANITY_DATASET || 'production'

export default defineConfig({
  name: 'corosdev-insights',
  title: 'CorosDev · Enterprise Insights Engine',

  projectId,
  dataset,

  plugins: [
    // Árbol de contenido por defecto (documentos: Article / Author / Category).
    structureTool(),
    // Consola GROQ embebida para que marketing pruebe queries en vivo.
    visionTool({ defaultApiVersion: '2024-03-01' }),
  ],

  schema: {
    types: schemaTypes,
  },
})
