/* ============================================================
   locale.js — CorosDev Shared i18n Translation System
   Usage: <script src="locale.js"></script>
          Then call: initI18n() on DOMContentLoaded
   ============================================================ */

const CD_TRANSLATIONS = {
  en: {
    /* ── NAV ── */
    nav_home:       'Home',
    nav_platform:   'Platform',
    nav_services:   'Services',
    nav_ecosystem:  'Ecosystem',
    nav_partners:   'Partners',
    nav_about:      'About Us',
    nav_contact:    'Contact',
    nav_cta:        'Book a demo',

    /* ── HERO (index) ── */
    hero_tag:   'AI DRIVEN COMPANY &middot; LATAM ENGINEERING &middot; US TIME &amp; EU TIME',
    hero_h1:    'Building Tomorrow\'s <span class="gradient-text drop-shadow-glow">Software</span> Today.',
    hero_sub:   'We transform ambitious ideas into scalable, profitable, and future-ready businesses through world-class technology systems.',
    hero_cta1:  'Book a 30-min discovery',
    hero_cta2:  'See our services',
    hero_pill1: 'Security-first',
    hero_pill2: 'Design-led',
    hero_pill3: 'Measurable impact',
    hero_map:   'Our impact in the world',

    /* ── MISSION ── */
    mission_h2:    'Our <span class="gradient-text drop-shadow-glow">Mission</span>',
    mission_p:     'At CorosDev, we empower innovative companies worldwide through world-class technology and intelligent growth systems - transforming ideas into scalable, profitable, and future-ready businesses.',
    mission_label: 'To accomplish this, we:',
    mission_b1_h:  'Build Technology That Scales',
    mission_b1_p:  'We design and develop high-performance digital solutions engineered for global growth. We don\'t just build products that work today. We build platforms prepared to lead tomorrow.',
    mission_b2_h:  'Create Intelligent Growth Systems',
    mission_b2_p:  'We integrate software development, digital marketing, SEO, strategic content, automation, and performance analytics to turn traffic into customers, and customers into predictable revenue.',
    mission_b3_h:  'Deliver Measurable &amp; Sustainable Impact',
    mission_b3_p:  'We operate with clear KPIs, data-driven optimization, and ROI-focused execution to ensure consistent growth, competitive advantage, and long-term success.',
    mission_btn:   'READ ABOUT US',

    /* ── SOLUTIONS (index) ── */
    sol_title:        'Solutions that <span class="gradient-text drop-shadow-glow">move the needle</span>',
    sol_subtitle:     'Start small or go big - each can ship as a sprint or part of a program.',
    sol_badge_gtm:    'Go-to-Market',
    sol_badge_scale:  'Scaling',
    sol_badge_ops:    'Ops',
    sol_card1_title:  'MVP in 6&mdash;8 Weeks',
    sol_card1_desc:   'From prototype to a production-ready engine. We engineer scalable MVPs designed to validate your business model and lead the market from day one.',
    sol_card1_cta:    'Get timeline',
    sol_card2_title:  'Hyper-Growth Blueprint',
    sol_card2_desc:   'Strategic acquisition systems engineered for global expansion. We turn traffic into predictable revenue through intelligent marketing and authority-driven positioning.',
    sol_card2_cta:    'Get growth plan',
    sol_card3_title:  'Workflow Automation',
    sol_card3_desc:   'Automating complexities into seamless operational flow. We replace spreadsheet friction with intelligent systems to ensure sustainable growth and measurable ROI.',
    sol_card3_cta:    'See examples',

    /* ── TESTIMONIALS (index) ── */
    testi_h2:         'What our <span class="gradient-text drop-shadow-glow">clients say</span>',
    testi_sub:        'Proven results delivered to industry leaders through dedicated engineering and design discipline.',
    testi_card1:      '&ldquo;CorosDev delivered exactly what we needed, on time and with excellent quality.&rdquo;',
    testi_card2:      '&ldquo;Proposed scalable solutions that solved our most complex infrastructure challenges.&rdquo;',
    testi_card3:      '&ldquo;Complex integrations, handled with great communication. True engineering partners.&rdquo;',
    testi_card4:      '&ldquo;The most robust Shopify Plus integration we&#39;ve seen. Flawless execution.&rdquo;',
    testi_card5:      '&ldquo;They built our fintech app from scratch. Security and speed were top notch.&rdquo;',
    testi_card6:      '&ldquo;Exceptional technical talent. Their design-led approach makes a real difference.&rdquo;',

    /* ── ECOSYSTEM (index preview + full page) ── */
    eco_label:        'Internal Ventures',
    eco_title:        'Our <span class="gradient-text drop-shadow-glow">Ecosystem</span>',
    eco_subtitle:     'Beyond client work, we build our own products. These are the ventures born inside CorosDev, each solving a real problem at scale.',
    eco_badge:        'Early Access',
    eco_sector:       'Sector',
    eco_trd_name:     'Accesorios TRD',
    eco_trd_desc:     'Premium automotive accessories e-commerce platform built for performance enthusiasts across LATAM and North America. Curated catalog, fast logistics, and a seamless buying experience.',
    eco_trd_sector:   'E-Commerce &middot; Auto',
    eco_trd_detail:   'Accesorios TRD was born from a real gap in the LATAM market: premium automotive parts with no trustworthy online destination. We built the entire platform — storefront, logistics integrations, and inventory management — in-house.',
    eco_trd_stage:    'Growth &amp; Scale',
    eco_trd_sector_val: 'E-Commerce',
    eco_snapay_name:  'Snapay',
    eco_snapay_desc:  'A next-generation payment infrastructure for SMEs in emerging markets. Instant settlements, multi-currency support, and AI-powered fraud prevention - built to democratize fintech.',
    eco_snapay_sector:'Fintech &middot; Payments',
    eco_snapay_detail:'Snapay addresses the fragmented payment landscape in LATAM where 60% of SMEs remain underserved by traditional banking. Our API-first architecture enables any merchant to accept payments in under 10 minutes.',
    eco_snapay_stage: 'Beta Validation',
    eco_snapay_sector_val: 'Fintech',
    eco_vorzana_name: 'Vorzana',
    eco_vorzana_desc: 'An AI-powered business intelligence platform that transforms raw operational data into strategic insights. Custom dashboards, predictive analytics, and automated reporting at enterprise grade.',
    eco_vorzana_sector:'AI &middot; Analytics',
    eco_vorzana_detail:'Vorzana emerged from the operational pain our own clients faced: drowning in data but starving for insight. We built an AI layer that speaks your business language, not technical jargon.',
    eco_vorzana_stage: 'MVP Phase',
    eco_vorzana_sector_val: 'AI / Analytics',
    eco_cta:          'Interested in partnering or investing?',
    eco_cta_link:     'Let\'s talk &rarr;',
    eco_early_tester_btn: 'Want to be an early Tester? &rarr;',

    /* ── PARTNERS PAGE ── */
    ptn_label:        'Strategic Alliances',
    ptn_title:        'Our <span class="gradient-text drop-shadow-glow">Partners</span>',
    ptn_subtitle:     'We build alongside a trusted network of technology, capital, and data companies — extending what CorosDev can deliver for every client and venture.',
    ptn_visit:        'Visit site &rarr;',
    ptn_sector_label: 'Sector',

    ptn_eiw_name:    'EncryptedInfoWeb',
    ptn_eiw_sector:  'IT Solutions &amp; Software Development',
    ptn_eiw_desc:    'Custom web development, mobile apps, and enterprise ERP/CRM software &mdash; delivering data-driven solutions across real estate, healthcare, finance, and e-commerce.',

    ptn_sbc_name:    'SBC Capital',
    ptn_sbc_sector:  'Private Equity &amp; Acquisitions',
    ptn_sbc_desc:    'A private acquisition firm investing in lower middle-market businesses across the U.S. and Europe, acting as permanent, long-term owners.',

    ptn_audela_name:   'AUDELA Control Tower',
    ptn_audela_sector: 'Business Intelligence &amp; LegalTech',
    ptn_audela_desc:   'A French software company delivering Business Intelligence, ERP, and LegalTech solutions through its unified Control Tower platform.',

    ptn_nolim_name:   'Nolim Studios',
    ptn_nolim_sector: 'Software, AI &amp; AR/VR',
    ptn_nolim_desc:   'A software development studio building custom software, AI systems, AR/VR experiences, SaaS platforms, and games &mdash; from air traffic systems to judicial education platforms.',

    ptn_intellify_name:   'The Intellify',
    ptn_intellify_sector: 'AI &amp; Digital Product Engineering',
    ptn_intellify_desc:   'An AI and digital product engineering company building intelligent automation, AI agents, and modernized platforms for enterprises across regulated industries.',

    ptn_cta:        'Interested in becoming a CorosDev partner?',
    ptn_cta_sub:    'We are always looking to grow our network of strategic technology, capital, and data allies.',
    ptn_cta_link:   'Let\'s talk &rarr;',

    /* ── SNAPAY SPOTLIGHT ── */
    snapay_badge:     'A CorosDev Venture',
    snapay_title:     'The Future of Payments<br><span class="gradient-text drop-shadow-glow">for Emerging Markets</span>',
    snapay_desc:      'Next-generation payment infrastructure built for SMEs. Instant settlements, multi-currency support, and AI-powered fraud prevention — democratizing fintech across borders.',
    snapay_stat1_val: '10K+',
    snapay_stat1_lbl: 'SMEs Onboarded',
    snapay_stat2_val: '12+',
    snapay_stat2_lbl: 'Currencies',
    snapay_stat3_val: 'AI',
    snapay_stat3_lbl: 'Fraud Prevention',
    snapay_cta:       'Visit Snapay.ai &rarr;',

    eco_status_label: 'Status',
    eco_status_value: 'Early Access',
    eco_stage_label:  'Stage',
    video_title:      'See Our <span class="gradient-text drop-shadow-glow">Methodology in Action</span>',
    video_desc:       'Experience how we design, build, and scale digital products. Learn how our ecosystem and elite engineering teams bring future-ready systems to life.',

    /* ── GLOBAL PRESENCE GLOBE (hero, index) ──
       Office titles, categories, legal company names and mailing
       addresses are kept identical in en/es on purpose — legal
       entity names and postal addresses aren't translated. */
    gp_selector_aria: 'Select a CorosDev location',
    gp_globe_aria:    'Interactive 3D globe showing CorosDev locations in Honduras, the United States and the Czech Republic',
    gp_card_close:    'Close',
    gp_fallback_note: 'Interactive globe unavailable — showing our locations below.',

    gp_loc_honduras_type:         'GLOBAL HEADQUARTERS',
    gp_loc_honduras_title:        'Honduras Headquarters',
    gp_loc_honduras_short:        'Honduras',
    gp_loc_honduras_location:     'San Pedro Sula, Honduras',
    gp_loc_honduras_company:      'CorosDev S.A.',
    gp_loc_honduras_full_address: 'Boulevard Michelleti<br>3era Etapa, 5th Street<br>San Pedro Sula 21101<br>Honduras',

    gp_loc_miami_type:         'BUSINESS PRESENCE',
    gp_loc_miami_title:        'Miami Office',
    gp_loc_miami_short:        'Miami',
    gp_loc_miami_location:     'Miami, Florida, United States',
    gp_loc_miami_company:      'CorosDev LLC',
    gp_loc_miami_full_address: '100 SE 2nd Street<br>Suite 2000<br>Miami, FL 33131<br>United States',

    gp_loc_wyoming_type:         'REGISTERED OFFICE',
    gp_loc_wyoming_title:        'Wyoming Registered Office',
    gp_loc_wyoming_short:        'Wyoming',
    gp_loc_wyoming_location:     'Sheridan, Wyoming, United States',
    gp_loc_wyoming_company:      'CorosDev LLC',
    gp_loc_wyoming_full_address: '30 N Gould St<br>Sheridan, WY 82801<br>United States',

    gp_loc_prague_type:         'EUROPEAN HEADQUARTERS',
    gp_loc_prague_title:        'Prague Headquarters',
    gp_loc_prague_short:        'Praha',
    gp_loc_prague_location:     'Praha, Czech Republic',
    gp_loc_prague_company:      'CorosDev S.R.O.',
    gp_loc_prague_full_address: 'Plzeňská 3352/156<br>Praha 5, 150 00<br>Czech Republic',

    /* ── SERVICES PAGE ── */
    svc_hero_tag:   'METHODOLOGY &middot; STRATEGY &middot; EXECUTION',
    svc_hero_h1:    'Elite services. <span class="gradient-text drop-shadow-glow">Strategic systems.</span>',
    svc_hero_sub:   'We don\'t just deliver services. We engineer competitive advantages. Each engagement is powered by a proprietary framework that connects technology, growth, and scale.',
    svc_hero_cta:   'Get a proposal',

    svc_method_label: 'How We Operate',
    svc_method_h2:    'The CorosDev <span class="gradient-text drop-shadow-glow">Framework</span>',
    svc_method_sub:   'Our methodology is what separates us from a typical software agency. We operate as a strategic partner, not a vendor.',

    svc_fw1_h:  'Diagnose',
    svc_fw1_p:  'We begin with a deep technical and business audit. We identify bottlenecks, opportunities, and your competitive moat before writing a single line of code.',
    svc_fw2_h:  'Architect',
    svc_fw2_p:  'We design scalable systems with future growth in mind. Architecture decisions are driven by data, not trends — ensuring your tech stack remains an asset, not a liability.',
    svc_fw3_h:  'Execute',
    svc_fw3_p:  'Agile sprints. Dedicated teams. Transparent communication. We ship fast without sacrificing quality, giving you a competitive edge in days, not months.',
    svc_fw4_h:  'Scale',
    svc_fw4_p:  'Post-launch is where we differentiate. Continuous optimization, performance monitoring, and strategic growth ensure your platform evolves ahead of the market.',

    svc_cards_label: 'Our Engagements',
    svc_cards_h2:    'Engagements <span class="gradient-text drop-shadow-glow">that scale</span>',
    svc_cards_sub:   'Elite technology solutions designed to fit your unique business stage. Choose your impact level.',
    svc_select:      'Get Started',

    svc_01_tag:  '01 / Innovation',
    svc_01_h:    'AI &amp; Workflow Automation',
    svc_01_p:    'Boost operational efficiency by 40% with intelligent agents and custom GPT integrations tailored to your data.',
    svc_01_f1:   'Custom AI Agents',
    svc_01_f2:   'Workflow Optimization',
    svc_01_f3:   'LLM Training &amp; Fine-tune',

    svc_02_tag:  '02 / Engineering',
    svc_02_h:    'Full-Stack Development',
    svc_02_p:    'End-to-end product creation from MVP to enterprise scale. We build software that feels like the future.',
    svc_02_f1:   'Web &amp; Mobile Apps',
    svc_02_f2:   'Dedicated PM &amp; QA',
    svc_02_f3:   'React / Node / Python',

    svc_03_tag:  '03 / Marketing Tech',
    svc_03_h:    'Marketing &amp; Conversion',
    svc_03_p:    'Dominate the market with high-converting landing pages and automated multi-channel marketing systems.',
    svc_03_f1:   'High-Conversion UI/UX',
    svc_03_f2:   'Ad-Tech Integrations',
    svc_03_f3:   'Performance Analytics',

    svc_04_tag:  '04 / Authority',
    svc_04_h:    'SEO &amp; Digital Authority',
    svc_04_p:    'Turn search engines into your biggest revenue source with aggressive technical SEO and content strategy.',
    svc_04_f1:   'Technical SEO Audits',
    svc_04_f2:   'Keyword Dominance',
    svc_04_f3:   'Backlink Architecture',

    svc_05_tag:  '05 / Infrastructure',
    svc_05_h:    'Cloud &amp; Scalability',
    svc_05_p:    'Scale to millions of users with zero downtime. We optimize your cloud for speed, security, and cost.',
    svc_05_f1:   'AWS / Azure / GCP',
    svc_05_f2:   'DevOps Automation',
    svc_05_f3:   'Cybersecurity Hardening',

    svc_06_tag:  '06 / Total Innovation',
    svc_06_h:    'Elite Innovation Squad',
    svc_06_p:    'A dedicated high-performance team covering all fronts: AI, Dev, Growth, and Infrastructure. Your tech partner for global dominance.',
    svc_06_f1:   'Dedicated C-Level Devs',
    svc_06_f2:   '24/7 Priority Support',
    svc_06_f3:   'Unlimited Scalability',

    svc_custom:  'Looking for something custom? All plans can be tailored to your specific requirements.',

    /* ── CONTACT ── */
    contact_h2:   'Tell us what you\'re building',
    contact_sub:  'Get a roadmap, estimate, and risk assessment in 72 hours.',
    form_name:    'Full name',
    form_email:   'Work email',
    form_company: 'Company',
    form_msg:     'What are you building?',
    form_cta:     'Request proposal',
    form_legal:   'By submitting, you agree to our privacy policy.',

    /* ── FOOTER ── */
    footer_copy:  '&copy; <span id="year"></span> CorosDev. All rights reserved.',
    footer_priv:  'Privacy',
    footer_sec:   'Security',
    footer_stat:  'Status',

    /* ── ABOUT PAGE ── */
    about_hero_h1:    'The Minds Behind <br>\n        <span class="gradient-text drop-shadow-glow">Global Innovation.</span>',
    about_hero_p:     'We are a collective of engineers, designers, and strategists dedicated to bridging the gap between Latin American talent and global technological excellence.',
    about_team_h2:    'Our <span class="gradient-text">Leadership</span> Team',
    about_team_carlos_d: 'Visionary leader driving the strategic direction and growth of CorosDev worldwide.',
    about_team_kriscia_d: 'Strategic financial leader managing capital and performance for sustainable innovation.',
    about_team_arturo_d: 'Architect of operational excellence, ensuring seamless delivery across all global projects.',
    about_team_jafet_d:  'Directing product innovation and user-centric architectures for high-impact software.',
    about_team_salvador_d: 'Expert in strategic management focused on scaling businesses and positioning brands through high-impact market analysis.',
    about_team_jeremy_d: 'Managing internal and external flows to ensure clarity and impact across all channels.',
    about_team_john_d:   'Leading data strategy and technological integration to drive intelligent business insights.',
    about_team_emerson_d: 'Technical mastermind engineering high-performance systems and AI-driven solutions.',
    about_cta_h2:     'Want to work with <span class="gradient-text">us?</span>',
    about_cta_p:      'We are always looking for visionary talent and ambitious partners.',
    about_cta_btn:    'GET IN TOUCH',

    /* ── CTA DRAWER ── */
    cta_drawer_title: 'Join the Ecosystem',
    cta_drawer_subtitle: 'Apply to be an early tester or investor for our internal ventures.',
    cta_drawer_title_eco: 'Explore the Ecosystem',
    cta_drawer_subtitle_eco: 'Interested in partnering, investing, or trying early versions of our ventures?',
    cta_drawer_title_svc: 'Build Your Custom Platform',
    cta_drawer_subtitle_svc: 'Let\'s design and engineer your high-performance growth system.',
    cta_drawer_title_ptn: 'Become a CorosDev Partner',
    cta_drawer_subtitle_ptn: 'Tell us about your company and how we could collaborate.',
    cta_form_role: 'I\'m interested as...',
    cta_form_role_tester: 'Early Tester / User',
    cta_form_role_investor: 'Capital Investor',
    cta_form_role_partner: 'Strategic Client Partner',
    cta_form_message: 'How can we help you?',
    cta_form_submit: 'Submit Application',
    cta_form_success_title: 'Application Received!',
    cta_form_success_desc: 'Thank you! Our executive team will review your application and reach out within 24 hours.',
    cta_floating_label: 'Partner / Invest',
    form_name_placeholder: 'Your full name',
    form_email_placeholder: 'Your business email',
    cta_form_message_placeholder: 'Tell us a bit about your goals...',
  },

  es: {
    /* ── NAV ── */
    nav_home:       'Inicio',
    nav_platform:   'Plataforma',
    nav_services:   'Servicios',
    nav_ecosystem:  'Ecosistema',
    nav_partners:   'Partners',
    nav_about:      'Nosotros',
    nav_contact:    'Contacto',
    nav_cta:        'Agendar demo',

    /* ── HERO ── */
    hero_tag:   'COMPAÑÍA IMPULSADA POR IA &middot; INGENIERÍA LATAM &middot; HORARIOS EE. UU. Y EUROPA',
    hero_h1:    'Construyendo el <span class="gradient-text drop-shadow-glow">Software</span> del Mañana, Hoy.',
    hero_sub:   'Transformamos ideas ambiciosas en negocios escalables, rentables y preparados para el futuro a través de sistemas tecnológicos de clase mundial.',
    hero_cta1:  'Agendar una sesión de 30 min',
    hero_cta2:  'Ver nuestros servicios',
    hero_pill1: 'Seguridad primero',
    hero_pill2: 'Diseño estratégico',
    hero_pill3: 'Impacto medible',
    hero_map:   'Nuestro impacto en el mundo',

    /* ── MISSION ── */
    mission_h2:    'Nuestra <span class="gradient-text drop-shadow-glow">Misión</span>',
    mission_p:     'En CorosDev, empoderamos a empresas innovadoras en todo el mundo con tecnología de primer nivel y sistemas de crecimiento inteligente, transformando ideas en negocios escalables, rentables y preparados para el futuro.',
    mission_label: 'Para lograrlo:',
    mission_b1_h:  'Construimos tecnología que escala',
    mission_b1_p:  'Diseñamos y desarrollamos soluciones digitales de alto rendimiento, preparadas para el crecimiento global. No solo construimos productos para hoy, construimos las plataformas líderes del mañana.',
    mission_b2_h:  'Creamos sistemas de crecimiento inteligente',
    mission_b2_p:  'Integramos desarrollo de software, marketing digital, SEO, contenido estratégico, automatización y analítica de rendimiento para convertir tráfico en clientes y clientes en ingresos predecibles.',
    mission_b3_h:  'Generamos impacto medible y sostenible',
    mission_b3_p:  'Operamos con KPIs claros, optimización basada en datos y ejecución orientada al ROI para garantizar un crecimiento consistente, ventaja competitiva y éxito a largo plazo.',
    mission_btn:   'CONOCER MÁS',

    /* ── SOLUTIONS (index) ── */
    sol_title:        'Soluciones que <span class="gradient-text drop-shadow-glow">marcan la diferencia</span>',
    sol_subtitle:     'Empieza pequeño o ve en grande; cada una se puede entregar como un sprint o como parte de un programa.',
    sol_badge_gtm:    'Go-to-Market',
    sol_badge_scale:  'Escalamiento',
    sol_badge_ops:    'Operaciones',
    sol_card1_title:  'MVP en 6&mdash;8 semanas',
    sol_card1_desc:   'De prototipo a motor listo para producción. Diseñamos MVPs escalables pensados para validar tu modelo de negocio y liderar el mercado desde el primer día.',
    sol_card1_cta:    'Obtener cronograma',
    sol_card2_title:  'Plan de Hipercrecimiento',
    sol_card2_desc:   'Sistemas de adquisición estratégica diseñados para la expansión global. Convertimos tráfico en ingresos predecibles a través de marketing inteligente y posicionamiento de autoridad.',
    sol_card2_cta:    'Obtener plan de crecimiento',
    sol_card3_title:  'Automatización de Flujos',
    sol_card3_desc:   'Automatizando complejidades en un flujo operativo continuo. Reemplazamos la fricción de las hojas de cálculo con sistemas inteligentes para garantizar un crecimiento sostenible y un ROI medible.',
    sol_card3_cta:    'Ver ejemplos',

    /* ── TESTIMONIALS (index) ── */
    testi_h2:         'Lo que dicen <span class="gradient-text drop-shadow-glow">nuestros clientes</span>',
    testi_sub:        'Resultados comprobados entregados a líderes de la industria a través de una rigurosa disciplina de diseño e ingeniería.',
    testi_card1:      '&ldquo;CorosDev entregó exactamente lo que necesitábamos, a tiempo y con una calidad excelente.&rdquo;',
    testi_card2:      '&ldquo;Propusieron soluciones escalables que resolvieron nuestros desafíos de infraestructura más complejos.&rdquo;',
    testi_card3:      '&ldquo;Integraciones complejas, gestionadas con una excelente comunicación. Verdaderos socios de ingeniería.&rdquo;',
    testi_card4:      '&ldquo;La integración de Shopify Plus más sólida que hemos visto. Ejecución impecable.&rdquo;',
    testi_card5:      '&ldquo;Construyeron nuestra aplicación fintech desde cero. La seguridad y la velocidad fueron de primer nivel.&rdquo;',
    testi_card6:      '&ldquo;Talento técnico excepcional. Su enfoque guiado por el diseño marca una verdadera diferencia.&rdquo;',

    /* ── ECOSYSTEM ── */
    eco_label:        'Proyectos Internos',
    eco_title:        'Nuestro <span class="gradient-text drop-shadow-glow">Ecosistema</span>',
    eco_subtitle:     'Más allá del trabajo con clientes, construimos nuestros propios productos. Estos son los proyectos nacidos dentro de CorosDev, cada uno resolviendo un problema real a escala.',
    eco_badge:        'Acceso Anticipado',
    eco_sector:       'Sector',
    eco_trd_name:     'Accesorios TRD',
    eco_trd_desc:     'Plataforma de comercio electrónico de accesorios automotrices premium para entusiastas del rendimiento en LATAM y Norteamérica. Catálogo curado, logística rápida y experiencia de compra fluida.',
    eco_trd_sector:   'Comercio Electrónico &middot; Automotriz',
    eco_trd_detail:   'Accesorios TRD nació de un vacío real en el mercado de LATAM: piezas automotrices premium sin un destino confiable en línea. Construimos toda la plataforma (tienda, integraciones logísticas y gestión de inventario) internamente.',
    eco_trd_stage:    'Crecimiento y Escala',
    eco_trd_sector_val: 'Comercio Electrónico',
    eco_snapay_name:  'Snapay',
    eco_snapay_desc:  'Infraestructura de pagos de última generación para PYMEs en mercados emergentes. Liquidaciones instantáneas, soporte multimoneda y prevención de fraudes con IA, democratizando las fintech.',
    eco_snapay_sector:'Fintech &middot; Pagos',
    eco_snapay_detail:'Snapay aborda el panorama fragmentado de pagos en LATAM, donde el 60% de las PYMEs no tienen acceso a la banca tradicional. Nuestra arquitectura basada en APIs permite a cualquier comercio aceptar pagos en menos de 10 minutos.',
    eco_snapay_stage: 'Validación Beta',
    eco_snapay_sector_val: 'Fintech',
    eco_vorzana_name: 'Vorzana',
    eco_vorzana_desc: 'Plataforma de inteligencia de negocios impulsada por IA que transforma datos operativos en información estratégica. Tableros personalizados, analítica predictiva e informes automatizados a nivel empresarial.',
    eco_vorzana_sector:'IA &middot; Analítica',
    eco_vorzana_detail:'Vorzana surgió del dolor operativo que nuestros propios clientes enfrentaban: inundados en datos pero sin información de valor. Construimos una capa de IA que habla el idioma de tu negocio, sin tecnicismos.',
    eco_vorzana_stage: 'Fase MVP',
    eco_vorzana_sector_val: 'IA y Analítica',
    eco_cta:          '&iquest;Interesado en asociarte o invertir?',
    eco_cta_link:     'Hablemos &rarr;',
    eco_early_tester_btn: '&iquest;Quieres ser un Tester de acceso anticipado? &rarr;',

    /* ── PARTNERS PAGE ── */
    ptn_label:        'Alianzas Estratégicas',
    ptn_title:        'Nuestros <span class="gradient-text drop-shadow-glow">Partners</span>',
    ptn_subtitle:     'Construimos junto a una red de confianza de empresas de tecnología, capital y datos, ampliando lo que CorosDev puede ofrecer a cada cliente y proyecto.',
    ptn_visit:        'Visitar sitio &rarr;',
    ptn_sector_label: 'Sector',

    ptn_eiw_name:    'EncryptedInfoWeb',
    ptn_eiw_sector:  'Soluciones de TI y Desarrollo de Software',
    ptn_eiw_desc:    'Desarrollo web a medida, aplicaciones móviles y software empresarial ERP/CRM &mdash; soluciones basadas en datos para real estate, salud, finanzas y e-commerce.',

    ptn_sbc_name:    'SBC Capital',
    ptn_sbc_sector:  'Capital Privado y Adquisiciones',
    ptn_sbc_desc:    'Firma de adquisiciones privada que invierte en negocios del mercado medio-bajo en EE. UU. y Europa, actuando como propietarios permanentes a largo plazo.',

    ptn_audela_name:   'AUDELA Control Tower',
    ptn_audela_sector: 'Business Intelligence y LegalTech',
    ptn_audela_desc:   'Empresa de software francesa que ofrece soluciones de Business Intelligence, ERP y LegalTech a través de su plataforma unificada Control Tower.',

    ptn_nolim_name:   'Nolim Studios',
    ptn_nolim_sector: 'Software, IA y AR/VR',
    ptn_nolim_desc:   'Estudio de desarrollo de software especializado en soluciones a medida, sistemas de IA, experiencias AR/VR, plataformas SaaS y videojuegos.',

    ptn_intellify_name:   'The Intellify',
    ptn_intellify_sector: 'IA e Ingeniería de Productos Digitales',
    ptn_intellify_desc:   'Empresa de ingeniería de productos digitales e IA que desarrolla automatización inteligente, agentes de IA y plataformas modernizadas para empresas en industrias reguladas.',

    ptn_cta:        '&iquest;Interesado en ser partner de CorosDev?',
    ptn_cta_sub:    'Siempre buscamos hacer crecer nuestra red de aliados estratégicos en tecnología, capital y datos.',
    ptn_cta_link:   'Hablemos &rarr;',

    /* ── SNAPAY SPOTLIGHT ── */
    snapay_badge:     'Una Empresa de CorosDev',
    snapay_title:     'El Futuro de los Pagos<br><span class="gradient-text drop-shadow-glow">para Mercados Emergentes</span>',
    snapay_desc:      'Infraestructura de pagos de última generación para PYMEs. Liquidaciones instantáneas, soporte multimoneda y prevención de fraudes con IA — democratizando las fintech sin fronteras.',
    snapay_stat1_val: '10K+',
    snapay_stat1_lbl: 'PYMEs Registradas',
    snapay_stat2_val: '12+',
    snapay_stat2_lbl: 'Divisas',
    snapay_stat3_val: 'IA',
    snapay_stat3_lbl: 'Antifraude',
    snapay_cta:       'Visitar Snapay.ai &rarr;',

    eco_status_label: 'Estado',
    eco_status_value: 'Acceso Anticipado',
    eco_stage_label:  'Etapa',
    video_title:      'Mira Nuestra <span class="gradient-text drop-shadow-glow">Metodología en Acción</span>',
    video_desc:       'Descubre cómo diseñamos, construimos y escalamos productos digitales. Conoce cómo nuestro ecosistema y equipos de ingeniería de élite dan vida a sistemas preparados para el futuro.',

    /* ── GLOBAL PRESENCE GLOBE (hero, index) ──
       Office titles, categories, legal company names and mailing
       addresses are kept identical in en/es on purpose — legal
       entity names and postal addresses aren't translated. */
    gp_selector_aria: 'Selecciona una ubicación de CorosDev',
    gp_globe_aria:    'Globo terráqueo 3D interactivo que muestra las ubicaciones de CorosDev en Honduras, Estados Unidos y República Checa',
    gp_card_close:    'Cerrar',
    gp_fallback_note: 'El globo interactivo no está disponible — mostrando nuestras ubicaciones a continuación.',

    gp_loc_honduras_type:         'GLOBAL HEADQUARTERS',
    gp_loc_honduras_title:        'Honduras Headquarters',
    gp_loc_honduras_short:        'Honduras',
    gp_loc_honduras_location:     'San Pedro Sula, Honduras',
    gp_loc_honduras_company:      'CorosDev S.A.',
    gp_loc_honduras_full_address: 'Boulevard Michelleti<br>3era Etapa, 5th Street<br>San Pedro Sula 21101<br>Honduras',

    gp_loc_miami_type:         'BUSINESS PRESENCE',
    gp_loc_miami_title:        'Miami Office',
    gp_loc_miami_short:        'Miami',
    gp_loc_miami_location:     'Miami, Florida, United States',
    gp_loc_miami_company:      'CorosDev LLC',
    gp_loc_miami_full_address: '100 SE 2nd Street<br>Suite 2000<br>Miami, FL 33131<br>United States',

    gp_loc_wyoming_type:         'REGISTERED OFFICE',
    gp_loc_wyoming_title:        'Wyoming Registered Office',
    gp_loc_wyoming_short:        'Wyoming',
    gp_loc_wyoming_location:     'Sheridan, Wyoming, United States',
    gp_loc_wyoming_company:      'CorosDev LLC',
    gp_loc_wyoming_full_address: '30 N Gould St<br>Sheridan, WY 82801<br>United States',

    gp_loc_prague_type:         'EUROPEAN HEADQUARTERS',
    gp_loc_prague_title:        'Prague Headquarters',
    gp_loc_prague_short:        'Praha',
    gp_loc_prague_location:     'Praha, Czech Republic',
    gp_loc_prague_company:      'CorosDev S.R.O.',
    gp_loc_prague_full_address: 'Plzeňská 3352/156<br>Praha 5, 150 00<br>Czech Republic',

    /* ── SERVICES PAGE ── */
    svc_hero_tag:   'METODOLOGÍA &middot; ESTRATEGIA &middot; EJECUCIÓN',
    svc_hero_h1:    'Servicios de élite. <span class="gradient-text drop-shadow-glow">Sistemas estratégicos.</span>',
    svc_hero_sub:   'No solo entregamos servicios. Diseñamos ventajas competitivas. Cada colaboración está impulsada por una metodología propia que conecta tecnología, crecimiento y escala.',
    svc_hero_cta:   'Obtener propuesta',

    svc_method_label: 'Cómo Operamos',
    svc_method_h2:    'La Metodología de <span class="gradient-text drop-shadow-glow">CorosDev</span>',
    svc_method_sub:   'Nuestra metodología es lo que nos diferencia de una agencia de software común. Operamos como un socio estratégico, no como un simple proveedor.',

    svc_fw1_h:  'Diagnosticar',
    svc_fw1_p:  'Comenzamos con una auditoría técnica y de negocio profunda. Identificamos cuellos de botella, oportunidades y tu ventaja competitiva antes de escribir una sola línea de código.',
    svc_fw2_h:  'Diseñar la Arquitectura',
    svc_fw2_p:  'Diseñamos sistemas escalables con el crecimiento futuro en mente. Las decisiones de arquitectura son impulsadas por datos, no por modas, asegurando que tu stack tecnológico sea un activo, no una deuda técnica.',
    svc_fw3_h:  'Ejecutar',
    svc_fw3_p:  'Sprints ágiles. Equipos dedicados. Comunicación transparente. Entregamos rápido sin sacrificar calidad, dándote una ventaja competitiva en días, no meses.',
    svc_fw4_h:  'Escalar',
    svc_fw4_p:  'El post-lanzamiento es donde nos diferenciamos. La optimización continua, el monitoreo del rendimiento y el crecimiento estratégico aseguran que tu plataforma evolucione por delante del mercado.',

    svc_cards_label: 'Nuestros Compromisos',
    svc_cards_h2:    'Compromisos <span class="gradient-text drop-shadow-glow">que escalan</span>',
    svc_cards_sub:   'Soluciones tecnológicas de élite diseñadas para la etapa única de tu negocio. Elige tu nivel de impacto.',
    svc_select:      'Comenzar',

    svc_01_tag:  '01 / Innovación',
    svc_01_h:    'IA y Automatización de Procesos',
    svc_01_p:    'Aumenta la eficiencia operativa en un 40% con agentes inteligentes e integraciones de GPT personalizadas adaptadas a tus datos.',
    svc_01_f1:   'Agentes de IA Personalizados',
    svc_01_f2:   'Optimización de Procesos',
    svc_01_f3:   'Entrenamiento y Ajuste Fino de LLMs',

    svc_02_tag:  '02 / Ingeniería',
    svc_02_h:    'Desarrollo Full-Stack',
    svc_02_p:    'Creación de productos de extremo a extremo, desde MVPs hasta escala empresarial. Construimos software que se siente como el futuro.',
    svc_02_f1:   'Aplicaciones Web y Móviles',
    svc_02_f2:   'Gestión de Proyectos y Control de Calidad Dedicados',
    svc_02_f3:   'React / Node / Python',

    svc_03_tag:  '03 / Tecnología de Marketing',
    svc_03_h:    'Marketing y Conversión',
    svc_03_p:    'Domina el mercado con páginas de aterrizaje de alta conversión y sistemas de marketing automatizados.',
    svc_03_f1:   'Diseño de Interfaz y Experiencia (UI/UX) de Alta Conversión',
    svc_03_f2:   'Integraciones de Tecnología Publicitaria',
    svc_03_f3:   'Analítica de Rendimiento',

    svc_04_tag:  '04 / Autoridad',
    svc_04_h:    'SEO y Autoridad Digital',
    svc_04_p:    'Convierte los motores de búsqueda en tu mayor fuente de ingresos con SEO técnico avanzado y estrategia de contenido.',
    svc_04_f1:   'Auditorías de SEO Técnico',
    svc_04_f2:   'Dominio de Palabras Clave',
    svc_04_f3:   'Arquitectura de Enlaces',

    svc_05_tag:  '05 / Infraestructura',
    svc_05_h:    'Nube y Escalabilidad',
    svc_05_p:    'Escala a millones de usuarios con cero tiempo de inactividad. Optimizamos tu nube para velocidad, seguridad y costos.',
    svc_05_f1:   'AWS / Azure / GCP',
    svc_05_f2:   'Automatización de DevOps',
    svc_05_f3:   'Fortalecimiento de Ciberseguridad',

    svc_06_tag:  '06 / Innovación Total',
    svc_06_h:    'Escuadrón Élite de Innovación',
    svc_06_p:    'Un equipo dedicado de alto rendimiento que cubre todos los frentes: IA, desarrollo, crecimiento e infraestructura. Tu socio tecnológico para la dominación global.',
    svc_06_f1:   'Desarrolladores de Nivel C Dedicados',
    svc_06_f2:   'Soporte Prioritario 24/7',
    svc_06_f3:   'Escalabilidad Ilimitada',

    svc_custom:  '¿Buscas algo personalizado? Todos los planes pueden adaptarse a tus requisitos específicos.',

    /* ── CONTACT ── */
    contact_h2:   '¿Qué estás construyendo?',
    contact_sub:  'Recibe una hoja de ruta, estimación y análisis de riesgos en 72 horas.',
    form_name:    'Nombre completo',
    form_email:   'Correo corporativo',
    form_company: 'Empresa',
    form_msg:     '¿Qué estás construyendo?',
    form_cta:     'Solicitar propuesta',
    form_legal:   'Al enviar, aceptas nuestra política de privacidad.',

    /* ── FOOTER ── */
    footer_copy:  '&copy; <span id="year"></span> CorosDev. Todos los derechos reservados.',
    footer_priv:  'Privacidad',
    footer_sec:   'Seguridad',
    footer_stat:  'Estado',

    /* ── ABOUT PAGE ── */
    about_hero_h1:    'Las Mentes Detrás de la <br>\n        <span class="gradient-text drop-shadow-glow">Innovación Global.</span>',
    about_hero_p:     'Somos un colectivo de ingenieros, diseñadores y estrategas dedicados a cerrar la brecha entre el talento latinoamericano y la excelencia tecnológica global.',
    about_team_h2:    'Nuestro Equipo de <span class="gradient-text">Liderazgo</span>',
    about_team_carlos_d: 'Líder visionario que impulsa la dirección estratégica y el crecimiento de CorosDev en todo el mundo.',
    about_team_kriscia_d: 'Líder financiera estratégica que gestiona el capital y el rendimiento para una innovación sostenible.',
    about_team_arturo_d: 'Arquitecto de excelencia operativa, garantizando una entrega fluida en todos los proyectos globales.',
    about_team_jafet_d:  'Dirigiendo la innovación de productos y arquitecturas centradas en el usuario para software de alto impacto.',
    about_team_salvador_d: 'Experto en gestión estratégica enfocado en escalar negocios y posicionar marcas a través de análisis de mercado de alto impacto.',
    about_team_jeremy_d: 'Gestionando flujos internos y externos para garantizar claridad e impacto en todos los canales.',
    about_team_john_d:   'Liderando la estrategia de datos y la integración tecnológica para impulsar decisiones de negocios inteligentes.',
    about_team_emerson_d: 'Mente maestra técnica que diseña sistemas de alto rendimiento y soluciones impulsadas por IA.',
    about_cta_h2:     '¿Quieres trabajar con <span class="gradient-text">nosotros?</span>',
    about_cta_p:      'Siempre estamos buscando talento visionario y socios ambiciosos.',
    about_cta_btn:    'PONTE EN CONTACTO',

    /* ── CTA DRAWER ── */
    cta_drawer_title: 'Únete al Ecosistema',
    cta_drawer_subtitle: 'Aplica para ser un tester de acceso anticipado o inversor en nuestros proyectos internos.',
    cta_drawer_title_eco: 'Explora el Ecosistema',
    cta_drawer_subtitle_eco: '¿Interesado en asociarte, invertir o probar versiones beta de nuestras startups?',
    cta_drawer_title_svc: 'Construye Tu Plataforma',
    cta_drawer_subtitle_svc: 'Diseñemos y desarrollemos tu sistema de crecimiento de alto rendimiento.',
    cta_drawer_title_ptn: 'Sé un Partner de CorosDev',
    cta_drawer_subtitle_ptn: 'Cuéntanos sobre tu empresa y cómo podríamos colaborar.',
    cta_form_role: 'Me interesa como...',
    cta_form_role_tester: 'Tester de Acceso Anticipado / Usuario',
    cta_form_role_investor: 'Inversor de Capital',
    cta_form_role_partner: 'Socio Estratégico / Cliente',
    cta_form_message: '¿Cómo podemos ayudarte?',
    cta_form_submit: 'Enviar Solicitud',
    cta_form_success_title: '¡Solicitud Recibida!',
    cta_form_success_desc: '¡Gracias! Nuestro equipo directivo revisará tu perfil y te contactará en menos de 24 horas.',
    cta_floating_label: 'Socio / Inversor',
    form_name_placeholder: 'Tu nombre completo',
    form_email_placeholder: 'Tu correo corporativo',
    cta_form_message_placeholder: 'Cuéntanos un poco sobre tus objetivos...',
  }
};

/* ─────────────────────────────────────────────
   Core i18n engine
───────────────────────────────────────────── */

// Synchronous: user manual preference or browser language (instant)
function cdQuickLang() {
  const stored = localStorage.getItem('cd_lang');
  if (stored === 'en' || stored === 'es') return stored;
  const nav = (navigator.language || 'en').toLowerCase();
  return nav.startsWith('es') ? 'es' : 'en';
}

// Async: detect country via IP — Honduras → Spanish, else → English
async function cdDetectGeo() {
  const stored = localStorage.getItem('cd_lang');
  if (stored === 'en' || stored === 'es') return stored;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const res  = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(timer);
    const data = await res.json();
    return data.country_code === 'HN' ? 'es' : 'en';
  } catch (_) {
    const nav = (navigator.language || 'en').toLowerCase();
    return nav.startsWith('es') ? 'es' : 'en';
  }
}

let _cdLang = cdQuickLang();
window._cdLang = _cdLang;

function cdApplyLang(lang, save) {
  _cdLang = lang;
  window._cdLang = lang;
  if (save) localStorage.setItem('cd_lang', lang);
  document.documentElement.lang = lang;
  const t = CD_TRANSLATIONS[lang] || CD_TRANSLATIONS.en;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (t[key] !== undefined) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = t[key].replace(/&[^;]+;/g, m => {
          const map = {'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&#39;':"'",
                       '&middot;':'·','&bull;':'•','&rarr;':'→','&copy;':'©','&iquest;':'¿','&mdash;':'—'};
          return map[m] || m;
        });
      } else {
        el.innerHTML = t[key];
      }
    }
  });
  const btn = document.getElementById('lang-toggle');
  if (btn) btn.textContent = lang === 'en' ? 'ES' : 'EN';
  document.getElementById('year') && (document.getElementById('year').textContent = new Date().getFullYear());

  const videoSection = document.getElementById('presentation');
  const videoDivider = document.getElementById('video-divider');
  if (videoSection) videoSection.style.display = '';
  if (videoDivider) videoDivider.style.display  = '';

  const presentationVideo = document.getElementById('presentation-video');
  if (presentationVideo) {
    const videoId = lang === 'en' ? 'zK5vJHY2xec' : 'haRpSox-c1Q';
    const newSrc = `https://www.youtube.com/embed/${videoId}`;
    if (!presentationVideo.src.includes(videoId)) presentationVideo.src = newSrc;
  }
}

// User manual toggle — saves preference to localStorage
function cdToggleLang() {
  cdApplyLang(_cdLang === 'en' ? 'es' : 'en', true);
}

async function initI18n() {
  cdApplyLang(cdQuickLang());       // Render immediately with best synchronous guess
  const geoLang = await cdDetectGeo(); // Then confirm with IP geolocation
  if (geoLang !== _cdLang) cdApplyLang(geoLang); // Re-render only if geo disagrees
}
document.addEventListener('DOMContentLoaded', initI18n);

/* ── Mobile hamburger menu ── */
function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  const h1   = document.getElementById('ham-1');
  const h2   = document.getElementById('ham-2');
  const h3   = document.getElementById('ham-3');
  if (!menu) return;
  const isOpen = menu.classList.contains('open');
  if (isOpen) {
    menu.classList.remove('open');
    if (h1) h1.style.transform = '';
    if (h2) h2.style.opacity  = '1';
    if (h3) h3.style.transform = '';
  } else {
    menu.classList.add('open');
    if (h1) h1.style.transform = 'translateY(7px) rotate(45deg)';
    if (h2) h2.style.opacity   = '0';
    if (h3) h3.style.transform = 'translateY(-7px) rotate(-45deg)';
  }
}

document.addEventListener('click', function(e) {
  const menu = document.getElementById('mobile-menu');
  const btn  = document.getElementById('mobile-menu-btn');
  if (menu && btn && menu.classList.contains('open')) {
    if (!menu.contains(e.target) && !btn.contains(e.target)) {
      menu.classList.remove('open');
      const h1 = document.getElementById('ham-1');
      const h2 = document.getElementById('ham-2');
      const h3 = document.getElementById('ham-3');
      if (h1) h1.style.transform = '';
      if (h2) h2.style.opacity   = '1';
      if (h3) h3.style.transform = '';
    }
  }
});
