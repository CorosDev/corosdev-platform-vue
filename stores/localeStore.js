import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const TRANSLATIONS = {
  en: {
      meta_title: 'CorosDev | AI Driven Software Company',
      meta_description: 'We transform ambitious ideas into scalable, profitable, and future-ready businesses through world-class technology systems.',
      nav_home: 'Home',
      nav_ecosystem: 'Ecosystem',
      nav_services: 'Services',
      nav_about: 'About Us',
      nav_contact: 'Contact',
      nav_cta: 'Book a demo',
      hero_tag: 'AI DRIVEN COMPANY · LATAM ENGINEERING · US TIME & EU TIME',
      hero_h1: 'Building Tomorrow\'s <span class="gradient-text drop-shadow-glow">Software</span> Today.',
      hero_sub: 'We transform ambitious ideas into scalable, profitable, and future-ready businesses through world-class technology systems.',
      hero_cta1: 'Book a 30-min discovery',
      hero_cta2: 'See our work',
      hero_map: 'Our impact in the world',
      hero_map_node_usa: 'USA',
      hero_map_node_latam: 'LATAM',
      hero_map_node_europe: 'EUROPE',
      mission_h2: 'Our <span class="gradient-text drop-shadow-glow">Mission</span>',
      mission_p: 'At CorosDev, we empower innovative companies worldwide through world-class technology and intelligent growth systems - transforming ideas into scalable, profitable, and future-ready businesses.',
      mission_label: 'To accomplish this, we:',
      mission_b1_h: 'Build Technology That Scales',
      mission_b1_p: 'We design and develop high-performance digital solutions engineered for global growth. We don\'t just build products that work today. We build platforms prepared to lead tomorrow.',
      mission_b2_h: 'Create Intelligent Growth Systems',
      mission_b2_p: 'We integrate software development, digital marketing, SEO, strategic content, automation, and performance analytics to turn traffic into customers, and customers into predictable revenue.',
      mission_b3_h: 'Deliver Measurable & Sustainable Impact',
      mission_b3_p: 'We operate with clear KPIs, data-driven optimization, and ROI-focused execution to ensure consistent growth, competitive advantage, and long-term success.',
      mission_btn: 'READ ABOUT US',
      sol_title: 'Solutions that <span class="gradient-text drop-shadow-glow">move the needle</span>',
      sol_subtitle: 'Start small or go big - each can ship as a sprint or part of a program.',
      sol_badge_gtm: 'Go-to-Market',
      sol_badge_scale: 'Scaling',
      sol_badge_ops: 'Ops',
      sol_card1_title: 'MVP in 6—8 Weeks',
      sol_card1_desc: 'From prototype to a production-ready engine. We engineer scalable MVPs designed to validate your business model and lead the market from day one.',
      sol_card1_cta: 'Get timeline',
      sol_card2_title: 'Hyper-Growth Blueprint',
      sol_card2_desc: 'Strategic acquisition systems engineered for global expansion. We turn traffic into predictable revenue through intelligent marketing and authority-driven positioning.',
      sol_card2_cta: 'Get growth plan',
      sol_card3_title: 'Workflow Automation',
      sol_card3_desc: 'Automating complexities into seamless operational flow. We replace spreadsheet friction with intelligent systems to ensure sustainable growth and measurable ROI.',
      sol_card3_cta: 'See examples',
      testi_h2: 'What our <span class="gradient-text drop-shadow-glow">clients say</span>',
      testi_sub: 'Proven results delivered to industry leaders through dedicated engineering and design discipline.',
      testi_card1: "CorosDev's agile approach allowed us to launch our MVP in record time. Their Vue 3 code is clean and highly scalable.",
      testi_card2: 'Automating our workflows with them reduced operational errors by 40%. A completely strategic investment.',
      testi_card3: "Complex integrations, handled with great communication...",
      testi_card4: "The most robust Shopify Plus integration we've seen...",
      testi_card5: "They built our fintech app from scratch...",
      testi_card6: "Exceptional technical talent. Their design-led approach...",
      eco_label: 'Internal Ventures',
      eco_title: 'Our <span class="gradient-text drop-shadow-glow">Ecosystem</span>',
      eco_subtitle: 'Beyond client work, we build our own products. These are the ventures born inside CorosDev, each solving a real problem at scale.',
      eco_badge: 'Early Access',
      eco_sector: 'Sector',
      eco_trd_name: 'Accesorios TRD',
      eco_trd_desc: 'Premium automotive accessories e-commerce platform built for performance enthusiasts across LATAM and North America.',
      eco_trd_sector: 'E-Commerce · Auto',
      eco_snapay_name: 'Snapay',
      eco_snapay_desc: 'A next-generation payment infrastructure for SMEs in emerging markets. Instant settlements and AI fraud prevention.',
      eco_snapay_sector: 'Fintech · Payments',
      eco_vorzana_name: 'Vorzana',
      eco_vorzana_desc: 'An AI-powered business intelligence platform that transforms raw operational data into strategic insights.',
      eco_vorzana_sector: 'AI · Analytics',
      eco_cta: 'Interested in partnering or investing?',
      eco_cta_link: 'Let\'s talk',
      eco_early_tester_btn: 'Want to be an early Tester?',
      snapay_badge: 'A CorosDev Venture',
      snapay_title: 'The Future of Payments<br><span class="gradient-text">for Emerging Markets</span>',
      snapay_desc: 'Next-generation payment infrastructure built for SMEs. Instant settlements, multi-currency support, and AI-powered fraud prevention — democratizing fintech across borders.',
      snapay_stat1_val: '10K+',
      snapay_stat1_lbl: 'SMEs Onboarded',
      snapay_stat2_val: '12+',
      snapay_stat2_lbl: 'Currencies',
      snapay_stat3_val: 'AI',
      snapay_stat3_lbl: 'Fraud Prevention',
      snapay_cta: 'Visit Snapay.ai',
      video_title: 'See Our <span class="gradient-text drop-shadow-glow">Methodology in Action</span>',
      video_desc: 'Experience how we design, build, and scale digital products. Learn how our ecosystem and elite engineering teams bring future-ready systems to life.',
      svc_hero_h1: 'Elite services. <span class="gradient-text drop-shadow-glow">Strategic systems.</span>',
      svc_hero_sub: 'We don\'t just deliver services. We engineer competitive advantages through world-class technology.',
      svc_fw1_h: 'Diagnose',
      svc_fw2_h: 'Architect',
      svc_fw3_h: 'Execute',
      svc_fw4_h: 'Scale',
      footer_copy: '© 2024 CorosDev. All rights reserved.',
      form_name: 'Full name',
      form_email: 'Work email',
      form_msg: 'What are you building?',
      form_cta: 'Request proposal',
      forms: {
        contact_h2: "Tell us what you're building",
        contact_sub: "Get a roadmap, estimate, and risk assessment in 72 hours.",
        form_name_placeholder: "Your full name",
        form_email_placeholder: "Your corporate email",
        form_message_placeholder: "Tell us a bit about your goals...",
        cta_submit: "Send Request",
        cta_processing: "Processing..."
      }
    },
    es: {
      meta_title: 'CorosDev | Compañía de Software impulsada por IA',
      meta_description: 'Transformamos ideas ambiciosas en negocios escalables, rentables y preparados para el futuro con sistemas tecnológicos de clase mundial.',
      nav_home: 'Inicio',
      nav_ecosystem: 'Ecosistema',
      nav_services: 'Servicios',
      nav_about: 'Nosotros',
      nav_contact: 'Contacto',
      nav_cta: 'Agendar demo',
      hero_tag: 'COMPAÑÍA IMPULSADA POR IA · INGENIERÍA LATAM · HORARIOS EE. UU. Y EUROPA',
      hero_h1: 'Construyendo el <span class="gradient-text drop-shadow-glow">Software</span> del Mañana, Hoy.',
      hero_sub: 'Transformamos ideas ambiciosas en negocios escalables, rentables y preparados para el futuro a través de sistemas tecnológicos de clase mundial.',
      hero_cta1: 'Agendar una sesión de 30 min',
      hero_cta2: 'Ver nuestro trabajo',
      hero_map: 'Nuestro impacto en el mundo',
      hero_map_node_usa: 'EE. UU.',
      hero_map_node_latam: 'LATAM',
      hero_map_node_europe: 'EUROPA',
      mission_h2: 'Nuestra <span class="gradient-text drop-shadow-glow">Misión</span>',
      mission_p: 'En CorosDev, empoderamos a empresas innovadoras en todo el mundo con tecnología de primer nivel y sistemas de crecimiento inteligente, transformando ideas en negocios escalables, rentables y preparados para el futuro.',
      mission_label: 'Para lograrlo:',
      mission_b1_h: 'Construimos tecnología que escala',
      mission_b1_p: 'Diseñamos y desarrollamos soluciones digitales de alto rendimiento, preparadas para el crecimiento global. No solo construimos productos para hoy, construimos las plataformas líderes del mañana.',
      mission_b2_h: 'Creamos sistemas de crecimiento inteligente',
      mission_b2_p: 'Integramos desarrollo de software, marketing digital, SEO, contenido estratégico, automatización y analítica de rendimiento para convertir tráfico en clientes y clientes en ingresos predecibles.',
      mission_b3_h: 'Generamos impacto medible y sostenible',
      mission_b3_p: 'Operamos con KPIs claros, optimización basada en datos y ejecución orientada al ROI para garantizar un crecimiento consistente, ventaja competitiva y éxito a largo plazo.',
      mission_btn: 'CONOCER MÁS',
      sol_title: 'Soluciones que <span class="gradient-text drop-shadow-glow">marcan la diferencia</span>',
      sol_subtitle: 'Empieza pequeño o ve en grande; cada una se puede entregar como un sprint o como parte de un programa.',
      sol_badge_gtm: 'Go-to-Market',
      sol_badge_scale: 'Escalamiento',
      sol_badge_ops: 'Operaciones',
      sol_card1_title: 'MVP en 6—8 semanas',
      sol_card1_desc: 'De prototipo a motor listo para producción. Diseñamos MVPs escalables pensados para validar tu modelo de negocio y liderar el mercado desde el primer día.',
      sol_card1_cta: 'Obtener cronograma',
      sol_card2_title: 'Plan de Hipercrecimiento',
      sol_card2_desc: 'Sistemas de adquisición estratégica diseñados para la expansión global. Convertimos tráfico en ingresos predecibles a través de marketing inteligente.',
      sol_card2_cta: 'Obtener plan',
      sol_card3_title: 'Automatización de Flujos',
      sol_card3_desc: 'Automatizando complejidades en un flujo operativo continuo. Reemplazamos la fricción de las hojas de cálculo con sistemas inteligentes.',
      sol_card3_cta: 'Ver ejemplos',
      testi_h2: 'Lo que dicen <span class="gradient-text drop-shadow-glow">nuestros clientes</span>',
      testi_sub: 'Resultados comprobados entregados a líderes de la industria a través de una rigurosa disciplina de diseño e ingeniería.',
      testi_card1: 'El enfoque ágil de CorosDev nos permitió lanzar nuestro MVP en tiempo récord. Su código en Vue 3 es limpio y escalable.',
      testi_card2: 'Automatizar nuestros flujos de trabajo con ellos redujo los errores operativos en un 40%. Una inversión totalmente estratégica.',
      testi_card3: "Integraciones complejas, gestionadas con una excelente comunicación...",
      testi_card4: "La integración de Shopify Plus más sólida que hemos visto...",
      testi_card5: "Construyeron nuestra aplicación fintech desde cero...",
      testi_card6: "Talento técnico excepcional. Su enfoque guiado por el diseño...",
      eco_label: 'Proyectos Internos',
      eco_title: 'Nuestro <span class="gradient-text drop-shadow-glow">Ecosistema</span>',
      eco_subtitle: 'Más allá del trabajo con clientes, construimos nuestros propios productos. Proyectos nacidos dentro de CorosDev resolviendo problemas a escala.',
      eco_badge: 'Acceso Anticipado',
      eco_sector: 'Sector',
      eco_trd_name: 'Accesorios TRD',
      eco_trd_desc: 'Plataforma de e-commerce automotriz premium para entusiastas del rendimiento en LATAM y Norteamérica.',
      eco_trd_sector: 'Comercio Electrónico · Automotriz',
      eco_snapay_name: 'Snapay',
      eco_snapay_desc: 'Infraestructura de pagos de última generación para PYMEs. Liquidaciones instantáneas y prevención de fraude con IA.',
      eco_snapay_sector: 'Fintech · Pagos',
      eco_vorzana_name: 'Vorzana',
      eco_vorzana_desc: 'Plataforma de BI con IA que transforma datos operativos en información estratégica y tableros personalizados.',
      eco_vorzana_sector: 'IA · Analítica',
      eco_cta: '¿Interesado en asociarte o invertir?',
      eco_cta_link: 'Hablemos',
      eco_early_tester_btn: '¿Quieres ser un Tester anticipado?',
      snapay_badge: 'Una Empresa de CorosDev',
      snapay_title: 'El Futuro de los Pagos<br><span class="gradient-text">para Mercados Emergentes</span>',
      snapay_desc: 'Infraestructura de pagos de última generación para PYMEs. Liquidaciones instantáneas, soporte multimoneda y prevención de fraudes con IA — democratizando las fintech sin fronteras.',
      snapay_stat1_val: '10K+',
      snapay_stat1_lbl: 'PYMEs Registradas',
      snapay_stat2_val: '12+',
      snapay_stat2_lbl: 'Divisas',
      snapay_stat3_val: 'IA',
      snapay_stat3_lbl: 'Antifraude',
      snapay_cta: 'Visitar Snapay.ai',
      video_title: 'Mira Nuestra <span class="gradient-text drop-shadow-glow">Metodología en Acción</span>',
      video_desc: 'Descubre cómo diseñamos, construimos y escalamos productos digitales. Conoce cómo nuestro ecosistema y equipos de ingeniería de élite dan vida a sistemas preparados para el futuro.',
      svc_hero_h1: 'Servicios de élite. <span class="gradient-text drop-shadow-glow">Sistemas estratégicos.</span>',
      svc_hero_sub: 'No solo entregamos servicios. Diseñamos ventajas competitivas mediante tecnología de clase mundial.',
      svc_fw1_h: 'Diagnosticar',
      svc_fw2_h: 'Arquitectura',
      svc_fw3_h: 'Ejecutar',
      svc_fw4_h: 'Escalar',
      footer_copy: '© 2024 CorosDev. Todos los derechos reservados.',
      form_name: 'Nombre completo',
      form_email: 'Correo corporativo',
      form_msg: '¿Qué estás construyendo?',
      form_cta: 'Enviar Solicitud',
      forms: {
        contact_h2: "Cuéntanos qué estás construyendo",
        contact_sub: "Obtén una hoja de ruta, estimación y evaluación de riesgos en 72 horas.",
        form_name_placeholder: "Tu nombre completo",
        form_email_placeholder: "Tu correo corporativo",
        form_message_placeholder: "Cuéntanos un poco sobre tus objetivos...",
        cta_submit: "Enviar Solicitud",
        cta_processing: "Procesando..."
      }
    }
  }

export const useLocaleStore = defineStore('locale', () => {
  const getInitialLang = () => {
    // 1. Protección estricta para SSR: si no es el cliente, devolvemos el idioma por defecto inmediatamente.
    if (!import.meta.client) return 'es'

    const stored = localStorage.getItem('cd_lang')
    if (stored) return stored

    //navigator solo existe en el cliente (dentro de window)
    return window.navigator.language.startsWith('es') ? 'es' : 'en'
  }

  const currentLang = ref(getInitialLang())

  const t = (key) => {
    return TRANSLATIONS[currentLang.value][key] || key
  }

  const toggleLanguage = () => {
    currentLang.value = currentLang.value === 'en' ? 'es' : 'en'
  }

  // Persistencia y actualización del atributo lang en el HTML (solo en el cliente)
  watch(currentLang, (newLang) => {
    if (import.meta.client) {
      requestAnimationFrame(() => {
        document.documentElement.lang = newLang
      })
    }
  }, { immediate: true })

  return { currentLang, t, toggleLanguage }
}, {
  // 2. Configuración de persistencia segura para SSR
  persist: {
    storage: import.meta.client ? localStorage : undefined,
    key: 'cd_lang'
  }
})