<script setup lang="ts"></script>

<template>
  <section id="presentation" class="relative overflow-hidden py-12 md:py-20">
    <div class="mx-auto max-w-5xl px-6">
      <div class="mb-8 text-center md:mb-12">
        <h2 class="text-3xl font-black text-white md:text-5xl">
          See Our <span class="gradient-text drop-shadow-glow">Methodology in Action</span>
        </h2>
        <p class="mx-auto mt-4 max-w-2xl text-base text-white/50 md:text-lg">
          Experience how we design, build, and scale digital products. Learn how our ecosystem and elite
          engineering teams bring future-ready systems to life.
        </p>
      </div>

      <div
        class="glass group relative mx-auto max-w-3xl rounded-[2rem] border border-white/10 p-3 shadow-[0_0_50px_rgba(31,127,255,0.15)] transition-all duration-700 ease-out hover:-translate-y-1 hover:border-neon-500/30 hover:shadow-[0_0_60px_rgba(31,127,255,0.25)]"
      >
        <div class="relative aspect-video w-full overflow-hidden rounded-[1.5rem] border border-white/5 bg-brand-900">
          <iframe
            class="absolute inset-0 h-full w-full"
            src="https://www.youtube.com/embed/haRpSox-c1Q"
            title="CorosDev Presentation Video"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen
          />
        </div>
      </div>
    </div>
  </section>
</template>
