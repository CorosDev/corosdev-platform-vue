import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const isEarlyAccessOpen = ref(false)
  // Almacena qué app le interesa al usuario ('snapay', 'vorzana', 'trd', 'general')
  const selectedProduct = ref('general')

  const openEarlyAccess = (product = 'general') => {
    console.log('uiStore: openEarlyAccess called with product:', product);
    selectedProduct.value = product
    isEarlyAccessOpen.value = true
    console.log('uiStore: isEarlyAccessOpen set to:', isEarlyAccessOpen.value);
  }

  const closeEarlyAccess = () => {
    console.log('uiStore: closeEarlyAccess called');
    isEarlyAccessOpen.value = false
    console.log('uiStore: isEarlyAccessOpen set to:', isEarlyAccessOpen.value);
  }

  return {
    isEarlyAccessOpen,
    selectedProduct,
    openEarlyAccess,
    closeEarlyAccess
  }
})