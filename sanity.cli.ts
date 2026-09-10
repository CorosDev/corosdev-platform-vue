/**
 * Sanity CLI config (Studio, "Portfolio & Case Studies Engine" + blog).
 *
 * `projectId` / `dataset` siguen la misma cascada que `sanity.config.ts`:
 * `SANITY_STUDIO_*` → `SANITY_*` → fallback estático al proyecto real, para
 * que `sanity build` / `sanity deploy` nunca fallen por falta de entorno.
 * El bloque `deployment` fija el Studio de destino en la nube.
 */
import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || process.env.SANITY_PROJECT_ID || 'g3zssgrv',
    dataset: process.env.SANITY_STUDIO_DATASET || process.env.SANITY_DATASET || 'production',
  },
  deployment: {
    appId: 'hiekr6iisyi6s6vjxymugg1k',
    autoUpdates: false,
  },
})
