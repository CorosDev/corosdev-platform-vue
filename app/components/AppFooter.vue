<script setup lang="ts">
const { t } = useI18n()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="border-t border-white/10 py-10">
    <div class="mx-auto flex max-w-7xl items-center justify-between px-6 text-sm text-white/60">
      <span>&copy; {{ year }} {{ t('footer.rights') }}</span>
    </div>
  </footer>
</template>
