<script setup lang="ts">
/**
 * Bandera de país como SVG inline — no emoji.
 *
 * Los glifos de bandera (🇭🇳 🇺🇸 🇨🇿) son en realidad dos "regional indicator
 * symbols" que el sistema operativo debe combinar en un solo glifo de
 * bandera; Windows y varias distros de Linux no traen esa fuente y muestran
 * las dos letras sueltas ("HN", "US", "CZ") en vez de la bandera. Un SVG
 * inline no depende de ninguna fuente del sistema, así que se ve igual en
 * todas partes — y, al ser inline (no una imagen de un CDN), no requiere
 * abrir la CSP `img-src` (nuxt.config.ts sólo permite `'self'`, `data:` y
 * `cdn.sanity.io`) ni añadir una dependencia de red al Hero.
 *
 * Trazos simplificados a propósito para verse nítidos a `h-3 w-5` (el
 * tamaño de un badge de ubicación): la franja blanca de Honduras lleva sus
 * 5 estrellas como puntos, y la bandera de EE. UU. sus franjas y cantón sin
 * las 50 estrellas individuales, que a ese tamaño serían ruido visual.
 */
defineProps<{
  code: 'HN' | 'US' | 'CZ'
}>()
</script>

<template>
  <span
    class="inline-block h-3 w-5 shrink-0 overflow-hidden rounded-[2px] ring-1 ring-inset ring-hairline"
    role="img"
    :aria-label="`${code} flag`"
  >
    <svg v-if="code === 'HN'" viewBox="0 0 20 12" preserveAspectRatio="none" class="h-full w-full">
      <rect width="20" height="12" fill="#0073cf" />
      <rect y="4" width="20" height="4" fill="#fff" />
      <g fill="#0073cf">
        <circle cx="6" cy="6" r="0.55" />
        <circle cx="8" cy="6" r="0.55" />
        <circle cx="10" cy="6" r="0.55" />
        <circle cx="12" cy="6" r="0.55" />
        <circle cx="14" cy="6" r="0.55" />
      </g>
    </svg>

    <svg v-else-if="code === 'US'" viewBox="0 0 20 12" preserveAspectRatio="none" class="h-full w-full">
      <rect width="20" height="12" fill="#fff" />
      <g fill="#b22234">
        <rect width="20" height="0.92" />
        <rect y="1.85" width="20" height="0.92" />
        <rect y="3.69" width="20" height="0.92" />
        <rect y="5.54" width="20" height="0.92" />
        <rect y="7.38" width="20" height="0.92" />
        <rect y="9.23" width="20" height="0.92" />
        <rect y="11.08" width="20" height="0.92" />
      </g>
      <rect width="8.6" height="6.46" fill="#3c3b6e" />
    </svg>

    <svg v-else viewBox="0 0 20 12" preserveAspectRatio="none" class="h-full w-full">
      <rect width="20" height="12" fill="#fff" />
      <rect y="6" width="20" height="6" fill="#d7141a" />
      <path d="M0 0 L10 6 L0 12 Z" fill="#11457e" />
    </svg>
  </span>
</template>
