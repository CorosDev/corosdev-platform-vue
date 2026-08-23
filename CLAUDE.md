# Directiva de Ingeniería y Arquitectura: CorosDev Platform

## 1. Stack Core & Estructura
- Framework: Nuxt 4 (utilizando compatibilidad `future: { compatibilityVersion: 4 }`, código dentro de `/app`).
- Engine: Nitro Server + Vite 7 + Vue 3 Composition API (`<script setup lang="ts">`).
- Estilos: Tailwind CSS v4 nativo (`@tailwindcss/vite`). Prohibido crear `tailwind.config.js`.
- Estado & i18n: `useState()` o Pinia para estado global. Cero variables globales en `window`. Integración de i18n vía `@nuxtjs/i18n`.

## 2. Protocolo de Seguridad Enterprise
- Cero API Keys en el cliente. Toda comunicación sensible debe pasar por `/server/api/`.
- Sanitización de inputs mediante `zod` en todos los endpoints de Nitro.
- Manejo de Errores: Usar `createError()` en Nitro. Nunca exponer stack traces o errores crudos del servidor al cliente.
- Validación obligatoria de tokens Cloudflare Turnstile / Honeypot antes de procesar envíos.
- Headers OWASP estrictos mediante `nuxt-security`.

## 3. SEO, AEO y Analítica (CMO Requirements)
- Generación SSR / Prerenderizado estático en Nitro para páginas corporativas (`/`, `/services`).
- Inyección de esquemas JSON-LD (Schema.org: `Organization`, `SoftwareApplication`).
- Metadatos dinámicos con `useSeoMeta()` en cada vista.
- Carga diferida de scripts de analítica (GA4/GTM) para no impactar TBT (Total Blocking Time).

## 4. Performance & Core Web Vitals (Lighthouse 100/100)
- Imágenes y SVG: Uso de `@nuxt/image` con dimensiones explícitas (Cero CLS).
- Tipografía: `@nuxt/fonts` para serving local de *Plus Jakarta Sans*.
- Animaciones: GPU-accelerated exclusivamente (`transform`, `opacity`).

## 5. Protocolo de Ejecución de Claude Code
- Commits Semánticos: Usar formato Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`).
- Verificación: Antes de dar un paso por terminado, verificar el tipado y compilación sin errores (`npx nuxi typecheck`).