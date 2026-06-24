<template>
  <header class="navbar-header" :class="{ 'scrolled': isScrolled }">
    <div class="nav-container nav-glass">
      <div class="nav-wrapper">
        
        <div class="flex-shrink-0">
          <NuxtLink to="/" class="logo-link">
            <img src="../public/logo.png" alt="CorosDev Logo" class="logo-img" />
            <div class="logo-divider"></div>
            <span class="logo-tag">
              COROS<span class="text-[#1F7FFF]">Dev</span>
            </span>
          </NuxtLink>
        </div>

        <nav class="desktop-nav">
          <NuxtLink to="/" exact-active-class="router-link-exact-active">
            {{ localeStore.t('nav_home') || 'Inicio' }}
          </NuxtLink>
          
          <NuxtLink to="/ecosystem" active-class="router-link-exact-active">
            {{ localeStore.t('nav_ecosystem') || 'Ecosistema' }}
          </NuxtLink>
          
          <NuxtLink to="/services" active-class="router-link-exact-active">
            {{ localeStore.t('nav_services') || 'Servicios' }}
          </NuxtLink>
          
          <NuxtLink to="/about" active-class="router-link-exact-active">
            {{ localeStore.t('nav_about') || 'Nosotros' }}
          </NuxtLink>

          <a href="#contact" class="nav-link-item">
            {{ localeStore.t('nav_contact') || 'Contacto' }}
          </a>
        </nav>

        <div class="hidden md:flex items-center nav-right">
          <NuxtLink to="/#contact" class="btn-cta-nav">
            {{ localeStore.t('nav_cta') || 'Agendar Demo' }}
          </NuxtLink>
        </div>

        <div class="md:hidden flex items-center">
          <button @click="isMobileMenuOpen = !isMobileMenuOpen" type="button" class="mobile-menu-btn">
            <div class="bar" :class="{ 'rotate-45 translate-y-2': isMobileMenuOpen }"></div>
            <div class="bar" :class="{ 'opacity-0': isMobileMenuOpen }"></div>
            <div class="bar" :class="{ '-rotate-45 -translate-y-1.5': isMobileMenuOpen }"></div>
          </button>
        </div>

      </div>

      <div class="mobile-menu" :class="{ 'open': isMobileMenuOpen }">
        <NuxtLink to="/" @click="isMobileMenuOpen = false">
          {{ localeStore.t('nav_home') || 'Inicio' }}
        </NuxtLink>
        
        <NuxtLink to="/ecosystem" @click="isMobileMenuOpen = false">
          {{ localeStore.t('nav_ecosystem') || 'Ecosistema' }}
        </NuxtLink>
        
        <NuxtLink to="/services" @click="isMobileMenuOpen = false">
          {{ localeStore.t('nav_services') || 'Servicios' }}
        </NuxtLink>
        
        <NuxtLink to="/about" @click="isMobileMenuOpen = false">
          {{ localeStore.t('nav_about') || 'Nosotros' }}
        </NuxtLink>

        <a href="#contact" class="nav-link-item" @click="isMobileMenuOpen = false">
          {{ localeStore.t('nav_contact') || 'Contacto' }}
        </a>

        <NuxtLink to="/#contact" @click="isMobileMenuOpen = false" class="mobile-cta">
          {{ localeStore.t('nav_cta') || 'Agendar Demo' }}
        </NuxtLink>
      </div>

    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const localeStore = useLocaleStore()

const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 8
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.navbar-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  transition: all 0.3s ease;
  padding: 1rem 0;
}

.nav-container {
  max-width: 80rem; /* 7xl */
  margin: 0 auto;
  padding: 0.75rem 1.5rem;
  border-radius: 1.5rem;
  transition: all 0.3s ease;
}

.nav-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-glass {
  background: rgba(3, 0, 20, 0.5);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.10);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.35);
}

/* Cuando se activa el scroll, tu CSS reduce el padding y oscurece el fondo */
.navbar-header.scrolled {
  padding: 0.25rem 0;
}

.navbar-header.scrolled .nav-glass {
  background: rgba(3, 0, 20, 0.85);
  border-color: rgba(255, 255, 255, 0.14);
  border-radius: 0 0 1.5rem 1.5rem;
}

/* Estilos del Logo */
.logo-link {
  display: flex;
  align-items: center;
  text-decoration: none;
}

.logo-img {
  height: 2.5rem;
  width: auto;
  transition: height 0.3s ease;
}

.logo-divider {
  height: 1.5rem;
  width: 1px;
  background: rgba(255, 255, 255, 0.2);
  margin: 0 0.75rem;
  display: none;
}

@media (min-width: 640px) {
  .logo-divider { display: block; }
}

.logo-tag {
  font-size: 16px;
  letter-spacing: 0.05em;
  color: white;
  font-weight: 700;
  text-transform: uppercase;
  display: none;
}

@media (min-width: 640px) {
  .logo-tag { display: block; }
}

/* Desktop Nav Links */
.desktop-nav {
  display: none;
  gap: 2rem;
}

@media (min-width: 768px) {
  .desktop-nav {
    display: flex;
    align-items: center;
  }
}

.desktop-nav a {
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: color 0.2s;
}

.desktop-nav a:hover, .desktop-nav .router-link-exact-active {
  color: #1F7FFF;
}

/* Right Side */
.nav-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-cta-nav {
  background: #1F7FFF;
  color: #030014;
  padding: 0.6rem 1.5rem;
  border-radius: 999px;
  font-weight: 600;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  filter: drop-shadow(0 0 15px rgba(31, 127, 255, 0.3));
}

.btn-cta-nav:hover {
  transform: scale(1.05);
  filter: drop-shadow(0 0 25px rgba(31, 127, 255, 0.6));
}

/* Mobile Menu Hamburguesa */
.mobile-menu-btn {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}

.bar {
  width: 24px;
  height: 2px;
  background: rgba(255, 255, 255, 0.85);
  transition: all 0.3s ease;
}

.mobile-menu {
  max-height: 0;
  overflow: hidden;
  transition: all 0.4s ease;
  opacity: 0;
  display: flex;
  flex-direction: column;
}

.mobile-menu.open {
  max-height: 400px;
  opacity: 1;
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.mobile-menu a {
  padding: 0.75rem 0;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-weight: 600;
  text-transform: uppercase;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.mobile-cta {
  color: #1F7FFF !important;
  font-weight: 700 !important;
  border-bottom: none !important;
  text-align: center;
  padding-top: 1rem !important;
}
</style>