/**
 * Sanity CLI config (SCAFFOLD, Fase 2). Ver la cabecera de `sanity.config.ts`
 * para el contexto y los comandos de arranque. Requiere `npm i -D sanity`.
 */
import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_PROJECT_ID || process.env.SANITY_STUDIO_PROJECT_ID || '',
    dataset: process.env.SANITY_DATASET || process.env.SANITY_STUDIO_DATASET || 'production',
  },
  // El bundle del Studio se sirve aparte del sitio; sin autoUpdates para
  // fijar la versión del toolkit por commit.
  autoUpdates: false,
})
