/**
 * Sanity CLI config (SCAFFOLD, Fase 2). Ver la cabecera de `sanity.config.ts`
 * para el contexto y los comandos de arranque. Requiere `npm i -D sanity`.
 */
import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'g3zssgrv',
    dataset: 'production'
  },
  deployment: {
    appId: 'hiekr6iisyi6s6vjxymugg1k',
    autoUpdates: false
  }
})