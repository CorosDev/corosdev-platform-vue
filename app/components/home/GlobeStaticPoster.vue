<script setup lang="ts">
/**
 * Ultra-light stand-in for the WebGL globe (GlobalGlobe.vue) — shown instead
 * of ever importing globe.gl/three.js on mobile/small screens or when the
 * visitor prefers reduced motion (see GlobalGlobe.vue's onMounted). Pure
 * inline SVG: no image request, no WebGL context, a few hundred bytes of
 * markup. It's the single biggest lever on mobile TBT/bootup-time, since it
 * means the ~1.9MB globe.gl chunk and its ~4s of mobile CPU time are simply
 * never paid unless the visitor explicitly asks for it.
 *
 * Styled to loosely resemble the real globe at its default camera angle
 * (`pointOfView({ lat: 15, lng: -42 })` in GlobalGlobe.vue's buildGlobe()) so
 * swapping to the real thing doesn't cause a jarring visual jump. The four
 * marker dots are hand-precomputed via an orthographic projection centered
 * on that same lat/lng — this is a decorative illustration, not a
 * data-driven map, so if CorosDev's office locations ever change, these
 * `<circle>` coordinates need a manual update too (see geoLocations in
 * GlobalGlobe.vue for the source lat/lng values).
 */
defineProps<{ loading: boolean }>()
const emit = defineEmits<{ activate: [] }>()

const { t } = useI18n()

// Office markers: Honduras, Miami, Wyoming, Prague (front-hemisphere only at
// the default camera angle) — see the file-level comment above for how these
// were derived.
const posterMarkers = [
  { id: 'honduras', x: 41.1, y: 92.8 },
  { id: 'miami', x: 52.7, y: 79.9 },
  { id: 'wyoming', x: 43.6, y: 50.6 },
  { id: 'prague', x: 145.5, y: 44.9 },
]
</script>

<template>
  <button
    type="button"
    class="gp-poster"
    :disabled="loading"
    :aria-label="loading ? t('home.hero.globe.posterLoadingAria') : t('home.hero.globe.posterCtaAria')"
    @click="emit('activate')"
  >
    <svg viewBox="0 0 200 200" class="gp-poster-svg" aria-hidden="true">
      <defs>
        <radialGradient id="gpPosterFill" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stop-color="#1f7fff" stop-opacity="0.55" />
          <stop offset="55%" stop-color="#121d3c" stop-opacity="0.95" />
          <stop offset="100%" stop-color="#070b1a" />
        </radialGradient>
      </defs>

      <circle cx="100" cy="100" r="90" fill="url(#gpPosterFill)" stroke="rgba(125,187,255,0.35)" stroke-width="1" />

      <!-- Decorative latitude/longitude grid -->
      <ellipse cx="100" cy="100" rx="90" ry="28" fill="none" stroke="rgba(125,187,255,0.18)" stroke-width="0.75" />
      <ellipse cx="100" cy="100" rx="90" ry="55" fill="none" stroke="rgba(125,187,255,0.14)" stroke-width="0.75" />
      <ellipse cx="100" cy="62" rx="66" ry="20" fill="none" stroke="rgba(125,187,255,0.12)" stroke-width="0.6" />
      <ellipse cx="100" cy="138" rx="66" ry="20" fill="none" stroke="rgba(125,187,255,0.12)" stroke-width="0.6" />
      <path d="M 100 10 A 90 90 0 0 1 100 190" fill="none" stroke="rgba(125,187,255,0.12)" stroke-width="0.6" />
      <path d="M 40 15 A 130 92 0 0 1 40 185" fill="none" stroke="rgba(125,187,255,0.1)" stroke-width="0.6" />
      <path d="M 160 15 A 130 92 0 0 0 160 185" fill="none" stroke="rgba(125,187,255,0.1)" stroke-width="0.6" />

      <!-- Office markers: Honduras, Miami, Wyoming, Prague (front-hemisphere only) -->
      <g class="gp-poster-markers">
        <circle v-for="pos in posterMarkers" :key="pos.id" :cx="pos.x" :cy="pos.y" r="4.5" class="gp-poster-marker-halo" />
        <circle v-for="pos in posterMarkers" :key="`${pos.id}-dot`" :cx="pos.x" :cy="pos.y" r="2.4" class="gp-poster-marker-dot" />
      </g>
    </svg>

    <span class="gp-poster-label">
      <span v-if="loading" class="gp-poster-spinner" aria-hidden="true" />
      <svg v-else class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke-linecap="round" />
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M14.75 11.17l-3.2-2.13a1 1 0 00-1.55.83v4.26a1 1 0 001.55.83l3.2-2.13a1 1 0 000-1.66z"
        />
      </svg>
      {{ loading ? t('home.hero.globe.posterLoading') : t('home.hero.globe.posterCta') }}
    </span>
  </button>
</template>


<style scoped>
/* Sized/positioned by its wrapper — see the `.gp-globe-canvas` div GlobalGlobe.vue
   renders around this component, which is what actually reserves the layout
   footprint (and matches the real WebGL canvas's, avoiding CLS on swap). */
.gp-poster {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.gp-poster:disabled {
  cursor: default;
}

.gp-poster-svg {
  display: block;
  width: 100%;
  height: 100%;
}

.gp-poster-marker-dot {
  fill: var(--color-cobalt-300, #7dbbff);
}

.gp-poster-marker-halo {
  fill: rgb(31 127 255 / 0.22);
}

.gp-poster-label {
  position: absolute;
  left: 50%;
  bottom: 8%;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 1rem;
  border-radius: 999px;
  border: 1px solid rgb(31 127 255 / 0.4);
  background: rgb(7 11 26 / 0.75);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  color: #ffffff;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  white-space: nowrap;
  transition: border-color 0.25s, background 0.25s;
}

.gp-poster:hover:not(:disabled) .gp-poster-label,
.gp-poster:focus-visible .gp-poster-label {
  border-color: var(--color-neon-500, #1f7fff);
  background: rgb(31 127 255 / 0.18);
}

.gp-poster:focus-visible {
  outline: 2px solid var(--color-neon-500, #1f7fff);
  outline-offset: 4px;
  border-radius: 999px;
}

.gp-poster-spinner {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  border: 2px solid rgb(255 255 255 / 0.3);
  border-top-color: #ffffff;
  animation: gp-poster-spin 0.8s linear infinite;
}

@keyframes gp-poster-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .gp-poster-spinner {
    animation-duration: 1.6s;
  }
}
</style>
