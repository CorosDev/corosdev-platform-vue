<script setup lang="ts">
interface LocationChip {
  code: string
  label: string
}

const locations: LocationChip[] = [
  { code: 'HN', label: 'Honduras' },
  { code: 'US', label: 'Miami' },
  { code: 'US', label: 'Wyoming' },
  { code: 'CZ', label: 'Praha' },
]

const bookingUrl = 'https://calendly.com/corosdev-info/30min'
</script>

<template>
  <section class="relative pb-12 pt-44 sm:pb-20 sm:pt-36">
    <div class="mx-auto max-w-7xl px-6">
      <div class="grid items-center gap-12 md:grid-cols-2">
        <!-- Copy -->
        <div>
          <p class="text-sm font-medium uppercase tracking-wide text-white opacity-90">
            AI Driven Company &middot; LATAM Engineering &middot; US Time &amp; EU Time
          </p>
          <h1 class="mt-4 text-5xl font-extrabold leading-[1.1] md:text-7xl">
            Building Tomorrow's <span class="gradient-text drop-shadow-glow">Software</span> Today.
          </h1>
          <p class="mt-5 max-w-xl text-lg text-white/80">
            We transform ambitious ideas into scalable, profitable, and future-ready businesses through
            world-class technology systems.
          </p>
          <div class="mt-8 flex items-center gap-3">
            <a
              :href="bookingUrl"
              target="_blank"
              rel="noopener"
              class="rounded-xl bg-neon-500 px-6 py-3 font-semibold text-brand-900 drop-shadow-glow transition-transform hover:scale-105"
            >
              Book a 30-min discovery
            </a>
            <a
              href="#ecosystem"
              class="rounded-xl border border-white/18 px-6 py-3 transition-colors hover:border-neon-500 hover:text-neon-500"
            >
              See our work
            </a>
          </div>
          <div class="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/60">
            <span>Security-first</span>
            <span class="opacity-50">&bull;</span>
            <span>Design-led</span>
            <span class="opacity-50">&bull;</span>
            <span>Measurable impact</span>
          </div>
        </div>

        <!-- Global presence panel (static, lightweight — no 3D engine) -->
        <div class="relative mx-auto w-full max-w-2xl">
          <div
            class="absolute inset-[10%] -z-10 rounded-full opacity-70 blur-3xl"
            style="background: radial-gradient(circle at 50% 50%, rgb(31 127 255 / 0.35), transparent 65%)"
            aria-hidden="true"
          />

          <p class="text-center text-[11px] font-bold uppercase tracking-[0.5em] text-white/70 sm:text-[12px]">
            Our impact in the world
          </p>

          <div class="glass mt-6 flex flex-col items-center rounded-3xl p-8 text-center sm:p-12">
            <div
              class="animate-float flex h-24 w-24 items-center justify-center rounded-full border border-neon-500/30 bg-neon-500/10 text-3xl font-black text-neon-300"
              aria-hidden="true"
            >
              CD
            </div>
            <p class="mt-6 max-w-xs text-sm text-white/60">
              Engineering teams across three continents, working in your timezone.
            </p>

            <div class="mt-8 flex flex-wrap justify-center gap-2" aria-label="CorosDev locations">
              <span
                v-for="loc in locations"
                :key="`${loc.code}-${loc.label}`"
                class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70"
              >
                <span class="text-[10px] font-bold uppercase text-neon-300">{{ loc.code }}</span>
                {{ loc.label }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
