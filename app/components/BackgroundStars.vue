<template>
  <!-- Canvas aislado con hardware-acceleration forzada mediante CSS -->
  <canvas ref="canvasRef" class="stars-canvas"></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
let animationFrameId = null
let ctx = null
let lastTime = 0
let stars = []

// Parámetros de rendimiento
const STAR_COUNT = 150 // Cantidad óptima balanceada para rendimiento visual masivo
let currentWidth = 0; // Usar nombres distintos para evitar confusión con window.innerWidth/innerHeight
let currentHeight = 0;

// Flag para controlar el console.log una sola vez por ciclo de vida o redimensionamiento
let hasLoggedStars = false;

// Inicializar el array matemático de estrellas
const initStars = () => {
  stars = []
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: Math.random() * currentWidth,
      y: Math.random() * currentHeight,
      size: Math.random() * 1.5 + 0.5,
      speed: Math.random() * 30 + 10 // Velocidad en píxeles por segundo
    })
  }
}

// Bucle de animación optimizado a 140Hz sin jank
const animate = (currentTime) => {
  // Inicializar lastTime en el primer frame para evitar saltos bruscos
  if (lastTime === 0) {
    lastTime = currentTime
    animationFrameId = requestAnimationFrame(animate)
    return
  }

  // Calcular delta time para independencia de framerate
  const deltaTime = (currentTime - lastTime) / 1000
  lastTime = currentTime

  // Evitar saltos grandes si la pestaña estuvo inactiva
  if (deltaTime > 0.1) {
    animationFrameId = requestAnimationFrame(animate)
    return
  }

  if (!ctx) {
    console.error("BackgroundStars: El contexto del canvas no está disponible.");
    animationFrameId = requestAnimationFrame(animate); // Seguir intentando en el siguiente frame
    return;
  }

  // Limpiar el lienzo completamente en cada frame
  ctx.clearRect(0, 0, currentWidth, currentHeight);

  // Log solo una vez para verificar la ejecución del bucle
  if (!hasLoggedStars) {
    console.log("BackgroundStars: Dibujando estrellas. Cantidad:", stars.length, "Ancho:", currentWidth, "Alto:", currentHeight);
    hasLoggedStars = true;
  }

  // Configuración de estilo global para el lote de estrellas (Optimización de estado de contexto)
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 2;

  ctx.beginPath();
  stars.forEach(star => {
    ctx.moveTo(star.x + star.size, star.y);
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    
    // Actualizar posición de la estrella
    star.x -= star.speed * deltaTime // Movimiento fluido independiente del monitor
    if (star.x < 0) { // Si la estrella sale por el borde izquierdo
      star.x = currentWidth // Reiniciar en el borde derecho
      star.y = Math.random() * currentHeight // Aleatorizar posición Y
    }
  })
  ctx.fill();

  // Reiniciar propiedades de sombra una sola vez al final del lote
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // CRÍTICO: Asegurar que el bucle de animación sea infinito
  animationFrameId = requestAnimationFrame(animate)
}

// Redimensión inteligente controlada (Anti-re-renderizado masivo)
const handleResize = () => {
  if (!canvasRef.value) {
    console.warn("BackgroundStars: canvasRef.value es nulo durante handleResize.");
    return;
  }

  currentWidth = window.innerWidth;
  currentHeight = window.innerHeight;

  // Forzar explícitamente el tamaño del canvas en atributos HTML
  canvasRef.value.width = currentWidth;
  canvasRef.value.height = currentHeight;

  console.log(`BackgroundStars: Canvas redimensionado a ${currentWidth}x${currentHeight}`);

  initStars(); // Reinicializar estrellas con las nuevas dimensiones
  hasLoggedStars = false; // Permitir que el log de estrellas se ejecute de nuevo
}

// Manejo estricto del ciclo de vida para evitar fugas de memoria (Memory Leaks)
onMounted(() => {
  ctx = canvasRef.value.getContext('2d')
  handleResize()
  
  window.addEventListener('resize', handleResize)
  requestAnimationFrame(animate) // Iniciar bucle gráfico con timestamp correcto
})

onUnmounted(() => {
  // CRÍTICO: Limpiar eventos globales y detener loops al cambiar de subpágina
  window.removeEventListener('resize', handleResize)
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  console.log('Fondo de estrellas destruido con éxito. GPU liberada.')
})
</script>

<style scoped>
.stars-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: block; /* Evita espacios extra en el scroll inline */
  z-index: -1;    /* Se mantiene detrás del texto de las vistas */
  background: #0a0a16; /* Color azul oscuro/grisáceo temporal para verificar visibilidad */
  pointer-events: none;
  
  /* Forzar aceleración por hardware en la GPU */
  transform: translateZ(0);
  will-change: transform;
  contain: strict;
}
</style>