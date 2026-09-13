<script setup lang="ts">
/**
 * Social proof / logo cloud, justo debajo del Hero.
 *
 * Layout split en 2 columnas (referencia: patrón comercial tipo BairesDev)
 * — copy de autoridad B2B a la izquierda, logos a la derecha. El copy usa
 * los tokens semánticos del toggle Light/Dark (`text-ink` para el titular,
 * `text-accent-text` para la frase de impacto, `text-ink-muted` para el
 * subtítulo) — ver dark-light-mode-toggle-scope en memoria para el porqué
 * de esos tokens en vez de `text-white`.
 *
 * La tarjeta de logos quedó retrofit a esos tokens (`bg-surface-strong/30
 * border-hairline`) en vez del tinte azul fijo de versiones anteriores.
 *
 * Assets bajo /public/logos/partners-by/ — esa carpeta se llamó primero
 * "patners by" (typo + espacio), lo que rompía las rutas vía IPX. Ver
 * logo-cloud-partners-by-migration en memoria para ese y el resto de
 * gotchas (tamaño de RENDER vs. intrínseco, `brightness-0 invert` sobre
 * fondos opacos) — todos siguen aplicando aquí.
 *
 * `lightInvert`: 4 de los 18 archivos (MiamiBusinessShow, USExpand,
 * space2business, TRUESDAYS) son arte nativo blanco/casi blanco —
 * confirmado con `sharp` (brillo promedio de píxeles opacos ≥ 229/255) —
 * así que sin filtro en modo claro son casi invisibles sobre la tarjeta
 * clara. Llevan `brightness-0 grayscale` SIN `dark:` (activo en ambos
 * temas, fuerza negro sólido) más `dark:invert` (voltea a blanco sólo en
 * oscuro). El resto sí tiene color real y no lleva filtro en claro.
 *
 * `sizeTier` — "optical weight balancing": una rejilla CSS de columnas
 * iguales (probada y descartada) fuerza el mismo ANCHO de celda a logos
 * con aspect ratios muy distintos, así que un wordmark panorámico
 * (CzechInvest, 8.3:1; Forbes Tech Council, 5.9:1) se ve diminuto para caber
 * en la misma columna que un sello 1:1, que de paso se ve sobredimensionado.
 * `flex-wrap` (ancho libre por logo, cada uno escala desde su propia altura
 * objetivo) resuelve eso — tres niveles de altura en uso hoy en vez de un
 * único `boost` binario:
 *   - `default` (h-10/md:h-12, la altura base): todos los sellos/badges sin
 *     marcar — Czech AI, Engaged IC, Startup Kitchen, Czech Academy, Defence
 *     Hub. (Czech AI/Startup Kitchen/Defence Hub vivían antes en un tier
 *     `small` propio porque a esta altura "pesaban" más que sus vecinos; al
 *     agruparlos todos en bloque — ver el reorden de abajo — ese desbalance
 *     se nota mucho menos y se subieron a `default` para que el bloque de
 *     sellos crezca junto, según feedback directo sobre el render en vivo.)
 *   - `large` (h-14/md:h-16): ESA, Miami Business Show, US Expand — trazo
 *     delgado o sello que "pesa" menos a igual altura, hallazgo de una
 *     sesión anterior; Anthropic/AWS en el bloque de stack; y ahora también
 *     CzechInvest + Truesdays (ver el reorden de wordmarks abajo).
 *   - `xlarge` (h-16/md:h-20, ningún logo lo usa hoy): quedó definido para
 *     un caso de mucha prominencia que no compita por espacio horizontal —
 *     se probó en Forbes Tech Council pero a esa altura (80px, aspect 5.9:1)
 *     no cabía junto a Forbes Centroamérica en el ancho real de la tarjeta y
 *     lo bajaba a su propia línea, el problema que `default` (arriba) evita.
 *   - `small` (h-7/sm:h-8) queda definido pero sin uso — mismo patrón que
 *     `xlarge`, disponible si algún sello nuevo vuelve a "pesar" de más.
 *
 * Reorden de wordmarks (pedido explícito: aprovechar mejor el espacio y
 * agrupar los sellos cuadrados). CzechInvest vivía solo en su propia fila —
 * al ser el wordmark más panorámico (8.3:1) fuerza salto de línea igual que
 * el trío Forbes de arriba, pero antes quedaba ahí solo con espacio muerto a
 * los lados. Truesdays (otro wordmark ancho, 3.46:1) vivía disperso más
 * abajo compartiendo fila con sellos cuadrados (US Expand, Defence Hub), un
 * choque de proporciones. Moverlo justo después de CzechInvest en el array
 * agrupa ambos wordmarks en la misma fila — mismo patrón que la fila
 * destacada de Forbes — y deja el resto del array como una cadena continua
 * de sellos cuadrados que el `flex-wrap` empaqueta de forma pareja. Subir
 * ambos wordmarks a `large` aprovecha el hueco liberado: si en algún ancho
 * de viewport no caben los dos en una sola línea, `flex-wrap` los separa sin
 * romper nada, pero cada uno gana altura al no competir ya por espacio con
 * los sellos de abajo.
 *
 * Forbes Centroamérica + Forbes Tech Council van en su propia fila superior
 * (el primer `div` del grupo, con `w-full` para forzar salto de línea
 * dentro del `flex-wrap` padre) con una línea divisoria — la "fila
 * destacada" pedida — antes del resto de logos del bloque. Ambos en
 * `default` (48px) a propósito: es el tamaño más grande en el que sus
 * anchos combinados siguen cabiendo uno junto al otro en el ancho real de
 * la tarjeta sin que `flex-wrap` los baje a líneas separadas — confirmado
 * con una captura, no calculado a ojo.
 *
 * SIN huérfano de última fila: `flex-wrap` + `justify-center` centra
 * cualquier resto en vez de dejarlo pegado a la izquierda como hacía la
 * rejilla — un logo solo en su línea ya no se lee como un error de layout.
 *
 * Dos bloques con copy honesto en cada uno (decisión explícita del usuario
 * tras señalar la tensión de marca registrada / falso respaldo que ya
 * resuelve `RecognitionSection.vue` más abajo en esta misma página):
 *
 *  - "Featured In & Ecosystem": menciones/vínculos de prensa, expositores y
 *    redes institucionales — nunca una afirmación de patrocinio. Los 5 que
 *    también tienen tarjeta con fuente pública en `RecognitionSection.vue`
 *    (Forbes, CzechInvest, Truesdays, Miami Business Show, Startup Kitchen)
 *    comparten archivo con esa sección, sólo que aquí sin enlace.
 *  - "Built With & Tech Stack": atribución técnica estándar de stack — AWS
 *    y SAP son, literalmente, infraestructura que este equipo integra;
 *    OpenAI y Anthropic (Claude) se listan como la tecnología de IA con la
 *    que este equipo construye, y Google Developers como la comunidad
 *    técnica de la que forma parte. Ninguno implica partnership formal.
 */
type SizeTier = 'small' | 'default' | 'large' | 'xlarge'

interface LogoMeta {
  id: string
  /** Nombre real de la marca — es el `alt` del logo, no pasa por i18n (nombre propio). */
  name: string
  /** Ruta bajo /public/logos/partners-by/. */
  src: string
  /** Dimensiones intrínsecas reales del archivo — de aquí se deriva el ancho de render. */
  width: number
  height: number
  /** Único caso confirmado 100% opaco — ver docstring. `brightness-0 invert` lo dejaría en blanco liso. */
  forceOpacityOnly?: boolean
  /** Arte nativo blanco/casi blanco (pensado para fondo oscuro) — ver docstring del filtro en modo claro. */
  lightInvert?: boolean
  /** Nivel de altura óptica — ver docstring. Por defecto 'default'. */
  sizeTier?: SizeTier
}

const { t } = useI18n()

const LOGO_DIR = '/logos/partners-by'

const featuredLogoMeta: LogoMeta[] = [
  { id: 'forbes', name: 'Forbes Centroamérica', src: `${LOGO_DIR}/ForbesCentroamerica_logo.svg`, width: 319, height: 80 },
  {
    id: 'forbesTechCouncil',
    name: 'Forbes Technology Council',
    src: `${LOGO_DIR}/ForbesTechCouncil_Logo.webp`,
    width: 305,
    height: 52,
  },
  { id: 'czechinvest', name: 'CzechInvest', src: `${LOGO_DIR}/CzechInvest_logo.svg`, width: 480, height: 58, sizeTier: 'large' },
  { id: 'truesdays', name: 'Truesdays', src: `${LOGO_DIR}/TRUESDAYS_logo.webp`, width: 577, height: 167, lightInvert: true, sizeTier: 'large' },
  {
    id: 'czechAi',
    name: 'Czech Association of AI',
    src: `${LOGO_DIR}/CzechAssociationAI_logo.png`,
    width: 744,
    height: 164,
    forceOpacityOnly: true,
  },
  { id: 'engagedIc', name: 'Engaged Investments Conference', src: `${LOGO_DIR}/Engaged_IC_logo.webp`, width: 738, height: 297 },
  { id: 'esa', name: 'ESA — European Space Agency', src: `${LOGO_DIR}/esa_logo.webp`, width: 485, height: 243, sizeTier: 'large' },
  {
    id: 'businessshow',
    name: 'Miami Business Show',
    src: `${LOGO_DIR}/MiamiBusinessShow_logo.svg`,
    width: 1095,
    height: 1095,
    lightInvert: true,
    sizeTier: 'large',
  },
  { id: 'space2business', name: 'Space 2 Business', src: `${LOGO_DIR}/space_business_logo.webp`, width: 707, height: 353, lightInvert: true },
  { id: 'startupkitchen', name: 'Startup Kitchen', src: `${LOGO_DIR}/startupkitchen_logo.webp`, width: 1080, height: 1080 },
  { id: 'czechAcademy', name: 'The Czech Academy of Sciences', src: `${LOGO_DIR}/TheCzechAcademy_logo.webp`, width: 706, height: 353 },
  {
    id: 'usExpand',
    name: 'US Expand',
    src: `${LOGO_DIR}/USExpand_Logo.webp`,
    width: 292,
    height: 240,
    lightInvert: true,
    sizeTier: 'large',
  },
  { id: 'defenceHub', name: 'Defence Hub', src: `${LOGO_DIR}/defence_hub_logo.webp`, width: 692, height: 245 },
]

const techLogoMeta: LogoMeta[] = [
  { id: 'anthropic', name: 'Anthropic (Claude)', src: `${LOGO_DIR}/Anthropic_logo.webp`, width: 686, height: 343, sizeTier: 'large' },
  { id: 'aws', name: 'AWS', src: `${LOGO_DIR}/AWS_logo.webp`, width: 500, height: 500, sizeTier: 'large' },
  { id: 'openai', name: 'OpenAI', src: `${LOGO_DIR}/OpenAI_Logo.webp`, width: 419, height: 209 },
  { id: 'googleDevs', name: 'Google Developers', src: `${LOGO_DIR}/GoogleDevs_Logo.webp`, width: 812, height: 307 },
  { id: 'sap', name: 'SAP Business One', src: `${LOGO_DIR}/SAP_logo.webp`, width: 738, height: 246 },
]

// Altura de RENDER por nivel (desktop) — ver docstring "optical weight
// balancing". El ancho se deriva del aspect ratio real de cada archivo, así
// que ni un wordmark panorámico ni un sello cuadrado se deforman;
// `max-h-full max-w-full object-contain` en el `<img>` clampa si el ancho
// calculado no cabe en el espacio disponible del `flex-wrap`.
const TIER_HEIGHT: Record<SizeTier, number> = {
  small: 32,
  default: 48,
  large: 64,
  xlarge: 80,
}

const TIER_WRAP_CLASS: Record<SizeTier, string> = {
  small: 'flex h-7 w-auto items-center justify-center p-1 sm:h-8',
  default: 'flex h-10 w-auto items-center justify-center p-1 md:h-12',
  large: 'flex h-14 w-auto items-center justify-center p-1 md:h-16',
  xlarge: 'flex h-16 w-auto items-center justify-center p-1 md:h-20',
}

function withRenderSize(items: LogoMeta[]) {
  return items.map((item) => {
    const tier = item.sizeTier ?? 'default'
    const renderHeight = TIER_HEIGHT[tier]
    return {
      ...item,
      renderHeight,
      renderWidth: Math.round(renderHeight * (item.width / item.height)),
      wrapClass: TIER_WRAP_CLASS[tier],
      imgClass: item.forceOpacityOnly
        ? 'block max-h-full max-w-full object-contain opacity-80 transition-all duration-200 hover:opacity-100'
        : item.lightInvert
          // Arte nativo blanco/casi blanco — sin `dark:`, `brightness-0 grayscale`
          // ya se aplica en AMBOS temas (fuerza negro sólido, visible sobre la
          // tarjeta clara); `dark:invert` se suma sólo en oscuro y voltea ese
          // negro a blanco, el mismo resultado de siempre ahí.
          ? 'block max-h-full max-w-full object-contain opacity-80 transition-all duration-200 hover:opacity-100 brightness-0 grayscale dark:invert'
          : 'block max-h-full max-w-full object-contain opacity-80 transition-all duration-200 hover:opacity-100 dark:brightness-0 dark:invert dark:grayscale',
    }
  })
}

const featuredLogosSized = withRenderSize(featuredLogoMeta)
// Forbes Centroamérica + Forbes Tech Council: fila destacada aparte, ver docstring.
const forbesPair = featuredLogosSized.slice(0, 2)
const featuredRest = featuredLogosSized.slice(2)
const techLogos = withRenderSize(techLogoMeta)
</script>

<template>
  <section v-vanish class="relative overflow-hidden py-10 md:py-14">
    <div class="mx-auto max-w-7xl px-6">
      <div class="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
        <!-- Copy de autoridad B2B -->
        <div v-reveal>
          <h2 class="text-3xl font-black leading-[1.15] tracking-tight text-ink md:text-4xl">
            {{ t('home.logoCloud.title_1') }}
            <span class="text-accent-text">{{ t('home.logoCloud.title_span') }}</span>
            {{ t('home.logoCloud.title_2') }}
          </h2>
          <p class="mt-4 max-w-md text-base leading-relaxed text-ink-muted">
            {{ t('home.logoCloud.subtitle') }}
          </p>
        </div>

        <!-- Logos -->
        <div class="rounded-2xl border border-hairline bg-surface-strong/30 p-8 backdrop-blur-md">
          <p class="mb-5 text-[11px] font-bold uppercase tracking-[0.3em] text-ink-muted">
            {{ t('home.logoCloud.row1Label') }}
          </p>

          <div class="flex flex-wrap items-center justify-center gap-8">
            <!-- Fila destacada: Forbes Centroamérica + Forbes Tech Council. `w-full`
                 fuerza el salto de línea dentro del `flex-wrap` padre sin depender
                 de una rejilla rígida. -->
            <div class="flex w-full flex-wrap items-center justify-center gap-6 border-b border-hairline pb-6">
              <div v-for="logo in forbesPair" :key="logo.id" :class="logo.wrapClass">
                <NuxtImg
                  :src="logo.src"
                  :alt="logo.name"
                  :width="logo.renderWidth"
                  :height="logo.renderHeight"
                  loading="lazy"
                  :style="{ width: `${logo.renderWidth}px`, height: `${logo.renderHeight}px` }"
                  :class="logo.imgClass"
                />
              </div>
            </div>

            <div v-for="logo in featuredRest" :key="logo.id" :class="logo.wrapClass">
              <NuxtImg
                :src="logo.src"
                :alt="logo.name"
                :width="logo.renderWidth"
                :height="logo.renderHeight"
                loading="lazy"
                :style="{ width: `${logo.renderWidth}px`, height: `${logo.renderHeight}px` }"
                :class="logo.imgClass"
              />
            </div>
          </div>

          <p class="mb-5 mt-8 text-[11px] font-bold uppercase tracking-[0.3em] text-ink-muted">
            {{ t('home.logoCloud.row2Label') }}
          </p>
          <div class="flex flex-wrap items-center justify-center gap-8">
            <div v-for="logo in techLogos" :key="logo.id" :class="logo.wrapClass">
              <NuxtImg
                :src="logo.src"
                :alt="logo.name"
                :width="logo.renderWidth"
                :height="logo.renderHeight"
                loading="lazy"
                :style="{ width: `${logo.renderWidth}px`, height: `${logo.renderHeight}px` }"
                :class="logo.imgClass"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
