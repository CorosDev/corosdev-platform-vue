<script setup lang="ts">
const { t } = useI18n()

const cardIds = ['card1', 'card2', 'card3', 'card4', 'card5', 'card6'] as const

const testimonials = computed(() =>
  cardIds.map((id) => ({
    id,
    quote: t(`home.testimonials.${id}_quote`),
    name: t(`home.testimonials.${id}_name`),
    role: t(`home.testimonials.${id}_role`),
  })),
)

// Duplicated for a seamless CSS marquee loop (animate-marquee scrolls exactly -50%).
const track = computed(() => [...testimonials.value, ...testimonials.value])
</script>

<template>
  <section id="testimonials" class="relative overflow-hidden py-12 md:py-24">
    <div class="mx-auto mb-8 max-w-7xl px-6 md:mb-16">
      <h2 class="text-4xl font-black text-white md:text-6xl">
        {{ t('home.testimonials.h2_1') }} <span class="gradient-text drop-shadow-glow">{{ t('home.testimonials.h2_span') }}</span>
      </h2>
      <p class="mt-4 max-w-2xl text-lg text-white/50">
        {{ t('home.testimonials.sub') }}
      </p>
    </div>

    <div class="marquee-mask overflow-hidden">
      <div class="animate-marquee flex w-max gap-8 hover:[animation-play-state:paused]">
        <div
          v-for="(testimonial, index) in track"
          :key="`${testimonial.id}-${index}`"
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
                <p class="text-xs text-white/50">{{ testimonial.role }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
