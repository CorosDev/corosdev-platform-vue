<script setup lang="ts">
interface Testimonial {
  quote: string
  name: string
  role: string
}

const testimonials: Testimonial[] = [
  {
    quote: 'CorosDev delivered exactly what we needed, on time and with excellent quality.',
    name: 'Aftermath',
    role: 'Strategy',
  },
  {
    quote: 'Proposed scalable solutions that solved our most complex infrastructure challenges.',
    name: 'Dell Technologies',
    role: 'Infrastructure',
  },
  {
    quote: 'Complex integrations, handled with great communication. True engineering partners.',
    name: 'Beehiiv',
    role: 'Engineering',
  },
  {
    quote: "The most robust Shopify Plus integration we've seen. Flawless execution.",
    name: 'Luxury Brand',
    role: 'Commerce',
  },
  {
    quote: 'They built our fintech app from scratch. Security and speed were top notch.',
    name: 'Fintech Global',
    role: 'Product',
  },
  {
    quote: 'Exceptional technical talent. Their design-led approach makes a real difference.',
    name: 'Velocity VC',
    role: 'Portfolio',
  },
]

// Duplicated for a seamless CSS marquee loop (animate-marquee scrolls exactly -50%).
const track = [...testimonials, ...testimonials]
</script>

<template>
  <section id="testimonials" class="relative overflow-hidden py-12 md:py-24">
    <div class="mx-auto mb-8 max-w-7xl px-6 md:mb-16">
      <h2 class="text-4xl font-black text-white md:text-6xl">
        What our <span class="gradient-text drop-shadow-glow">clients say</span>
      </h2>
      <p class="mt-4 max-w-2xl text-lg text-white/50">
        Proven results delivered to industry leaders through dedicated engineering and design discipline.
      </p>
    </div>

    <div class="marquee-mask overflow-hidden">
      <div class="animate-marquee flex w-max gap-8 hover:[animation-play-state:paused]">
        <div
          v-for="(testimonial, index) in track"
          :key="`${testimonial.name}-${index}`"
          class="group w-[400px] shrink-0"
        >
          <div
            class="glass soft flex h-full flex-col justify-between rounded-3xl border border-white/5 p-8 transition-all duration-500 group-hover:border-cobalt-500/50"
          >
            <div>
              <svg class="mb-6 h-8 w-8 text-cobalt-500 opacity-40" fill="currentColor" viewBox="0 0 32 32">
                <path
                  d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H6.3c.5-1.7 2-3 3.7-3V8zm12 0c-3.3 0-6 2.7-6 6v10h10V14h-7.7c.5-1.7 2-3 3.7-3V8z"
                />
              </svg>
              <p class="italic leading-relaxed text-white/90">&ldquo;{{ testimonial.quote }}&rdquo;</p>
            </div>
            <div class="mt-8 flex items-center gap-4">
              <div class="h-8 w-1 rounded-full bg-cobalt-500" />
              <div>
                <p class="text-sm font-bold text-white">{{ testimonial.name }}</p>
                <p class="text-xs text-white/40">{{ testimonial.role }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
