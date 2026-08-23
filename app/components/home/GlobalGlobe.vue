<script setup lang="ts">
/**
 * Interactive 3D globe for the Hero — ported from
 * _legacy_html/global-presence.js / .css / -data.js. Renders CorosDev's
 * offices on a WebGL globe (globe.gl, npm-installed rather than loaded from
 * a CDN `<script>` — better for bundling/versioning and avoids widening the
 * CSP script-src for an external host). Meant to be rendered inside
 * `<ClientOnly>` by its parent since WebGL/DOM APIs aren't SSR-safe.
 */

// Only the geometric/static fields the globe engine itself needs — display
// text (name, office type, address...) is looked up reactively from the i18n
// dictionary via `locationText` below, so it switches with the locale
// without having to rebuild the WebGL globe.
interface GpGeo {
  id: string
  lat: number
  lng: number
  countryCode: string
  banner: string
}

const geoLocations: GpGeo[] = [
  { id: 'honduras', lat: 15.5, lng: -88.03, countryCode: 'HN', banner: '/cities/honduras.jpg' },
  { id: 'miami', lat: 25.76, lng: -80.19, countryCode: 'US', banner: '/cities/miami.jpg' },
  { id: 'wyoming', lat: 43.08, lng: -107.29, countryCode: 'US', banner: '/cities/wyoming.jpg' },
  { id: 'prague', lat: 50.08, lng: 14.44, countryCode: 'CZ', banner: '/cities/prague.jpg' },
]

const connections = [
  { from: 'honduras', to: 'miami' },
  { from: 'honduras', to: 'wyoming' },
  { from: 'honduras', to: 'prague' },
  { from: 'miami', to: 'prague' },
]

function findGeo(id: string) {
  return geoLocations.find((loc) => loc.id === id) ?? null
}

const { t } = useI18n()

interface LocationText {
  short: string
  type: string
  title: string
  location: string
  company: string
  address: string[]
}

// Office titles, categories, legal company names and mailing addresses are
// kept identical in en/es on purpose (see i18n/locales/*.json) — legal
// entity names and postal addresses aren't translated.
const locationText = computed<Record<string, LocationText>>(() => {
  const result: Record<string, LocationText> = {}
  for (const geo of geoLocations) {
    const base = `home.hero.globeLocations.${geo.id}`
    result[geo.id] = {
      short: t(`home.hero.locations.${geo.id}`),
      type: t(`${base}.type`),
      title: t(`${base}.title`),
      location: t(`${base}.location`),
      company: t(`${base}.company`),
      address: [t(`${base}.address1`), t(`${base}.address2`), t(`${base}.address3`), t(`${base}.address4`)].filter(
        Boolean,
      ),
    }
  }
  return result
})

// Camera choreography timings — see animateCameraTo().
const ALT_DEFAULT = 2.5
const ALT_PAN = 2.7
const ALT_FOCUS = 1.8
const PAN_OUT_MS = 500
const ROTATE_MS = 1000
const ZOOM_IN_MS = 550
const CARD_SWITCH_MS = 260
const IDLE_RESUME_MS = 7000
const ROTATE_SPEED = 0.3

const stage = ref<HTMLElement | null>(null)
const globeMount = ref<HTMLElement | null>(null)

const currentId = ref<string | null>(null)
const cardOpen = ref(false)
const fallback = ref(false)
const bannerError = ref(false)

const currentLocation = computed(() => {
  const geo = findGeo(currentId.value ?? '')
  if (!geo) return null
  return { ...geo, ...locationText.value[geo.id] }
})

// Everything below is imperative vendor-API glue (globe.gl / three.js), kept
// outside Vue's reactivity on purpose — `world` is a Kapsule instance, not
// component state.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let world: any = null
const markerEls: Record<string, HTMLButtonElement> = {}
let resizeObserver: ResizeObserver | null = null
let viewportObserver: IntersectionObserver | null = null
let idleTimer: ReturnType<typeof setTimeout> | null = null
let animationToken = 0
let reducedMotion = false

function pauseAutoRotate() {
  if (idleTimer) clearTimeout(idleTimer)
  if (world?.controls) world.controls().autoRotate = false
}

function scheduleIdleResume() {
  if (idleTimer) clearTimeout(idleTimer)
  if (reducedMotion) return
  idleTimer = setTimeout(() => {
    if (world?.controls) world.controls().autoRotate = true
  }, IDLE_RESUME_MS)
}

function animateCameraTo(loc: GpGeo, token: number, done: () => void) {
  if (!world) {
    done()
    return
  }
  if (reducedMotion) {
    world.pointOfView({ lat: loc.lat, lng: loc.lng, altitude: ALT_FOCUS }, 0)
    done()
    return
  }

  const current = world.pointOfView()
  world.pointOfView({ lat: current.lat, lng: current.lng, altitude: ALT_PAN }, PAN_OUT_MS)
  setTimeout(() => {
    if (token !== animationToken) return
    world.pointOfView({ lat: loc.lat, lng: loc.lng, altitude: ALT_PAN }, ROTATE_MS)
    setTimeout(() => {
      if (token !== animationToken) return
      world.pointOfView({ lat: loc.lat, lng: loc.lng, altitude: ALT_FOCUS }, ZOOM_IN_MS)
      setTimeout(() => {
        if (token === animationToken) done()
      }, ZOOM_IN_MS)
    }, ROTATE_MS)
  }, PAN_OUT_MS)
}

function selectLocation(id: string) {
  const loc = findGeo(id)
  if (!loc || id === currentId.value) return

  const needsCardSwitch = cardOpen.value && currentId.value !== null
  currentId.value = id
  pauseAutoRotate()

  const token = ++animationToken
  const proceed = () => {
    if (token !== animationToken) return
    bannerError.value = false
    animateCameraTo(loc, token, () => {
      if (token !== animationToken) return
      cardOpen.value = true
      scheduleIdleResume()
    })
  }

  if (needsCardSwitch) {
    cardOpen.value = false
    setTimeout(proceed, reducedMotion ? 0 : CARD_SWITCH_MS)
  } else {
    proceed()
  }
}

function handleClose() {
  currentId.value = null
  cardOpen.value = false
  animationToken++
  if (world && !reducedMotion) {
    const current = world.pointOfView()
    world.pointOfView({ lat: current.lat, lng: current.lng, altitude: ALT_DEFAULT }, 700)
  }
  scheduleIdleResume()
}

watch(currentId, (id) => {
  Object.entries(markerEls).forEach(([locId, marker]) => {
    marker.classList.toggle('is-selected', locId === id)
    marker.classList.toggle('is-dimmed', !!id && locId !== id)
  })
})

function buildMarkerElement(loc: GpGeo) {
  const btn = document.createElement('button')
  btn.type = 'button'
  btn.className = 'gp-marker'
  btn.dataset.loc = loc.id
  btn.tabIndex = -1
  btn.setAttribute('aria-hidden', 'true')
  btn.style.pointerEvents = 'auto'

  const pulse = document.createElement('span')
  pulse.className = 'gp-marker-pulse'
  const dot = document.createElement('span')
  dot.className = 'gp-marker-dot'
  btn.append(pulse, dot)

  btn.addEventListener('click', () => selectLocation(loc.id))
  markerEls[loc.id] = btn
  return btn
}

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch {
    return false
  }
}

// Mutates globe.gl's existing default lights/material in place instead of
// constructing new three.js objects, keeping this file free of a direct
// `three` import (globe.gl bundles its own).
function tuneLighting() {
  if (!world || typeof world.lights !== 'function') return
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lights = world.lights() || []
  lights.forEach((light: any) => {
    if (light.type === 'AmbientLight') {
      light.intensity = 1.6
    } else if (light.type === 'DirectionalLight') {
      light.intensity = 1.5
      light.position?.set?.(1, 0.6, 1)
    }
  })
}

function tuneGlobeMaterial() {
  if (!world || typeof world.globeMaterial !== 'function') return
  const material = world.globeMaterial()
  if (!material) return
  material.bumpScale = 6
  material.shininess = 12
  material.specular?.set?.('#223a55')
}

// Yields back to the browser between initialization steps below — a single
// `requestIdleCallback` around the *entire* buildGlobe() body used to be one
// long main-thread task (three.js scene/renderer bootstrap + arcs + markers +
// lighting + controls, all synchronous). TBT counts the portion of each task
// beyond 50ms, so splitting that one large task into several smaller ones
// directly reduces it, even though the total work is unchanged.
function idle(timeout = 500): Promise<void> {
  return new Promise((resolve) => {
    const ric = window.requestIdleCallback ?? ((cb: IdleRequestCallback) => setTimeout(() => cb({} as IdleDeadline), 0))
    ric(() => resolve(), { timeout })
  })
}

async function buildGlobe(container: HTMLElement) {
  const { default: Globe } = await import('globe.gl')
  await idle()

  // globe.gl v2's `Globe` is a class (`new Globe(container)`), not the older
  // Kapsule factory call (`Globe()(container)`) the legacy vanilla JS used.
  // This constructor call alone bootstraps the three.js scene/camera/renderer
  // — the single heaviest atomic chunk of work here, can't be split further
  // without reaching into globe.gl internals.
  world = new Globe(container)
    .width(container.clientWidth)
    .height(container.clientHeight)
    .backgroundColor('rgba(0,0,0,0)')
    .globeImageUrl('/globe/earth-day.jpg')
    .bumpImageUrl('/globe/earth-bump.png')
    .showAtmosphere(true)
    .atmosphereColor('#5fb0ff')
    .atmosphereAltitude(0.16)

  await idle()
  const arcs = connections.map((conn) => {
    const from = findGeo(conn.from)!
    const to = findGeo(conn.to)!
    return { startLat: from.lat, startLng: from.lng, endLat: to.lat, endLng: to.lng }
  })
  world
    .htmlElementsData(geoLocations)
    .htmlElement((d: GpGeo) => buildMarkerElement(d))
    .arcsData(arcs)
    .arcColor(() => ['rgba(125,187,255,0.35)', 'rgba(31,127,255,0.6)'])
    .arcStroke(0.32)
    .arcDashLength(0.4)
    .arcDashGap(2.2)
    .arcDashAnimateTime(reducedMotion ? 0 : 3600)
    .arcAltitudeAutoScale(0.28)
    .pointOfView({ lat: 15, lng: -42, altitude: ALT_DEFAULT }, 0)

  await idle()
  const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.5 : 2)
  if (world.renderer) world.renderer().setPixelRatio(dpr)
  tuneLighting()
  tuneGlobeMaterial()

  await idle()
  const controls = world.controls()
  if (controls) {
    controls.autoRotate = !reducedMotion
    controls.autoRotateSpeed = ROTATE_SPEED
    controls.enableZoom = false // scroll should scroll the page, not zoom the globe
    controls.enablePan = false
    controls.addEventListener('start', pauseAutoRotate)
    controls.addEventListener('end', scheduleIdleResume)
  }

  resizeObserver = new ResizeObserver((entries) => {
    const entry = entries[0]
    if (!entry || !world) return
    const { width, height } = entry.contentRect
    if (width > 0 && height > 0) world.width(width).height(height)
  })
  resizeObserver.observe(container)
}

function pauseRendering() {
  world?.pauseAnimation?.()
}

function resumeRendering() {
  world?.resumeAnimation?.()
}

function handleVisibilityChange() {
  if (document.hidden) pauseRendering()
  else resumeRendering()
}

onMounted(() => {
  reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

  if (!supportsWebGL()) {
    fallback.value = true
    return
  }

  // Defer the heavy globe.gl import + WebGL init until BOTH conditions hold:
  // the browser is idle after load (so it never competes with the hero
  // text/CTA for load time) AND the stage has actually scrolled into the
  // viewport. The hero usually *is* the first viewport, so on a typical
  // desktop load this behaves exactly as before (idle right after load) —
  // but on layouts where it isn't (short mobile viewports, a deep link
  // further down the page), the WebGL cost is only ever paid once it's
  // actually going to be seen.
  let initStarted = false
  let idleReady = false
  let inViewport = false

  const tryInit = () => {
    if (initStarted || !idleReady || !inViewport) return
    initStarted = true
    if (globeMount.value) buildGlobe(globeMount.value).catch(() => (fallback.value = true))
  }

  const ric =
    window.requestIdleCallback ?? ((cb: IdleRequestCallback) => setTimeout(() => cb({} as IdleDeadline), 400))
  const kickoff = () =>
    ric(
      () => {
        idleReady = true
        tryInit()
      },
      { timeout: 2000 },
    )

  if (document.readyState === 'complete') kickoff()
  else window.addEventListener('load', kickoff, { once: true })

  document.addEventListener('visibilitychange', handleVisibilityChange)

  if (stage.value) {
    viewportObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            inViewport = true
            resumeRendering()
            tryInit()
          } else {
            inViewport = false
            pauseRendering()
          }
        })
      },
      { threshold: 0 },
    )
    viewportObserver.observe(stage.value)
  } else {
    // No stage ref to observe (shouldn't happen) — fall back to idle-only.
    inViewport = true
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  viewportObserver?.disconnect()
  resizeObserver?.disconnect()
  if (idleTimer) clearTimeout(idleTimer)
})
</script>

<template>
  <div id="hero-globe-stage" ref="stage" class="relative mx-auto w-full min-w-0 max-w-2xl">
    <div class="relative aspect-square w-full overflow-visible">
      <div class="gp-ambient-glow" aria-hidden="true" />

      <p class="gp-hero-label text-[11px] font-bold uppercase tracking-[0.5em] text-white/70 sm:text-[12px]">
        {{ t('home.hero.globeLabel') }}
      </p>

      <div class="gp-globe-wrap relative z-10 h-full w-full">
        <div
          ref="globeMount"
          class="gp-globe-canvas"
          role="img"
          :aria-label="t('home.hero.globe.globeAria')"
        />
        <p v-if="fallback" class="gp-fallback-note">
          {{ t('home.hero.globe.fallbackNote') }}
        </p>
      </div>
    </div>

    <div class="gp-selector" :aria-label="t('home.hero.globe.selectorAria')">
      <button
        v-for="loc in geoLocations"
        :key="loc.id"
        type="button"
        class="gp-selector-btn"
        :aria-pressed="loc.id === currentId"
        @click="selectLocation(loc.id)"
      >
        <span class="gp-selector-flag" aria-hidden="true">{{ loc.countryCode }}</span>
        <span>{{ locationText[loc.id]?.short }}</span>
      </button>
    </div>

    <Transition
      enter-active-class="transition-all duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]"
      enter-from-class="opacity-0 translate-y-3.5 scale-[0.98]"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition-all duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-3.5 scale-[0.98]"
    >
      <div v-if="cardOpen && currentLocation" class="gp-card" aria-live="polite">
        <button type="button" class="gp-card-close" :aria-label="t('home.hero.globe.cardClose')" @click="handleClose">
          <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div class="gp-card-banner">
          <NuxtPicture
            v-if="!bannerError"
            :src="currentLocation.banner"
            alt=""
            loading="lazy"
            decoding="async"
            width="280"
            height="140"
            class="block h-full w-full"
            :img-attrs="{ class: 'h-full w-full' }"
            @error="bannerError = true"
          />
          <div class="gp-card-banner-overlay" />
          <div class="gp-card-flag-badge" aria-hidden="true">{{ currentLocation.countryCode }}</div>
        </div>

        <div class="gp-card-body">
          <p class="gp-card-type">{{ currentLocation.type }}</p>
          <h3 class="gp-card-title">{{ currentLocation.title }}</h3>

          <div class="gp-card-info">
            <p class="gp-card-info-row">
              <svg class="gp-card-info-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10 18s6-5.686 6-10a6 6 0 10-12 0c0 4.314 6 10 6 10z" />
                <circle cx="10" cy="8" r="2" />
              </svg>
              <span>{{ currentLocation.location }}</span>
            </p>
            <p class="gp-card-info-row">
              <svg class="gp-card-info-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M4 17V5a1 1 0 011-1h6a1 1 0 011 1v12M4 17h12M4 17H3m13 0h1M7 8h1m3 0h1M7 11h1m3 0h1M7 14h1m3 0h1"
                />
              </svg>
              <span>{{ currentLocation.company }}</span>
            </p>
            <p class="gp-card-info-row">
              <svg class="gp-card-info-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
                <rect x="3" y="5" width="14" height="10" rx="1.5" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.5 6l6.5 5 6.5-5" />
              </svg>
              <span>
                <template v-for="(line, i) in currentLocation?.address ?? []" :key="i">
                  {{ line }}<br v-if="i < (currentLocation?.address?.length ?? 0) - 1" />
                </template>
              </span>
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.gp-ambient-glow {
  position: absolute;
  inset: 6%;
  border-radius: 50%;
  background: radial-gradient(circle at 50% 50%, rgb(31 127 255 / 0.35), rgb(31 127 255 / 0.1) 45%, transparent 72%);
  filter: blur(40px);
  pointer-events: none;
  z-index: 0;
}

.gp-hero-label {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  text-align: center;
  z-index: 12;
  pointer-events: none;
}

.gp-globe-wrap {
  overflow: visible;
}

/* Intentionally oversized relative to its "stage" (112% with a matching
   negative inset) so the render surface has safe margin — the planet and
   its atmosphere shell are never trimmed right at the frame edge, even
   mid-zoom. Ancestors stay overflow:visible so this excess area is never
   hard-clipped. */
.gp-globe-canvas {
  position: absolute;
  inset: -6%;
  width: 112%;
  height: 112%;
  overflow: visible;
}

.gp-globe-canvas :deep(canvas) {
  outline: none;
  background: transparent;
}

.gp-fallback-note {
  position: absolute;
  left: 50%;
  bottom: 3.25rem;
  transform: translateX(-50%);
  font-size: 0.66rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-align: center;
  color: rgb(255 255 255 / 0.5);
  background: rgb(7 11 26 / 0.75);
  padding: 0.45rem 0.9rem;
  border-radius: 1rem;
  border: 1px solid rgb(255 255 255 / 0.08);
  white-space: normal;
  width: max-content;
  max-width: 82%;
  z-index: 15;
}

/* ── Markers: HTML elements globe.gl inserts imperatively into
   .gp-globe-canvas, outside Vue's own render tree — `:deep()` is required
   here so these rules still apply despite that. ── */
.gp-globe-canvas :deep(.gp-marker) {
  position: relative;
  width: 16px;
  height: 16px;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  transform: translate(-50%, -50%);
}

.gp-globe-canvas :deep(.gp-marker-dot) {
  position: absolute;
  inset: 5px;
  border-radius: 999px;
  background: var(--color-cobalt-300, #7dbbff);
  box-shadow: 0 0 6px 1px rgb(31 127 255 / 0.55);
  transition: background 0.35s ease, box-shadow 0.35s ease, transform 0.35s ease, opacity 0.35s ease;
}

.gp-globe-canvas :deep(.gp-marker-pulse) {
  position: absolute;
  inset: 0;
  border-radius: 999px;
  border: 1.25px solid rgb(125 187 255 / 0.5);
  animation: gp-pulse 2.8s ease-out infinite;
  transition: opacity 0.35s ease;
}

@keyframes gp-pulse {
  0% {
    transform: scale(0.5);
    opacity: 0.75;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.gp-globe-canvas :deep(.gp-marker.is-selected .gp-marker-dot) {
  background: #ffffff;
  box-shadow: 0 0 10px 2px rgb(255 255 255 / 0.65), 0 0 18px 4px rgb(31 127 255 / 0.45);
  transform: scale(1.25);
}

.gp-globe-canvas :deep(.gp-marker.is-selected .gp-marker-pulse) {
  border-color: rgb(255 255 255 / 0.7);
  animation-duration: 1.9s;
}

.gp-globe-canvas :deep(.gp-marker.is-dimmed) {
  opacity: 0.32;
}

.gp-globe-canvas :deep(.gp-marker.is-dimmed .gp-marker-pulse) {
  animation-play-state: paused;
  opacity: 0;
}

/* ── Location chips: floating on desktop, inline scroll row on mobile ── */
.gp-selector {
  display: flex;
  min-width: 0;
  max-width: 100%;
  gap: 0.5rem;
  overflow-x: auto;
  padding: 0.25rem 0.1rem;
  margin-top: 1rem;
  scrollbar-width: none;
  justify-content: center;
}

.gp-selector::-webkit-scrollbar {
  display: none;
}

.gp-selector-btn {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.85rem;
  border-radius: 999px;
  border: 1px solid rgb(255 255 255 / 0.14);
  background: rgb(7 11 26 / 0.55);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  color: rgb(255 255 255 / 0.65);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  white-space: nowrap;
  cursor: pointer;
  transition: border-color 0.25s, color 0.25s, background 0.25s;
  min-height: 40px;
}

.gp-selector-btn:hover {
  border-color: rgb(31 127 255 / 0.5);
  color: var(--color-cobalt-300, #7dbbff);
}

.gp-selector-btn:focus-visible {
  outline: 2px solid var(--color-neon-500, #1f7fff);
  outline-offset: 2px;
}

.gp-selector-btn[aria-pressed='true'] {
  border-color: var(--color-neon-500, #1f7fff);
  background: rgb(31 127 255 / 0.18);
  color: #ffffff;
}

.gp-selector-flag {
  font-size: 0.95rem;
  line-height: 1;
}

@media (min-width: 768px) {
  .gp-selector {
    position: absolute;
    left: 50%;
    bottom: 2%;
    transform: translateX(-50%);
    margin-top: 0;
    z-index: 20;
  }
}

/* ── Floating office card (enter/leave handled by <Transition> above) ── */
.gp-card {
  position: relative;
  margin-top: 1rem;
  width: 100%;
  background: rgb(11 18 38 / 0.72);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgb(255 255 255 / 0.1);
  border-radius: 1.25rem;
  box-shadow: 0 20px 50px rgb(0 0 0 / 0.4);
  overflow: hidden;
}

@media (min-width: 768px) {
  .gp-card {
    position: absolute;
    top: 13%;
    right: 0;
    margin-top: 0;
    width: min(280px, 74%);
    z-index: 25;
  }
}

.gp-card-close {
  position: absolute;
  top: 0.7rem;
  right: 0.7rem;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 1px solid rgb(255 255 255 / 0.2);
  background: rgb(7 11 26 / 0.55);
  backdrop-filter: blur(4px);
  color: rgb(255 255 255 / 0.8);
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
  z-index: 2;
}

.gp-card-close:hover {
  color: var(--color-cobalt-300, #7dbbff);
  border-color: rgb(31 127 255 / 0.5);
}

.gp-card-close:focus-visible {
  outline: 2px solid var(--color-neon-500, #1f7fff);
  outline-offset: 2px;
}

.gp-card-banner {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 8;
  overflow: hidden;
  background: var(--color-brand-800, #0b1226);
}

.gp-card-banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
}

.gp-card-banner-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgb(7 11 26 / 0.05) 0%, rgb(7 11 26 / 0.55) 65%, rgb(11 18 38 / 0.95) 100%);
}

.gp-card-flag-badge {
  position: absolute;
  left: 0.9rem;
  bottom: -0.55rem;
  font-size: 1.15rem;
  line-height: 1;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgb(11 18 38 / 0.9);
  border: 1px solid rgb(255 255 255 / 0.15);
  box-shadow: 0 6px 16px rgb(0 0 0 / 0.4);
}

.gp-card-body {
  padding: 1.25rem 1.1rem 1.1rem;
}

.gp-card-type {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-cobalt-300, #7dbbff);
  opacity: 0.9;
  margin-bottom: 0.3rem;
}

.gp-card-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.3;
  margin-bottom: 0.25rem;
}

.gp-card-info {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  margin-top: 0.7rem;
}

.gp-card-info-row {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.76rem;
  line-height: 1.5;
  color: rgb(255 255 255 / 0.72);
}

.gp-card-info-icon {
  flex-shrink: 0;
  width: 15px;
  height: 15px;
  margin-top: 0.15rem;
  color: var(--color-cobalt-300, #7dbbff);
  opacity: 0.85;
}

@media (max-width: 767px) {
  #hero-globe-stage {
    max-width: 380px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .gp-globe-canvas :deep(.gp-marker-pulse) {
    animation: none;
  }
  .gp-selector-btn {
    transition: none;
  }
}
</style>
