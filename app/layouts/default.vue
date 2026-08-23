<script setup lang="ts"></script>

<template>
  <div
    class="flex min-h-screen flex-col overflow-x-hidden bg-transparent text-white antialiased selection:bg-neon-500 selection:text-brand-900"
  >
    <BackgroundStars />

    <AppNavbar />

    <main class="flex-1">
      <slot />
    </main>

    <AppFooter />
  </div>
</template>
