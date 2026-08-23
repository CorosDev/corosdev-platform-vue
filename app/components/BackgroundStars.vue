<script setup lang="ts">
/**
 * Pure-CSS, GPU-composited starfield. Replaces the legacy canvas + JS
 * requestAnimationFrame star loop (see _legacy_html/index.html) — three
 * layers of a tiled radial-gradient pattern, each drifting diagonally via
 * `transform: translate3d(...)`. Every layer's translate distance matches
 * its own background tile size exactly, so the animation loops seamlessly
 * with no snap/jump. `translateZ(0)` + `will-change` promote each layer to
 * its own compositor layer, and `contain: strict` isolates the whole field
 * from the rest of the page's layout/paint/size — it never has to be
 * re-measured when content elsewhere on the page changes.
 */
</script>

<template>
  <div class="stars" aria-hidden="true">
    <div class="stars__layer stars__layer--far" />
    <div class="stars__layer stars__layer--mid" />
    <div class="stars__layer stars__layer--near" />
  </div>
</template>

<style scoped>
.stars {
  position: fixed;
  inset: 0;
  z-index: -10;
  overflow: hidden;
  contain: strict;
  pointer-events: none;
  background-color: var(--color-brand-900, #070b1a);
}

.stars__layer {
  position: absolute;
  inset: 0;
  background-repeat: repeat;
  transform: translateZ(0);
  will-change: transform;
  backface-visibility: hidden;
}

.stars__layer--far {
  background-image:
    radial-gradient(1px 1px at 8% 15%, rgba(255, 255, 255, 0.55), transparent 100%),
    radial-gradient(1px 1px at 22% 52%, rgba(255, 255, 255, 0.4), transparent 100%),
    radial-gradient(1px 1px at 35% 8%, rgba(255, 255, 255, 0.5), transparent 100%),
    radial-gradient(1px 1px at 48% 78%, rgba(255, 255, 255, 0.35), transparent 100%),
    radial-gradient(1px 1px at 60% 30%, rgba(255, 255, 255, 0.5), transparent 100%),
    radial-gradient(1px 1px at 72% 60%, rgba(255, 255, 255, 0.4), transparent 100%),
    radial-gradient(1px 1px at 85% 18%, rgba(255, 255, 255, 0.45), transparent 100%),
    radial-gradient(1px 1px at 92% 85%, rgba(255, 255, 255, 0.35), transparent 100%),
    radial-gradient(1px 1px at 15% 90%, rgba(255, 255, 255, 0.4), transparent 100%),
    radial-gradient(1px 1px at 55% 45%, rgba(255, 255, 255, 0.3), transparent 100%),
    radial-gradient(1px 1px at 78% 95%, rgba(255, 255, 255, 0.45), transparent 100%);
  background-size: 260px 260px;
  animation: stars-drift-far 160s linear infinite;
}

.stars__layer--mid {
  background-image:
    radial-gradient(1.5px 1.5px at 10% 20%, rgba(255, 255, 255, 0.7), transparent 100%),
    radial-gradient(1.5px 1.5px at 30% 65%, rgba(255, 255, 255, 0.55), transparent 100%),
    radial-gradient(1.5px 1.5px at 50% 10%, rgba(255, 255, 255, 0.65), transparent 100%),
    radial-gradient(1.5px 1.5px at 65% 50%, rgba(255, 255, 255, 0.5), transparent 100%),
    radial-gradient(1.5px 1.5px at 80% 25%, rgba(255, 255, 255, 0.6), transparent 100%),
    radial-gradient(1.5px 1.5px at 90% 80%, rgba(255, 255, 255, 0.5), transparent 100%),
    radial-gradient(1.5px 1.5px at 20% 85%, rgba(255, 255, 255, 0.55), transparent 100%),
    radial-gradient(1.5px 1.5px at 45% 40%, rgba(255, 255, 255, 0.45), transparent 100%),
    radial-gradient(1.5px 1.5px at 75% 70%, rgba(255, 255, 255, 0.6), transparent 100%);
  background-size: 200px 200px;
  animation: stars-drift-mid 100s linear infinite;
}

.stars__layer--near {
  background-image:
    radial-gradient(2px 2px at 15% 20%, rgba(255, 255, 255, 0.9), transparent 100%),
    radial-gradient(2px 2px at 40% 60%, rgba(255, 255, 255, 0.75), transparent 100%),
    radial-gradient(2px 2px at 60% 15%, rgba(255, 255, 255, 0.85), transparent 100%),
    radial-gradient(2px 2px at 78% 45%, rgba(255, 255, 255, 0.7), transparent 100%),
    radial-gradient(2px 2px at 25% 80%, rgba(255, 255, 255, 0.8), transparent 100%),
    radial-gradient(2px 2px at 85% 75%, rgba(255, 255, 255, 0.75), transparent 100%),
    radial-gradient(2px 2px at 50% 90%, rgba(255, 255, 255, 0.85), transparent 100%);
  background-size: 340px 340px;
  animation: stars-drift-near 65s linear infinite;
}

/* Each keyframe's distance equals exactly its own layer's tile size, so the
   tiled pattern lines back up with itself at 100% — a perfectly seamless loop. */
@keyframes stars-drift-far {
  from {
    transform: translate3d(0, 0, 0);
  }
  to {
    transform: translate3d(-260px, -260px, 0);
  }
}

@keyframes stars-drift-mid {
  from {
    transform: translate3d(0, 0, 0);
  }
  to {
    transform: translate3d(200px, -200px, 0);
  }
}

@keyframes stars-drift-near {
  from {
    transform: translate3d(0, 0, 0);
  }
  to {
    transform: translate3d(-340px, 340px, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .stars__layer {
    animation: none;
  }
}
</style>
